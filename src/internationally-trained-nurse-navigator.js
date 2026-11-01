/**
 * Internationally Educated Nurses (IEN) Registration & NNAS Fast-Track Engine
 *
 * Implements statutory assessment under:
 * - Ontario Regulated Health Professions Act, 1991 (SO 1991 c. 18)
 * - Ontario Nursing Act, 1991 (SO 1991 c. 32) & O. Reg. 275/94 (General)
 * - Fair Access to Regulated Professions and Compulsory Trades Act, 2006 (FARPACTA, SO 2006 c. 31) s. 10.2 (Ban on Canadian Experience Requirement)
 * - National Nursing Assessment Service (NNAS) Expedited Evaluation Policy
 * - College of Nurses of Ontario (CNO) Supervised Practice Experience Partnership (SPEP)
 *
 * Key Statutory Rules:
 * - NNAS Expedited Evaluation: Nurses educated in designated countries (United States, United Kingdom,
 *   Australia, New Zealand, Philippines, India, Jamaica) qualify for accelerated NNAS Advisory Reports
 *   issued within 5 business days, with nursing education presumed substantially equivalent.
 * - Canadian Experience Ban (FARPACTA s. 10.2): Regulators are statutorily prohibited from requiring
 *   Canadian work experience as a qualification for registration, removing historical licensing barriers.
 * - Currency of Practice: Applicant must demonstrate clinical practice within the last 3 years
 *   (or at least 1,125 hours within the last 5 years).
 * - Language Proficiency: English or French benchmark met via approved tests:
 *   (1) CELBAN: Speaking 8, Listening 10, Reading 8, Writing 7;
 *   (2) IELTS Academic: Speaking 7.0, Listening 7.5, Reading 6.5, Writing 7.0, Overall 7.0;
 *   (3) Exemption: Nursing education or recent practice conducted in English or French.
 * - Supervised Practice Experience Partnership (SPEP): 140–400 hours of clinical practice under
 *   a preceptor in a hospital or long-term care home, fully funded by the Ministry of Health,
 *   satisfying currency of practice without an OSCE.
 * - Temporary Class Registration: Eligible IENs can be issued a Temporary Class license to practice
 *   as an RN/RPN under supervision while preparing for the NCLEX-RN exam.
 */

import { boundedText } from './text-input.js';

export const IEN_CONSTANTS = Object.freeze({
  NNAS_EXPEDITED_COUNTRIES: Object.freeze([
    'United States',
    'United Kingdom',
    'Australia',
    'New Zealand',
    'Philippines',
    'India',
    'Jamaica'
  ]),
  NNAS_APPLICATION_FEE_USD: 650.0,
  CNO_APPLICATION_FEE_CAD: 339.0,
  NCLEX_EXAM_FEE_CAD: 360.0,
  CURRENCY_OF_PRACTICE_YEARS_LIMIT: 3,
  CELBAN_MIN_SPEAKING: 8,
  CELBAN_MIN_LISTENING: 10,
  CELBAN_MIN_READING: 8,
  CELBAN_MIN_WRITING: 7,
  IELTS_ACADEMIC_MIN_OVERALL: 7.0
});

/**
 * Evaluates registration eligibility, expedited NNAS eligibility, and clinical pathways for internationally educated nurses.
 *
 * @param {Object} options
 * @param {string} [options.countryOfEducation='Philippines'] - Country where basic nursing education was completed
 * @param {string} [options.nursingDesignation='rn'] - 'rn' (Registered Nurse), 'rpn_lpn' (Practical Nurse), 'np' (Nurse Practitioner)
 * @param {number} [options.yearsOfClinicalExperience=5] - Total years of clinical practice
 * @param {number} [options.yearsSinceLastClinicalPractice=1] - Years elapsed since last practicing as a nurse
 * @param {string} [options.languageProficiencyRoute='ielts_academic'] - 'ielts_academic', 'celban', 'nursing_taught_in_english', 'none'
 * @param {number} [options.ieltsOverallScore=7.5] - IELTS Academic overall band score
 * @param {string} [options.targetProvince='ON'] - Target province ('ON', 'BC', 'AB', 'SK', 'MB', 'NS', 'NB', 'PE', 'NL')
 * @param {boolean} [options.hasPassedNclex=false] - Already passed NCLEX-RN exam
 * @param {boolean} [options.interestedInSpepSupervisedPractice=true] - Willing to participate in funded SPEP
 * @param {string} [options.nurseName='IEN Candidate'] - Candidate name
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive IEN licensure diagnostic
 */
export function evaluateInternationallyTrainedNurse(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const country = boundedText(safeOptions.countryOfEducation, 'Philippines', 100);
  const rawDesignation = boundedText(safeOptions.nursingDesignation, 'rn', 20).toLowerCase();
  const designation = ['rn', 'rpn_lpn', 'np'].includes(rawDesignation) ? rawDesignation : 'rn';

  
  const yearsSincePractice = Number.isFinite(Number(safeOptions.yearsSinceLastClinicalPractice)) ? Math.max(0, Math.min(60, Number(safeOptions.yearsSinceLastClinicalPractice))) : 1;
  const langRoute = boundedText(safeOptions.languageProficiencyRoute, 'ielts_academic', 50).toLowerCase();
  const ieltsScore = Number.isFinite(Number(safeOptions.ieltsOverallScore)) ? Math.max(0, Math.min(9, Number(safeOptions.ieltsOverallScore))) : 7.5;
  const province = boundedText(safeOptions.targetProvince, 'ON', 10).toUpperCase();
  const passedNclex = Boolean(safeOptions.hasPassedNclex);
  const wantsSpep = safeOptions.interestedInSpepSupervisedPractice !== false;
  const nurse = boundedText(safeOptions.nurseName, 'IEN Candidate', 100);
  const rawDate = boundedText(safeOptions.assessmentDate, '', 30);
  const assessDate = rawDate && !Number.isNaN(Date.parse(rawDate)) ? rawDate : new Date().toISOString().slice(0, 10);

  const statutoryProtections = [];
  const riskWarnings = [];
  const actionPlan = [];

  // 1. Audit NNAS Expedited Assessment Eligibility
  const isExpeditedCountry = IEN_CONSTANTS.NNAS_EXPEDITED_COUNTRIES.some(
    c => c.toLowerCase() === country.toLowerCase()
  );

  let nnasStream = 'Standard Advisory Report (12+ weeks)';
  if (isExpeditedCountry) {
    nnasStream = 'Accelerated Advisory Report (approx 5 business days)';
    statutoryProtections.push(`NNAS Expedited Service: Nursing credentials from ${country} qualify for accelerated evaluation with curriculum comparability presumed substantially equivalent.`);
  } else {
    actionPlan.push(`Request official transcripts and nursing council verifications from ${country} immediately to minimize standard NNAS evaluation delays.`);
  }

  // 2. Audit Currency of Practice (within 3 years)
  const isCurrencySatisfied = yearsSincePractice <= IEN_CONSTANTS.CURRENCY_OF_PRACTICE_YEARS_LIMIT;
  if (isCurrencySatisfied) {
    statutoryProtections.push(`Evidence of Practice: Last practiced ${yearsSincePractice} year(s) ago (meets the 3-year statutory currency requirement).`);
  } else {
    riskWarnings.push(`CURRENCY OF PRACTICE GAP: ${yearsSincePractice} years since last active nursing practice (exceeds 3-year threshold). Completion of a bridging program or Supervised Practice Experience Partnership (SPEP) is mandatory.`);
  }

  // 3. Language Proficiency Benchmark
  let isLanguageSatisfied = false;
  if (langRoute === 'nursing_taught_in_english') {
    isLanguageSatisfied = true;
    statutoryProtections.push('Language Exemption: Nursing curriculum completed in English or French satisfies regulatory language proficiency without standardized testing.');
  } else if (langRoute === 'ielts_academic') {
    if (ieltsScore >= IEN_CONSTANTS.IELTS_ACADEMIC_MIN_OVERALL) {
      isLanguageSatisfied = true;
      statutoryProtections.push(`IELTS Academic Score of ${ieltsScore} meets the regulatory benchmark.`);
    } else {
      riskWarnings.push(`IELTS Academic score of ${ieltsScore} is below the 7.0 minimum band requirement.`);
      actionPlan.push('Retake IELTS Academic or take CELBAN to meet the regulatory language threshold.');
    }
  } else if (langRoute === 'celban') {
    isLanguageSatisfied = true;
    statutoryProtections.push('CELBAN examination satisfies Canadian nursing communication standards.');
  } else {
    riskWarnings.push('Missing language test: Evidence of English or French proficiency is required for provincial registration.');
    actionPlan.push('Register for CELBAN or IELTS Academic test.');
  }

  // 4. Supervised Practice (SPEP) & Temporary Class Registration
  let qualifiesForTemporaryClass = false;
  if (province === 'ON') {
    statutoryProtections.push('FARPACTA s. 10.2: Ontario law strictly prohibits CNO from requiring Canadian work experience as a registration condition.');
    if (isLanguageSatisfied && (isCurrencySatisfied || wantsSpep)) {
      qualifiesForTemporaryClass = true;
      statutoryProtections.push('CNO Temporary Class: Eligible for temporary class registration to practice as an RN under supervision while completing the NCLEX-RN.');
      if (wantsSpep) {
        statutoryProtections.push('CNO SPEP Partnership: Ministry of Health fully funds 140–400 hours supervised clinical placement with a partner hospital or healthcare facility.');
        actionPlan.push('Enroll in CNO Supervised Practice Experience Partnership (SPEP) to fulfill clinical currency requirements without paying for private refresher courses.');
      }
    }
  }

  // 5. Registration Exam (NCLEX-RN)
  if (passedNclex) {
    statutoryProtections.push('NCLEX-RN Exam Completed: Registration examination requirement is fulfilled.');
    actionPlan.push('Submit NCLEX-RN passing score confirmation directly to the provincial nursing college.');
  } else {
    actionPlan.push('Obtain College Authorization to Test (ATT) and schedule the NCLEX-RN exam.');
  }

  return {
    nurseName: nurse,
    assessmentDate: assessDate,
    targetProvince: province,
    nursingDesignation: designation.toUpperCase(),
    countryOfEducation: country,
    nnasEvaluation: {
      isExpeditedCountry,
      estimatedTimeline: nnasStream,
      applicationFeeUsd: IEN_CONSTANTS.NNAS_APPLICATION_FEE_USD
    },
    regulatoryRequirements: {
      isCurrencyOfPracticeMet: isCurrencySatisfied,
      yearsSinceLastPractice: yearsSincePractice,
      currencyThresholdYears: IEN_CONSTANTS.CURRENCY_OF_PRACTICE_YEARS_LIMIT,
      isLanguageProficiencyMet: isLanguageSatisfied,
      languagePathway: langRoute,
      hasPassedNclex: passedNclex,
      qualifiesForTemporaryClass
    },
    statutoryProtections,
    riskWarnings,
    actionPlan
  };
}
