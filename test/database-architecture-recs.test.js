import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../src/store.js';
import { generateSyntheticRecords } from '../scripts/generate-synthetic-data.js';


test('Rec 92: SQLite FTS5 Full-Text Search virtual table queries records rapidly', () => {
  const store = openStore(':memory:');
  try {
    const results = store.searchFts('toronto library');
    assert.ok(Array.isArray(results));
    assert.ok(results.length > 0);
    assert.ok(results.some(r => r.topic === 'community'));
  } finally {
    store.db.close();
  }
});

test('Rec 98: Cryptographic Blockchain-Style Audit Ledger builds an unbroken hash chain', () => {
  const store = openStore(':memory:');
  try {
    // Review 1
    store.review('toronto-library', 'reject', 'Alice Senior Editor', 'Verified community service change note.');
    // Review 2
    store.review('toronto-library', 'rollback', 'Bob Lead Reviewer', 'Temporarily reset to pending review.');

    const audits = store.db.prepare('SELECT * FROM audits ORDER BY id ASC').all();
    assert.equal(audits.length, 2);
    assert.ok(audits[0].hash);
    assert.equal(audits[0].prev_hash, '0000000000000000000000000000000000000000000000000000000000000000');
    assert.equal(audits[1].prev_hash, audits[0].hash, 'Audit 2 prev_hash must link to Audit 1 hash');

    const integrity = store.verifyAuditChainIntegrity();
    assert.equal(integrity.intact, true);
    assert.equal(integrity.auditedCount, 2);
  } finally {
    store.db.close();
  }
});

test('Audit chain integrity detects payload and linkage tampering', () => {
  const store = openStore(':memory:');
  try {
    store.review('toronto-library', 'reject', 'Alice Senior Editor', 'Verified community service change note.');
    store.review('toronto-library', 'rollback', 'Bob Lead Reviewer', 'Temporarily reset to pending review.');

    // 1. Unmodified chain verifies intact
    assert.equal(store.verifyAuditChainIntegrity().intact, true);

    // 2. Tampering with content triggers SHA-256 mismatch detection
    store.db.prepare("UPDATE audits SET reviewer='Unauthorized Attacker' WHERE id=1").run();
    const tamperedContent = store.verifyAuditChainIntegrity();
    assert.equal(tamperedContent.intact, false);
    assert.ok(tamperedContent.error.includes('SHA-256 payload digest mismatch'));

    // Revert reviewer on audit #1 and tamper with linkage on audit #2
    store.db.prepare("UPDATE audits SET reviewer='Alice Senior Editor' WHERE id=1").run();
    store.db.prepare("UPDATE audits SET prev_hash='bad-hash' WHERE id=2").run();
    const tamperedLink = store.verifyAuditChainIntegrity();
    assert.equal(tamperedLink.intact, false);
    assert.ok(tamperedLink.error.includes('Audit chain broken at audit #2'));
  } finally {
    store.db.close();
  }
});

test('Rec 99: Synthetic Regulatory Data Generator produces valid structured records', () => {
  const records = generateSyntheticRecords(100);
  assert.equal(records.length, 100);
  assert.ok(records[0].id.startsWith('synthetic-'));
  assert.ok(records[0].summary.length > 10);
  assert.equal(records[0].status, 'approved');
});

test('Rec 101: Query Latency Histogram Logger accurately calculates percentiles', () => {
  const store = openStore(':memory:');
  try {
    // Insert mock traces with latencies: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
    for (let i = 1; i <= 10; i++) {
      store.db.prepare('INSERT INTO traces VALUES (?, ?, ?)').run(
        `trace-${i}`,
        JSON.stringify({ latencyMs: i * 2, status: 'available' }),
        new Date().toISOString()
      );
    }

    const hist = store.latencyHistogram();
    assert.equal(hist.count, 10);
    assert.equal(hist.min, 2);
    assert.equal(hist.max, 20);
    assert.equal(hist.p50, 12);
    assert.equal(hist.p95, 20);
  } finally {
    store.db.close();
  }
});

test('Rec 102: Automatic Stale Evidence Purge archives expired records', () => {
  const store = openStore(':memory:');
  try {
    const base = store.records()[0];
    const expiredRecord = {
      ...base,
      id: 'expired-sample-record',
      title: 'Old Sample Rule',
      checkedAt: '2020-01-01',
      expiresAt: '2021-01-01'
    };

    store.db.prepare('INSERT INTO records VALUES (?, ?)').run(
      expiredRecord.id,
      JSON.stringify(expiredRecord)
    );

    const purgeResult = store.purgeStaleRecords(new Date('2026-10-31'));
    assert.ok(purgeResult.archivedCount >= 1);

    const checkActive = store.db.prepare('SELECT 1 FROM records WHERE id = ?').get('expired-sample-record');
    assert.equal(checkActive, undefined, 'Expired record must be removed from active records');

    const checkArchived = store.db.prepare('SELECT 1 FROM archived_stale_records WHERE id = ?').get('expired-sample-record');
    assert.ok(checkArchived, 'Expired record must be stored in archived_stale_records table');
  } finally {
    store.db.close();
  }
});

test('Rec 104: Audit Rollback restores previous record state and preserves audit log', () => {
  const store = openStore(':memory:');
  try {
    const recordId = 'toronto-library';
    const original = JSON.parse(store.db.prepare('SELECT body FROM records WHERE id = ?').get(recordId).body);

    // Review to reject
    store.review(recordId, 'reject', 'Carol Editor', 'Rejecting for testing rollback capability.');
    const rejected = JSON.parse(store.db.prepare('SELECT body FROM records WHERE id = ?').get(recordId).body);
    assert.equal(rejected.status, 'rejected');

    // Get audit id
    const auditRow = store.db.prepare('SELECT id FROM audits WHERE record_id = ? ORDER BY id DESC LIMIT 1').get(recordId);

    // Rollback
    const restored = store.rollbackAudit(recordId, auditRow.id);
    assert.equal(restored.status, original.status, 'Restored status should match original');

    const activeInDb = JSON.parse(store.db.prepare('SELECT body FROM records WHERE id = ?').get(recordId).body);
    assert.equal(activeInDb.status, original.status);
  } finally {
    store.db.close();
  }
});
