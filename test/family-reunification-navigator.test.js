import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateFamilyReunification } from '../src/family-reunification-navigator.js';

test('Family Reunification Navigator — Audits SOWP Master degree eligible student spouse', () => {
  const result = evaluateFamilyReunification({
    category: 'sowp',
    sponsorStatus: 'study_permit',
    studentProgramType: 'masters'
  });

  assert.equal(result.eligible, true);
  assert.equal(result.verdict, 'ELIGIBLE_FOR_SOWP');
  assert.ok(result.statutoryLegalBasis.includes('205'));
});

test('Family Reunification Navigator — Detects 2024 SOWP undergraduate ban refusal hazard', () => {
  const result = evaluateFamilyReunification({
    category: 'sowp',
    sponsorStatus: 'study_permit',
    studentProgramType: 'undergraduate_diploma'
  });

  assert.equal(result.eligible, false);
  assert.equal(result.refusalHazard, true);
  assert.ok(result.explanation.includes('strictly prohibited'));
});

test('Family Reunification Navigator — Audits Super Visa LICO + 30% financial requirement', () => {
  const passingResult = evaluateFamilyReunification({
    category: 'super_visa',
    householdSize: 3,
    sponsorAnnualIncomeCad: 60000,
    hasApprovedPrivateMedicalInsurance: true
  });

  assert.equal(passingResult.eligible, true);
  assert.equal(passingResult.verdict, 'SUPER_VISA_COMPLIANT');

  const failingResult = evaluateFamilyReunification({
    category: 'super_visa',
    householdSize: 3,
    sponsorAnnualIncomeCad: 35000,
    hasApprovedPrivateMedicalInsurance: true
  });

  assert.equal(failingResult.eligible, false);
  assert.equal(failingResult.financialAudit.meetsIncomeThreshold, false);
});

test('Family Reunification Navigator — Audits Dependent Child Age 22 Lock-in rule', () => {
  const under22 = evaluateFamilyReunification({
    category: 'dependent_child',
    childAge: 19,
    isMarriedOrCommonLaw: false
  });
  assert.equal(under22.eligible, true);

  const over22 = evaluateFamilyReunification({
    category: 'dependent_child',
    childAge: 23,
    isMarriedOrCommonLaw: false,
    hasPhysicalOrMentalDisability: false
  });
  assert.equal(over22.eligible, false);
});
