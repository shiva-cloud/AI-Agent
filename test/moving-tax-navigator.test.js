// test/moving-tax-navigator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessMovingExpenses,
  MOVING_TAX_CONSTANTS
} from '../src/moving-tax-navigator.js';

test('Canadian Newcomer Moving Expenses Deduction & CRA Form T1-M Engine', async (t) => {
  await t.test('statutory constants match federal Income Tax Act and CRA standards', () => {
    assert.ok(MOVING_TAX_CONSTANTS.STATUTES.ITA_MOVING_DEDUCTION.includes('s. 62(1)'));
    assert.ok(MOVING_TAX_CONSTANTS.STATUTES.ITA_CARRY_FORWARD.includes('s. 62(1)(d)'));
    assert.ok(MOVING_TAX_CONSTANTS.STATUTES.ITA_TEMPORARY_LIVING_CAP.includes('s. 62(3)(c)'));
    assert.equal(MOVING_TAX_CONSTANTS.MAX_TEMPORARY_LIVING_DAYS, 15);
    assert.equal(MOVING_TAX_CONSTANTS.MINIMUM_DISTANCE_KM, 40);
    assert.equal(MOVING_TAX_CONSTANTS.MEAL_SIMPLIFIED_RATE_CAD_PER_DAY, 69.00);
    assert.equal(MOVING_TAX_CONSTANTS.PROVINCIAL_VEHICLE_RATES_CENTS_PER_KM.ON, 70.0);
  });

  await t.test('evaluates compliant cross-border newcomer move with full deduction and tax refund', () => {
    const result = assessMovingExpenses({
      province: 'ON',
      relocationPurpose: 'employment',
      oldCountry: 'United States',
      oldCity: 'Seattle',
      newCity: 'Toronto',
      distanceKm: 4200,
      householdSize: 2,
      arrivalDateStr: '2026-06-15',
      canadianIncomeEarnedInYearCad: 75000,
      travelExpensesCad: 2200,
      moversAndShippingCad: 6000,
      temporaryLivingDays: 10,
      temporaryLivingDailyCostCad: 200,
      leaseCancellationPenaltyCad: 1500,
      utilityAndAddressChangeFeesCad: 300,
      otherIncidentalCostsCad: 250,
      employerReimbursementCad: 1000,
      marginalTaxRatePercent: 43.41
    });

    assert.equal(result.isEligible, true);
    assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_T1M_DEDUCTION');
    assert.equal(result.meetsDistanceRule, true);
    
    // Living cost = 10 days * 200 = 2000
    // Gross = 2200 + 6000 + 2000 + 1500 + 300 + 250 = 12250
    assert.equal(result.grossEligibleExpensesCad, 12250);
    // Net = 12250 - 1000 reimbursement = 11250
    assert.equal(result.netEligibleExpensesCad, 11250);
    assert.equal(result.disallowedTemporaryLivingCad, 0);

    // Income ($75,000) > Net expenses ($11,250) -> All deductible in current tax year
    assert.equal(result.deductibleInCurrentTaxYearCad, 11250);
    assert.equal(result.carryForwardToFutureYearsCad, 0);

    // Tax refund = 11250 * 0.4341 = ~4884 CAD
    assert.equal(result.estimatedTaxRefundYear1Cad, 4884);
    assert.equal(result.totalTaxBenefitCad, 4884);

    // Form T1-M mapping check
    assert.equal(result.formT1MMapping.taxReturnLine, 'Line 21900 of Federal T1 General Return');
    assert.equal(result.formT1MMapping.line10NetMovingExpensesCad, 11250);
    assert.equal(result.formT1MMapping.line12DeductionClaimedCurrentYearCad, 11250);
    assert.equal(result.formT1MMapping.line13AllowableCarryForwardCad, 0);
  });

  await t.test('strictly enforces 40-kilometre statutory barrier under ITA s. 62(1)(c)', () => {
    const result = assessMovingExpenses({
      province: 'BC',
      relocationPurpose: 'employment',
      oldCountry: 'Canada',
      oldCity: 'Burnaby',
      newCity: 'Vancouver',
      distanceKm: 15, // Under 40 km!
      canadianIncomeEarnedInYearCad: 60000,
      travelExpensesCad: 200,
      moversAndShippingCad: 1000
    });

    assert.equal(result.meetsDistanceRule, false);
    assert.equal(result.isEligible, false);
    assert.equal(result.eligibilityVerdict, 'FAILED_40KM_DISTANCE_TEST');
    assert.equal(result.deductibleInCurrentTaxYearCad, 0);
    assert.equal(result.carryForwardToFutureYearsCad, 0);
    assert.equal(result.totalTaxBenefitCad, 0);
  });

  await t.test('strictly caps temporary living expenses at 15 days under ITA s. 62(3)(c)', () => {
    const result = assessMovingExpenses({
      province: 'AB',
      relocationPurpose: 'employment',
      oldCountry: 'United Kingdom',
      oldCity: 'London',
      newCity: 'Calgary',
      distanceKm: 7000,
      canadianIncomeEarnedInYearCad: 90000,
      travelExpensesCad: 3000,
      moversAndShippingCad: 8000,
      temporaryLivingDays: 25, // 10 days over the statutory 15-day cap!
      temporaryLivingDailyCostCad: 200,
      leaseCancellationPenaltyCad: 0,
      employerReimbursementCad: 0
    });

    assert.equal(result.isEligible, true);
    // Allowed days: 15 * 200 = 3000
    // Disallowed days: 10 * 200 = 2000
    assert.equal(result.formT1MMapping.line3TemporaryLivingExpensesCad, 3000);
    assert.equal(result.disallowedTemporaryLivingCad, 2000);
    assert.equal(result.grossEligibleExpensesCad, 3000 + 8000 + 3000); // 14000
    
    // Check audit warning for 15-day cap
    const capWarning = result.auditWarnings.find(w => w.rule.includes('15-Day Temporary Living Cap'));
    assert.ok(capWarning);
    assert.equal(capWarning.severity, 'high');
  });

  await t.test('calculates indefinite carry-forward when Canadian income is lower than expenses (ITA s. 62(1)(d))', () => {
    const result = assessMovingExpenses({
      province: 'ON',
      relocationPurpose: 'employment',
      oldCountry: 'India',
      oldCity: 'Bangalore',
      newCity: 'Ottawa',
      distanceKm: 12000,
      arrivalDateStr: '2026-11-20',
      canadianIncomeEarnedInYearCad: 5000, // Arrived late in the year, only earned $5,000
      travelExpensesCad: 4000,
      moversAndShippingCad: 7000,
      temporaryLivingDays: 14,
      temporaryLivingDailyCostCad: 150, // 2100
      employerReimbursementCad: 0,
      marginalTaxRatePercent: 40.0
    });

    assert.equal(result.isEligible, true);
    // Total eligible: 4000 + 7000 + 2100 = 13100
    assert.equal(result.netEligibleExpensesCad, 13100);
    
    // Can only deduct up to $5,000 in Year 1!
    assert.equal(result.deductibleInCurrentTaxYearCad, 5000);
    // Remaining $8,100 carries forward indefinitely!
    assert.equal(result.carryForwardToFutureYearsCad, 8100);

    assert.equal(result.estimatedTaxRefundYear1Cad, 2000); // 5000 * 0.40
    assert.equal(result.estimatedFutureTaxRefundCad, 3240); // 8100 * 0.40
    assert.equal(result.totalTaxBenefitCad, 5240);

    const carryForwardWarning = result.auditWarnings.find(w => w.rule.includes('Carry-Forward Trigger'));
    assert.ok(carryForwardWarning);
  });

  await t.test('handles full employer reimbursement offset reducing claim to zero', () => {
    const result = assessMovingExpenses({
      province: 'BC',
      relocationPurpose: 'employment',
      distanceKm: 500,
      canadianIncomeEarnedInYearCad: 80000,
      travelExpensesCad: 1500,
      moversAndShippingCad: 3500,
      temporaryLivingDays: 5,
      temporaryLivingDailyCostCad: 200, // 1000
      employerReimbursementCad: 7000 // Reimbursed more than gross expenses (6000)
    });

    assert.equal(result.isEligible, true);
    assert.equal(result.grossEligibleExpensesCad, 6000);
    assert.equal(result.netEligibleExpensesCad, 0);
    assert.equal(result.deductibleInCurrentTaxYearCad, 0);
    assert.equal(result.carryForwardToFutureYearsCad, 0);
    assert.equal(result.totalTaxBenefitCad, 0);

    const reimbWarning = result.auditWarnings.find(w => w.rule.includes('Full Employer Reimbursement Offset'));
    assert.ok(reimbWarning);
  });

  await t.test('rejects non-qualifying purpose such as personal relocation without employment or studies', () => {
    const result = assessMovingExpenses({
      province: 'ON',
      relocationPurpose: 'personal',
      distanceKm: 800,
      canadianIncomeEarnedInYearCad: 50000,
      travelExpensesCad: 1000,
      moversAndShippingCad: 2000
    });

    assert.equal(result.isEligible, false);
    assert.equal(result.eligibilityVerdict, 'INELIGIBLE_NON_QUALIFYING_PURPOSE');
    assert.equal(result.deductibleInCurrentTaxYearCad, 0);
  });
});
