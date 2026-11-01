import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateNbpnpSkilledWorker,
  calculateNbpnpSettlementFunds
} from '../src/new-brunswick-provincial-nominee-skilled-worker-navigator.js';

test('NBPNP Skilled Worker - Eligible Candidate with 72 Points', () => {
  const result = evaluateNbpnpSkilledWorker({
    applicantAge: 28, // 10 pts
    targetNocTeer: 2,
    firstLanguageClb: 8, // 20 pts
    hasSecondOfficialLanguageClb5Plus: false,
    educationLevel: 'BACHELORS', // 18 pts
    yearsOfRelatedExperience: 4, // 16 pts
    hasPermanentFullTimeJobOfferInNb: true, // 10 pts
    employerOperatedTwoYearsInNb: true,
    jobOfferWageMeetsMedian: true,
    currentlyWorkingInNb: true,
    liquidFundsCad: 5000,
    familySize: 1,
    intendsToResideInNb: true
  });

  // Points: 10 + 20 + 18 + 16 + 10 = 74 pts
  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_NBPNP_SKILLED_WORKER_NOMINATION');
  assert.equal(result.pointsSummary.totalPoints, 74);
  assert.equal(result.pointsSummary.isPassMarkSatisfied, true);
  assert.equal(result.disqualifications.length, 0);
  assert.equal(result.settlementFundsAudit.isExemptDueToCurrentNbEmployment, true);
});

test('NBPNP Skilled Worker - Disqualified due to Age Over 55 and Points Under 60', () => {
  const result = evaluateNbpnpSkilledWorker({
    applicantAge: 58, // > 55 disqualified
    targetNocTeer: 1,
    firstLanguageClb: 5, // 8 pts
    educationLevel: 'HIGH_SCHOOL', // 10 pts
    yearsOfRelatedExperience: 2, // 12 pts
    hasPermanentFullTimeJobOfferInNb: true, // 10 pts
    employerOperatedTwoYearsInNb: true,
    jobOfferWageMeetsMedian: true,
    currentlyWorkingInNb: false,
    liquidFundsCad: 15000,
    familySize: 1,
    intendsToResideInNb: true
  });

  // Total points: 0 + 8 + 10 + 12 + 10 = 40 (under 60)
  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'AGE_INELIGIBILITY'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'POINTS_GRID_DEFICIENCY'));
});

test('NBPNP Skilled Worker - Language Threshold Breach (CLB 4 for TEER 2)', () => {
  const result = evaluateNbpnpSkilledWorker({
    applicantAge: 30, // 10 pts
    targetNocTeer: 2, // Requires CLB 5 min
    firstLanguageClb: 4, // 0 pts for TEER 2 & breach
    educationLevel: 'BACHELORS', // 18 pts
    yearsOfRelatedExperience: 5, // 16 pts
    hasPermanentFullTimeJobOfferInNb: true, // 10 pts
    employerOperatedTwoYearsInNb: true,
    jobOfferWageMeetsMedian: true,
    currentlyWorkingInNb: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'LANGUAGE_THRESHOLD_BREACH'));
});

test('NBPNP Skilled Worker - Ineligible due to Employer operating under 2 years and sub-median wage', () => {
  const result = evaluateNbpnpSkilledWorker({
    applicantAge: 32,
    targetNocTeer: 1,
    firstLanguageClb: 7,
    educationLevel: 'MASTERS_OR_PHD',
    yearsOfRelatedExperience: 6,
    hasPermanentFullTimeJobOfferInNb: true,
    employerOperatedTwoYearsInNb: false,
    jobOfferWageMeetsMedian: false,
    currentlyWorkingInNb: false,
    liquidFundsCad: 20000,
    familySize: 1
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'EMPLOYER_TENURE_DEFICIENCY'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'SUB_MEDIAN_WAGE_RATE'));
});

test('NBPNP Skilled Worker - Settlement Funds Verification', () => {
  assert.equal(calculateNbpnpSettlementFunds(1), 15263);
  assert.equal(calculateNbpnpSettlementFunds(3), 23360);
  assert.equal(calculateNbpnpSettlementFunds(7), 40392);
  assert.equal(calculateNbpnpSettlementFunds(9), 40392 + 2 * 4112);
});
