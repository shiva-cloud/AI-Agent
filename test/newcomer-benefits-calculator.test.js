// test/newcomer-benefits-calculator.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CRA_BENEFIT_RATES,
  calculateCcbAnnual,
  calculateGstHstCreditAnnual,
  calculateProvincialBenefitAnnual,
  calculateNewcomerBenefits
} from '../src/newcomer-benefits-calculator.js';

describe('CRA Newcomer Benefits & Tax Credits Calculator', () => {
  it('correctly calculates Canada Child Benefit (CCB) at base entitlement', () => {
    // 0 children
    assert.strictEqual(calculateCcbAnnual(0, 0, 30000), 0);

    // 1 child under 6, income below base threshold ($36,502)
    const oneUnder6 = calculateCcbAnnual(1, 0, 30000);
    assert.strictEqual(oneUnder6, CRA_BENEFIT_RATES.ccb.maxAnnualUnder6); // $7,787

    // 1 child 6 to 17
    const oneOver6 = calculateCcbAnnual(0, 1, 30000);
    assert.strictEqual(oneOver6, CRA_BENEFIT_RATES.ccb.maxAnnual6to17); // $6,570

    // 2 children (1 under 6, 1 between 6 and 17)
    const twoKids = calculateCcbAnnual(1, 1, 35000);
    assert.strictEqual(twoKids, 7787 + 6570); // $14,357
  });

  it('applies statutory Tier 1 and Tier 2 phase-out reductions for CCB', () => {
    // 1 child under 6, income $50,000 (Tier 1: 7% on income above $36,502)
    const incomeTier1 = 50000;
    const expectedReductionTier1 = (incomeTier1 - 36502) * 0.070;
    const expectedTier1Benefit = Math.round(7787 - expectedReductionTier1);
    const actualTier1 = calculateCcbAnnual(1, 0, incomeTier1);
    assert.strictEqual(actualTier1, expectedTier1Benefit);

    // 1 child under 6, income $100,000 (Tier 2: Tier 1 max + 3.2% on income above $79,000)
    const incomeTier2 = 100000;
    const tier1Span = 79000 - 36502;
    const tier1MaxReduction = tier1Span * 0.070;
    const tier2Reduction = (incomeTier2 - 79000) * 0.032;
    const expectedTier2Benefit = Math.round(7787 - (tier1MaxReduction + tier2Reduction));
    const actualTier2 = calculateCcbAnnual(1, 0, incomeTier2);
    assert.strictEqual(actualTier2, expectedTier2Benefit);

    // Very high income eliminates CCB
    const highIncome = calculateCcbAnnual(1, 0, 500000);
    assert.strictEqual(highIncome, 0);
  });

  it('correctly calculates GST/HST credit under Income Tax Act s. 122.5', () => {
    // Single adult, 0 kids, income <= 44,324
    const singleNoKids = calculateGstHstCreditAnnual('single', 0, 30000);
    assert.strictEqual(singleNoKids, 519);

    // Married couple, 2 kids, income <= 44,324 -> 680 + (2 * 179) = 1,038
    const coupleTwoKids = calculateGstHstCreditAnnual('married', 2, 40000);
    assert.strictEqual(coupleTwoKids, 680 + (2 * 179)); // 1038

    // Phase-out at 5% for income over $44,324
    const overThreshold = 54324; // $10,000 over threshold -> $500 reduction
    const reducedCredit = calculateGstHstCreditAnnual('single', 0, overThreshold);
    assert.strictEqual(reducedCredit, 519 - 500); // 19
  });

  it('calculates provincial child and family benefits across provinces', () => {
    // Ontario with 1 child
    const ontarioBenefit = calculateProvincialBenefitAnnual('ON', 1, 30000);
    assert.strictEqual(ontarioBenefit, 1680);

    // BC with 1 child
    const bcBenefit = calculateProvincialBenefitAnnual('BC', 1, 30000);
    assert.strictEqual(bcBenefit, 1750);

    // Zero children yields 0
    assert.strictEqual(calculateProvincialBenefitAnnual('ON', 0, 30000), 0);
  });

  it('generates a complete newcomer benefits dossier and filing packet', () => {
    const result = calculateNewcomerBenefits({
      province: 'ON',
      adjustedFamilyNetIncomeCad: 32000,
      maritalStatus: 'married',
      childrenUnder6Count: 1,
      children6to17Count: 1,
      landingDateStr: '2026-06-01'
    });

    assert.strictEqual(result.province, 'ON');
    assert.strictEqual(result.familyProfile.totalChildrenCount, 2);
    assert.strictEqual(result.annualTotals.ccbAnnual, 7787 + 6570);
    assert.strictEqual(result.annualTotals.gstHstAnnual, 680 + (2 * 179));
    assert.strictEqual(result.annualTotals.provincialAnnual, 2 * 1680);
    assert.ok(result.annualTotals.totalAnnualGovernmentCredits > 17000);

    // Cashflow schedule
    assert.strictEqual(result.cashflowSchedule.ccbMonthly, Math.round((7787 + 6570) / 12));
    assert.strictEqual(result.cashflowSchedule.gstHstQuarterly, Math.round((680 + 358) / 4));

    // Required forms for families with children
    const formCodes = result.requiredForms.map(f => f.formCode);
    assert.ok(formCodes.includes('Form RC151'));
    assert.ok(formCodes.includes('Form RC66'));
    assert.ok(formCodes.includes('Schedule RC66SCH'));
    assert.ok(result.statutoryAuthority.includes('Income Tax Act'));
  });

  it('generates RC151-only packet for newcomers without children', () => {
    const result = calculateNewcomerBenefits({
      province: 'BC',
      adjustedFamilyNetIncomeCad: 28000,
      maritalStatus: 'single',
      childrenUnder6Count: 0,
      children6to17Count: 0
    });

    assert.strictEqual(result.annualTotals.ccbAnnual, 0);
    assert.strictEqual(result.annualTotals.gstHstAnnual, 519);
    assert.strictEqual(result.requiredForms.length, 1);
    assert.strictEqual(result.requiredForms[0].formCode, 'Form RC151');
  });
});
