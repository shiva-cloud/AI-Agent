import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMERCIAL_LEASE_CONSTANTS,
  COMMERCIAL_LEASE_TYPES,
  evaluateCommercialLease
} from '../src/commercial-lease-navigator.js';

test('Commercial Lease Navigator — Constants match Ontario CTA standards', () => {
  assert.equal(COMMERCIAL_LEASE_CONSTANTS.ONTARIO_CTA_DEFAULT_REENTRY_DAYS, 15);
  assert.equal(COMMERCIAL_LEASE_CONSTANTS.ONTARIO_DISTRAINT_HOLD_DAYS, 5);
  assert.equal(COMMERCIAL_LEASE_CONSTANTS.BASIC_LIMITATION_YEARS, 2);
  assert.ok(COMMERCIAL_LEASE_TYPES.triple_net_nnn);
  assert.ok(COMMERCIAL_LEASE_TYPES.gross_lease);
});

test('Commercial Lease Navigator — Audits imminent statutory lockout after 15 days of arrears (CTA s. 18)', () => {
  const result = evaluateCommercialLease({
    province: 'ON',
    baseRentMonthlyCad: 4000,
    additionalRentMonthlyCad: 1500,
    squareFootage: 1500,
    leaseTermYears: 5,
    yearsRemaining: 3,
    isRentOverdue: true,
    daysRentOverdue: 16,
    hasPersonalGuarantee: true,
    tenantBusinessName: 'Aroma Bistro Inc.',
    landlordName: 'Metro Realty Trust'
  });

  assert.equal(result.province, 'ON');
  assert.equal(result.lockoutRiskLevel, 'imminent');
  const lockoutRisk = result.statutoryRisks.find(r => r.code === 'IMMINENT_CTA_SECTION_18_LOCKOUT');
  assert.ok(lockoutRisk);
  assert.ok(lockoutRisk.message.includes('15 days'));
  assert.ok(lockoutRisk.message.includes('WITHOUT A COURT ORDER'));

  // Financial verification: monthly gross = 4000 + 1500 = 5500
  // annual = 66,000; sqft = 1500 -> 66000 / 1500 = 44.00 / sqft
  assert.equal(result.financialOverview.grossMonthlyRentCad, 5500);
  assert.equal(result.financialOverview.annualGrossRentCad, 66000);
  assert.equal(result.grossRentPerSqFtCad, 44);

  // 3 years = 36 months * 5500 = 198,000 personal guarantee exposure
  assert.equal(result.personalGuaranteeLiability.hasPersonalGuarantee, true);
  assert.equal(result.personalGuaranteeLiability.personalGuaranteeExposureCad, 198000);
});

test('Commercial Lease Navigator — Calculates grace countdown when overdue < 15 days', () => {
  const result = evaluateCommercialLease({
    province: 'ON',
    baseRentMonthlyCad: 3000,
    additionalRentMonthlyCad: 1000,
    isRentOverdue: true,
    daysRentOverdue: 10
  });

  assert.equal(result.lockoutRiskLevel, 'high');
  const countdownRisk = result.statutoryRisks.find(r => r.code === 'COUNTDOWN_TO_REENTRY');
  assert.ok(countdownRisk);
  assert.ok(countdownRisk.title.includes('5 Days Until Statutory Lockout'));
});

test('Commercial Lease Navigator — Formulates mutual exclusivity rule for commercial distress (ss. 39-53)', () => {
  const result = evaluateCommercialLease({
    province: 'ON',
    isRentOverdue: true,
    daysRentOverdue: 8
  });

  assert.equal(result.distraintDoctrine.isAvailableToLandlord, true);
  assert.ok(result.distraintDoctrine.criticalRule.includes('Mutual Exclusivity'));
  const distressRisk = result.statutoryRisks.find(r => r.code === 'DISTRAINT_INVENTORY_SEIZURE_RISK');
  assert.ok(distressRisk);
});

test('Commercial Lease Navigator — Detects lack of commercial rent control and warns tenant', () => {
  const result = evaluateCommercialLease({
    province: 'ON',
    isRentOverdue: false
  });

  const rentControlWarning = result.statutoryRisks.find(r => r.code === 'NO_COMMERCIAL_RENT_CONTROL');
  assert.ok(rentControlWarning);
  assert.ok(rentControlWarning.message.includes('NO statutory rent increase cap'));
});

test('Commercial Lease Navigator — Enforces CTA s. 23 assignment reasonableness and drafts demand letter', () => {
  const result = evaluateCommercialLease({
    province: 'ON',
    landlordRefusedAssignment: true,
    disputedTmiChargesCad: 4200,
    tenantBusinessName: 'Zen Yoga Studio Ltd.',
    landlordName: 'Commercial Holdings LP'
  });

  assert.equal(result.assignmentRights.landlordRefused, true);
  assert.ok(result.assignmentRights.statutoryGuidance.includes('CTA s. 23'));
  assert.ok(result.commercialDemandLetter.includes('Zen Yoga Studio Ltd.'));
  assert.ok(result.commercialDemandLetter.includes('Commercial Holdings LP'));
  assert.ok(result.commercialDemandLetter.includes('$4200.00 CAD'));
  assert.ok(result.commercialDemandLetter.includes('SECTION 23'));
});
