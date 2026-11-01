// test/express-entry-optimizer.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CRS_STATUTORY_CONSTANTS,
  BENCHMARK_DRAW_CUTOFFS,
  getAgePoints,
  evaluateExpressEntryCrs
} from '../src/express-entry-optimizer.js';

test('Canadian Express Entry CRS & Category-Based Draw Optimizer Engine', async (t) => {
  await t.test('statutory constants match federal IRPA Ministerial Instructions', () => {
    assert.equal(CRS_STATUTORY_CONSTANTS.MAX_TOTAL_POINTS, 1200);
    assert.equal(CRS_STATUTORY_CONSTANTS.PNP_NOMINATION_POINTS, 600);
    assert.equal(CRS_STATUTORY_CONSTANTS.FRENCH_BILINGUAL_BONUS_HIGH_ENGLISH, 50);
    assert.equal(CRS_STATUTORY_CONSTANTS.CANADIAN_STUDY_3_PLUS_YEARS_OR_MASTERS, 30);
    assert.equal(CRS_STATUTORY_CONSTANTS.SIBLING_IN_CANADA_POINTS, 15);
    assert.ok(BENCHMARK_DRAW_CUTOFFS.stem_occupations.cutoff > 480);
    assert.ok(BENCHMARK_DRAW_CUTOFFS.french_language_proficiency.cutoff < 440);
  });

  await t.test('enforces statutory age points curve (max 110 at 20-29, down to 0 at 45+)', () => {
    assert.equal(getAgePoints(25, false), 110);
    assert.equal(getAgePoints(29, false), 110);
    assert.equal(getAgePoints(30, false), 105);
    assert.equal(getAgePoints(35, false), 77);
    assert.equal(getAgePoints(40, false), 50);
    assert.equal(getAgePoints(45, false), 0);

    // Married age points are slightly lower (max 100)
    assert.equal(getAgePoints(25, true), 100);
    assert.equal(getAgePoints(30, true), 95);
  });

  await t.test('audits a 29-year-old STEM master graduate with 1 yr Canadian exp & 3 yrs foreign exp', () => {
    const res = evaluateExpressEntryCrs({
      age: 29,
      educationLevel: 'masters',
      firstLanguageClb: { reading: 9, writing: 9, listening: 9, speaking: 9 },
      canadianWorkExperienceYears: 1,
      foreignWorkExperienceYears: 3,
      isMarried: false,
      canadianEducationLevel: 'post_secondary_3_plus_years',
      occupationCategory: 'stem',
      targetOccupationNoc: '21231'
    });

    // Breakdown assertions
    assert.equal(res.breakdown.humanCapital.agePoints, 110);
    assert.equal(res.breakdown.humanCapital.educationPoints, 135);
    assert.equal(res.breakdown.humanCapital.firstLanguagePoints, 31 * 4); // 124
    assert.equal(res.breakdown.humanCapital.canadianExperiencePoints, 40);

    // Skill transferability: Master's + CLB 9 = 50; Foreign 3+ yrs + CLB 9 = 50 -> Max 100
    assert.equal(res.breakdown.skillTransferability.total, 100);

    // Additional points: Canadian 3+ yr study = 30
    assert.equal(res.breakdown.additionalPoints.canadianStudy, 30);

    // Total CRS: 110 + 135 + 124 + 40 + 100 + 30 = 539
    assert.equal(res.totalCrsScore, 539);

    // Verify STEM category eligibility and draw prediction
    assert.equal(res.categoryEligibility.stem.isEligible, true);
    assert.equal(res.categoryEligibility.stem.likelyInvited, true);
    assert.ok(res.categoryEligibility.stem.scoreSurplus > 40);
  });

  await t.test('audits French bilingual bonus (+50 points) and Category 1 French draw eligibility', () => {
    const res = evaluateExpressEntryCrs({
      age: 32,
      educationLevel: 'bachelors',
      firstLanguageClb: { reading: 8, writing: 8, listening: 8, speaking: 8 },
      canadianWorkExperienceYears: 1,
      foreignWorkExperienceYears: 2,
      isMarried: false,
      frenchNclcLevel: 7 // NCLC 7 French + CLB 8 English
    });

    assert.equal(res.breakdown.additionalPoints.frenchBilingualism, 50);
    assert.equal(res.categoryEligibility.french.isEligible, true);
    assert.equal(res.categoryEligibility.french.likelyInvited, true);
    assert.ok(res.categoryEligibility.french.scoreSurplus > 0);
  });

  await t.test('evaluates optimization levers recommending retaking English for CLB 10 and French study', () => {
    const res = evaluateExpressEntryCrs({
      age: 30,
      educationLevel: 'bachelors',
      firstLanguageClb: { reading: 7, writing: 7, listening: 7, speaking: 7 },
      canadianWorkExperienceYears: 0,
      foreignWorkExperienceYears: 3,
      isMarried: false
    });

    assert.ok(res.optimizationLevers.length >= 3);
    const engLever = res.optimizationLevers.find(l => l.lever.includes('Retake English'));
    assert.ok(engLever);
    assert.ok(engLever.potentialPointsGain >= 40);

    const pnpLever = res.optimizationLevers.find(l => l.lever.includes('Provincial Nominee'));
    assert.ok(pnpLever);
    assert.equal(pnpLever.potentialPointsGain, 600);
  });

  await t.test('job offers add no CRS points since 25 March 2025 and explain why', () => {
    const profile = {
      age: 29,
      educationLevel: 'masters',
      firstLanguageClb: 9,
      canadianWorkExperienceYears: 1,
      foreignWorkExperienceYears: 3,
      isMarried: false
    };
    const without = evaluateExpressEntryCrs(profile);
    const withOffer = evaluateExpressEntryCrs({ ...profile, hasArrangedEmploymentLmia: true, arrangedEmploymentNocCode: '00012' });

    assert.equal(CRS_STATUTORY_CONSTANTS.ARRANGED_EMPLOYMENT_POINTS, 0);
    assert.equal(withOffer.breakdown.additionalPoints.arrangedEmployment, 0);
    assert.equal(withOffer.totalCrsScore, without.totalCrsScore);
    assert.match(withOffer.statutoryAdvisories[0], /no longer add CRS points/);
    assert.ok(!without.statutoryAdvisories.some(a => /no longer add CRS points/.test(a)));
  });

  await t.test('factors spouse credentials for married applicant', () => {
    const res = evaluateExpressEntryCrs({
      age: 28,
      educationLevel: 'masters',
      firstLanguageClb: 9,
      canadianWorkExperienceYears: 2,
      foreignWorkExperienceYears: 2,
      isMarried: true,
      spouseFactors: {
        educationLevel: 'masters',
        firstLanguageClb: 9,
        canadianWorkExperienceYears: 1
      }
    });

    assert.equal(res.breakdown.spouseFactors.education, 10);
    assert.equal(res.breakdown.spouseFactors.language, 20); // 5 * 4
    assert.equal(res.breakdown.spouseFactors.canadianExperience, 5);
    assert.equal(res.breakdown.spouseFactors.total, 35);
  });
});
