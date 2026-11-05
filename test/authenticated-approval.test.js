import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../src/store.js';
import { createApp } from '../src/server.js';
import { seeds } from '../src/knowledge.js';
import { publicEvidence } from '../src/public-evidence.js';
import { createPublicEvidenceSnapshot } from '../src/evidence-revision.js';

const actor = { id: 'alice-reviewer', role: 'reviewer', token: 'reviewer-credential-' + 'x'.repeat(32) };
const context = { id: actor.id, role: actor.role, mode: 'individual' };
const note = 'Synthetic authenticated approval integration fixture.';
function fixture() {
  const store = openStore(':memory:');
  const seed = seeds.find(row => row.id === 'sin-route');
  const record = { ...seed, id: 'authenticated-fixture', status: 'pending', risk: 'high', quote: 'Applicants must submit their supporting documents with the completed application.', checkedAt: new Date().toISOString().slice(0, 10), expiresAt: '2099-01-01' };
  store.ingestion.permitSource('seed-sin-route', { reviewer: 'editorial-board', note, tier: 'A' });
  const candidate = store.ingestion.ingest({ sourceId: 'seed-sin-route', requestKey: 'authenticated-fixture-import', content: record.quote, record });
  const status = () => publicEvidence(store.db, store.records()).find(row => row.id === record.id)?.status;
  return { store, candidate, record, status };
}

test('HTTP authenticated candidate, review and restoration bind real actor to each audit', async () => {
  const f = fixture();
  const server = createApp(f.store, undefined, {}, { actors: [actor] });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const post = async (path, body) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { method: 'POST',
      headers: { Authorization: `Bearer ${actor.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    assert.equal(response.status, 200, JSON.stringify(result));
    return result;
  };
  try {
    const publication = await post(`/admin/candidates/${f.candidate.id}/decision`, {
      decision: 'approve', reviewMethod: 'source_verified', reviewer: 'spoofed-name', note,
      authenticatedActor: { id: 'spoofed-name', mode: 'individual', role: 'admin' }
    });
    assert.equal(f.status(), 'approved');
    await post(`/admin/reviews/${f.record.id}/decision`, { decision: 'approve', reviewer: 'spoofed-name', note });
    assert.equal(f.status(), 'approved');
    await post(`/admin/records/${f.record.id}/restore`, { publicationId: publication.publicationId,
      expectedHash: f.store.ingestion.historyState(f.record.id).currentHash, requestKey: 'authenticated-restoration', note });
    assert.equal(f.status(), 'approved');
    const events = f.store.db.prepare('SELECT * FROM audit_authorizations ORDER BY audit_id').all();
    assert.equal(events.length, 3);
    for (const event of events) {
      assert.equal(event.actor_id, actor.id);
      assert.equal(event.role, 'reviewer');
      assert.equal(event.mode, 'individual');
      assert.match(event.payload_hash, /^[a-f0-9]{64}$/);
      assert.equal(JSON.stringify(event).includes(actor.token), false);
    }
    assert.throws(() => f.store.db.exec('DELETE FROM audit_authorizations'), /Immutable/);
    assert.throws(() => f.store.db.exec("UPDATE audit_authorizations SET actor_id='someone-else'"), /Immutable/);
  } finally {
    await new Promise(resolve => server.close(resolve));
    f.store.db.close();
  }
});

test('JSON-looking identity fields cannot authorize a direct or shared-token publication', async () => {
  const f = fixture();
  const legacyToken = 'legacy-shared-token-' + 'x'.repeat(32);
  const server = createApp(f.store, legacyToken);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/admin/candidates/${f.candidate.id}/decision`, {
      method: 'POST', headers: { Authorization: `Bearer ${legacyToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'approve', reviewer: actor.id, note, authenticatedActor: context, actor: context })
    });
    assert.equal(response.status, 200);
    assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM audit_authorizations').get().n, 0);
    assert.equal(f.status(), 'pending');
  } finally {
    await new Promise(resolve => server.close(resolve));
    f.store.db.close();
  }
});

test('authorization insertion failure rolls the entire approval back', () => {
  const f = fixture();
  try {
    f.store.db.exec("CREATE TRIGGER authorization_failure BEFORE INSERT ON audit_authorizations BEGIN SELECT RAISE(ABORT,'Synthetic authorization failure'); END");
    assert.throws(() => f.store.ingestion.decide(f.candidate.id, { decision: 'approve', reviewer: actor.id, note }, context), /Synthetic authorization failure/);
    assert.equal(f.store.db.prepare('SELECT status FROM candidates WHERE id=?').get(f.candidate.id).status, 'pending');
    assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM audits').get().n, 0);
    assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM publications').get().n, 0);
    assert.equal(f.store.records().some(row => row.id === f.record.id), false);
  } finally { f.store.db.close(); }
});

test('corrupt authorization invalidates cached approval without falling back to a legacy name', () => {
  const f = fixture();
  try {
    const legacyActor = { id: 'editorial-board', role: 'reviewer', mode: 'individual' };
    f.store.ingestion.decide(f.candidate.id, { decision: 'approve', reviewer: legacyActor.id, note }, legacyActor);
    const load = createPublicEvidenceSnapshot(f.store.db, () => publicEvidence(f.store.db, f.store.records()));
    const first = load();
    assert.equal(first.records.find(row => row.id === f.record.id).status, 'approved');
    f.store.db.exec('DROP TRIGGER audit_authorizations_immutable_update');
    f.store.db.exec("UPDATE audit_authorizations SET payload_hash='corrupt'");
    const next = load();
    assert.notEqual(next.version, first.version);
    assert.equal(next.records.find(row => row.id === f.record.id).status, 'pending');
  } finally { f.store.db.close(); }
});

test('mismatched and non-reviewer actors cannot commit approvals', () => {
  const f = fixture();
  try {
    for (const invalid of [{ ...context, id: 'someone-else' }, { ...context, role: 'editor' }, { ...context, mode: 'legacy' }]) {
      assert.throws(() => f.store.ingestion.decide(f.candidate.id, { decision: 'approve', reviewer: actor.id, note }, invalid), /Authenticated approval actor/);
    }
    assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM audits').get().n, 0);
  } finally { f.store.db.close(); }
});
