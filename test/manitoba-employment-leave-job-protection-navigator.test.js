import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateManitobaEmploymentLeave,
  MANITOBA_SERVICE_REQUIREMENTS,
  MANITOBA_MAX_LEAVE_WEEKS
} from '../src/manitoba-employment-leave-job-protection-navigator.js';

test('Manitoba Leave - Eligible Maternity Leave (8 months service, doctor note)', () => {
  const result = evaluateManitobaEmploymentLeave({
    leaveType: 'MATERNITY',
    monthsOfContinuousService: 8,
    weeksRequested: 17,
    hasMedicalCertificateProvided: true,
    employerRefusedLeave: false
  });

  assert.equal(result.isEligibleForLeave, true);
  assert.equal(result.complianceStatus, 'STATUTORILY_COMPLIANT');
  assert.equal(result.leaveAudit.maxStatutoryWeeks, 17);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Manitoba Leave - Interpersonal Violence Leave with 5 paid days entitlement', () => {
  const result = evaluateManitobaEmploymentLeave({
    leaveType: 'INTERPERSONAL_VIOLENCE',
    daysOfContinuousService: 120, // > 90 days
    interpersonalViolenceDaysRequested: 5,
    regularHourlyWageCad: 25,
    regularWeeklyHours: 40 // 8 hrs/day -> 5 days * 8 hrs * $25 = $1000
  });

  assert.equal(result.isEligibleForLeave, true);
  assert.equal(result.leaveAudit.paidDaysEntitlement, 5);
  assert.equal(result.leaveAudit.statutoryPaidLeaveCompensationCad, 1000);
  assert.equal(result.complianceStatus, 'STATUTORILY_COMPLIANT');
});

test('Manitoba Leave - Employer Reprisal & Unlawful Dismissal for taking Parental Leave', () => {
  const result = evaluateManitobaEmploymentLeave({
    leaveType: 'PARENTAL',
    monthsOfContinuousService: 12,
    weeksRequested: 40,
    employerDismissedOrDisciplinedEmployee: true,
    employerRefusesReinstatementToSameOrComparableRole: true
  });

  assert.equal(result.complianceStatus, 'STATUTORY_DEFICIENCY_DETECTED');
  assert.ok(result.statutoryViolations.some(v => v.violation === 'STATUTORY_REPRISAL_AND_UNLAWFUL_TERMINATION'));
  assert.ok(result.statutoryViolations.some(v => v.violation === 'FAILURE_TO_REINSTATE_TO_COMPARABLE_POSITION'));
  assert.ok(result.actionableRemedies.some(r => r.includes('Manitoba Labour Board')));
});

test('Manitoba Leave - Insufficient tenure for Maternity Leave (< 7 months)', () => {
  const result = evaluateManitobaEmploymentLeave({
    leaveType: 'MATERNITY',
    monthsOfContinuousService: 4, // Under 7 months
    weeksRequested: 17,
    hasMedicalCertificateProvided: true
  });

  assert.equal(result.isEligibleForLeave, false);
  assert.ok(result.statutoryViolations.some(v => v.violation === 'INSUFFICIENT_SERVICE_TENURE'));
});

test('Manitoba Leave - Verify Constants', () => {
  assert.equal(MANITOBA_SERVICE_REQUIREMENTS.MATERNITY_LEAVE_MONTHS, 7);
  assert.equal(MANITOBA_SERVICE_REQUIREMENTS.PARENTAL_LEAVE_MONTHS, 7);
  assert.equal(MANITOBA_MAX_LEAVE_WEEKS.PARENTAL, 63);
});
