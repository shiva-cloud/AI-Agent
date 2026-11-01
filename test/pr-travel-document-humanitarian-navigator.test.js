import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePrtdHumanitarian, PRTD_HC_CONSTANTS } from '../src/pr-travel-document-humanitarian-navigator.js';

test('PRTD Humanitarian Navigator — Constants reflect IRPA statutory standards', () => {
  assert.equal(PRTD_HC_CONSTANTS.STATUTORY_RESIDENCY_DAYS_REQUIRED, 730);
  assert.equal(PRTD_HC_CONSTANTS.IN_PERSON_APPEAL_TRAVEL_DOCUMENT_DAYS, 365);
  assert.equal(PRTD_HC_CONSTANTS.IAD_APPEAL_LIMITATION_DAYS, 60);
  assert.equal(PRTD_HC_CONSTANTS.PRTD_APPLICATION_FEE_CAD, 50.0);
});

test('PRTD Humanitarian Navigator — Strong H&C case with documented family illness, child interest, and >365 days', () => {
  const result = evaluatePrtdHumanitarian({
    daysPhysicallyInCanadaLast5Years: 450,
    reasonForAbsenceCategory: 'care_for_critically_ill_family',
    hasDocumentaryProofOfCompellingCircumstance: true,
    yearsResidedInCanadaPriorToAbsence: 5,
    filedCanadianTaxesConsecutively: true,
    ownsResidentialHomeOrAssetsInCanada: true,
    hasMinorCanadianChildrenAffected: true
  });

  assert.equal(result.residencyOverview.residencyObligationSatisfied, false);
  assert.equal(result.residencyOverview.daysShortfall, 280);
  assert.equal(result.humanitarianAssessment.overallHcStrength, 'STRONG');
  assert.equal(result.appealRights.qualifiesForMandatoryInPersonTravelDocument, true);
  assert.ok(result.statutoryProtections.some(p => p.includes('IRPA s. 31(3)(c)')));
  assert.ok(result.humanitarianAssessment.positiveHcFactors.some(f => f.includes('Best Interests of a Child')));
});

test('PRTD Humanitarian Navigator — Flags mandatory 365-day travel doc disqualification if days in Canada < 365', () => {
  const result = evaluatePrtdHumanitarian({
    daysPhysicallyInCanadaLast5Years: 200,
    reasonForAbsenceCategory: 'care_for_critically_ill_family',
    hasDocumentaryProofOfCompellingCircumstance: true
  });

  assert.equal(result.appealRights.qualifiesForMandatoryInPersonTravelDocument, false);
  assert.equal(result.residencyOverview.daysShortfall, 530);
});

test('PRTD Humanitarian Navigator — Identifies vulnerable H&C strength for undocumented voluntary foreign job', () => {
  const result = evaluatePrtdHumanitarian({
    daysPhysicallyInCanadaLast5Years: 100,
    reasonForAbsenceCategory: 'employment_abroad_non_canadian',
    hasDocumentaryProofOfCompellingCircumstance: false,
    yearsResidedInCanadaPriorToAbsence: 1,
    filedCanadianTaxesConsecutively: false,
    ownsResidentialHomeOrAssetsInCanada: false,
    hasMinorCanadianChildrenAffected: false
  });

  assert.equal(result.humanitarianAssessment.overallHcStrength, 'VULNERABLE');
  assert.ok(result.humanitarianAssessment.riskFactors.some(r => r.includes('voluntary foreign employment')));
});

test('PRTD Humanitarian Navigator — Confirms 60-day limitation window to file IAD appeal under IRPA s. 63(4)', () => {
  const result = evaluatePrtdHumanitarian();

  assert.ok(result.appealRights.statutoryAppealRight.includes('IRPA s. 63(4)'));
  assert.ok(result.appealRights.statutoryAppealRight.includes('60 calendar days'));
});
