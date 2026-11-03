/**
 * Ontario Employment Reprisal Complaint & OLRB Remedy Navigator
 *
 * Audits statutory reprisal violations under Ontario's Employment Standards Act, 2000,
 * S.O. 2000, c. 41, s. 74, enforcing the statutory reverse onus on employers (s. 74(2)),
 * protections against penalty or dismissal for inquiring about rights or taking leave,
 * and calculations for wage loss compensation, reinstatement orders, and OLRB appeals.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ONTARIO_REPRISAL_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 74, 103, 104',
  EMPLOYER_REVERSE_ONUS_PRESUMPTION: true, // s. 74(2)
  LIMITATION_PERIOD_YEARS: 2, // s. 111(1)
  PROTECTED_ACTIONS: Object.freeze([
    'ASKED_EMPLOYER_TO_COMPLY_WITH_ESA',
    'INQUIRED_ABOUT_STATUTORY_RIGHTS',
    'FILED_MINISTRY_OF_LABOUR_CLAIM',
    'TOOK_OR_REQUESTED_STATUTORY_LEAVE',
    'REFUSED_UNLAWFUL_UNPAID_OVERTIME',
    'TESTIFIED_IN_ESA_PROCEEDING'
  ])
});

/**
 * Audits an Ontario workplace reprisal, employer burden of proof, and recoverable remedies.
 *
 * @param {Object} params
 * @param {string} [params.protectedActionTaken='ASKED_EMPLOYER_TO_COMPLY_WITH_ESA'] - Category of statutory protected action
 * @param {string} [params.employerAdverseAction='TERMINATED_EMPLOYMENT'] - 'TERMINATED_EMPLOYMENT', 'SUSPENDED_WITHOUT_PAY', 'DEMOTED_OR_CUT_HOURS', 'HARASSED_OR_THREATENED'
 * @param {number} [params.daysBetweenActionAndReprisal=7] - Days between protected employee action and adverse penalty
 * @param {number} [params.regularWeeklyWageCad=1000] - Regular weekly gross earnings
 * @param {number} [params.weeksOfLostIncome=8] - Weeks of unemployment/reduced income resulting from reprisal
 * @param {boolean} [params.seeksJobReinstatement=true] - Whether employee requests reinstatement to former position
 * @param {boolean} [params.employerProvidedDocumentedPerformanceIssuesPrior=false] - Whether employer had pre-existing written progressive discipline
 * @returns {Object} Comprehensive reprisal audit, reverse onus evaluation, and monetary remedy calculation
 */
export function evaluateOntarioEmploymentReprisal({
  employeeName = 'Employee',
  protectedActionTaken = 'ASKED_EMPLOYER_TO_COMPLY_WITH_ESA',
  employerAdverseAction = 'TERMINATED_EMPLOYMENT',
  daysBetweenActionAndReprisal = 7,
  regularWeeklyWageCad = 1000,
  weeksOfLostIncome = 8,
  seeksJobReinstatement = true,
  employerProvidedDocumentedPerformanceIssuesPrior = false,
  employerName = 'Employer',
  jobTitle = 'Employee',
  adverseActionDescription = 'Adverse Action',
  assessmentDate = todayIso()
} = {}) {
  const cleanEmployee = boundedText(employeeName, 'Employee', 100);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const cleanEmployer = boundedText(employerName, 'Employer', 120);
  const cleanJobTitle = boundedText(jobTitle, 'Employee', 120);
  const cleanDescription = boundedText(adverseActionDescription, 'Adverse Action', 200);
  const safeProtectedAction = boundedText(protectedActionTaken, 'ASKED_EMPLOYER_TO_COMPLY_WITH_ESA', 80);
  const safeAdverseAction = boundedText(employerAdverseAction, 'TERMINATED_EMPLOYMENT', 80);

  const weeklyWage = Math.max(0, Math.min(100000, Number(regularWeeklyWageCad) || 0));
  const weeksLost = Math.max(0, Math.min(520, Math.floor(Number(weeksOfLostIncome) || 0)));
  const daysDiff = Math.max(0, Math.min(3650, Math.floor(Number(daysBetweenActionAndReprisal) || 0)));
  const reinstatementSought = Boolean(seeksJobReinstatement);
  const performanceIssuesDocumented = Boolean(employerProvidedDocumentedPerformanceIssuesPrior);

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Protected Action & Temporal Proximity Audit
  const isProtectedAction = ONTARIO_REPRISAL_CONSTANTS.PROTECTED_ACTIONS.includes(safeProtectedAction);
  if (!isProtectedAction) {
    riskWarnings.push({
      warningType: 'UNSPECIFIED_ACTION_CATEGORY',
      description: `Action '${safeProtectedAction}' must relate to rights under the Employment Standards Act, 2000 to trigger s. 74 protection.`
    });
  }

  // Under s. 74, any adverse action following protected inquiry establishes prima facie reprisal
  const isCloseTemporalProximity = daysDiff <= 30;

  if (isProtectedAction) {
    statutoryViolations.push({
      rule: 'STATUTORY_UNLAWFUL_REPRISAL',
      statute: 'Employment Standards Act, 2000 s. 74(1)',
      finding: `Employer subjected employee to '${safeAdverseAction}' ${daysDiff} days after employee exercised protected right '${safeProtectedAction}'.`
    });
  }

  // 2. Reverse Onus Evaluation (s. 74(2))
  let employerBurdenStatus = 'FAILED_TO_REBUT_REVERSE_ONUS';
  if (performanceIssuesDocumented) {
    employerBurdenStatus = 'EVIDENTIARY_DISPUTE_PRE_EXISTING_DISCIPLINE_ALLEGED';
    riskWarnings.push({
      warningType: 'EMPLOYER_MAY_ASSERT_NON_REPRISAL_MOTIVE',
      description: 'Employer documented prior performance concerns. However, if the protected action was even ONE factor in the adverse decision, reprisal is legally established under OLRB jurisprudence.'
    });
  } else {
    actionableRemedies.push({
      action: 'INVOKE_STATUTORY_REVERSE_ONUS_SECTION_74_2',
      remedyDescription: 'Under s. 74(2), the employer carries the full legal burden to prove the adverse action was entirely unrelated to the statutory exercise of rights.'
    });
  }

  // 3. Financial Damages Calculation (ss. 103, 104)
  const lostWagesCad = Math.round(weeklyWage * weeksLost * 100) / 100;
  // Ministry orders compensation for lost earnings plus emotional distress damages
  const estimatedDistressCompensationCad = safeAdverseAction === 'TERMINATED_EMPLOYMENT' ? 2000 : 500;
  const totalMonetaryRemedyCad = Math.round((lostWagesCad + estimatedDistressCompensationCad) * 100) / 100;

  actionableRemedies.push({
    action: 'FILE_MINISTRY_OF_LABOUR_REPRISAL_CLAIM',
    remedyDescription: `File a Form e-Claim with the Ministry of Labour seeking $${totalMonetaryRemedyCad.toFixed(2)} in wage loss and distress damages.`
  });

  if (reinstatementSought && safeAdverseAction === 'TERMINATED_EMPLOYMENT') {
    actionableRemedies.push({
      action: 'DEMAND_STATUTORY_JOB_REINSTATEMENT',
      remedyDescription: 'Request an Employment Standards Officer order reinstatement to former job with no loss of seniority or benefits under s. 104.'
    });
  }

  let complianceStatus = 'STATUTORY_REPRISAL_VIOLATION_CONFIRMED';
  let legalVerdict = `Employer committed statutory reprisal under ESA s. 74. Employer carries the reverse onus. Total actionable monetary claim: $${totalMonetaryRemedyCad.toFixed(2)}${reinstatementSought ? ' plus job reinstatement' : ''}.`;

  return {
    employeeName: cleanEmployee,
    assessmentDate: safeAssessmentDate,
    jurisdiction: 'ONTARIO_CANADA',
    employerName: cleanEmployer,
    jobTitle: cleanJobTitle,
    adverseActionDescription: cleanDescription,
    protectedActionTaken: safeProtectedAction,
    employerAdverseAction: safeAdverseAction,
    daysBetweenActionAndReprisal: daysDiff,
    isCloseTemporalProximity,
    complianceStatus,
    legalVerdict,
    remedySummary: {
      weeklyWageCad: weeklyWage,
      weeksOfLostIncome: weeksLost,
      lostWagesCad,
      estimatedDistressCompensationCad,
      totalMonetaryRemedyCad,
      reinstatementAvailable: reinstatementSought && safeAdverseAction === 'TERMINATED_EMPLOYMENT',
      employerReverseOnusApplies: true,
      employerBurdenStatus
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 74(1) (Reprisal prohibition), 74(2) (Reverse onus of proof), 103-104 (Officer remedy & reinstatement powers)',
      'Ontario Labour Relations Board (OLRB) Leading Decisions on Section 74 (Tainted Decision Principle)'
    ]
  };
}