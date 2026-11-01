import { ValidationError } from './api-errors.js';
import { boundedText, safeIsoDate } from './text-input.js';

/**
 * Canadian Study Permit, Provincial Attestation Letter (PAL) & PGWP 2024/2025 Navigator
 * Statutory Grounding:
 * - Immigration and Refugee Protection Act (IRPA) s. 10.2 (National Cap on Study Permits)
 * - Immigration and Refugee Protection Regulations (IRPR) s. 186(v) (24-Hour Off-Campus Work Authorization)
 * - IRPR s. 211.1 (Mandatory Provincial Attestation Letter requirement & exemptions)
 * - IRPR s. 217 (In-Canada study permit extension exemptions)
 * - IRPR s. 220 (Financial sufficiency test: Tuition + 75% LICO indexed living expenses)
 * - IRCC Operational Instructions (Nov 1, 2024 Field of Study & CLB PGWP Eligibility Rules)
 */

export const PROGRAM_LEVELS = Object.freeze({
  K_12: 'k_12',
  UNDERGRADUATE_DEGREE: 'undergraduate_degree',
  COLLEGE_DIPLOMA: 'college_diploma',
  MASTERS_DEGREE: 'masters_degree',
  DOCTORAL_PHD: 'doctoral_phd',
  VISITING_EXCHANGE: 'visiting_exchange'
});

export const INSTITUTION_TYPES = Object.freeze({
  PUBLIC_UNIVERSITY: 'public_university',
  PUBLIC_COLLEGE: 'public_college',
  PRIVATE_CURRICULUM_LICENSING: 'private_curriculum_licensing',
  PRIVATE_CAREER_COLLEGE: 'private_career_college'
});

export const PRIORITY_FIELDS_OF_STUDY = Object.freeze([
  'healthcare',
  'stem',
  'trades',
  'transport',
  'agriculture'
]);

export const STATUTORY_CONSTANTS = Object.freeze({
  BASE_COST_OF_LIVING_SINGLE: 20635, // 75% of LICO single applicant standard
  COST_OF_LIVING_FIRST_DEPENDENT: 5055,
  COST_OF_LIVING_ADDITIONAL_DEPENDENT: 3821,
  ESTIMATED_TRAVEL_ALLOWANCE: 2000,
  OFF_CAMPUS_WEEKLY_HOURS_LIMIT: 24, // Permanent cap as of fall 2024 under IRPR s. 186(v)
  PGWP_CLB_UNIVERSITY_MINIMUM: 7,
  PGWP_CLB_COLLEGE_MINIMUM: 5
});

export function auditStudyPermitAndPal(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Input must be a valid object');
  }

  const {
    programLevel,
    institutionType = INSTITUTION_TYPES.PUBLIC_UNIVERSITY,
    fieldOfStudy = 'general',
    isExtensionWithinCanada = false,
    inStudySession = true,
    languageScoreClb = 7,
    firstYearTuition = 18000,
    accompanyingDependents = 0,
    targetProvince = 'ON',
    applicantName = 'Student Applicant',
    assessmentDate = '2026-10-31'
  } = input;

  if (!programLevel || !Object.values(PROGRAM_LEVELS).includes(programLevel)) {
    throw new ValidationError(`Invalid programLevel. Must be one of: ${Object.values(PROGRAM_LEVELS).join(', ')}`);
  }

  const safeApplicantName = boundedText(applicantName, 'Student Applicant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeProvince = boundedText(targetProvince, 'ON', 10).toUpperCase();
  const safeFieldOfStudy = boundedText(fieldOfStudy, 'general', 80);

  // 1. Provincial Attestation Letter (PAL) Assessment (IRPR s. 211.1)
  let isPalRequired = true;
  let palExemptionReason = null;

  if (isExtensionWithinCanada) {
    isPalRequired = false;
    palExemptionReason = 'Exempt from PAL under IRPR s. 217: Study permit extension applicants residing inside Canada.';
  } else if (programLevel === PROGRAM_LEVELS.K_12) {
    isPalRequired = false;
    palExemptionReason = 'Exempt from PAL under IRPR s. 211.1(2): Primary and secondary school students (Kindergarten to Grade 12).';
  } else if (programLevel === PROGRAM_LEVELS.VISITING_EXCHANGE) {
    isPalRequired = false;
    palExemptionReason = 'Exempt from PAL: Short-term visiting or exchange students studying at a DLI for 6 months or less.';
  } else if (programLevel === PROGRAM_LEVELS.MASTERS_DEGREE || programLevel === PROGRAM_LEVELS.DOCTORAL_PHD) {
    // Note: In 2024 Master/PhD were fully exempt; in 2025 they are integrated into federal caps with reserved allocations
    isPalRequired = true;
    palExemptionReason = 'Subject to graduate study allocation: Master and PhD applicants require provincial allocation/PAL pursuant to 2025 federal cap revisions.';
  } else {
    isPalRequired = true;
    palExemptionReason = 'Mandatory PAL required from provincial authority (e.g. Ontario PAL, BC PAL) prior to study permit submission.';
  }

  // 2. Post-Graduation Work Permit (PGWP) 2024/2025 Policy Audit
  let isPgwpEligible = true;
  const pgwpFlags = [];
  const requiredClb = [PROGRAM_LEVELS.UNDERGRADUATE_DEGREE, PROGRAM_LEVELS.MASTERS_DEGREE, PROGRAM_LEVELS.DOCTORAL_PHD].includes(programLevel)
    ? STATUTORY_CONSTANTS.PGWP_CLB_UNIVERSITY_MINIMUM
    : STATUTORY_CONSTANTS.PGWP_CLB_COLLEGE_MINIMUM;

  // Rule A: Public-Private Curriculum Licensing Partnerships strictly barred (May 15, 2024)
  if (institutionType === INSTITUTION_TYPES.PRIVATE_CURRICULUM_LICENSING) {
    isPgwpEligible = false;
    pgwpFlags.push('CRITICAL DISQUALIFICATION: International students graduating from private college programs licensed by a public college are strictly barred from receiving a PGWP (effective May 15, 2024).');
  }

  // Rule B: Private career colleges without designated degrees
  if (institutionType === INSTITUTION_TYPES.PRIVATE_CAREER_COLLEGE) {
    isPgwpEligible = false;
    pgwpFlags.push('DISQUALIFICATION: Private career colleges do not grant PGWP-eligible credentials unless offering a province-authorized bachelor degree.');
  }

  // Rule C: Field of Study requirement for College Diplomas (Effective Nov 1, 2024)
  const normalizedField = safeFieldOfStudy.toLowerCase().trim();
  const isPriorityField = PRIORITY_FIELDS_OF_STUDY.some(f => normalizedField.includes(f));

  if (programLevel === PROGRAM_LEVELS.COLLEGE_DIPLOMA) {
    if (!isPriorityField) {
      isPgwpEligible = false;
      pgwpFlags.push(`DISQUALIFICATION (Nov 1, 2024 Rule): College diploma graduates must complete programs linked to long-term labour shortages (Healthcare, STEM, Trades, Transport, Agriculture). The field '${safeFieldOfStudy}' is ineligible.`);
    }
  }

  // Rule D: Language proficiency requirement (CLB 7 for University, CLB 5 for College)
  const applicantClb = Math.max(0, Math.min(12, Number(languageScoreClb) || 0));
  if (applicantClb < requiredClb) {
    isPgwpEligible = false;
    pgwpFlags.push(`LANGUAGE DEFICIT: Program level requires minimum CLB ${requiredClb} (CELPIP / IELTS / PTE Core). Current score CLB ${applicantClb} is insufficient for PGWP issuance.`);
  }

  // 3. Off-Campus Work Hours Analysis (IRPR s. 186(v))
  const offCampusStandardHours = STATUTORY_CONSTANTS.OFF_CAMPUS_WEEKLY_HOURS_LIMIT; // 24 hrs
  const currentAllowedHours = inStudySession ? offCampusStandardHours : 'unlimited';
  const workHoursGuidance = inStudySession
    ? `During regular academic semesters, international students are legally limited to a maximum of ${offCampusStandardHours} hours per week off-campus work. Exceeding 24 hours constitutes unauthorized work under IRPA s. 30 and triggers inadmissibility under IRPA s. 41.`
    : `During scheduled academic breaks (e.g. summer break, winter holidays), students holding full-time enrollment before and after the break may work unlimited hours full-time.`;

  // 4. Financial Sufficiency Calculation (IRPR s. 220)
  const tuition = Math.max(0, Math.min(1000000, Number(firstYearTuition) || 0));
  const numDependents = Math.max(0, Math.min(20, Math.floor(Number(accompanyingDependents) || 0)));
  
  let livingExpenses = STATUTORY_CONSTANTS.BASE_COST_OF_LIVING_SINGLE;
  if (numDependents === 1) {
    livingExpenses += STATUTORY_CONSTANTS.COST_OF_LIVING_FIRST_DEPENDENT;
  } else if (numDependents > 1) {
    livingExpenses += STATUTORY_CONSTANTS.COST_OF_LIVING_FIRST_DEPENDENT + ((numDependents - 1) * STATUTORY_CONSTANTS.COST_OF_LIVING_ADDITIONAL_DEPENDENT);
  }

  const travelExpenses = STATUTORY_CONSTANTS.ESTIMATED_TRAVEL_ALLOWANCE * (1 + numDependents);
  const totalFinancialProofRequired = tuition + livingExpenses + travelExpenses;

  return {
    applicantName: safeApplicantName,
    assessmentDate: safeAssessmentDate,
    province: safeProvince,
    programLevel,
    institutionType,
    fieldOfStudy: safeFieldOfStudy,
    palAssessment: {
      isPalRequired,
      reason: palExemptionReason,
      governingSection: isExtensionWithinCanada ? 'IRPR s. 217' : 'IRPR s. 211.1'
    },
    pgwpEligibility: {
      isEligible: isPgwpEligible,
      requiredClb,
      applicantClb,
      priorityFieldMatch: isPriorityField,
      riskFlags: pgwpFlags
    },
    offCampusWork: {
      weeklyHoursLimit: offCampusStandardHours,
      currentAllowedHours,
      inStudySession,
      statutoryCitation: 'IRPR s. 186(v)',
      legalWarning: workHoursGuidance
    },
    financialProof: {
      firstYearTuition: tuition,
      costOfLivingRequired: livingExpenses,
      estimatedTravel: travelExpenses,
      totalProofRequiredCad: totalFinancialProofRequired,
      statutoryStandard: 'IRPR s. 220 (75% LICO Indexed Financial Threshold)'
    },
    statutoryCitations: [
      'Immigration and Refugee Protection Act (IRPA) s. 10.2 (National Study Permit Cap)',
      'Immigration and Refugee Protection Regulations (IRPR) s. 186(v) (24-Hour Work Limit)',
      'Immigration and Refugee Protection Regulations (IRPR) s. 211.1 (Provincial Attestation Letter)',
      'Immigration and Refugee Protection Regulations (IRPR) s. 217 (In-Canada Extensions)',
      'Immigration and Refugee Protection Regulations (IRPR) s. 220 (Financial Resource Sufficiency)'
    ]
  };
}
