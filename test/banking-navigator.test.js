import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBankingAndCreditStrategy,
  NEWCOMER_BANK_PACKAGES,
  CREDIT_BUREAU_FACTORS
} from '../src/banking-navigator.js';

test('NEWCOMER_BANK_PACKAGES contains verified Big 5 Canadian banking programs', () => {
  const keys = Object.keys(NEWCOMER_BANK_PACKAGES);
  assert.ok(keys.includes('scotiabank'));
  assert.ok(keys.includes('rbc'));
  assert.ok(keys.includes('td'));
  assert.ok(keys.includes('bmo'));
  assert.ok(keys.includes('cibc'));

  for (const key of keys) {
    const pkg = NEWCOMER_BANK_PACKAGES[key];
    assert.equal(pkg.requiresCanadianCreditHistory, false);
    assert.ok(pkg.unsecuredCreditLimitCad >= 5000);
    assert.ok(pkg.monthlyFeeWaivedMonths >= 12);
    assert.ok(pkg.welcomeBonusCad >= 300);
  }
});

test('CREDIT_BUREAU_FACTORS accurately reflects official scoring models totaling 100%', () => {
  const totalWeight = CREDIT_BUREAU_FACTORS.reduce((sum, f) => sum + f.weightPercent, 0);
  assert.equal(totalWeight, 100);
  const paymentFactor = CREDIT_BUREAU_FACTORS.find(f => f.factor === 'Payment History');
  assert.equal(paymentFactor.weightPercent, 35);
  const utilFactor = CREDIT_BUREAU_FACTORS.find(f => f.factor === 'Credit Utilization Ratio');
  assert.equal(utilFactor.weightPercent, 30);
});

test('evaluateBankingAndCreditStrategy generates complete Big 5 comparison and savings values', () => {
  const result = evaluateBankingAndCreditStrategy({
    monthlySpendingCad: 800,
    targetCreditScore: 740,
    hasPostpaidPhonePlan: true,
    immigrationCategory: 'pr'
  });

  assert.equal(result.packagesComparison.length, 5);
  assert.ok(result.packagesComparison.every(p => p.totalBenefitValueCad > 400));
  assert.equal(result.monthlySpendingCad, 800);
  assert.equal(result.targetCreditScore, 740);
});

test('evaluateBankingAndCreditStrategy provides Bank Act s. 627.17 statutory dispute notice', () => {
  const result = evaluateBankingAndCreditStrategy();

  assert.ok(result.bankActStatutoryRights.statute.includes('Bank Act (S.C. 1991, c. 46), Section 627.17'));
  assert.ok(result.bankActStatutoryRights.coreRight.includes('without a credit check'));
  assert.ok(result.bankActStatutoryRights.tellerDisputeNotice.includes('BANK ACT SECTION 627.17'));
  assert.ok(result.bankActStatutoryRights.mandatoryIdRequirements.length >= 2);
});

test('evaluateBankingAndCreditStrategy calculates optimal utilization and credit limit targets', () => {
  const result = evaluateBankingAndCreditStrategy({ monthlySpendingCad: 1000 });

  assert.equal(result.utilizationOptimization.monthlySpendCad, 1000);
  assert.equal(result.utilizationOptimization.recommendedCreditLimitCad, 3500); // 1000 * 3.5
  assert.equal(result.utilizationOptimization.optimalReportedStatementBalanceCad, 100); // 10%
  assert.ok(result.utilizationOptimization.goldenRule.includes('statement closes'));
});

test('evaluateBankingAndCreditStrategy builds 12-month milestone roadmap to 750+ score', () => {
  const result = evaluateBankingAndCreditStrategy();

  assert.equal(result.twelveMonthRoadmap.length, 5);
  const m1 = result.twelveMonthRoadmap.find(m => m.month === 1);
  assert.equal(m1.phase, 'Thin File');

  const m9 = result.twelveMonthRoadmap.find(m => m.month === 9);
  assert.equal(m9.targetScore, 720);
  assert.equal(m9.phase, 'Prime Tier');

  const m12 = result.twelveMonthRoadmap.find(m => m.month === 12);
  assert.equal(m12.targetScore, 750);
  assert.ok(m12.actions.some(a => a.includes('A-lender residential mortgage')));
});
