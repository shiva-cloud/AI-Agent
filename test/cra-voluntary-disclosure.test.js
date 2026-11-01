import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CRA_VDP_CONSTANTS,
  evaluateVoluntaryDisclosure
} from '../src/cra-voluntary-disclosure.js';

test('CRA Voluntary Disclosures Program — Statutory constants reflect ITA & IC00-1R6 standards', () => {
  assert.equal(CRA_VDP_CONSTANTS.T1135_REPORTING_THRESHOLD_CAD, 100000);
  assert.equal(CRA_VDP_CONSTANTS.T1135_STANDARD_MAX_PENALTY_PER_YEAR_CAD, 2500);
  assert.equal(CRA_VDP_CONSTANTS.GROSS_NEGLIGENCE_TAX_PENALTY_PERCENT, 50);
  assert.equal(CRA_VDP_CONSTANTS.VDP_LIMITATION_YEARS, 10);
});

test('CRA Voluntary Disclosures Program — Grants first-year T1135 exemption for landing year', () => {
  const result = evaluateVoluntaryDisclosure({
    landingYear: 2023,
    taxYearsOmitted: [2023, 2024],
    maxForeignCostAmountCad: 250000,
    foreignIncomeAnnualCad: 10000,
    hasCraContactedOrAudited: false
  });

  assert.equal(result.eligibility.isEligible, true);
  assert.equal(result.eligibility.programTrack, 'General Program');

  const y2023 = result.t1135Audit.yearlyAudit.find(y => y.taxYear === 2023);
  const y2024 = result.t1135Audit.yearlyAudit.find(y => y.taxYear === 2024);

  assert.equal(y2023.isLandingYear, true);
  assert.equal(y2023.t1135Required, false);
  assert.ok(y2023.exemptionReason.includes('First-year resident exemption'));
  assert.equal(y2023.potentialPenaltyCad, 0);

  assert.equal(y2024.isLandingYear, false);
  assert.equal(y2024.t1135Required, true);
  assert.equal(y2024.potentialPenaltyCad, 2500);

  assert.equal(result.t1135Audit.totalT1135PenaltyExposureCad, 2500);
});

test('CRA Voluntary Disclosures Program — Recommends General Program track for newcomer non-compliance', () => {
  const result = evaluateVoluntaryDisclosure({
    landingYear: 2022,
    taxYearsOmitted: [2023, 2024],
    maxForeignCostAmountCad: 180000,
    foreignIncomeAnnualCad: 6000,
    hasCraContactedOrAudited: false,
    hasActiveOffshoreEntitiesOrShellCompanies: false
  });

  assert.equal(result.eligibility.programTrack, 'General Program');
  assert.ok(result.reliefScope.penaltyReliefScope.includes('Full waiver'));
  assert.ok(result.reliefScope.interestReliefScope.includes('50%'));
  assert.equal(result.reliefScope.criminalImmunityGranted, true);
});

test('CRA Voluntary Disclosures Program — Assigns Limited Program track when offshore shell entities exist', () => {
  const result = evaluateVoluntaryDisclosure({
    landingYear: 2022,
    taxYearsOmitted: [2023, 2024],
    maxForeignCostAmountCad: 800000,
    foreignIncomeAnnualCad: 45000,
    hasCraContactedOrAudited: false,
    hasActiveOffshoreEntitiesOrShellCompanies: true
  });

  assert.equal(result.eligibility.programTrack, 'Limited Program');
  assert.ok(result.reliefScope.penaltyReliefScope.includes('gross negligence'));
  assert.ok(result.reliefScope.interestReliefScope.includes('No interest relief'));
  assert.equal(result.reliefScope.criminalImmunityGranted, true);
});

test('CRA Voluntary Disclosures Program — Disqualifies application if CRA has commenced audit/inquiry', () => {
  const result = evaluateVoluntaryDisclosure({
    landingYear: 2022,
    taxYearsOmitted: [2023],
    maxForeignCostAmountCad: 150000,
    foreignIncomeAnnualCad: 5000,
    hasCraContactedOrAudited: true
  });

  assert.equal(result.eligibility.isEligible, false);
  assert.ok(result.eligibility.summary.includes('Ineligible'));
  const voluntaryCondition = result.reliefScope.conditions.find(c => c.condition === 'Voluntary Disclosure');
  assert.equal(voluntaryCondition.met, false);
  assert.equal(result.reliefScope.criminalImmunityGranted, false);
});

test('CRA Voluntary Disclosures Program — Explains deemed cost base step-up under ITA s. 128.1(1)(b)', () => {
  const result = evaluateVoluntaryDisclosure({
    landingYear: 2021,
    taxYearsOmitted: [2022, 2023, 2024],
    maxForeignCostAmountCad: 300000
  });

  assert.ok(result.deemedCostBaseRules.statutoryBasis.includes('128.1(1)(b)'));
  assert.ok(result.deemedCostBaseRules.rule.includes('Fair Market Value'));
  assert.ok(result.deemedCostBaseRules.practicalImpact.includes('2021'));
});
