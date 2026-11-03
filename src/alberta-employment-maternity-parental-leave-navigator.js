/**
 * Alberta Employment Maternity & Parental Leave Navigator
 *
 * Audits 90-day service qualifications, 16-week maternity and 62-week parental
 * leave entitlements, 78-week combined caps, notice periods, and mandatory
 * job reinstatement under Alberta's Employment Standards Code, RSA 2000, c. E-9,
 * Part 2 Div 7 ss. 45–53.1.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_MATERNITY_PARENTAL_CONSTANTS = Object.freeze({
  MIN_SERVICE_DAYS_REQUIRED: 90, // s. 45
  MAX_MATERNITY_LEAVE_WEEKS: 16, // s. 46(1)
  MAX_PARENTAL_LEAVE_WEEKS: 62, // s. 49(1)
  MAX_COMBINED_MATERNITY_PARENTAL_WEEKS: 78, // s. 49(2)
  NOTICE_WEEKS_BEFORE_COMMENCING_LEAVE: 6, // s. 47(1), 50(1)
  NOTICE_WEEKS_BEFORE_RETURNING_TO_WORK: 4, // s. 51(1)
  STATUTORY_AUTHORITY: 'Employment Standards Code, RSA 2000, c. E-9, ss. 45-53.1'
});

/**
 * Audits Alberta maternity and parental leave eligibility, weeks requested, notice, and job protection.
 *
 * @param {Object} params
 * @param {string} [params.leaveType='COMBINED_MATERNITY_PARENTAL'] - 'MATERNITY_ONLY', 'PARENTAL_ONLY', 'COMBINED_MATERNITY_PARENTAL'
 * @param {number} [params.consecutiveDaysOfEmployment=180] - Calendar days of continuous employment with employer
 * @param {number} [params.maternityWeeksRequested=16] - Requested maternity leave weeks
 * @param {number} [params.parentalWeeksRequested=62] - Requested parental leave weeks
 * @param {number} [params.noticeWeeksProvidedBeforeLeave=6] - Advance written notice given to employer before starting leave
 * @param {boolean} [params.medicalCertificateProvided=true] - Medical doctor or midwife note provided stating delivery date
 * @param {number} [params.noticeWeeksProvidedBeforeReturn=4] - Advance written notice provided prior to returning
 * @param {boolean} [params.employerRefusesReinstatement=false] - Employer failed or refused to reinstate to same/comparable job
 * @param {boolean} [params.employerDisciplinedOrDismissedDueToLeave=false] - Employer reprisal under s. 53.1
 * @returns {Object} Comprehensive Alberta leave audit and job protection evaluation
 */
export function evaluateAlbertaMaternityParentalLeave({
  leaveType = 'COMBINED_MATERNITY_PARENTAL',
  consecutiveDaysOfEmployment = 180,
  maternityWeeksRequested = 16,
  parentalWeeksRequested = 62,
  noticeWeeksProvidedBeforeLeave = 6,
  medicalCertificateProvided = true,
  noticeWeeksProvidedBeforeReturn = 4,
  employerRefusesReinstatement = false,
  employerDisciplinedOrDismissedDueToLeave = false,
  employeeName = 'Employee',
  assessmentDate = todayIso()
} = {}) {
  const cleanLeaveType = boundedText(leaveType, 'COMBINED_MATERNITY_PARENTAL', 50);
  const cleanEmployeeName = boundedText(employeeName, 'Employee', 120);
  const cleanDate = safeIsoDate(assessmentDate, todayIso());
  const daysEmployed = Number.isFinite(Number(consecutiveDaysOfEmployment))
    ? Math.max(0, Math.min(36500, Math.floor(Number(consecutiveDaysOfEmployment))))
    : 0;
  const matWeeks = Number.isFinite(Number(maternityWeeksRequested))
    ? Math.max(0, Math.min(104, Math.floor(Number(maternityWeeksRequested))))
    : 0;
  const parWeeks = Number.isFinite(Number(parentalWeeksRequested))
    ? Math.max(0, Math.min(104, Math.floor(Number(parentalWeeksRequested))))
    : 0;
  const noticeBefore = Number.isFinite(Number(noticeWeeksProvidedBeforeLeave))
    ? Math.max(0, Math.min(52, Math.floor(Number(noticeWeeksProvidedBeforeLeave))))
    : 0;
  const noticeReturn = Number.isFinite(Number(noticeWeeksProvidedBeforeReturn))
    ? Math.max(0, Math.min(52, Math.floor(Number(noticeWeeksProvidedBeforeReturn))))
    : 0;

  const meets90DayThreshold = daysEmployed >= ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MIN_SERVICE_DAYS_REQUIRED;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Service Requirement Audit (s. 45)
  if (!meets90DayThreshold) {
    const deficitDays = ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MIN_SERVICE_DAYS_REQUIRED - daysEmployed;
    statutoryViolations.push({
      rule: 'INSUFFICIENT_SERVICE_DAYS',
      statute: 'Employment Standards Code s. 45',
      finding: `Employee has ${daysEmployed} days of continuous employment. Minimum 90 calendar days required for statutory leave entitlement.`
    });
    actionableRemedies.push({
      action: 'ACCRUE_REMAINING_SERVICE_DAYS',
      remedyDescription: `Work ${deficitDays} additional calendar day${deficitDays === 1 ? '' : 's'} to attain statutory leave qualification.`
    });
  }

  // 2. Maximum Leave Duration Audit
  let totalWeeksRequested = 0;
  if (cleanLeaveType === 'MATERNITY_ONLY') {
    totalWeeksRequested = matWeeks;
    if (matWeeks > ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_MATERNITY_LEAVE_WEEKS) {
      riskWarnings.push({
        warningType: 'MATERNITY_LEAVE_EXCEEDS_STATUTORY_MAX',
        description: `Maternity leave request of ${matWeeks} weeks exceeds the statutory maximum of 16 weeks.`
      });
    }
  } else if (cleanLeaveType === 'PARENTAL_ONLY') {
    totalWeeksRequested = parWeeks;
    if (parWeeks > ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_PARENTAL_LEAVE_WEEKS) {
      riskWarnings.push({
        warningType: 'PARENTAL_LEAVE_EXCEEDS_STATUTORY_MAX',
        description: `Parental leave request of ${parWeeks} weeks exceeds the statutory maximum of 62 weeks.`
      });
    }
  } else {
    // Combined
    totalWeeksRequested = matWeeks + parWeeks;
    if (totalWeeksRequested > ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_COMBINED_MATERNITY_PARENTAL_WEEKS) {
      riskWarnings.push({
        warningType: 'COMBINED_LEAVE_EXCEEDS_78_WEEKS',
        description: `Combined leave request of ${totalWeeksRequested} weeks exceeds the statutory maximum of 78 weeks.`
      });
    }
  }

  // 3. Notice Periods & Medical Certificate (s. 47, 50, 51)
  if (noticeBefore < ALBERTA_MATERNITY_PARENTAL_CONSTANTS.NOTICE_WEEKS_BEFORE_COMMENCING_LEAVE) {
    riskWarnings.push({
      warningType: 'SHORT_COMMENCEMENT_NOTICE',
      description: `Provided ${noticeBefore} weeks notice before leave. Statute prescribes at least 6 weeks written notice unless medical urgency prevented it.`
    });
  }

  if (cleanLeaveType !== 'PARENTAL_ONLY' && !medicalCertificateProvided) {
    riskWarnings.push({
      warningType: 'MISSING_MEDICAL_CERTIFICATE',
      description: 'Section 47(1)(b) requires a medical certificate confirming pregnancy and estimated delivery date.'
    });
  }

  if (noticeReturn < ALBERTA_MATERNITY_PARENTAL_CONSTANTS.NOTICE_WEEKS_BEFORE_RETURNING_TO_WORK) {
    riskWarnings.push({
      warningType: 'SHORT_RETURN_NOTICE',
      description: `Provided ${noticeReturn} weeks notice of return. Section 51(1) requires at least 4 weeks written notice.`
    });
  }

  // 4. Job Reinstatement & Anti-Reprisal Audit (s. 53, 53.1)
  if (employerRefusesReinstatement) {
    statutoryViolations.push({
      rule: 'UNLAWFUL_DENIAL_OF_JOB_REINSTATEMENT',
      statute: 'Employment Standards Code s. 53',
      finding: 'Employer failed or refused to reinstate employee to former position or comparable work with no reduction in pay/benefits.'
    });
    actionableRemedies.push({
      action: 'FILE_EMPLOYMENT_STANDARDS_REINSTATEMENT_ORDER',
      remedyDescription: 'File an Employment Standards complaint; Director may order immediate job reinstatement plus back pay.'
    });
  }

  if (employerDisciplinedOrDismissedDueToLeave) {
    statutoryViolations.push({
      rule: 'STATUTORY_REPRISAL_PREGNANCY_PARENTAL_LEAVE',
      statute: 'Employment Standards Code s. 53.1 & Alberta Human Rights Act',
      finding: 'Employer dismissed or disciplined employee for exercising statutory pregnancy or parental leave rights.'
    });
    actionableRemedies.push({
      action: 'FILE_ALBERTA_HUMAN_RIGHTS_COMPLAINT_GENDER',
      remedyDescription: 'File a concurrent human rights complaint with the Alberta Human Rights Commission for gender and family status discrimination.'
    });
  }

  let isEligible = meets90DayThreshold;
  let complianceStatus = 'COMPLIANT_LEAVE_AND_JOB_PROTECTION';
  let legalVerdict = 'Employee qualifies for job-protected leave under Alberta Employment Standards Code. Reinstatement rights are statutorily protected under the Code.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'UNLAWFUL_EMPLOYER_LEAVE_OR_REINSTATEMENT_BREACH';
    legalVerdict = `Employer committed statutory violations under Alberta ESC ss. 45–53.1 (${statutoryViolations.length} infraction${statutoryViolations.length === 1 ? '' : 's'}). Remedies for reinstatement and compensation apply.`;
  } else if (!meets90DayThreshold) {
    complianceStatus = 'INELIGIBLE_UNDER_90_DAYS_SERVICE';
    legalVerdict = 'Employee does not yet meet the 90-day continuous service threshold for statutory maternity/parental leave in Alberta.';
  }

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA_CANADA',
    employeeName: cleanEmployeeName,
    leaveType: cleanLeaveType,
    consecutiveDaysOfEmployment: daysEmployed,
    meets90DayThreshold,
    totalWeeksRequested,
    isEligible,
    complianceStatus,
    legalVerdict,
    leaveEntitlementSummary: {
      statutoryMaxMaternityWeeks: ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_MATERNITY_LEAVE_WEEKS,
      statutoryMaxParentalWeeks: ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_PARENTAL_LEAVE_WEEKS,
      statutoryMaxCombinedWeeks: ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_COMBINED_MATERNITY_PARENTAL_WEEKS,
      hasCompliantCommencementNotice: noticeBefore >= 6,
      hasCompliantReturnNotice: noticeReturn >= 4,
      isReinstatementMandatory: true
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Code, RSA 2000, c. E-9, ss. 45-53.1',
      'Alberta Human Rights Act, RSA 2000, c. A-25.5 (Gender & Family Status protections)'
    ]
  };
}
