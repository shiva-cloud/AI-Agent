import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../src/store.js';
import { seeds } from '../src/knowledge.js';
import { publicEvidence } from '../src/public-evidence.js';

const sinSeed = seeds.find(r => r.id === 'sin-route');
const reviewer = { reviewer: 'Fixture Editor', note: 'Synthetic fixture review for the publication gate only.' };
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
  const store = openStore(':memory:');
  try {
    store.db.exec('DROP TRIGGER IF EXISTS records_editorial_approval_update');
    store.db.prepare('UPDATE records SET body=? WHERE id=?').run(
      JSON.stringify({ ...sinSeed, status: 'approved', risk: 'high', checkedAt: today, expiresAt }), 'sin-route');
    assert.equal(statusOf(served(store), 'sin-route'), 'pending');
    store.ingestion.permitSource('seed-sin-route', { tier: 'A', ...reviewer });
    const candidate = store.ingestion.ingest({
      sourceId: 'seed-sin-route', requestKey: 'pub-sv-sin-route-1',
      content: `Official page text. ${sinSeed.quote} More page text.`,
      record: { ...sinSeed, status: 'pending', risk: 'high', checkedAt: today, expiresAt } });
    store.ingestion.decide(candidate.id, { decision: 'approve', ...reviewer, reviewMethod: 'source_verified' });
    assert.equal(statusOf(served(store), 'sin-route'), 'approved');
  } finally { store.db.close(); }
});
