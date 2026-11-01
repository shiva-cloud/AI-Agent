import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASSIGNMENT_CONSTANTS,
  PRESCRIBED_LIFE_EVENT_EXEMPTIONS,
  evaluateRealEstateAssignment,
  generateAssignmentStatement
} from '../src/real-estate-assignment-navigator.js';

test('Real Estate Assignment Navigator — Constants reflect ETA and ITA statutory standards', () => {
  assert.equal(ASSIGNMENT_CONSTANTS.ANTI_FLIPPING_HOLDING_DAYS, 365);
  assert.equal(ASSIGNMENT_CONSTANTS.GST_RATE_PERCENT, 5.0);
  assert.equal(ASSIGNMENT_CONSTANTS.ONTARIO_HST_RATE_PERCENT, 13.0);
  assert.equal(ASSIGNMENT_CONSTANTS.TARION_DAILY_DELAY_COMPENSATION_CAD, 150.0);
  assert.equal(ASSIGNMENT_CONSTANTS.TARION_MAX_DELAY_COMPENSATION_CAD, 7500.0);
  assert.equal(ASSIGNMENT_CONSTANTS.RELOCATION_MINIMUM_DISTANCE_KM, 40.0);

  assert.ok(PRESCRIBED_LIFE_EVENT_EXEMPTIONS.death);
  assert.ok(PRESCRIBED_LIFE_EVENT_EXEMPTIONS.employment_relocation);
});

test('Real Estate Assignment Navigator — Applies 100% business income anti-flipping rule for holding under 365 days', () => {
  const result = evaluateRealEstateAssignment({
    province: 'ON',
    originalPurchasePriceCad: 600000,
    assignmentSalePriceCad: 720000,
    depositPaidToBuilderCad: 120000,
    agreementDate: '2025-11-01',
    assignmentDate: '2026-05-01', // ~181 days
    builderConsentFeeCad: 5000,
    legalFeesCad: 2500,
    realtorCommissionCad: 12500,
    marginalTaxRatePercent: 40.0
  });

  // Gross lift: 120,000
  // Expenses: 5000 + 2500 + 12500 = 20,000
  // Net profit: 100,000
  assert.equal(result.financialSummary.grossAssignmentLiftCad, 120000);
  assert.equal(result.financialSummary.netAssignmentProfitCad, 100000);
  assert.equal(result.antiFlippingAudit.antiFlippingApplies, true);
  assert.equal(result.antiFlippingAudit.taxableInclusionPercentage, 100.0);
  assert.equal(result.taxLiabilityEstimate.estimatedIncomeTaxCad, 40000); // 100k * 40%
  assert.equal(result.taxLiabilityEstimate.estimatedGstHstOnLiftCad, 15600); // 120k * 13%
  assert.ok(result.taxNotes.some(t => t.includes('ANTI-FLIPPING PENALTY')));
});

test('Real Estate Assignment Navigator — Exempts taxpayer with prescribed life event (employment relocation >= 40km)', () => {
  const result = evaluateRealEstateAssignment({
    province: 'ON',
    originalPurchasePriceCad: 500000,
    assignmentSalePriceCad: 600000,
    agreementDate: '2026-01-01',
    assignmentDate: '2026-06-01', // ~151 days
    hasPrescribedLifeEvent: true,
    lifeEventCategory: 'employment_relocation',
    relocationDistanceKm: 75, // >= 40km
    builderConsentFeeCad: 0,
    legalFeesCad: 0,
    realtorCommissionCad: 0,
    marginalTaxRatePercent: 40.0
  });

  assert.equal(result.antiFlippingAudit.antiFlippingApplies, false);
  assert.equal(result.antiFlippingAudit.taxableInclusionPercentage, 50.0);
  assert.ok(result.antiFlippingAudit.exemptionReason.includes('Exempt from anti-flipping'));
  // Capital gains 50% inclusion: 100k profit -> 50k taxable * 40% = 20,000 tax
  assert.equal(result.taxLiabilityEstimate.estimatedIncomeTaxCad, 20000);
});

test('Real Estate Assignment Navigator — Calculates Tarion delayed closing warranty compensation capped at $7,500', () => {
  const result = evaluateRealEstateAssignment({
    province: 'ON',
    closingDelayedDays: 60,
    isTarionEnrolled: true
  });

  assert.equal(result.tarionWarranty.tarionEligible, true);
  assert.equal(result.tarionWarranty.closingDelayedDays, 60);
  // 60 days * $150 = 9000, capped at 7500
  assert.equal(result.tarionWarranty.estimatedDelayCompensationCad, 7500);

  const statement = generateAssignmentStatement({
    assignorName: 'David Lee',
    assigneeName: 'Emma Watson',
    propertyAddress: '100 King St W, Toronto',
    netProfitCad: 80000,
    gstHstCad: 10400,
    antiFlippingApplies: true
  });

  assert.ok(statement.includes('REAL ESTATE ASSIGNMENT SALE TAX'));
  assert.ok(statement.includes('David Lee'));
  assert.ok(statement.includes('Full Amount Deemed Business Income'));
  assert.ok(statement.includes('Tarion Statement of Critical Dates'));
});
