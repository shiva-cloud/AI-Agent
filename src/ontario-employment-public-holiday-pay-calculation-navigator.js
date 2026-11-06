/**
 * Ontario Employment Public Holiday Pay Calculation Navigator
 *
 * Audits 9 statutory public holidays under Ontario's Employment Standards Act, 2000,
 * S.O. 2000, c. 41, ss. 24–32, enforcing the 4-week lookback divided by 20 formula,
 * the "First and Last Rule" qualifying shifts, 1.5x premium pay plus holiday pay,
 * and substitute day off rules within 3 months.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, todayIso } from './text-input.js';
import { ValidationError } from './api-errors.js';
import { calculatorBoolean, calculatorDate, calculatorNumber } from './calculator-input.js';

export const ONTARIO_PUBLIC_HOLIDAY_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Employment Standards Act, 2000, S.O. 2000, c. 41, Part X ss. 24-32',
  LOOKBACK_DIVISOR: 20, // s. 24(1)
  LOOKBACK_WEEKS: 4,
  OVERTIME_HOLIDAY_MULTIPLIER: 1.5, // s. 27(3)
  SUBSTITUTE_DAY_OFF_MONTHS_WINDOW: 3, // s. 27(2)(a)
  ONTARIO_PUBLIC_HOLIDAYS: Object.freeze([
    'NEW_YEARS_DAY',
    'FAMILY_DAY',
    'GOOD_FRIDAY',
    'VICTORIA_DAY',
    'CANADA_DAY',
    'LABOUR_DAY',
    'THANKSGIVING_DAY',
    'CHRISTMAS_DAY',
    'BOXING_DAY'
  ])
});

/**
 * Audits Ontario public holiday pay calculation, qualifying shifts, and working on holiday options.
 *
 * @param {Object} params
 * @param {string} [params.holidayName='FAMILY_DAY'] - Name of the Ontario public holiday
 * @param {number} [params.regularWagesInPast4WeeksCad=3200] - Total regular wages earned in 4 work weeks prior
 * @param {number} [params.vacationPayPayableInPast4WeeksCad=128] - Vacation pay payable in 4 work weeks prior
 * @param {boolean} [params.workedShiftBeforeAndAfterHoliday=true] - Met the "First and Last" qualifying rule
 * @param {boolean} [params.hadReasonableCauseForAbsence=false] - If missed shift, had medical or legitimate cause
 * @param {boolean} [params.workedOnPublicHoliday=false] - Whether employee worked shifts on the holiday
 * @param {number} [params.hoursWorkedOnHoliday=0] - Hours worked on the public holiday
 * @param {number} [params.regularHourlyWageCad=20] - Regular hourly wage
 * @param {boolean} [params.substituteDayOffAgreed=false] - Agreement for regular pay + substitute day off
 * @param {number} [params.holidayPayActuallyPaidCad=0] - Amount employer actually paid
 * @returns {Object} Comprehensive Ontario public holiday pay audit and wage determination
 */
export function evaluateOntarioPublicHolidayPay({
  holidayName = 'FAMILY_DAY',
  regularWagesInPast4WeeksCad = 3200,
  vacationPayPayableInPast4WeeksCad = 128,
  workedShiftBeforeAndAfterHoliday = true,
  hadReasonableCauseForAbsence = false,
  workedOnPublicHoliday = false,
  hoursWorkedOnHoliday = 0,
  regularHourlyWageCad = 20,
  substituteDayOffAgreed = false,
  holidayPayActuallyPaidCad = 0,
  assessmentDate = todayIso()
} = {}) {
  const safeHolidayName = boundedText(holidayName, '', 60);
  if (!safeHolidayName) throw new ValidationError('holidayName must contain a holiday name');
  const safeAssessmentDate = calculatorDate(assessmentDate, 'assessmentDate');
  const regWages = calculatorNumber(regularWagesInPast4WeeksCad, 'regularWagesInPast4WeeksCad', { max: 10000000 });
  const vacPay = calculatorNumber(vacationPayPayableInPast4WeeksCad, 'vacationPayPayableInPast4WeeksCad', { max: 10000000 });
  const hours = calculatorNumber(hoursWorkedOnHoliday, 'hoursWorkedOnHoliday', { max: 24 });
  const wage = calculatorNumber(regularHourlyWageCad, 'regularHourlyWageCad', { max: 10000 });
  const paidActual = calculatorNumber(holidayPayActuallyPaidCad, 'holidayPayActuallyPaidCad', { max: 10000000 });
  const workedShifts = calculatorBoolean(workedShiftBeforeAndAfterHoliday, 'workedShiftBeforeAndAfterHoliday');
  const hadReasonableCause = calculatorBoolean(hadReasonableCauseForAbsence, 'hadReasonableCauseForAbsence');
  const workedHoliday = calculatorBoolean(workedOnPublicHoliday, 'workedOnPublicHoliday');
  const substituteAgreed = calculatorBoolean(substituteDayOffAgreed, 'substituteDayOffAgreed');

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Holiday Recognition
  const holidayKey = safeHolidayName.trim().toUpperCase();
  const isRecognized = ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.ONTARIO_PUBLIC_HOLIDAYS.includes(holidayKey);
  if (!isRecognized) {
    riskWarnings.push({
      warningType: 'NOT_AN_ONTARIO_ESA_PUBLIC_HOLIDAY',
      description: `'${safeHolidayName}' is not one of Ontario's 9 statutory public holidays under the ESA (e.g. Civic Holiday in August is not a statutory public holiday under the ESA).`
    });
  }

  // 2. First and Last Rule (Qualifying shifts)
  const isQualified = isRecognized && (workedShifts || hadReasonableCause);

  // 3. Statutory Public Holiday Pay Formula ((Wages + Vac) / 20)
  const statutoryPublicHolidayPayCad = isQualified
    ? Math.round(((regWages + vacPay) / ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.LOOKBACK_DIVISOR) * 100) / 100
    : 0;

  // 4. Working on Public Holiday Calculation
  let premiumHoursPayCad = 0;
  let totalStatutoryEntitlementCad = 0;

  if (!workedHoliday || !isRecognized) {
    totalStatutoryEntitlementCad = statutoryPublicHolidayPayCad;
  } else {
    if (!isQualified) {
      // Unqualified employee who worked on holiday: receives 1.5x regular rate for hours worked (s. 28)
      premiumHoursPayCad = Math.round(hours * wage * ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.OVERTIME_HOLIDAY_MULTIPLIER * 100) / 100;
      totalStatutoryEntitlementCad = premiumHoursPayCad;
    } else if (substituteAgreed) {
      // Option 1 (s. 27(2)): Regular hourly pay + substitute day off with public holiday pay
      premiumHoursPayCad = Math.round(hours * wage * 100) / 100;
      totalStatutoryEntitlementCad = premiumHoursPayCad;
      actionableRemedies.push({
        action: 'SCHEDULE_SUBSTITUTE_PAID_DAY_OFF',
        remedyDescription: `Employer must provide a substitute day off with public holiday pay ($${statutoryPublicHolidayPayCad.toFixed(2)}) within 3 months of the holiday under s. 27(2).`
      });
    } else {
      // Option 2 (s. 27(3)): Public holiday pay PLUS 1.5x premium pay for hours worked
      premiumHoursPayCad = Math.round(hours * wage * ONTARIO_PUBLIC_HOLIDAY_CONSTANTS.OVERTIME_HOLIDAY_MULTIPLIER * 100) / 100;
      totalStatutoryEntitlementCad = Math.round((statutoryPublicHolidayPayCad + premiumHoursPayCad) * 100) / 100;
    }
  }

  // 5. Underpayment Audit
  const wageDeficitCad = Math.max(0, Math.round((totalStatutoryEntitlementCad - paidActual) * 100) / 100);

  if (wageDeficitCad > 0) {
    statutoryViolations.push({
      rule: 'STATUTORY_PUBLIC_HOLIDAY_PAY_UNDERPAYMENT',
      statute: 'Employment Standards Act, 2000 Part X',
      finding: `Employer remitted $${paidActual.toFixed(2)}, leaving an unpaid statutory holiday wage deficit of $${wageDeficitCad.toFixed(2)}.`
    });
    actionableRemedies.push({
      action: 'FILE_MINISTRY_OF_LABOUR_WAGE_CLAIM',
      remedyDescription: `File a formal e-Claim with the Ontario Ministry of Labour to recover $${wageDeficitCad.toFixed(2)} plus administrative fees.`
    });
  }

  let complianceStatus = 'COMPLIANT_PUBLIC_HOLIDAY_PAY';
  let legalVerdict = 'Public holiday pay administration complies with Ontario ESA Part X standards.';

  if (!isRecognized) {
    complianceStatus = 'PUBLIC_HOLIDAY_RULES_NOT_APPLICABLE';
    legalVerdict = 'The specified day falls outside this public holiday pay calculation. Ordinary wages are assessed separately.';
  } else if (!isQualified && wageDeficitCad === 0) {
    complianceStatus = 'FAILED_FIRST_AND_LAST_SHIFT_QUALIFYING_RULE';
    legalVerdict = 'The qualifying shift requirement was not met. The recorded payments cover the amount due for this assessment.';
  } else if (wageDeficitCad > 0) {
    complianceStatus = 'ONTARIO_PUBLIC_HOLIDAY_WAGE_BREACH';
    legalVerdict = `Employer breached Ontario ESA public holiday rules. Unpaid wages of $${wageDeficitCad.toFixed(2)} are legally recoverable.`;
  }

  return {
    assessmentDate: safeAssessmentDate,
    jurisdiction: 'ONTARIO_CANADA',
    holidayName: holidayKey,
    isQualified,
    workedOnPublicHoliday: workedHoliday,
    hoursWorkedOnHoliday: hours,
    complianceStatus,
    legalVerdict,
    calculationSummary: {
      lookbackTotalGrossCad: regWages + vacPay,
      statutoryPublicHolidayPayCad,
      premiumHoursPayCad,
      totalStatutoryEntitlementCad,
      holidayPayActuallyPaidCad: paidActual,
      wageDeficitCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, 2000, S.O. 2000, c. 41, Part X ss. 24-32 (Public Holidays)',
      'Ontario Ministry of Labour Guidelines - Calculating Public Holiday Pay'
    ]
  };
}