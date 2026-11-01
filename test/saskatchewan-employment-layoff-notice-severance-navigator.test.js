import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SASKATCHEWAN_LAYOFF_CONSTANTS,
  evaluateSaskatchewanLayoffNotice
} from '../src/saskatchewan-employment-layoff-notice-severance-navigator.js';

test('Saskatchewan Notice - Constants reflect Employment Act ss. 2-60, 2-62', () => {
  assert.equal(SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_1_WEEKS, 4);
  assert.equal(SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_2_WEEKS, 8);
  assert.equal(SASKATCHEWAN_LAYOFF_CONSTANTS.GROUP_TERMINATION_TIER_3_WEEKS, 12);
});

test('Saskatchewan Notice - 4-year employee receives 4 weeks individual notice', () => {
  const result = evaluateSaskatchewanLayoffNotice({
    yearsOfContinuousService: 4,
    regularWeeklyWageCad: 1000,
    actualNoticeWeeksGiven: 4,
    employeesTerminatedIn4WeekWindow: 1
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_NOTICE_PROVIDED');
  assert.equal(result.noticeCalculation.statutoryNoticeWeeksEntitled, 4);
  assert.equal(result.noticeCalculation.noticeShortfallWeeks, 0);
  assert.equal(result.noticeCalculation.statutoryPayInLieuEntitledCad, 0);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Saskatchewan Notice - 10-year employee with 0 notice receives $8,000 pay in lieu', () => {
  const result = evaluateSaskatchewanLayoffNotice({
    yearsOfContinuousService: 12,
    regularWeeklyWageCad: 1000,
    actualNoticeWeeksGiven: 0
  });

  assert.equal(result.complianceStatus, 'NON_COMPLIANT_NOTICE_SHORTFALL');
  assert.equal(result.noticeCalculation.statutoryNoticeWeeksEntitled, 8);
  assert.equal(result.noticeCalculation.noticeShortfallWeeks, 8);
  assert.equal(result.noticeCalculation.statutoryPayInLieuEntitledCad, 8000);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_STATUTORY_TERMINATION_NOTICE'));
});

test('Saskatchewan Notice - Group termination of 60 employees elevates notice to 8 weeks', () => {
  const result = evaluateSaskatchewanLayoffNotice({
    yearsOfContinuousService: 2, // Individual scale would be 2 weeks
    regularWeeklyWageCad: 1200,
    employeesTerminatedIn4WeekWindow: 60, // Tier 2 group termination: 8 weeks
    ministerNotifiedInWriting: false,
    actualNoticeWeeksGiven: 0
  });

  assert.equal(result.isGroupTerminationApplicable, true);
  assert.equal(result.noticeCalculation.statutoryNoticeWeeksEntitled, 8);
  assert.equal(result.noticeCalculation.statutoryPayInLieuEntitledCad, 9600);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'FAILURE_TO_NOTIFY_MINISTER_OF_GROUP_TERMINATION'));
});

test('Saskatchewan Notice - Just cause termination exempts employer from notice', () => {
  const result = evaluateSaskatchewanLayoffNotice({
    yearsOfContinuousService: 7,
    isTerminatedForJustCause: true
  });

  assert.equal(result.isTerminatedForJustCause, true);
  assert.equal(result.statutoryNoticeWeeksEntitled, 0);
  assert.equal(result.statutoryPayInLieuEntitledCad, 0);
});
