/**
 * Northstar Cryptographic Provenance Hash Chain (Rec 110)
 * Implements tamper-evident SHA-256 cryptographic chaining for Knowledge Base
 * evidence records, audit trails, and editorial approvals.
 */

import { createHash } from 'node:crypto';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Computes a deterministic SHA-256 hash for a block in the provenance chain
 */
export function computeProvenanceHash({
  previousHash = GENESIS_HASH,
  recordId,
  canonicalPayload,
  authorOrReviewer = 'system',
  timestamp = new Date().toISOString()
}) {
  const serializedPayload = typeof canonicalPayload === 'string'
    ? canonicalPayload
    : JSON.stringify(canonicalPayload && typeof canonicalPayload === 'object' ? canonicalPayload : {}, Object.keys(canonicalPayload && typeof canonicalPayload === 'object' ? canonicalPayload : {}).sort());

  const blockString = `${previousHash}|${recordId}|${serializedPayload}|${authorOrReviewer}|${timestamp}`;
  return createHash('sha256').update(blockString).digest('hex');
}

/**
 * Creates a new provenance block
 */
export function createProvenanceBlock({
  previousHash = GENESIS_HASH,
  recordId,
  data,
  action = 'ingest', // 'seed', 'ingest', 'editorial_approve', 'modify'
  actor = 'autonomous_crawler',
  timestamp = new Date().toISOString()
}) {
  const hash = computeProvenanceHash({
    previousHash,
    recordId,
    canonicalPayload: data,
    authorOrReviewer: actor,
    timestamp
  });

  return {
    index: previousHash === GENESIS_HASH ? 0 : undefined,
    recordId,
    action,
    actor,
    timestamp,
    previousHash,
    hash,
    data,
    dataSummary: data.title || data.id || 'Evidence Block'
  };
}

/**
 * Verifies an array of provenance blocks for cryptographic integrity
 */
export function verifyProvenanceChain(blocks = []) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return { isValid: true, blockCount: 0, violations: [] };
  }

  const violations = [];

  for (let i = 0; i < blocks.length; i++) {
    const current = blocks[i];

    // Check link to previous block
    if (i === 0) {
      if (current.previousHash !== GENESIS_HASH) {
        violations.push({
          blockIndex: 0,
          recordId: current.recordId,
          error: `Genesis block must point to GENESIS_HASH, found: ${current.previousHash}`
        });
      }
    } else {
      const prev = blocks[i - 1];
      if (current.previousHash !== prev.hash) {
        violations.push({
          blockIndex: i,
          recordId: current.recordId,
          error: `Broken hash link at block ${i}: expected previousHash ${prev.hash}, found ${current.previousHash}`
        });
      }
    }

    // Recompute current block hash
    const expectedHash = computeProvenanceHash({
      previousHash: current.previousHash,
      recordId: current.recordId,
      canonicalPayload: current.data || current.dataSummary,
      authorOrReviewer: current.actor,
      timestamp: current.timestamp
    });

    if (current.hash !== expectedHash) {
      violations.push({
        blockIndex: i,
        recordId: current.recordId,
        error: `Tampered hash at block ${i}: expected ${expectedHash}, found ${current.hash}`
      });
    }
  }

  return {
    isValid: violations.length === 0,
    blockCount: blocks.length,
    latestHash: blocks[blocks.length - 1]?.hash || null,
    violations
  };
}
