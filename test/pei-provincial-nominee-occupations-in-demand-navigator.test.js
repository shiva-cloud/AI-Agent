import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePeiOccupationsInDemand,
  PEI_ELIGIBLE_TARGET_NOCS
} from '../src/pei-provincial-nominee-occupations-in-demand-navigator.js';

test('PEI PNP Occupations in Demand - Eligible Nurse Aide Candidate', () => {
  const result = evaluatePeiOccupationsInDemand({
    nocCode: '33102',
    jobOfferFullTime: true,
    jobOfferPermanentOrTwoYears: true,
    employerOperatedTwoYearsInPei: true,
    hasValidWorkPermitOrAuthorization: true,
    monthsOfDirectExperienceInLastFiveYears: 18,
    applicantAge: 29,
    clbScore: 5,
    hasHighSchoolDiplomaOrEca: true,
    liquidFundsCad: 14000,
    familySize: 2,
    intendsToResideInPei: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND_NOMINATION');
  assert.equal(result.disqualifications.length, 0);
  assert.equal(result.targetNoc.sector, 'Healthcare');
  assert.equal(result.financialAssessment.isFundsRequirementSatisfied, true);
  assert.equal(result.financialAssessment.requiredSettlementFundsCad, 12000);
});

test('PEI PNP Occupations in Demand - Ineligible NOC and Age Over Limit', () => {
  const result = evaluatePeiOccupationsInDemand({
    nocCode: '21231', // Software developer (not on occupations in demand list)
    jobOfferFullTime: true,
    jobOfferPermanentOrTwoYears: true,
    employerOperatedTwoYearsInPei: true,
    monthsOfDirectExperienceInLastFiveYears: 24,
    applicantAge: 62, // Above 59
    clbScore: 7,
    hasHighSchoolDiplomaOrEca: true,
    liquidFundsCad: 15000,
    intendsToResideInPei: true
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND');
  assert.ok(result.disqualifications.some(d => d.criterion === 'INELIGIBLE_NOC_CODE'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'AGE_DISQUALIFICATION'));
});

test('PEI PNP Occupations in Demand - Deficiencies in Experience and Language', () => {
  const result = evaluatePeiOccupationsInDemand({
    nocCode: '73300', // Truck driver
    jobOfferFullTime: true,
    jobOfferPermanentOrTwoYears: true,
    employerOperatedTwoYearsInPei: true,
    monthsOfDirectExperienceInLastFiveYears: 6, // Under 12 months
    applicantAge: 35,
    clbScore: 3, // Under CLB 4
    hasHighSchoolDiplomaOrEca: true,
    liquidFundsCad: 5000,
    familySize: 1,
    intendsToResideInPei: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'EXPERIENCE_DEFICIENCY'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'LANGUAGE_DEFICIENCY'));
  assert.ok(result.riskWarnings.some(w => w.warning === 'INSUFFICIENT_SETTLEMENT_FUNDS'));
});

test('PEI PNP Occupations in Demand - Employer operating under 2 years in PEI', () => {
  const result = evaluatePeiOccupationsInDemand({
    nocCode: '75110', // Construction trades helpers
    jobOfferFullTime: true,
    jobOfferPermanentOrTwoYears: true,
    employerOperatedTwoYearsInPei: false,
    monthsOfDirectExperienceInLastFiveYears: 14,
    applicantAge: 25,
    clbScore: 4,
    hasHighSchoolDiplomaOrEca: true,
    liquidFundsCad: 11000,
    familySize: 1,
    intendsToResideInPei: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'EMPLOYER_TENURE_DEFICIENCY'));
});

test('PEI PNP Occupations in Demand - Verify target NOC roster', () => {
  assert.ok(PEI_ELIGIBLE_TARGET_NOCS.length >= 8);
  const truckDriver = PEI_ELIGIBLE_TARGET_NOCS.find(n => n.noc === '73300');
  assert.equal(truckDriver.sector, 'Transportation');
});
