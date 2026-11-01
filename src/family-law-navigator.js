/**
 * Newcomer Child and Spousal Support Guidelines & Family Law Asset Equalization Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Federal Divorce Act, R.S.C., 1985, c. 3 (2nd Supp.), ss. 15.1, 15.2
 * - Federal Child Support Guidelines (SOR/97-175, CSG), ss. 3, 7, 9 (Ontario & Federal Tables)
 * - Spousal Support Advisory Guidelines (SSAG, Department of Justice Canada)
 * - Ontario Family Law Act, R.S.O. 1990, c. F.3:
 *   - Part I, ss. 4, 5 (Net Family Property & Equalization)
 *   - Part II, ss. 19, 21 (Matrimonial Home Equal Possession & Special Deduction Exclusion)
 *   - Part III, ss. 29-33 (Support Obligations for Married & Common-Law Spouses)
 * - British Columbia Family Law Act, S.B.C. 2011, c. 25, Part 5 (Equal property division for 2+ yr common-law)
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 132 (Sponsorship Undertaking Liability)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const FAMILY_LAW_CONSTANTS = Object.freeze({
  ONTARIO_COMMON_LAW_SUPPORT_YEARS_THRESHOLD: 3,
  BC_COMMON_LAW_PROPERTY_YEARS_THRESHOLD: 2,
  SSAG_PERCENT_PER_YEAR_LOW: 0.015,
  SSAG_PERCENT_PER_YEAR_HIGH: 0.02,
  SSAG_MAX_PERCENT_OF_DIFFERENCE: 0.50,
  SPONSORSHIP_UNDERTAKING_SPOUSE_YEARS: 3
});

/**
 * Computes estimated Federal Child Support Guidelines table amounts based on
 * payer gross annual income and number of eligible children (Ontario table approximation).
 */
export function calculateChildSupportTableAmount(grossAnnualIncomeCad, numberOfChildren = 1) {
  const inc = Math.max(0, Math.min(1000000000, Number.isFinite(Number(grossAnnualIncomeCad)) ? Number(grossAnnualIncomeCad) : 0));
  const kids = Math.max(0, Math.min(10, Number.isFinite(Number(numberOfChildren)) ? Math.round(Number(numberOfChildren)) : 0));
  if (kids === 0 || inc <= 13000) return 0;

  // Presumptive Federal/Ontario CSG base rates
  const multipliers = [0, 1.0, 1.6, 2.1, 2.5, 2.85];
  const scale = kids <= 5 ? multipliers[kids] : 2.85 + (kids - 5) * 0.3;

  let baseMonthly = 0;
  if (inc <= 30000) {
    baseMonthly = ((inc - 13000) * 0.16) / 12;
  } else if (inc <= 60000) {
    baseMonthly = 227 + ((inc - 30000) * 0.135) / 12;
  } else if (inc <= 100000) {
    baseMonthly = 565 + ((inc - 60000) * 0.10) / 12;
  } else if (inc <= 150000) {
    baseMonthly = 898 + ((inc - 100000) * 0.085) / 12;
  } else {
    baseMonthly = 1323 + ((inc - 150000) * 0.075) / 12;
  }

  return Math.max(0, Math.round(baseMonthly * scale));
}

/**
 * Diagnostic evaluation of child support table amounts, SSAG spousal support ranges,
 * Ontario Net Family Property (NFP) equalization, matrimonial home rules,
 * foreign worldwide asset disclosure, and IRPA sponsorship undertakings.
 */
export function evaluateFamilyLawAndSupport(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    clientName = 'Client',
    assessmentDate = '2026-10-31',
    province = 'ON',
    maritalStatus = 'married',
    cohabitationYears = 8.0,
    numberOfChildren = 2,
    payerGrossAnnualIncomeCad = 95000,
    recipientGrossAnnualIncomeCad = 45000,
    parentingArrangement = 'primary_custody',
    payerValuationDateAssetsCad = 350000,
    payerDateOfMarriageDeductionsCad = 50000,
    payerDebtsValuationDateCad = 40000,
    recipientValuationDateAssetsCad = 120000,
    recipientDateOfMarriageDeductionsCad = 20000,
    recipientDebtsValuationDateCad = 15000,
    hasForeignWorldwideAssets = false,
    hasActiveSponsorshipUndertaking = false
  } = safeParams;

  const cleanClientName = boundedText(clientName, 'Client', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const status = boundedText(maritalStatus, 'married', 30).toLowerCase();
  const parenting = boundedText(parentingArrangement, 'primary_custody', 40).toLowerCase();
  const years = Math.max(0.1, Math.min(100, Number.isFinite(Number(cohabitationYears)) ? Number(cohabitationYears) : 1.0));
  const kids = Math.max(0, Math.min(20, Number.isFinite(Number(numberOfChildren)) ? Math.round(Number(numberOfChildren)) : 0));
  const pInc = Math.max(0, Math.min(1000000000, Number.isFinite(Number(payerGrossAnnualIncomeCad)) ? Number(payerGrossAnnualIncomeCad) : 0));
  const rInc = Math.max(0, Math.min(1000000000, Number.isFinite(Number(recipientGrossAnnualIncomeCad)) ? Number(recipientGrossAnnualIncomeCad) : 0));

  const pAssets = Math.max(0, Math.min(1000000000, Number.isFinite(Number(payerValuationDateAssetsCad)) ? Number(payerValuationDateAssetsCad) : 0));
  const pDomDed = Math.max(0, Math.min(1000000000, Number.isFinite(Number(payerDateOfMarriageDeductionsCad)) ? Number(payerDateOfMarriageDeductionsCad) : 0));
  const pDebts = Math.max(0, Math.min(1000000000, Number.isFinite(Number(payerDebtsValuationDateCad)) ? Number(payerDebtsValuationDateCad) : 0));

  const rAssets = Math.max(0, Math.min(1000000000, Number.isFinite(Number(recipientValuationDateAssetsCad)) ? Number(recipientValuationDateAssetsCad) : 0));
  const rDomDed = Math.max(0, Math.min(1000000000, Number.isFinite(Number(recipientDateOfMarriageDeductionsCad)) ? Number(recipientDateOfMarriageDeductionsCad) : 0));
  const rDebts = Math.max(0, Math.min(1000000000, Number.isFinite(Number(recipientDebtsValuationDateCad)) ? Number(recipientDebtsValuationDateCad) : 0));

  const foreignAssets = Boolean(hasForeignWorldwideAssets);
  const sponsorship = Boolean(hasActiveSponsorshipUndertaking);

  // 1. Child Support Calculation (CSG Guidelines)
  let monthlyChildSupportCad = 0;
  let childSupportMethod = '';

  const pBase = calculateChildSupportTableAmount(pInc, kids);
  const rBase = calculateChildSupportTableAmount(rInc, kids);

  if (kids > 0) {
    if (parenting === 'shared_custody') {
      // s. 9 CSG: Set-off method
      monthlyChildSupportCad = Math.max(0, pBase - rBase);
      childSupportMethod = `CSG s. 9 Shared Custody Set-Off: Higher-earning parent pays the net difference ($${pBase} - $${rBase} = $${monthlyChildSupportCad}/month).`;
    } else {
      monthlyChildSupportCad = pBase;
      childSupportMethod = `CSG s. 3 Full Presumptive Table Amount: $${monthlyChildSupportCad}/month based on payer annual income of $${pInc.toLocaleString('en-CA')} CAD for ${kids} child(ren).`;
    }
  } else {
    childSupportMethod = 'No eligible children; child support is $0.';
  }

  // 2. Spousal Support Advisory Guidelines (SSAG) Range
  const isCommonLaw = status === 'common_law';
  let isEligibleForSpousalSupport = true;
  let spousalSupportStatusDetail = '';

  if (isCommonLaw && prov === 'ON') {
    if (years >= FAMILY_LAW_CONSTANTS.ONTARIO_COMMON_LAW_SUPPORT_YEARS_THRESHOLD || kids > 0) {
      isEligibleForSpousalSupport = true;
      spousalSupportStatusDetail = `Eligible under Ontario FLA s. 29 (cohabited continuously for >= 3 years or in relationship of permanence with a child).`;
    } else {
      isEligibleForSpousalSupport = false;
      spousalSupportStatusDetail = 'Ineligible for statutory spousal support: cohabitation under 3 years with no children.';
    }
  }

  const grossDifferenceCad = Math.max(0, pInc - rInc);
  let ssagMonthlyLowCad = 0;
  let ssagMonthlyHighCad = 0;
  let ssagDurationLowYears = 0;
  let ssagDurationHighYears = 0;
  let isIndefiniteDuration = false;

  if (isEligibleForSpousalSupport && grossDifferenceCad > 0) {
    const rawRateLow = Math.min(FAMILY_LAW_CONSTANTS.SSAG_MAX_PERCENT_OF_DIFFERENCE, years * FAMILY_LAW_CONSTANTS.SSAG_PERCENT_PER_YEAR_LOW);
    const rawRateHigh = Math.min(FAMILY_LAW_CONSTANTS.SSAG_MAX_PERCENT_OF_DIFFERENCE, years * FAMILY_LAW_CONSTANTS.SSAG_PERCENT_PER_YEAR_HIGH);

    ssagMonthlyLowCad = Math.round((grossDifferenceCad * rawRateLow) / 12);
    ssagMonthlyHighCad = Math.round((grossDifferenceCad * rawRateHigh) / 12);

    ssagDurationLowYears = Math.round((years * 0.5) * 10) / 10;
    ssagDurationHighYears = Math.round(years * 10) / 10;

    if (years >= 20) {
      isIndefiniteDuration = true;
    }
  }

  // 3. Net Family Property (NFP) Equalization (Ontario FLA Part I / BC FLA Part 5)
  const payerNfpCad = Math.max(0, pAssets - pDebts - pDomDed);
  const recipientNfpCad = Math.max(0, rAssets - rDebts - rDomDed);

  let equalizationPaymentCad = 0;
  let payingParty = 'None';
  let equalizationStatutoryBasis = '';

  if (isCommonLaw && prov === 'ON') {
    equalizationPaymentCad = 0;
    equalizationStatutoryBasis = 'Ontario FLA Part I Property Equalization DOES NOT apply to common-law spouses! Common-law partners do not have a statutory right to property division, regardless of relationship length. Property claims require equitable trust litigation (unjust enrichment / joint family venture).';
  } else {
    const nfpDiff = payerNfpCad - recipientNfpCad;
    if (nfpDiff > 0) {
      equalizationPaymentCad = Math.round(nfpDiff / 2);
      payingParty = 'Payer to Recipient';
      equalizationStatutoryBasis = `Ontario FLA s. 5(1): Payer owes an equalization payment of $${equalizationPaymentCad.toLocaleString('en-CA')} CAD to equalize Net Family Properties.`;
    } else if (nfpDiff < 0) {
      equalizationPaymentCad = Math.round(Math.abs(nfpDiff) / 2);
      payingParty = 'Recipient to Payer';
      equalizationStatutoryBasis = `Ontario FLA s. 5(1): Recipient owes an equalization payment of $${equalizationPaymentCad.toLocaleString('en-CA')} CAD to equalize Net Family Properties.`;
    } else {
      equalizationPaymentCad = 0;
      payingParty = 'None';
      equalizationStatutoryBasis = 'Net Family Properties are exactly equal ($0 equalization owing).';
    }
  }

  // 4. Action Plan & Legal Roadmap
  const actionPlan = [
    {
      step: 1,
      title: 'Complete Full Financial Disclosure (Form 13 / 13.1)',
      action: 'Both parties must complete comprehensive sworn financial statements itemizing all bank accounts, pensions, real estate, debts, and foreign worldwide property.'
    },
    {
      step: 2,
      title: 'Obtain Valuation of Foreign & Real Property at Separation Date',
      action: 'Obtain certified appraisal for the matrimonial home and convert foreign asset values to Canadian dollars using Bank of Canada exchange rates on the valuation date.'
    },
    {
      step: 3,
      title: 'Calculate Child Support Using Presumptive Tables',
      action: `Establish child support of ~$${monthlyChildSupportCad}/month based on CRA Notice of Assessment Line 15000 total income under CSG s. 3.`
    },
    {
      step: 4,
      title: 'Draft Separation Agreement or Seek Family Arbitration',
      action: 'Formalize custody, spousal support, and property equalization in a legally binding Domestic Contract with Independent Legal Advice (ILA) on both sides.'
    }
  ];

  const warnings = [
    'Foreign Worldwide Assets: Canadian family law requires disclosure of all global assets; hiding foreign property constitutes bad faith, grounds for setting aside agreements, and severe costs awards.',
    'Matrimonial Home Trap: Under Ontario FLA s. 4(1), a spouse cannot deduct the date-of-marriage value of a home owned prior to marriage if it was the matrimonial home on the date of separation.',
    'Sponsorship Undertaking Warning: A 3-year spousal sponsorship undertaking is an unconditional debt to the Crown under IRPA s. 132; divorce or family court orders do not terminate this liability if the sponsored spouse claims social assistance.'
  ];

  return {
    clientName: cleanClientName,
    assessmentDate: cleanAssessmentDate,
    province: prov,
    maritalStatus: status,
    relationshipYears: years,
    childSupport: {
      numberOfChildren: kids,
      parentingArrangement: parenting,
      monthlyTableAmountCad: monthlyChildSupportCad,
      annualChildSupportCad: monthlyChildSupportCad * 12,
      statutoryBasis: childSupportMethod
    },
    spousalSupport: {
      isEligible: isEligibleForSpousalSupport,
      statusDetail: spousalSupportStatusDetail,
      grossIncomeDifferenceAnnualCad: grossDifferenceCad,
      monthlySupportRangeCad: {
        low: ssagMonthlyLowCad,
        high: ssagMonthlyHighCad
      },
      durationRangeYears: {
        low: ssagDurationLowYears,
        high: ssagDurationHighYears,
        isIndefinite: isIndefiniteDuration
      },
      guidelinesFormula: 'Spousal Support Advisory Guidelines (SSAG) Without Child Support Formula (1.5% to 2.0% per year of cohabitation)'
    },
    propertyEqualization: {
      payerNfpCad,
      recipientNfpCad,
      equalizationPaymentCad,
      payingParty,
      statutoryBasis: equalizationStatutoryBasis
    },
    newcomerSpecificAudits: {
      hasForeignWorldwideAssets: foreignAssets,
      foreignAssetRule: 'Full global asset disclosure is mandatory under family court rules; foreign real estate and bank accounts are included in Net Family Property.',
      hasActiveSponsorshipUndertaking: sponsorship,
      sponsorshipLiabilityWarning: sponsorship
        ? 'Active IRPA s. 132 Undertaking: You remain personally liable to reimburse the federal/provincial government for any social assistance benefits collected by your sponsored ex-spouse for 3 years post-landing.'
        : 'No active immigration sponsorship undertaking reported.'
    },
    actionPlan,
    warnings,
    statutoryCitations: [
      'Federal Divorce Act, R.S.C. 1985, c. 3 (2nd Supp.), ss. 15.1, 15.2 (Support Orders)',
      'Federal Child Support Guidelines (SOR/97-175), ss. 3, 7, 9 (Presumptive Tables & Shared Custody)',
      'Department of Justice Canada, Spousal Support Advisory Guidelines (SSAG)',
      'Ontario Family Law Act, R.S.O. 1990, c. F.3, Part I (Equalization of Net Family Property)',
      'Ontario Family Law Act, Part II, ss. 19, 21 (Matrimonial Home Rights)',
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 132 (Sponsorship Liability)'
    ]
  };
}
