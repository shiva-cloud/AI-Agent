import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SPECULATION_TAX_CONSTANTS,
  evaluateSpeculationTaxAndRebates
} from '../src/speculation-tax-rebate-navigator.js';

test('Speculation Tax Navigator — Constants reflect BC SVT & ON NRST benchmarks', () => {
  assert.equal(SPECULATION_TAX_CONSTANTS.BC_SVT_CANADIAN_RATE_PERCENT, 0.5);
  assert.equal(SPECULATION_TAX_CONSTANTS.BC_SVT_FOREIGN_RATE_PERCENT, 2.0);
  assert.equal(SPECULATION_TAX_CONSTANTS.BC_SVT_MIN_RENTAL_DAYS, 180);
  assert.equal(SPECULATION_TAX_CONSTANTS.ON_NRST_RATE_PERCENT, 25.0);
  assert.equal(SPECULATION_TAX_CONSTANTS.ON_NRST_PR_ACQUISITION_DAYS, 90);
  assert.equal(SPECULATION_TAX_CONSTANTS.ON_NRST_CLAIM_LIMITATION_DAYS, 90);
});

test('Speculation Tax Navigator — Grants full BC SVT exemption for primary residence occupied >= 6 months', () => {
  const result = evaluateSpeculationTaxAndRebates({
    province: 'BC',
    propertyAssessedValueCad: 1500000,
    isCanadianCitizenOrPr: true,
    isPrincipalResidenceOccupied6Months: true
  });

  assert.equal(result.isTaxExempt, true);
  assert.equal(result.netTaxPayableCad, 0);
  assert.match(result.applicableExemption, /Principal Residence Exemption/);
});

test('Speculation Tax Navigator — Charges 2.0% BC SVT on satellite family with untaxed foreign income', () => {
  const result = evaluateSpeculationTaxAndRebates({
    province: 'BC',
    propertyAssessedValueCad: 2000000,
    isCanadianCitizenOrPr: true, // Citizen, but satellite family
    isSatelliteFamily: true,
    isPrincipalResidenceOccupied6Months: false,
    rentalDaysInYear: 0
  });

  assert.equal(result.isTaxExempt, false);
  assert.equal(result.taxRatePercent, 2.0);
  // 2% of 2,000,000 = $40,000
  assert.equal(result.grossTaxPayableCad, 40000);
  assert.ok(result.riskWarnings.some(w => w.includes('SATELLITE FAMILY TRAP')));
});

test('Speculation Tax Navigator — Approves 100% Ontario NRST rebate for PR acquired within 90 days', () => {
  const result = evaluateSpeculationTaxAndRebates({
    province: 'ON',
    purchasePriceCad: 800000,
    purchaseClosingDate: '2026-01-15',
    prStatusAcquiredDate: '2026-03-15', // 59 days post-closing (< 90 days)
    rebateApplicationDate: '2026-04-15', // 31 days post-PR (< 90 days)
    occupiedAsPrincipalResidenceWithin60Days: true,
    heldSolelyWithSpouse: true
  });

  // 25% on 800,000 = $200,000
  assert.equal(result.ontarioNrstRebate.isNrstRebateEligible, true);
  assert.equal(result.ontarioNrstRebate.nrstRebateAmountCad, 200000);
  assert.match(result.ontarioNrstRebate.nrstRebateReason, /Full statutory 25% NRST rebate approved/);
});

test('Speculation Tax Navigator — Rejects Ontario NRST rebate when PR acquired in 120 days (> 90 days)', () => {
  const result = evaluateSpeculationTaxAndRebates({
    province: 'ON',
    purchasePriceCad: 800000,
    purchaseClosingDate: '2026-01-01',
    prStatusAcquiredDate: '2026-05-15', // 134 days post-closing (> 90 days)
    occupiedAsPrincipalResidenceWithin60Days: true,
    heldSolelyWithSpouse: true
  });

  assert.equal(result.ontarioNrstRebate.isNrstRebateEligible, false);
  assert.match(result.ontarioNrstRebate.nrstRebateReason, /exceeds statutory 90-day acquisition window/);
});
