/**
 * Federal Reciprocal Employment (C20) Work Permit Exemption Navigator
 *
 * Evaluates LMIA-exempt work permit eligibility under Canada's Immigration and
 * Refugee Protection Regulations (IRPR), s. 205(b), Exemption Code C20
 * (Reciprocal Employment).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FEDERAL_C20_CONSTANTS = Object.freeze({
  EXEMPTION_CODE: 'C20',
  EMPLOYER_COMPLIANCE_FEE_CAD: 230,
  WORK_PERMIT_PROCESSING_FEE_CAD: 155,
  STATUTORY_AUTHORITY: 'IRPR s. 205(b) - Exemption Code C20'
});

/**
 * Audits reciprocal employment eligibility, bilateral agreements, and two-way exchange balance.
 *
 * @param {Object} params
 * @param {string} [params.exchangeCategory='ACADEMIC_EXCHANGE'] - 'ACADEMIC_EXCHANGE', 'CULTURAL_YOUTH_EXCHANGE', 'CORPORATE_RECIPROCAL_EXCHANGE', 'ATHLETIC_COACHING'
 * @param {boolean} [params.hasFormalWrittenReciprocalAgreement=true] - Executed bilateral institutional exchange agreement exists
 * @param {boolean} [params.canadiansEnjoySimilarOpportunitiesAbroad=true] - Canadian citizens/PRs have reciprocal access in the partner country
 * @param {number} [params.canadiansExchangedOutCount=2] - Number of Canadians placed abroad under this reciprocal mechanism
 * @param {number} [params.foreignWorkersIncomingCount=2] - Number of foreign nationals brought into Canada under this mechanism
 * @param {boolean} [params.isExchangeGeneralParityMaintained=true] - Balance of incoming vs outgoing participants is reasonably reciprocal
 * @param {boolean} [params.isJobOfferFullTime=true] - Full-time employment offer in Canada
 * @param {boolean} [params.employerComplianceFeePaid=true] - $230 fee remitted in Employer Portal
 * @returns {Object} Comprehensive C20 reciprocity audit and permit admissibility
 */
export function evaluateFederalReciprocalEmployment(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    workerName = 'Exchange Worker',
    employerName = 'Host Employer',
    assessmentDate = todayIso(),
    exchangeCategory = 'ACADEMIC_EXCHANGE',
    hasFormalWrittenReciprocalAgreement = true,
    canadiansEnjoySimilarOpportunitiesAbroad = true,
    canadiansExchangedOutCount = 2,
    foreignWorkersIncomingCount = 2,
    isExchangeGeneralParityMaintained = true,
    isJobOfferFullTime = true,
    employerComplianceFeePaid = true
  } = safeParams;
  const cleanWorkerName = boundedText(workerName, 'Exchange Worker', 100);
  const cleanEmployerName = boundedText(employerName, 'Host Employer', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanCategory = boundedText(exchangeCategory, 'ACADEMIC_EXCHANGE', 60).toUpperCase();
  const outgoing = Math.max(0, Math.min(10000, Number.isFinite(Number(canadiansExchangedOutCount)) ? Math.round(Number(canadiansExchangedOutCount)) : 0));
  const incoming = Math.max(0, Math.min(10000, Number.isFinite(Number(foreignWorkersIncomingCount)) ? Math.round(Number(foreignWorkersIncomingCount)) : 0));

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Reciprocal Agreement Existence Audit (s. 205(b))
  if (!hasFormalWrittenReciprocalAgreement) {
    statutoryViolations.push({
      rule: 'NO_FORMAL_RECIPROCAL_AGREEMENT',
      statute: 'IRPR s. 205(b) - Reciprocal Employment Guidelines',
      finding: 'No formal written bilateral agreement exists between the Canadian and foreign institutions establishing reciprocal exchange.'
    });
    actionableRemedies.push({
      action: 'EXECUTE_BILATERAL_EXCHANGE_MEMORANDUM',
      remedyDescription: 'Execute a formal Memorandum of Understanding (MOU) specifying mutual reciprocal employment provisions.'
    });
  }

  // 2. Substantive Reciprocity for Canadians
  if (!canadiansEnjoySimilarOpportunitiesAbroad) {
    statutoryViolations.push({
      rule: 'ABSENCE_OF_SIMILAR_OPPORTUNITIES_FOR_CANADIANS',
      statute: 'IRPR s. 205(b)',
      finding: 'Canadian citizens or permanent residents do not enjoy reciprocal employment opportunities of similar nature and duration in the partner jurisdiction.'
    });
    actionableRemedies.push({
      action: 'ESTABLISH_EQUAL_FOREIGN_ACCESS',
      remedyDescription: 'Ensure partner country visa authorities grant equivalent reciprocal work authorization to Canadian nationals.'
    });
  }

  // 3. One-Way Distortion vs Exchange Parity
  const exchangeRatio = incoming > 0 ? Number((outgoing / incoming).toFixed(2)) : 0;
  if (incoming > 0 && outgoing === 0) {
    riskWarnings.push({
      warningType: 'ONE_WAY_EXCHANGE_IMBALANCE',
      description: `Foreign workers (${incoming}) are being brought to Canada with zero Canadians (${outgoing}) placed abroad. IRCC officers scrutinize one-way flows for reciprocity bad faith.`
    });
  } else if (!isExchangeGeneralParityMaintained || (incoming >= 4 && exchangeRatio < 0.5)) {
    riskWarnings.push({
      warningType: 'DISPROPORTIONATE_EXCHANGE_VOLUME',
      description: `Incoming workers substantially exceed outgoing Canadians (${incoming} in vs ${outgoing} out). True reciprocity requires rough parity over 2-3 year cycles.`
    });
  }

  // 4. Job Offer Full-Time Status
  if (!isJobOfferFullTime) {
    statutoryViolations.push({
      rule: 'PART_TIME_OFFER_INELIGIBLE_FOR_C20',
      statute: 'IRPR s. 205(b)',
      finding: 'Reciprocal employment work permits require full-time employment (minimum 30 hours per week).'
    });
  }

  // 5. Employer Compliance Fee
  if (!employerComplianceFeePaid) {
    statutoryViolations.push({
      rule: 'EMPLOYER_COMPLIANCE_FEE_UNPAID',
      statute: 'IRPR ss. 209.11, 303.1',
      finding: 'The $230 employer compliance fee has not been submitted through the IRCC Employer Portal.'
    });
    actionableRemedies.push({
      action: 'SUBMIT_EMPLOYER_PORTAL_OFFER',
      remedyDescription: 'Employer must log into the IRCC Employer Portal, submit offer under exemption C20, and pay $230 fee.'
    });
  }

  let eligibilityVerdict = 'ELIGIBLE_FOR_C20_RECIPROCAL_WORK_PERMIT';
  let isEligible = true;

  if (statutoryViolations.length > 0) {
    isEligible = false;
    if (!hasFormalWrittenReciprocalAgreement) {
      eligibilityVerdict = 'INELIGIBLE_NO_RECIPROCAL_AGREEMENT';
    } else if (!canadiansEnjoySimilarOpportunitiesAbroad) {
      eligibilityVerdict = 'INELIGIBLE_LACKS_RECIPROCITY_FOR_CANADIANS';
    } else {
      eligibilityVerdict = 'INELIGIBLE_STATUTORY_REQUIREMENTS_NOT_MET';
    }
  }

  return {
    workerName: cleanWorkerName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    lmiaExemptionCode: FEDERAL_C20_CONSTANTS.EXEMPTION_CODE,
    exchangeCategory: cleanCategory,
    isEligible,
    eligibilityVerdict,
    reciprocityMetrics: {
      canadiansExchangedOutCount: outgoing,
      foreignWorkersIncomingCount: incoming,
      exchangeRatio,
      hasFormalBilateralMou: hasFormalWrittenReciprocalAgreement,
      isParityMaintained: isExchangeGeneralParityMaintained
    },
    statutoryFees: {
      employerComplianceFeeCad: FEDERAL_C20_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD,
      workPermitFeeCad: FEDERAL_C20_CONSTANTS.WORK_PERMIT_PROCESSING_FEE_CAD
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, s. 205(b)',
      'IRCC Operational Instructions: International Mobility Program - Reciprocal Employment [C20]',
      'General Agreement on Trade in Services (GATS), Mode 4'
    ]
  };
}
