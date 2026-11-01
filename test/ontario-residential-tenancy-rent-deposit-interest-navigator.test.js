import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONTARIO_RENT_DEPOSIT_CONSTANTS,
  evaluateOntarioRentDepositInterest
} from '../src/ontario-residential-tenancy-rent-deposit-interest-navigator.js';

test('Ontario Rent Deposit Interest - Constants reflect RTA ss. 105, 106', () => {
  assert.equal(ONTARIO_RENT_DEPOSIT_CONSTANTS.DAMAGE_DEPOSITS_PROHIBITED, true);
  assert.equal(ONTARIO_RENT_DEPOSIT_CONSTANTS.ANNUAL_GUIDELINE_RATES[2024], 2.5);
  assert.equal(ONTARIO_RENT_DEPOSIT_CONSTANTS.ANNUAL_GUIDELINE_RATES[2025], 2.5);
});

test('Ontario Rent Deposit Interest - Compliant offset scenario where interest offsets rent increase', () => {
  // $2000 initial deposit, rent increased to $2050 (+$50)
  // 1 year interest at 2.5% = $50
  // Interest exactly matches rent increase, net owed = 0
  const result = evaluateOntarioRentDepositInterest({
    initialDepositAmountCad: 2000,
    currentMonthlyRentCad: 2050,
    tenancyDurationYears: 1,
    guidelineInterestRatePercent: 2.5,
    depositAppliedToLastMonthRentIncrease: true,
    landlordDemandedDamageDeposit: false,
    extraDepositPaidCad: 0
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_RENT_DEPOSIT_MANAGEMENT');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.interestAudit.totalInterestAccruedCad, 50);
  assert.equal(result.interestAudit.totalInterestOwedToTenantCad, 0);
});

test('Ontario Rent Deposit Interest - Unpaid interest over 2 years without offset', () => {
  // $2000 initial deposit, rent remained $2000
  // 2 years at 2.5% = $50 * 2 = $100 owed
  const result = evaluateOntarioRentDepositInterest({
    initialDepositAmountCad: 2000,
    currentMonthlyRentCad: 2000,
    tenancyDurationYears: 2,
    guidelineInterestRatePercent: 2.5,
    landlordPaidAnnualInterest: false,
    depositAppliedToLastMonthRentIncrease: false
  });

  assert.equal(result.complianceStatus, 'STATUTORY_RENT_DEPOSIT_VIOLATION');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNPAID_ANNUAL_RENT_DEPOSIT_INTEREST'));
  assert.equal(result.interestAudit.totalInterestOwedToTenantCad, 100);
  assert.ok(result.actionableRemedies.some(r => r.action === 'DEDUCT_INTEREST_FROM_FUTURE_RENT'));
});

test('Ontario Rent Deposit Interest - Illegal damage deposit demanded (s. 105 violation)', () => {
  const result = evaluateOntarioRentDepositInterest({
    initialDepositAmountCad: 1800,
    landlordDemandedDamageDeposit: true,
    extraDepositPaidCad: 1000
  });

  assert.equal(result.complianceStatus, 'STATUTORY_RENT_DEPOSIT_VIOLATION');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROHIBITED_SECURITY_OR_DAMAGE_DEPOSIT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RECOVER_ILLEGAL_DEPOSIT_VIA_FORM_T1'));
  assert.equal(result.interestAudit.illegalDepositPaidCad, 1000);
});
