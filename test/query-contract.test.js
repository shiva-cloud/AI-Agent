import test from 'node:test';
import assert from 'node:assert/strict';
import {answer,parse} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {humanizeGap} from '../public/errors.js';
const now=new Date('2026-10-28T12:00:00Z');
// Approval here is a synthetic retrieval fixture, never a live publication.
const approved=seeds.map(r=>({...r,status:'approved'}));

test('occupation and eligibility requests remain incomplete despite a generic approved guide',()=>{
  const result=answer({question:'Can I work as a nurse tomorrow in Toronto?'},approved,now);
  assert.equal(result.status,'partial');
  assert.equal(result.parsed.contractVersion,'query-2');
  assert.equal(result.parsed.requestedOutput,'eligibility');
  assert.ok(result.gaps.some(g=>g.reason==='missing_occupation_requirements'));
  assert.ok(result.gaps.some(g=>g.reason==='missing_personal_eligibility'));
  assert.equal(result.answerability.status,'incomplete');
  assert.ok(result.answerability.facets.every(f=>f.status==='unsupported'));
  assert.ok(result.claims.every(c=>c.kind==='source_guidance'));
});

test('first-week guide is not presented as a verified ordered checklist',()=>{
  // Premise reproduction: a corpus without any record declaring ordered steps.
  // The fuller dataset now carries one (checked 2026-10-28); this case still
  // guards against generic arrival guidance masquerading as a checklist.
  const result=answer({question:'First week in Vancouver'},seeds.filter(r=>!r.steps),now);
  assert.equal(result.status,'partial');assert.equal(result.parsed.requestedOutput,'checklist');
  assert.equal(result.answerability.providedOutput,'source_guidance');
  assert.ok(result.gaps.some(g=>g.reason==='missing_verified_checklist'));
  assert.ok(result.claims.some(c=>c.evidenceId==='bc-guide'));
});

test('personal eligibility facets are tracked separately for each topic',()=>{
  const result=answer({question:'Am I eligible for OHIP and childcare in Toronto?'},approved,now);
  assert.deepEqual(result.answerability.facets.map(f=>f.id),['eligibility_health','eligibility_childcare']);
  assert.equal(result.status,'partial');
  assert.equal(answer({question:'Toronto OHIP'},approved,now).parsed.facets.length,0);
});

test('location clarification and unavailable sources remain authoritative',()=>{
  const location=answer({question:'Can I work as a nurse in Paris?',city:'Toronto'},approved,now);
  assert.equal(location.status,'clarification');assert.equal(location.answerability.status,'needs_clarification');
  assert.equal(location.claims.length,0);
  const pending=answer({question:'Can I work as a nurse in Toronto?'},seeds,now);
  assert.equal(pending.status,'unavailable');assert.equal(pending.claims.length,0);
  assert.ok(pending.gaps.some(g=>g.reason==='awaiting_human_review'));
});

test('ordinary navigation preserves source guidance and medical visits do not imply employment',()=>{
  const result=answer({question:'How do I apply for a SIN?'},seeds,now);
  assert.equal(result.status,'guidance');assert.equal(result.answerability.status,'source_guidance_only');
  assert.deepEqual(result.parsed.facets,[]);
  assert.ok(!parse({question:'Find a doctor in Toronto'}).intents.includes('employment'));
});

test('facet gap reasons persist without the personal query',()=>{
  const store=openStore(':memory:');try {
    const result=answer({question:'Can I work as a nurse in Toronto? private@example.com'},approved,now);
    store.log(result);
    const gaps=store.db.prepare('SELECT reason FROM gaps').all();
    assert.ok(gaps.some(g=>g.reason==='missing_occupation_requirements'));
    assert.ok(!JSON.stringify(store.db.prepare('SELECT * FROM traces').all()).includes('private@example.com'));
    for(const gap of result.gaps)assert.ok(!humanizeGap(gap.reason).includes('_'));
  }finally{store.db.close();}
});

test('AI failure cannot remove the answerability contract or its missing facets',async()=>{
  const input={question:'First week in Vancouver'};
  const result=await createVerifiedAnswer({complete:async()=>{throw new Error('fixture failure');}})(input,seeds,now);
  assert.equal(result.ai.status,'fallback');assert.equal(result.status,'guidance');
  assert.deepEqual(result.answerability,answer(input,seeds,now).answerability);
});
