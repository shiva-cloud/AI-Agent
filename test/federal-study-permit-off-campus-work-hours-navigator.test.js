import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_STUDENT_WORK_CONSTANTS,
  evaluateFederalStudentOffCampusWork
} from '../src/federal-study-permit-off-campus-work-hours-navigator.js';

test('Federal Student Off-Campus Work - Constants reflect Fall 2024 policy', () => {
  assert.equal(FEDERAL_STUDENT_WORK_CONSTANTS.MAX_ACADEMIC_SESSION_WEEKLY_HOURS, 24);
  assert.equal(FEDERAL_STUDENT_WORK_CONSTANTS.UNLIMITED_HOURS_ON_SCHEDULED_BREAKS, true);
  assert.equal(FEDERAL_STUDENT_WORK_CONSTANTS.NON_COMPLIANCE_PGWP_BAR_MONTHS, 6);
});

test('Federal Student Off-Campus Work - Compliant student working 24 hours during academic term', () => {
  const result = evaluateFederalStudentOffCampusWork({
    hasValidStudyPermit: true,
    enrolledFullTimeAtDli: true,
    isInRegularAcademicSession: true,
    isOnRegularlyScheduledBreak: false,
    weeklyHoursWorkedOffCampus: 24,
    hasValidSocialInsuranceNumber: true,
    programLengthMonths: 24
  });

  assert.equal(result.isCompliant, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_STUDENT_OFF_CAMPUS_WORK');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.pgwpImpact.pgwpAtRisk, false);
});

test('Federal Student Off-Campus Work - Unlimited hours permitted on scheduled break', () => {
  const result = evaluateFederalStudentOffCampusWork({
    isInRegularAcademicSession: false,
    isOnRegularlyScheduledBreak: true,
    weeklyHoursWorkedOffCampus: 40
  });

  assert.equal(result.isCompliant, true);
  assert.equal(result.maxPermittedWeeklyHours, 'UNLIMITED');
  assert.equal(result.pgwpImpact.pgwpAtRisk, false);
});

test('Federal Student Off-Campus Work - Unauthorized work (30 hours during class term) triggers PGWP bar', () => {
  const result = evaluateFederalStudentOffCampusWork({
    isInRegularAcademicSession: true,
    isOnRegularlyScheduledBreak: false,
    weeklyHoursWorkedOffCampus: 30
  });

  assert.equal(result.isCompliant, false);
  assert.equal(result.complianceStatus, 'UNAUTHORIZED_WORK_NON_COMPLIANCE_DETECTED');
  assert.equal(result.pgwpImpact.pgwpAtRisk, true);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'EXCEEDED_24_HOUR_WEEKLY_OFF_CAMPUS_CAP'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PGWP_INADMISSIBILITY_UNAUTHORIZED_WORK'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'IMMEDIATELY_REDUCE_WORK_HOURS_TO_24_OR_LESS'));
});

test('Federal Student Off-Campus Work - Part-time student not eligible for off-campus work', () => {
  const result = evaluateFederalStudentOffCampusWork({
    enrolledFullTimeAtDli: false,
    weeklyHoursWorkedOffCampus: 10
  });

  assert.equal(result.isCompliant, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NOT_ENROLLED_FULL_TIME_AT_DLI'));
});
