import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { runDatabaseMaintenance } from '../src/db-maintenance.js';

test('Database Maintenance — Safe trace pruning and integrity checks', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`
      CREATE TABLE traces (id TEXT PRIMARY KEY, body TEXT, at TEXT);
      CREATE TABLE approved_records (id TEXT PRIMARY KEY, title TEXT);
    `);

    const now = new Date('2026-10-31T12:00:00Z');
    const oldDate = new Date('2026-01-01T12:00:00Z').toISOString();
    const recentDate = new Date('2026-10-25T12:00:00Z').toISOString();

    db.prepare('INSERT INTO traces VALUES (?, ?, ?)').run('trace_old_1', 'old query 1', oldDate);
    db.prepare('INSERT INTO traces VALUES (?, ?, ?)').run('trace_old_2', 'old query 2', oldDate);
    db.prepare('INSERT INTO traces VALUES (?, ?, ?)').run('trace_new_1', 'recent query', recentDate);
    db.prepare('INSERT INTO approved_records VALUES (?, ?)').run('rec_1', 'Vital healthcare record');

    // 1. Dry run test
    const dryRunRes = runDatabaseMaintenance(db, { retentionDays: 90, dryRun: true, now });
    assert.equal(dryRunRes.dryRun, true);
    assert.equal(dryRunRes.eligibleTracesIdentified, 2);
    assert.equal(dryRunRes.tracesPruned, 0);
    assert.equal(dryRunRes.integrityCheck, 'ok');

    // Verify traces still intact
    assert.equal(db.prepare('SELECT count(*) as count FROM traces').get().count, 3);

    // 2. Active run test
    const activeRes = runDatabaseMaintenance(db, { retentionDays: 90, dryRun: false, now });
    assert.equal(activeRes.dryRun, false);
    assert.equal(activeRes.tracesPruned, 2);

    // Verify only recent trace remains
    const remaining = db.prepare('SELECT id FROM traces').all();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, 'trace_new_1');

    // Verify approved records untouched
    assert.equal(db.prepare('SELECT count(*) as count FROM approved_records').get().count, 1);
  } finally {
    db.close();
  }
});
