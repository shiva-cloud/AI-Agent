import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
import {createVerifiedAnswer} from '../src/verified-answer.js';
const now=new Date('2026-10-28T12:00:00Z');

test('processing and deadline phrasing create explicit unsupported timing facets',()=>{
 for(const question of ['What is the SIN processing time in Toronto?','How long does a SIN application take in Toronto?','How many business days to receive a SIN in Toronto?']) {
  const parsed=parse({question});assert.equal(parsed.requestedOutput,'timeline');assert.ok(parsed.facets.some(f=>f.id==='processing_time'&&f.topic==='sin'));
 }
 for(const question of ['What is the application deadline for childcare in Toronto?','When must we renew a driving licence in Toronto?','By when should I apply for a SIN in Toronto?'])assert.ok(parse({question}).facets.some(f=>f.id==='application_deadline'));
});

test('generic source guidance cannot satisfy a timing question even when approved',()=>{
 const records=seeds.map(r=>({...r,status:'approved'}));
 const result=answer({question:'What is the SIN processing time in Toronto?'},records,now);
 assert.ok(result.claims.length);assert.equal(result.status,'partial');assert.equal(result.answerability.status,'incomplete');
 assert.ok(result.answerability.facets.some(f=>f.id==='processing_time'&&f.status==='unsupported'));
 assert.ok(result.gaps.some(g=>g.reason==='missing_verified_processing_time'));
});

test('timing facets compose with existing requests and do not invent topic attribution',()=>{
 const parsed=parse({question:'Can we apply for a SIN and OHIP in Toronto and what are the processing times?'});
 assert.equal(parsed.requestedOutput,'eligibility');assert.ok(parsed.facets.some(f=>f.reason==='missing_personal_eligibility'));
 assert.equal(parsed.facets.find(f=>f.id==='processing_time').topic,null);
 const checklist=parse({question:'Step-by-step SIN application in Toronto and the deadline for submitting it'});
 assert.equal(checklist.requestedOutput,'checklist');assert.ok(checklist.facets.some(f=>f.id==='application_deadline'));
 for(const question of ['Toronto library','First week in Toronto','I arrived yesterday and need a SIN in Toronto','How do I apply for a SIN in Toronto?'])assert.ok(!parse({question}).facets.some(f=>['processing_time','application_deadline'].includes(f.id)));
 assert.equal(parse({question:'How long does baking bread take in Toronto?'}).intents.length,0);
});

test('timing gaps persist without raw dates and survive AI fallback and geography gates',async()=>{
 const question='What is the SIN processing time in Toronto? My target date is 2031-07-18.';
 const result=await createVerifiedAnswer({complete:async()=>{throw new Error('offline');}})({question},seeds,now);
 assert.ok(result.gaps.some(g=>g.reason==='missing_verified_processing_time'));
 const store=openStore(':memory:');
 try {
  store.log(result);
  const rows=store.db.prepare('SELECT * FROM gap_work_items').all();
  assert.ok(rows.some(r=>r.reason==='missing_verified_processing_time'));assert.ok(!JSON.stringify(rows).includes('2031-07-18'));
 }finally{store.db.close();}
 const blocked=answer({question:'SIN processing time in Paris',city:'Toronto'},seeds,now);
 assert.equal(blocked.status,'clarification');assert.equal(blocked.claims.length,0);
});
