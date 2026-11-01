import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_SUV_CONSTANTS,
  evaluateFederalSuvPeerReview
} from '../src/federal-start-up-visa-peer-review-navigator.js';

test('Federal SUV Peer Review - Constants reflect IRPR ss. 98.01-98.13', () => {
  assert.equal(FEDERAL_SUV_CONSTANTS.MIN_FOUNDER_VOTING_RIGHTS_PERCENT, 10.0);
  assert.equal(FEDERAL_SUV_CONSTANTS.MIN_COMBINED_VOTING_RIGHTS_PERCENT, 50.0);
  assert.equal(FEDERAL_SUV_CONSTANTS.MIN_VC_INVESTMENT_CAD, 200000);
  assert.equal(FEDERAL_SUV_CONSTANTS.MIN_ANGEL_INVESTMENT_CAD, 75000);
  assert.equal(FEDERAL_SUV_CONSTANTS.MAX_FOUNDERS_PER_STARTUP, 5);
});

test('Federal SUV Peer Review - Fully compliant incubator-backed startup', () => {
  const result = evaluateFederalSuvPeerReview({
    designatedEntityType: 'BUSINESS_INCUBATOR',
    hasOfficialLetterOfSupport: true,
    applicantVotingRightsPercentage: 30,
    totalFoundersAndEntityVotingPercentage: 70,
    totalFoundersCount: 3,
    hasActiveOngoingManagementRole: true,
    businessIncorporatedInCanada: true,
    peerReviewRequestedByOfficer: false
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_START_UP_VISA');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.dueDiligenceSummary.peerReviewTriggered, false);
});

test('Federal SUV Peer Review - Ineligible with under 10% founder equity', () => {
  const result = evaluateFederalSuvPeerReview({
    applicantVotingRightsPercentage: 8,
    totalFoundersAndEntityVotingPercentage: 55
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_SUV_STREAM');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_FOUNDER_EQUITY_UNDER_10_PERCENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RESTRUCTURE_SHAREHOLDING_CAP_TABLE'));
});

test('Federal SUV Peer Review - Ineligible VC investment under $200,000 threshold', () => {
  const result = evaluateFederalSuvPeerReview({
    designatedEntityType: 'VENTURE_CAPITAL_FUND',
    securedInvestmentAmountCad: 150000,
    applicantVotingRightsPercentage: 25,
    totalFoundersAndEntityVotingPercentage: 60
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_VC_INVESTMENT_AMOUNT'));
});

test('Federal SUV Peer Review - Peer Review requested by officer triggers dossier remedy', () => {
  const result = evaluateFederalSuvPeerReview({
    designatedEntityType: 'BUSINESS_INCUBATOR',
    applicantVotingRightsPercentage: 25,
    totalFoundersAndEntityVotingPercentage: 60,
    peerReviewRequestedByOfficer: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.dueDiligenceSummary.peerReviewTriggered, true);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'PEER_REVIEW_PANEL_TRIGGERED'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'PREPARE_PEER_REVIEW_DEFENSE_DOSSIER'));
});
