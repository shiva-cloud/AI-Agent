import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_YOUTH_CONSTANTS,
  evaluateAlbertaYouthEmploymentRules
} from '../src/alberta-employment-youth-employment-rules-navigator.js';

test('Alberta Youth Employment - Constants reflect Code & Reg 211/2004', () => {
  assert.equal(ALBERTA_YOUTH_CONSTANTS.MIN_AGE_WITHOUT_SPECIAL_PERMIT, 13);
  assert.equal(ALBERTA_YOUTH_CONSTANTS.ADOLESCENT_MAX_SCHOOL_DAY_HOURS, 2);
  assert.equal(ALBERTA_YOUTH_CONSTANTS.ADOLESCENT_MAX_NON_SCHOOL_DAY_HOURS, 8);
  assert.ok(ALBERTA_YOUTH_CONSTANTS.PERMISSIBLE_LIGHT_WORK_13_14.includes('RETAIL_CLERK'));
});

test('Alberta Youth Employment - Compliant 14-year-old retail clerk working 2 hours on school day', () => {
  const result = evaluateAlbertaYouthEmploymentRules({
    employeeAge: 14,
    jobCategory: 'RETAIL_CLERK',
    hasWrittenParentalConsent: true,
    isSchoolDay: true,
    scheduledShiftHours: 2,
    shiftStartHour: 16,
    shiftEndHour: 18,
    duringSchoolHours: false
  });

  assert.equal(result.isCompliant, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_YOUTH_EMPLOYMENT');
  assert.equal(result.statutoryViolations.length, 0);
});

test('Alberta Youth Employment - Child under 13 employed illegally without permit', () => {
  const result = evaluateAlbertaYouthEmploymentRules({
    employeeAge: 12
  });

  assert.equal(result.isCompliant, false);
  assert.equal(result.complianceStatus, 'UNLAWFUL_YOUTH_EMPLOYMENT_BREACH');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'CHILD_UNDER_13_EMPLOYMENT_PROHIBITED'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'CEASE_EMPLOYMENT_OR_OBTAIN_DIRECTOR_PERMIT'));
});

test('Alberta Youth Employment - 14-year-old scheduled for 4 hours on school day (exceeds 2h cap)', () => {
  const result = evaluateAlbertaYouthEmploymentRules({
    employeeAge: 14,
    isSchoolDay: true,
    scheduledShiftHours: 4,
    hasWrittenParentalConsent: true
  });

  assert.equal(result.isCompliant, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'EXCEEDED_MAXIMUM_ADOLESCENT_SHIFT_HOURS'));
});

test('Alberta Youth Employment - 14-year-old scheduled to work until 10:00 PM (night prohibition)', () => {
  const result = evaluateAlbertaYouthEmploymentRules({
    employeeAge: 14,
    hasWrittenParentalConsent: true,
    shiftStartHour: 18,
    shiftEndHour: 22
  });

  assert.equal(result.isCompliant, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROHIBITED_ADOLESCENT_NIGHT_WORK'));
});

test('Adolescent shift boundaries include overnight work and fractional hours', () => {
  for (const [start, end, night] of [[20, 21, false], [6, 8, false], [20, 21.5, true], [23, 1, true], [5.5, 6, true]]) {
    const audit = evaluateAlbertaYouthEmploymentRules({ shiftStartHour: start, shiftEndHour: end });
    assert.equal(audit.statutoryViolations.some(v => v.rule === 'PROHIBITED_ADOLESCENT_NIGHT_WORK'), night);
  }
});

test('Explicit false does not grant consent and invalid facts cannot generate a verdict', () => {
  const result = evaluateAlbertaYouthEmploymentRules({ hasWrittenParentalConsent: 'false', duringSchoolHours: 'false' });
  assert.deepEqual(result.statutoryViolations.map(v => v.rule), ['MISSING_WRITTEN_PARENTAL_CONSENT']);
  for (const value of [{ employeeAge: 14.5 }, { assessmentDate: '2026-02-30' }, { adultSupervisionPresent: 'maybe' }, { shiftEndHour: 25 }]) {
    assert.throws(() => evaluateAlbertaYouthEmploymentRules(value), error => error.statusCode === 400);
  }
});

test('Adult inputs are outside the youth assessment', () => {
  const audit = evaluateAlbertaYouthEmploymentRules({ employeeAge: 18 });
  assert.equal(audit.complianceStatus, 'YOUTH_EMPLOYMENT_RULES_NOT_APPLICABLE');
  assert.equal(audit.regulationsSummary.maxDailyHours, null);
});
