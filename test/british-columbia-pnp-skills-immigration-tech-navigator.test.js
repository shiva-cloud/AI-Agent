import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_PNP_TECH_CONSTANTS,
  evaluateBcTechPilotEligibility
} from '../src/british-columbia-pnp-skills-immigration-tech-navigator.js';

test('BC PNP Tech - Constants reflect Tech stream requirements', () => {
  assert.equal(BC_PNP_TECH_CONSTANTS.DESIGNATED_TECH_NOC_COUNT, 35);
  assert.equal(BC_PNP_TECH_CONSTANTS.MIN_JOB_OFFER_DURATION_DAYS, 365);
  assert.equal(BC_PNP_TECH_CONSTANTS.MIN_EMPLOYER_METRO_VANCOUVER_FULLTIME_STAFF, 5);
  assert.equal(BC_PNP_TECH_CONSTANTS.BC_PNP_APPLICATION_FEE_CAD, 1475);
});

test('BC PNP Tech - Eligible Software Engineer with 1-year offer and median wage', () => {
  const result = evaluateBcTechPilotEligibility({
    nocCode: '21231', // Software engineers
    jobOfferDurationDays: 365,
    isJobOfferFullTime: true,
    hourlyWageCad: 50.00,
    regionalMedianHourlyWageCad: 42.00,
    jobLocationRegion: 'METRO_VANCOUVER',
    employerFullTimeEmployeesCount: 10,
    yearsOfDirectTechExperience: 4,
    languageClbLevel: 8
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_BC_PNP_TECH_DRAW');
  assert.equal(result.isNocInTechList, true);
  assert.equal(result.statutoryViolations.length, 0);
  assert.ok(result.criteriaSummary.estimatedSirsScore > 80);
});

test('BC PNP Tech - Ineligible due to non-qualifying non-tech NOC', () => {
  const result = evaluateBcTechPilotEligibility({
    nocCode: '65100', // Cashier
    jobOfferDurationDays: 365,
    hourlyWageCad: 40.00,
    regionalMedianHourlyWageCad: 30.00
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.isNocInTechList, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_NON_TECH_NOC');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NON_DESIGNATED_TECH_NOC'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'APPLY_UNDER_STANDARD_SKILLS_IMMIGRATION'));
});

test('BC PNP Tech - Ineligible due to job offer under 365 days', () => {
  const result = evaluateBcTechPilotEligibility({
    nocCode: '21234',
    jobOfferDurationDays: 180, // Under 1 year!
    hourlyWageCad: 45.00,
    regionalMedianHourlyWageCad: 40.00
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_JOB_OFFER_DURATION_OR_HOURS'));
});

test('BC PNP Tech - Detects wage below regional median', () => {
  const result = evaluateBcTechPilotEligibility({
    nocCode: '21222',
    hourlyWageCad: 30.00,
    regionalMedianHourlyWageCad: 42.00 // Under median!
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'WAGE_BELOW_REGIONAL_MEDIAN'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'INCREASE_WAGE_TO_MARKET_MEDIAN'));
});
