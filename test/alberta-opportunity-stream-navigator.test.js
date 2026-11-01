import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAlbertaOpportunityStream, AAIP_AOS_CONSTANTS } from '../src/alberta-opportunity-stream-navigator.js';

test('AAIP AOS Navigator — Constants match Alberta immigration guidelines', () => {
  assert.equal(AAIP_AOS_CONSTANTS.MIN_ALBERTA_EXPERIENCE_MONTHS_STANDARD, 12);
  assert.equal(AAIP_AOS_CONSTANTS.MIN_ALBERTA_EXPERIENCE_MONTHS_PGWP, 6);
  assert.equal(AAIP_AOS_CONSTANTS.MIN_CLB_TEER_0_1_2_3, 5);
  assert.equal(AAIP_AOS_CONSTANTS.MIN_CLB_TEER_4_5, 4);
  assert.equal(AAIP_AOS_CONSTANTS.APPLICATION_FEE_CAD, 840.0);
});

test('AAIP AOS Navigator — Standard worker with 14 months Alberta experience and CLB 6 qualifies', () => {
  const result = evaluateAlbertaOpportunityStream({
    workPermitType: 'lmia_based',
    albertaWorkExperienceMonths: 14,
    teerCategory: 2,
    nocCode: '21231',
    languageClbLevel: 6,
    hasCanadianHighSchoolOrEca: true,
    hasPermanentJobOfferInAlberta: true
  });

  assert.equal(result.isAosEligible, true);
  assert.equal(result.overallVerdict, 'ELIGIBLE_FOR_AAIP_NOMINATION');
  assert.equal(result.workExperienceAudit.isExperienceSatisfied, true);
  assert.equal(result.languageAudit.isLanguageSatisfied, true);
  assert.ok(result.eligibleStreams.some(s => s.streamName.includes('Alberta Opportunity Stream')));
});

test('AAIP AOS Navigator — Strictly bars non-Alberta PGWP graduates from AOS', () => {
  const result = evaluateAlbertaOpportunityStream({
    workPermitType: 'pgwp_non_alberta_grad',
    albertaWorkExperienceMonths: 12,
    languageClbLevel: 7
  });

  assert.equal(result.isAosEligible, false);
  assert.equal(result.workPermitAudit.isWorkPermitEligible, false);
  assert.ok(result.violationsAndBars.some(v => v.includes('INELIGIBLE WORK PERMIT')));
});

test('AAIP AOS Navigator — Alberta PGWP graduate qualifies with 6 months related experience', () => {
  const result = evaluateAlbertaOpportunityStream({
    workPermitType: 'pgwp_alberta_grad',
    albertaWorkExperienceMonths: 7,
    isGraduatedFromAlbertaDli: true,
    languageClbLevel: 6,
    teerCategory: 1
  });

  assert.equal(result.isAosEligible, true);
  assert.equal(result.workExperienceAudit.isExperienceSatisfied, true);
  assert.ok(result.statutoryProtections.some(p => p.includes('PGWP Alberta Graduate')));
});

test('AAIP AOS Navigator — Recognizes Tourism & Hospitality Stream with 6 months experience', () => {
  const result = evaluateAlbertaOpportunityStream({
    workPermitType: 'lmia_based',
    albertaWorkExperienceMonths: 8,
    nocCode: '65201',
    sector: 'tourism_hospitality',
    languageClbLevel: 5,
    teerCategory: 5
  });

  assert.ok(result.eligibleStreams.some(s => s.streamName.includes('Tourism and Hospitality Stream')));
});
