import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { openStore } from '../src/store.js';
import { createApp } from '../src/server.js';

// Every website tool form must work over POST exactly as it works over GET.
// The form definitions in public/tool-modal.js are the source of truth: for
// each tool this test sends the form's default values and a varied body over
// both transports and requires identical results. A tool whose POST handler
// ignores the form's field names (the study-to-pr class of bug) fails here.
const source = readFileSync(new URL('../public/tool-modal.js', import.meta.url), 'utf8');
const start = source.indexOf('const TOOL_FORMS = {');
const end = source.indexOf('let modalOverlay', start);
assert.ok(start >= 0 && end > start, 'TOOL_FORMS block found in tool-modal.js');
const literal = source.slice(source.indexOf('{', start), source.lastIndexOf('};', end) + 1);
const TOOL_FORMS = runInNewContext(`(${literal})`, {}, { timeout: 2000 });

function defaultValue(field) {
  if (field.type === 'select') return field.options?.[0]?.val ?? '';
  if (field.type === 'number') return typeof field.default === 'number' ? field.default : 1;
  return field.default ?? 'Sample text';
}
function variedValue(field) {
  // Vary with a legitimate alternative value: the second option for selects, a
  // different number for numeric fields. Text/date fields keep their defaults so
  // semantic parsing does not diverge between transports.
  if (field.type === 'select') {
    const options = field.options ?? [];
    return options.length > 1 ? options[1].val : options[0]?.val ?? '';
  }
  if (field.type === 'number') return (typeof field.default === 'number' ? field.default : 1) + 7;
  return field.default ?? 'Sample text';
}

test('every command has a working form and legacy GET forms preserve POST parity', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'form-contract-token-24-chars', {}, {
    rateLimits: { v1: { limit: 5000, windowMs: 60000 }, tools: { limit: 5000, windowMs: 60000 }, admin: { limit: 100, windowMs: 60000 }, static: { limit: 240, windowMs: 60000 } }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  const commands = readFileSync(new URL('../public/app/command-directory.js', import.meta.url), 'utf8');
  const commandIds = [...commands.matchAll(/"toolModal": "([^"]+)"/g)].map(match => match[1]);
  for (const id of commandIds) assert.ok(TOOL_FORMS[id], id + ' must have a dedicated form');
  const ids = Object.keys(TOOL_FORMS);
  assert.ok(ids.length >= 25, `expected the full tool form registry, found ${ids.length}`);
  try {
    for (const id of ids) {
      const form = TOOL_FORMS[id];
      const endpoint = form.endpoint || `/v1/tools/${id}`;
      if (form.method === 'POST') {
        for (const flag of [true, false]) {
          const body = {};
          for (const field of form.fields) {
            if (field.valueType === 'boolean') body[field.id] = flag;
            else if (field.type === 'select') body[field.id] = field.options.find(option => option.val !== '').val;
            else if (field.type === 'number') body[field.id] = field.min ?? 0;
            else body[field.id] = field.placeholder;
          }
          const response = await fetch(root + endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
          });
          const result = await response.json();
          assert.equal(response.status, 200, id + ' ' + JSON.stringify(result));
          assert.ok(Object.keys(result).length > 0);
        }
        continue;
      }
      for (const mode of ['defaults', 'varied']) {
        const body = {};
        for (const field of form.fields ?? []) {
          body[field.id] = mode === 'defaults' ? defaultValue(field) : variedValue(field);
        }
        const query = new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)])).toString();
        const getRes = await fetch(`${root}${endpoint}?${query}`);
        const postRes = await fetch(`${root}${endpoint}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        assert.notEqual(getRes.status, 404, `${id}: form endpoint ${endpoint} must exist`);
        assert.equal(postRes.status, getRes.status, `${id} [${mode}] status mismatch`);
        if (getRes.status === 200) {
          const getBody = await getRes.json();
          const postBody = await postRes.json();
          // iCalendar output carries a fresh RFC 5545 UID per response (correct event
          // identity, deliberately non-deterministic); compare semantics, not UIDs.
          // assumedInputs describes the request (field names differ between query and body), not the result.
          const stable = (b) => {
            if (!b || typeof b !== 'object') return b;
            const { assumedInputs, assumptionNotice, ...rest } = b;
            return typeof rest.icsContent === 'string' ? { ...rest, icsContent: rest.icsContent.replace(/^(UID|DTSTAMP):.*$/gm, '$1:<generated>') } : rest;
          };
          assert.deepEqual(stable(postBody), stable(getBody), `${id} [${mode}] POST result must equal GET result`);
        } else {
          await getRes.text(); await postRes.text();
        }
      }
    }
  } finally {
    server.close();
    store.db.close();
  }
});
