import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRP_STATUTORY_RULES,
  evaluateTrpCompellingBalance
} from '../src/temporary-resident-permit-inadmissibility-navigator.js';

test('TRP Statutory Rules Constants', () => {
  assert.equal(TRP_STATUTORY_RULES.MAX_TRP_DURATION_MONTHS, 36);
  assert.equal(TRP_STATUTORY_RULES.PERMIT_HOLDER_CLASS_PR_CONTINUOUS_YEARS_CRIMINAL, 5);
  assert.equal(TRP_STATUTORY_RULES.PERMIT_HOLDER_CLASS_PR_CONTINUOUS_YEARS_NON_CRIMINAL, 3);
  assert.equal(TRP_STATUTORY_RULES.INADMISSIBILITY_SECTIONS.CRIMINALITY, 'IRPA s. 36(2)');
  assert.equal(TRP_STATUTORY_RULES.INADMISSIBILITY_SECTIONS.MEDICAL, 'IRPA s. 38');
});

test('evaluateTrpCompellingBalance confirms favourable balance for urgent family need', () => {
  const result = evaluateTrpCompellingBalance({
    inadmissibilityType: 'criminality_s36_2',
    yearsElapsedSinceSentenceOrTrigger: 5,
    compellingReasonCategory: 'urgent_family_need',
    hasDocumentaryProofOfCompellingNeed: true,
    hasCleanSubsequentRecord: true,
    hasCompletedAllSentencesAndFines: true,
    hasSevereViolenceOrWeapons: false,
    applicantLocation: 'inside_canada',
    hasCanadianCitizenFamilyAffected: true,
    applicantName: 'Marcus Vance'
  });

  assert.equal(result.isBalanceFavourable, true);
  assert.equal(result.recommendationVerdict, 'RECOMMEND_TRP_SUBMISSION');
  assert.equal(result.riskLevel, 'LOW');
  assert.equal(result.compellingStrength, 'STRONG_HUMANITARIAN_FAMILY');
  assert.equal(result.prPathwayPermitHolderClass.continuousYearsRequired, 5);
  assert.ok(result.statutoryRemedies.some(r => r.action.includes('Open Work Permit')));
});

test('evaluateTrpCompellingBalance handles economic benefit with medical inadmissibility', () => {
  const result = evaluateTrpCompellingBalance({
    inadmissibilityType: 'medical_s38',
    yearsElapsedSinceSentenceOrTrigger: 0,
    compellingReasonCategory: 'significant_economic_benefit',
    hasDocumentaryProofOfCompellingNeed: true,
    hasCleanSubsequentRecord: true,
    hasCompletedAllSentencesAndFines: true,
    hasSevereViolenceOrWeapons: false,
    applicantLocation: 'outside_canada',
    hasCanadianCitizenFamilyAffected: false
  });

  assert.equal(result.isBalanceFavourable, true);
  assert.equal(result.recommendationVerdict, 'RECOMMEND_TRP_SUBMISSION');
  assert.equal(result.statutoryInadmissibilitySection, 'IRPA s. 38');
  assert.equal(result.prPathwayPermitHolderClass.continuousYearsRequired, 3);
});

test('evaluateTrpCompellingBalance flags security/organized crime inadmissibility as severe bar', () => {
  const result = evaluateTrpCompellingBalance({
    inadmissibilityType: 'security_or_human_rights',
    yearsElapsedSinceSentenceOrTrigger: 8,
    compellingReasonCategory: 'urgent_family_need',
    hasDocumentaryProofOfCompellingNeed: true
  });

  assert.equal(result.isBalanceFavourable, false);
  assert.equal(result.recommendationVerdict, 'UNFAVOURABLE_DISCRETION_RISK');
  assert.ok(result.deficiencies.some(d => d.includes('IRPA s. 34 (Security)')));
});

test('evaluateTrpCompellingBalance flags unfulfilled fines and recent sentence as moderate risk', () => {
  const result = evaluateTrpCompellingBalance({
    inadmissibilityType: 'criminality_s36_2',
    yearsElapsedSinceSentenceOrTrigger: 1, // Only 1 year
    compellingReasonCategory: 'urgent_family_need',
    hasDocumentaryProofOfCompellingNeed: false, // Missing proof
    hasCleanSubsequentRecord: true,
    hasCompletedAllSentencesAndFines: false // Unpaid fines
  });

  assert.equal(result.isBalanceFavourable, false);
  assert.equal(result.riskLevel, 'MODERATE_RISK');
  assert.ok(result.deficiencies.some(d => d.includes('Court-ordered fines')));
});
