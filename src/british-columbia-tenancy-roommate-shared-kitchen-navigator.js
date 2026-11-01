/**
 * British Columbia Residential Tenancy Act (BC RTA) Roommate & Shared Kitchen Navigator
 *
 * Implements statutory assessment rules under:
 * - Residential Tenancy Act, SBC 2002, c. 78:
 *   - Section 4(c): What this Act does not apply to (Shared bathroom or kitchen with owner)
 *   - Section 13: Requirements for tenancy agreements (Occupancy clauses)
 *   - Section 19: Additional occupants and rent increase provisions
 *   - Section 28: Protection of tenant's right to quiet enjoyment (prohibiting arbitrary guest restrictions)
 * - RTB Policy Guideline 13: Rights and Responsibilities of Co-tenants
 * - RTB Policy Guideline 19: Assignment and Sublet
 * - Trespass Act, RSBC 1996, c. 462
 * - Civil Resolution Tribunal Act, SBC 2012, c. 25
 */

import { boundedText, safeIsoDate } from './text-input.js';

export function evaluateBcRoommateAndSharedKitchen(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    tenantName = 'Tenant',
    roommateName = 'Roommate',
    assessmentDate = '2026-10-31',
    sharesKitchenOrBathroomWithOwner = false,
    isNamedOnTenancyAgreement = false,
    disputeType = 'TENANT_ROOMMATE_DISPUTE', // 'TENANT_ROOMMATE_DISPUTE', 'LANDLORD_RESTRICTING_GUEST', 'CO_TENANT_DISPUTE'
    landlordChargesGuestOrOccupantFee = false,
    monthlyGuestFeeCad = 0,
    tenancyAgreementLimitsOccupants = false,
    statedOccupancyLimit = 2,
    currentOccupantsCount = 2,
    daysNoticeGivenToRoommate = 14
  } = safeParams;

  const cleanTenantName = boundedText(tenantName, 'Tenant', 100);
  const cleanRoommateName = boundedText(roommateName, 'Roommate', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanDisputeType = boundedText(disputeType, 'TENANT_ROOMMATE_DISPUTE', 50);
  const guestFee = Number.isFinite(Number(monthlyGuestFeeCad))
    ? Math.max(0, Math.min(100000, Number(monthlyGuestFeeCad)))
    : 0;
  const occupancyLimit = Number.isFinite(Number(statedOccupancyLimit))
    ? Math.max(1, Math.min(50, Math.floor(Number(statedOccupancyLimit))))
    : 2;
  const occupantsCount = Number.isFinite(Number(currentOccupantsCount))
    ? Math.max(1, Math.min(50, Math.floor(Number(currentOccupantsCount))))
    : 2;
  const noticeDays = Number.isFinite(Number(daysNoticeGivenToRoommate))
    ? Math.max(0, Math.min(3650, Math.floor(Number(daysNoticeGivenToRoommate))))
    : 14;

  const statutoryFindings = [];
  const actionableRemedies = [];
  const riskWarnings = [];

  // 1. Check Section 4(c) Exemption (Shared Kitchen or Bathroom with Registered Owner)
  if (sharesKitchenOrBathroomWithOwner) {
    return {
      tenantName: cleanTenantName,
      roommateName: cleanRoommateName,
      assessmentDate: cleanAssessmentDate,
      isRtaCovered: false,
      governingRegime: 'COMMON_LAW_CONTRACT',
      statutoryExemption: 'BC_RTA_SECTION_4_C_SHARED_FACILITY',
      legalStatusVerdict: 'EXEMPT_FROM_BC_RTA_UNDER_SECTION_4_C',
      summary: 'Because the occupant shares bathroom or kitchen facilities with the owner of the property, the tenancy is strictly excluded from the British Columbia Residential Tenancy Act under Section 4(c).',
      jurisdiction: 'Civil Resolution Tribunal (CRT) for claims up to $5,000 / Small Claims Court up to $35,000 (RTB has no jurisdiction)',
      noticeRequired: 'Reasonable notice under contract law (typically 30 days or one rental payment period).',
      statutoryCitations: ['Residential Tenancy Act, SBC 2002, c. 78, s. 4(c)']
    };
  }

  // 2. Assess Status: Co-Tenant vs Occupant (Roommate / Licensee) (Guideline 13)
  const isCoTenant = isNamedOnTenancyAgreement;

  if (isCoTenant) {
    statutoryFindings.push({
      finding: 'CO_TENANT_STATUS',
      regime: 'BC RTA & RTB Guideline 13',
      details: 'Party is named on the tenancy agreement. Co-tenants are jointly and severally liable. If one co-tenant gives written notice to end the tenancy, the tenancy ends for all co-tenants.'
    });
  } else {
    statutoryFindings.push({
      finding: 'OCCUPANT_LICENSEE_STATUS',
      regime: 'RTB Guideline 13 & Guideline 19',
      details: 'Party is an occupant (roommate) with no contractual relationship with the landlord. The RTB has NO jurisdiction to hear disputes between a tenant and their roommate.'
    });
  }

  // 3. Landlord Restricting Guests or Surcharging (RTA ss. 19 & 28)
  if (cleanDisputeType === 'LANDLORD_RESTRICTING_GUEST') {
    if (landlordChargesGuestOrOccupantFee) {
      if (tenancyAgreementLimitsOccupants && guestFee > 0) {
        statutoryFindings.push({
          finding: 'CONTRACTUAL_ADDITIONAL_OCCUPANT_FEE',
          section: 'BC RTA s. 13 & s. 19',
          details: `Tenancy agreement specifies additional occupant terms. Landlord may only collect fee if explicit dollar amount for additional occupants is written in standard agreement.`
        });
      } else {
        statutoryFindings.push({
          finding: 'UNLAWFUL_GUEST_FEE_SURCHARGE',
          section: 'BC RTA s. 19 & s. 28',
          details: 'Landlord cannot charge a guest fee or arbitrarily raise rent for guests or roommates unless the tenancy agreement explicitly includes a term permitting an additional occupant fee.'
        });
        actionableRemedies.push('File RTB dispute resolution for an order that the landlord cease charging unlawful occupant fees and reimburse overpayments.');
      }
    }

    actionableRemedies.push('Tenant has the statutory right under RTA s. 28 to quiet enjoyment and reasonable guests without landlord interference.');
  }

  // 4. Evicting a Roommate (Tenant vs Roommate)
  if (!isCoTenant && cleanDisputeType === 'TENANT_ROOMMATE_DISPUTE') {
    const isReasonableNotice = noticeDays >= 30;

    actionableRemedies.push(
      'Because the roommate is not a tenant under the BC RTA, the dispute cannot be filed with the RTB.',
      'Tenant must provide reasonable notice under common law (usually one full rental payment period or 30 days).',
      'If the roommate refuses to vacate after notice expires, they become an unlawful occupant under the Trespass Act; tenant may change locks provided roommate belongings are preserved for retrieval.',
      'Monetary disputes (unpaid rent, damage) must be filed with the BC Civil Resolution Tribunal (CRT).'
    );

    if (!isReasonableNotice) {
      riskWarnings.push({
        warning: 'COMMON_LAW_SHORT_NOTICE_RISK',
        details: `Notice given (${noticeDays} days) may be found unreasonable by the CRT if rent was paid monthly. 30 days notice is strongly recommended.`
      });
    }
  }

  const legalVerdict = cleanDisputeType === 'LANDLORD_RESTRICTING_GUEST'
    ? 'TENANT_PROTECTED_UNDER_SECTION_28'
    : (isCoTenant ? 'FULL_CO_TENANCY_UNDER_BC_RTA' : 'OCCUPANT_WITHOUT_RTB_JURISDICTION');

  return {
    tenantName: cleanTenantName,
    roommateName: cleanRoommateName,
    assessmentDate: cleanAssessmentDate,
    isRtaCovered: true,
    legalVerdict,
    statusAssessment: {
      isCoTenant,
      isOccupant: !isCoTenant,
      rtbJurisdictionApplies: isCoTenant || cleanDisputeType === 'LANDLORD_RESTRICTING_GUEST'
    },
    statutoryFindings,
    actionableRemedies,
    riskWarnings,
    disputeForum: (isCoTenant || cleanDisputeType === 'LANDLORD_RESTRICTING_GUEST')
      ? 'Residential Tenancy Branch (RTB)'
      : 'BC Civil Resolution Tribunal (CRT) / Small Claims Court',
    statutoryCitations: [
      'Residential Tenancy Act, SBC 2002, c. 78, ss. 4(c), 13, 19, 28',
      'RTB Policy Guideline 13: Rights and Responsibilities of Co-tenants',
      'RTB Policy Guideline 19: Assignment and Sublet',
      'Trespass Act, RSBC 1996, c. 462'
    ]
  };
}
