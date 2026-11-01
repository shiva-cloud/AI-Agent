import test from 'node:test';
import assert from 'node:assert/strict';
import {locationChoices,locationFollowUp} from '../public/clarification.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
const now=new Date('2026-10-28T12:00:00Z');
test('location follow-up preserves question and retrieves the selected city evidence',()=>{
 const original={question:'Where is the bus trip planner?'},result=answer(original,seeds,now);
 assert.equal(locationChoices(result).length,4);
 const followUp=locationFollowUp(original,result,'Vancouver');
 assert.equal(followUp.question,original.question);assert.equal(followUp.language,'en');
 // Local Vancouver records only (planner plus published fares).
 const cited=answer(followUp,seeds,now).claims.map(c=>c.evidenceId);
 assert.ok(cited.includes('translink-trip-planner'));
 assert.ok(cited.every(id=>id==='translink-trip-planner'||id==='translink-fares'));
 assert.equal(original.city,undefined);
});
test('unsupported and conflicting locations cannot be overwritten by follow-up buttons',()=>{
 for(const question of ['London rent','Calgary bus','Toronto versus Vancouver health','Toronto BC school']){
  const original={question},result=answer(original,seeds,now);
  assert.deepEqual(locationChoices(result),[]);assert.throws(()=>locationFollowUp(original,result,'Toronto'),/Edit the question/);
 }
});
test('non-location clarifications and invalid choices do not create location follow-ups',()=>{
 assert.deepEqual(locationChoices(answer({question:'Toronto driving licence'},seeds,now)),[]);
 const original={question:'Health coverage'},result=answer(original,seeds,now);
 assert.throws(()=>locationFollowUp(original,result,'Ottawa'));
 assert.throws(()=>locationFollowUp({},result,'Toronto'));
 assert.deepEqual(locationChoices(null),[]);
});
test('HTTP follow-up retains review gates and does not persist original question text',async()=>{
 const store=openStore(':memory:'),server=createApp(store,undefined,{});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const post=input=>fetch(base+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}).then(r=>r.json());
 try{
  const original={question:'Health coverage private-marker-clarification'},first=await post(original);
  const second=await post(locationFollowUp(original,first,'Toronto'));
  assert.equal(second.claims.length,0);assert.equal(second.parsed.city,'Toronto');
  assert.ok(!JSON.stringify(store.db.prepare('SELECT body FROM traces').all()).includes('private-marker-clarification'));
  const script=await fetch(base+'/clarification.js');assert.equal(script.status,200);assert.match(script.headers.get('content-type'),/javascript/);
 }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});
