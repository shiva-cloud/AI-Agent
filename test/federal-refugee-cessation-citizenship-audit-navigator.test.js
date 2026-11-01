import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateRefugeeCessationRisk
} from '../src/federal-refugee-cessation-citizenship-audit-navigator.js';

test('Refugee Cessation - Citizen Shield Immunity', () => {
  const result = evaluateRefugeeCessationRisk({
    currentStatusInCanada: 'CANADIAN_CITIZEN',
    hasAcquiredCanadianCitizenship: true
  });

  assert.equal(result.isExemptFromIrpaCessation, true);
  assert.equal(result.legalStatusVerdict, 'CITIZEN_SHIELD_IMMUNE_FROM_IRPA_108');
  assert.equal(result.cessationRiskLevel, 'NONE');
});

test('Refugee Cessation - Critical Risk (Renewed passport and returned for vacation)', () => {
  const result = evaluateRefugeeCessationRisk({
    currentStatusInCanada: 'PERMANENT_RESIDENT',
    hasAcquiredCanadianCitizenship: false,
    hasAppliedForOrRenewedNationalPassport: true,
    usedNationalPassportToTravel: true,
    traveledBackToCountryOfPersecution: true,
    numberOfTripsToCountryOfPersecution: 2,
    cumulativeDaysInCountryOfPersecution: 45,
    purposeOfTravel: 'LEISURE_VACATION',
    ministerHasFiledCessationApplication: true
  });

  assert.equal(result.isExemptFromIrpaCessation, false);
  assert.equal(result.cessationRiskLevel, 'CRITICAL');
  assert.equal(result.legalVerdict, 'ACTIVE_MINISTERIAL_CESSATION_HEARING_DEFENSE_REQUIRED');
  assert.ok(result.riskFactors.some(r => r.risk === 'PRESUMPTION_OF_REAVAILMENT_NATIONAL_PASSPORT'));
  assert.ok(result.riskFactors.some(r => r.risk === 'NON_URGENT_RETURN_TRAVEL'));
  assert.ok(result.statutoryFindings.some(f => f.finding === 'AUTOMATIC_LOSS_OF_PR_STATUS_CONSEQUENCE'));
});

test('Refugee Cessation - Controlled Risk (Used Canadian RTD, brief emergency visit, duress)', () => {
  const result = evaluateRefugeeCessationRisk({
    currentStatusInCanada: 'PERMANENT_RESIDENT',
    hasAppliedForOrRenewedNationalPassport: false,
    usedNationalPassportToTravel: false,
    usedCanadianRefugeeTravelDocument: true,
    traveledBackToCountryOfPersecution: true,
    numberOfTripsToCountryOfPersecution: 1,
    cumulativeDaysInCountryOfPersecution: 5,
    purposeOfTravel: 'HUMANITARIAN_EMERGENCY_FAMILY_ILLNESS',
    wasUnderStateCoercionOrDuress: true,
    ministerHasFiledCessationApplication: false
  });

  assert.equal(result.isExemptFromIrpaCessation, false);
  assert.equal(result.cessationRiskLevel, 'MODERATE');
  assert.ok(result.mitigatingFactors.some(m => m.factor === 'USE_OF_CANADIAN_REFUGEE_TRAVEL_DOCUMENT'));
  assert.ok(result.mitigatingFactors.some(m => m.factor === 'COMPELLING_HUMANITARIAN_PURPOSE'));
  assert.ok(result.mitigatingFactors.some(m => m.factor === 'LACK_OF_VOLUNTARINESS'));
});
