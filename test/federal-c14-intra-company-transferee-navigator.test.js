import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEDERAL_ICT_CONSTANTS,
  evaluateFederalIntraCompanyTransferee
} from '../src/federal-c14-intra-company-transferee-navigator.js';

test('Federal ICT - Constants reflect IRPR s. 205(a)', () => {
  assert.equal(FEDERAL_ICT_CONSTANTS.MIN_CONTINUOUS_FOREIGN_EMPLOYMENT_MONTHS, 12);
  assert.equal(FEDERAL_ICT_CONSTANTS.MAX_CUMULATIVE_DURATION_EXECUTIVE_MANAGER_YEARS, 7);
  assert.equal(FEDERAL_ICT_CONSTANTS.MAX_CUMULATIVE_DURATION_SPECIALIZED_KNOWLEDGE_YEARS, 5);
  assert.equal(FEDERAL_ICT_CONSTANTS.EMPLOYER_COMPLIANCE_FEE_CAD, 230);
});

test('Federal ICT - Fully eligible Senior Manager transferring to Canadian subsidiary', () => {
  const result = evaluateFederalIntraCompanyTransferee({
    qualifyingCorporateRelationship: 'SUBSIDIARY',
    transfereeRole: 'EXECUTIVE_OR_SENIOR_MANAGER',
    continuousForeignEmploymentMonths: 24,
    isNewOfficeStartUp: false,
    employerComplianceFeePaid: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_ICT_WORK_PERMIT');
  assert.equal(result.durationAssessment.initialAuthorizedDurationYears, 3);
  assert.equal(result.durationAssessment.cumulativeStatutoryCapYears, 7);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Federal ICT - Specialized Knowledge Start-up applicant gets 1-year initial permit', () => {
  const result = evaluateFederalIntraCompanyTransferee({
    qualifyingCorporateRelationship: 'PARENT',
    transfereeRole: 'SPECIALIZED_KNOWLEDGE',
    continuousForeignEmploymentMonths: 18,
    isNewOfficeStartUp: true,
    hasSecuredPhysicalPremises: true,
    meetsProprietarySpecializedKnowledgeStandard: true,
    employerComplianceFeePaid: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.durationAssessment.initialAuthorizedDurationYears, 1);
  assert.equal(result.durationAssessment.cumulativeStatutoryCapYears, 5);
});

test('Federal ICT - Detects unrelated company with no qualifying corporate link', () => {
  const result = evaluateFederalIntraCompanyTransferee({
    qualifyingCorporateRelationship: 'UNRELATED',
    transfereeRole: 'EXECUTIVE_OR_SENIOR_MANAGER',
    continuousForeignEmploymentMonths: 24
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_NO_CORPORATE_LINK');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'NO_QUALIFYING_CORPORATE_RELATIONSHIP'));
});

test('Federal ICT - Detects statutory cap reached (5 years for specialized knowledge)', () => {
  const result = evaluateFederalIntraCompanyTransferee({
    qualifyingCorporateRelationship: 'SUBSIDIARY',
    transfereeRole: 'SPECIALIZED_KNOWLEDGE',
    continuousForeignEmploymentMonths: 24,
    accumulatedYearsOnIctPermitInCanada: 5
  });

  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_STATUTORY_CAP_REACHED');
  assert.equal(result.durationAssessment.hasReachedCap, true);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_ICT_CUMULATIVE_CAP_REACHED'));
});
