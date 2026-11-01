import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SAFETY_COMPENSATION_CONSTANTS,
  HAZARD_TAXONOMY,
  evaluateWorkplaceSafetyAndRefusal,
  generateWorkRefusalNotice
} from '../src/workplace-safety-navigator.js';

test('Workplace Safety Navigator — Statutory constants match Ontario and BC standards', () => {
  assert.equal(SAFETY_COMPENSATION_CONSTANTS.ONTARIO_WSIB_LOE_PERCENT_NET, 85.0);
  assert.equal(SAFETY_COMPENSATION_CONSTANTS.BC_WORKSAFE_LOE_PERCENT_NET, 90.0);
  assert.equal(SAFETY_COMPENSATION_CONSTANTS.WSIB_CLAIM_LIMITATION_MONTHS, 6);
  assert.equal(SAFETY_COMPENSATION_CONSTANTS.EMPLOYER_REPORT_DEADLINE_DAYS, 3);

  assert.ok(HAZARD_TAXONOMY.physical_fall_collapse);
  assert.ok(HAZARD_TAXONOMY.workplace_violence);
});

test('Workplace Safety Navigator — Audits valid Stage 1 work refusal under OHSA s. 43', () => {
  const result = evaluateWorkplaceSafetyAndRefusal({
    province: 'ON',
    hasUnsafeWorkConditions: true,
    hazardType: 'unguarded_machinery',
    refusalStage: 'stage_1_internal',
    workerName: 'Dave Miller',
    employerName: 'Stamping Corp.'
  });

  assert.equal(result.safetyRefusalAudit.refusalLegitimate, true);
  assert.equal(result.safetyRefusalAudit.refusalStage, 'stage_1_internal');
  assert.ok(result.legalProtections.some(p => p.includes('STATUTORY RIGHT TO REFUSE')));
  assert.ok(result.actionChecklist.some(a => a.step.includes('Request JHSC Worker Representative')));
});

test('Workplace Safety Navigator — Detects unlawful employer reprisal under OHSA s. 50 with reverse burden of proof', () => {
  const result = evaluateWorkplaceSafetyAndRefusal({
    hasUnsafeWorkConditions: true,
    employerDisciplinedOrThreatened: true,
    immigrationStatusThreatened: true
  });

  assert.equal(result.reprisalAudit.reprisalViolationDetected, true);
  assert.equal(result.reprisalAudit.reverseBurdenApplies, true);
  assert.ok(result.rightsViolations.some(r => r.includes('UNLAWFUL REPRISAL')));
  assert.ok(result.rightsViolations.some(r => r.includes('CRIMINAL COERCION')));
  assert.ok(result.legalProtections.some(p => p.includes('WSIB POLICY 12-04-10')));
  assert.ok(result.actionChecklist.some(a => a.step.includes('Form A-53 Unlawful Reprisal Complaint')));
});

test('Workplace Safety Navigator — Calculates WSIB 85% Loss of Earnings (LOE) and flags late filing beyond 6 months', () => {
  // Within limitation
  const recent = evaluateWorkplaceSafetyAndRefusal({
    isWorkplaceInjury: true,
    injuryDate: '2026-09-01',
    netAverageMonthlyEarningsCad: 4000,
    assessmentDate: '2026-10-31',
    employerFiledInjuryReport: false
  });

  assert.equal(recent.compensationAudit.isWorkplaceInjury, true);
  assert.equal(recent.compensationAudit.estimatedMonthlyLoeCad, 3400); // 85% of 4000
  assert.equal(recent.compensationAudit.claimWithinLimitation, true);
  assert.ok(recent.rightsViolations.some(r => r.includes('failed to submit Form 7')));

  // Beyond 6 months
  const stale = evaluateWorkplaceSafetyAndRefusal({
    isWorkplaceInjury: true,
    injuryDate: '2025-10-01',
    assessmentDate: '2026-10-31' // 12+ months
  });
  assert.equal(stale.compensationAudit.claimWithinLimitation, false);
  assert.ok(stale.rightsViolations.some(r => r.includes('STATUTORY DEADLINE WARNING')));
});

test('Workplace Safety Navigator — Applies BC 90% net LOE rate and generates formal refusal notice', () => {
  const bcResult = evaluateWorkplaceSafetyAndRefusal({
    province: 'BC',
    isWorkplaceInjury: true,
    netAverageMonthlyEarningsCad: 5000
  });
  assert.equal(bcResult.compensationAudit.loePercentageNet, 90.0);
  assert.equal(bcResult.compensationAudit.estimatedMonthlyLoeCad, 4500);

  const notice = generateWorkRefusalNotice({
    workerName: 'Carlos Gomez',
    employerName: 'Apex Roofing Ltd.',
    hazardDescription: 'Missing fall arrest harness and loose scaffolding',
    refusalStage: 'stage_1_internal'
  });

  assert.ok(notice.includes('FORMAL STATUTORY NOTICE OF WORK REFUSAL'));
  assert.ok(notice.includes('OHSA s. 43'));
  assert.ok(notice.includes('Apex Roofing Ltd.'));
  assert.ok(notice.includes('Section 50 strictly prohibits any disciplinary action'));
});
