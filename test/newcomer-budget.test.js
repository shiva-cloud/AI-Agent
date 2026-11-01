import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNewcomerBudget, OFFICIAL_FOOD_BASKET_MONTHLY } from '../src/newcomer-budget.js';

test('OFFICIAL_FOOD_BASKET_MONTHLY defines healthy food baskets for all household tiers', () => {
  assert.ok(OFFICIAL_FOOD_BASKET_MONTHLY.single_adult > 300);
  assert.ok(OFFICIAL_FOOD_BASKET_MONTHLY.couple > OFFICIAL_FOOD_BASKET_MONTHLY.single_adult);
  assert.ok(OFFICIAL_FOOD_BASKET_MONTHLY.family_4 > 1000);
});

test('calculateNewcomerBudget computes accurate runway and upfront deposits for Toronto', () => {
  const budget = calculateNewcomerBudget({
    city: 'Toronto',
    household: 'single',
    accommodation: '1bed',
    savingsCad: 20000,
    monthlyIncomeNet: 0
  });

  assert.equal(budget.city, 'Toronto');
  assert.equal(budget.province, 'Ontario');
  assert.ok(budget.initialUpfrontCosts.totalOneTimeUpfront > 4000);
  // In Ontario, rent deposit is full month, not half
  assert.equal(budget.initialUpfrontCosts.statutoryRentDeposit, budget.initialUpfrontCosts.firstMonthRent);
  assert.ok(budget.runwayMonths > 0);
  assert.ok(budget.bridgeHealthNotice.includes('immediate'));
});

test('calculateNewcomerBudget factors in CCB credits for families with children', () => {
  const familyBudget = calculateNewcomerBudget({
    city: 'Calgary',
    household: 'family_2_children',
    accommodation: '2bed',
    savingsCad: 35000,
    monthlyIncomeNet: 3500
  });

  assert.equal(familyBudget.city, 'Calgary');
  assert.ok(familyBudget.monthlyGovernmentOffsets.canadaChildBenefit > 1000);
  assert.ok(familyBudget.monthlyGovernmentOffsets.totalMonthlyGovernmentCredits > 1000);
  // Because Calgary rent is lower and CCB is factored in along with income, net burn rate is low or runway is long
  assert.ok(familyBudget.runwayMonths >= 6);
  assert.equal(familyBudget.runwaySafetyAssessment.startsWith('Optimal'), true);
});

test('calculateNewcomerBudget alerts for BC healthcare waiting period', () => {
  const bcBudget = calculateNewcomerBudget({
    city: 'Vancouver',
    household: 'single',
    accommodation: '1bed',
    savingsCad: 15000
  });

  assert.equal(bcBudget.city, 'Vancouver');
  assert.ok(bcBudget.bridgeHealthNotice.includes('statutory waiting period'));
  assert.ok(bcBudget.initialUpfrontCosts.privateBridgeHealthInsurance > 0);
});
