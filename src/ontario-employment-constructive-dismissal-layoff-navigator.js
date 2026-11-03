/**
 * Northstar — Settlement Intelligence
 * Ontario Employment Constructive Dismissal & Temporary Layoff Navigator
 *
 * Statutory Authorities & Authorities:
 * - Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 56 (Temporary Layoff & Deemed Termination), 57 (Notice), 58 (Mass Notice), 64 (Severance Pay)
 * - Leading Common Law Precedents:
 *   - Potter v. New Brunswick Legal Aid Services Commission, 2015 SCC 10 (Constructive dismissal framework: unilateral breach of essential term)
 *   - Matthews v. Ocean Nutrition Canada Ltd., 2020 SCC 26 (Common law notice & incentive compensation during notice period)
 *   - Elsegood v. Cambridge Spring Service (Association) Ltd., 2011 ONCA 831 (ESA temporary layoff without contractual authority constitutes immediate common law constructive dismissal)
 *   - Evans v. Teamsters Local Union No. 31, 2008 SCC 20 (Mitigation duty and exceptions where relationship is acrimonious)
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, todayIso } from './text-input.js';

export const ESA_LAYOFF_RULES = Object.freeze({
  STANDARD_LAYOFF_MAX_WEEKS: 13,
  STANDARD_WINDOW_CONSECUTIVE_WEEKS: 20,
  EXTENDED_LAYOFF_MAX_WEEKS: 35,
  EXTENDED_WINDOW_CONSECUTIVE_WEEKS: 52,
  MAX_STATUTORY_NOTICE_WEEKS: 8,
  MAX_STATUTORY_SEVERANCE_WEEKS: 26,
  SEVERANCE_PAYROLL_THRESHOLD_CAD: 2500000,
  SEVERANCE_MIN_SERVICE_YEARS: 5,
  LIMITATION_PERIOD_ESA_MONTHS: 24,
  LIMITATION_PERIOD_CIVIL_LITIGATION_YEARS: 2
});

/**
 * Calculates ESA s. 57 statutory notice entitlement weeks.
 * 1 week per full year of completed service, capped at 8 weeks.
 */
export function calculateEsaStatutoryNoticeWeeks(yearsOfService) {
  const service = Math.max(0, Number(yearsOfService) || 0);
  if (service < 0.25) return 0; // Under 3 months
  if (service < 1) return 1;
  return Math.min(ESA_LAYOFF_RULES.MAX_STATUTORY_NOTICE_WEEKS, Math.floor(service));
}

/**
 * Calculates ESA s. 64 statutory severance pay weeks.
 * Applicable if years of service >= 5 AND employer payroll >= $2.5M.
 * 1 week per full year of completed service plus partial weeks for completed months, capped at 26 weeks.
 */
export function calculateEsaStatutorySeveranceWeeks(yearsOfService, employerPayrollExceeds2_5M) {
  const service = Math.max(0, Number(yearsOfService) || 0);
  if (!employerPayrollExceeds2_5M || service < ESA_LAYOFF_RULES.SEVERANCE_MIN_SERVICE_YEARS) {
    return 0;
  }
  return Math.min(ESA_LAYOFF_RULES.MAX_STATUTORY_SEVERANCE_WEEKS, Math.round(service * 10) / 10);
}

/**
 * Estimates Common Law Bardal reasonable notice in months based on age, character of employment, service, and job market.
 */
export function estimateBardalNoticeMonths(yearsOfService, employeeAge, isManagementOrSpecialist) {
  const service = Math.max(0, Number(yearsOfService) || 0);
  const age = Math.max(18, Number(employeeAge) || 35);
  
  // Baseline: approx 1 month per year of service
  let noticeMonths = service * 1.0;
  
  // Age factor: older workers (age 50+) face increased re-employment hurdles
  if (age >= 50) noticeMonths += 2.0;
  if (age >= 55) noticeMonths += 1.5;
  
  // Seniority / character of employment
  if (isManagementOrSpecialist) noticeMonths += 2.5;

  // Floor of 2 to 3 months for short-term employees; ceiling typically 24 months
  noticeMonths = Math.max(2.0, noticeMonths);
  noticeMonths = Math.min(24.0, noticeMonths);

  return Math.round(noticeMonths * 10) / 10;
}

/**
 * Evaluates constructive dismissal & temporary layoff status under Ontario law.
 */
export function evaluateEsaConstructiveDismissalLayoff({
  yearsOfService = 3,
  employeeAge = 38,
  annualSalaryCad = 65000,
  weeksOnLayoff = 10,
  employerMaintainedBenefitsOrSub = false,
  hasContractualLayoffClause = false,
  employerPayrollExceeds2_5M = true,
  isManagementOrSpecialist = false,
  salaryReductionPct = 0,
  hasSubstantialUnilateralDutyChange = false,
  employeeImmigrationStatus = 'permanent_resident',
  employeeName = 'Employee',
  assessmentDate = todayIso()
} = {}) {
  const cleanEmployeeName = boundedText(employeeName, 'Employee', 120);
  const cleanImmigrationStatus = boundedText(employeeImmigrationStatus, 'permanent_resident', 50);
  const safeAssessmentDate = typeof assessmentDate === 'string' && !Number.isNaN(Date.parse(assessmentDate))
    ? assessmentDate.trim().slice(0, 10)
    : '2026-10-31';

  const sanitizedService = Number.isFinite(Number(yearsOfService)) ? Math.max(0, Math.min(60, Number(yearsOfService))) : 3;
  const sanitizedAge = Number.isFinite(Number(employeeAge)) ? Math.max(16, Math.min(100, Math.floor(Number(employeeAge)))) : 38;
  const sanitizedSalary = Number.isFinite(Number(annualSalaryCad)) ? Math.max(0, Math.min(5000000, Number(annualSalaryCad))) : 65000;
  const sanitizedWeeks = Number.isFinite(Number(weeksOnLayoff)) ? Math.max(0, Math.min(520, Math.floor(Number(weeksOnLayoff)))) : 10;
  const sanitizedSalaryReduction = Number.isFinite(Number(salaryReductionPct)) ? Math.max(0, Math.min(100, Number(salaryReductionPct))) : 0;

  const benefitsContinued = Boolean(employerMaintainedBenefitsOrSub);
  const contractualClause = Boolean(hasContractualLayoffClause);
  const payrollOver2_5M = Boolean(employerPayrollExceeds2_5M);
  const managementOrSpecialist = Boolean(isManagementOrSpecialist);
  const unilateralDutyChange = Boolean(hasSubstantialUnilateralDutyChange);

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];

  const weeklySalaryCad = Math.round((sanitizedSalary / 52) * 100) / 100;

  // 1. Audit Layoff Thresholds under ESA s. 56
  let isEsaLayoffPermissible = false;
  let hasExceededEsaThreshold = false;
  let layoffCategory = 'NONE';

  if (sanitizedWeeks > 0) {
    if (sanitizedWeeks <= ESA_LAYOFF_RULES.STANDARD_LAYOFF_MAX_WEEKS) {
      layoffCategory = 'STANDARD_LAYOFF';
      isEsaLayoffPermissible = true;
      compliancePoints.push(
        `Layoff duration (${sanitizedWeeks} weeks) is within the statutory 13-week standard cap under ESA s. 56(2)(a).`
      );
    } else if (
      sanitizedWeeks <= ESA_LAYOFF_RULES.EXTENDED_LAYOFF_MAX_WEEKS &&
      benefitsContinued
    ) {
      layoffCategory = 'EXTENDED_LAYOFF_WITH_BENEFITS';
      isEsaLayoffPermissible = true;
      compliancePoints.push(
        `Extended layoff (${sanitizedWeeks} weeks) is permissible under ESA s. 56(2)(b) because employer continues group benefits or supplementary payments.`
      );
    } else {
      layoffCategory = 'DEEMED_STATUTORY_TERMINATION';
      hasExceededEsaThreshold = true;
      deficiencies.push(
        `Layoff duration (${sanitizedWeeks} weeks) has exceeded statutory limits (${
          benefitsContinued ? '35 weeks' : '13 weeks'
        }). Under ESA s. 56(1)(c), employment is deemed terminated on the very first day of the layoff.`
      );
    }
  }

  // 2. Common Law Constructive Dismissal Audit (Elsegood v. Cambridge Spring Service)
  let isCommonLawConstructiveDismissal = false;
  const constructiveDismissalGrounds = [];

  // Ground A: Layoff without explicit contractual authority
  if (sanitizedWeeks > 0 && !contractualClause) {
    isCommonLawConstructiveDismissal = true;
    constructiveDismissalGrounds.push('UNAUTHORIZED_COMMON_LAW_LAYOFF');
    deficiencies.push(
      'Under Ontario Common Law (Elsegood v. Cambridge Spring Service), an employer has no implied right to lay off an employee. In the absence of an express contractual layoff term, the layoff constitutes immediate constructive dismissal.'
    );
  }

  // Ground B: Substantial unilateral salary reduction (typically 15%+)
  if (sanitizedSalaryReduction >= 15) {
    isCommonLawConstructiveDismissal = true;
    constructiveDismissalGrounds.push('SUBSTANTIAL_WAGE_REDUCTION');
    deficiencies.push(
      `Unilateral compensation cut of ${sanitizedSalaryReduction}% constitutes a fundamental breach of an essential employment contract term under Potter v. New Brunswick Legal Aid Services Commission.`
    );
  }

  // Ground C: Substantial unilateral demotion or duty alteration
  if (unilateralDutyChange) {
    isCommonLawConstructiveDismissal = true;
    constructiveDismissalGrounds.push('SUBSTANTIAL_DUTY_ALTERATION');
    deficiencies.push(
      'Unilateral substantial alteration of job responsibilities or demotion goes to the root of the employment agreement.'
    );
  }

  // 3. Entitlement Calculations
  const esaNoticeWeeks = calculateEsaStatutoryNoticeWeeks(sanitizedService);
  const esaNoticeAmountCad = Math.round(esaNoticeWeeks * weeklySalaryCad * 100) / 100;

  const esaSeveranceWeeks = calculateEsaStatutorySeveranceWeeks(sanitizedService, payrollOver2_5M);
  const esaSeveranceAmountCad = Math.round(esaSeveranceWeeks * weeklySalaryCad * 100) / 100;

  const totalEsaStatutoryPayCad = Math.round((esaNoticeAmountCad + esaSeveranceAmountCad) * 100) / 100;

  const estimatedCommonLawNoticeMonths = estimateBardalNoticeMonths(
    sanitizedService,
    sanitizedAge,
    managementOrSpecialist
  );
  const estimatedCommonLawNoticeAmountCad = Math.round(
    (estimatedCommonLawNoticeMonths / 12) * sanitizedSalary * 100
  ) / 100;

  // 4. Immigration Status Checks (Closed Work Permit Vulnerability)
  const isClosedWorkPermit = ['work_permit', 'closed_work_permit', 'tfw'].includes(
    cleanImmigrationStatus.toLowerCase()
  );

  if (isClosedWorkPermit && (hasExceededEsaThreshold || isCommonLawConstructiveDismissal)) {
    deficiencies.push(
      'Closed work permit holders facing termination or indefinite layoff face severe status vulnerability. Cessation of employment terminates authorized work conditions; applicant must seek a new LMIA, employer change, or apply for a Vulnerable Worker Open Work Permit (IRPR s. 207.1) if mistreatment occurred.'
    );
  }

  // 5. Strategic Remedies
  if (hasExceededEsaThreshold || isCommonLawConstructiveDismissal) {
    statutoryRemedies.push({
      action: 'File Ministry of Labour ESA Claim OR Civil Demand',
      description:
        'Choose between filing an ESA claim with the Ontario Ministry of Labour (capped at statutory notice and severance) or issuing a Common Law demand letter through legal counsel for Bardal reasonable notice.',
      timeline: 'Within 24 months of termination date (ESA limitation s. 111(1))'
    });
    statutoryRemedies.push({
      action: 'Mitigation Compliance Log',
      description:
        'Maintain an active, contemporaneous record of job applications, interview requests, and networking to satisfy the common law duty to mitigate damages (Evans v. Teamsters).',
      timeline: 'Beginning immediately upon cessation of work'
    });
    statutoryRemedies.push({
      action: 'Service Canada Record of Employment (ROE) Demand',
      description:
        'Ensure employer issues an electronic ROE with Code A (Shortage of work / Layoff) or Code K (Other / Deemed Termination) to unlock Employment Insurance (EI) regular benefits without delay.',
      timeline: 'Within 5 calendar days of the end of the pay period'
    });
  }

  // Overall Verdict
  let legalVerdict = 'COMPLIANT_TEMPORARY_LAYOFF';
  if (hasExceededEsaThreshold && isCommonLawConstructiveDismissal) {
    legalVerdict = 'DEEMED_TERMINATION_AND_CONSTRUCTIVE_DISMISSAL';
  } else if (hasExceededEsaThreshold) {
    legalVerdict = 'DEEMED_STATUTORY_TERMINATION_ESA';
  } else if (isCommonLawConstructiveDismissal) {
    legalVerdict = 'COMMON_LAW_CONSTRUCTIVE_DISMISSAL';
  }

  const summary =
    legalVerdict === 'COMPLIANT_TEMPORARY_LAYOFF'
      ? `The current layoff of ${sanitizedWeeks} weeks remains within ESA statutory guidelines with benefits/sub continued or within the 13-week limit.`
      : `Legal status reflects ${legalVerdict}. The employee is entitled to claim statutory termination entitlements under ESA ss. 56-64 totaling $${totalEsaStatutoryPayCad.toLocaleString()} CAD or explore common law reasonable notice estimated at ${estimatedCommonLawNoticeMonths} months ($${estimatedCommonLawNoticeAmountCad.toLocaleString()} CAD).`;

  return {
    assessmentDate: safeAssessmentDate,
    employeeName: cleanEmployeeName,
    statutoryAuthority: 'Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 56-64 & Leading Common Law Precedents',
    legalVerdict,
    layoffCategory,
    isEsaLayoffPermissible,
    hasExceededEsaThreshold,
    isCommonLawConstructiveDismissal,
    constructiveDismissalGrounds,
    weeklySalaryCad,
    esaStatutoryEntitlements: {
      noticeWeeks: esaNoticeWeeks,
      noticeAmountCad: esaNoticeAmountCad,
      severanceWeeks: esaSeveranceWeeks,
      severanceAmountCad: esaSeveranceAmountCad,
      totalStatutoryAmountCad: totalEsaStatutoryPayCad
    },
    commonLawNoticeEstimate: {
      estimatedNoticeMonths: estimatedCommonLawNoticeMonths,
      estimatedNoticeAmountCad: estimatedCommonLawNoticeAmountCad,
      subjectToMitigation: true
    },
    summary,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'ON'
  };
}
