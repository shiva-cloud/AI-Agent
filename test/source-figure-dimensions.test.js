import test from 'node:test';
import assert from 'node:assert/strict';
import { missingFigures, verifyAgainstPage } from '../src/source-verifier.js';

test('figure verification rejects time units, currency jurisdictions, rates and range changes', () => {
  for (const [claim, evidence] of [
    ['30 days', '30 months'], ['30 days', '30 applicants'], ['30 business days', '30 calendar days'],
    ['$30 per hour', '$30 per year'], ['30%', '30'], ['CAD 30', 'USD 30'], ['30 CAD', '30 USD'],
    ['30-60 days', '30 days or 60 days'], ['30-60 days', '30-90 days; 60 applicants'],
    ['-30', '30'], ['−30', '30'], ['30 days', '30-year-old'], ['$30 CAD', '$30 USD'],
    ['30 percentage points', '30%'], ['at least 30 days', 'at most 30 days'], ['more than 30', 'at least 30']
  ]) {
    assert.ok(missingFigures(claim, evidence).length, `${claim} must not match ${evidence}`);
  }
});

test('equivalent formatting matches without converting different units or currency assumptions', () => {
  for (const [claim, evidence] of [
    ['$1,000.00', '$1000'], ['30 percent', '30%'], ['30 per cent', '30 percentage'],
    ['30 days', '30-day'], ['1 year', '1 years'], ['CAD 30', '30 CAD'], ['C$30', 'CAD 30'],
    ['US$30', 'USD 30'], ['£30', 'GBP 30'], ['30–60 days', '30 to 60 days'],
    ['$30/hour', '$30 per hour'], ['0.50', '0.5'], ['minimum 30 days', 'at least 30 days'], ['up to 30', 'maximum of 30']
  ]) assert.deepEqual(missingFigures(claim, evidence), [], `${claim} / ${evidence}`);
});

test('matching quote cannot approve a summary with the wrong duration unit', () => {
  const quote = 'You must submit all required supporting documents with your application.';
  const result = verifyAgainstPage({ quote, summary: 'The processing period is 30 days.' }, `${quote} The processing period is 30 weeks.`);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'summary_figure_not_on_page');
});
test('distance, mass and area claims cannot borrow unrelated numeric evidence', () => {
  for (const [summary, evidence] of [
    ['Move at least 40 kilometres', 'Move at least 40 miles'],
    ['Maximum 23 kg', 'Maximum 23 pounds'],
    ['Room is 100 square feet', 'Room is 100 square metres'],
    ['Distance 12 inches', 'Distance 12 feet'],
    ['Carry 5 kilograms', 'Carry 5 items']
  ]) assert.notDeepEqual(missingFigures(summary, evidence), []);
  for (const [summary, evidence] of [
    ['Move 40 kilometres', 'Move 40 km'], ['Carry 23 kilograms', 'Carry 23 kg'],
    ['Area 100 square meters', 'Area 100 square metres'], ['Weight 20 pounds', 'Weight 20 lbs']
  ]) assert.deepEqual(missingFigures(summary, evidence), []);
});
