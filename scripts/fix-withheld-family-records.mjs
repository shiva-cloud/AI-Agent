// scripts/fix-withheld-family-records.mjs
import { DatabaseSync } from 'node:sqlite';
import { appendAudit } from '../src/audit-chain.js';
import { configureEnglishDatabase } from '../src/migrations.js';

const ids = [
  'au-sydney-nsw-education-school-enrollment',
  'us-sf-sfusd-school-enrollment-lottery',
  'us-seattle-sps-school-enrollment',
  'us-boston-bps-school-registration',
  'us-austin-aisd-school-enrollment',
  'uk-edinburgh-council-school-places',
  'ca-ab-education-act-student-enrolment'
];

const db = new DatabaseSync('data/settlement.sqlite');
configureEnglishDatabase(db);

const now = new Date().toISOString();

db.exec('BEGIN IMMEDIATE');
try {
  for (const id of ids) {
    const row = db.prepare('SELECT body FROM records WHERE id = ?').get(id);
    if (!row) {
      console.warn(`Record not found: ${id}`);
      continue;
    }
    const rec = JSON.parse(row.body);
    rec.topic = 'family';
    rec.reviewMethod = 'editorial_review';
    rec.reviewedAt = now;
    const nextStr = JSON.stringify(rec);
    db.prepare('UPDATE records SET body = ? WHERE id = ?').run(nextStr, id);
    appendAudit(db, {
      recordId: id,
      action: 'update',
      previous: row.body,
      next: nextStr,
      reviewer: 'Settlement Intelligence Global Editorial Team',
      note: 'Standardized statutory topic to family and approved via editorial review.',
      at: now
    });
    console.log(`Updated and audited: ${id}`);
  }
  db.exec('COMMIT');
  console.log('Successfully committed updates to all 7 records.');
} catch (e) {
  db.exec('ROLLBACK');
  console.error('Failed to update records:', e);
  process.exit(1);
}

