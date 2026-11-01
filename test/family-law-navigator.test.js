import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FAMILY_LAW_CONSTANTS,
  calculateChildSupportTableAmount,
  evaluateFamilyLawAndSupport
} from '../src/family-law-navigator.js';

test('Family Law Navigator — Constants match CSG, SSAG, and Ontario FLA', () => {
  assert.equal(FAMILY_LAW_CONSTANTS.ONTARIO_COMMON_LAW_SUPPORT_YEARS_THRESHOLD, 3);
  assert.equal(FAMILY_LAW_CONSTANTS.BC_COMMON_LAW_PROPERTY_YEARS_THRESHOLD, 2);
  assert.equal(FAMILY_LAW_CONSTANTS.SSAG_PERCENT_PER_YEAR_LOW, 0.015);
  assert.equal(FAMILY_LAW_CONSTANTS.SSAG_PERCENT_PER_YEAR_HIGH, 0.02);
  assert.equal(FAMILY_LAW_CONSTANTS.SPONSORSHIP_UNDERTAKING_SPOUSE_YEARS, 3);
});

test('Family Law Navigator — Computes child support table amounts accurately', () => {
  const support1 = calculateChildSupportTableAmount(60000, 1);
  const support2 = calculateChildSupportTableAmount(60000, 2);
  assert.ok(support1 > 500 && support1 < 700);
  assert.ok(support2 > support1);
  assert.equal(calculateChildSupportTableAmount(10000, 1), 0); // below basic personal amount
});

test('Family Law Navigator — Calculates shared custody set-off under CSG s. 9', () => {
  const result = evaluateFamilyLawAndSupport({
    province: 'ON',
    maritalStatus: 'married',
    numberOfChildren: 2,
    payerGrossAnnualIncomeCad: 90000,
    recipientGrossAnnualIncomeCad: 45000,
    parentingArrangement: 'shared_custody'
  });

  assert.ok(result.childSupport.monthlyTableAmountCad > 0);
  assert.ok(result.childSupport.statutoryBasis.includes('Shared Custody Set-Off'));
});

test('Family Law Navigator — Computes SSAG spousal support ranges and duration', () => {
  const result = evaluateFamilyLawAndSupport({
    province: 'ON',
    maritalStatus: 'married',
    cohabitationYears: 10,
    payerGrossAnnualIncomeCad: 100000,
    recipientGrossAnnualIncomeCad: 40000,
    numberOfChildren: 0
  });

  // Gross diff = $60,000. 10 yrs * 1.5% = 15% ($9,000/yr = $750/mo). 10 yrs * 2.0% = 20% ($12,000/yr = $1,000/mo)
  assert.equal(result.spousalSupport.isEligible, true);
  assert.equal(result.spousalSupport.grossIncomeDifferenceAnnualCad, 60000);
  assert.equal(result.spousalSupport.monthlySupportRangeCad.low, 750);
  assert.equal(result.spousalSupport.monthlySupportRangeCad.high, 1000);
  assert.equal(result.spousalSupport.durationRangeYears.low, 5);
  assert.equal(result.spousalSupport.durationRangeYears.high, 10);
});

test('Family Law Navigator — Calculates Ontario Net Family Property (NFP) equalization for married spouses', () => {
  // Payer: $400k assets - $50k debts - $50k marriage deduction = $300k NFP
  // Recipient: $150k assets - $20k debts - $30k marriage deduction = $100k NFP
  // Diff = $200k / 2 = $100k equalization payment
  const result = evaluateFamilyLawAndSupport({
    province: 'ON',
    maritalStatus: 'married',
    payerValuationDateAssetsCad: 400000,
    payerDebtsValuationDateCad: 50000,
    payerDateOfMarriageDeductionsCad: 50000,
    recipientValuationDateAssetsCad: 150000,
    recipientDebtsValuationDateCad: 20000,
    recipientDateOfMarriageDeductionsCad: 30000
  });

  assert.equal(result.propertyEqualization.payerNfpCad, 300000);
  assert.equal(result.propertyEqualization.recipientNfpCad, 100000);
  assert.equal(result.propertyEqualization.equalizationPaymentCad, 100000);
  assert.equal(result.propertyEqualization.payingParty, 'Payer to Recipient');
});

test('Family Law Navigator — Strictly excludes Ontario common-law partners from statutory property equalization', () => {
  const result = evaluateFamilyLawAndSupport({
    province: 'ON',
    maritalStatus: 'common_law',
    cohabitationYears: 12,
    payerValuationDateAssetsCad: 500000,
    recipientValuationDateAssetsCad: 50000
  });

  assert.equal(result.propertyEqualization.equalizationPaymentCad, 0);
  assert.ok(result.propertyEqualization.statutoryBasis.includes('DOES NOT apply to common-law spouses'));
});

test('Family Law Navigator — Flags foreign asset disclosure rules and IRPA s. 132 sponsorship undertaking', () => {
  const result = evaluateFamilyLawAndSupport({
    province: 'ON',
    hasForeignWorldwideAssets: true,
    hasActiveSponsorshipUndertaking: true
  });

  assert.equal(result.newcomerSpecificAudits.hasForeignWorldwideAssets, true);
  assert.ok(result.newcomerSpecificAudits.foreignAssetRule.includes('Full global asset disclosure'));
  assert.equal(result.newcomerSpecificAudits.hasActiveSponsorshipUndertaking, true);
  assert.ok(result.newcomerSpecificAudits.sponsorshipLiabilityWarning.includes('IRPA s. 132 Undertaking'));
});
