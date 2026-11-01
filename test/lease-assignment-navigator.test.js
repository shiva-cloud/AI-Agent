import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEASE_ASSIGNMENT_CONSTANTS,
  calculateDaysBetween,
  addDaysToDate,
  evaluateLeaseAssignmentExit
} from '../src/lease-assignment-navigator.js';

test('Lease Assignment Diagnostic Engine - Constants & Statutory Windows', () => {
  assert.ok(LEASE_ASSIGNMENT_CONSTANTS.STATUTES.ONTARIO_RTA_ASSIGNMENT.includes('s. 95'));
  assert.ok(LEASE_ASSIGNMENT_CONSTANTS.STATUTES.ONTARIO_RTA_VOID_CLAUSE.includes('s. 15'));
  assert.equal(LEASE_ASSIGNMENT_CONSTANTS.STATUTORY_RESPONSE_WINDOWS_DAYS.ON, 7);
  assert.equal(LEASE_ASSIGNMENT_CONSTANTS.STATUTORY_RESPONSE_WINDOWS_DAYS.AB, 14);
  assert.equal(LEASE_ASSIGNMENT_CONSTANTS.MAX_REASONABLE_ASSIGNMENT_FEE_CAD.ON, 75);
});

test('calculateDaysBetween and addDaysToDate work accurately', () => {
  assert.equal(calculateDaysBetween('2026-10-01', '2026-10-15'), 14);
  assert.equal(addDaysToDate('2026-10-31', 30), '2026-11-30');
  assert.equal(addDaysToDate('2026-10-31', 7), '2026-11-07');
});

test('evaluateLeaseAssignmentExit grants 30-day Form N9 exit when landlord refuses assignment in principle', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateLeaseAssignmentExit({
    province: 'ON',
    leaseType: 'fixed_term',
    requestType: 'assignment',
    requestStage: 'refused_in_principle',
    monthlyRentCad: 2600
  }, refDate);

  assert.equal(result.province, 'ON');
  assert.equal(result.isEarlyExitPermittedWithoutPenalty, true);
  assert.equal(result.resolutionVerdict, 'RIGHT_TO_TERMINATE_WITH_30_DAYS_N9');
  assert.equal(result.recommendedLegalForm, 'Form N9 (Tenant\'s Notice to End the Tenancy)');
  assert.equal(result.earliestEffectiveTerminationDate, '2026-11-30');
  assert.ok(result.noticeTemplates.formN9TerminationNotice.includes('Form N9'));
  assert.ok(result.legalRemedies.some(r => r.action.includes('Form N9')));
});

test('evaluateLeaseAssignmentExit grants 30-day Form N9 exit when landlord fails to reply within 7 days', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateLeaseAssignmentExit({
    province: 'ON',
    leaseType: 'fixed_term',
    requestType: 'assignment',
    requestStage: 'requested_awaiting_reply',
    daysSinceRequest: 8, // Exceeded 7 days
    monthlyRentCad: 2400
  }, refDate);

  assert.equal(result.isEarlyExitPermittedWithoutPenalty, true);
  assert.equal(result.resolutionVerdict, 'RIGHT_TO_TERMINATE_WITH_30_DAYS_N9');
  assert.equal(result.recommendedLegalForm, 'Form N9 (Tenant\'s Notice to End the Tenancy)');
  assert.equal(result.earliestEffectiveTerminationDate, '2026-11-30');
});

test('evaluateLeaseAssignmentExit detects illegal lease break buyout penalty under RTA s. 15', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateLeaseAssignmentExit({
    province: 'ON',
    leaseType: 'fixed_term',
    requestType: 'assignment',
    requestStage: 'refused_in_principle',
    landlordDemandedPenaltyCad: 4500, // Illegal penalty
    monthlyRentCad: 2500
  }, refDate);

  assert.equal(result.isIllegalPenaltyDemanded, true);
  assert.equal(result.demandedPenaltyCad, 4500);
  assert.ok(result.statutoryViolations.some(v => v.clause === 'ILLEGAL_LEASE_BREAK_PENALTY'));
  assert.ok(result.statutoryViolations.some(v => v.statute.includes('s. 15')));
});

test('evaluateLeaseAssignmentExit flags excessive assignment fees under RTA s. 95(7)', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateLeaseAssignmentExit({
    province: 'ON',
    leaseType: 'fixed_term',
    requestType: 'assignment',
    requestStage: 'landlord_consented',
    landlordDemandedAssignmentFeeCad: 500 // Max is $75 out of pocket
  }, refDate);

  assert.equal(result.isExcessiveAssignmentFee, true);
  assert.ok(result.statutoryViolations.some(v => v.clause === 'EXCESSIVE_ASSIGNMENT_FEE'));
  assert.ok(result.statutoryViolations.some(v => v.finding.includes('$500')));
});

test('evaluateLeaseAssignmentExit handles month-to-month leases with standard notice', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');
  const result = evaluateLeaseAssignmentExit({
    province: 'ON',
    leaseType: 'month_to_month',
    monthlyRentCad: 2200
  }, refDate);

  assert.equal(result.resolutionVerdict, 'STANDARD_PERIODIC_NOTICE');
  assert.equal(result.earliestEffectiveTerminationDate, '2026-12-30'); // 60 days
  assert.ok(result.legalRemedies.some(r => r.action.includes('60-day notice')));
});

test('evaluateLeaseAssignmentExit detects Alberta 14-day deemed consent and Quebec Bill 31 resiliation', () => {
  const refDate = new Date('2026-10-31T00:00:00Z');

  // Alberta 14-day rule
  const abResult = evaluateLeaseAssignmentExit({
    province: 'AB',
    leaseType: 'fixed_term',
    requestType: 'assignment',
    requestStage: 'landlord_failed_to_reply',
    daysSinceRequest: 15
  }, refDate);
  assert.equal(abResult.resolutionVerdict, 'ALBERTA_DEEMED_CONSENT_ACQUIRED');
  assert.ok(abResult.legalRemedies.some(r => r.statute.includes('Alberta')));

  // Quebec Bill 31
  const qcResult = evaluateLeaseAssignmentExit({
    province: 'QC',
    leaseType: 'fixed_term',
    requestType: 'assignment',
    requestStage: 'refused_in_principle'
  }, refDate);
  assert.equal(qcResult.resolutionVerdict, 'QUEBEC_BILL_31_LEASE_RESILIATED');
  assert.equal(qcResult.isEarlyExitPermittedWithoutPenalty, true);
  assert.ok(qcResult.legalRemedies.some(r => r.statute.includes('Bill 31')));
});
