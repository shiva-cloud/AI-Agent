import test from 'node:test';
import assert from 'node:assert/strict';
import {assertRewriteInvariants} from '../src/rewrite-guard.js';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
const now=new Date('2026-10-28'),input={question:'SIN application'};
const baseline=answer(input,seeds,now),verdict={english:true,meaningPreserved:true,noUnsupportedClaims:true,questionRespected:true};
for(const [before,after] of [
 ['Wait 2 months.','Wait 3 months.'],
 ['Available on 2026-11-04.','Available on 2026-11-05.'],
 ['Pay $50.','Pay $500.'],
 ['Pay CAD 50.','Pay USD 50.'],
 ['A 5% rate.','A 5 rate.'],
 ['Wait two months.','Wait three months.'],
 ['You may apply.','You must apply.'],
 ['This does not establish eligibility.','This does establish eligibility.'],
 ['Use the official guide.','Use https://example.com instead.'],
 ['Use the official guide.','Email help@example.com.']
])test(`rejects changed protected tokens: ${before}`,()=>assert.throws(()=>assertRewriteInvariants(before,after)));
test('ordinary wording changes and retained tokens pass the lexical guard',()=>{
 assert.doesNotThrow(()=>assertRewriteInvariants('You may apply after 2 months.','After 2 months, you may apply.'));
 assert.doesNotThrow(()=>assertRewriteInvariants('This does not establish eligibility.',"This doesn't establish eligibility."));
});
test('unanimous provider approval cannot publish added numeric claims',async()=>{
 const stages=[];
 const result=await createVerifiedAnswer({complete:async({stage})=>{
  stages.push(stage);
  if(stage==='understand')return {intent:'SIN guidance'};
  if(stage==='rewrite')return {message:'Starting guidance.',claims:baseline.claims.map(c=>({id:c.id,text:c.text+' Guaranteed in 24 hours.'}))};
  return verdict;
 }})(input,seeds,now);
 assert.equal(result.ai.status,'fallback');assert.deepEqual(result.claims,baseline.claims);
 assert.deepEqual(stages,['understand','rewrite']);
});
test('generated introduction cannot introduce unsupported promises even after provider approval',async()=>{
 const result=await createVerifiedAnswer({complete:async({stage})=>stage==='understand'?{intent:'SIN guidance'}:stage==='rewrite'?{message:'Your application is guaranteed to succeed.',claims:baseline.claims.map(({id,text})=>({id,text}))}:verdict})(input,seeds,now);
 assert.equal(result.ai.status,'checked');assert.equal(result.message,baseline.message);
 assert.ok(!JSON.stringify(result).includes('guaranteed to succeed'));
});
