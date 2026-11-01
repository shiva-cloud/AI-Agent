import test from 'node:test';
import assert from 'node:assert/strict';
import {composePresentation,splitSentences,extractBasis} from '../src/answer-composer.js';
import {assertSummaryGrounded} from '../src/rewrite-guard.js';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';

const now=new Date('2026-10-28');
const claimText='Under the Residential Tenancies Act, 2006 (RTA Sections 25 to 27), tenants in Ontario have the statutory right to privacy. Landlords cannot enter without at least 24 hours written notice between 8:00 a.m. and 8:00 p.m. Tenants can file Form T2 for fines up to $50,000. This record does not adjudicate tribunal disputes.';
const fixture={status:'guidance',parsed:{intents:['housing'],city:'Toronto',region:'ON',country:'CA',queryTerms:['landlord','enter','notice']},
 claims:[{id:'claim-1',text:claimText,evidenceId:'rec-1',status:'approved',kind:'source_guidance',topic:'housing'}],
 sources:[{id:'rec-1',title:'Ontario LTB: Tenant rights against illegal entry (RTA s.25)',url:'https://tribunalsontario.ca/ltb/',checkedAt:'2026-10-01',status:'approved'}],
 retrieval:{candidates:[{id:'rec-1',score:5}]}};

test('sentence splitting keeps abbreviations and times inside sentences',()=>{
 assert.deepEqual(splitSentences('Apply under s. 25 today. Open 8:00 a.m. to 5 p.m. Bring ID.'),['Apply under s. 25 today.','Open 8:00 a.m. to 5 p.m.','Bring ID.']);
});

test('legal basis is lifted from the opening clause without breaking "Act, 2006"',()=>{
 const {basis,statement}=extractBasis('Under the Residential Tenancies Act, 2006 (RTA Sections 25 to 27), tenants in Ontario have the statutory right to privacy.');
 assert.equal(basis,'Residential Tenancies Act, 2006 (RTA Sections 25 to 27)');
 assert.equal(statement,'Tenants in Ontario have the statutory right to privacy.');
});

test('presentation only uses words from the claim and cites its source',()=>{
 const p=composePresentation(fixture);
 const [section]=p.sections;
 assert.equal(p.version,'presentation-1');
 assert.equal(section.heading,'Tenant rights against illegal entry');
 assert.equal(section.authority,'Ontario LTB');
 assert.equal(section.sourceIndex,1);
 assert.deepEqual(section.limits,['This guidance does not adjudicate tribunal disputes.']);
 // Every visible sentence is a verbatim slice of the claim (bar capitalisation).
 const lower=claimText.toLowerCase();
 for(const piece of [section.lead,...section.points.map(x=>x.text),section.basis,...p.summary,...p.keyFacts.map(f=>f.context)])
  assert.ok(lower.includes(piece.toLowerCase().replace(/\.$/,'')),piece);
 assert.deepEqual(p.keyFacts.map(f=>f.value).sort(),['$50,000','24 hours','Form T2'].sort());
 assert.equal(p.citations[0].url,'https://tribunalsontario.ca/ltb/');
});

test('weakly matched claims are marked as related reading, not primary',()=>{
 const two={...fixture,claims:[...fixture.claims,{...fixture.claims[0],id:'claim-2',evidenceId:'rec-2'}],
  sources:[...fixture.sources,{...fixture.sources[0],id:'rec-2'}],retrieval:{candidates:[{id:'rec-1',score:6},{id:'rec-2',score:1}]}};
 assert.deepEqual(composePresentation(two).sections.map(s=>s.relevance),['primary','related']);
});

test('suggestedTools recommends 1-click interactive statutory navigators (Pillar 2)',()=>{
 const p=composePresentation(fixture);
 assert.ok(Array.isArray(p.suggestedTools));
 assert.ok(p.suggestedTools.length > 0);
 const tool=p.suggestedTools.find(t=>t.id==='lease-guard');
 assert.ok(tool);
 assert.equal(tool.endpoint,'/v1/tools/lease-guard');
 assert.equal(tool.badge,'TENANT RIGHTS TOOL');
});

test('summary guard rejects added numbers and promises but accepts condensing',()=>{
 assert.doesNotThrow(()=>assertSummaryGrounded(claimText,'Landlords cannot enter without 24 hours written notice.'));
 assert.throws(()=>assertSummaryGrounded(claimText,'Landlords cannot enter without 48 hours notice.'));
 assert.throws(()=>assertSummaryGrounded(claimText,'You will definitely win at the tribunal.'));
});

test('verified answers carry a presentation; a grounded AI summary is used, an ungrounded one dropped',async()=>{
 const input={question:'SIN application'},baseline=answer(input,seeds,now);
 const verdict={english:true,meaningPreserved:true,noUnsupportedClaims:true,questionRespected:true};
 const run=summary=>createVerifiedAnswer({complete:async({stage})=>stage==='understand'?{intent:'SIN guidance'}
  :stage==='rewrite'?{message:'Starting guidance.',summary,claims:baseline.claims.map(({id,text})=>({id,text}))}:verdict})(input,seeds,now);
 const disabled=await createVerifiedAnswer()(input,seeds,now);
 assert.equal(disabled.presentation.summarySource,'evidence');
 const grounded=await run('Use the official guide to choose how to apply.');
 assert.equal(grounded.ai.status,'checked');
 assert.equal(grounded.presentation.summarySource,'ai_checked');
 const invented=await run('Your SIN arrives in 3 days, guaranteed.');
 assert.equal(invented.ai.status,'checked');
 assert.equal(invented.presentation.summarySource,'evidence');
 assert.ok(!JSON.stringify(invented).includes('guaranteed'));
});
