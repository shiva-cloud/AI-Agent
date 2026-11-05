import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../src/store.js';
import { seeds } from '../src/knowledge.js';
import { publicEvidence, isEditorialReviewer } from '../src/public-evidence.js';

const sinSeed = seeds.find(r => r.id === 'sin-route');
const reviewer = { reviewer: 'editorial-board', note: 'Synthetic fixture review for the publication gate only.' };
const today = new Date().toISOString().slice(0, 10);
const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);

function served(store) {
  const records = store.records();
  return publicEvidence(store.db, records).map((r, i) => ({ id: records[i].id, status: r.status }));
}
const statusOf = (rows, id) => rows.find(r => r.id === id)?.status;

test('a label alone cannot publish; an actual matching editorial audit can', () => {
  const store = openStore(':memory:');
  try {
    const reviewed = { ...sinSeed, id: 'pub-reviewed', status: 'approved', risk: 'high', reviewMethod: 'editorial_review', checkedAt: today, expiresAt };
    store.db.prepare('INSERT INTO records VALUES (?,?)').run('pub-reviewed', JSON.stringify(reviewed));
    assert.equal(statusOf(served(store), 'pub-reviewed'), 'pending');
    store.ingestion.permitSource('seed-sin-route',{tier:'A',...reviewer});
    const pending={...sinSeed,id:'pub-reviewed',risk:'high',status:'pending',checkedAt:today,expiresAt};
    const candidate=store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'editorial-proof-fixture',content:`Official page text. ${sinSeed.quote} More page text.`,record:pending});
    store.ingestion.decide(candidate.id,{decision:'approve',...reviewer,reviewMethod:'editorial_review'});
    assert.equal(statusOf(served(store), 'pub-reviewed'), 'approved');
    const record=store.records().find(r=>r.id==='pub-reviewed');
    assert.equal(publicEvidence(store.db,[{...record,summary:record.summary+' Unreviewed change.'}])[0].status,'pending');
  } finally { store.db.close(); }
});

test('a bulk-approved high-risk record stays withheld', () => {
  const store = openStore(':memory:');
  try {
    store.db.prepare('INSERT INTO records VALUES (?,?)').run('pub-bulk', JSON.stringify({ ...sinSeed, id: 'pub-bulk', risk: 'high', status: 'pending', checkedAt: today, expiresAt }));
    store.db.exec('DROP TRIGGER IF EXISTS records_editorial_approval_update');
    store.db.prepare('UPDATE records SET body=? WHERE id=?').run(
      JSON.stringify({ ...sinSeed, id: 'pub-bulk', status: 'approved', risk: 'high', checkedAt: today, expiresAt }), 'pub-bulk');
    assert.equal(statusOf(served(store), 'pub-bulk'), 'pending');
  } finally { store.db.close(); }
});

test('a source_verified claim without an archived publication stays withheld', () => {
  const store = openStore(':memory:');
  try {
    const claimed = { ...sinSeed, id: 'pub-claimed', status: 'approved', risk: 'high', reviewMethod: 'source_verified', checkedAt: today, expiresAt };
    store.db.prepare('INSERT INTO records VALUES (?,?)').run('pub-claimed', JSON.stringify(claimed));
    assert.equal(statusOf(served(store), 'pub-claimed'), 'pending');
  } finally { store.db.close(); }
});

test('the automated source check publishes through the ingestion pipeline', () => {
  const fixtureQuote = 'Applicants must submit their supporting documents with the completed application.';
  const store = openStore(':memory:');
  try {
    store.db.exec('DROP TRIGGER IF EXISTS records_editorial_approval_update');
    store.db.prepare('UPDATE records SET body=? WHERE id=?').run(
      JSON.stringify({ ...sinSeed, status: 'approved', risk: 'high', checkedAt: today, expiresAt }), 'sin-route');
    assert.equal(statusOf(served(store), 'sin-route'), 'pending');
    store.ingestion.permitSource('seed-sin-route', { tier: 'A', ...reviewer });
    const candidate = store.ingestion.ingest({
      sourceId: 'seed-sin-route', requestKey: 'pub-sv-sin-route-1',
      content: `Official page text. ${fixtureQuote} More page text.`,
      record: { ...sinSeed, quote: fixtureQuote, status: 'pending', risk: 'high', checkedAt: today, expiresAt } });
    store.ingestion.decide(candidate.id, { decision: 'approve', ...reviewer, reviewMethod: 'source_verified' });
    assert.equal(statusOf(served(store), 'sin-route'), 'approved');
  } finally { store.db.close(); }
});

test('audit entries from bulk scripts or automated corrections do not publish a record', () => {
  const store = openStore(':memory:');
  try {
    const pending = { ...sinSeed, id: 'pub-scripted', status: 'pending', risk: 'high', checkedAt: today, expiresAt };
    const record = { ...pending, status: 'approved', reviewMethod: 'editorial_review' };
    store.db.prepare('INSERT INTO records VALUES (?,?)').run('pub-scripted', JSON.stringify(pending));
    store.db.exec('DROP TRIGGER IF EXISTS records_editorial_approval_update');
    store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(record), 'pub-scripted');
    const audit = store.db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at) VALUES (?,?,?,?,?,?)');
    for (const name of ['Settlement Intelligence Lead Auditor', 'Senior Global Regulatory Editorial Board (Batch 3)', 'KB audit 2026-11-01 (automated correction, not editorial review)']) {
      audit.run('pub-scripted', JSON.stringify(pending), JSON.stringify(record), name, 'Approved authoritative documentation.', new Date().toISOString());
      assert.equal(statusOf(served(store), 'pub-scripted'), 'pending', name);
    }
    // The same entry from an actual editor publishes it.
    audit.run('pub-scripted', JSON.stringify(pending), JSON.stringify(record), reviewer.reviewer, reviewer.note, new Date().toISOString());
    assert.equal(statusOf(served(store), 'pub-scripted'), 'approved');
  } finally { store.db.close(); }
});

test('arbitrary unknown free-text reviewers fail closed under allowlist gate', () => {
  const store = openStore(':memory:');
  try {
    const pending = { ...sinSeed, id: 'pub-unauthorized', status: 'pending', risk: 'high', checkedAt: today, expiresAt };
    const record = { ...pending, status: 'approved', reviewMethod: 'editorial_review' };
    store.db.prepare('INSERT INTO records VALUES (?,?)').run('pub-unauthorized', JSON.stringify(pending));
    store.db.exec('DROP TRIGGER IF EXISTS records_editorial_approval_update');
    store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(record), 'pub-unauthorized');
    const audit = store.db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at) VALUES (?,?,?,?,?,?)');
    for (const unknownName of ['Bypass Operator', 'Random Reviewer 123', 'Custom External Reviewer', 'root']) {
      audit.run('pub-unauthorized', JSON.stringify(pending), JSON.stringify(record), unknownName, 'Unverified approval claim.', new Date().toISOString());
      assert.equal(statusOf(served(store), 'pub-unauthorized'), 'pending', unknownName);
    }
    // A role-shaped string is not authenticated identity. An explicit trusted
    // caller allowlist is required for this legacy custom-reviewer path.
    audit.run('pub-unauthorized', JSON.stringify(pending), JSON.stringify(record), 'reviewer:staff-lead', 'Verified editorial review.', new Date().toISOString());
    assert.equal(statusOf(served(store), 'pub-unauthorized'), 'pending');
    assert.equal(statusOf(publicEvidence(store.db, store.records(), { allowedReviewers: new Set(['reviewer:staff-lead']) }), 'pub-unauthorized'), 'approved');
  } finally { store.db.close(); }
});

test('test names, role-shaped strings and automated actors are not editorial reviewers', () => {
  const previous = process.env.NODE_ENV;
  try {
    for (const env of ['production', 'test']) {
      process.env.NODE_ENV = env;
      for (const name of ['Fixture Editor', 'Test Editor', 'test-reviewer', 'test-admin', 'reviewer:staff-lead',
        'admin:invented', 'fixture-anything', 'automated-source-check', 'Automated source check (session)']) {
        assert.equal(isEditorialReviewer(name), false, `${env}: ${name}`);
      }
    }
    assert.equal(isEditorialReviewer('automated-source-check', new Set(['automated-source-check'])), false);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});

test('automated identity cannot confer an editorial label even with a matching audit', () => {
  const store = openStore(':memory:');
  try {
    const record = { ...sinSeed, id: 'automated-editorial-claim', status: 'approved', risk: 'high', reviewMethod: 'editorial_review' };
    store.db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at) VALUES (?,?,?,?,?,?)')
      .run(record.id, JSON.stringify(record), JSON.stringify(record), 'automated-source-check', 'Synthetic automated editorial label test.', new Date().toISOString());
    assert.equal(publicEvidence(store.db, [record])[0].status, 'pending');
  } finally { store.db.close(); }
});
