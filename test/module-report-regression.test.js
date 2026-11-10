import test from 'node:test';
import assert from 'node:assert/strict';
import { answer, parse } from '../src/engine.js';
import { seeds } from '../src/knowledge.js';
import { detectUrgentHelp } from '../src/urgent-help.js';
import { assertEnglishRecord } from '../src/language.js';
const now = new Date('2026-10-28T12:00:00Z');
test('specific questions reject unrelated same-topic records', () => {
  const base = seeds.find(r => r.topic === 'transit');
  const record = { ...base, id: 'us-tax-fixture', jurisdiction: 'United States', title: 'Transit tax benefit', summary: 'Employers may provide transit tax benefits.', quote: 'Employers may provide transit tax benefits.', status: 'research_seed', checkedAt: '2026-10-28', expiresAt: '2027-01-01' };
  assert.equal(answer({ question: 'Which documents are normally needed for student transit fares in Miami, United States?' }, [record], now).claims.length, 0);
  const business = answer({ question: 'Is business registration handled by a federal or provincial authority in Canada?' }, seeds, now);
  assert.ok(business.claims.every(c => /business|corporat|entrepreneur/i.test(c.text)));
  assert.ok(!business.parsed.missingSlots.includes('location'));
});
test('national SIN questions do not require a city', () => {
  assert.ok(!parse({ question: 'What does SIN application mean in Canada?' }).missingSlots.includes('location'));
});

test('library membership, emergency shelter, and wage theft reject unrelated records', () => {
 const base={...seeds.find(record=>record.topic==='community'),jurisdiction:'Toronto',status:'research_seed',risk:'low',checkedAt:'2026-10-28',expiresAt:'2027-01-01'};
 const cases=[
  {question:'Who can use library membership services in Toronto?',topic:'community',bad:'Community legal services in Toronto',good:'Library membership and library cards in Toronto'},
  {question:'Who can use emergency family shelter services in Toronto?',topic:'family',bad:'School registration and child care services in Toronto',good:'Emergency family shelter services in Toronto'},
  {question:'Where can I find official information about wage theft in Toronto?',topic:'employment',bad:'Foreign credential recognition and finding employment in Toronto',good:'Employment standards claims for unpaid wages and wage theft in Toronto'}
 ];
 for(const {question,topic,bad,good} of cases) {
  const unrelated={...base,topic,risk:'high',status:'approved',id:'unrelated-fixture',title:bad,summary:bad};
  const relevant={...base,topic,risk:'high',status:'approved',id:'relevant-fixture',title:good,summary:good};
  assertEnglishRecord(unrelated);
  assertEnglishRecord(relevant);
  assert.deepEqual(answer({question},[unrelated],now).claims,[],question);
  const result=answer({question},[unrelated,relevant],now);
  assert.deepEqual(result.claims.map(claim=>claim.evidenceId),['relevant-fixture'],question);
  assert.ok(result.sources.every(source=>source.id==='relevant-fixture'),question);
 }
});

test('legal aid and legal clinics retrieve legal evidence without medical or generic settlement records', () => {
 const base={...seeds.find(record=>record.topic==='community'),jurisdiction:'ON',status:'research_seed',risk:'low',checkedAt:'2026-10-28',expiresAt:'2027-01-01'};
 const records=[
  {...base,id:'legal-fixture',title:'Legal aid and community legal clinics',summary:'Find legal aid and community legal clinics in Toronto.'},
  {...base,id:'directory-fixture',title:'Community services directory',summary:'Find community services in Toronto.'},
  {...base,id:'medical-fixture',topic:'health',risk:'high',status:'approved',title:'Community health clinics',summary:'Find medical clinics and health services in Toronto.'}
 ];
 records.forEach(assertEnglishRecord);
 for(const question of ['Where can I get legal aid in Toronto?','How can I find a community legal clinic in Toronto?']) {
  const result=answer({question},records,now);
  assert.ok(result.parsed.intents.includes('community'));
  assert.ok(!result.parsed.intents.includes('health'));
  assert.deepEqual(result.claims.map(claim=>claim.evidenceId),['legal-fixture']);
  assert.ok(result.sources.every(source=>source.id==='legal-fixture'));
  assert.deepEqual(answer({question},records.slice(1),now).claims,[]);
 }
 assert.ok(parse({question:'Find a medical clinic in Toronto'}).intents.includes('health'));
 assert.ok(parse({question:'Find a legal clinic and a medical clinic in Toronto'}).intents.includes('health'));
});

test('language classes route to community without generic library answers or a French destination', () => {
 const base={...seeds.find(record=>record.topic==='community'),jurisdiction:'Toronto',status:'research_seed',risk:'low',checkedAt:'2026-10-28',expiresAt:'2027-01-01'};
 const generic={...base,id:'library-fixture',title:'Toronto library services',summary:'Find general library services in Toronto.'};
 for(const language of ['language','English','French']) {
  const question=`Where can I find ${language} classes in Toronto?`;
  const parsed=parse({question});
  assert.ok(parsed.intents.includes('community'));
  assert.equal(parsed.country,'CA');
  assert.ok(!parsed.missingSlots.includes('location'));
  assert.deepEqual(answer({question},[generic],now).claims,[]);
  const relevant={...base,id:'classes-fixture',title:`${language} classes in Toronto`,summary:`Find ${language} classes and language training in Toronto.`};
  const result=answer({question},[generic,relevant],now);
  assert.ok(result.claims.some(claim=>claim.evidenceId===relevant.id));
  assert.ok(result.sources.every(source=>source.id!==generic.id));
 }
 assert.equal(parse({question:'Where can I find language classes in France?'}).country,'France');
 assert.equal(parse({question:'How do I apply for French citizenship?'}).country,'France');
});
test('urgent assistance survives unavailable evidence and respects country', () => {
  const question = 'My agent stopped responding after taking cash without receipt, visa expires tomorrow, help!';
  assert.equal(answer({ question }, [], now).urgentHelp.kind, 'representative_fraud');
  assert.equal(detectUrgentHelp('Where can I get emergency medical treatment without insurance?', 'CA').kind, 'medical_emergency');
  assert.deepEqual(detectUrgentHelp(question, null).contacts, []);
  assert.ok(!detectUrgentHelp(question, 'Germany').contacts.some(c => c.phone === '211'));
});

test('explicit foreign destinations take precedence over Canadian programme acronyms', () => {
 for (const [question,country] of [
  ['Where can I find official information about LMIA process in United States?', 'United States'],
  ['What does CRA account access mean in New Zealand?', 'New Zealand'],
  ['What does SIN application mean in Australia?', 'Australia'],
  ['What does LMIA process mean in United Arab Emirates?', 'United Arab Emirates']
 ]) {
  const result=answer({question},seeds,now);
  assert.equal(result.parsed.country,country);
  assert.ok(result.sources.every(source=>source.jurisdiction!=='CA'));
 }
 assert.equal(parse({question:'How do I get an LMIA in Canada?'}).country,'CA');
 assert.equal(parse({question:'Moving from Germany to Toronto, how do I apply for a SIN?'}).country,'CA');
});

test('Miami alone resolves to the United States and Florida', () => {
 const parsed=parse({question:'Student transit fares in Miami'});
 assert.equal(parsed.country,'United States');
 assert.equal(parsed.city,'Miami');
 assert.equal(parsed.region,'Florida');
});

test('business registration excludes incidental mentions of business and retains registration evidence', () => {
 const base={...seeds.find(record=>record.topic==='community'),jurisdiction:'CA',status:'research_seed',risk:'low',checkedAt:'2026-10-28',expiresAt:'2027-01-01'};
 const unrelated=[
  {...base,id:'lmia-fixture',title:'Employer compliance',summary:'Employers must remain engaged in the same business and follow federal and provincial employment laws.'},
  {...base,id:'remote-fixture',title:'What is work?',summary:'Self-employment may involve competitive business activity in the labour market.'}
 ];
 const question='Is business registration handled by a federal or provincial authority in Canada?';
 const rejected=answer({question},unrelated,now);
 assert.deepEqual(rejected.claims,[]);
 assert.deepEqual(rejected.sources,[]);
 assert.ok(!rejected.parsed.missingSlots.includes('location'));
 const relevant={...base,id:'registration-fixture',title:'Business registration',summary:'Business registration information describes federal incorporation and provincial business name registration.'};
 const accepted=answer({question},[...unrelated,relevant],now);
 assert.ok(accepted.claims.some(claim=>claim.evidenceId==='registration-fixture'));
 assert.ok(accepted.sources.every(source=>source.id==='registration-fixture'));
});

