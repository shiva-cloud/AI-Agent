/**
 * Francophone Mobility Program (Mobilité Francophone) Navigator
 *
 * Implements statutory assessment under the Immigration and Refugee Protection Regulations (IRPR)
 * s. 205(a), LMIA Exemption Code C16, and IRCC Francophone Immigration Strategy guidelines.
 *
 * Key Statutory Rules:
 * - Location Outside Quebec: Employment must be physically located in a Canadian province
 *   or territory outside Quebec (IRPR s. 205(a)).
 * - Language Benchmark: Foreign worker must demonstrate French language proficiency of at least
 *   NCLC level 5 (Niveaux de compétence linguistique canadiens) in speaking and listening
 *   (reduced from CLB 7 in June 2023).
 * - TEER Scope: Open to all National Occupational Classification (NOC) TEER categories (0, 1, 2, 3, 4, 5),
 *   excluding primary agriculture occupations.
 * - Employer Compliance: Canadian employer must submit Offer of Employment via IRCC Employer Portal
 *   and pay the $230 statutory employer compliance fee prior to permit application.
 * - Valid Language Tests: TEF Canada (Test d’évaluation de français) or TCF Canada (Test de connaissance du français),
 *   valid for 2 years from date of issuance.
 */

import { boundedText } from './utils/sanitizer.js';

import { safeIsoDate } from './text-input.js';

export const FRANCOPHONE_MOBILITY_CONSTANTS = Object.freeze({
  MIN_NCLC_LEVEL: 5,
  EMPLOYER_COMPLIANCE_FEE_CAD: 230.0,
  WORK_PERMIT_APPLICATION_FEE_CAD: 155.0,
  TEST_VALIDITY_YEARS: 2,
  LMIA_EXEMPTION_CODE: 'C16',
  PROHIBITED_DESTINATION_PROVINCES: Object.freeze(['QC']),
  VALID_FRENCH_TEST_TYPES: Object.freeze(['tef_canada', 'tcf_canada']),
  PRIMARY_AGRICULTURE_NOC_PREFIXES: Object.freeze(['80020', '80021', '82030', '82031', '84120', '85100', '85101'])
});

export const CANADIAN_PROVINCES_OUTSIDE_QUEBEC = Object.freeze({
  ON: 'Ontario',
  BC: 'British Columbia',
  AB: 'Alberta',
  MB: 'Manitoba',
  SK: 'Saskatchewan',
  NS: 'Nova Scotia',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  PE: 'Prince Edward Island',
  YT: 'Yukon',
  NT: 'Northwest Territories',
  NU: 'Nunavut'
});

/**
 * Evaluates foreign worker and job offer eligibility under the Francophone Mobility Program (C16).
 *
 * @param {Object} options
 * @param {string} [options.province='ON'] - Target province of employment
 * @param {string} [options.frenchTestType='tef_canada'] - Language test ('tef_canada', 'tcf_canada', 'none')
 * @param {number} [options.nclcSpeaking=5] - Speaking score in NCLC (1-10)
 * @param {number} [options.nclcListening=5] - Listening score in NCLC (1-10)
 * @param {string} [options.testDate='2025-06-01'] - ISO test date
 * @param {string} [options.nocCode='21232'] - 5-digit NOC 2021 code
 * @param {number} [options.nocTeer=1] - TEER category (0, 1, 2, 3, 4, 5)
 * @param {boolean} [options.isPrimaryAgriculture=false] - Whether job is primary agriculture
 * @param {boolean} [options.hasGenuineJobOffer=true] - Employer has offered full-time work
 * @param {boolean} [options.employerPaidComplianceFee=true] - Employer paid $230 Portal fee
 * @param {string} [options.applicantName='Applicant'] - Worker name
 * @param {string} [options.employerName='Canadian Employer Inc.'] - Employer legal name
 * @param {string} [options.assessmentDate=todayIso()] - Date of assessment
 * @returns {Object} Comprehensive C16 eligibility diagnosis
 */
export function evaluateFrancophoneMobility(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const prov = boundedText(safeOptions.province, 10).toUpperCase() || 'ON';
  const testType = boundedText(safeOptions.frenchTestType, 30).toLowerCase() || 'tef_canada';
  const speaking = Number.isFinite(Number(safeOptions.nclcSpeaking)) ? Math.max(0, Math.min(12, Math.floor(Number(safeOptions.nclcSpeaking)))) : 5;
  const listening = Number.isFinite(Number(safeOptions.nclcListening)) ? Math.max(0, Math.min(12, Math.floor(Number(safeOptions.nclcListening)))) : 5;
  const testDateStr = safeIsoDate(safeOptions.testDate || '2025-06-01');
  const noc = boundedText(safeOptions.nocCode, 10) || '21232';
  const teer = Number.isFinite(Number(safeOptions.nocTeer)) ? Math.max(0, Math.min(5, Math.floor(Number(safeOptions.nocTeer)))) : 1;
  const isAgri = Boolean(safeOptions.isPrimaryAgriculture) || FRANCOPHONE_MOBILITY_CONSTANTS.PRIMARY_AGRICULTURE_NOC_PREFIXES.includes(noc);
  const jobOffer = safeOptions.hasGenuineJobOffer !== false;
  const complianceFee = safeOptions.employerPaidComplianceFee !== false;
  const applicantName = boundedText(safeOptions.applicantName, 120) || 'Applicant';
  const employerName = boundedText(safeOptions.employerName, 150) || 'Canadian Employer Inc.';
  const assessDate = safeIsoDate(safeOptions.assessmentDate);

  const compliancePoints = [];
  const deficiencies = [];
  const riskWarnings = [];
  const requiredSteps = [];
  const statutoryNotes = [];

  // 1. Geography Check: Must be outside Quebec
  const isOutsideQuebec = !FRANCOPHONE_MOBILITY_CONSTANTS.PROHIBITED_DESTINATION_PROVINCES.includes(prov);
  if (isOutsideQuebec) {
    compliancePoints.push(`Job destination in ${CANADIAN_PROVINCES_OUTSIDE_QUEBEC[prov] || prov} is outside Quebec (IRPR s. 205(a)).`);
  } else {
    deficiencies.push('Employment destination is in Quebec. Mobilité Francophone (C16) is strictly restricted to Canadian provinces and territories outside Quebec.');
    riskWarnings.push('QUEBEC EXCLUSION: Quebec administers its own immigration and temporary worker selections. To work in Quebec, employers must obtain a Quebec Acceptance Certificate (CAQ) and standard LMIA.');
  }

  // 2. Language Benchmark: NCLC 5 in Speaking & Listening
  const validTest = FRANCOPHONE_MOBILITY_CONSTANTS.VALID_FRENCH_TEST_TYPES.includes(testType);
  let testExpired = false;

  if (testDateStr) {
    const tTime = new Date(testDateStr).getTime();
    const aTime = new Date(assessDate).getTime();
    if (!Number.isNaN(tTime) && !Number.isNaN(aTime)) {
      const yearsDiff = (aTime - tTime) / (1000 * 60 * 60 * 24 * 365.25);
      if (yearsDiff > FRANCOPHONE_MOBILITY_CONSTANTS.TEST_VALIDITY_YEARS) {
        testExpired = true;
      }
    }
  }

  const meetsSpeaking = speaking >= FRANCOPHONE_MOBILITY_CONSTANTS.MIN_NCLC_LEVEL;
  const meetsListening = listening >= FRANCOPHONE_MOBILITY_CONSTANTS.MIN_NCLC_LEVEL;
  const languageEligible = validTest && !testExpired && meetsSpeaking && meetsListening;

  if (languageEligible) {
    compliancePoints.push(`Demonstrated NCLC ${Math.min(speaking, listening)}+ French oral proficiency via valid ${testType.toUpperCase()} (Speaking: NCLC ${speaking}, Listening: NCLC ${listening}).`);
  } else {
    if (!validTest) {
      deficiencies.push('No recognized official French language test provided. Must complete TEF Canada or TCF Canada.');
    } else if (testExpired) {
      deficiencies.push(`French language test dated ${testDateStr} is over 2 years old and statutorily expired.`);
    } else {
      if (!meetsSpeaking) deficiencies.push(`Speaking score of NCLC ${speaking} is below statutory minimum NCLC 5.`);
      if (!meetsListening) deficiencies.push(`Listening score of NCLC ${listening} is below statutory minimum NCLC 5.`);
    }
  }

  // 3. Occupation / TEER Check
  if (isAgri) {
    deficiencies.push(`NOC ${noc} is classified as primary agriculture, which is explicitly ineligible for Mobilité Francophone C16.`);
    riskWarnings.push('AGRICULTURE EXCLUSION: Primary agriculture positions must be processed through the standard Temporary Foreign Worker Program (TFWP) Agricultural Stream with an LMIA.');
  } else {
    compliancePoints.push(`NOC ${noc} (TEER ${teer}) is within the expanded eligible NOC scope for Francophone Mobility.`);
  }

  // 4. Job Offer and Employer Compliance
  if (jobOffer) {
    compliancePoints.push('Employer has provided a genuine, full-time job offer.');
  } else {
    deficiencies.push('Must hold a genuine, written job offer from an employer operating outside Quebec.');
  }

  if (complianceFee) {
    compliancePoints.push('Employer compliance fee of $230 CAD verified or pledged.');
  } else {
    deficiencies.push('Employer has not submitted Offer of Employment via IRCC Employer Portal or paid $230 compliance fee.');
  }

  const overallEligible = isOutsideQuebec && languageEligible && !isAgri && jobOffer && complianceFee;

  let summaryTitle = '';
  if (overallEligible) {
    summaryTitle = `Eligible for Francophone Mobility Program (C16 Exemption in ${prov})`;
    requiredSteps.push('Employer submits Offer of Employment through the IRCC Employer Portal and pays $230 compliance fee to generate an Offer of Employment ID (A-Number).');
    requiredSteps.push('Applicant completes online Work Permit application (Form IMM 1295 outside Canada or IMM 5710 inland), selecting LMIA-Exempt Code C16.');
    requiredSteps.push('Attach official TEF Canada or TCF Canada test results verifying NCLC 5+ in speaking and listening.');
    requiredSteps.push('Pay $155 CAD IRCC work permit processing fee (plus $85 biometrics fee if applicable).');
  } else {
    summaryTitle = `Ineligible for Francophone Mobility Program (${deficiencies.length} Issues Identified)`;
    if (!isOutsideQuebec) requiredSteps.push('Select a work location in Ontario, British Columbia, Alberta, or other province outside Quebec.');
    if (!languageEligible) requiredSteps.push('Register for and pass TEF Canada or TCF Canada achieving at least NCLC 5 in both Expression Orale and Compréhension Orale.');
    if (isAgri) requiredSteps.push('Seek employment in a non-primary-agriculture NOC code (e.g. food processing, logistics, trades, professional services).');
  }

  statutoryNotes.push('IRPR s. 205(a): Exemption from the requirement of a Labour Market Impact Assessment (LMIA) under significant benefit considerations.');
  statutoryNotes.push('IRCC Policy Expansion (June 2023): Language requirement lowered to NCLC 5 in oral abilities and expanded to TEER 0, 1, 2, 3, 4, 5 (all non-agriculture NOCs).');
  statutoryNotes.push('Employer Portal Compliance (IRPR ss. 209.11–209.91): Mandatory submission of job terms and payment of $230 fee prior to work permit application.');

  return {
    applicantName,
    employerName,
    province: prov,
    lmiaExemptionCode: FRANCOPHONE_MOBILITY_CONSTANTS.LMIA_EXEMPTION_CODE,
    assessmentDate: assessDate,
    overallEligible,
    summaryTitle,
    languageAudit: {
      testType,
      speakingScoreNclc: speaking,
      listeningScoreNclc: listening,
      meetsOralThreshold: meetsSpeaking && meetsListening,
      testExpired,
      statutoryMinimumNclc: FRANCOPHONE_MOBILITY_CONSTANTS.MIN_NCLC_LEVEL
    },
    jobAudit: {
      nocCode: noc,
      nocTeer: teer,
      isPrimaryAgriculture: isAgri,
      hasGenuineJobOffer: jobOffer,
      employerPaidComplianceFee: complianceFee,
      employerComplianceFeeCad: FRANCOPHONE_MOBILITY_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD
    },
    compliancePoints,
    deficiencies,
    riskWarnings,
    requiredSteps,
    statutoryNotes
  };
}
