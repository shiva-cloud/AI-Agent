/**
 * Federal Free Trade Agreement (FTA / GATS / CETA / CPTPP) Professional Navigator
 *
 * Audits LMIA-exempt professional and contractual service supplier work permits
 * under IRPR s. 204(a), evaluating international trade agreements (CUSMA, CETA,
 * CPTPP, GATS, Canada-UK TCA), citizenship eligibility, pre-arranged service contracts,
 * degree/licensure qualifications, and employer portal compliance.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FEDERAL_FTA_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Immigration and Refugee Protection Regulations, SOR/2002-227, s. 204(a)',
  EMPLOYER_COMPLIANCE_FEE_CAD: 230,
  SUPPORTED_TREATIES: Object.freeze({
    CUSMA: { code: 'T23', maxInitialMonths: 36, name: 'Canada-United States-Mexico Agreement' },
    CETA: { code: 'T43', maxInitialMonths: 12, name: 'Canada-European Union CETA' },
    CPTPP: { code: 'T51', maxInitialMonths: 12, name: 'Comprehensive & Progressive Trans-Pacific Partnership' },
    GATS: { code: 'T33', maxInitialMonths: 12, name: 'General Agreement on Trade in Services' },
    UK_TCA: { code: 'T48', maxInitialMonths: 12, name: 'Canada-UK Trade Continuity Agreement' }
  }),
  MIN_PROFESSIONAL_EXPERIENCE_YEARS: 3
});

/**
 * Audits eligibility for an FTA professional LMIA-exempt work permit under IRPR s. 204(a).
 *
 * @param {Object} params
 * @param {string} [params.treaty='CUSMA'] - 'CUSMA', 'CETA', 'CPTPP', 'GATS', 'UK_TCA'
 * @param {string} [params.applicantCitizenshipCountry='USA'] - Country of citizenship of the applicant
 * @param {boolean} [params.hasSignedServiceContractOrJobOffer=true] - Pre-arranged contract or employment offer
 * @param {boolean} [params.hasRequiredDegreeOrLicence=true] - Meets minimum educational degree or professional license
 * @param {number} [params.yearsOfProfessionalExperience=4] - Years of documented experience in the specialty
 * @param {boolean} [params.employerComplianceFeePaid=true] - Employer submitted portal offer and paid $230 fee
 * @param {boolean} [params.isRegulatedProfessionInProvince=false] - Whether occupation requires provincial licensing
 * @param {boolean} [params.provincialLicenceAcquiredOrInProcess=true] - Provincial license status if regulated
 * @returns {Object} Comprehensive FTA professional audit and permit assessment
 */
export function evaluateFederalFtaProfessionalWorkPermit(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Professional',
    assessmentDate = todayIso(),
    treaty = 'CUSMA',
    applicantCitizenshipCountry = 'USA',
    hasSignedServiceContractOrJobOffer = true,
    hasRequiredDegreeOrLicence = true,
    yearsOfProfessionalExperience = 4,
    employerComplianceFeePaid = true,
    isRegulatedProfessionInProvince = false,
    provincialLicenceAcquiredOrInProcess = true,
    employerName = 'Canadian Client or Employer',
    contractTitle = 'Professional Service Contract'
  } = safeParams;
  const cleanApplicantName = boundedText(applicantName, 'Professional', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanEmployer = boundedText(employerName, 'Canadian Client or Employer');
  const cleanContract = boundedText(contractTitle, 'Professional Service Contract');
  const treatyKey = boundedText(treaty, 'CUSMA', 30).toUpperCase();
  const citizenCountry = boundedText(applicantCitizenshipCountry, 'USA', 60).toUpperCase();
  const yearsExp = Math.max(0, Math.min(60, Number.isFinite(Number(yearsOfProfessionalExperience)) ? Number(yearsOfProfessionalExperience) : 0));

  const treatyConfig = FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES[treatyKey];

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Treaty Recognition
  if (!treatyConfig) {
    statutoryViolations.push({
      rule: 'UNRECOGNIZED_FREE_TRADE_AGREEMENT',
      statute: 'IRPR s. 204(a)',
      finding: `Treaty '${treatyKey}' is not recognized under international agreement exemptions. Supported treaties: ${Object.keys(FEDERAL_FTA_CONSTANTS.SUPPORTED_TREATIES).join(', ')}.`
    });
  }

  // 2. Pre-arranged Contract or Offer
  if (!hasSignedServiceContractOrJobOffer) {
    statutoryViolations.push({
      rule: 'MISSING_PREARRANGED_CONTRACT_OR_OFFER',
      statute: 'IRPR s. 204(a) Trade Agreement Annex',
      finding: 'Applicant must have a pre-arranged contract with an enterprise or Canadian consumer for the provision of services.'
    });
    actionableRemedies.push({
      action: 'SECURE_EXECUTED_SERVICE_CONTRACT',
      remedyDescription: 'Execute a formal services contract detailing deliverables, duration, and remuneration.'
    });
  }

  // 3. Educational & Professional Qualifications
  if (!hasRequiredDegreeOrLicence) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_PROFESSIONAL_CREDENTIALS',
      statute: 'IRPR s. 204(a) Minimum Qualification Threshold',
      finding: 'FTA professional categories require a relevant post-secondary degree (baccalaureate or equivalent) or designated trade certification.'
    });
    actionableRemedies.push({
      action: 'OBTAIN_EDUCATIONAL_CREDENTIAL_ASSESSMENT',
      remedyDescription: 'Commission an ECA (e.g. WES, ICAS) to document Canadian equivalency of foreign academic credentials.'
    });
  }

  if (yearsExp < FEDERAL_FTA_CONSTANTS.MIN_PROFESSIONAL_EXPERIENCE_YEARS) {
    riskWarnings.push({
      warningType: 'EXPERIENCE_BELOW_TYPICAL_TREATY_BENCHMARK',
      description: `Applicant has ${yearsExp} years experience. Most trade pacts require at least 3 years in the specific field of practice.`
    });
  }

  // 4. Regulated Profession Licensure Check
  if (isRegulatedProfessionInProvince && !provincialLicenceAcquiredOrInProcess) {
    statutoryViolations.push({
      rule: 'UNLICENSED_IN_REGULATED_PROVINCIAL_PROFESSION',
      statute: 'IRPR s. 200(3)(a)',
      finding: 'An officer cannot issue a work permit if applicant cannot perform the work due to lack of provincial licence or certification.'
    });
    actionableRemedies.push({
      action: 'INITIATE_PROVINCIAL_PROFESSIONAL_REGISTRATION',
      remedyDescription: 'Apply to the provincial professional regulator for provisional licensing or practice authorization.'
    });
  }

  // 5. Employer Portal Fee
  if (!employerComplianceFeePaid) {
    riskWarnings.push({
      warningType: 'PENDING_EMPLOYER_PORTAL_COMPLIANCE_FEE',
      description: 'The contracting Canadian employer must submit the offer in the IRCC Employer Portal and pay the $230 compliance fee under IRPR s. 303.1.'
    });
    actionableRemedies.push({
      action: 'PAY_PORTAL_COMPLIANCE_FEE',
      remedyDescription: 'Employer logs into IRCC Portal to remit $230 fee and generate an Offer of Employment (A-number).'
    });
  }

  const isEligible = statutoryViolations.length === 0;
  let eligibilityVerdict = 'ELIGIBLE_FOR_FTA_WORK_PERMIT';
  let legalVerdict = `Applicant qualifies for LMIA-exempt work authorization under IRPR s. 204(a) (${treatyConfig?.name || treatyKey}).`;

  if (!isEligible) {
    eligibilityVerdict = 'INELIGIBLE_FOR_FTA_EXEMPTION';
    legalVerdict = `Candidate does not qualify under ${treatyKey} due to ${statutoryViolations.length} statutory defect${statutoryViolations.length === 1 ? '' : 's'}. Review necessary conditions before applying.`;
  }

  return {
    applicantName: cleanApplicantName,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    employerName: cleanEmployer,
    contractTitle: cleanContract,
    treaty: treatyKey,
    treatyName: treatyConfig?.name || 'Unknown Treaty',
    exemptionCode: treatyConfig?.code || 'T-VARIOUS',
    applicantCitizenshipCountry: citizenCountry,
    isEligible,
    eligibilityVerdict,
    legalVerdict,
    permitDetails: {
      lmiaRequired: false,
      permitType: 'EMPLOYER_SPECIFIC_LMIA_EXEMPT',
      maxInitialDurationMonths: treatyConfig?.maxInitialMonths || 12,
      employerComplianceFeeCad: FEDERAL_FTA_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 200(3)(a), 204(a), 303.1',
      `International Free Trade Agreements: ${treatyConfig?.name || 'Bilateral Trade Agreements'} Professionals and Service Suppliers`
    ]
  };
}