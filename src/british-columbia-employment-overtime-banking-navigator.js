/**
 * British Columbia Employment Overtime & Time Banking Navigator
 *
 * Audits daily and weekly overtime calculations (1.5x after 8h / 2x after 12h, 1.5x after 40h),
 * written time bank creation rules (s. 42), multiplier crediting, and mandatory payout
 * requirements upon employee request or termination under the BC Employment Standards Act,
 * RSBC 1996, c. 113, ss. 35, 40, 42.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { calculatorBoolean, calculatorDate, calculatorNumber } from './calculator-input.js';
import { boundedText, todayIso } from './text-input.js';

export const BC_OVERTIME_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Employment Standards Act, RSBC 1996, c. 113, ss. 35, 40, 42',
  STANDARD_DAILY_HOURS: 8,
  DOUBLE_TIME_DAILY_HOURS: 12,
  STANDARD_WEEKLY_HOURS: 40,
  OVERTIME_RATE_TIER_1: 1.5,
  OVERTIME_RATE_TIER_2: 2.0,
  WRITTEN_REQUEST_REQUIRED_FOR_BANKING: true // s. 42(1)
});

/**
 * Audits BC overtime entitlement, time bank conversions, and unpaid overtime wage arrears.
 *
 * @param {Object} params
 * @param {number} [params.regularHourlyWageCad=30] - Base hourly wage rate
 * @param {number} [params.dailyHoursWorkedOver8=2] - Daily hours worked beyond 8 up to 12 (at 1.5x)
 * @param {number} [params.dailyHoursWorkedOver12=0] - Daily hours worked beyond 12 (at 2.0x)
 * @param {number} [params.weeklyHoursWorkedOver40=0] - Excess weekly hours beyond 40 (excluding daily OT)
 * @param {boolean} [params.employeeRequestedTimeBankInWriting=true] - Bank created upon employee's written request
 * @param {boolean} [params.wantsPaidTimeOffInsteadOfPay=false] - Whether employee elects banked paid time off
 * @param {number} [params.bankedHoursAlreadyAccumulated=10] - Existing equivalent paid hours in time bank
 * @param {boolean} [params.employeeRequestedPayout=false] - Employee demanded cash payout of banked hours
 * @param {boolean} [params.employmentTerminated=false] - Employment ended, triggering mandatory statutory payout
 * @param {number} [params.overtimePaidActuallyCad=0] - Overtime pay actually remitted by employer
 * @returns {Object} Comprehensive BC overtime and time bank audit
 */
export function evaluateBcOvertimeBanking(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    employerName = 'Employer',
    assessmentDate = todayIso(),
    regularHourlyWageCad = 30,
    dailyHoursWorkedOver8 = 2,
    dailyHoursWorkedOver12 = 0,
    weeklyHoursWorkedOver40 = 0,
    employeeRequestedTimeBankInWriting: written = true,
    wantsPaidTimeOffInsteadOfPay: timeOff = false,
    bankedHoursAlreadyAccumulated = 10,
    employeeRequestedPayout: payout = false,
    employmentTerminated: terminated = false,
    overtimePaidActuallyCad = 0
  } = safeParams;

  const cleanEmployeeName = boundedText(employeeName, 'Employee', 100);
  const cleanEmployerName = boundedText(employerName, 'Employer', 120);
  const cleanAssessmentDate = calculatorDate(assessmentDate, 'assessmentDate');
  const wage = calculatorNumber(regularHourlyWageCad, 'regularHourlyWageCad', { max: 10000 });
  const ot15Hours = calculatorNumber(dailyHoursWorkedOver8, 'dailyHoursWorkedOver8', { max: 24 }) +
    calculatorNumber(weeklyHoursWorkedOver40, 'weeklyHoursWorkedOver40', { max: 168 });
  const ot20Hours = calculatorNumber(dailyHoursWorkedOver12, 'dailyHoursWorkedOver12', { max: 24 });
  const existingBanked = calculatorNumber(bankedHoursAlreadyAccumulated, 'bankedHoursAlreadyAccumulated', { max: 10000 });
  const paidActual = calculatorNumber(overtimePaidActuallyCad, 'overtimePaidActuallyCad', { max: 1_000_000 });
  const employeeRequestedTimeBankInWriting = calculatorBoolean(written, 'employeeRequestedTimeBankInWriting');
  const wantsPaidTimeOffInsteadOfPay = calculatorBoolean(timeOff, 'wantsPaidTimeOffInsteadOfPay');
  const employeeRequestedPayout = calculatorBoolean(payout, 'employeeRequestedPayout');
  const employmentTerminated = calculatorBoolean(terminated, 'employmentTerminated');
  const bankNewOvertime = wantsPaidTimeOffInsteadOfPay && employeeRequestedTimeBankInWriting;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Time Bank Authorization Audit (s. 42(1))
  if (wantsPaidTimeOffInsteadOfPay && !employeeRequestedTimeBankInWriting) {
    statutoryViolations.push({
      rule: 'UNAUTHORIZED_MANDATORY_TIME_BANKING',
      statute: 'Employment Standards Act s. 42(1)',
      finding: 'An employer cannot unilaterally force an employee into a time bank. Overtime banking requires the employee’s written request.'
    });
  }

  // 2. Overtime Pay Calculation & Bank Credit Calculation
  // 1 hour at 1.5x = 1.5 equivalent hours; 1 hour at 2.0x = 2.0 equivalent hours
  const newBankedEquivalentHours = Math.round(((ot15Hours * BC_OVERTIME_CONSTANTS.OVERTIME_RATE_TIER_1) +
                                              (ot20Hours * BC_OVERTIME_CONSTANTS.OVERTIME_RATE_TIER_2)) * 100) / 100;
  const totalBankedHours = Math.round((existingBanked + (bankNewOvertime ? newBankedEquivalentHours : 0)) * 100) / 100;

  // Dollar values
  const ot15PayCad = Math.round(ot15Hours * wage * BC_OVERTIME_CONSTANTS.OVERTIME_RATE_TIER_1 * 100) / 100;
  const ot20PayCad = Math.round(ot20Hours * wage * BC_OVERTIME_CONSTANTS.OVERTIME_RATE_TIER_2 * 100) / 100;
  const totalNewOvertimeEarnedCad = Math.round((ot15PayCad + ot20PayCad) * 100) / 100;
  const totalBankedValueCad = Math.round((existingBanked * wage + (bankNewOvertime ? totalNewOvertimeEarnedCad : 0)) * 100) / 100;

  // 3. Mandatory Payout on Demand or Termination (s. 42(3), 42(4))
  let totalCashOwedImmediatelyCad = 0;
  if (!bankNewOvertime) {
    totalCashOwedImmediatelyCad += totalNewOvertimeEarnedCad;
  }

  if (employmentTerminated || employeeRequestedPayout) {
    totalCashOwedImmediatelyCad = Math.round((totalCashOwedImmediatelyCad + totalBankedValueCad) * 100) / 100;
    if (employmentTerminated) {
      actionableRemedies.push({
        action: 'PAY_OUT_ALL_BANKED_OVERTIME_UPON_TERMINATION',
        remedyDescription: `Section 42(4) requires immediate payout of all $${totalBankedValueCad.toFixed(2)} banked hours upon conclusion of employment.`
      });
    }
  }

  // 4. Underpayment Deficit Audit
  const unpaidOvertimeDeficitCad = Math.max(0, Math.round((totalCashOwedImmediatelyCad - paidActual) * 100) / 100);

  if (unpaidOvertimeDeficitCad > 0) {
    statutoryViolations.push({
      rule: 'UNLAWFUL_WITHHOLDING_OF_OVERTIME_WAGES',
      statute: 'Employment Standards Act ss. 40, 42',
      finding: `Employer failed to pay statutory overtime wages of $${unpaidOvertimeDeficitCad.toFixed(2)}.`
    });
    actionableRemedies.push({
      action: 'FILE_BC_EMPLOYMENT_STANDARDS_WAGE_DISPUTE',
      remedyDescription: `File a complaint with the BC Employment Standards Branch to recover $${unpaidOvertimeDeficitCad.toFixed(2)} plus mandatory interest under s. 88.`
    });
  }

  let complianceStatus = 'COMPLIANT_OVERTIME_ADMINISTRATION';
  let legalVerdict = 'Overtime calculation and time banking comply with the BC Employment Standards Act.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'OVERTIME_WAGE_STANDARDS_BREACH';
    legalVerdict = unpaidOvertimeDeficitCad === 0
      ? 'Employer banked overtime without a written request.'
      : `Employer breached BC ESA overtime rules. Unpaid wages of $${unpaidOvertimeDeficitCad.toFixed(2)} are legally recoverable.`;
  }

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    employeeName: cleanEmployeeName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    regularHourlyWageCad: wage,
    dailyHoursAt1_5x: ot15Hours,
    dailyHoursAt2_0x: ot20Hours,
    wantsPaidTimeOffInsteadOfPay,
    employmentTerminated,
    complianceStatus,
    legalVerdict,
    overtimeCalculation: {
      newOvertimeEarnedCad: totalNewOvertimeEarnedCad,
      newBankedEquivalentHours,
      totalBankedHours,
      totalBankedValueCad,
      totalCashOwedImmediatelyCad,
      overtimePaidActuallyCad: paidActual,
      unpaidOvertimeDeficitCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, RSBC 1996, c. 113, ss. 35 (Maximum hours), 40 (Overtime wages), 42 (Time banks)',
      'BC Employment Standards Branch Interpretation Guidelines - Section 42 Time Banks'
    ]
  };
}