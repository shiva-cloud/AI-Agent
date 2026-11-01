import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_DEPOSIT_PENALTY_CONSTANTS,
  evaluateBcSecurityDepositDoublePenalty
} from '../src/british-columbia-residential-tenancy-security-deposit-double-penalty-navigator.js';

test('BC Security Deposit Double Penalty - Constants reflect RTA s. 38', () => {
  assert.equal(BC_DEPOSIT_PENALTY_CONSTANTS.STATUTORY_RETURN_TIMELINE_DAYS, 15);
  assert.equal(BC_DEPOSIT_PENALTY_CONSTANTS.STATUTORY_PENALTY_MULTIPLIER, 2);
  assert.equal(BC_DEPOSIT_PENALTY_CONSTANTS.FORWARDING_ADDRESS_LIMITATION_YEARS, 1);
});

test('BC Security Deposit Double Penalty - Mandatory doubling after 25 days with no refund or dispute', () => {
  // $1000 deposit, 25 days elapsed, no consent, no claim.
  // Entitled to 2x $1000 = $2000
  const result = evaluateBcSecurityDepositDoublePenalty({
    securityDepositPaidCad: 1000,
    petDepositPaidCad: 0,
    tenancyHasEnded: true,
    forwardingAddressProvidedInWriting: true,
    daysSinceForwardingAddressReceived: 25,
    tenantSignedWrittenDeductionConsent: false,
    landlordFiledRtbClaimWithin15Days: false,
    landlordRefundedAmountCad: 0
  });

  assert.equal(result.isDoublePenaltyMandatory, true);
  assert.equal(result.complianceStatus, 'MANDATORY_STATUTORY_DOUBLE_PENALTY_TRIGGERED');
  assert.equal(result.financialSummary.grossPenaltyOwedCad, 2000);
  assert.equal(result.financialSummary.netMonetaryAwardOwedCad, 2000);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'EXCEEDED_15_DAY_RETURN_WINDOW_MANDATORY_DOUBLE_PENALTY'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_RTB_APPLICATION_FOR_DOUBLE_DEPOSIT'));
});

test('BC Security Deposit Double Penalty - Doubling with both security and pet deposits', () => {
  // $1200 security + $600 pet = $1800. Doubled = $3600
  const result = evaluateBcSecurityDepositDoublePenalty({
    securityDepositPaidCad: 1200,
    petDepositPaidCad: 600,
    tenancyHasEnded: true,
    forwardingAddressProvidedInWriting: true,
    daysSinceForwardingAddressReceived: 20
  });

  assert.equal(result.isDoublePenaltyMandatory, true);
  assert.equal(result.financialSummary.totalDepositsPaidCad, 1800);
  assert.equal(result.financialSummary.grossPenaltyOwedCad, 3600);
  assert.equal(result.financialSummary.netMonetaryAwardOwedCad, 3600);
});

test('BC Security Deposit Double Penalty - Compliant landlord who refunded within 15 days', () => {
  const result = evaluateBcSecurityDepositDoublePenalty({
    securityDepositPaidCad: 1000,
    daysSinceForwardingAddressReceived: 10,
    landlordRefundedAmountCad: 1000
  });

  assert.equal(result.isDoublePenaltyMandatory, false);
  assert.equal(result.complianceStatus, 'COMPLIANT_DEPOSIT_RETURN');
  assert.equal(result.financialSummary.netMonetaryAwardOwedCad, 0);
});

test('BC Security Deposit Double Penalty - Tenant has not yet provided written forwarding address', () => {
  const result = evaluateBcSecurityDepositDoublePenalty({
    securityDepositPaidCad: 1000,
    forwardingAddressProvidedInWriting: false
  });

  assert.equal(result.isDoublePenaltyMandatory, false);
  assert.equal(result.complianceStatus, 'PENDING_WRITTEN_FORWARDING_ADDRESS');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NO_WRITTEN_FORWARDING_ADDRESS_SERVED'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'SERVE_WRITTEN_FORWARDING_ADDRESS_IMMEDIATELY'));
});
