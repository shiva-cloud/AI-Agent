import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateInternationallyTrainedNurse, IEN_CONSTANTS } from '../src/internationally-trained-nurse-navigator.js';

test('IEN Navigator — Constants reflect NNAS and CNO operational standards', () => {
  assert.ok(IEN_CONSTANTS.NNAS_EXPEDITED_COUNTRIES.includes('Philippines'));
  assert.ok(IEN_CONSTANTS.NNAS_EXPEDITED_COUNTRIES.includes('India'));
  assert.ok(IEN_CONSTANTS.NNAS_EXPEDITED_COUNTRIES.includes('United Kingdom'));
  assert.equal(IEN_CONSTANTS.CURRENCY_OF_PRACTICE_YEARS_LIMIT, 3);
  assert.equal(IEN_CONSTANTS.IELTS_ACADEMIC_MIN_OVERALL, 7.0);
  assert.equal(IEN_CONSTANTS.NNAS_APPLICATION_FEE_USD, 650.0);
});

test('IEN Navigator — Expedited NNAS stream and Temporary Class in Ontario for Philippines-trained RN', () => {
  const result = evaluateInternationallyTrainedNurse({
    countryOfEducation: 'Philippines',
    nursingDesignation: 'rn',
    yearsOfClinicalExperience: 6,
    yearsSinceLastClinicalPractice: 1,
    languageProficiencyRoute: 'ielts_academic',
    ieltsOverallScore: 7.5,
    targetProvince: 'ON',
    hasPassedNclex: false,
    interestedInSpepSupervisedPractice: true
  });

  assert.equal(result.nnasEvaluation.isExpeditedCountry, true);
  assert.ok(result.nnasEvaluation.estimatedTimeline.includes('Accelerated'));
  assert.equal(result.regulatoryRequirements.isCurrencyOfPracticeMet, true);
  assert.equal(result.regulatoryRequirements.isLanguageProficiencyMet, true);
  assert.equal(result.regulatoryRequirements.qualifiesForTemporaryClass, true);
  assert.ok(result.statutoryProtections.some(p => p.includes('FARPACTA s. 10.2')));
  assert.ok(result.statutoryProtections.some(p => p.includes('CNO SPEP Partnership')));
});

test('IEN Navigator — Language taught in English exemption applies without IELTS', () => {
  const result = evaluateInternationallyTrainedNurse({
    countryOfEducation: 'United Kingdom',
    languageProficiencyRoute: 'nursing_taught_in_english'
  });

  assert.equal(result.regulatoryRequirements.isLanguageProficiencyMet, true);
  assert.ok(result.statutoryProtections.some(p => p.includes('Language Exemption')));
});

test('IEN Navigator — Flags currency of practice gap when inactive > 3 years', () => {
  const result = evaluateInternationallyTrainedNurse({
    countryOfEducation: 'India',
    yearsSinceLastClinicalPractice: 5
  });

  assert.equal(result.regulatoryRequirements.isCurrencyOfPracticeMet, false);
  assert.ok(result.riskWarnings.some(w => w.includes('CURRENCY OF PRACTICE GAP')));
});

test('IEN Navigator — Non-expedited country directs to standard NNAS evaluation', () => {
  const result = evaluateInternationallyTrainedNurse({
    countryOfEducation: 'Brazil'
  });

  assert.equal(result.nnasEvaluation.isExpeditedCountry, false);
  assert.ok(result.nnasEvaluation.estimatedTimeline.includes('Standard'));
});
