import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PNP_CONSTANTS,
  calculateBcPnpPoints,
  auditSettlementFunds,
  evaluateProvincialNomineePathway
} from '../src/pnp-navigator.js';

test('Provincial Nominee Program (PNP) Diagnostic Engine - Constants & Matrices', () => {
  assert.ok(PNP_CONSTANTS.STATUTES.IRPA_PNP_AUTHORITY.includes('s. 87(1)'));
  assert.ok(PNP_CONSTANTS.STATUTES.IRPR_ENHANCED_PNP.includes('600 Bonus'));
  assert.equal(PNP_CONSTANTS.BC_PNP_BENCHMARKS.MAX_TOTAL_POINTS, 200);
  assert.equal(PNP_CONSTANTS.BC_PNP_BENCHMARKS.RECENT_TECH_CUTOFF, 85);
  assert.ok(PNP_CONSTANTS.TARGETED_TECH_NOCS.includes('21231')); // Software engineers
  assert.ok(PNP_CONSTANTS.OINP_TECH_NOCS.includes('21211')); // Data scientists
  assert.equal(PNP_CONSTANTS.LICO_FUNDS_2024[1], 15263);
});

test('calculateBcPnpPoints correctly calculates points and adheres to statutory caps', () => {
  // Max profile
  const maxResult = calculateBcPnpPoints({
    yearsOfDirectExperience: 6,
    hasOneYearCanadianExperience: true,
    currentlyWorkingForBcEmployer: true,
    educationLevel: 'doctoral',
    completedBcEducation: true,
    hasProfessionalDesignationBc: true,
    clbLevel: 10,
    isBilingualEnglishAndFrench: true,
    hourlyWage: 55,
    jobLocationArea: 'area_3_rural',
    hasRegionalEducationOrExperience: true
  });

  // Human capital: 40 + 40 + 40 = 120
  // Economic: 55 (wage) + 25 (area) = 80
  // Total: 200
  assert.equal(maxResult.breakdown.humanCapitalFactors.directExperiencePoints, 40);
  assert.equal(maxResult.breakdown.humanCapitalFactors.highestEducationPoints, 40);
  assert.equal(maxResult.breakdown.humanCapitalFactors.languageProficiencyPoints, 40);
  assert.equal(maxResult.breakdown.humanCapitalFactors.total, 120);
  assert.equal(maxResult.breakdown.economicFactors.hourlyWagePoints, 55);
  assert.equal(maxResult.breakdown.economicFactors.areaOfEmploymentPoints, 25);
  assert.equal(maxResult.breakdown.economicFactors.total, 80);
  assert.equal(maxResult.totalPoints, 200);

  // Moderate profile in Metro Vancouver
  const modResult = calculateBcPnpPoints({
    yearsOfDirectExperience: 3, // 12
    hasOneYearCanadianExperience: true, // +10 = 22
    currentlyWorkingForBcEmployer: false,
    educationLevel: 'bachelors', // 15
    completedBcEducation: false,
    completedCanadianEducationOutsideBc: true, // +6 = 21
    hasProfessionalDesignationBc: false,
    clbLevel: 8, // 25
    isBilingualEnglishAndFrench: false,
    hourlyWage: 32, // 35
    jobLocationArea: 'area_1_metro_van', // 0
    hasRegionalEducationOrExperience: false
  });

  assert.equal(modResult.breakdown.humanCapitalFactors.directExperiencePoints, 22);
  assert.equal(modResult.breakdown.humanCapitalFactors.highestEducationPoints, 21);
  assert.equal(modResult.breakdown.humanCapitalFactors.languageProficiencyPoints, 25);
  assert.equal(modResult.breakdown.economicFactors.hourlyWagePoints, 35);
  assert.equal(modResult.breakdown.economicFactors.areaOfEmploymentPoints, 0);
  assert.equal(modResult.totalPoints, 22 + 21 + 25 + 35 + 0);
});

test('auditSettlementFunds enforces LICO benchmarks and IRPR s. 87(2) work permit exemptions', () => {
  // Single newcomer, unemployed, funds insufficient
  const lowFunds = auditSettlementFunds(1, 10000, false);
  assert.equal(lowFunds.isExempt, false);
  assert.equal(lowFunds.requiredFundsCad, 15263);
  assert.equal(lowFunds.meetsRequirement, false);
  assert.equal(lowFunds.shortfallCad, 5263);

  // Family of 3, unemployed, funds sufficient
  const sufficientFunds = auditSettlementFunds(3, 25000, false);
  assert.equal(sufficientFunds.isExempt, false);
  assert.equal(sufficientFunds.requiredFundsCad, 23360);
  assert.equal(sufficientFunds.meetsRequirement, true);
  assert.equal(sufficientFunds.shortfallCad, 0);

  // Candidate with job offer (IRPR s. 87(2) exempt)
  const exemptResult = auditSettlementFunds(4, 2000, true);
  assert.equal(exemptResult.isExempt, true);
  assert.equal(exemptResult.meetsRequirement, true);
  assert.equal(exemptResult.shortfallCad, 0);
});

test('evaluateProvincialNomineePathway validates BC Tech stream eligibility and score advantage', () => {
  const result = evaluateProvincialNomineePathway({
    targetProvince: 'BC',
    nocCode: '21231', // Software engineer
    hourlyWage: 45,
    hasFullTimeJobOffer: true,
    hasActiveExpressEntryProfile: true,
    expressEntryCrsScore: 470,
    yearsOfDirectExperience: 4,
    hasOneYearCanadianExperience: true,
    currentlyWorkingForBcEmployer: true,
    educationLevel: 'masters',
    completedBcEducation: true,
    clbLevel: 9,
    jobLocationArea: 'area_1_metro_van',
    liquidSavingsCad: 30000
  });

  assert.equal(result.province, 'BC');
  assert.equal(result.streamType, 'ENHANCED_EXPRESS_ENTRY');
  assert.equal(result.bonusCrsPoints, 600);
  assert.equal(result.projectedPostNominationCrs, 1070);
  assert.equal(result.bcTechEligibility.isTargetedTechNoc, true);
  assert.equal(result.bcTechEligibility.qualifiesForBcTech, true);
  assert.equal(result.bcTechEligibility.likelihood, 'VERY_STRONG');
  assert.ok(result.bcPnpScore >= 85);
  assert.equal(result.statutoryBlockers.length, 0);
});

test('evaluateProvincialNomineePathway checks Ontario OINP and Alberta AAIP Tech pathways', () => {
  // OINP Tech candidate
  const oinpCandidate = evaluateProvincialNomineePathway({
    targetProvince: 'ON',
    nocCode: '21211', // Data scientist
    hourlyWage: 42,
    hasFullTimeJobOffer: false,
    hasActiveExpressEntryProfile: true,
    expressEntryCrsScore: 468,
    yearsOfDirectExperience: 3,
    educationLevel: 'masters',
    clbLevel: 8,
    liquidSavingsCad: 20000
  });

  assert.equal(oinpCandidate.oinpTechEligibility.qualifiesForOinpTech, true);
  assert.ok(oinpCandidate.oinpTechEligibility.statutoryAdvisory.includes('Ontario Human Capital Priorities'));

  // AAIP Tech candidate
  const aaipCandidate = evaluateProvincialNomineePathway({
    targetProvince: 'AB',
    nocCode: '21232', // Software developer
    hourlyWage: 38,
    hasFullTimeJobOffer: true,
    hasActiveExpressEntryProfile: true,
    expressEntryCrsScore: 350,
    yearsOfDirectExperience: 2,
    educationLevel: 'bachelors',
    clbLevel: 7,
    liquidSavingsCad: 15000
  });

  assert.equal(aaipCandidate.aaipTechEligibility.qualifiesForAaipTech, true);
  assert.ok(aaipCandidate.aaipTechEligibility.statutoryAdvisory.includes('Alberta Advantage Immigration Program'));
});

test('evaluateProvincialNomineePathway detects sub-minimum wage and insufficient settlement funds', () => {
  const violatingProfile = evaluateProvincialNomineePathway({
    targetProvince: 'BC',
    nocCode: '21234',
    hourlyWage: 15.00, // Below BC minimum wage
    hasFullTimeJobOffer: true,
    hasActiveExpressEntryProfile: false,
    familySize: 2,
    liquidSavingsCad: 5000 // Below LICO ($18,288)
  });

  assert.ok(violatingProfile.statutoryBlockers.some(b => b.code === 'SUB_MINIMUM_WAGE'));
  assert.equal(violatingProfile.streamType, 'BASE_PROVINCIAL_STREAM');
  assert.equal(violatingProfile.bonusCrsPoints, 0);
  assert.equal(violatingProfile.projectedPostNominationCrs, null);
});

test('evaluateProvincialNomineePathway generates actionable strategic levers', () => {
  const profile = evaluateProvincialNomineePathway({
    targetProvince: 'BC',
    nocCode: '21231',
    hourlyWage: 28,
    hasFullTimeJobOffer: true,
    hasActiveExpressEntryProfile: false,
    clbLevel: 7,
    isBilingualEnglishAndFrench: false,
    jobLocationArea: 'area_1_metro_van'
  });

  assert.ok(profile.strategicLevers.length >= 4);
  assert.ok(profile.strategicLevers.some(l => l.action.includes('hourly compensation')));
  assert.ok(profile.strategicLevers.some(l => l.action.includes('Area 2')));
  assert.ok(profile.strategicLevers.some(l => l.action.includes('CLB 9+')));
  assert.ok(profile.strategicLevers.some(l => l.action.includes('Express Entry profile')));
});
