// Price-data records (0.19.8): rent and child-care fee evidence plus Toronto's
// ONFB grocery benchmark, all distilled from official government pages fetched
// in full on 2026-10-28. Rent and child care are high-risk topics, so those
// records ship pending human review and must produce no public claims; the
// grocery benchmark is a low-risk research seed and is publicly usable.
import test from 'node:test';
import assert from 'node:assert/strict';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {assertEnglishRecord} from '../src/language.js';
import {openStore} from '../src/store.js';
const now=new Date('2026-10-28T12:00:00Z');

test('price records persist, validate as English evidence and carry correct risk gating',()=>{
  const store=openStore(':memory:');try{
    const records=store.records();
    for(const [id,risk] of [['toronto-onfb','low'],['bc-food-costing','low'],['cmhc-rent-toronto','high'],['cmhc-rent-vancouver','high'],['toronto-childcare-fees','high'],['ontario-cwelcc-fees','high'],['bc-childcare-fees','high']]){
      const record=records.find(r=>r.id===id);
      assert.ok(record,`${id} persisted`);
      assert.equal(record.risk,risk,`${id} risk matches its topic policy`);
      assert.doesNotThrow(()=>assertEnglishRecord(record));
      assert.match(record.summary,/[\$%]/,`${id} summary carries a verifiable figure`);
    }
  }finally{store.db.close();}
});

test('the grocery benchmark is publicly usable and cites only Toronto records',()=>{
  const result=answer({question:'How much are groceries in Toronto?'},seeds,now);
  assert.ok(result.claims.some(c=>c.evidenceId==='toronto-onfb'),'ONFB benchmark cited');
  assert.ok(result.claims.every(c=>c.evidenceId.startsWith('toronto-')),'only Toronto records');
  assert.ok(!result.gaps.some(g=>g.topic==='groceries'),'no grocery gap remains for Toronto');
});

test('the BC grocery benchmark is publicly usable with its 2022 vintage disclosed',()=>{
  const result=answer({question:'Groceries in Vancouver'},seeds,now);
  assert.ok(result.claims.some(c=>c.evidenceId==='bc-food-costing'),'BCCDC benchmark cited');
  assert.ok(result.claims.every(c=>c.evidenceId.startsWith('bc-')),'only BC records');
  assert.match(result.claims[0].text,/2022/,'the survey vintage is disclosed in the claim itself');
});

test('Brampton and Peel groceries keep their honest gap (no data yet)',()=>{
  const result=answer({question:'Indian groceries in Brampton'},seeds,now);
  assert.equal(result.status,'unavailable');assert.equal(result.claims.length,0);
  assert.ok(result.gaps.some(g=>g.reason==='missing_evidence'));
});

test('rent and child-care fee evidence stays pending and yields no public claims',()=>{
  for(const question of ['How much is rent in Toronto?','How much is rent in Vancouver?','How much does child care cost in Toronto?','What are child care fees in Vancouver?']) {
    const result=answer({question},seeds,now);
    assert.equal(result.status,'unavailable');assert.equal(result.claims.length,0);
    assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'),'gap discloses that review is pending');
  }
});

test('rent averages never answer compound rent questions outside their subject',()=>{
  // Deposit, agreement and repair questions keep their own subjects; CMHC
  // rent evidence must not appear there.
  for(const question of ['Toronto rent deposit limits','Vancouver lease','Toronto landlord repairs']) {
    const result=answer({question},seeds,now);
    assert.ok(!result.sources.some(s=>s.id.startsWith('cmhc-')),`${question}: no CMHC citation`);
  }
});
