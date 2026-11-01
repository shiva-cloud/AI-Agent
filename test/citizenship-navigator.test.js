import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCitizenshipEligibility } from '../src/citizenship-navigator.js';

test('evaluateCitizenshipEligibility: fully eligible applicant meets all statutory criteria', () => {
  const result = evaluateCitizenshipEligibility({
    applicationDate: '2026-10-31',
    prLandingDate: '2024-01-01', // ~1034 days as PR
    prePrDaysPresent: 730, // 365 days credit (max cap)
    postPrDaysAbsent: 34, // 1000 days net post-PR
    taxYearsFiledCount: 3,
    applicantAge: 30,
    languageProofType: 'celpip'
  });

  assert.equal(result.overallReadiness.status, 'eligible_now');
  assert.equal(result.overallReadiness.isEligibleNow, true);
  assert.equal(result.physicalPresenceAudit.prePrCreditedDays, 365);
  assert.equal(result.physicalPresenceAudit.hasMetPhysicalPresence, true);
  assert.ok(result.physicalPresenceAudit.totalCreditedDays >= 1095);
  assert.equal(result.taxCompliance.hasMetTaxRequirement, true);
  assert.equal(result.languageAudit.status, 'compliant');
  assert.equal(result.governmentFeeSchedule.adultFeeCad, 630);
});

test('evaluateCitizenshipEligibility: enforces s. 5(1.001) pre-PR half-day credit and 365-day cap', () => {
  // Case A: 500 actual days = 250 credit (below cap)
  const resultA = evaluateCitizenshipEligibility({
    applicationDate: '2026-10-31',
    prLandingDate: '2026-01-01',
    prePrDaysPresent: 500
  });
  assert.equal(resultA.physicalPresenceAudit.prePrCreditedDays, 250);
  assert.equal(resultA.physicalPresenceAudit.prePrStatutoryCapApplied, false);

  // Case B: 1000 actual days = 365 credit (capped at 365 max)
  const resultB = evaluateCitizenshipEligibility({
    applicationDate: '2026-10-31',
    prLandingDate: '2026-01-01',
    prePrDaysPresent: 1000
  });
  assert.equal(resultB.physicalPresenceAudit.prePrCreditedDays, 365);
  assert.equal(resultB.physicalPresenceAudit.prePrStatutoryCapApplied, true);
});

test('evaluateCitizenshipEligibility: projects earliest eligible date when presence is short', () => {
  const result = evaluateCitizenshipEligibility({
    applicationDate: '2026-01-01',
    prLandingDate: '2025-01-01', // 365 days
    prePrDaysPresent: 0,
    postPrDaysAbsent: 0
  });

  assert.equal(result.overallReadiness.status, 'not_yet_eligible');
  assert.equal(result.physicalPresenceAudit.totalCreditedDays, 365);
  assert.equal(result.physicalPresenceAudit.surplusOrShortfallDays, 365 - 1095); // -730
  // 730 days from 2026-01-01 is 2028-01-01
  assert.ok(result.physicalPresenceAudit.earliestProjectedEligibleDate.startsWith('2028-01-01'));
});

test('evaluateCitizenshipEligibility: applies age exemptions for language under s. 5(1)(d)', () => {
  // Minor under 18: exempt
  const minor = evaluateCitizenshipEligibility({ applicantAge: 16 });
  assert.equal(minor.languageAudit.status, 'exempt_by_age');
  assert.equal(minor.languageAudit.isLanguageRequired, false);

  // Senior over 54: exempt
  const senior = evaluateCitizenshipEligibility({ applicantAge: 58 });
  assert.equal(senior.languageAudit.status, 'exempt_by_age');
  assert.equal(senior.languageAudit.isLanguageRequired, false);

  // Working age 18-54 without test: proof required
  const adultNoTest = evaluateCitizenshipEligibility({ applicantAge: 35, languageProofType: 'none' });
  assert.equal(adultNoTest.languageAudit.status, 'proof_required');
  assert.equal(adultNoTest.languageAudit.isLanguageRequired, true);
});

test('evaluateCitizenshipEligibility: enforces 3-year tax filing under s. 5(1)(c.1)', () => {
  const resultFewTaxes = evaluateCitizenshipEligibility({ taxYearsFiledCount: 2 });
  assert.equal(resultFewTaxes.taxCompliance.hasMetTaxRequirement, false);

  const resultTaxesOk = evaluateCitizenshipEligibility({ taxYearsFiledCount: 3 });
  assert.equal(resultTaxesOk.taxCompliance.hasMetTaxRequirement, true);
});

test('evaluateCitizenshipEligibility: bars application when criminal prohibitions exist under s. 22', () => {
  const result = evaluateCitizenshipEligibility({
    hasCriminalProhibitions: true
  });

  assert.equal(result.overallReadiness.status, 'prohibited');
  assert.equal(result.prohibitionsAudit.hasCriminalProhibitions, true);
  assert.ok(result.overallReadiness.summaryHeadline.includes('Citizenship Act s. 22'));
});
