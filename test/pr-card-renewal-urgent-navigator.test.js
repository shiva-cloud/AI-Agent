import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePrCardRenewalUrgent, PR_CARD_CONSTANTS } from '../src/pr-card-renewal-urgent-navigator.js';

test('PR Card Renewal Navigator — Constants reflect federal IRPA and IRPR standards', () => {
  assert.equal(PR_CARD_CONSTANTS.RESIDENCY_OBLIGATION_DAYS_REQUIRED, 730);
  assert.equal(PR_CARD_CONSTANTS.FIVE_YEAR_WINDOW_DAYS, 1825);
  assert.equal(PR_CARD_CONSTANTS.URGENT_PROCESSING_TRAVEL_WINDOW_DAYS, 90);
  assert.equal(PR_CARD_CONSTANTS.PR_CARD_APPLICATION_FEE_CAD, 50.0);
  assert.equal(PR_CARD_CONSTANTS.PRTD_APPLICATION_FEE_CAD, 50.0);
});

test('PR Card Renewal Navigator — Standard renewal compliant with 730+ physical days inside Canada', () => {
  const result = evaluatePrCardRenewalUrgent({
    daysInCanadaLast5Years: 850,
    isCurrentlyInsideCanada: true,
    hasUrgentTravelNeed: false
  });

  assert.equal(result.residencyAssessment.residencyObligationMet, true);
  assert.equal(result.residencyAssessment.daysShortfall, 0);
  assert.equal(result.residencyAssessment.totalCreditedDays, 850);
  assert.equal(result.applicationPathway.recommendedForm, 'IMM 5444');
  assert.equal(result.urgentProcessing.qualifiesForUrgentProcessing, false);
  assert.ok(result.statutoryProtections.some(p => p.includes('IRPA s. 31(1)')));
});

test('PR Card Renewal Navigator — Credits days abroad accompanying Canadian citizen spouse (IRPA s. 28(2)(a))', () => {
  const result = evaluatePrCardRenewalUrgent({
    daysInCanadaLast5Years: 400,
    daysAbroadAccompanyingCitizenSpouse: 350,
    isCurrentlyInsideCanada: true
  });

  assert.equal(result.residencyAssessment.totalCreditedDays, 750);
  assert.equal(result.residencyAssessment.residencyObligationMet, true);
  assert.equal(result.residencyAssessment.daysShortfall, 0);
});

test('PR Card Renewal Navigator — Urgent processing approved for documented employment travel within 90 days', () => {
  const result = evaluatePrCardRenewalUrgent({
    daysInCanadaLast5Years: 750,
    hasUrgentTravelNeed: true,
    travelDepartureDaysFromNow: 21,
    urgentReasonCategory: 'urgent_employment',
    hasProofOfTravel: true,
    hasSupportingUrgentProof: true,
    isCurrentlyInsideCanada: true
  });

  assert.equal(result.urgentProcessing.qualifiesForUrgentProcessing, true);
  assert.equal(result.applicationPathway.estimatedProcessing, 'Expedited (approx 1–3 weeks)');
  assert.equal(result.urgentProcessing.urgentDisqualifiers.length, 0);
  assert.ok(result.urgentProcessing.urgentQualifiers.length >= 3);
});

test('PR Card Renewal Navigator — Outside Canada directs to PRTD Form IMM 5524 and highlights private vehicle land border option', () => {
  const result = evaluatePrCardRenewalUrgent({
    daysInCanadaLast5Years: 740,
    isCurrentlyInsideCanada: false,
    hasUrgentTravelNeed: false
  });

  assert.equal(result.applicationPathway.recommendedForm, 'IMM 5524 (PRTD)');
  assert.ok(result.statutoryProtections.some(p => p.includes('LAND BORDER EXCEPTION')));
  assert.ok(result.riskWarnings.some(w => w.includes('COMMERCIAL BOARDING BAR')));
});

test('PR Card Renewal Navigator — Flags residency breach shortfall and Section 44 risk', () => {
  const result = evaluatePrCardRenewalUrgent({
    daysInCanadaLast5Years: 300,
    isCurrentlyInsideCanada: true
  });

  assert.equal(result.residencyAssessment.residencyObligationMet, false);
  assert.equal(result.residencyAssessment.daysShortfall, 430);
  assert.ok(result.riskWarnings.some(w => w.includes('RESIDENCY BREACH RISK')));
});
