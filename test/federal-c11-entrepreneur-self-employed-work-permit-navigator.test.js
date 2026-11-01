import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_C11_CONSTANTS,
  evaluateFederalC11EntrepreneurWorkPermit
} from '../src/federal-c11-entrepreneur-self-employed-work-permit-navigator.js';

test('Federal C11 - Constants reflect IRPR s. 205(a)', () => {
  assert.equal(FEDERAL_C11_CONSTANTS.EXEMPTION_CODE, 'C11');
  assert.equal(FEDERAL_C11_CONSTANTS.MIN_BUSINESS_OWNERSHIP_PERCENTAGE, 50);
  assert.equal(FEDERAL_C11_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD, 230);
});

test('Federal C11 - Fully eligible 51% business owner with capital and job creation', () => {
  const result = evaluateFederalC11EntrepreneurWorkPermit({
    businessOwnershipPercentage: 51,
    hasControllingInterest: true,
    capitalInvestedCad: 150000,
    hasComprehensiveBusinessPlan: true,
    createsJobsForCanadiansOrPrs: true,
    projectedCanadianStaffHired: 3,
    hasRelevantEntrepreneurialBackground: true,
    hasSecuredPhysicalPremisesOrLease: true,
    employerComplianceFeePaid: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_C11_WORK_PERMIT');
  assert.equal(result.statutoryViolations.length, 0);
});

test('Federal C11 - Ineligible due to minority ownership (25%) without controlling interest', () => {
  const result = evaluateFederalC11EntrepreneurWorkPermit({
    businessOwnershipPercentage: 25,
    hasControllingInterest: false
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_INSUFFICIENT_OWNERSHIP');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_BUSINESS_OWNERSHIP_OR_CONTROL'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'ACQUIRE_CONTROLLING_EQUITY'));
});

test('Federal C11 - Ineligible if business fails to create Canadian employment', () => {
  const result = evaluateFederalC11EntrepreneurWorkPermit({
    businessOwnershipPercentage: 100,
    createsJobsForCanadiansOrPrs: false,
    projectedCanadianStaffHired: 0
  });

  assert.equal(result.isEligible, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NO_CANADIAN_EMPLOYMENT_CREATION'));
});

test('Federal C11 - Missing business plan triggers statutory violation', () => {
  const result = evaluateFederalC11EntrepreneurWorkPermit({
    businessOwnershipPercentage: 51,
    hasComprehensiveBusinessPlan: false
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_MISSING_BUSINESS_PLAN');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NO_COMPREHENSIVE_BUSINESS_PLAN'));
});
