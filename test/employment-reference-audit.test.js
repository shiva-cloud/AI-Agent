import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REFERENCE_AUDIT_CONSTANTS,
  REFERENCE_LETTER_ELEMENTS,
  auditEmploymentReferenceLetter
} from '../src/employment-reference-audit.js';

test('Employment Reference Audit — Constants match IRCC regulations', () => {
  assert.equal(REFERENCE_AUDIT_CONSTANTS.MIN_FULL_TIME_HOURS_PER_WEEK, 30);
  assert.equal(REFERENCE_AUDIT_CONSTANTS.TOTAL_MANDATORY_CRITERIA, 7);
  assert.equal(REFERENCE_AUDIT_CONSTANTS.MIN_DUTY_MATCH_PERCENT, 70);
  assert.equal(REFERENCE_LETTER_ELEMENTS.length, 7);
});

test('Employment Reference Audit — Evaluates a fully compliant reference letter with Tier 1 corroboration', () => {
  const result = auditEmploymentReferenceLetter({
    program: 'express_entry_fsw',
    nocCode: '21231',
    nocTitle: 'Software Engineer',
    isFullTime: true,
    hoursPerWeek: 40,
    hasLetterhead: true,
    hasExactStartEndDates: true,
    hasJobTitle: true,
    hasAnnualSalaryAndBenefits: true,
    hasDetailedDutiesList: true,
    dutiesCopiedFromNocWordForWord: false,
    dutiesSubstantiallyMatchLeadStatement: true,
    hasSupervisorSignature: true,
    supervisorContactInfoType: 'corporate_domain_email',
    paymentMethod: 'bank_direct_deposit',
    hasPayStubs: true,
    hasTaxDocuments: true,
    hasBankStatements: true,
    applicantName: 'Vikram Seth',
    employerName: 'Global Cloud Systems Inc.'
  });

  assert.equal(result.complianceVerdict, 'COMPLIANT_READY_FOR_SUBMISSION');
  assert.equal(result.mandatoryElementsAudit.satisfiedCount, 7);
  assert.equal(result.mandatoryElementsAudit.missingElements.length, 0);
  assert.equal(result.corroborationAudit.corroborationScore, 100);
  assert.ok(result.corroborationAudit.corroborationTier.includes('Tier 1'));
  assert.ok(result.overallComplianceScore >= 85);
  assert.ok(result.standardCompliantLetterTemplate.includes('Vikram Seth'));
  assert.ok(result.standardCompliantLetterTemplate.includes('Global Cloud Systems Inc.'));
});

test('Employment Reference Audit — Triggers critical misrepresentation & PFL warning for verbatim NOC copy-paste', () => {
  const result = auditEmploymentReferenceLetter({
    nocCode: '21231',
    dutiesCopiedFromNocWordForWord: true,
    dutiesSubstantiallyMatchLeadStatement: true
  });

  assert.equal(result.complianceVerdict, 'FATAL_DEFECT_HIGH_REFUSAL_OR_PFL_RISK');
  const copyRisk = result.auditDeficiencies.find(d => d.code === 'VERBATIM_NOC_COPY_PASTE');
  assert.ok(copyRisk);
  assert.ok(copyRisk.message.includes('Procedural Fairness Letters (PFLs)'));
  assert.ok(copyRisk.message.includes('IRPA s. 40'));
});

test('Employment Reference Audit — Detects missing weekly hours and missing letterhead', () => {
  const result = auditEmploymentReferenceLetter({
    hoursPerWeek: 0,
    hasLetterhead: false,
    hasPayStubs: false
  });

  assert.equal(result.complianceVerdict, 'DEFICIENT_REMEDIAL_ACTION_REQUIRED');
  assert.ok(result.mandatoryElementsAudit.missingElements.some(m => m.includes('letterhead')));
  assert.ok(result.mandatoryElementsAudit.missingElements.some(m => m.includes('weekly hours')));
});

test('Employment Reference Audit — Flags cash wage payment and personal email address', () => {
  const result = auditEmploymentReferenceLetter({
    paymentMethod: 'cash_in_hand',
    supervisorContactInfoType: 'personal_free_email',
    hasBankStatements: false
  });

  assert.ok(result.auditDeficiencies.some(d => d.code === 'CASH_WAGE_PAYMENT'));
  assert.ok(result.auditDeficiencies.some(d => d.code === 'PERSONAL_SUPERVISOR_EMAIL'));
  assert.ok(result.corroborationAudit.corroborationTier.includes('Tier 2') || result.corroborationAudit.corroborationTier.includes('Tier 3'));
});

test('Employment Reference Audit — Applies heightened scrutiny to family-owned business experience', () => {
  const result = auditEmploymentReferenceLetter({
    isFamilyOwnedBusiness: true
  });

  const familyRisk = result.auditDeficiencies.find(d => d.code === 'FAMILY_OWNED_BUSINESS');
  assert.ok(familyRisk);
  assert.ok(familyRisk.message.includes('third-party objective proof'));
});
