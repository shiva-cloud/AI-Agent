// test/ontario-employment-standards-reprisal-navigator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEsaReprisal,
  ESA_REPRISAL_RULES
} from '../src/ontario-employment-standards-reprisal-navigator.js';

test('Ontario ESA Reprisal Navigator — Constants reflect ESA provisions', () => {
  assert.equal(ESA_REPRISAL_RULES.REPRISAL_SECTION, 's. 74(1)');
  assert.equal(ESA_REPRISAL_RULES.REVERSE_ONUS_SECTION, 's. 74(2)');
  assert.equal(ESA_REPRISAL_RULES.LIMITATION_PERIOD_MONTHS, 24);
  assert.ok(ESA_REPRISAL_RULES.PROTECTED_ACTIVITIES.includes('asked_about_rights'));
  assert.ok(ESA_REPRISAL_RULES.PROHIBITED_ADVERSE_ACTIONS.includes('termination'));
});

test('Ontario ESA Reprisal Navigator — Flags rapid termination after asking about overtime', () => {
  const result = evaluateEsaReprisal({
    protectedActivity: 'requested_overtime_pay',
    adverseAction: 'termination',
    daysBetweenActivityAndAction: 4,
    employerProvidedWrittenReason: false,
    allegedEmployerReason: 'none',
    hasDocumentaryEvidence: true,
    monthlyLostWageCad: 4500,
    monthsElapsedSinceAction: 2,
    employeeName: 'Sarah Jenkins'
  });

  assert.equal(result.isReverseBurdenTriggered, true);
  assert.equal(result.reprisalRiskScore, 'CRITICAL_HIGH_MERIT');
  assert.equal(result.temporalProximity.weight, 'VERY_STRONG');
  assert.equal(result.isWithinLimitationPeriod, true);
  assert.ok(result.legalProtections.some(p => p.basis.includes('s. 74(2)')));
  
  const backpay = result.remediesAvailable.find(r => r.remedy.includes('Back-Pay'));
  assert.ok(backpay);
  assert.equal(backpay.estimatedCad, 9000); // 4500 * 2
});

test('Ontario ESA Reprisal Navigator — Handles performance pretext with reverse onus', () => {
  const result = evaluateEsaReprisal({
    protectedActivity: 'requested_sick_leave',
    adverseAction: 'hours_reduction',
    daysBetweenActivityAndAction: 20,
    employerProvidedWrittenReason: true,
    allegedEmployerReason: 'performance',
    hasDocumentaryEvidence: true,
    monthlyLostWageCad: 2000,
    monthsElapsedSinceAction: 3
  });

  assert.equal(result.isReverseBurdenTriggered, true);
  assert.equal(result.reprisalRiskScore, 'HIGH_MERIT');
  assert.ok(result.findings.some(f => f.type === 'DEFENSE_ANALYSIS' && f.issue.includes('Pretext')));
});

test('Ontario ESA Reprisal Navigator — Flags statutory limitation bar beyond 24 months', () => {
  const result = evaluateEsaReprisal({
    protectedActivity: 'asked_about_rights',
    adverseAction: 'termination',
    daysBetweenActivityAndAction: 5,
    monthsElapsedSinceAction: 26 // Over 24 months
  });

  assert.equal(result.isWithinLimitationPeriod, false);
  assert.equal(result.reprisalRiskScore, 'BARRED_BY_LIMITATION');
  assert.ok(result.findings.some(f => f.type === 'STATUTORY_BAR'));
});

test('Ontario ESA Reprisal Navigator — Notes distant temporal gap requires more corroboration', () => {
  const result = evaluateEsaReprisal({
    protectedActivity: 'requested_vacation_pay',
    adverseAction: 'wage_reduction',
    daysBetweenActivityAndAction: 120, // Distant gap
    monthsElapsedSinceAction: 5
  });

  assert.equal(result.temporalProximity.weight, 'DISTANT');
  assert.equal(result.reprisalRiskScore, 'MODERATE_MERIT');
  assert.ok(result.findings.some(f => f.issue === 'Extended Proximity Gap'));
});
