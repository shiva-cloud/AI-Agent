/**
 * British Columbia Landlord-Use Eviction & 12-Month Penalty Navigator
 *
 * Evaluates landlord personal use evictions under the BC Residential Tenancy Act,
 * SBC 2002, c. 78, ss. 49, 51, and the 2024 Bill 14 amendments (4-month notice,
 * 30-day dispute window, mandatory web portal, and 12-month rent penalty).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const BC_LANDLORD_USE_CONSTANTS = Object.freeze({
  MANDATORY_NOTICE_PERIOD_MONTHS: 4, // Bill 14 (formerly 2 months)
  TENANT_DISPUTE_DEADLINE_DAYS: 30, // Bill 14 (formerly 15 days)
  MANDATORY_OCCUPANCY_DURATION_MONTHS: 12, // s. 51(2)
  STATUTORY_COMPENSATION_FREE_RENT_MONTHS: 1, // s. 51(1)
  BAD_FAITH_PENALTY_RENT_MONTHS: 12, // s. 51(2)
  STATUTORY_AUTHORITY: 'Residential Tenancy Act, SBC 2002, c. 78, ss. 49, 51; Bill 14 (2024)'
});

/**
 * Audits BC landlord-use eviction notices, dispute deadlines, compensation, and 12-month bad-faith penalties.
 *
 * @param {Object} params
 * @param {string} [params.actorRole='TENANT'] - 'TENANT', 'LANDLORD'
 * @param {number} [params.monthlyRentCad=2200] - Current authorized monthly rent
 * @param {number} [params.noticeMonthsGiven=4] - Calendar months notice given before effective date
 * @param {number} [params.daysElapsedSinceNoticeServed=10] - Days elapsed since tenant received notice
 * @param {boolean} [params.generatedThroughOfficialWebPortal=true] - Generated via Landlord Use Web Portal
 * @param {string} [params.intendedOccupantRelationship='LANDLORD_OR_SPOUSE'] - 'LANDLORD_OR_SPOUSE', 'CHILD_OR_PARENT', 'PURCHASER', 'SIBLING_OR_OTHER'
 * @param {boolean} [params.landlordFailedToOccupyFor12Months=false] - Landlord re-rented, sold, or vacated unit before 12 months
 * @param {boolean} [params.extenuatingCircumstancesExist=false] - Critical medical emergency or natural disaster prevented 12-month stay
 * @param {boolean} [params.oneMonthFreeRentProvided=true] - Landlord provided 1 month free rent under s. 51(1)
 * @returns {Object} Comprehensive BC landlord use eviction audit and statutory remedies
 */
export function evaluateBcLandlordUseEviction(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    tenantName = 'Tenant',
    landlordName = 'Landlord',
    assessmentDate = todayIso(),
    actorRole = 'TENANT',
    monthlyRentCad = 2200,
    noticeMonthsGiven = 4,
    daysElapsedSinceNoticeServed = 10,
    generatedThroughOfficialWebPortal = true,
    intendedOccupantRelationship = 'LANDLORD_OR_SPOUSE',
    landlordFailedToOccupyFor12Months = false,
    extenuatingCircumstancesExist = false,
    oneMonthFreeRentProvided = true
  } = safeParams;

  const cleanTenantName = boundedText(tenantName, 'Tenant', 100);
  const cleanLandlordName = boundedText(landlordName, 'Landlord', 120);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanActor = boundedText(actorRole, 'TENANT', 20);
  const cleanRelationship = boundedText(intendedOccupantRelationship, 'LANDLORD_OR_SPOUSE', 50);
  const rent = Number.isFinite(Number(monthlyRentCad))
    ? Math.max(0, Math.min(100000, Number(monthlyRentCad)))
    : 0;
  const noticeMonths = Number.isFinite(Number(noticeMonthsGiven))
    ? Math.max(0, Math.min(60, Number(noticeMonthsGiven)))
    : 0;
  const daysElapsed = Number.isFinite(Number(daysElapsedSinceNoticeServed))
    ? Math.max(0, Math.min(3650, Math.floor(Number(daysElapsedSinceNoticeServed))))
    : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Permitted Intended Occupant Audit (s. 49(1))
  // Close family member = landlord's spouse, child, or parent (or spouse's child/parent). NOT siblings, aunts, cousins!
  const isEligibleFamilyMember = ['LANDLORD_OR_SPOUSE', 'CHILD_OR_PARENT', 'PURCHASER'].includes(cleanRelationship);
  if (!isEligibleFamilyMember) {
    statutoryViolations.push({
      rule: 'INELIGIBLE_OCCUPANT_NOT_CLOSE_FAMILY_MEMBER',
      statute: 'Residential Tenancy Act s. 49(1)',
      finding: `Intended occupant (${cleanRelationship}) does not qualify as a "close family member". Only the landlord, spouse, child, or parent qualify under BC law.`
    });
    actionableRemedies.push({
      action: 'FILE_RTB_DISPUTE_INVALID_OCCUPANT',
      remedyDescription: 'File a dispute resolution application with the RTB to cancel the notice for lack of statutory family standing.'
    });
  }

  // 2. 4 Full Calendar Months Notice Audit (Bill 14)
  if (noticeMonths < BC_LANDLORD_USE_CONSTANTS.MANDATORY_NOTICE_PERIOD_MONTHS) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_NOTICE_PERIOD_UNDER_4_MONTHS',
      statute: 'Residential Tenancy Act s. 49(2)(a) (amended 2024)',
      finding: `Notice provided only ${noticeMonths} month${noticeMonths === 1 ? '' : 's'} notice. Bill 14 mandates a minimum of 4 full calendar months notice.`
    });
    actionableRemedies.push({
      action: 'CANCEL_NOTICE_AT_RTB_SHORT_NOTICE',
      remedyDescription: 'Apply to RTB to cancel notice for failure to meet mandatory 4-month notice period.'
    });
  }

  // 3. Mandatory Web Portal Generation Audit
  if (!generatedThroughOfficialWebPortal) {
    statutoryViolations.push({
      rule: 'NOTICE_NOT_GENERATED_VIA_WEB_PORTAL',
      statute: 'Residential Tenancy Act s. 49(2.1)',
      finding: 'Notice was not generated through the provincial Landlord Use Web Portal, rendering the notice invalid by law.'
    });
  }

  // 4. Dispute Deadline Audit (30 days under Bill 14)
  const isWithin30DayDisputeWindow = daysElapsed <= BC_LANDLORD_USE_CONSTANTS.TENANT_DISPUTE_DEADLINE_DAYS;
  const daysRemainingToDispute = Math.max(0, BC_LANDLORD_USE_CONSTANTS.TENANT_DISPUTE_DEADLINE_DAYS - daysElapsed);

  if (isWithin30DayDisputeWindow) {
    riskWarnings.push({
      warningType: 'DISPUTE_WINDOW_ACTIVE',
      description: `Tenant has ${daysRemainingToDispute} day${daysRemainingToDispute === 1 ? '' : 's'} remaining to file an RTB dispute application before the notice is deemed accepted.`
    });
  } else {
    riskWarnings.push({
      warningType: 'DISPUTE_WINDOW_EXPIRED',
      description: `More than 30 days have elapsed since service. Under s. 49(9), tenant is conclusively deemed to have accepted the end of the tenancy.`
    });
  }

  // 5. One Month Free Rent Compensation (s. 51(1))
  const oneMonthCompensationCad = rent;
  if (!oneMonthFreeRentProvided) {
    statutoryViolations.push({
      rule: 'FAILURE_TO_PROVIDE_SECTION_51_COMPENSATION',
      statute: 'Residential Tenancy Act s. 51(1)',
      finding: `Landlord failed to provide 1 month's free rent ($${oneMonthCompensationCad}) required upon serving a landlord-use eviction notice.`
    });
    actionableRemedies.push({
      action: 'WITHHOLD_FINAL_MONTH_RENT_OR_CLAIM_RTB',
      remedyDescription: `Withhold payment of the final month's rent under s. 51(1.1) or seek monetary order at RTB for $${oneMonthCompensationCad}.`
    });
  }

  // 6. 12-Month Bad Faith Rent Penalty (s. 51(2))
  const badFaithPenaltyCad = rent * BC_LANDLORD_USE_CONSTANTS.BAD_FAITH_PENALTY_RENT_MONTHS;
  let isBadFaithPenaltyPayable = false;

  if (landlordFailedToOccupyFor12Months) {
    if (extenuatingCircumstancesExist) {
      riskWarnings.push({
        warningType: 'EXTENUATING_CIRCUMSTANCES_ARGUED',
        description: 'Landlord asserts extenuating circumstances prevented 12-month occupancy; arbitrator will evaluate whether circumstances were genuinely unavoidable.'
      });
    } else {
      isBadFaithPenaltyPayable = true;
      statutoryViolations.push({
        rule: 'BREACH_OF_12_MONTH_OCCUPANCY_MANDATE',
        statute: 'Residential Tenancy Act s. 51(2)',
        finding: `Landlord or family member failed to occupy the unit for at least 12 consecutive months. Landlord is liable to pay tenant 12 months rent ($${badFaithPenaltyCad}).`
      });
      actionableRemedies.push({
        action: 'FILE_RTB_CLAIM_12_MONTHS_RENT_PENALTY',
        remedyDescription: `File a formal monetary claim with the RTB for $${badFaithPenaltyCad} (12 x monthly rent) under s. 51(2).`
      });
    }
  }

  let complianceStatus = 'COMPLIANT_NOTICE_AND_COMPENSATION';
  let legalVerdict = 'Landlord personal use notice conforms to BC RTA Bill 14 requirements (4-month notice, web portal generation, and 1-month free rent provided).';

  if (isBadFaithPenaltyPayable) {
    complianceStatus = 'BAD_FAITH_EVICTION_12_MONTH_PENALTY_OWED';
    legalVerdict = `Landlord failed to maintain 12 months personal occupancy. Tenant is statutorily entitled to $${badFaithPenaltyCad} (12 months rent) in compensation under s. 51(2).`;
  } else if (statutoryViolations.length > 0) {
    complianceStatus = 'DEFECTIVE_LANDLORD_USE_NOTICE';
    legalVerdict = `Notice to end tenancy is legally defective (${statutoryViolations.length} infraction${statutoryViolations.length === 1 ? '' : 's'}). Tenant has strong grounds to cancel the notice at the RTB.`;
  }

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    tenantName: cleanTenantName,
    landlordName: cleanLandlordName,
    assessmentDate: cleanAssessmentDate,
    actorRole: cleanActor,
    monthlyRentCad: rent,
    intendedOccupantRelationship: cleanRelationship,
    noticeMonthsGiven: noticeMonths,
    isWithin30DayDisputeWindow,
    daysRemainingToDispute,
    isBadFaithPenaltyPayable,
    complianceStatus,
    legalVerdict,
    compensationSummary: {
      mandatoryOneMonthFreeRentCad: oneMonthCompensationCad,
      isOneMonthRentProvided: oneMonthFreeRentProvided,
      badFaith12MonthPenaltyCad: isBadFaithPenaltyPayable ? badFaithPenaltyCad : 0
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancy Act, SBC 2002, c. 78, ss. 49, 51',
      'Residential Tenancy Regulation, B.C. Reg. 477/2003, s. 13.1',
      'Tenancy Statutes Amendment Act, 2024 (Bill 14)'
    ]
  };
}
