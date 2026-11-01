import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_CONSTRUCTIVE_DISMISSAL_CONSTANTS,
  evaluateAlbertaConstructiveDismissal
} from '../src/alberta-employment-constructive-dismissal-salary-reduction-navigator.js';

test('Alberta Constructive Dismissal - Constants reflect ESC s. 56 & Farber', () => {
  assert.equal(ALBERTA_CONSTRUCTIVE_DISMISSAL_CONSTANTS.SALARY_REDUCTION_SUBSTANTIAL_PERCENT_THRESHOLD, 10.0);
  assert.equal(ALBERTA_CONSTRUCTIVE_DISMISSAL_CONSTANTS.TERMINATION_NOTICE_SCALE_WEEKS.length, 6);
});

test('Alberta Constructive Dismissal - 20% salary cut triggers constructive dismissal and 4 weeks pay for 5 yrs', () => {
  // $80k cut to $64k = 20% reduction. 5 years tenure = 4 weeks notice under s. 56.
  // Weekly salary: $80,000 / 52 = $1538.46 * 4 = $6153.84
  const result = evaluateAlbertaConstructiveDismissal({
    previousAnnualSalaryCad: 80000,
    newAnnualSalaryCad: 64000,
    yearsOfContinuousService: 5,
    employeeAgreedToReduction: false
  });

  assert.equal(result.isConstructiveDismissal, true);
  assert.equal(result.complianceStatus, 'CONSTRUCTIVE_DISMISSAL_CONFIRMED');
  assert.equal(result.percentageReduction, 20.0);
  assert.equal(result.severanceCalculation.statutoryNoticeWeeks, 4);
  assert.equal(result.severanceCalculation.statutoryTerminationPayCad, 6153.84);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNILATERAL_FUNDAMENTAL_BREACH_CONSTRUCTIVE_DISMISSAL'));
});

test('Alberta Constructive Dismissal - Consensual salary cut negates dismissal', () => {
  const result = evaluateAlbertaConstructiveDismissal({
    previousAnnualSalaryCad: 80000,
    newAnnualSalaryCad: 64000,
    yearsOfContinuousService: 3,
    employeeAgreedToReduction: true
  });

  assert.equal(result.isConstructiveDismissal, false);
  assert.equal(result.complianceStatus, 'MUTUAL_AGREEMENT_NO_DISMISSAL');
  assert.equal(result.statutoryViolations.length, 0);
});

test('Alberta Constructive Dismissal - Long delay risks condonation', () => {
  const result = evaluateAlbertaConstructiveDismissal({
    previousAnnualSalaryCad: 70000,
    newAnnualSalaryCad: 50000,
    yearsOfContinuousService: 2,
    daysSinceReductionImposed: 75
  });

  assert.equal(result.isConstructiveDismissal, true);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'HIGH_RISK_OF_LEGAL_CONDONATION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'SERVE_FORMAL_PROTEST_LETTER_IMMEDIATELY'));
});
