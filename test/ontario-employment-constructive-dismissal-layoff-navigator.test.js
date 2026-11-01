import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ESA_LAYOFF_RULES,
  calculateEsaStatutoryNoticeWeeks,
  calculateEsaStatutorySeveranceWeeks,
  estimateBardalNoticeMonths,
  evaluateEsaConstructiveDismissalLayoff
} from '../src/ontario-employment-constructive-dismissal-layoff-navigator.js';

test('ESA Layoff Rules Constants & statutory calculations', () => {
  assert.equal(ESA_LAYOFF_RULES.STANDARD_LAYOFF_MAX_WEEKS, 13);
  assert.equal(ESA_LAYOFF_RULES.EXTENDED_LAYOFF_MAX_WEEKS, 35);
  assert.equal(ESA_LAYOFF_RULES.MAX_STATUTORY_NOTICE_WEEKS, 8);
  assert.equal(ESA_LAYOFF_RULES.MAX_STATUTORY_SEVERANCE_WEEKS, 26);
  assert.equal(ESA_LAYOFF_RULES.SEVERANCE_PAYROLL_THRESHOLD_CAD, 2500000);

  // Notice weeks: under 3 months is 0, 1 year is 1, 5 years is 5, 10 years is capped at 8
  assert.equal(calculateEsaStatutoryNoticeWeeks(0.2), 0);
  assert.equal(calculateEsaStatutoryNoticeWeeks(1), 1);
  assert.equal(calculateEsaStatutoryNoticeWeeks(5.4), 5);
  assert.equal(calculateEsaStatutoryNoticeWeeks(12), 8);

  // Severance weeks: requires >= 5 years and payroll >= $2.5M
  assert.equal(calculateEsaStatutorySeveranceWeeks(4, true), 0);
  assert.equal(calculateEsaStatutorySeveranceWeeks(6, false), 0);
  assert.equal(calculateEsaStatutorySeveranceWeeks(7.5, true), 7.5);
  assert.equal(calculateEsaStatutorySeveranceWeeks(30, true), 26);
});

test('evaluateEsaConstructiveDismissalLayoff identifies compliant temporary layoff', () => {
  const result = evaluateEsaConstructiveDismissalLayoff({
    yearsOfService: 3,
    employeeAge: 32,
    annualSalaryCad: 60000,
    weeksOnLayoff: 8,
    employerMaintainedBenefitsOrSub: false,
    hasContractualLayoffClause: true,
    employerPayrollExceeds2_5M: true
  });

  assert.equal(result.legalVerdict, 'COMPLIANT_TEMPORARY_LAYOFF');
  assert.equal(result.isEsaLayoffPermissible, true);
  assert.equal(result.hasExceededEsaThreshold, false);
  assert.equal(result.isCommonLawConstructiveDismissal, false);
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.compliancePoints.length > 0);
});

test('evaluateEsaConstructiveDismissalLayoff flags unauthorized layoff as common law constructive dismissal', () => {
  const result = evaluateEsaConstructiveDismissalLayoff({
    yearsOfService: 4,
    employeeAge: 40,
    annualSalaryCad: 80000,
    weeksOnLayoff: 6,
    employerMaintainedBenefitsOrSub: false,
    hasContractualLayoffClause: false, // No contractual authority
    employerPayrollExceeds2_5M: false
  });

  assert.equal(result.legalVerdict, 'COMMON_LAW_CONSTRUCTIVE_DISMISSAL');
  assert.equal(result.isCommonLawConstructiveDismissal, true);
  assert.ok(result.constructiveDismissalGrounds.includes('UNAUTHORIZED_COMMON_LAW_LAYOFF'));
  assert.ok(result.deficiencies.some(d => d.includes('Elsegood v. Cambridge Spring Service')));
  assert.equal(result.esaStatutoryEntitlements.noticeWeeks, 4);
});

test('evaluateEsaConstructiveDismissalLayoff detects deemed statutory termination after 14 weeks without benefits', () => {
  const result = evaluateEsaConstructiveDismissalLayoff({
    yearsOfService: 6,
    employeeAge: 45,
    annualSalaryCad: 75000,
    weeksOnLayoff: 14, // Exceeds 13 weeks without benefits
    employerMaintainedBenefitsOrSub: false,
    hasContractualLayoffClause: true,
    employerPayrollExceeds2_5M: true
  });

  assert.equal(result.legalVerdict, 'DEEMED_STATUTORY_TERMINATION_ESA');
  assert.equal(result.hasExceededEsaThreshold, true);
  assert.equal(result.layoffCategory, 'DEEMED_STATUTORY_TERMINATION');
  assert.ok(result.deficiencies.some(d => d.includes('ESA s. 56(1)(c)')));
  assert.equal(result.esaStatutoryEntitlements.noticeWeeks, 6);
  assert.equal(result.esaStatutoryEntitlements.severanceWeeks, 6);
  assert.ok(result.esaStatutoryEntitlements.totalStatutoryAmountCad > 15000);
});

test('evaluateEsaConstructiveDismissalLayoff detects 20% wage reduction and closed work permit hazard', () => {
  const result = evaluateEsaConstructiveDismissalLayoff({
    yearsOfService: 2,
    employeeAge: 29,
    annualSalaryCad: 52000,
    weeksOnLayoff: 0,
    salaryReductionPct: 20,
    hasSubstantialUnilateralDutyChange: true,
    employeeImmigrationStatus: 'closed_work_permit',
    employeeName: 'Ravi Sharma'
  });

  assert.equal(result.legalVerdict, 'COMMON_LAW_CONSTRUCTIVE_DISMISSAL');
  assert.equal(result.isCommonLawConstructiveDismissal, true);
  assert.ok(result.constructiveDismissalGrounds.includes('SUBSTANTIAL_WAGE_REDUCTION'));
  assert.ok(result.constructiveDismissalGrounds.includes('SUBSTANTIAL_DUTY_ALTERATION'));
  assert.ok(result.deficiencies.some(d => d.includes('Closed work permit holders')));
  assert.ok(result.statutoryRemedies.length > 0);
});
