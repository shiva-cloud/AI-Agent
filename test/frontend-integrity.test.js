import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { evaluateBusinessStructure } from '../src/business-navigator.js';
import { appSource } from './app-source.js';

const publicDir = new URL('../public/', import.meta.url);
// Top-level scripts plus the modules split out of app.js into public/app/.
const scripts = [
  ...readdirSync(publicDir).filter(name => name.endsWith('.js')),
  ...readdirSync(new URL('app/', publicDir)).filter(name => name.endsWith('.js')).map(name => `app/${name}`)
];

// A single stray apostrophe in a quoted string once stopped the whole app from loading.
test('every public script parses', () => {
  const failures = scripts.filter(name => spawnSync(process.execPath, ['--check', fileURLToPath(new URL(name, publicDir))], { encoding: 'utf8' }).status !== 0);
  assert.deepEqual(failures, []);
});

// A module the server does not serve makes the browser reject app.js at link time.
test('every module imported by a public script is served', async () => {
  const imported = new Set();
  for (const name of scripts) {
    // Resolve each relative specifier against its importing file, as the browser does.
    for (const match of readFileSync(new URL(name, publicDir), 'utf8').matchAll(/^\s*import\s+(?:[^'"]*from\s+)?['"](\.{1,2}\/[^'"]+)['"]/gm)) imported.add(new URL(match[1], `http://app.invalid/${name}`).pathname.slice(1));
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

// app.js imports public/app/*.js, so the offline shell must precache every one of them.
test('the service worker precaches every module split out of app.js', () => {
  const sw = readFileSync(new URL('sw.js', publicDir), 'utf8');
  const missing = scripts.filter(name => name.startsWith('app/') && !sw.includes(`'/${name}'`));
  assert.deepEqual(missing, []);
});

test('business tool frontend sends and reads the fields the API uses', () => {
  const app = appSource();
  const start = app.indexOf('function renderBusinessStructureAssessment');
  assert.ok(start >= 0);
  const next = app.slice(start + 10).search(/\n(?:export )?function /);
  const renderer = app.slice(start, next < 0 ? undefined : start + 10 + next);
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
