import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_JUST_CAUSE_CONSTANTS,
  auditAlbertaTerminationJustCause
} from '../src/alberta-employment-termination-just-cause-audit-navigator.js';

test('Alberta Just Cause - Constants reflect ESC ss. 55-58 and McKinley', () => {
  assert.equal(ALBERTA_JUST_CAUSE_CONSTANTS.MAX_STATUTORY_TERMINATION_NOTICE_WEEKS, 8);
  assert.equal(ALBERTA_JUST_CAUSE_CONSTANTS.SUPREME_COURT_AUTHORITY, 'McKinley v. BC Tel, 2001 SCC 38');
});

test('Alberta Just Cause - Gross theft/fraud establishes probable cause without progressive discipline', () => {
  const result = auditAlbertaTerminationJustCause({
    allegedMisconductCategory: 'CRIMINAL_THEFT_FRAUD',
    yearsOfContinuousService: 5,
    regularWeeklyWageCad: 1000
  });

  assert.equal(result.isJustCauseEstablished, true);
  assert.equal(result.causeDefensibilityVerdict, 'PROBABLE_JUST_CAUSE_ESTABLISHED');
  assert.equal(result.complianceStatus, 'JUST_CAUSE_SUPPORTABLE_UNDER_MCKINLEY');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.statutoryNoticeScale.statutoryTerminationPayEntitledCad, 0);
});

test('Alberta Just Cause - Performance issues without warnings fails McKinley test', () => {
  const result = auditAlbertaTerminationJustCause({
    allegedMisconductCategory: 'PERFORMANCE_ISSUES',
    employerIssuedPriorWrittenWarnings: false,
    employeeGivenOpportunityToImprove: false,
    yearsOfContinuousService: 5, // 4 weeks notice under s. 56
    regularWeeklyWageCad: 1200
  });

  assert.equal(result.isJustCauseEstablished, false);
  assert.equal(result.causeDefensibilityVerdict, 'UNSUSTAINABLE_CAUSE_LACKS_PROGRESSIVE_DISCIPLINE');
  assert.equal(result.complianceStatus, 'JUST_CAUSE_DEFECTIVE_TERMINATION_PAY_OWED');
  assert.equal(result.statutoryNoticeScale.noticeShortfallWeeks, 4);
  assert.equal(result.statutoryNoticeScale.statutoryTerminationPayEntitledCad, 4800);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_DENIAL_OF_STATUTORY_TERMINATION_PAY'));
  assert.ok(result.legalVulnerabilities.some(v => v.vulnerability === 'NO_PROGRESSIVE_DISCIPLINE_FOR_MINOR_DEFICIT'));
});

test('Alberta Just Cause - Documented warnings and PIP support cause for performance issues', () => {
  const result = auditAlbertaTerminationJustCause({
    allegedMisconductCategory: 'PERFORMANCE_ISSUES',
    employerIssuedPriorWrittenWarnings: true,
    employeeGivenOpportunityToImprove: true,
    yearsOfContinuousService: 3
  });

  assert.equal(result.isJustCauseEstablished, true);
  assert.equal(result.causeDefensibilityVerdict, 'ARGUABLE_CAUSE_WITH_PROGRESSIVE_DISCIPLINE');
});

test('Alberta Just Cause - 10-year employee with failed cause receives 8 weeks pay', () => {
  const result = auditAlbertaTerminationJustCause({
    allegedMisconductCategory: 'ATTENDANCE_LATENESS',
    employerIssuedPriorWrittenWarnings: false,
    yearsOfContinuousService: 11,
    regularWeeklyWageCad: 1000
  });

  assert.equal(result.statutoryNoticeScale.statutoryNoticeWeeks, 8);
  assert.equal(result.statutoryNoticeScale.statutoryTerminationPayEntitledCad, 8000);
});
