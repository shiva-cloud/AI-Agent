import test from 'node:test';
import assert from 'node:assert/strict';
import { answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';
import { assertEnglishRecord } from '../src/language.js';

const now = new Date('2026-11-07T12:00:00Z');
const record = (id, topic, text) => ({
  id, topic, jurisdiction: 'CA', title: text, summary: text, quote: text,
  url: `https://example.org/${id}`, language: 'en', risk: 'high', status: 'approved',
  checkedAt: '2026-11-01', expiresAt: '2027-01-01',
  ...(topic === 'telecom' ? { telecomSubject: 'complaint' } : {})
});

const cases = [
  ['Immigration', 'residency obligation', 'employment', 'Dual intent when applying for temporary and permanent residence'],
  ['Settlement', 'monthly newcomer budget', 'community', 'Newcomer settlement services and eligibility'],
  ['Identity', 'tax identification number', 'money', 'Tax residency and foreign income reporting'],
  ['Housing', 'rental deposit fraud', 'housing', 'Rent deposits and last month rent rules'],
  ['Employment', 'employer retaliation', 'employment', 'Employer duties and independent contractor classification'],
  ['Healthcare', 'family doctor registration', 'health', 'Family health insurance coverage and benefits'],
  ['Finance', 'foreign tax credits', 'money', 'Foreign income and tax residency'],
  ['Driving', 'used vehicle purchase', 'driving', 'Vehicle licence renewal and driving tests'],
  ['Family', 'family reunification', 'family', 'Family school registration and child care'],
  ['Telecom', 'internet billing dispute', 'telecom', 'Internet plan prices and availability']
];

for (const [module, subject, topic, unrelatedText] of cases) {
  test(`${module}: explicit subject cannot be answered with generic same-topic evidence`, () => {
    const question = `Where can I find official information about ${subject} in Toronto?`;
    const unrelated = record('unrelated', topic, `${unrelatedText}. Official information, eligibility and services in Toronto.`);
    const relevant = record('relevant', topic, `Information about ${subject} in Toronto.`);
    [unrelated, relevant].forEach(assertEnglishRecord);
    assert.deepEqual(answer({ question }, [unrelated], now).claims, []);
    const result = answer({ question }, [unrelated, relevant], now);
    assert.deepEqual(result.claims.map(claim => claim.evidenceId), ['relevant']);
    assert.ok(result.sources.every(source => source.id === 'relevant'));
    const pending = answer({ question }, [unrelated, { ...relevant, status: 'pending' }], now);
    assert.deepEqual(pending.claims, [], 'a withheld relevant record must not cause unrelated fallback');
  });
}

test('explicit subject extraction excludes geography, persona, and requested analysis', () => {
  for (const question of [
    'What does rental deposit fraud mean in Canada?',
    'As a single parent, how do I deal with rental deposit fraud in Toronto?',
    'How would rental deposit fraud affect my work, housing, healthcare and tax obligations in Toronto?',
    'For rental deposit fraud in Toronto, compare outcomes before and after a policy effective date.',
    'What steps, fees, timelines and documents apply to rental deposit fraud in Toronto?',
    'Which verified local providers can assist a student with rental deposit fraud in Toronto?',
    'Design an auditable case assessment for rental deposit fraud in Toronto: a student has missing records.',
    'Build a decision tree for a student facing rental deposit fraud in Toronto.',
    'I am a student in Toronto; which conditions, exceptions and deadlines determine my options for rental deposit fraud?'
  ]) assert.equal(requestedSubject(question), 'rental deposit fraud');
});

test('subject matching keeps supported aliases and does not infer subjects from open narratives', () => {
  assert.ok(subjectEvidenceMatcher('What does SIN mean in Canada?')({ title: 'Social Insurance Number', summary: '' }));
  assert.ok(subjectEvidenceMatcher('Where can I find information about family doctor registration in Toronto?')({ title: 'Register with a GP', summary: '' }));
  assert.ok(subjectEvidenceMatcher('What does PGWP mean in Canada?')({ title: 'Post-graduation work permit', summary: '' }));
  assert.equal(requestedSubject('I need help finding a place to stay tonight.'), null);
  assert.ok(subjectEvidenceMatcher('I need help finding a place to stay tonight.')({ title: 'Emergency shelter', summary: '' }));
});

test('scattered words in a long record do not establish coverage of the subject', () => {
  const matches = subjectEvidenceMatcher('How do I start the process for employer specific permit in Toronto?');
  assert.equal(matches({ title: 'What is work?', summary: 'Wages are paid by an employer. Some visitors do not need a work permit. This does not decide whether a specific activity is work.' }), false);
  assert.equal(matches({ title: 'What is work? Remote work for an employer outside Canada', summary: 'Wages are paid by an employer. This record does not issue work permits or decide whether a specific activity is work.' }), false);
  assert.equal(matches({ title: 'Employer-specific work permits', summary: 'Requirements for an employer-specific permit.' }), true);
});

test('subject context in the title and ordinary paraphrases retain relevant evidence', () => {
  assert.equal(subjectEvidenceMatcher('Who can use language classes services in Toronto?')({
    title: 'Settlement services', summary: 'Eligible newcomers receive language training and community orientation.'
  }), true);
  assert.equal(subjectEvidenceMatcher('How do I start the process for foreign licence exchange in Toronto?')({
    title: 'Exchange an out-of-province driving licence', summary: 'You can use a valid licence from another province, state or country for the stated period.'
  }), true);
  assert.equal(subjectEvidenceMatcher('How do I start the process for foreign licence exchange in Toronto?')({
    title: 'Exchange an out-of-province driving licence', summary: 'This record concerns licences from other Canadian provinces only.'
  }), false);
  assert.equal(subjectEvidenceMatcher('Who can use language classes services in Toronto?')({
    title: 'Settlement services', summary: 'We provide employment training and language translation services.'
  }), false);
  assert.equal(subjectEvidenceMatcher('Before I submit anything about two countries claim tax residence in Hamburg, Germany?')({
    title: 'EU Foreign Tax Credits and Double Taxation Agreements', summary: 'Double taxation agreements prevent dual income taxation.'
  }), true);
  assert.equal(subjectEvidenceMatcher('What common misconceptions about pension portability after return migration should an elderly newcomer in Auckland, New Zealand avoid?')({
    title: 'Inland Revenue (IRD): Foreign rental income and FIF rules', summary: 'Tax residents must declare foreign rental income.'
  }), false);
  assert.equal(subjectEvidenceMatcher('Before I submit anything about interpreter is related to alleged abuser in British Columbia, Canada?')({
    title: 'IRCC: Citizenship by descent first-generation limit', summary: 'Canadian citizenship by descent rules.'
  }), false);
  assert.equal(subjectEvidenceMatcher('How do I get help with employer threats in Toronto?')({
    title: 'IRCC: Open work permit for vulnerable workers facing abuse (IRPR s. 207.1)', summary: 'Workers facing abuse or threats by an employer can apply for an open work permit.'
  }), true);
  assert.equal(subjectEvidenceMatcher('How do I fix a government portal error in Toronto?')({
    title: 'IRCC Webform Protocol for Online Application Portal Bugs and Technical Failures', summary: 'Report online application portal bugs and technical failures via IRCC webform.'
  }), true);
  assert.equal(subjectEvidenceMatcher('What are the rules on utility costs in Germany?')({
    title: 'BGB § 556: Annual utility bills (Nebenkosten)', summary: 'Landlords must settle utility bills within 12 months.'
  }), true);
  assert.equal(subjectEvidenceMatcher('Where do I request a police certificate in Toronto?')({
    title: 'Global Police Clearance Certificates', summary: 'Official police certificate and criminal record check requirements.'
  }), true);
});
