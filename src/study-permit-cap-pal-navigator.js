import { studyFinancialPolicy } from './study-financial-policy.js';
import { graduatePalRequirement, GRADUATE_PAL_SOURCE } from './study-graduate-pal-policy.js';
// src/study-permit-cap-pal-navigator.js
// Statutory Study Permit Cap, Provincial Attestation Letter (PAL), and Financial Adequacy Engine
// Based on IRCC Ministerial Instructions, IRPR s. 219/220, and 2024-2026 Cap Directives.
import { boundedText, safeIsoDate, todayIso, isIsoCalendarDate } from './text-input.js';
import { ToolInputError } from './api-errors.js';

export const STATUTORY_LIVING_COST_BASE_CAD = 23448; // 75% of LICO benchmark (updated from legacy $10k)
export const STATUTORY_FIRST_DEPENDENT_CAD = 5744;
export const STATUTORY_ADDITIONAL_DEPENDENT_CAD = 6696;
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
  tuitionFeeFirstYearCad,
  liquidFundsAvailableCad,
  familyMembersAccompanying = 0,
  isInCanadaApplication = false,
  isExtensionOfStudyPermit = false,
  isFamilyOfWorkOrStudyHolder = false,
  isPublicDli,
  fieldOfStudyCategory = 'stem_science_tech_eng_math',
  cipCode = '11.0701', // Computer Science
  applicantName = 'Student Applicant',
  assessmentDate = todayIso(),
  applicationDate = assessmentDate
} = {}) {
  const boolean = (value, field) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    throw new ToolInputError(`${field} must be true or false.`);
  };
  isInCanadaApplication = boolean(isInCanadaApplication, 'In-Canada application');
  isExtensionOfStudyPermit = boolean(isExtensionOfStudyPermit, 'Study permit extension');
  isFamilyOfWorkOrStudyHolder = boolean(isFamilyOfWorkOrStudyHolder, 'Family exemption');
  if (!isIsoCalendarDate(assessmentDate)) throw new ToolInputError('Assessment date must be a valid YYYY-MM-DD calendar date.');
  if (typeof fieldOfStudyCategory !== 'string' || ![...CIP_PRIORITY_FIELDS, 'business_general'].includes(fieldOfStudyCategory.trim().toLowerCase())) {
    throw new ToolInputError('Choose a supported field of study category.');
  }
  if (typeof cipCode !== 'string' || !/^\d{2}\.\d{4}$/.test(cipCode)) throw new ToolInputError('CIP code must use the format NN.NNNN.');
  if (typeof studyLevel !== 'string' || !['masters', 'doctoral', 'undergraduate_degree', 'college_diploma', 'k12_primary_secondary', 'exchange_visiting'].includes(studyLevel.trim().toLowerCase())) {
    throw new ToolInputError('Choose a supported study level.');
  }
  if (typeof province !== 'string' || !['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].includes(province.trim().toUpperCase())) {
    throw new ToolInputError('Choose a Canadian province or territory.');
  }
  const safeStudyLevel = boundedText(studyLevel, 'undergraduate_degree', 50).toLowerCase();
  const safeProvince = boundedText(province, 'ON', 10).toUpperCase();
  const safeApplicantName = boundedText(applicantName, 'Student Applicant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeFieldOfStudy = boundedText(fieldOfStudyCategory, 'stem_science_tech_eng_math', 50).toLowerCase();
  const safeCipCode = boundedText(cipCode, '11.0701', 20);

  // 1. PAL Exemption Evaluation
  const palExemptReasons = [];
  let isPalRequired = true;

  if (safeStudyLevel === 'k12_primary_secondary') {
    isPalRequired = false;
    palExemptReasons.push('K-12 Minor Children: Primary and secondary school students are statutorily exempt from the PAL requirement under Ministerial Instructions.');
  } else if (safeStudyLevel === 'masters' || safeStudyLevel === 'doctoral') {
    isPalRequired = graduatePalRequirement(applicationDate, isPublicDli);
    palExemptReasons.push(isPalRequired === null ? 'Confirm public DLI status and a reviewed application date to assess the graduate PAL exception.' : isPalRequired ? 'The public-DLI graduate exception does not apply; other exemptions require separate review.' : 'Degree-granting master’s and doctoral programs at public DLIs are exempt from PAL/TAL from January 1, 2026.');
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
  function amount(value, field, max, optional = false) {
    if (optional && (value === undefined || value === null || value === '')) return null;
    if (!['number', 'string'].includes(typeof value) || String(value).trim() === '' ||
        !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > max) {
      throw new ToolInputError(`${field} must be a number between 0 and ${max}.`);
    }
    return Number(value);
  }
  const tuition = amount(tuitionFeeFirstYearCad, 'Tuition', 1000000, true);
  const funds = amount(liquidFundsAvailableCad, 'Available funds', 100000000, true);
  const familyCount = amount(familyMembersAccompanying, 'Accompanying family members', 20);
  if (!Number.isInteger(familyCount)) throw new ToolInputError('Accompanying family members must be a whole number.');
  const financialPolicy = studyFinancialPolicy({ applicationDate, province: safeProvince, dependents: familyCount });
  const financialInputsComplete = tuition !== null && funds !== null && financialPolicy.status === 'AVAILABLE';
  const requiredLivingFundsCad = financialPolicy.livingCostsCad;
  const totalStatutoryProofRequiredCad = tuition === null || financialPolicy.status !== 'AVAILABLE' ? null : tuition + requiredLivingFundsCad + financialPolicy.travelEstimateCad;
  const financialBufferCad = financialInputsComplete ? funds - totalStatutoryProofRequiredCad : null;
  const isFinanciallySufficient = financialInputsComplete ? financialBufferCad >= 0 : null;

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
  if (isPalRequired === null) {
    checklist.push('PAL requirement is not determined. Confirm institution type and application date.');
  } else if (isPalRequired) {
    checklist.push(`Obtain Provincial Attestation Letter (PAL) from ${safeProvince} Designated Learning Institution (DLI) Registrar.`);
  } else {
    checklist.push(`Include formal letter of explanation quoting PAL exemption statutory clause (${palExemptReasons[0] || 'Exempt category'}).`);
  }
  if (financialInputsComplete) checklist.push(`Provide proof of liquid funds: Planning total ${totalStatutoryProofRequiredCad.toLocaleString('en-CA')} CAD (tuition $${tuition.toLocaleString('en-CA')} + living $${requiredLivingFundsCad.toLocaleString('en-CA')} + travel).`);
  else checklist.push('Enter your first-year tuition and available liquid funds to calculate financial sufficiency.');
  checklist.push('Secure official DLI Letter of Acceptance (LOA) with verified DLI number and designated enrollment dates.');
  checklist.push('Submit upfront Immigration Medical Exam (IME) if residing in designated medical country for >6 months.');

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicantName,
    studyLevel: safeStudyLevel,
    province: safeProvince,
    isPalRequired,
    palStatus: isPalRequired === null ? 'NOT_DETERMINED' : isPalRequired ? 'PAL_MANDATORY' : 'PAL_EXEMPT',
    graduatePalSource: GRADUATE_PAL_SOURCE,
    palExemptReasons,
    financialAudit: {
      tuitionFeeFirstYearCad: tuition,
      requiredLivingFundsCad,
      travelAllowanceCad: financialPolicy.travelEstimateCad,
      policy: financialPolicy,
      totalStatutoryProofRequiredCad,
      liquidFundsAvailableCad: funds,
      financialBufferCad,
      isFinanciallySufficient,
      status: !financialInputsComplete ? 'NOT_DETERMINED' : isFinanciallySufficient ? 'COMPLIANT' : 'DEFICIT_RISK'
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
