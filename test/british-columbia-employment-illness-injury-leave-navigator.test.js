import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_SICK_LEAVE_CONSTANTS,
  evaluateBcIllnessInjuryLeave
} from '../src/british-columbia-employment-illness-injury-leave-navigator.js';

test('BC Illness or Injury Leave - Constants reflect BC ESA s. 49.1', () => {
  assert.equal(BC_SICK_LEAVE_CONSTANTS.MIN_SERVICE_DAYS_REQUIRED, 90);
  assert.equal(BC_SICK_LEAVE_CONSTANTS.MAX_PAID_SICK_DAYS_PER_CALENDAR_YEAR, 5);
  assert.equal(BC_SICK_LEAVE_CONSTANTS.MAX_UNPAID_SICK_DAYS_PER_CALENDAR_YEAR, 3);
  assert.equal(BC_SICK_LEAVE_CONSTANTS.LOOKBACK_DAYS_FOR_AVERAGE_PAY, 30);
});

test('BC Illness or Injury Leave - Fully eligible 1-day paid sick leave calculation', () => {
  // $3200 earned in 20 days worked = $160/day
  const result = evaluateBcIllnessInjuryLeave({
    consecutiveDaysEmployed: 120,
    paidSickDaysTakenThisYear: 0,
    paidSickDaysRequested: 1,
    wagesEarnedInPast30DaysCad: 3200,
    daysWorkedInPast30Days: 20,
    employerRefusedPaidSickDays: false,
    employerDisciplinedOrDismissedForLeave: false
  });

  assert.equal(result.meets90DayThreshold, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_STATUTORY_SICK_LEAVE');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.leaveSummary.statutoryPaidDaysApproved, 1);
  assert.equal(result.leaveSummary.averageDailyWageCad, 160);
  assert.equal(result.leaveSummary.totalPaidSickPayOwedCad, 160);
});

test('BC Illness or Injury Leave - Ineligible when under 90 days of employment', () => {
  const result = evaluateBcIllnessInjuryLeave({
    consecutiveDaysEmployed: 45,
    paidSickDaysRequested: 2
  });

  assert.equal(result.meets90DayThreshold, false);
  assert.equal(result.complianceStatus, 'INELIGIBLE_UNDER_90_DAYS_TENURE');
  assert.equal(result.leaveSummary.statutoryPaidDaysApproved, 0);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'BELOW_90_DAY_STATUTORY_QUALIFICATION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'ACCRUE_REMAINING_CALENDAR_DAYS'));
});

test('BC Illness or Injury Leave - Employer refuses to pay statutory sick pay (s. 49.1(2) violation)', () => {
  const result = evaluateBcIllnessInjuryLeave({
    consecutiveDaysEmployed: 180,
    paidSickDaysTakenThisYear: 1,
    paidSickDaysRequested: 2,
    wagesEarnedInPast30DaysCad: 4000,
    daysWorkedInPast30Days: 20,
    employerRefusedPaidSickDays: true
  });

  assert.equal(result.complianceStatus, 'EMPLOYER_STATUTORY_VIOLATION_DETECTED');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_PAID_SICK_LEAVE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_BC_EMPLOYMENT_STANDARDS_WAGE_CLAIM'));
  assert.equal(result.leaveSummary.averageDailyWageCad, 200);
  assert.equal(result.leaveSummary.totalPaidSickPayOwedCad, 400); // 2 days * $200
});

test('BC Illness or Injury Leave - Reprisal dismissal for taking sick leave (s. 83 violation)', () => {
  const result = evaluateBcIllnessInjuryLeave({
    consecutiveDaysEmployed: 200,
    employerDisciplinedOrDismissedForLeave: true
  });

  assert.equal(result.complianceStatus, 'EMPLOYER_STATUTORY_VIOLATION_DETECTED');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_REPRISAL_SICK_LEAVE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_REPRISAL_COMPLAINT_REINSTATEMENT_LOST_WAGES'));
});
