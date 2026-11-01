import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RURAL_AAIP_CONSTANTS,
  DESIGNATED_RURAL_COMMUNITIES,
  evaluateRuralRenewalEligibility
} from '../src/rural-renewal-navigator.js';

test('Rural Renewal Navigator — Constants match AAIP official guidelines', () => {
  assert.equal(RURAL_AAIP_CONSTANTS.MIN_COMMUNITY_POPULATION_CEILING, 100000);
  assert.equal(RURAL_AAIP_CONSTANTS.MIN_WORK_EXPERIENCE_MONTHS, 12);
  assert.equal(RURAL_AAIP_CONSTANTS.MIN_CLB_TEER_0_1_2_3, 5);
  assert.equal(RURAL_AAIP_CONSTANTS.MIN_CLB_TEER_4_5, 4);
  assert.equal(RURAL_AAIP_CONSTANTS.MIN_ENTREPRENEUR_NET_WORTH_CAD, 300000.0);
  assert.ok(DESIGNATED_RURAL_COMMUNITIES.brooks);
  assert.ok(DESIGNATED_RURAL_COMMUNITIES.innisfail);
});

test('Rural Renewal Navigator — Qualifies compliant candidate in Brooks with CLB 5 and 14 months exp', () => {
  const result = evaluateRuralRenewalEligibility({
    streamType: 'rural_renewal',
    selectedCommunity: 'brooks',
    hasCommunityEndorsementLetter: true,
    hasGenuineJobOffer: true,
    jobOfferIsFullTimeNonSeasonal: true,
    jobNocTeer: 2,
    clbLevel: 5,
    hasHighSchoolOrEca: true,
    monthsWorkExperiencePast18Months: 14,
    familySize: 2,
    liquidSettlementFundsCad: 25000
  });

  assert.equal(result.overallEligible, true);
  assert.equal(result.deficiencies.length, 0);
  assert.match(result.summaryTitle, /Eligible for AAIP Rural Renewal Stream in Brooks/);
});

test('Rural Renewal Navigator — Detects language shortfall for TEER 2 (needs CLB 5, has CLB 4)', () => {
  const result = evaluateRuralRenewalEligibility({
    streamType: 'rural_renewal',
    selectedCommunity: 'whitecourt',
    hasCommunityEndorsementLetter: true,
    hasGenuineJobOffer: true,
    jobOfferIsFullTimeNonSeasonal: true,
    jobNocTeer: 2,
    clbLevel: 4, // Below CLB 5
    hasHighSchoolOrEca: true,
    monthsWorkExperiencePast18Months: 14,
    familySize: 1,
    liquidSettlementFundsCad: 20000
  });

  assert.equal(result.overallEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('CLB 4 falls below minimum threshold')));
});

test('Rural Renewal Navigator — Qualifies Rural Entrepreneur meeting $300k net worth and $100k investment', () => {
  const result = evaluateRuralRenewalEligibility({
    streamType: 'rural_entrepreneur',
    selectedCommunity: 'taber',
    hasCommunityEndorsementLetter: true,
    hasCompletedCommunityExploratoryVisit: true,
    netWorthCad: 450000,
    plannedInvestmentCad: 150000,
    plannedOwnershipPercent: 60.0,
    jobsCreatedCount: 2
  });

  assert.equal(result.overallEligible, true);
  assert.match(result.summaryTitle, /Eligible for AAIP Rural Entrepreneur Stream in Taber/);
  assert.ok(result.roadmapSteps.some(s => s.includes('Business Performance Agreement')));
});
