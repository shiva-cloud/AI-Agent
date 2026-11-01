// test/childcare-navigator.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHILDCARE_AGE_GROUPS,
  MUNICIPAL_PORTALS,
  calculateOntarioSubsidyContribution,
  evaluateChildcareSupport
} from '../src/childcare-navigator.js';

describe('Canada-Wide Early Learning and Child Care (CWELCC) & Fee Subsidy Navigator', () => {
  it('defines statutory age group benchmarks and $22/day CWELCC caps', () => {
    assert.ok(CHILDCARE_AGE_GROUPS.infant);
    assert.strictEqual(CHILDCARE_AGE_GROUPS.infant.cwelccDailyCapCad, 22.00);
    assert.ok(CHILDCARE_AGE_GROUPS.infant.marketMonthlyAverageCad > 1800);

    assert.ok(CHILDCARE_AGE_GROUPS.toddler);
    assert.strictEqual(CHILDCARE_AGE_GROUPS.toddler.cwelccDailyCapCad, 22.00);

    assert.ok(CHILDCARE_AGE_GROUPS.preschool);
    assert.strictEqual(CHILDCARE_AGE_GROUPS.preschool.cwelccDailyCapCad, 22.00);

    assert.ok(CHILDCARE_AGE_GROUPS.kindergarten);
    assert.strictEqual(CHILDCARE_AGE_GROUPS.kindergarten.cwelccDailyCapCad, 12.69);
  });

  it('correctly calculates Ontario O. Reg. 138/15 parent fee contribution tiers', () => {
    // Under $20,000 net income -> $0 parent contribution
    assert.strictEqual(calculateOntarioSubsidyContribution(18000), 0);

    // $30,000 income -> ($30,000 - $20,000) * 10% / 12 = $83/mo
    const tier1Contrib = calculateOntarioSubsidyContribution(30000);
    assert.strictEqual(tier1Contrib, Math.round(1000 / 12)); // 83

    // $60,000 income -> ($2,000 + ($60,000 - $40,000) * 30%) / 12 = $8,000 / 12 = $667/mo
    const tier2Contrib = calculateOntarioSubsidyContribution(60000);
    assert.strictEqual(tier2Contrib, Math.round(8000 / 12)); // 667
  });

  it('evaluates full childcare subsidy for low-income newcomer in Toronto', () => {
    const result = evaluateChildcareSupport({
      city: 'Toronto',
      annualFamilyIncomeCad: 19000,
      immigrationStatus: 'pr',
      children: [{ ageGroup: 'infant' }]
    });

    assert.strictEqual(result.city, 'Toronto');
    assert.strictEqual(result.subsidyAssessment.status, 'full_subsidy');
    assert.strictEqual(result.monthlyCostSummary.estimatedParentFeeAfterSubsidyMonthlyCad, 0);
    assert.ok(result.monthlyCostSummary.totalMonthlySavingsCad >= 1950);
    assert.ok(result.waitlistPortal.name.includes('MyChildCareAccount'));
  });

  it('verifies work permit holders are statutorily eligible for childcare fee subsidies', () => {
    const result = evaluateChildcareSupport({
      city: 'Mississauga',
      annualFamilyIncomeCad: 28000,
      immigrationStatus: 'work_permit',
      children: [{ ageGroup: 'toddler' }]
    });

    assert.strictEqual(result.subsidyAssessment.isStatutorilyEligible, true);
    assert.strictEqual(result.subsidyAssessment.status, 'partial_subsidy');
    assert.ok(result.monthlyCostSummary.estimatedParentFeeAfterSubsidyMonthlyCad < 100);
    assert.ok(result.statutoryAdvisories[0].includes('Work Permit & Study Permit Statutory Right'));
  });

  it('evaluates British Columbia Affordable Child Care Benefit (ACCB) in Vancouver', () => {
    const result = evaluateChildcareSupport({
      city: 'Vancouver',
      annualFamilyIncomeCad: 35000,
      immigrationStatus: 'pr',
      children: [{ ageGroup: 'preschool' }]
    });

    assert.strictEqual(result.city, 'Vancouver');
    assert.strictEqual(result.subsidyAssessment.status, 'full_subsidy');
    assert.strictEqual(result.monthlyCostSummary.estimatedParentFeeAfterSubsidyMonthlyCad, 0);
    assert.ok(result.waitlistPortal.name.includes('Westcoast Child Care'));
  });

  it('provides base CWELCC fee reduction to visitors while marking subsidy ineligible', () => {
    const result = evaluateChildcareSupport({
      city: 'Toronto',
      annualFamilyIncomeCad: 50000,
      immigrationStatus: 'visitor',
      children: [{ ageGroup: 'toddler' }]
    });

    assert.strictEqual(result.subsidyAssessment.isStatutorilyEligible, false);
    assert.strictEqual(result.monthlyCostSummary.estimatedParentFeeAfterSubsidyMonthlyCad, 462); // CWELCC base fee
    assert.ok(result.monthlyCostSummary.totalMonthlySavingsCad > 1000); // Saved compared to market $1650
  });
});
