// test/currency-exchange-navigator.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FINTRAC_STATUTORY_CONSTANTS,
  MID_MARKET_BENCHMARK_RATES,
  BROKERAGE_COMMISSIONS,
  evaluateCurrencyExchange
} from '../src/currency-exchange-navigator.js';

test('Cross-Border Banking & Currency Exchange Optimization Engine', async (t) => {
  await t.test('statutory constants match federal FINTRAC and PCMLTFA legislation', () => {
    assert.equal(FINTRAC_STATUTORY_CONSTANTS.EFTR_THRESHOLD_CAD, 10000);
    assert.equal(FINTRAC_STATUTORY_CONSTANTS.LCTR_THRESHOLD_CAD, 10000);
    assert.equal(FINTRAC_STATUTORY_CONSTANTS.AGGREGATION_WINDOW_HOURS, 24);
    assert.match(FINTRAC_STATUTORY_CONSTANTS.STRUCTURING_OFFENCE_STATUTE, /PCMLTFA s\. 75/);
    assert.ok(MID_MARKET_BENCHMARK_RATES.USD_TO_CAD > 1.30);
    assert.ok(BROKERAGE_COMMISSIONS.questrade.sellCommissionCad > 0);
    assert.equal(BROKERAGE_COMMISSIONS.nbdb.buyCommissionCad, 0);
  });

  await t.test('evaluates $50,000 USD to CAD conversion where Norbert\'s Gambit beats Big 5 bank', () => {
    const res = evaluateCurrencyExchange({
      amount: 50000,
      fromCurrency: 'USD',
      toCurrency: 'CAD',
      sourceOfFunds: 'savings_income',
      isSplitIntoMultipleTranches: false,
      brokeragePlatform: 'questrade'
    });

    assert.equal(res.corridor, 'USD to CAD');
    assert.equal(res.amount, 50000);
    assert.ok(res.cadEquivalentTotal >= 65000);
    assert.equal(res.bestOption.providerId, 'norberts_gambit');
    assert.ok(res.savingsVersusBig5Cad > 1500, `Expected savings > 1500 CAD, got ${res.savingsVersusBig5Cad}`);

    // Verify Norbert's Gambit blueprint
    assert.ok(res.norbertsGambitGuide);
    assert.equal(res.norbertsGambitGuide.isApplicable, true);
    assert.match(res.norbertsGambitGuide.tickerPair, /DLR\.U\.TO -> DLR\.TO/);
    assert.match(res.norbertsGambitGuide.settlementCycle, /T\+1/);
    assert.ok(res.norbertsGambitGuide.protocolSteps.length >= 5);
    assert.match(res.norbertsGambitGuide.brokerChatTemplate, /journal my shares/);
  });

  await t.test('detects FINTRAC reporting requirement for international transfers >= $10,000 CAD', () => {
    const res = evaluateCurrencyExchange({
      amount: 12000,
      fromCurrency: 'EUR',
      toCurrency: 'CAD',
      sourceOfFunds: 'property_sale'
    });

    assert.equal(res.fintracCompliance.isReportableFintrac, true);
    assert.ok(res.fintracCompliance.reportingRequirements.length >= 2);
    const eftr = res.fintracCompliance.reportingRequirements.find(r => r.form.includes('EFTR'));
    assert.ok(eftr);
    assert.match(eftr.statute, /PCMLTFA s\. 12\(1\)/);

    // Verify 24-hour aggregation requirement
    const agg = res.fintracCompliance.reportingRequirements.find(r => r.form.includes('24-Hour'));
    assert.ok(agg);

    // Verify property sale documents
    const deed = res.fintracCompliance.sourceOfFundsChecklist.find(d => d.document.includes('Deed of Sale'));
    assert.ok(deed);
    assert.equal(deed.mandatory, true);
  });

  await t.test('flags severe structuring / smurfing violation when funds are split into sub-$10,000 tranches', () => {
    // Newcomer splits $18,000 CAD equivalent into two $9,000 tranches to avoid reporting
    const res = evaluateCurrencyExchange({
      amount: 18000,
      fromCurrency: 'CAD',
      toCurrency: 'CAD',
      isSplitIntoMultipleTranches: true,
      trancheCount: 2
    });

    assert.equal(res.fintracCompliance.structuringRisk.hasStructuringRisk, true);
    assert.equal(res.fintracCompliance.structuringRisk.severity, 'CRITICAL_LEGAL_RISK');
    assert.match(res.fintracCompliance.structuringRisk.warningMessage, /CRITICAL STATUTORY WARNING/);
    assert.match(res.fintracCompliance.structuringRisk.warningMessage, /PCMLTFA s\. 75/);
    assert.match(res.fintracCompliance.structuringRisk.warningMessage, /Suspicious Transaction Report/);
  });

  await t.test('verifies family gift source-of-funds documentary checklist', () => {
    const res = evaluateCurrencyExchange({
      amount: 25000,
      fromCurrency: 'INR',
      toCurrency: 'CAD',
      sourceOfFunds: 'family_gift'
    });

    const giftDeed = res.fintracCompliance.sourceOfFundsChecklist.find(d => d.document.includes('Gift'));
    assert.ok(giftDeed);
    assert.match(giftDeed.purpose, /zero repayment obligation/);

    const donorId = res.fintracCompliance.sourceOfFundsChecklist.find(d => d.document.includes('Donor'));
    assert.ok(donorId);
  });

  await t.test('evaluates cross-border US-Canada banking guidance when USD is involved', () => {
    const res = evaluateCurrencyExchange({
      amount: 15000,
      fromCurrency: 'USD',
      toCurrency: 'CAD',
      hasCrossBorderAccount: true
    });

    assert.ok(res.crossBorderBankingGuidance.length >= 2);
    const cb = res.crossBorderBankingGuidance.find(g => g.title.includes('Cross-Border'));
    assert.ok(cb);
    assert.match(cb.description, /TD Bank N\.A\.|RBC Bank USA/);
  });
});
