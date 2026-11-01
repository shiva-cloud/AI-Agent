import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FSTP_STATUTORY_RULES,
  isNocEligibleForSkilledTrades,
  evaluateFederalSkilledTradesProgram
} from '../src/federal-skilled-trades-navigator.js';

test('FSTP Statutory Rules Constants & NOC validation', () => {
  assert.equal(FSTP_STATUTORY_RULES.MIN_YEARS_EXPERIENCE, 2);
  assert.equal(FSTP_STATUTORY_RULES.MIN_HOURS_EXPERIENCE, 3120);
  assert.equal(FSTP_STATUTORY_RULES.MIN_CLB_SPEAKING_LISTENING, 5);
  assert.equal(FSTP_STATUTORY_RULES.MIN_CLB_READING_WRITING, 4);

  // NOC 72410 (Electrician/auto) is Major Group 72 -> valid
  assert.equal(isNocEligibleForSkilledTrades('72410'), true);
  // NOC 73112 is Major Group 73 -> valid
  assert.equal(isNocEligibleForSkilledTrades('73112'), true);
  // NOC 63200 (Cooks) is eligible specific group -> valid
  assert.equal(isNocEligibleForSkilledTrades('63200'), true);
  // NOC 21231 (Software engineer) -> invalid
  assert.equal(isNocEligibleForSkilledTrades('21231'), false);
});

test('evaluateFederalSkilledTradesProgram confirms eligible candidate with Certificate of Qualification', () => {
  const result = evaluateFederalSkilledTradesProgram({
    nocCode: '72410',
    yearsOfTradesExperience: 4,
    hoursOfTradesExperience: 6000,
    hasCanadianCertificateOfQualification: true,
    certifyingProvince: 'ON',
    hasQualifyingCanadianJobOffer: false,
    clbSpeaking: 6,
    clbListening: 6,
    clbReading: 5,
    clbWriting: 5,
    hasActiveExpressEntryProfile: true,
    candidateName: 'Alex Tremblay'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityStatus, 'ELIGIBLE_FOR_FSTP');
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('+50 CRS Points')));
});

test('evaluateFederalSkilledTradesProgram confirms eligible candidate with Canadian Job Offer', () => {
  const result = evaluateFederalSkilledTradesProgram({
    nocCode: '63200', // Cook
    yearsOfTradesExperience: 2.5,
    hoursOfTradesExperience: 3900,
    hasCanadianCertificateOfQualification: false,
    hasQualifyingCanadianJobOffer: true,
    jobOfferDurationYears: 1,
    numberOfEmployersOnJobOffer: 1,
    clbSpeaking: 5,
    clbListening: 5,
    clbReading: 4,
    clbWriting: 4,
    hasActiveExpressEntryProfile: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityStatus, 'ELIGIBLE_FOR_FSTP');
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Category-Based Draws')));
});

test('evaluateFederalSkilledTradesProgram catches missing trade prerequisite (no cert and no job offer)', () => {
  const result = evaluateFederalSkilledTradesProgram({
    nocCode: '72100',
    yearsOfTradesExperience: 3,
    hoursOfTradesExperience: 4800,
    hasCanadianCertificateOfQualification: false,
    hasQualifyingCanadianJobOffer: false, // Missing both
    clbSpeaking: 6,
    clbListening: 6,
    clbReading: 5,
    clbWriting: 5,
    hasActiveExpressEntryProfile: true
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityStatus, 'INELIGIBLE_FOR_FSTP');
  assert.ok(result.deficiencies.some(d => d.includes('Missing mandatory trades prerequisite')));
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Provincial Trade Challenge')));
});

test('evaluateFederalSkilledTradesProgram catches language benchmark shortfall in speaking/reading', () => {
  const result = evaluateFederalSkilledTradesProgram({
    nocCode: '73100',
    yearsOfTradesExperience: 3,
    hoursOfTradesExperience: 4500,
    hasCanadianCertificateOfQualification: true,
    certifyingProvince: 'AB',
    clbSpeaking: 4, // Shortfall (requires 5)
    clbListening: 5,
    clbReading: 3, // Shortfall (requires 4)
    clbWriting: 4,
    hasActiveExpressEntryProfile: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('Language benchmark shortfall')));
});
