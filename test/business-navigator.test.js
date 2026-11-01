// test/business-navigator.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CRA_BUSINESS_STATUTORY_CONSTANTS,
  PROVINCIAL_CORPORATE_STANDARDS,
  evaluateBusinessStructure
} from '../src/business-navigator.js';

test('Canadian Newcomer Business, Incorporation & GST/HST Engine', async (t) => {
  await t.test('statutory constants match federal CRA and corporate legislation', () => {
    assert.equal(CRA_BUSINESS_STATUTORY_CONSTANTS.GST_HST_SMALL_SUPPLIER_THRESHOLD_CAD, 30000);
    assert.equal(CRA_BUSINESS_STATUTORY_CONSTANTS.GST_HST_REGISTRATION_WINDOW_DAYS, 29);
    assert.equal(CRA_BUSINESS_STATUTORY_CONSTANTS.SMALL_BUSINESS_DEDUCTION_LIMIT_CAD, 500000);
    assert.equal(CRA_BUSINESS_STATUTORY_CONSTANTS.FEDERAL_SMALL_BUSINESS_RATE, 0.09);
    assert.equal(PROVINCIAL_CORPORATE_STANDARDS.ON.requiresCanadianResidentDirector, false);
    assert.equal(PROVINCIAL_CORPORATE_STANDARDS.BC.requiresCanadianResidentDirector, false);
  });

  await t.test('strictly bars closed work permit holders from operating an independent business', () => {
    const res = evaluateBusinessStructure({
      province: 'ON',
      immigrationStatus: 'work_permit_holder',
      workPermitType: 'closed_employer_specific',
      projectedAnnualRevenueCad: 80000
    });

    assert.equal(res.immigrationCompliance.isLegallyAuthorizedToOperate, false);
    assert.equal(res.immigrationCompliance.severity, 'STATUTORILY_PROHIBITED');
    assert.match(res.immigrationCompliance.finding, /Closed work permit holders are strictly prohibited/);
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Closed Work Permit Business Ban')));
  });

  await t.test('authorizes open work permit holders (PGWP / SOWP) to operate and incorporate', () => {
    const res = evaluateBusinessStructure({
      province: 'ON',
      immigrationStatus: 'work_permit_holder',
      workPermitType: 'open_work_permit',
      projectedAnnualRevenueCad: 130000,
      clientCount: 3
    });

    assert.equal(res.immigrationCompliance.isLegallyAuthorizedToOperate, true);
    assert.equal(res.immigrationCompliance.severity, 'AUTHORIZED');
    assert.equal(res.recommendedStructure, 'INCORPORATION_RECOMMENDED');
  });

  await t.test('detects mandatory GST/HST registration above $30,000 CAD and calculates Quick Method profit', () => {
    const res = evaluateBusinessStructure({
      province: 'ON',
      projectedAnnualRevenueCad: 100000
    });

    assert.equal(res.gstHstAudit.isRegistrationMandatory, true);
    assert.equal(res.gstHstAudit.smallSupplierThresholdCad, 30000);
    assert.equal(res.gstHstAudit.estimatedGstHstCollectedCad, 13000); // 13% of 100k
    assert.equal(res.gstHstAudit.quickMethodEligible, true);
    assert.ok(res.gstHstAudit.quickMethodTaxProfitCad > 2000);
  });

  await t.test('flags severe Personal Services Business (PSB) tax trap (44.5% rate) for single-client contractors', () => {
    const res = evaluateBusinessStructure({
      province: 'ON',
      projectedAnnualRevenueCad: 150000,
      clientCount: 1, // Only 1 client
      subcontractorHiringPermitted: false, // Cannot subcontract
      providesOwnEquipmentAndTools: false, // Client provides laptop
      hasRiskOfFinancialLoss: false
    });

    assert.equal(res.psbRiskAudit.psbRiskLevel, 'HIGH_RISK_PSB_TRAP');
    assert.equal(res.psbRiskAudit.effectiveCorporateTaxRate, 44.5);
    assert.ok(res.psbRiskAudit.consequences.length >= 3);
    assert.ok(res.psbRiskAudit.mitigationSteps.length >= 2);
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Personal Services Business')));
  });

  await t.test('evaluates corporate director residency repeal in Ontario under OBCA Bill 213', () => {
    const res = evaluateBusinessStructure({
      province: 'ON'
    });

    assert.equal(res.corporateDirectorResidency.requiresCanadianResidentDirector, false);
    assert.match(res.corporateDirectorResidency.statute, /Ontario Business Corporations Act/);
  });
});
