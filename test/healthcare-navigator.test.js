// test/healthcare-navigator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateHealthcareEligibility,
  PROVINCIAL_HEALTH_PLANS,
  RAMQ_BILATERAL_ACCORD_COUNTRIES
} from '../src/healthcare-navigator.js';

test('PROVINCIAL_HEALTH_PLANS defines statutory rules for major provinces', () => {
  assert.ok(PROVINCIAL_HEALTH_PLANS.ON);
  assert.ok(PROVINCIAL_HEALTH_PLANS.BC);
  assert.ok(PROVINCIAL_HEALTH_PLANS.AB);
  assert.ok(PROVINCIAL_HEALTH_PLANS.QC);
  assert.equal(PROVINCIAL_HEALTH_PLANS.ON.hasWaitingPeriod, false);
  assert.equal(PROVINCIAL_HEALTH_PLANS.BC.hasWaitingPeriod, true);
  assert.equal(PROVINCIAL_HEALTH_PLANS.QC.hasWaitingPeriod, true);
});

test('Ontario OHIP grants immediate coverage under Regulation 552 without 3-month wait', () => {
  const result = evaluateHealthcareEligibility({
    province: 'ON',
    immigrationStatus: 'pr',
    landingDateStr: '2026-11-01'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.waitingPeriodDays, 0);
  assert.equal(result.bridgeInsuranceRequired, false);
  assert.equal(result.coverageEffectiveDate, '2026-11-01');
  assert.match(result.statute, /Reg\. 552/);
  assert.doesNotMatch(result.statute, /Bill 175/);
  assert.match(result.statutoryGuidance, /immediate statutory coverage/);
});

test('Ontario OHIP requires active employment contract for Work Permit holders', () => {
  const withJob = evaluateHealthcareEligibility({
    province: 'ON',
    immigrationStatus: 'work_permit',
    hasEmploymentOffer: true,
    workPermitDurationMonths: 12
  });
  assert.equal(withJob.isEligible, true);

  const withoutJob = evaluateHealthcareEligibility({
    province: 'ON',
    immigrationStatus: 'work_permit',
    hasEmploymentOffer: false,
    workPermitDurationMonths: 12
  });
  assert.equal(withoutJob.isEligible, false);
  assert.match(withoutJob.ineligibilityReason, /proof of full-time employment/);
});

test('BC MSP calculates balance of arrival month plus 2 full calendar months', () => {
  // Arrives 2026-10-15: remainder of Oct + Nov + Dec -> Coverage starts 2027-01-01
  const result = evaluateHealthcareEligibility({
    province: 'BC',
    immigrationStatus: 'pr',
    landingDateStr: '2026-10-15',
    householdSize: 2
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.bridgeInsuranceRequired, true);
  assert.equal(result.coverageEffectiveDate, '2027-01-01');
  assert.equal(result.waitingPeriodDays, 78);
  assert.ok(result.estimatedBridgeCostCad > 300);
});

test('Alberta AHCIP provides immediate coverage from arrival date', () => {
  const result = evaluateHealthcareEligibility({
    province: 'AB',
    immigrationStatus: 'pr',
    landingDateStr: '2026-11-15'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.waitingPeriodDays, 0);
  assert.equal(result.bridgeInsuranceRequired, false);
  assert.equal(result.coverageEffectiveDate, '2026-11-15');
});

test('Quebec RAMQ enforces 3-month wait for standard arrivals but honors Bilateral Accords', () => {
  // India (Standard): 3-month wait
  const standard = evaluateHealthcareEligibility({
    province: 'QC',
    immigrationStatus: 'pr',
    originCountry: 'India',
    landingDateStr: '2026-11-01'
  });
  assert.equal(standard.isAccordExempt, false);
  assert.equal(standard.bridgeInsuranceRequired, true);
  assert.ok(standard.waitingPeriodDays >= 90);

  // France (Bilateral Accord): Exempt from 3-month wait
  assert.ok(RAMQ_BILATERAL_ACCORD_COUNTRIES.has('France'));
  const accord = evaluateHealthcareEligibility({
    province: 'QC',
    immigrationStatus: 'pr',
    originCountry: 'France',
    landingDateStr: '2026-11-01'
  });
  assert.equal(accord.isAccordExempt, true);
  assert.equal(accord.bridgeInsuranceRequired, false);
  assert.equal(accord.waitingPeriodDays, 0);
  assert.match(accord.statutoryGuidance, /Social Security Agreement/);
});

test('Visitors are ineligible for public healthcare and directed to emergency insurance', () => {
  const result = evaluateHealthcareEligibility({
    province: 'ON',
    immigrationStatus: 'visitor'
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.bridgeInsuranceRequired, true);
  assert.match(result.ineligibilityReason, /NOT eligible/);
});
