import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_C10_CONSTANTS,
  evaluateFederalC10SignificantBenefit
} from '../src/federal-c10-significant-benefit-work-permit-navigator.js';

test('Federal C10 - Constants reflect IRPR s. 205(a)', () => {
  assert.equal(FEDERAL_C10_CONSTANTS.EXEMPTION_CODE, 'C10');
  assert.equal(FEDERAL_C10_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD, 230);
  assert.equal(FEDERAL_C10_CONSTANTS.WORK_PERMIT_FEE_CAD, 155);
});

test('Federal C10 - High-scoring eligible candidate with jobs, endorsements, and awards', () => {
  const result = evaluateFederalC10SignificantBenefit({
    benefitCategory: 'ECONOMIC',
    createsDirectJobsForCanadiansOrPrs: true,
    projectedCanadianJobsCreatedCount: 5,
    hasOfficialSupportFromCanadianGovernmentOrBody: true,
    independentExpertTestimonialLettersCount: 4,
    hasDocumentedRecordOfDistinguishedAchievement: true,
    hasDetailedCanadianBusinessOrWorkPlan: true,
    employerComplianceFeePaid: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'HIGH_EVIDENTIARY_BENEFIT_ESTABLISHED');
  assert.equal(result.strengthScoreOutOf100, 100);
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.evidentiaryGaps.length, 0);
});

test('Federal C10 - Weak application lacking Canadian endorsement and achievements', () => {
  const result = evaluateFederalC10SignificantBenefit({
    benefitCategory: 'ECONOMIC',
    hasOfficialSupportFromCanadianGovernmentOrBody: false,
    hasDocumentedRecordOfDistinguishedAchievement: false,
    independentExpertTestimonialLettersCount: 1,
    createsDirectJobsForCanadiansOrPrs: false
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INSUFFICIENT_EVIDENCE_OF_SIGNIFICANT_BENEFIT');
  assert.ok(result.evidentiaryGaps.some(g => g.gapType === 'LACK_OF_DISTINGUISHED_ACHIEVEMENT_EVIDENCE'));
  assert.ok(result.evidentiaryGaps.some(g => g.gapType === 'NO_CANADIAN_INSTITUTIONAL_ENDORSEMENT'));
});

test('Federal C10 - Missing business plan triggers statutory violation', () => {
  const result = evaluateFederalC10SignificantBenefit({
    hasDetailedCanadianBusinessOrWorkPlan: false
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NO_VIABLE_BUSINESS_OR_WORK_PLAN'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'COMMISSION_FORMAL_CANADIAN_BUSINESS_PLAN'));
});

test('Federal C10 - Self-employed applicant is exempt from $230 employer portal fee', () => {
  const result = evaluateFederalC10SignificantBenefit({
    isSelfEmployedApplicant: true,
    employerComplianceFeePaid: false
  });

  assert.equal(result.statutoryFees.employerComplianceFeeCad, 0);
});
