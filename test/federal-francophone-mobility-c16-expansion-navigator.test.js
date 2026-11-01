import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_C16_CONSTANTS,
  evaluateFederalFrancophoneMobilityC16
} from '../src/federal-francophone-mobility-c16-expansion-navigator.js';

test('Federal C16 Francophone Mobility - Constants reflect IRPR s. 205(a)', () => {
  assert.equal(FEDERAL_C16_CONSTANTS.EXEMPTION_CODE, 'C16');
  assert.equal(FEDERAL_C16_CONSTANTS.MIN_FRENCH_ORAL_NCLC_LEVEL, 5);
  assert.equal(FEDERAL_C16_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD, 230);
  assert.equal(FEDERAL_C16_CONSTANTS.EXCLUDED_PROVINCE, 'QC');
});

test('Federal C16 Francophone Mobility - Fully eligible TEER 4 worker in Ontario', () => {
  const result = evaluateFederalFrancophoneMobilityC16({
    frenchOralNclcLevel: 6,
    destinationProvince: 'ON',
    teerCategory: 4, // Eligible under 2023 expansion!
    isPrimaryAgricultureNoc: false,
    hasValidJobOffer: true,
    hasApprovedFrenchTest: true,
    employerComplianceFeePaid: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_C16_FRANCOPHONE_MOBILITY');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.workPermitDetails.lmiaRequired, false);
  assert.equal(result.workPermitDetails.workplaceLanguageFrenchRequired, false);
});

test('Federal C16 Francophone Mobility - Ineligible with below NCLC 5 French oral level', () => {
  const result = evaluateFederalFrancophoneMobilityC16({
    frenchOralNclcLevel: 4,
    destinationProvince: 'AB'
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_C16_LMIA_EXEMPTION');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'BELOW_MINIMUM_FRENCH_ORAL_BENCHMARK'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'UPGRADE_FRENCH_ORAL_PROFICIENCY'));
});

test('Federal C16 Francophone Mobility - Ineligible destination Quebec', () => {
  const result = evaluateFederalFrancophoneMobilityC16({
    frenchOralNclcLevel: 7,
    destinationProvince: 'QC'
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INELIGIBLE_DESTINATION_QUEBEC'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'EXPLORE_QUEBEC_CAQ_OR_RELOCATE_OFFER'));
});

test('Federal C16 Francophone Mobility - Ineligible primary agriculture occupation', () => {
  const result = evaluateFederalFrancophoneMobilityC16({
    frenchOralNclcLevel: 5,
    destinationProvince: 'NB',
    isPrimaryAgricultureNoc: true
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'EXCLUDED_PRIMARY_AGRICULTURE_OCCUPATION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'APPLY_VIA_AGRICULTURAL_STREAM_LMIA'));
});
