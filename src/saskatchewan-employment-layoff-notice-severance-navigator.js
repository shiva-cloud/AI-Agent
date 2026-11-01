/**
 * Saskatchewan Employment Layoff Notice & Group Termination Navigator
 *
 * Computes statutory notice, pay in lieu, group termination mandates, and
 * just-cause exemptions under The Saskatchewan Employment Act, S.S. 2013, c. S-15.1,
 * Part II Div 4 ss. 2-59 to 2-62.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const SASKATCHEWAN_LAYOFF_CONSTANTS = Object.freeze({
  GROUP_TERMINATION_TIER_1_MIN_EMPLOYEES: 10,
  GROUP_TERMINATION_TIER_1_MAX_EMPLOYEES: 49,
  GROUP_TERMINATION_TIER_1_WEEKS: 4,

  GROUP_TERMINATION_TIER_2_MIN_EMPLOYEES: 50,
  GROUP_TERMINATION_TIER_2_MAX_EMPLOYEES: 99,
  GROUP_TERMINATION_TIER_2_WEEKS: 8,

  GROUP_TERMINATION_TIER_3_MIN_EMPLOYEES: 100,
  GROUP_TERMINATION_TIER_3_WEEKS: 12,

  STATUTORY_AUTHORITY: 'The Saskatchewan Employment Act, S.S. 2013, c. S-15.1, ss. 2-60, 2-62'
});

/**
 * Calculates individual statutory notice and group termination requirements under Saskatchewan law.
 *
 * @param {Object} params
 * @param {number} [params.yearsOfContinuousService=4] - Total continuous years of employment
 * @param {number} [params.regularWeeklyWageCad=1200] - Regular non-overtime weekly wages
 * @param {number} [params.employeesTerminatedIn4WeekWindow=1] - Total employees terminated at establishment in 4-week period
 * @param {boolean} [params.isTerminatedForJustCause=false] - Whether employer alleges just cause (wilful misconduct)
 * @param {boolean} [params.ministerNotifiedInWriting=true] - Whether employer gave written notice to the Minister under s. 2-62
 * @param {number} [params.actualNoticeWeeksGiven=0] - Number of weeks of working notice given
 * @returns {Object} Statutory notice calculation, group termination audit, and pay in lieu entitlements
 */
export function evaluateSaskatchewanLayoffNotice({
  yearsOfContinuousService = 4,
  regularWeeklyWageCad = 1200,
  employeesTerminatedIn4WeekWindow = 1,
  isTerminatedForJustCause = false,
  ministerNotifiedInWriting = true,
  actualNoticeWeeksGiven = 0,
  employeeName = 'Employee',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeEmployeeName = boundedText(employeeName, 120) || 'Employee';
  const safeAssessmentDate = safeIsoDate(assessmentDate);

  const justCause = Boolean(isTerminatedForJustCause);
  const ministerNotified = Boolean(ministerNotifiedInWriting);

  const serviceYears = Number.isFinite(Number(yearsOfContinuousService)) ? Math.max(0, Math.min(60, Number(yearsOfContinuousService))) : 4;
  const weeklyWage = Number.isFinite(Number(regularWeeklyWageCad)) ? Math.max(0, Math.min(100000, Number(regularWeeklyWageCad))) : 1200;
  const groupCount = Number.isFinite(Number(employeesTerminatedIn4WeekWindow)) ? Math.max(1, Math.min(100000, Math.floor(Number(employeesTerminatedIn4WeekWindow)))) : 1;
  const actualNotice = Number.isFinite(Number(actualNoticeWeeksGiven)) ? Math.max(0, Math.min(104, Number(actualNoticeWeeksGiven))) : 0;

  // 1. Just Cause Exemption (s. 2-60(3))
  if (justCause) {
    return {
      jurisdiction: 'SASKATCHEWAN_CANADA',
      employeeName: safeEmployeeName,
      assessmentDate: safeAssessmentDate,
      isTerminatedForJustCause: true,
      statutoryNoticeWeeksEntitled: 0,
      statutoryPayInLieuEntitledCad: 0,
      isGroupTerminationApplicable: false,
      legalVerdict: 'Employee is exempt from statutory notice or pay in lieu due to just cause termination under s. 2-60(3).',
      statutoryFindings: [
        'Under Saskatchewan law, just cause requires serious misconduct, wilful neglect of duty, or insubordination.'
      ],
      statutoryViolations: [],
      actionableRemedies: [
        {
          action: 'DISPUTE_JUST_CAUSE_ALLEGATION',
          remedyDescription: 'Employer carries legal onus to prove just cause; file wage claim with Labour Standards or file civil action if cause is disputed.'
        }
      ],
      statutoryCitations: [
        'The Saskatchewan Employment Act, S.S. 2013, c. S-15.1, s. 2-60(3)'
      ]
    };
  }

  // 2. Individual Notice Scale (s. 2-60(1))
  let individualNoticeWeeks = 0;
  if (serviceYears < 0.25) {
    individualNoticeWeeks = 0; // Less than 3 months
  } else if (serviceYears < 1) {
    individualNoticeWeeks = 1; // 3 mos to 1 yr: 1 week
  } else if (serviceYears < 3) {
    individualNoticeWeeks = 2; // 1 yr to 3 yrs: 2 weeks
  } else if (serviceYears < 5) {
    individualNoticeWeeks = 4; // 3 yrs to 5 yrs: 4 weeks
  } else if (serviceYears < 10) {
    individualNoticeWeeks = 6; // 5 yrs to 10 yrs: 6 weeks
  } else {
    individualNoticeWeeks = 8; // 10+ yrs: 8 weeks
  }

  // 3. Group Termination Notice Scale (s. 2-62)
  let groupNoticeWeeks = 0;
  let isGroupTermination = false;

  if (groupCount >= SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_3_MIN_EMPLOYEES) {
    groupNoticeWeeks = SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_3_WEEKS;
    isGroupTermination = true;
  } else if (groupCount >= SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_2_MIN_EMPLOYEES) {
    groupNoticeWeeks = SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_2_WEEKS;
    isGroupTermination = true;
  } else if (groupCount >= SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_1_MIN_EMPLOYEES) {
    groupNoticeWeeks = SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_1_WEEKS;
    isGroupTermination = true;
  }

  // Employee receives greater of individual notice or group notice
  const statutoryNoticeWeeksEntitled = Math.max(individualNoticeWeeks, groupNoticeWeeks);

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // Group notice compliance
  if (isGroupTermination && !ministerNotified) {
    statutoryViolations.push({
      rule: 'FAILURE_TO_NOTIFY_MINISTER_OF_GROUP_TERMINATION',
      statute: 'The Saskatchewan Employment Act s. 2-62(1)',
      finding: `Employer terminated ${groupCount} employees without providing mandatory written notice to the Minister of Labour Relations and Workplace Safety.`
    });
    actionableRemedies.push({
      action: 'DELIVER_MINISTER_GROUP_TERMINATION_NOTICE',
      remedyDescription: 'Immediately file formal written group termination notice with the Minister specifying reasons, affected employee count, and effective dates.'
    });
  }

  // Notice shortfall & pay in lieu
  const noticeShortfallWeeks = Math.max(0, statutoryNoticeWeeksEntitled - actualNotice);
  const statutoryPayInLieuEntitledCad = noticeShortfallWeeks * weeklyWage;

  if (noticeShortfallWeeks > 0) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_STATUTORY_TERMINATION_NOTICE',
      statute: 'The Saskatchewan Employment Act s. 2-60(1)',
      finding: `Employee was provided ${actualNotice} week${actualNotice === 1 ? '' : 's'} of notice, leaving a shortfall of ${noticeShortfallWeeks} week${noticeShortfallWeeks === 1 ? '' : 's'}. Entitled to $${statutoryPayInLieuEntitledCad} in pay in lieu.`
    });
    actionableRemedies.push({
      action: 'PAY_WAGES_IN_LIEU_OF_NOTICE',
      remedyDescription: `Remit $${statutoryPayInLieuEntitledCad} to the employee within 14 calendar days of termination pursuant to s. 2-60(2).`
    });
  }

  let complianceStatus = 'COMPLIANT_NOTICE_PROVIDED';
  let legalVerdict = `Employee is entitled to ${statutoryNoticeWeeksEntitled} weeks statutory notice (${isGroupTermination ? 'group termination scale applied' : 'individual tenure scale'}). Full notice or wages in lieu satisfied.`;

  if (statutoryViolations.length > 0) {
    complianceStatus = 'NON_COMPLIANT_NOTICE_SHORTFALL';
    legalVerdict = `Employer has an outstanding notice shortfall of ${noticeShortfallWeeks} weeks ($${statutoryPayInLieuEntitledCad} in wages in lieu) under The Saskatchewan Employment Act.`;
  }

  return {
    jurisdiction: 'SASKATCHEWAN_CANADA',
    employeeName: safeEmployeeName,
    assessmentDate: safeAssessmentDate,
    yearsOfContinuousService: serviceYears,
    regularWeeklyWageCad: weeklyWage,
    isGroupTerminationApplicable: isGroupTermination,
    totalEmployeesTerminatedInWindow: groupCount,
    complianceStatus,
    legalVerdict,
    noticeCalculation: {
      individualNoticeWeeks,
      groupNoticeWeeks,
      statutoryNoticeWeeksEntitled,
      actualNoticeWeeksGiven: actualNotice,
      noticeShortfallWeeks,
      statutoryPayInLieuEntitledCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'The Saskatchewan Employment Act, S.S. 2013, c. S-15.1, ss. 2-59, 2-60, 2-61, 2-62',
      'The Employment Standards Regulations, R.R.S. c. S-15.1 Reg 1'
    ]
  };
}
