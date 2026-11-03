import { createHash } from 'node:crypto';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function computeAuditHash({ prevHash, recordId, action = 'approve', reviewer, at, previous, next }) {
  const prevStr = typeof previous === 'string' ? previous : (previous ? JSON.stringify(previous) : null);
  const nextStr = typeof next === 'string' ? next : (next ? JSON.stringify(next) : null);
  const payload = `${prevHash || GENESIS_HASH}|${recordId}|${action}|${reviewer}|${at}|${prevStr}|${nextStr}`;
  return createHash('sha256').update(payload).digest('hex');
}

export function appendAudit(db, { recordId, previous, next, reviewer, note, at = new Date().toISOString(), action = 'approve' }) {
  const lastAudit = db.prepare('SELECT hash FROM audits ORDER BY id DESC LIMIT 1').get();
  const prevHash = lastAudit?.hash || GENESIS_HASH;
  const prevStr = typeof previous === 'string' ? previous : (previous ? JSON.stringify(previous) : null);
  const nextStr = typeof next === 'string' ? next : JSON.stringify(next);
  const hash = computeAuditHash({ prevHash, recordId, action, reviewer, at, previous: prevStr, next: nextStr });
  db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at,prev_hash,hash) VALUES (?,?,?,?,?,?,?,?)')
    .run(recordId, prevStr, nextStr, reviewer, note, at, prevHash, hash);
  return { prevHash, hash, at };
}

export const KNOWN_ACTIONS = [
  'correct',
  'jurisdiction',
  'template',
  'basis',
  'approve',
  'approved',
  'reject',
  'rejected',
  'rollback',
  'editorial_review'
];

export function verifyAuditChain(db) {
  const audits = db.prepare('SELECT * FROM audits ORDER BY id ASC').all();
  let expectedPrevHash = GENESIS_HASH;
  let verifiedCount = 0;
  for (const a of audits) {
    if (a.prev_hash && a.prev_hash !== expectedPrevHash && a.prev_hash !== GENESIS_HASH) {
      return { intact: false, error: `Audit chain broken at audit #${a.id}: expected prev_hash ${expectedPrevHash}, got ${a.prev_hash}` };
    }
    if (a.hash) {
      const match = KNOWN_ACTIONS.some(act => {
        const h = computeAuditHash({
          prevHash: a.prev_hash,
          recordId: a.record_id,
          action: act,
          reviewer: a.reviewer,
          at: a.at,
          previous: a.previous,
          next: a.next
        });
        return h === a.hash;
      });
      if (!match) {
        return { intact: false, error: `Audit content integrity compromised at audit #${a.id}: SHA-256 payload digest mismatch` };
      }
      verifiedCount++;
      expectedPrevHash = a.hash;
    }
  }
  return { intact: true, auditedCount: audits.length, verifiedCount };
}
