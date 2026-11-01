import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_STRATA_EV_RULES,
  evaluateBcStrataEvCharging
} from '../src/british-columbia-strata-ev-charging-navigator.js';

test('BC Strata EV Rules Constants', () => {
  assert.equal(BC_STRATA_EV_RULES.STATUTORY_DECISION_DEADLINE_MONTHS, 3);
  assert.equal(BC_STRATA_EV_RULES.METRO_VANCOUVER_EPR_DEADLINE, '2026-12-31');
  assert.equal(BC_STRATA_EV_RULES.OTHER_REGIONS_EPR_DEADLINE, '2028-12-31');
  assert.equal(BC_STRATA_EV_RULES.MIN_LOTS_FOR_MANDATORY_EPR, 5);
  assert.equal(BC_STRATA_EV_RULES.PROVINCE, 'BC');
});

test('evaluateBcStrataEvCharging confirms pending request within 3-month statutory window', () => {
  const result = evaluateBcStrataEvCharging({
    requestDate: '2026-10-01',
    currentDate: '2026-10-31',
    hasStrataCouncilResponded: false,
    hasOwnerAgreedToPayAllCostsAndInsurance: true
  });

  assert.equal(result.legalVerdict, 'REQUEST_PENDING_WITHIN_DEADLINE');
  assert.equal(result.isPastThreeMonthDeadline, false);
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.compliancePoints.some(c => c.includes('3-month review period')));
});

test('evaluateBcStrataEvCharging detects statutory deadline breach after 100 days of council silence', () => {
  const result = evaluateBcStrataEvCharging({
    requestDate: '2026-06-01',
    currentDate: '2026-10-31', // ~152 days elapsed
    hasStrataCouncilResponded: false,
    hasOwnerAgreedToPayAllCostsAndInsurance: true
  });

  assert.equal(result.legalVerdict, 'STATUTORY_DEADLINE_BREACHED_CRT_ACTIONABLE');
  assert.equal(result.isPastThreeMonthDeadline, true);
  assert.ok(result.deficiencies.some(d => d.includes('Statutory Deadline Breached')));
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Civil Resolution Tribunal (CRT)')));
});

test('evaluateBcStrataEvCharging flags unreasonable refusal based on aesthetics or unwillingness', () => {
  const result = evaluateBcStrataEvCharging({
    requestDate: '2026-08-01',
    currentDate: '2026-09-15',
    hasStrataCouncilResponded: true,
    councilDecision: 'refused',
    refusalReasonCategory: 'aesthetic_dislike', // Unlawful refusal
    hasOwnerAgreedToPayAllCostsAndInsurance: true
  });

  assert.equal(result.legalVerdict, 'UNREASONABLE_REFUSAL_CRT_ACTIONABLE');
  assert.equal(result.isUnreasonableRefusal, true);
  assert.ok(result.deficiencies.some(d => d.includes('SPA s. 90.2(2)')));
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('CRT Dispute')));
});

test('evaluateBcStrataEvCharging handles approved request and EPR timeline', () => {
  const result = evaluateBcStrataEvCharging({
    requestDate: '2026-08-01',
    currentDate: '2026-09-01',
    hasStrataCouncilResponded: true,
    councilDecision: 'approved',
    hasOwnerAgreedToPayAllCostsAndInsurance: true,
    strataLotCount: 60,
    strataRegion: 'metro_vancouver',
    hasElectricalPlanningReportCompleted: false
  });

  assert.equal(result.legalVerdict, 'APPROVED_READY_FOR_ALTERATION_AGREEMENT');
  assert.equal(result.eprRequirements.statutoryEprDeadline, '2026-12-31');
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Section 90.3 EV Infrastructure Agreement')));
});
