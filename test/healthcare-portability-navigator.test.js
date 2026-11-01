import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEALTHCARE_CONSTANTS,
  PROVINCIAL_HEALTHCARE_SCHEMES,
  evaluateHealthcarePortabilityAndIfhp,
  generateHealthcareRegistrationGuide
} from '../src/healthcare-portability-navigator.js';

test('Healthcare Portability Navigator — Statutory constants match provincial and federal benchmarks', () => {
  assert.equal(HEALTHCARE_CONSTANTS.ONTARIO_WAITING_PERIOD_DAYS, 0);
  assert.equal(HEALTHCARE_CONSTANTS.BC_WAITING_MONTHS_ADDITIONAL, 2);
  assert.equal(HEALTHCARE_CONSTANTS.QUEBEC_WAITING_MONTHS, 3);
  assert.equal(HEALTHCARE_CONSTANTS.MIN_WORK_PERMIT_MONTHS, 6);

  assert.ok(PROVINCIAL_HEALTHCARE_SCHEMES.ON);
  assert.ok(PROVINCIAL_HEALTHCARE_SCHEMES.BC);
  assert.equal(PROVINCIAL_HEALTHCARE_SCHEMES.ON.hasWaitingPeriod, false);
});

test('Healthcare Portability Navigator — Audits Ontario OHIP immediate coverage with 0 waiting period for eligible PR/Work Permit holder', () => {
  const result = evaluateHealthcarePortabilityAndIfhp({
    targetProvince: 'ON',
    originType: 'outside_canada',
    immigrationStatus: 'permanent_resident',
    arrivalDate: '2026-09-15'
  });

  assert.equal(result.eligibleForProvincialHealthcare, true);
  assert.equal(result.waitingPeriodDays, 0);
  assert.equal(result.coverageStartDate, '2026-09-15');
  assert.equal(result.needsPrivateBridgingInsurance, false);
  assert.ok(result.notes.some(n => n.includes('NO WAITING PERIOD IN ONTARIO')));
});

test('Healthcare Portability Navigator — Enforces 6-month full-time employer letter requirement for Open Work Permit in Ontario', () => {
  // With 6-month employer letter
  const withLetter = evaluateHealthcarePortabilityAndIfhp({
    targetProvince: 'ON',
    immigrationStatus: 'open_work_permit',
    workPermitDurationMonths: 24,
    hasFullTimeEmployerJobLetter6Months: true
  });
  assert.equal(withLetter.eligibleForProvincialHealthcare, true);

  // Without 6-month employer letter
  const withoutLetter = evaluateHealthcarePortabilityAndIfhp({
    targetProvince: 'ON',
    immigrationStatus: 'open_work_permit',
    workPermitDurationMonths: 24,
    hasFullTimeEmployerJobLetter6Months: false
  });
  assert.equal(withoutLetter.eligibleForProvincialHealthcare, false);
  assert.ok(withoutLetter.riskWarnings.some(w => w.includes('CRITICAL REQUIREMENT')));
});

test('Healthcare Portability Navigator — Calculates BC MSP waiting period and private bridging insurance necessity', () => {
  const bcResult = evaluateHealthcarePortabilityAndIfhp({
    targetProvince: 'BC',
    originType: 'outside_canada',
    immigrationStatus: 'permanent_resident',
    arrivalDate: '2026-09-15'
  });

  assert.equal(bcResult.eligibleForProvincialHealthcare, true);
  assert.equal(bcResult.coverageStartDate, '2026-12-01'); // Sept 15 -> rest of Sept + Oct + Nov -> Dec 1
  assert.ok(bcResult.waitingPeriodDays > 70);
  assert.equal(bcResult.needsPrivateBridgingInsurance, true);
  assert.ok(bcResult.notes.some(n => n.includes('BC MSP WAITING PERIOD')));
});

test('Healthcare Portability Navigator — Verifies Canada Health Act interprovincial portability protection', () => {
  const mover = evaluateHealthcarePortabilityAndIfhp({
    targetProvince: 'BC',
    originType: 'another_province',
    originProvince: 'ON',
    immigrationStatus: 'permanent_resident',
    arrivalDate: '2026-09-15'
  });

  assert.equal(mover.eligibleForProvincialHealthcare, true);
  assert.equal(mover.interprovincialPortabilityActive, true);
  assert.equal(mover.needsPrivateBridgingInsurance, false);
  assert.ok(mover.notes.some(n => n.includes('CANADA HEALTH ACT PORTABILITY')));
});

test('Healthcare Portability Navigator — Handles Refugee Claimants with Interim Federal Health Program (IFHP)', () => {
  const refugee = evaluateHealthcarePortabilityAndIfhp({
    targetProvince: 'ON',
    isRefugeeClaimantWithIfhpCertificate: true,
    arrivalDate: '2026-08-01'
  });

  assert.equal(refugee.ifhpActive, true);
  assert.equal(refugee.eligibleForProvincialHealthcare, false);
  assert.ok(refugee.coverageType.includes('Medavie Blue Cross'));
  assert.ok(refugee.requiredDocuments.some(d => d.includes('RPCD')));

  const guide = generateHealthcareRegistrationGuide({
    applicantName: 'Tariq Al-Mansoor',
    province: 'ON',
    schemeName: 'Ontario Health Insurance Plan (OHIP)',
    needsBridgingInsurance: false,
    coverageStartDate: '2026-08-01'
  });

  assert.ok(guide.includes('PROVINCIAL HEALTHCARE REGISTRATION'));
  assert.ok(guide.includes('Ontario Health Insurance Plan'));
  assert.ok(guide.includes('ServiceOntario'));
});
