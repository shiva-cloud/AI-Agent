/**
 * Federal Start-Up Visa (SUV) Peer Review & Due Diligence Navigator
 *
 * Audits qualifying business ownership thresholds (minimum 10% per founder, combined 50%+ control),
 * designated entity commitment certificates (VC $200k, Angel $75k, Incubator acceptance),
 * active management mandates, and IRPR s. 98.10 Peer Review panel risk evaluations.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FEDERAL_SUV_CONSTANTS = Object.freeze({
  PROGRAM_NAME: 'Start-Up Business Class (SUV)',
  MIN_FOUNDER_VOTING_RIGHTS_PERCENT: 10.0, // s. 98.03(1)(a)
  MIN_COMBINED_VOTING_RIGHTS_PERCENT: 50.0, // s. 98.03(1)(b)
  MAX_FOUNDERS_PER_STARTUP: 5,
  MIN_VC_INVESTMENT_CAD: 200000,
  MIN_ANGEL_INVESTMENT_CAD: 75000,
  SUPPORTED_ENTITY_TYPES: Object.freeze(['VENTURE_CAPITAL_FUND', 'ANGEL_INVESTOR_GROUP', 'BUSINESS_INCUBATOR']),
  STATUTORY_AUTHORITY: 'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 98.01-98.13'
});

/**
 * Audits SUV qualifying business equity, commitment certificates, and peer review risk triggers.
 *
 * @param {Object} params
 * @param {string} [params.designatedEntityType='BUSINESS_INCUBATOR'] - 'VENTURE_CAPITAL_FUND', 'ANGEL_INVESTOR_GROUP', 'BUSINESS_INCUBATOR'
 * @param {number} [params.securedInvestmentAmountCad=0] - Capital committed by designated VC/Angel in CAD
 * @param {boolean} [params.hasOfficialLetterOfSupport=true] - Received valid Letter of Support from designated entity
 * @param {number} [params.applicantVotingRightsPercentage=20] - Percentage of voting rights held by this applicant
 * @param {number} [params.totalFoundersAndEntityVotingPercentage=60] - Combined voting rights of all founders + entity
 * @param {number} [params.totalFoundersCount=3] - Total number of co-founders applying for PR
 * @param {boolean} [params.hasActiveOngoingManagementRole=true] - Applicant actively manages business within Canada
 * @param {boolean} [params.businessIncorporatedInCanada=true] - Incorporated and carrying on business in Canada
 * @param {boolean} [params.peerReviewRequestedByOfficer=false] - Officer ordered independent peer review panel under s. 98.10
 * @returns {Object} Comprehensive SUV eligibility audit and peer review evaluation
 */
export function evaluateFederalSuvPeerReview(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    founderName = 'Founder',
    assessmentDate = todayIso(),
    designatedEntityType = 'BUSINESS_INCUBATOR',
    securedInvestmentAmountCad = 0,
    hasOfficialLetterOfSupport = true,
    applicantVotingRightsPercentage = 20,
    totalFoundersAndEntityVotingPercentage = 60,
    totalFoundersCount = 3,
    hasActiveOngoingManagementRole = true,
    businessIncorporatedInCanada = true,
    peerReviewRequestedByOfficer = false,
    ventureName = 'Start-Up Venture',
    designatedEntityName = 'Designated Entity'
  } = safeParams;
  const cleanFounder = boundedText(founderName, 'Founder', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanVenture = boundedText(ventureName, 'Start-Up Venture');
  const cleanEntity = boundedText(designatedEntityName, 'Designated Entity');
  const entityType = String(designatedEntityType || '').trim().toUpperCase();
  const investment = Number.isFinite(Number(securedInvestmentAmountCad)) ? Math.max(0, Number(securedInvestmentAmountCad)) : 0;
  const applicantEquity = Number.isFinite(Number(applicantVotingRightsPercentage)) ? Math.max(0, Math.min(100, Number(applicantVotingRightsPercentage))) : 0;
  const combinedEquity = Number.isFinite(Number(totalFoundersAndEntityVotingPercentage)) ? Math.max(0, Math.min(100, Number(totalFoundersAndEntityVotingPercentage))) : 0;
  const foundersCount = Number.isFinite(Number(totalFoundersCount)) ? Math.max(1, Math.min(5, Math.floor(Number(totalFoundersCount)))) : 1;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Voting Rights & Ownership Audit (s. 98.03(1))
  if (applicantEquity < FEDERAL_SUV_CONSTANTS.MIN_FOUNDER_VOTING_RIGHTS_PERCENT) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_FOUNDER_EQUITY_UNDER_10_PERCENT',
      statute: 'IRPR s. 98.03(1)(a)',
      finding: `Applicant holds ${applicantEquity}% voting rights. Each founder must hold at least 10% of total voting shares.`
    });
    actionableRemedies.push({
      action: 'RESTRUCTURE_SHAREHOLDING_CAP_TABLE',
      remedyDescription: 'Amend corporate articles to ensure applicant holds at least 10.0% of all issued and outstanding voting shares.'
    });
  }

  if (combinedEquity <= FEDERAL_SUV_CONSTANTS.MIN_COMBINED_VOTING_RIGHTS_PERCENT) {
    statutoryViolations.push({
      rule: 'COMBINED_CONTROL_NOT_EXCEEDING_50_PERCENT',
      statute: 'IRPR s. 98.03(1)(b)',
      finding: `Combined voting rights are ${combinedEquity}%. Founders and the designated entity must jointly control MORE than 50% of the voting shares.`
    });
  }

  if (foundersCount > FEDERAL_SUV_CONSTANTS.MAX_FOUNDERS_PER_STARTUP) {
    statutoryViolations.push({
      rule: 'EXCEEDED_MAXIMUM_5_FOUNDERS',
      statute: 'IRPR s. 98.03(2)',
      finding: `Application includes ${foundersCount} co-founders. A maximum of 5 applicants can be identified as essential owners per startup.`
    });
  }

  // 2. Designated Entity Support Audit
  if (!hasOfficialLetterOfSupport) {
    statutoryViolations.push({
      rule: 'MISSING_OFFICIAL_LETTER_OF_SUPPORT',
      statute: 'IRPR s. 98.04',
      finding: 'A valid Letter of Support and matching Commitment Certificate sent directly to IRCC by the designated entity is mandatory.'
    });
  }

  if (entityType === 'VENTURE_CAPITAL_FUND' && investment < FEDERAL_SUV_CONSTANTS.MIN_VC_INVESTMENT_CAD) {
    statutoryViolations.push({
      rule: 'SUBSTANDARD_VC_INVESTMENT_AMOUNT',
      statute: 'IRPR s. 98.03(1)(c)(i)',
      finding: `VC commitment is $${investment.toLocaleString()} CAD. Minimum required investment from designated venture capital fund is $200,000 CAD.`
    });
  }

  if (entityType === 'ANGEL_INVESTOR_GROUP' && investment < FEDERAL_SUV_CONSTANTS.MIN_ANGEL_INVESTMENT_CAD) {
    statutoryViolations.push({
      rule: 'SUBSTANDARD_ANGEL_INVESTMENT_AMOUNT',
      statute: 'IRPR s. 98.03(1)(c)(ii)',
      finding: `Angel commitment is $${investment.toLocaleString()} CAD. Minimum required investment from designated angel investor group is $75,000 CAD.`
    });
  }

  // 3. Active Management & Incorporation (s. 98.06)
  if (!hasActiveOngoingManagementRole) {
    statutoryViolations.push({
      rule: 'LACK_OF_ACTIVE_ONGOING_MANAGEMENT',
      statute: 'IRPR s. 98.06',
      finding: 'Passive investors are statutorily barred. Founders must provide active, ongoing management of the business from within Canada.'
    });
  }

  if (!businessIncorporatedInCanada) {
    riskWarnings.push({
      warningType: 'CANADIAN_INCORPORATION_PENDING',
      description: 'The business must be incorporated in Canada and an essential part of operations conducted in Canada before permanent residence is granted.'
    });
  }

  // 4. Peer Review Process (s. 98.10)
  if (peerReviewRequestedByOfficer) {
    riskWarnings.push({
      warningType: 'PEER_REVIEW_PANEL_TRIGGERED',
      description: 'Immigration officer requested an independent Peer Review under s. 98.10. Panel will scrutinize due diligence, IP ownership, and market viability.'
    });
    actionableRemedies.push({
      action: 'PREPARE_PEER_REVIEW_DEFENSE_DOSSIER',
      remedyDescription: 'Compile comprehensive documentation including technical IP audits, market validation, capitalization tables, and founder timesheets.'
    });
  }

  const isEligible = statutoryViolations.length === 0;
  let eligibilityVerdict = 'ELIGIBLE_FOR_START_UP_VISA';
  let legalVerdict = 'Qualifying business meets IRPR ss. 98.01–98.13 ownership and commitment certificate requirements.';

  if (!isEligible) {
    eligibilityVerdict = 'INELIGIBLE_FOR_SUV_STREAM';
    legalVerdict = `Start-up business fails statutory SUV requirements due to ${statutoryViolations.length} infraction${statutoryViolations.length === 1 ? '' : 's'}. Rectify share structure or entity commitment.`;
  }

  return {
    founderName: cleanFounder,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    ventureName: cleanVenture,
    designatedEntityName: cleanEntity,
    designatedEntityType: entityType,
    applicantVotingRightsPercentage: applicantEquity,
    totalFoundersAndEntityVotingPercentage: combinedEquity,
    totalFoundersCount: foundersCount,
    isEligible,
    eligibilityVerdict,
    legalVerdict,
    dueDiligenceSummary: {
      hasValidSupportLetter: hasOfficialLetterOfSupport,
      capitalInvestedCad: investment,
      activeManagementConfirmed: hasActiveOngoingManagementRole,
      peerReviewTriggered: peerReviewRequestedByOfficer
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 98.01-98.13 (Start-Up Business Class)',
      'IRPR s. 98.10 (Peer Review process by industry associations NACO / CVCA)'
    ]
  };
}