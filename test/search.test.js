import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rankLexically,queryTerms} from '../src/search.js';
import {answer,parse,retrieve} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {evaluate} from '../src/evaluation.js';
const now=new Date('2026-10-28T12:00:00Z');
test('lexical ranking distinguishes relevant passages within a shared topic',()=>{
 const base=seeds.find(r=>r.id==='toronto-library');
 const docs=[{...base,id:'a',title:'Newcomer programs',summary:'General orientation and city guidance.',quote:'Orientation'}, {...base,id:'b',title:'Library computer access',summary:'Library computers and internet access.',quote:'Computer access'}];
 const ranked=retrieve(parse({question:'Toronto library computers internet'}),docs,now);
 assert.equal(ranked[0].id,'b');assert.ok(ranked[0].lexicalScore>ranked[1].lexicalScore);assert.ok(ranked[0].matchedTerms.includes('computer')||ranked[0].matchedTerms.includes('computers'));
});
test('geography is filtered before lexical ranking',()=>{
 const p=parse({question:'Vancouver OHIP health insurance Ontario'});assert.deepEqual(retrieve(p,seeds,now),[]);
 // Canada-scoped IFHP records (0.19.11) join the Vancouver cohort; the Ontario
 // OHIP record is still filtered out by geography before any ranking happens.
 const q=parse({question:'Vancouver health insurance'});
 assert.deepEqual(retrieve(q,seeds,now).map(r=>r.id),['msp','msp-documents','ifhp-coverage','ifhp-eligibility']);
 assert.ok(!retrieve(q,seeds,now).map(r=>r.id).includes('ohip'),'Ontario record excluded');
});
test('English inflections normalize; query punctuation is not executable search syntax',()=>{
 assert.ok(queryTerms('libraries').includes('library'));assert.ok(queryTerms('applications').includes('apply'));
 const result=rankLexically(seeds,queryTerms('"SIN" OR * -DROP TABLE records;'));assert.equal(result.length,seeds.length);
});
test('settlement domain synsets expand colloquial search terms (Pillar 3)',()=>{
 const rentTerms = queryTerms('Can landlord do a huge rent hike?');
 assert.ok(rentTerms.includes('increase'));
 assert.ok(rentTerms.includes('guideline'));
 const cashTerms = queryTerms('How much cash can I bring through airport?');
 assert.ok(cashTerms.includes('declare'));
 assert.ok(cashTerms.includes('monetary'));
 const wageTerms = queryTerms('My boss is paying me in cash and cutting my hours');
 assert.ok(!wageTerms.includes('customs'));
 assert.ok(!wageTerms.includes('declare'));
 const jobTerms = queryTerms('I got fired without notice');
 assert.ok(jobTerms.includes('termination'));
 assert.ok(jobTerms.includes('severance'));
});
test('empty lexical queries yield finite deterministic scores',()=>{
 const ranked=rankLexically(seeds,[]);assert.ok(ranked.every(r=>r.lexicalScore===0));
});
test('intent boundaries avoid parent/rent and social-insurance/health collisions',()=>{
 assert.deepEqual(parse({question:'A parent in Toronto'}).intents,[]);
 assert.deepEqual(parse({question:'Social Insurance Number'}).intents,['sin']);
});
test('all selected claims retain citations even behind multiple unavailable matches',()=>{
 const base=seeds[0],docs=[0,1,2,3].map(i=>({...base,id:`pending-${i}`,status:'pending',title:'SIN SIN SIN application'}));
 docs.push({...base,id:'available',title:'Federal identity guide'});
 const r=answer({question:'SIN application'},docs,now);
 assert.equal(r.claims.length,1);assert.ok(r.sources.some(s=>s.id==='available'));
});
test('frozen English development regression set passes with explicit measurement limits',()=>{
 const set=JSON.parse(readFileSync(new URL('../evaluation/english-pilot.json',import.meta.url),'utf8'));
 const report=evaluate(set,seeds);assert.deepEqual(report.failures,[]);assert.equal(report.citationLinkCompleteness,1);assert.match(report.limitations,/Not production accuracy/);
});
