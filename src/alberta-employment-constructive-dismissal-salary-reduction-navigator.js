/**
 * Alberta Employment Constructive Dismissal & Salary Reduction Navigator
 *
 * Audits unilateral employer compensation reductions, essential term breaches,
 * and constructive dismissal triggers under the Supreme Court's Farber / Potter doctrines
 * and Alberta's Employment Standards Code, RSA 2000, c. E-9, ss. 55–58.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_CONSTRUCTIVE_DISMISSAL_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Employment Standards Code, RSA 2000, c. E-9, ss. 55-58; Farber v. Royal Trust Co. [1997] 1 SCR 846',
  SALARY_REDUCTION_SUBSTANTIAL_PERCENT_THRESHOLD: 10.0,
  TERMINATION_NOTICE_SCALE_WEEKS: Object.freeze([
    { minYears: 0.25, maxYears: 2, weeks: 1 },
    { minYears: 2, maxYears: 4, weeks: 2 },
    { minYears: 4, maxYears: 6, weeks: 4 },
    { minYears: 6, maxYears: 8, weeks: 5 },
    { minYears: 8, maxYears: 10, weeks: 6 },
    { minYears: 10, maxYears: Infinity, weeks: 8 }
  ])
});

/**
 * Audits Alberta constructive dismissal claims resulting from salary cuts or altered duties.
 *
 * @param {Object} params
 * @param {number} [params.previousAnnualSalaryCad=80000] - Previous base salary before unilateral reduction
 * @param {number} [params.newAnnualSalaryCad=64000] - Proposed new reduced salary
 * @param {number} [params.yearsOfContinuousService=5] - Years employed with the firm
 * @param {boolean} [params.employeeAgreedToReduction=false] - Whether employee consented in writing to the reduction
 * @param {boolean} [params.unilateralReductionInHoursOrStatus=false] - Whether hours or managerial status was also stripped
 * @param {number} [params.daysSinceReductionImposed=14] - Calendar days elapsed since reduction was announced
 * @returns {Object} Comprehensive Alberta constructive dismissal audit and statutory termination pay calculation
 */
export function evaluateAlbertaConstructiveDismissal({
  previousAnnualSalaryCad = 80000,
  newAnnualSalaryCad = 64000,
  yearsOfContinuousService = 5,
  employeeAgreedToReduction = false,
  unilateralReductionInHoursOrStatus = false,
  daysSinceReductionImposed = 14,
  employerName = 'Employer',
  jobTitle = 'Employee',
  employeeName = 'Employee',
  assessmentDate = todayIso()
} = {}) {
  const cleanEmployer = boundedText(employerName, 'Employer');
  const cleanJobTitle = boundedText(jobTitle, 'Employee');
  const cleanEmployee = boundedText(employeeName, 'Employee');
  const cleanDate = safeIsoDate(assessmentDate, todayIso());
  const prevSalary = Number.isFinite(Number(previousAnnualSalaryCad))
    ? Math.max(0, Math.min(10_000_000, Number(previousAnnualSalaryCad)))
    : 0;
  const newSalary = Number.isFinite(Number(newAnnualSalaryCad))
    ? Math.max(0, Math.min(10_000_000, Number(newAnnualSalaryCad)))
    : 0;
  const years = Number.isFinite(Number(yearsOfContinuousService))
    ? Math.max(0, Math.min(60, Number(yearsOfContinuousService)))
    : 0;
  const daysElapsed = Number.isFinite(Number(daysSinceReductionImposed))
    ? Math.max(0, Math.min(3650, Math.floor(Number(daysSinceReductionImposed))))
    : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Percentage Reduction Calculation
  const dollarReductionCad = Math.max(0, prevSalary - newSalary);
  const percentageReduction = prevSalary > 0 ? Math.round(((dollarReductionCad / prevSalary) * 100) * 10) / 10 : 0;

  const isSubstantialReduction = percentageReduction >= ALBERTA_CONSTRUCTIVE_DISMISSAL_CONSTANTS.SALARY_REDUCTION_SUBSTANTIAL_PERCENT_THRESHOLD || unilateralReductionInHoursOrStatus;

  // 2. Condonation Risk Audit
  if (daysElapsed > 60 && !employeeAgreedToReduction) {
    riskWarnings.push({
      warningType: 'HIGH_RISK_OF_LEGAL_CONDONATION',
      description: `Working under the reduced compensation for ${daysElapsed} days without explicit written protest may be deemed by a court to constitute legal condonation (acceptance).`
    });
    actionableRemedies.push({
      action: 'SERVE_FORMAL_PROTEST_LETTER_IMMEDIATELY',
      remedyDescription: 'Send written notice to the employer clarifying that continued work is strictly under protest and without prejudice to rights.'
    });
  }

  // 3. Constructive Dismissal Finding
  let isConstructiveDismissal = false;
  if (isSubstantialReduction && !employeeAgreedToReduction) {
    isConstructiveDismissal = true;
    statutoryViolations.push({
      rule: 'UNILATERAL_FUNDAMENTAL_BREACH_CONSTRUCTIVE_DISMISSAL',
      statute: 'Employment Standards Code s. 56 & Farber Doctrine',
      finding: `Employer unilaterally cut compensation by ${percentageReduction}% ($${dollarReductionCad.toLocaleString()} CAD), fundamentally altering an essential employment term.`
    });
  }

  // 4. Statutory Termination Pay Calculation (Alberta ESC s. 56)
  let statutoryNoticeWeeks = 0;
  for (const tier of ALBERTA_CONSTRUCTIVE_DISMISSAL_CONSTANTS.TERMINATION_NOTICE_SCALE_WEEKS) {
    if (years >= tier.minYears && years < tier.maxYears) {
      statutoryNoticeWeeks = tier.weeks;
      break;
    }
  }

  const weeklySalaryCad = Math.round((prevSalary / 52) * 100) / 100;
  const statutoryTerminationPayCad = Math.round((weeklySalaryCad * statutoryNoticeWeeks) * 100) / 100;

  if (isConstructiveDismissal) {
    actionableRemedies.push({
      action: 'CLAIM_STATUTORY_TERMINATION_PAY_ESC_SECTION_56',
      remedyDescription: `Demand immediate payout of $${statutoryTerminationPayCad.toFixed(2)} (${statutoryNoticeWeeks} weeks termination pay) under Alberta ESC s. 56.`
    });
    actionableRemedies.push({
      action: 'CONSULT_EMPLOYMENT_COUNSEL_FOR_BARDAL_DAMAGES',
      remedyDescription: 'Evaluate potential common law wrongful dismissal damages, which typically exceed statutory minimums based on age and tenure.'
    });
  }

  let complianceStatus = 'NO_CONSTRUCTIVE_DISMISSAL_DETECTED';
  let legalVerdict = 'Compensation adjustment appears within permissible bounds or was mutually agreed.';

  if (isConstructiveDismissal) {
    complianceStatus = 'CONSTRUCTIVE_DISMISSAL_CONFIRMED';
    legalVerdict = `Employer's unilateral ${percentageReduction}% cut constitutes constructive dismissal. Employee may treat employment as terminated and recover $${statutoryTerminationPayCad.toFixed(2)} statutory notice pay plus accrued benefits.`;
  } else if (employeeAgreedToReduction) {
    complianceStatus = 'MUTUAL_AGREEMENT_NO_DISMISSAL';
    legalVerdict = 'Employee consented to the compensation modification, extinguishing constructive dismissal claims.';
  }

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA_CANADA',
    employerName: cleanEmployer,
    employeeName: cleanEmployee,
    jobTitle: cleanJobTitle,
    yearsOfContinuousService: years,
    previousAnnualSalaryCad: prevSalary,
    newAnnualSalaryCad: newSalary,
    percentageReduction,
    isSubstantialReduction,
    isConstructiveDismissal,
    complianceStatus,
    legalVerdict,
    severanceCalculation: {
      statutoryNoticeWeeks,
      weeklySalaryCad,
      statutoryTerminationPayCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Code, RSA 2000, c. E-9, ss. 55-58 (Termination of Employment & Pay in Lieu)',
      'Farber v. Royal Trust Co., [1997] 1 S.C.R. 846 (Supreme Court of Canada leading test for constructive dismissal)',
      'Potter v. New Brunswick Legal Aid Services Commission, 2015 SCC 10'
    ]
  };
}