import test from 'node:test';
import assert from 'node:assert/strict';
import { CANADIAN_METROS, compareCities } from '../src/city-comparison.js';

test('CANADIAN_METROS exports all key metros with statutory attributes', () => {
  const cities = ['Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'];
  for (const c of cities) {
    assert.ok(CANADIAN_METROS[c], `Missing city: ${c}`);
    assert.ok(CANADIAN_METROS[c].rent1BedMedian > 1000);
    assert.ok(CANADIAN_METROS[c].transitMonthlyPass > 50);
    assert.ok(CANADIAN_METROS[c].healthcarePlan);
    assert.ok(CANADIAN_METROS[c].settlementAgencies.length > 0);
  }
});

test('compareCities accurately calculates cost differentials between Toronto and Calgary', () => {
  const result = compareCities(['Toronto', 'Calgary'], { annualSalary: 85000, householdSize: 1 });
  assert.ok(!result.error);
  assert.equal(result.comparison.length, 2);
  
  // Calgary has 0% PST and cheaper rent, so it should be cheaper overall
  assert.equal(result.differential.cheaperCity, 'Calgary');
  assert.ok(result.differential.annualEstimatedSavings > 5000);
  assert.equal(result.differential.salesTaxAdvantage, 'Calgary');
});

test('compareCities handles invalid or empty city lists cleanly', () => {
  const emptyResult = compareCities([]);
  assert.ok(emptyResult.error);
  assert.ok(emptyResult.availableCities.includes('Toronto'));

  const unknownResult = compareCities(['Atlantis', 'Narnia']);
  assert.ok(unknownResult.error);
});
