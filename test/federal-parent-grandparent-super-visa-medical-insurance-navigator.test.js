import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_SUPER_VISA_CONSTANTS,
  evaluateFederalSuperVisaInsuranceLico
} from '../src/federal-parent-grandparent-super-visa-medical-insurance-navigator.js';

test('Federal Super Visa - Constants reflect IRPA s. 15(1) & LICO 2024', () => {
  assert.equal(FEDERAL_SUPER_VISA_CONSTANTS.MAX_INITIAL_STAY_YEARS, 5);
  assert.equal(FEDERAL_SUPER_VISA_CONSTANTS.MIN_MEDICAL_INSURANCE_COVERAGE_CAD, 100000);
  assert.equal(FEDERAL_SUPER_VISA_CONSTANTS.MIN_INSURANCE_VALIDITY_DAYS, 365);
  assert.equal(FEDERAL_SUPER_VISA_CONSTANTS.LICO_BENCHMARK_2024[4], 54594);
});

test('Federal Super Visa - Fully compliant sponsor with $65k income and $100k insurance', () => {
  const result = evaluateFederalSuperVisaInsuranceLico({
    medicalInsuranceCoverageCad: 100000,
    insurancePolicyValidityDays: 365,
    insuranceFromApprovedProvider: true,
    proofOfInsurancePaymentProvided: true,
    completedUpfrontImeMedicalExam: true,
    sponsorAnnualIncomeCad: 65000,
    householdSizeIncludingApplicants: 4 // LICO is $54,594
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_SUPER_VISA');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.financialSummary.incomeDeficitCad, 0);
  assert.equal(result.maxStayPerEntryYears, 5);
});

test('Federal Super Visa - Ineligible with only $50,000 insurance coverage', () => {
  const result = evaluateFederalSuperVisaInsuranceLico({
    medicalInsuranceCoverageCad: 50000,
    sponsorAnnualIncomeCad: 65000
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_FOR_SUPER_VISA');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'SUBSTANDARD_MEDICAL_INSURANCE_COVERAGE'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'UPGRADE_INSURANCE_POLICY_TO_100K'));
});

test('Federal Super Visa - Ineligible sponsor below LICO threshold', () => {
  // Household size 4 needs $54,594. Sponsor makes $45,000.
  const result = evaluateFederalSuperVisaInsuranceLico({
    householdSizeIncludingApplicants: 4,
    sponsorAnnualIncomeCad: 45000
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.financialSummary.incomeDeficitCad, 9594);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'SPONSOR_INCOME_BELOW_LICO_THRESHOLD'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'ADD_CO_SIGNING_SPOUSE_INCOME'));
});

test('Federal Super Visa - Ineligible missing upfront IME medical exam', () => {
  const result = evaluateFederalSuperVisaInsuranceLico({
    completedUpfrontImeMedicalExam: false
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'MISSING_UPFRONT_IMMIGRATION_MEDICAL_EXAMINATION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'BOOK_PANEL_PHYSICIAN_IME_EXAM'));
});
