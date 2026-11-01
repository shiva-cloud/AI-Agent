import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBcSpeculationTaxDeclaration, BC_SVT_CONSTANTS } from '../src/bc-speculation-tax-declaration-navigator.js';

test('BC SVT Declaration Navigator — Constants match provincial legislation', () => {
  assert.equal(BC_SVT_CONSTANTS.CANADIAN_RESIDENT_TAX_RATE_PERCENT, 0.5);
  assert.equal(BC_SVT_CONSTANTS.FOREIGN_AND_SATELLITE_TAX_RATE_PERCENT, 2.0);
  assert.equal(BC_SVT_CONSTANTS.MINIMUM_OCCUPANCY_MONTHS_REQUIRED, 6);
  assert.equal(BC_SVT_CONSTANTS.SATELLITE_FAMILY_FOREIGN_INCOME_THRESHOLD_PERCENT, 50);
});

test('BC SVT Declaration Navigator — Principal residence exemption for Canadian citizen with 12 months occupancy', () => {
  const result = evaluateBcSpeculationTaxDeclaration({
    propertyRegion: 'Metro Vancouver',
    assessedPropertyValueCad: 1500000,
    ownerCitizenshipStatus: 'canadian_citizen_or_pr',
    isSatelliteFamily: false,
    propertyUseCategory: 'principal_residence',
    monthsOccupiedInYear: 12
  });

  assert.equal(result.isExemptFromSvt, true);
  assert.equal(result.estimatedTaxLiabilityCad, 0);
  assert.equal(result.statutoryAuthority, 'SVT Act s. 37');
  assert.ok(result.statutoryProtections.some(p => p.includes('SVT Act s. 37')));
});

test('BC SVT Declaration Navigator — Bars satellite family from principal residence exemption and applies 2% rate', () => {
  const result = evaluateBcSpeculationTaxDeclaration({
    propertyRegion: 'Kelowna',
    assessedPropertyValueCad: 1000000,
    ownerCitizenshipStatus: 'canadian_citizen_or_pr',
    isSatelliteFamily: true,
    propertyUseCategory: 'principal_residence',
    monthsOccupiedInYear: 10
  });

  assert.equal(result.isExemptFromSvt, false);
  assert.equal(result.applicableTaxRatePercent, 2.0);
  // 1,000,000 * 2% = 20,000
  assert.equal(result.estimatedTaxLiabilityCad, 20000);
  assert.ok(result.riskWarnings.some(w => w.includes('SATELLITE FAMILY BAR')));
});

test('BC SVT Declaration Navigator — Arm\'s-length tenancy of 7 months qualifies for s. 38 exemption', () => {
  const result = evaluateBcSpeculationTaxDeclaration({
    propertyRegion: 'Victoria',
    assessedPropertyValueCad: 800000,
    propertyUseCategory: 'long_term_rental',
    monthsOccupiedInYear: 7,
    hasArmsLengthTenancyAgreement: true
  });

  assert.equal(result.isExemptFromSvt, true);
  assert.equal(result.estimatedTaxLiabilityCad, 0);
  assert.equal(result.statutoryAuthority, 'SVT Act ss. 38–39');
});

test('BC SVT Declaration Navigator — Vacant secondary home taxed at 0.5% for Canadian PR non-satellite', () => {
  const result = evaluateBcSpeculationTaxDeclaration({
    propertyRegion: 'Abbotsford',
    assessedPropertyValueCad: 900000,
    ownerCitizenshipStatus: 'canadian_citizen_or_pr',
    isSatelliteFamily: false,
    propertyUseCategory: 'vacant_secondary',
    monthsOccupiedInYear: 2
  });

  assert.equal(result.isExemptFromSvt, false);
  assert.equal(result.applicableTaxRatePercent, 0.5);
  // 900,000 * 0.5% = 4500
  assert.equal(result.estimatedTaxLiabilityCad, 4500);
});
