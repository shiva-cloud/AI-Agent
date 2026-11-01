/**
 * British Columbia Residential Tenancy Dispute Resolution Urgency & Expedited Hearing Navigator
 *
 * Audits qualifying grounds for RTB Expedited Hearings under BC RTA ss. 33, 54, 56, 56.1,
 * comparing 12-to-14-day emergency hearing schedules against standard 4-to-6-month dispute queues,
 * strict 1-day evidence service rules (RTB Rule 10), and immediate possession/lockout remedies.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_RTB_EXPEDITED_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Residential Tenancy Act, SBC 2002, c. 78, ss. 33, 54, 56, 56.1; RTB Rule 10',
  EXPEDITED_SCHEDULING_DAYS_MAX: 14,
  STANDARD_SCHEDULING_MONTHS_TYPICAL: 4,
  MANDATORY_EVIDENCE_SERVICE_DAYS: 1, // Rule 10.3
  EXPEDITED_GROUNDS: Object.freeze([
    'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION', // s. 54
    'EMERGENCY_REPAIRS_VITAL_SERVICES', // s. 33
    'EARLY_TERMINATION_IMMINENT_SAFETY_DANGER', // s. 56
    'TENANT_ENDING_TENANCY_FOR_VIOLENCE' // s. 56.1
  ])
});

/**
 * Audits dispute claims to determine eligibility for the RTB expedited hearing track.
 *
 * @param {Object} params
 * @param {string} [params.disputeCategory='TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION'] - Core dispute issue
 * @param {boolean} [params.vitalServiceOrStructuralDanger=true] - Major water leak, heat outage, or unsafe building
 * @param {boolean} [params.locksChangedWithoutOrder=false] - Landlord locked tenant out without writ of possession
 * @param {boolean} [params.violenceOrImminentThreatDemonstrated=false] - Police reports or physical safety hazards
 * @param {boolean} [params.isMonetaryClaimOnly=false] - Application only seeks financial damages
 * @param {boolean} [params.readyToServeEvidenceWithinOneDay=true] - Able to meet RTB Rule 10.3 1-day service rule
 * @returns {Object} Comprehensive RTB hearing track determination and procedural roadmap
 */
export function evaluateBcRtbDisputeTrack(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    tenantName = 'Tenant',
    disputeCategory = 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION',
    vitalServiceOrStructuralDanger = true,
    locksChangedWithoutOrder = false,
    violenceOrImminentThreatDemonstrated = false,
    isMonetaryClaimOnly = false,
    readyToServeEvidenceWithinOneDay = true,
    landlordName = 'Landlord',
    rentalAddress = 'Rental Property',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const cleanTenantName = boundedText(tenantName, 'Tenant', 100);
  const cleanLandlord = boundedText(landlordName, 'Landlord');
  const cleanRentalAddress = boundedText(rentalAddress, 'Rental Property');
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const category = boundedText(disputeCategory, 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION', 60).toUpperCase();

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Expedited Track Qualification Audit
  let qualifiesForExpeditedTrack = false;
  let expeditedGroundIdentified = '';

  if (locksChangedWithoutOrder || category === 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION') {
    qualifiesForExpeditedTrack = true;
    expeditedGroundIdentified = 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION';
    actionableRemedies.push({
      action: 'FILE_EXPEDITED_FORM_RTB_51_LOCKOUT',
      remedyDescription: 'File an emergency application for an Order of Possession under s. 54. Hearing scheduled in 12–14 days.'
    });
  } else if (vitalServiceOrStructuralDanger || category === 'EMERGENCY_REPAIRS_VITAL_SERVICES') {
    qualifiesForExpeditedTrack = true;
    expeditedGroundIdentified = 'EMERGENCY_REPAIRS_VITAL_SERVICES';
    actionableRemedies.push({
      action: 'FILE_EXPEDITED_EMERGENCY_REPAIR_APPLICATION',
      remedyDescription: 'Apply under s. 33 for emergency repairs order. Arbitrator may authorize tenant to make repairs and deduct from rent.'
    });
  } else if (violenceOrImminentThreatDemonstrated || category === 'EARLY_TERMINATION_IMMINENT_SAFETY_DANGER') {
    qualifiesForExpeditedTrack = true;
    expeditedGroundIdentified = 'EARLY_TERMINATION_IMMINENT_SAFETY_DANGER';
    actionableRemedies.push({
      action: 'FILE_SECTION_56_EARLY_TERMINATION_FOR_DANGER',
      remedyDescription: 'Apply under s. 56 to terminate tenancy early without notice due to severe threat to safety or property.'
    });
  }

  // Pure monetary claims cannot use expedited track
  if (isMonetaryClaimOnly) {
    qualifiesForExpeditedTrack = false;
    riskWarnings.push({
      warningType: 'MONETARY_CLAIMS_INELIGIBLE_FOR_EXPEDITED_TRACK',
      description: 'The RTB will not accept expedited applications for compensation or deposit returns alone. These must proceed through the standard dispute queue.'
    });
  }

  // 2. Evidence Service Compliance (Rule 10.3)
  if (qualifiesForExpeditedTrack && !readyToServeEvidenceWithinOneDay) {
    riskWarnings.push({
      warningType: 'STRICT_ONE_DAY_SERVICE_DEADLINE_RISK',
      description: 'Under RTB Rule 10.3, applicant must serve the Notice of Dispute Resolution and all evidence on the respondent within 1 calendar day of receipt. Failure results in dismissal or adjournment.'
    });
  }

  let hearingTrack = qualifiesForExpeditedTrack ? 'EXPEDITED_HEARING_TRACK' : 'STANDARD_DISPUTE_TRACK';
  let estimatedWaitDays = qualifiesForExpeditedTrack ? 14 : 120;
  let legalVerdict = qualifiesForExpeditedTrack
    ? `Dispute qualifies for RTB Expedited Hearing under Rule 10 (${expeditedGroundIdentified}). Expected hearing within 12–14 days.`
    : 'Dispute does not meet emergency criteria. Proceed via standard RTB dispute resolution queue (~3–5 month wait time).';

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    tenantName: cleanTenantName,
    landlordName: cleanLandlord,
    assessmentDate: cleanAssessmentDate,
    rentalAddress: cleanRentalAddress,
    disputeCategory: category,
    qualifiesForExpeditedTrack,
    hearingTrack,
    estimatedWaitDays,
    legalVerdict,
    proceduralRoadmap: {
      expeditedGroundIdentified: expeditedGroundIdentified || 'NONE',
      evidenceServiceDeadlineDays: qualifiesForExpeditedTrack ? 1 : 14,
      filingFeeCad: 100,
      feeWaiverAvailable: true
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancy Act, SBC 2002, c. 78, ss. 33 (Emergency repairs), 54 (Order of possession for tenant), 56 (Early end for danger)',
      'RTB Rules of Procedure, Rule 10 (Expedited Hearings)'
    ]
  };
}