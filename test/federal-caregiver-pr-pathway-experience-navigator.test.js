import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_CAREGIVER_CONSTANTS,
  evaluateFederalCaregiverPrPathway
} from '../src/federal-caregiver-pr-pathway-experience-navigator.js';

test('Federal Caregiver PR - Constants reflect 2023 12-month standard', () => {
  assert.equal(FEDERAL_CAREGIVER_CONSTANTS.MIN_QUALIFYING_EXPERIENCE_MONTHS, 12);
  assert.equal(FEDERAL_CAREGIVER_CONSTANTS.MIN_WEEKLY_FULL_TIME_HOURS, 30);
  assert.equal(FEDERAL_CAREGIVER_CONSTANTS.MIN_LANGUAGE_CLB_LEVEL, 5);
  assert.ok(FEDERAL_CAREGIVER_CONSTANTS.QUALIFYING_NOCS.includes('44100'));
});

test('Federal Caregiver PR - Fully eligible home child care provider with 12 months experience', () => {
  const result = evaluateFederalCaregiverPrPathway({
    nocCode: '44100',
    completedCanadianExperienceMonths: 12,
    averageWeeklyHours: 35,
    experienceInPrivateHousehold: true,
    clbReading: 5,
    clbWriting: 5,
    clbListening: 6,
    clbSpeaking: 6,
    hasOneYearPostSecondaryOrEca: true,
    hasValidCanadianWorkPermitOrStatus: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_CAREGIVER_DIRECT_PR');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.qualificationSummary.meets12MonthExperienceThreshold, true);
});

test('Federal Caregiver PR - Ineligible with only 8 months experience', () => {
  const result = evaluateFederalCaregiverPrPathway({
    nocCode: '44101',
    completedCanadianExperienceMonths: 8
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_CAREGIVER_DIRECT_PR');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_QUALIFYING_CANADIAN_WORK_EXPERIENCE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'ACCRUE_REMAINING_MONTHS_OF_WORK_EXPERIENCE'));
});

test('Federal Caregiver PR - Ineligible below CLB 5 (CLB 4 in reading)', () => {
  const result = evaluateFederalCaregiverPrPathway({
    clbReading: 4,
    clbWriting: 5,
    clbListening: 5,
    clbSpeaking: 5
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'BELOW_MINIMUM_CLB_5_BENCHMARK'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RETAKE_LANGUAGE_TEST_FOR_CLB_5'));
});

test('Federal Caregiver PR - Institutional day care experience is excluded', () => {
  const result = evaluateFederalCaregiverPrPathway({
    experienceInPrivateHousehold: false
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSTITUTIONAL_EXPERIENCE_EXCLUDED'));
});
