import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONTARIO_LAYOFF_CONSTANTS,
  auditOntarioTemporaryLayoff
} from '../src/ontario-employment-temp-layoff-constructive-dismissal-navigator.js';

test('Ontario Layoff - Constants reflect ESA ss. 56, 57, 64', () => {
  assert.equal(ONTARIO_LAYOFF_CONSTANTS.STANDARD_LAYOFF_MAX_WEEKS, 13);
  assert.equal(ONTARIO_LAYOFF_CONSTANTS.EXTENDED_LAYOFF_MAX_WEEKS, 35);
  assert.equal(ONTARIO_LAYOFF_CONSTANTS.MAX_STATUTORY_NOTICE_WEEKS, 8);
  assert.equal(ONTARIO_LAYOFF_CONSTANTS.MAX_STATUTORY_SEVERANCE_WEEKS, 26);
});

test('Ontario Layoff - Compliant 10-week layoff within 13-week limit', () => {
  const result = auditOntarioTemporaryLayoff({
    layoffDurationWeeks: 10,
    employerContinuedHealthBenefits: false,
    hasValidWrittenLayoffClauseInContract: true,
    yearsOfService: 3
  });

  assert.equal(result.isDeemedTerminatedUnderEsa, false);
  assert.equal(result.complianceStatus, 'COMPLIANT_TEMPORARY_LAYOFF_WITHIN_LIMITS');
  assert.equal(result.financialEntitlements.totalStatutoryPayOwingCad, 0);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Ontario Layoff - Detects Deemed Termination at week 14 without benefits continuation', () => {
  const result = auditOntarioTemporaryLayoff({
    layoffDurationWeeks: 14, // Exceeds 13 weeks!
    employerContinuedHealthBenefits: false,
    yearsOfService: 6,
    regularWeeklyWageCad: 1000,
    employerOntarioPayrollOver2_5Million: true
  });

  assert.equal(result.isDeemedTerminatedUnderEsa, true);
  assert.equal(result.deemedTerminationGround, 'EXCEEDED_13_WEEKS_WITHOUT_BENEFIT_CONTINUATION');
  assert.equal(result.complianceStatus, 'DEEMED_TERMINATION_STATUTORY_SEVERANCE_OWED');
  // Notice: 6 wks = $6,000; Severance: 6 wks = $6,000; Total = $12,000
  assert.equal(result.financialEntitlements.statutoryNoticePayCad, 6000);
  assert.equal(result.financialEntitlements.statutorySeverancePayCad, 6000);
  assert.equal(result.financialEntitlements.totalStatutoryPayOwingCad, 12000);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_DEEMED_TERMINATION'));
});

test('Ontario Layoff - Extended layoff at 20 weeks with benefits remains active', () => {
  const result = auditOntarioTemporaryLayoff({
    layoffDurationWeeks: 20,
    employerContinuedHealthBenefits: true, // Extended exemption!
    hasValidWrittenLayoffClauseInContract: true
  });

  assert.equal(result.isDeemedTerminatedUnderEsa, false);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'EXTENDED_LAYOFF_ACTIVE'));
});

test('Ontario Layoff - Exceeding 35 weeks triggers deemed termination even with benefits', () => {
  const result = auditOntarioTemporaryLayoff({
    layoffDurationWeeks: 36, // Exceeds absolute cap!
    employerContinuedHealthBenefits: true,
    yearsOfService: 4,
    regularWeeklyWageCad: 1000,
    employerOntarioPayrollOver2_5Million: false
  });

  assert.equal(result.isDeemedTerminatedUnderEsa, true);
  assert.equal(result.deemedTerminationGround, 'EXCEEDED_ABSOLUTE_35_WEEK_MAXIMUM');
  assert.equal(result.financialEntitlements.statutoryNoticePayCad, 4000);
  assert.equal(result.financialEntitlements.statutorySeverancePayCad, 0); // under 5 years & under $2.5M
});
