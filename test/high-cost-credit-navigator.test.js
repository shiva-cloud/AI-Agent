import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CREDIT_DEFENSE_CONSTANTS,
  LOAN_TYPE_TAXONOMY,
  evaluateConsumerCreditAgreement
} from '../src/high-cost-credit-navigator.js';

test('High-Cost Credit Navigator — Constants match Criminal Code and provincial regulations', () => {
  assert.equal(CREDIT_DEFENSE_CONSTANTS.FEDERAL_CRIMINAL_APR_CAP, 35.0);
  assert.equal(CREDIT_DEFENSE_CONSTANTS.ONTARIO_MAX_FEE_PER_100, 14.0);
  assert.equal(CREDIT_DEFENSE_CONSTANTS.BC_MAX_FEE_PER_100, 15.0);
  assert.equal(CREDIT_DEFENSE_CONSTANTS.PAYDAY_COOLING_OFF_DAYS, 2);
  assert.equal(CREDIT_DEFENSE_CONSTANTS.MAX_PAYDAY_PERCENT_NET_PAY, 50.0);
  assert.ok(LOAN_TYPE_TAXONOMY.payday_loan);
  assert.ok(LOAN_TYPE_TAXONOMY.high_cost_installment);
});

test('High-Cost Credit Navigator — Detects payday loan fee cap overcharge above $14 per $100 in Ontario', () => {
  const result = evaluateConsumerCreditAgreement({
    province: 'ON',
    loanType: 'payday_loan',
    principalBorrowedCad: 1000,
    termDays: 14,
    totalFeesChargedCad: 180,
    borrowerName: 'Sarah Jenkins',
    lenderName: 'Apex Cash Loans Inc.'
  });

  assert.equal(result.statutoryMaxFeesCad, 140);
  assert.equal(result.illegalOverchargeCad, 40);
  assert.equal(result.defenseVerdict, 'STATUTORY_VIOLATIONS_DETECTED_REMEDIES_AVAILABLE');
  const overchargeViolation = result.statutoryViolations.find(v => v.code === 'PAYDAY_FEE_CAP_EXCEEDED');
  assert.ok(overchargeViolation);
  assert.ok(overchargeViolation.message.includes('$14 per $100'));
  assert.ok(result.demandLetter.includes('Apex Cash Loans Inc.'));
  assert.ok(result.demandLetter.includes('$40.00 CAD'));
});

test('High-Cost Credit Navigator — Exercises 2-day cooling-off statutory cancellation', () => {
  const result = evaluateConsumerCreditAgreement({
    province: 'ON',
    loanType: 'payday_loan',
    principalBorrowedCad: 500,
    daysSinceAgreement: 1
  });

  assert.equal(result.withinCoolingOffPeriod, true);
  assert.equal(result.coolingOffDaysAllowed, 2);
  assert.ok(result.demandLetter.includes('EXERCISE OF STATUTORY COOLING-OFF CANCELLATION'));
});

test('High-Cost Credit Navigator — Flags Criminal Code s. 347 breach for installment loan exceeding 35% APR', () => {
  const result = evaluateConsumerCreditAgreement({
    province: 'ON',
    loanType: 'high_cost_installment',
    principalBorrowedCad: 5000,
    statedAprPercent: 44.5
  });

  assert.equal(result.defenseVerdict, 'STATUTORY_VIOLATIONS_DETECTED_REMEDIES_AVAILABLE');
  const criminalInterest = result.statutoryViolations.find(v => v.code === 'CRIMINAL_INTEREST_RATE_EXCEEDED');
  assert.ok(criminalInterest);
  assert.ok(criminalInterest.message.includes('35% APR'));
});

test('High-Cost Credit Navigator — Flags illegal rollover loan and wage assignment attempt', () => {
  const result = evaluateConsumerCreditAgreement({
    province: 'ON',
    loanType: 'payday_loan',
    principalBorrowedCad: 800,
    totalFeesChargedCad: 112,
    isRolloverLoan: true,
    lenderAttemptedWageAssignment: true
  });

  assert.equal(result.defenseVerdict, 'STATUTORY_VIOLATIONS_DETECTED_REMEDIES_AVAILABLE');
  assert.ok(result.statutoryViolations.some(v => v.code === 'ILLEGAL_ROLLOVER_LOAN'));
  assert.ok(result.statutoryViolations.some(v => v.code === 'PROHIBITED_WAGE_ASSIGNMENT'));
});

test('High-Cost Credit Navigator — Detects loan exceeding 50% of borrower net pay', () => {
  const result = evaluateConsumerCreditAgreement({
    province: 'ON',
    loanType: 'payday_loan',
    principalBorrowedCad: 1500,
    netMonthlyIncomeCad: 2000,
    totalFeesChargedCad: 210
  });

  const incomeCapViolation = result.statutoryViolations.find(v => v.code === 'EXCEEDS_50_PERCENT_NET_PAY');
  assert.ok(incomeCapViolation);
  assert.ok(incomeCapViolation.message.includes('$1000.00 CAD'));
});
