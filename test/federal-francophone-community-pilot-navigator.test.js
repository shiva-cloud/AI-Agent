import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateFrancophoneCommunityPilot,
  calculateFcipSettlementFunds,
  FCIP_PARTICIPATING_COMMUNITIES
} from '../src/federal-francophone-community-pilot-navigator.js';

test('Francophone Community Pilot - Eligible Sudbury Candidate (TEER 2, NCLC 6)', () => {
  const result = evaluateFrancophoneCommunityPilot({
    communityName: 'Sudbury',
    hasCommunityRecommendationLetter: true,
    targetNocTeer: 2,
    hasPermanentFullTimeJobOffer: true,
    jobOfferWithinCommunity: true,
    jobOfferMeetsMedianWage: true,
    frenchNclcSpeaking: 6,
    frenchNclcListening: 6,
    frenchNclcReading: 5,
    frenchNclcWriting: 5,
    monthsOfWorkExperiencePastThreeYears: 18,
    hasHighSchoolDiplomaOrEca: true,
    currentlyWorkingInCanada: false,
    liquidSettlementFundsCad: 10000,
    familySize: 1,
    intendsToResideInCommunity: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_FRANCOPHONE_COMMUNITY_PILOT_PR');
  assert.equal(result.communityDetails.province, 'ON');
  assert.equal(result.disqualifications.length, 0);
  assert.equal(result.financialAudit.hasSufficientFunds, true);
});

test('Francophone Community Pilot - Ineligible due to Non-Participating Community & French Deficit', () => {
  const result = evaluateFrancophoneCommunityPilot({
    communityName: 'Toronto', // Not a designated Francophone minority pilot community
    hasCommunityRecommendationLetter: false,
    targetNocTeer: 1, // Requires NCLC 5
    frenchNclcSpeaking: 3, // Under NCLC 5
    frenchNclcListening: 4,
    frenchNclcReading: 4,
    frenchNclcWriting: 4,
    liquidSettlementFundsCad: 5000
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_FRANCOPHONE_COMMUNITY_PILOT');
  assert.ok(result.disqualifications.some(d => d.criterion === 'NON_PARTICIPATING_COMMUNITY'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'FRENCH_BENCHMARK_UNSATISFIED'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'MISSING_COMMUNITY_RECOMMENDATION'));
});

test('Francophone Community Pilot - Currently working in Canada waives settlement funds', () => {
  const result = evaluateFrancophoneCommunityPilot({
    communityName: 'Clare',
    hasCommunityRecommendationLetter: true,
    targetNocTeer: 4, // TEER 4 requires NCLC 4
    frenchNclcSpeaking: 4,
    frenchNclcListening: 4,
    frenchNclcReading: 4,
    frenchNclcWriting: 4,
    monthsOfWorkExperiencePastThreeYears: 14,
    hasHighSchoolDiplomaOrEca: true,
    currentlyWorkingInCanada: true,
    liquidSettlementFundsCad: 500, // Very low, but exempt!
    familySize: 3
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.financialAudit.isExemptDueToCanadianWork, true);
  assert.equal(result.financialAudit.requiredFundsCad, 0);
});

test('Francophone Community Pilot - Verify Settlement Funds Schedule', () => {
  assert.equal(calculateFcipSettlementFunds(1), 7345);
  assert.equal(calculateFcipSettlementFunds(2), 9144);
  assert.equal(calculateFcipSettlementFunds(6), 15480 + 1979);
});

test('Francophone Community Pilot - Verify Participating Communities Roster', () => {
  assert.ok(FCIP_PARTICIPATING_COMMUNITIES.length >= 8);
  const sudbury = FCIP_PARTICIPATING_COMMUNITIES.find(c => c.community === 'Sudbury');
  assert.equal(sudbury.province, 'ON');
});
