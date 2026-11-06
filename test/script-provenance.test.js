import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// An audit entry is publication provenance: src/public-evidence.js publishes a high-risk
// record when an approved audit entry with a reviewer and note matches it. Scripts that
// inserted their own entries under invented reviewer names are archived; only the KB
// correction scripts may write audits, and they label themselves as automated, not
// editorial.
const ALLOWED = new Map([
  ['kb-corrections-2026-11-01.js', /automated correction, not editorial review/],
  ['jurisdiction-normalize-2026-11-03.js', /automated correction, not editorial review/],
  ['kb-corrections-2026-11-03.js', /automated correction, not editorial review/],
  ['kb-corrections-2026-11-04.js', /automated correction, not editorial review/],
  ['kb-corrections-2026-11-05.js', /automated correction, not editorial review/],
  ['kb-corrections-2026-11-06.js', /automated correction, not editorial review/]
]);

test('active scripts do not insert their own audit entries', () => {
  const scripts = new URL('../scripts/', import.meta.url);
  const offenders = [];
  for (const name of readdirSync(scripts).filter(n => /\.(?:m?js)$/.test(n))) {
    const source = readFileSync(new URL(name, scripts), 'utf8');
    if (!/INSERT\s+INTO\s+audits/i.test(source)) continue;
    const label = ALLOWED.get(name);
    if (!label || !label.test(source)) offenders.push(name);
  }
  assert.deepEqual(offenders, []);
});

test('no active script bulk-refreshes evidence dates or resolves gap work', () => {
  const scripts = new URL('../scripts/', import.meta.url);
  const offenders = readdirSync(scripts).filter(n => /\.(?:m?js)$/.test(n)).filter(name => {
    const source = readFileSync(new URL(name, scripts), 'utf8');
    return /UPDATE\s+gap_work_items\s+SET\s+status\s*=\s*'resolved'/i.test(source) || /SET\s+policy\s*=\s*'manual_permitted'/i.test(source);
  });
  assert.deepEqual(offenders, []);
});
