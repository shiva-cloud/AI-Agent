// src/study-permit-cap-pal-navigator.js
// Statutory Study Permit Cap, Provincial Attestation Letter (PAL), and Financial Adequacy Engine
// Based on IRCC Ministerial Instructions, IRPR s. 219/220, and 2024-2026 Cap Directives.
import { boundedText, safeIsoDate } from './text-input.js';

export const STATUTORY_LIVING_COST_BASE_CAD = 20635; // 75% of LICO benchmark (updated from legacy $10k)
export const STATUTORY_FIRST_DEPENDENT_CAD = 5055;
export const STATUTORY_ADDITIONAL_DEPENDENT_CAD = 4155;
export const STATUTORY_TRAVEL_ESTIMATE_CAD = 1500;

export const CIP_PRIORITY_FIELDS = [
  'agriculture_agrifood',
  'healthcare',
  'stem_science_tech_eng_math',
  'trades_construction',
  'transport'
];

export function evaluateStudyPermitCapAndPal({
  studyLevel = 'undergraduate_degree', // 'masters', 'doctoral', 'undergraduate_degree', 'college_diploma', 'k12_primary_secondary', 'exchange_visiting'
  province = 'ON',
  tuitionFeeFirstYearCad = 22000,
  liquidFundsAvailableCad = 45000,
  familyMembersAccompanying = 0,
  isInCanadaApplication = false,
  isExtensionOfStudyPermit = false,
  isFamilyOfWorkOrStudyHolder = false,
  fieldOfStudyCategory = 'stem_science_tech_eng_math',
  cipCode = '11.0701', // Computer Science
  applicantName = 'Student Applicant',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeStudyLevel = boundedText(studyLevel, 'undergraduate_degree', 50).toLowerCase();
  const safeProvince = boundedText(province, 'ON', 10).toUpperCase();
  const safeApplicantName = boundedText(applicantName, 'Student Applicant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeFieldOfStudy = boundedText(fieldOfStudyCategory, 'stem_science_tech_eng_math', 50).toLowerCase();
  const safeCipCode = boundedText(cipCode, '11.0701', 20);

  // 1. PAL Exemption Evaluation
  const palExemptReasons = [];
  let isPalRequired = true;

  if (safeStudyLevel === 'k12_primary_secondary') {
    isPalRequired = false;
    palExemptReasons.push('K-12 Minor Children: Primary and secondary school students are statutorily exempt from the PAL requirement under Ministerial Instructions.');
  } else if (safeStudyLevel === 'masters' || safeStudyLevel === 'doctoral') {
    isPalRequired = false;
    palExemptReasons.push('Post-Graduate Degree Exception: Master’s and Doctoral (PhD) degree candidates are exempt from provincial cap attestation letters under 2024 IRCC allocations.');
  } else if (isExtensionOfStudyPermit) {
    isPalRequired = false;
    palExemptReasons.push('In-Canada Study Permit Extension: Existing study permit holders extending their stay do not require a new PAL.');
  } else if (isFamilyOfWorkOrStudyHolder) {
    isPalRequired = false;
    palExemptReasons.push('Family Member Exemption: Dependents of temporary foreign workers or study permit holders in Canada are exempt from PAL.');
  } else if (safeStudyLevel === 'exchange_visiting') {
    isPalRequired = false;
    palExemptReasons.push('Visiting / Exchange Student Exemption: Students attending under reciprocal exchange agreements do not require a PAL.');
  } else if (isInCanadaApplication) {
    palExemptReasons.push('Note: In-Canada applicants must hold an authorized qualifying status to apply inland without a PAL.');
  }

  // 2. Financial Sufficiency Calculation (IRPR s. 220)
  const tuition = Number.isFinite(Number(tuitionFeeFirstYearCad)) ? Math.max(0, Math.min(1000000, Number(tuitionFeeFirstYearCad))) : 22000;
  const funds = Number.isFinite(Number(liquidFundsAvailableCad)) ? Math.max(0, Math.min(100000000, Number(liquidFundsAvailableCad))) : 45000;
  const familyCount = Number.isFinite(Number(familyMembersAccompanying)) ? Math.min(20, Math.max(0, Math.floor(Number(familyMembersAccompanying)))) : 0;

  let requiredLivingFundsCad = STATUTORY_LIVING_COST_BASE_CAD;
  if (familyCount > 0) {
    requiredLivingFundsCad += STATUTORY_FIRST_DEPENDENT_CAD;
    if (familyCount > 1) {
      requiredLivingFundsCad += (familyCount - 1) * STATUTORY_ADDITIONAL_DEPENDENT_CAD;
    }
  }

  const totalStatutoryProofRequiredCad = tuition + requiredLivingFundsCad + STATUTORY_TRAVEL_ESTIMATE_CAD;
  const financialBufferCad = funds - totalStatutoryProofRequiredCad;
  const isFinanciallySufficient = financialBufferCad >= 0;

  // 3. Post-Graduation Work Permit (PGWP) Pathway Compliance
  let pgwpEligibilityStatus = 'eligible';
  let pgwpLanguageReqClb = 7;
  let pgwpNotes = '';

  if (safeStudyLevel === 'masters' || safeStudyLevel === 'doctoral') {
    pgwpEligibilityStatus = 'eligible';
    pgwpLanguageReqClb = 7;
    pgwpNotes = 'Graduates of Master’s programs (even under 2 years) qualify for a full 3-year PGWP without field-of-study restrictions, subject to CLB 7 official language proof.';
  } else if (safeStudyLevel === 'undergraduate_degree') {
    pgwpEligibilityStatus = 'eligible';
    pgwpLanguageReqClb = 7;
    pgwpNotes = 'Graduates of university bachelor’s degrees remain eligible for PGWP across all fields of study, provided they achieve CLB 7 in English or French.';
  } else if (safeStudyLevel === 'college_diploma') {
    const isPriorityField = CIP_PRIORITY_FIELDS.includes(safeFieldOfStudy);
    pgwpLanguageReqClb = 5;
    if (isPriorityField) {
      pgwpEligibilityStatus = 'eligible_field_aligned';
      pgwpNotes = `College program aligns with designated national shortage categories (${safeFieldOfStudy.replace(/_/g, ' ')}). Eligible for PGWP with CLB 5 minimum.`;
    } else {
      pgwpEligibilityStatus = 'restricted_non_priority';
      pgwpNotes = 'WARNING: Under IRCC rules effective November 1, 2024, college diploma graduates in non-priority fields are ineligible for PGWP post-graduation.';
    }
  } else {
    pgwpEligibilityStatus = 'not_applicable';
    pgwpNotes = 'K-12 schooling and short-term exchange programs do not lead to post-graduation work permit rights.';
  }

  // 4. Recommendation & Checklist
  const checklist = [];
  if (isPalRequired) {
    checklist.push(`Obtain Provincial Attestation Letter (PAL) from ${safeProvince} Designated Learning Institution (DLI) Registrar.`);
  } else {
    checklist.push(`Include formal letter of explanation quoting PAL exemption statutory clause (${palExemptReasons[0] || 'Exempt category'}).`);
  }
  checklist.push(`Provide proof of liquid funds: Minimum $${totalStatutoryProofRequiredCad.toLocaleString('en-CA')} CAD (tuition $${tuition.toLocaleString('en-CA')} + living $${requiredLivingFundsCad.toLocaleString('en-CA')} + travel).`);
  checklist.push('Secure official DLI Letter of Acceptance (LOA) with verified DLI number and designated enrollment dates.');
  checklist.push('Submit upfront Immigration Medical Exam (IME) if residing in designated medical country for >6 months.');

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicantName,
    studyLevel: safeStudyLevel,
    province: safeProvince,
    isPalRequired,
    palStatus: isPalRequired ? 'PAL_MANDATORY' : 'PAL_EXEMPT',
    palExemptReasons,
    financialAudit: {
      tuitionFeeFirstYearCad: tuition,
      requiredLivingFundsCad,
      travelAllowanceCad: STATUTORY_TRAVEL_ESTIMATE_CAD,
      totalStatutoryProofRequiredCad,
      liquidFundsAvailableCad: funds,
      financialBufferCad,
      isFinanciallySufficient,
      status: isFinanciallySufficient ? 'COMPLIANT' : 'DEFICIT_RISK'
    },
    pgwpPathway: {
      status: pgwpEligibilityStatus,
      requiredLanguageClb: pgwpLanguageReqClb,
      notes: pgwpNotes,
      fieldOfStudyCategory: safeFieldOfStudy,
      cipCode: safeCipCode
    },
    checklist,
    statuteBasis: 'Immigration and Refugee Protection Regulations (IRPR) s. 219, 220; Ministerial Instructions on Study Caps 2024-2026.'
  };
}
