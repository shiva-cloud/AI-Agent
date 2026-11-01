import test from 'node:test';
import assert from 'node:assert/strict';
import { technicalImmigrationRecords } from '../src/technical-immigration-records.js';
import { assertEnglishRecord } from '../src/language.js';

test('all 19 technical immigration records are valid English records', () => {
  assert.equal(technicalImmigrationRecords.length, 19);
  const ids = new Set();
  for (const r of technicalImmigrationRecords) {
    assert.doesNotThrow(() => assertEnglishRecord(r), `Validation failed for ${r.id}`);
    assert.equal(r.status, 'approved');
    assert.ok(!ids.has(r.id), `Duplicate ID: ${r.id}`);
    ids.add(r.id);
  }
});
