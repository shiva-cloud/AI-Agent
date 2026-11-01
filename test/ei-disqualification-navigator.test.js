import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EI_CONSTANTS,
  STATUTORY_JUST_CAUSE_CIRCUMSTANCES,
  evaluateEiDisqualificationAndAllocation
} from '../src/ei-disqualification-navigator.js';

test('EI Disqualification Navigator — Constants reflect Employment Insurance Act benchmarks', () => {
  assert.equal(EI_CONSTANTS.BENEFIT_RATE_PERCENT, 55.0);
  assert.equal(EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD, 721.0);
  assert.equal(EI_CONSTANTS.WAITING_PERIOD_WEEKS, 1);
  assert.ok(STATUTORY_JUST_CAUSE_CIRCUMSTANCES.harassment);
  assert.ok(STATUTORY_JUST_CAUSE_CIRCUMSTANCES.spousal_relocation);
  assert.ok(STATUTORY_JUST_CAUSE_CIRCUMSTANCES.wage_reduction);
});

test('EI Disqualification Navigator — Establishes just cause for voluntary quit due to harassment', () => {
  const result = evaluateEiDisqualificationAndAllocation({
    separationType: 'voluntary_quit',
    justCauseReason: 'harassment',
    triedReasonableAlternatives: true,
    normalWeeklyGrossEarningsCad: 1000,
    insurableHoursAccumulated: 800
  });

  assert.equal(result.regularBenefits.isDisqualifiedFromRegularBenefits, false);
  assert.equal(result.justCauseAudit.justCauseEstablished, true);
  assert.match(result.justCauseAudit.justCauseDetails.statuteRef, /EIA s\. 29\(c\)\(i\)/);
  assert.equal(result.regularBenefits.estimatedWeeklyBenefitCad, 550.0);
});

test('EI Disqualification Navigator — Flags voluntary quit without just cause as disqualified', () => {
  const result = evaluateEiDisqualificationAndAllocation({
    separationType: 'voluntary_quit',
    justCauseReason: null,
    triedReasonableAlternatives: false,
    insurableHoursAccumulated: 800
  });

  assert.equal(result.regularBenefits.isDisqualifiedFromRegularBenefits, true);
  assert.match(result.regularBenefits.disqualificationReason, /Voluntary leaving without just cause/);
  assert.ok(result.riskWarnings.some(w => w.includes('INDEFINITE DISQUALIFICATION')));
});

test('EI Disqualification Navigator — Vindicates performance dismissal as incompetence rather than statutory misconduct (Brissette)', () => {
  const result = evaluateEiDisqualificationAndAllocation({
    separationType: 'employer_dismissal',
    employerAllegedMisconduct: true,
    allegedMisconductType: 'incompetence_performance',
    insurableHoursAccumulated: 750
  });

  assert.equal(result.regularBenefits.isDisqualifiedFromRegularBenefits, false);
  assert.equal(result.misconductAudit.misconductAuditResult, 'incompetence_not_misconduct');
  assert.ok(result.defenseArguments.some(d => d.includes('Brissette')));
});

test('EI Disqualification Navigator — Correctly computes separation monies allocation delay', () => {
  const result = evaluateEiDisqualificationAndAllocation({
    separationType: 'layoff_shortage_of_work',
    normalWeeklyGrossEarningsCad: 1000,
    severancePayReceivedCad: 5000,
    vacationPayPaidOutCad: 2000,
    payInLieuOfNoticeCad: 1000
  });

  // Total separation monies = 5000 + 2000 + 1000 = 8000
  // Normal weekly earnings = 1000
  // Allocation delay = 8 weeks
  assert.equal(result.separationMoniesAllocation.totalSeparationMoniesCad, 8000);
  assert.equal(result.separationMoniesAllocation.estimatedAllocationDelayWeeks, 8);
  assert.match(result.separationMoniesAllocation.delayExplanation, /8-week allocation delay/);
});

test('EI Disqualification Navigator — Confirms special benefits exemption under EIA s. 33 despite disqualification', () => {
  const result = evaluateEiDisqualificationAndAllocation({
    separationType: 'voluntary_quit',
    justCauseReason: null,
    triedReasonableAlternatives: false,
    isClaimingSpecialBenefits: true,
    insurableHoursAccumulated: 650
  });

  assert.equal(result.regularBenefits.isDisqualifiedFromRegularBenefits, true);
  assert.equal(result.specialBenefitsOverride.specialBenefitsAvailable, true);
  assert.equal(result.specialBenefitsOverride.statuteBasis, 'EIA s. 33');
});
