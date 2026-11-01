import test from 'node:test';
import assert from 'node:assert/strict';
import {answer,parse} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {assertEnglishRecord} from '../src/language.js';
import {assessChange} from '../src/changes.js';
import {openStore} from '../src/store.js';
const now=new Date('2026-10-28T12:00:00Z'),approved=seeds.map(r=>({...r,status:'approved'}));
for(const [question,id] of [['Toronto mobile plan','crtc-mobile-options'],['Vancouver internet rights','crtc-internet-code'],['Brampton mobile complaint','ccts-complaints']])test(`${question} selects only its telecom subject`,()=>{
 const result=answer({question},seeds,now);
 assert.deepEqual(result.sources.map(s=>s.id),[id]);assert.equal(result.status,'unavailable');assert.equal(result.claims.length,0);
});
test('price-only requests stay unavailable even with approved navigation records',()=>{
 for(const question of ['Cheapest phone plan in Toronto','Vancouver internet prices','How much does a mobile plan cost in Brampton?']) {
  const result=answer({question},approved,now);assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);
  assert.ok(result.gaps.some(g=>g.reason==='missing_live_price_data'));
 }
});
test('mixed price and rights requests expose the missing live data',()=>{
 const result=answer({question:'Toronto internet prices and contract rights'},approved,now);
 assert.equal(result.status,'partial');assert.deepEqual(result.claims.map(c=>c.evidenceId),['crtc-internet-code']);
 assert.ok(result.gaps.some(g=>g.reason==='missing_live_price_data'));
});
test('telecom does not treat an unrelated complaint as telecom or infer unsupported geography',()=>{
 assert.deepEqual(parse({question:'Complaint about Toronto school'}).intents,['family']);
 assert.equal(answer({question:'Calgary internet rights',city:'Toronto'},seeds,now).status,'clarification');
});
test('telecom metadata cannot bypass validation and subject changes are reported',()=>{
 const record=seeds.find(r=>r.id==='crtc-internet-code');
 assert.throws(()=>assertEnglishRecord({...record,risk:'low'}),/high-risk review/);
 assert.throws(()=>assertEnglishRecord({...record,telecomSubject:'pricing'}),/telecom subject/);
 const report=assessChange({previous:record,next:{...record,telecomSubject:'complaint'},content:record.quote,previousContent:record.quote});
 assert.ok(report.flags.includes('scope_or_source_changed'));
 const store=openStore(':memory:');try{
  const sourceId='seed-crtc-internet-code';store.ingestion.permitSource(sourceId,{reviewer:'Test reviewer',note:'Test fixture permission only.',tier:'A'});
  const draft={...record};delete draft.telecomSubject;
  assert.throws(()=>store.ingestion.ingest({sourceId,requestKey:'missing-telecom-subject',content:record.quote,record:draft}),/telecomSubject/);
 }finally{store.db.close();}
});
