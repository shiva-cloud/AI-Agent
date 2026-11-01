/**
 * Federal Francophone Mobility (Mobilité Francophone - C16) Navigator
 *
 * Audits eligibility for LMIA-exempt work permits under IRPR s. 205(a), Exemption Code C16,
 * incorporating the 2023 expansion to all TEER categories (0–5, excluding primary agriculture),
 * French oral proficiency threshold (NCLC 5+ in speaking and listening via TEF/TCF Canada),
 * destination outside Quebec, and employer portal compliance requirements.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const FEDERAL_C16_CONSTANTS = Object.freeze({
  EXEMPTION_CODE: 'C16',
  PROGRAM_NAME: 'Francophone Mobility / Mobilité francophone',
  MIN_FRENCH_ORAL_NCLC_LEVEL: 5, // Speaking and Listening
  EMPLOYER_COMPLIANCE_FEE_CAD: 230, // IRPR s. 303.1
  EXCLUDED_PROVINCE: 'QC', // Quebec is excluded
  ELIGIBLE_TEER_RANGE: Object.freeze([0, 1, 2, 3, 4, 5]),
  STATUTORY_AUTHORITY: 'Immigration and Refugee Protection Regulations, SOR/2002-227, s. 205(a)'
});

/**
 * Audits eligibility for the Francophone Mobility C16 LMIA-exempt work permit stream.
 *
 * @param {Object} params
 * @param {number} [params.frenchOralNclcLevel=5] - NCLC score in French speaking & listening (1-12)
 * @param {string} [params.destinationProvince='ON'] - Target Canadian province/territory code (e.g. 'ON', 'BC', 'AB', 'QC')
 * @param {number} [params.teerCategory=1] - National Occupational Classification (NOC) TEER category (0, 1, 2, 3, 4, 5)
 * @param {boolean} [params.isPrimaryAgricultureNoc=false] - Whether job is in primary agriculture (excluded from C16)
 * @param {boolean} [params.hasValidJobOffer=true] - Whether applicant possesses a genuine, full-time job offer
 * @param {boolean} [params.hasApprovedFrenchTest=true] - Whether TEF Canada or TCF Canada results are available
 * @param {boolean} [params.employerComplianceFeePaid=true] - Whether employer paid $230 compliance fee in Employer Portal
 * @returns {Object} Comprehensive Francophone Mobility C16 audit and assessment
 */
export function evaluateFederalFrancophoneMobilityC16(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    frenchOralNclcLevel = 5,
    destinationProvince = 'ON',
    teerCategory = 1,
    isPrimaryAgricultureNoc = false,
    hasValidJobOffer = true,
    hasApprovedFrenchTest = true,
    employerComplianceFeePaid = true,
    candidateName = 'Candidate',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeCandidateName = boundedText(candidateName, 'Candidate', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');

  const primaryAgri = Boolean(isPrimaryAgricultureNoc);
  const validJobOffer = Boolean(hasValidJobOffer);
  const approvedFrenchTest = Boolean(hasApprovedFrenchTest);
  const complianceFeePaid = Boolean(employerComplianceFeePaid);

  const nclc = Number.isFinite(Number(frenchOralNclcLevel)) ? Math.min(12, Math.max(0, Math.floor(Number(frenchOralNclcLevel)))) : 0;
  const prov = boundedText(destinationProvince, 10).toUpperCase() || 'ON';
  const teer = Number.isFinite(Number(teerCategory)) ? Math.min(5, Math.max(0, Math.floor(Number(teerCategory)))) : 1;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Language Proficiency Audit (NCLC 5+ oral)
  if (nclc < FEDERAL_C16_CONSTANTS.MIN_FRENCH_ORAL_NCLC_LEVEL) {
    statutoryViolations.push({
      rule: 'BELOW_MINIMUM_FRENCH_ORAL_BENCHMARK',
      statute: 'IRPR s. 205(a) C16 Policy Guidance',
      finding: `French oral proficiency is NCLC ${nclc}. Minimum NCLC 5 in listening and speaking is required.`
    });
    actionableRemedies.push({
      action: 'UPGRADE_FRENCH_ORAL_PROFICIENCY',
      remedyDescription: 'Retake TEF Canada or TCF Canada after targeted oral practice to reach NCLC 5 or higher.'
    });
  }

  if (!approvedFrenchTest) {
    riskWarnings.push({
      warningType: 'MISSING_STANDARDIZED_FRENCH_TEST_RESULT',
      description: 'C16 applications require official TEF Canada or TCF Canada test results, or French-language secondary/post-secondary credential proof.'
    });
    actionableRemedies.push({
      action: 'BOOK_TEF_OR_TCF_CANADA_EXAM',
      remedyDescription: 'Register for an accredited TEF Canada or TCF Canada language test session.'
    });
  }

  // 2. Geographic Destination Audit (Outside Quebec)
  if (prov === FEDERAL_C16_CONSTANTS.EXCLUDED_PROVINCE) {
    statutoryViolations.push({
      rule: 'INELIGIBLE_DESTINATION_QUEBEC',
      statute: 'IRPR s. 205(a) C16 Operational Instructions',
      finding: 'Francophone Mobility is statutorily intended to foster francophone minority communities outside Quebec. Jobs inside Quebec are ineligible.'
    });
    actionableRemedies.push({
      action: 'EXPLORE_QUEBEC_CAQ_OR_RELOCATE_OFFER',
      remedyDescription: 'For jobs in Quebec, pursue standard Quebec selection (CAQ / LMIA). For C16, job location must be in any province or territory other than Quebec.'
    });
  }

  // 3. TEER Category and Agriculture Exclusions
  if (!FEDERAL_C16_CONSTANTS.ELIGIBLE_TEER_RANGE.includes(teer)) {
    statutoryViolations.push({
      rule: 'INVALID_NOC_TEER_CATEGORY',
      statute: 'IRPR s. 205(a) C16 June 2023 Revision',
      finding: `TEER category ${teer} is unrecognized. Eligible range is TEER 0, 1, 2, 3, 4, or 5.`
    });
  }

  if (primaryAgri) {
    statutoryViolations.push({
      rule: 'EXCLUDED_PRIMARY_AGRICULTURE_OCCUPATION',
      statute: 'IRCC Operational Instructions - C16 Exclusions',
      finding: 'Primary agriculture occupations remain excluded from C16 and must utilize the standard Agricultural Stream LMIA.'
    });
    actionableRemedies.push({
      action: 'APPLY_VIA_AGRICULTURAL_STREAM_LMIA',
      remedyDescription: 'Employer must apply through the ESDC Agricultural Stream or Seasonal Agricultural Worker Program.'
    });
  }

  // 4. Job Offer & Employer Portal Compliance
  if (!validJobOffer) {
    statutoryViolations.push({
      rule: 'MISSING_VALID_CANADIAN_JOB_OFFER',
      statute: 'IRPR s. 200(1)(c)(ii.1)',
      finding: 'An employer-specific job offer is mandatory for LMIA exemption under code C16.'
    });
  }

  if (!complianceFeePaid) {
    riskWarnings.push({
      warningType: 'PENDING_EMPLOYER_PORTAL_COMPLIANCE_FEE',
      description: 'The prospective Canadian employer must submit the offer via the IRCC Employer Portal and remit the $230 compliance fee under IRPR s. 303.1.'
    });
    actionableRemedies.push({
      action: 'SUBMIT_PORTAL_OFFER_AND_PAY_230_FEE',
      remedyDescription: 'Employer logs into the IRCC Employer Portal, submits employment details, and obtains an Offer of Employment (A-number).'
    });
  }

  const isEligible = statutoryViolations.length === 0;
  let eligibilityVerdict = 'ELIGIBLE_FOR_C16_FRANCOPHONE_MOBILITY';
  let legalVerdict = 'Candidate satisfies the expanded 2023 Francophone Mobility (C16) criteria. Eligible for LMIA-exempt employer-specific work permit outside Quebec.';

  if (!isEligible) {
    eligibilityVerdict = 'INELIGIBLE_FOR_C16_LMIA_EXEMPTION';
    legalVerdict = `Candidate does not qualify for Francophone Mobility C16 due to ${statutoryViolations.length} statutory defect${statutoryViolations.length === 1 ? '' : 's'}. Address remedial actions or pursue standard LMIA stream.`;
  }

  return {
    candidateName: safeCandidateName,
    assessmentDate: safeAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    exemptionCode: FEDERAL_C16_CONSTANTS.EXEMPTION_CODE,
    programName: FEDERAL_C16_CONSTANTS.PROGRAM_NAME,
    destinationProvince: prov,
    frenchOralNclcLevel: nclc,
    teerCategory: teer,
    isEligible,
    eligibilityVerdict,
    legalVerdict,
    workPermitDetails: {
      lmiaRequired: false,
      permitType: 'EMPLOYER_SPECIFIC_LMIA_EXEMPT',
      employerComplianceFeeCad: FEDERAL_C16_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD,
      workplaceLanguageFrenchRequired: false // Crucial statutory note
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 200(1)(c)(ii.1), 205(a), 303.1',
      'IRCC Operational Instructions: International Mobility Program - Francophone Mobility (Exemption Code C16, June 2023 Expansion)'
    ]
  };
}