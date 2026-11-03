/**
 * Statutory Pay Stub, Vacation Pay, Public Holiday Pay & Wage Theft Defense Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Ontario Employment Standards Act, 2000 (ESA), S.O. 2000, c. 41:
 *   - Part V, s. 12 (Wage statements / pay stubs), s. 13 (Prohibition on deductions)
 *   - Part VII, s. 22 (Overtime pay at 1.5x after 44 hours/week)
 *   - Part VIII, ss. 33, 35.2 (Vacation time & pay: 4% < 5 years, 6% >= 5 years)
 *   - Part X, ss. 24-32 (Public holidays: 4-week prior wages / 20 formula; 1.5x premium pay)
 *   - Part XXI, ss. 96-115 (Ministry of Labour wage claims, 2-year limitation period s. 111)
 * - British Columbia Employment Standards Act, RSBC 1996, c. 113 (ss. 17, 21, 40, 44-48, 58)
 * - Alberta Employment Standards Code, RSA 2000, c. E-9 (ss. 14, 21-33)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const STATUTORY_PAY_CONSTANTS = Object.freeze({
  ONTARIO_OVERTIME_WEEKLY_HOURS: 44,
  ONTARIO_OVERTIME_MULTIPLIER: 1.5,
  ONTARIO_VACATION_RATE_UNDER_5_YEARS: 0.04,
  ONTARIO_VACATION_RATE_5_PLUS_YEARS: 0.06,
  ONTARIO_HOLIDAY_DIVISOR: 20,
  BC_OVERTIME_WEEKLY_HOURS: 40,
  BC_OVERTIME_DAILY_HOURS: 8,
  ALBERTA_OVERTIME_WEEKLY_HOURS: 44,
  ALBERTA_OVERTIME_DAILY_HOURS: 8,
  ESA_LIMITATION_YEARS: 2,
  MLITSD_ADMIN_PENALTY_PERCENT: 10
});

/**
 * Diagnostic calculation of statutory vacation pay, public holiday pay, overtime entitlement,
 * unlawful payroll deductions under ESA s. 13, and total recoverable wage theft claims.
 */
export function auditStatutoryPayAndWages({
  province = 'ON',
  grossHourlyWageCad = 22.0,
  hoursWorkedInPayPeriod = 88,
  tenureYears = 2.0,
  payPeriodWeeks = 2,
  weeklyHoursArray = null,
  statutoryHolidaysInPeriod = 1,
  workedOnStatHoliday = false,
  hoursWorkedOnStatHoliday = 0,
  unauthorizedDeductionsCad = 0,
  deductionReason = 'none',
  vacationPayPaidCad = 0,
  priorFourWeeksRegularWagesCad = null,
  employeeName = 'Employee',
  employerName = 'Employer',
  assessmentDate = todayIso()
} = {}) {
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const safeEmployee = boundedText(employeeName, 'Employee', 120);
  const safeEmployer = boundedText(employerName, 'Employer', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const hourlyRate = Number.isFinite(Number(grossHourlyWageCad)) ? Math.max(0, Math.min(100000, Number(grossHourlyWageCad))) : 0;
  const totalHours = Number.isFinite(Number(hoursWorkedInPayPeriod)) ? Math.max(0, Math.min(1000, Number(hoursWorkedInPayPeriod))) : 0;
  const tenure = Number.isFinite(Number(tenureYears)) ? Math.max(0, Math.min(60, Number(tenureYears))) : 0;
  const weeks = Number.isFinite(Number(payPeriodWeeks)) ? Math.max(1, Math.min(52, Math.floor(Number(payPeriodWeeks)))) : 2;
  const statHolidays = Number.isFinite(Number(statutoryHolidaysInPeriod)) ? Math.max(0, Math.min(50, Math.floor(Number(statutoryHolidaysInPeriod)))) : 0;
  const workedHoliday = Boolean(workedOnStatHoliday);
  const holidayHoursWorked = Number.isFinite(Number(hoursWorkedOnStatHoliday)) ? Math.max(0, Math.min(500, Number(hoursWorkedOnStatHoliday))) : 0;
  const deductions = Number.isFinite(Number(unauthorizedDeductionsCad)) ? Math.max(0, Math.min(1000000, Number(unauthorizedDeductionsCad))) : 0;
  const reason = boundedText(deductionReason, 'none', 50).toLowerCase();
  const vacPaid = Number.isFinite(Number(vacationPayPaidCad)) ? Math.max(0, Math.min(1000000, Number(vacationPayPaidCad))) : 0;

  // 1. Overtime Calculation
  let weeklyThreshold = STATUTORY_PAY_CONSTANTS.ONTARIO_OVERTIME_WEEKLY_HOURS;
  if (prov === 'BC') weeklyThreshold = STATUTORY_PAY_CONSTANTS.BC_OVERTIME_WEEKLY_HOURS;
  if (prov === 'AB') weeklyThreshold = STATUTORY_PAY_CONSTANTS.ALBERTA_OVERTIME_WEEKLY_HOURS;

  let regularHours = 0;
  let overtimeHours = 0;

  if (Array.isArray(weeklyHoursArray) && weeklyHoursArray.length > 0) {
    weeklyHoursArray.slice(0, 52).forEach(hrs => {
      const h = Number.isFinite(Number(hrs)) ? Math.max(0, Number(hrs)) : 0;
      if (h > weeklyThreshold) {
        regularHours += weeklyThreshold;
        overtimeHours += (h - weeklyThreshold);
      } else {
        regularHours += h;
      }
    });
  } else {
    const avgWeeklyHours = totalHours / weeks;
    if (avgWeeklyHours > weeklyThreshold) {
      regularHours = weeklyThreshold * weeks;
      overtimeHours = (avgWeeklyHours - weeklyThreshold) * weeks;
    } else {
      regularHours = totalHours;
      overtimeHours = 0;
    }
  }

  const regularWagesCad = Math.round(regularHours * hourlyRate * 100) / 100;
  const overtimeWagesCad = Math.round(overtimeHours * hourlyRate * STATUTORY_PAY_CONSTANTS.ONTARIO_OVERTIME_MULTIPLIER * 100) / 100;
  const grossEarnedWagesCad = Math.round((regularWagesCad + overtimeWagesCad) * 100) / 100;

  // 2. Statutory Vacation Pay Audit (ESA Part VIII ss. 33, 35.2)
  const is5PlusYears = tenure >= 5.0;
  const statutoryVacationRatePercent = is5PlusYears
    ? STATUTORY_PAY_CONSTANTS.ONTARIO_VACATION_RATE_5_PLUS_YEARS * 100
    : STATUTORY_PAY_CONSTANTS.ONTARIO_VACATION_RATE_UNDER_5_YEARS * 100;
  const vacationPayMultiplier = statutoryVacationRatePercent / 100;
  const statutoryVacationPayAccruedCad = Math.round(grossEarnedWagesCad * vacationPayMultiplier * 100) / 100;
  const underpaidVacationPayCad = Math.max(0, Math.round((statutoryVacationPayAccruedCad - vacPaid) * 100) / 100);

  // 3. Public Holiday Pay Audit (ESA Part X s. 24)
  let publicHolidayPayCad = 0;
  let holidayPremiumPayCad = 0;
  let holidayCalculationBasis = '';

  if (statHolidays > 0) {
    // Ontario formula: (wages earned in 4 work weeks prior + vacation pay payable) / 20
    const baselineFourWeeksWages = (priorFourWeeksRegularWagesCad !== null && Number(priorFourWeeksRegularWagesCad) >= 0)
      ? Number(priorFourWeeksRegularWagesCad)
      : (hourlyRate * (totalHours / weeks) * 4);

    const fourWeeksVacPay = baselineFourWeeksWages * vacationPayMultiplier;
    const avgDailyHolidayPayCad = Math.round(((baselineFourWeeksWages + fourWeeksVacPay) / STATUTORY_PAY_CONSTANTS.ONTARIO_HOLIDAY_DIVISOR) * 100) / 100;
    publicHolidayPayCad = Math.round(avgDailyHolidayPayCad * statHolidays * 100) / 100;

    holidayCalculationBasis = `Ontario ESA s. 24(1)(a) statutory formula: ($${Math.round(baselineFourWeeksWages)} wages + $${Math.round(fourWeeksVacPay)} vac pay in prior 4 weeks) / 20 = $${avgDailyHolidayPayCad.toFixed(2)}/day × ${statHolidays} holiday(s).`;

    if (workedHoliday && holidayHoursWorked > 0) {
      // 1.5x premium pay for hours worked on the statutory holiday
      holidayPremiumPayCad = Math.round(holidayHoursWorked * hourlyRate * STATUTORY_PAY_CONSTANTS.ONTARIO_OVERTIME_MULTIPLIER * 100) / 100;
    }
  }

  const totalHolidayEntitlementCad = Math.round((publicHolidayPayCad + holidayPremiumPayCad) * 100) / 100;

  // 4. Unlawful Wage Deductions Audit (ESA Part V s. 13)
  let isDeductionUnlawful = false;
  let deductionStatutoryViolation = null;
  let recoverableDeductionCad = 0;

  if (deductions > 0) {
    if (reason === 'cash_shortage') {
      isDeductionUnlawful = true;
      deductionStatutoryViolation = 'Ontario ESA s. 13(2) & s. 13(3): Employers cannot deduct wages for cash shortages or till discrepancies if more than one individual had access to the cash register or cash box.';
      recoverableDeductionCad = deductions;
    } else if (reason === 'faulty_workmanship' || reason === 'equipment_damage') {
      isDeductionUnlawful = true;
      deductionStatutoryViolation = 'Ontario ESA s. 13(1) & O. Reg. 285/01: Strict prohibition on deductions for faulty workmanship, customer non-payment, broken equipment, or business losses. Deducting for breakage constitutes unlawful wage theft.';
      recoverableDeductionCad = deductions;
    } else if (reason === 'uniform_training') {
      isDeductionUnlawful = true;
      deductionStatutoryViolation = 'Ontario ESA s. 13(1): Employer cannot deduct mandatory uniform fees or required job training costs without clear written authorization, and deductions cannot reduce gross pay below statutory minimum wage.';
      recoverableDeductionCad = deductions;
    } else {
      isDeductionUnlawful = false;
      deductionStatutoryViolation = 'Statutory deductions (CPP, EI, income tax) or court-ordered garnishments are legally permitted under ESA s. 13(2).';
      recoverableDeductionCad = 0;
    }
  }

  // 5. Total Statutory Wage Summary & Recoverable Wage Claim
  const correctGrossStatutoryPayCad = Math.round((grossEarnedWagesCad + totalHolidayEntitlementCad + (vacPaid === 0 ? statutoryVacationPayAccruedCad : 0)) * 100) / 100;
  const totalRecoverableWageClaimCad = Math.round((overtimeWagesCad + underpaidVacationPayCad + totalHolidayEntitlementCad + recoverableDeductionCad) * 100) / 100;

  // 6. Action Roadmap & Legal Protections
  const actionPlan = [
    {
      step: 1,
      title: 'Review Pay Statement Against Statutory Requirements',
      action: 'Check that your wage statement includes gross wages, pay period dates, hourly rate, hours worked, vacation pay accrual, and itemized deductions (ESA s. 12).'
    },
    {
      step: 2,
      title: 'Document Overtime & Public Holiday Hours',
      action: `Maintain independent contemporaneous records of your hours worked. Weekly hours beyond ${weeklyThreshold}h must be compensated at 1.5× under ESA s. 22.`
    },
    {
      step: 3,
      title: 'Submit Formal Written Wage Rectification Request',
      action: 'Send an email or letter to employer payroll citing ESA s. 13 (unlawful deductions), s. 24 (holiday pay formula), and s. 35.2 (vacation pay).'
    },
    {
      step: 4,
      title: 'File an Employment Standards Claim with the Ministry of Labour',
      action: 'If unresolved within 14 days, file a free online ESA wage claim with the Ministry of Labour (MLITSD). An Employment Standards Officer can order repayment plus 10% administrative penalties.'
    }
  ];

  const warnings = [
    'Statutory limitation period: You must file your Ministry of Labour wage claim within 2 years of the date the wages were due (ESA s. 111(1)).',
    'Anti-reprisal protection: Under Ontario ESA s. 74, it is unlawful for an employer to intimidate, dismiss, penalize, or threaten an employee for inquiring about or exercising ESA rights.',
    'Vacation pay must be accumulated and paid on gross earnings; it cannot be rolled into base minimum wage without explicit itemization on every wage statement.'
  ];

  return {
    employeeName: safeEmployee,
    employerName: safeEmployer,
    assessmentDate: safeAssessmentDate,
    province: prov,
    hourlyRateCad: hourlyRate,
    tenureYears: tenure,
    hoursAudit: {
      totalHours,
      weeklyThreshold,
      regularHours,
      overtimeHours,
      regularWagesCad,
      overtimeWagesCad,
      grossEarnedWagesCad
    },
    vacationPayAudit: {
      tenureYears: tenure,
      isFiveYearTenure: is5PlusYears,
      statutoryVacationRatePercent,
      statutoryVacationPayAccruedCad,
      vacationPayPaidCad: vacPaid,
      underpaidVacationPayCad
    },
    publicHolidayAudit: {
      statutoryHolidaysInPeriod: statHolidays,
      workedOnStatHoliday: workedHoliday,
      hoursWorkedOnStatHoliday: holidayHoursWorked,
      publicHolidayPayCad,
      holidayPremiumPayCad,
      totalHolidayEntitlementCad,
      calculationBasis: holidayCalculationBasis
    },
    deductionsAudit: {
      totalDeductionsCad: deductions,
      deductionReason: reason,
      isDeductionUnlawful,
      statutoryViolationDetail: deductionStatutoryViolation,
      recoverableDeductionCad
    },
    wageClaimSummary: {
      correctGrossStatutoryPayCad,
      totalRecoverableWageClaimCad,
      hasViableWageClaim: totalRecoverableWageClaimCad > 0
    },
    actionPlan,
    warnings,
    statutoryCitations: [
      'Ontario Employment Standards Act, 2000, S.O. 2000, c. 41, s. 12 (Wage Statements)',
      'Ontario Employment Standards Act, 2000, s. 13 (Prohibition on Unauthorized Deductions)',
      'Ontario Employment Standards Act, 2000, s. 22 (Overtime Pay Thresholds & 1.5x Premium)',
      'Ontario Employment Standards Act, 2000, s. 24 & s. 26 (Public Holiday Pay & Premium Pay)',
      'Ontario Employment Standards Act, 2000, ss. 33, 35.2 (Vacation Entitlement: 4% vs 6%)',
      'Ontario Employment Standards Act, 2000, s. 74 (Reprisal Protections)',
      'Ontario Employment Standards Act, 2000, s. 111 (2-Year Statutory Claim Limitation)'
    ]
  };
}
