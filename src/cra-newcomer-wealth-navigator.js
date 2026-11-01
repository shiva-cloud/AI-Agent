/**
 * Northstar CRA Newcomer Wealth & First Home Navigator
 * Implements statutory calculations for:
 * 1. First Home Savings Account (FHSA) - ITA s. 146.6 ($8k/yr, $40k lifetime, 15-year limit)
 * 2. Home Buyers' Plan (HBP) - ITA s. 146.01 ($60k enhanced RRSP withdrawal, 5-yr repayment grace)
 * 3. Non-Resident TFSA Penalty - ITA s. 207.02 (1% per month penalty tax)
 * 4. Cost Base Step-Up on Landing - ITA s. 128.1(1)(b) (Deemed acquisition at FMV on landing)
 * 5. Form T1135 Foreign Property Reporting - ITA s. 233.3 ($100k threshold & first tax year exemption)
 * 6. Deed of Gift & Overseas Wire AML Proof - PCMLTFA s. 12 (Zero Canadian gift tax, AML audit proof)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const CRA_WEALTH_CONSTANTS = {
  FHSA_ANNUAL_LIMIT_CAD: 8000,
  FHSA_LIFETIME_LIMIT_CAD: 40000,
  FHSA_MAX_CARRYFORWARD_CAD: 8000,
  FHSA_MAX_ANNUAL_WITH_CARRYFORWARD_CAD: 16000,
  FHSA_MAX_HOLDING_YEARS: 15,
  FHSA_TERMINATION_AGE: 71,

  HBP_WITHDRAWAL_LIMIT_CAD: 60000, // Budget 2024 increased from $35,000 for withdrawals after April 16, 2024
  HBP_PRE_2024_LIMIT_CAD: 35000,
  HBP_REPAYMENT_PERIOD_YEARS: 15,
  HBP_TEMPORARY_GRACE_PERIOD_YEARS: 5, // Extended for 2022-2025 withdrawals (normally 2 years)
  HBP_STANDARD_GRACE_PERIOD_YEARS: 2,

  TFSA_NON_RESIDENT_PENALTY_RATE_MONTHLY: 0.01, // 1% per month under ITA s. 207.02

  T1135_REPORTING_THRESHOLD_CAD: 100000, // ITA s. 233.3(1)

  PCMLTFA_LARGE_CASH_OR_WIRE_THRESHOLD_CAD: 10000, // PCMLTFA reporting threshold
};

/**
 * Evaluates FHSA eligibility, contribution room, and tax deductions
 */
export function evaluateFhsaEligibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    isCanadianResidentForTax = true,
    age = 28,
    hasOwnedHomeInPreceding4Years = false,
    unusedCarryforwardFromPriorYearsCad = 0,
    plannedContributionCad = 8000,
    marginalTaxRatePercent = 30
  } = safeParams;
  const safeAge = Math.max(0, Math.min(120, Number.isFinite(Number(age)) ? Math.floor(Number(age)) : 28));
  const isAgeEligible = safeAge >= 18 && safeAge <= CRA_WEALTH_CONSTANTS.FHSA_TERMINATION_AGE;
  const isFirstTimeHomeBuyer = !hasOwnedHomeInPreceding4Years;
  const isEligibleToOpen = isCanadianResidentForTax && isAgeEligible && isFirstTimeHomeBuyer;

  const validCarryforward = Math.min(
    Math.max(0, Number.isFinite(Number(unusedCarryforwardFromPriorYearsCad)) ? Number(unusedCarryforwardFromPriorYearsCad) : 0),
    CRA_WEALTH_CONSTANTS.FHSA_MAX_CARRYFORWARD_CAD
  );
  const maxAllowableContributionCad = Math.min(
    CRA_WEALTH_CONSTANTS.FHSA_ANNUAL_LIMIT_CAD + validCarryforward,
    CRA_WEALTH_CONSTANTS.FHSA_MAX_ANNUAL_WITH_CARRYFORWARD_CAD
  );

  const safePlanned = Math.max(0, Math.min(1000000, Number.isFinite(Number(plannedContributionCad)) ? Number(plannedContributionCad) : 8000));
  const safeMarginal = Math.max(0, Math.min(100, Number.isFinite(Number(marginalTaxRatePercent)) ? Number(marginalTaxRatePercent) : 30));

  const actualContributionCad = Math.min(safePlanned, maxAllowableContributionCad);
  const estimatedTaxRefundCad = Math.round(actualContributionCad * (safeMarginal / 100));

  const issues = [];
  if (!isCanadianResidentForTax) {
    issues.push('Must be a resident of Canada for tax purposes to open and contribute to an FHSA.');
  }
  if (!isAgeEligible) {
    issues.push(`Applicant age (${safeAge}) must be between 18 and 71 years old.`);
  }
  if (!isFirstTimeHomeBuyer) {
    issues.push('Applicant or spouse must not have owned a qualifying home as a principal residence in the current calendar year or preceding 4 calendar years.');
  }

  return {
    isEligible: isEligibleToOpen,
    disqualifications: issues,
    statutoryBasis: 'Income Tax Act (ITA) s. 146.6',
    annualLimitCad: CRA_WEALTH_CONSTANTS.FHSA_ANNUAL_LIMIT_CAD,
    lifetimeLimitCad: CRA_WEALTH_CONSTANTS.FHSA_LIFETIME_LIMIT_CAD,
    maxAllowableContributionThisYearCad: maxAllowableContributionCad,
    actualDeductibleContributionCad: actualContributionCad,
    estimatedTaxSavingsCad: estimatedTaxRefundCad,
    maxHoldingPeriodYears: CRA_WEALTH_CONSTANTS.FHSA_MAX_HOLDING_YEARS,
    notes: 'Contributions are tax-deductible against taxable income. Qualifying withdrawals to buy a first home are non-taxable under statutory guidelines.'
  };
}

/**
 * Evaluates Home Buyers' Plan (HBP) enhanced limits and repayment schedule
 */
export function evaluateHbpWithdrawal(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    rrspBalanceCad = 50000,
    requestedWithdrawalCad = 50000,
    withdrawalDate = '2024-05-01',
    isFirstTimeHomeBuyer = true,
    fundsInRrspForAtLeast90Days = true
  } = safeParams;
  const safeWithdrawalDate = safeIsoDate(withdrawalDate, '2024-05-01');
  const validWithdrawalDate = new Date(Date.parse(safeWithdrawalDate));

  const safeRrspBalanceCad = Math.max(0, Math.min(10000000, Number.isFinite(Number(rrspBalanceCad)) ? Number(rrspBalanceCad) : 50000));
  const safeRequestedWithdrawalCad = Math.max(0, Math.min(10000000, Number.isFinite(Number(requestedWithdrawalCad)) ? Number(requestedWithdrawalCad) : 50000));

  const isPostBudget2024 = validWithdrawalDate >= new Date('2024-04-16');
  const maxHbpLimitCad = isPostBudget2024
    ? CRA_WEALTH_CONSTANTS.HBP_WITHDRAWAL_LIMIT_CAD
    : CRA_WEALTH_CONSTANTS.HBP_PRE_2024_LIMIT_CAD;

  const allowableWithdrawalCad = Math.min(safeRequestedWithdrawalCad, safeRrspBalanceCad, maxHbpLimitCad);
  const issues = [];

  if (!isFirstTimeHomeBuyer) {
    issues.push('Must be a first-time home buyer or separated/divorced to participate in HBP.');
  }
  if (!fundsInRrspForAtLeast90Days) {
    issues.push('Contributions must remain in the RRSP for at least 90 days before withdrawal, or the tax deduction is forfeited under ITA s. 146(5.1).');
  }
  if (safeRequestedWithdrawalCad > maxHbpLimitCad) {
    issues.push(`Requested withdrawal ($${safeRequestedWithdrawalCad.toLocaleString()}) exceeds the statutory HBP limit ($${maxHbpLimitCad.toLocaleString()}).`);
  }

  const withdrawalYear = validWithdrawalDate.getFullYear();
  // Budget 2024 grace extension: withdrawals between Jan 1, 2022 and Dec 31, 2025 get 5-year grace period
  const qualifiesForExtendedGrace = withdrawalYear >= 2022 && withdrawalYear <= 2025;
  const gracePeriodYears = qualifiesForExtendedGrace
    ? CRA_WEALTH_CONSTANTS.HBP_TEMPORARY_GRACE_PERIOD_YEARS
    : CRA_WEALTH_CONSTANTS.HBP_STANDARD_GRACE_PERIOD_YEARS;

  const firstRepaymentYear = withdrawalYear + gracePeriodYears;
  const annualRepaymentRequiredCad = Math.round(allowableWithdrawalCad / CRA_WEALTH_CONSTANTS.HBP_REPAYMENT_PERIOD_YEARS);

  return {
    isEligible: issues.length === 0,
    disqualifications: issues,
    statutoryBasis: 'Income Tax Act (ITA) s. 146.01; Budget 2024 Amendments',
    maxAllowableWithdrawalCad: allowableWithdrawalCad,
    applicableLimitCad: maxHbpLimitCad,
    repaymentTerms: {
      gracePeriodYears,
      firstRepaymentYear,
      repaymentDurationYears: CRA_WEALTH_CONSTANTS.HBP_REPAYMENT_PERIOD_YEARS,
      annualRepaymentRequiredCad
    },
    withholdingTaxRate: '0% (HBP withdrawals are tax-exempt at source)',
    couplingWithFhsa: 'Newcomers can legally combine both FHSA ($40k) and HBP ($60k) for up to $100,000 per person ($200,000 for a couple) toward a first home.'
  };
}

/**
 * Calculates non-resident TFSA contribution penalty tax under ITA s. 207.02
 */
export function evaluateTfsaNonResidentPenalty(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    isCanadianTaxResident = false,
    contributionAmountCad = 5000,
    monthsMaintainedWhileNonResident = 6
  } = safeParams;
  const safeContribution = Math.max(0, Math.min(10000000, Number.isFinite(Number(contributionAmountCad)) ? Number(contributionAmountCad) : 5000));
  const safeMonths = Math.max(0, Math.min(600, Number.isFinite(Number(monthsMaintainedWhileNonResident)) ? Math.floor(Number(monthsMaintainedWhileNonResident)) : 6));

  if (isCanadianTaxResident) {
    return {
      isPenaltyApplicable: false,
      penaltyTaxOwedCad: 0,
      statutoryBasis: 'Income Tax Act (ITA) s. 207.02',
      summary: 'Canadian tax residents are not subject to the 1% non-resident TFSA penalty tax.'
    };
  }

  const monthlyRate = CRA_WEALTH_CONSTANTS.TFSA_NON_RESIDENT_PENALTY_RATE_MONTHLY;
  const penaltyTaxOwedCad = Math.round(safeContribution * monthlyRate * safeMonths);

  return {
    isPenaltyApplicable: true,
    statutoryBasis: 'Income Tax Act (ITA) s. 207.02',
    contributionAmountCad: safeContribution,
    monthsSubjectToPenalty: safeMonths,
    monthlyPenaltyPercent: '1% per month',
    penaltyTaxOwedCad,
    remedySteps: [
      'Immediately withdraw the contribution from the TFSA to stop the 1% monthly penalty accrual.',
      'File CRA Form RC243 (Tax Return for Tax-Free Savings Account) for each relevant calendar year.',
      'File CRA Form RC4288 (Request for Taxpayer Relief - Cancel or Waive Penalties) explaining that the non-resident contribution was an inadvertent error upon arrival.'
    ]
  };
}

/**
 * Evaluates foreign property step-up to FMV and Form T1135 reporting requirements
 */
export function evaluateForeignPropertyAndLandingStepUp(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    landingDate = '2025-06-15',
    foreignPropertyOriginalCostCad = 250000,
    foreignPropertyFmvAtLandingCad = 450000,
    taxYearToAssess = 2025,
    isPersonalUseRealEstate = false
  } = safeParams;
  const safeLandingDate = safeIsoDate(landingDate, '2025-06-15');
  const validLandingDate = new Date(Date.parse(safeLandingDate));

  const origCost = Math.max(0, Math.min(1000000000, Number.isFinite(Number(foreignPropertyOriginalCostCad)) ? Number(foreignPropertyOriginalCostCad) : 250000));
  const fmvLanding = Math.max(0, Math.min(1000000000, Number.isFinite(Number(foreignPropertyFmvAtLandingCad)) ? Number(foreignPropertyFmvAtLandingCad) : 450000));
  const assessYear = Math.max(1900, Math.min(2100, Number.isFinite(Number(taxYearToAssess)) ? Math.floor(Number(taxYearToAssess)) : 2025));

  // Step-up to Fair Market Value under ITA s. 128.1(1)(b)
  const deemedAcquisitionCostCad = fmvLanding;
  const preLandingUnrealizedGainShelteredFromCanadaCad = Math.max(0, fmvLanding - origCost);

  const landingYear = validLandingDate.getFullYear();
  const isFirstTaxYearInCanada = assessYear === landingYear;

  // Form T1135 reporting rule under ITA s. 233.3:
  // First-year exception: Individuals are exempt from filing Form T1135 in the year they immigrate to Canada.
  const exceedsThreshold = deemedAcquisitionCostCad >= CRA_WEALTH_CONSTANTS.T1135_REPORTING_THRESHOLD_CAD;
  const t1135RequiredThisYear = exceedsThreshold && !isFirstTaxYearInCanada && !isPersonalUseRealEstate;

  return {
    landingCostBaseStepUp: {
      statutoryBasis: 'Income Tax Act (ITA) s. 128.1(1)(b) Deemed Acquisition',
      originalHistoricalCostCad: origCost,
      deemedCostBaseOnLandingCad: deemedAcquisitionCostCad,
      preLandingAccruedGainsShelteredCad: preLandingUnrealizedGainShelteredFromCanadaCad,
      explanation: 'Under ITA s. 128.1(1)(b), newcomers are deemed to have acquired their foreign property at Fair Market Value on the day they become Canadian tax residents. Canada will ONLY tax capital gains accrued AFTER landing date.'
    },
    t1135ReportingAudit: {
      statutoryBasis: 'Income Tax Act (ITA) s. 233.3(1)',
      reportingThresholdCad: CRA_WEALTH_CONSTANTS.T1135_REPORTING_THRESHOLD_CAD,
      isFirstYearExemptionApplicable: isFirstTaxYearInCanada,
      isPersonalUseExempt: isPersonalUseRealEstate,
      isT1135FilingMandatoryThisYear: t1135RequiredThisYear,
      penaltyForNonFiling: 'Late filing penalty is $25 per day up to $2,500 per year under ITA s. 162(7); gross negligence penalty up to $500 per month for up to 24 months ($12,000).'
    }
  };
}

/**
 * Validates overseas wire transfer, parental gift legality, and AML defense
 */
export function evaluateOverseasGiftAndAmlProof(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    giftAmountCad = 80000,
    relationshipToDonor = 'parent',
    hasSignedDeedOfGift = true,
    hasBankConfirmationWireSlip = true
  } = safeParams;
  const safeRelationship = boundedText(relationshipToDonor, 'parent', 50).toLowerCase();
  const safeGiftAmountCad = Math.max(0, Math.min(1000000000, Number.isFinite(Number(giftAmountCad)) ? Number(giftAmountCad) : 80000));

  const isFamilyMember = ['parent', 'grandparent', 'sibling', 'child', 'spouse'].includes(safeRelationship);
  const exceedsAmlFintracThreshold = safeGiftAmountCad >= CRA_WEALTH_CONSTANTS.PCMLTFA_LARGE_CASH_OR_WIRE_THRESHOLD_CAD;

  const isCompliant = hasSignedDeedOfGift && hasBankConfirmationWireSlip;

  return {
    isTaxableInCanada: false,
    relationshipToDonor: safeRelationship,
    isFamilyMember,
    taxReasoning: 'Canada has NO gift tax or inheritance tax. Bona fide gifts received from family overseas are non-taxable receipts under the Income Tax Act.',
    fintracAmlAudit: {
      statutoryBasis: 'Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA) s. 12',
      exceedsFintracReportingThreshold: exceedsAmlFintracThreshold,
      isAuditReady: isCompliant,
      requiredDocumentation: [
        'Signed and dated Deed of Gift stating funds are an irrevocable gift without expectation of repayment or commercial consideration.',
        'Official overseas bank wire transfer confirmation showing sender name, receiver name, and timestamp.',
        'Proof of identity of donor (passport copy or national ID) to satisfy FINTRAC/FIs.'
      ],
      warningIfUnproven: 'Without a contemporaneously signed Deed of Gift, CRA may audit and arbitrarily recharacterize foreign deposits as undeclared foreign business or employment income under ITA s. 152(4).'
    }
  };
}

/**
 * Combined master wealth evaluator
 */
export function evaluateNewcomerWealthPlan(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const applicantName = boundedText(safeInput.applicantName, 'Newcomer Taxpayer', 100);
  const assessmentDate = safeIsoDate(safeInput.assessmentDate || safeInput.evaluatedAt, '2026-10-31');
  const fhsa = evaluateFhsaEligibility(safeInput.fhsa || {});
  const hbp = evaluateHbpWithdrawal(safeInput.hbp || {});
  const tfsaPenalty = evaluateTfsaNonResidentPenalty(safeInput.tfsa || {});
  const foreignProp = evaluateForeignPropertyAndLandingStepUp(safeInput.foreignProperty || {});
  const giftAml = evaluateOverseasGiftAndAmlProof(safeInput.gift || {});

  return {
    applicantName,
    assessmentDate,
    evaluatedAt: assessmentDate,
    jurisdiction: 'Canada Federal (CRA / FINTRAC)',
    firstHomeStrategies: {
      fhsa,
      hbp,
      combinedPurchasingPowerCad: (fhsa.actualDeductibleContributionCad || 0) + (hbp.maxAllowableWithdrawalCad || 0)
    },
    taxCompliance: {
      tfsaPenalty,
      foreignProp,
      giftAml
    }
  };
}
