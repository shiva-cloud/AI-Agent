import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { evaluateBusinessStructure } from '../src/business-navigator.js';

const publicDir = new URL('../public/', import.meta.url);
const scripts = readdirSync(publicDir).filter(name => name.endsWith('.js'));

// A single stray apostrophe in a quoted string once stopped the whole app from loading.
test('every public script parses', () => {
  const failures = scripts.filter(name => spawnSync(process.execPath, ['--check', fileURLToPath(new URL(name, publicDir))], { encoding: 'utf8' }).status !== 0);
  assert.deepEqual(failures, []);
});

// A module the server does not serve makes the browser reject app.js at link time.
test('every module imported by a public script is served', async () => {
  const imported = new Set();
  for (const name of scripts) {
    for (const match of readFileSync(new URL(name, publicDir), 'utf8').matchAll(/^\s*import\s+(?:[^'"]*from\s+)?['"]\.\/([^'"]+)['"]/gm)) imported.add(match[1]);
  }
  const server = createApp(openStore(':memory:'), 'frontend-integrity-token-24-chars', {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const missing = [];
    for (const file of imported) {
      const res = await fetch(`http://127.0.0.1:${server.address().port}/${file}`);
      await res.arrayBuffer();
      if (res.status !== 200 || !/javascript/.test(res.headers.get('content-type') || '')) missing.push(`${file} (${res.status})`);
    }
    assert.deepEqual(missing, []);
    assert.ok(imported.size >= 5);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('business tool frontend sends and reads the fields the API uses', () => {
  const app = readFileSync(new URL('app.js', publicDir), 'utf8');
  const start = app.indexOf('function renderBusinessStructureAssessment');
  const renderer = app.slice(start, app.indexOf('\nfunction ', start + 10));
  const response = evaluateBusinessStructure({ immigrationStatus: 'work_permit_holder', workPermitType: 'open_work_permit', projectedAnnualRevenueCad: 65000 });
  const used = [...new Set([...renderer.matchAll(/data\.(\w+)/g)].map(m => m[1]))];
  assert.deepEqual(used.filter(key => !(key in response)), []);
  for (const local of ['immigrationCompliance', 'psbRiskAudit', 'gstHstAudit', 'taxComparison']) assert.ok(renderer.includes(`data.${local}`), local);
  // Request field names must match the evaluator's parameters, or values are silently ignored.
  for (const field of ['projectedAnnualRevenueCad', 'annualBusinessExpensesCad', 'workPermitType']) assert.ok(app.includes(`${field}:`), field);
  assert.equal(response.gstHstAudit.projectedRevenueCad, 65000);
});

test('visitors are not told they may run a business', () => {
  const visitor = evaluateBusinessStructure({ immigrationStatus: 'visitor' });
  assert.equal(visitor.immigrationCompliance.isLegallyAuthorizedToOperate, false);
  assert.equal(visitor.statutoryViolations.length, 1);
});
