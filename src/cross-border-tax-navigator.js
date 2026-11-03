/**
 * Cross-Border Asset Transfer & FBAR / T1135 Multi-Jurisdiction Foreign Tax Filing Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Canada Revenue Agency (CRA) & Income Tax Act (ITA), R.S.C. 1985, c. 1 (5th Supp.):
 *   - s. 233.3 (Form T1135 Foreign Income Verification Statement; $100,000 CAD threshold)
 *   - s. 233.3(1) (First-year newcomer statutory exemption from Form T1135)
 *   - s. 162(7) (Failure to file information return penalties: $25/day up to $2,500/year)
 *   - s. 162(10) (Gross negligence penalties for failure to report foreign property)
 *   - s. 128.1 (Deemed disposition and departure tax rules for emigrants)
 * - United States Internal Revenue Service (IRS) & US Department of the Treasury:
 *   - 31 U.S.C. § 5314 & 31 C.F.R. § 1010.350 (FinCEN Form 114 / FBAR; $10,000 USD aggregate peak threshold)
 *   - 26 U.S.C. § 6038D (Form 8938 Statement of Specified Foreign Financial Assets)
 *   - 26 U.S.C. §§ 1291-1298 (Passive Foreign Investment Company / PFIC punitive taxation on Canadian mutual funds/ETFs; Form 8621)
 *   - 26 U.S.C. §§ 6048 & 679 (Foreign trust rules impacting Canadian TFSAs and RESPs; Forms 3520 and 3520-A)
 *   - Canada-United States Convention with Respect to Taxes on Income and on Capital (Treaty Article XVIII for RRSPs/RRIFs)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const CROSS_BORDER_CONSTANTS = Object.freeze({
  CRA_T1135_COST_THRESHOLD_CAD: 100000,
  CRA_T1135_DETAILED_THRESHOLD_CAD: 250000,
  CRA_T1135_DAILY_PENALTY_CAD: 25,
  CRA_T1135_MAX_STANDARD_PENALTY_CAD: 2500,
  US_FBAR_AGGREGATE_THRESHOLD_USD: 10000,
  US_FORM_8938_EXPAT_SINGLE_YEAR_END_USD: 200000,
  US_FORM_8938_EXPAT_SINGLE_PEAK_USD: 300000,
  US_FORM_8938_EXPAT_MFJ_YEAR_END_USD: 400000,
  US_FORM_8938_EXPAT_MFJ_PEAK_USD: 600000
});

export const SPECIFIED_FOREIGN_PROPERTY_RULES = Object.freeze({
  INCLUDED: [
    'Funds in offshore or foreign bank accounts',
    'Shares of non-resident corporations (even if held through Canadian brokerages)',
    'Indebtedness owed by non-residents (foreign bonds, promissory notes)',
    'Interests in non-resident trusts',
    'Real property situated outside Canada that is rented or held for investment',
    'Cryptocurrency and digital assets held with foreign exchanges or custodians'
  ],
  EXCLUDED: [
    'Property used exclusively in an active business',
    'Personal-use property (vacation home / cottage used primarily for personal enjoyment and not rented for income)',
    'Registered foreign retirement plans recognized under tax treaties',
    'Shares or debt held within Canadian registered accounts (e.g. RRSP, TFSA, FHSA)'
  ]
});

/**
 * Evaluates dual-jurisdiction tax compliance obligations, Form T1135 requirements,
 * US FBAR FinCEN 114 reporting, PFIC Canadian mutual fund pitfalls, and TFSA/RESP foreign trust status.
 */
export function evaluateCrossBorderTaxObligations(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    isCanadianTaxResident = true,
    taxYear = 2026,
    isFirstYearCanadianResident = false,
    foreignPropertyCostAmountCad = 125000,
    hasForeignRentalProperty = false,
    foreignRentalIncomeCad = 0,
    isUsPerson = false, // US citizen, Green Card holder, or dual national
    usFilingStatus = 'single',
    peakForeignAccountsUsd = 15000,
    yearEndForeignAccountsUsd = 12000,
    hasCanadianTfsa = false,
    hasCanadianRrsp = false,
    hasCanadianResp = false,
    hasCanadianFhsa = false,
    holdsCanadianMutualFundsOrEtfs = false,
    daysLateT1135 = 0,
    clientName = 'Cross-Border Client',
    assessmentDate = todayIso()
  } = safeParams;
  const isCadResident = Boolean(isCanadianTaxResident);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const year = Math.max(2000, Math.min(2100, Number.isFinite(Number(taxYear)) ? Math.floor(Number(taxYear)) : 2026));
  const isFirstYear = Boolean(isFirstYearCanadianResident);
  const foreignCostCad = Math.max(0, Math.min(1000000000, Number.isFinite(Number(foreignPropertyCostAmountCad)) ? Number(foreignPropertyCostAmountCad) : 125000));
  const hasRental = Boolean(hasForeignRentalProperty);
  const rentalIncome = Math.max(0, Math.min(1000000000, Number.isFinite(Number(foreignRentalIncomeCad)) ? Number(foreignRentalIncomeCad) : 0));

  const isUs = Boolean(isUsPerson);
  const usStatus = boundedText(usFilingStatus, 'single', 40).toLowerCase();
  const peakUsd = Math.max(0, Math.min(1000000000, Number.isFinite(Number(peakForeignAccountsUsd)) ? Number(peakForeignAccountsUsd) : 15000));
  const yearEndUsd = Math.max(0, Math.min(1000000000, Number.isFinite(Number(yearEndForeignAccountsUsd)) ? Number(yearEndForeignAccountsUsd) : 12000));

  const hasTfsa = Boolean(hasCanadianTfsa);
  const hasRrsp = Boolean(hasCanadianRrsp);
  const hasResp = Boolean(hasCanadianResp);
  const hasFhsa = Boolean(hasCanadianFhsa);
  const holdsPfic = Boolean(holdsCanadianMutualFundsOrEtfs);
  const lateDays = Math.max(0, Math.min(3650, Number.isFinite(Number(daysLateT1135)) ? Math.floor(Number(daysLateT1135)) : 0));

  const safeClient = boundedText(clientName, 'Cross-Border Client', 100);

  const craNotes = [];
  const irsNotes = [];
  const riskFlags = [];
  const actionChecklist = [];

  // ==========================================
  // 1. CRA / Canadian Form T1135 Compliance
  // ==========================================
  let t1135Required = false;
  let t1135Tier = 'none';
  let firstYearExemptionApplied = false;
  let estimatedLatePenaltyCad = 0;

  if (isCadResident) {
    if (isFirstYear) {
      firstYearExemptionApplied = true;
      t1135Required = false;
      craNotes.push(`FIRST-YEAR IMMIGRANT EXEMPTION (ITA s. 233.3(1)): Form T1135 is not required for the tax year in which you first establish Canadian tax residency (${year}). Mandatory reporting commences in the subsequent tax year.`);
      actionChecklist.push({
        item: 'Form T1135 First-Year Exemption',
        jurisdiction: 'CRA',
        urgency: 'advisory',
        description: `Exempt from Form T1135 for tax year ${year}. Establish cost-basis records (fair market value upon arrival) for year ${year + 1}.`
      });
    } else if (foreignCostCad > CROSS_BORDER_CONSTANTS.CRA_T1135_COST_THRESHOLD_CAD) {
      t1135Required = true;
      if (foreignCostCad < CROSS_BORDER_CONSTANTS.CRA_T1135_DETAILED_THRESHOLD_CAD) {
        t1135Tier = 'simplified_part_a';
        craNotes.push(`Form T1135 Simplified Reporting (Part A) applies: Total cost basis is between $100,000 CAD and $249,999 CAD. Check off property categories and report gross income/capital gains without line-by-line foreign entity accounting.`);
      } else {
        t1135Tier = 'detailed_part_b';
        craNotes.push(`Form T1135 Detailed Reporting (Part B) applies: Total cost basis is $250,000 CAD or greater. Requires itemized disclosure of each foreign country, maximum funds held during year, year-end fair market value, and gross income earned.`);
      }

      actionChecklist.push({
        item: 'File CRA Form T1135',
        jurisdiction: 'CRA',
        urgency: 'immediate',
        description: `Submit Form T1135 electronically or by paper with T1 General return on or before April 30 (or June 15 for self-employed individuals).`
      });

      if (lateDays > 0) {
        estimatedLatePenaltyCad = Math.min(
          CROSS_BORDER_CONSTANTS.CRA_T1135_MAX_STANDARD_PENALTY_CAD,
          lateDays * CROSS_BORDER_CONSTANTS.CRA_T1135_DAILY_PENALTY_CAD
        );
        riskFlags.push(`LATE T1135 FILING: Filing is ${lateDays} days late. Under ITA s. 162(7), penalty is $25/day (estimated $${estimatedLatePenaltyCad} CAD penalty accrued). Consider the CRA Voluntary Disclosures Program (VDP) to seek penalty relief.`);
      }
    } else {
      craNotes.push(`Form T1135 is not required: Total cost basis of specified foreign property ($${foreignCostCad} CAD) does not exceed the statutory $100,000 CAD threshold.`);
    }

    if (hasRental) {
      craNotes.push(`Foreign Rental Property: If gross rental income of $${rentalIncome} CAD was earned, it must be reported on Canadian Form T776 (Statement of Real Estate Rentals) regardless of T1135 filing status.`);
    }
  }

  // ==========================================
  // 2. US IRS / FinCEN Obligations (US Persons)
  // ==========================================
  let fbarRequired = false;
  let form8938Required = false;
  let form8938ThresholdUsd = CROSS_BORDER_CONSTANTS.US_FORM_8938_EXPAT_SINGLE_YEAR_END_USD;
  let pficExposure = false;
  let foreignTrustWarning = false;

  if (isUs) {
    // A. FinCEN Form 114 (FBAR)
    if (peakUsd > CROSS_BORDER_CONSTANTS.US_FBAR_AGGREGATE_THRESHOLD_USD) {
      fbarRequired = true;
      irsNotes.push(`FinCEN Form 114 (FBAR) MANDATORY: Aggregate maximum balance of foreign (Canadian) financial accounts was $${peakUsd} USD, exceeding the statutory $10,000 USD peak threshold.`);
      actionChecklist.push({
        item: 'File FinCEN Form 114 (FBAR)',
        jurisdiction: 'IRS',
        urgency: 'immediate',
        description: 'File electronically via BSA E-Filing System by April 15 (automatic extension to October 15). Non-willful penalties exceed $10,000 USD per violation.'
      });
    } else {
      irsNotes.push(`FinCEN Form 114 (FBAR) not triggered: Peak aggregate foreign account balance ($${peakUsd} USD) remained at or below the $10,000 USD threshold.`);
    }

    // B. Form 8938 (FATCA)
    const isMfj = usStatus === 'married_filing_jointly';
    const yearEndThreshold = isMfj
      ? CROSS_BORDER_CONSTANTS.US_FORM_8938_EXPAT_MFJ_YEAR_END_USD
      : CROSS_BORDER_CONSTANTS.US_FORM_8938_EXPAT_SINGLE_YEAR_END_USD;
    const peakThreshold = isMfj
      ? CROSS_BORDER_CONSTANTS.US_FORM_8938_EXPAT_MFJ_PEAK_USD
      : CROSS_BORDER_CONSTANTS.US_FORM_8938_EXPAT_SINGLE_PEAK_USD;

    form8938ThresholdUsd = yearEndThreshold;

    if (yearEndUsd > yearEndThreshold || peakUsd > peakThreshold) {
      form8938Required = true;
      irsNotes.push(`Form 8938 MANDATORY: Foreign financial assets exceed IRS expat thresholds ($${yearEndThreshold}/$${peakThreshold} USD for ${usStatus}). Must attach Form 8938 to Form 1040.`);
      actionChecklist.push({
        item: 'File IRS Form 8938',
        jurisdiction: 'IRS',
        urgency: 'immediate',
        description: 'Attach Form 8938 to annual US Form 1040 federal income tax return.'
      });
    } else {
      irsNotes.push(`Form 8938 not triggered: Assets do not meet the expatriate reporting thresholds ($${yearEndThreshold} year-end / $${peakThreshold} peak USD).`);
    }

    // C. PFIC (Passive Foreign Investment Company) Trap
    if (holdsPfic) {
      pficExposure = true;
      riskFlags.push('HIGH RISK: PFIC EXPOSURE: Canadian mutual funds, pooled funds, and Canadian-domiciled ETFs are classified by the IRS as Passive Foreign Investment Companies (PFICs) under IRC §§ 1291-1298. Subject to highest marginal US tax rates, interest charges, and complex annual Form 8621 filing for EACH fund.');
      actionChecklist.push({
        item: 'Audit Canadian Mutual Funds & ETFs for PFIC Treatment',
        jurisdiction: 'IRS',
        urgency: 'immediate',
        description: 'Consult cross-border CPA to consider Qualified Electing Fund (QEF) election, Mark-to-Market election, or liquidating and switching to US-domiciled ETFs or individual equities.'
      });
    }

    // D. TFSA, RESP & FHSA US Tax Vulnerabilities
    if (hasTfsa) {
      foreignTrustWarning = true;
      riskFlags.push('US TAX TRAP: Canadian Tax-Free Savings Account (TFSA) is NOT recognized by the IRS as tax-exempt under the Canada-US Tax Treaty. Annual income, capital gains, and dividends earned within the TFSA must be reported and taxed on US Form 1040. IRS may also treat TFSAs as foreign grantor trusts requiring Forms 3520 and 3520-A.');
      actionChecklist.push({
        item: 'Review TFSA Holdings for US Persons',
        jurisdiction: 'CROSS_BORDER',
        urgency: 'year_end',
        description: 'Determine whether to collapse TFSA or report investment growth annually on US tax returns to avoid massive foreign trust reporting penalties.'
      });
    }

    if (hasResp) {
      foreignTrustWarning = true;
      riskFlags.push('US TAX TRAP: Registered Education Savings Plan (RESP) is NOT treaty-exempt for US citizens/residents. Government grants (CESG) and investment growth are taxable in the US, and RESPs are frequently classified as foreign trusts (Forms 3520 / 3520-A).');
    }

    if (hasFhsa) {
      riskFlags.push('US TAX TRAP: First Home Savings Account (FHSA) is a newly introduced Canadian registered account not covered under Article XVIII of the US-Canada Tax Treaty. Income earned inside an FHSA is taxable on US Form 1040.');
    }

    if (hasRrsp) {
      irsNotes.push('TREATY PROTECTION (Article XVIII): Canadian RRSPs and RRIFs enjoy automatic tax-deferred status under IRS Rev. Proc. 2014-55. No annual Form 8891 filing is required; US tax is deferred until withdrawal.');
      actionChecklist.push({
        item: 'RRSP / RRIF Treaty Compliance',
        jurisdiction: 'IRS',
        urgency: 'advisory',
        description: 'Account qualifies for US tax deferral under Treaty Article XVIII. Include RRSP balances on FinCEN 114 (FBAR) and Form 8938 if thresholds are met.'
      });
    }
  }

  return {
    clientName: safeClient,
    assessmentDate: safeAssessmentDate,
    taxYear: year,
    isCanadianTaxResident: isCadResident,
    isUsPerson: isUs,
    craAudit: {
      t1135Required,
      t1135Tier,
      firstYearExemptionApplied,
      foreignCostBasisCad: foreignCostCad,
      statutoryThresholdCad: CROSS_BORDER_CONSTANTS.CRA_T1135_COST_THRESHOLD_CAD,
      estimatedLatePenaltyCad,
      notes: craNotes
    },
    irsAudit: {
      isUsPerson: isUs,
      usFilingStatus: usStatus,
      fbarFinCen114Required: fbarRequired,
      peakBalanceReportedUsd: peakUsd,
      fbarThresholdUsd: CROSS_BORDER_CONSTANTS.US_FBAR_AGGREGATE_THRESHOLD_USD,
      form8938Required,
      form8938ThresholdUsd,
      pficExposureWarning: pficExposure,
      foreignTrustWarning,
      notes: irsNotes
    },
    riskFlags,
    actionChecklist
  };
}

/**
 * Generates an executive cross-border dual-jurisdiction tax filing summary memorandum.
 */
export function generateCrossBorderMemorandum({
  clientName = 'Cross-Border Client',
  taxYear = 2026,
  craT1135Required = false,
  fbarRequired = false,
  pficExposure = false,
  tfsaWarning = false,
  assessmentDate = todayIso()
} = {}) {
  const name = boundedText(clientName, 'Cross-Border Client', 100);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const year = Number(taxYear) || 2026;

  return [
    '================================================================================',
    'CROSS-BORDER DUAL-JURISDICTION TAX COMPLIANCE MEMORANDUM',
    `Client: ${name} | Tax Year: ${year} | Date: ${safeAssessmentDate} | Legal Authorities: CRA ITA & US IRC / FinCEN`,
    '================================================================================',
    '',
    '1. CANADIAN REVENUE AGENCY (CRA) STATUTORY FILINGS:',
    craT1135Required
      ? '   [REQUIRED] Form T1135 (Foreign Income Verification Statement) due April 30 / June 15.'
      : '   [EXEMPT / NOT REQUIRED] Specified foreign property below $100,000 CAD or first-year exemption active.',
    '   - ITA s. 162(7) imposes a strict $25/day late penalty up to $2,500 CAD.',
    '',
    '2. US INTERNAL REVENUE SERVICE (IRS) & FINCEN FILINGS (US PERSONS):',
    fbarRequired
      ? '   [MANDATORY] FinCEN Form 114 (FBAR) due April 15 (auto-extended to Oct 15).'
      : '   [NOT TRIGGERED] Peak foreign accounts did not exceed $10,000 USD aggregate threshold.',
    pficExposure
      ? '   [CRITICAL WARNING] Canadian Mutual Funds / ETFs detected. Punitive PFIC taxation applies (Form 8621).'
      : '   [PASS] No Canadian mutual fund or ETF PFIC traps detected.',
    tfsaWarning
      ? '   [TAX TRAP ALERT] TFSA/RESP holdings are not tax-deferred under the Canada-US Tax Treaty.'
      : '   [PASS] No non-treaty registered trust accounts detected.',
    '',
    '3. RECOMMENDED REMEDIAL STEPS:',
    '   - Retain all monthly account statements and currency exchange rates (Bank of Canada / IRS Treasury rates).',
    '   - If undisclosed foreign assets exist from prior years, consult a licensed cross-border tax specialist',
    '     regarding the CRA Voluntary Disclosures Program (VDP) or IRS Streamlined Foreign Offshore Procedures.',
    '================================================================================'
  ].join('\n');
}

/**
 * US-Canada Foreign Tax Credit (FTC) & Treaty Article XXIV Elimination of Double Taxation Engine.
 * Evaluates IRS Form 1116 Foreign Tax Credit offset against Canadian taxes paid (ITA s. 126),
 * computes excess credit carryforward under IRC § 904(c), and advises on Form 1040 vs T1 optimization.
 */
export function calculateForeignTaxCreditOptimization({
  cadGrossIncome = 120000,
  cadTaxesPaid = 36000,
  usSourceIncomeUsd = 0,
  cadToUsdRate = 0.74,
  filingStatus = 'single'
} = {}) {
  const cIncome = Math.max(0, Number(cadGrossIncome) || 0);
  const cTax = Math.max(0, Number(cadTaxesPaid) || 0);
  const usSource = Math.max(0, Number(usSourceIncomeUsd) || 0);
  const rate = Number(cadToUsdRate) > 0 ? Number(cadToUsdRate) : 0.74;
  const status = String(filingStatus || 'single').trim().toLowerCase();

  // Convert Canadian income and tax to USD
  const foreignSourceIncomeUsd = Math.round(cIncome * rate);
  const foreignTaxesPaidUsd = Math.round(cTax * rate);
  const worldwideIncomeUsd = foreignSourceIncomeUsd + usSource;

  // 2026 US Federal Standard Deduction estimates
  const standardDeductionUsd = status === 'married_filing_jointly' ? 30000 : 15000;
  const usTaxableIncomeUsd = Math.max(0, worldwideIncomeUsd - standardDeductionUsd);

  // Progressive US Federal Tax Computation (2026 brackets approximation)
  let tentativeUsTaxUsd = 0;
  if (status === 'married_filing_jointly') {
    if (usTaxableIncomeUsd <= 23850) {
      tentativeUsTaxUsd = usTaxableIncomeUsd * 0.10;
    } else if (usTaxableIncomeUsd <= 96950) {
      tentativeUsTaxUsd = 2385 + (usTaxableIncomeUsd - 23850) * 0.12;
    } else if (usTaxableIncomeUsd <= 206700) {
      tentativeUsTaxUsd = 11157 + (usTaxableIncomeUsd - 96950) * 0.22;
    } else {
      tentativeUsTaxUsd = 35302 + (usTaxableIncomeUsd - 206700) * 0.24;
    }
  } else {
    // Single / MFS
    if (usTaxableIncomeUsd <= 11925) {
      tentativeUsTaxUsd = usTaxableIncomeUsd * 0.10;
    } else if (usTaxableIncomeUsd <= 48475) {
      tentativeUsTaxUsd = 1192.5 + (usTaxableIncomeUsd - 11925) * 0.12;
    } else if (usTaxableIncomeUsd <= 103350) {
      tentativeUsTaxUsd = 5578.5 + (usTaxableIncomeUsd - 48475) * 0.22;
    } else {
      tentativeUsTaxUsd = 17651 + (usTaxableIncomeUsd - 103350) * 0.24;
    }
  }
  tentativeUsTaxUsd = Math.round(tentativeUsTaxUsd);

  // Form 1116 Foreign Tax Credit Limitation:
  // FTC Limit = (Foreign Source Taxable Income / Total Taxable Income) * Tentative US Tax
  const foreignIncomeRatio = worldwideIncomeUsd > 0 ? (foreignSourceIncomeUsd / worldwideIncomeUsd) : 1;
  const ftcLimitationUsd = Math.round(tentativeUsTaxUsd * foreignIncomeRatio);

  // Allowable FTC is lesser of Foreign Taxes Paid (in USD) or FTC Limitation
  const allowableForeignTaxCreditUsd = Math.min(foreignTaxesPaidUsd, ftcLimitationUsd);
  const netUsTaxOwedUsd = Math.max(0, tentativeUsTaxUsd - allowableForeignTaxCreditUsd);
  const excessFtcCarryforwardUsd = Math.max(0, foreignTaxesPaidUsd - ftcLimitationUsd);

  const treatyArticleXxivProtection = netUsTaxOwedUsd === 0;

  return {
    filingStatus: status,
    exchangeRateUsed: rate,
    cadGrossIncome: cIncome,
    cadTaxesPaidCad: cTax,
    foreignSourceIncomeUsd,
    foreignTaxesPaidUsd,
    worldwideIncomeUsd,
    standardDeductionUsd,
    usTaxableIncomeUsd,
    tentativeUsTaxUsd,
    irsForm1116: {
      foreignIncomeRatio: Number(foreignIncomeRatio.toFixed(4)),
      ftcLimitationUsd,
      allowableForeignTaxCreditUsd,
      netUsTaxOwedUsd,
      excessFtcCarryforwardUsd,
      carryforwardPeriodYears: 10,
      carrybackPeriodYears: 1,
      statutoryAuthority: '26 U.S.C. § 901, § 904; Canada-US Treaty Article XXIV'
    },
    treatyArticleXxivProtection,
    strategicAdvisories: [
      treatyArticleXxivProtection
        ? 'DOUBLE TAXATION FULLY ELIMINATED: Because your Canadian effective tax rate exceeds the tentative US federal tax rate, your IRS Form 1116 Foreign Tax Credit eliminates your tentative US federal tax liability.'
        : 'RESIDUAL US TAX LIABILITY: A portion of US tax remains owed because US-source income is not offset by Canadian foreign tax credits.',
      excessFtcCarryforwardUsd > 0
        ? `EXCESS FTC CARRYFORWARD ($${excessFtcCarryforwardUsd.toLocaleString()} USD): Under IRC § 904(c), you generate excess foreign tax credits that can be carried back 1 year and carried forward up to 10 years to offset future US taxes on foreign income.`
        : 'Zero excess FTC carryforward generated.',
      'FILING MANDATE: While net US tax liability is $0, you MUST still file IRS Form 1040 and Form 1116 annually. Failure to file forfeits the foreign tax credit and triggers statutory failure-to-file penalties.'
    ]
  };
}
