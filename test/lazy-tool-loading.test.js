import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { appSource } from './app-source.js';

const app = appSource();
const planAccess = readFileSync(new URL('../public/plan-access.js', import.meta.url), 'utf8');

// Tools that show an example result on their own must wait for their view to open.
// A setup function that calls its run function directly at the end would run on every
// page load again (about 68 requests per visit before lazy loading).
test('every automatic tool run goes through autoRun with an anchor element', () => {
  const lines = app.split('\n');
  const direct = [], anchorless = [];
  lines.forEach((line, i) => {
    if (/^\s+(run\w+|calculate\w*)\(\);\s*$/.test(line) && /^}\s*$/.test(lines[i + 1] ?? '')) {
      let j = i;
      while (j >= 0 && !/^(?:export\s+)?(?:async\s+)?function\s+\w+/.test(lines[j])) j--;
      if (/^(?:export\s+)?(?:async\s+)?function\s+(?:setup|init|mount)/.test(lines[j])) direct.push(i + 1);
    }
    if (/^\s+autoRun\(\w+\);\s*$/.test(line)) anchorless.push(i + 1);
  });
  assert.deepEqual(direct, [], 'setup functions that still run their tool on page load');
  assert.deepEqual(anchorless, [], 'autoRun calls without an anchor element');
  assert.ok((app.match(/^\s+autoRun\(\w+, \w+\);/gm) || []).length >= 60);
});

test('autoRun waits for a hidden view and never runs in SaaS mode', () => {
  const body = planAccess.slice(planAccess.indexOf('export function autoRun'));
  assert.match(body, /if \(enabled\) return;/);
  assert.match(body, /closest\?\.\('section\.view'\)/);
  assert.match(body, /attributeFilter: \['hidden'\]/);
  assert.match(body, /observer\.disconnect\(\);\s*run\(\);/);
});
