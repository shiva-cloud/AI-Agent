import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSmallClaimsDispute,
  SMALL_CLAIMS_CONSTANTS
} from '../src/small-claims-navigator.js';

test('Small Claims Navigator — Statutory constants reflect provincial court jurisdictional limits', () => {
  assert.equal(SMALL_CLAIMS_CONSTANTS.ONTARIO_SMALL_CLAIMS_MAX_CAD, 35000);
  assert.equal(SMALL_CLAIMS_CONSTANTS.BC_CRT_MAX_CAD, 5000);
  assert.equal(SMALL_CLAIMS_CONSTANTS.BC_SMALL_CLAIMS_MAX_CAD, 35000);
  assert.equal(SMALL_CLAIMS_CONSTANTS.ALBERTA_SMALL_CLAIMS_MAX_CAD, 100000);
  assert.equal(SMALL_CLAIMS_CONSTANTS.QUEBEC_SMALL_CLAIMS_MAX_CAD, 15000);
});

test('Small Claims Navigator — Calculates Ontario pre-judgment interest and court filing fees', () => {
  const result = evaluateSmallClaimsDispute({
    province: 'ON',
    claimAmountCad: 10000,
    disputeType: 'breach_of_contract',
    dateCauseOfActionArose: '2025-10-31', // exactly 1 year before 2026-10-31
    defendantType: 'business',
    defendantName: 'Acme Services Corp',
    plaintiffName: 'Jordan Smith',
    prejudgmentInterestRatePercent: 4.0,
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.province, 'ON');
  assert.equal(result.jurisdictionAudit.isWithinSmallClaimsLimit, true);
  assert.equal(result.jurisdictionAudit.monetaryLimitCad, 35000);
  assert.equal(result.limitationAudit.isStatuteBarred, false);
  assert.ok(result.limitationAudit.daysRemainingToSue > 300);
  // 1 year at 4% on $10,000 = $400 CAD pre-judgment interest
  assert.equal(result.interestAndCostsCalculation.accruedPrejudgmentInterestCad, 400);
  assert.equal(result.interestAndCostsCalculation.totalClaimableWithInterestCad, 10400);
  assert.ok(result.formalDemandLetter.letterBodyText.includes('Courts of Justice Act'));
});

test('Small Claims Navigator — Flags claim exceeding $35,000 Ontario limit with abandonment option', () => {
  const result = evaluateSmallClaimsDispute({
    province: 'ON',
    claimAmountCad: 42000,
    disputeType: 'unpaid_loan'
  });

  assert.equal(result.jurisdictionAudit.isWithinSmallClaimsLimit, false);
  assert.equal(result.jurisdictionAudit.excessAmountCad, 7000);
  assert.ok(result.jurisdictionAudit.abandonExcessRecommendation.includes('abandon'));
});

test('Small Claims Navigator — Routes BC claims under $5,000 to Civil Resolution Tribunal (CRT)', () => {
  const result = evaluateSmallClaimsDispute({
    province: 'BC',
    claimAmountCad: 3500,
    disputeType: 'consumer_service'
  });

  assert.equal(result.province, 'BC');
  assert.ok(result.jurisdictionAudit.courtName.includes('Civil Resolution Tribunal'));
});

test('Small Claims Navigator — Warns against jurisdictional conflict for active residential tenancy', () => {
  const result = evaluateSmallClaimsDispute({
    province: 'ON',
    claimAmountCad: 5000,
    disputeType: 'residential_tenancy'
  });

  assert.ok(result.jurisdictionAudit.exclusiveTribunalConflict !== null);
  assert.ok(result.jurisdictionAudit.exclusiveTribunalConflict.includes('Landlord and Tenant Board'));
});

test('Small Claims Navigator — Identifies claim statute-barred by 2-year limitation period', () => {
  const result = evaluateSmallClaimsDispute({
    province: 'ON',
    claimAmountCad: 8000,
    dateCauseOfActionArose: '2024-01-01', // over 2 years prior to 2026-10-31
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.limitationAudit.isStatuteBarred, true);
  assert.ok(result.limitationAudit.daysRemainingToSue <= 0);
});
