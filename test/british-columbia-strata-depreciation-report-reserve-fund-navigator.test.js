import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_STRATA_CRF_CONSTANTS,
  evaluateBcStrataDepreciationReport
} from '../src/british-columbia-strata-depreciation-report-reserve-fund-navigator.js';

test('BC Strata CRF & Depreciation - Constants reflect 2024 regulations', () => {
  assert.equal(BC_STRATA_CRF_CONSTANTS.DEPRECIATION_REPORT_CYCLE_YEARS, 5);
  assert.equal(BC_STRATA_CRF_CONSTANTS.MIN_STRATA_LOTS_FOR_MANDATORY_REPORT, 5);
  assert.equal(BC_STRATA_CRF_CONSTANTS.MIN_ANNUAL_CRF_CONTRIBUTION_PERCENT, 10.0);
  assert.equal(BC_STRATA_CRF_CONSTANTS.ANNUAL_WAIVER_VOTE_PERMITTED, false);
});

test('BC Strata CRF & Depreciation - Compliant 30-unit strata with up-to-date report and 12% CRF', () => {
  // $100k budget * 10% = $10k min. Strata contributes $12k.
  const result = evaluateBcStrataDepreciationReport({
    strataLotsCount: 30,
    yearsSinceLastDepreciationReport: 3,
    reportAuthorCredential: 'CERTIFIED_RESERVE_PLANNER_CRP',
    annualOperatingBudgetCad: 100000,
    annualCrfContributionCad: 12000,
    strataAttemptedAnnualWaiverVote: false,
    depreciationReportAttachedToFormB: true
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_STRATA_CRF_AND_REPORT');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.crfContributionAudit.statutoryMinimumCrfContributionCad, 10000);
  assert.equal(result.crfContributionAudit.crfContributionDeficitCad, 0);
});

test('BC Strata CRF & Depreciation - Overdue report (7 years) on 20-unit building', () => {
  const result = evaluateBcStrataDepreciationReport({
    strataLotsCount: 20,
    yearsSinceLastDepreciationReport: 7,
    annualOperatingBudgetCad: 80000,
    annualCrfContributionCad: 8000
  });

  assert.equal(result.complianceStatus, 'STATUTORY_STRATA_GOVERNANCE_BREACH');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'OVERDUE_DEPRECIATION_REPORT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'COMMISSION_NEW_DEPRECIATION_REPORT'));
});

test('BC Strata CRF & Depreciation - Illegal 2024 waiver vote attempt', () => {
  const result = evaluateBcStrataDepreciationReport({
    strataLotsCount: 15,
    yearsSinceLastDepreciationReport: 6,
    strataAttemptedAnnualWaiverVote: true
  });

  assert.ok(result.statutoryViolations.some(v => v.rule === 'ILLEGAL_DEPRECIATION_REPORT_WAIVER_ATTEMPT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'STRIKE_INVALID_WAIVER_RESOLUTION'));
});

test('BC Strata CRF & Depreciation - Substandard CRF contribution (only 5% instead of 10%)', () => {
  // $200k budget requires $20k min. Strata contributed $10k.
  const result = evaluateBcStrataDepreciationReport({
    strataLotsCount: 50,
    yearsSinceLastDepreciationReport: 2,
    annualOperatingBudgetCad: 200000,
    annualCrfContributionCad: 10000
  });

  assert.equal(result.crfContributionAudit.crfContributionDeficitCad, 10000);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_ANNUAL_CRF_CONTRIBUTION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'AMEND_ANNUAL_BUDGET_FOR_MANDATORY_CRF'));
});
