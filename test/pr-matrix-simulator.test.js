import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePrMatrix } from '../src/pr-matrix-simulator.js';

test('PR Matrix Simulator — Evaluates competitive tech worker profile across corridors', () => {
  const result = evaluatePrMatrix({
    age: 28,
    educationLevel: 'masters',
    yearsExperience: 4,
    englishLanguageScore: 9,
    hasJobOffer: false,
    hasSecondaryLanguage: true,
    targetCorridors: ['CA', 'AU', 'DE', 'UK', 'NZ']
  });

  assert.ok(result.applicantProfile);
  assert.equal(result.evaluations.length, 5);
  assert.ok(result.topRecommendedCorridor);
  
  // Canada should have high score due to French + CLB 9 + Master's
  const ca = result.evaluations.find(e => e.corridor === 'CA');
  assert.ok(ca);
  assert.ok(ca.estimatedScore >= 490);
  assert.equal(ca.competitivenessTier, 'HIGH_COMPETITIVENESS');
  assert.ok(ca.statutoryLegalBasis.includes('IRPA'));

  // Australia should score 85+ points
  const au = result.evaluations.find(e => e.corridor === 'AU');
  assert.ok(au);
  assert.ok(au.estimatedScore >= 80);

  // Germany Chancenkarte should qualify with 6+ points
  const de = result.evaluations.find(e => e.corridor === 'DE');
  assert.ok(de);
  assert.ok(de.estimatedScore >= 6);

  // UK with Master's and 4 yrs tech experience qualifies for Global Talent route
  const uk = result.evaluations.find(e => e.corridor === 'UK');
  assert.ok(uk);
  assert.equal(uk.competitivenessTier, 'HIGH_COMPETITIVENESS');
  assert.ok(uk.primaryPathway.includes('Global Talent'));
});

test('PR Matrix Simulator — Evaluates applicant with job offer in Germany', () => {
  const result = evaluatePrMatrix({
    age: 32,
    educationLevel: 'bachelors',
    yearsExperience: 5,
    englishLanguageScore: 8,
    hasJobOffer: true,
    targetCorridors: ['DE']
  });

  const de = result.evaluations.find(e => e.corridor === 'DE');
  assert.ok(de);
  assert.equal(de.competitivenessTier, 'HIGH_COMPETITIVENESS');
  assert.equal(de.estimatedMonthsToPr, 21);
  assert.ok(de.primaryPathway.includes('EU Blue Card'));
});
