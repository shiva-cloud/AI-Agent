import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MANITOBA_HOLIDAY_CONSTANTS,
  evaluateManitobaGeneralHolidayPay
} from '../src/manitoba-employment-statutory-holiday-pay-navigator.js';

test('Manitoba General Holiday - Constants reflect MB ESC ss. 21-28', () => {
  assert.equal(MANITOBA_HOLIDAY_CONSTANTS.STATUTORY_HOLIDAY_PERCENT_FACTOR, 0.05);
  assert.equal(MANITOBA_HOLIDAY_CONSTANTS.OVERTIME_HOLIDAY_MULTIPLIER, 1.5);
  assert.ok(MANITOBA_HOLIDAY_CONSTANTS.MANITOBA_GENERAL_HOLIDAYS.includes('LOUIS_RIEL_DAY'));
  assert.ok(MANITOBA_HOLIDAY_CONSTANTS.MANITOBA_GENERAL_HOLIDAYS.includes('NATIONAL_DAY_FOR_TRUTH_AND_RECONCILIATION'));
});

test('Manitoba General Holiday - Did not work: paid 5% of past 4 weeks wages', () => {
  // $3600 in past 4 weeks * 0.05 = $180 holiday pay
  const result = evaluateManitobaGeneralHolidayPay({
    holidayName: 'LOUIS_RIEL_DAY',
    grossWagesInPast4WeeksCad: 3600,
    workedOnHoliday: false,
    holidayPayActuallyPaidCad: 180
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_GENERAL_HOLIDAY_PAY');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.holidayPayDetails.statutoryGeneralHolidayPayCad, 180);
  assert.equal(result.holidayPayDetails.wageDeficitCad, 0);
});

test('Manitoba General Holiday - Worked 8 hours: 1.5x regular pay plus 5% holiday pay', () => {
  // 8h @ $25/hr * 1.5 = $300 + $200 (5% of $4000) = $500 total entitlement
  const result = evaluateManitobaGeneralHolidayPay({
    holidayName: 'CANADA_DAY',
    grossWagesInPast4WeeksCad: 4000,
    workedOnHoliday: true,
    hoursWorkedOnHoliday: 8,
    regularHourlyWageCad: 25,
    holidayPayActuallyPaidCad: 200 // underpaid by $300
  });

  assert.equal(result.complianceStatus, 'MANITOBA_HOLIDAY_WAGE_STANDARDS_BREACH');
  assert.equal(result.holidayPayDetails.totalStatutoryEntitlementCad, 500);
  assert.equal(result.holidayPayDetails.wageDeficitCad, 300);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_HOLIDAY_WAGE_UNDERPAYMENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_MANITOBA_EMPLOYMENT_STANDARDS_CLAIM'));
});

test('Manitoba General Holiday - Disqualified due to unapproved absence before/after shift', () => {
  const result = evaluateManitobaGeneralHolidayPay({
    absentWithoutConsentBeforeOrAfter: true,
    workedOnHoliday: false
  });

  assert.equal(result.isDisqualified, true);
  assert.equal(result.holidayPayDetails.totalStatutoryEntitlementCad, 0);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'DISQUALIFIED_BY_UNEXCUSED_ABSENCE'));
});
