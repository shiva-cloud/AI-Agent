import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ON_PAY_TRANSPARENCY_RULES,
  auditOntarioPayTransparencyAndPosting
} from '../src/ontario-employment-pay-equity-transparency-navigator.js';

test('Ontario Pay Transparency Rules Constants', () => {
  assert.equal(ON_PAY_TRANSPARENCY_RULES.MANDATORY_SALARY_RANGE_IN_POSTINGS, true);
  assert.equal(ON_PAY_TRANSPARENCY_RULES.MANDATORY_AI_DISCLOSURE, true);
  assert.equal(ON_PAY_TRANSPARENCY_RULES.CANADIAN_EXPERIENCE_REQUIREMENT_PROHIBITED, true);
  assert.equal(ON_PAY_TRANSPARENCY_RULES.PAY_EQUITY_MIN_EMPLOYER_SIZE, 10);
  assert.equal(ON_PAY_TRANSPARENCY_RULES.PROVINCE, 'ON');
});

test('auditOntarioPayTransparencyAndPosting confirms fully compliant job posting', () => {
  const result = auditOntarioPayTransparencyAndPosting({
    isPubliclyAdvertisedJobPosting: true,
    includesExpectedCompensationOrRange: true,
    salaryRangeMinCad: 70000,
    salaryRangeMaxCad: 90000,
    usesAiToScreenApplicants: true,
    disclosesAiUsageInPosting: true,
    requiresCanadianWorkExperience: false,
    employerTotalHeadcount: 20,
    hasCompletedPayEquityAudit: true
  });

  assert.equal(result.legalVerdict, 'FULLY_COMPLIANT');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.deficiencies.length, 0);
  assert.equal(result.canadianExperienceProhibitionCompliant, true);
});

test('auditOntarioPayTransparencyAndPosting catches prohibited Canadian experience requirement', () => {
  const result = auditOntarioPayTransparencyAndPosting({
    isPubliclyAdvertisedJobPosting: true,
    includesExpectedCompensationOrRange: true,
    salaryRangeMinCad: 60000,
    salaryRangeMaxCad: 75000,
    usesAiToScreenApplicants: false,
    requiresCanadianWorkExperience: true, // Illegal requirement
    employerTotalHeadcount: 5
  });

  assert.equal(result.legalVerdict, 'NON_COMPLIANT_STATUTORY_BREACH');
  assert.ok(result.statutoryViolations.includes('PROHIBITED_CANADIAN_EXPERIENCE_REQUIREMENT'));
  assert.ok(result.deficiencies.some(d => d.includes('ESA s. 8.4')));
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Strike Canadian Experience Requirement')));
});

test('auditOntarioPayTransparencyAndPosting detects missing compensation range and undisclosed AI', () => {
  const result = auditOntarioPayTransparencyAndPosting({
    isPubliclyAdvertisedJobPosting: true,
    includesExpectedCompensationOrRange: false, // Violation
    usesAiToScreenApplicants: true,
    disclosesAiUsageInPosting: false, // Violation
    requiresCanadianWorkExperience: false
  });

  assert.equal(result.legalVerdict, 'NON_COMPLIANT_STATUTORY_BREACH');
  assert.ok(result.statutoryViolations.includes('MISSING_COMPENSATION_RANGE'));
  assert.ok(result.statutoryViolations.includes('UNDISCLOSED_AI_CANDIDATE_SCREENING'));
  assert.equal(result.statutoryViolations.length, 2);
});

test('auditOntarioPayTransparencyAndPosting flags unreasonably broad salary range', () => {
  const result = auditOntarioPayTransparencyAndPosting({
    isPubliclyAdvertisedJobPosting: true,
    includesExpectedCompensationOrRange: true,
    salaryRangeMinCad: 40000,
    salaryRangeMaxCad: 120000, // 200% spread
    usesAiToScreenApplicants: false,
    requiresCanadianWorkExperience: false
  });

  assert.equal(result.legalVerdict, 'NON_COMPLIANT_STATUTORY_BREACH');
  assert.ok(result.statutoryViolations.includes('UNREASONABLY_BROAD_SALARY_RANGE'));
  assert.ok(result.deficiencies.some(d => d.includes('Unreasonably broad salary range')));
});
