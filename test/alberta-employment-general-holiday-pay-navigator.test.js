import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_HOLIDAY_CONSTANTS,
  evaluateAlbertaGeneralHolidayPay
} from '../src/alberta-employment-general-holiday-pay-navigator.js';

test('Alberta General Holiday - Constants reflect ESC Part 2 Div 5', () => {
  assert.equal(ALBERTA_HOLIDAY_CONSTANTS.MIN_WORK_DAYS_IN_PAST_12_MONTHS, 30);
  assert.equal(ALBERTA_HOLIDAY_CONSTANTS.STATUTORY_HOLIDAYS_COUNT, 9);
  assert.equal(ALBERTA_HOLIDAY_CONSTANTS.AVERAGE_DAILY_WAGE_FACTOR, 0.05);
  assert.equal(ALBERTA_HOLIDAY_CONSTANTS.OVERTIME_HOLIDAY_MULTIPLIER, 1.5);
});

test('Alberta General Holiday - Regular day of work, did not work: paid average daily wage', () => {
  // $4000 in past 4 weeks * 0.05 = $200 average daily wage
  const result = evaluateAlbertaGeneralHolidayPay({
    holidayName: 'CANADA_DAY',
    workDaysInPast12Months: 60,
    isRegularDayOfWork: true,
    workedOnHoliday: false,
    wagesEarnedInPast4WeeksCad: 4000,
    holidayPayActuallyPaidCad: 200
  });

  assert.equal(result.isEligibleForHolidayPay, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_HOLIDAY_PAY');
  assert.equal(result.calculationDetails.averageDailyWageCad, 200);
  assert.equal(result.calculationDetails.statutoryHolidayPayOwedCad, 200);
  assert.equal(result.calculationDetails.wageDeficitCad, 0);
});

test('Alberta General Holiday - Regular day of work, worked 8 hours: 1.5x + average daily wage', () => {
  // 8 hours @ $25/hr * 1.5 = $300 + $200 average daily wage = $500 owed
  const result = evaluateAlbertaGeneralHolidayPay({
    workDaysInPast12Months: 90,
    isRegularDayOfWork: true,
    workedOnHoliday: true,
    hoursWorkedOnHoliday: 8,
    regularHourlyWageCad: 25,
    wagesEarnedInPast4WeeksCad: 4000,
    holidayPayActuallyPaidCad: 200 // underpaid by $300
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_HOLIDAY_PAY_UNDERPAYMENT');
  assert.equal(result.calculationDetails.statutoryHolidayPayOwedCad, 500);
  assert.equal(result.calculationDetails.wageDeficitCad, 300);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_GENERAL_HOLIDAY_UNDERPAYMENT'));
});

test('Alberta General Holiday - Not regular day of work, worked 8 hours: 1.5x pay', () => {
  // 8 hours @ $30/hr * 1.5 = $360
  const result = evaluateAlbertaGeneralHolidayPay({
    workDaysInPast12Months: 45,
    isRegularDayOfWork: false,
    workedOnHoliday: true,
    hoursWorkedOnHoliday: 8,
    regularHourlyWageCad: 30,
    holidayPayActuallyPaidCad: 360
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_HOLIDAY_PAY');
  assert.equal(result.calculationDetails.statutoryHolidayPayOwedCad, 360);
  assert.equal(result.calculationDetails.wageDeficitCad, 0);
});

test('Alberta General Holiday - Ineligible with less than 30 days worked', () => {
  const result = evaluateAlbertaGeneralHolidayPay({
    workDaysInPast12Months: 15,
    isRegularDayOfWork: true,
    workedOnHoliday: false
  });

  assert.equal(result.meets30DayThreshold, false);
  assert.equal(result.isEligibleForHolidayPay, false);
  assert.equal(result.complianceStatus, 'INELIGIBLE_UNDER_30_DAYS_TENURE');
  assert.equal(result.calculationDetails.statutoryHolidayPayOwedCad, 0);
});
