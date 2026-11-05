import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {seeds} from '../src/knowledge.js';
import {publicEvidence} from '../src/public-evidence.js';
import {createPublicEvidenceSnapshot} from '../src/evidence-revision.js';

function fixture() {
  const store = openStore(':memory:');
  const record = {...seeds.find(row => row.id === 'sin-route'), id: 'boundary-record', status: 'approved', risk: 'high', reviewMethod: 'editorial_review'};
  const audit = next => store.db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at) VALUES (?,?,?,?,?,?)').run(record.id, JSON.stringify(record), JSON.stringify(next), 'editorial-board', 'Fixture review only.', new Date().toISOString());
  audit(record);
  return {store, record, audit};
}

test('new withdrawal supersedes an old matching approval and invalidates cached evidence', () => {
  const {store, record, audit} = fixture();
  try {
    const read = createPublicEvidenceSnapshot(store.db, () => publicEvidence(store.db, [record]));
    const approved = read(); assert.equal(approved.records[0].status, 'approved');
    audit({...record, status: 'pending'});
    const withdrawn = read(); assert.notEqual(withdrawn.version, approved.version);
    assert.equal(withdrawn.records[0].status, 'pending');
    audit(record); assert.equal(read().records[0].status, 'approved');
  } finally {store.db.close();}
});

test('changing the risk label cannot publish a protected topic', () => {
  const {store, record, audit} = fixture();
  try {
    // Simulate legacy/corrupt rows that predate the write-time schema guard.
    store.db.exec('DROP TRIGGER IF EXISTS audits_english_insert');
    for (const risk of ['low', 'medium', null]) {
      const altered = {...record, topic: 'health', risk}; audit(altered);
      assert.equal(publicEvidence(store.db, [altered])[0].status, 'pending');
    }
  } finally {store.db.close();}
});

test('suspension withholds previously loaded approved and research-seed records by URL or source id', () => {
  const {store, record} = fixture();
  try {
    store.ingestion.suspendSource('seed-sin-route', {reviewer: 'editorial-board', note: 'Fixture suspension for publication boundary.'});
    for (const status of ['approved', 'research_seed']) {
      assert.equal(publicEvidence(store.db, [{...record, status}])[0].status, 'pending');
      assert.equal(publicEvidence(store.db, [{...record, status, url: 'https://example.com/other', sourceId: 'seed-sin-route'}])[0].status, 'pending');
    }
  } finally {store.db.close();}
});
