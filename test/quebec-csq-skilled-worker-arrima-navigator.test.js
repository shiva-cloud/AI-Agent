import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUEBEC_CSQ_GRID_CONSTANTS,
  evaluateQuebecCsqSkilledWorker
} from '../src/quebec-csq-skilled-worker-arrima-navigator.js';

test('Quebec CSQ Grid - Constants reflect MIFI standards', () => {
  assert.equal(QUEBEC_CSQ_GRID_CONSTANTS.PASS_MARK_SINGLE_APPLICANT, 50);
  assert.equal(QUEBEC_CSQ_GRID_CONSTANTS.PASS_MARK_SPOUSE_ACCOMPANYING, 59);
  assert.equal(QUEBEC_CSQ_GRID_CONSTANTS.MANDATORY_FRENCH_ORAL_NIVEAU_MINIMUM, 7);
  assert.equal(QUEBEC_CSQ_GRID_CONSTANTS.VOM_POINTS_REGIONS_OUTSIDE_CMM, 14);
});

test('Quebec CSQ Grid - Eligible single candidate exceeding 50 points with French Niveau 7+', () => {
  const result = evaluateQuebecCsqSkilledWorker({
    hasAccompanyingSpouse: false,
    applicantAge: 28, // 16 pts
    educationLevel: 'bachelor_3_years', // 10 pts
    areaOfTrainingSection: 'SECTION_B', // 9 pts
    monthsOfQualifiedExperience: 36, // 6 pts
    frenchOralListeningNiveau: 8, // 7 pts
    frenchOralSpeakingNiveau: 7, // 7 pts
    englishListeningClb: 7, // 2 pts
    englishSpeakingClb: 7, // 2 pts
    hasQuebecStudyOrWorkStay: true, // 5 pts
    signedFinancialAutonomyContract: true // 1 pt
    // Total = 16 + 10 + 9 + 6 + 14 + 4 + 5 + 1 = 65 points
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_CSQ_INVITATION');
  assert.equal(result.totalScore >= 50, true);
  assert.equal(result.meetsMandatoryFrenchOralThreshold, true);
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.feeEstimateCad, 919);
});

test('Quebec CSQ Grid - Ineligible due to French oral listening below Niveau 7', () => {
  const result = evaluateQuebecCsqSkilledWorker({
    hasAccompanyingSpouse: false,
    applicantAge: 28,
    educationLevel: 'masters_degree',
    areaOfTrainingSection: 'SECTION_A',
    monthsOfQualifiedExperience: 48,
    frenchOralListeningNiveau: 6, // Below Niveau 7!
    frenchOralSpeakingNiveau: 7,
    signedFinancialAutonomyContract: true
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.meetsMandatoryFrenchOralThreshold, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_MANDATORY_FRENCH_NOT_MET');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'FRENCH_ORAL_PROFICIENCY_BELOW_NIVEAU_7'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FRENCH_FRANCISISATION_PREPARATION'));
});

test('Quebec CSQ Grid - Validated Job Offer (VOM) outside Montreal awards 14 points', () => {
  const result = evaluateQuebecCsqSkilledWorker({
    hasAccompanyingSpouse: true,
    applicantAge: 32,
    educationLevel: 'technical_post_secondary_3_years',
    areaOfTrainingSection: 'SECTION_C',
    hasValidatedJobOffer: true,
    isJobOfferOutsideMontrealCmm: true,
    frenchOralListeningNiveau: 7,
    frenchOralSpeakingNiveau: 7,
    signedFinancialAutonomyContract: true
  });

  assert.equal(result.pointsBreakdown.validatedJobOffer, 14);
  assert.equal(result.passMarkRequired, 59);
});

test('Quebec CSQ Grid - Missing financial autonomy contract flags violation', () => {
  const result = evaluateQuebecCsqSkilledWorker({
    signedFinancialAutonomyContract: false,
    frenchOralListeningNiveau: 7,
    frenchOralSpeakingNiveau: 7
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'FINANCIAL_AUTONOMY_CONTRACT_UNSIGNED'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'SIGN_FINANCIAL_AUTONOMY_UNDERTAKING'));
});
