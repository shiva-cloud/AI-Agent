/**
 * Northstar Canada Status & Admissibility Guard
 * Implements statutory standards for:
 * 1. Restoration of Temporary Resident Status - IRPR s. 182 (90-day strict deadline, work prohibition)
 * 2. Flagpoling Border Restrictions - CBSA June 2024 Directives (PGWP border ban, port hours)
 * 3. DLI Compliance & Authorized Leave Limit - IRPR s. 220.1 (150-day maximum authorized leave)
 * 4. Criminal Inadmissibility & Rehabilitation - IRPA s. 36 & s. 24 (10-yr deemed vs individual rehab vs TRP)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const ADMISSIBILITY_CONSTANTS = {
  RESTORATION_DEADLINE_DAYS: 90,
  RESTORATION_BASE_FEE_CAD: 229, // $200 restoration + $29 (or $200 restoration + $155 permit fee)
  DLI_MAX_AUTHORIZED_LEAVE_DAYS: 150, // IRPR s. 220.1 authorized break ceiling
  DEEMED_REHABILITATION_YEARS_NON_SERIOUS: 10,
  INDIVIDUAL_REHABILITATION_MIN_YEARS: 5
};

/**
 * Evaluates Restoration of Temporary Resident Status under IRPR s. 182
 */
export function evaluateRestorationOfStatus(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    statusExpiredDate = '2026-03-01',
    assessmentDate = '2026-04-15',
    visaType = 'worker', // 'worker', 'student', 'visitor'
    remainedInCanada = true,
    compliedWithOtherConditions = true
  } = safeParams;
  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanVisaType = boundedText(visaType, 'worker', 30);
  const safeExpiredStr = safeIsoDate(statusExpiredDate, '2026-03-01');
  const safeAssessmentStr = safeIsoDate(assessmentDate, '2026-04-15');

  const expiredTime = new Date(safeExpiredStr + 'T00:00:00Z').getTime();
  const currentTime = new Date(safeAssessmentStr + 'T00:00:00Z').getTime();
  const daysSinceExpiry = Math.floor((currentTime - expiredTime) / (1000 * 60 * 60 * 24));

  const isWithin90Days = daysSinceExpiry >= 0 && daysSinceExpiry <= ADMISSIBILITY_CONSTANTS.RESTORATION_DEADLINE_DAYS;
  const daysRemainingToApply = Math.max(0, ADMISSIBILITY_CONSTANTS.RESTORATION_DEADLINE_DAYS - daysSinceExpiry);

  const defects = [];
  if (!isWithin90Days) {
    defects.push(`Status expired ${daysSinceExpiry} days ago, exceeding the strict 90-day statutory limitation under IRPR s. 182. Restoration is no longer available; foreign national must immediately depart Canada.`);
  }
  if (!remainedInCanada) {
    defects.push('Applicant left Canada. Restoration under s. 182 can ONLY be applied for from within Canada.');
  }

  const isEligibleToApply = isWithin90Days && Boolean(remainedInCanada) && Boolean(compliedWithOtherConditions);

  return {
    applicantName: cleanApplicantName,
    assessmentDate: safeAssessmentStr,
    statutoryBasis: 'Immigration and Refugee Protection Regulations (IRPR), s. 182',
    isEligibleToApply,
    daysSinceExpiry,
    daysRemainingToApply: isWithin90Days ? daysRemainingToApply : 0,
    statutoryWorkStudyProhibition: {
      canWorkWhilePending: false,
      canStudyWhilePending: false,
      legalRule: 'CRITICAL: Maintained status (formerly implied status) under IRPR s. 186(u) does NOT apply to restoration applications. Under IRPR s. 182, the foreign national CANNOT legally work or study while the restoration application is pending. Working during restoration constitutes unauthorized employment under IRPA s. 30(1).'
    },
    governmentFeesCad: {
      restorationFeeCad: 229,
      permitFeeCad: cleanVisaType === 'visitor' ? 100 : 155
    },
    defects
  };
}

/**
 * Audits CBSA Flagpoling Eligibility and Operational Border Restrictions
 */
export function auditFlagpolingEligibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    requestedPermitType = 'pgwp', // 'pgwp', 'work_permit_lmia_exempt', 'study_permit', 'visitor_record'
    borderPort = 'peace_bridge', // 'peace_bridge', 'queenston_lewiston', 'rainbow_bridge', 'pacific_highway'
    dayOfWeek = 'wednesday', // 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    timeOfArrivalHour = 10 // 0-23
  } = safeParams;
  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanPermitType = boundedText(requestedPermitType, 'pgwp', 50);
  const cleanBorderPort = boundedText(borderPort, 'peace_bridge', 50);
  const cleanDayOfWeek = boundedText(dayOfWeek, 'wednesday', 20);
  const safeArrivalHour = Number.isFinite(Number(timeOfArrivalHour))
    ? Math.max(0, Math.min(23, Math.floor(Number(timeOfArrivalHour))))
    : 10;

  const isPgwp = cleanPermitType.toLowerCase() === 'pgwp';
  const isSouthernOntarioBridge = ['peace_bridge', 'queenston_lewiston', 'rainbow_bridge'].includes(cleanBorderPort.toLowerCase());
  const isValidPortDay = ['tuesday', 'wednesday', 'thursday'].includes(cleanDayOfWeek.toLowerCase());
  const isValidPortHour = safeArrivalHour >= 8 && safeArrivalHour <= 13;

  const defects = [];

  // June 2024 IRCC PGWP Flagpoling Ban
  if (isPgwp) {
    defects.push('PGWP BORDER BAN: Effective June 21, 2024, IRCC and CBSA strictly prohibit flagpoling at ports of entry to apply for a Post-Graduation Work Permit (PGWP). PGWP applications must be submitted online from within Canada under IRPR s. 199.');
  }

  if (isSouthernOntarioBridge) {
    if (!isValidPortDay) {
      defects.push(`Southern Ontario border ports only process flagpoling Tuesday through Thursday. ${cleanDayOfWeek} is not an authorized service day.`);
    }
    if (!isValidPortHour) {
      defects.push(`Operational processing window is 8:00 AM to 1:00 PM. Arrival at hour ${safeArrivalHour} is outside the statutory processing quota window.`);
    }
  }

  const isFlagpolingPermitted = defects.length === 0;

  return {
    applicantName: cleanApplicantName,
    statutoryBasis: 'CBSA Enforcement Manual ENF 4; IRCC June 21, 2024 Ministerial Policy Directive',
    requestedPermitType: cleanPermitType,
    borderPort: cleanBorderPort,
    isFlagpolingPermitted,
    defects,
    warning: isPgwp
      ? 'Attempting to flagpole for a PGWP at a US-Canada land border will result in refusal by CBSA, issuance of an administrative refusal or Form IMM 5292, and potential cancellation of maintained status.'
      : 'CBSA border ports enforce strict daily quotas (often 10-15 per day) and turn away applicants once quotas are reached.'
  };
}

/**
 * Audits DLI Authorized Leave Compliance under IRPR s. 220.1
 */
export function auditDliAuthorizedLeave(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    studentName = 'Student',
    leaveDurationDays = 120,
    hasOfficialSchoolLeaveApproval = true,
    workedDuringLeave = false
  } = safeParams;
  const cleanStudentName = boundedText(studentName, 'Student', 100);
  const safeLeaveDays = Number.isFinite(Number(leaveDurationDays))
    ? Math.max(0, Math.min(36500, Math.floor(Number(leaveDurationDays))))
    : 120;

  const exceeds150Days = safeLeaveDays > ADMISSIBILITY_CONSTANTS.DLI_MAX_AUTHORIZED_LEAVE_DAYS;
  const isCompliant = !exceeds150Days && Boolean(hasOfficialSchoolLeaveApproval) && !Boolean(workedDuringLeave);

  const violations = [];
  if (exceeds150Days) {
    violations.push(`Leave duration of ${safeLeaveDays} days exceeds the statutory maximum of 150 consecutive days under IRPR s. 220.1. Student status is legally breached unless the student resumes studies or changes status to visitor.`);
  }
  if (!hasOfficialSchoolLeaveApproval) {
    violations.push('Student took leave without formal written authorization from their Designated Learning Institution (DLI).');
  }
  if (workedDuringLeave) {
    violations.push('ILLEGAL WORK: Under IRPR s. 186(v), international students are STRICTLY PROHIBITED from working (either on-campus or off-campus) during an authorized leave of absence.');
  }

  return {
    studentName: cleanStudentName,
    statutoryBasis: 'Immigration and Refugee Protection Regulations (IRPR), s. 220.1 & s. 186(v)',
    maxAuthorizedDays: ADMISSIBILITY_CONSTANTS.DLI_MAX_AUTHORIZED_LEAVE_DAYS,
    leaveDurationDays: safeLeaveDays,
    isCompliant,
    violations,
    consequence: isCompliant
      ? 'Leave is compliant with IRCC policy. The student maintains lawful study permit status.'
      : 'Loss of full-time student status, forfeiture of PGWP eligibility under IRCC program delivery instructions, and potential study permit revocation.'
  };
}

/**
 * Evaluates Criminal Inadmissibility: Deemed Rehab vs Individual Rehab vs TRP under IRPA s. 36
 */
export function evaluateCriminalInadmissibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    offenseClassification = 'non_serious_summary', // 'non_serious_summary', 'serious_criminality'
    yearsSinceSentenceCompleted = 11,
    numberOfConvictions = 1
  } = safeParams;
  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanClassification = boundedText(offenseClassification, 'non_serious_summary', 50);
  const safeYears = Number.isFinite(Number(yearsSinceSentenceCompleted))
    ? Math.max(0, Math.min(100, Number(yearsSinceSentenceCompleted)))
    : 11;
  const safeConvictions = Number.isFinite(Number(numberOfConvictions))
    ? Math.max(0, Math.min(100, Math.floor(Number(numberOfConvictions))))
    : 1;

  const isSeriousCriminality = cleanClassification === 'serious_criminality';

  if (isSeriousCriminality) {
    return {
      applicantName: cleanApplicantName,
      statutoryBasis: 'Immigration and Refugee Protection Act (IRPA), s. 36(1)',
      inadmissibilityStatus: 'SERIOUS CRIMINALITY (INADMISSIBLE)',
      deemedRehabilitationEligible: false,
      individualRehabilitationEligible: safeYears >= 5,
      yearsSinceSentenceCompleted: safeYears,
      statutoryRule: 'Under IRPA s. 36(1), offenses punishable in Canada by a maximum term of imprisonment of at least 10 years (including post-Dec 2018 DUI / impaired driving under Bill C-46) constitute serious criminality. Deemed rehabilitation NEVER applies regardless of how much time has passed.',
      availableRemedies: safeYears >= 5
        ? ['Apply for Individual Rehabilitation with the Minister under IRPA s. 36(3)(c) ($1,000 CAD government fee).', 'Apply for a Temporary Resident Permit (TRP) under IRPA s. 24 if compelling reasons exist.']
        : ['Only remedy is a Temporary Resident Permit (TRP) under IRPA s. 24 ($200 CAD fee) based on compelling humanitarian or national interest reasons.']
    };
  }

  // Non-serious offense under IRPA s. 36(2)
  if (safeConvictions === 1 && safeYears >= ADMISSIBILITY_CONSTANTS.DEEMED_REHABILITATION_YEARS_NON_SERIOUS) {
    return {
      applicantName: cleanApplicantName,
      statutoryBasis: 'Immigration and Refugee Protection Act (IRPA), s. 36(2) & s. 36(3)(b)',
      inadmissibilityStatus: 'DEEMED REHABILITATED BY PASSAGE OF TIME',
      deemedRehabilitationEligible: true,
      yearsSinceSentenceCompleted: safeYears,
      statutoryRule: 'For a single non-serious conviction, deemed rehabilitation occurs automatically by passage of time once 10 years have elapsed since the completion of the sentence (including fines, probation, and license suspension).',
      actionRequired: 'No formal rehabilitation application or fee required. Bring certified court disposition and police clearance to the port of entry to prove the 10-year period has passed.'
    };
  }

  if (safeYears >= ADMISSIBILITY_CONSTANTS.INDIVIDUAL_REHABILITATION_MIN_YEARS) {
    return {
      applicantName: cleanApplicantName,
      statutoryBasis: 'Immigration and Refugee Protection Act (IRPA), s. 36(2) & s. 36(3)(c)',
      inadmissibilityStatus: 'ELIGIBLE FOR INDIVIDUAL REHABILITATION',
      deemedRehabilitationEligible: false,
      individualRehabilitationEligible: true,
      yearsSinceSentenceCompleted: safeYears,
      actionRequired: 'Between 5 and 10 years after sentence completion, applicant must submit a formal Application for Criminal Rehabilitation (Form IMM 1444) with a $200 CAD fee.'
    };
  }

  return {
    applicantName: cleanApplicantName,
    statutoryBasis: 'Immigration and Refugee Protection Act (IRPA), s. 36(2) & s. 24',
    inadmissibilityStatus: 'CRIMINALLY INADMISSIBLE (< 5 YEARS SINCE SENTENCE)',
    deemedRehabilitationEligible: false,
    individualRehabilitationEligible: false,
    yearsSinceSentenceCompleted: safeYears,
    actionRequired: 'Less than 5 years have elapsed since completion of sentence. Ineligible for both deemed and individual rehabilitation. Sole option to enter Canada is a Temporary Resident Permit (TRP) under IRPA s. 24 demonstrating exceptional compelling grounds.'
  };
}
