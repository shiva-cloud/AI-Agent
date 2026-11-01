import test from 'node:test';
import assert from 'node:assert/strict';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
const input={question:'SIN application'},now=new Date('2026-10-28');
const baseline=answer(input,seeds,now);
const verdict={english:true,meaningPreserved:true,noUnsupportedClaims:true,questionRespected:true};
const draft={message:'Starting guidance.',claims:baseline.claims.map(({id,text})=>({id,text}))};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
test('saturated pipeline immediately returns baseline without making another provider call',async()=>{
 const gate=deferred(),entered=deferred();let calls=0;
 const run=createVerifiedAnswer({maxConcurrent:1,complete:async({stage})=>{
  calls++;if(stage==='understand'){entered.resolve();await gate.promise;return {intent:'SIN'};}return stage==='rewrite'?draft:verdict;
 }});
 const first=run(input,seeds,now);await entered.promise;
 const second=await run(input,seeds,now);assert.equal(second.ai.status,'busy');assert.equal(calls,1);assert.deepEqual(second.claims,baseline.claims);
 gate.resolve();assert.equal((await first).ai.status,'checked');
 assert.equal((await run(input,seeds,now)).ai.status,'checked');
});
test('provider rejection releases capacity for a subsequent request',async()=>{
 let fail=true;
 const run=createVerifiedAnswer({maxConcurrent:1,complete:async({stage})=>{if(fail){fail=false;throw new Error('private provider detail');}return stage==='understand'?{intent:'SIN'}:stage==='rewrite'?draft:verdict;}});
 assert.equal((await run(input,seeds,now)).ai.status,'fallback');assert.equal((await run(input,seeds,now)).ai.status,'checked');
});
test('an abort-ignoring timed-out call keeps its slot until it actually settles',async()=>{
 const gate=deferred();let calls=0,signal;
 const run=createVerifiedAnswer({timeoutMs:10,maxConcurrent:1,complete:request=>{calls++;signal=request.signal;return gate.promise;}});
 assert.equal((await run(input,seeds,now)).ai.status,'fallback');assert.equal(signal.aborted,true);
 for(let i=0;i<5;i++)assert.equal((await run(input,seeds,now)).ai.status,'busy');
 assert.equal(calls,1);
 gate.resolve({intent:'SIN'});await new Promise(resolve=>setImmediate(resolve));
 assert.equal((await run(input,seeds,now)).ai.status,'fallback');assert.ok(calls>1);
});
test('non-answerable questions bypass capacity and preserve publication gates',async()=>{
 const gate=deferred(),entered=deferred();
 const run=createVerifiedAnswer({maxConcurrent:1,complete:()=>{entered.resolve();return gate.promise;}});
 const first=run(input,seeds,now);await entered.promise;
 assert.equal((await run({question:'Toronto OHIP'},seeds,now)).ai.status,'not_applicable');
 assert.equal((await run({question:'Health coverage'},seeds,now)).ai.status,'not_applicable');
 gate.resolve({});assert.equal((await first).ai.status,'fallback');
});
test('invalid capacity and timer settings fail explicitly',()=>{
 for(const maxConcurrent of [0,-1,1.5,33,NaN])assert.throws(()=>createVerifiedAnswer({maxConcurrent}));
 for(const timeoutMs of [0,-1,Infinity,NaN,2147483648])assert.throws(()=>createVerifiedAnswer({timeoutMs}));
});
