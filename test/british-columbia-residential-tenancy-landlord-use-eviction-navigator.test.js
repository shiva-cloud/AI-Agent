import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_LANDLORD_USE_CONSTANTS,
  evaluateBcLandlordUseEviction
} from '../src/british-columbia-residential-tenancy-landlord-use-eviction-navigator.js';

test('BC Landlord Use - Constants reflect 2024 Bill 14 amendments', () => {
  assert.equal(BC_LANDLORD_USE_CONSTANTS.MANDATORY_NOTICE_PERIOD_MONTHS, 4);
  assert.equal(BC_LANDLORD_USE_CONSTANTS.TENANT_DISPUTE_DEADLINE_DAYS, 30);
  assert.equal(BC_LANDLORD_USE_CONSTANTS.MANDATORY_OCCUPANCY_DURATION_MONTHS, 12);
  assert.equal(BC_LANDLORD_USE_CONSTANTS.BAD_FAITH_PENALTY_RENT_MONTHS, 12);
});

test('BC Landlord Use - Fully compliant 4-month notice with web portal and 1 month free rent', () => {
  const result = evaluateBcLandlordUseEviction({
    monthlyRentCad: 2000,
    noticeMonthsGiven: 4,
    daysElapsedSinceNoticeServed: 10,
    generatedThroughOfficialWebPortal: true,
    intendedOccupantRelationship: 'CHILD_OR_PARENT',
    oneMonthFreeRentProvided: true
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_NOTICE_AND_COMPENSATION');
  assert.equal(result.isWithin30DayDisputeWindow, true);
  assert.equal(result.daysRemainingToDispute, 20);
  assert.equal(result.compensationSummary.mandatoryOneMonthFreeRentCad, 2000);
  assert.equal(result.statutoryViolations.length, 0);
});

test('BC Landlord Use - Detects defective notice under 4 months (e.g. old 2-month notice)', () => {
  const result = evaluateBcLandlordUseEviction({
    monthlyRentCad: 2200,
    noticeMonthsGiven: 2 // Illegal under Bill 14!
  });

  assert.equal(result.complianceStatus, 'DEFECTIVE_LANDLORD_USE_NOTICE');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_NOTICE_PERIOD_UNDER_4_MONTHS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'CANCEL_NOTICE_AT_RTB_SHORT_NOTICE'));
});

test('BC Landlord Use - Detects ineligible family member (sibling/cousin not allowed)', () => {
  const result = evaluateBcLandlordUseEviction({
    intendedOccupantRelationship: 'SIBLING_OR_OTHER'
  });

  assert.ok(result.statutoryViolations.some(v => v.rule === 'INELIGIBLE_OCCUPANT_NOT_CLOSE_FAMILY_MEMBER'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_RTB_DISPUTE_INVALID_OCCUPANT'));
});

test('BC Landlord Use - Bad faith eviction: landlord re-rents, owes $24,000 (12 months rent)', () => {
  const result = evaluateBcLandlordUseEviction({
    monthlyRentCad: 2000,
    landlordFailedToOccupyFor12Months: true, // Failed 12 months!
    extenuatingCircumstancesExist: false
  });

  assert.equal(result.isBadFaithPenaltyPayable, true);
  assert.equal(result.complianceStatus, 'BAD_FAITH_EVICTION_12_MONTH_PENALTY_OWED');
  assert.equal(result.compensationSummary.badFaith12MonthPenaltyCad, 24000);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'BREACH_OF_12_MONTH_OCCUPANCY_MANDATE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_RTB_CLAIM_12_MONTHS_RENT_PENALTY'));
});
