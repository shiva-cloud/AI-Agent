import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CITIZENSHIP_PRESENCE_REQUIREMENTS,
  auditCitizenshipPhysicalPresence
} from '../src/federal-citizenship-residence-calculator-audit-navigator.js';

test('Citizenship Presence - Constants reflect Citizenship Act s. 5(1)(c)', () => {
  assert.equal(CITIZENSHIP_PRESENCE_REQUIREMENTS.STATUTORY_PRESENCE_DAYS_REQUIRED, 1095);
  assert.equal(CITIZENSHIP_PRESENCE_REQUIREMENTS.MAX_TEMPORARY_RESIDENT_CREDIT_DAYS, 365);
  assert.equal(CITIZENSHIP_PRESENCE_REQUIREMENTS.TEMPORARY_RESIDENT_DAY_MULTIPLIER, 0.5);
  assert.equal(CITIZENSHIP_PRESENCE_REQUIREMENTS.CITIZENSHIP_APPLICATION_FEE_ADULT_CAD, 630);
});

test('Citizenship Presence - Eligible candidate with 3 years PR physical presence', () => {
  const result = auditCitizenshipPhysicalPresence({
    daysPresentAsPermanentResident: 1100,
    daysPresentAsTemporaryResident: 0,
    applicantAge: 32,
    hasIncomeTaxFilingCompliance: true,
    meetsLanguageAndKnowledgeCriteria: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_CITIZENSHIP');
  assert.equal(result.presenceSummary.netQualifyingPresenceDays, 1100);
  assert.equal(result.presenceSummary.surplusOrDeficitDays, 5);
  assert.equal(result.presenceSummary.meetsPhysicalPresenceThreshold, true);
  assert.equal(result.statutoryFees.applicationFeeCad, 630);
  assert.equal(result.statutoryViolations.length, 0);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'SLIM_PRESENCE_BUFFER'));
});

test('Citizenship Presence - Utilizes max 365 temporary resident credit with 2 years PR', () => {
  // 730 raw TR days = 365 credited days; + 730 PR days = 1095 credited days
  const result = auditCitizenshipPhysicalPresence({
    daysPresentAsPermanentResident: 730,
    daysPresentAsTemporaryResident: 800, // exceeds 730
    applicantAge: 29,
    hasIncomeTaxFilingCompliance: true,
    meetsLanguageAndKnowledgeCriteria: true
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.presenceSummary.creditedDaysFromTemporaryResidence, 365);
  assert.equal(result.presenceSummary.netQualifyingPresenceDays, 1095);
  assert.equal(result.presenceSummary.surplusOrDeficitDays, 0);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'TEMPORARY_RESIDENT_CAP_REACHED'));
});

test('Citizenship Presence - Ineligible due to presence deficit and penal exclusion under s. 21', () => {
  const result = auditCitizenshipPhysicalPresence({
    daysPresentAsPermanentResident: 1000,
    daysPresentAsTemporaryResident: 100, // 50 credit days
    daysSpentIncarceratedOrProbation: 60, // excludes 60 days
    applicantAge: 35,
    hasIncomeTaxFilingCompliance: true,
    meetsLanguageAndKnowledgeCriteria: true
  });

  // Net: 1000 + 50 - 60 = 990 days (deficit: 105 days)
  assert.equal(result.isEligible, false);
  assert.equal(result.eligibilityVerdict, 'INELIGIBLE_INSUFFICIENT_PRESENCE');
  assert.equal(result.presenceSummary.netQualifyingPresenceDays, 990);
  assert.equal(result.presenceSummary.surplusOrDeficitDays, -105);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_PHYSICAL_PRESENCE'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STATUTORY_PROHIBITION_PENAL_TIME'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'ACCRUE_REMAINING_DAYS_AS_PR'));
});

test('Citizenship Presence - Senior applicant (age 55+) is exempt from language and knowledge tests', () => {
  const result = auditCitizenshipPhysicalPresence({
    daysPresentAsPermanentResident: 1100,
    daysPresentAsTemporaryResident: 0,
    applicantAge: 62,
    hasIncomeTaxFilingCompliance: true,
    meetsLanguageAndKnowledgeCriteria: false // exempt!
  });

  assert.equal(result.isEligible, true);
  assert.equal(result.eligibilityVerdict, 'ELIGIBLE_FOR_CITIZENSHIP');
  assert.equal(result.statutoryViolations.length, 0);
});
