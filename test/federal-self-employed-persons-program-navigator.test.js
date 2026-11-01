import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSelfEmployedProgram,
  SELF_EMPLOYED_PASS_MARK_POINTS
} from '../src/federal-self-employed-persons-program-navigator.js';

test('Federal Self-Employed Persons - Eligible Visual Artist with 70 Points', () => {
  const result = evaluateSelfEmployedProgram({
    activityType: 'CULTURAL_ACTIVITIES',
    yearsOfSelfEmployedExperience: 3, // 25 pts
    yearsOfWorldClassParticipation: 0,
    educationLevel: 'BACHELORS', // 20 pts
    applicantAge: 32, // 10 pts
    firstOfficialLanguageClb: 7, // 12 pts
    secondOfficialLanguageClb: 0,
    adaptabilityFactors: {
      spouseEducationLevel: 'POST_SECONDARY' // 4 pts
    },
    intendsAndAbleToBeSelfEmployed: true,
    willMakeSignificantContributionToCanada: true,
    settlementFundsCad: 35000,
    familySize: 1
  });

  // Points: 25 + 20 + 10 + 12 + 4 = 71 points
  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_SELF_EMPLOYED_PERSONS_CLASS');
  assert.equal(result.pointsSummary.totalPoints, 71);
  assert.equal(result.pointsSummary.isPassMarkSatisfied, true);
  assert.equal(result.disqualifications.length, 0);
  assert.ok(result.riskWarnings.some(w => w.warning === 'MINISTERIAL_INSTRUCTIONS_INTAKE_PAUSE'));
});

test('Federal Self-Employed Persons - Disqualified for lack of 2-year experience', () => {
  const result = evaluateSelfEmployedProgram({
    activityType: 'ATHLETICS',
    yearsOfSelfEmployedExperience: 1, // Only 1 yr (requires 2)
    yearsOfWorldClassParticipation: 0,
    educationLevel: 'BACHELORS',
    applicantAge: 25
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'RELEVANT_EXPERIENCE_SHORTFALL'));
});

test('Federal Self-Employed Persons - Failed statutory pass mark (below 35 points)', () => {
  const result = evaluateSelfEmployedProgram({
    activityType: 'CULTURAL_ACTIVITIES',
    yearsOfSelfEmployedExperience: 2, // 20 pts
    yearsOfWorldClassParticipation: 0,
    educationLevel: 'HIGH_SCHOOL', // 5 pts
    applicantAge: 56, // 0 pts
    firstOfficialLanguageClb: 3, // 0 pts
    adaptabilityFactors: {
      spouseEducationLevel: 'NONE'
    }
  });

  // Total points: 20 + 5 + 0 + 0 + 0 = 25 points (< 35)
  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'SELECTION_GRID_PASS_MARK_FAILURE'));
});

test('Federal Self-Employed Persons - Disqualified for lacking intention or significant contribution', () => {
  const result = evaluateSelfEmployedProgram({
    activityType: 'CULTURAL_ACTIVITIES',
    yearsOfSelfEmployedExperience: 4,
    educationLevel: 'MASTERS_OR_PHD',
    applicantAge: 30,
    intendsAndAbleToBeSelfEmployed: false,
    willMakeSignificantContributionToCanada: false
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'INTENTION_OR_ABILITY_FAILURE'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'SIGNIFICANT_CONTRIBUTION_DEFICIENCY'));
});

test('Federal Self-Employed Persons - Verify Constant and Thresholds', () => {
  assert.equal(SELF_EMPLOYED_PASS_MARK_POINTS, 35);
});
