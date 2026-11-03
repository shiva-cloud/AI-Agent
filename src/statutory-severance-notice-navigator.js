/**
 * Common Law Reasonable Notice vs. Statutory Severance (*Bardal* Factors) Calculator
 *
 * Implements statutory assessment under:
 * - Ontario Employment Standards Act, 2000 (SO 2000 c. 41) ss. 54–66 (Notice and Severance)
 * - British Columbia Employment Standards Act (RSBC 1996 c. 113) ss. 63–66
 * - Landmark Precedent: Bardal v. Globe & Mail Ltd. (1960 CanLII 294 (ON SC))
 * - Landmark Precedent: Waksdale v. Swegon North America Inc. (2020 ONCA 391)
 *
 * Key Statutory Rules:
 * - Statutory Notice / Termination Pay (ESA s. 57):
 *   - Under 3 months: 0 weeks.
 *   - 3 months to 1 year: 1 week.
 *   - 1 year to 3 years: 2 weeks.
 *   - 3+ years: 1 week per full completed year of service, capped at 8 weeks maximum.
 * - Statutory Severance Pay (Ontario ESA s. 64):
 *   - Prerequisite 1: Employee completed at least 5 years of service.
 *   - Prerequisite 2: Employer has an Ontario payroll of at least $2.5 million OR severed 50+ employees in 6 months.
 *   - Amount: 1 week of regular wages per completed year of service (plus pro-rated fraction for incomplete months),
 *     capped at 26 weeks ($64(2)).
 * - Common Law Reasonable Notice (Bardal Factors):
 *   Where an employment contract lacks an enforceable termination clause (or clause is void under Waksdale),
 *   the employee is entitled to reasonable notice determined by four primary factors:
 *   (1) Character of employment (senior executive, specialized professional, vs front-line);
 *   (2) Length of continuous service;
 *   (3) Age of employee at termination (older workers receive enhanced notice);
 *   (4) Availability of comparable alternative employment in the economic sector.
 * - Common Law Ceiling: Conventional soft cap of 24 months reasonable notice.
 * - Waksdale Invalidation Principle: If any part of the termination clause (including "for cause" provisions)
 *   violates minimum ESA standards, the entire termination clause is void ab initio, entitling the employee
 *   to full common law notice.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const SEVERANCE_CONSTANTS = Object.freeze({
  MAX_ESA_STATUTORY_NOTICE_WEEKS: 8,
  MAX_ESA_STATUTORY_SEVERANCE_WEEKS: 26,
  ONTARIO_SEVERANCE_PAYROLL_THRESHOLD_CAD: 2500000.0,
  MIN_YEARS_SERVICE_FOR_STATUTORY_SEVERANCE: 5,
  MAX_COMMON_LAW_NOTICE_MONTHS_CEILING: 24,
  WEEKS_PER_MONTH: 4.333
});

/**
 * Calculates statutory termination pay, statutory severance, and estimated common law reasonable notice.
 *
 * @param {Object} options
 * @param {number} [options.yearsOfService=6.5] - Completed years and fractions of service
 * @param {number} [options.employeeAgeYears=48] - Age of the employee at termination
 * @param {number} [options.annualSalaryCad=85000] - Base annual salary before bonuses
 * @param {string} [options.roleSeniority='managerial_professional'] - 'executive', 'managerial_professional', 'specialized_technical', 'administrative_clerical', 'entry_level'
 * @param {string} [options.province='ON'] - Province ('ON', 'BC')
 * @param {boolean} [options.employerPayrollExceeds2_5Million=true] - Employer payroll >= $2.5M
 * @param {boolean} [options.hasSignedTerminationClause=true] - Contract includes written termination clause
 * @param {boolean} [options.terminationClauseViolatesEsa=true] - Clause attempts to contract out of ESA or breaches Waksdale
 * @param {string} [options.employeeName='Employee'] - Employee name
 * @param {string} [options.assessmentDate=todayIso()] - Date of assessment
 * @returns {Object} Comprehensive severance, statutory notice, and common law diagnostic
 */
export function evaluateStatutorySeveranceNotice(options = {}) {
  const service = Number.isFinite(Number(options.yearsOfService)) ? Math.max(0, Math.min(60, Number(options.yearsOfService))) : 6.5;
  const age = Number.isFinite(Number(options.employeeAgeYears)) ? Math.max(16, Math.min(120, Math.floor(Number(options.employeeAgeYears)))) : 48;
  const salary = Number.isFinite(Number(options.annualSalaryCad)) ? Math.max(1000, Math.min(100000000, Number(options.annualSalaryCad))) : 85000.0;
  const rawRole = typeof options.roleSeniority === 'string' ? options.roleSeniority.trim().toLowerCase() : 'managerial_professional';
  const role = ['executive', 'managerial_professional', 'specialized_technical', 'administrative_clerical', 'entry_level'].includes(rawRole)
    ? rawRole
    : 'managerial_professional';

  const province = boundedText(options.province, 'ON', 10).toUpperCase();
  const largePayroll = options.employerPayrollExceeds2_5Million !== false;
  const hasClause = options.hasSignedTerminationClause !== false;
  const clauseViolatesEsa = options.terminationClauseViolatesEsa !== false;
  const empName = boundedText(options.employeeName, 'Employee', 100);
  const assessDate = safeIsoDate(options.assessmentDate, todayIso());

  const weeklyWageCad = Number((salary / 52.0).toFixed(2));
  const statutoryProtections = [];
  const riskWarnings = [];
  const actionPlan = [];

  // 1. Calculate Statutory Notice Pay (ESA s. 57)
  let esaNoticeWeeks = 0;
  if (service < 0.25) {
    esaNoticeWeeks = 0;
  } else if (service < 1) {
    esaNoticeWeeks = 1;
  } else if (service < 3) {
    esaNoticeWeeks = 2;
  } else {
    esaNoticeWeeks = Math.min(SEVERANCE_CONSTANTS.MAX_ESA_STATUTORY_NOTICE_WEEKS, Math.floor(service));
  }
  const esaNoticePayCad = Number((esaNoticeWeeks * weeklyWageCad).toFixed(2));

  // 2. Calculate Statutory Severance Pay (Ontario ESA s. 64)
  let esaSeveranceWeeks = 0;
  let qualifiesForStatutorySeverance = false;

  if (province === 'ON') {
    if (service >= SEVERANCE_CONSTANTS.MIN_YEARS_SERVICE_FOR_STATUTORY_SEVERANCE && largePayroll) {
      qualifiesForStatutorySeverance = true;
      esaSeveranceWeeks = Math.min(SEVERANCE_CONSTANTS.MAX_ESA_STATUTORY_SEVERANCE_WEEKS, Number(service.toFixed(2)));
    }
  }
  const esaSeverancePayCad = Number((esaSeveranceWeeks * weeklyWageCad).toFixed(2));
  const totalEsaStatutoryMinimumCad = Number((esaNoticePayCad + esaSeverancePayCad).toFixed(2));

  // 3. Common Law Reasonable Notice Estimation (Bardal Factors)
  // Character multiplier
  let roleMultiplierMonths = 0.8; // entry / clerical
  if (role === 'specialized_technical') roleMultiplierMonths = 1.0;
  if (role === 'managerial_professional') roleMultiplierMonths = 1.2;
  if (role === 'executive') roleMultiplierMonths = 1.5;

  // Base notice from service: roughly 3–4 weeks per year
  let estimatedNoticeMonths = service * roleMultiplierMonths;

  // Age factor: older workers (>= 45) receive additional buffer
  if (age >= 55) {
    estimatedNoticeMonths += 3.0;
  } else if (age >= 45) {
    estimatedNoticeMonths += 1.5;
  }

  // Minimum floor for short-service senior hires (rough common law threshold)
  if (['executive', 'managerial_professional'].includes(role) && estimatedNoticeMonths < 3.0) {
    estimatedNoticeMonths = 3.0;
  }

  // Cap at conventional 24-month ceiling
  estimatedNoticeMonths = Math.min(SEVERANCE_CONSTANTS.MAX_COMMON_LAW_NOTICE_MONTHS_CEILING, Number(estimatedNoticeMonths.toFixed(1)));
  const commonLawEstimatedWeeks = Number((estimatedNoticeMonths * SEVERANCE_CONSTANTS.WEEKS_PER_MONTH).toFixed(1));
  const commonLawEstimatedDamagesCad = Number((commonLawEstimatedWeeks * weeklyWageCad).toFixed(2));

  // 4. Contract Termination Clause & Waksdale Analysis
  let isContractClauseEnforceable = false;
  let recommendedEntitlement = 'COMMON_LAW_NOTICE';

  if (!hasClause) {
    isContractClauseEnforceable = false;
    statutoryProtections.push('Absence of Termination Clause: In the absence of an enforceable written termination clause, common law reasonable notice is implied by law.');
  } else if (clauseViolatesEsa) {
    isContractClauseEnforceable = false;
    statutoryProtections.push('Waksdale v. Swegon (2020 ONCA 391): Termination clause violates employment standards legislation. An illegal clause is void in its entirety, restoring full common law notice entitlements.');
  } else {
    isContractClauseEnforceable = true;
    recommendedEntitlement = 'CONTRACTUAL_OR_ESA_MINIMUM';
    riskWarnings.push('ENFORCEABLE TERMINATION CLAUSE: Contract clause appears legally compliant. Notice may be limited to statutory ESA minimums unless challenged on grounds of ambiguity, unconscionability, or changed substratum.');
  }

  // 5. Build Action Plan
  const differentialCad = Number((commonLawEstimatedDamagesCad - totalEsaStatutoryMinimumCad).toFixed(2));
  if (recommendedEntitlement === 'COMMON_LAW_NOTICE') {
    actionPlan.push(`Do not immediately sign initial severance release. Initial employer offers frequently reflect only statutory minimums ($${totalEsaStatutoryMinimumCad.toFixed(2)} CAD).`);
    actionPlan.push(`Potential common law differential of approximately $${differentialCad.toFixed(2)} CAD justifies formal legal review.`);
    actionPlan.push('Retain an employment lawyer to send a formal demand letter citing Bardal factors and Waksdale clause invalidity.');
  } else {
    actionPlan.push(`Ensure employer immediately pays statutory notice ($${esaNoticePayCad.toFixed(2)} CAD) and severance ($${esaSeverancePayCad.toFixed(2)} CAD) within required pay cycle.`);
  }

  return {
    employeeName: empName,
    assessmentDate: assessDate,
    province,
    serviceYears: service,
    employeeAge: age,
    annualSalaryCad: salary,
    weeklyWageCad,
    statutoryEsaAudit: {
      statutoryNoticeWeeks: esaNoticeWeeks,
      statutoryNoticePayCad: esaNoticePayCad,
      qualifiesForStatutorySeverancePay: qualifiesForStatutorySeverance,
      statutorySeveranceWeeks: esaSeveranceWeeks,
      statutorySeverancePayCad: esaSeverancePayCad,
      totalStatutoryMinimumCad: totalEsaStatutoryMinimumCad
    },
    commonLawAssessment: {
      roleSeniority: role,
      estimatedNoticeMonths,
      estimatedNoticeWeeks: commonLawEstimatedWeeks,
      estimatedCommonLawValueCad: commonLawEstimatedDamagesCad,
      differentialOverStatutoryCad: differentialCad,
      primaryAuthority: 'Bardal v. Globe & Mail Ltd. (1960 CanLII 294)'
    },
    enforceabilityAudit: {
      hasWrittenClause: hasClause,
      clauseBreachesEsa: clauseViolatesEsa,
      isClauseEnforceable: isContractClauseEnforceable,
      governingDoctrine: clauseViolatesEsa ? 'Waksdale v. Swegon North America Inc. (2020 ONCA 391)' : 'Contractual Agreement',
      recommendedLegalClaim: recommendedEntitlement
    },
    statutoryProtections,
    riskWarnings,
    actionPlan
  };
}
