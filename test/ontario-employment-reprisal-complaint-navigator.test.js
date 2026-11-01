import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONTARIO_REPRISAL_CONSTANTS,
  evaluateOntarioEmploymentReprisal
} from '../src/ontario-employment-reprisal-complaint-navigator.js';

test('Ontario ESA Reprisal - Constants reflect ESA ss. 74, 103, 104', () => {
  assert.equal(ONTARIO_REPRISAL_CONSTANTS.EMPLOYER_REVERSE_ONUS_PRESUMPTION, true);
  assert.equal(ONTARIO_REPRISAL_CONSTANTS.LIMITATION_PERIOD_YEARS, 2);
  assert.ok(ONTARIO_REPRISAL_CONSTANTS.PROTECTED_ACTIONS.includes('ASKED_EMPLOYER_TO_COMPLY_WITH_ESA'));
});

test('Ontario ESA Reprisal - Summary termination following ESA inquiry', () => {
  // $1000/week * 8 weeks lost = $8,000 + $2,000 distress = $10,000 total claim
  const result = evaluateOntarioEmploymentReprisal({
    protectedActionTaken: 'ASKED_EMPLOYER_TO_COMPLY_WITH_ESA',
    employerAdverseAction: 'TERMINATED_EMPLOYMENT',
    daysBetweenActionAndReprisal: 3,
    regularWeeklyWageCad: 1000,
    weeksOfLostIncome: 8,
    seeksJobReinstatement: true,
    employerProvidedDocumentedPerformanceIssuesPrior: false
  });

  assert.equal(result.complianceStatus, 'STATUTORY_REPRISAL_VIOLATION_CONFIRMED');
  assert.equal(result.remedySummary.employerReverseOnusApplies, true);
  assert.equal(result.remedySummary.reinstatementAvailable, true);
  assert.equal(result.remedySummary.lostWagesCad, 8000);
  assert.equal(result.remedySummary.totalMonetaryRemedyCad, 10000);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_UNLAWFUL_REPRISAL'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'INVOKE_STATUTORY_REVERSE_ONUS_SECTION_74_2'));
});

test('Ontario ESA Reprisal - Penalty for taking statutory sick leave', () => {
  const result = evaluateOntarioEmploymentReprisal({
    protectedActionTaken: 'TOOK_OR_REQUESTED_STATUTORY_LEAVE',
    employerAdverseAction: 'DEMOTED_OR_CUT_HOURS',
    daysBetweenActionAndReprisal: 5,
    regularWeeklyWageCad: 800,
    weeksOfLostIncome: 4,
    seeksJobReinstatement: false
  });

  assert.equal(result.complianceStatus, 'STATUTORY_REPRISAL_VIOLATION_CONFIRMED');
  assert.equal(result.remedySummary.lostWagesCad, 3200);
  assert.equal(result.remedySummary.totalMonetaryRemedyCad, 3700); // 3200 + 500
});

test('Ontario ESA Reprisal - Employer asserts prior progressive discipline', () => {
  const result = evaluateOntarioEmploymentReprisal({
    protectedActionTaken: 'REFUSED_UNLAWFUL_UNPAID_OVERTIME',
    employerAdverseAction: 'TERMINATED_EMPLOYMENT',
    employerProvidedDocumentedPerformanceIssuesPrior: true
  });

  assert.equal(result.remedySummary.employerBurdenStatus, 'EVIDENTIARY_DISPUTE_PRE_EXISTING_DISCIPLINE_ALLEGED');
  assert.ok(result.riskWarnings.some(w => w.warningType === 'EMPLOYER_MAY_ASSERT_NON_REPRISAL_MOTIVE'));
});
