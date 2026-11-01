import test from 'node:test';
import assert from 'node:assert/strict';
import {answer,coverage,parse} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {assertEnglishRecord} from '../src/language.js';
import {openStore} from '../src/store.js';
const now=new Date('2026-10-28T12:00:00Z');

test('expanded corpus has unique English records with pending high-risk evidence',()=>{
  assert.equal(seeds.length,258);
  assert.equal(new Set(seeds.map(r=>r.id)).size,seeds.length);
  for(const record of seeds) {
    assert.doesNotThrow(()=>assertEnglishRecord(record));
    if(record.risk==='high')assert.equal(record.status,'pending');
  }
});

for(const [city,id] of Object.entries({Toronto:'ttc-trip-planner',Mississauga:'miway-trip-planner',Brampton:'brampton-trip-planner',Vancouver:'translink-trip-planner'})) {
  test(`${city} transit guidance leads with its local planner and never leaks another city`,()=>{
    const result=answer({question:`How do I plan a bus journey in ${city}?`},seeds,now);
    assert.equal(result.status,'guidance');
    // Both citations are local (planner + published fares); no other city's
    // records may appear. BM25 may lead with either local record.
    assert.ok(result.claims.some(c=>c.evidenceId===id),'local planner cited');
    assert.ok(result.claims.every(c=>c.evidenceId===id||c.evidenceId===id.replace('trip-planner','fares')));
    assert.ok(result.sources.every(s=>s.id===id||s.id===id.replace('trip-planner','fares')));
    assert.ok(result.claims.length<=2);
    const planner=result.claims.find(c=>c.evidenceId===id);
    assert.match(planner.text,/does not provide live departures/);
  });
}

test('new financial, employment and licence sources remain withheld',()=>{
  for(const question of ['Bank account in Toronto','Taxes in Brampton','Jobs in Mississauga','Driving licence in Vancouver','Driving licence in Toronto']) {
    const result=answer({question},seeds,now);
    assert.equal(result.status,'unavailable');assert.equal(result.claims.length,0);
    assert.ok(result.sources.length>0);
    assert.ok(result.sources.every(s=>s.status==='awaiting_human_review'));
  }
});

test('expanded coverage preserves missing data and freshness boundaries',()=>{
  for(const question of ['Cheapest phone plan in Toronto','Schools in Brampton']) {
    assert.equal(answer({question},seeds,now).status,'unavailable');
  }
  assert.equal(answer({question:'Bus trip planner'},seeds,now).status,'clarification');
  assert.equal(answer({question:'Bus in Calgary'},seeds,now).status,'clarification');
  assert.equal(answer({question:'Bus in Toronto'},seeds,new Date('2026-11-26')).status,'unavailable');
  assert.deepEqual(parse({question:'Business training in Toronto'}).intents,[]);
  assert.ok(coverage(seeds,now).every(c=>c.topics.find(t=>t.topic==='transit').status==='source_guidance'));
});

test('Vancouver library resources stay in Vancouver',()=>{
  assert.ok(answer({question:'Vancouver library'},seeds,now).claims.some(c=>c.evidenceId==='vancouver-library'));
  assert.ok(!answer({question:'Toronto library'},seeds,now).sources.some(s=>s.id==='vancouver-library'));
});

test('driving imports cannot downgrade regulatory evidence to low risk',()=>{
  const store=openStore(':memory:');
  try {
    assert.equal(parse({question:'Toronto driving licence'}).risk,'high');
    store.ingestion.permitSource('seed-ontario-licence',{reviewer:'Test reviewer',note:'Permission for test fixture only.',tier:'A'});
    const today=new Date().toISOString().slice(0,10);
    const record={...seeds.find(r=>r.id==='ontario-licence'),risk:'low',checkedAt:today,expiresAt:today};
    assert.throws(()=>store.ingestion.ingest({sourceId:'seed-ontario-licence',requestKey:'driving-downgrade',content:record.quote,record}),/high-risk review/);
  }finally{store.db.close();}
});

test('new source inventory does not create permission or publication history',()=>{
  const store=openStore(':memory:');
  try {
    assert.equal(store.records().length,seeds.length);
    assert.ok(store.ingestion.sources().every(s=>s.policy==='unreviewed'));
    assert.equal(store.db.prepare('SELECT count(*) AS n FROM publications').get().n,0);
    assert.equal(store.db.prepare('SELECT count(*) AS n FROM snapshots').get().n,0);
  }finally{store.db.close();}
});
