import test from 'node:test';
import assert from 'node:assert/strict';
import { countrySettlementRecords } from '../src/country-settlement.js';
import { assertEnglishRecord } from '../src/language.js';

test('all 54 country settlement records are valid English records', () => {
  assert.equal(countrySettlementRecords.length, 54);
  const ids = new Set();
  for (const r of countrySettlementRecords) {
    assert.doesNotThrow(() => assertEnglishRecord(r));
    assert.equal(r.topic, 'community');
    assert.equal(r.status, 'approved');
    assert.ok(!ids.has(r.id), `Duplicate ID: ${r.id}`);
    ids.add(r.id);
  }
});
