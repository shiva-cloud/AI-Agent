// test/vehicle-importation.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateVehicleImportation,
  STATUTORY_RIV_FEE_CAD,
  FEDERAL_AC_EXCISE_TAX_CAD,
  NON_US_EXEMPTION_AGE_YEARS
} from '../src/vehicle-importation.js';

describe('Canadian Newcomer Vehicle Importation & Transport Canada RIV Engine', () => {
  it('statutory constants match federal standards', () => {
    assert.equal(STATUTORY_RIV_FEE_CAD, 335);
    assert.equal(FEDERAL_AC_EXCISE_TAX_CAD, 100);
    assert.equal(NON_US_EXEMPTION_AGE_YEARS, 15);
  });

  it('audits a compliant US vehicle under the RIV program with settler tariff exemption', () => {
    const res = evaluateVehicleImportation({
      countryOfOrigin: 'US',
      vehicleModelYear: 2022,
      vehicleType: 'passenger_car',
      isOwnedAbroadAtLeastSixMonths: true,
      isTitledInImmigrantName: true,
      hasOpenRecall: false,
      hasAirConditioning: true,
      fuelEfficiencyLitersPer100Km: 8.0,
      destinationProvince: 'ON',
      estimatedVehicleValueCad: 30000,
      settlerStatus: 'permanent_resident'
    });

    assert.equal(res.isStatutorilyAdmissible, true);
    assert.equal(res.admissibilityVerdict, 'ADMISSIBLE_RIV_REQUIRED');
    assert.equal(res.costAndTaxAudit.isSettlerTariffExempt, true);
    assert.equal(res.costAndTaxAudit.customsDutyCad, 0);
    assert.equal(res.costAndTaxAudit.gstCad, 0);
    assert.equal(res.costAndTaxAudit.acExciseTaxCad, 100);
    assert.equal(res.costAndTaxAudit.rivFeeCad, 335);
    assert.equal(res.usCbpExportRequirements.isMandatory, true);
    assert.ok(res.usCbpExportRequirements.statute.includes('19 CFR 192.2'));
    assert.ok(res.requiredModifications.some(m => m.includes('Daytime Running Lights')));
  });

  it('strictly bars non-US vehicles under 15 years old (MVSA s. 7(1)(b))', () => {
    const res = evaluateVehicleImportation({
      countryOfOrigin: 'OTHER', // e.g. Europe or Japan
      vehicleModelYear: 2020, // ~6 years old (<15)
      settlerStatus: 'permanent_resident'
    });

    assert.equal(res.isStatutorilyAdmissible, false);
    assert.equal(res.admissibilityVerdict, 'STATUTORILY_INADMISSIBLE');
    assert.ok(res.summaryHeadline.includes('Inadmissible: Non-US vehicle is only'));
    const ageDefect = res.statutoryDefects.find(d => d.defect.includes('Under 15 Years Old'));
    assert.ok(ageDefect);
    assert.ok(ageDefect.statute.includes('Motor Vehicle Safety Act'));
  });

  it('permits non-US vehicles that are 15+ years old under MVSA exemption', () => {
    const res = evaluateVehicleImportation({
      countryOfOrigin: 'OTHER',
      vehicleModelYear: 2005, // 21 years old (>15)
      settlerStatus: 'permanent_resident',
      isOwnedAbroadAtLeastSixMonths: true
    });

    assert.equal(res.isStatutorilyAdmissible, true);
    assert.equal(res.admissibilityVerdict, 'ADMISSIBLE_15_YEAR_EXEMPT');
    assert.equal(res.costAndTaxAudit.rivFeeCad, 0); // 15-yr exempt from RIV
    assert.ok(res.summaryHeadline.includes('Admissible under 15-Year Rule'));
  });

  it('detects unresolved safety recalls on US vehicles', () => {
    const res = evaluateVehicleImportation({
      countryOfOrigin: 'US',
      vehicleModelYear: 2021,
      hasOpenRecall: true
    });

    const recallDefect = res.statutoryDefects.find(d => d.defect.includes('Recall Notice'));
    assert.ok(recallDefect);
    assert.ok(recallDefect.legalRemedy.includes('Recall Clearance Letter'));
  });

  it('calculates Green Levy for fuel-inefficient vehicles (>= 13.0 L/100km)', () => {
    const res = evaluateVehicleImportation({
      countryOfOrigin: 'US',
      vehicleModelYear: 2021,
      fuelEfficiencyLitersPer100Km: 15.5
    });

    assert.equal(res.costAndTaxAudit.greenLevyCad, 3000);
  });
});
