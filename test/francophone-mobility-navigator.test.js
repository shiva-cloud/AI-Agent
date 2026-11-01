import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FRANCOPHONE_MOBILITY_CONSTANTS,
  evaluateFrancophoneMobility
} from '../src/francophone-mobility-navigator.js';

test('Francophone Mobility Navigator — Constants match IRCC official guidelines', () => {
  assert.equal(FRANCOPHONE_MOBILITY_CONSTANTS.MIN_NCLC_LEVEL, 5);
  assert.equal(FRANCOPHONE_MOBILITY_CONSTANTS.LMIA_EXEMPTION_CODE, 'C16');
  assert.equal(FRANCOPHONE_MOBILITY_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD, 230.0);
  assert.equal(FRANCOPHONE_MOBILITY_CONSTANTS.TEST_VALIDITY_YEARS, 2);
  assert.deepEqual(FRANCOPHONE_MOBILITY_CONSTANTS.PROHIBITED_DESTINATION_PROVINCES, ['QC']);
});

test('Francophone Mobility Navigator — Qualifies compliant applicant in Ontario with NCLC 5', () => {
  const result = evaluateFrancophoneMobility({
    province: 'ON',
    frenchTestType: 'tef_canada',
    nclcSpeaking: 6,
    nclcListening: 5,
    testDate: '2025-06-01',
    nocCode: '21232',
    nocTeer: 1,
    hasGenuineJobOffer: true,
    employerPaidComplianceFee: true
  });

  assert.equal(result.overallEligible, true);
  assert.equal(result.deficiencies.length, 0);
  assert.equal(result.lmiaExemptionCode, 'C16');
  assert.match(result.summaryTitle, /Eligible for Francophone Mobility Program/);
});

test('Francophone Mobility Navigator — Rejects Quebec employment destination', () => {
  const result = evaluateFrancophoneMobility({
    province: 'QC',
    frenchTestType: 'tcf_canada',
    nclcSpeaking: 7,
    nclcListening: 7,
    testDate: '2025-06-01'
  });

  assert.equal(result.overallEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('destination is in Quebec')));
  assert.ok(result.riskWarnings.some(w => w.includes('QUEBEC EXCLUSION')));
});

test('Francophone Mobility Navigator — Rejects language score below NCLC 5', () => {
  const result = evaluateFrancophoneMobility({
    province: 'AB',
    frenchTestType: 'tef_canada',
    nclcSpeaking: 4, // Below 5
    nclcListening: 6,
    testDate: '2025-06-01'
  });

  assert.equal(result.overallEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('below statutory minimum NCLC 5')));
});

test('Francophone Mobility Navigator — Excludes primary agriculture occupations', () => {
  const result = evaluateFrancophoneMobility({
    province: 'BC',
    frenchTestType: 'tef_canada',
    nclcSpeaking: 6,
    nclcListening: 6,
    testDate: '2025-06-01',
    nocCode: '85100', // Livestock farm worker (primary agriculture)
    isPrimaryAgriculture: true
  });

  assert.equal(result.overallEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('primary agriculture')));
  assert.ok(result.riskWarnings.some(w => w.includes('AGRICULTURE EXCLUSION')));
});

test('Francophone Mobility Navigator — Flags expired language test beyond 2 years', () => {
  const result = evaluateFrancophoneMobility({
    province: 'NS',
    frenchTestType: 'tef_canada',
    nclcSpeaking: 7,
    nclcListening: 7,
    testDate: '2023-01-01', // Expired relative to 2026
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.overallEligible, false);
  assert.equal(result.languageAudit.testExpired, true);
  assert.ok(result.deficiencies.some(d => d.includes('over 2 years old')));
});
