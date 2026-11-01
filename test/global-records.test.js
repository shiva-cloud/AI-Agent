import test from 'node:test';
import assert from 'node:assert/strict';
import { globalRecords } from '../src/global-records.js';
import { assertEnglishRecord } from '../src/language.js';

test('all 137 global immigration and settlement regulatory records are valid English records', () => {
  assert.equal(globalRecords.length, 137);
  const ids = new Set();
  const jurisdictions = new Set();
  for (const r of globalRecords) {
    assert.doesNotThrow(() => assertEnglishRecord(r), `Validation failed for ${r.id}`);
    assert.equal(r.status, 'approved');
    assert.ok(!ids.has(r.id), `Duplicate ID: ${r.id}`);
    ids.add(r.id);
    jurisdictions.add(r.jurisdiction);
  }
  assert.ok(jurisdictions.has('United States'));
  assert.ok(jurisdictions.has('United Kingdom'));
  assert.ok(jurisdictions.has('Australia'));
  assert.ok(jurisdictions.has('Germany'));
  assert.ok(jurisdictions.has('United Arab Emirates'));
  assert.ok(jurisdictions.has('New Zealand'));
  assert.ok(jurisdictions.has('Ireland'));
});
