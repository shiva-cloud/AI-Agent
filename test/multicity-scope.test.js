import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,answer} from '../src/engine.js';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {seeds} from '../src/knowledge.js';
const now=new Date('2026-10-28T12:00:00Z');

test('residence phrasing cannot silently resolve multiple destination cities',()=>{
 for(const phrase of ['living in','lives in','residing in','resident of','located in','home in','staying in']) {
  for(const destination of ['Vancouver','Mississauga']) {
   const question=`I am ${phrase} Toronto and need library information for ${destination}`;
   const parsed=parse({question});assert.equal(parsed.ambiguous,true,question);assert.ok(parsed.missingSlots.includes('location'));
   const result=answer({question},seeds,now);assert.equal(result.status,'clarification');assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);
  }
 }
});

test('selected city and word order cannot override multi-city ambiguity',()=>{
 for(const question of ['Living in Toronto; banking in Vancouver','Banking in Vancouver while living in Toronto','Living in Vancouver; banking in Toronto','Living in Toronto and staying in Brampton']) {
  const result=answer({question,city:'Toronto'},seeds,now);assert.equal(result.status,'clarification');assert.equal(result.claims.length,0);
 }
});

test('single-city residence and repeated same-city mentions remain usable',()=>{
 for(const question of ['Living in Toronto and need a library','Living in Toronto, looking for Toronto library internet']) {
  const parsed=parse({question});assert.equal(parsed.city,'Toronto');assert.equal(parsed.ambiguous,false);assert.deepEqual(parsed.missingSlots,[]);
  assert.ok(answer({question},seeds,now).claims.length>0);
 }
});

test('AI cannot bypass unresolved multi-city scope',async()=>{
 let calls=0;const verified=createVerifiedAnswer({complete:async()=>{calls++;throw new Error('must not call');}});
 const result=await verified({question:'Living in Toronto, which library should I use in Vancouver?'},seeds,now);
 assert.equal(calls,0);assert.equal(result.status,'clarification');assert.equal(result.ai.status,'not_applicable');
});
