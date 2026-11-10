import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,answer} from '../src/engine.js';
import {normalizeEnglishQuestion} from '../src/question-normalization.js';

test('English typography and whitespace normalize without changing underlying query semantics',()=>{
 const pairs=[
  ['Step-by-step SIN application in Toronto','Step\u2011by\u2011step   SIN\napplication in Toronto'],
  ['First week in Vancouver','First\tweek\n in Vancouver'],
  ["Can I exchange my UK driver's licence in Toronto?",'Can I exchange my UK driver\u2019s licence in Toronto?']
 ];
 for(const [plain,formatted] of pairs)assert.deepEqual(parse({question:formatted}),parse({question:plain}));
 assert.equal(normalizeEnglishQuestion('  My\u2019s\tstep\u2014by\u2014step '),"My's step-by-step");
});

test('separate employment requests survive banking and housing eligibility disambiguation',()=>{
 for(const phrase of ['find work','look for a job','search for employment','finding work','seeking jobs']) {
  const parsed=parse({question:`Can I open a bank account without a job and ${phrase} in Toronto?`});
  assert.ok(parsed.intents.includes('money'),phrase);assert.ok(parsed.intents.includes('employment'),phrase);
 }
 for(const question of ['Can I open a bank account without a job in Toronto?','Can I rent without a job in Toronto?','Can I open a bank account without job in Toronto?'])assert.ok(!parse({question}).intents.includes('employment'));
 const result=answer({question:'Can I rent without a job and find work in Toronto?'},[]);
 assert.ok(result.parsed.intents.includes('housing'));assert.ok(result.parsed.intents.includes('employment'));
 assert.ok(result.gaps.some(g=>g.topic==='employment'));assert.equal(result.claims.length,0);
});

test('plural and family eligibility phrasing preserves unsupported personal-eligibility facets',()=>{
 for(const question of ['Can we apply for OHIP in Toronto?','Could I claim childcare benefits in Toronto?','Can my spouse work in Toronto?','Is my partner allowed to work in Toronto?','Who qualifies for OHIP in Toronto?']) {
  const parsed=parse({question});assert.equal(parsed.requestedOutput,'eligibility',question);
  assert.ok(parsed.facets.some(f=>f.reason==='missing_personal_eligibility'),question);
  const result=answer({question},[]);assert.equal(result.claims.length,0);assert.equal(result.status,'unavailable');
 }
 assert.equal(parse({question:'How do we apply for a SIN in Toronto?'}).requestedOutput,'source_guidance');
});

test('phrasing changes do not bypass unsupported destination and language gates',()=>{
 const result=answer({question:'Could we work in Paris? ',city:'Toronto'},[]);
 assert.equal(result.status,'clarification');assert.equal(result.claims.length,0);
 assert.throws(()=>parse({question:'Toronto library',language:'hi'}));
 assert.equal(parse({question:'Can we bake bread in Toronto?'}).intents.length,0);
});

test('cash wages and reduced hours on closed work permits route cleanly to employment without customs/banking intent collision',()=>{
 const parsed=parse({question:'My boss is cutting my hours on a closed work permit and paying me in cash in Toronto'});
 assert.deepEqual(parsed.intents,['employment']);
});
