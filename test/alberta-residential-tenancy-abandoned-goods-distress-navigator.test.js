import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_ABANDONED_GOODS_CONSTANTS,
  evaluateAlbertaAbandonedGoods
} from '../src/alberta-residential-tenancy-abandoned-goods-distress-navigator.js';

test('Alberta Abandoned Goods - Constants reflect RTA s. 31 and Alta. Reg. 211/2004', () => {
  assert.equal(ALBERTA_ABANDONED_GOODS_CONSTANTS.STATUTORY_VALUATION_THRESHOLD_CAD, 2000);
  assert.equal(ALBERTA_ABANDONED_GOODS_CONSTANTS.MANDATORY_STORAGE_PERIOD_DAYS, 30);
  assert.equal(ALBERTA_ABANDONED_GOODS_CONSTANTS.STATUTORY_SURPLUS_REMITTANCE_WINDOW_DAYS, 30);
});

test('Alberta Abandoned Goods - Goods valued under $2,000 may be disposed of immediately', () => {
  const result = evaluateAlbertaAbandonedGoods({
    estimatedMarketValueCad: 800,
    daysSinceLandlordTookPossession: 2,
    hasPreparedItemizedInventory: true
  });

  assert.equal(result.isAbove2000Threshold, false);
  assert.equal(result.complianceStatus, 'COMPLIANT_STATUTORY_STORAGE_ACTIVE');
  assert.equal(result.statutoryViolations.length, 0);
});

test('Alberta Abandoned Goods - Detects unlawful disposal before 30 days for goods over $2,000', () => {
  const result = evaluateAlbertaAbandonedGoods({
    estimatedMarketValueCad: 4500,
    daysSinceLandlordTookPossession: 10,
    landlordDisposedBefore30Days: true // Disposed on day 10!
  });

  assert.equal(result.isAbove2000Threshold, true);
  assert.equal(result.complianceStatus, 'UNLAWFUL_ABANDONED_GOODS_PRACTICE');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_PREMATURE_DISPOSAL_OF_ABANDONED_GOODS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_RTDRS_DAMAGES_CLAIM_FOR_CONVERSION'));
});

test('Alberta Abandoned Goods - Detects unlawful withholding for rent arrears under s. 31(6)', () => {
  const result = evaluateAlbertaAbandonedGoods({
    estimatedMarketValueCad: 3000,
    daysSinceLandlordTookPossession: 12,
    landlordRefusedReleaseWithoutRentArrears: true, // Demanded rent!
    accruedStorageAndMovingCostsCad: 150,
    unpaidRentArrearsCad: 2200
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_ABANDONED_GOODS_PRACTICE');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_WITHHOLDING_OF_TENANT_PROPERTY'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'DEMAND_IMMEDIATE_RETURN_UPON_STORAGE_FEE_TENDER'));
});

test('Alberta Abandoned Goods - Calculates auction surplus payable to Minister', () => {
  const result = evaluateAlbertaAbandonedGoods({
    estimatedMarketValueCad: 5000,
    daysSinceLandlordTookPossession: 35,
    accruedStorageAndMovingCostsCad: 400,
    unpaidRentArrearsCad: 1600,
    auctionProceedsRealizedCad: 4500
  });

  // Gross $4,500 - $400 storage = $4,100; - $1,600 rent = $2,500 surplus to Minister
  assert.equal(result.financialSummary.netSurplusPayableToMinisterCad, 2500);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'SURPLUS_FUNDS_DUE_TO_CROWN'));
});
