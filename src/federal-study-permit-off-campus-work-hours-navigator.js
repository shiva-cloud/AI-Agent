/**
 * Federal Study Permit Off-Campus Work Hours & Compliance Navigator
 *
 * Audits IRPR s. 186(v) off-campus work authorization, incorporating the Fall 2024
 * permanent revised 24-hour weekly limit during academic sessions, full-time study
 * enrollment at a Designated Learning Institution (DLI), scheduled break rules,
 * and PGWP inadmissibility bars for unauthorized work under IRPR s. 200(3)(e).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText } from './utils/sanitizer.js';

function safeIsoDate(d) {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) {
    const parsed = new Date(d.trim());
    if (!Number.isNaN(parsed.getTime())) return d.trim();
  }
  return new Date().toISOString().slice(0, 10);
}

export const FEDERAL_STUDENT_WORK_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 186(v), 200(3)(e); IRCC Fall 2024 Policy',
  MAX_ACADEMIC_SESSION_WEEKLY_HOURS: 24, // Fall 2024 permanent statutory standard (up from 20h)
  UNLIMITED_HOURS_ON_SCHEDULED_BREAKS: true,
  MIN_PROGRAM_MONTHS_DURATION: 6,
  NON_COMPLIANCE_PGWP_BAR_MONTHS: 6 // IRPR s. 200(3)(e)
});

/**
 * Audits international student off-campus work compliance, weekly hours, and PGWP eligibility risks.
 *
 * @param {Object} params
 * @param {boolean} [params.hasValidStudyPermit=true] - Holds valid Canadian study permit
 * @param {boolean} [params.enrolledFullTimeAtDli=true] - Enrolled full-time at a Designated Learning Institution
 * @param {boolean} [params.isInRegularAcademicSession=true] - Currently in classes (not on a scheduled holiday/break)
 * @param {boolean} [params.isOnRegularlyScheduledBreak=false] - Summer break, winter break, or reading week
 * @param {number} [params.weeklyHoursWorkedOffCampus=24] - Total off-campus hours worked in a week
 * @param {boolean} [params.hasValidSocialInsuranceNumber=true] - Holds valid 900-series temporary SIN
 * @param {number} [params.programLengthMonths=24] - Total length of post-secondary program
 * @returns {Object} Comprehensive student off-campus work audit and PGWP impact evaluation
 */
export function evaluateFederalStudentOffCampusWork(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    hasValidStudyPermit = true,
    enrolledFullTimeAtDli = true,
    isInRegularAcademicSession = true,
    isOnRegularlyScheduledBreak = false,
    weeklyHoursWorkedOffCampus = 24,
    hasValidSocialInsuranceNumber = true,
    programLengthMonths = 24,
    studentName = 'Student',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeStudentName = boundedText(studentName, 120) || 'Student';
  const safeAssessmentDate = safeIsoDate(assessmentDate);

  const validPermit = Boolean(hasValidStudyPermit);
  const enrolledDli = Boolean(enrolledFullTimeAtDli);
  const inAcademicSession = Boolean(isInRegularAcademicSession);
  const onScheduledBreak = Boolean(isOnRegularlyScheduledBreak);
  const validSin = Boolean(hasValidSocialInsuranceNumber);

  const hours = Number.isFinite(Number(weeklyHoursWorkedOffCampus)) ? Math.max(0, Math.min(168, Number(weeklyHoursWorkedOffCampus))) : 0;
  const progLength = Number.isFinite(Number(programLengthMonths)) ? Math.max(0, Math.min(120, Math.floor(Number(programLengthMonths)))) : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Core Prerequisites (s. 186(v))
  if (!validPermit) {
    statutoryViolations.push({
      rule: 'NO_VALID_STUDY_PERMIT',
      statute: 'IRPR s. 186(v)',
      finding: 'Student does not hold a valid study permit and has no statutory work authorization in Canada.'
    });
  }

  if (!enrolledDli) {
    statutoryViolations.push({
      rule: 'NOT_ENROLLED_FULL_TIME_AT_DLI',
      statute: 'IRPR s. 186(v)(i)',
      finding: 'Off-campus work authorization strictly requires full-time enrollment in an eligible post-secondary program at a DLI.'
    });
  }

  if (progLength < FEDERAL_STUDENT_WORK_CONSTANTS.MIN_PROGRAM_MONTHS_DURATION) {
    statutoryViolations.push({
      rule: 'PROGRAM_DURATION_UNDER_6_MONTHS',
      statute: 'IRPR s. 186(v)(ii)',
      finding: `Program length is ${progLength} months. Off-campus work requires enrollment in a credentialed program of at least 6 months duration.`
    });
  }

  if (!validSin) {
    riskWarnings.push({
      warningType: 'MISSING_SOCIAL_INSURANCE_NUMBER',
      description: 'Under s. 186(v)(iii), student must obtain a Social Insurance Number (SIN) from Service Canada prior to commencing employment.'
    });
    actionableRemedies.push({
      action: 'OBTAIN_SIN_FROM_SERVICE_CANADA',
      remedyDescription: 'Visit Service Canada with study permit containing off-campus work conditions to obtain a 900-series SIN.'
    });
  }

  // 2. Weekly Hours Audit (Fall 2024 24-Hour Cap)
  let maxPermittedHours = 0;
  let isUnauthorizedWork = false;

  if (onScheduledBreak && !inAcademicSession) {
    // Scheduled Break: unlimited hours permitted
    maxPermittedHours = Infinity;
  } else {
    // Regular Academic Session: capped at 24 hours
    maxPermittedHours = FEDERAL_STUDENT_WORK_CONSTANTS.MAX_ACADEMIC_SESSION_WEEKLY_HOURS;
    if (hours > FEDERAL_STUDENT_WORK_CONSTANTS.MAX_ACADEMIC_SESSION_WEEKLY_HOURS) {
      isUnauthorizedWork = true;
      const excessHours = hours - FEDERAL_STUDENT_WORK_CONSTANTS.MAX_ACADEMIC_SESSION_WEEKLY_HOURS;
      statutoryViolations.push({
        rule: 'EXCEEDED_24_HOUR_WEEKLY_OFF_CAMPUS_CAP',
        statute: 'IRPR s. 186(v) & Fall 2024 Ministerial Policy',
        finding: `Worked ${hours} hours in a week during regular academic session. Exceeds the statutory permanent limit of 24 hours by ${excessHours} hour${excessHours === 1 ? '' : 's'}.`
      });
      actionableRemedies.push({
        action: 'IMMEDIATELY_REDUCE_WORK_HOURS_TO_24_OR_LESS',
        remedyDescription: 'Cease scheduling more than 24 hours per week immediately to mitigate ongoing IRPA s. 41 inadmissibility risks.'
      });
    }
  }

  // 3. PGWP Inadmissibility Impact (IRPR s. 200(3)(e))
  let pgwpAtRisk = false;
  if (isUnauthorizedWork) {
    pgwpAtRisk = true;
    statutoryViolations.push({
      rule: 'PGWP_INADMISSIBILITY_UNAUTHORIZED_WORK',
      statute: 'IRPR s. 200(3)(e)',
      finding: 'An officer cannot issue a post-graduation work permit (PGWP) if the applicant has engaged in unauthorized work unless 6 months have elapsed since cessation.'
    });
    actionableRemedies.push({
      action: 'SUBMIT_PROCEDURAL_FAIRNESS_EXPLANATION',
      remedyDescription: 'Prepare a sworn affidavit detailing unintentional minor excess hours with proof of academic enrollment if questioned by IRCC.'
    });
  }

  const isCompliant = statutoryViolations.length === 0;
  let complianceStatus = 'COMPLIANT_STUDENT_OFF_CAMPUS_WORK';
  let legalVerdict = 'Student work hours and academic standing comply with IRPR s. 186(v) 24-hour statutory limits. PGWP standing is protected.';

  if (!isCompliant) {
    complianceStatus = 'UNAUTHORIZED_WORK_NON_COMPLIANCE_DETECTED';
    legalVerdict = `Study permit condition non-compliance detected under IRPR s. 186(v) (${statutoryViolations.length} violation${statutoryViolations.length === 1 ? '' : 's'}). Severe PGWP and immigration status risks apply.`;
  }

  return {
    jurisdiction: 'FEDERAL_CANADA',
    studentName: safeStudentName,
    assessmentDate: safeAssessmentDate,
    isInRegularAcademicSession: inAcademicSession,
    isOnScheduledBreak: onScheduledBreak,
    weeklyHoursWorkedOffCampus: hours,
    maxPermittedWeeklyHours: maxPermittedHours === Infinity ? 'UNLIMITED' : maxPermittedHours,
    isCompliant,
    complianceStatus,
    legalVerdict,
    pgwpImpact: {
      pgwpAtRisk,
      unauthorizedWorkIdentified: isUnauthorizedWork,
      statutory6MonthWorkPermitBarApplies: pgwpAtRisk
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 186(v), 200(3)(e)',
      'IRCC Operational Instructions: Study Permits - Off-Campus Work (Fall 2024 24-Hour Revised Rule)'
    ]
  };
}