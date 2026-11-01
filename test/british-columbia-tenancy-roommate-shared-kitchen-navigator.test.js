import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBcRoommateAndSharedKitchen
} from '../src/british-columbia-tenancy-roommate-shared-kitchen-navigator.js';

test('BC Roommate - Section 4(c) Exemption (Shared kitchen with owner)', () => {
  const result = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: true
  });

  assert.equal(result.isRtaCovered, false);
  assert.equal(result.legalStatusVerdict, 'EXEMPT_FROM_BC_RTA_UNDER_SECTION_4_C');
  assert.equal(result.statutoryExemption, 'BC_RTA_SECTION_4_C_SHARED_FACILITY');
});

test('BC Roommate - Tenant vs Roommate dispute (RTB has no jurisdiction, CRT forum)', () => {
  const result = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: false,
    isNamedOnTenancyAgreement: false,
    disputeType: 'TENANT_ROOMMATE_DISPUTE',
    daysNoticeGivenToRoommate: 14 // short notice
  });

  assert.equal(result.isRtaCovered, true);
  assert.equal(result.statusAssessment.isCoTenant, false);
  assert.equal(result.statusAssessment.rtbJurisdictionApplies, false);
  assert.equal(result.legalVerdict, 'OCCUPANT_WITHOUT_RTB_JURISDICTION');
  assert.ok(result.disputeForum.includes('Civil Resolution Tribunal'));
  assert.ok(result.riskWarnings.some(w => w.warning === 'COMMON_LAW_SHORT_NOTICE_RISK'));
});

test('BC Roommate - Landlord unlawful $150 guest fee without explicit lease clause', () => {
  const result = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: false,
    isNamedOnTenancyAgreement: true,
    disputeType: 'LANDLORD_RESTRICTING_GUEST',
    landlordChargesGuestOrOccupantFee: true,
    monthlyGuestFeeCad: 150,
    tenancyAgreementLimitsOccupants: false
  });

  assert.equal(result.isRtaCovered, true);
  assert.equal(result.legalVerdict, 'TENANT_PROTECTED_UNDER_SECTION_28');
  assert.ok(result.statutoryFindings.some(f => f.finding === 'UNLAWFUL_GUEST_FEE_SURCHARGE'));
  assert.ok(result.actionableRemedies.some(r => r.includes('RTB dispute resolution')));
});

test('BC Roommate - Co-Tenant joint and several liability status', () => {
  const result = evaluateBcRoommateAndSharedKitchen({
    sharesKitchenOrBathroomWithOwner: false,
    isNamedOnTenancyAgreement: true,
    disputeType: 'CO_TENANT_DISPUTE'
  });

  assert.equal(result.isRtaCovered, true);
  assert.equal(result.legalVerdict, 'FULL_CO_TENANCY_UNDER_BC_RTA');
  assert.equal(result.statusAssessment.isCoTenant, true);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'CO_TENANT_STATUS'));
});
