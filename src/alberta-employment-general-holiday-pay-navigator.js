/**
 * Alberta Employment General Holiday Pay Navigator
 *
 * Audits 9 statutory general holidays, 30-work-day qualification in 12 months,
 * regular vs non-regular workday determinations, 1.5x premium pay, 5% four-week
 * average daily wage calculations, and employer pay options under Alberta's
 * Employment Standards Code, RSA 2000, c. E-9, ss. 25–33.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_HOLIDAY_CONSTANTS = Object.freeze({
  MIN_WORK_DAYS_IN_PAST_12_MONTHS: 30, // s. 26(1)(a)
  STATUTORY_HOLIDAYS_COUNT: 9, // s. 25(b)
  LOOKBACK_WEEKS_FOR_AVERAGE_DAILY_WAGE: 4,
  AVERAGE_DAILY_WAGE_FACTOR: 0.05, // 5% of wages earned in 4 weeks
  OVERTIME_HOLIDAY_MULTIPLIER: 1.5, // s. 29(1)(a)
  STATUTORY_HOLIDAYS_LIST: Object.freeze([
    'NEW_YEARS_DAY',
    'ALBERTA_FAMILY_DAY',
    'GOOD_FRIDAY',
    'VICTORIA_DAY',
    'CANADA_DAY',
    'LABOUR_DAY',
    'THANKSGIVING_DAY',
    'REMEMBRANCE_DAY',
    'CHRISTMAS_DAY'
  ]),
  STATUTORY_AUTHORITY: 'Employment Standards Code, RSA 2000, c. E-9, ss. 25-33'
});

/**
 * Audits Alberta general holiday pay eligibility, premium rates, and employer compliance.
 *
 * @param {Object} params
 * @param {string} [params.holidayName='CANADA_DAY'] - Name of the general holiday
 * @param {number} [params.workDaysInPast12Months=60] - Days worked for this employer in previous 12 months
 * @param {boolean} [params.isRegularDayOfWork=true] - Whether the day holiday falls is a regular workday for employee
 * @param {boolean} [params.workedOnHoliday=false] - Whether employee performed work on the general holiday
 * @param {number} [params.hoursWorkedOnHoliday=0] - Number of hours worked on the holiday
 * @param {number} [params.regularHourlyWageCad=25] - Regular hourly wage in CAD
 * @param {number} [params.wagesEarnedInPast4WeeksCad=4000] - Total regular, holiday, vacation wages earned in 4 weeks prior
 * @param {boolean} [params.absentWithoutConsentBeforeOrAfter=false] - Unexcused absence on shift immediately before/after holiday
 * @param {boolean} [params.futureDayOffWithPayProvided=false] - Employer provided an alternate paid day off under s. 29(1)(b)
 * @param {number} [params.holidayPayActuallyPaidCad=0] - Amount employer actually paid for holiday
 * @returns {Object} Comprehensive Alberta general holiday pay audit and wage determination
 */
export function evaluateAlbertaGeneralHolidayPay({
  holidayName = 'CANADA_DAY',
  workDaysInPast12Months = 60,
  isRegularDayOfWork = true,
  workedOnHoliday = false,
  hoursWorkedOnHoliday = 0,
  regularHourlyWageCad = 25,
  wagesEarnedInPast4WeeksCad = 4000,
  absentWithoutConsentBeforeOrAfter = false,
  futureDayOffWithPayProvided = false,
  holidayPayActuallyPaidCad = 0,
  employeeName = 'Employee',
  assessmentDate = todayIso()
} = {}) {
  const cleanHolidayName = boundedText(holidayName, 'CANADA_DAY', 60);
  const cleanEmployeeName = boundedText(employeeName, 'Employee', 120);
  const cleanDate = safeIsoDate(assessmentDate, todayIso());
  const daysWorked = Number.isFinite(Number(workDaysInPast12Months))
    ? Math.max(0, Math.min(365, Math.floor(Number(workDaysInPast12Months))))
    : 0;
  const hoursWorked = Number.isFinite(Number(hoursWorkedOnHoliday))
    ? Math.max(0, Math.min(24, Number(hoursWorkedOnHoliday)))
    : 0;
  const hourlyWage = Number.isFinite(Number(regularHourlyWageCad))
    ? Math.max(0, Math.min(10000, Number(regularHourlyWageCad)))
    : 0;
  const past4Weeks = Number.isFinite(Number(wagesEarnedInPast4WeeksCad))
    ? Math.max(0, Math.min(1_000_000, Number(wagesEarnedInPast4WeeksCad)))
    : 0;
  const paidActual = Number.isFinite(Number(holidayPayActuallyPaidCad))
    ? Math.max(0, Math.min(1_000_000, Number(holidayPayActuallyPaidCad)))
    : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. 30-Day Qualification (s. 26(1)(a))
  const meets30DayThreshold = daysWorked >= ALBERTA_HOLIDAY_CONSTANTS.MIN_WORK_DAYS_IN_PAST_12_MONTHS;
  if (!meets30DayThreshold) {
    riskWarnings.push({
      warningType: 'LESS_THAN_30_DAYS_WORKED_IN_12_MONTHS',
      description: `Employee worked ${daysWorked} days in past 12 months. Alberta ESC s. 26 requires at least 30 work days to qualify for general holiday pay.`
    });
  }

  // 2. Unapproved Absence Disqualification (s. 26(1)(b))
  let isDisqualifiedByAbsence = false;
  if (absentWithoutConsentBeforeOrAfter) {
    isDisqualifiedByAbsence = true;
    riskWarnings.push({
      warningType: 'DISQUALIFIED_DUE_TO_UNEXCUSED_ABSENCE',
      description: 'Under s. 26(1)(b), employee is not entitled to general holiday pay if absent without consent on the scheduled shift immediately preceding or following the holiday.'
    });
  }

  const isEligibleForHolidayPay = meets30DayThreshold && !isDisqualifiedByAbsence;

  // 3. Average Daily Wage Calculation (5% of 4 weeks)
  const averageDailyWageCad = Math.round(past4Weeks * ALBERTA_HOLIDAY_CONSTANTS.AVERAGE_DAILY_WAGE_FACTOR * 100) / 100;

  // 4. Pay Entitlement Calculation
  let statutoryHolidayPayOwedCad = 0;
  let calculationRuleApplied = '';

  if (!isEligibleForHolidayPay) {
    if (workedOnHoliday) {
      // Worked, but under 30 days or unapproved absence: straight hourly or regular wages
      statutoryHolidayPayOwedCad = Math.round(hoursWorked * hourlyWage * 100) / 100;
      calculationRuleApplied = 'WORKED_WHILE_INELIGIBLE_REGULAR_PAY_ONLY';
    } else {
      statutoryHolidayPayOwedCad = 0;
      calculationRuleApplied = 'INELIGIBLE_NO_PAY_REQUIRED';
    }
  } else {
    // Eligible employee
    if (isRegularDayOfWork) {
      if (!workedOnHoliday) {
        // Did not work on regular day of work: entitled to average daily wage (s. 28)
        statutoryHolidayPayOwedCad = averageDailyWageCad;
        calculationRuleApplied = 'REGULAR_WORKDAY_DID_NOT_WORK_AVERAGE_DAILY_WAGE';
      } else {
        // Worked on regular day of work (s. 29)
        if (futureDayOffWithPayProvided) {
          // Option 2: regular wage for hours worked + future paid day off
          statutoryHolidayPayOwedCad = Math.round(hoursWorked * hourlyWage * 100) / 100;
          calculationRuleApplied = 'REGULAR_WORKDAY_WORKED_REGULAR_RATE_PLUS_FUTURE_PAID_DAY';
        } else {
          // Option 1: 1.5x regular rate for hours worked + average daily wage
          const premiumHoursPay = hoursWorked * hourlyWage * ALBERTA_HOLIDAY_CONSTANTS.OVERTIME_HOLIDAY_MULTIPLIER;
          statutoryHolidayPayOwedCad = Math.round((premiumHoursPay + averageDailyWageCad) * 100) / 100;
          calculationRuleApplied = 'REGULAR_WORKDAY_WORKED_1_5X_PREMIUM_PLUS_AVERAGE_DAILY_WAGE';
        }
      }
    } else {
      // Not a regular day of work
      if (!workedOnHoliday) {
        // Did not work: no pay required (s. 30)
        statutoryHolidayPayOwedCad = 0;
        calculationRuleApplied = 'NON_REGULAR_WORKDAY_DID_NOT_WORK_NO_PAY';
      } else {
        // Worked: 1.5x regular wage rate for hours worked (s. 31)
        statutoryHolidayPayOwedCad = Math.round(hoursWorked * hourlyWage * ALBERTA_HOLIDAY_CONSTANTS.OVERTIME_HOLIDAY_MULTIPLIER * 100) / 100;
        calculationRuleApplied = 'NON_REGULAR_WORKDAY_WORKED_1_5X_PREMIUM';
      }
    }
  }

  // 5. Underpayment Audit
  const wageDeficitCad = Math.max(0, Math.round((statutoryHolidayPayOwedCad - paidActual) * 100) / 100);
  if (wageDeficitCad > 0) {
    statutoryViolations.push({
      rule: 'STATUTORY_GENERAL_HOLIDAY_UNDERPAYMENT',
      statute: 'Employment Standards Code ss. 28-31',
      finding: `Employer paid $${paidActual.toFixed(2)}, leaving an unpaid statutory deficit of $${wageDeficitCad.toFixed(2)}.`
    });
    actionableRemedies.push({
      action: 'DEMAND_HOLIDAY_PAY_OR_FILE_ES_COMPLAINT',
      remedyDescription: `Request immediate remittance of $${wageDeficitCad.toFixed(2)} or file a formal wage recovery claim with Alberta Employment Standards.`
    });
  }

  let complianceStatus = 'COMPLIANT_HOLIDAY_PAY';
  let legalVerdict = 'General holiday pay administration is compliant with Alberta Employment Standards Code.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'UNLAWFUL_HOLIDAY_PAY_UNDERPAYMENT';
    legalVerdict = `Employer failed to meet statutory holiday pay requirements under Alberta ESC ss. 25–33. Unpaid balance of $${wageDeficitCad.toFixed(2)} is legally recoverable.`;
  } else if (!meets30DayThreshold) {
    complianceStatus = 'INELIGIBLE_UNDER_30_DAYS_TENURE';
    legalVerdict = 'Employee does not yet meet the 30-work-day threshold for general holiday pay entitlement in Alberta.';
  }

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA_CANADA',
    employeeName: cleanEmployeeName,
    holidayName: cleanHolidayName,
    workDaysInPast12Months: daysWorked,
    meets30DayThreshold,
    isRegularDayOfWork,
    workedOnHoliday,
    hoursWorkedOnHoliday: hoursWorked,
    isEligibleForHolidayPay,
    complianceStatus,
    legalVerdict,
    calculationDetails: {
      calculationRuleApplied,
      regularHourlyWageCad: hourlyWage,
      wagesEarnedInPast4WeeksCad: past4Weeks,
      averageDailyWageCad,
      statutoryHolidayPayOwedCad,
      holidayPayActuallyPaidCad: paidActual,
      wageDeficitCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Code, RSA 2000, c. E-9, Part 2 Div 5 ss. 25-33 (General Holidays and General Holiday Pay)',
      'Employment Standards Regulation, Alta. Reg. 211/2004 (Average daily wage calculation formulas)'
    ]
  };
}