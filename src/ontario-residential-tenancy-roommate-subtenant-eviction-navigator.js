/**
 * Ontario Residential Tenancies Act (RTA) Roommate, Occupant & Subtenant Rights Navigator
 *
 * Implements statutory assessment rules under:
 * - Residential Tenancies Act, 2006, S.O. 2006, c. 17:
 *   - Section 2(1): Definitions (Tenant, Landlord, Rental Unit)
 *   - Section 5(i): Shared kitchen/bathroom with owner/immediate family exemption
 *   - Section 14: "No roommates / No guests" clauses strictly void
 *   - Section 22: Landlord harassment / interference with reasonable enjoyment
 *   - Section 100: Unauthorized occupant and 60-day deeming provision
 *   - Section 134: Prohibition against unauthorized guest fees or rent increases
 * - Landlord and Tenant Board (LTB) Interpretation Guideline 21: Landlords, Tenants, Occupants and Residential Tenancies
 * - Trespass to Property Act, R.S.O. 1990, c. T.21
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const RTA_UNAUTHORIZED_OCCUPANT_LIMITATION_DAYS = 60;

export function evaluateOntarioRoommateAndOccupantRights(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    tenantName = 'Tenant',
    occupantName = 'Occupant',
    assessmentDate = '2026-10-31',
    sharesKitchenOrBathWithOwnerOrFamily = false,
    isNamedOnTenancyAgreement = false,
    tenantHasVacatedPermanently = false,
    daysSinceLandlordDiscoveredOccupancy = 0,
    landlordChargesGuestOrRoommateFee = false,
    guestFeeAmountMonthlyCad = 0,
    leaseContainsNoGuestOrRoommateClause = false,
    disputeNature = 'ROOMMATE_EVICTION_BY_TENANT', // 'ROOMMATE_EVICTION_BY_TENANT', 'LANDLORD_BLOCKING_GUEST', 'UNAUTHORIZED_OCCUPANT_CLAIM'
    daysNoticeGivenToRoommate = 14
  } = safeParams;

  const cleanTenantName = boundedText(tenantName, 'Tenant', 100);
  const cleanOccupantName = boundedText(occupantName, 'Occupant', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const daysDiscovered = Number.isFinite(Number(daysSinceLandlordDiscoveredOccupancy)) ? Math.max(0, Math.min(3650, Math.floor(Number(daysSinceLandlordDiscoveredOccupancy)))) : 0;
  const guestFee = Number.isFinite(Number(guestFeeAmountMonthlyCad)) ? Math.max(0, Math.min(10000, Number(guestFeeAmountMonthlyCad))) : 0;

  const statutoryFindings = [];
  const jurisdictionalAssessment = {};
  const actionableRemedies = [];
  const riskWarnings = [];

  // 1. Section 5(i) Statutory Exemption Check
  if (sharesKitchenOrBathWithOwnerOrFamily) {
    return {
      tenantName: cleanTenantName,
      occupantName: cleanOccupantName,
      assessmentDate: cleanAssessmentDate,
      isRtaCovered: false,
      governingRegime: 'COMMON_LAW_CONTRACT',
      statutoryExemption: 'RTA_SECTION_5_I_SHARED_FACILITY',
      legalStatusVerdict: 'EXEMPT_FROM_RTA_UNDER_SECTION_5_I',
      summary: 'Because the occupant shares a kitchen or bathroom facility with the property owner or the owner\'s child/parent/spouse, the tenancy is strictly exempt from the Residential Tenancies Act, 2006 under Section 5(i).',
      jurisdiction: 'Small Claims Court / Superior Court of Justice (LTB has no jurisdiction)',
      noticeRequired: 'Reasonable notice under contract law (ordinarily one rental period or 30 days).',
      statutoryCitations: ['Residential Tenancies Act, 2006, S.O. 2006, c. 17, s. 5(i)']
    };
  }

  // 2. Assess Legal Status: Tenant vs Occupant / Roommate (RTA s. 2(1) & Guideline 21)
  const isStatutoryTenant = isNamedOnTenancyAgreement;
  jurisdictionalAssessment.isStatutoryTenant = isStatutoryTenant;

  if (isStatutoryTenant) {
    jurisdictionalAssessment.legalStatus = 'FULL_STATUTORY_TENANT';
    jurisdictionalAssessment.ltbHasJurisdiction = true;
  } else {
    jurisdictionalAssessment.legalStatus = 'OCCUPANT_OR_ROOMMATE';
    jurisdictionalAssessment.ltbHasJurisdiction = false;
    statutoryFindings.push({
      finding: 'NO_STATUTORY_TENANT_STATUS',
      section: 'RTA s. 2(1) & Guideline 21',
      details: 'The occupant is not a party to the lease agreement and has no privity of contract with the landlord. The LTB has NO jurisdiction over roommate-to-tenant disputes.'
    });
  }

  // 3. Lease Clauses Restricting Guests/Roommates (RTA s. 14)
  if (leaseContainsNoGuestOrRoommateClause) {
    statutoryFindings.push({
      finding: 'RESTRICTIVE_GUEST_CLAUSE_VOID',
      section: 'RTA s. 14',
      details: 'Under RTA s. 14, any clause in a tenancy agreement prohibiting roommates, guests, or additional occupants is statutorily void and unenforceable.'
    });
  }

  // 4. Illegal Guest or Roommate Surcharge (RTA s. 134)
  if (landlordChargesGuestOrRoommateFee && guestFee > 0) {
    statutoryFindings.push({
      finding: 'ILLEGAL_GUEST_FEE_SURCHARGE',
      section: 'RTA s. 134',
      details: `Landlord\'s charge of $${guestFee} CAD/month for a guest or roommate is an unlawful additional charge under RTA s. 134. Tenant may recover all paid amounts via LTB Form T1.`
    });
    actionableRemedies.push('File LTB Form T1 for full rebate of unlawful guest/roommate fees charged by the landlord.');
  }

  // 5. Landlord Interference with Roommate (RTA s. 22)
  if (disputeNature === 'LANDLORD_BLOCKING_GUEST') {
    actionableRemedies.push(
      'Tenant may file LTB Form T2 (Application about Tenant Rights) alleging landlord harassment and interference with reasonable enjoyment under RTA s. 22.',
      'Landlord cannot evict a tenant for having a roommate unless overcrowding violates municipal housing/occupancy bylaws (RTA s. 67).'
    );
  }

  // 6. Evicting a Roommate (Tenant vs Roommate)
  if (!isStatutoryTenant && disputeNature === 'ROOMMATE_EVICTION_BY_TENANT') {
    const noticeDays = Number.isFinite(Number(daysNoticeGivenToRoommate)) ? Math.max(0, Math.min(365, Math.floor(Number(daysNoticeGivenToRoommate)))) : 14;
    const isReasonableNotice = noticeDays >= 30;

    actionableRemedies.push(
      'Because the roommate is not an RTA tenant, the primary tenant cannot apply to the LTB.',
      'Primary tenant must provide reasonable notice under common law (generally 30 days or one rental payment period).',
      'If the roommate refuses to vacate after notice expires, the roommate becomes an unauthorized trespasser under the Trespass to Property Act; local police may be requested to assist with removal, or tenant may change locks provided roommate\'s property is safeguarded.'
    );

    if (!isReasonableNotice) {
      riskWarnings.push({
        warning: 'COMMON_LAW_SHORT_NOTICE_RISK',
        details: `Notice given (${noticeDays} days) may be challenged as unreasonable in Small Claims Court if the rental payment period is monthly. 30 days notice is strongly recommended.`
      });
    }
  }

  // 7. Unauthorized Occupant & Landlord 60-Day Deeming Rule (RTA s. 100)
  let isDeemedAssignedTenant = false;
  if (tenantHasVacatedPermanently && !isStatutoryTenant) {
    if (daysDiscovered > RTA_UNAUTHORIZED_OCCUPANT_LIMITATION_DAYS) {
      isDeemedAssignedTenant = true;
      statutoryFindings.push({
        finding: 'DEEMED_ASSIGNMENT_UNDER_SECTION_100',
        section: 'RTA s. 100(2)',
        details: `Landlord discovered unauthorized occupant ${daysDiscovered} days ago (exceeding 60 days) and failed to file Form A2. Under s. 100(2), the occupant is deemed to be a legal tenant assigned the tenancy agreement.`
      });
      actionableRemedies.push('Occupant now possesses full statutory tenancy protections; landlord can only terminate via formal statutory notice (e.g. N4, N12) and LTB eviction order.');
    } else {
      statutoryFindings.push({
        finding: 'ACTIVE_UNAUTHORIZED_OCCUPANCY_WINDOW',
        section: 'RTA s. 100(1)',
        details: `Landlord is within the 60-day window (${daysDiscovered} days elapsed) to file LTB Form A2 (Application to Evict an Unauthorized Occupant).`
      });
      actionableRemedies.push('Landlord may apply to LTB using Form A2 within 60 days of discovery to obtain an eviction order against the unauthorized occupant.');
    }
  }

  const legalVerdict = isDeemedAssignedTenant
    ? 'DEEMED_STATUTORY_TENANT_UNDER_SECTION_100'
    : isStatutoryTenant
      ? 'FULL_STATUTORY_TENANCY'
      : (tenantHasVacatedPermanently ? 'UNAUTHORIZED_OCCUPANT_SUBJECT_TO_A2' : 'OCCUPANT_WITHOUT_RTA_JURISDICTION');

  return {
    tenantName: cleanTenantName,
    occupantName: cleanOccupantName,
    assessmentDate: cleanAssessmentDate,
    isRtaCovered: true,
    occupantName: cleanOccupantName,
    legalVerdict,
    jurisdictionalAssessment,
    statutoryFindings,
    actionableRemedies,
    riskWarnings,
    proceduralTimelines: {
      daysSinceLandlordDiscovery: daysDiscovered,
      statutoryA2LimitationDays: RTA_UNAUTHORIZED_OCCUPANT_LIMITATION_DAYS,
      isSixtyDayWindowExpired: daysDiscovered > RTA_UNAUTHORIZED_OCCUPANT_LIMITATION_DAYS
    },
    statutoryCitations: [
      'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 2(1), 5(i), 14, 22, 100, 134',
      'LTB Interpretation Guideline 21: Landlords, Tenants, Occupants and Residential Tenancies',
      'Trespass to Property Act, R.S.O. 1990, c. T.21'
    ]
  };
}
