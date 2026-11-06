// Published records about life in a country outside the destination corridors
// answer questions about that country, labelled, and never anything else.
import test from 'node:test';
import assert from 'node:assert/strict';
import {answer, parse} from '../src/engine.js';
import {namedReferenceCountry} from '../src/reference-countries.js';
import {composePresentation} from '../src/answer-composer.js';
import {resolveGlobalSettlementItem} from '../src/global-settlement-resolver.js';

const NOW = new Date('2026-11-06T12:00:00Z');
const record = (id, topic, jurisdiction, summary) => ({
  id, topic, jurisdiction, title: summary, summary, quote: summary, url: `https://example.gov/${id}`,
  checkedAt: '2026-10-01', expiresAt: '2027-10-01', risk: 'high', status: 'approved', language: 'en'
});
const records = [
  record('poland-tax', 'money', 'Poland', 'Personal income tax in Poland is administered by the National Revenue Administration.'),
  record('poland-settlement-services', 'community', 'Poland', 'Newcomers moving from Poland to Canada can use free settlement services.'),
  record('papua-tax', 'money', 'Papua New Guinea', 'Income tax in Papua New Guinea is collected by the Internal Revenue Commission.'),
  record('guinea-tax', 'money', 'Guinea', 'Income tax in Guinea is collected by the national tax office.'),
  record('georgia-tax', 'money', 'Georgia', 'Income tax in Georgia is collected by the Revenue Service.'),
  record('cra-tax', 'money', 'CA', 'File your income tax return with the Canada Revenue Agency.'),
  record('expired-tax', 'money', 'Norway', 'Income tax in Norway is collected by the Tax Administration.')
];
records.at(-1).expiresAt = '2026-01-01';

test('a published record answers a question about that country, labelled as limited', () => {
  const result = answer({question: 'How do I pay income tax in Poland?'}, records, NOW);
  assert.equal(result.status, 'partial');
  assert.equal(result.parsed.country, 'Poland');
  assert.deepEqual(result.claims.map(claim => claim.evidenceId), ['poland-tax']);
  assert.equal(result.referenceCoverage.country, 'Poland');
  assert.ok(result.gaps.some(gap => gap.reason === 'limited_country_coverage'));
  assert.equal(result.clarification, null);
  assert.ok(result.sources.every(source => source.jurisdiction === 'Poland'));
});

test('city, country wording counts; another topic keeps the not-covered answer', () => {
  assert.equal(answer({question: 'How do I pay income tax while living in Warsaw, Poland?'}, records, NOW).referenceCoverage?.country, 'Poland');
  const rent = answer({question: 'Can my landlord raise my rent in Poland?'}, records, NOW);
  assert.equal(rent.status, 'clarification');
  assert.deepEqual(rent.claims, []);
  assert.equal(rent.referenceCoverage, undefined);
  assert.match(rent.clarification, /Poland/);
});

test('a record on another subject in the same broad topic is not an answer', () => {
  const deposit = answer({question: 'How do I get my bank deposit back in Poland?'}, records, NOW);
  assert.deepEqual(deposit.claims, []);
  assert.equal(deposit.status, 'clarification');
  const withOtherSubjects = [
    record('poland-health', 'health', 'Poland', 'Public medical care in Poland is funded by the National Health Fund.'),
    record('poland-licence', 'driving', 'Poland', 'Licence services in Poland are handled by local offices.'),
    ...records
  ];
  for (const question of ['Can you explain a medical inadmissibility review in Poland?', 'What regulated profession licence do I need in Poland?']) {
    assert.deepEqual(answer({question}, withOtherSubjects, NOW).claims, [], question);
  }
  assert.ok(answer({question: 'Can I see a doctor in Poland?'}, withOtherSubjects, NOW).referenceCoverage);
});

test('a leaving-for-Canada record never answers a question about living there', () => {
  const result = answer({question: 'What free settlement services can I use in Poland?'}, records, NOW);
  assert.deepEqual(result.claims, []);
  assert.equal(result.status, 'clarification');
});

test('a leaving-for-Canada record does not answer a corridor country question either', () => {
  const leaving = [record('germany-settlement-services', 'community', 'Germany', 'Newcomers moving from Germany to Canada can use free settlement services.')];
  assert.deepEqual(answer({question: 'Where can I find free newcomer services in Berlin, Germany?'}, leaving, NOW).claims, []);
  const origin = answer({question: "I'm moving from Germany to Canada. What free settlement services can I use?"}, leaving, NOW);
  assert.deepEqual(origin.claims.map(claim => claim.evidenceId), ['germany-settlement-services']);
});

test('a question with no recognised subject is not matched on its template words', () => {
  const unrelated = [record('de-visa', 'employment', 'Germany', 'A case assessment by the authority decides this visa.')];
  const result = answer({question: 'Design an auditable case assessment for elder abuse support in Berlin, Germany'}, unrelated, NOW);
  assert.deepEqual(result.parsed.intents, []);
  assert.deepEqual(result.claims, []);
});

test('a catalog question with no recognised subject skips the broad fallback', () => {
  // Same wording as a catalog entry; an unrelated record shares its place and filler words.
  const item = resolveGlobalSettlementItem('GMS-Q00006');
  const result = answer({question: item.question}, [record('ca-federal', 'community', 'CA', 'Federal authority services across Canada.')], NOW);
  if (!result.parsed.intents.length) assert.deepEqual(result.claims, []);
});

test('template words alone do not make a legal record relevant', () => {
  const template = [record('on-visa', 'employment', 'ON', 'An authority assessment of newcomer eligibility and status for a visa.')];
  assert.deepEqual(answer({question: 'What authority assessment applies to my employer dispute in Ontario?'}, template, NOW).claims, []);
});

test('the origin question keeps working, without the origin country tax record', () => {
  const settling = answer({question: "I'm moving from Poland to Canada. What free settlement services can I use?"}, records, NOW);
  assert.equal(settling.parsed.country, 'CA');
  assert.ok(settling.claims.some(claim => claim.evidenceId === 'poland-settlement-services'));
  const tax = answer({question: 'I am from Poland. How do I file my income tax return in Canada?'}, records, NOW);
  assert.equal(tax.parsed.country, 'CA');
  assert.equal(tax.referenceCoverage, undefined);
  assert.ok(tax.claims.some(claim => claim.evidenceId === 'cra-tax'));
  assert.ok(!tax.claims.some(claim => claim.evidenceId === 'poland-tax'));
  assert.ok(!tax.sources.some(source => source.id === 'poland-tax'));
});

test('expired or withheld records do not open a country', () => {
  const expired = answer({question: 'How do I pay income tax in Norway?'}, records, NOW);
  assert.deepEqual(expired.claims, []);
  assert.equal(expired.status, 'clarification');
  const withheld = answer({question: 'How do I pay income tax in Poland?'}, records.map(r => ({...r, status: r.status === 'approved' ? 'pending' : r.status})), NOW);
  assert.deepEqual(withheld.claims, []);
  assert.equal(withheld.status, 'clarification');
});

test('names are matched as places, whole and unambiguously', () => {
  const name = question => namedReferenceCountry(question, parse({question}), records);
  assert.equal(name('Income tax in Papua New Guinea'), 'Papua New Guinea');
  assert.equal(name('Income tax in Guinea'), 'Guinea');
  assert.equal(name('Income tax in Georgia'), null, 'also a US state');
  assert.equal(name('I am from Poland, how does income tax work?'), null, 'where someone comes from');
  assert.equal(name('Income tax in Poland or in Guinea'), null, 'two countries');
  assert.equal(name('How do I send money to Poland?'), null);
});

test('a place in Canada or a chosen city wins over the named country', () => {
  const canadian = answer({question: 'My mother lives in Poland. How do I file my income tax return in Canada?'}, records, NOW);
  assert.equal(canadian.parsed.country, 'CA');
  assert.ok(!canadian.claims.some(claim => claim.evidenceId === 'poland-tax'));
  const chosen = answer({question: 'How do I pay income tax in Poland?', city: 'Toronto'}, records, NOW);
  assert.equal(chosen.referenceCoverage, undefined);
  assert.ok(!chosen.claims.some(claim => claim.evidenceId === 'poland-tax'));
});

test('limited-coverage answers suggest no Canadian tools', () => {
  const result = answer({question: 'How much rent deposit and income tax do I pay in Poland?'}, records, NOW);
  assert.equal(result.referenceCoverage?.country, 'Poland');
  assert.deepEqual(composePresentation(result).suggestedTools, []);
});

test('an emergency placed abroad never gets Canadian numbers', () => {
  const manila = answer({question: 'I moved to Manila, Philippines and my employer took my passport and is threatening me'}, [], NOW);
  assert.ok(manila.urgentHelp, 'still flagged as urgent');
  assert.deepEqual(manila.urgentHelp.contacts, []);
  assert.equal(manila.urgentHelp.helpView, null);
  const halifax = answer({question: 'My landlord locked me out of my apartment in Halifax'}, [], NOW);
  assert.ok(halifax.urgentHelp.contacts.some(contact => contact.phone === '911'), 'a Canadian city outside the pilot is still Canada');
});
