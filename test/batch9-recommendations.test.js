import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeZeroPII } from '../src/community-translation-ledger.js';
import { evaluateIdentityHarmonization } from '../src/identity-harmonization.js';
import { evaluateCustomsDeclaration } from '../src/customs-declaration.js';
import { evaluateBankingAndCreditStrategy } from '../src/banking-navigator.js';
import { evaluateCitizenshipEligibility } from '../src/citizenship-navigator.js';
import { requiredSettlementFunds, evaluateProofOfFunds } from '../src/proof-of-funds.js';
import { pollSource } from '../src/realtime-crawler.js';
import { evaluateVehicleImportation } from '../src/vehicle-importation.js';
import { evaluateEiRegularBenefits, evaluateEiParentalAndSicknessBenefits } from '../src/ei-benefits-navigator.js';
import { evaluateWorkplaceSafetyAndRefusal } from '../src/workplace-safety-navigator.js';
import { calculateProratedBpa, evaluateForeignAssetReporting } from '../src/tax-treaty-engine.js';
import { evaluateFcrMicroLoans } from '../src/fcr-healthcare-bridge-navigator.js';
import { evaluateCommercialLease } from '../src/commercial-lease-navigator.js';
import { evaluateAlbertaRuralEntrepreneur } from '../src/alberta-alep-rural-entrepreneur-stream-navigator.js';
import { auditStatutoryPayAndWages } from '../src/statutory-pay-calculator.js';

test('Rec 201: Privacy Masking Expansion — Redacts Postal Codes and Provincial Health Numbers', () => {
  const rawText = 'My address is in M5V 2T6, OHIP card is 1234-567-890-AB, email is john@example.com, SIN 123-456-789';
  const clean = sanitizeZeroPII(rawText);
  assert.ok(clean.includes('[REDACTED_POSTAL_CODE]'), 'Postal code should be masked');
  assert.ok(clean.includes('[REDACTED_HEALTH_CARD]'), 'Health card should be masked');
  assert.ok(clean.includes('[REDACTED_EMAIL]'), 'Email should be masked');
  assert.ok(clean.includes('[REDACTED_IDENTIFIER]'), 'SIN should be masked');
  assert.ok(!clean.includes('M5V 2T6'));
  assert.ok(!clean.includes('1234-567-890-AB'));
});

test('Rec 202: Identity Harmonization Guard — Sanitizes months in province and avoids absolute overclaims', () => {
  const result = evaluateIdentityHarmonization({
    monthsLivedInProvince: 'invalid',
    discrepancyType: 'spelling_typo_on_permit',
    documentsShowingDiscrepancy: Array(100).fill('doc_sample')
  });
  assert.equal(result.monthsLivedInProvince, 0);
  assert.equal(result.isProvincialNameChangeEligible, false);
  const actionText = result.actionChecklist[0].action;
  assert.ok(!actionText.includes('100% free'), 'Should not use absolute promise');
  assert.ok(actionText.includes('There is no statutory government processing fee'));
});

test('Rec 203: Customs Declaration Protection — Sanitizes non-finite currency and bounds manifests', () => {
  const result = evaluateCustomsDeclaration({
    currencyCad: 'not-a-number',
    items: Array(150).fill({ description: 'Book', valueCad: 'NaN', ownedMonths: 'invalid' }),
    vehicle: { valueCad: 'bad', year: 'invalid' }
  });
  assert.equal(result.currencyCompliance.amountCad, 0);
  assert.equal(result.financialAudit.totalDeclaredValueCad, 0);
  assert.ok(result.bsf186Manifest.accompanyingGoods.length <= 100);
});

test('Rec 204: Banking Credit Guard — Bounds monthly spending and credit score targets safely', () => {
  const result = evaluateBankingAndCreditStrategy({
    monthlySpendingCad: 'bad',
    targetCreditScore: 999
  });
  assert.equal(result.monthlySpendingCad, 600);
  assert.equal(result.targetCreditScore, 850);
});

test('Rec 205: Citizenship Presence Guard — Resilient to malformed dates and non-finite inputs', () => {
  const result = evaluateCitizenshipEligibility({
    applicationDate: 'invalid-date',
    prLandingDate: 'invalid-date',
    prePrDaysPresent: 'not-a-number',
    applicantAge: 'bad',
    languageProofType: 'none'
  });
  assert.equal(typeof result.physicalPresenceAudit.totalCreditedDays, 'number');
  assert.ok(Number.isFinite(result.physicalPresenceAudit.totalCreditedDays));
  assert.equal(result.languageAudit.status, 'proof_required');
});

test('Rec 206: Proof of Funds Family Sizing Guard — Protects against negative or non-finite inputs', () => {
  assert.equal(requiredSettlementFunds('invalid'), 15263);
  assert.equal(requiredSettlementFunds(-5), 15263);
  const evaluation = evaluateProofOfFunds({ familySize: 'bad', availableFundsCad: 'invalid' });
  assert.equal(evaluation.familySize, 1);
  assert.equal(evaluation.availableFundsCad, 0);
  assert.equal(evaluation.requiredCad, 15263);
  assert.equal(evaluation.meetsRequirement, false);
});

test('Rec 207: Crawler Content-Type Guard — Returns structured unsupported_binary on PDF response', async () => {
  const result = await pollSource(
    { id: 'test-source', url: 'https://example.com/gazette.pdf' },
    null,
    {
      fetcher: async () => ({
        status: 200,
        ok: true,
        text: '%PDF-1.4 test data',
        headers: { get: (h) => (h === 'content-type' ? 'application/pdf' : null) }
      })
    }
  );
  assert.equal(result.status, 'unsupported_binary');
  assert.equal(result.changed, false);
  assert.ok(result.error.includes('application/pdf'));
});

test('Rec 209: Vehicle Importation Numeric Safety — Sanitizes vehicle model year and green levy efficiency', () => {
  const result = evaluateVehicleImportation({
    vehicleModelYear: 'not-a-year',
    estimatedVehicleValueCad: 'bad',
    fuelEfficiencyLitersPer100Km: 'invalid'
  });
  assert.equal(result.vehicleModelYear, 2021);
  assert.equal(result.costAndTaxAudit.estimatedVehicleValueCad, 25000);
  assert.equal(result.costAndTaxAudit.greenLevyCad, 0);
});

test('Rec 210: EI Benefits Protection — Normalizes non-finite hours and unemployment rate safely', () => {
  const regResult = evaluateEiRegularBenefits({
    insurableHoursAccrued: 'invalid',
    regionalUnemploymentRatePercent: 40,
    averageWeeklyInsurableEarningsCad: 'bad'
  });
  assert.equal(regResult.insurableHoursAccrued, 650);
  assert.equal(regResult.regionalUnemploymentRatePercent, 30);
  assert.equal(regResult.estimatedWeeklyBenefitCad, 605);

  const specialResult = evaluateEiParentalAndSicknessBenefits({
    benefitType: 'sickness',
    insurableHoursAccrued: 'bad',
    averageWeeklyEarningsCad: 'invalid'
  });
  assert.equal(specialResult.isEligible, true);
  assert.equal(specialResult.weeklyRateCad, 660);
});

test('Rec 211: Workplace Safety Date & Boundary Audit — Clamps monthsSinceInjury to non-negative numbers', () => {
  const result = evaluateWorkplaceSafetyAndRefusal({
    isWorkplaceInjury: true,
    netAverageMonthlyEarningsCad: 'invalid',
    injuryDate: '2026-12-01',
    assessmentDate: '2026-10-31'
  });
  assert.equal(result.compensationAudit.monthsSinceInjury, 0);
  assert.equal(result.compensationAudit.estimatedMonthlyLoeCad, 0);
  assert.equal(result.compensationAudit.claimWithinLimitation, true);
});

test('Rec 212: Tax Treaty & Proration Bounds — Resilient to invalid date strings and non-finite BPA', () => {
  const bpaResult = calculateProratedBpa({ entryDateStr: 'invalid-date', annualBpa: 'bad' });
  assert.equal(bpaResult.year, 2026);
  assert.equal(bpaResult.annualBpa, 15705);
  assert.ok(bpaResult.proratedBpa > 0);
  assert.ok(Number.isFinite(bpaResult.proratedBpa));

  const fbarResult = evaluateForeignAssetReporting({ assetsUSD: 'bad', bankBalanceUSD: 'bad' });
  assert.equal(fbarResult.statusBadge, 'FIRST-YEAR EXEMPT');
});

test('Rec 213: FCR Micro-Loans — Bounds credit scores and requested funding', () => {
  const result = evaluateFcrMicroLoans({
    currentCreditScore: 'invalid',
    fundingRequiredCad: 'bad'
  });
  assert.equal(result.currentCreditScore, 640);
  assert.equal(result.fundingRequestedCad, 12000);
  assert.equal(result.isEligibleForFcrLoans, true);
});

test('Rec 214: Commercial Lease, Rural Entrepreneur & Statutory Pay Guards', () => {
  const leaseResult = evaluateCommercialLease({
    baseRentMonthlyCad: 'bad',
    additionalRentMonthlyCad: 'invalid',
    squareFootage: 'bad',
    daysRentOverdue: 'bad',
    isRentOverdue: true
  });
  assert.equal(leaseResult.financialOverview.grossMonthlyRentCad, 0);
  assert.equal(leaseResult.distraintDoctrine.isAvailableToLandlord, false);

  const aaipResult = evaluateAlbertaRuralEntrepreneur({
    netWorthCad: 'invalid',
    plannedInvestmentCad: 'bad',
    plannedOwnershipPercentage: 150,
    clbScore: 'invalid'
  });
  assert.equal(aaipResult.financialAudit.plannedOwnershipPercentage, 100);
  assert.ok(aaipResult.disqualifications.some(d => d.criterion === 'LANGUAGE_DEFICIENCY'));

  const payResult = auditStatutoryPayAndWages({
    grossHourlyWageCad: 'bad',
    hoursWorkedInPayPeriod: 'invalid',
    weeklyHoursArray: ['bad', 50]
  });
  assert.equal(payResult.hourlyRateCad, 0);
  assert.equal(payResult.hoursAudit.totalHours, 0);
  assert.equal(payResult.hoursAudit.overtimeHours, 6);
});
