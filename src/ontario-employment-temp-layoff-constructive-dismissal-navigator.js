/**
 * Ontario Temporary Layoff & Deemed Termination Navigator
 *
 * Audits temporary layoff durations, 13-week standard and 35-week extended caps,
 * benefit continuation mandates, statutory deemed terminations, and common law
 * constructive dismissal under Ontario's Employment Standards Act, 2000 (ESA),
 * ss. 56(2), 57, 64, and ONCA precedent (Elsegood v. Cambridge Spring Service).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const ONTARIO_LAYOFF_CONSTANTS = Object.freeze({
  STANDARD_LAYOFF_MAX_WEEKS: 13, // In any 20 consecutive weeks
  STANDARD_LAYOFF_WINDOW_WEEKS: 20,
  EXTENDED_LAYOFF_MAX_WEEKS: 35, // In any 52 consecutive weeks with benefits
  EXTENDED_LAYOFF_WINDOW_WEEKS: 52,
  MAX_STATUTORY_NOTICE_WEEKS: 8,
  MAX_STATUTORY_SEVERANCE_WEEKS: 26,
  STATUTORY_AUTHORITY: 'Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 56, 57, 64'
});

/**
 * Audits temporary layoff length, benefits maintenance, statutory deemed termination, and severance.
 *
 * @param {Object} params
 * @param {number} [params.layoffDurationWeeks=14] - Continuous or cumulative weeks on layoff
 * @param {boolean} [params.employerContinuedHealthBenefits=false] - Employer paid group health/life insurance premiums
 * @param {boolean} [params.employeeReceivedSubstantialPayments=false] - Employee received substantial direct payments
 * @param {boolean} [params.hasValidWrittenLayoffClauseInContract=false] - Contract explicitly authorizes temporary layoffs
 * @param {number} [params.yearsOfService=6] - Total continuous years of employment
 * @param {number} [params.regularWeeklyWageCad=1250] - Regular non-overtime weekly wage
 * @param {boolean} [params.employerOntarioPayrollOver2_5Million=true] - Employer Ontario payroll >= $2.5 million
 * @param {string} [params.employeeName='Employee']
 * @param {string} [params.employerName='Employer']
 * @param {string} [params.assessmentDate='2026-10-31']
 * @returns {Object} Comprehensive layoff audit, deemed termination status, and financial entitlements
 */
export function auditOntarioTemporaryLayoff({
  layoffDurationWeeks = 14,
  employerContinuedHealthBenefits = false,
  employeeReceivedSubstantialPayments = false,
  hasValidWrittenLayoffClauseInContract = false,
  yearsOfService = 6,
  regularWeeklyWageCad = 1250,
  employerOntarioPayrollOver2_5Million = true,
  employeeName = 'Employee',
  employerName = 'Employer',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanEmployee = boundedText(employeeName, 'Employee', 100);
  const cleanEmployer = boundedText(employerName, 'Employer', 120);

  const weeks = Math.max(0, Math.min(520, Math.floor(Number(layoffDurationWeeks) || 0)));
  const serviceYears = Math.max(0, Math.min(60, Number(yearsOfService) || 0));
  const weeklyWage = Math.max(0, Math.min(100000, Number(regularWeeklyWageCad) || 0));

  const benefitsContinued = Boolean(employerContinuedHealthBenefits);
  const substantialPaymentsReceived = Boolean(employeeReceivedSubstantialPayments);
  const hasLayoffClause = Boolean(hasValidWrittenLayoffClauseInContract);
  const payrollOver2_5M = Boolean(employerOntarioPayrollOver2_5Million);

  const hasExceeded13Weeks = weeks > ONTARIO_LAYOFF_CONSTANTS.STANDARD_LAYOFF_MAX_WEEKS;
  const hasExceeded35Weeks = weeks > ONTARIO_LAYOFF_CONSTANTS.EXTENDED_LAYOFF_MAX_WEEKS;

  const qualifiesForExtendedLayoff = benefitsContinued || substantialPaymentsReceived;

  // Deemed Termination determination under ESA s. 56(2)
  let isDeemedTerminatedUnderEsa = false;
  let deemedTerminationGround = null;

  if (hasExceeded35Weeks) {
    isDeemedTerminatedUnderEsa = true;
    deemedTerminationGround = 'EXCEEDED_ABSOLUTE_35_WEEK_MAXIMUM';
  } else if (hasExceeded13Weeks && !qualifiesForExtendedLayoff) {
    isDeemedTerminatedUnderEsa = true;
    deemedTerminationGround = 'EXCEEDED_13_WEEKS_WITHOUT_BENEFIT_CONTINUATION';
  }

  // Common Law Constructive Dismissal
  const isCommonLawConstructiveDismissal = !hasLayoffClause;

  // Statutory Notice calculation (ESA s. 57: 1 week per completed year up to 8 weeks)
  let statutoryNoticeWeeks = 0;
  if (serviceYears < 1) statutoryNoticeWeeks = 1;
  else statutoryNoticeWeeks = Math.min(ONTARIO_LAYOFF_CONSTANTS.MAX_STATUTORY_NOTICE_WEEKS, Math.floor(serviceYears));
  const statutoryNoticePayCad = statutoryNoticeWeeks * weeklyWage;

  // Statutory Severance calculation (ESA s. 64: 1 week per completed year + prorated months, up to 26 weeks)
  let statutorySeveranceWeeks = 0;
  if (serviceYears >= 5 && payrollOver2_5M) {
    statutorySeveranceWeeks = Math.min(ONTARIO_LAYOFF_CONSTANTS.MAX_STATUTORY_SEVERANCE_WEEKS, serviceYears);
  }
  const statutorySeverancePayCad = statutorySeveranceWeeks * weeklyWage;
  const totalStatutoryPayOwingCad = isDeemedTerminatedUnderEsa ? (statutoryNoticePayCad + statutorySeverancePayCad) : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  if (isDeemedTerminatedUnderEsa) {
    statutoryViolations.push({
      rule: 'STATUTORY_DEEMED_TERMINATION',
      statute: 'Employment Standards Act, 2000, s. 56(2)',
      finding: `Layoff of ${weeks} weeks constitutes deemed termination by operation of law (${deemedTerminationGround}). Employment is deemed terminated on day 1 of the layoff.`
    });
    actionableRemedies.push({
      action: 'DEMAND_IMMEDIATE_TERMINATION_AND_SEVERANCE_PAY',
      remedyDescription: `Employer must immediately remit $${totalStatutoryPayOwingCad} ($${statutoryNoticePayCad} notice pay + $${statutorySeverancePayCad} severance pay) pursuant to ESA ss. 57 and 64.`
    });
  } else if (hasExceeded13Weeks && qualifiesForExtendedLayoff) {
    riskWarnings.push({
      warningType: 'EXTENDED_LAYOFF_ACTIVE',
      description: `Layoff is in extended status (${weeks}/35 weeks) because employer continued benefits. If layoff reaches 35 weeks, statutory deemed termination triggers automatically.`
    });
  }

  if (isCommonLawConstructiveDismissal) {
    riskWarnings.push({
      warningType: 'COMMON_LAW_CONSTRUCTIVE_DISMISSAL',
      description: 'Under Ontario common law (Elsegood v. Cambridge Spring Service), an employer has no implied right to lay off. A layoff without express contractual terms constitutes constructive dismissal, entitling employee to full Bardal reasonable notice.'
    });
    actionableRemedies.push({
      action: 'CONSULT_EMPLOYMENT_LAWYER_BARDAL_NOTICE',
      remedyDescription: 'Evaluate whether to accept deemed termination or claim common law constructive dismissal (typically 3 to 24 months compensation).'
    });
  }

  let complianceStatus = 'COMPLIANT_TEMPORARY_LAYOFF_WITHIN_LIMITS';
  let legalVerdict = `Layoff of ${weeks} weeks is within statutory limits under ESA s. 56(2). Employment remains active in suspension.`;

  if (isDeemedTerminatedUnderEsa) {
    complianceStatus = 'DEEMED_TERMINATION_STATUTORY_SEVERANCE_OWED';
    legalVerdict = `Employment has statutorily terminated by operation of law under ESA s. 56(2). Employer owes $${totalStatutoryPayOwingCad} in statutory termination and severance pay.`;
  }

  return {
    assessmentDate: safeAssessmentDate,
    jurisdiction: 'ONTARIO_CANADA',
    employeeName: cleanEmployee,
    employerName: cleanEmployer,
    layoffDurationWeeks: weeks,
    employerContinuedHealthBenefits: benefitsContinued,
    hasValidWrittenLayoffClauseInContract: hasLayoffClause,
    isDeemedTerminatedUnderEsa,
    deemedTerminationGround,
    isCommonLawConstructiveDismissal,
    complianceStatus,
    legalVerdict,
    financialEntitlements: {
      statutoryNoticeWeeks,
      statutoryNoticePayCad,
      statutorySeveranceWeeks,
      statutorySeverancePayCad,
      totalStatutoryPayOwingCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 56, 57, 63, 64',
      'Elsegood v. Cambridge Spring Service, 2011 ONCA 831',
      'Potter v. New Brunswick Legal Aid Services Commission, 2015 SCC 10'
    ]
  };
}
