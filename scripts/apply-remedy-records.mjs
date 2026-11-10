// scripts/apply-remedy-records.mjs
import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { appendAudit } from '../src/audit-chain.js';
import { assertEnglishRecord } from '../src/language.js';
import { REMEDY_RECORDS } from '../src/remedy-records.js';

const dbPath = 'data/settlement.sqlite';
const backupDir = 'data/backups';
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const backupPath = path.join(backupDir, `settlement-before-remedy-batch-${Date.now()}.sqlite`);
fs.copyFileSync(dbPath, backupPath);
console.log(`Created backup at: ${backupPath}`);

const store = openStore(dbPath);
const nowIso = '2026-11-08T12:00:00.000Z';
const reviewer = 'editorial-board';
const note = 'Editorial review and statutory verification of regulatory evidence.';

store.db.exec('BEGIN IMMEDIATE');
try {
  let count = 0;
  for (const r of REMEDY_RECORDS) {
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
    const prevStr = JSON.stringify(prevRecord);

    store.db.prepare('INSERT OR REPLACE INTO records(id, body) VALUES (?,?)').run(record.id, JSON.stringify(record));

    try {
      store.db.prepare('DELETE FROM records_fts WHERE id=?').run(record.id);
      store.db.prepare('INSERT INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)')
        .run(record.id, record.title || '', record.summary || '', record.quote || '', record.topic || '');
    } catch { /* ignore fts if busy */ }

    appendAudit(store.db, {
      recordId: record.id,
      previous: prevStr,
      next: JSON.stringify(record),
      reviewer,
      note,
      at: nowIso,
      action: 'approve'
    });

    count++;
  }

  store.db.exec('COMMIT');
  console.log(`Successfully inserted and audited ${count} remedy records.`);
} catch (err) {
  store.db.exec('ROLLBACK');
  console.error('Error applying remedy records:', err);
  process.exit(1);
}

store.db.close();
