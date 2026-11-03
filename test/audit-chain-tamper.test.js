import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../src/store.js';
import { seeds } from '../src/knowledge.js';
import { appendAudit, verifyAuditChain } from '../src/audit-chain.js';

const sinSeed = seeds.find(r => r.id === 'sin-route');

test('audit chain computes and verifies cryptographic hash chaining', () => {
  const store = openStore(':memory:');
  try {
    const rec1 = { ...sinSeed, id: 'rec-1', status: 'approved' };
    const rec2 = { ...sinSeed, id: 'rec-2', status: 'approved' };

    const res1 = appendAudit(store.db, {
      recordId: 'rec-1',
      previous: rec1,
      next: rec1,
      reviewer: 'staff-reviewer',
      note: 'Initial review',
      action: 'approve'
    });

    const res2 = appendAudit(store.db, {
      recordId: 'rec-2',
      previous: rec2,
      next: rec2,
      reviewer: 'staff-reviewer',
      note: 'Second review',
      action: 'approve'
    });

    assert.equal(res2.prevHash, res1.hash);

    const verification = verifyAuditChain(store.db);
    assert.equal(verification.intact, true);
    assert.equal(verification.verifiedHashes, 2);
  } finally {
    store.db.close();
  }
});

test('audit chain detects cryptographic tampering when audit content is altered', () => {
  const store = openStore(':memory:');
  try {
    const recTarget = { ...sinSeed, id: 'rec-tamper-target', status: 'approved' };
    appendAudit(store.db, {
      recordId: 'rec-tamper-target',
      previous: recTarget,
      next: recTarget,
      reviewer: 'trusted-editor',
      note: 'Valid review',
      action: 'approve'
    });

    // Tamper with the row directly in the database
    store.db.prepare('UPDATE audits SET reviewer = ? WHERE record_id = ?').run('malicious-actor', 'rec-tamper-target');

    const verification = verifyAuditChain(store.db);
    assert.equal(verification.intact, false);
    assert.match(verification.error, /tampering detected/i);
  } finally {
    store.db.close();
  }
});

test('audit chain detects broken prev_hash linkage', () => {
  const store = openStore(':memory:');
  try {
    const recA = { ...sinSeed, id: 'rec-a', status: 'approved' };
    const recB = { ...sinSeed, id: 'rec-b', status: 'approved' };

    appendAudit(store.db, {
      recordId: 'rec-a',
      previous: recA,
      next: recA,
      reviewer: 'trusted-editor',
      note: 'First',
      action: 'approve'
    });

    appendAudit(store.db, {
      recordId: 'rec-b',
      previous: recB,
      next: recB,
      reviewer: 'trusted-editor',
      note: 'Second',
      action: 'approve'
    });

    // Forge the prev_hash of second record
    store.db.prepare('UPDATE audits SET prev_hash = ? WHERE record_id = ?').run('1'.repeat(64), 'rec-b');

    const verification = verifyAuditChain(store.db);
    assert.equal(verification.intact, false);
    assert.match(verification.error, /linkage broken/i);
  } finally {
    store.db.close();
  }
});
