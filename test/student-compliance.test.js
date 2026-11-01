// test/student-compliance.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateStudentWorkCompliance,
  STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP,
  MAX_AUTHORIZED_LEAVE_DAYS,
  ENROLLMENT_STATUS_TYPES
} from '../src/student-compliance.js';

describe('International Student 24-Hour Work Rule & Study Permit Compliance Engine', () => {
  it('statutory constants reflect Fall 2024 reform standards', () => {
    assert.equal(STATUTORY_OFF_CAMPUS_WEEKLY_HOUR_CAP, 24);
    assert.equal(MAX_AUTHORIZED_LEAVE_DAYS, 150);
    assert.equal(ENROLLMENT_STATUS_TYPES.FULL_TIME, 'full_time');
    assert.equal(ENROLLMENT_STATUS_TYPES.FINAL_SEMESTER_PART_TIME, 'final_semester_part_time');
    assert.equal(ENROLLMENT_STATUS_TYPES.SCHEDULED_BREAK, 'scheduled_break');
  });

  it('audits a fully compliant student working 20 hours per week in university degree', () => {
    const res = evaluateStudentWorkCompliance({
      enrollmentStatus: 'full_time',
      weeklyHoursWorked: 20,
      isDliDesignated: true,
      hasSocialInsuranceNumber: true,
      studyPermitConditionAllowsWork: true,
      hasMaintainedContinuousFullTimeEnrollment: true,
      programType: 'university_degree',
      officialLanguageClbScore: 8
    });

    assert.equal(res.complianceVerdict, 'FULLY_COMPLIANT');
    assert.equal(res.isWorkAuthorized, true);
    assert.equal(res.weeklyHoursWorked, 20);
    assert.equal(res.maxPermittedHoursThisWeek, 24);
    assert.equal(res.statutoryViolations.length, 0);
    assert.equal(res.pgwpEligibilityRisks.length, 0);
    assert.ok(res.summaryHeadline.includes('Fully Compliant'));
  });

  it('strictly catches exceeding the 24-hour cap during regular academic session', () => {
    const res = evaluateStudentWorkCompliance({
      enrollmentStatus: 'full_time',
      weeklyHoursWorked: 26, // 2 hours over cap
      isDliDesignated: true,
      hasSocialInsuranceNumber: true,
      studyPermitConditionAllowsWork: true
    });

    assert.equal(res.complianceVerdict, 'NON_COMPLIANT_UNAUTHORIZED_WORK');
    assert.equal(res.isWorkAuthorized, false);
    assert.equal(res.statutoryViolations.length, 1);
    assert.ok(res.statutoryViolations[0].rule.includes('Statutory 24-Hour Off-Campus Cap Exceeded (+2 hrs)'));
    assert.ok(res.pgwpEligibilityRisks.some(r => r.includes('IRPA s. 200(3)(e)')));
  });

  it('allows 40 hours per week during scheduled academic breaks', () => {
    const res = evaluateStudentWorkCompliance({
      enrollmentStatus: 'scheduled_break',
      weeklyHoursWorked: 40,
      isDliDesignated: true,
      hasSocialInsuranceNumber: true,
      studyPermitConditionAllowsWork: true
    });

    assert.equal(res.complianceVerdict, 'FULLY_COMPLIANT');
    assert.equal(res.isWorkAuthorized, true);
    assert.equal(res.maxPermittedHoursThisWeek, 40);
    assert.equal(res.statutoryViolations.length, 0);
  });

  it('bars any off-campus work during regular part-time studies (except final semester)', () => {
    const res = evaluateStudentWorkCompliance({
      enrollmentStatus: 'part_time',
      weeklyHoursWorked: 10,
      isDliDesignated: true,
      hasSocialInsuranceNumber: true,
      studyPermitConditionAllowsWork: true
    });

    assert.equal(res.complianceVerdict, 'NON_COMPLIANT_UNAUTHORIZED_WORK');
    assert.equal(res.isWorkAuthorized, false);
    assert.equal(res.maxPermittedHoursThisWeek, 0);
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Part-Time Studies')));
  });

  it('recognizes statutory final semester part-time exemption allowing up to 24 hours', () => {
    const res = evaluateStudentWorkCompliance({
      enrollmentStatus: 'final_semester_part_time',
      weeklyHoursWorked: 20,
      isDliDesignated: true,
      hasSocialInsuranceNumber: true,
      studyPermitConditionAllowsWork: true,
      officialLanguageClbScore: 7
    });

    assert.equal(res.complianceVerdict, 'FULLY_COMPLIANT');
    assert.equal(res.isWorkAuthorized, true);
    assert.equal(res.maxPermittedHoursThisWeek, 24);
    assert.equal(res.statutoryViolations.length, 0);
  });

  it('enforces authorized leave of absence rules (no work, 150-day maximum)', () => {
    // Compliant leave
    const okLeave = evaluateStudentWorkCompliance({
      enrollmentStatus: 'authorized_leave',
      weeklyHoursWorked: 0,
      hasAuthorizedLeaveApprovalLetter: true,
      leaveDurationDays: 90
    });
    assert.equal(okLeave.statutoryViolations.length, 0);
    assert.equal(okLeave.maxPermittedHoursThisWeek, 0);

    // Violation: working during leave + leave exceeding 150 days
    const badLeave = evaluateStudentWorkCompliance({
      enrollmentStatus: 'authorized_leave',
      weeklyHoursWorked: 15,
      hasAuthorizedLeaveApprovalLetter: false,
      leaveDurationDays: 180
    });
    assert.equal(badLeave.complianceVerdict, 'NON_COMPLIANT_UNAUTHORIZED_WORK');
    assert.ok(badLeave.statutoryViolations.some(v => v.rule.includes('Work Prohibited During Authorized Leave')));
    assert.ok(badLeave.statutoryViolations.some(v => v.rule.includes('Exceeds Statutory 150-Day Limit')));
    assert.ok(badLeave.statutoryViolations.some(v => v.rule.includes('Missing Official DLI Leave Authorization Letter')));
  });

  it('detects 2024 PGWP risks for college diploma programs outside priority shortages or low CLB', () => {
    const res = evaluateStudentWorkCompliance({
      enrollmentStatus: 'full_time',
      weeklyHoursWorked: 15,
      isDliDesignated: true,
      hasSocialInsuranceNumber: true,
      studyPermitConditionAllowsWork: true,
      programType: 'college_diploma',
      isFieldOfStudyInPriorityShortage: false, // General business/marketing
      officialLanguageClbScore: 4 // Requires CLB 5
    });

    assert.equal(res.complianceVerdict, 'CURRENTLY_LEGAL_PGWP_AT_RISK');
    assert.equal(res.isWorkAuthorized, true);
    assert.equal(res.statutoryViolations.length, 0);
    assert.equal(res.pgwpEligibilityRisks.length, 2);
    assert.ok(res.pgwpEligibilityRisks.some(r => r.includes('Field of Study Restriction')));
    assert.ok(res.pgwpEligibilityRisks.some(r => r.includes('Language Proficiency Below Benchmark')));
  });

  it('prohibits off-campus work for ESL/FSL language students (IRPR s. 186(v)(iii))', () => {
    const res = evaluateStudentWorkCompliance({
      programType: 'language_esl',
      weeklyHoursWorked: 10
    });

    assert.equal(res.complianceVerdict, 'NON_COMPLIANT_UNAUTHORIZED_WORK');
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('ESL Exclusion')));
  });
});
