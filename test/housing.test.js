import test from 'node:test';
import assert from 'node:assert/strict';
import {answer,parse,retrieve} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {assertEnglishRecord} from '../src/language.js';
import {assessChange} from '../src/changes.js';
import {openStore} from '../src/store.js';
const now=new Date('2026-10-28T12:00:00Z');
const approved=seeds.map(r=>({...r,status:'approved'}));
for(const [question,id] of [
  ['Toronto rent deposit','ontario-rent-deposits'],
  ['Brampton rental deposit','ontario-rent-deposits'],
  ['Vancouver security deposit','bc-tenancy-deposits'],
  ['Vancouver lease','bc-tenancy-agreements'],
  ['Vancouver landlord repairs','bc-rental-repairs'],
  ['Toronto landlord locked out','eviction']
])test(`${question} retrieves only its scoped housing subject`,()=>{
  assert.deepEqual(retrieve(parse({question}),seeds,now).map(r=>r.id),[id]);
  const pending=answer({question},seeds,now);
  assert.equal(pending.status,'unavailable');assert.equal(pending.claims.length,0);
  const reviewed=answer({question},approved,now);
  assert.deepEqual(reviewed.claims.map(c=>c.evidenceId),[id]);
});
test('unknown housing questions remain gaps even with approved records',()=>{
  // No Ontario repairs or rent-guideline evidence is registered yet, so these
  // stay honest gaps; 'Toronto bank deposit' must never parse as housing.
  assert.equal(answer({question:'Toronto landlord repairs'},approved,now).claims.length,0);
  assert.deepEqual(parse({question:'Toronto bank deposit'}).intents,['money']);
});
test('rent questions cite only rent-subject evidence, never borrowed subjects',()=>{
  for(const [question,id] of [['Toronto six months rent upfront','cmhc-rent-toronto'],['Vancouver rental prices','cmhc-rent-vancouver']]) {
    assert.deepEqual(answer({question},approved,now).claims.map(c=>c.evidenceId),[id]);
    const pending=answer({question},seeds,now);
    assert.equal(pending.status,'unavailable');assert.equal(pending.claims.length,0);
  }
});
test('a supported housing subject cannot hide a missing second subject',()=>{
  const result=answer({question:'Toronto rental deposit and repairs'},approved,now);
  assert.equal(result.status,'partial');
  assert.ok(result.gaps.some(g=>g.subject==='repairs' && g.reason==='missing_evidence'));
  const mixed=answer({question:'Toronto rental deposit and eviction'},seeds.map(r=>r.id==='ontario-rent-deposits'?{...r,status:'approved'}:r),now);
  assert.equal(mixed.status,'partial');assert.ok(mixed.gaps.some(g=>g.subject==='eviction'));
});
test('housing subject metadata is validated and compared for review',()=>{
  const base=seeds.find(r=>r.id==='bc-tenancy-deposits');
  assert.throws(()=>assertEnglishRecord({...base,housingSubject:'arbitrary'}),/housing subject/);
  assert.throws(()=>assertEnglishRecord({...base,topic:'money'}),/housing subject/);
  const report=assessChange({previous:base,next:{...base,housingSubject:'agreement'},content:base.quote,previousContent:base.quote});
  assert.ok(report.fields.some(f=>f.field==='housingSubject'));assert.ok(report.flags.includes('scope_or_source_changed'));
});
test('new housing imports require a subject and legacy unclassified records fail closed',()=>{
  const store=openStore(':memory:');
  try {
    const sourceId='seed-bc-tenancy-deposits',today=new Date().toISOString().slice(0,10);
    store.ingestion.permitSource(sourceId,{reviewer:'Test reviewer',note:'Test fixture permission only.',tier:'A'});
    const record={...seeds.find(r=>r.id==='bc-tenancy-deposits'),checkedAt:today,expiresAt:new Date(Date.now()+86400000).toISOString().slice(0,10)};
    delete record.housingSubject;
    assert.throws(()=>store.ingestion.ingest({sourceId,requestKey:'missing-subject',content:record.quote,record}),/housingSubject/);
    assert.equal(answer({question:'Vancouver rental deposit'},[{...record,status:'approved'}],now).claims.length,0);
  }finally{store.db.close();}
});
