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

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_STATUTORY_DAILY_OVERTIME_HOURS = 8;
export const ALBERTA_STATUTORY_WEEKLY_OVERTIME_HOURS = 44;
export const ALBERTA_BANKING_EXPIRY_MONTHS = 6;
export const ALBERTA_OVERTIME_MULTIPLIER = 1.5;

export function calculateAlbertaOvertimeHours(dailyHoursWorked = []) {
  if (!Array.isArray(dailyHoursWorked) || dailyHoursWorked.length === 0) {
    return {
      dailyOvertimeTotal: 0,
      weeklyExcessHours: 0,
      statutoryOvertimeHours: 0,
      regularHours: 0,
      totalHours: 0
    };
  }

  let totalHours = 0;
  let dailyOvertimeTotal = 0;

  const hoursArray = Array.isArray(dailyHoursWorked) ? dailyHoursWorked.slice(0, 31) : [];
  for (const rawDaily of hoursArray) {
    const daily = Number.isFinite(Number(rawDaily)) ? Math.max(0, Number(rawDaily)) : 0;
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

export function evaluateAlbertaOvertimeBanking(params = {}) {
  const {
    regularHourlyWageCad = 25,
    dailyHoursWorked = [8, 8, 8, 8, 8], // 40 hrs standard
    hasWrittenOvertimeAgreement = false,
    existingBankedHours = 0,
    monthsElapsedSinceBanked = 0,
    isEmploymentTerminating = false,
    hoursTakenAsTimeOff = 0,
    hasManagerialOrProfessionalExemption = false,
    employeeName = 'Employee',
    assessmentDate = todayIso()
  } = params;

  const cleanEmployee = boundedText(employeeName, 'Employee', 120);
  const cleanDate = safeIsoDate(assessmentDate, todayIso());
  const wage = Number.isFinite(Number(regularHourlyWageCad)) ? Math.max(0, Math.min(100_000, Number(regularHourlyWageCad))) : 0;
  const otRate = wage * ALBERTA_OVERTIME_MULTIPLIER;
  const existingBank = Number.isFinite(Number(existingBankedHours)) ? Math.max(0, Math.min(10_000, Number(existingBankedHours))) : 0;
  const timeOffTaken = Number.isFinite(Number(hoursTakenAsTimeOff)) ? Math.max(0, Math.min(10_000, Number(hoursTakenAsTimeOff))) : 0;
  const monthsElapsed = Number.isFinite(Number(monthsElapsedSinceBanked)) ? Math.max(0, Math.min(120, Math.floor(Number(monthsElapsedSinceBanked)))) : 0;

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
  const hoursAudit = calculateAlbertaOvertimeHours(dailyHoursWorked);
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
  const isBankExpired = monthsElapsed > ALBERTA_BANKING_EXPIRY_MONTHS;

  let mandatoryPayoutBankedHours = 0;
  if (isEmploymentTerminating) {
    mandatoryPayoutBankedHours = remainingBankedHours;
    complianceChecklist.push({
      item: 'TERMINATION_PAYOUT_TRIGGER',
      status: 'MANDATORY_PAYOUT',
      details: 'Employment termination triggers immediate mandatory payout of all banked hours at 1.5x regular wage rate.'
    });
  } else if (isBankExpired) {
    mandatoryPayoutBankedHours = remainingBankedHours;
    statutoryViolations.push({
      violation: 'BANKED_HOURS_EXPIRED_UNPAID',
      section: 'Alberta ESC s. 23(3)(a)',
      details: `Banked hours have exceeded the 6-month statutory limit (${monthsElapsed} months elapsed). Must be paid out immediately at 1.5x overtime rate.`
    });
  }

  // 4. Financial Calculations
  // Payout for current period overtime (if not banked)
  const currentPeriodOtPayOwed = canBankOvertime ? 0 : (newOtHours * otRate);
  // Payout for expired or terminating banked hours (always at 1.5x)
  const bankedHoursPayoutOwed = mandatoryPayoutBankedHours * otRate;
  const totalPayoutOwedCad = currentPeriodOtPayOwed + bankedHoursPayoutOwed;

  // 5. Banking Net Balance (if not terminating and valid agreement)
  const updatedBankBalance = canBankOvertime && !isEmploymentTerminating && !isBankExpired
    ? (remainingBankedHours + newOtHours)
    : 0;

  if (canBankOvertime && !isEmploymentTerminating) {
    riskWarnings.push({
      warning: 'SIX_MONTH_EXPIRY_HORIZON',
      details: `All newly banked hours (${newOtHours} hrs) must be taken as paid time off within 6 months, or employer is statutorily bound to pay them at $${otRate.toFixed(2)}/hr (1.5x).`
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
      isExpiredPast6Months: isBankExpired,
      isEmploymentTerminating,
      newlyBankedHours: canBankOvertime && !isEmploymentTerminating ? newOtHours : 0,
      activeBankBalanceHours: updatedBankBalance,
      hoursSubjectToMandatoryPayout: (canBankOvertime ? 0 : newOtHours) + mandatoryPayoutBankedHours
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
