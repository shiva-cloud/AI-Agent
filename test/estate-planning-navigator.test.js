import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEstatePlanProfile,
  ESTATE_PLANNING_CONSTANTS
} from '../src/estate-planning-navigator.js';

test('Estate Planning Navigator — Statutory constants match Ontario SLRA and probate tax rules', () => {
  assert.equal(ESTATE_PLANNING_CONSTANTS.ONTARIO_PROBATE_EXEMPT_THRESHOLD_CAD, 50000);
  assert.equal(ESTATE_PLANNING_CONSTANTS.ONTARIO_PROBATE_RATE_ABOVE_THRESHOLD, 0.015);
  assert.equal(ESTATE_PLANNING_CONSTANTS.ONTARIO_INTESTACY_PREFERENTIAL_SHARE_CAD, 350000);
  assert.equal(ESTATE_PLANNING_CONSTANTS.BC_PROBATE_RATE_ABOVE_50K, 0.014);
  assert.equal(ESTATE_PLANNING_CONSTANTS.ALBERTA_MAX_PROBATE_FEE_CAD, 525);
});

test('Estate Planning Navigator — Calculates Ontario probate tax and JTWROS / beneficiary bypass', () => {
  const result = evaluateEstatePlanProfile({
    province: 'ON',
    maritalStatus: 'married',
    canadianRealEstateCad: 900000,
    realEstateOwnershipStructure: 'joint_tenancy', // Bypasses probate
    canadianRegisteredAccountsCad: 150000,
    hasDesignatedBeneficiariesOnRegisteredAccounts: true, // Bypasses probate
    canadianBankAccountsAndLiquidCad: 100000, // Subject to probate
    hasCanadianWill: true
  });

  assert.equal(result.province, 'ON');
  assert.equal(result.probateTaxAnalysis.bypassedEstateValueCad, 1050000); // 900k + 150k
  assert.equal(result.probateTaxAnalysis.probateSubjectEstateValueCad, 100000);
  // Ontario probate tax on $100k: ($100k - $50k) * 1.5% = $750 CAD
  assert.equal(result.probateTaxAnalysis.estimatedProbateTaxCad, 750);
});

test('Estate Planning Navigator — Warns about Ontario common-law intestacy disinheritance', () => {
  const result = evaluateEstatePlanProfile({
    province: 'ON',
    maritalStatus: 'common_law',
    hasChildren: true,
    childrenCount: 1,
    hasCanadianWill: false
  });

  assert.equal(result.intestacyRiskAudit.isIntestate, true);
  assert.equal(result.intestacyRiskAudit.commonLawSpouseDisinheritanceRisk, true);
  assert.ok(result.intestacyRiskAudit.statutoryDistributionSummary.includes('ZERO statutory inheritance'));
});

test('Estate Planning Navigator — BC treats common-law spouses equally under WESA', () => {
  const result = evaluateEstatePlanProfile({
    province: 'BC',
    maritalStatus: 'common_law',
    hasChildren: true,
    hasCanadianWill: false
  });

  assert.equal(result.intestacyRiskAudit.commonLawSpouseDisinheritanceRisk, false);
  assert.ok(result.intestacyRiskAudit.statutoryDistributionSummary.includes('WESA'));
});

test('Estate Planning Navigator — Flags foreign asset revocation trap and recommends concurrent wills', () => {
  const result = evaluateEstatePlanProfile({
    province: 'ON',
    hasForeignRealEstateOrAssets: true,
    foreignAssetsValueCad: 400000,
    foreignCountry: 'India',
    hasExistingForeignWill: true,
    hasCanadianWill: false
  });

  assert.equal(result.foreignAssetsStrategy.hasForeignRisk, true);
  assert.equal(result.foreignAssetsStrategy.recommendedWillStructure, 'MULTIPLE_CONCURRENT_WILLS');
  assert.ok(result.foreignAssetsStrategy.generalRevocationClauseTrap.includes('revocation'));
});

test('Estate Planning Navigator — Identifies non-resident executor tax and probate bond risks', () => {
  const result = evaluateEstatePlanProfile({
    province: 'ON',
    hasContinuingPowerOfAttorneyProperty: false,
    hasPowerOfAttorneyPersonalCare: false,
    namedExecutorLocation: 'abroad'
  });

  assert.equal(result.powerOfAttorneyAudit.nonResidentExecutorRisk.isHighRisk, true);
  assert.equal(result.powerOfAttorneyAudit.nonResidentExecutorRisk.securityBondRequired, true);
  assert.equal(result.powerOfAttorneyAudit.nonResidentExecutorRisk.craNonResidentTrustTaxRisk, true);
  assert.ok(result.powerOfAttorneyAudit.nonResidentExecutorRisk.statutoryRemedy.includes('Estates Act s. 6'));
});
