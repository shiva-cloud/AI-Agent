import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateAutoInsuranceProfile,
  AUTO_INSURANCE_CONSTANTS
} from '../src/auto-insurance-navigator.js';

test('Auto Insurance Navigator — Statutory constants reflect Ontario SABS and FSRA standards', () => {
  assert.equal(AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_IRB_STANDARD_WEEKLY_CAP_CAD, 400);
  assert.equal(AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_IRB_PERCENT_GROSS, 0.70);
  assert.equal(AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_IRB_WAITING_PERIOD_DAYS, 7);
  assert.equal(AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_IRB_MAX_STANDARD_WEEKS, 104);
  assert.equal(AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_NEB_WEEKLY_CAD, 185);
  assert.equal(AUTO_INSURANCE_CONSTANTS.ONTARIO_MIG_LIMIT_CAD, 3500);
  assert.equal(AUTO_INSURANCE_CONSTANTS.ONTARIO_NON_CAT_LIMIT_CAD, 65000);
  assert.equal(AUTO_INSURANCE_CONSTANTS.ONTARIO_CAT_LIMIT_CAD, 1000000);
});

test('Auto Insurance Navigator — Calculates foreign experience savings in high-premium postal zone', () => {
  const result = evaluateAutoInsuranceProfile({
    province: 'ON',
    postalCode: 'L6Y 2T3', // Brampton
    annualGrossIncomeCad: 85000,
    employmentStatus: 'employed',
    weeksEmployedPast52: 52,
    foreignDrivingYears: 6,
    hasForeignExperienceLetter: true,
    canadianLicenceClass: 'G'
  });

  assert.equal(result.province, 'ON');
  assert.equal(result.ratingTerritoryAnalysis.territoryTier, 'HIGH_RISK_PREMIUM_ZONE');
  assert.ok(result.ratingTerritoryAnalysis.estimatedAnnualSavingsCad >= 2500);
  assert.equal(result.experienceLetterAudit.isLetterValid, true);
  assert.equal(result.experienceLetterAudit.eligibleDrivingYearsRecognized, 6);
  assert.ok(result.experienceLetterAudit.insurersAcceptingForeignLetters.length >= 4);
});

test('Auto Insurance Navigator — SABS Income Replacement Benefit respects $400 standard cap', () => {
  const result = evaluateAutoInsuranceProfile({
    province: 'ON',
    postalCode: 'M5V 2T6', // Downtown Toronto
    annualGrossIncomeCad: 104000, // $2,000/week gross. 70% = $1,400/week -> capped at $400 standard
    employmentStatus: 'employed',
    weeksEmployedPast52: 50,
    optionalIrbEndorsementWeeklyCad: 400
  });

  assert.equal(result.sabsAccidentBenefits.eligibleBenefitType, 'INCOME_REPLACEMENT_BENEFIT');
  assert.equal(result.sabsAccidentBenefits.weeklyIncomeReplacementCad, 400); // capped at $400 standard
  assert.equal(result.sabsAccidentBenefits.waitingPeriodDays, 7);
  assert.equal(result.sabsAccidentBenefits.durationWeeks, 104);
  assert.ok(result.sabsAccidentBenefits.optionalCoverageRecommendation.includes('OPCF 47'));
});

test('Auto Insurance Navigator — Calculates enhanced optional IRB endorsement ($1,000/week)', () => {
  const result = evaluateAutoInsuranceProfile({
    province: 'ON',
    annualGrossIncomeCad: 104000, // $2,000/wk gross. 70% is $1,400. With $1,000 cap, gets $1,000
    employmentStatus: 'employed',
    weeksEmployedPast52: 52,
    optionalIrbEndorsementWeeklyCad: 1000
  });

  assert.equal(result.sabsAccidentBenefits.weeklyIncomeReplacementCad, 1000);
});

test('Auto Insurance Navigator — Allocates Non-Earner Benefit for student without 26 weeks work history', () => {
  const result = evaluateAutoInsuranceProfile({
    province: 'ON',
    employmentStatus: 'student',
    weeksEmployedPast52: 10
  });

  assert.equal(result.sabsAccidentBenefits.eligibleBenefitType, 'NON_EARNER_BENEFIT');
  assert.equal(result.sabsAccidentBenefits.weeklyIncomeReplacementCad, 185);
  assert.equal(result.sabsAccidentBenefits.waitingPeriodDays, 28); // 4 weeks
});

test('Auto Insurance Navigator — Identifies Take-All-Comers rule violation and FSRA complaint protocol', () => {
  const result = evaluateAutoInsuranceProfile({
    province: 'ON',
    postalCode: 'L5B 1H8',
    experiencedRefusalOrUnreasonableDelay: true
  });

  assert.equal(result.takeAllComersAudit.isViolationSuspected, true);
  assert.ok(result.takeAllComersAudit.complaintAuthority.includes('FSRA'));
  assert.ok(result.takeAllComersAudit.statutoryReference.includes('Insurance Act'));
  assert.ok(result.takeAllComersAudit.stepsToEnforce.length >= 3);
});

test('Auto Insurance Navigator — Differentiates British Columbia ICBC Enhanced Care model', () => {
  const result = evaluateAutoInsuranceProfile({
    province: 'BC',
    postalCode: 'V6B 1A1',
    annualGrossIncomeCad: 90000,
    employmentStatus: 'employed',
    foreignDrivingYears: 4,
    hasForeignExperienceLetter: true
  });

  assert.equal(result.province, 'BC');
  assert.ok(result.sabsAccidentBenefits.optionalCoverageRecommendation.includes('ICBC'));
  assert.equal(result.experienceLetterAudit.isLetterValid, true);
});
