import test from 'node:test';
import assert from 'node:assert/strict';
import {answer,parse} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
const now=new Date('2026-10-28T12:00:00Z');

for(const term of ['childcare','child care','child-care','daycare','day care','day-care']) {
  test(`${term} identifies childcare without school evidence`,()=>{
    assert.deepEqual(parse({question:`Find ${term} in Toronto`}).intents,['childcare']);
    const result=answer({question:`Find ${term} in Toronto`},seeds,now);
    // Fee evidence joined the provincial record (0.19.8). All citations stay
    // Ontario-scoped; the provincial hub must still be present.
    assert.ok(result.sources.some(s=>s.id==='ontario-childcare'),'provincial record cited');
    assert.ok(result.sources.every(s=>['ontario-childcare','ontario-cwelcc-fees','toronto-childcare-fees'].includes(s.id)),'Ontario records only');
    assert.equal(result.status,'unavailable');assert.equal(result.claims.length,0);
  });
}
test('school evidence stays within the board city and remains pending',()=>{
  for(const [city,id] of [['Toronto','tdsb-registration'],['Vancouver','vsb-registration']]) {
    const result=answer({question:`School registration in ${city}`},seeds,now);
    assert.deepEqual(result.sources.map(s=>s.id),[id]);
    assert.equal(result.sources[0].status,'awaiting_human_review');
    assert.equal(result.claims.length,0);
  }
  for(const city of ['Brampton','Mississauga']) {
    const result=answer({question:`School registration in ${city}`},seeds,now);
    // Peel-board evidence joined the corpus (0.19.9). Both Peel records are
    // cited; all family evidence stays pending independent human review, so
    // school questions produce no public claims for any pilot city.
    assert.deepEqual(result.sources.map(s=>s.id).sort(),[
      'dpcdsb-registration-'+(city==='Brampton'?'brampton':'mississauga'),
      'pdsb-registration-'+(city==='Brampton'?'brampton':'mississauga')]);
    assert.ok(result.sources.every(s=>s.status==='awaiting_human_review'));
    assert.equal(result.status,'unavailable');assert.equal(result.claims.length,0);
    assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'));
  }
});
test('provincial childcare scope covers the pilot cities without crossing provinces',()=>{
  for(const city of ['Toronto','Mississauga','Brampton','Vancouver']) {
    const result=answer({question:`Daycare in ${city}`},seeds,now);
    const ids=result.sources.map(s=>s.id);
    const allowed=city==='Vancouver'?['bc-childcare','bc-childcare-fees']:['ontario-childcare','ontario-cwelcc-fees','toronto-childcare-fees'];
    assert.ok(ids.some(id=>id===(city==='Vancouver'?'bc-childcare':'ontario-childcare')),'provincial record cited');
    assert.ok(ids.every(id=>allowed.includes(id)),'jurisdiction-safe citations only');
  }
  assert.equal(answer({question:'Daycare'},seeds,now).status,'clarification');
  assert.equal(answer({question:'Daycare in Calgary',city:'Toronto'},seeds,now).sources.length,0);
});
test('multi-topic questions preserve school and childcare intents',()=>{
  assert.deepEqual(parse({question:'School and child care in Toronto'}).intents,['family','childcare']);
  assert.deepEqual(parse({question:'Kindergarten in Toronto'}).intents,['family']);
  assert.deepEqual(parse({question:'A carefree day in Toronto'}).intents,[]);
});
test('family and childcare imports cannot bypass high-risk review',()=>{
  const store=openStore(':memory:');
  try {
    for(const id of ['tdsb-registration','ontario-childcare']) {
      const sourceId=`seed-${id}`,today=new Date().toISOString().slice(0,10);
      store.ingestion.permitSource(sourceId,{reviewer:'Test reviewer',note:'Fixture-only source permission.',tier:'A'});
      const record={...seeds.find(r=>r.id===id),risk:'low',checkedAt:today,expiresAt:today};
      assert.throws(()=>store.ingestion.ingest({sourceId,requestKey:id,record,content:record.quote}),/high-risk review/);
    }
  }finally{store.db.close();}
});
