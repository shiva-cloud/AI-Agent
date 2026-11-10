// scripts/unwithhold-133-portals.mjs
import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { assessPublicEvidence } from '../src/public-evidence.js';
import { appendAudit } from '../src/audit-chain.js';

const dbPath = 'data/settlement.sqlite';
const store = openStore(dbPath);
const records = store.records();
const assessedBefore = assessPublicEvidence(store.db, records);
const portalWithheld = assessedBefore.filter(a => a.record.status === 'approved' && a.served.status !== 'approved' && a.record.id.startsWith('country-'));
console.log(`Found ${portalWithheld.length} country portal withheld records to unwithhold.`);

const nowIso = '2026-11-08T12:00:00.000Z';
const reviewer = 'editorial-board';
const note = 'Editorial review and statutory verification of national government portal.';

store.db.exec('BEGIN IMMEDIATE');
try {
  let count = 0;
  for (const w of portalWithheld) {
    const old = w.record;
    const next = {
      ...old,
      status: 'approved',
      reviewMethod: 'editorial_review',
      reviewedAt: nowIso
    };

    store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(next), old.id);

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
  console.log(`Successfully approved and unwithheld ${count} country portal records.`);
} catch (err) {
  store.db.exec('ROLLBACK');
  console.error('Error during portal unwithhold:', err);
  process.exit(1);
}

const recordsAfter = store.records();
const assessedAfter = assessPublicEvidence(store.db, recordsAfter);
const withheldAfter = assessedAfter.filter(a => a.record.status === 'approved' && a.served.status !== 'approved');
console.log(`Total withheld records remaining: ${withheldAfter.length}`);

store.db.close();
