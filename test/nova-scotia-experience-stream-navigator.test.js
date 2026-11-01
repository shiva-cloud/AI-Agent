import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NSNP_EXPERIENCE_RULES,
  checkNsnpLanguageEligibility,
  evaluateNovaScotiaExperienceStream
} from '../src/nova-scotia-experience-stream-navigator.js';

test('NSNP Experience Rules Constants & language criteria', () => {
  assert.equal(NSNP_EXPERIENCE_RULES.MIN_AGE, 21);
  assert.equal(NSNP_EXPERIENCE_RULES.MAX_AGE, 55);
  assert.equal(NSNP_EXPERIENCE_RULES.MIN_EXPERIENCE_MONTHS, 12);
  assert.equal(NSNP_EXPERIENCE_RULES.MIN_EXPERIENCE_HOURS, 1560);
  assert.equal(NSNP_EXPERIENCE_RULES.MIN_CLB_TEER_0_1, 7);
  assert.equal(NSNP_EXPERIENCE_RULES.MIN_CLB_TEER_2_3, 5);

  // TEER 0/1 requires CLB 7
  assert.equal(checkNsnpLanguageEligibility(0, 6).isEligible, false);
  assert.equal(checkNsnpLanguageEligibility(1, 7).isEligible, true);

  // TEER 2/3 requires CLB 5
  assert.equal(checkNsnpLanguageEligibility(2, 4).isEligible, false);
  assert.equal(checkNsnpLanguageEligibility(3, 5).isEligible, true);
});

test('evaluateNovaScotiaExperienceStream confirms eligible Express Entry candidate', () => {
  const result = evaluateNovaScotiaExperienceStream({
    stream: 'nova_scotia_experience_express_entry',
    candidateAge: 28,
    nocCode: '21231',
    teerLevel: 1,
    monthsWorkedInNovaScotia: 14,
    hoursWorkedInNovaScotia: 1900,
    languageClbScore: 8,
    hasActiveExpressEntryProfile: true,
    hasValidWorkPermitDuringExperience: true,
    hasSecondarySchoolOrEca: true,
    hasIntentToResideInNovaScotia: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityStatus, 'ELIGIBLE_FOR_NSNP_EXPERIENCE_EXPRESS_ENTRY');
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Accept Federal +600 CRS')));
});

test('evaluateNovaScotiaExperienceStream catches inadequate hours and language shortfall', () => {
  const result = evaluateNovaScotiaExperienceStream({
    stream: 'nova_scotia_experience_express_entry',
    candidateAge: 30,
    nocCode: '21231',
    teerLevel: 1,
    monthsWorkedInNovaScotia: 10, // Shortfall (< 12)
    hoursWorkedInNovaScotia: 1200, // Shortfall (< 1560)
    languageClbScore: 6, // Shortfall (TEER 1 requires CLB 7)
    hasActiveExpressEntryProfile: true,
    hasValidWorkPermitDuringExperience: true,
    hasSecondarySchoolOrEca: true,
    hasIntentToResideInNovaScotia: true
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityStatus, 'INELIGIBLE');
  assert.ok(result.deficiencies.some(d => d.includes('Inadequate Nova Scotia work experience')));
  assert.ok(result.deficiencies.some(d => d.includes('Language benchmark shortfall')));
});

test('evaluateNovaScotiaExperienceStream confirms eligible Physician Stream candidate', () => {
  const result = evaluateNovaScotiaExperienceStream({
    stream: 'physician_stream',
    candidateAge: 39,
    nocCode: '31102', // Family Physician
    hasSignedReturnOfServiceWithNshOrIwk: true,
    hasCpsnsLicensureOrAssessment: true,
    hasIntentToResideInNovaScotia: true,
    candidateName: 'Dr. Emily Vance'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityStatus, 'ELIGIBLE_FOR_NSNP_PHYSICIAN_STREAM');
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.compliancePoints.some(c => c.includes('CPSNS')));
});

test('evaluateNovaScotiaExperienceStream rejects physician without Return of Service agreement', () => {
  const result = evaluateNovaScotiaExperienceStream({
    stream: 'physician_stream',
    candidateAge: 42,
    nocCode: '31100',
    hasSignedReturnOfServiceWithNshOrIwk: false, // Missing RoS
    hasCpsnsLicensureOrAssessment: true,
    hasIntentToResideInNovaScotia: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('Return of Service (RoS) agreement')));
});
