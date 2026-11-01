import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOWP_CONSTANTS,
  calculateDaysToExpiry,
  evaluateSpousalSowp,
  evaluateBowpPathway
} from '../src/bowp-navigator.js';

test('BOWP Diagnostic Engine - Constants & Fee Structure', () => {
  assert.ok(BOWP_CONSTANTS.STATUTES.BOWP_AUTHORITY.includes('Code A75'));
  assert.ok(BOWP_CONSTANTS.STATUTES.MAINTAINED_STATUS.includes('s. 186(u)'));
  assert.ok(BOWP_CONSTANTS.STATUTES.PNP_EMPLOYER_SPECIFIC.includes('Code T13'));
  assert.equal(BOWP_CONSTANTS.FEES_CAD.TOTAL_BOWP_FEE, 255);
  assert.equal(BOWP_CONSTANTS.FEES_CAD.WORK_PERMIT_PROCESSING_FEE, 155);
  assert.equal(BOWP_CONSTANTS.FEES_CAD.OPEN_WORK_PERMIT_HOLDER_FEE, 100);
});

test('calculateDaysToExpiry handles future and past dates accurately', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  assert.equal(calculateDaysToExpiry('2026-11-15', refDate), 15);
  assert.equal(calculateDaysToExpiry('2026-10-16', refDate), -15);
  assert.equal(calculateDaysToExpiry('2026-10-31', refDate), 0);
});

test('evaluateSpousalSowp diagnoses high-skilled TEER vs low-skilled eligibility', () => {
  // High skilled TEER 1 with pay stubs
  const eligibleSpouse = evaluateSpousalSowp({
    hasSpouse: true,
    principalTeerLevel: 'teer_1',
    principalHasPayStubs: true,
    principalPermitRemainingMonths: 12
  });
  assert.equal(eligibleSpouse.eligible, true);
  assert.equal(eligibleSpouse.exemptionCode, 'C41');
  assert.ok(eligibleSpouse.advisory.includes('Exemption Code C41'));

  // Low skilled TEER 4
  const lowSkilledSpouse = evaluateSpousalSowp({
    hasSpouse: true,
    principalTeerLevel: 'teer_4',
    principalHasPayStubs: true,
    principalPermitRemainingMonths: 12
  });
  assert.equal(lowSkilledSpouse.eligible, false);
  assert.ok(lowSkilledSpouse.advisory.includes('low-skilled'));

  // Missing pay stubs
  const missingStubs = evaluateSpousalSowp({
    hasSpouse: true,
    principalTeerLevel: 'teer_2',
    principalHasPayStubs: false,
    principalPermitRemainingMonths: 12
  });
  assert.equal(missingStubs.eligible, false);
  assert.ok(missingStubs.advisory.includes('3 recent consecutive Canadian pay stubs'));

  // No spouse
  const noSpouse = evaluateSpousalSowp({ hasSpouse: false });
  assert.equal(noSpouse.isApplicable, false);
});

test('evaluateBowpPathway approves a compliant Express Entry candidate with maintained status', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateBowpPathway({
    currentPermitType: 'pgwp',
    permitExpiryDate: '2026-12-15', // 45 days left
    isPhysicallyInCanada: true,
    prProgramApplied: 'express_entry_cec',
    hasOfficialAor: true,
    hasSpouse: true,
    principalTeerLevel: 'teer_1',
    principalHasPayStubs: true
  }, refDate);

  assert.equal(result.resolutionVerdict, 'ELIGIBLE_FOR_BOWP');
  assert.equal(result.isEligibleForBowp, true);
  assert.equal(result.exemptionCode, 'A75');
  assert.equal(result.daysUntilExpiry, 45);
  assert.equal(result.isExpired, false);
  assert.equal(result.totalFeeCad, 255);
  assert.equal(result.maintainedStatus.hasMaintainedStatusRight, true);
  assert.ok(result.maintainedStatus.conditionsPreserved.includes('IRPR s. 186(u)'));
  assert.ok(result.maintainedStatus.travelAdvisory.includes('expires immediately'));
  assert.equal(result.spousalOpenWorkPermit.eligible, true);
  assert.equal(result.statutoryBlockers.length, 0);
  assert.ok(result.applicationChecklist.length >= 6);
});

test('evaluateBowpPathway strictly blocks PNP candidates with employer restrictions and redirects to Code T13', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const restrictedPnp = evaluateBowpPathway({
    currentPermitType: 'closed_work_permit',
    permitExpiryDate: '2026-12-01',
    isPhysicallyInCanada: true,
    prProgramApplied: 'non_express_entry_pnp',
    hasOfficialAor: true,
    pnpNominationHasEmployerRestrictions: true,
    pnpProvince: 'ON'
  }, refDate);

  assert.equal(restrictedPnp.isEligibleForBowp, false);
  assert.equal(restrictedPnp.resolutionVerdict, 'RESTRICTED_PNP_REQUIRES_CODE_T13');
  assert.ok(restrictedPnp.statutoryBlockers.some(b => b.code === 'PNP_EMPLOYER_RESTRICTION_BANS_BOWP'));
  assert.ok(restrictedPnp.alternativePermitRecommendation);
  assert.equal(restrictedPnp.alternativePermitRecommendation.exemptionCode, 'T13');
  assert.ok(restrictedPnp.alternativePermitRecommendation.advisory.includes('Code T13'));
});

test('evaluateBowpPathway blocks premature submission without official IRCC AOR', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const noAor = evaluateBowpPathway({
    currentPermitType: 'pgwp',
    permitExpiryDate: '2026-11-30',
    isPhysicallyInCanada: true,
    prProgramApplied: 'express_entry_fswp',
    hasOfficialAor: false // Premature submission
  }, refDate);

  assert.equal(noAor.isEligibleForBowp, false);
  assert.equal(noAor.resolutionVerdict, 'AWAITING_OFFICIAL_AOR');
  assert.ok(noAor.statutoryBlockers.some(b => b.code === 'PREMATURE_SUBMISSION_NO_AOR'));
});

test('evaluateBowpPathway rejects applicants who are outside Canada', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const overseas = evaluateBowpPathway({
    currentPermitType: 'pgwp',
    permitExpiryDate: '2026-12-31',
    isPhysicallyInCanada: false, // Abroad
    prProgramApplied: 'express_entry_cec',
    hasOfficialAor: true
  }, refDate);

  assert.equal(overseas.isEligibleForBowp, false);
  assert.ok(overseas.statutoryBlockers.some(b => b.code === 'OUTSIDE_CANADA_INELIGIBLE'));
});

test('evaluateBowpPathway flags expired permits as requiring status restoration', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const expired = evaluateBowpPathway({
    currentPermitType: 'pgwp',
    permitExpiryDate: '2026-10-15', // 16 days ago
    isPhysicallyInCanada: true,
    prProgramApplied: 'express_entry_cec',
    hasOfficialAor: true
  }, refDate);

  assert.equal(expired.isEligibleForBowp, false);
  assert.equal(expired.resolutionVerdict, 'REQUIRES_RESTORATION_OF_STATUS');
  assert.equal(expired.isExpired, true);
  assert.ok(expired.statutoryBlockers.some(b => b.code === 'STATUS_EXPIRED'));
});
