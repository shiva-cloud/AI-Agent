import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAlbertaSecurityDeposit, ALBERTA_RTA_CONSTANTS } from '../src/alberta-tenancy-security-deposit-navigator.js';

test('Alberta Security Deposit Navigator — Constants match Alberta RTA standards', () => {
  assert.equal(ALBERTA_RTA_CONSTANTS.MAX_SECURITY_DEPOSIT_RENT_MONTHS, 1);
  assert.equal(ALBERTA_RTA_CONSTANTS.INSPECTION_WINDOW_DAYS, 7);
  assert.equal(ALBERTA_RTA_CONSTANTS.DEPOSIT_REFUND_DEADLINE_DAYS, 10);
  assert.equal(ALBERTA_RTA_CONSTANTS.RTDRS_FILING_FEE_CAD, 75.0);
});

test('Alberta Security Deposit Navigator — Flags missing inspection as statutory forfeiture under RTA s. 19(4)', () => {
  const result = evaluateAlbertaSecurityDeposit({
    monthlyRentCad: 1600,
    securityDepositPaidCad: 1600,
    landlordConductedMoveInInspection: false,
    tenantReceivedSignedMoveInReport: false,
    deductionsClaimedCad: 600,
    deductionsReason: 'Damaged wall drywall repairs'
  });

  assert.equal(result.inspectionCompliance.landlordForfeitedDeductionRights, true);
  assert.equal(result.refundAssessment.illegalDeductionsCad, 600);
  assert.equal(result.refundAssessment.totalRefundOwedToTenantCad, 1600);
  assert.ok(result.statutoryProtections.some(p => p.includes('Alberta RTA s. 19(4)')));
  assert.ok(result.actionPlan.some(a => a.includes('Alberta RTA s. 19(4)')));
});

test('Alberta Security Deposit Navigator — Detects overcharged deposit exceeding 1 month rent and non-refundable fee ban', () => {
  const result = evaluateAlbertaSecurityDeposit({
    monthlyRentCad: 1500,
    securityDepositPaidCad: 1500,
    additionalNonRefundableFeesCad: 300
  });

  assert.equal(result.depositAudit.isDepositOvercharged, true);
  assert.equal(result.depositAudit.overchargedDepositCad, 300);
  assert.ok(result.statutoryViolations.some(v => v.includes('Unlawful non-refundable fee')));
});

test('Alberta Security Deposit Navigator — Prohibits wear-and-tear deductions (painting and carpet cleaning)', () => {
  const result = evaluateAlbertaSecurityDeposit({
    monthlyRentCad: 2000,
    securityDepositPaidCad: 2000,
    landlordConductedMoveInInspection: true,
    tenantReceivedSignedMoveInReport: true,
    landlordConductedMoveOutInspection: true,
    deductionsClaimedCad: 400,
    deductionsReason: 'normal wear and tear carpet cleaning and scuff marks'
  });

  assert.equal(result.inspectionCompliance.landlordForfeitedDeductionRights, false);
  assert.equal(result.refundAssessment.illegalDeductionsCad, 400);
  assert.equal(result.refundAssessment.totalRefundOwedToTenantCad, 2000);
  assert.ok(result.statutoryProtections.some(p => p.includes('Alberta RTA s. 46(5)')));
});

test('Alberta Security Deposit Navigator — Identifies overdue refund beyond 10-day statutory window', () => {
  const result = evaluateAlbertaSecurityDeposit({
    daysSinceTenancyEnded: 15
  });

  assert.equal(result.refundAssessment.isRefundOverdue, true);
  assert.ok(result.statutoryViolations.some(v => v.includes('Overdue refund')));
  assert.ok(result.actionPlan.some(a => a.includes('Residential Tenancy Dispute Resolution Service (RTDRS')));
});
