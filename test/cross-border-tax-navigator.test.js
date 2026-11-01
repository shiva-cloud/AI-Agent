import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CROSS_BORDER_CONSTANTS,
  SPECIFIED_FOREIGN_PROPERTY_RULES,
  evaluateCrossBorderTaxObligations,
  generateCrossBorderMemorandum,
  calculateForeignTaxCreditOptimization
} from '../src/cross-border-tax-navigator.js';

test('Cross-Border Tax Navigator — Statutory constants match CRA and IRS benchmarks', () => {
  assert.equal(CROSS_BORDER_CONSTANTS.CRA_T1135_COST_THRESHOLD_CAD, 100000);
  assert.equal(CROSS_BORDER_CONSTANTS.CRA_T1135_DETAILED_THRESHOLD_CAD, 250000);
  assert.equal(CROSS_BORDER_CONSTANTS.CRA_T1135_DAILY_PENALTY_CAD, 25);
  assert.equal(CROSS_BORDER_CONSTANTS.CRA_T1135_MAX_STANDARD_PENALTY_CAD, 2500);
  assert.equal(CROSS_BORDER_CONSTANTS.US_FBAR_AGGREGATE_THRESHOLD_USD, 10000);
  assert.equal(CROSS_BORDER_CONSTANTS.US_FORM_8938_EXPAT_SINGLE_YEAR_END_USD, 200000);

  assert.ok(SPECIFIED_FOREIGN_PROPERTY_RULES.INCLUDED.length > 0);
  assert.ok(SPECIFIED_FOREIGN_PROPERTY_RULES.EXCLUDED.length > 0);
});

test('Cross-Border Tax Navigator — Applies statutory first-year immigrant exemption under ITA s. 233.3(1)', () => {
  const result = evaluateCrossBorderTaxObligations({
    isCanadianTaxResident: true,
    taxYear: 2026,
    isFirstYearCanadianResident: true,
    foreignPropertyCostAmountCad: 350000,
    isUsPerson: false
  });

  assert.equal(result.craAudit.t1135Required, false);
  assert.equal(result.craAudit.firstYearExemptionApplied, true);
  assert.equal(result.craAudit.t1135Tier, 'none');
  assert.ok(result.craAudit.notes.some(n => n.includes('FIRST-YEAR IMMIGRANT EXEMPTION')));
});

test('Cross-Border Tax Navigator — Correctly differentiates Simplified vs Detailed T1135 reporting and computes late penalties', () => {
  // Simplified ($100k - $249k)
  const simplified = evaluateCrossBorderTaxObligations({
    isCanadianTaxResident: true,
    isFirstYearCanadianResident: false,
    foreignPropertyCostAmountCad: 150000
  });
  assert.equal(simplified.craAudit.t1135Required, true);
  assert.equal(simplified.craAudit.t1135Tier, 'simplified_part_a');

  // Detailed ($250k+) with 40 days late
  const detailed = evaluateCrossBorderTaxObligations({
    isCanadianTaxResident: true,
    isFirstYearCanadianResident: false,
    foreignPropertyCostAmountCad: 300000,
    daysLateT1135: 40
  });
  assert.equal(detailed.craAudit.t1135Required, true);
  assert.equal(detailed.craAudit.t1135Tier, 'detailed_part_b');
  assert.equal(detailed.craAudit.estimatedLatePenaltyCad, 1000); // 40 * $25
  assert.ok(detailed.riskFlags.some(r => r.includes('LATE T1135 FILING')));
});

test('Cross-Border Tax Navigator — Detects US Person FBAR FinCEN 114 and Form 8938 FATCA obligations', () => {
  const result = evaluateCrossBorderTaxObligations({
    isCanadianTaxResident: true,
    isFirstYearCanadianResident: false,
    foreignPropertyCostAmountCad: 50000, // below T1135 threshold
    isUsPerson: true,
    usFilingStatus: 'single',
    peakForeignAccountsUsd: 25000,
    yearEndForeignAccountsUsd: 18000
  });

  assert.equal(result.craAudit.t1135Required, false);
  assert.equal(result.irsAudit.fbarFinCen114Required, true);
  assert.equal(result.irsAudit.form8938Required, false); // below $200k expat threshold
  assert.ok(result.actionChecklist.some(a => a.item.includes('FinCEN Form 114')));
});

test('Cross-Border Tax Navigator — Flags PFIC traps on Canadian mutual funds/ETFs and TFSA/RESP foreign trust status for US Persons', () => {
  const result = evaluateCrossBorderTaxObligations({
    isCanadianTaxResident: true,
    isUsPerson: true,
    hasCanadianTfsa: true,
    hasCanadianResp: true,
    hasCanadianRrsp: true,
    hasCanadianFhsa: true,
    holdsCanadianMutualFundsOrEtfs: true
  });

  assert.equal(result.irsAudit.pficExposureWarning, true);
  assert.equal(result.irsAudit.foreignTrustWarning, true);
  assert.ok(result.riskFlags.some(r => r.includes('PFIC EXPOSURE')));
  assert.ok(result.riskFlags.some(r => r.includes('TFSA')));
  assert.ok(result.riskFlags.some(r => r.includes('RESP')));
  assert.ok(result.riskFlags.some(r => r.includes('FHSA')));
  assert.ok(result.irsAudit.notes.some(n => n.includes('TREATY PROTECTION (Article XVIII)')));

  const memo = generateCrossBorderMemorandum({
    clientName: 'Jane Smith',
    taxYear: 2026,
    craT1135Required: true,
    fbarRequired: true,
    pficExposure: true,
    tfsaWarning: true
  });
  assert.ok(memo.includes('CROSS-BORDER DUAL-JURISDICTION TAX COMPLIANCE MEMORANDUM'));
  assert.ok(memo.includes('Form T1135'));
  assert.ok(memo.includes('FinCEN Form 114'));
  assert.ok(memo.includes('PFIC'));
});

test('Cross-Border Tax Navigator — Optimizes US Form 1116 FTC and Treaty Article XXIV relief with excess credit carryforward', () => {
  const result = calculateForeignTaxCreditOptimization({
    cadGrossIncome: 120000,
    cadTaxesPaid: 36000,
    usSourceIncomeUsd: 0,
    cadToUsdRate: 0.74,
    filingStatus: 'single'
  });

  assert.equal(result.treatyArticleXxivProtection, true);
  assert.equal(result.irsForm1116.netUsTaxOwedUsd, 0);
  assert.ok(result.irsForm1116.allowableForeignTaxCreditUsd > 0);
  assert.ok(result.irsForm1116.excessFtcCarryforwardUsd > 0);
  assert.equal(result.irsForm1116.carryforwardPeriodYears, 10);
  assert.ok(result.strategicAdvisories.some(a => a.includes('DOUBLE TAXATION FULLY ELIMINATED')));
});
