// A record in the right topic is not yet an answer: it has to be about what was asked.
import test from 'node:test';
import assert from 'node:assert/strict';
import {answer, parse} from '../src/engine.js';

const NOW = new Date('2026-11-06T12:00:00Z');
const record = (id, topic, jurisdiction, summary, extra = {}) => ({
  id, topic, jurisdiction, title: summary, summary, quote: summary, url: `https://example.gov/${id}`,
  checkedAt: '2026-10-01', expiresAt: '2027-10-01', risk: 'high', status: 'approved', language: 'en', ...extra
});
const ids = result => result.claims.map(claim => claim.evidenceId);

test('a weak record does not stand in when the record that fits awaits review', () => {
  const records = [
    record('on-sublet', 'housing', 'ON', 'Tenants in Ontario may sublet or assign an apartment with the landlord consent rules.', {status: 'pending'}),
    record('on-rent', 'housing', 'ON', 'The rent increase guideline applies to an apartment in Ontario.')
  ];
  const result = answer({question: 'Can I sublet my apartment in Ontario?'}, records, NOW);
  assert.deepEqual(ids(result), []);
  assert.ok(result.gaps.some(gap => gap.reason === 'awaiting_human_review'));
  assert.equal(result.status, 'unavailable');
});

test('a second record far weaker than the first is left out', () => {
  const records = [
    record('ccb', 'money', 'CA', 'Apply for the Canada Child Benefit: the child benefit application and child benefit payments for a child.'),
    record('tax', 'money', 'CA', 'Newcomers to Canada file a tax return to apply.')
  ];
  assert.deepEqual(ids(answer({question: 'How do I apply for the Canada Child Benefit?'}, records, NOW)), ['ccb']);
});

test('a comparable second record stays', () => {
  const records = [
    record('a', 'money', 'CA', 'Open a bank account in Canada as a newcomer.'),
    record('b', 'money', 'CA', 'A newcomer can open a basic bank account in Canada with identification.')
  ];
  assert.deepEqual(ids(answer({question: 'How do I open a bank account as a newcomer in Canada?'}, records, NOW)).sort(), ['a', 'b']);
});

test('a rejected record does not push out a usable one', () => {
  const records = [
    record('bad', 'housing', 'ON', 'Rent deposit rules for a rent deposit on a rent deposit in Ontario.', {status: 'rejected'}),
    record('good', 'housing', 'ON', 'A landlord in Ontario may collect a rent deposit.')
  ];
  assert.deepEqual(ids(answer({question: 'Can my landlord ask for a rent deposit in Ontario?'}, records, NOW)), ['good']);
});

test('a named subject has to appear in the record', () => {
  const records = [
    record('deduct', 'employment', 'ON', 'An employer in Ontario cannot make unlawful wage deductions.'),
    record('holiday', 'employment', 'BC', 'Public holiday pay rules for an employer in British Columbia.')
  ];
  assert.deepEqual(ids(answer({question: 'Can my employer make me work on a statutory holiday in Ontario?'}, records, NOW)), []);
  assert.deepEqual(ids(answer({question: 'Can my employer make me work on a statutory holiday in British Columbia?'}, records, NOW)), ['holiday']);
});

test('everyday pay and visa words reach the employment topic', () => {
  for (const question of ['Do I get paid overtime in Toronto?', 'My employer has not paid my last paycheques in Toronto', 'How do I get a Blue Card in Germany?', 'How do I get a Golden Visa in the UAE?']) {
    assert.ok(parse({question}).intents.includes('employment'), question);
  }
});

test('the topic with the strongest match leads', () => {
  const records = [
    record('directory', 'community', 'CA', 'A newcomer directory of services across Canada.'),
    record('bank', 'money', 'CA', 'Open a bank account in Canada: bank account rules and bank account documents.')
  ];
  const result = answer({question: 'How do I open a bank account as a newcomer in Canada?'}, records, NOW);
  assert.equal(result.claims[0].evidenceId, 'bank');
});

test('transit and directory pointers keep working without sharing the words', () => {
  const records = [record('planner', 'transit', 'Vancouver', 'TransLink trip planner.', {risk: 'low'})];
  assert.deepEqual(ids(answer({question: 'How do I plan a bus journey in Vancouver?'}, records, NOW)), ['planner']);
});
