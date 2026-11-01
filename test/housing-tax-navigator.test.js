import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateHomebuyerEligibility,
  calculateOntarioLandTransferTax,
  calculateTorontoMunicipalLtt,
  calculateMinimumDownPaymentCad
} from '../src/housing-tax-navigator.js';

test('calculateMinimumDownPaymentCad: adheres to official Canadian Bank Act down payment tiers', () => {
  // <= 500k: 5%
  assert.equal(calculateMinimumDownPaymentCad(400000), 20000);
  assert.equal(calculateMinimumDownPaymentCad(500000), 25000);

  // 500k to 999,999: 5% on first 500k + 10% on remainder
  assert.equal(calculateMinimumDownPaymentCad(750000), 25000 + 25000); // 50,000
  assert.equal(calculateMinimumDownPaymentCad(800000), 25000 + 30000); // 55,000

  // >= 1M: 20%
  assert.equal(calculateMinimumDownPaymentCad(1000000), 200000);
  assert.equal(calculateMinimumDownPaymentCad(1500000), 300000);
});

test('calculateOntarioLandTransferTax and calculateTorontoMunicipalLtt: compute graduated brackets', () => {
  const tax = calculateOntarioLandTransferTax(800000);
  // Brackets:
  // 55k * 0.5% = 275
  // (250k - 55k) * 1.0% = 1950
  // (400k - 250k) * 1.5% = 2250
  // (800k - 400k) * 2.0% = 8000
  // Total = 275 + 1950 + 2250 + 8000 = 12475
  assert.equal(tax, 12475);
  assert.equal(calculateTorontoMunicipalLtt(800000), 12475);
});

test('evaluateHomebuyerEligibility: Permanent Resident in Toronto is exempt from federal ban and NRST', () => {
  const result = evaluateHomebuyerEligibility({
    purchasePriceCad: 800000,
    province: 'ON',
    city: 'Toronto',
    immigrationStatus: 'pr',
    isFirstTimeHomeBuyer: true
  });

  assert.equal(result.federalBanAssessment.isLegallyPermittedToBuy, true);
  assert.equal(result.federalBanAssessment.statutoryStatus, 'exempt_pr');
  assert.equal(result.provincialTaxAssessment.upfrontNonResidentTaxCad, 0);
  assert.equal(result.closingTaxesAndRebates.firstTimeHomeBuyerRebateCad, 4000 + 4475); // 8,475
  assert.equal(result.financialClosingSummary.minimumDownPaymentCad, 55000);
});

test('evaluateHomebuyerEligibility: Work permit holder with 183+ days qualifies under SOR/2023-66 and tracks 4-year NRST rebate', () => {
  const result = evaluateHomebuyerEligibility({
    purchasePriceCad: 800000,
    province: 'ON',
    city: 'Mississauga',
    immigrationStatus: 'work_permit',
    workPermitDaysRemaining: 300,
    hasPurchasedPreviousResidentialPropertyInCanada: false,
    willOccupyAsPrincipalResidenceWithin60Days: true
  });

  assert.equal(result.federalBanAssessment.isLegallyPermittedToBuy, true);
  assert.equal(result.federalBanAssessment.statutoryStatus, 'exempt_work_permit');
  assert.equal(result.provincialTaxAssessment.ratePercent, 25);
  assert.equal(result.provincialTaxAssessment.upfrontNonResidentTaxCad, 200000); // 25% of 800k
  assert.equal(result.provincialTaxAssessment.isEligibleForStatutoryRebate, true);
  assert.equal(result.provincialTaxAssessment.potentialRebateAmountCad, 200000);
  assert.ok(result.provincialTaxAssessment.rebateConditions.some(c => c.includes('4 calendar years')));
  assert.ok(result.provincialTaxAssessment.rebateConditions.some(c => c.includes('60 days')));
});

test('evaluateHomebuyerEligibility: Work permit holder with under 183 days is prohibited under federal law', () => {
  const result = evaluateHomebuyerEligibility({
    purchasePriceCad: 700000,
    province: 'ON',
    immigrationStatus: 'work_permit',
    workPermitDaysRemaining: 120, // Under 183 days
    hasPurchasedPreviousResidentialPropertyInCanada: false
  });

  assert.equal(result.federalBanAssessment.isLegallyPermittedToBuy, false);
  assert.equal(result.federalBanAssessment.statutoryStatus, 'prohibited');
  assert.ok(result.federalBanAssessment.legalRiskNotice.includes('STRICTLY PROHIBITED'));
  assert.ok(result.federalBanAssessment.legalRiskNotice.includes('$10,000 fine'));
});

test('evaluateHomebuyerEligibility: Work permit holder who already bought 1 property is prohibited', () => {
  const result = evaluateHomebuyerEligibility({
    purchasePriceCad: 600000,
    province: 'ON',
    immigrationStatus: 'work_permit',
    workPermitDaysRemaining: 400,
    hasPurchasedPreviousResidentialPropertyInCanada: true // Disqualifier
  });

  assert.equal(result.federalBanAssessment.isLegallyPermittedToBuy, false);
  assert.equal(result.federalBanAssessment.statutoryStatus, 'prohibited');
});

test('evaluateHomebuyerEligibility: Study permit holder qualifies if 5 years taxes filed and price <= 500k', () => {
  const resultEligible = evaluateHomebuyerEligibility({
    purchasePriceCad: 480000,
    province: 'ON',
    immigrationStatus: 'study_permit',
    studyPermitYearsTaxFiled: 5,
    studyPermitDaysPresentPerYear: 260
  });

  assert.equal(resultEligible.federalBanAssessment.isLegallyPermittedToBuy, true);
  assert.equal(resultEligible.federalBanAssessment.statutoryStatus, 'exempt_study_permit');

  // If price exceeds 500k, disqualified under SOR/2022-250 s.3(1)(b)(iii)
  const resultOverPrice = evaluateHomebuyerEligibility({
    purchasePriceCad: 550000,
    province: 'ON',
    immigrationStatus: 'study_permit',
    studyPermitYearsTaxFiled: 5,
    studyPermitDaysPresentPerYear: 260
  });

  assert.equal(resultOverPrice.federalBanAssessment.isLegallyPermittedToBuy, false);
  assert.equal(resultOverPrice.federalBanAssessment.statutoryStatus, 'prohibited');
});

test('evaluateHomebuyerEligibility: Alberta purchase incurs 0% provincial foreign tax', () => {
  const result = evaluateHomebuyerEligibility({
    purchasePriceCad: 500000,
    province: 'AB',
    city: 'Calgary',
    immigrationStatus: 'pr'
  });

  assert.equal(result.provincialTaxAssessment.ratePercent, 0);
  assert.equal(result.provincialTaxAssessment.upfrontNonResidentTaxCad, 0);
});
