// Regression tests for the user-facing errors found in docs/DIAGNOSIS_2026-11-01.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {createApp, normalizeTypedNumber, normalizeToolInput, TOOL_OUTPUT_GARBAGE} from '../src/server.js';
import {detectSuggestedTools} from '../src/answer-composer.js';
import {evaluateUkSkilledWorkerAndIlr} from '../src/uk-skilled-worker-ilr-navigator.js';
import {calculateMovingTaxDeduction} from '../src/moving-tax-calculator.js';
import {generateBilingualView} from '../src/bilingual-view-helper.js';
import {submitTranslationSuggestion, listTranslations} from '../src/community-translation-ledger.js';
import {ValidationError} from '../src/api-errors.js';
import {unrecognisedPlaceNames} from '../src/geography.js';

const unlimited={rateLimits:{v1:{limit:1e9,windowMs:60000},admin:{limit:1e9,windowMs:60000},static:{limit:1e9,windowMs:60000}}};
async function withServer(fn){
 const server=createApp(openStore(':memory:'),'diagnosis-token-that-is-long-enough',undefined,unlimited);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const root=`http://127.0.0.1:${server.address().port}`;
 const post=(path,body)=>fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try { await fn({root,post}); } finally { server.close(); }
}

test('typed money like "$75,000" is read as a number; other text is left alone',()=>{
 assert.equal(normalizeTypedNumber('$75,000'),75000);
 assert.equal(normalizeTypedNumber('CAD 1,200.50'),1200.5);
 assert.equal(normalizeTypedNumber('2,800 CAD'),2800);
 for(const keep of ['85','M5V 2T6','21231','abc $5 fee','',null])assert.equal(normalizeTypedNumber(keep),keep);
 assert.deepEqual(normalizeToolInput({a:'$1,000',b:'ON',c:3}),{a:1000,b:'ON',c:3});
 assert.ok(TOOL_OUTPUT_GARBAGE.test('total: NaN'));
 assert.ok(!TOOL_OUTPUT_GARBAGE.test('Nanaimo, BC'));
});

test('moving-tax result is the same for typed and plain numbers',()=>{
 const plain={temporaryLivingDays:7,transportAndStorageCostsCad:2800,employmentIncomeEarnedAtNewLocationCad:45000};
 const typed={temporaryLivingDays:'7',transportAndStorageCostsCad:'2800',employmentIncomeEarnedAtNewLocationCad:'45000'};
 assert.deepEqual(calculateMovingTaxDeduction(typed).temporaryLiving,calculateMovingTaxDeduction(plain).temporaryLiving);
});

test('UK salary check does not assume an under-26 applicant when age is not given',()=>{
 assert.doesNotMatch(evaluateUkSkilledWorkerAndIlr({}).salaryCompliance.thresholdCategory,/New entrant/);
 assert.match(evaluateUkSkilledWorkerAndIlr({applicantAge:24}).salaryCompliance.thresholdCategory,/New entrant/);
});

test('tool suggestions follow the question, not words inside the cited sources',()=>{
 const result={parsed:{rawQuestion:'How do I get a SIN?',queryTerms:['sin'],intents:['sin']},claims:[{text:'Students with a study permit and a PGWP can also apply for a SIN.'}]};
 const ids=detectSuggestedTools(result).map(t=>t.id);
 assert.ok(!ids.some(id=>/study|pgwp/i.test(id)),`unexpected suggestions: ${ids}`);
});

test('health-plan and ID acronyms are not read as unknown places',()=>{
 assert.deepEqual(unrecognisedPlaceNames('I just moved to Vancouver, how do I enrol in MSP health coverage?'),[]);
 assert.deepEqual(unrecognisedPlaceNames('How do I apply for a SIN in Springfield?'),['Springfield']);
});

test('bilingual view never renders objects as text',()=>{
 const view=generateBilingualView({text:{a:1},targetLocale:5,citationTitle:[],sourceId:{}});
 assert.equal(view.bilingualLayout.rightColumn.content,'');
 assert.equal(view.citationTitle,'Official Statutory Source');
 assert.equal(view.sourceId,'statutory_source');
 assert.doesNotMatch(JSON.stringify(view),/\[object Object\]/);
});

test('translation suggestions reject non-text fields and paging tolerates bad values',()=>{
 assert.throws(()=>submitTranslationSuggestion({}),ValidationError);
 assert.throws(()=>submitTranslationSuggestion({termOrRecordId:'x',targetLocale:'hi',suggestedTranslation:{}}),ValidationError);
 for(const limit of ['abc',-1,Number.NaN])assert.doesNotThrow(()=>listTranslations({limit,offset:-5}));
});

test('HTTP: account probe, typed money, bad question type and legal-notice defaults',async()=>{
 await withServer(async({root,post})=>{
  assert.equal((await fetch(root+'/v1/account')).status,204);
  const plain=await (await post('/v1/tools/moving-tax-calc',{transportAndStorageCostsCad:2800,temporaryLivingDays:7})).json();
  const typed=await (await post('/v1/tools/moving-tax-calc',{transportAndStorageCostsCad:'$2,800',temporaryLivingDays:'7'})).json();
  assert.deepEqual(typed.temporaryLiving,plain.temporaryLiving);
  const answer=await post('/v1/answers',{question:{text:'OHIP'}});
  assert.ok(answer.status>=400&&answer.status<500,`expected a 4xx, got ${answer.status}`);
  // The website form submits its default values as a GET query.
  const notice=await fetch(root+'/v1/tools/legal-notices?'+new URLSearchParams({type:'ontario_ltb_t2',sender:'Jane Doe',recipient:'Property Manager',amount:'0',issues:'Unlawful entry without 24 hours written notice'}));
  assert.equal(notice.status,200);
  assert.doesNotMatch(await notice.text(),TOOL_OUTPUT_GARBAGE);
 });
});
