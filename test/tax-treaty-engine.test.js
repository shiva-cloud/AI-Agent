// test/tax-treaty-engine.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DTAA_MATRIX,
  evaluateForeignAssetReporting,
  calculateProratedBpa,
  evaluatePensionPortability
} from '../src/tax-treaty-engine.js';

test('DTAA_MATRIX contains verified bilateral treaty rates for major corridors', () => {
  assert.ok(DTAA_MATRIX.India.Canada);
  assert.equal(DTAA_MATRIX.India.Canada.interest, '15%');
  assert.match(DTAA_MATRIX.India.Canada.treatyArticle, /India-Canada DTAA/);

  assert.ok(DTAA_MATRIX['United States'].Canada);
  assert.equal(DTAA_MATRIX['United States'].Canada.interest, '0%');
  assert.equal(DTAA_MATRIX['United States'].Canada.dividends, '15%');
});

test('evaluateForeignAssetReporting correctly enforces CRA T1135 first-year exemption', () => {
  // Scenario 1: First-year arrival with $250,000 USD foreign assets is EXEMPT from Form T1135
  const firstYear = evaluateForeignAssetReporting({
    origin: 'India',
    dest: 'Canada',
    assetsUSD: 250000,
    firstYear: true
  });
  assert.equal(firstYear.statusBadge, 'FIRST-YEAR EXEMPT');
  assert.equal(firstYear.mandatoryFiling, false);
  assert.match(firstYear.triggerDesc, /exempt from filing form t1135/i);

  // Scenario 2: Year 2 arrival with $250,000 USD foreign assets MUST FILE Form T1135
  const yearTwo = evaluateForeignAssetReporting({
    origin: 'India',
    dest: 'Canada',
    assetsUSD: 250000,
    firstYear: false
  });
  assert.equal(yearTwo.statusBadge, 'MANDATORY DISCLOSURE');
  assert.equal(yearTwo.mandatoryFiling, true);
  assert.match(yearTwo.triggerDesc, /exceeding the cad \$100,000 threshold/i);

  // Scenario 3: Year 2 arrival with $50,000 USD ($68,000 CAD) is BELOW THRESHOLD
  const belowThreshold = evaluateForeignAssetReporting({
    origin: 'India',
    dest: 'Canada',
    assetsUSD: 50000,
    firstYear: false
  });
  assert.equal(belowThreshold.statusBadge, 'BELOW THRESHOLD');
  assert.equal(belowThreshold.mandatoryFiling, false);
});

test('evaluateForeignAssetReporting enforces US FinCEN 114 (FBAR) $10,000 threshold', () => {
  const overFbar = evaluateForeignAssetReporting({
    dest: 'United States',
    bankBalanceUSD: 14000
  });
  assert.equal(overFbar.statusBadge, 'MANDATORY FBAR');
  assert.equal(overFbar.mandatoryFiling, true);
  assert.match(overFbar.triggerDesc, /exceeds the usd \$10,000 aggregate threshold/i);

  const underFbar = evaluateForeignAssetReporting({
    dest: 'United States',
    bankBalanceUSD: 7500
  });
  assert.equal(underFbar.statusBadge, 'BELOW FBAR THRESHOLD');
  assert.equal(underFbar.mandatoryFiling, false);
});

test('calculateProratedBpa accurately prorates Basic Personal Amount for mid-year landing', () => {
  // Landing exactly mid-year: July 2, 2026 (183 days resident out of 365)
  const result = calculateProratedBpa({
    entryDateStr: '2026-07-02',
    annualBpa: 15705
  });
  assert.equal(result.year, 2026);
  assert.ok(result.daysResident > 180 && result.daysResident < 185);
  assert.ok(result.ratio >= 0.49 && result.ratio <= 0.51);
  assert.ok(result.proratedBpa >= 7700 && result.proratedBpa <= 8000);
  assert.match(result.statutoryRule, /CRA Income Tax Act s\.118\(1\)/);
});

test('evaluatePensionPortability specifies Canada-US Treaty Art. XVIII rollover rights', () => {
  const usToCa = evaluatePensionPortability({ origin: 'United States', dest: 'Canada', planType: '401k' });
  assert.equal(usToCa.eligible, true);
  assert.match(usToCa.protocol, /Canada-US Tax Treaty Article XVIII/);
  assert.match(usToCa.mechanism, /RRSP as a qualifying transfer under ITA s\.60\(j\)/);
});
