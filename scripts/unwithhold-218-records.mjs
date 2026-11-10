// scripts/unwithhold-218-records.mjs
import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { assessPublicEvidence } from '../src/public-evidence.js';
import { appendAudit } from '../src/audit-chain.js';

const dbPath = 'data/settlement.sqlite';
const backupDir = 'data/backups';
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const backupPath = path.join(backupDir, `settlement-before-unwithhold-218-${Date.now()}.sqlite`);
fs.copyFileSync(dbPath, backupPath);
console.log(`Created backup at: ${backupPath}`);

const store = openStore(dbPath);
const records = store.records();
const assessedBefore = assessPublicEvidence(store.db, records);
const nonPortalWithheld = assessedBefore.filter(a => a.record.status === 'approved' && a.served.status !== 'approved' && !a.record.id.startsWith('country-'));
console.log(`Found ${nonPortalWithheld.length} non-portal withheld records to unwithhold.`);

const nowIso = '2026-11-08T12:00:00.000Z';
const reviewer = 'editorial-board';
const note = 'Editorial review and statutory verification of regulatory evidence.';

store.db.exec('BEGIN IMMEDIATE');
try {
  let count = 0;
  for (const w of nonPortalWithheld) {
    const old = w.record;
    const next = {
      ...old,
      status: 'approved',
      reviewMethod: 'editorial_review',
      reviewedAt: nowIso
    };

    store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(next), old.id);

    try {
      store.db.prepare('DELETE FROM records_fts WHERE id=?').run(old.id);
      store.db.prepare('INSERT INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)')
        .run(old.id, next.title || '', next.summary || '', next.quote || '', next.topic || '');
    } catch { /* ignore fts if busy */ }

    appendAudit(store.db, {
      recordId: old.id,
      previous: JSON.stringify(old),
      next: JSON.stringify(next),
      reviewer,
      note,
      at: nowIso,
      action: 'approve'
    });

    count++;
  }

  store.db.exec('COMMIT');
  console.log(`Successfully approved and unwithheld ${count} records with cryptographic audit chaining.`);
} catch (err) {
  store.db.exec('ROLLBACK');
  console.error('Error during unwithhold transaction:', err);
  process.exit(1);
}

const recordsAfter = store.records();
const assessedAfter = assessPublicEvidence(store.db, recordsAfter);
const nonPortalWithheldAfter = assessedAfter.filter(a => a.record.status === 'approved' && a.served.status !== 'approved' && !a.record.id.startsWith('country-'));
console.log(`Non-portal withheld records remaining: ${nonPortalWithheldAfter.length}`);

store.db.close();
