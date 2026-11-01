import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCaregiverDirectToPr,
  CAREGIVER_ELIGIBLE_NOCS,
  CAREGIVER_MINIMUM_CLB
} from '../src/federal-caregiver-direct-to-pr-pilot-navigator.js';

test('Federal Caregiver - Eligible Child Care Provider (NOC 44100)', () => {
  const result = evaluateCaregiverDirectToPr({
    nocCode: '44100',
    jobOfferFullTime: true,
    jobOfferNonSeasonal: true,
    jobOfferOutsideQuebec: true,
    employerType: 'PRIVATE_HOUSEHOLD',
    careRecipientType: 'CHILDREN_UNDER_18',
    employerMeetsLicoIncomeTest: true,
    jobRequiresMandatoryLiveIn: false,
    clbSpeaking: 5,
    clbListening: 5,
    clbReading: 4,
    clbWriting: 4,
    hasHighSchoolDiplomaOrEca: true,
    canadianCaregiverExperienceMonths: 0,
    hasValidLegalStatusInCanada: true,
    applicantLocation: 'IN_CANADA'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_CAREGIVER_DIRECT_TO_PR');
  assert.equal(result.experienceCategory, 'DIRECT_PR_WITH_QUALIFYING_JOB_OFFER');
  assert.equal(result.disqualifications.length, 0);
  assert.equal(result.targetNoc.title, 'Home child care providers');
});

test('Federal Caregiver - Ineligible due to Commercial Employer and Care Recipient Mismatch', () => {
  const result = evaluateCaregiverDirectToPr({
    nocCode: '44100', // Child care
    careRecipientType: 'SENIORS_65_PLUS', // Mismatch!
    employerType: 'COMMERCIAL_FACILITY', // Commercial facility prohibited!
    jobOfferFullTime: true,
    jobOfferNonSeasonal: true,
    jobOfferOutsideQuebec: true
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_CAREGIVER_PILOT');
  assert.ok(result.disqualifications.some(d => d.criterion === 'COMMERCIAL_EMPLOYER_PROHIBITION'));
  assert.ok(result.disqualifications.some(d => d.criterion === 'RECIPIENT_MISMATCH'));
});

test('Federal Caregiver - Mandatory Live-in warning and Language Deficit', () => {
  const result = evaluateCaregiverDirectToPr({
    nocCode: '44101', // Home support worker
    careRecipientType: 'SENIORS_OR_PERSONS_WITH_DISABILITIES',
    employerType: 'PRIVATE_HOUSEHOLD',
    jobRequiresMandatoryLiveIn: true, // Prohibited mandatory condition
    clbSpeaking: 3, // Under CLB 4
    clbListening: 4,
    clbReading: 4,
    clbWriting: 4,
    hasHighSchoolDiplomaOrEca: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'LANGUAGE_BENCHMARK_UNSATISFIED'));
  assert.ok(result.riskWarnings.some(w => w.warning === 'PROHIBITED_MANDATORY_LIVE_IN_CONDITION'));
});

test('Federal Caregiver - Quebec Exclusion', () => {
  const result = evaluateCaregiverDirectToPr({
    nocCode: '44100',
    jobOfferOutsideQuebec: false // Job in Quebec
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.disqualifications.some(d => d.criterion === 'QUEBEC_JURISDICTION_EXCLUSION'));
});

test('Federal Caregiver - Verify Constants and Eligible NOCs', () => {
  assert.equal(CAREGIVER_MINIMUM_CLB, 4);
  assert.ok(CAREGIVER_ELIGIBLE_NOCS['44100']);
  assert.ok(CAREGIVER_ELIGIBLE_NOCS['44101']);
});
