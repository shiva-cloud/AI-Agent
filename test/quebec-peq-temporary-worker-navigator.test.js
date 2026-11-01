import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PEQ_WORKER_RULES,
  auditQuebecFrenchProficiency,
  evaluateQuebecPeqTemporaryWorker
} from '../src/quebec-peq-temporary-worker-navigator.js';

test('PEQ Worker Rules Constants & French evaluation', () => {
  assert.equal(PEQ_WORKER_RULES.MIN_WORK_MONTHS_REQUIRED, 24);
  assert.equal(PEQ_WORKER_RULES.WORK_LOOKBACK_WINDOW_MONTHS, 36);
  assert.equal(PEQ_WORKER_RULES.MIN_WEEKLY_HOURS_FULL_TIME, 30);
  assert.equal(PEQ_WORKER_RULES.MIN_FRENCH_ORAL_LEVEL_PRINCIPAL, 7);
  assert.equal(PEQ_WORKER_RULES.MIN_FRENCH_ORAL_LEVEL_SPOUSE, 4);

  // Principal: Niveau 6 fails, Niveau 7 passes
  assert.equal(auditQuebecFrenchProficiency(6, false).isCompliant, false);
  assert.equal(auditQuebecFrenchProficiency(7, false).isCompliant, true);
  assert.equal(auditQuebecFrenchProficiency(7, false).cefrEquivalent, 'B2');

  // Spouse: Niveau 3 fails, Niveau 4 passes
  assert.equal(auditQuebecFrenchProficiency(3, true).isCompliant, false);
  assert.equal(auditQuebecFrenchProficiency(4, true).isCompliant, true);
});

test('evaluateQuebecPeqTemporaryWorker confirms eligible Quebec worker candidate', () => {
  const result = evaluateQuebecPeqTemporaryWorker({
    monthsWorkedInQuebec: 25,
    weeklyHoursWorked: 35,
    jobTeerLevel: 1,
    isCurrentlyEmployedInQuebec: true,
    hasValidWorkPermitStatus: true,
    principalOralFrenchLevel: 8,
    hasCompletedValuesAttestation: true,
    hasAccompanyingSpouse: false,
    applicantName: 'Jean-Luc Dubois'
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityStatus, 'ELIGIBLE_FOR_PEQ_CSQ');
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Arrima')));
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('A75 Exemption')));
});

test('evaluateQuebecPeqTemporaryWorker catches French shortfall and insufficient months', () => {
  const result = evaluateQuebecPeqTemporaryWorker({
    monthsWorkedInQuebec: 18, // Inadequate (< 24)
    weeklyHoursWorked: 35,
    jobTeerLevel: 2,
    isCurrentlyEmployedInQuebec: true,
    hasValidWorkPermitStatus: true,
    principalOralFrenchLevel: 5, // Inadequate (< 7)
    hasCompletedValuesAttestation: true,
    hasAccompanyingSpouse: false
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityStatus, 'INELIGIBLE_FOR_PEQ');
  assert.ok(result.deficiencies.some(d => d.includes('Inadequate eligible Quebec work experience')));
  assert.ok(result.deficiencies.some(d => d.includes('French oral proficiency shortfall')));
});

test('evaluateQuebecPeqTemporaryWorker rejects TEER 4 and seasonal agricultural workers', () => {
  const result = evaluateQuebecPeqTemporaryWorker({
    monthsWorkedInQuebec: 26,
    weeklyHoursWorked: 40,
    jobTeerLevel: 4, // Ineligible TEER
    isCurrentlyEmployedInQuebec: true,
    hasValidWorkPermitStatus: true,
    principalOralFrenchLevel: 7,
    hasCompletedValuesAttestation: true,
    isSeasonalAgriculturalWorker: true // Barred
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('TEER level 4 is ineligible')));
  assert.ok(result.deficiencies.some(d => d.includes('Seasonal agricultural workers')));
});

test('evaluateQuebecPeqTemporaryWorker validates accompanying spouse French requirement', () => {
  const result = evaluateQuebecPeqTemporaryWorker({
    monthsWorkedInQuebec: 24,
    weeklyHoursWorked: 37.5,
    jobTeerLevel: 0,
    isCurrentlyEmployedInQuebec: true,
    hasValidWorkPermitStatus: true,
    principalOralFrenchLevel: 9,
    hasCompletedValuesAttestation: true,
    hasAccompanyingSpouse: true,
    spouseOralFrenchLevel: 3 // Shortfall (< 4)
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.deficiencies.some(d => d.includes('Accompanying spouse French shortfall')));
});
