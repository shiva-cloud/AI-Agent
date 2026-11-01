import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SASKATCHEWAN_DEPOSIT_CONSTANTS,
  evaluateSaskatchewanSecurityDepositReturn
} from '../src/saskatchewan-residential-tenancy-security-deposit-return-navigator.js';

test('Saskatchewan Deposit Return - Constants reflect Act ss. 13-15', () => {
  assert.equal(SASKATCHEWAN_DEPOSIT_CONSTANTS.MAX_DEPOSIT_MONTHS_RENT, 1);
  assert.equal(SASKATCHEWAN_DEPOSIT_CONSTANTS.MANDATORY_ACTION_BUSINESS_DAYS, 7);
  assert.equal(SASKATCHEWAN_DEPOSIT_CONSTANTS.ORT_HEARING_FEE_CAD, 50);
});

test('Saskatchewan Deposit Return - Landlord forfeiture after 10 business days without Form 13', () => {
  // $1500 deposit, 10 business days, no Form 13, no refund.
  // Full forfeiture; $1500 owed.
  const result = evaluateSaskatchewanSecurityDepositReturn({
    monthlyRentCad: 1500,
    securityDepositPaidCad: 1500,
    tenancyEnded: true,
    businessDaysSinceTenancyEnded: 10,
    landlordRefundedFullDeposit: false,
    amountActuallyRefundedCad: 0,
    landlordServedPrescribedForm13: false
  });

  assert.equal(result.isPast7BusinessDays, true);
  assert.equal(result.landlordForfeitedRightToClaim, true);
  assert.equal(result.complianceStatus, 'LANDLORD_STATUTORY_FORFEITURE_CONFIRMED');
  assert.equal(result.financialSummary.balanceOwedToTenantCad, 1500);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'LANDLORD_STATUTORY_FORFEITURE_LATE_CLAIM'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_ORT_FORM_7_APPLICATION_FOR_FULL_REFUND'));
});

test('Saskatchewan Deposit Return - Compliant full refund within 7 business days', () => {
  const result = evaluateSaskatchewanSecurityDepositReturn({
    monthlyRentCad: 1400,
    securityDepositPaidCad: 1400,
    businessDaysSinceTenancyEnded: 4,
    landlordRefundedFullDeposit: true,
    amountActuallyRefundedCad: 1400
  });

  assert.equal(result.landlordForfeitedRightToClaim, false);
  assert.equal(result.complianceStatus, 'COMPLIANT_DEPOSIT_ADMINISTRATION');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.financialSummary.balanceOwedToTenantCad, 0);
});

test('Saskatchewan Deposit Return - Excess deposit over 1 month rent (s. 13(1) breach)', () => {
  const result = evaluateSaskatchewanSecurityDepositReturn({
    monthlyRentCad: 1200,
    securityDepositPaidCad: 1800,
    businessDaysSinceTenancyEnded: 2
  });

  assert.equal(result.financialSummary.excessDepositPaidCad, 600);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'SECURITY_DEPOSIT_EXCEEDS_ONE_MONTH_RENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RECOVER_EXCESS_SECURITY_DEPOSIT'));
});

test('Saskatchewan Deposit Return - Form 13 served within 7 business days preserves dispute rights', () => {
  const result = evaluateSaskatchewanSecurityDepositReturn({
    monthlyRentCad: 1500,
    securityDepositPaidCad: 1500,
    businessDaysSinceTenancyEnded: 5,
    landlordServedPrescribedForm13: true
  });

  assert.equal(result.landlordForfeitedRightToClaim, false);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'FORM_13_DISPUTE_PROCEEDING'));
});
