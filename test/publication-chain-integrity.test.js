import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { openStore } from '../src/store.js';
import { seeds } from '../src/knowledge.js';
import { publicEvidence, assessPublicEvidence } from '../src/public-evidence.js';
import { createPublicEvidenceSnapshot } from '../src/evidence-revision.js';

const review = { reviewer: 'editorial-board', note: 'Synthetic publication integrity test fixture.' };
function fixture(overrides = {}) {
  const store = openStore(':memory:');
  const seed = seeds.find(record => record.id === 'sin-route');
  const record = { ...seed, id: 'chain-integrity-fixture', status: 'pending', risk: 'high',
    quote: 'Applicants must submit their supporting documents with the completed application.',
    checkedAt: new Date().toISOString().slice(0, 10), expiresAt: '2099-01-01', ...overrides };
  store.ingestion.permitSource('seed-sin-route', { tier: 'A', ...review });
  const candidate = store.ingestion.ingest({ sourceId: 'seed-sin-route', requestKey: 'chain-integrity-import',
    content: `Official evidence: ${record.quote}`, record });
  const decision = store.ingestion.decide(candidate.id, { decision: 'approve', reviewMethod: 'source_verified', ...review });
  const published = store.records().find(row => row.id === record.id);
  const read = () => publicEvidence(store.db, store.records()).find(row => row.id === record.id);
  assert.equal(read().status, 'approved');
  return { store, candidate, decision, published, read };
}

test('corrupt restored publication chains are withheld even when referenced rows exist', async t => {
  const cases = {
    snapshot_text: ({ store, published }) => {
      store.db.exec('DROP TRIGGER snapshots_immutable_update');
      store.db.prepare('UPDATE snapshots SET content=content || ? WHERE id=?').run(' tampered', published.snapshotId);
    },
    quote_missing_with_recomputed_hash: ({ store, published }) => {
      store.db.exec('DROP TRIGGER snapshots_immutable_update');
      const content = 'A replacement page without the reviewed quote.';
      store.db.prepare('UPDATE snapshots SET content=?,content_hash=? WHERE id=?')
        .run(content, createHash('sha256').update(content).digest('hex'), published.snapshotId);
    },
    candidate_body: ({ store, candidate }) => {
      store.db.exec('DROP TRIGGER candidate_payload_immutable');
      store.db.prepare("UPDATE candidates SET body=json_set(body,'$.summary','Unreviewed replacement summary.') WHERE id=?").run(candidate.id);
    },
    candidate_record: ({ store, candidate }) => {
      store.db.exec('DROP TRIGGER candidate_payload_immutable');
      store.db.exec('DROP TRIGGER candidates_english_update');
      store.db.prepare('UPDATE candidates SET record_id=? WHERE id=?').run('other-record', candidate.id);
    },
    candidate_status: ({ store, candidate }) => store.db.prepare("UPDATE candidates SET status='rejected' WHERE id=?").run(candidate.id),
    publication_body: ({ store, decision }) => {
      store.db.exec('DROP TRIGGER publications_immutable_update');
      store.db.prepare("UPDATE publications SET body=json_set(body,'$.quote','A fabricated quote.') WHERE id=?").run(decision.publicationId);
    },
    decision_identity: ({ store, candidate }) => {
      store.db.exec('DROP TRIGGER candidate_decisions_immutable_update');
      store.db.prepare("UPDATE candidate_decisions SET reviewer='Test Editor' WHERE candidate_id=?").run(candidate.id);
    },
    decision_note: ({ store, candidate }) => {
      store.db.exec('DROP TRIGGER candidate_decisions_immutable_update');
      store.db.prepare("UPDATE candidate_decisions SET note='A different review note.' WHERE candidate_id=?").run(candidate.id);
    },
    later_rejection: ({ store, candidate }) => store.db.prepare('INSERT INTO candidate_decisions(candidate_id,decision,reviewer,note,at) VALUES (?,?,?,?,?)')
      .run(candidate.id, 'reject', review.reviewer, review.note, new Date().toISOString())
  };
  for (const [name, corrupt] of Object.entries(cases)) await t.test(name, () => {
    const f = fixture();
    try { corrupt(f); assert.equal(f.read().status, 'pending'); }
    finally { f.store.db.close(); }
  });
});

test('valid historical restoration retains its verified publication chain', () => {
  const f = fixture();
  try {
    const { currentHash } = f.store.ingestion.historyState(f.published.id);
    f.store.ingestion.restore(f.published.id, { publicationId: f.decision.publicationId,
      expectedHash: currentHash, requestKey: 'valid-restoration', ...review });
    assert.equal(f.read().status, 'approved');
    f.store.db.exec('DROP TRIGGER restorations_immutable_update');
    f.store.db.prepare("UPDATE restorations SET next=json_set(next,'$.summary','Unexpected changed claim.') WHERE record_id=?").run(f.published.id);
    assert.equal(f.read().status, 'pending');
  } finally { f.store.db.close(); }
});

test('candidate mutations invalidate a previously cached public corpus', () => {
  const f = fixture();
  try {
    const load = createPublicEvidenceSnapshot(f.store.db, () => publicEvidence(f.store.db, f.store.records()));
    const first = load();
    assert.equal(first.records.find(row => row.id === f.published.id).status, 'approved');
    f.store.db.prepare("UPDATE candidates SET status='rejected' WHERE id=?").run(f.candidate.id);
    const next = load();
    assert.notEqual(next.version, first.version);
    assert.equal(next.records.find(row => row.id === f.published.id).status, 'pending');
  } finally { f.store.db.close(); }
});

test('a low-risk automated-check label still requires an intact source chain', () => {
  const f = fixture({ topic: 'transit', risk: 'low' });
  try {
    f.store.db.exec('DROP TRIGGER snapshots_immutable_update');
    f.store.db.prepare('UPDATE snapshots SET content=content || ? WHERE id=?').run(' changed', f.published.snapshotId);
    assert.equal(f.read().status, 'pending');
  } finally { f.store.db.close(); }
});

test('intact historical chains with unsupported figures or short quotes fail public replay', () => {
  for (const example of [
    { summary: 'The fee is $30.', evidence: 'The processing period is 30 days.' },
    { summary: 'The processing period is 30 days.', evidence: 'The processing period is 30 weeks.' },
    { summary: 'Apply with supporting documents.', evidence: '', quote: 'Application guide' }
  ]) {
    const store=openStore(':memory:');
    try {
      const record={...seeds.find(r=>r.id==='sin-route'),id:'historical-replay',risk:'low',topic:'transit',status:'pending',
        checkedAt:new Date().toISOString().slice(0,10),expiresAt:'2099-01-01',summary:example.summary,
        quote:example.quote||'Applicants must submit their supporting documents with the completed application.'};
      store.ingestion.permitSource('seed-sin-route',{tier:'A',...review});
      const candidate=store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'historical-replay-import',record,content:`${record.quote} ${example.evidence}`});
      store.ingestion.decide(candidate.id,{decision:'approve',reviewMethod:'source_verified',...review});
      const stored=store.records().find(r=>r.id===record.id);
      assert.equal(stored.status,'approved','read gate must not rewrite the underlying record');
      const assessment=assessPublicEvidence(store.db,[stored])[0];
      assert.equal(assessment.served.status,'pending');
      assert.deepEqual(assessment.reasons,['archived_evidence_replay_failed']);
    }finally{store.db.close();}
  }
});
