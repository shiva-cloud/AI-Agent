import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONTARIO_PUBLIC_HOLIDAY_CONSTANTS,
  evaluateOntarioPublicHolidayPay
} from '../src/ontario-employment-public-holiday-pay-calculation-navigator.js';

test('Ontario Public Holiday - Constants reflect ESA Part X', () => {
  assert.equal(ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.LOOKBACK_DIVISOR, 20);
  assert.equal(ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.OVERTIME_HOLIDAY_MULTIPLIER, 1.5);
  assert.equal(ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.SUBSTITUTE_DAY_OFF_MONTHS_WINDOW, 3);
  assert.ok(ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.ONTARIO_PUBLIC_HOLIDAYS.includes('BOXING_DAY'));
  assert.ok(ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.ONTARIO_PUBLIC_HOLIDAYS.includes('FAMILY_DAY'));
});

test('Ontario Public Holiday - Did not work: paid (3200 + 128) / 20 = $166.40', () => {
  const result = evaluateOntarioPublicHolidayPay({
    holidayName: 'FAMILY_DAY',
    regularWagesInPast4WeeksCad: 3200,
    vacationPayPayableInPast4WeeksCad: 128,
    workedShiftBeforeAndAfterHoliday: true,
    workedOnPublicHoliday: false,
    holidayPayActuallyPaidCad: 166.40
  });

  assert.equal(result.isQualified, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_PUBLIC_HOLIDAY_PAY');
  assert.equal(result.calculationSummary.statutoryPublicHolidayPayCad, 166.40);
  assert.equal(result.calculationSummary.wageDeficitCad, 0);
});

test('Ontario Public Holiday - Worked 8 hours: paid holiday pay + 1.5x hours pay', () => {
  // Holiday pay: $3200 / 20 = $160.
  // Worked: 8h @ $20/hr * 1.5 = $240. Total = $400.
  const result = evaluateOntarioPublicHolidayPay({
    holidayName: 'CHRISTMAS_DAY',
    regularWagesInPast4WeeksCad: 3200,
    vacationPayPayableInPast4WeeksCad: 0,
    workedShiftBeforeAndAfterHoliday: true,
    workedOnPublicHoliday: true,
    hoursWorkedOnHoliday: 8,
    regularHourlyWageCad: 20,
    holidayPayActuallyPaidCad: 160 // underpaid by $240
  });

  assert.equal(result.complianceStatus, 'ONTARIO_PUBLIC_HOLIDAY_WAGE_BREACH');
  assert.equal(result.calculationSummary.totalStatutoryEntitlementCad, 400);
  assert.equal(result.calculationSummary.wageDeficitCad, 240);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_PUBLIC_HOLIDAY_PAY_UNDERPAYMENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_MINISTRY_OF_LABOUR_WAGE_CLAIM'));
});

test('Ontario Public Holiday - Failed First and Last Rule without reasonable cause', () => {
  const result = evaluateOntarioPublicHolidayPay({
    workedShiftBeforeAndAfterHoliday: false,
    hadReasonableCauseForAbsence: false,
    workedOnPublicHoliday: false
  });

  assert.equal(result.isQualified, false);
  assert.equal(result.calculationSummary.statutoryPublicHolidayPayCad, 0);
  assert.equal(result.complianceStatus, 'FAILED_FIRST_AND_LAST_SHIFT_QUALIFYING_RULE');
  assert.deepEqual(result.statutoryViolations, []);
});

test('A day outside the holiday list yields no holiday entitlement or wage claim', () => {
  const result = evaluateOntarioPublicHolidayPay({ holidayName: 'CIVIC_HOLIDAY', workedOnPublicHoliday: true, hoursWorkedOnHoliday: 8 });
  assert.equal(result.complianceStatus, 'PUBLIC_HOLIDAY_RULES_NOT_APPLICABLE');
  assert.equal(result.calculationSummary.totalStatutoryEntitlementCad, 0);
  assert.deepEqual(result.actionableRemedies, []);
});

test('Missed qualifying shift preserves the worked premium in the breakdown', () => {
  const result = evaluateOntarioPublicHolidayPay({ workedShiftBeforeAndAfterHoliday: 'false', hadReasonableCauseForAbsence: 'false',
    workedOnPublicHoliday: true, hoursWorkedOnHoliday: 8, regularHourlyWageCad: 20, holidayPayActuallyPaidCad: 100 });
  assert.equal(result.calculationSummary.statutoryPublicHolidayPayCad, 0);
  assert.equal(result.calculationSummary.premiumHoursPayCad, 240);
  assert.equal(result.calculationSummary.wageDeficitCad, 140);
});
