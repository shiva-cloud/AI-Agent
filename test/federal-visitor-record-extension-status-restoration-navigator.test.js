import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_VISITOR_STATUS_CONSTANTS,
  evaluateFederalVisitorExtensionAndRestoration
} from '../src/federal-visitor-record-extension-status-restoration-navigator.js';

test('Federal Visitor Status - Constants reflect IRPR ss. 182, 298, 306', () => {
  assert.equal(FEDERAL_VISITOR_STATUS_CONSTANTS.STATUTORY_RESTORATION_DEADLINE_DAYS, 90);
  assert.equal(FEDERAL_VISITOR_STATUS_CONSTANTS.VISITOR_RECORD_PROCESSING_FEE_CAD, 100);
  assert.equal(FEDERAL_VISITOR_STATUS_CONSTANTS.STATUS_RESTORATION_FEE_CAD, 229);
});

test('Federal Visitor Status - In-time application grants Maintained Status under s. 183(5)', () => {
  const result = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-12-31',
    applicationSubmissionDate: '2026-11-01',
    hasMetInitialStayConditions: true,
    hasSufficientFinancialSupport: true,
    holdsValidPassport: true
  });

  assert.equal(result.isInTimeExtension, true);
  assert.equal(result.statusClassification, 'IN_TIME_EXTENSION_MAINTAINED_STATUS');
  assert.equal(result.isEligible, true);
  assert.equal(result.feeSchedule.restorationFeeCad, 0);
  assert.equal(result.feeSchedule.totalFeesPayableCad, 100);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Federal Visitor Status - Status expired 30 days ago is eligible for Restoration ($329 fee)', () => {
  const result = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-09-01',
    applicationSubmissionDate: '2026-10-01', // 30 days later
    hasMetInitialStayConditions: true,
    hasSufficientFinancialSupport: true,
    holdsValidPassport: true
  });

  assert.equal(result.isInTimeExtension, false);
  assert.equal(result.isWithin90DayRestorationWindow, true);
  assert.equal(result.statusClassification, 'ELIGIBLE_FOR_90_DAY_RESTORATION');
  assert.equal(result.feeSchedule.restorationFeeCad, 229);
  assert.equal(result.feeSchedule.totalFeesPayableCad, 329);
  assert.ok(result.actionableRemedies.some(r => r.action === 'SUBMIT_FORM_IMM_5708_WITH_RESTORATION_FEE'));
});

test('Federal Visitor Status - Status expired 120 days ago is statutorily barred from restoration', () => {
  const result = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-05-01',
    applicationSubmissionDate: '2026-09-01', // ~123 days later
    hasMetInitialStayConditions: true
  });

  assert.equal(result.isPast90DayRestorationDeadline, true);
  assert.equal(result.statusClassification, 'STATUTORILY_BARRED_FROM_RESTORATION');
  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'RESTORATION_DEADLINE_EXCEEDED_OUT_OF_STATUS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'DEPART_CANADA_OR_SEEK_H_AND_C'));
});

test('Federal Visitor Status - Unauthorized work breach bars eligibility', () => {
  const result = evaluateFederalVisitorExtensionAndRestoration({
    statusExpiryDate: '2026-10-15',
    applicationSubmissionDate: '2026-10-20',
    hasMetInitialStayConditions: false // Worked illegally!
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NON_COMPLIANCE_WITH_INITIAL_CONDITIONS'));
});
