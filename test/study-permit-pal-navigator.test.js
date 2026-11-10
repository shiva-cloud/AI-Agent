import test from 'node:test';
import assert from 'node:assert/strict';
import { auditStudyPermitAndPal, PROGRAM_LEVELS, INSTITUTION_TYPES, STATUTORY_CONSTANTS } from '../src/study-permit-pal-navigator.js';

test('Study Permit & PAL Navigator — Input validation', () => {
  assert.throws(() => auditStudyPermitAndPal(null), /must be a valid object/);
  assert.throws(() => auditStudyPermitAndPal({ applicationDate: '2026-11-06',}), /Invalid programLevel/);
  assert.throws(() => auditStudyPermitAndPal({ applicationDate: '2026-11-06', programLevel: 'unknown' }), /Invalid programLevel/);
});

test('Study Permit & PAL Navigator — K-12 and In-Canada Extensions are exempt from PAL', () => {
  const k12 = auditStudyPermitAndPal({ applicationDate: '2026-11-06', programLevel: PROGRAM_LEVELS.K_12 });
  assert.equal(k12.palAssessment.isPalRequired, false);
  assert.ok(k12.palAssessment.reason.includes('IRPR s. 211.1(2)'));

  const extension = auditStudyPermitAndPal({ applicationDate: '2026-11-06',
    programLevel: PROGRAM_LEVELS.UNDERGRADUATE_DEGREE,
    isExtensionWithinCanada: true
  });
  assert.equal(extension.palAssessment.isPalRequired, false);
  assert.ok(extension.palAssessment.reason.includes('IRPR s. 217'));
});

test('Study Permit & PAL Navigator — University Bachelor degree holder with CLB 7 qualifies for PGWP', () => {
  const result = auditStudyPermitAndPal({ applicationDate: '2026-11-06',
    programLevel: PROGRAM_LEVELS.UNDERGRADUATE_DEGREE,
    institutionType: INSTITUTION_TYPES.PUBLIC_UNIVERSITY,
    fieldOfStudy: 'General Arts',
    languageScoreClb: 7,
    firstYearTuition: 25000,
    accompanyingDependents: 0
  });

  assert.equal(result.palAssessment.isPalRequired, true);
  assert.equal(result.pgwpEligibility.isEligible, true);
  assert.equal(result.pgwpEligibility.requiredClb, 7);
  assert.equal(result.pgwpEligibility.riskFlags.length, 0);
  assert.equal(result.offCampusWork.weeklyHoursLimit, 24);
  assert.equal(result.financialProof.firstYearTuition, 25000);
  assert.equal(result.financialProof.costOfLivingRequired, STATUTORY_CONSTANTS.BASE_COST_OF_LIVING_SINGLE);
  assert.equal(result.financialProof.totalProofRequiredCad, 25000 + 23448 + 1500);
});

test('Study Permit & PAL Navigator — College Diploma outside priority fields is barred from PGWP under Nov 2024 rules', () => {
  const ineligibleCollege = auditStudyPermitAndPal({ applicationDate: '2026-11-06',
    programLevel: PROGRAM_LEVELS.COLLEGE_DIPLOMA,
    institutionType: INSTITUTION_TYPES.PUBLIC_COLLEGE,
    fieldOfStudy: 'Business Administration',
    languageScoreClb: 6
  });

  assert.equal(ineligibleCollege.pgwpEligibility.isEligible, false);
  assert.ok(ineligibleCollege.pgwpEligibility.riskFlags.some(f => f.includes('Nov 1, 2024 Rule')));

  const eligibleCollege = auditStudyPermitAndPal({ applicationDate: '2026-11-06',
    programLevel: PROGRAM_LEVELS.COLLEGE_DIPLOMA,
    institutionType: INSTITUTION_TYPES.PUBLIC_COLLEGE,
    fieldOfStudy: 'Practical Nursing (Healthcare)',
    languageScoreClb: 6
  });

  assert.equal(eligibleCollege.pgwpEligibility.isEligible, true);
  assert.equal(eligibleCollege.pgwpEligibility.priorityFieldMatch, true);
});

test('Study Permit & PAL Navigator — Private curriculum licensing partnerships are strictly barred from PGWP', () => {
  const pvtLicensing = auditStudyPermitAndPal({ applicationDate: '2026-11-06',
    programLevel: PROGRAM_LEVELS.COLLEGE_DIPLOMA,
    institutionType: INSTITUTION_TYPES.PRIVATE_CURRICULUM_LICENSING,
    fieldOfStudy: 'Computer Programming (STEM)',
    languageScoreClb: 8
  });

  assert.equal(pvtLicensing.pgwpEligibility.isEligible, false);
  assert.ok(pvtLicensing.pgwpEligibility.riskFlags.some(f => f.includes('May 15, 2024')));
});

test('Study Permit & PAL Navigator — Enforces 24-hour in-study work limit and calculates family dependent finances', () => {
  const inSession = auditStudyPermitAndPal({ applicationDate: '2026-11-06',
    programLevel: PROGRAM_LEVELS.MASTERS_DEGREE,
    inStudySession: true,
    firstYearTuition: 15000,
    accompanyingDependents: 2
  });

  assert.equal(inSession.offCampusWork.currentAllowedHours, 24);
  assert.ok(inSession.offCampusWork.legalWarning.includes('Exceeding 24 hours'));
  // Living expenses: single (23448) + first dep (5055) + second dep (3821) = 29511
  assert.equal(inSession.financialProof.costOfLivingRequired, 35888);
  assert.equal(inSession.financialProof.estimatedTravel, 1500 * 3);
  assert.equal(inSession.financialProof.totalProofRequiredCad, 15000 + 35888 + 4500);

  const onBreak = auditStudyPermitAndPal({ applicationDate: '2026-11-06',
    programLevel: PROGRAM_LEVELS.MASTERS_DEGREE,
    inStudySession: false
  });
  assert.equal(onBreak.offCampusWork.currentAllowedHours, 'unlimited');
});
