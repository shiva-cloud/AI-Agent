// src/moving-tax-navigator.js
// Canadian Newcomer Moving Expenses Deduction & CRA Form T1-M Relocation Engine.
// Governed under Income Tax Act (ITA) s. 62, s. 63 & CRA Income Tax Folio S1-F3-C4.
// Pure ES module with zero npm dependencies.
import { boundedText, safeIsoDate } from './text-input.js';

export const MOVING_TAX_CONSTANTS = {
  STATUTES: {
    ITA_MOVING_DEDUCTION: 'Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.)), s. 62(1)',
    ITA_CARRY_FORWARD: 'Income Tax Act s. 62(1)(d) (indefinite carry-forward against new location income)',
    ITA_TEMPORARY_LIVING_CAP: 'Income Tax Act s. 62(3)(c) (maximum 15 days of temporary accommodation & meals)',
    ITA_LEASE_CANCELLATION: 'Income Tax Act s. 62(3)(d) (lease termination penalty deduction)',
    ITA_40KM_RULE: 'Income Tax Act s. 62(1)(c) (40-kilometre distance requirement)',
    CRA_FORM_T1M: 'CRA Form T1-M (Claim for Moving Expenses Deductions) & T1 Return Line 21900',
    CRA_FOLIO: 'CRA Income Tax Folio S1-F3-C4 (Moving Expenses - Moves to or from Canada)'
  },
  MEAL_SIMPLIFIED_RATE_CAD_PER_DAY: 69.00, // CRA flat rate $23/meal x 3 meals/day per person
  MAX_TEMPORARY_LIVING_DAYS: 15,
  MINIMUM_DISTANCE_KM: 40,
  PROVINCIAL_VEHICLE_RATES_CENTS_PER_KM: {
    ON: 70.0,
    BC: 68.0,
    AB: 66.0,
    QC: 67.5,
    MB: 65.0,
    SK: 65.5,
    NS: 69.0,
    NB: 68.5,
    NL: 71.0,
    PE: 68.0,
    NT: 75.0,
    YT: 74.0,
    NU: 82.0
  },
  DEFAULT_MARGINAL_TAX_RATES: {
    ON: 43.41,
    BC: 40.70,
    AB: 38.00,
    QC: 47.46,
    MB: 43.40,
    SK: 40.50,
    NS: 47.00,
    NB: 46.50,
    NL: 48.30,
    PE: 47.20,
    NT: 38.00,
    YT: 37.00,
    NU: 36.00
  }
};

/**
 * Assesses newcomer eligibility for the CRA Form T1-M Moving Expense Deduction (ITA s. 62),
 * computes line-by-line deductions, evaluates the 15-day temporary living cap,
 * determines the allowable Year 1 deduction vs carry-forward, and provides an audit defense checklist.
 * 
 * @param {object} input
 * @returns {object} Detailed moving tax assessment and Form T1-M mapping
 */
export function assessMovingExpenses(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  let {
    applicantName = 'Taxpayer',
    province = 'ON',
    relocationPurpose = 'employment', // 'employment', 'business', 'student_post_secondary', 'personal'
    oldCountry = 'United States',
    oldCity = 'Seattle',
    newCity = 'Vancouver',
    distanceKm = 230,
    arrivalDateStr = '2026-08-01',
    canadianIncomeEarnedInYearCad = 0,
    travelExpensesCad = 0,
    moversAndShippingCad = 0,
    temporaryLivingDays = 0,
    temporaryLivingDailyCostCad = 0,
    leaseCancellationPenaltyCad = 0,
    utilityAndAddressChangeFeesCad = 0,
    otherIncidentalCostsCad = 0,
    employerReimbursementCad = 0,
    marginalTaxRatePercent = null,
    assessmentDate
  } = safeParams;
  const cleanApplicantName = boundedText(applicantName, 'Taxpayer', 100);
  const cleanPurpose = boundedText(relocationPurpose, 'employment', 40);
  oldCountry = boundedText(oldCountry, 'United States', 80);
  oldCity = boundedText(oldCity, 'Seattle', 80);
  newCity = boundedText(newCity, 'Vancouver', 80);
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  
  const safeDistance = Math.max(0, Math.min(100000, Number(distanceKm) || 0));
  const safeIncome = Math.max(0, Math.min(1000000000, Number(canadianIncomeEarnedInYearCad) || 0));

  const safeArrivalDate = safeIsoDate(arrivalDateStr, '2026-08-01');
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');

  // 1. Eligibility Tests under ITA s. 62 & Folio S1-F3-C4
  const meetsDistanceRule = safeDistance >= MOVING_TAX_CONSTANTS.MINIMUM_DISTANCE_KM;
  const isQualifyingPurpose = cleanPurpose === 'employment' || cleanPurpose === 'business' || cleanPurpose === 'student_post_secondary';
  
  const isEligible = meetsDistanceRule && isQualifyingPurpose;
  let eligibilityVerdict = 'ELIGIBLE_FOR_T1M_DEDUCTION';

  if (!meetsDistanceRule) {
    eligibilityVerdict = 'FAILED_40KM_DISTANCE_TEST';
  } else if (!isQualifyingPurpose) {
    eligibilityVerdict = 'INELIGIBLE_NON_QUALIFYING_PURPOSE';
  }

  // 2. Expense Evaluation & Statutory Capping
  const rawTravel = Math.max(0, Math.min(1000000000, Number(travelExpensesCad) || 0));
  const rawShipping = Math.max(0, Math.min(1000000000, Number(moversAndShippingCad) || 0));
  const rawLivingDays = Math.max(0, Math.min(365, parseInt(temporaryLivingDays, 10) || 0));
  const rawLivingDaily = Math.max(0, Math.min(1000000, Number(temporaryLivingDailyCostCad) || 0));
  const rawLeasePenalty = Math.max(0, Math.min(10000000, Number(leaseCancellationPenaltyCad) || 0));
  const rawUtility = Math.max(0, Math.min(1000000, Number(utilityAndAddressChangeFeesCad) || 0));
  const rawIncidental = Math.max(0, Math.min(1000000, Number(otherIncidentalCostsCad) || 0));
  const rawReimbursement = Math.max(0, Math.min(1000000000, Number(employerReimbursementCad) || 0));

  // Temporary Living Expense Statutory Cap (ITA s. 62(3)(c): Max 15 days)
  const allowedLivingDays = Math.min(rawLivingDays, MOVING_TAX_CONSTANTS.MAX_TEMPORARY_LIVING_DAYS);
  const excessLivingDays = Math.max(0, rawLivingDays - MOVING_TAX_CONSTANTS.MAX_TEMPORARY_LIVING_DAYS);
  
  const eligibleTemporaryLivingCad = allowedLivingDays * rawLivingDaily;
  const disallowedTemporaryLivingCad = excessLivingDays * rawLivingDaily;

  // Total Gross Eligible Moving Expenses
  const grossEligibleExpensesCad = rawTravel + rawShipping + eligibleTemporaryLivingCad + rawLeasePenalty + rawUtility + rawIncidental;
  
  // Net Eligible Expenses after Employer Reimbursement (Line 10 of Form T1-M)
  const netEligibleExpensesCad = Math.max(0, grossEligibleExpensesCad - rawReimbursement);

  // 3. Year 1 Claim vs Indefinite Carry-Forward (ITA s. 62(1)(d))
  // The deduction cannot exceed income earned at the new location in the year of the move.
  let deductibleInCurrentTaxYearCad = 0;
  let carryForwardToFutureYearsCad = 0;

  if (isEligible) {
    deductibleInCurrentTaxYearCad = Math.min(netEligibleExpensesCad, safeIncome);
    carryForwardToFutureYearsCad = Math.max(0, netEligibleExpensesCad - safeIncome);
  }

  // 4. Marginal Tax Benefit Calculation
  const marginalRate = marginalTaxRatePercent !== null && !isNaN(marginalTaxRatePercent)
    ? Number(marginalTaxRatePercent)
    : (MOVING_TAX_CONSTANTS.DEFAULT_MARGINAL_TAX_RATES[prov] || 43.41);

  const estimatedTaxRefundYear1Cad = Math.round(deductibleInCurrentTaxYearCad * (marginalRate / 100));
  const estimatedFutureTaxRefundCad = Math.round(carryForwardToFutureYearsCad * (marginalRate / 100));
  const totalTaxBenefitCad = estimatedTaxRefundYear1Cad + estimatedFutureTaxRefundCad;

  // 5. Line-by-Line CRA Form T1-M Mapping
  const formT1MMapping = {
    formName: 'CRA Form T1-M (Claim for Moving Expenses Deductions)',
    taxReturnLine: 'Line 21900 of Federal T1 General Return',
    line1TransportationAndStorageCad: rawShipping,
    line2TravelExpensesCad: rawTravel,
    line3TemporaryLivingExpensesCad: eligibleTemporaryLivingCad,
    line4LeaseCancellationCostCad: rawLeasePenalty,
    line5IncidentalCostsCad: rawUtility + rawIncidental,
    line8TotalGrossMovingExpensesCad: grossEligibleExpensesCad,
    line9EmployerReimbursementCad: rawReimbursement,
    line10NetMovingExpensesCad: netEligibleExpensesCad,
    line11NetEligibleIncomeAtNewLocationCad: safeIncome,
    line12DeductionClaimedCurrentYearCad: deductibleInCurrentTaxYearCad,
    line13AllowableCarryForwardCad: carryForwardToFutureYearsCad
  };

  // 6. Audit Triggers and Warnings
  const auditWarnings = [];

  if (excessLivingDays > 0) {
    auditWarnings.push({
      rule: 'ITA s. 62(3)(c) 15-Day Temporary Living Cap Exceeded',
      severity: 'high',
      details: `You entered ${rawLivingDays} days of temporary accommodation. By law, CRA restricts temporary living near the new or old residence to a strict maximum of 15 days. ${excessLivingDays} days ($${disallowedTemporaryLivingCad.toFixed(2)}) were automatically excluded from your claim.`
    });
  }

  if (rawReimbursement > 0 && rawReimbursement >= grossEligibleExpensesCad) {
    auditWarnings.push({
      rule: 'Full Employer Reimbursement Offset',
      severity: 'medium',
      details: `Your employer reimbursed $${rawReimbursement.toLocaleString()} CAD. Since your reimbursement meets or exceeds your eligible moving expenses, you have $0 net moving deduction.`
    });
  }

  if (safeIncome < netEligibleExpensesCad && isEligible) {
    auditWarnings.push({
      rule: 'ITA s. 62(1)(d) Income Limitation & Carry-Forward Trigger',
      severity: 'info',
      details: `Your Canadian income earned at the new location ($${safeIncome.toLocaleString()}) is less than your total moving expenses ($${netEligibleExpensesCad.toLocaleString()}). You can deduct $${deductibleInCurrentTaxYearCad.toLocaleString()} this tax year, and the remaining $${carryForwardToFutureYearsCad.toLocaleString()} carries forward indefinitely to subsequent tax years.`
    });
  }

  // 7. Statutory Advisories & Non-Deductible Traps
  const statutoryAdvisories = [
    'IMMIGRATION & VISA FEES ARE NOT DEDUCTIBLE: The CRA has established that IRCC application fees, biometrics, language tests (IELTS/CELPIP), and ECA evaluation fees are not deductible moving expenses under ITA s. 62.',
    '40-KM STATUTORY DISTANCE MANDATE: Under ITA s. 62(1)(c), the move must bring you at least 40 kilometres closer to your new workplace or post-secondary school.',
    'KEEP ALL RECEIPTS FOR 6 YEARS: Do not attach Form T1-M or receipts to your initial online tax return (NETFILE), but retain all flight receipts, mover bills, and rental agreements for at least 6 years. CRA routinely audits moving deductions for newcomers.',
    'SIMPLIFIED VS DETAILED MEALS: CRA allows a simplified meal rate of $23/meal (up to $69/day per person) without keeping detailed food receipts during transit. However, you must prove the dates and travel duration with tickets or hotel receipts.',
    'INDEFINITE CARRY-FORWARD: Unlike many tax credits that expire, unused moving expenses under ITA s. 62(1)(d) never expire and can be deducted against employment income at the new location in future tax years.'
  ];

  const documentationChecklist = [
    'Airline boarding passes and electronic ticket receipts for all moving family members',
    'Commercial mover bill of lading, sea freight cargo invoices, and in-transit storage receipts (up to 2 months max)',
    'Hotel or short-term rental receipts showing exact check-in and check-out dates (capped at 15 days)',
    'Written confirmation / receipt of lease cancellation penalty paid to the previous landlord',
    'T4 slip from the new Canadian employer confirming employment earnings at the new work location',
    'Utility disconnection notices from old residence and connection statements from new Canadian residence'
  ];

  return {
    applicantName: cleanApplicantName,
    arrivalDate: safeArrivalDate,
    assessmentDate: safeAssessmentDate,
    province: prov,
    relocationPurpose: cleanPurpose,
    oldResidence: `${oldCity}, ${oldCountry}`,
    newResidenceCity: newCity,
    distanceKm: safeDistance,
    meetsDistanceRule,
    isEligible,
    eligibilityVerdict,
    grossEligibleExpensesCad,
    employerReimbursementCad: rawReimbursement,
    netEligibleExpensesCad,
    disallowedTemporaryLivingCad,
    canadianIncomeEarnedInYearCad: safeIncome,
    deductibleInCurrentTaxYearCad,
    carryForwardToFutureYearsCad,
    marginalTaxRatePercent: marginalRate,
    estimatedTaxRefundYear1Cad,
    estimatedFutureTaxRefundCad,
    totalTaxBenefitCad,
    formT1MMapping,
    auditWarnings,
    documentationChecklist,
    statutoryAdvisories
  };
}

export const evaluateMovingExpensesDeduction = assessMovingExpenses;
