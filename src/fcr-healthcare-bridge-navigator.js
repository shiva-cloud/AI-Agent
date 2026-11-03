/**
 * Northstar Foreign Credential Recognition (FCR) & Healthcare Bridging Directory (Recs 97, 98, 99)
 * Implements statutory standards for:
 * 1. FCR Micro-Loan Programs ($15k-$30k low-interest licensing loans)
 * 2. Internationally Educated Nurses (IEN) Supervised Practice Experience Partnership (SPEP - CNO)
 * 3. International Medical Graduate (IMG) Practice Ready Assessment (PRA-BC, CEPD, AIMG)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FCR_BRIDGING_CONSTANTS = {
  WINDMILL_MICROLENDING_MAX_LOAN_CAD: 15000,
  ACHEV_FCR_MAX_LOAN_CAD: 15000,
  SEED_WINNIPEG_MAX_LOAN_CAD: 15000,
  SPEP_MIN_SUPERVISED_PRACTICE_HOURS: 140, // CNO minimum clinical placement hours
  PRA_CLINICAL_FIELD_ASSESSMENT_WEEKS: 12,
  PRA_RETURN_OF_SERVICE_YEARS: 3
};

/**
 * Evaluates FCR Micro-Loan Eligibility & Options
 */
export function evaluateFcrMicroLoans(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    candidateName = 'Candidate',
    assessmentDate = todayIso(),
    immigrationStatus = 'permanent_resident', // 'permanent_resident', 'protected_person', 'provincial_nominee', 'work_permit', 'visitor'
    targetProfession = 'nurse',
    currentCreditScore = 640,
    fundingRequiredCad = 12000
  } = safeParams;

  const cleanCandidateName = boundedText(candidateName, 'Candidate', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanScore = Number.isFinite(Number(currentCreditScore)) ? Math.min(900, Math.max(300, Math.floor(Number(currentCreditScore)))) : 640;
  const cleanFunding = Number.isFinite(Number(fundingRequiredCad)) ? Math.max(0, Math.min(1000000, Number(fundingRequiredCad))) : 12000;
  const cleanStatus = boundedText(immigrationStatus, 'permanent_resident', 50).toLowerCase();
  const cleanProfession = boundedText(targetProfession, 'nurse', 60);
  const eligibleStatuses = ['permanent_resident', 'canadian_citizen', 'protected_person', 'convention_refugee', 'open_work_permit'];
  const isStatusEligible = eligibleStatuses.includes(cleanStatus);

  const availablePrograms = [
    {
      provider: 'Windmill Microlending',
      maxLoanCad: FCR_BRIDGING_CONSTANTS.WINDMILL_MICROLENDING_MAX_LOAN_CAD,
      interestRate: 'Fixed low interest (Prime rate)',
      eligibleExpenses: ['Licensing exams (NCLEX, MCCQE, PEBC)', 'Credential evaluations (WES, ICAS, NNAS)', 'Bridging program tuition', 'Living allowance during study'],
      minCreditHistoryRequired: false,
      isEligible: isStatusEligible && cleanFunding <= FCR_BRIDGING_CONSTANTS.WINDMILL_MICROLENDING_MAX_LOAN_CAD
    },
    {
      provider: 'Achēv Career Paths for Skilled Immigrants (Ontario)',
      maxLoanCad: FCR_BRIDGING_CONSTANTS.ACHEV_FCR_MAX_LOAN_CAD,
      interestRate: 'Low interest micro-loan',
      eligibleExpenses: ['Exam fees', 'Professional association registration', 'Course materials'],
      minCreditHistoryRequired: false,
      isEligible: isStatusEligible
    }
  ];

  return {
    candidateName: cleanCandidateName,
    assessmentDate: cleanAssessmentDate,
    statutoryBasis: 'Employment and Social Development Canada (ESDC) Foreign Credential Recognition Program',
    immigrationStatus: cleanStatus,
    targetProfession: cleanProfession,
    currentCreditScore: cleanScore,
    fundingRequestedCad: cleanFunding,
    isEligibleForFcrLoans: isStatusEligible,
    availableLoanPrograms: availablePrograms,
    guidance: isStatusEligible
      ? 'Applicant is eligible to apply for government-supported FCR micro-loans without a Canadian credit history or co-signer.'
      : 'Ineligible: FCR micro-loans require PR, Citizen, Protected Person, or Open Work Permit status.'
  };
}

/**
 * Evaluates IEN Supervised Practice Experience Partnership (SPEP - CNO)
 */
export function evaluateIenSpepEligibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    candidateName = 'Candidate',
    assessmentDate = todayIso(),
    hasNnasAdvisoryReport = true,
    cnoRegistrationNumber = 'valid',
    outstandingRequirements = ['evidence_of_practice', 'language_proficiency']
  } = safeParams;

  const cleanCandidateName = boundedText(candidateName, 'Candidate', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const isNnasComplete = Boolean(hasNnasAdvisoryReport);
  const cleanCnoReg = boundedText(cnoRegistrationNumber, 'valid', 50);
  const reqList = Array.isArray(outstandingRequirements)
    ? outstandingRequirements.slice(0, 10).map(r => boundedText(r, '', 50))
    : ['evidence_of_practice', 'language_proficiency'];
  const hasOnlyPermittedGaps = reqList.every(req =>
    ['evidence_of_practice', 'language_proficiency'].includes(req)
  );

  const isEligibleForSpep = isNnasComplete && hasOnlyPermittedGaps;

  return {
    candidateName: cleanCandidateName,
    assessmentDate: cleanAssessmentDate,
    statutoryBasis: 'College of Nurses of Ontario (CNO) Registration Regulations; Supervised Practice Experience Partnership (SPEP)',
    cnoRegistrationNumber: cleanCnoReg,
    isEligibleForSpep,
    programDetails: {
      minPracticeHoursRequired: FCR_BRIDGING_CONSTANTS.SPEP_MIN_SUPERVISED_PRACTICE_HOURS,
      partnerOrganizations: ['Ontario Health', 'College of Nurses of Ontario (CNO)', 'Participating Hospitals / LTCs'],
      compensation: 'Paid placement at prevailing collective agreement wage rates (e.g. ONA/SEIU).',
      satisfiesRequirements: ['Evidence of Practice', 'Language Proficiency (demonstrated through clinical immersion)']
    },
    nextSteps: isEligibleForSpep
      ? 'CNO will issue an official SPEP eligibility letter. Match with an approved employer on the Ontario Health SPEP matching portal to complete the 140-hour supervised placement.'
      : 'Ineligible: SPEP requires completed NNAS and can only satisfy Evidence of Practice and/or Language requirements. Educational deficits (competencies) require bridging coursework.'
  };
}

/**
 * Evaluates IMG Practice Ready Assessment (PRA) Clinical Pathway
 */
export function evaluateImgPracticeReadyAssessment(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    candidateName = 'Candidate',
    assessmentDate = todayIso(),
    medicalDegreeOrigin = 'international',
    completedResidencyOutsideCanada = true,
    residencyDurationYears = 3,
    clinicalPracticeYearsWithinLast5Years = 2,
    passedMccqe1 = true,
    passedNacOsce = true,
    targetProvince = 'BC'
  } = safeParams;

  const cleanCandidateName = boundedText(candidateName, 'Candidate', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanProvince = boundedText(targetProvince, 'BC', 10).toUpperCase();
  const cleanOrigin = boundedText(medicalDegreeOrigin, 'international', 50);
  const resYears = Math.max(0, Math.min(50, Number.isFinite(Number(residencyDurationYears)) ? Number(residencyDurationYears) : 3));
  const clinYears = Math.max(0, Math.min(5, Number.isFinite(Number(clinicalPracticeYearsWithinLast5Years)) ? Number(clinicalPracticeYearsWithinLast5Years) : 2));

  const meetsExperience = Boolean(completedResidencyOutsideCanada) && resYears >= 2 && clinYears >= 2;
  const meetsExams = Boolean(passedMccqe1) && Boolean(passedNacOsce);
  const isEligibleForPra = meetsExperience && meetsExams;

  const provincialPraPrograms = {
    BC: 'PRA-BC (Practice Ready Assessment British Columbia)',
    AB: 'AIMG / PRA-AB (Alberta Practice Ready Assessment)',
    SK: 'SIPPA (Saskatchewan International Physician Practice Assessment)',
    MB: 'MLPIMG (Manitoba Practice Assessment)',
    ON: 'PRA-ON (Practice Ready Assessment Ontario - Touchstone Institute)'
  };

  const programName = provincialPraPrograms[cleanProvince] || 'National PRA Program';

  return {
    candidateName: cleanCandidateName,
    assessmentDate: cleanAssessmentDate,
    statutoryBasis: 'Federation of Medical Regulatory Authorities of Canada (FMRAC) National PRA Standards',
    province: cleanProvince,
    medicalDegreeOrigin: cleanOrigin,
    programName,
    isEligibleForPra,
    criteriaCheck: {
      postGraduateResidencyCompleted: Boolean(completedResidencyOutsideCanada) && resYears >= 2,
      recentActiveClinicalPractice: clinYears >= 2,
      passedMccqe1: Boolean(passedMccqe1),
      passedNacOsce: Boolean(passedNacOsce)
    },
    assessmentStructure: {
      clinicalFieldAssessmentDurationWeeks: FCR_BRIDGING_CONSTANTS.PRA_CLINICAL_FIELD_ASSESSMENT_WEEKS,
      supervisionType: 'One-on-one direct assessment with Canadian certified family physician clinical preceptor.',
      returnOfServiceRequirementYears: FCR_BRIDGING_CONSTANTS.PRA_RETURN_OF_SERVICE_YEARS
    },
    majorAdvantage: 'Bypasses the CaRMS residency match entirely: Successful candidates transition directly to provisional independent licensure with a 3-year return of service in an underserved community.'
  };
}
