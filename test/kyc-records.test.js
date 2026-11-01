import test from 'node:test';
import assert from 'node:assert/strict';
import { kycRecords } from '../src/kyc-records.js';
import { assertEnglishRecord } from '../src/language.js';

test('all 22 KYC, identity verification and protection records are valid English records', () => {
  assert.equal(kycRecords.length, 22);
  const ids = new Set();
  for (const r of kycRecords) {
    assert.doesNotThrow(() => assertEnglishRecord(r), `Validation failed for ${r.id}`);
    assert.equal(r.status, 'approved');
    assert.ok(!ids.has(r.id), `Duplicate ID: ${r.id}`);
    ids.add(r.id);
  }
});
