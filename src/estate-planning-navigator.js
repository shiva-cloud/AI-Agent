/**
 * Canadian Wills, Estates & Power of Attorney for Newcomers Navigator
 * 
 * Statutory Authorities:
 * - Ontario Succession Law Reform Act (SLRA), R.S.O. 1990, c. S.26, ss. 13, 44, 45, Part V
 * - Ontario Estate Administration Tax Act, 1998, S.O. 1998, c. 34, Sched.
 * - Ontario Substitute Decisions Act, 1992 (SDA), S.O. 1992, c. 30, ss. 7, 46
 * - Ontario Estates Act, R.S.O. 1990, c. E.21, s. 6 (Non-resident executor administration bond)
 * - British Columbia Wills, Estates and Succession Act (WESA), S.B.C. 2009, c. 13
 * - Alberta Wills and Succession Act, S.A. 2010, c. W-12.2
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const ESTATE_PLANNING_CONSTANTS = Object.freeze({
  ONTARIO_PROBATE_EXEMPT_THRESHOLD_CAD: 50000,
  ONTARIO_PROBATE_RATE_ABOVE_THRESHOLD: 0.015,
  ONTARIO_INTESTACY_PREFERENTIAL_SHARE_CAD: 350000,
  BC_PROBATE_EXEMPT_THRESHOLD_CAD: 25000,
  BC_PROBATE_RATE_ABOVE_50K: 0.014,
  ALBERTA_MAX_PROBATE_FEE_CAD: 525
});

/**
 * Diagnostic assessment of newcomer wills, multijurisdictional estate assets,
 * probate tax bypasses, Power of Attorney instruments, and intestacy vulnerabilities.
 */
export function evaluateEstatePlanProfile(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    province = 'ON',
    maritalStatus = 'married',
    hasChildren = true,
    hasMinorChildren = true,
    canadianRealEstateCad = 800000,
    realEstateOwnershipStructure = 'joint_tenancy',
    canadianRegisteredAccountsCad = 100000,
    hasDesignatedBeneficiariesOnRegisteredAccounts = true,
    canadianBankAccountsAndLiquidCad = 50000,
    hasForeignRealEstateOrAssets = false,
    foreignCountry = 'United States',
    hasExistingForeignWill = false,
    hasCanadianWill = false,
    hasContinuingPowerOfAttorneyProperty = false,
    hasPowerOfAttorneyPersonalCare = false,
    namedExecutorLocation = 'canadian_resident',
    clientName = 'Estate Client',
    asOf = '2026-10-31',
    assessmentDate = null
  } = safeParams;
  const safeClientName = boundedText(clientName, 'Estate Client', 100);
  const safeAsOfDate = safeIsoDate(asOf || assessmentDate, '2026-10-31');
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const status = boundedText(maritalStatus, 'married', 30).toLowerCase();
  const hasKids = Boolean(hasChildren);
  
  const hasMinors = Boolean(hasMinorChildren);

  const realEstateVal = Math.max(0, Math.min(1000000000, Number.isFinite(Number(canadianRealEstateCad)) ? Number(canadianRealEstateCad) : 800000));
  const ownership = boundedText(realEstateOwnershipStructure, 'joint_tenancy', 40).toLowerCase();
  const registeredVal = Math.max(0, Math.min(1000000000, Number.isFinite(Number(canadianRegisteredAccountsCad)) ? Number(canadianRegisteredAccountsCad) : 100000));
  const hasBeneficiary = Boolean(hasDesignatedBeneficiariesOnRegisteredAccounts);
  const liquidVal = Math.max(0, Math.min(1000000000, Number.isFinite(Number(canadianBankAccountsAndLiquidCad)) ? Number(canadianBankAccountsAndLiquidCad) : 50000));

  const hasForeign = Boolean(hasForeignRealEstateOrAssets);
  
  const originCountry = boundedText(foreignCountry, 'Abroad', 60);
  const hasForeignWill = Boolean(hasExistingForeignWill);
  const hasCanWill = Boolean(hasCanadianWill);

  const hasCpoa = Boolean(hasContinuingPowerOfAttorneyProperty);
  const hasPoapc = Boolean(hasPowerOfAttorneyPersonalCare);
  const executorLoc = boundedText(namedExecutorLocation, 'canadian_resident', 40).toLowerCase();

  // 1. Canadian Estate Value & Probate Tax Audit
  const totalCanadianEstateValueCad = realEstateVal + registeredVal + liquidVal;

  let bypassedEstateValueCad = 0;
  // Joint tenancy passes by right of survivorship outside probate
  if (ownership === 'joint_tenancy') {
    bypassedEstateValueCad += realEstateVal;
  }
  // Named beneficiaries pass outside estate/probate
  if (hasBeneficiary) {
    bypassedEstateValueCad += registeredVal;
  }

  const probateSubjectEstateValueCad = Math.max(0, totalCanadianEstateValueCad - bypassedEstateValueCad);

  let estimatedProbateTaxCad = 0;
  if (prov === 'ON') {
    if (probateSubjectEstateValueCad > ESTATE_PLANNING_CONSTANTS.ONTARIO_PROBATE_EXEMPT_THRESHOLD_CAD) {
      estimatedProbateTaxCad = Math.round(
        (probateSubjectEstateValueCad - ESTATE_PLANNING_CONSTANTS.ONTARIO_PROBATE_EXEMPT_THRESHOLD_CAD) *
        ESTATE_PLANNING_CONSTANTS.ONTARIO_PROBATE_RATE_ABOVE_THRESHOLD
      );
    }
  } else if (prov === 'BC') {
    if (probateSubjectEstateValueCad > 50000) {
      estimatedProbateTaxCad = Math.round(358 + (probateSubjectEstateValueCad - 50000) * ESTATE_PLANNING_CONSTANTS.BC_PROBATE_RATE_ABOVE_50K);
    } else if (probateSubjectEstateValueCad > 25000) {
      estimatedProbateTaxCad = Math.round(208 + (probateSubjectEstateValueCad - 25000) * 0.006);
    }
  } else if (prov === 'AB') {
    estimatedProbateTaxCad = Math.min(ESTATE_PLANNING_CONSTANTS.ALBERTA_MAX_PROBATE_FEE_CAD, Math.round(probateSubjectEstateValueCad * 0.001));
  }

  // Potential probate tax savings from dual wills (corporate private shares) or bypasses
  const potentialProbateSavingsCad = Math.round(bypassedEstateValueCad * 0.015);
  const primaryAndSecondaryWillOpportunity = totalCanadianEstateValueCad > 500000;

  // 2. Multijurisdictional & Foreign Assets Strategy
  const generalRevocationClauseTrap = hasForeign
    ? `Crucial Trap: Standard boilerplate Canadian wills contain a general revocation clause revoking "all prior wills, codicils and testamentary dispositions". Executing this clause immediately and inadvertently revokes your existing foreign will in ${originCountry}, creating an unrepresented intestate crisis abroad.`
    : 'No overseas assets indicated. Standard single Canadian jurisdiction will is appropriate.';

  const recommendedWillStructure = (hasForeign || hasForeignWill)
    ? 'MULTIPLE_CONCURRENT_WILLS'
    : 'SINGLE_CANADIAN_WILL';

  const crossBorderTaxGuidance = hasForeign
    ? `Real property in ${originCountry} is governed by lex situs. On death, Canada deems all capital property worldwide disposed at Fair Market Value (ITA s. 70(5)). Foreign tax credits (ITA s. 126) must be coordinated to prevent double taxation.`
    : 'All assets reside in Canada; standard Canadian deemed disposition on death rules apply under ITA s. 70(5).';

  // 3. Power of Attorney & Non-Resident Executor Audit
  const isNonResidentExecutor = executorLoc === 'abroad';
  const nonResidentExecutorRisk = {
    isHighRisk: isNonResidentExecutor,
    securityBondRequired: isNonResidentExecutor && prov === 'ON',
    craNonResidentTrustTaxRisk: isNonResidentExecutor,
    statutoryRemedy: isNonResidentExecutor
      ? 'Under Ontario Estates Act s. 6, a non-resident executor must post a court administration security bond for double the value of the estate, or bring a formal motion to dispense with bond. Central management and control abroad also subjects the estate trust to punitive non-resident trust taxation under CRA rules. Appoint a Canadian resident co-executor.'
      : 'Executor is a Canadian resident; avoids mandatory foreign administration bond and non-resident estate trust tax penalties.'
  };

  // 4. Intestacy Risk Audit (Dying Without a Will)
  const isIntestate = !hasCanWill;
  const isCommonLaw = status === 'common_law';
  let commonLawSpouseDisinheritanceRisk = false;
  let statutoryDistributionSummary = '';

  if (prov === 'ON') {
    if (isCommonLaw) {
      commonLawSpouseDisinheritanceRisk = true;
      statutoryDistributionSummary = 'CRITICAL WARNING: Under Ontario Succession Law Reform Act (SLRA) Part II, common-law spouses have ZERO statutory inheritance rights on intestacy! If you pass away without a will, your common-law partner receives $0, and your estate passes entirely to children or blood relatives. The surviving partner must sue the estate under SLRA Part V for dependent relief.';
    } else if (status === 'married') {
      statutoryDistributionSummary = hasKids
        ? `Under Ontario SLRA s. 45, your legally married spouse receives the first $350,000 CAD (preferential share). The remaining balance is split equally between your spouse and children.`
        : `Under Ontario SLRA, your legally married spouse inherits the entire estate if there are no children.`;
    } else {
      statutoryDistributionSummary = 'Estate distributes strictly to surviving children, or to parents/siblings if unmarried with no children.';
    }
  } else if (prov === 'BC') {
    commonLawSpouseDisinheritanceRisk = false; // BC WESA recognizes 2+ year common law spouses
    statutoryDistributionSummary = 'Under BC WESA s. 20-22, common-law spouses living in a marriage-like relationship for at least 2 years have equal spousal inheritance rights as married spouses.';
  } else {
    statutoryDistributionSummary = 'Provincial intestacy rules govern distribution based on preferential spousal share and degree of consanguinity.';
  }

  const minorGuardianshipRisk = (hasKids && hasMinors && !hasCanWill)
    ? 'Under Ontario Children\'s Law Reform Act s. 61, testamentary guardianship of minor children can only be designated in a valid will. Without a will, the Office of the Children\'s Lawyer (OCL) and provincial courts decide custody.'
    : 'Minor custody designated or no minor children involved.';

  // 5. Statutory Citations & Action Plan
  const statutoryCitations = [
    'Ontario Succession Law Reform Act (SLRA), R.S.O. 1990, c. S.26 (Intestacy & Spousal Preferential Share)',
    'Ontario Estate Administration Tax Act, 1998, S.O. 1998, c. 34 (1.5% Probate Tax over $50k)',
    'Ontario Substitute Decisions Act, 1992 (SDA), S.O. 1992, c. 30, ss. 7, 46 (CPOA and POAPC)',
    'Ontario Estates Act, R.S.O. 1990, c. E.21, s. 6 (Non-Resident Administration Bond)',
    'Income Tax Act, R.S.C. 1985, c. 1 (5th Supp.), s. 70(5) (Deemed disposition of capital property on death)'
  ];

  const actionPlan = [];
  if (isIntestate) {
    actionPlan.push('Draft a Canadian Primary Will: Specify executor, asset distribution, and minor children guardian designation.');
  }
  if (commonLawSpouseDisinheritanceRisk) {
    actionPlan.push('URGENT: Execute Will for Common-Law Partner: Common-law partners do not inherit under Ontario intestacy; explicit testamentary bequest is legally required.');
  }
  if (recommendedWillStructure === 'MULTIPLE_CONCURRENT_WILLS') {
    actionPlan.push(`Execute Concurrent Jurisdictional Wills: Instruct legal counsel to include a territorial limitation clause restricted to Canadian situs assets to avoid revoking your ${originCountry} will.`);
  }
  if (!hasCpoa) {
    actionPlan.push('Execute Continuing Power of Attorney for Property: Authorize a trusted Canadian attorney to manage bank accounts, mortgage, and finances upon mental incapacity.');
  }
  if (!hasPoapc) {
    actionPlan.push('Execute Power of Attorney for Personal Care: Appoint a personal care attorney with clear end-of-life and medical treatment directives.');
  }
  if (isNonResidentExecutor) {
    actionPlan.push('Designate Canadian Resident Executor or Co-Executor: Avoid onerous court administration security bonds under Estates Act s. 6 and CRA non-resident trust taxation.');
  }
  if (!hasBeneficiary && registeredVal > 0) {
    actionPlan.push('File Designated Beneficiary Forms on TFSA/RRSP/FHSA: Ensure registered accounts bypass probate administration directly to named heirs.');
  }

  return {
    clientName: safeClientName,
    asOf: safeAsOfDate,
    province: prov,
    maritalStatus: status,
    probateTaxAnalysis: {
      totalCanadianEstateValueCad,
      probateSubjectEstateValueCad,
      bypassedEstateValueCad,
      estimatedProbateTaxCad,
      potentialProbateSavingsCad,
      primaryAndSecondaryWillOpportunity
    },
    foreignAssetsStrategy: {
      hasForeignRisk: hasForeign,
      foreignCountry: originCountry,
      situsDoctrineSummary: 'Real property is governed by lex situs (law of the location); movable property is governed by lex domicilii.',
      generalRevocationClauseTrap,
      recommendedWillStructure,
      crossBorderTaxGuidance
    },
    powerOfAttorneyAudit: {
      hasContinuingPowerOfAttorneyProperty: hasCpoa,
      hasPowerOfAttorneyPersonalCare: hasPoapc,
      nonResidentExecutorRisk
    },
    intestacyRiskAudit: {
      isIntestate,
      commonLawSpouseDisinheritanceRisk,
      statutoryDistributionSummary,
      minorGuardianshipRisk
    },
    statutoryCitations,
    actionPlan
  };
}
