import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PGWP_CONSTANTS,
  ELIGIBLE_FIELD_CATEGORIES,
  CREDENTIAL_LEVELS,
  evaluatePgwpEligibility,
  generatePgwpDocumentRoadmap
} from '../src/pgwp-eligibility-navigator.js';

test('PGWP Eligibility Navigator — Statutory constants match IRCC policy updates', () => {
  assert.equal(PGWP_CONSTANTS.POLICY_OVERHAUL_DATE, '2024-11-01');
  assert.equal(PGWP_CONSTANTS.MAX_DAYS_TO_APPLY, 180);
  assert.equal(PGWP_CONSTANTS.MIN_PROGRAM_MONTHS, 8);
  assert.equal(PGWP_CONSTANTS.FULL_PGWP_MONTHS, 36);
  assert.equal(PGWP_CONSTANTS.LANGUAGE_TEST_VALIDITY_DAYS, 730);
  assert.equal(PGWP_CONSTANTS.UNIVERSITY_MIN_CLB, 7);
  assert.equal(PGWP_CONSTANTS.COLLEGE_MIN_CLB, 5);

  assert.ok(ELIGIBLE_FIELD_CATEGORIES.healthcare);
  assert.ok(ELIGIBLE_FIELD_CATEGORIES.stem);
  assert.ok(ELIGIBLE_FIELD_CATEGORIES.trade);
  assert.ok(CREDENTIAL_LEVELS.bachelor_degree.isDegree);
  assert.equal(CREDENTIAL_LEVELS.college_diploma.minClb, 5);
});

test('PGWP Eligibility Navigator — Qualifies university degree graduate with CLB 7 regardless of field of study', () => {
  const result = evaluatePgwpEligibility({
    credentialLevel: 'bachelor_degree',
    programLengthMonths: 48,
    studyPermitApplicationDate: '2024-12-01',
    fieldOfStudyCategory: 'arts_humanities',
    languageTestType: 'ielts_general',
    clbLevel: 8,
    testDate: '2025-05-01',
    completionDate: '2026-05-15',
    assessmentDate: '2026-06-01',
    isDliEligible: true,
    isPublicOrLicensingCurriculum: true,
    heldPreviousPgwp: false,
    distanceLearningPercent: 0,
    hadValidStudyPermitAtCompletion: true,
    applicantName: 'Sarah Jenkins',
    institutionName: 'University of Toronto'
  });

  assert.equal(result.eligibleForPgwp, true);
  assert.equal(result.estimatedPgwpDurationMonths, 36);
  assert.equal(result.fieldOfStudyAudit.fieldOfStudyMet, true);
  assert.ok(result.fieldOfStudyAudit.exemptionReason.includes('University degree graduates'));
  assert.equal(result.languageAudit.languageRequirementMet, true);
  assert.equal(result.interimWorkRights.authorizedToWorkFullTimeImmediately, true);
  assert.equal(result.timingAudit.deadlineStatus, 'within_window');
  assert.equal(result.rejectionRisks.length, 0);
});

test('PGWP Eligibility Navigator — Qualifies Master’s degree graduates of 8+ months for full 3-year PGWP', () => {
  const result = evaluatePgwpEligibility({
    credentialLevel: 'master_degree',
    programLengthMonths: 12,
    studyPermitApplicationDate: '2025-01-10',
    fieldOfStudyCategory: 'finance',
    languageTestType: 'celpip_general',
    clbLevel: 7,
    testDate: '2025-08-01',
    completionDate: '2026-07-30',
    assessmentDate: '2026-08-15',
    isDliEligible: true,
    isPublicOrLicensingCurriculum: true,
    hadValidStudyPermitAtCompletion: true
  });

  assert.equal(result.eligibleForPgwp, true);
  assert.equal(result.estimatedPgwpDurationMonths, 36);
  assert.equal(result.fieldOfStudyAudit.fieldOfStudyMet, true);
});

test('PGWP Eligibility Navigator — Strictly rejects college diploma graduate with ineligible field of study after Nov 1, 2024', () => {
  const result = evaluatePgwpEligibility({
    credentialLevel: 'college_diploma',
    programLengthMonths: 24,
    studyPermitApplicationDate: '2024-11-15',
    fieldOfStudyCategory: 'business_administration',
    languageTestType: 'celpip_general',
    clbLevel: 6,
    testDate: '2025-06-01',
    completionDate: '2026-08-01',
    assessmentDate: '2026-09-01'
  });

  assert.equal(result.eligibleForPgwp, false);
  assert.equal(result.estimatedPgwpDurationMonths, 0);
  assert.equal(result.fieldOfStudyAudit.fieldOfStudyMet, false);
  assert.ok(result.rejectionRisks.some(r => r.includes('field of study must be in a national shortage category')));
});

test('PGWP Eligibility Navigator — Grandfathers college diploma graduate who applied for study permit prior to Nov 1, 2024', () => {
  const result = evaluatePgwpEligibility({
    credentialLevel: 'college_diploma',
    programLengthMonths: 24,
    studyPermitApplicationDate: '2024-08-15',
    fieldOfStudyCategory: 'business_administration',
    languageTestType: 'pte_core',
    clbLevel: 5,
    testDate: '2025-06-01',
    completionDate: '2026-08-01',
    assessmentDate: '2026-09-01'
  });

  assert.equal(result.eligibleForPgwp, true);
  assert.equal(result.estimatedPgwpDurationMonths, 36);
  assert.equal(result.fieldOfStudyAudit.fieldOfStudyMet, true);
  assert.ok(result.fieldOfStudyAudit.exemptionReason.includes('Grandfathered'));
});

test('PGWP Eligibility Navigator — Rejects applicants with language scores below threshold or expired tests', () => {
  // Low score for degree
  const lowScoreResult = evaluatePgwpEligibility({
    credentialLevel: 'bachelor_degree',
    programLengthMonths: 36,
    clbLevel: 6, // requires 7
    languageTestType: 'celpip_general',
    testDate: '2025-06-01',
    completionDate: '2026-08-01',
    assessmentDate: '2026-08-15'
  });
  assert.equal(lowScoreResult.eligibleForPgwp, false);
  assert.equal(lowScoreResult.languageAudit.languageRequirementMet, false);

  // Expired test (> 730 days)
  const expiredTestResult = evaluatePgwpEligibility({
    credentialLevel: 'college_diploma',
    programLengthMonths: 24,
    studyPermitApplicationDate: '2024-05-01',
    clbLevel: 7,
    languageTestType: 'ielts_general',
    testDate: '2024-01-01',
    completionDate: '2026-08-01',
    assessmentDate: '2026-09-01' // test is > 900 days old
  });
  assert.equal(expiredTestResult.eligibleForPgwp, false);
  assert.equal(expiredTestResult.languageAudit.languageTestExpired, true);
});

test('PGWP Eligibility Navigator — Strictly enforces one-time lifetime limit, 180-day deadline and distance learning caps', () => {
  // Previously held PGWP
  const prevResult = evaluatePgwpEligibility({
    heldPreviousPgwp: true,
    completionDate: '2026-08-01',
    assessmentDate: '2026-08-15'
  });
  assert.equal(prevResult.eligibleForPgwp, false);
  assert.ok(prevResult.rejectionRisks.some(r => r.includes('previously held a Post-Graduation Work Permit')));

  // Expired 180-day window
  const expiredResult = evaluatePgwpEligibility({
    completionDate: '2025-10-01',
    assessmentDate: '2026-08-15' // > 300 days
  });
  assert.equal(expiredResult.eligibleForPgwp, false);
  assert.equal(expiredResult.timingAudit.deadlineStatus, 'expired_180_days');

  // Excessive distance learning (> 50%)
  const distResult = evaluatePgwpEligibility({
    distanceLearningPercent: 65,
    completionDate: '2026-08-01',
    assessmentDate: '2026-08-15'
  });
  assert.equal(distResult.eligibleForPgwp, false);
  assert.ok(distResult.rejectionRisks.some(r => r.includes('Distance learning completed online')));

  // Roadmap generation
  const roadmap = generatePgwpDocumentRoadmap({
    applicantName: 'Alex Doe',
    credentialLevel: 'Master of Science',
    estimatedMonths: 36,
    interimWorkAuthorized: true
  });
  assert.ok(roadmap.includes('POST-GRADUATION WORK PERMIT (PGWP)'));
  assert.ok(roadmap.includes('IMM 5556'));
  assert.ok(roadmap.includes('IRPR s. 186(w)'));
});
