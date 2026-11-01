import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBcGroupTerminationNotice,
  calculateBcIndividualNoticeWeeks
} from '../src/british-columbia-employment-severance-group-termination-navigator.js';

test('BC Group Termination - 75 employees (8 weeks notice) with s. 64 and s. 63 stacking', () => {
  const result = evaluateBcGroupTerminationNotice({
    affectedEmployeesCount: 75,
    twoMonthWindow: true,
    singleLocation: true,
    groupNoticeWeeksGiven: 2,
    individualTenureMonths: 48, // 4 years -> 4 weeks s.63
    regularWeeklyWageCad: 1000,
    ministerNotified: true,
    isUnionized: false
  });

  assert.equal(result.isSection64GroupTermination, true);
  assert.equal(result.isExemptUnderSection65, false);
  assert.equal(result.groupTerminationDetails.requiredNoticeWeeks, 8);
  assert.equal(result.groupTerminationDetails.noticeWeeksGiven, 2);
  assert.equal(result.groupTerminationDetails.shortfallWeeks, 6);
  assert.equal(result.groupTerminationDetails.statutoryGroupPayInLieuCad, 6000);

  // Individual notice: 4 years = 4 weeks ($4,000)
  assert.equal(result.individualNoticeDetails.statutorySection63Weeks, 4);
  assert.equal(result.individualNoticeDetails.statutoryIndividualPayInLieuCad, 4000);

  // Stacked: 6 shortfall + 4 individual = 10 weeks ($10,000)
  assert.equal(result.totalLiabilityAssessment.stackedNoticeWeeks, 10);
  assert.equal(result.totalLiabilityAssessment.totalStatutoryPayInLieuCad, 10000);
});

test('BC Group Termination - 350 employees (16 weeks notice) without Minister notification', () => {
  const result = evaluateBcGroupTerminationNotice({
    affectedEmployeesCount: 350,
    twoMonthWindow: true,
    singleLocation: true,
    groupNoticeWeeksGiven: 0,
    individualTenureMonths: 12, // 1 year -> 2 weeks s.63
    regularWeeklyWageCad: 1500,
    ministerNotified: false
  });

  assert.equal(result.isSection64GroupTermination, true);
  assert.equal(result.groupTerminationDetails.requiredNoticeWeeks, 16);
  assert.equal(result.groupTerminationDetails.shortfallWeeks, 16);
  assert.ok(result.statutoryViolations.some(v => v.violation === 'FAILURE_TO_NOTIFY_MINISTER'));
  assert.equal(result.complianceStatus, 'STATUTORY_DEFICIENCY_DETECTED');
});

test('BC Group Termination - Statutory Section 65 Exemption (Just Cause)', () => {
  const result = evaluateBcGroupTerminationNotice({
    affectedEmployeesCount: 60,
    isJustCauseTermination: true
  });

  assert.equal(result.isSection64GroupTermination, false);
  assert.equal(result.isExemptUnderSection65, true);
  assert.equal(result.complianceStatus, 'EXEMPT_JUST_CAUSE');
  assert.equal(result.totalLiabilityAssessment, undefined);
  assert.equal(result.totalStatutoryLiabilityCad, 0);
});

test('BC Group Termination - Small Layoff under 50 employees (No s. 64 trigger)', () => {
  const result = evaluateBcGroupTerminationNotice({
    affectedEmployeesCount: 20,
    individualTenureMonths: 24, // 2 years -> 2 weeks
    regularWeeklyWageCad: 1000
  });

  assert.equal(result.isSection64GroupTermination, false);
  assert.equal(result.groupTerminationDetails.requiredNoticeWeeks, 0);
  assert.equal(result.individualNoticeDetails.statutorySection63Weeks, 2);
  assert.equal(result.totalLiabilityAssessment.totalStatutoryPayInLieuCad, 2000);
});

test('BC Group Termination - Individual Notice calculation function verification', () => {
  assert.equal(calculateBcIndividualNoticeWeeks(2), 0);
  assert.equal(calculateBcIndividualNoticeWeeks(6), 1);
  assert.equal(calculateBcIndividualNoticeWeeks(12), 2);
  assert.equal(calculateBcIndividualNoticeWeeks(24), 2);
  assert.equal(calculateBcIndividualNoticeWeeks(36), 3);
  assert.equal(calculateBcIndividualNoticeWeeks(48), 4);
  assert.equal(calculateBcIndividualNoticeWeeks(96), 8); // capped at 8 weeks
  assert.equal(calculateBcIndividualNoticeWeeks(120), 8);
});
