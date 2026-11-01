import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_BOWP_CONSTANTS,
  evaluateFederalBridgingOpenWorkPermit
} from '../src/federal-bridging-open-work-permit-pr-acknowledgement-navigator.js';

test('Federal BOWP - Constants reflect IRPR s. 207', () => {
  assert.equal(FEDERAL_BOWP_CONSTANTS.EXEMPTION_CODE, 'A75');
  assert.equal(FEDERAL_BOWP_CONSTANTS.MAX_DAYS_UNTIL_EXPIRY, 120);
  assert.ok(FEDERAL_BOWP_CONSTANTS.ELIGIBLE_PR_STREAMS.includes('EXPRESS_ENTRY_CEC'));
});

test('Federal BOWP - Fully eligible candidate with AOR and 60 days to expiry', () => {
  const result = evaluateFederalBridgingOpenWorkPermit({
    isCurrentlyInCanada: true,
    hasValidWorkAuthorization: true,
    daysUntilCurrentPermitExpires: 60,
    prApplicationStream: 'EXPRESS_ENTRY_CEC',
    hasReceivedOfficialAor: true,
    pnpHasEmploymentRestrictions: false,
    hasPendingInadmissibilityProceedings: false
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_BRIDGING_OPEN_WORK_PERMIT');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.workPermitDetails.openWorkPermit, undefined);
  assert.equal(result.workPermitDetails.permitType, 'OPEN_WORK_PERMIT');
});

test('Federal BOWP - Ineligible premature application (180 days to expiry)', () => {
  const result = evaluateFederalBridgingOpenWorkPermit({
    daysUntilCurrentPermitExpires: 180,
    hasReceivedOfficialAor: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PREMATURE_BOWP_APPLICATION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'CALENDAR_APPLICATION_WITHIN_120_DAYS'));
});

test('Federal BOWP - Ineligible missing Section 10 completeness AOR', () => {
  const result = evaluateFederalBridgingOpenWorkPermit({
    daysUntilCurrentPermitExpires: 45,
    hasReceivedOfficialAor: false
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'MISSING_SECTION_10_COMPLETENESS_AOR'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'AWAIT_OFFICIAL_AOR_LETTER'));
});

test('Federal BOWP - Ineligible when PNP nomination specifies employer restrictions', () => {
  const result = evaluateFederalBridgingOpenWorkPermit({
    prApplicationStream: 'NON_EXPRESS_ENTRY_PNP',
    daysUntilCurrentPermitExpires: 30,
    hasReceivedOfficialAor: true,
    pnpHasEmploymentRestrictions: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PNP_NOMINATION_HAS_EMPLOYMENT_RESTRICTIONS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'APPLY_FOR_T13_RESTRICTED_WORK_PERMIT'));
});
