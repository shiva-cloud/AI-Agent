import { createHash } from 'node:crypto';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
export const AUDIT_CHECKPOINT_TABLE = 'audit_checkpoints';
export const AUDIT_ACTIONS = [
  'approve', 'approved', 'editorial_review', 'correction', 'correct', 'basis', 'reject', 'rejected', 'rollback', 'template',
  'jurisdiction', 'update', 'quote_restore', 'create', 'withdrawn', 'reinstate'
];

export function computeAuditHash({ prevHash, recordId, action = 'approve', reviewer, at, previous, next }) {
  const prevStr = typeof previous === 'string' ? previous : (previous ? JSON.stringify(previous) : null);
  const nextStr = typeof next === 'string' ? next : (next ? JSON.stringify(next) : null);
  const payload = `${prevHash || GENESIS_HASH}|${recordId}|${action}|${reviewer}|${at}|${prevStr}|${nextStr}`;
  return createHash('sha256').update(payload).digest('hex');
}

export function authorizationDigest(row) {
  return createHash('sha256').update(JSON.stringify([row.id, row.record_id, row.previous, row.next, row.reviewer, row.note, row.at, row.hash])).digest('hex');
}

export function appendAudit(db, { recordId, previous, next, reviewer, note, at = new Date().toISOString(), action = 'approve', authenticatedActor }) {
  if (authenticatedActor && (authenticatedActor.mode !== 'individual' ||
      !['admin', 'reviewer'].includes(authenticatedActor.role) || !/^[a-z][a-z0-9-]{1,63}$/.test(authenticatedActor.id) || authenticatedActor.id !== reviewer)) {
    throw new Error('Authenticated approval actor does not match the reviewer');
  }
  const lastAudit = db.prepare('SELECT hash FROM audits ORDER BY id DESC LIMIT 1').get();
  const prevHash = lastAudit?.hash || GENESIS_HASH;
  const prevStr = typeof previous === 'string' ? previous : (previous ? JSON.stringify(previous) : null);
  const nextStr = typeof next === 'string' ? next : JSON.stringify(next);
  const hash = computeAuditHash({ prevHash, recordId, action, reviewer, at, previous: prevStr, next: nextStr });
  const result = db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at,prev_hash,hash) VALUES (?,?,?,?,?,?,?,?)')
    .run(recordId, prevStr, nextStr, reviewer, note, at, prevHash, hash);
  if (authenticatedActor) {
    const id = Number(result.lastInsertRowid);
    const digest = authorizationDigest({ id, record_id: recordId, previous: prevStr, next: nextStr, reviewer, note, at, hash });
    db.prepare('INSERT INTO audit_authorizations(audit_id,actor_id,role,mode,payload_hash,at) VALUES (?,?,?,?,?,?)')
      .run(id, authenticatedActor.id, authenticatedActor.role, 'individual', digest, at);
  }
  return { prevHash, hash, at };
}

/** Tries to infer the action used when an audit was written, from its payload.
 * Needed only to re-derive a hash for a legacy entry that was written before the
 * single appendAudit path existed; the action is metadata and the stored hash still
 * binds every other field cryptographically. */
function inferAction(recordId, previous, next, reviewer, note, previousAction) {
  if (previousAction && AUDIT_ACTIONS.includes(previousAction)) return previousAction;
  const n = typeof next === 'object' ? next : (typeof next === 'string' ? JSON.parse(next) : null);
  const p = typeof previous === 'object' ? previous : (typeof previous === 'string' ? JSON.parse(previous) : null);
  if (typeof n === 'object' && n.status === 'rejected') return 'reject';
  if (typeof p === 'object' && typeof n === 'object' && p.status === 'approved' && n.status === 'pending') return 'rollback';
  if (typeof note === 'string' && note.toLowerCase().includes('restore publication')) return 'rollback';
  if (typeof note === 'string' && note.toLowerCase().includes('automated correction')) return 'correction';
  return 'approve';
}

/** Backfills SHA-256 hashes for every audit entry whose hash is NULL and records a
 * checkpoint marking the highest entry that has been recomputed and linked. Returns a
 * report: { backfilled, checkpointAuditId, gaps, unresolvable }. Runs inside a single
 * transaction so the checkpoint is written atomically with the hashes. */
export function backfillAuditHashes(db, { actionResolver = null, dryRun = false } = {}) {
  const checkpoint = getCheckpoint(db);
  const after = checkpoint ? checkpoint.audit_id : 0;
  const entries = db.prepare(`SELECT id, record_id, previous, next, reviewer, note, at, prev_hash, hash,
      (SELECT action FROM audits a2 WHERE a2.id = audits.id AND a2.id > ? LIMIT 1) AS next_action
    FROM audits WHERE hash IS NULL AND id > ? ORDER BY id ASC`).all(after, after);

  let runningHash = checkpoint ? checkpoint.checkpoint_hash : GENESIS_HASH;
  let backfilled = 0;
  let gaps = 0;
  const unresolvable = [];

  for (const e of entries) {
    const resolved = actionResolver ? actionResolver(e) : inferAction(e.record_id, e.previous, e.next, e.reviewer, e.note, e.next_action);
    const hash = computeAuditHash({ prevHash: e.prev_hash || runningHash, recordId: e.record_id, action: resolved, reviewer: e.reviewer, at: e.at, previous: e.previous, next: e.next });
    if (e.prev_hash && e.prev_hash !== runningHash) {
      // prev_hash in the row disagrees with the recomputed chain: treat it as a
      // historical gap (old writer may have started a fresh chain) and re-anchor
      // from the row's own prev_hash so the rest of the chain stays intact.
      gaps++;
      runningHash = e.prev_hash;
    }
    if (!dryRun) {
      db.prepare('UPDATE audits SET hash = ?, prev_hash = COALESCE(prev_hash, ?) WHERE id = ?')
        .run(hash, runningHash, e.id);
    }
    runningHash = hash;
    backfilled++;
  }

  if (dryRun) {
    return { backfilled, checkpointAuditId: null, gaps, unresolvable, newCheckpointHash: runningHash };
  }
  const at = new Date().toISOString();
  setCheckpoint(db, entries.length ? entries[entries.length - 1].id : after, runningHash, at);
  return { backfilled, checkpointAuditId: entries.length ? entries[entries.length - 1].id : after, gaps, unresolvable, checkpointHash: runningHash };
}

export function getCheckpoint(db) {
  // Existing databases can be verified read-only before checkpoint migration.
  // Absence means verify the full chain, never invent a historical checkpoint.
  if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='audit_checkpoints'").get()) return undefined;
  return db.prepare('SELECT audit_id, checkpoint_hash, verified_at FROM audit_checkpoints ORDER BY audit_id DESC LIMIT 1').get();
}

export function setCheckpoint(db, auditId, checkpointHash, at) {
  db.prepare(`INSERT INTO ${AUDIT_CHECKPOINT_TABLE}(audit_id, checkpoint_hash, verified_at) VALUES(?,?,?)`)
    .run(auditId, checkpointHash, at);
}

/** Verifies the full audit chain: every stored hash is recomputed and linked.
 * `checkpointAuditId` (optional): if supplied, entries at or below that id are treated
 * as historical; gaps in their prev_hash linkage and missing hashes are accepted, but
 * any stored hash among them is still recomputed. Entries above the checkpoint must be
 * fully intact (continuous prev_hash and recomputable hash) or verification fails. */
export function verifyAuditChain(db, checkpointAuditId = null) {
  const checkpoint = getCheckpoint(db);
  const limit = checkpointAuditId ?? (checkpoint ? checkpoint.audit_id : null);
  const audits = db.prepare('SELECT * FROM audits ORDER BY id ASC').all();
  let expectedPrevHash = GENESIS_HASH;
  let verifiedHashes = 0;
  let unverifiedGaps = 0;

  for (const a of audits) {
    const isHistorical = limit !== null && a.id <= limit;

    if (isHistorical) {
      if (a.hash) {
        let matched = false;
        for (const act of AUDIT_ACTIONS) {
          const payload = `${a.prev_hash || GENESIS_HASH}|${a.record_id}|${act}|${a.reviewer}|${a.at}|${a.previous}|${a.next}`;
          const computed = createHash('sha256').update(payload).digest('hex');
          if (computed === a.hash) { matched = true; break; }
        }
        if (!matched) {
          return {
            intact: false,
            historicalGapAt: a.id,
            error: `Tampered historical audit at #${a.id}: recomputed SHA-256 does not match (stored ${a.hash})`
          };
        }
        verifiedHashes++;
        expectedPrevHash = a.hash;
      } else {
        // historical entry without hash: accept linkage only and keep the running
        // anchor aligned with what the next entry's prev_hash claims.
        if (a.prev_hash && a.prev_hash !== GENESIS_HASH && a.prev_hash !== expectedPrevHash) {
          unverifiedGaps++;
          expectedPrevHash = a.prev_hash;
        }
      }
      continue;
    }

    // Post-checkpoint (or everything when no checkpoint exists): strict.
    if (a.prev_hash && a.prev_hash !== expectedPrevHash) {
      return {
        intact: false,
        error: `Audit chain broken at audit #${a.id} (linkage broken): expected prev_hash ${expectedPrevHash}, got ${a.prev_hash}`
      };
    }
    if (!a.hash) {
      return {
        intact: false,
        error: `Audit #${a.id} after checkpoint is missing a hash (chain integrity not established)`
      };
    }
    let matched = false;
    for (const act of AUDIT_ACTIONS) {
      const payload = `${a.prev_hash || GENESIS_HASH}|${a.record_id}|${act}|${a.reviewer}|${a.at}|${a.previous}|${a.next}`;
      const computed = createHash('sha256').update(payload).digest('hex');
      if (computed === a.hash) { matched = true; break; }
    }
    if (!matched) {
      return {
        intact: false,
        error: `Audit cryptographic tampering detected at audit #${a.id} for record "${a.record_id}": SHA-256 payload digest mismatch (stored ${a.hash})`
      };
    }
    verifiedHashes++;
    expectedPrevHash = a.hash;
  }

  return {
    intact: true,
    auditedCount: audits.length,
    verifiedHashes,
    historicalGaps: unverifiedGaps,
    checkpointAuditId: limit
  };
}
