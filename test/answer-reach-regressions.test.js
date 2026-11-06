// Questions the 2026-11-06 audit found going unanswered or answered with the
// wrong place's law.
import test from 'node:test';
import assert from 'node:assert/strict';
import {answer, parse} from '../src/engine.js';
import {deconstructNarrative} from '../src/narrative-deconstructor.js';
import {detectUrgentHelp} from '../src/urgent-help.js';
import {resolveGlobalSettlementItem} from '../src/global-settlement-resolver.js';

const NOW = new Date('2026-11-06T12:00:00Z');
const record = (id, topic, jurisdiction, summary, extra = {}) => ({
  id, topic, jurisdiction, title: summary, summary, quote: summary, url: `https://www.canada.ca/${id}`,
  checkedAt: '2026-10-01', expiresAt: '2027-10-01', risk: 'high', status: 'approved', language: 'en', ...extra
});
const records = [
  record('sin-apply', 'sin', 'CA', 'Apply for a Social Insurance Number through Service Canada with your identity documents.'),
  record('tax-first', 'money', 'CA', 'File your first tax return with the documents listed by the Canada Revenue Agency.'),
  record('on-licensing', 'employment', 'ON', 'Ontario regulated professions and licensing bodies.'),
  record('work-rules', 'employment', 'CA', 'Minimum hours of work experience for immigration programs.'),
  record('on-wage', 'employment', 'ON', 'The Ontario minimum wage is set under employment standards.', {status: 'pending'}),
  record('ohip', 'health', 'ON', 'Ontario Health Insurance Plan coverage for new residents.'),
  record('nz-tax', 'money', 'New Zealand', 'New Zealand tax residency information from Inland Revenue.')
];

test('a question matching the catalog text still gets reviewed evidence', () => {
  const question = resolveGlobalSettlementItem('GMS-Q00001').question;
  const result = answer({question}, records, NOW);
  assert.notEqual(result.parsed.parserVersion, 'direct-resolver');
  assert.ok(result.claims.some(claim => claim.evidenceId === 'sin-apply'));
  assert.equal(result.status, 'partial', 'the catalog entry itself stays unreviewed');
});

test('an explicit catalog id still returns only that unreviewed entry', () => {
  const result = answer({question: 'What does SIN application mean in Canada?', gmsId: 'GMS-Q00001'}, records, NOW);
  assert.equal(result.parsed.parserVersion, 'direct-resolver');
  assert.deepEqual(result.claims, []);
  assert.equal(result.status, 'unavailable');
});

test('a catalog question about another country never gets Canadian evidence', () => {
  const result = answer({question: 'Where can I find official information about CRA account access in New Zealand?'}, records, NOW);
  assert.deepEqual(result.claims, []);
});

test('ordinary words are not read as region codes', () => {
  for (const question of ['Can my landlord raise the rent on me?', 'I work on weekends and want overtime', 'Where can I park on the street?']) {
    assert.equal(parse({question}).region, null, question);
    assert.equal(deconstructNarrative(question).slots.location.region, null, question);
  }
  assert.equal(answer({question: 'Can my landlord raise the rent on me?'}, records, NOW).status, 'clarification');
  assert.equal(parse({question: 'What does the Act say about rent in Australia?'}).region, null);
  assert.equal(deconstructNarrative('Please help us with our lease').slots.location.country, null);
});

test('written province codes and full names still resolve', () => {
  assert.equal(parse({question: 'Can my landlord evict me in ON?'}).region, 'ON');
  assert.equal(parse({question: 'can my landlord evict me in ontario?'}).region, 'ON');
  assert.equal(deconstructNarrative('Rent rules in Ontario').slots.location.region, 'Ontario');
  assert.equal(deconstructNarrative('Rent rules for Kingston, ON').slots.location.region, 'Ontario');
  assert.equal(deconstructNarrative('Moving to the US next year').slots.location.country, 'United States');
});

test('a province-only programme does not trigger a city question', () => {
  const result = answer({question: 'Do I get OHIP right away?'}, records, NOW);
  assert.equal(result.parsed.region, 'ON');
  assert.deepEqual(result.claims.map(claim => claim.evidenceId), ['ohip']);
  assert.equal(parse({question: 'How do I enrol in MSP?'}).region, 'BC');
});

test('a record matching only the place or a filler word is not an answer', () => {
  const result = answer({question: 'What is the minimum wage in Ontario?'}, records, NOW);
  assert.deepEqual(result.claims, []);
  assert.equal(result.status, 'unavailable');
  assert.ok(result.gaps.some(gap => gap.reason === 'awaiting_human_review'), 'the withheld wage record explains the gap');
  assert.ok(!result.sources.some(source => source.id === 'on-licensing'));
});

test('emergencies get contacts even with no evidence or location', () => {
  const cases = [
    ['My employer withheld my passport and threatens me with deportation', 'document_withholding', '1-833-900-1010'],
    ['Landlord locked me out in the cold without notice', 'housing_emergency', '211'],
    ['Agent stopped responding after taking my money, visa expires tomorrow', 'representative_fraud', '211'],
    ['My husband hits me and says he will cancel my sponsorship', 'immediate_danger', '911'],
    ['I want to kill myself', 'self_harm', '988']
  ];
  for (const [question, kind, phone] of cases) {
    const help = answer({question}, [], NOW).urgentHelp;
    assert.equal(help?.kind, kind, question);
    assert.ok(help.contacts.some(contact => contact.phone === phone), question);
    assert.equal(help.helpView, 'sos');
  }
  const lockedOut = answer({question: 'My landlord locked me out and I cannot get in'}, [], NOW);
  assert.equal(lockedOut.status, 'clarification');
  assert.equal(lockedOut.urgentHelp.kind, 'housing_emergency');
});

test('routine questions get no urgent card and other countries get their own number', () => {
  for (const question of ['How do I apply for a SIN?', 'What is the rent increase limit in Ontario?', 'How do I get a passport photo?']) {
    assert.equal(answer({question}, records, NOW).urgentHelp, undefined, question);
  }
  const help = detectUrgentHelp('Someone hits me at home', 'United Kingdom');
  assert.deepEqual(help.contacts.map(contact => contact.phone), ['999']);
  assert.equal(help.helpView, null);
  assert.deepEqual(detectUrgentHelp('Someone hits me at home', 'Atlantis').contacts, []);
});
