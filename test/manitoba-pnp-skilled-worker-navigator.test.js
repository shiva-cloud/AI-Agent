import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateManitobaPnpSkilledWorker, MPNP_CONSTANTS } from '../src/manitoba-pnp-skilled-worker-navigator.js';

test('MPNP Skilled Worker Navigator — Constants match Manitoba criteria', () => {
  assert.equal(MPNP_CONSTANTS.MIN_MANITOBA_WORK_MONTHS_LOCAL_GRAD, 6);
  assert.equal(MPNP_CONSTANTS.MIN_MANITOBA_WORK_MONTHS_OUT_OF_PROVINCE_GRAD, 12);
  assert.equal(MPNP_CONSTANTS.MANITOBA_WORK_CONNECTION_POINTS, 500);
  assert.equal(MPNP_CONSTANTS.MANITOBA_SUPPORTER_POINTS, 200);
  assert.equal(MPNP_CONSTANTS.OUT_OF_PROVINCE_STUDY_PENALTY_POINTS, -100);
});

test('MPNP Skilled Worker Navigator — Worker with 8 months experience scores high EOI points', () => {
  const result = evaluateManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 8,
    isOutOfProvinceGraduate: false,
    hasPermanentManitobaJobOffer: true,
    firstLanguageClb: 7,
    candidateAge: 29,
    totalYearsOfWorkExperience: 4,
    highestEducationLevel: 'bachelors_degree',
    isJobLocatedOutsideWinnipeg: true
  });

  assert.equal(result.isStreamEligible, true);
  assert.equal(result.streamVerdict, 'QUALIFIES_FOR_SKILLED_WORKER_IN_MANITOBA');
  // Lang: 110, Age: 75, Exp: 75 + 100 = 175, Edu: 110, Adapt: 500 + 50 = 550. Total = 1020
  assert.equal(result.eoiScoreSummary.pointsAdaptability, 550);
  assert.equal(result.eoiScoreSummary.totalEoiPoints, 1020);
});

test('MPNP Skilled Worker Navigator — Out of province graduate requires 12 months in Manitoba', () => {
  const result = evaluateManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 8,
    isOutOfProvinceGraduate: true,
    hasPermanentManitobaJobOffer: true
  });

  assert.equal(result.isStreamEligible, false);
  assert.equal(result.employmentAudit.requiredMonths, 12);
  assert.ok(result.riskWarnings.some(r => r.includes('Employment Duration Shortfall')));
});

test('MPNP Skilled Worker Navigator — Applies -100 point risk deduction for out of province study', () => {
  const result = evaluateManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 14,
    isOutOfProvinceGraduate: true,
    hasPastStudyInAnotherProvince: true,
    hasPastWorkInAnotherProvince: true
  });

  assert.equal(result.eoiScoreSummary.riskDeductions, -200);
  assert.ok(result.riskWarnings.some(r => r.includes('Risk Deduction (-100 pts)')));
});

test('MPNP Skilled Worker Navigator — Awards 200 points for close family supporter when not working in MB', () => {
  const result = evaluateManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 0,
    hasCloseFamilySupporterInManitoba: true,
    isJobLocatedOutsideWinnipeg: false
  });

  assert.equal(result.eoiScoreSummary.pointsAdaptability, 200);
});
