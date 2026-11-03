/**
 * Federal Bridging Open Work Permit (BOWP - Code A75) Navigator
 *
 * Audits eligibility for a Bridging Open Work Permit under IRPR s. 207,
 * including valid in-Canada work authorization, 4-month (120-day) expiry window,
 * permanent residence application streams (Express Entry, PNP, Quebec CSQ, Agri-Food),
 * Section 10 completeness Acknowledgement of Receipt (AOR), and PNP restriction checks.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FEDERAL_BOWP_CONSTANTS = Object.freeze({
  EXEMPTION_CODE: 'A75',
  PROGRAM_NAME: 'Bridging Open Work Permit (BOWP)',
  MAX_DAYS_UNTIL_EXPIRY: 120, // 4 months
  ELIGIBLE_PR_STREAMS: Object.freeze([
    'EXPRESS_ENTRY_FSW',
    'EXPRESS_ENTRY_CEC',
    'EXPRESS_ENTRY_FST',
    'EXPRESS_ENTRY_PNP',
    'NON_EXPRESS_ENTRY_PNP',
    'QUEBEC_SKILLED_WORKER_CSQ',
    'AGRI_FOOD_PILOT'
  ]),
  STATUTORY_AUTHORITY: 'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 10, 207'
});

/**
 * Audits eligibility for an open work permit under the BOWP stream.
 *
 * @param {Object} params
 * @param {boolean} [params.isCurrentlyInCanada=true] - Applicant must physically reside in Canada
 * @param {boolean} [params.hasValidWorkAuthorization=true] - Holds valid work permit or maintained status under s. 186(u)
 * @param {number} [params.daysUntilCurrentPermitExpires=60] - Days remaining on current work permit
 * @param {string} [params.prApplicationStream='EXPRESS_ENTRY_CEC'] - Qualifying economic permanent residence stream
 * @param {boolean} [params.hasReceivedOfficialAor=true] - Received s. 10 completeness Acknowledgement of Receipt
 * @param {boolean} [params.pnpHasEmploymentRestrictions=false] - For PNP streams, whether nomination specifies employer restrictions
 * @param {boolean} [params.hasPendingInadmissibilityProceedings=false] - Section 44 report or removal order pending
 * @returns {Object} Comprehensive BOWP eligibility audit and diagnostic assessment
 */
export function evaluateFederalBridgingOpenWorkPermit(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    assessmentDate = todayIso(),
    isCurrentlyInCanada = true,
    hasValidWorkAuthorization = true,
    daysUntilCurrentPermitExpires = 60,
    prApplicationStream = 'EXPRESS_ENTRY_CEC',
    hasReceivedOfficialAor = true,
    pnpHasEmploymentRestrictions = false,
    hasPendingInadmissibilityProceedings = false
  } = safeParams;

  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const daysExpiry = Number.isFinite(Number(daysUntilCurrentPermitExpires)) ? Math.max(-3650, Math.min(36500, Math.round(Number(daysUntilCurrentPermitExpires)))) : 60;
  const stream = boundedText(prApplicationStream, 'EXPRESS_ENTRY_CEC', 60).toUpperCase();

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Physical Presence & Status (IRPR s. 207)
  if (!isCurrentlyInCanada) {
    statutoryViolations.push({
      rule: 'MUST_BE_PHYSICALLY_PRESENT_IN_CANADA',
      statute: 'IRPR s. 207 Policy Instructions',
      finding: 'BOWP cannot be applied for from outside Canada. Applicant must reside in Canada at the time of application.'
    });
    actionableRemedies.push({
      action: 'ENTER_CANADA_OR_APPLY_EMPLOYER_SPECIFIC',
      remedyDescription: 'If outside Canada, applicant cannot use BOWP. Pursue standard employer-specific LMIA or ICT stream.'
    });
  }

  if (!hasValidWorkAuthorization) {
    statutoryViolations.push({
      rule: 'NO_VALID_WORK_AUTHORIZATION_OR_MAINTAINED_STATUS',
      statute: 'IRPR ss. 186(u), 207',
      finding: 'Applicant must hold a valid work permit or be on maintained status having applied to extend their work permit prior to expiry.'
    });
    actionableRemedies.push({
      action: 'APPLY_STATUS_RESTORATION_WITH_BOWP',
      remedyDescription: 'If within 90 days of work permit expiry, apply concurrently for restoration under IRPR s. 182 and BOWP.'
    });
  }

  // 2. Expiry Timeline (Within 4 months / 120 days)
  if (daysExpiry > FEDERAL_BOWP_CONSTANTS.MAX_DAYS_UNTIL_EXPIRY) {
    statutoryViolations.push({
      rule: 'PREMATURE_BOWP_APPLICATION',
      statute: 'IRCC BOWP Operational Guidelines',
      finding: `Current permit expires in ${daysExpiry} days. BOWP applications submitted more than 120 days prior to expiry will be refused.`
    });
    actionableRemedies.push({
      action: 'CALENDAR_APPLICATION_WITHIN_120_DAYS',
      remedyDescription: `Wait until current permit is within 120 days of expiry before submitting the BOWP application.`
    });
  }

  // 3. PR Stream and AOR Audit (IRPR s. 10)
  const isRecognizedStream = FEDERAL_BOWP_CONSTANTS.ELIGIBLE_PR_STREAMS.includes(stream);
  if (!isRecognizedStream) {
    statutoryViolations.push({
      rule: 'INELIGIBLE_PR_CLASS_FOR_BOWP',
      statute: 'IRPR s. 207',
      finding: `Stream '${stream}' is not an authorized economic permanent residence program for BOWP issuance.`
    });
  }

  if (!hasReceivedOfficialAor) {
    statutoryViolations.push({
      rule: 'MISSING_SECTION_10_COMPLETENESS_AOR',
      statute: 'IRPR ss. 10, 207',
      finding: 'IRCC requires an official Acknowledgement of Receipt (AOR) letter confirming application completeness before issuing BOWP.'
    });
    actionableRemedies.push({
      action: 'AWAIT_OFFICIAL_AOR_LETTER',
      remedyDescription: 'Check IRCC Online Portal for the formal "Acknowledgement of Receipt - Completeness Check Passed" document.'
    });
  }

  // 4. PNP Restrictions Check
  if (stream.includes('PNP') && pnpHasEmploymentRestrictions) {
    statutoryViolations.push({
      rule: 'PNP_NOMINATION_HAS_EMPLOYMENT_RESTRICTIONS',
      statute: 'IRPR s. 207 Exemption Code T13 vs A75',
      finding: 'If the provincial nomination indicates employment restrictions (specific employer only), applicant is ineligible for BOWP and must apply under employer-specific code T13.'
    });
    actionableRemedies.push({
      action: 'APPLY_FOR_T13_RESTRICTED_WORK_PERMIT',
      remedyDescription: 'Submit application under LMIA-exemption code T13 (Employer-Specific Provincial Nominee) with employer compliance fee.'
    });
  }

  // 5. Inadmissibility Proceedings
  if (hasPendingInadmissibilityProceedings) {
    statutoryViolations.push({
      rule: 'PENDING_INADMISSIBILITY_ENFORCEMENT',
      statute: 'IRPA ss. 44, 48',
      finding: 'Applicant is subject to pending enforcement proceedings or an unenforceable removal order.'
    });
  }

  const isEligible = statutoryViolations.length === 0;
  let eligibilityVerdict = 'ELIGIBLE_FOR_BRIDGING_OPEN_WORK_PERMIT';
  let legalVerdict = 'Applicant qualifies for open work permit under IRPR s. 207 (Code A75). Maintained work authorization applies upon submission.';

  if (!isEligible) {
    eligibilityVerdict = 'INELIGIBLE_FOR_BOWP';
    legalVerdict = `Candidate does not currently qualify for BOWP due to ${statutoryViolations.length} statutory defect${statutoryViolations.length === 1 ? '' : 's'}. Review necessary conditions before submitting.`;
  }

  return {
    jurisdiction: 'FEDERAL_CANADA',
    applicantName: cleanApplicantName,
    assessmentDate: cleanAssessmentDate,
    exemptionCode: FEDERAL_BOWP_CONSTANTS.EXEMPTION_CODE,
    programName: FEDERAL_BOWP_CONSTANTS.PROGRAM_NAME,
    prApplicationStream: stream,
    daysUntilCurrentPermitExpires: daysExpiry,
    isEligible,
    eligibilityVerdict,
    legalVerdict,
    workPermitDetails: {
      permitType: 'OPEN_WORK_PERMIT',
      employerSpecific: false,
      lmiaExempt: true,
      spousalOpenWorkPermitAvailable: true
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 10, 186(u), 207',
      'IRCC Operational Instructions: International Mobility Program - Bridging Open Work Permit (Code A75)'
    ]
  };
}