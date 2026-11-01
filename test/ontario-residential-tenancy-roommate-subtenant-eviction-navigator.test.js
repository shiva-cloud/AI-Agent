import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateOntarioRoommateAndOccupantRights
} from '../src/ontario-residential-tenancy-roommate-subtenant-eviction-navigator.js';

test('Ontario Roommate - Section 5(i) Exemption (Shared kitchen with owner)', () => {
  const result = evaluateOntarioRoommateAndOccupantRights({
    sharesKitchenOrBathWithOwnerOrFamily: true
  });

  assert.equal(result.isRtaCovered, false);
  assert.equal(result.legalStatusVerdict, 'EXEMPT_FROM_RTA_UNDER_SECTION_5_I');
  assert.equal(result.statutoryExemption, 'RTA_SECTION_5_I_SHARED_FACILITY');
});

test('Ontario Roommate - Tenant evicting roommate (LTB has no jurisdiction)', () => {
  const result = evaluateOntarioRoommateAndOccupantRights({
    sharesKitchenOrBathWithOwnerOrFamily: false,
    isNamedOnTenancyAgreement: false,
    disputeNature: 'ROOMMATE_EVICTION_BY_TENANT',
    daysNoticeGivenToRoommate: 14 // short notice
  });

  assert.equal(result.isRtaCovered, true);
  assert.equal(result.jurisdictionalAssessment.isStatutoryTenant, false);
  assert.equal(result.jurisdictionalAssessment.ltbHasJurisdiction, false);
  assert.equal(result.legalVerdict, 'OCCUPANT_WITHOUT_RTA_JURISDICTION');
  assert.ok(result.riskWarnings.some(w => w.warning === 'COMMON_LAW_SHORT_NOTICE_RISK'));
  assert.ok(result.actionableRemedies.some(r => r.includes('Trespass to Property Act')));
});

test('Ontario Roommate - Landlord charging illegal $200 guest fee and void lease clause', () => {
  const result = evaluateOntarioRoommateAndOccupantRights({
    sharesKitchenOrBathWithOwnerOrFamily: false,
    isNamedOnTenancyAgreement: true,
    landlordChargesGuestOrRoommateFee: true,
    guestFeeAmountMonthlyCad: 200,
    leaseContainsNoGuestOrRoommateClause: true,
    disputeNature: 'LANDLORD_BLOCKING_GUEST'
  });

  assert.equal(result.isRtaCovered, true);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'ILLEGAL_GUEST_FEE_SURCHARGE'));
  assert.ok(result.statutoryFindings.some(f => f.finding === 'RESTRICTIVE_GUEST_CLAUSE_VOID'));
  assert.ok(result.actionableRemedies.some(r => r.includes('Form T1')));
  assert.ok(result.actionableRemedies.some(r => r.includes('Form T2')));
});

test('Ontario Roommate - Section 100 Deemed Assignment past 60 days', () => {
  const result = evaluateOntarioRoommateAndOccupantRights({
    sharesKitchenOrBathWithOwnerOrFamily: false,
    isNamedOnTenancyAgreement: false,
    tenantHasVacatedPermanently: true,
    daysSinceLandlordDiscoveredOccupancy: 75 // > 60 days
  });

  assert.equal(result.legalVerdict, 'DEEMED_STATUTORY_TENANT_UNDER_SECTION_100');
  assert.equal(result.proceduralTimelines.isSixtyDayWindowExpired, true);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'DEEMED_ASSIGNMENT_UNDER_SECTION_100'));
});

test('Ontario Roommate - Section 100 Active 60-day window for Landlord Form A2', () => {
  const result = evaluateOntarioRoommateAndOccupantRights({
    sharesKitchenOrBathWithOwnerOrFamily: false,
    isNamedOnTenancyAgreement: false,
    tenantHasVacatedPermanently: true,
    daysSinceLandlordDiscoveredOccupancy: 20 // < 60 days
  });

  assert.equal(result.legalVerdict, 'UNAUTHORIZED_OCCUPANT_SUBJECT_TO_A2');
  assert.equal(result.proceduralTimelines.isSixtyDayWindowExpired, false);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'ACTIVE_UNAUTHORIZED_OCCUPANCY_WINDOW'));
  assert.ok(result.actionableRemedies.some(r => r.includes('Form A2')));
});
