// src/student-compliance.js
// Canadian International Student 24-Hour Work Rule & Study Permit Compliance Engine.
// Audits off-campus work authorization under the Immigration and Refugee Protection Regulations
// (SOR/2002-227, s. 186(v) - Fall 2024 24-hour weekly cap), study permit conditions (IRPR s. 220.1),
// scheduled break full-time work rights, authorized leave rules (150-day limit),
// and Post-Graduation Work Permit (PGWP) eligibility risks under IRPA s. 200(3)(e).
// Pure ES module with zero npm dependencies.
import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP = 24; // Effective Fall 2024
export const MAX_AUTHORIZED_LEAVE_DAYS = 150; // IRPR s. 220.1

export const ENROLLMENT_STATUS_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  FINAL_SEMESTER_PART_TIME: 'final_semester_part_time',
  AUTHORIZED_LEAVE: 'authorized_leave',
  SCHEDULED_BREAK: 'scheduled_break'
};

export function evaluateStudentWorkCompliance({
  enrollmentStatus = 'full_time', // 'full_time', 'part_time', 'final_semester_part_time', 'authorized_leave', 'scheduled_break'
  weeklyHoursWorked = 20,
  isDliDesignated = true,
  hasSocialInsuranceNumber = true,
  studyPermitConditionAllowsWork = true, // Must state "may accept employment on or off campus if meeting eligibility criteria"
  hasAuthorizedLeaveApprovalLetter = false,
  leaveDurationDays = 0,
  hasMaintainedContinuousFullTimeEnrollment = true,
  programType = 'university_degree', // 'university_degree', 'college_diploma', 'language_esl', 'private_career_college'
  isFieldOfStudyInPriorityShortage = true, // For 2024+ college PGWP rules
  officialLanguageClbScore = 7, // CLB 7 for degree, CLB 5 for college
  studentName = 'International Student',
  assessmentDate = todayIso()
} = {}) {
  const safeStudentName = boundedText(studentName, 'International Student', 120);
  const assessDate = safeIsoDate(assessmentDate, todayIso());
  const normEnrollment = boundedText(enrollmentStatus, 'full_time', 40).toLowerCase().trim();
  const hours = Math.max(0, Math.min(168, Number.isFinite(Number(weeklyHoursWorked)) ? Number(weeklyHoursWorked) : 0));
  const leaveDays = Math.max(0, Math.min(365, Number.isFinite(Number(leaveDurationDays)) ? Number(leaveDurationDays) : 0));
  const clbScore = Math.max(0, Math.min(12, Number.isFinite(Number(officialLanguageClbScore)) ? Number(officialLanguageClbScore) : 0));
  const violations = [];
  const pgwpRisks = [];
  let isWorkAuthorized = true;
  let maxPermittedHoursThisWeek = 0;
  let complianceVerdict = 'COMPLIANT_WITHIN_LIMITS';
  let summaryHeadline = '';

  // 1. Fundamental Statutory Work Eligibility Pre-Conditions
  if (!isDliDesignated) {
    isWorkAuthorized = false;
    violations.push({
      rule: 'Designated Learning Institution (DLI) Requirement',
      statute: 'IRPR s. 186(v)(i)',
      description: 'Institution is not a recognized DLI. Off-campus work authorization is strictly prohibited for non-DLI schools.'
    });
  }

  if (!hasSocialInsuranceNumber) {
    violations.push({
      rule: 'Social Insurance Number (SIN) Requirement',
      statute: 'IRPR s. 186(v) & Service Canada Regulations',
      description: 'Working without a valid SIN is an administrative offense. You must obtain a 900-series SIN before commencing work.'
    });
  }

  if (!studyPermitConditionAllowsWork) {
    isWorkAuthorized = false;
    violations.push({
      rule: 'Study Permit Working Condition Endorsement',
      statute: 'IRPR s. 185(c)',
      description: 'Study permit conditions do not authorize off-campus work. Requires formal study permit amendment (IMM 5218) before working.'
    });
  }

  if (programType === 'language_esl') {
    isWorkAuthorized = false;
    violations.push({
      rule: 'General Interest / ESL Exclusion',
      statute: 'IRPR s. 186(v)(iii)',
      description: 'Students enrolled in English or French as a second language (ESL/FSL) or prerequisite preparatory programs are legally barred from off-campus employment.'
    });
  }

  // 2. Weekly Hour Cap Audit (IRPR s. 186(v))
  if (normEnrollment === 'full_time' || normEnrollment === 'final_semester_part_time') {
    maxPermittedHoursThisWeek = STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP; // 24 hours

    if (hours > STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP) {
      isWorkAuthorized = false;
      const excessHours = hours - STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP;
      violations.push({
        rule: `Statutory 24-Hour Off-Campus Cap Exceeded (+${excessHours} hrs)`,
        statute: 'IRPR s. 186(v) & IRPA s. 30(1)',
        description: `Worked ${hours} hours in a regular academic week (Statutory cap is ${STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP} hrs). Even 1 hour of unauthorized work constitutes non-compliance.`
      });
      pgwpRisks.push(`Exceeding the 24-hour cap violates study permit conditions and triggers mandatory 6-month work permit refusal under IRPA s. 200(3)(e).`);
    }
  } else if (normEnrollment === 'scheduled_break') {
    // Scheduled break (e.g. summer break, reading week, winter holidays)
    maxPermittedHoursThisWeek = 40; // Full-time permitted
  } else if (normEnrollment === 'part_time') {
    maxPermittedHoursThisWeek = 0;
    if (hours > 0) {
      isWorkAuthorized = false;
      violations.push({
        rule: 'Unauthorized Work During Part-Time Studies',
        statute: 'IRPR s. 186(v)(i)',
        description: 'Part-time students (except those in their final graduating semester completing missing credits) have ZERO off-campus work authorization.'
      });
      pgwpRisks.push('Working while enrolled part-time is an illegal work violation that invalidates PGWP eligibility.');
    }
  } else if (normEnrollment === 'authorized_leave') {
    maxPermittedHoursThisWeek = 0;
    if (hours > 0) {
      isWorkAuthorized = false;
      violations.push({
        rule: 'Work Prohibited During Authorized Leave of Absence',
        statute: 'IRPR s. 220.1 & Operational Instructions',
        description: 'IRCC policy strictly forbids all on-campus and off-campus work during an authorized leave of absence from studies.'
      });
      pgwpRisks.push('Working during a leave of absence constitutes unauthorized work under IRPA s. 30.');
    }

    if (leaveDays > MAX_AUTHORIZED_LEAVE_DAYS) {
      violations.push({
        rule: `Authorized Leave Exceeds Statutory 150-Day Limit (${leaveDays} days)`,
        statute: 'IRPR s. 220.1(1)',
        description: 'A leave of absence exceeding 150 consecutive days constitutes failure to actively pursue studies. Student must change status to visitor or leave Canada.'
      });
    }

    if (!hasAuthorizedLeaveApprovalLetter) {
      violations.push({
        rule: 'Missing Official DLI Leave Authorization Letter',
        statute: 'IRPR s. 220.1',
        description: 'Must possess written formal confirmation from the DLI registrar approving the academic leave prior to taking time off.'
      });
    }
  }

  // 3. Post-Graduation Work Permit (PGWP) Eligibility Audit
  if (!hasMaintainedContinuousFullTimeEnrollment && normEnrollment !== 'final_semester_part_time') {
    pgwpRisks.push('Gap in Continuous Full-Time Studies: IRCC requires unbroken full-time enrollment every academic term (except summer scheduled breaks and final term). Any unapproved part-time semester or undocumented gap puts PGWP at critical risk.');
  }

  if (programType === 'private_career_college') {
    pgwpRisks.push('Private Career College Ineligibility: Private career college programs in Ontario and BC are generally ineligible for a PGWP unless under a grandfathered public-private curriculum licensing agreement.');
  }

  // New Fall 2024 / 2025 PGWP Rules Audit
  if (programType === 'college_diploma') {
    if (!isFieldOfStudyInPriorityShortage) {
      pgwpRisks.push('2024 PGWP Field of Study Restriction: Under new IRCC policy, graduates of college diploma programs must graduate from fields tied to national labour shortages (Healthcare, STEM, Trades, Transport, Agriculture) to qualify for a PGWP.');
    }
    if (clbScore < 5) {
      pgwpRisks.push(`Language Proficiency Below Benchmark: College PGWP requires minimum Canadian Language Benchmark (CLB) level 5 (current: CLB ${clbScore}).`);
    }
  } else if (programType === 'university_degree') {
    if (clbScore < 7) {
      pgwpRisks.push(`Language Proficiency Below Benchmark: University degree PGWP requires minimum CLB level 7 in all 4 language abilities (current: CLB ${clbScore}).`);
    }
  }

  // Final Verdict
  if (violations.length > 0) {
    complianceVerdict = 'NON_COMPLIANT_UNAUTHORIZED_WORK';
    summaryHeadline = `Critical Non-Compliance: ${violations.length} statutory violation(s) detected under IRPR s.186(v) / s.220.1. Immediate cessation of work required to avoid PGWP refusal.`;
  } else if (pgwpRisks.length > 0) {
    complianceVerdict = 'CURRENTLY_LEGAL_PGWP_AT_RISK';
    summaryHeadline = `Work authorization currently valid, but ${pgwpRisks.length} major Post-Graduation Work Permit (PGWP) eligibility risk factor(s) identified.`;
  } else {
    complianceVerdict = 'FULLY_COMPLIANT';
    summaryHeadline = `Fully Compliant: Working ${hours} hours/week within the statutory ${maxPermittedHoursThisWeek}-hour allowance. Studies and PGWP trajectory on track.`;
  }

  const statutoryAdvisories = [
    'The 24-Hour Cap is Strict (Fall 2024 Reform): The temporary COVID-era 20-hour waiver has ended. The statutory cap is strictly 24 hours per week during academic sessions. IRCC and CBSA access CRA payroll data to audit compliance.',
    'Part-Time Study Work Prohibition: If you drop a course and become part-time, your right to work off-campus vanishes immediately. The ONLY exception is your final graduating semester.',
    'Full-Time Work on Scheduled Breaks: You can work 40+ hours per week ONLY during breaks set in your DLI calendar (e.g. Reading Week, Winter Break, Summer break if full-time study is not mandatory for your program).',
    'Authorized Leave of Absence (150-Day Rule): If you take time off for medical or personal reasons with school approval, the leave cannot exceed 150 days. You CANNOT work a single hour during an authorized leave.',
    'PGWP Continuous Enrollment Rule: To get a PGWP, you must have maintained full-time student status during every single academic semester of your study program, except the final semester.'
  ];

  return {
    studentName: safeStudentName,
    assessmentDate: assessDate,
    asOf: assessDate,
    enrollmentStatus: normEnrollment,
    weeklyHoursWorked: hours,
    maxPermittedHoursThisWeek,
    isWorkAuthorized: isWorkAuthorized && violations.length === 0,
    complianceVerdict,
    summaryHeadline,
    statutoryViolations: violations,
    pgwpEligibilityRisks: pgwpRisks,
    complianceChecklist: {
      isDesignatedLearningInstitution: isDliDesignated,
      hasValidSin: hasSocialInsuranceNumber,
      permitHasWorkCondition: studyPermitConditionAllowsWork,
      isScheduledBreak: normEnrollment === 'scheduled_break',
      isFinalSemesterExemption: normEnrollment === 'final_semester_part_time'
    },
    statutoryAdvisories,
    statutoryAuthority: 'Immigration and Refugee Protection Regulations (SOR/2002-227, s. 186(v), s. 220.1, s. 222)'
  };
}
