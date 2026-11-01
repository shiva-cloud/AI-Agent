import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStatutorySeveranceNotice, SEVERANCE_CONSTANTS } from '../src/statutory-severance-notice-navigator.js';

test('Severance & Notice Navigator — Constants reflect Ontario ESA standards', () => {
  assert.equal(SEVERANCE_CONSTANTS.MAX_ESA_STATUTORY_NOTICE_WEEKS, 8);
  assert.equal(SEVERANCE_CONSTANTS.MAX_ESA_STATUTORY_SEVERANCE_WEEKS, 26);
  assert.equal(SEVERANCE_CONSTANTS.ONTARIO_SEVERANCE_PAYROLL_THRESHOLD_CAD, 2500000.0);
  assert.equal(SEVERANCE_CONSTANTS.MIN_YEARS_SERVICE_FOR_STATUTORY_SEVERANCE, 5);
  assert.equal(SEVERANCE_CONSTANTS.MAX_COMMON_LAW_NOTICE_MONTHS_CEILING, 24);
});

test('Severance & Notice Navigator — Computes ESA notice and severance for 7-year employee at large firm', () => {
  const result = evaluateStatutorySeveranceNotice({
    yearsOfService: 7.0,
    employeeAgeYears: 42,
    annualSalaryCad: 104000, // $2,000/week
    province: 'ON',
    employerPayrollExceeds2_5Million: true,
    hasSignedTerminationClause: false
  });

  // 7 weeks notice = $14,000; 7 weeks severance = $14,000; total = $28,000
  assert.equal(result.statutoryEsaAudit.statutoryNoticeWeeks, 7);
  assert.equal(result.statutoryEsaAudit.qualifiesForStatutorySeverancePay, true);
  assert.equal(result.statutoryEsaAudit.statutorySeveranceWeeks, 7.0);
  assert.equal(result.statutoryEsaAudit.totalStatutoryMinimumCad, 28000.0);
  assert.equal(result.enforceabilityAudit.isClauseEnforceable, false);
  assert.equal(result.enforceabilityAudit.recommendedLegalClaim, 'COMMON_LAW_NOTICE');
});

test('Severance & Notice Navigator — Waksdale invalidation restores full common law notice', () => {
  const result = evaluateStatutorySeveranceNotice({
    yearsOfService: 5.0,
    employeeAgeYears: 50,
    annualSalaryCad: 78000,
    roleSeniority: 'managerial_professional',
    hasSignedTerminationClause: true,
    terminationClauseViolatesEsa: true
  });

  assert.equal(result.enforceabilityAudit.isClauseEnforceable, false);
  assert.ok(result.statutoryProtections.some(p => p.includes('Waksdale v. Swegon')));
  assert.ok(result.commonLawAssessment.estimatedNoticeMonths >= 6.0);
});

test('Severance & Notice Navigator — Caps statutory notice at 8 weeks and severance at 26 weeks', () => {
  const result = evaluateStatutorySeveranceNotice({
    yearsOfService: 30.0,
    province: 'ON',
    employerPayrollExceeds2_5Million: true
  });

  assert.equal(result.statutoryEsaAudit.statutoryNoticeWeeks, 8);
  assert.equal(result.statutoryEsaAudit.statutorySeveranceWeeks, 26);
});

test('Severance & Notice Navigator — Excludes statutory severance for service under 5 years', () => {
  const result = evaluateStatutorySeveranceNotice({
    yearsOfService: 4.0,
    province: 'ON',
    employerPayrollExceeds2_5Million: true
  });

  assert.equal(result.statutoryEsaAudit.qualifiesForStatutorySeverancePay, false);
  assert.equal(result.statutoryEsaAudit.statutorySeveranceWeeks, 0);
  assert.equal(result.statutoryEsaAudit.statutoryNoticeWeeks, 4);
});
