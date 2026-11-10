import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReviewedDataset } from '../scripts/evaluate-reviewed.js';
const fixture = () => ({ version: 'fixture', author: 'author', reviewer: 'reviewer', reviewStatus: 'approved', reviewNote: 'Synthetic metadata validation fixture.', reviewedAt: '2026-11-07', asOf: '2026-11-07', evidenceDigest: 'a'.repeat(64), cases: [{ id: 'one', question: 'Library in Toronto', intents: ['community'], city: 'Toronto', status: 'guidance', reviewRationale: 'Synthetic fixture only.', sourceUrls: ['https://example.com/'] }] });
test('reviewed evaluation rejects missing approval, self-review, empty cases and duplicate cases', () => {
  assert.doesNotThrow(() => validateReviewedDataset(fixture()));
  for (const change of [{ reviewStatus: 'pending' }, { reviewer: 'author' }, { cases: [] }, { evidenceDigest: '' }, { cases: [fixture().cases[0], fixture().cases[0]] }]) {
    assert.throws(() => validateReviewedDataset({ ...fixture(), ...change }));
  }
});

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { openStore } from '../src/store.js';
import { publicEvidence } from '../src/public-evidence.js';
import { evaluateReviewed } from '../scripts/evaluate-reviewed.js';
test('reviewed evaluator binds labels to the served corpus and exercises the engine', () => {
  const directory = mkdtempSync(join(tmpdir(), 'reviewed-eval-'));
  const path = join(directory, 'fixture.sqlite');
  const store = openStore(path);
  try {
    const rows = store.db.prepare('SELECT body FROM records ORDER BY id').all().map(row => JSON.parse(row.body));
    const dataset = fixture();
    dataset.asOf = '2026-10-28T12:00:00Z';
    dataset.evidenceDigest = createHash('sha256').update(JSON.stringify(publicEvidence(store.db, rows))).digest('hex');
    const report = evaluateReviewed(dataset, path);
    assert.equal(report.cases, 1);
    assert.deepEqual(report.failures, []);
    assert.throws(() => evaluateReviewed({ ...dataset, evidenceDigest: 'b'.repeat(64) }, path), /does not match/);
    dataset.cases[0].status = 'unavailable';
    assert.equal(evaluateReviewed(dataset, path).failures.length, 1);
  } finally { store.db.close(); rmSync(directory, { recursive: true, force: true }); }
});
