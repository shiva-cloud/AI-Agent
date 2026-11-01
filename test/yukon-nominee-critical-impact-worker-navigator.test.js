import test from 'node:test';
import assert from 'node:assert/strict';
import {
  YUKON_CRITICAL_IMPACT_RULES,
  evaluateYukonCriticalImpactWorker
} from '../src/yukon-nominee-critical-impact-worker-navigator.js';

test('Yukon Critical Impact Rules Constants', () => {
  assert.equal(YUKON_CRITICAL_IMPACT_RULES.MIN_WORK_EXPERIENCE_MONTHS, 6);
  assert.equal(YUKON_CRITICAL_IMPACT_RULES.LOOKBACK_WINDOW_YEARS, 10);
  assert.equal(YUKON_CRITICAL_IMPACT_RULES.MIN_WEEKLY_HOURS, 30);
  assert.equal(YUKON_CRITICAL_IMPACT_RULES.MIN_CLB_SCORE, 4);
  assert.deepEqual(YUKON_CRITICAL_IMPACT_RULES.ELIGIBLE_TEER_LEVELS, [4, 5]);
  assert.equal(YUKON_CRITICAL_IMPACT_RULES.TERRITORY, 'YT');
});

test('evaluateYukonCriticalImpactWorker confirms eligible candidate for Critical Impact Worker', () => {
  const result = evaluateYukonCriticalImpactWorker({
    targetNocTeer: 4,
    nocCode: '65201',
    monthsOfRelatedExperience: 8,
    hasPermanentFullTimeOffer: true,
    weeklyOfferedHours: 35,
    hourlyWageCad: 19.0,
    employerOperatingYearsInYukon: 2,
    employerRecruitmentAdvertisedWeeks: 4,
    languageClbScore: 5,
    hasHighSchoolOrEca: true,
    currentStatusInCanada: 'work_permit',
    candidateName: 'Maria Santos'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityStatus, 'ELIGIBLE_FOR_YUKON_CRITICAL_IMPACT_NOMINATION');
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Joint Employer-Candidate YNP Submission')));
});

test('evaluateYukonCriticalImpactWorker confirms Yukon Community Pilot endorsement', () => {
  const result = evaluateYukonCriticalImpactWorker({
    targetNocTeer: 5,
    nocCode: '65310',
    monthsOfRelatedExperience: 12,
    hasPermanentFullTimeOffer: true,
    weeklyOfferedHours: 40,
    employerOperatingYearsInYukon: 3,
    employerRecruitmentAdvertisedWeeks: 5,
    languageClbScore: 4,
    hasHighSchoolOrEca: true,
    currentStatusInCanada: 'work_permit',
    targetCommunity: 'Dawson City',
    isApplyingForCommunityPilot: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.isCommunityPilotEndorsed, true);
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('LMIA Exemption A75')));
});

test('evaluateYukonCriticalImpactWorker catches insufficient work experience and TEER 1 ineligibility', () => {
  const result = evaluateYukonCriticalImpactWorker({
    targetNocTeer: 1, // Ineligible for Critical Impact (must be TEER 4/5)
    monthsOfRelatedExperience: 3, // Inadequate (< 6)
    hasPermanentFullTimeOffer: true,
    weeklyOfferedHours: 35,
    employerOperatingYearsInYukon: 2,
    employerRecruitmentAdvertisedWeeks: 4,
    languageClbScore: 4,
    hasHighSchoolOrEca: true
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityStatus, 'INELIGIBLE_FOR_YUKON_CRITICAL_IMPACT');
  assert.ok(result.deficiencies.some(d => d.includes('TEER level 1 is ineligible')));
  assert.ok(result.deficiencies.some(d => d.includes('Inadequate related work experience')));
});

test('evaluateYukonCriticalImpactWorker flags refugee claimants as statutorily barred', () => {
  const result = evaluateYukonCriticalImpactWorker({
    targetNocTeer: 4,
    monthsOfRelatedExperience: 8,
    hasPermanentFullTimeOffer: true,
    weeklyOfferedHours: 35,
    employerOperatingYearsInYukon: 2,
    employerRecruitmentAdvertisedWeeks: 4,
    languageClbScore: 4,
    hasHighSchoolOrEca: true,
    currentStatusInCanada: 'refugee_claimant' // Barred
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('refugee claimants are statutorily barred')));
});
