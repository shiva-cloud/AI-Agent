import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluate,checkAnswerConstraints} from '../src/evaluation.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
const now=new Date('2026-10-28T12:00:00Z');
const fixture=()=>answer({question:'Toronto bus'},seeds,now);
test('expanded evaluation passes all developer-authored regression cases',()=>{
 const dataset=JSON.parse(readFileSync(new URL('../evaluation/english-expanded.json',import.meta.url),'utf8'));
 assert.equal(new Set(dataset.cases.map(c=>c.id)).size,dataset.cases.length);
 const report=evaluate(dataset,seeds);assert.deepEqual(report.failures,[]);assert.equal(report.answerConstraintPassRate,1);
});
test('checker detects fabricated claims even with valid citations',()=>{
 const result=fixture();result.claims[0].text='All journeys are free.';
 assert.ok(checkAnswerConstraints({},result,seeds,now).some(i=>i.startsWith('claim_text:')));
});
test('checker detects incorrect geography and changed source URLs',()=>{
 const result=fixture(),other=seeds.find(r=>r.id==='translink-trip-planner');
 result.sources.push({id:other.id,url:other.url});result.sources[0].url='https://example.com';
 const issues=checkAnswerConstraints({},result,seeds,now);
 assert.ok(issues.some(i=>i.startsWith('source_geography:')));assert.ok(issues.some(i=>i.startsWith('source_identity:')));
});
test('checker detects pending, expired and uncited claims',()=>{
 const result=fixture(),records=seeds.map(r=>r.id==='ttc-trip-planner'?{...r,status:'pending'}:r);
 assert.ok(checkAnswerConstraints({},result,records,now).some(i=>i.startsWith('unavailable_claim:')));
 assert.ok(checkAnswerConstraints({},result,seeds,new Date('2026-11-26')).some(i=>i.startsWith('unavailable_claim:')));
 result.sources=[];assert.ok(checkAnswerConstraints({},result,seeds,now).some(i=>i.startsWith('unlinked_claim:')));
});
test('fixture constraints detect absent claims, absent gaps and forbidden sources',()=>{
 const issues=checkAnswerConstraints({maxClaims:0,requiredClaims:['missing'],requiredSources:['missing'],forbiddenSources:['ttc-trip-planner'],requiredGapReasons:['missing_evidence']},fixture(),seeds,now);
 for(const expected of ['claim_limit','required_claim:missing','required_source:missing','forbidden_source:ttc-trip-planner','required_gap:missing_evidence'])assert.ok(issues.includes(expected));
});
