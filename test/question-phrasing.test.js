import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,retrieve,answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
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

test('automated, border, or security screening never triggers housing or tenancy agreement subjects',()=>{
 const parsed=parse({question:'Where should a dependent spouse in Brisbane, Australia start when dealing with procedural fairness in automated screening?'});
 assert.ok(!parsed.intents.includes('housing'));
 assert.deepEqual(parsed.housingSubjects,[]);
});

test('Toronto housing and arrival retrieval excludes Brampton and Mississauga municipal bylaws tagged at provincial scope',()=>{
 const now=new Date('2026-10-28T12:00:00Z');
 const base={...seeds.find(r=>r.topic==='housing'&&r.jurisdiction==='ON'),status:'approved'};
 const ontarioDeposit={...base,id:'ontario-rent-deposits-test',housingSubject:'deposit',title:'Ontario LTB: Rent deposits and key deposits',summary:'Ontario Residential Tenancies Act limits rent deposits to last month rent and key deposits to replacement cost.',quote:'One month rent deposit limit'};
 const bramptonRrl={...base,id:'brampton-rental-licensing-no-credit-and-tenant-scam-prevention',housingSubject:'deposit',title:'Brampton Rental Market: Residential Rental Licensing (RRL) bylaw, no-credit tenant screening, and deposit protections',summary:'Under the City of Brampton Residential Rental Licensing Pilot Program (Bylaw 2024-001), key deposits cannot exceed replacement cost.',quote:'Under Brampton Bylaw 2024-001 and the Ontario Residential Tenancies Act'};
 const torontoRanked=retrieve(parse({question:'Can my landlord ask for a $500 key deposit and my SIN in Toronto?',city:'Toronto'}),[ontarioDeposit,bramptonRrl],now);
 assert.ok(!torontoRanked.some(r=>r.id===bramptonRrl.id));
 const bramptonRanked=retrieve(parse({question:'Can my landlord ask for a $500 key deposit and my SIN in Brampton?',city:'Brampton'}),[ontarioDeposit,bramptonRrl],now);
 assert.ok(bramptonRanked.some(r=>r.id===bramptonRrl.id));
});

test('rental Kaution queries in Germany map strictly to deposit housingSubject',()=>{
 const parsed=parse({question:'What is the rental Kaution limit in Bavaria?'});
 assert.equal(parsed.country,'Germany');
 assert.equal(parsed.region,'Bavaria');
 assert.deepEqual(parsed.housingSubjects,['deposit']);
});
