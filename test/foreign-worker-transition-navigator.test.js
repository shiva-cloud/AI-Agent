import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateForeignWorkerTransition, TFW_TRANSITION_CONSTANTS } from '../src/foreign-worker-transition-navigator.js';

test('TFW Transition Navigator — Constants reflect ESDC and IRCC 2024–2026 rules', () => {
  assert.equal(TFW_TRANSITION_CONSTANTS.LOW_WAGE_CMA_UNEMPLOYMENT_FREEZE_RATE, 6.0);
  assert.equal(TFW_TRANSITION_CONSTANTS.STANDARD_LOW_WAGE_EMPLOYER_CAP_PERCENT, 10);
  assert.equal(TFW_TRANSITION_CONSTANTS.CONSTRUCTION_HEALTHCARE_EMPLOYER_CAP_PERCENT, 20);
  assert.equal(TFW_TRANSITION_CONSTANTS.MAX_LOW_WAGE_WORK_PERMIT_DURATION_MONTHS, 12);
  assert.equal(TFW_TRANSITION_CONSTANTS.HIGH_WAGE_WORK_PERMIT_DURATION_MONTHS, 36);
});

test('TFW Transition Navigator — Low-wage worker in CMA with >= 6.0% unemployment triggers ESDC freeze', () => {
  const result = evaluateForeignWorkerTransition({
    wagePerHour: 18.50,
    provincialMedianWage: 28.39,
    employerLocationCma: 'Calgary',
    cmaUnemploymentRate: 7.2,
    sector: 'hospitality'
  });

  assert.equal(result.streamClassification.isHighWage, false);
  assert.equal(result.lmiaAudit.isSubjectToCmaFreeze, true);
  assert.equal(result.lmiaAudit.applicableEmployerCapPercent, 10);
  assert.equal(result.lmiaAudit.maxWorkPermitDurationMonths, 12);
  assert.ok(result.lmiaAudit.risksAndBars.some(r => r.includes('ESDC REFUSAL TO PROCESS')));
});

test('TFW Transition Navigator — Construction sector retains 20% cap and freeze exemption', () => {
  const result = evaluateForeignWorkerTransition({
    wagePerHour: 22.00,
    provincialMedianWage: 28.39,
    employerLocationCma: 'Toronto',
    cmaUnemploymentRate: 6.9,
    sector: 'construction'
  });

  assert.equal(result.lmiaAudit.isSectorExemptFromFreeze, true);
  assert.equal(result.lmiaAudit.isSubjectToCmaFreeze, false);
  assert.equal(result.lmiaAudit.applicableEmployerCapPercent, 20);
});

test('TFW Transition Navigator — High-wage worker exempt from CMA freeze with 3-year permit potential', () => {
  const result = evaluateForeignWorkerTransition({
    wagePerHour: 38.00,
    provincialMedianWage: 28.39,
    employerLocationCma: 'Vancouver',
    cmaUnemploymentRate: 6.4
  });

  assert.equal(result.streamClassification.isHighWage, true);
  assert.equal(result.lmiaAudit.isSubjectToCmaFreeze, false);
  assert.equal(result.lmiaAudit.maxWorkPermitDurationMonths, 36);
  assert.ok(result.statutoryProtections.some(p => p.includes('High-Wage Stream')));
});

test('TFW Transition Navigator — French proficiency unlocks LMIA-exempt Francophone Mobility C16', () => {
  const result = evaluateForeignWorkerTransition({
    wagePerHour: 20.00,
    hasFrenchProficiencyNclc5: true,
    hasProvincialNominationStreamFit: true
  });

  const c16Pathway = result.viablePathways.find(p => p.pathwayName.includes('Francophone Mobility'));
  assert.ok(c16Pathway);
  assert.equal(c16Pathway.feasibility, 'HIGH');
  assert.equal(c16Pathway.statutoryReference, 'IRPR s. 205(a)');
});

test('TFW Transition Navigator — Flags critical runway urgency under 30 days', () => {
  const result = evaluateForeignWorkerTransition({
    currentWorkPermitExpiryDays: 20
  });

  assert.equal(result.currentPermitRunway.status, 'CRITICAL_URGENCY');
  assert.ok(result.actionPlan.some(a => a.includes('URGENT: Work permit expires in under 30 days')));
});
