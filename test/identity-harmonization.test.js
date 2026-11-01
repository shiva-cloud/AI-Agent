// test/identity-harmonization.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateIdentityHarmonization,
  PROVINCIAL_NAME_CHANGE_RULES,
  PROHIBITED_DUAL_CITIZENSHIP_COUNTRIES
} from '../src/identity-harmonization.js';

describe('Legal Name Change & Dual-Identity Harmonization Engine', () => {
  it('provincial statutory rules and fees match official government schedules', () => {
    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.ON.minResidencyMonths, 12);
    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.ON.statutoryFeeCad, 137);
    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.ON.requiresFingerprinting, false);

    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.BC.minResidencyMonths, 3);
    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.BC.statutoryFeeCad, 137);
    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.BC.requiresFingerprinting, true);

    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.AB.minResidencyMonths, 3);
    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.AB.statutoryFeeCad, 120);
    assert.equal(PROVINCIAL_NAME_CHANGE_RULES.AB.requiresFingerprinting, true);

    assert.ok(PROHIBITED_DUAL_CITIZENSHIP_COUNTRIES.includes('IN'));
    assert.ok(PROHIBITED_DUAL_CITIZENSHIP_COUNTRIES.includes('CN'));
  });

  it('audits an eligible permanent resident in Ontario resolving a single-name / blank-surname conflict', () => {
    const res = evaluateIdentityHarmonization({
      discrepancyType: 'single_name_blank_surname',
      currentStatusInCanada: 'permanent_resident',
      residenceProvince: 'ON',
      monthsLivedInProvince: 14,
      hasForeignPassportSingleName: true,
      foreignCountryOfOrigin: 'IN'
    });

    assert.equal(res.isProvincialNameChangeEligible, true);
    assert.equal(res.resolutionVerdict, 'STATUTORY_REMEDY_AVAILABLE');
    assert.equal(res.minResidencyMonthsRequired, 12);
    assert.equal(res.requiresRcmpFingerprinting, false);
    assert.equal(res.statutoryViolations.length, 0);
    assert.ok(res.actionChecklist.some(a => a.targetAgency.includes('ServiceOntario')));
    assert.ok(res.governmentCascadeRoadmap.some(s => s.agency.includes('Service Canada')));
  });

  it('rejects temporary residents from provincial name changes (must update foreign passport first)', () => {
    const res = evaluateIdentityHarmonization({
      discrepancyType: 'single_name_blank_surname',
      currentStatusInCanada: 'work_permit_holder',
      residenceProvince: 'ON',
      monthsLivedInProvince: 14
    });

    assert.equal(res.isProvincialNameChangeEligible, false);
    assert.equal(res.resolutionVerdict, 'CONDITIONAL_ACTION_REQUIRED');
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Temporary Residents Ineligible')));
  });

  it('enforces provincial residency thresholds (12 months in ON vs 3 months in BC)', () => {
    // 6 months in Ontario (<12 months)
    const onRes = evaluateIdentityHarmonization({
      currentStatusInCanada: 'permanent_resident',
      residenceProvince: 'ON',
      monthsLivedInProvince: 6
    });
    assert.equal(onRes.isProvincialNameChangeEligible, false);
    assert.ok(onRes.statutoryViolations.some(v => v.rule.includes('Residency Period Not Met')));

    // 6 months in BC (>=3 months)
    const bcRes = evaluateIdentityHarmonization({
      currentStatusInCanada: 'permanent_resident',
      residenceProvince: 'BC',
      monthsLivedInProvince: 6
    });
    assert.equal(bcRes.isProvincialNameChangeEligible, true);
    assert.equal(bcRes.requiresRcmpFingerprinting, true);
  });

  it('audits mandatory foreign passport surrender upon Canadian naturalization for non-dual nationality origins', () => {
    // Origin prohibits dual citizenship (India)
    const indianNaturalized = evaluateIdentityHarmonization({
      discrepancyType: 'dual_citizenship_passport_surrender',
      currentStatusInCanada: 'canadian_citizen',
      foreignCountryOfOrigin: 'IN'
    });
    assert.ok(indianNaturalized.statutoryViolations.some(v => v.rule.includes('Prohibited Dual Citizenship')));
    assert.ok(indianNaturalized.actionChecklist.some(a => a.targetAgency.includes('Consulate General')));

    // Origin allows dual citizenship (UK)
    const ukNaturalized = evaluateIdentityHarmonization({
      discrepancyType: 'dual_citizenship_passport_surrender',
      currentStatusInCanada: 'canadian_citizen',
      foreignCountryOfOrigin: 'UK'
    });
    assert.equal(ukNaturalized.statutoryViolations.length, 0);
    assert.ok(ukNaturalized.summaryHeadline.includes('Dual Nationality Verified'));
  });

  it('provides clerical typo correction guidance under IRCC Form IMM 1436 (free of charge)', () => {
    const res = evaluateIdentityHarmonization({
      discrepancyType: 'spelling_typo_on_permit',
      currentStatusInCanada: 'work_permit_holder',
      residenceProvince: 'ON',
      monthsLivedInProvince: 2
    });

    assert.ok(res.actionChecklist.some(a => a.action.includes('IMM 1436')));
  });
});
