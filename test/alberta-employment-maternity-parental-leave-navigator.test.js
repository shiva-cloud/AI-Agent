import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_MATERNITY_PARENTAL_CONSTANTS,
  evaluateAlbertaMaternityParentalLeave
} from '../src/alberta-employment-maternity-parental-leave-navigator.js';

test('Alberta Maternity & Parental - Constants reflect ESC ss. 45-53.1', () => {
  assert.equal(ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MIN_SERVICE_DAYS_REQUIRED, 90);
  assert.equal(ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_MATERNITY_LEAVE_WEEKS, 16);
  assert.equal(ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_PARENTAL_LEAVE_WEEKS, 62);
  assert.equal(ALBERTA_MATERNITY_PARENTAL_CONSTANTS.MAX_COMBINED_MATERNITY_PARENTAL_WEEKS, 78);
  assert.equal(ALBERTA_MATERNITY_PARENTAL_CONSTANTS.NOTICE_WEEKS_BEFORE_COMMENCING_LEAVE, 6);
  assert.equal(ALBERTA_MATERNITY_PARENTAL_CONSTANTS.NOTICE_WEEKS_BEFORE_RETURNING_TO_WORK, 4);
});

test('Alberta Maternity & Parental - Compliant combined leave scenario', () => {
  const result = evaluateAlbertaMaternityParentalLeave({
    leaveType: 'COMBINED_MATERNITY_PARENTAL',
    consecutiveDaysOfEmployment: 180,
    maternityWeeksRequested: 16,
    parentalWeeksRequested: 62,
    noticeWeeksProvidedBeforeLeave: 6,
    medicalCertificateProvided: true,
    noticeWeeksProvidedBeforeReturn: 4,
    employerRefusesReinstatement: false,
    employerDisciplinedOrDismissedDueToLeave: false
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_LEAVE_AND_JOB_PROTECTION');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.leaveEntitlementSummary.statutoryMaxCombinedWeeks, 78);
  assert.equal(result.leaveEntitlementSummary.isReinstatementMandatory, true);
});

test('Alberta Maternity & Parental - Ineligible with under 90 days service', () => {
  const result = evaluateAlbertaMaternityParentalLeave({
    leaveType: 'MATERNITY_ONLY',
    consecutiveDaysOfEmployment: 60
  });

  assert.equal(result.meets90DayThreshold, false);
  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_SERVICE_DAYS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'ACCRUE_REMAINING_SERVICE_DAYS'));
});

test('Alberta Maternity & Parental - Employer refuses reinstatement (s. 53 violation)', () => {
  const result = evaluateAlbertaMaternityParentalLeave({
    consecutiveDaysOfEmployment: 365,
    employerRefusesReinstatement: true
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_EMPLOYER_LEAVE_OR_REINSTATEMENT_BREACH');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_DENIAL_OF_JOB_REINSTATEMENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_EMPLOYMENT_STANDARDS_REINSTATEMENT_ORDER'));
});

test('Alberta Maternity & Parental - Reprisal dismissal for taking leave (s. 53.1 violation)', () => {
  const result = evaluateAlbertaMaternityParentalLeave({
    consecutiveDaysOfEmployment: 300,
    employerDisciplinedOrDismissedDueToLeave: true
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_EMPLOYER_LEAVE_OR_REINSTATEMENT_BREACH');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_REPRISAL_PREGNANCY_PARENTAL_LEAVE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_ALBERTA_HUMAN_RIGHTS_COMPLAINT_GENDER'));
});
