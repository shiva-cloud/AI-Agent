import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateWorkplaceDiscriminationAndConstructiveDismissal,
  HUMAN_RIGHTS_JURISDICTIONS
} from '../src/human-rights-defense.js';

test('Human Rights Defense — Registry contains provincial and federal tribunals', () => {
  assert.ok(HUMAN_RIGHTS_JURISDICTIONS.ON);
  assert.ok(HUMAN_RIGHTS_JURISDICTIONS.BC);
  assert.ok(HUMAN_RIGHTS_JURISDICTIONS.FED);
  assert.equal(HUMAN_RIGHTS_JURISDICTIONS.ON.tribunal, 'Human Rights Tribunal of Ontario (HRTO)');
  assert.equal(HUMAN_RIGHTS_JURISDICTIONS.FED.statute, 'Canadian Human Rights Act (CHRA)');
});

test('Human Rights Defense — Prohibits Canadian experience requirement under OHRC ss. 5 & 11', () => {
  const result = evaluateWorkplaceDiscriminationAndConstructiveDismissal({
    jurisdiction: 'ON',
    protectedGrounds: ['place_of_origin', 'citizenship'],
    conductTypes: ['canadian_experience_requirement'],
    daysSinceLastIncident: 40,
    hasReportedInternally: false
  });

  assert.equal(result.humanRightsViolationVerdict, 'PROBABLE_PRIMA_FACIE_DISCRIMINATION');
  assert.ok(result.statutoryViolations.some(v => v.finding.includes('Canadian experience')));
  assert.equal(result.statuteOfLimitationsStatus.isWithin1YearLimitation, true);
  assert.equal(result.statuteOfLimitationsStatus.daysRemainingToApply, 325);
});

test('Human Rights Defense — Establishes constructive dismissal under Potter v. New Brunswick (2015 SCC 10)', () => {
  const result = evaluateWorkplaceDiscriminationAndConstructiveDismissal({
    jurisdiction: 'ON',
    conductTypes: ['indefinite_unpaid_suspension', 'toxic_workplace_environment'],
    annualSalaryCad: 90000,
    yearsOfService: 4,
    applicantAge: 40
  });

  assert.equal(result.constructiveDismissalVerdict, 'ESTABLISHED_CONSTRUCTIVE_DISMISSAL');
  assert.equal(result.constructiveDismissalAudit.isConstructiveDismissal, true);
  assert.equal(result.constructiveDismissalAudit.potterVNewBrunswickApplied, true);
  assert.ok(result.constructiveDismissalAudit.factorsIdentified.some(f => f.includes('Potter v. New Brunswick')));
  assert.ok(result.damagesAssessment.estimatedCommonLawNoticeMonths >= 4);
  assert.ok(result.damagesAssessment.estimatedCommonLawNoticeValueCad > 25000);
});

test('Human Rights Defense — Strictly flags employer reprisal and retaliation under OHRC s. 8', () => {
  const result = evaluateWorkplaceDiscriminationAndConstructiveDismissal({
    jurisdiction: 'ON',
    conductTypes: ['slurs_or_harassment'],
    employerResponse: 'retaliated',
    hasReportedInternally: true
  });

  assert.equal(result.humanRightsViolationVerdict, 'UNLAWFUL_STATUTORY_REPRISAL');
  assert.ok(result.statutoryViolations.some(v => v.severity === 'UNLAWFUL_REPRISAL'));
  assert.equal(result.retaliationProtection.isReprisalProtected, true);
  assert.ok(result.damagesAssessment.humanRightsDignityDamagesEstimateCad.minCad >= 20000);
});

test('Human Rights Defense — Enforces 1-year statute of limitations for HRTO applications', () => {
  const result = evaluateWorkplaceDiscriminationAndConstructiveDismissal({
    jurisdiction: 'ON',
    conductTypes: ['slurs_or_harassment'],
    daysSinceLastIncident: 400 // Expired > 365 days
  });

  assert.equal(result.statuteOfLimitationsStatus.isWithin1YearLimitation, false);
  assert.ok(result.statuteOfLimitationsStatus.limitationWarning.includes('WARNING'));
  assert.ok(result.statuteOfLimitationsStatus.limitationWarning.includes('OHRC s. 34(2)'));
});

test('Human Rights Defense — Correctly audits federally regulated employers under CHRA', () => {
  const result = evaluateWorkplaceDiscriminationAndConstructiveDismissal({
    jurisdiction: 'FED',
    conductTypes: ['unreasonable_refusal_of_accommodation'],
    daysSinceLastIncident: 15
  });

  assert.equal(result.jurisdiction, 'FED');
  assert.equal(result.jurisdictionDetails.tribunal, 'Canadian Human Rights Commission (CHRC)');
  assert.ok(result.statutoryViolations.some(v => v.severity === 'FAILURE_TO_ACCOMMODATE'));
});

test('Human Rights Defense — Generates legally binding formal demand letter citing SCC precedent', () => {
  const result = evaluateWorkplaceDiscriminationAndConstructiveDismissal({
    jurisdiction: 'ON',
    conductTypes: ['salary_cut_greater_15_percent', 'retaliation_or_reprisal'],
    annualSalaryCad: 100000,
    yearsOfService: 5
  });

  assert.ok(result.officialFormalDemandLetter.includes('Potter v. New Brunswick'));
  assert.ok(result.officialFormalDemandLetter.includes('Farber v. Royal Trust'));
  assert.ok(result.officialFormalDemandLetter.includes('ANTI-REPRISAL PROTECTION'));
});
