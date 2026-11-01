import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_C20_CONSTANTS,
  evaluateFederalReciprocalEmployment
} from '../src/federal-c20-reciprocal-employment-work-permit-navigator.js';

test('Federal C20 - Constants reflect IRPR s. 205(b)', () => {
  assert.equal(FEDERAL_C20_CONSTANTS.EXEMPTION_CODE, 'C20');
  assert.equal(FEDERAL_C20_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD, 230);
  assert.equal(FEDERAL_C20_CONSTANTS.WORK_PERMIT_PROCESSING_FEE_CAD, 155);
});

test('Federal C20 - Fully eligible academic faculty exchange with mutual parity', () => {
  const result = evaluateFederalReciprocalEmployment({
    exchangeCategory: 'ACADEMIC_EXCHANGE',
    hasFormalWrittenReciprocalAgreement: true,
    canadiansEnjoySimilarOpportunitiesAbroad: true,
    canadiansExchangedOutCount: 2,
    foreignWorkersIncomingCount: 2,
    isExchangeGeneralParityMaintained: true,
    isJobOfferFullTime: true,
    employerComplianceFeePaid: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_C20_RECIPROCAL_WORK_PERMIT');
  assert.equal(result.reciprocityMetrics.exchangeRatio, 1.0);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Federal C20 - Ineligible due to lack of written reciprocal agreement', () => {
  const result = evaluateFederalReciprocalEmployment({
    hasFormalWrittenReciprocalAgreement: false
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_NO_RECIPROCAL_AGREEMENT');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NO_FORMAL_RECIPROCAL_AGREEMENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'EXECUTE_BILATERAL_EXCHANGE_MEMORANDUM'));
});

test('Federal C20 - Flags one-way exchange imbalance where no Canadians go abroad', () => {
  const result = evaluateFederalReciprocalEmployment({
    hasFormalWrittenReciprocalAgreement: true,
    canadiansEnjoySimilarOpportunitiesAbroad: true,
    foreignWorkersIncomingCount: 5,
    canadiansExchangedOutCount: 0 // 0 Canadians abroad!
  });

  assert.ok(result.riskWarnings.some(w => w.warningType === 'ONE_WAY_EXCHANGE_IMBALANCE'));
});

test('Federal C20 - Ineligible if Canadians lack reciprocal foreign access', () => {
  const result = evaluateFederalReciprocalEmployment({
    hasFormalWrittenReciprocalAgreement: true,
    canadiansEnjoySimilarOpportunitiesAbroad: false
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_LACKS_RECIPROCITY_FOR_CANADIANS');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ABSENCE_OF_SIMILAR_OPPORTUNITIES_FOR_CANADIANS'));
});
