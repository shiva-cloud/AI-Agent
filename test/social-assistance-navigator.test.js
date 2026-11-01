import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SOCIAL_ASSISTANCE_CONSTANTS,
  evaluateSocialAssistance
} from '../src/social-assistance-navigator.js';

test('Social Assistance Navigator — Constants match Ontario Works & ODSP regulations', () => {
  assert.equal(SOCIAL_ASSISTANCE_CONSTANTS.OW_ASSET_LIMIT_SINGLE_CAD, 10000);
  assert.equal(SOCIAL_ASSISTANCE_CONSTANTS.OW_ASSET_LIMIT_COUPLE_CAD, 15000);
  assert.equal(SOCIAL_ASSISTANCE_CONSTANTS.ODSP_ASSET_LIMIT_SINGLE_CAD, 40000);
  assert.equal(SOCIAL_ASSISTANCE_CONSTANTS.ODSP_ASSET_LIMIT_COUPLE_CAD, 50000);
  assert.equal(SOCIAL_ASSISTANCE_CONSTANTS.OW_EARNINGS_EXEMPTION_FLAT_CAD, 200);
  assert.equal(SOCIAL_ASSISTANCE_CONSTANTS.OW_EARNINGS_CLAWBACK_RATE, 0.50);
  assert.equal(SOCIAL_ASSISTANCE_CONSTANTS.ODSP_EARNINGS_EXEMPTION_FLAT_CAD, 1000);
  assert.equal(SOCIAL_ASSISTANCE_CONSTANTS.ODSP_EARNINGS_CLAWBACK_RATE, 0.75);
});

test('Social Assistance Navigator — Verifies status eligibility for Permanent Residents and Refugee Claimants', () => {
  const prResult = evaluateSocialAssistance({
    program: 'ontario_works',
    immigrationStatus: 'permanent_resident',
    liquidAssetsCad: 3000
  });
  assert.equal(prResult.eligibility.isStatusEligible, true);
  assert.equal(prResult.eligibility.isOverallEligible, true);

  const refugeeResult = evaluateSocialAssistance({
    program: 'ontario_works',
    immigrationStatus: 'refugee_claimant',
    liquidAssetsCad: 1500
  });
  assert.equal(refugeeResult.eligibility.isStatusEligible, true);
  assert.ok(refugeeResult.eligibility.statusGuidance.includes('Refugee claimants with a valid Refugee Protection Claimant Document'));
});

test('Social Assistance Navigator — Flags ineligibility for temporary permit holders', () => {
  const result = evaluateSocialAssistance({
    program: 'ontario_works',
    immigrationStatus: 'study_permit',
    liquidAssetsCad: 2000
  });
  assert.equal(result.eligibility.isStatusEligible, false);
  assert.equal(result.eligibility.isOverallEligible, false);
  assert.ok(result.eligibility.statusGuidance.includes('Temporary residents'));
});

test('Social Assistance Navigator — Calculates Ontario Works 50% earnings clawback above $200', () => {
  // Gross income $800. Exemption $200. Excess $600 * 50% = $300 clawback.
  // Base single benefit $733 - $300 = $433 estimated disbursement.
  const result = evaluateSocialAssistance({
    program: 'ontario_works',
    familyComposition: 'single',
    grossMonthlyEmploymentIncomeCad: 800
  });

  assert.equal(result.benefitCalculation.flatEarningsExemptionCad, 200);
  assert.equal(result.benefitCalculation.clawbackRatePercent, 50);
  assert.equal(result.benefitCalculation.netMonthlyDeductionCad, 300);
  assert.equal(result.benefitCalculation.estimatedMonthlyDisbursementCad, 433);
});

test('Social Assistance Navigator — Calculates ODSP 75% earnings clawback above $1,000', () => {
  // Gross income $1,600. Exemption $1,000. Excess $600 * 75% = $450 clawback.
  // Base single ODSP $1,308 - $450 = $858 estimated disbursement.
  const result = evaluateSocialAssistance({
    program: 'odsp',
    familyComposition: 'single',
    grossMonthlyEmploymentIncomeCad: 1600
  });

  assert.equal(result.benefitCalculation.flatEarningsExemptionCad, 1000);
  assert.equal(result.benefitCalculation.clawbackRatePercent, 75);
  assert.equal(result.benefitCalculation.netMonthlyDeductionCad, 450);
  assert.equal(result.benefitCalculation.estimatedMonthlyDisbursementCad, 858);
});

test('Social Assistance Navigator — Audits liquid asset limit and flags excess holdings', () => {
  const result = evaluateSocialAssistance({
    program: 'ontario_works',
    familyComposition: 'single',
    liquidAssetsCad: 14500
  });

  assert.equal(result.assetAudit.statutoryAssetLimitCad, 10000);
  assert.equal(result.assetAudit.isWithinAssetLimit, false);
  assert.equal(result.assetAudit.excessAssetsCad, 4500);
  assert.equal(result.eligibility.isOverallEligible, false);
});

test('Social Assistance Navigator — Highlights Family Class sponsorship undertaking default liabilities', () => {
  const result = evaluateSocialAssistance({
    program: 'ontario_works',
    immigrationStatus: 'permanent_resident',
    isSponsoredImmigrant: true,
    sponsorshipYearsRemaining: 2.5
  });

  assert.notEqual(result.sponsorshipUndertakingImpact, null);
  assert.equal(result.sponsorshipUndertakingImpact.isDefaultTriggered, true);
  assert.ok(result.sponsorshipUndertakingImpact.legalImpact.includes('statutory debt to the Crown'));
  assert.ok(result.sponsorshipUndertakingImpact.legalImpact.includes('IRPR s. 133(1)(j)'));
});
