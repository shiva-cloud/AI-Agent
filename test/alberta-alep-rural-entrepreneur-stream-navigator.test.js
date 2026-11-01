import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateAlbertaRuralEntrepreneur,
  AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD,
  AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD,
  AAIP_RURAL_ENTREPRENEUR_MIN_CLB
} from '../src/alberta-alep-rural-entrepreneur-stream-navigator.js';

test('Alberta Rural Entrepreneur - Eligible New Business Candidate', () => {
  const result = evaluateAlbertaRuralEntrepreneur({
    communityName: 'Brooks',
    isDesignatedRuralCommunity: true,
    hasCommunityEndorsementLetter: true,
    hasCompletedExploratoryVisit: true,
    netWorthCad: 400000,
    plannedInvestmentCad: 150000,
    isBusinessSuccessionOrPurchase: false,
    plannedOwnershipPercentage: 60,
    fullTimeJobsCreatedForCanadians: 2,
    yearsOfBusinessOwnershipOrSeniorManagement: 4,
    clbScore: 5,
    hasHighSchoolDiplomaOrEca: true,
    intendsToResideInCommunity: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_ALBERTA_RURAL_ENTREPRENEUR_STREAM');
  assert.equal(result.disqualifications.length, 0);
  assert.equal(result.financialAudit.minimumInvestmentRequiredCad, 100000);
});

test('Alberta Rural Entrepreneur - Ineligible due to Net Worth & Investment Shortfall', () => {
  const result = evaluateAlbertaRuralEntrepreneur({
    communityName: 'Taber',
    isDesignatedRuralCommunity: true,
    hasCommunityEndorsementLetter: true,
    hasCompletedExploratoryVisit: true,
    netWorthCad: 200000, // Under $300k
    plannedInvestmentCad: 60000, // Under $100k
    plannedOwnershipPercentage: 55,
    fullTimeJobsCreatedForCanadians: 1,
    yearsOfBusinessOwnershipOrSeniorManagement: 3,
    clbScore: 4,
    hasHighSchoolDiplomaOrEca: true
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_ALBERTA_RURAL_ENTREPRENEUR');
  assert.ok(result.disqualifications.some(d => d.criterion === 'NET_WORTH_DEFICIENCY'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'INVESTMENT_DEFICIENCY'));
});

test('Alberta Rural Entrepreneur - Succession Purchase requires 100% ownership', () => {
  const result = evaluateAlbertaRuralEntrepreneur({
    communityName: 'Peace River',
    isDesignatedRuralCommunity: true,
    hasCommunityEndorsementLetter: true,
    hasCompletedExploratoryVisit: true,
    netWorthCad: 500000,
    plannedInvestmentCad: 200000,
    isBusinessSuccessionOrPurchase: true, // Requires 100%
    plannedOwnershipPercentage: 75, // Only 75%
    fullTimeJobsCreatedForCanadians: 1,
    yearsOfBusinessOwnershipOrSeniorManagement: 5,
    clbScore: 5,
    hasHighSchoolDiplomaOrEca: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'OWNERSHIP_SHORTFALL'));
});

test('Alberta Rural Entrepreneur - Missing Exploratory Visit or Endorsement Letter', () => {
  const result = evaluateAlbertaRuralEntrepreneur({
    communityName: 'Brooks',
    isDesignatedRuralCommunity: true,
    hasCommunityEndorsementLetter: false,
    hasCompletedExploratoryVisit: false,
    netWorthCad: 400000,
    plannedInvestmentCad: 150000
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'MISSING_EXPLORATORY_VISIT'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'MISSING_ENDORSEMENT_LETTER'));
});

test('Alberta Rural Entrepreneur - Verify Constants', () => {
  assert.equal(AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD, 300000);
  assert.equal(AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD, 100000);
  assert.equal(AAIP_RURAL_ENTREPRENEUR_MIN_CLB, 4);
});
