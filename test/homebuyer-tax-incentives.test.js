import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateHomebuyerTaxIncentives,
  HOMEBUYER_CONSTANTS
} from '../src/homebuyer-tax-incentives.js';

test('Homebuyer Tax Engine — Statutory constants match 2024-2026 federal rules', () => {
  assert.equal(HOMEBUYER_CONSTANTS.FHSA_ANNUAL_LIMIT_CAD, 8000);
  assert.equal(HOMEBUYER_CONSTANTS.FHSA_LIFETIME_LIMIT_CAD, 40000);
  assert.equal(HOMEBUYER_CONSTANTS.HBP_MAX_WITHDRAWAL_CAD, 60000); // Budget 2024 increased from $35k to $60k
  assert.equal(HOMEBUYER_CONSTANTS.HBTC_AMOUNT_CAD, 10000);
  assert.equal(HOMEBUYER_CONSTANTS.HBTC_FEDERAL_RATE, 0.15);
  assert.equal(HOMEBUYER_CONSTANTS.ONTARIO_LTT_MAX_REBATE_CAD, 4000);
  assert.equal(HOMEBUYER_CONSTANTS.TORONTO_MLTT_MAX_REBATE_CAD, 4475);
});

test('Homebuyer Tax Engine — Calculates couple FHSA & HBP tax-free down payment unlocking', () => {
  const result = evaluateHomebuyerTaxIncentives({
    province: 'ON',
    city: 'Toronto',
    homePurchasePriceCad: 800000,
    isFirstTimeHomeBuyer: true,
    marginalTaxRatePercent: 40.0,
    applicant1: {
      annualIncomeCad: 90000,
      rrspBalanceCad: 50000,
      fhsaBalanceCad: 16000,
      fhsaYearsActive: 2
    },
    hasSpouseOrPartner: true,
    applicant2: {
      annualIncomeCad: 70000,
      rrspBalanceCad: 30000,
      fhsaBalanceCad: 8000,
      fhsaYearsActive: 1
    },
    plannedPurchaseYear: 2026
  });

  assert.equal(result.isFirstTimeHomeBuyer, true);
  assert.equal(result.fhsaEvaluation.totalFhsaWithdrawalCad, 24000); // 16k + 8k
  assert.equal(result.fhsaEvaluation.estimatedDeductionTaxRefundCad, 9600); // 24k * 0.40
  assert.equal(result.hbpEvaluation.totalHbpWithdrawalCad, 80000); // 50k + 30k
  assert.equal(result.hbpEvaluation.maxPerPersonLimitCad, 60000);
  assert.equal(result.downPaymentUnlocked.totalTaxFreeDownPaymentCad, 104000); // 24k + 80k
  assert.equal(result.hbpEvaluation.repaymentStartYear, 2031); // 2026 + 5-yr grace
  assert.equal(result.taxCreditsAndRebates.hbtcTaxSavingsCad, 1500);
  assert.equal(result.taxCreditsAndRebates.lttRebateCad, 8475); // 4000 + 4475 in Toronto
});

test('Homebuyer Tax Engine — Disqualifies previous homeowners from FTHB tax benefits', () => {
  const result = evaluateHomebuyerTaxIncentives({
    province: 'ON',
    city: 'Mississauga',
    homePurchasePriceCad: 650000,
    isFirstTimeHomeBuyer: false
  });

  assert.equal(result.isFirstTimeHomeBuyer, false);
  assert.equal(result.fhsaEvaluation.totalFhsaWithdrawalCad, 0);
  assert.equal(result.hbpEvaluation.totalHbpWithdrawalCad, 0);
  assert.equal(result.downPaymentUnlocked.totalTaxFreeDownPaymentCad, 0);
  assert.equal(result.taxCreditsAndRebates.hbtcTaxSavingsCad, 0);
  assert.equal(result.taxCreditsAndRebates.lttRebateCad, 0);
});

test('Homebuyer Tax Engine — Applies British Columbia Property Transfer Tax exemption', () => {
  const result = evaluateHomebuyerTaxIncentives({
    province: 'BC',
    city: 'Vancouver',
    homePurchasePriceCad: 750000, // <= $835,000 threshold
    isFirstTimeHomeBuyer: true
  });

  assert.equal(result.province, 'BC');
  assert.ok(result.taxCreditsAndRebates.lttRebateCad > 10000); // 1% on 200k + 2% on 550k = $13,000
  assert.ok(result.taxCreditsAndRebates.lttRebateDetails.includes('Full exemption'));
});

test('Homebuyer Tax Engine — Differentiates Toronto double rebate from rest of Ontario', () => {
  const torontoResult = evaluateHomebuyerTaxIncentives({
    province: 'ON',
    city: 'Toronto',
    isFirstTimeHomeBuyer: true
  });
  const mississaugaResult = evaluateHomebuyerTaxIncentives({
    province: 'ON',
    city: 'Mississauga',
    isFirstTimeHomeBuyer: true
  });

  assert.equal(torontoResult.taxCreditsAndRebates.lttRebateCad, 8475);
  assert.equal(mississaugaResult.taxCreditsAndRebates.lttRebateCad, 4000);
});
