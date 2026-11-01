import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MANITOBA_RENT_CONSTANTS,
  evaluateManitobaRentIncrease
} from '../src/manitoba-residential-tenancy-rent-increase-guideline-navigator.js';

test('Manitoba Rent Increase - Constants reflect RTA and Rent Regulation', () => {
  assert.equal(MANITOBA_RENT_CONSTANTS.ANNUAL_GUIDELINE_PERCENTAGE, 3.0);
  assert.equal(MANITOBA_RENT_CONSTANTS.MINIMUM_NOTICE_PERIOD_MONTHS, 3);
  assert.equal(MANITOBA_RENT_CONSTANTS.MINIMUM_MONTHS_BETWEEN_INCREASES, 12);
  assert.equal(MANITOBA_RENT_CONSTANTS.HIGH_RENT_EXEMPTION_THRESHOLD_CAD, 1615);
});

test('Manitoba Rent Increase - Compliant 3.0% increase with 3 months notice on Form 2', () => {
  const result = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1000,
    proposedMonthlyRentCad: 1030, // exactly 3%
    noticeMonthsGiven: 3,
    monthsSinceLastRentIncrease: 12,
    usedPrescribedForm2: true,
    buildingFirstOccupiedYear: 1990
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_RENT_INCREASE');
  assert.equal(result.isExemptFromGuideline, false);
  assert.equal(result.percentageIncrease, 3.0);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Manitoba Rent Increase - Detects unapproved above-guideline increase (7.0%)', () => {
  const result = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1000,
    proposedMonthlyRentCad: 1070, // 7.0% increase
    noticeMonthsGiven: 3,
    monthsSinceLastRentIncrease: 12,
    usedPrescribedForm2: true,
    hasApprovedAgiOrderFromRtb: false,
    buildingFirstOccupiedYear: 1995
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_RENT_INCREASE');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNAUTHORIZED_ABOVE_GUIDELINE_INCREASE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_RTB_TENANT_OBJECTION'));
});

test('Manitoba Rent Increase - Detects insufficient notice (only 2 months)', () => {
  const result = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1200,
    proposedMonthlyRentCad: 1236, // 3%
    noticeMonthsGiven: 2 // under 3 months!
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_RENT_INCREASE');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_NOTICE_PERIOD_UNDER_3_MONTHS'));
});

test('Manitoba Rent Increase - Recognizes high rent ($1,615+) exemption', () => {
  const result = evaluateManitobaRentIncrease({
    currentMonthlyRentCad: 1800, // >= $1,615!
    proposedMonthlyRentCad: 1950,
    noticeMonthsGiven: 3,
    monthsSinceLastRentIncrease: 12,
    usedPrescribedForm2: true
  });

  assert.equal(result.isHighRentExempt, true);
  assert.equal(result.isExemptFromGuideline, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_RENT_INCREASE');
  assert.ok(result.riskWarnings.some(w => w.warningType === 'RENT_CONTROL_EXEMPTION_APPLIES'));
});
