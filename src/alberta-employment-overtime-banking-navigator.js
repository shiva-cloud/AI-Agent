/**
 * Alberta Employment Standards Code (ESC) Overtime & Banking Navigator
 *
 * Implements statutory assessment rules under:
 * - Employment Standards Code, RSA 2000, c. E-9:
 *   - Section 21: Overtime hours (The 8/44 Rule)
 *   - Section 22: Overtime rate (Minimum 1.5x regular wage)
 *   - Section 23: Overtime agreements (Banking time off at 1:1, 6-month redemption window, 1.5x payout upon expiry/termination)
 *   - Section 24: Compressed work weeks & averaging arrangements
 * - Employment Standards Regulation, Alta. Reg. 14/1997
 */

import { ValidationError } from './api-errors.js';
import { calculatorBoolean, calculatorDate, calculatorNumber } from './calculator-input.js';
import { boundedText, todayIso } from './text-input.js';

export const ALBERTA_STATUTORY_DAILY_OVERTIME_HOURS = 8;
export const ALBERTA_STATUTORY_WEEKLY_OVERTIME_HOURS = 44;
export const ALBERTA_BANKING_EXPIRY_MONTHS = 6;
export const ALBERTA_OVERTIME_MULTIPLIER = 1.5;

export function calculateAlbertaOvertimeHours(dailyHoursWorked = []) {
  if (!Array.isArray(dailyHoursWorked) || dailyHoursWorked.length > 7) {
    throw new ValidationError('dailyHoursWorked must contain at most seven daily totals for one workweek');
  }
  let totalHours = 0;
  let dailyOvertimeTotal = 0;
  for (const rawDaily of dailyHoursWorked) {
    const daily = calculatorNumber(rawDaily, 'dailyHoursWorked', {max: 24});
    totalHours += daily;
    if (daily > ALBERTA_STATUTORY_DAILY_OVERTIME_HOURS) {
      dailyOvertimeTotal += (daily - ALBERTA_STATUTORY_DAILY_OVERTIME_HOURS);
    }
  }

  const weeklyExcessHours = Math.max(0, totalHours - ALBERTA_STATUTORY_WEEKLY_OVERTIME_HOURS);
  // Alberta 8/44 rule: whichever is GREATER
  const statutoryOvertimeHours = Math.max(dailyOvertimeTotal, weeklyExcessHours);
  const regularHours = Math.max(0, totalHours - statutoryOvertimeHours);

  return {
    dailyOvertimeTotal,
    weeklyExcessHours,
    statutoryOvertimeHours,
    regularHours,
    totalHours
  };
}

function bankCreditDeadline(payPeriodEnd, months) {
  const deadline = new Date(payPeriodEnd + 'T00:00:00Z');
  const day = deadline.getUTCDate();
  deadline.setUTCDate(1);
  deadline.setUTCMonth(deadline.getUTCMonth() + months + 1, 0);
  deadline.setUTCDate(Math.min(day, deadline.getUTCDate()));
  return deadline.toISOString().slice(0, 10);
}

export function evaluateAlbertaOvertimeBanking(params = {}) {
  const {
    regularHourlyWageCad = 25,
    dailyHoursWorked = [8, 8, 8, 8, 8], // 40 hrs standard
    hasWrittenOvertimeAgreement: agreement = false,
    existingBankedHours = 0,
    monthsElapsedSinceBanked = 0,
    isEmploymentTerminating: terminating = false,
    hoursTakenAsTimeOff = 0,
    hasManagerialOrProfessionalExemption: exempt = false,
    employeeName = 'Employee',
    assessmentDate = todayIso()
  } = params;

  const cleanEmployee = boundedText(employeeName, 'Employee', 120);
  const cleanDate = calculatorDate(assessmentDate, 'assessmentDate');
  const wage = calculatorNumber(regularHourlyWageCad, 'regularHourlyWageCad', {max: 100000});
  const otRate = wage * ALBERTA_OVERTIME_MULTIPLIER;
  let existingBank = calculatorNumber(existingBankedHours, 'existingBankedHours', {max: 10000});
  const timeOffTaken = calculatorNumber(hoursTakenAsTimeOff, 'hoursTakenAsTimeOff', {max: 10000});
  const monthsElapsed = calculatorNumber(monthsElapsedSinceBanked, 'monthsElapsedSinceBanked', {max: 120, integer: true});
  const hasWrittenOvertimeAgreement = calculatorBoolean(agreement, 'hasWrittenOvertimeAgreement');
  const isEmploymentTerminating = calculatorBoolean(terminating, 'isEmploymentTerminating');
  const hasManagerialOrProfessionalExemption = calculatorBoolean(exempt, 'hasManagerialOrProfessionalExemption');
  const expiryMonths = calculatorNumber(
    params.collectiveAgreementBankingMonths === undefined ? ALBERTA_BANKING_EXPIRY_MONTHS : params.collectiveAgreementBankingMonths,
    'collectiveAgreementBankingMonths', { min: ALBERTA_BANKING_EXPIRY_MONTHS, max: 120, integer: true }
  );
  if (params.collectiveAgreementBankingMonths !== undefined && !hasWrittenOvertimeAgreement) {
    throw new ValidationError('A collective agreement banking period requires a written overtime agreement');
  }
  const credits = params.bankedCredits;
  let expiredCreditHours = 0;
  let expiredCreditPay = 0;
  let outstandingCreditPay = 0;
  if (credits !== undefined) {
    if (!Array.isArray(credits) || credits.length > 500 || existingBank || timeOffTaken || monthsElapsed) {
      throw new ValidationError('Supply up to 500 outstanding bankedCredits separately from aggregate hours, time off and elapsed months');
    }
    for (const credit of credits) {
      const end = calculatorDate(credit?.payPeriodEnd, 'payPeriodEnd');
      if (end > cleanDate) throw new ValidationError('payPeriodEnd must be on or before assessmentDate');
      const hours = calculatorNumber(credit.remainingHours, 'remainingHours', { max: 10000 });
      const rate = calculatorNumber(credit.hourlyWageWhenEarnedCad, 'hourlyWageWhenEarnedCad', { max: 100000 });
      const creditPay = hours * rate * ALBERTA_OVERTIME_MULTIPLIER;
      existingBank += hours;
      outstandingCreditPay += creditPay;
      if (cleanDate > bankCreditDeadline(end, expiryMonths)) {
        expiredCreditHours += hours;
        expiredCreditPay += creditPay;
      }
    }
    if (existingBank > 10000) throw new ValidationError('Total remainingHours must be at most 10000');
  }
  const hoursAudit = calculateAlbertaOvertimeHours(dailyHoursWorked);

  const statutoryViolations = [];
  const complianceChecklist = [];
  const riskWarnings = [];

  // Exemption check: Managers and professionals (ESC s. 2(2) / Reg)
  if (hasManagerialOrProfessionalExemption) {
    return {
      assessmentDate: cleanDate,
      jurisdiction: 'ALBERTA',
      employeeName: cleanEmployee,
      isExemptFromOvertime: true,
      exemptionReason: 'Managers, supervisors, and certain registered professionals are exempt from Alberta ESC overtime provisions.',
      overtimeHoursEarnedThisPeriod: 0,
      totalStatutoryPayoutOwedCad: 0,
      complianceStatus: 'EXEMPT_MANAGERIAL_OR_PROFESSIONAL',
      statutoryCitations: ['Employment Standards Code, RSA 2000, c. E-9, s. 2', 'Employment Standards Regulation, Alta. Reg. 14/1997']
    };
  }

  // 1. Calculate Overtime Hours for Current Period
  const newOtHours = hoursAudit.statutoryOvertimeHours;

  // 2. Validate Overtime Agreement Legality (ESC s. 23)
  let canBankOvertime = false;
  if (hasWrittenOvertimeAgreement) {
    canBankOvertime = true;
    complianceChecklist.push({
      item: 'WRITTEN_OVERTIME_AGREEMENT',
      status: 'MET',
      details: 'Written overtime agreement is in place authorizing 1:1 banking of overtime hours.'
    });
  } else {
    canBankOvertime = false;
    if (existingBank > 0) {
      statutoryViolations.push({
        violation: 'UNLAWFUL_BANKING_WITHOUT_WRITTEN_AGREEMENT',
        section: 'Alberta ESC s. 23(1)',
        details: 'Employer banked overtime hours without a valid written overtime agreement signed by the employee.'
      });
    }
  }

  // 3. Banking Balance and Expiry Audit
  // Under Alberta ESC s. 23(2), banked time must be provided within 6 months.
  // If not taken, or upon termination, it must be paid out at 1.5x regular wage rate (s. 23(3)).
  const remainingBankedHours = Math.max(0, existingBank - timeOffTaken);
  const isBankExpired = credits !== undefined ? expiredCreditHours > 0 : remainingBankedHours > 0 && monthsElapsed > expiryMonths;

  let mandatoryPayoutBankedHours = canBankOvertime ? 0 : remainingBankedHours;
  if (isEmploymentTerminating) {
    mandatoryPayoutBankedHours = remainingBankedHours;
    complianceChecklist.push({
      item: 'TERMINATION_PAYOUT_TRIGGER',
      status: 'MANDATORY_PAYOUT',
      details: 'Employment termination triggers immediate mandatory payout of all banked hours at 1.5x regular wage rate.'
    });
  } else if (isBankExpired) {
    mandatoryPayoutBankedHours = credits !== undefined && canBankOvertime ? expiredCreditHours : remainingBankedHours;
    statutoryViolations.push({
      violation: 'BANKED_HOURS_EXPIRED_UNPAID',
      section: 'Alberta ESC s. 23(3)(a)',
      details: `Banked hours have exceeded the ${expiryMonths}-month banking limit for the reported pay period. Must be paid out immediately at 1.5x overtime rate.`
    });
  }

  // 4. Financial Calculations
  // Payout for current period overtime (if not banked)
  const newlyBankedHours = canBankOvertime && !isEmploymentTerminating ? newOtHours : 0;
  const currentPayoutHours = newOtHours - newlyBankedHours;
  const currentPeriodOtPayOwed = currentPayoutHours * otRate;
  // Payout for expired or terminating banked hours (always at 1.5x)
  let bankedHoursPayoutOwed = mandatoryPayoutBankedHours * otRate;
  if (credits !== undefined) {
    bankedHoursPayoutOwed = isEmploymentTerminating || !canBankOvertime ? outstandingCreditPay : expiredCreditPay;
  }
  const totalPayoutOwedCad = currentPeriodOtPayOwed + bankedHoursPayoutOwed;

  // 5. Banking Net Balance (if not terminating and valid agreement)
  const updatedBankBalance = remainingBankedHours - mandatoryPayoutBankedHours + newlyBankedHours;

  if (canBankOvertime && !isEmploymentTerminating) {
    riskWarnings.push({
      warning: expiryMonths === 6 ? 'SIX_MONTH_EXPIRY_HORIZON' : 'COLLECTIVE_AGREEMENT_EXPIRY_HORIZON',
      details: `All newly banked hours (${newOtHours} hrs) must be taken as paid time off within ${expiryMonths} months, or employer is statutorily bound to pay them at $${otRate.toFixed(2)}/hr (1.5x).`
    });
  }

  const isCompliant = statutoryViolations.length === 0;

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA',
    employeeName: cleanEmployee,
    isExemptFromOvertime: false,
    complianceStatus: isCompliant ? 'STATUTORILY_COMPLIANT' : 'STATUTORY_DEFICIENCY_DETECTED',
    hoursAudit: {
      totalHoursWorked: hoursAudit.totalHours,
      regularHours: hoursAudit.regularHours,
      dailyOvertimeTotal: hoursAudit.dailyOvertimeTotal,
      weeklyExcessHours: hoursAudit.weeklyExcessHours,
      governingStatutoryOvertimeHours: hoursAudit.statutoryOvertimeHours,
      governingRule: hoursAudit.dailyOvertimeTotal >= hoursAudit.weeklyExcessHours ? 'DAILY_8_HOUR_THRESHOLD' : 'WEEKLY_44_HOUR_THRESHOLD'
    },
    bankingAudit: {
      hasValidWrittenAgreement: hasWrittenOvertimeAgreement,
      existingBankedHours: existingBank,
      timeOffTakenHours: timeOffTaken,
      monthsElapsedSinceBanked: monthsElapsed,
      bankingPeriodMonths: expiryMonths,
      isBankExpired,
      ...(expiryMonths === ALBERTA_BANKING_EXPIRY_MONTHS ? { isExpiredPast6Months: isBankExpired } : {}),
      isEmploymentTerminating,
      newlyBankedHours,
      activeBankBalanceHours: updatedBankBalance,
      hoursSubjectToMandatoryPayout: currentPayoutHours + mandatoryPayoutBankedHours
    },
    financialLiability: {
      regularHourlyWageCad: wage,
      statutoryOvertimeRateCad: otRate,
      currentPeriodUnbankedOtPayCad: currentPeriodOtPayOwed,
      bankedHoursPayoutCad: bankedHoursPayoutOwed,
      totalStatutoryPayoutOwedCad: totalPayoutOwedCad
    },
    statutoryViolations,
    complianceChecklist,
    riskWarnings,
    statutoryCitations: [
      'Employment Standards Code, RSA 2000, c. E-9, ss. 21, 22, 23, 24',
      'Employment Standards Regulation, Alta. Reg. 14/1997'
    ]
  };
}
