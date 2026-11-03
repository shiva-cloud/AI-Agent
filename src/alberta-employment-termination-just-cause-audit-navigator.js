/**
 * Alberta Employment Termination Just-Cause Audit Navigator
 *
 * Audits employer allegations of just cause under Alberta's Employment Standards
 * Code (RSA 2000, c. E-9, ss. 55(2)(f), 56, 57), progressive discipline requirements,
 * and the Supreme Court of Canada McKinley v. BC Tel proportionality doctrine.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_JUST_CAUSE_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Employment Standards Code, RSA 2000, c. E-9, ss. 55(2)(f), 56-58',
  SUPREME_COURT_AUTHORITY: 'McKinley v. BC Tel, 2001 SCC 38',
  MAX_STATUTORY_TERMINATION_NOTICE_WEEKS: 8
});

/**
 * Audits whether an employee termination meets the rigorous legal test for just cause under Alberta law.
 *
 * @param {Object} params
 * @param {string} [params.allegedMisconductCategory='PERFORMANCE_ISSUES'] - 'CRIMINAL_THEFT_FRAUD', 'GROSS_INSUBORDINATION', 'PERFORMANCE_ISSUES', 'ATTENDANCE_LATENESS'
 * @param {boolean} [params.employerIssuedPriorWrittenWarnings=false] - Documented progressive discipline / warnings issued
 * @param {boolean} [params.employeeGivenOpportunityToImprove=false] - Reasonable timeline provided under Performance Improvement Plan (PIP)
 * @param {number} [params.yearsOfContinuousService=5] - Completed years of employment
 * @param {number} [params.regularWeeklyWageCad=1100] - Regular non-overtime weekly wages
 * @param {number} [params.actualTerminationNoticeWeeksGiven=0] - Working notice given by employer
 * @returns {Object} Comprehensive just-cause defensibility audit and statutory pay calculation
 */
export function auditAlbertaTerminationJustCause({
  allegedMisconductCategory = 'PERFORMANCE_ISSUES',
  employerIssuedPriorWrittenWarnings = false,
  employeeGivenOpportunityToImprove = false,
  yearsOfContinuousService = 5,
  regularWeeklyWageCad = 1100,
  actualTerminationNoticeWeeksGiven = 0,
  employeeName = 'Employee',
  employerName = 'Employer',
  assessmentDate = todayIso()
} = {}) {
  const cleanCategory = boundedText(allegedMisconductCategory, 'PERFORMANCE_ISSUES', 60);
  const cleanEmployee = boundedText(employeeName, 'Employee', 120);
  const cleanEmployer = boundedText(employerName, 'Employer', 120);
  const cleanDate = safeIsoDate(assessmentDate, todayIso());
  const serviceYears = Number.isFinite(Number(yearsOfContinuousService)) ? Math.max(0, Math.min(60, Number(yearsOfContinuousService))) : 5;
  const weeklyWage = Number.isFinite(Number(regularWeeklyWageCad)) ? Math.max(0, Math.min(100000, Number(regularWeeklyWageCad))) : 1100;
  const actualNotice = Number.isFinite(Number(actualTerminationNoticeWeeksGiven)) ? Math.max(0, Math.min(52, Number(actualTerminationNoticeWeeksGiven))) : 0;

  // 1. Statutory Notice Scale under Alberta ESC s. 56
  let statutoryNoticeWeeks = 0;
  if (serviceYears < 0.25) statutoryNoticeWeeks = 0; // Under 3 months: 0
  else if (serviceYears < 2) statutoryNoticeWeeks = 1; // 3 mos - 2 yrs: 1 week
  else if (serviceYears < 4) statutoryNoticeWeeks = 2; // 2 - 4 yrs: 2 weeks
  else if (serviceYears < 6) statutoryNoticeWeeks = 4; // 4 - 6 yrs: 4 weeks
  else if (serviceYears < 8) statutoryNoticeWeeks = 5; // 6 - 8 yrs: 5 weeks
  else if (serviceYears < 10) statutoryNoticeWeeks = 6; // 8 - 10 yrs: 6 weeks
  else statutoryNoticeWeeks = 8; // 10+ yrs: 8 weeks

  const statutoryTerminationPayEntitledCad = statutoryNoticeWeeks * weeklyWage;

  // 2. McKinley Proportionality & Just Cause Threshold Evaluation
  let isJustCauseEstablished = false;
  let causeDefensibilityVerdict = 'UNSUSTAINABLE_CAUSE_ALLEGATION';
  const statutoryViolations = [];
  const legalVulnerabilities = [];
  const actionableRemedies = [];

  const isSevereMisconduct = cleanCategory === 'CRIMINAL_THEFT_FRAUD' || cleanCategory === 'GROSS_INSUBORDINATION';

  if (isSevereMisconduct) {
    isJustCauseEstablished = true;
    causeDefensibilityVerdict = 'PROBABLE_JUST_CAUSE_ESTABLISHED';
  } else {
    // For performance or attendance, just cause requires documented progressive discipline
    if (employerIssuedPriorWrittenWarnings && employeeGivenOpportunityToImprove) {
      isJustCauseEstablished = true;
      causeDefensibilityVerdict = 'ARGUABLE_CAUSE_WITH_PROGRESSIVE_DISCIPLINE';
    } else {
      isJustCauseEstablished = false;
      causeDefensibilityVerdict = 'UNSUSTAINABLE_CAUSE_LACKS_PROGRESSIVE_DISCIPLINE';

      legalVulnerabilities.push({
        vulnerability: 'NO_PROGRESSIVE_DISCIPLINE_FOR_MINOR_DEFICIT',
        legalPrecedent: 'McKinley v. BC Tel, 2001 SCC 38',
        analysis: `Under Supreme Court doctrine, performance and attendance issues do not constitute summary just cause without clear progressive warnings and a reasonable opportunity to remediate.`
      });

      statutoryViolations.push({
        rule: 'UNLAWFUL_DENIAL_OF_STATUTORY_TERMINATION_PAY',
        statute: 'Employment Standards Code s. 55(2)(f) & s. 57',
        finding: `Employer dismissed employee alleging cause without progressive discipline. Under Alberta law, statutory termination pay ($${statutoryTerminationPayEntitledCad}) cannot be withheld.`
      });

      actionableRemedies.push({
        action: 'FILE_EMPLOYMENT_STANDARDS_TERMINATION_PAY_CLAIM',
        remedyDescription: `File a formal wage complaint with Alberta Employment Standards to recover $${statutoryTerminationPayEntitledCad} in statutory termination pay.`
      });

      actionableRemedies.push({
        action: 'CONSULT_LITIGATION_COUNSEL_FOR_WRONGFUL_DISMISSAL',
        remedyDescription: 'Seek common law wrongful dismissal damages; judicial awards in Alberta typically range from 1 to 24 months compensation depending on Bardal factors.'
      });
    }
  }

  const noticeShortfallWeeks = isJustCauseEstablished ? 0 : Math.max(0, statutoryNoticeWeeks - actualNotice);
  const netPayOwingCad = noticeShortfallWeeks * weeklyWage;

  let complianceStatus = isJustCauseEstablished
    ? 'JUST_CAUSE_SUPPORTABLE_UNDER_MCKINLEY'
    : 'JUST_CAUSE_DEFECTIVE_TERMINATION_PAY_OWED';

  let legalVerdict = isJustCauseEstablished
    ? `Employer allegation of just cause under s. 55(2)(f) appears defensible based on severity or documented progressive discipline.`
    : `Employer's just-cause allegation is legally defective under McKinley proportionality principles. Employer owes $${netPayOwingCad} in statutory termination pay, plus common law notice.`;

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA_CANADA',
    employeeName: cleanEmployee,
    employerName: cleanEmployer,
    allegedMisconductCategory: cleanCategory,
    yearsOfContinuousService: serviceYears,
    regularWeeklyWageCad: weeklyWage,
    isJustCauseEstablished,
    causeDefensibilityVerdict,
    complianceStatus,
    legalVerdict,
    statutoryNoticeScale: {
      statutoryNoticeWeeks,
      actualNoticeWeeksGiven: actualNotice,
      noticeShortfallWeeks,
      statutoryTerminationPayEntitledCad: netPayOwingCad
    },
    legalVulnerabilities,
    statutoryViolations,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Code, RSA 2000, c. E-9, ss. 55(2)(f), 56, 57, 58',
      'McKinley v. BC Tel, 2001 SCC 38',
      'Alberta Employment Standards Directives: Termination for Just Cause'
    ]
  };
}
