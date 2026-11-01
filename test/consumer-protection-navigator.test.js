import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSUMER_PROTECTION_CONSTANTS,
  evaluateConsumerContract
} from '../src/consumer-protection-navigator.js';

test('Consumer Protection Navigator — Constants match Ontario CPA & O. Reg. 17/18', () => {
  assert.equal(CONSUMER_PROTECTION_CONSTANTS.STANDARD_COOLING_OFF_DAYS, 10);
  assert.equal(CONSUMER_PROTECTION_CONSTANTS.EXTENDED_DISCLOSURE_CANCELLATION_DAYS, 365);
  assert.equal(CONSUMER_PROTECTION_CONSTANTS.UNFAIR_PRACTICE_RESCISSION_DAYS, 365);
  assert.equal(CONSUMER_PROTECTION_CONSTANTS.SUPPLIER_REFUND_DEADLINE_DAYS, 15);
  assert.ok(CONSUMER_PROTECTION_CONSTANTS.PRESCRIBED_DOOR_TO_DOOR_BANNED_PRODUCTS.includes('water_heater'));
  assert.ok(CONSUMER_PROTECTION_CONSTANTS.PRESCRIBED_DOOR_TO_DOOR_BANNED_PRODUCTS.includes('furnace'));
});

test('Consumer Protection Navigator — Identifies unsolicited door-to-door water heater contract as void ab initio', () => {
  const result = evaluateConsumerContract({
    province: 'ON',
    contractType: 'water_heater_rental',
    contractDate: '2026-10-20',
    contractValueCad: 4500,
    wasUnsolicitedInHomeVisit: true,
    prescribedBannedProduct: true,
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.doorToDoorBanAudit.isContractVoidAbInitio, true);
  assert.ok(result.doorToDoorBanAudit.violationDetail.includes('void from the outset (void ab initio)'));
  assert.equal(result.cancellationRights.canCancelWithoutPenalty, true);
  assert.ok(result.statutoryNoticeLetter.includes('O. Reg. 17/18 & CPA Part IV.1'));
});

test('Consumer Protection Navigator — Grants unconditional cancellation inside 10-day cooling-off window', () => {
  const result = evaluateConsumerContract({
    province: 'ON',
    contractType: 'gym_membership',
    contractDate: '2026-10-25',
    contractValueCad: 800,
    wasUnsolicitedInHomeVisit: false,
    prescribedBannedProduct: false,
    assessmentDate: '2026-10-31'
  });

  // 6 days elapsed (25 to 31) <= 10 days
  assert.equal(result.timingAudit.isWithinStandard10DayCoolingOff, true);
  assert.equal(result.cancellationRights.canCancelWithoutPenalty, true);
  assert.equal(result.cancellationRights.cancellationWindowRemainingDays, 4);
  assert.ok(result.cancellationRights.statutoryBasis.includes('10-day cooling-off'));
});

test('Consumer Protection Navigator — Extends cancellation period to 1 year for missing mandatory disclosures', () => {
  const result = evaluateConsumerContract({
    province: 'ON',
    contractType: 'general_direct_agreement',
    contractDate: '2026-06-01',
    contractValueCad: 2200,
    wasUnsolicitedInHomeVisit: true,
    prescribedBannedProduct: false,
    missingMandatoryDisclosures: true,
    assessmentDate: '2026-10-31'
  });

  // Over 10 days elapsed, but within 365 days with missing disclosures
  assert.equal(result.timingAudit.isWithinStandard10DayCoolingOff, false);
  assert.equal(result.timingAudit.isWithinExtended1YearDisclosurePeriod, true);
  assert.equal(result.cancellationRights.canCancelWithoutPenalty, true);
  assert.ok(result.cancellationRights.statutoryBasis.includes('missing mandatory statutory disclosure'));
});

test('Consumer Protection Navigator — Evaluates unfair practice rescission and demands 15-day refund & NOSI discharge', () => {
  const result = evaluateConsumerContract({
    province: 'ON',
    contractType: 'water_heater_rental',
    contractDate: '2026-08-15',
    contractValueCad: 5200,
    wasUnsolicitedInHomeVisit: false,
    prescribedBannedProduct: false,
    hasUnfairPractices: true,
    unfairPracticeType: 'misleading_safety_claim',
    consumerName: 'Elena Rostova',
    supplierName: 'Great North HVAC Ltd.',
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.unfairPracticesAudit.hasUnfairPractices, true);
  assert.ok(result.unfairPracticesAudit.statutoryFinding.includes('False/Deceptive Representation'));
  assert.equal(result.cancellationRights.canCancelWithoutPenalty, true);
  assert.ok(result.statutoryNoticeLetter.includes('Elena Rostova'));
  assert.ok(result.statutoryNoticeLetter.includes('Great North HVAC Ltd.'));
  assert.ok(result.statutoryNoticeLetter.includes('Notice of Security Interest (NOSI)'));
  assert.ok(result.statutoryNoticeLetter.includes('fifteen (15) days'));
});
