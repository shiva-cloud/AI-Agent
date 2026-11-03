import { createHash } from 'node:crypto';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export const AUDIT_ACTIONS = [
  'approve', 'approved', 'editorial_review', 'correction', 'correct', 'basis', 'reject', 'template',
  'jurisdiction', 'update', 'quote_restore', 'create', 'withdrawn', 'reinstate'
];

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

export function verifyAuditChain(db) {
  const audits = db.prepare('SELECT * FROM audits ORDER BY id ASC').all();
  let expectedPrevHash = GENESIS_HASH;
  let verifiedHashes = 0;

  for (const a of audits) {
    // 1. Linkage verification
    if (a.prev_hash && a.prev_hash !== expectedPrevHash && a.prev_hash !== GENESIS_HASH) {
      return {
        intact: false,
        error: `Audit chain linkage broken at audit #${a.id}: expected prev_hash ${expectedPrevHash}, got ${a.prev_hash}`
      };
    }

    // 2. Cryptographic hash recalculation & integrity verification
    if (a.hash) {
      let matched = false;
      for (const act of AUDIT_ACTIONS) {
        const payload = `${a.prev_hash || GENESIS_HASH}|${a.record_id}|${act}|${a.reviewer}|${a.at}|${a.previous}|${a.next}`;
        const computed = createHash('sha256').update(payload).digest('hex');
        if (computed === a.hash) {
          matched = true;
          break;
        }
      }

      if (!matched) {
        return {
          intact: false,
          error: `Audit cryptographic tampering detected at audit #${a.id} for record "${a.record_id}": stored hash ${a.hash} does not match computed hash`
        };
      }

      verifiedHashes++;
      expectedPrevHash = a.hash;
    }
  }

  return {
    intact: true,
    auditedCount: audits.length,
    verifiedHashes
  };
}
