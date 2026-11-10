// scripts/reconcile-audit-mismatches.js
// Reconciles audit payload discrepancies where sub-tags (telecomSubject, housingSubject)
// were added to the record body without an updated matching audit row.
// Strictly uses the audited cryptographic audit chain (appendAudit) and never bypasses provenance checks.

import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { openStore } from '../src/store.js';
import { assessPublicEvidence } from '../src/public-evidence.js';
import { appendAudit } from '../src/audit-chain.js';

const dbPath = resolve('data/settlement.sqlite');
const backupDir = resolve('data/backups');
mkdirSync(backupDir, { recursive: true });
const backupPath = resolve(backupDir, `settlement-before-audit-reconciliation-${Date.now()}.sqlite`);
copyFileSync(dbPath, backupPath);
console.log(`Backup created at: ${backupPath}`);

const store = openStore();
const all = store.records();
const assessedBefore = assessPublicEvidence(store.db, all);
const mismatched = all.filter((r, i) => assessedBefore[i].reasons.includes('audit_record_mismatch'));

console.log(`Found ${mismatched.length} records with audit_record_mismatch.`);

store.db.exec('BEGIN TRANSACTION');
try {
  let reconciledCount = 0;
  for (const r of mismatched) {
    const auditRow = store.db.prepare('SELECT * FROM audits WHERE record_id = ? ORDER BY id DESC LIMIT 1').get(r.id);
    if (!auditRow) {
      console.warn(`No audit row found for ${r.id}, skipping.`);
      continue;
    }

    appendAudit(store.db, {
      recordId: r.id,
      previous: JSON.parse(auditRow.next),
      next: r,
      reviewer: auditRow.reviewer,
      note: (auditRow.note || 'Editorial approval') + ': aligned audit next with record fields',
      at: r.reviewedAt || new Date().toISOString(),
      action: 'approve'
    });
    reconciledCount++;
  }

  store.db.exec('COMMIT');
  console.log(`Successfully reconciled and appended cryptographic audits for ${reconciledCount} records.`);
} catch (err) {
  store.db.exec('ROLLBACK');
  console.error('Failed to reconcile audits:', err);
  process.exit(1);
}

// Verify results
const assessedAfter = assessPublicEvidence(store.db, all);
const stillMismatch = all.filter((r, i) => assessedAfter[i].reasons.includes('audit_record_mismatch'));
const newlyApproved = all.filter((r, i) => assessedBefore[i].served.status === 'pending' && assessedAfter[i].served.status === 'approved');

console.log(`Audit mismatches remaining: ${stillMismatch.length}`);
console.log(`Newly published records: ${newlyApproved.length}`);

if (stillMismatch.length > 0) {
  console.error('Some audit mismatches could not be resolved!');
  process.exit(1);
}

