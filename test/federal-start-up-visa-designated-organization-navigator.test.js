import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateStartUpVisaEligibility,
  calculateSuvSettlementFunds,
  SUV_DESIGNATED_ENTITY_TYPES
} from '../src/federal-start-up-visa-designated-organization-navigator.js';

test('Start-Up Visa - Fully Eligible Venture Capital Stream', () => {
  const result = evaluateStartUpVisaEligibility({
    entityType: 'VENTURE_CAPITAL_FUND',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    investmentAmountCad: 250000,
    numberOfCoOwnersApplying: 2,
    applicantVotingRightsPercentage: 30,
    jointVotingRightsPercentage: 65,
    isIdentifiedAsEssentialApplicant: true,
    clbSpeaking: 6,
    clbListening: 6,
    clbReading: 5,
    clbWriting: 5,
    availableSettlementFundsCad: 20000,
    familySize: 2,
    canadianIncorporationPlannedOrCompleted: true,
    activeOngoingManagementInCanada: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_START_UP_VISA_PERMANENT_RESIDENCE');
  assert.equal(result.disqualifications.length, 0);
  assert.equal(result.settlementFundsAudit.hasSufficientFunds, true);
  assert.ok(result.riskWarnings.some(w => w.warning === 'ESSENTIAL_APPLICANT_STATUS'));
});

test('Start-Up Visa - Ineligible due to Angel Investor Capital Shortfall', () => {
  const result = evaluateStartUpVisaEligibility({
    entityType: 'ANGEL_INVESTOR_GROUP',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    investmentAmountCad: 50000, // Requires $75,000
    numberOfCoOwnersApplying: 1,
    applicantVotingRightsPercentage: 80,
    jointVotingRightsPercentage: 80,
    clbSpeaking: 5,
    clbListening: 5,
    clbReading: 5,
    clbWriting: 5,
    availableSettlementFundsCad: 20000,
    familySize: 1
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'CAPITAL_SHORTFALL'));
});

test('Start-Up Visa - Ineligible due to Ownership Thresholds (Individual < 10% or Joint <= 50%)', () => {
  const result = evaluateStartUpVisaEligibility({
    entityType: 'BUSINESS_INCUBATOR',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    acceptedIntoIncubationProgram: true,
    numberOfCoOwnersApplying: 3,
    applicantVotingRightsPercentage: 8, // Under 10%
    jointVotingRightsPercentage: 45, // Under 50%
    clbSpeaking: 6,
    clbListening: 6,
    clbReading: 6,
    clbWriting: 6,
    availableSettlementFundsCad: 15000,
    familySize: 1
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'INSUFFICIENT_INDIVIDUAL_OWNERSHIP'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'INSUFFICIENT_JOINT_CONTROL'));
});

test('Start-Up Visa - Ineligible due to Language Sub-test Below CLB 5', () => {
  const result = evaluateStartUpVisaEligibility({
    entityType: 'BUSINESS_INCUBATOR',
    hasCommitmentCertificate: true,
    hasLetterOfSupport: true,
    acceptedIntoIncubationProgram: true,
    applicantVotingRightsPercentage: 20,
    jointVotingRightsPercentage: 70,
    clbSpeaking: 7,
    clbListening: 6,
    clbReading: 4, // Below CLB 5
    clbWriting: 5,
    availableSettlementFundsCad: 20000,
    familySize: 1
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'LANGUAGE_BENCHMARK_UNSATISFIED'));
});

test('Start-Up Visa - Settlement funds calculation', () => {
  assert.equal(calculateSuvSettlementFunds(1), 15263);
  assert.equal(calculateSuvSettlementFunds(2), 19001);
  assert.equal(calculateSuvSettlementFunds(4), 28362);
  // Family of 8: 40392 + 4112 = 44504
  assert.equal(calculateSuvSettlementFunds(8), 44504);
});
