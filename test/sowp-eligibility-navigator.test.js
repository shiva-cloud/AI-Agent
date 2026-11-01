import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SOWP_CONSTANTS,
  ELIGIBLE_PROFESSIONAL_DEGREE_PROGRAMS,
  evaluateSowpEligibility,
  generateSowpApplicationChecklist
} from '../src/sowp-eligibility-navigator.js';

test('SOWP Eligibility Navigator — Constants reflect IRCC policy updates', () => {
  assert.equal(SOWP_CONSTANTS.POLICY_OVERHAUL_DATE, '2024-03-19');
  assert.equal(SOWP_CONSTANTS.MIN_WORK_PERMIT_MONTHS, 6);
  assert.equal(SOWP_CONSTANTS.MIN_COMMON_LAW_MONTHS, 12);

  assert.ok(ELIGIBLE_PROFESSIONAL_DEGREE_PROGRAMS.length > 5);
});

test('SOWP Eligibility Navigator — Qualifies spouse of Master’s degree student under Code C42', () => {
  const result = evaluateSowpEligibility({
    sponsorType: 'international_student',
    studentProgramLevel: 'masters',
    relationshipType: 'married',
    hasJointFinancialEvidence: true
  });

  assert.equal(result.overallEligible, true);
  assert.equal(result.lmiaExemptionCode, 'C42');
  assert.equal(result.relationshipAudit.isLegallyRecognized, true);
  assert.ok(result.complianceNotes.some(c => c.includes("Master's degree program")));
  assert.equal(result.rejectionRisks.length, 0);
});

test('SOWP Eligibility Navigator — Strictly rejects spouse of college diploma student under March 19, 2024 overhaul', () => {
  const result = evaluateSowpEligibility({
    sponsorType: 'international_student',
    studentProgramLevel: 'college_diploma',
    relationshipType: 'married'
  });

  assert.equal(result.overallEligible, false);
  assert.equal(result.pathwayAudit.isPathwayEligible, false);
  assert.ok(result.rejectionRisks.some(r => r.includes('college diploma programs, or certificate programs are STRICTLY INELIGIBLE')));
});

test('SOWP Eligibility Navigator — Qualifies spouse of high-skilled foreign worker (TEER 1) with 12-month permit under Code C41', () => {
  const result = evaluateSowpEligibility({
    sponsorType: 'foreign_worker',
    workerNocTeer: 1,
    workerPermitDurationMonths: 12,
    workerHasQualifyingJobOfferOrPaystubs: true,
    relationshipType: 'common_law',
    monthsCohabiting: 16,
    hasJointFinancialEvidence: true
  });

  assert.equal(result.overallEligible, true);
  assert.equal(result.lmiaExemptionCode, 'C41');
  assert.equal(result.relationshipAudit.isLegallyRecognized, true);
  assert.ok(result.complianceNotes.some(c => c.includes('HIGH-SKILLED OCCUPATION (TEER 1)')));
});

test('SOWP Eligibility Navigator — Rejects unmarried dating partners and insufficient common-law cohabitation', () => {
  // Dating partner
  const dating = evaluateSowpEligibility({
    sponsorType: 'foreign_worker',
    workerNocTeer: 2,
    relationshipType: 'dating_unmarried'
  });
  assert.equal(dating.overallEligible, false);
  assert.ok(dating.rejectionRisks.some(r => r.includes('CRITICAL DISQUALIFIER: Boyfriends, girlfriends')));

  // Insufficient cohabitation (8 months < 12 months)
  const shortCohabit = evaluateSowpEligibility({
    sponsorType: 'international_student',
    studentProgramLevel: 'doctoral',
    relationshipType: 'common_law',
    monthsCohabiting: 8
  });
  assert.equal(shortCohabit.overallEligible, false);
  assert.ok(shortCohabit.rejectionRisks.some(r => r.includes('requires at least 12 continuous months')));

  const checklist = generateSowpApplicationChecklist({
    applicantName: 'Elena Rostova',
    sponsorType: 'international_student',
    lmiaCode: 'C42',
    isEligible: true
  });

  assert.ok(checklist.includes('SPOUSAL OPEN WORK PERMIT (SOWP) SUBMISSION DOSSIER'));
  assert.ok(checklist.includes('Elena Rostova'));
  assert.ok(checklist.includes('IRPR s. 4'));
  assert.ok(checklist.includes('Form IMM 5409'));
});
