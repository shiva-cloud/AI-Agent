/**
 * CRA Voluntary Disclosures Program (VDP) & Foreign Income/T1135 Penalty Relief Navigator
 * 
 * Statutory & Administrative Authorities:
 * - Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.)), ss. 220(3.1), 162(7), 162(10), 163(2), 128.1(1)(b), 238, 239
 * - CRA Information Circular IC00-1R6 (Voluntary Disclosures Program)
 * - CRA Form RC199 (Voluntary Disclosures Program (VDP) Application)
 * - Form T1135 (Foreign Income Verification Statement)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const CRA_VDP_CONSTANTS = Object.freeze({
  T1135_REPORTING_THRESHOLD_CAD: 100000,
  T1135_STANDARD_MAX_PENALTY_PER_YEAR_CAD: 2500,
  T1135_DAILY_PENALTY_CAD: 25,
  T1135_GROSS_NEGLIGENCE_MONTHLY_PENALTY_CAD: 500,
  T1135_GROSS_NEGLIGENCE_MAX_PER_YEAR_CAD: 12000,
  GROSS_NEGLIGENCE_TAX_PENALTY_PERCENT: 50,
  VDP_LIMITATION_YEARS: 10,
  ESTIMATED_AVERAGE_TAX_RATE_FOREIGN_INCOME: 0.25
});

/**
 * Diagnostic evaluation of CRA Voluntary Disclosures Program eligibility,
 * T1135 foreign property reporting requirements, newcomer first-year exemption,
 * exposure to statutory penalties, and General vs. Limited track relief under IC00-1R6.
 */
export function evaluateVoluntaryDisclosure(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    landingYear = 2022,
    taxYearsOmitted = [2023, 2024],
    maxForeignCostAmountCad = 175000,
    foreignIncomeAnnualCad = 8000,
    hasCraContactedOrAudited = false,
    hasActiveOffshoreEntitiesOrShellCompanies = false,
    hasT1135BeenFiled = false,
    unreportedDomesticIncomeCad = 0,
    assessmentYear = 2026,
    taxpayerName = 'Taxpayer',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeTaxpayerName = boundedText(taxpayerName, 'Taxpayer', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const lYear = Math.max(1980, Math.min(2035, Number(landingYear) || 2022));
  const aYear = Math.max(2020, Math.min(2040, Number(assessmentYear) || 2026));
  const foreignCost = Math.max(0, Math.min(1000000000, Number(maxForeignCostAmountCad) || 0));
  const annualForeignIncome = Math.max(0, Math.min(100000000, Number(foreignIncomeAnnualCad) || 0));
  const domesticIncome = Math.max(0, Math.min(100000000, Number(unreportedDomesticIncomeCad) || 0));

  const rawYears = Array.isArray(taxYearsOmitted) ? taxYearsOmitted : [taxYearsOmitted];
  const omittedYears = [...new Set(rawYears.map(y => Number(y)).filter(y => y >= 2000 && y <= aYear))].sort((a, b) => a - b).slice(0, 25);

  // 1. T1135 Requirement & First-Year Newcomer Exemption Audit
  const exceedsThreshold = foreignCost >= CRA_VDP_CONSTANTS.T1135_REPORTING_THRESHOLD_CAD;
  const yearlyT1135Audit = omittedYears.map(year => {
    const isLandingYear = year === lYear;
    const isOverdue = (aYear - year) >= 1;
    let t1135Required = false;
    let exemptionReason = null;
    let penaltyExposureCad = 0;

    if (!exceedsThreshold) {
      exemptionReason = `Cost amount ($${foreignCost.toLocaleString('en-CA')} CAD) did not exceed $100,000 CAD reporting threshold.`;
    } else if (isLandingYear) {
      exemptionReason = 'First-year resident exemption: Newcomers are administratively exempt from Form T1135 for the year they become tax resident.';
    } else if (hasT1135BeenFiled) {
      exemptionReason = 'Form T1135 was previously filed for this taxation year.';
    } else {
      t1135Required = true;
      penaltyExposureCad = CRA_VDP_CONSTANTS.T1135_STANDARD_MAX_PENALTY_PER_YEAR_CAD;
    }

    return {
      taxYear: year,
      isLandingYear,
      isOverdue,
      t1135Required,
      exemptionReason,
      potentialPenaltyCad: penaltyExposureCad
    };
  });

  const totalT1135PenaltyExposureCad = yearlyT1135Audit.reduce((sum, item) => sum + item.potentialPenaltyCad, 0);

  // 2. Unreported Income & Gross Negligence Tax Exposure
  const totalUnreportedForeignIncomeCad = annualForeignIncome * omittedYears.length;
  const totalUnreportedIncomeCad = totalUnreportedForeignIncomeCad + domesticIncome;
  const estimatedTaxOwingCad = Math.round(totalUnreportedIncomeCad * CRA_VDP_CONSTANTS.ESTIMATED_AVERAGE_TAX_RATE_FOREIGN_INCOME);
  const potentialGrossNegligencePenaltyCad = Math.round(estimatedTaxOwingCad * (CRA_VDP_CONSTANTS.GROSS_NEGLIGENCE_TAX_PENALTY_PERCENT / 100));
  const totalPotentialPenaltiesWithoutVdpCad = totalT1135PenaltyExposureCad + potentialGrossNegligencePenaltyCad;

  // 3. VDP Five Conditions Evaluation (IC00-1R6)
  const isVoluntary = !hasCraContactedOrAudited;
  const hasPenaltySubjectToRelief = totalPotentialPenaltiesWithoutVdpCad > 0 || omittedYears.length > 0;
  const isOverdueValid = omittedYears.some(y => (aYear - y) >= 1);
  const isWithin10YearLimit = omittedYears.every(y => (aYear - y) <= CRA_VDP_CONSTANTS.VDP_LIMITATION_YEARS);

  const conditions = [
    {
      condition: 'Voluntary Disclosure',
      met: isVoluntary,
      detail: isVoluntary
        ? 'Disclosure initiated before CRA contact, audit, investigation, or enforcement action.'
        : 'CRA contact or audit notice is already active; disclosures made after enforcement commences are not voluntary and face rejection.'
    },
    {
      condition: 'Involves Application of Penalties',
      met: hasPenaltySubjectToRelief,
      detail: hasPenaltySubjectToRelief
        ? `Involves potential failure-to-file penalties (s. 162(7)) or gross negligence penalties (s. 163(2)) totaling ~$${totalPotentialPenaltiesWithoutVdpCad.toLocaleString('en-CA')} CAD.`
        : 'Disclosure must involve potential monetary penalties to qualify for VDP discretion.'
    },
    {
      condition: 'Information at Least One Year Past Due',
      met: isOverdueValid,
      detail: isOverdueValid
        ? 'Includes tax returns or information statements at least one year past the filing due date.'
        : 'All omitted years are current-year returns; current filings are regular filings, not VDP disclosures.'
    },
    {
      condition: 'Full & Complete Information',
      met: true,
      detail: 'Applicant must provide complete facts, foreign bank records, deemed cost base (FMV) on landing, and all previously omitted years.'
    },
    {
      condition: 'Payment Capacity or Arrangement',
      met: true,
      detail: 'Applicant must remit estimated tax owing (~$' + estimatedTaxOwingCad.toLocaleString('en-CA') + ' CAD) or establish a CRA payment arrangement.'
    }
  ];

  const isEligibleForVdp = isVoluntary && hasPenaltySubjectToRelief && isOverdueValid && isWithin10YearLimit;

  // 4. Program Track Classification (General vs Limited Program under IC00-1R6)
  let programTrack = 'General Program';
  let penaltyReliefScope = '';
  let interestReliefScope = '';
  let criminalImmunity = true;

  if (hasActiveOffshoreEntitiesOrShellCompanies) {
    programTrack = 'Limited Program';
    penaltyReliefScope = 'Relief from gross negligence penalties (s. 163(2)). Regular failure-to-file penalties (s. 162(7)) remain payable.';
    interestReliefScope = 'No interest relief. 100% of prescribed compound interest must be paid.';
  } else {
    programTrack = 'General Program';
    penaltyReliefScope = 'Full waiver of all statutory penalties, including Form T1135 late-filing penalties ($2,500/yr) and gross negligence penalties.';
    interestReliefScope = 'Partial interest relief: up to 50% waiver of accrued interest for taxation years preceding the three most recent tax years.';
  }

  // 5. Deemed Cost Base (Fair Market Value Step-Up) Audit
  const costBaseSteppedUp = {
    statutoryBasis: 'Income Tax Act s. 128.1(1)(b) (Deemed Disposition and Reacquisition on Immigrating)',
    rule: 'When you become a Canadian resident, you are deemed to have acquired your foreign properties (shares, rental properties, investments) at Fair Market Value (FMV) on the landing date.',
    practicalImpact: `Your Canadian tax cost base is NOT what you originally bought the asset for overseas; it is reset to its FMV in ${lYear}. Only capital growth occurring after landing is subject to Canadian tax.`
  };

  // 6. Practical Roadmap
  const actionPlan = [
    {
      step: 1,
      title: 'Determine Landing Date Fair Market Value (FMV)',
      action: `Gather valuation evidence or purchase statements establishing FMV for foreign real estate and investment holdings as of your landing year (${lYear}) under ITA s. 128.1(1)(b).`
    },
    {
      step: 2,
      title: 'Reconstruct Annual Foreign Income & Convert to CAD',
      action: 'Convert overseas interest, dividends, and rental revenue into Canadian dollars using Bank of Canada annual average exchange rates for each omitted tax year.'
    },
    {
      step: 3,
      title: 'Complete Form RC199 (VDP Application)',
      action: `Prepare Form RC199 specifying the ${programTrack} track, explaining the inadvertent newcomer non-compliance, and requesting penalty relief under ITA s. 220(3.1).`
    },
    {
      step: 4,
      title: 'Prepare Amended T1 Returns and Forms T1135',
      action: `Prepare revised T1 Adjustment forms (T1-ADJ) or original returns for ${omittedYears.join(', ')} along with Form T1135 Foreign Income Verification Statements.`
    },
    {
      step: 5,
      title: 'Submit Application with Payment or Payment Plan',
      action: `Submit package to the CRA Voluntary Disclosures Program Assistant Director with estimated tax remittance (~$${estimatedTaxOwingCad.toLocaleString('en-CA')} CAD) to satisfy Condition 5.`
    }
  ];

  const warnings = [
    'Submitting a VDP application does not reduce the underlying principal tax payable; only penalties and partial interest can be waived.',
    'If the CRA issues an inquiry letter or audit notice before your RC199 application is stamped as received, the disclosure is no longer voluntary and will be denied.',
    'Newcomers have an administrative exemption from filing Form T1135 in their arrival year, eliminating unnecessary penalties for the landing year.'
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    taxpayerName: safeTaxpayerName,
    eligibility: {
      isEligible: isEligibleForVdp,
      programTrack,
      summary: isEligibleForVdp
        ? `Qualifies for the CRA Voluntary Disclosures Program under the ${programTrack}. Eligible for statutory penalty relief and criminal prosecution protection.`
        : 'Ineligible for VDP relief. Either CRA enforcement action has already commenced or the application does not meet IC00-1R6 statutory conditions.'
    },
    t1135Audit: {
      reportingThresholdCad: CRA_VDP_CONSTANTS.T1135_REPORTING_THRESHOLD_CAD,
      taxpayerCostAmountCad: foreignCost,
      exceedsThreshold,
      landingYear: lYear,
      yearlyAudit: yearlyT1135Audit,
      totalT1135PenaltyExposureCad
    },
    taxAndPenaltyExposure: {
      totalUnreportedForeignIncomeCad,
      totalUnreportedIncomeCad,
      estimatedTaxOwingCad,
      potentialGrossNegligencePenaltyCad,
      totalPotentialPenaltiesWithoutVdpCad
    },
    reliefScope: {
      programTrack,
      penaltyReliefScope,
      interestReliefScope,
      criminalImmunityGranted: isEligibleForVdp ? criminalImmunity : false,
      conditions
    },
    deemedCostBaseRules: costBaseSteppedUp,
    actionPlan,
    warnings,
    statutoryCitations: [
      'Income Tax Act, R.S.C. 1985, c. 1 (5th Supp.), s. 220(3.1) (Ministerial Relief for Penalties and Interest)',
      'Income Tax Act, s. 162(7) & s. 162(10) (Penalties for Failure to File Information Returns / T1135)',
      'Income Tax Act, s. 163(2) (Gross Negligence Penalties)',
      'Income Tax Act, s. 128.1(1)(b) (Deemed Acquisition at Fair Market Value upon Becoming Resident)',
      'CRA Information Circular IC00-1R6 (Voluntary Disclosures Program)'
    ]
  };
}
