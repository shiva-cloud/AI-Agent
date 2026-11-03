/**
 * International Student Post-Graduation Work Permit (PGWP) Field of Study & Language Compliance Engine
 * 
 * Statutory & Policy Authorities:
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227:
 *   - s. 205(c)(ii) (Public interest employment authorization - LMIA Exemption Code C43)
 *   - s. 186(w) (Interim full-time work authorization while PGWP application is pending)
 *   - s. 186(v) (Off-campus work authorization compliance during study program)
 *   - s. 222(1) (Study permit validity and expiration upon notification of completion)
 * - IRCC Program Delivery Instructions (Post-Graduation Work Permit Program):
 *   - Policy Overhaul (Effective for study permit applications submitted on/after Nov 1, 2024):
 *     1. Language Proficiency: CLB/NCLC 7 for university degree graduates; CLB/NCLC 5 for college diploma/certificate graduates.
 *     2. Field of Study Alignment: Mandatory for non-degree college diploma/certificate graduates (Healthcare, STEM, Trades, Transport, Agriculture).
 *     3. Degree Exemption: University Bachelor's, Master's, and Doctoral programs exempt from field-of-study restriction.
 *     4. Program Length: Minimum 8 months full-time; Master's degrees of 8+ months qualify for 3-year PGWP.
 *     5. 180-Day Deadline from official transcript or written completion letter.
 *     6. One-time-in-a-lifetime restriction.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const PGWP_CONSTANTS = Object.freeze({
  POLICY_OVERHAUL_DATE: '2024-11-01',
  MAX_DAYS_TO_APPLY: 180,
  URGENT_DEADLINE_DAYS: 30,
  MIN_PROGRAM_MONTHS: 8,
  FULL_PGWP_MONTHS: 36,
  LANGUAGE_TEST_VALIDITY_DAYS: 730, // 2 years
  UNIVERSITY_MIN_CLB: 7,
  COLLEGE_MIN_CLB: 5,
  MAX_DISTANCE_LEARNING_PERCENT: 50
});

export const ELIGIBLE_FIELD_CATEGORIES = Object.freeze({
  healthcare: {
    code: 'healthcare',
    label: 'Healthcare & Social Assistance',
    statutoryBasis: 'IRCC Priority Shortage Category (CIP Alignment)',
    description: 'Nursing, medicine, pharmacy, medical technology, allied health, patient care.'
  },
  stem: {
    code: 'stem',
    label: 'Science, Technology, Engineering & Mathematics (STEM)',
    statutoryBasis: 'IRCC Priority Shortage Category (CIP Alignment)',
    description: 'Software engineering, computer science, electrical/mechanical engineering, data analytics, biotechnology.'
  },
  trade: {
    code: 'trade',
    label: 'Trade Occupations & Skilled Crafts',
    statutoryBasis: 'IRCC Priority Shortage Category (CIP Alignment)',
    description: 'Carpentry, plumbing, electrical, welding, automotive repair, industrial construction.'
  },
  transport: {
    code: 'transport',
    label: 'Transport Occupations',
    statutoryBasis: 'IRCC Priority Shortage Category (CIP Alignment)',
    description: 'Commercial trucking, aviation maintenance, marine transport, railway operations.'
  },
  agriculture: {
    code: 'agriculture',
    label: 'Agriculture & Agri-Food',
    statutoryBasis: 'IRCC Priority Shortage Category (CIP Alignment)',
    description: 'Agronomy, horticulture, agricultural machinery, food processing technology.'
  }
});

export const CREDENTIAL_LEVELS = Object.freeze({
  doctoral_degree: {
    label: 'Doctoral Degree (Ph.D.)',
    isDegree: true,
    minClb: 7,
    exemptFromFieldRestriction: true
  },
  master_degree: {
    label: "Master's Degree",
    isDegree: true,
    minClb: 7,
    exemptFromFieldRestriction: true
  },
  bachelor_degree: {
    label: "Bachelor's Degree",
    isDegree: true,
    minClb: 7,
    exemptFromFieldRestriction: true
  },
  college_diploma: {
    label: 'College Diploma (2 or 3 years)',
    isDegree: false,
    minClb: 5,
    exemptFromFieldRestriction: false
  },
  college_certificate: {
    label: 'College Certificate (1 year / 8+ months)',
    isDegree: false,
    minClb: 5,
    exemptFromFieldRestriction: false
  },
  post_grad_certificate: {
    label: 'Post-Graduate / Ontario College Graduate Certificate (Non-Degree)',
    isDegree: false,
    minClb: 5,
    exemptFromFieldRestriction: false
  },
  ineligible_program: {
    label: 'ESL / General Interest / Flight Training / Private Non-Curriculum',
    isDegree: false,
    minClb: 5,
    exemptFromFieldRestriction: false
  }
});

/**
 * Diagnostic audit of Post-Graduation Work Permit (PGWP) eligibility under modernized IRCC regulations.
 */
export function evaluatePgwpEligibility({
  credentialLevel = 'college_diploma',
  programLengthMonths = 24,
  studyPermitApplicationDate = '2024-11-15',
  fieldOfStudyCategory = 'stem',
  languageTestType = 'celpip_general',
  clbLevel = 6,
  testDate = '2025-06-01',
  completionDate = '2026-08-01',
  assessmentDate = todayIso(),
  isDliEligible = true,
  isPublicOrLicensingCurriculum = true,
  heldPreviousPgwp = false,
  distanceLearningPercent = 10,
  hadValidStudyPermitAtCompletion = true,
  maintainedFullTimeStatus = true,
  applicantName = 'International Graduate',
  institutionName = 'Ontario Public College'
} = {}) {
  const credKey = boundedText(credentialLevel, 'college_diploma', 50).toLowerCase();
  const credConfig = CREDENTIAL_LEVELS[credKey] || CREDENTIAL_LEVELS.college_diploma;
  const programMonths = Math.max(0, Math.min(120, Number(programLengthMonths) || 0));
  const permitAppDate = safeIsoDate(studyPermitApplicationDate, '2024-11-15');
  const fieldKey = boundedText(fieldOfStudyCategory, '', 50).toLowerCase();
  const langTest = boundedText(languageTestType, 'celpip_general', 50).toLowerCase();
  const clb = Math.max(0, Math.min(12, Number(clbLevel) || 0));
  const tDate = safeIsoDate(testDate, '2025-06-01');
  const compDate = safeIsoDate(completionDate, '2026-08-01');
  const assessDate = safeIsoDate(assessmentDate, todayIso());
  const dliEligible = Boolean(isDliEligible);
  const publicOrLicensing = Boolean(isPublicOrLicensingCurriculum);
  const prevPgwp = Boolean(heldPreviousPgwp);
  const distPercent = Math.max(0, Math.min(100, Number(distanceLearningPercent) || 0));
  const validPermitAtComp = Boolean(hadValidStudyPermitAtCompletion);
  const fullTimeStatus = Boolean(maintainedFullTimeStatus);

  const safeApplicant = boundedText(applicantName, 'International Graduate', 120);
  const safeInstitution = boundedText(institutionName, 'Designated Learning Institution', 150);

  const rejectionRisks = [];
  const recommendations = [];
  const checklist = [];

  // 1. One-time-in-a-lifetime rule
  if (prevPgwp) {
    rejectionRisks.push('CRITICAL DISQUALIFIER: Applicant previously held a Post-Graduation Work Permit. Under IRPR s. 205(c)(ii), a person may receive only one PGWP in their lifetime.');
    checklist.push({ item: 'Lifetime PGWP Limit', status: 'fail', detail: 'Previously held PGWP (strictly one per lifetime)' });
  } else {
    checklist.push({ item: 'Lifetime PGWP Limit', status: 'pass', detail: 'First-time PGWP applicant' });
  }

  // 2. Institution & Curriculum Eligibility
  if (!dliEligible) {
    rejectionRisks.push('DISQUALIFIER: Educational institution is not an eligible Designated Learning Institution (DLI) offering PGWP-qualifying programs.');
    checklist.push({ item: 'DLI PGWP Eligibility', status: 'fail', detail: 'Institution does not hold PGWP-eligible DLI designation' });
  } else if (!publicOrLicensing) {
    rejectionRisks.push('DISQUALIFIER: Private career college programs are ineligible unless operating under an approved public curriculum licensing agreement (grandfathered restrictions apply).');
    checklist.push({ item: 'Curriculum & DLI Accreditation', status: 'fail', detail: 'Private institution lacking eligible public curriculum agreement' });
  } else {
    checklist.push({ item: 'Institution & Program Accreditation', status: 'pass', detail: 'Eligible DLI with qualifying educational authority' });
  }

  // 3. Program Duration Audit
  let estimatedDurationMonths = 0;
  if (programMonths < PGWP_CONSTANTS.MIN_PROGRAM_MONTHS) {
    rejectionRisks.push(`DISQUALIFIER: Program duration (${programMonths} months) is under statutory 8-month minimum (IRPR s. 205(c)(ii)). Programs under 8 months do not qualify for a PGWP.`);
    checklist.push({ item: 'Minimum Program Duration', status: 'fail', detail: `${programMonths} months (under 8-month threshold)` });
  } else if (credConfig.isDegree && credKey === 'master_degree') {
    // Under modernized rules, Master's degrees of 8+ months qualify for full 3-year PGWP
    estimatedDurationMonths = PGWP_CONSTANTS.FULL_PGWP_MONTHS;
    checklist.push({ item: 'Master’s Degree 3-Year Provision', status: 'pass', detail: 'Qualifies for 3-year PGWP under Master’s degree fast-track policy' });
  } else if (programMonths >= 24) {
    estimatedDurationMonths = PGWP_CONSTANTS.FULL_PGWP_MONTHS;
    checklist.push({ item: 'Program Length (2+ Years)', status: 'pass', detail: `Program length of ${programMonths} months qualifies for standard 3-year (36-month) PGWP` });
  } else {
    estimatedDurationMonths = programMonths;
    checklist.push({ item: 'Program Length (8–23 Months)', status: 'pass', detail: `Program length of ${programMonths} months qualifies for matching ${programMonths}-month PGWP` });
  }

  // 4. Study Permit Application Date & Field of Study Requirement
  const appliedPostNov2024 = permitAppDate >= PGWP_CONSTANTS.POLICY_OVERHAUL_DATE;
  let fieldRequirementApplies = false;
  let fieldOfStudyMet = true;
  let fieldExemptionReason = null;

  if (credConfig.exemptFromFieldRestriction) {
    fieldRequirementApplies = false;
    fieldOfStudyMet = true;
    fieldExemptionReason = `University degree graduates (${credConfig.label}) are statutorily exempt from field of study restrictions under IRCC policy.`;
    checklist.push({ item: 'Field of Study Requirement', status: 'pass', detail: fieldExemptionReason });
  } else if (!appliedPostNov2024) {
    fieldRequirementApplies = false;
    fieldOfStudyMet = true;
    fieldExemptionReason = `Study permit was applied for prior to November 1, 2024 (${permitAppDate}). Grandfathered from field of study restrictions.`;
    checklist.push({ item: 'Field of Study Grandfathering', status: 'pass', detail: fieldExemptionReason });
  } else {
    fieldRequirementApplies = true;
    const matchedCategory = ELIGIBLE_FIELD_CATEGORIES[fieldKey];
    if (matchedCategory) {
      fieldOfStudyMet = true;
      checklist.push({ item: 'Field of Study Shortage Match', status: 'pass', detail: `Eligible field: ${matchedCategory.label} (${matchedCategory.statutoryBasis})` });
    } else {
      fieldOfStudyMet = false;
      rejectionRisks.push(`DISQUALIFIER: For college diploma/certificate programs applied for on/after Nov 1, 2024, the field of study must be in a national shortage category (Healthcare, STEM, Trades, Transport, Agriculture). The selected field "${fieldKey || 'unspecified'}" does not qualify.`);
      checklist.push({ item: 'Field of Study Shortage Match', status: 'fail', detail: `Field "${fieldKey || 'unspecified'}" is not in an approved national shortage category for non-degree diplomas` });
    }
  }

  // 5. Language Proficiency Audit
  const requiredClb = credConfig.minClb;
  let languageTestExpired = false;
  let languageRequirementMet = false;

  const validTestTypes = ['celpip_general', 'ielts_general', 'pte_core', 'tef_canada', 'tcf_canada'];
  if (!validTestTypes.includes(langTest)) {
    rejectionRisks.push(`MANDATORY REQUIREMENT: An approved language test (CELPIP-G, IELTS General, PTE Core, TEF, or TCF) must be submitted with the application. Stated test type "${langTest}" is not recognized.`);
    checklist.push({ item: 'Approved Language Test', status: 'fail', detail: 'No approved test specified' });
  } else {
    checklist.push({ item: 'Approved Language Test', status: 'pass', detail: `Recognized test: ${langTest.toUpperCase()}` });
  }

  // Test age check (2 years = 730 days)
  let testAgeDays = 0;
  if (tDate && assessDate) {
    const tTime = new Date(tDate).getTime();
    const aTime = new Date(assessDate).getTime();
    if (!isNaN(tTime) && !isNaN(aTime)) {
      testAgeDays = Math.max(0, Math.floor((aTime - tTime) / (1000 * 60 * 60 * 24)));
      if (testAgeDays > PGWP_CONSTANTS.LANGUAGE_TEST_VALIDITY_DAYS) {
        languageTestExpired = true;
        rejectionRisks.push(`DISQUALIFIER: Language test taken on ${tDate} is expired (${testAgeDays} days old). IRCC strictly requires language test results to be less than 2 years old at time of application submission.`);
        checklist.push({ item: 'Language Test Validity Window', status: 'fail', detail: `Expired (${testAgeDays} days old > 730 days)` });
      } else {
        checklist.push({ item: 'Language Test Validity Window', status: 'pass', detail: `Valid (${testAgeDays} days old <= 730 days)` });
      }
    }
  }

  if (clb >= requiredClb && !languageTestExpired && validTestTypes.includes(langTest)) {
    languageRequirementMet = true;
    checklist.push({ item: 'Language Score Threshold', status: 'pass', detail: `Attained CLB ${clb} >= Required CLB ${requiredClb} for ${credConfig.label}` });
  } else if (clb < requiredClb) {
    rejectionRisks.push(`DISQUALIFIER: Attained CLB ${clb} is below mandatory threshold of CLB ${requiredClb} required for ${credConfig.label}. Must achieve minimum CLB ${requiredClb} in all four language bands.`);
    checklist.push({ item: 'Language Score Threshold', status: 'fail', detail: `CLB ${clb} is below mandatory CLB ${requiredClb}` });
  }

  // 6. 180-Day Deadline Audit
  let daysSinceCompletion = 0;
  let daysRemainingToApply = PGWP_CONSTANTS.MAX_DAYS_TO_APPLY;
  let deadlineStatus = 'within_window';

  if (compDate && assessDate) {
    const cTime = new Date(compDate).getTime();
    const aTime = new Date(assessDate).getTime();
    if (!isNaN(cTime) && !isNaN(aTime)) {
      daysSinceCompletion = Math.max(0, Math.floor((aTime - cTime) / (1000 * 60 * 60 * 24)));
      daysRemainingToApply = Math.max(0, PGWP_CONSTANTS.MAX_DAYS_TO_APPLY - daysSinceCompletion);

      if (daysSinceCompletion > PGWP_CONSTANTS.MAX_DAYS_TO_APPLY) {
        deadlineStatus = 'expired_180_days';
        rejectionRisks.push(`CRITICAL DISQUALIFIER: The 180-day statutory window to apply for a PGWP expired ${daysSinceCompletion - PGWP_CONSTANTS.MAX_DAYS_TO_APPLY} days ago. An application submitted after 180 days will be refused without merit.`);
        checklist.push({ item: '180-Day Application Window', status: 'fail', detail: `Expired (${daysSinceCompletion} days elapsed since completion)` });
      } else if (daysRemainingToApply <= PGWP_CONSTANTS.URGENT_DEADLINE_DAYS) {
        deadlineStatus = 'urgent_action_required';
        recommendations.push(`URGENT DEADLINE: Only ${daysRemainingToApply} days remain in the 180-day eligibility window. Submit the PGWP application immediately to preserve eligibility.`);
        checklist.push({ item: '180-Day Application Window', status: 'warning', detail: `Urgent: ${daysRemainingToApply} days remaining` });
      } else {
        checklist.push({ item: '180-Day Application Window', status: 'pass', detail: `${daysRemainingToApply} days remaining to apply` });
      }
    }
  }

  // 7. Distance Learning & Full-Time Status
  if (distPercent > PGWP_CONSTANTS.MAX_DISTANCE_LEARNING_PERCENT) {
    rejectionRisks.push(`DISQUALIFIER: Distance learning completed online from outside Canada or via remote study exceeds 50% (${distPercent}%). Under current post-pandemic guidelines, in-class physical attendance in Canada is mandatory for at least 50% of the program.`);
    checklist.push({ item: 'In-Person Attendance Threshold', status: 'fail', detail: `${distPercent}% online (maximum allowed is 50%)` });
  } else {
    checklist.push({ item: 'In-Person Attendance Threshold', status: 'pass', detail: `${100 - distPercent}% in-person attendance verified` });
  }

  if (!fullTimeStatus) {
    rejectionRisks.push('WARNING: Applicant was not enrolled full-time for every academic semester (excluding authorized leave or final part-time semester). IRCC routinely requests explanations and may refuse PGWP for unexplained part-time semesters.');
    checklist.push({ item: 'Continuous Full-Time Enrollment', status: 'warning', detail: 'Part-time semester detected; requires formal institutional letter confirming authorized leave or final semester status' });
  } else {
    checklist.push({ item: 'Continuous Full-Time Enrollment', status: 'pass', detail: 'Continuous full-time academic progression confirmed' });
  }

  // 8. Interim Full-Time Work Authorization (IRPR s. 186(w))
  let interimWorkAuthorized = false;
  let interimWorkBasis = '';
  const interimWorkConditions = [];

  if (validPermitAtComp && deadlineStatus !== 'expired_180_days') {
    interimWorkAuthorized = true;
    interimWorkBasis = 'Authorized under IRPR s. 186(w) to begin full-time employment immediately upon lodging the online PGWP application, pending decision.';
    interimWorkConditions.push('Held a valid study permit at the time the PGWP application was submitted.');
    interimWorkConditions.push('Completed an eligible post-secondary study program.');
    interimWorkConditions.push('Met off-campus work conditions under IRPR s. 186(v) during studies (did not exceed authorized weekly hour limits).');
    interimWorkConditions.push('Maintain proof of application submission (IRCC WP-EXT acknowledgement letter) on file with Canadian employer.');
  } else {
    interimWorkAuthorized = false;
    interimWorkBasis = 'Not authorized to work full-time under IRPR s. 186(w). Valid study permit held at the time of application submission is a mandatory prerequisite.';
    interimWorkConditions.push('Must cease working in Canada immediately upon study permit expiration or receipt of completion confirmation until a work permit is issued.');
  }

  // Final Overall Eligibility Determination
  const eligibleForPgwp = (
    !prevPgwp &&
    dliEligible &&
    publicOrLicensing &&
    programMonths >= PGWP_CONSTANTS.MIN_PROGRAM_MONTHS &&
    fieldOfStudyMet &&
    languageRequirementMet &&
    deadlineStatus !== 'expired_180_days' &&
    distPercent <= PGWP_CONSTANTS.MAX_DISTANCE_LEARNING_PERCENT
  );

  if (eligibleForPgwp) {
    recommendations.push(`Eligible for an estimated ${estimatedDurationMonths}-month Post-Graduation Work Permit under IRPR s. 205(c)(ii) (LMIA Exemption C43).`);
    if (interimWorkAuthorized) {
      recommendations.push('Submit the application before current study permit expires to maintain full-time work authorization under IRPR s. 186(w).');
    }
  } else {
    recommendations.push('Review the identified disqualifiers. If ineligible for PGWP, evaluate alternative work authorization pathways (e.g. LMIA-based closed work permit, Francophone Mobility under IRPR s. 205(a), or provincial nominee streams).');
  }

  return {
    applicantName: safeApplicant,
    institutionName: safeInstitution,
    assessmentDate: assessDate,
    eligibleForPgwp,
    estimatedPgwpDurationMonths: eligibleForPgwp ? estimatedDurationMonths : 0,
    fieldOfStudyAudit: {
      fieldRequirementApplies,
      fieldOfStudyCategory: fieldKey,
      fieldOfStudyMet,
      exemptionReason: fieldExemptionReason
    },
    languageAudit: {
      testType: langTest,
      attainedClb: clb,
      requiredClb,
      languageTestExpired,
      testAgeDays,
      languageRequirementMet
    },
    timingAudit: {
      completionDate: compDate,
      daysSinceCompletion,
      daysRemainingToApply,
      deadlineStatus,
      maxDaysAllowed: PGWP_CONSTANTS.MAX_DAYS_TO_APPLY
    },
    interimWorkRights: {
      authorizedToWorkFullTimeImmediately: interimWorkAuthorized,
      regulatoryBasis: interimWorkBasis,
      mandatoryConditions: interimWorkConditions
    },
    checklist,
    rejectionRisks,
    recommendations
  };
}

/**
 * Generates an executive document checklist and procedural compliance roadmap for PGWP submission.
 */
export function generatePgwpDocumentRoadmap({
  applicantName = 'International Graduate',
  credentialLevel = 'college_diploma',
  estimatedMonths = 36,
  interimWorkAuthorized = true
} = {}) {
  const name = boundedText(applicantName, 'International Graduate', 120);
  const cred = boundedText(credentialLevel, 'college_diploma', 50);
  const months = Math.max(0, Math.min(60, Number(estimatedMonths) || 0));

  return [
    '================================================================================',
    'POST-GRADUATION WORK PERMIT (PGWP) SUBMISSION & COMPLIANCE ROADMAP',
    `Applicant: ${name} | Target Validity: ${months} Months | Credential: ${cred}`,
    '================================================================================',
    '',
    '1. MANDATORY SUPPORTING DOCUMENTATION (IRCC CHECKLIST IMM 5556):',
    '   [ ] Official Final Transcript confirming completion of academic program.',
    '   [ ] Official Written Letter of Completion from the Registrar of the DLI.',
    '   [ ] Approved Language Test Results (< 2 years old): Minimum CLB 7 (Degree) or CLB 5 (Diploma).',
    '   [ ] Valid Passport bio-data pages (ensure validity covers full expected permit duration).',
    '   [ ] Current Study Permit copy (showing status at time of application).',
    '   [ ] Digital photo meeting IRCC specifications.',
    '',
    '2. EMPLOYMENT PRESERVATION & INTERIM WORK RIGHTS (IRPR s. 186(w)):',
    interimWorkAuthorized
      ? '   [CONFIRMED] Full-time interim work authorization active immediately upon application lodging.'
      : '   [UNAVAILABLE] No interim work authorization. Do not work until formal permit is granted.',
    '   - Retain IMM 5739 Acknowledgement of Submission and WP-EXT authorization letter.',
    '   - Provide WP-EXT letter and study permit copy to Canadian employer payroll/HR.',
    '',
    '3. TIMELINE & CRITICAL PRECAUTIONS:',
    '   - Do NOT travel outside Canada while on maintained status if you do not have a valid TRV.',
    '   - If your passport expires before the full 36 months, IRCC will only issue up to passport validity.',
    '   - PGWP is strictly one-time in a lifetime; cannot be renewed or extended once fully issued.',
    '================================================================================'
  ].join('\n');
}
