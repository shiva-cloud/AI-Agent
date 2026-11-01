/**
 * Federal Temporary Residence Dual Intent (IRPA s. 22(2)) Navigator
 *
 * Audits dual intent lawfulness, Express Entry/PNP PR application coexistence,
 * temporary departure compliance under IRPR s. 179(b), and Federal Court jurisprudence
 * (Castillo v. Canada; Chaudhry v. Canada).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText } from './text-input.js';

export const DUAL_INTENT_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Immigration and Refugee Protection Act, S.C. 2001, c. 27, s. 22(2)',
  REGULATORY_COMPLIANCE_STANDARD: 'IRPR ss. 179(b), 200(1)(b), 216(1)(b)',
  STATUTORY_RULE: 'Intention to seek permanent residence does not preclude temporary resident status'
});

/**
 * Audits dual intent validity, home ties, compliance record, and officer refusal risk.
 *
 * @param {Object} params
 * @param {string} [params.temporaryApplicationType='WORK_PERMIT'] - 'WORK_PERMIT', 'STUDY_PERMIT', 'VISITOR_VISA'
 * @param {boolean} [params.hasActivePrApplicationOrProfile=true] - Active Express Entry, PNP nomination, or Spousal Sponsorship
 * @param {string} [params.prApplicationStream='EXPRESS_ENTRY_CEC'] - 'EXPRESS_ENTRY_CEC', 'PNP_NOMINEE', 'SPOUSAL_SPONSORSHIP', 'QUEBEC_ARRIMA', 'NONE'
 * @param {boolean} [params.demonstratedIntentToRespectStayExpiry=true] - Acknowledges legal obligation to depart if temporary status expires
 * @param {boolean} [params.hasTiesToCountryOfCitizenshipOrResidence=true] - Property, family, financial, or employment ties outside Canada
 * @param {boolean} [params.hasPreviousImmigrationComplianceRecord=true] - History of respecting visa conditions, no overstays or unauthorized work
 * @param {boolean} [params.hasSufficientSettlementFunds=true] - Liquid funds sufficient for initial temporary stay
 * @param {boolean} [params.officerRefusalBasedSolelyOnPrIntent=false] - Officer notes show refusal based strictly on immigrant intent
 * @returns {Object} Comprehensive dual intent assessment, risk tier, and judicial review remedies
 */
export function evaluateDualIntentCompliance(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    temporaryApplicationType = 'WORK_PERMIT',
    hasActivePrApplicationOrProfile = true,
    prApplicationStream = 'EXPRESS_ENTRY_CEC',
    demonstratedIntentToRespectStayExpiry = true,
    hasTiesToCountryOfCitizenshipOrResidence = true,
    hasPreviousImmigrationComplianceRecord = true,
    hasSufficientSettlementFunds = true,
    officerRefusalBasedSolelyOnPrIntent = false
  } = safeParams;
  const safeTempType = boundedText(temporaryApplicationType, 'WORK_PERMIT', 50).toUpperCase();
  const safePrStream = boundedText(prApplicationStream, 'EXPRESS_ENTRY_CEC', 50).toUpperCase();
  const activePr = Boolean(hasActivePrApplicationOrProfile);
  const intentToRespect = demonstratedIntentToRespectStayExpiry !== false;
  const tiesToHome = hasTiesToCountryOfCitizenshipOrResidence !== false;
  const complianceRecord = hasPreviousImmigrationComplianceRecord !== false;
  const settlementFunds = hasSufficientSettlementFunds !== false;
  const unlawfulRefusal = Boolean(officerRefusalBasedSolelyOnPrIntent);

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Dual Intent Legitimacy (IRPA s. 22(2))
  const isDualIntentStatutorilyProtected = true; // Always protected by s. 22(2)

  // 2. Unlawful Officer Refusal solely on PR Intent (Federal Court precedent)
  if (unlawfulRefusal) {
    statutoryViolations.push({
      rule: 'UNLAWFUL_OFFICER_FETTERING_ON_DUAL_INTENT',
      statute: 'Immigration and Refugee Protection Act s. 22(2)',
      finding: 'Visa officer refused application solely on the basis of applicant having permanent resident intent, in direct breach of IRPA s. 22(2).'
    });
    actionableRemedies.push({
      action: 'FILE_FEDERAL_COURT_LEAVE_APPLICATION',
      remedyDescription: 'File Application for Leave and Judicial Review at the Federal Court of Canada; refusal based solely on PR intent constitutes an error of law.'
    });
    actionableRemedies.push({
      action: 'SUBMIT_RECONSIDERATION_REQUEST_WITH_S22_CITATIONS',
      remedyDescription: 'Submit immediate reconsideration request citing IRPA s. 22(2) and Program Delivery Instructions on Dual Intent.'
    });
  }

  // 3. Temporary Intent Evaluation (IRPR s. 179(b) / 200(1)(b))
  let dualIntentRiskScore = 0; // Lower is safer

  if (!intentToRespect) {
    dualIntentRiskScore += 40;
    riskWarnings.push({
      warningType: 'UNCLEAR_TEMPORARY_DEPARTURE_UNDERTAKING',
      description: 'Applicant must clearly articulate that while permanent residence is desired, they will respect temporary visa conditions and depart Canada if PR is not finalized.'
    });
    actionableRemedies.push({
      action: 'INCLUDE_AFFIDAVIT_OF_DUAL_INTENT',
      remedyDescription: 'Provide a sworn statement confirming understanding of dual intent and agreeing to leave upon lawful status expiry.'
    });
  }

  if (!tiesToHome) {
    dualIntentRiskScore += 30;
    riskWarnings.push({
      warningType: 'WEAK_HOME_COUNTRY_TIES',
      description: 'Lack of tangible ties (family, property, bank accounts) outside Canada increases refusal risk under IRPR s. 179(b).'
    });
    actionableRemedies.push({
      action: 'DOCUMENT_HOME_COUNTRY_ASSETS_AND_FAMILY',
      remedyDescription: 'Submit property deeds, family records, continuing foreign bank assets, or employment leave letters.'
    });
  }

  if (!complianceRecord) {
    dualIntentRiskScore += 30;
    riskWarnings.push({
      warningType: 'ADVERSE_IMMIGRATION_HISTORY',
      description: 'Past overstays, refusals, or unauthorized work undermine officer confidence in temporary compliance.'
    });
  }

  if (!settlementFunds) {
    dualIntentRiskScore += 20;
    riskWarnings.push({
      warningType: 'INSUFFICIENT_FINANCIAL_RESOURCES',
      description: 'Financial insufficiency heightens concern that applicant may work without authorization.'
    });
  }

  let riskTier = 'LOW_REFUSAL_RISK';
  if (dualIntentRiskScore >= 50) riskTier = 'HIGH_REFUSAL_RISK';
  else if (dualIntentRiskScore >= 25) riskTier = 'MODERATE_REFUSAL_RISK';

  let complianceStatus = unlawfulRefusal
    ? 'UNLAWFUL_REFUSAL_CONTRARY_TO_SECTION_22'
    : 'COMPLIANT_DUAL_INTENT_STRUCTURE';

  let legalVerdict = unlawfulRefusal
    ? 'Refusal is legally defective under IRPA s. 22(2). Dual intent is statutorily permitted.'
    : `Dual intent is lawful under IRPA s. 22(2). Candidate profile has a ${riskTier} assessment for temporary resident processing.`;

  return {
    jurisdiction: 'FEDERAL_CANADA',
    temporaryApplicationType: safeTempType,
    hasActivePrApplicationOrProfile: activePr,
    prApplicationStream: safePrStream,
    isDualIntentStatutorilyProtected,
    riskTier,
    dualIntentRiskScore,
    complianceStatus,
    legalVerdict,
    credibilityFactors: {
      hasDemonstratedIntentToDepart: intentToRespect,
      hasDocumentedHomeTies: tiesToHome,
      hasCleanImmigrationHistory: complianceRecord,
      hasSufficientFunds: settlementFunds
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Act, S.C. 2001, c. 27, s. 22(2)',
      'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 179(b), 200(1)(b)',
      'IRCC Program Delivery Instructions: Dual Intent (April 2023)',
      'Federal Court Precedent: Castillo v. Canada, 2017 FC 486'
    ]
  };
}
