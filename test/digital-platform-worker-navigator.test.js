import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLATFORM_WORKER_CONSTANTS,
  evaluatePlatformWorkerRights
} from '../src/digital-platform-worker-navigator.js';

test('Digital Platform Worker Navigator — Constants reflect Ontario DPWRA & BC Bill 48 standards', () => {
  assert.equal(PLATFORM_WORKER_CONSTANTS.ON_MIN_ENGAGED_HOURLY_WAGE_CAD, 17.20);
  assert.equal(PLATFORM_WORKER_CONSTANTS.BC_MIN_ENGAGED_HOURLY_WAGE_CAD, 20.88);
  assert.equal(PLATFORM_WORKER_CONSTANTS.DEPLATFORMING_NOTICE_WINDOW_DAYS, 14);
});

test('Digital Platform Worker Navigator — Detects Ontario engaged time sub-minimum wage shortfall', () => {
  // 40 engaged hours at $17.20 = $688 minimum; paid $550 -> shortfall $138
  const result = evaluatePlatformWorkerRights({
    province: 'ON',
    engagedHoursInPeriod: 40,
    actualBasePayReceivedCad: 550.0,
    tipsReceivedCad: 100.0,
    tipsWithheldOrSubsidized: false
  });

  assert.equal(result.wageAudit.hasWageTheft, true);
  assert.equal(result.wageAudit.minimumEngagedEarningsCad, 688.0);
  assert.equal(result.wageAudit.wageShortfallCad, 138.0);
  assert.equal(result.restitutionSummary.totalOwedCad, 138.0);
  assert.match(result.summaryTitle, /Statutory Violations Identified/);
});

test('Digital Platform Worker Navigator — Applies British Columbia $20.88/hr engaged rate under Bill 48', () => {
  // 30 engaged hours at $20.88 = $626.40 minimum; paid $500 -> shortfall $126.40
  const result = evaluatePlatformWorkerRights({
    province: 'BC',
    engagedHoursInPeriod: 30,
    actualBasePayReceivedCad: 500.0
  });

  assert.equal(result.wageAudit.statutoryEngagedHourlyRateCad, 20.88);
  assert.equal(result.wageAudit.minimumEngagedEarningsCad, 626.40);
  assert.equal(result.wageAudit.wageShortfallCad, 126.40);
  assert.ok(result.statutoryProtections.some(p => p.includes('Bill 48')));
});

test('Digital Platform Worker Navigator — Identifies illegal tip diversion and unauthorized deductions', () => {
  const result = evaluatePlatformWorkerRights({
    province: 'ON',
    engagedHoursInPeriod: 20,
    actualBasePayReceivedCad: 344.0, // 20 * 17.20 = exactly compliant base
    tipsReceivedCad: 150.0,
    tipsWithheldOrSubsidized: true, // Platform kept tips
    unauthorizedDeductionsCad: 35.0
  });

  assert.equal(result.wageAudit.hasWageTheft, false);
  assert.equal(result.restitutionSummary.withheldTipsCad, 150.0);
  assert.equal(result.restitutionSummary.unauthorizedDeductionsCad, 35.0);
  assert.equal(result.restitutionSummary.totalOwedCad, 185.0);
  assert.ok(result.statutoryProtections.some(p => p.includes('DPWRA s. 8')));
});

test('Digital Platform Worker Navigator — Flags unlawful account de-platforming without 14-day notice', () => {
  const result = evaluatePlatformWorkerRights({
    province: 'ON',
    hasDeplatformingAction: true,
    noticeDaysGivenBeforeDeplatform: 0,
    providedWrittenReason: false
  });

  assert.equal(result.deplatformingAudit.isUnlawfulDeplatforming, true);
  assert.ok(result.violations.some(v => v.includes('Unlawful account deactivation')));
  assert.ok(result.actionPlan.some(a => a.includes('DPWRA s. 9')));
});

test('Digital Platform Worker Navigator — Precludes foreign arbitration clauses under Heller v. Uber', () => {
  const result = evaluatePlatformWorkerRights({
    province: 'ON',
    foreignArbitrationClauseInvoked: true
  });

  assert.equal(result.foreignArbitrationPrecluded, true);
  assert.ok(result.statutoryProtections.some(p => p.includes('Heller v. Uber Technologies Inc.')));
  assert.ok(result.riskWarnings.some(w => w.includes('UNCONSCIONABLE ARBITRATION CLAUSE VOID')));
});
