import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OAS_GIS_CONSTANTS,
  TOTALIZATION_PARTNER_COUNTRIES,
  evaluateOasGisEligibility,
  generateSeniorBenefitRoadmap
} from '../src/oas-gis-navigator.js';

test('OAS GIS Navigator — Statutory constants match Service Canada and OASA standards', () => {
  assert.equal(OAS_GIS_CONSTANTS.MINIMUM_OAS_AGE, 65);
  assert.equal(OAS_GIS_CONSTANTS.FULL_OAS_YEARS_REQUIRED, 40);
  assert.equal(OAS_GIS_CONSTANTS.MIN_RESIDENCE_YEARS_INLAND, 10);
  assert.equal(OAS_GIS_CONSTANTS.MIN_RESIDENCE_YEARS_PORTABLE_ABROAD, 20);
  assert.equal(OAS_GIS_CONSTANTS.PGP_SPONSORSHIP_UNDERTAKING_YEARS, 20);

  assert.ok(TOTALIZATION_PARTNER_COUNTRIES.US);
  assert.ok(TOTALIZATION_PARTNER_COUNTRIES.IN);
  assert.ok(TOTALIZATION_PARTNER_COUNTRIES.UK);
});

test('OAS GIS Navigator — Calculates partial OAS pension in 40ths for 12 years of Canadian residence', () => {
  const result = evaluateOasGisEligibility({
    ageYears: 67,
    yearsResidedInCanadaAfter18: 12,
    isCanadianCitizenOrLegalResident: true,
    livesInCanada: true,
    isUnderFamilyClassSponsorship: false,
    annualNetWorldIncomeCad: 15000
  });

  assert.equal(result.oasAudit.eligibleForOas, true);
  assert.equal(result.oasAudit.fractionOfFullPension, '12/40');
  // 12/40 * 727.67 = 218.30
  assert.equal(result.oasAudit.monthlyOasGrossCad, 218.30);
  assert.equal(result.oasAudit.portableOutsideCanada, false); // < 20 years
  assert.equal(result.gisAudit.eligibleForGis, true);
  assert.ok(result.totalMonthlyBenefitCad > 500);
});

test('OAS GIS Navigator — Strictly bars sponsored senior from GIS under OASA s. 11(7)', () => {
  const result = evaluateOasGisEligibility({
    ageYears: 68,
    yearsResidedInCanadaAfter18: 10,
    isCanadianCitizenOrLegalResident: true,
    livesInCanada: true,
    isUnderFamilyClassSponsorship: true,
    sponsorshipYearsRemaining: 15,
    annualNetWorldIncomeCad: 5000
  });

  assert.equal(result.oasAudit.eligibleForOas, true);
  assert.equal(result.gisAudit.eligibleForGis, false);
  assert.equal(result.gisAudit.gisBarredBySponsorship, true);
  assert.equal(result.gisAudit.monthlyGisCad, 0);
  assert.ok(result.riskWarnings.some(r => r.includes('STRICT STATUTORY BAR (OASA s. 11(7))')));
});

test('OAS GIS Navigator — Applies international social security totalization agreement to bridge residency threshold', () => {
  const result = evaluateOasGisEligibility({
    ageYears: 66,
    yearsResidedInCanadaAfter18: 4, // alone < 10 years
    countryOfOrigin: 'US',
    yearsContributedToOriginSocialSecurity: 20, // totalized 24 >= 10
    isCanadianCitizenOrLegalResident: true,
    livesInCanada: true
  });

  assert.equal(result.oasAudit.totalizationApplied, true);
  assert.equal(result.oasAudit.combinedQualifyingYears, 24);
  assert.equal(result.oasAudit.eligibleForOas, true);
  assert.equal(result.oasAudit.fractionOfFullPension, '4/40');
  // 4/40 * 727.67 = 72.77
  assert.equal(result.oasAudit.monthlyOasGrossCad, 72.77);
});

test('OAS GIS Navigator — Triggers OAS recovery tax clawback on income exceeding threshold', () => {
  const result = evaluateOasGisEligibility({
    ageYears: 70,
    yearsResidedInCanadaAfter18: 40,
    annualNetWorldIncomeCad: 110997 // 20,000 above 90,997
  });

  assert.equal(result.oasAudit.eligibleForOas, true);
  assert.equal(result.clawbackAudit.clawbackTriggered, true);
  // 20,000 * 15% = 3,000 annual clawback ($250/mo)
  assert.equal(result.clawbackAudit.annualClawbackCad, 3000.0);
  assert.ok(result.oasAudit.netMonthlyOasCad < result.oasAudit.monthlyOasGrossCad);

  const roadmap = generateSeniorBenefitRoadmap({
    applicantName: 'Gurpreet Singh',
    monthlyOasCad: 218.30,
    monthlyGisCad: 0,
    isBarredGis: true,
    sponsorshipYearsRemaining: 14
  });

  assert.ok(roadmap.includes('SENIOR NEWCOMER OAS & GIS BENEFIT ROADMAP'));
  assert.ok(roadmap.includes('Gurpreet Singh'));
  assert.ok(roadmap.includes('Old Age Security Act'));
  assert.ok(roadmap.includes('Family Sponsorship Undertaking'));
});
