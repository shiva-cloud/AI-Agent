import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STRATA_CONSTANTS,
  evaluateBcStrataBylawDefense
} from '../src/bc-strata-bylaw-navigator.js';

test('BC Strata Bylaw Navigator — Constants reflect Strata Property Act & Bill 44 standards', () => {
  assert.equal(STRATA_CONSTANTS.STANDARD_BYLAW_FINE_CAP_CAD, 200.0);
  assert.equal(STRATA_CONSTANTS.ONLY_PERMITTED_AGE_MINIMUM_YEARS, 55);
  assert.equal(STRATA_CONSTANTS.CRT_ONLINE_FILING_FEE_CAD, 125.0);
});

test('BC Strata Bylaw Navigator — Declares residential rental restriction bylaw void under Bill 44', () => {
  const result = evaluateBcStrataBylawDefense({
    disputeType: 'rental_restriction',
    isLongTermRental: true,
    rentalTermMonths: 12,
    fineAmountLeviedCad: 500, // Strata tried to fine $500 for renting
    strataDemandedTenantScreening: true
  });

  assert.equal(result.isBylawEnforceable, false);
  assert.equal(result.unlawfulFineRefundCad, 500.0);
  assert.ok(result.violations.some(v => v.includes('Strata Property Act s. 141')));
  assert.ok(result.statutoryProtections.some(p => p.includes('Bill 44')));
});

test('BC Strata Bylaw Navigator — Permits strata bylaws restricting short-term vacation rentals (< 90 days)', () => {
  const result = evaluateBcStrataBylawDefense({
    disputeType: 'rental_restriction',
    isLongTermRental: false, // Airbnb short-term
    rentalTermMonths: 1
  });

  assert.equal(result.isBylawEnforceable, true);
  assert.ok(result.riskWarnings.some(w => w.includes('SHORT-TERM RENTAL EXCEPTION')));
});

test('BC Strata Bylaw Navigator — Nullifies 19+ age restriction bylaw (only 55+ allowed under Bill 44)', () => {
  const result = evaluateBcStrataBylawDefense({
    disputeType: 'age_restriction',
    strataAgeMinimum: 19
  });

  assert.equal(result.isBylawEnforceable, false);
  assert.ok(result.violations.some(v => v.includes('Unlawful age bylaw (19+)')));

  // Check 55+ bylaw
  const seniorResult = evaluateBcStrataBylawDefense({
    disputeType: 'age_restriction',
    strataAgeMinimum: 55
  });

  assert.equal(seniorResult.isBylawEnforceable, true);
  assert.ok(seniorResult.statutoryProtections.some(p => p.includes('55+ age restriction bylaws are permitted')));
});

test('BC Strata Bylaw Navigator — Exempts certified service dogs from pet restriction bylaws', () => {
  const result = evaluateBcStrataBylawDefense({
    disputeType: 'pet_bylaw',
    isCertifiedServiceDog: true
  });

  assert.equal(result.isBylawEnforceable, false);
  assert.ok(result.statutoryProtections.some(p => p.includes('Guide Dog and Service Dog Act')));
});

test('BC Strata Bylaw Navigator — Flags unreasonable refusal of EV charger installation under Bill 22', () => {
  const result = evaluateBcStrataBylawDefense({
    disputeType: 'ev_charging',
    strataRefusedEvRequest: true
  });

  assert.ok(result.violations.some(v => v.includes('Unreasonable refusal of EV charging station')));
  assert.ok(result.statutoryProtections.some(p => p.includes('Strata Property Act s. 90.1')));
});
