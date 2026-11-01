import test from 'node:test';
import assert from 'node:assert/strict';
import { createVerifiedAnswer } from '../src/verified-answer.js';
import { answer } from '../src/engine.js';
import { seeds } from '../src/knowledge.js';

const input={question:'How do I get a SIN?'}, now=new Date('2026-10-28');
const baseline=answer(input,seeds,now);
const approved={english:true,meaningPreserved:true,noUnsupportedClaims:true,questionRespected:true};
function provider(change={},verdict=approved) {
 return async ({stage}) => stage==='understand'?{intent:'Find the SIN application source'}:
   stage==='rewrite'?{message:'These sources can help you get started.',claims:baseline.claims.map(({id,text})=>({id,text})),...change}:verdict;
}
test('no provider makes no external calls and retains baseline',async()=>{
 const result=await createVerifiedAnswer()(input,seeds,now);
 assert.equal(result.ai.status,'disabled');assert.deepEqual(result.claims,baseline.claims);
});
test('publishes only after independent verification; preserves evidence',async()=>{
 const stages=[]; const complete=provider();
 const result=await createVerifiedAnswer({complete:async request=>{stages.push(request.stage);return complete(request);}})(input,seeds,now);
 assert.deepEqual(stages,['understand','rewrite','verify']);assert.equal(result.ai.status,'checked');
 assert.deepEqual(result.sources,baseline.sources);assert.deepEqual(result.claims,baseline.claims);
});
test('rejects missing claims, foreign scripts, and rejected semantic checks',async()=>{
 for (const complete of [provider({claims:[]}),provider({message:'नमस्ते'}),provider({}, {...approved,meaningPreserved:false}),provider({message:'Bonjour, voici les sources.'},{...approved,english:false}),provider({}, {...approved,english:'true'})]) {
  const result=await createVerifiedAnswer({complete})(input,seeds,now);
  assert.equal(result.ai.status,'fallback');assert.equal(result.message,baseline.message);assert.deepEqual(result.claims,baseline.claims);
 }
});
test('provider failures and deadlines fail closed without exposing errors',async()=>{
 for(const complete of [async()=>{throw new Error('secret token');},()=>new Promise(()=>{})]) {
  const result=await createVerifiedAnswer({complete,timeoutMs:10})(input,seeds,now);
  assert.equal(result.ai.status,'fallback');assert.ok(!JSON.stringify(result).includes('secret token'));
 }
});
test('clarification and unavailable evidence never invoke AI',async()=>{
 const run=createVerifiedAnswer({complete:()=>{assert.fail('unexpected call');}});
 for(const question of ['What is OHIP?', 'How do I bake bread?']) assert.equal((await run({question},seeds,now)).ai.status,'not_applicable');
});
