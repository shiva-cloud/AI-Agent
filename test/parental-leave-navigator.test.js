// test/parental-leave-navigator.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EI_STATUTORY_CONSTANTS,
  PROVINCIAL_JOB_PROTECTION_STANDARDS,
  evaluateParentalLeave
} from '../src/parental-leave-navigator.js';

test('Canadian Statutory Parental & Maternity Leave (EI) Engine', async (t) => {
  await t.test('statutory constants match federal Employment Insurance standards', () => {
    assert.equal(EI_STATUTORY_CONSTANTS.MIN_INSURABLE_HOURS_EI, 600);
    assert.equal(EI_STATUTORY_CONSTANTS.STANDARD_MAX_WEEKLY_CAD, 695);
    assert.equal(EI_STATUTORY_CONSTANTS.EXTENDED_MAX_WEEKLY_CAD, 417);
    assert.equal(EI_STATUTORY_CONSTANTS.STANDARD_BENEFIT_RATE, 0.55);
    assert.equal(EI_STATUTORY_CONSTANTS.EXTENDED_BENEFIT_RATE, 0.33);
    assert.equal(EI_STATUTORY_CONSTANTS.MATERNITY_WEEKS_MAX, 15);
    assert.equal(EI_STATUTORY_CONSTANTS.PARENTAL_STANDARD_WEEKS_SHARED, 40);
    assert.equal(EI_STATUTORY_CONSTANTS.PARENTAL_EXTENDED_WEEKS_SHARED, 69);
  });

  await t.test('audits an eligible permanent resident in Ontario with full EI funding and job protection', () => {
    const res = evaluateParentalLeave({
      province: 'ON',
      immigrationStatus: 'permanent_resident',
      insurableHoursWorkedPast52Weeks: 800,
      annualGrossSalaryCad: 70000,
      leaveType: 'maternity_and_parental',
      parentalOption: 'standard',
      isSharingWithPartner: true,
      employerServiceWeeks: 20
    });

    assert.equal(res.resolutionVerdict, 'FULLY_PROTECTED_AND_FUNDED');
    assert.equal(res.isEligibleForCashBenefits, true);
    assert.equal(res.isEligibleForProvincialJobProtection, true);
    assert.equal(res.maternityWeeks, 15);
    assert.equal(res.parentalWeeks, 40); // 35 + 5 sharing bonus
    assert.equal(res.totalBenefitDurationWeeks, 55);
    assert.equal(res.weeklyBenefitCad, 695); // Hits 2025 cap
    assert.equal(res.statutoryViolations.length, 0);
    assert.ok(res.totalProjectedCashPayoutCad > 35000);
  });

  await t.test('detects EI hours shortfall (<600 hours) while retaining provincial job protection', () => {
    const res = evaluateParentalLeave({
      province: 'ON',
      immigrationStatus: 'permanent_resident',
      insurableHoursWorkedPast52Weeks: 450,
      annualGrossSalaryCad: 50000,
      employerServiceWeeks: 18
    });

    assert.equal(res.resolutionVerdict, 'JOB_PROTECTED_UNFUNDED_LEAVE');
    assert.equal(res.isEligibleForCashBenefits, false);
    assert.equal(res.hoursShortfall, 150);
    assert.equal(res.isEligibleForProvincialJobProtection, true);
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('EI Insurable Hours Threshold')));
  });

  await t.test('detects Ontario 13-week employer tenure shortfall (unprotected job risk)', () => {
    // Has 700 hours from previous employer, but only 6 weeks with current employer
    const res = evaluateParentalLeave({
      province: 'ON',
      immigrationStatus: 'permanent_resident',
      insurableHoursWorkedPast52Weeks: 700,
      annualGrossSalaryCad: 55000,
      employerServiceWeeks: 6
    });

    assert.equal(res.resolutionVerdict, 'EI_FUNDED_UNPROTECTED_JOB_RISK');
    assert.equal(res.isEligibleForCashBenefits, true);
    assert.equal(res.isEligibleForProvincialJobProtection, false);
    assert.equal(res.serviceWeeksShortfall, 7);
    assert.ok(res.statutoryViolations.some(v => v.rule.includes('Provincial Minimum Length of Service')));
  });

  await t.test('enforces British Columbia immediate job protection without minimum tenure', () => {
    const res = evaluateParentalLeave({
      province: 'BC',
      immigrationStatus: 'permanent_resident',
      insurableHoursWorkedPast52Weeks: 650,
      annualGrossSalaryCad: 50000,
      employerServiceWeeks: 3 // Only 3 weeks with employer
    });

    assert.equal(res.isEligibleForProvincialJobProtection, true);
    assert.equal(res.resolutionVerdict, 'FULLY_PROTECTED_AND_FUNDED');
    assert.match(res.provincialStatute, /British Columbia/);
  });

  await t.test('evaluates work permit holder with expiring permit mid-leave', () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 120); // 120 days from now

    const res = evaluateParentalLeave({
      province: 'ON',
      immigrationStatus: 'work_permit_holder',
      insurableHoursWorkedPast52Weeks: 900,
      annualGrossSalaryCad: 62000,
      employerServiceWeeks: 24,
      workPermitExpiryDate: expiry.toISOString().slice(0, 10)
    });

    assert.equal(res.isEligibleForCashBenefits, true);
    assert.ok(res.workPermitVulnerabilities.length > 0);
    assert.match(res.workPermitVulnerabilities[0].risk, /Work Permit Expiry Mid-Leave/);
    assert.match(res.workPermitVulnerabilities[0].actionRequired, /Service Canada will freeze/);
  });

  await t.test('validates Quebec QPIP $2,000 insurable income threshold', () => {
    const res = evaluateParentalLeave({
      province: 'QC',
      immigrationStatus: 'permanent_resident',
      insurableHoursWorkedPast52Weeks: 300, // Below federal 600 hours
      annualGrossSalaryCad: 35000 // Above $2,000 QPIP floor
    });

    assert.equal(res.isEligibleForCashBenefits, true);
    assert.equal(res.maternityWeeks, 18);
  });
});
