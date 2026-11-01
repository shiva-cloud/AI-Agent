// test/telecom-contract-defense.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessTelecomDispute,
  TELECOM_CONSTANTS
} from '../src/telecom-contract-defense.js';

test('CRTC Wireless Code & Telecom Consumer Contract Defense Engine', async (t) => {
  await t.test('statutory constants match CRTC Wireless Code standards', () => {
    assert.ok(TELECOM_CONSTANTS.STATUTES.WIRELESS_CODE.includes('CRTC 2017-200'));
    assert.equal(TELECOM_CONSTANTS.STATUTORY_CAPS.DATA_OVERAGE_CAD, 50.00);
    assert.equal(TELECOM_CONSTANTS.STATUTORY_CAPS.ROAMING_DATA_OVERAGE_CAD, 100.00);
    assert.equal(TELECOM_CONSTANTS.STATUTORY_CAPS.DEVICE_UNLOCK_FEE_CAD, 0.00);
    assert.equal(TELECOM_CONSTANTS.STATUTORY_CAPS.STANDARD_TRIAL_PERIOD_DAYS, 15);
    assert.equal(TELECOM_CONSTANTS.STATUTORY_CAPS.DISABILITY_TRIAL_PERIOD_DAYS, 30);
    assert.equal(TELECOM_CONSTANTS.STATUTORY_CAPS.MAX_CONTRACT_TERM_MONTHS, 24);
  });

  await t.test('evaluates valid 15-day trial period cancellation without penalty', () => {
    const result = assessTelecomDispute({
      providerName: 'Bell',
      daysSinceContractStart: 8,
      hasDisability: false,
      deviceSubsidyTotalCad: 960,
      deviceInOriginalCondition: true,
      refusedTrialCancellation: true
    });

    assert.equal(result.isWithinTrialPeriod, true);
    assert.equal(result.allowedTrialDays, 15);
    assert.equal(result.trialCancellationStatus, 'ABSOLUTE_RIGHT_TO_CANCEL_WITHOUT_PENALTY');
    assert.equal(result.hasStatutoryViolations, true);
    assert.ok(result.statutoryViolations.some(v => v.violationCode === 'TRIAL_PERIOD_CANCELLATION_DENIED'));
    assert.ok(result.formalDisputeNotice.includes('trial period without any early cancellation fee'));
  });

  await t.test('detects breach of $50 data overage cap and flags refund obligation', () => {
    const result = assessTelecomDispute({
      providerName: 'Rogers',
      daysSinceContractStart: 45,
      dataOverageChargedCad: 140.00, // $90 over the statutory $50 cap!
      disputedChargesTotalCad: 90.00
    });

    assert.equal(result.hasStatutoryViolations, true);
    const overageViolation = result.statutoryViolations.find(v => v.violationCode === 'DATA_OVERAGE_CAP_BREACH');
    assert.ok(overageViolation);
    assert.equal(overageViolation.severity, 'critical');
    assert.ok(overageViolation.finding.includes('$50.00 CAD'));
    assert.ok(overageViolation.finding.includes('$90.00 CAD'));
  });

  await t.test('detects breach of $100 international roaming cap and illegal unlock fee', () => {
    const result = assessTelecomDispute({
      providerName: 'Telus',
      daysSinceContractStart: 60,
      roamingChargedCad: 250.00, // $150 over the statutory $100 cap!
      unlockedDeviceFeeChargedCad: 50.00, // Banned under Section F.1
      disputedChargesTotalCad: 200.00
    });

    assert.equal(result.hasStatutoryViolations, true);
    assert.equal(result.violationCount, 2);
    
    const roamingViolation = result.statutoryViolations.find(v => v.violationCode === 'ROAMING_CAP_BREACH');
    assert.ok(roamingViolation);
    assert.ok(roamingViolation.finding.includes('$100.00 CAD'));
    assert.ok(roamingViolation.finding.includes('$150.00 CAD'));

    const unlockViolation = result.statutoryViolations.find(v => v.violationCode === 'ILLEGAL_DEVICE_UNLOCKING_FEE');
    assert.ok(unlockViolation);
    assert.ok(unlockViolation.finding.includes('$0 mandated'));
  });

  await t.test('calculates maximum allowable Early Cancellation Fee (ECF) based on remaining subsidy amortization', () => {
    const result = assessTelecomDispute({
      providerName: 'Fido',
      daysSinceContractStart: 180,
      monthsIntoContract: 6,
      deviceSubsidyTotalCad: 1200 // $1200 subsidy over 24 months = $50/mo. At 6 months: 6 * 50 = $300 amortized -> Max ECF = $900
    });

    // 1200 - (1200 * (6 / 24)) = 1200 - 300 = 900
    assert.equal(result.allowableMaxEcfCad, 900);
    assert.equal(result.isWithinTrialPeriod, false);
    assert.ok(result.formalDisputeNotice.includes('$900.00 CAD'));
  });

  await t.test('supports 30-day extended trial period for customers with disabilities', () => {
    const result = assessTelecomDispute({
      providerName: 'Virgin Plus',
      daysSinceContractStart: 22,
      hasDisability: true,
      deviceInOriginalCondition: true
    });

    assert.equal(result.allowedTrialDays, 30);
    assert.equal(result.isWithinTrialPeriod, true);
    assert.equal(result.trialCancellationStatus, 'ABSOLUTE_RIGHT_TO_CANCEL_WITHOUT_PENALTY');
  });

  await t.test('flags unilateral price increases on fixed-term contracts', () => {
    const result = assessTelecomDispute({
      providerName: 'Koodo',
      daysSinceContractStart: 90,
      contractType: 'postpaid_device_financing',
      providerUnilateralPriceIncrease: true
    });

    assert.equal(result.hasStatutoryViolations, true);
    const unilateralViolation = result.statutoryViolations.find(v => v.violationCode === 'UNILATERAL_CONTRACT_ALTERATION');
    assert.ok(unilateralViolation);
  });
});
