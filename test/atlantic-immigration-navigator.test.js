import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AIP_CONSTANTS,
  evaluateAtlanticImmigrationEligibility
} from '../src/atlantic-immigration-navigator.js';

test('Atlantic Immigration Navigator — Constants reflect federal-provincial AIP agreements', () => {
  assert.deepEqual(AIP_CONSTANTS.ATLANTIC_PROVINCES, ['NB', 'NS', 'PE', 'NL']);
  assert.equal(AIP_CONSTANTS.MIN_GRADUATE_RESIDENCE_MONTHS, 16);
  assert.equal(AIP_CONSTANTS.MIN_CLB_TEER_0_1_2_3, 5);
  assert.equal(AIP_CONSTANTS.MIN_CLB_TEER_4, 4);
  assert.equal(AIP_CONSTANTS.LMIA_EXEMPTION_CODE, 'C18');
});

test('Atlantic Immigration Navigator — Qualifies Atlantic international graduate in Nova Scotia with zero prior work exp', () => {
  const result = evaluateAtlanticImmigrationEligibility({
    province: 'NS',
    stream: 'international_graduate',
    nocTeer: 1,
    clbLevel: 6,
    hasDesignatedEmployerJobOffer: true,
    isJobOfferFullTimeNonSeasonal: true,
    jobOfferDurationMonths: 12,
    hasAtlanticTwoYearCredential: true,
    monthsResidedInAtlanticDuringStudy: 18,
    familySize: 1,
    settlementFundsCad: 4000
  });

  assert.equal(result.overallEligible, true);
  assert.equal(result.deficiencies.length, 0);
  assert.match(result.summaryTitle, /Eligible for Atlantic Immigration Program/);
  assert.ok(result.compliancePoints.some(p => p.includes('EXEMPT from prior work experience')));
});

test('Atlantic Immigration Navigator — Flags residence shortfall for graduate (< 16 months in Atlantic province)', () => {
  const result = evaluateAtlanticImmigrationEligibility({
    province: 'NB',
    stream: 'international_graduate',
    hasAtlanticTwoYearCredential: true,
    monthsResidedInAtlanticDuringStudy: 12 // Needs 16
  });

  assert.equal(result.overallEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('at least 16 months')));
});

test('Atlantic Immigration Navigator — Enforces permanent contract requirement for TEER 4 positions', () => {
  // TEER 4 with fixed-term 1-year contract -> Ineligible (must be permanent)
  const result = evaluateAtlanticImmigrationEligibility({
    province: 'PE',
    stream: 'intermediate_skilled',
    nocTeer: 4,
    clbLevel: 4,
    hasDesignatedEmployerJobOffer: true,
    isJobOfferFullTimeNonSeasonal: true,
    jobOfferDurationMonths: 12,
    isPermanentJobOffer: false, // Not permanent
    hoursWorkExperiencePast5Years: 1600
  });

  assert.equal(result.overallEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('permanent (indeterminate) job offer')));
});

test('Atlantic Immigration Navigator — Confirms settlement funds statutory exemption for in-Canada permit holders', () => {
  const result = evaluateAtlanticImmigrationEligibility({
    province: 'NL',
    stream: 'high_skilled',
    nocTeer: 2,
    clbLevel: 5,
    hasDesignatedEmployerJobOffer: true,
    jobOfferDurationMonths: 24,
    hoursWorkExperiencePast5Years: 2000,
    familySize: 3,
    settlementFundsCad: 500, // Normally requires $5,489
    isCurrentlyWorkingInCanadaOnValidPermit: true // Statutorily exempt!
  });

  assert.equal(result.overallEligible, true);
  assert.equal(result.settlementFundsAudit.isStatutorilyExempt, true);
  assert.ok(result.compliancePoints.some(p => p.includes('STATUTORILY EXEMPT from settlement funds proof')));
});

test('Atlantic Immigration Navigator — Rejects non-Atlantic province', () => {
  const result = evaluateAtlanticImmigrationEligibility({
    province: 'ON',
    stream: 'international_graduate'
  });

  assert.equal(result.overallEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('outside Atlantic Canada')));
});
