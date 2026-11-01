import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHILDCARE_CONSTANTS,
  evaluateChildCareSubsidy
} from '../src/childcare-subsidy-navigator.js';

test('Child Care Subsidy Navigator — Constants reflect CCEYA O. Reg. 138/15 & CWELCC benchmarks', () => {
  assert.equal(CHILDCARE_CONSTANTS.CWELCC_MAX_AGE_YEARS, 6);
  assert.equal(CHILDCARE_CONSTANTS.CWELCC_MANDATORY_DISCOUNT_PERCENT, 52.75);
  assert.equal(CHILDCARE_CONSTANTS.SUBSIDY_FULL_EXEMPTION_INCOME_CEILING_CAD, 20000.0);
  assert.equal(CHILDCARE_CONSTANTS.T778_MAX_DEDUCTION_UNDER_7_CAD, 8000.0);
  assert.equal(CHILDCARE_CONSTANTS.T778_MAX_DEDUCTION_7_TO_16_CAD, 5000.0);
});

test('Child Care Subsidy Navigator — Computes $0 parental contribution for income <= $20,000 (100% subsidy)', () => {
  const result = evaluateChildCareSubsidy({
    province: 'ON',
    municipality: 'Toronto',
    adjustedFamilyNetIncomeCad: 18000,
    children: [{ ageYears: 2, hasDisability: false }],
    baselineMonthlyFeePerChildCad: 1400
  });

  assert.equal(result.subsidyCalculation.annualParentalContributionCad, 0);
  assert.equal(result.subsidyCalculation.actualMonthlyParentPaymentWithSubsidyCad, 0);
  assert.ok(result.subsidyCalculation.monthlyMunicipalSubsidyBenefitCad > 500);
  assert.ok(result.compliancePoints.some(p => p.includes('100% full fee subsidy')));
});

test('Child Care Subsidy Navigator — Computes 10% parental contribution on income between $20k and $40k', () => {
  // Income $30,000: contribution = (30,000 - 20,000) * 10% = $1,000/yr = $83.33/mo
  const result = evaluateChildCareSubsidy({
    province: 'ON',
    municipality: 'Peel Region',
    adjustedFamilyNetIncomeCad: 30000,
    children: [{ ageYears: 4, hasDisability: false }],
    baselineMonthlyFeePerChildCad: 1200
  });

  assert.equal(result.subsidyCalculation.annualParentalContributionCad, 1000.0);
  assert.equal(result.subsidyCalculation.monthlyParentalContributionTotalCad, 83.33);
  assert.equal(result.subsidyCalculation.actualMonthlyParentPaymentWithSubsidyCad, 83.33);
});

test('Child Care Subsidy Navigator — Computes $2,000 + 30% contribution on income over $40k', () => {
  // Income $60,000: contribution = $2,000 + (20,000 * 30%) = $8,000/yr = $666.67/mo
  const result = evaluateChildCareSubsidy({
    province: 'ON',
    municipality: 'Ottawa',
    adjustedFamilyNetIncomeCad: 60000,
    children: [{ ageYears: 1, hasDisability: false }],
    baselineMonthlyFeePerChildCad: 1500
  });

  assert.equal(result.subsidyCalculation.annualParentalContributionCad, 8000.0);
  assert.equal(result.subsidyCalculation.monthlyParentalContributionTotalCad, 666.67);
});

test('Child Care Subsidy Navigator — Applies CWELCC 52.75% discount and sets T778 deduction ceiling', () => {
  const result = evaluateChildCareSubsidy({
    province: 'ON',
    baselineMonthlyFeePerChildCad: 1000,
    children: [
      { ageYears: 3, hasDisability: false }, // Under 6 -> CWELCC eligible, $8k deduction
      { ageYears: 8, hasDisability: false }  // Age 8 -> Not CWELCC, $5k deduction
    ],
    isEnrolledInCwelccLicensedCentre: true
  });

  const child1 = result.childAudits[0];
  const child2 = result.childAudits[1];

  assert.equal(child1.isCwelccEligible, true);
  // $1000 - 52.75% = $472.50
  assert.equal(child1.cwelccDiscountedMonthlyFeeCad, 472.50);
  assert.equal(child1.t778MaxTaxDeductionCad, 8000.0);

  assert.equal(child2.isCwelccEligible, false);
  assert.equal(child2.cwelccDiscountedMonthlyFeeCad, 1000.0);
  assert.equal(child2.t778MaxTaxDeductionCad, 5000.0);

  assert.ok(result.statutoryNotes.some(n => n.includes('lower net income')));
});
