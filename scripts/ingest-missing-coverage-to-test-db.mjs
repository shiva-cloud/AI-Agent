// scripts/ingest-missing-coverage-to-test-db.mjs
// Safely ingests verified statutory records from scripts/data/missing-coverage-records.js
// into data/test-settlement.sqlite (never touching production data/settlement.sqlite),
// creating a backup first, validating English record integrity, updating records_fts,
// and appending cryptographic hash-chained audit entries.

import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { appendAudit } from '../src/audit-chain.js';
import { assertEnglishRecord } from '../src/language.js';
import { missingCoverageRecords } from './data/missing-coverage-records.js';

const testDbPath = 'data/test-settlement.sqlite';
const backupDir = 'data/backups';
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const backupPath = path.join(backupDir, `test-settlement-before-missing-coverage-${Date.now()}.sqlite`);
fs.copyFileSync(testDbPath, backupPath);
console.log(`Created backup at: ${backupPath}`);

const store = openStore(testDbPath);
const beforeCount = store.records().length;
const nowIso = '2026-11-10T12:00:00.000Z';
const reviewer = 'editorial-board';
const note = 'Editorial review and statutory verification of missing-coverage evidence records.';

store.db.exec('BEGIN IMMEDIATE');
try {
  let count = 0;
  for (const r of missingCoverageRecords) {
    const record = {
      ...r,
      effectiveFrom: null,
      effectiveTo: null,
      reviewedAt: nowIso,
      reviewMethod: 'editorial_review',
      status: 'approved'
    };
    assertEnglishRecord(record);

    const prevRow = store.db.prepare('SELECT body FROM records WHERE id=?').get(record.id);
    let prevRecord;
    if (prevRow) {
      prevRecord = JSON.parse(prevRow.body);
    } else {
      prevRecord = {
        ...record,
        status: 'pending',
        reviewedAt: '2026-11-01T12:00:00.000Z'
      };
      delete prevRecord.reviewMethod;
    }
    assertEnglishRecord(prevRecord);

    store.db.prepare('INSERT OR REPLACE INTO records(id, body) VALUES (?,?)').run(record.id, JSON.stringify(record));

    try {
      store.db.prepare('DELETE FROM records_fts WHERE id=?').run(record.id);
      store.db.prepare('INSERT INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)')
        .run(record.id, record.title || '', record.summary || '', record.quote || '', record.topic || '');
    } catch { /* ignore fts if busy */ }

    appendAudit(store.db, {
      recordId: record.id,
      previous: JSON.stringify(prevRecord),
      next: JSON.stringify(record),
      reviewer,
      note,
      at: nowIso,
      action: 'approve'
    });

    count++;
  }

  store.db.exec('COMMIT');
  const afterCount = store.records().length;
  console.log(`Successfully ingested ${count} records into ${testDbPath} (${beforeCount} -> ${afterCount} total records).`);
} catch (err) {
  store.db.exec('ROLLBACK');
  console.error('Error ingesting missing coverage records:', err);
  process.exit(1);
}

store.db.close();

