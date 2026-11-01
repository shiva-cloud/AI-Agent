import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateChildDisabilityBenefit, DISABILITY_BENEFIT_CONSTANTS } from '../src/child-disability-benefit-navigator.js';

test('Child Disability Benefit Navigator — Constants match federal ITA and CDSA rules', () => {
  assert.equal(DISABILITY_BENEFIT_CONSTANTS.ANNUAL_CDB_MAX_AMOUNT_CAD, 3173.0);
  assert.equal(DISABILITY_BENEFIT_CONSTANTS.MONTHLY_CDB_MAX_AMOUNT_CAD, 264.41);
  assert.equal(DISABILITY_BENEFIT_CONSTANTS.CDB_PHASE_OUT_INCOME_THRESHOLD_CAD, 79000.0);
  assert.equal(DISABILITY_BENEFIT_CONSTANTS.RDSP_MAX_LIFETIME_GRANT_CAD, 70000.0);
  assert.equal(DISABILITY_BENEFIT_CONSTANTS.RDSP_MAX_LIFETIME_BOND_CAD, 20000.0);
});

test('Child Disability Benefit Navigator — Full monthly CDB and 300%/200% RDSP grants for low-income family', () => {
  const result = evaluateChildDisabilityBenefit({
    childAgeYears: 6,
    hasApprovedDtcT2201: true,
    dtcConditionIsProlonged: true,
    familyNetIncomeCad: 35000,
    annualRdspContributionCad: 1500
  });

  assert.equal(result.dtcStatus.isDtcPrerequisiteSatisfied, true);
  assert.equal(result.childDisabilityBenefit.isEligible, true);
  assert.equal(result.childDisabilityBenefit.monthlyBenefitCad, 264.41);
  assert.equal(result.childDisabilityBenefit.annualBenefitCad, 3173.0);
  // 500 * 3 = 1500; 1000 * 2 = 2000 => 3500 grant
  assert.equal(result.rdspEntitlements.estimatedAnnualGrantCad, 3500.0);
  // Full $1,000 bond because income <= 36,502
  assert.equal(result.rdspEntitlements.estimatedAnnualBondCad, 1000.0);
  assert.equal(result.rdspEntitlements.totalAnnualGovernmentAssistanceCad, 4500.0);
});

test('Child Disability Benefit Navigator — Phased-out CDB for income above $79,000', () => {
  const result = evaluateChildDisabilityBenefit({
    childAgeYears: 10,
    hasApprovedDtcT2201: true,
    familyNetIncomeCad: 90000,
    annualRdspContributionCad: 1000
  });

  // Excess income: 90,000 - 79,000 = 11,000. 11,000 * 0.032 = 352 reduction.
  // 3173 - 352 = 2821
  assert.equal(result.childDisabilityBenefit.isEligible, true);
  assert.equal(result.childDisabilityBenefit.annualBenefitCad, 2821.0);
  assert.equal(result.childDisabilityBenefit.monthlyBenefitCad, 235.08);
});

test('Child Disability Benefit Navigator — Flags missing T2201 prerequisite and gates assistance', () => {
  const result = evaluateChildDisabilityBenefit({
    childAgeYears: 7,
    hasApprovedDtcT2201: false
  });

  assert.equal(result.dtcStatus.isDtcPrerequisiteSatisfied, false);
  assert.equal(result.childDisabilityBenefit.isEligible, false);
  assert.equal(result.rdspEntitlements.estimatedAnnualGrantCad, 0);
  assert.ok(result.riskWarnings.some(w => w.includes('DTC CERTIFICATE REQUIRED')));
});

test('Child Disability Benefit Navigator — Calculates retroactive catch-up grants up to $10,500 annual limit', () => {
  const result = evaluateChildDisabilityBenefit({
    childAgeYears: 12,
    hasApprovedDtcT2201: true,
    unclaimedPastYears: 4
  });

  // 4 years * 3500 = 14,000, capped at 10,500/year CRA limit
  assert.equal(result.rdspEntitlements.retroactiveCatchUpPotentialCad, 10500.0);
  assert.ok(result.actionPlan.some(a => a.includes('retroactive grant entitlement')));
});
