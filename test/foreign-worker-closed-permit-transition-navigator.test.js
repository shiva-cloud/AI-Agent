import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TFW_TRANSITION_RULES,
  evaluateForeignWorkerPermitTransition
} from '../src/foreign-worker-closed-permit-transition-navigator.js';

test('TFW Transition Rules Constants', () => {
  assert.equal(TFW_TRANSITION_RULES.RESTORATION_PERIOD_DAYS, 90);
  assert.equal(TFW_TRANSITION_RULES.INTERIM_AUTHORIZATION_TARGET_DAYS, 30);
  assert.equal(TFW_TRANSITION_RULES.MAINTAINED_STATUS_SECTION, 'IRPR s. 186(u)');
  assert.equal(TFW_TRANSITION_RULES.JURISDICTION, 'CA');
});

test('evaluateForeignWorkerPermitTransition confirms compliant transition under maintained status', () => {
  const result = evaluateForeignWorkerPermitTransition({
    currentWorkPermitExpiryDate: '2026-11-30',
    currentDate: '2026-10-31',
    hasSubmittedNewWorkPermitApplication: true,
    applicationSubmissionDate: '2026-10-15',
    hasPositiveLmiaOrExemption: true,
    hasRequestedPublicPolicyInterimAuthorization: true,
    hasReceivedIrccInterimAuthorizationEmail: false,
    hasStartedWorkingForNewEmployer: false, // Refrained properly
    workerName: 'Kenji Sato'
  });

  assert.equal(result.legalVerdict, 'TRANSITION_IN_PROGRESS_COMPLIANT');
  assert.equal(result.statusCategory, 'MAINTAINED_STATUS_IRPR_186_U');
  assert.equal(result.canLegallyWorkForNewEmployer, false);
  assert.equal(result.complianceViolations.length, 0);
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Monitor IRCC Portal')));
});

test('evaluateForeignWorkerPermitTransition authorizes working for new employer upon interim approval', () => {
  const result = evaluateForeignWorkerPermitTransition({
    currentWorkPermitExpiryDate: '2026-11-30',
    currentDate: '2026-10-31',
    hasSubmittedNewWorkPermitApplication: true,
    hasPositiveLmiaOrExemption: true,
    hasReceivedIrccInterimAuthorizationEmail: true, // Approved!
    hasStartedWorkingForNewEmployer: true
  });

  assert.equal(result.legalVerdict, 'FULLY_AUTHORIZED_FOR_NEW_EMPLOYER');
  assert.equal(result.canLegallyWorkForNewEmployer, true);
  assert.equal(result.complianceViolations.length, 0);
});

test('evaluateForeignWorkerPermitTransition flags unauthorized work for premature new employer start', () => {
  const result = evaluateForeignWorkerPermitTransition({
    currentWorkPermitExpiryDate: '2026-11-30',
    currentDate: '2026-10-31',
    hasSubmittedNewWorkPermitApplication: true,
    hasPositiveLmiaOrExemption: true,
    hasReceivedIrccInterimAuthorizationEmail: false,
    hasStartedWorkingForNewEmployer: true // Premature start!
  });

  assert.equal(result.legalVerdict, 'UNAUTHORIZED_WORK_VIOLATION_ACTION_REQUIRED');
  assert.ok(result.complianceViolations.includes('UNAUTHORIZED_WORK_UNDER_IRPA_30'));
  assert.ok(result.deficiencies.some(d => d.includes('Critical Violation')));
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Immediately Cease Working')));
});

test('evaluateForeignWorkerPermitTransition handles restoration window and expired restoration', () => {
  // Scenario A: Within 90-day restoration
  const resWithin = evaluateForeignWorkerPermitTransition({
    currentWorkPermitExpiryDate: '2026-09-30',
    currentDate: '2026-10-31',
    statusAlreadyExpired: true,
    daysElapsedSinceExpiry: 31
  });
  assert.equal(resWithin.legalVerdict, 'RESTORATION_REQUIRED_WORK_PROHIBITED');
  assert.equal(resWithin.isWithinRestorationWindow, true);
  assert.equal(resWithin.restorationDaysRemaining, 59);

  // Scenario B: Past 90 days
  const resPast = evaluateForeignWorkerPermitTransition({
    currentWorkPermitExpiryDate: '2026-06-30',
    currentDate: '2026-10-31',
    statusAlreadyExpired: true,
    daysElapsedSinceExpiry: 120
  });
  assert.equal(resPast.legalVerdict, 'OUT_OF_STATUS_PAST_RESTORATION');
  assert.equal(resPast.isWithinRestorationWindow, false);
  assert.ok(resPast.complianceViolations.includes('EXPIRED_RESTORATION_PERIOD_UNAUTHORIZED_PRESENCE'));
});
