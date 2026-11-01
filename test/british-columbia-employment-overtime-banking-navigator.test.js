import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_OVERTIME_CONSTANTS,
  evaluateBcOvertimeBanking
} from '../src/british-columbia-employment-overtime-banking-navigator.js';

test('BC Overtime & Time Banking - Constants reflect BC ESA ss. 35, 40, 42', () => {
  assert.equal(BC_OVERTIME_CONSTANTS.STANDARD_DAILY_HOURS, 8);
  assert.equal(BC_OVERTIME_CONSTANTS.DOUBLE_TIME_DAILY_HOURS, 12);
  assert.equal(BC_OVERTIME_CONSTANTS.OVERTIME_RATE_TIER_1, 1.5);
  assert.equal(BC_OVERTIME_CONSTANTS.OVERTIME_RATE_TIER_2, 2.0);
});

test('BC Overtime & Time Banking - Compliant 2 hours daily OT at 1.5x paid in cash', () => {
  // 2h @ $30 * 1.5 = $90
  const result = evaluateBcOvertimeBanking({
    regularHourlyWageCad: 30,
    dailyHoursWorkedOver8: 2,
    dailyHoursWorkedOver12: 0,
    wantsPaidTimeOffInsteadOfPay: false,
    overtimePaidActuallyCad: 90
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_OVERTIME_ADMINISTRATION');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.overtimeCalculation.newOvertimeEarnedCad, 90);
  assert.equal(result.overtimeCalculation.unpaidOvertimeDeficitCad, 0);
});

test('BC Overtime & Time Banking - Termination triggers mandatory payout of all banked hours', () => {
  // 10 banked hours @ $30/hr = $300 value
  const result = evaluateBcOvertimeBanking({
    regularHourlyWageCad: 30,
    dailyHoursWorkedOver8: 0,
    dailyHoursWorkedOver12: 0,
    bankedHoursAlreadyAccumulated: 10,
    employmentTerminated: true,
    overtimePaidActuallyCad: 0
  });

  assert.equal(result.complianceStatus, 'OVERTIME_WAGE_STANDARDS_BREACH');
  assert.equal(result.overtimeCalculation.totalBankedValueCad, 300);
  assert.equal(result.overtimeCalculation.unpaidOvertimeDeficitCad, 300);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_OVERTIME_WAGES'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'PAY_OUT_ALL_BANKED_OVERTIME_UPON_TERMINATION'));
});

test('BC Overtime & Time Banking - Unilateral time banking without employee written request', () => {
  const result = evaluateBcOvertimeBanking({
    wantsPaidTimeOffInsteadOfPay: true,
    employeeRequestedTimeBankInWriting: false
  });

  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNAUTHORIZED_MANDATORY_TIME_BANKING'));
});
