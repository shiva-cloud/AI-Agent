// test/saskatchewan-sinp-hard-to-fill-navigator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSinpHardToFillSkills,
  SINP_ELIGIBILITY_RULES
} from '../src/saskatchewan-sinp-hard-to-fill-navigator.js';

test('SINP Hard-to-Fill Navigator — Constants match Saskatchewan immigration rules', () => {
  assert.equal(SINP_ELIGIBILITY_RULES.MIN_CONTINUOUS_WORK_MONTHS_SK, 6);
  assert.equal(SINP_ELIGIBILITY_RULES.MIN_LANGUAGE_CLB, 4);
  assert.deepEqual(SINP_ELIGIBILITY_RULES.QUALIFYING_TEER_LEVELS, [4, 5]);
  assert.ok(SINP_ELIGIBILITY_RULES.DESIGNATED_SECTOR_NOCS.includes('65201'));
});

test('SINP Hard-to-Fill Navigator — Fully compliant candidate qualifies', () => {
  const result = evaluateSinpHardToFillSkills({
    nocCode: '65201',
    workExperienceMonthsInSaskatchewan: 8,
    languageClbLevel: 5,
    hasSaskatchewanJobApprovalLetter: true,
    hasPermanentFullTimeOffer: true,
    highestEducation: 'secondary_school',
    hasEducationalCredentialAssessment: true,
    teerLevel: 5,
    isValidWorkPermitHeld: true,
    applicantName: 'Tariq Al-Mansoor'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityStatus, 'QUALIFIED_FOR_SINP_NOMINATION');
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.compliancePoints.length >= 6);
  assert.match(result.summary, /Tariq Al-Mansoor meets statutory criteria/);
});

test('SINP Hard-to-Fill Navigator — Detects missing JAL as critical deficiency', () => {
  const result = evaluateSinpHardToFillSkills({
    nocCode: '95106',
    workExperienceMonthsInSaskatchewan: 9,
    languageClbLevel: 4,
    hasSaskatchewanJobApprovalLetter: false, // Missing JAL
    hasPermanentFullTimeOffer: true,
    highestEducation: 'secondary_school',
    hasEducationalCredentialAssessment: true,
    teerLevel: 5,
    isValidWorkPermitHeld: true
  });

  assert.equal(result.isEligible, false);
  const jalDeficiency = result.deficiencies.find(d => d.rule.includes('JAL'));
  assert.ok(jalDeficiency);
  assert.equal(jalDeficiency.severity, 'CRITICAL');
  assert.match(jalDeficiency.statutoryRef, /FWRISA/);
});

test('SINP Hard-to-Fill Navigator — Flags under-6-month experience and low CLB', () => {
  const result = evaluateSinpHardToFillSkills({
    nocCode: '75110',
    workExperienceMonthsInSaskatchewan: 3, // Only 3 months
    languageClbLevel: 3, // Below CLB 4
    hasSaskatchewanJobApprovalLetter: true,
    hasPermanentFullTimeOffer: true,
    highestEducation: 'secondary_school',
    hasEducationalCredentialAssessment: true,
    teerLevel: 5,
    isValidWorkPermitHeld: true
  });

  assert.equal(result.isEligible, false);
  const expDef = result.deficiencies.find(d => d.rule.includes('Continuous SK Work'));
  const clbDef = result.deficiencies.find(d => d.rule.includes('Language'));
  assert.ok(expDef);
  assert.ok(clbDef);
  assert.ok(result.statutoryRemedies.some(r => r.includes('3 more month')));
});

test('SINP Hard-to-Fill Navigator — Identifies TEER 1 role as inappropriate for Hard-to-Fill stream', () => {
  const result = evaluateSinpHardToFillSkills({
    nocCode: '21231', // Software engineer (TEER 1)
    workExperienceMonthsInSaskatchewan: 12,
    languageClbLevel: 7,
    hasSaskatchewanJobApprovalLetter: true,
    hasPermanentFullTimeOffer: true,
    highestEducation: 'bachelors_or_higher',
    hasEducationalCredentialAssessment: true,
    teerLevel: 1, // TEER 1
    isValidWorkPermitHeld: true
  });

  assert.equal(result.isEligible, false);
  const teerDef = result.deficiencies.find(d => d.rule.includes('TEER'));
  assert.ok(teerDef);
  assert.match(teerDef.message, /targets intermediate and entry-level/);
  assert.ok(result.statutoryRemedies.some(r => r.includes('International Skilled Worker: Employment Offer')));
});
