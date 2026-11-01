// P1-5: ordered-checklist rendering. Checklist support must be DECLARED by the
// evidence itself (a steps field on a usable record) — never inferred from
// keywords, question phrasing or an approval flag.
import test from 'node:test';
import assert from 'node:assert/strict';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
import {assertEnglishRecord, assertEnglishData} from '../src/language.js';

// The sourced checklist record was checked on 2026-10-28 (UTC project
// convention). Fixtures pinning earlier clocks reproduce the honest historical
// behavior (facet unsupported), which query-contract.test.js pins.
const now=new Date('2026-10-29T12:00:00Z');

test('declared checklist evidence produces an ordered checklist claim with honest answerability',()=>{
  const result=answer({question:'First week in Vancouver'},seeds,now);
  const claim=result.claims.find(c=>c.kind==='checklist');
  assert.ok(claim,'checklist claim present');
  assert.ok(Array.isArray(claim.steps)&&claim.steps.length>=2,'ordered steps present');
  assert.equal(claim.evidenceId,'ircc-first-two-weeks');
  assert.equal(claim.topic,'arrival');
  // Evaluation constraint: claim text must equal the record summary verbatim.
  assert.equal(claim.text,seeds.find(r=>r.id==='ircc-first-two-weeks').summary);
  assert.equal(result.answerability.providedOutput,'checklist');
  const facet=result.answerability.facets.find(f=>f.id==='ordered_checklist');
  assert.equal(facet.status,'supported');
  assert.equal(facet.reason,null);
  assert.ok(!result.gaps.some(g=>g.reason==='missing_verified_checklist'),'gap closes once the source declares steps');
  // The generic guidance claim for the same record is not duplicated.
  assert.equal(result.claims.filter(c=>c.evidenceId==='ircc-first-two-weeks').length,1);
});

test('the declared national checklist serves every pilot city',()=>{
  for(const city of ['Toronto','Mississauga','Brampton','Vancouver']) {
    const result=answer({question:'First week in '+city},seeds,now);
    assert.ok(result.claims.some(c=>c.kind==='checklist'),`checklist claim for ${city}`);
    assert.equal(result.answerability.providedOutput,'checklist');
  }
});

test('without declared steps the facet stays unsupported — no keyword inference',()=>{
  const without=seeds.filter(r=>!r.steps);
  const result=answer({question:'First week in Vancouver'},without,now);
  assert.equal(result.answerability.providedOutput,'source_guidance');
  assert.ok(result.gaps.some(g=>g.reason==='missing_verified_checklist'));
  assert.ok(result.answerability.facets.every(f=>f.status==='unsupported'));
});

test('a step-by-step request on an unchecklisted topic does not borrow the arrival checklist',()=>{
  const result=answer({question:'SIN application step-by-step checklist in Toronto'},seeds,now);
  assert.ok(!result.claims.some(c=>c.kind==='checklist'),'no checklist claim for sin');
  assert.ok(result.answerability.facets.some(f=>f.id==='ordered_checklist'&&f.status==='unsupported'));
  assert.ok(result.gaps.some(g=>g.reason==='missing_verified_checklist'));
});

test('steps persist through the store, stay English and pass record validation',()=>{
  const store=openStore(':memory:');try{
    const record=store.records().find(r=>r.id==='ircc-first-two-weeks');
    assert.ok(record,'record persisted');
    assert.ok(Array.isArray(record.steps)&&record.steps.length>=2);
    assert.doesNotThrow(()=>assertEnglishRecord(record));
    assert.doesNotThrow(()=>assertEnglishData(record.steps));
  }finally{store.db.close();}
});

test('malformed steps are rejected by record validation',()=>{
  const base=seeds.find(r=>r.id==='ircc-first-two-weeks');
  assert.throws(()=>assertEnglishRecord({...base,steps:'not an array'}),/ordered list/);
  assert.throws(()=>assertEnglishRecord({...base,steps:['short']}),/ordered list/);
  assert.throws(()=>assertEnglishRecord({...base,steps:[1,2,3]}),/12-320 characters/);
});
