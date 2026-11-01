import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTaxShield } from '../src/tax-shield-optimizer.js';

test('Tax Shield Optimizer — Computes FHSA deduction for Ontario newcomer', () => {
  const result = evaluateTaxShield({
    annualEmploymentIncomeCad: 80000,
    province: 'ON',
    planToBuyFirstHome: true,
    fhsaContributionCad: 8000,
    isTaxResident: true
  });

  assert.equal(result.province, 'ON');
  assert.equal(result.fhsaShield.contributionCad, 8000);
  assert.ok(result.fhsaShield.estimatedIncomeTaxDeductionCad > 2000);
  assert.equal(result.tfsaShield.annualRoom2025Cad, 7000);
  assert.equal(result.tfsaShield.penaltyWarning, null);
});

test('Tax Shield Optimizer — Detects non-resident TFSA 1% monthly penalty hazard', () => {
  const result = evaluateTaxShield({
    annualEmploymentIncomeCad: 60000,
    province: 'BC',
    isTaxResident: false,
    tfsaContributionCad: 5000
  });

  assert.equal(result.tfsaShield.annualRoom2025Cad, 0);
  assert.ok(result.tfsaShield.penaltyWarning);
  assert.equal(result.tfsaShield.penaltyWarning.monthlyPenaltyCad, 50); // 1% of 5000 = 50
  assert.ok(result.tfsaShield.penaltyWarning.statutoryLegalBasis.includes('207.02'));
});

test('Tax Shield Optimizer — Accurately estimates Canada Child Benefit for 2 children', () => {
  const result = evaluateTaxShield({
    annualEmploymentIncomeCad: 45000,
    province: 'ON',
    childrenUnder6: 1,
    children6to17: 1
  });

  assert.ok(result.childAndFamilyBenefits.estimatedAnnualCcbCad > 10000);
  assert.ok(result.totalFirstYearFinancialShieldCad > 10000);
});
