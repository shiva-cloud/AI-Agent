import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBcChildYouthEmployment,
  BC_LIGHT_WORK_ACTIVITIES,
  BC_HAZARDOUS_WORK_ACTIVITIES
} from '../src/british-columbia-employment-child-youth-employment-navigator.js';

test('BC Youth Employment - Fully Compliant 13-year-old Light Work', () => {
  const result = evaluateBcChildYouthEmployment({
    childAge: 13,
    proposedOccupationActivity: 'RETAIL_CASHIER_OR_STOCKING',
    hasParentalConsentInWriting: true,
    dailyHoursOnSchoolDay: 3, // <= 4
    dailyHoursOnNonSchoolDay: 6, // <= 7
    weeklyHoursDuringSchoolWeek: 15, // <= 20
    hasAdultSupervisionOnSite: true
  });

  assert.equal(result.isCompliant, true);
  assert.equal(result.legalVerdict, 'STATUTORILY_AUTHORIZED_CHILD_EMPLOYMENT');
  assert.equal(result.statutoryViolations.length, 0);
});

test('BC Youth Employment - 10-year-old child employed without Director permit', () => {
  const result = evaluateBcChildYouthEmployment({
    childAge: 10,
    hasDirectorChildEmploymentPermit: false
  });

  assert.equal(result.isCompliant, false);
  assert.equal(result.legalVerdict, 'UNLAWFUL_CHILD_OR_YOUTH_EMPLOYMENT');
  assert.ok(result.statutoryViolations.some(v => v.violation === 'UNLAWFUL_EMPLOYMENT_CHILD_UNDER_12'));
});

test('BC Youth Employment - 14-year-old assigned to prohibited construction site work', () => {
  const result = evaluateBcChildYouthEmployment({
    childAge: 14,
    proposedOccupationActivity: 'CONSTRUCTION_SITE_WORK'
  });

  assert.equal(result.isCompliant, false);
  assert.ok(result.statutoryViolations.some(v => v.violation === 'UNLAWFUL_HAZARDOUS_WORK_YOUTH_UNDER_16'));
});

test('BC Youth Employment - 13-year-old exceeding daily and weekly school hour caps', () => {
  const result = evaluateBcChildYouthEmployment({
    childAge: 13,
    proposedOccupationActivity: 'RETAIL_CASHIER_OR_STOCKING',
    hasParentalConsentInWriting: true,
    dailyHoursOnSchoolDay: 6, // Exceeds 4
    weeklyHoursDuringSchoolWeek: 25, // Exceeds 20
    hasAdultSupervisionOnSite: false // Missing supervision
  });

  assert.equal(result.isCompliant, false);
  assert.ok(result.statutoryViolations.some(v => v.violation === 'EXCEEDED_SCHOOL_DAY_MAX_HOURS'));
  assert.ok(result.statutoryViolations.some(v => v.violation === 'EXCEEDED_SCHOOL_WEEK_MAX_HOURS'));
  assert.ok(result.statutoryViolations.some(v => v.violation === 'LACK_OF_DIRECT_ADULT_SUPERVISION'));
});

test('BC Youth Employment - Verify Constants Lists', () => {
  assert.ok(BC_LIGHT_WORK_ACTIVITIES.includes('PEER_TUTORING'));
  assert.ok(BC_HAZARDOUS_WORK_ACTIVITIES.includes('UNDERGROUND_MINING'));
});

test('BC youth assessment distinguishes reported permits from light work', () => {
  const child = evaluateBcChildYouthEmployment({ childAge: 11, hasDirectorChildEmploymentPermit: 'false' });
  assert.equal(child.isCompliant, false);
  assert.equal(child.hoursAudit.maxSchoolDayHoursPermitted, null);
  const permitted = evaluateBcChildYouthEmployment({ childAge: 12, proposedOccupationActivity: 'OTHER', hasDirectorChildEmploymentPermit: true });
  assert.ok(permitted.complianceChecklist.some(entry => entry.item === 'DIRECTORS_PERMIT_NON_LIGHT_WORK'));
  assert.ok(!permitted.complianceChecklist.some(entry => entry.item === 'LIGHT_WORK_COMPLIANCE'));
});

test('Daily and weekly limits include the exact boundary and detect fractional excess', () => {
  const atLimit = { childAge: 13, dailyHoursOnSchoolDay: 4, dailyHoursOnNonSchoolDay: 7, weeklyHoursDuringSchoolWeek: 20 };
  assert.equal(evaluateBcChildYouthEmployment(atLimit).isCompliant, true);
  for (const field of ['dailyHoursOnSchoolDay', 'dailyHoursOnNonSchoolDay', 'weeklyHoursDuringSchoolWeek']) {
    assert.equal(evaluateBcChildYouthEmployment({ ...atLimit, [field]: atLimit[field] + 0.25 }).isCompliant, false);
  }
});

test('Unsupported ages, unclassified youth activities and malformed inputs are rejected', () => {
  for (const input of [null, [], false, { childAge: 19 }, { childAge: 13.5 }, { childAge: 14, proposedOccupationActivity: 'UNKNOWN' },
    { assessmentDate: '2026-02-30' }, { dailyHoursOnSchoolDay: true }, { hasAdultSupervisionOnSite: 'maybe' }]) {
    assert.throws(() => evaluateBcChildYouthEmployment(input), error => error.statusCode === 400);
  }
});
