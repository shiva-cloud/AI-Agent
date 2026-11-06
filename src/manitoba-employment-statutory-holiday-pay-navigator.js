/**
 * Manitoba Employment Statutory General Holiday Pay Navigator
 *
 * Audits Manitoba's 9 general holidays (including Louis Riel Day and Orange Shirt Day),
 * 5% four-week lookback regular holiday pay formula, 1.5x premium pay for holiday shifts,
 * and employer compliance under The Employment Standards Code, C.C.S.M. c. E110, ss. 21–28.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { ValidationError } from './api-errors.js';
import { calculatorBoolean, calculatorDate, calculatorNumber } from './calculator-input.js';
import { boundedText, todayIso } from './text-input.js';

export const MANITOBA_HOLIDAY_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'The Employment Standards Code, C.C.S.M. c. E110, ss. 21-28',
  STATUTORY_HOLIDAY_PERCENT_FACTOR: 0.05, // 5% of gross wages in 4-week period (s. 24)
  LOOKBACK_PERIOD_WEEKS: 4,
  OVERTIME_HOLIDAY_MULTIPLIER: 1.5, // s. 25(1)
  MANITOBA_GENERAL_HOLIDAYS: Object.freeze([
    'NEW_YEARS_DAY',
    'LOUIS_RIEL_DAY',
    'GOOD_FRIDAY',
    'VICTORIA_DAY',
    'CANADA_DAY',
    'LABOUR_DAY',
    'NATIONAL_DAY_FOR_TRUTH_AND_RECONCILIATION',
    'THANKSGIVING_DAY',
    'CHRISTMAS_DAY'
  ])
});

/**
 * Audits Manitoba general holiday pay, premium rates, and employer underpayment deficits.
 *
 * @param {Object} params
 * @param {string} [params.holidayName='LOUIS_RIEL_DAY'] - Name of the general holiday
 * @param {number} [params.grossWagesInPast4WeeksCad=3600] - Regular wages earned in 4 weeks prior (excl OT)
 * @param {boolean} [params.workedOnHoliday=false] - Whether employee worked shifts on the holiday
 * @param {number} [params.hoursWorkedOnHoliday=0] - Number of hours worked on the general holiday
 * @param {number} [params.regularHourlyWageCad=22] - Regular hourly wage rate in CAD
 * @param {boolean} [params.absentWithoutConsentBeforeOrAfter=false] - Unexcused absence on shift before or after
 * @param {boolean} [params.substituteDayOffWithPayAgreed=false] - Agreement for regular pay + future paid day off
 * @param {number} [params.holidayPayActuallyPaidCad=0] - Amount employer actually paid
 * @returns {Object} Comprehensive Manitoba holiday pay audit and wage determination
 */
export function evaluateManitobaGeneralHolidayPay(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    assessmentDate = todayIso(),
    holidayName = 'LOUIS_RIEL_DAY',
    grossWagesInPast4WeeksCad = 3600,
    workedOnHoliday: worked = false,
    hoursWorkedOnHoliday = 0,
    regularHourlyWageCad = 22,
    absentWithoutConsentBeforeOrAfter: absent = false,
    substituteDayOffWithPayAgreed: substitute = false,
    holidayPayActuallyPaidCad = 0
  } = safeParams;

  const cleanEmployeeName = boundedText(employeeName, 'Employee', 100);
  const cleanAssessmentDate = calculatorDate(assessmentDate, 'assessmentDate');
  const past4WeeksWages = calculatorNumber(grossWagesInPast4WeeksCad, 'grossWagesInPast4WeeksCad', { max: 1000000 });
  const hours = calculatorNumber(hoursWorkedOnHoliday, 'hoursWorkedOnHoliday', { max: 24 });
  const wage = calculatorNumber(regularHourlyWageCad, 'regularHourlyWageCad', { max: 10000 });
  const paidActual = calculatorNumber(holidayPayActuallyPaidCad, 'holidayPayActuallyPaidCad', { max: 1000000 });
  const workedOnHoliday = calculatorBoolean(worked, 'workedOnHoliday');
  const absentWithoutConsentBeforeOrAfter = calculatorBoolean(absent, 'absentWithoutConsentBeforeOrAfter');
  const substituteDayOffWithPayAgreed = calculatorBoolean(substitute, 'substituteDayOffWithPayAgreed');

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Holiday Recognition
  const holidayKey = boundedText(holidayName, '', 60).toUpperCase();
  if (!holidayKey) throw new ValidationError('holidayName must contain a holiday name');
  const isRecognizedHoliday = MANITOBA_HOLIDAY_CONSTANTS.MANITOBA_GENERAL_HOLIDAYS.includes(holidayKey);
  if (!isRecognizedHoliday) {
    riskWarnings.push({
      warningType: 'NOT_A_MANITOBA_CODE_GENERAL_HOLIDAY',
      description: `'${holidayKey}' is not one of Manitoba's 9 statutory general holidays (e.g. Boxing Day or Civic Holiday are optional in MB).`
    });
  }

  // 2. Disqualification Audit (s. 26)
  const isDisqualified = isRecognizedHoliday && absentWithoutConsentBeforeOrAfter;
  const eligible = isRecognizedHoliday && !isDisqualified;

  // 3. Statutory 5% Holiday Pay Calculation (s. 24)
  const statutoryGeneralHolidayPayCad = eligible ? Math.round(past4WeeksWages * MANITOBA_HOLIDAY_CONSTANTS.STATUTORY_HOLIDAY_PERCENT_FACTOR * 100) / 100 : 0;

  // 4. Working on Holiday Premium (s. 25)
  let premiumHoursPayCad = 0;
  let totalStatutoryEntitlementCad = 0;

  if (!eligible) {
    totalStatutoryEntitlementCad = isDisqualified && workedOnHoliday ? Math.round(hours * wage * 100) / 100 : 0;
  } else if (!workedOnHoliday) {
    // Did not work: entitled to statutory 5% holiday pay
    totalStatutoryEntitlementCad = statutoryGeneralHolidayPayCad;
  } else {
    // Worked on holiday
    if (substituteDayOffWithPayAgreed) {
      // Regular wage for hours worked + substitute day off with pay
      premiumHoursPayCad = Math.round(hours * wage * 100) / 100;
      totalStatutoryEntitlementCad = premiumHoursPayCad;
      actionableRemedies.push({
        action: 'SCHEDULE_SUBSTITUTE_PAID_DAY_OFF',
        remedyDescription: 'Employer must provide a substitute day off with general holiday pay within 3 months.'
      });
    } else {
      // 1.5x regular wage for hours worked PLUS general holiday pay
      premiumHoursPayCad = Math.round(hours * wage * MANITOBA_HOLIDAY_CONSTANTS.OVERTIME_HOLIDAY_MULTIPLIER * 100) / 100;
      totalStatutoryEntitlementCad = Math.round((premiumHoursPayCad + statutoryGeneralHolidayPayCad) * 100) / 100;
    }
  }

  // 5. Underpayment Audit
  const wageDeficitCad = Math.max(0, Math.round((totalStatutoryEntitlementCad - paidActual) * 100) / 100);

  if (wageDeficitCad > 0) {
    statutoryViolations.push({
      rule: 'STATUTORY_HOLIDAY_WAGE_UNDERPAYMENT',
      statute: 'The Employment Standards Code ss. 24-25',
      finding: `Employer paid $${paidActual.toFixed(2)}, leaving an unpaid statutory deficit of $${wageDeficitCad.toFixed(2)}.`
    });
    actionableRemedies.push({
      action: 'FILE_MANITOBA_EMPLOYMENT_STANDARDS_CLAIM',
      remedyDescription: `File a wage claim with the Manitoba Employment Standards Branch to recover $${wageDeficitCad.toFixed(2)} plus administrative fees.`
    });
  }

  let complianceStatus = 'COMPLIANT_GENERAL_HOLIDAY_PAY';
  let legalVerdict = 'General holiday pay is fully compliant with Manitoba Employment Standards Code.';

  if (!isRecognizedHoliday) {
    complianceStatus = 'GENERAL_HOLIDAY_RULES_NOT_APPLICABLE';
    legalVerdict = 'The specified day falls outside this general holiday pay calculation. Ordinary wages are assessed separately.';
  } else if (isDisqualified && wageDeficitCad === 0) {
    complianceStatus = 'DISQUALIFIED_BY_UNEXCUSED_ABSENCE';
    legalVerdict = 'The recorded absence disqualifies the employee from general holiday pay.';
  } else if (wageDeficitCad > 0) {
    complianceStatus = 'MANITOBA_HOLIDAY_WAGE_STANDARDS_BREACH';
    legalVerdict = `Employer breached Manitoba ESC holiday wage standards. Unpaid balance of $${wageDeficitCad.toFixed(2)} is legally recoverable.`;
  }

  return {
    jurisdiction: 'MANITOBA_CANADA',
    employeeName: cleanEmployeeName,
    assessmentDate: cleanAssessmentDate,
    holidayName: holidayKey,
    workedOnHoliday,
    hoursWorkedOnHoliday: hours,
    grossWagesInPast4WeeksCad: past4WeeksWages,
    isDisqualified,
    complianceStatus,
    legalVerdict,
    holidayPayDetails: {
      statutoryGeneralHolidayPayCad,
      premiumHoursPayCad,
      totalStatutoryEntitlementCad,
      holidayPayActuallyPaidCad: paidActual,
      wageDeficitCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'The Employment Standards Code, C.C.S.M. c. E110, ss. 21-28 (General Holidays)',
      'Manitoba Employment Standards Branch Fact Sheets - General Holidays & 5% Pay Rule'
    ]
  };
}

export const calculateManitobaStatutoryHolidayPay = evaluateManitobaGeneralHolidayPay;
export const assessManitobaGeneralHolidayPay = evaluateManitobaGeneralHolidayPay;
