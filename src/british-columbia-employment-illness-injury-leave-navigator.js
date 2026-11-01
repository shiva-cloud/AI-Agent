/**
 * British Columbia Employment Illness or Injury Leave Navigator
 *
 * Audits 90-day qualification thresholds, 5-day paid leave and 3-day unpaid leave
 * statutory entitlements per calendar year, average day's pay calculation, and
 * anti-reprisal protections under British Columbia's Employment Standards Act,
 * RSBC 1996, c. 113, ss. 49.1 & 83.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_SICK_LEAVE_CONSTANTS = Object.freeze({
  MIN_SERVICE_DAYS_REQUIRED: 90, // s. 49.1(1)
  MAX_PAID_SICK_DAYS_PER_CALENDAR_YEAR: 5, // s. 49.1(1)(a)
  MAX_UNPAID_SICK_DAYS_PER_CALENDAR_YEAR: 3, // s. 49.1(1)(b)
  LOOKBACK_DAYS_FOR_AVERAGE_PAY: 30, // s. 49.1(2)
  STATUTORY_AUTHORITY: 'Employment Standards Act, RSBC 1996, c. 113, ss. 49.1, 83'
});

/**
 * Audits BC statutory illness/injury leave entitlements, average day's pay, and employer compliance.
 *
 * @param {Object} params
 * @param {number} [params.consecutiveDaysEmployed=120] - Consecutive calendar days with employer
 * @param {number} [params.paidSickDaysTakenThisYear=0] - Paid sick leave days already used in calendar year
 * @param {number} [params.paidSickDaysRequested=1] - Paid sick leave days requested
 * @param {number} [params.unpaidSickDaysTakenThisYear=0] - Unpaid sick leave days already used
 * @param {number} [params.unpaidSickDaysRequested=0] - Unpaid sick leave days requested
 * @param {number} [params.wagesEarnedInPast30DaysCad=3200] - Gross regular wages earned in 30 days prior to leave (excluding OT)
 * @param {number} [params.daysWorkedInPast30Days=20] - Total days worked in 30 days prior to leave
 * @param {boolean} [params.employerRefusedPaidSickDays=false] - Whether employer denied paid sick leave pay
 * @param {boolean} [params.employerDisciplinedOrDismissedForLeave=false] - Whether employer penalized worker for taking leave
 * @param {boolean} [params.medicalProofProvided=true] - Whether reasonably sufficient proof of illness was furnished
 * @returns {Object} Comprehensive BC sick leave audit and wage entitlement determination
 */
export function evaluateBcIllnessInjuryLeave(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    employerName = 'Employer',
    assessmentDate = '2026-10-31',
    consecutiveDaysEmployed = 120,
    paidSickDaysTakenThisYear = 0,
    paidSickDaysRequested = 1,
    unpaidSickDaysTakenThisYear = 0,
    unpaidSickDaysRequested = 0,
    wagesEarnedInPast30DaysCad = 3200,
    daysWorkedInPast30Days = 20,
    employerRefusedPaidSickDays = false,
    employerDisciplinedOrDismissedForLeave = false,
    medicalProofProvided = true
  } = safeParams;

  const cleanEmployeeName = boundedText(employeeName, 'Employee', 100);
  const cleanEmployerName = boundedText(employerName, 'Employer', 120);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');

  const serviceDays = Number.isFinite(Number(consecutiveDaysEmployed))
    ? Math.max(0, Math.min(36500, Math.floor(Number(consecutiveDaysEmployed))))
    : 0;
  const paidTaken = Number.isFinite(Number(paidSickDaysTakenThisYear))
    ? Math.max(0, Math.min(365, Math.floor(Number(paidSickDaysTakenThisYear))))
    : 0;
  const paidReq = Number.isFinite(Number(paidSickDaysRequested))
    ? Math.max(0, Math.min(365, Math.floor(Number(paidSickDaysRequested))))
    : 0;
  const unpaidTaken = Number.isFinite(Number(unpaidSickDaysTakenThisYear))
    ? Math.max(0, Math.min(365, Math.floor(Number(unpaidSickDaysTakenThisYear))))
    : 0;
  const unpaidReq = Number.isFinite(Number(unpaidSickDaysRequested))
    ? Math.max(0, Math.min(365, Math.floor(Number(unpaidSickDaysRequested))))
    : 0;
  const wages30Days = Number.isFinite(Number(wagesEarnedInPast30DaysCad))
    ? Math.max(0, Math.min(1_000_000, Number(wagesEarnedInPast30DaysCad)))
    : 0;
  const daysWorked30Days = Number.isFinite(Number(daysWorkedInPast30Days))
    ? Math.max(1, Math.min(30, Math.floor(Number(daysWorkedInPast30Days))))
    : 1;

  const meets90DayThreshold = serviceDays >= BC_SICK_LEAVE_CONSTANTS.MIN_SERVICE_DAYS_REQUIRED;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Service Requirement Audit (s. 49.1(1))
  if (!meets90DayThreshold) {
    const deficitDays = BC_SICK_LEAVE_CONSTANTS.MIN_SERVICE_DAYS_REQUIRED - serviceDays;
    riskWarnings.push({
      warningType: 'BELOW_90_DAY_STATUTORY_QUALIFICATION',
      description: `Employee has ${serviceDays} days of service. Section 49.1 requires 90 consecutive days of employment to qualify for paid illness leave.`
    });
    actionableRemedies.push({
      action: 'ACCRUE_REMAINING_CALENDAR_DAYS',
      remedyDescription: `Work ${deficitDays} additional calendar day${deficitDays === 1 ? '' : 's'} to activate statutory paid sick day entitlement.`
    });
  }

  // 2. Entitlement Quota Audit
  const remainingPaidDays = Math.max(0, BC_SICK_LEAVE_CONSTANTS.MAX_PAID_SICK_DAYS_PER_CALENDAR_YEAR - paidTaken);
  const remainingUnpaidDays = Math.max(0, BC_SICK_LEAVE_CONSTANTS.MAX_UNPAID_SICK_DAYS_PER_CALENDAR_YEAR - unpaidTaken);

  const approvedPaidDays = meets90DayThreshold ? Math.min(paidReq, remainingPaidDays) : 0;
  const excessPaidDaysRequested = Math.max(0, paidReq - approvedPaidDays);

  if (excessPaidDaysRequested > 0 && meets90DayThreshold) {
    riskWarnings.push({
      warningType: 'REQUEST_EXCEEDS_ANNUAL_PAID_CAP',
      description: `Requested ${paidReq} paid sick day(s), but only ${remainingPaidDays} day(s) remain under the statutory 5-day annual cap.`
    });
  }

  // 3. Average Day's Pay Calculation (s. 49.1(2))
  // Average day's pay = regular wages earned in 30 days prior / days worked
  const averageDailyWageCad = Math.round((wages30Days / daysWorked30Days) * 100) / 100;
  const totalPaidSickPayOwedCad = Math.round((averageDailyWageCad * approvedPaidDays) * 100) / 100;

  // 4. Employer Refusal & Wage Violations
  if (employerRefusedPaidSickDays && approvedPaidDays > 0) {
    statutoryViolations.push({
      rule: 'UNLAWFUL_WITHHOLDING_OF_PAID_SICK_LEAVE',
      statute: 'Employment Standards Act s. 49.1(2)',
      finding: `Employer unlawfully refused or failed to pay $${totalPaidSickPayOwedCad.toFixed(2)} owed for ${approvedPaidDays} statutory paid sick day(s).`
    });
    actionableRemedies.push({
      action: 'FILE_BC_EMPLOYMENT_STANDARDS_WAGE_CLAIM',
      remedyDescription: `File a wage complaint with the BC Employment Standards Branch to recover $${totalPaidSickPayOwedCad.toFixed(2)} plus mandatory interest.`
    });
  }

  // 5. Anti-Reprisal Violations (s. 83)
  if (employerDisciplinedOrDismissedForLeave) {
    statutoryViolations.push({
      rule: 'STATUTORY_REPRISAL_SICK_LEAVE',
      statute: 'Employment Standards Act s. 83',
      finding: 'Employer penalized, suspended, or dismissed employee for requesting or taking statutory illness/injury leave.'
    });
    actionableRemedies.push({
      action: 'FILE_REPRISAL_COMPLAINT_REINSTATEMENT_LOST_WAGES',
      remedyDescription: 'File a complaint with the Director of Employment Standards seeking immediate job reinstatement, compensation for lost wages, and administrative penalties.'
    });
  }

  // 6. Medical Proof Assessment
  if (!medicalProofProvided) {
    riskWarnings.push({
      warningType: 'POTENTIAL_REQUEST_FOR_REASONABLE_PROOF',
      description: 'Under s. 49.1(4), an employer may ask for reasonably sufficient proof of illness. A medical certificate or clinic receipt suffices.'
    });
  }

  let complianceStatus = 'COMPLIANT_STATUTORY_SICK_LEAVE';
  let legalVerdict = 'Employee meets statutory requirements. Employer must pay the prescribed average day wage for approved sick days.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'EMPLOYER_STATUTORY_VIOLATION_DETECTED';
    legalVerdict = `Employer breached BC ESA s. 49.1 / s. 83. Outstanding wages of $${totalPaidSickPayOwedCad.toFixed(2)} and/or reprisal remedies are actionable.`;
  } else if (!meets90DayThreshold) {
    complianceStatus = 'INELIGIBLE_UNDER_90_DAYS_TENURE';
    legalVerdict = 'Employee does not yet meet the 90-consecutive-day threshold for BC statutory paid illness leave.';
  }

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    employeeName: cleanEmployeeName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    consecutiveDaysEmployed: serviceDays,
    meets90DayThreshold,
    complianceStatus,
    legalVerdict,
    leaveSummary: {
      statutoryMaxPaidDaysPerYear: BC_SICK_LEAVE_CONSTANTS.MAX_PAID_SICK_DAYS_PER_CALENDAR_YEAR,
      statutoryMaxUnpaidDaysPerYear: BC_SICK_LEAVE_CONSTANTS.MAX_UNPAID_SICK_DAYS_PER_CALENDAR_YEAR,
      paidDaysAlreadyUsed: paidTaken,
      paidDaysRemainingInYear: remainingPaidDays,
      paidDaysRequested: paidReq,
      statutoryPaidDaysApproved: approvedPaidDays,
      averageDailyWageCad,
      totalPaidSickPayOwedCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, RSBC 1996, c. 113, s. 49.1 (Illness or injury leave)',
      'Employment Standards Act, RSBC 1996, c. 113, s. 83 (Protection of employee rights & anti-reprisal)'
    ]
  };
}