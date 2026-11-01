import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUTORY_PAY_CONSTANTS,
  auditStatutoryPayAndWages
} from '../src/statutory-pay-calculator.js';

test('Statutory Pay Calculator — Constants reflect Ontario ESA standards', () => {
  assert.equal(STATUTORY_PAY_CONSTANTS.ONTARIO_OVERTIME_WEEKLY_HOURS, 44);
  assert.equal(STATUTORY_PAY_CONSTANTS.ONTARIO_OVERTIME_MULTIPLIER, 1.5);
  assert.equal(STATUTORY_PAY_CONSTANTS.ONTARIO_VACATION_RATE_UNDER_5_YEARS, 0.04);
  assert.equal(STATUTORY_PAY_CONSTANTS.ONTARIO_VACATION_RATE_5_PLUS_YEARS, 0.06);
  assert.equal(STATUTORY_PAY_CONSTANTS.ONTARIO_HOLIDAY_DIVISOR, 20);
  assert.equal(STATUTORY_PAY_CONSTANTS.ESA_LIMITATION_YEARS, 2);
});

test('Statutory Pay Calculator — Accurately computes regular wages and 4% vacation pay under 5 years', () => {
  const result = auditStatutoryPayAndWages({
    province: 'ON',
    grossHourlyWageCad: 20.0,
    hoursWorkedInPayPeriod: 80,
    tenureYears: 2.0,
    payPeriodWeeks: 2,
    statutoryHolidaysInPeriod: 0
  });

  assert.equal(result.hoursAudit.regularHours, 80);
  assert.equal(result.hoursAudit.overtimeHours, 0);
  assert.equal(result.hoursAudit.regularWagesCad, 1600);
  assert.equal(result.vacationPayAudit.statutoryVacationRatePercent, 4);
  assert.equal(result.vacationPayAudit.statutoryVacationPayAccruedCad, 64);
});

test('Statutory Pay Calculator — Steps up vacation pay to 6% for 5+ years of service', () => {
  const result = auditStatutoryPayAndWages({
    province: 'ON',
    grossHourlyWageCad: 25.0,
    hoursWorkedInPayPeriod: 80,
    tenureYears: 5.5,
    payPeriodWeeks: 2,
    statutoryHolidaysInPeriod: 0
  });

  assert.equal(result.vacationPayAudit.isFiveYearTenure, true);
  assert.equal(result.vacationPayAudit.statutoryVacationRatePercent, 6);
  assert.equal(result.vacationPayAudit.statutoryVacationPayAccruedCad, 120);
});

test('Statutory Pay Calculator — Computes Ontario public holiday pay using s. 24 formula', () => {
  // 40h/wk * $20/h = $800/wk * 4 = $3200 prior wages. Vac pay @ 4% = $128. Total = $3328 / 20 = $166.40
  const result = auditStatutoryPayAndWages({
    province: 'ON',
    grossHourlyWageCad: 20.0,
    hoursWorkedInPayPeriod: 80,
    tenureYears: 1.0,
    payPeriodWeeks: 2,
    statutoryHolidaysInPeriod: 1,
    workedOnStatHoliday: false,
    priorFourWeeksRegularWagesCad: 3200
  });

  assert.equal(result.publicHolidayAudit.statutoryHolidaysInPeriod, 1);
  assert.equal(result.publicHolidayAudit.publicHolidayPayCad, 166.4);
  assert.equal(result.publicHolidayAudit.holidayPremiumPayCad, 0);
  assert.equal(result.publicHolidayAudit.totalHolidayEntitlementCad, 166.4);
});

test('Statutory Pay Calculator — Adds 1.5x premium pay for working on a statutory holiday', () => {
  const result = auditStatutoryPayAndWages({
    province: 'ON',
    grossHourlyWageCad: 20.0,
    hoursWorkedInPayPeriod: 80,
    tenureYears: 1.0,
    statutoryHolidaysInPeriod: 1,
    workedOnStatHoliday: true,
    hoursWorkedOnStatHoliday: 8,
    priorFourWeeksRegularWagesCad: 3200
  });

  // 8h * $20 * 1.5 = $240 premium pay
  assert.equal(result.publicHolidayAudit.holidayPremiumPayCad, 240);
  assert.equal(result.publicHolidayAudit.totalHolidayEntitlementCad, 406.4);
});

test('Statutory Pay Calculator — Flags unlawful till cash shortage deduction under ESA s. 13(2)', () => {
  const result = auditStatutoryPayAndWages({
    province: 'ON',
    grossHourlyWageCad: 18.0,
    hoursWorkedInPayPeriod: 70,
    unauthorizedDeductionsCad: 120,
    deductionReason: 'cash_shortage'
  });

  assert.equal(result.deductionsAudit.isDeductionUnlawful, true);
  assert.equal(result.deductionsAudit.recoverableDeductionCad, 120);
  assert.ok(result.deductionsAudit.statutoryViolationDetail.includes('cash shortages or till discrepancies'));
  assert.ok(result.wageClaimSummary.hasViableWageClaim);
});

test('Statutory Pay Calculator — Applies BC 40-hour overtime weekly threshold', () => {
  const result = auditStatutoryPayAndWages({
    province: 'BC',
    grossHourlyWageCad: 30.0,
    hoursWorkedInPayPeriod: 90,
    payPeriodWeeks: 2,
    statutoryHolidaysInPeriod: 0
  });

  // BC threshold is 40h/wk * 2 = 80h regular, 10h overtime
  assert.equal(result.hoursAudit.weeklyThreshold, 40);
  assert.equal(result.hoursAudit.regularHours, 80);
  assert.equal(result.hoursAudit.overtimeHours, 10);
  assert.equal(result.hoursAudit.overtimeWagesCad, 450); // 10h * $30 * 1.5
});
