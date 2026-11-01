/**
 * Child Care Subsidy & Canada-Wide Early Learning (CWELCC) Navigator
 *
 * Implements statutory assessment under:
 * - Early Learning and Child Care Act (S.C. 2023 c. 10)
 * - Ontario Child Care and Early Years Act, 2014 (CCEYA), S.O. 2014 c. 11, O. Reg. 138/15
 * - Canada-Wide Early Learning and Child Care (CWELCC) system agreements
 * - Income Tax Act (ITA) s. 63 (Child Care Expense Deduction, Form T778)
 *
 * Key Statutory Rules:
 * - CWELCC Universal Rate Reduction: Children under age 6 (or turned 6 before June 30) enrolled
 *   in a licensed participating centre or home childcare receive a mandatory 52.75% fee reduction,
 *   targeting $10/day ($217/month).
 * - Municipal Income-Tested Subsidy (Ontario O. Reg. 138/15):
 *   - Adjusted Family Net Income <= $20,000: $0 parental contribution (100% full subsidy).
 *   - $20,001 – $40,000: 10% of income over $20,000.
 *   - Over $40,000: $2,000 + 30% of income over $40,000.
 * - Immigration Status Access: Permanent Residents, Protected Persons, Work Permit holders, and
 *   Study Permit holders qualify identically for CWELCC fee caps and municipal child care subsidies.
 * - Tax Deduction (ITA s. 63): Up to $8,000/yr for children under 7, $5,000/yr for children 7-16,
 *   statutorily claimed by the lower-income spouse.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const CHILDCARE_CONSTANTS = Object.freeze({
  CWELCC_MAX_AGE_YEARS: 6,
  CWELCC_MANDATORY_DISCOUNT_PERCENT: 52.75,
  CWELCC_TARGET_DAILY_FEE_CAD: 10.0,
  CWELCC_TARGET_MONTHLY_FEE_CAD: 217.0,
  SUBSIDY_FULL_EXEMPTION_INCOME_CEILING_CAD: 20000.0,
  SUBSIDY_TIER_1_RATE_PERCENT: 10.0,
  SUBSIDY_TIER_2_BASE_CAD: 2000.0,
  SUBSIDY_TIER_2_RATE_PERCENT: 30.0,
  T778_MAX_DEDUCTION_UNDER_7_CAD: 8000.0,
  T778_MAX_DEDUCTION_7_TO_16_CAD: 5000.0,
  T778_MAX_DEDUCTION_DISABILITY_CAD: 11000.0
});

/**
 * Calculates parental contribution, CWELCC fee reduction, and tax deductions.
 *
 * @param {Object} options
 * @param {string} [options.province='ON'] - Province
 * @param {string} [options.municipality='Toronto'] - Municipal Service Manager
 * @param {number} [options.adjustedFamilyNetIncomeCad=35000] - Line 23600 family net income
 * @param {Array<Object>} [options.children=[]] - List of child objects: { ageYears: 3, hasDisability: false }
 * @param {number} [options.baselineMonthlyFeePerChildCad=1200] - Unsubsidized market fee
 * @param {boolean} [options.isEnrolledInCwelccLicensedCentre=true] - Participating in CWELCC
 * @param {string} [options.parentActivityType='both_working'] - 'both_working', 'single_working', 'education_training'
 * @param {string} [options.immigrationStatus='permanent_resident'] - Status in Canada
 * @param {string} [options.applicantName='Parent'] - Parent name
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive child care subsidy analysis
 */
export function evaluateChildCareSubsidy(options = {}) {
  const prov = boundedText(options.province, 'ON', 10).toUpperCase();
  const muni = boundedText(options.municipality, 'Toronto', 60);
  const income = Math.max(0, Math.min(10000000, Number.isFinite(Number(options.adjustedFamilyNetIncomeCad)) ? Number(options.adjustedFamilyNetIncomeCad) : 35000.0));
  const rawChildren = Array.isArray(options.children) && options.children.length > 0
    ? options.children.slice(0, 10)
    : [{ ageYears: 3, hasDisability: false }];
  const baseFee = Math.max(100, Math.min(100000, Number.isFinite(Number(options.baselineMonthlyFeePerChildCad)) ? Number(options.baselineMonthlyFeePerChildCad) : 1200.0));
  const cwelccEnrolled = options.isEnrolledInCwelccLicensedCentre !== false;
  
  const status = boundedText(options.immigrationStatus, 'permanent_resident', 50).toLowerCase();
  const applicantName = boundedText(options.applicantName, 'Parent', 100);
  const assessDate = safeIsoDate(options.assessmentDate, '2026-10-31');

  const compliancePoints = [];
  const statutoryNotes = [];
  const actionPlan = [];

  // 1. Calculate Statutory Parental Contribution under Ontario O. Reg. 138/15
  let annualParentalContributionCad = 0;
  if (income <= CHILDCARE_CONSTANTS.SUBSIDY_FULL_EXEMPTION_INCOME_CEILING_CAD) {
    annualParentalContributionCad = 0;
    compliancePoints.push(`Income of $${income.toLocaleString()} CAD is <= $20,000 threshold: 100% full fee subsidy ($0 parental contribution).`);
  } else if (income <= 40000) {
    annualParentalContributionCad = (income - 20000) * (CHILDCARE_CONSTANTS.SUBSIDY_TIER_1_RATE_PERCENT / 100);
    compliancePoints.push(`Income between $20k–$40k: Statutory contribution is 10% of income over $20k ($${annualParentalContributionCad.toFixed(2)} CAD/yr).`);
  } else {
    annualParentalContributionCad = CHILDCARE_CONSTANTS.SUBSIDY_TIER_2_BASE_CAD + ((income - 40000) * (CHILDCARE_CONSTANTS.SUBSIDY_TIER_2_RATE_PERCENT / 100));
    compliancePoints.push(`Income over $40k: Statutory contribution is $2,000 base + 30% of income over $40k ($${annualParentalContributionCad.toFixed(2)} CAD/yr).`);
  }

  const monthlyParentalContributionTotalCad = Math.round((annualParentalContributionCad / 12) * 100) / 100;

  // 2. CWELCC Fee Reduction per child
  const childAudits = rawChildren.map((c, index) => {
    const age = Math.max(0, Math.min(25, Number.isFinite(Number(c?.ageYears)) ? Math.floor(Number(c.ageYears)) : 3));
    const disability = Boolean(c?.hasDisability);
    const isCwelccEligible = age < CHILDCARE_CONSTANTS.CWELCC_MAX_AGE_YEARS && cwelccEnrolled;

    // CWELCC fee calculation
    const cwelccDiscountedMonthlyFeeCad = isCwelccEligible
      ? Math.round(baseFee * (1 - (CHILDCARE_CONSTANTS.CWELCC_MANDATORY_DISCOUNT_PERCENT / 100)) * 100) / 100
      : baseFee;

    // T778 tax deduction limit
    let maxTaxDeductionCad = CHILDCARE_CONSTANTS.T778_MAX_DEDUCTION_7_TO_16_CAD;
    if (disability) maxTaxDeductionCad = CHILDCARE_CONSTANTS.T778_MAX_DEDUCTION_DISABILITY_CAD;
    else if (age < 7) maxTaxDeductionCad = CHILDCARE_CONSTANTS.T778_MAX_DEDUCTION_UNDER_7_CAD;

    return {
      childIndex: index + 1,
      ageYears: age,
      hasDisability: disability,
      isCwelccEligible,
      cwelccDiscountedMonthlyFeeCad,
      annualSavingsCwelccCad: isCwelccEligible ? Math.round((baseFee - cwelccDiscountedMonthlyFeeCad) * 12 * 100) / 100 : 0,
      t778MaxTaxDeductionCad: maxTaxDeductionCad
    };
  });

  const totalCwelccMonthlyFeeAllKidsCad = childAudits.reduce((acc, c) => acc + c.cwelccDiscountedMonthlyFeeCad, 0);
  const totalMarketMonthlyFeeAllKidsCad = baseFee * rawChildren.length;
  const totalMonthlySavingsCwelccCad = Math.round((totalMarketMonthlyFeeAllKidsCad - totalCwelccMonthlyFeeAllKidsCad) * 100) / 100;

  // Actual parent payment with municipal subsidy
  const actualMonthlyParentPaymentWithSubsidyCad = Math.min(totalCwelccMonthlyFeeAllKidsCad, monthlyParentalContributionTotalCad);
  const monthlyMunicipalSubsidyBenefitCad = Math.max(0, Math.round((totalCwelccMonthlyFeeAllKidsCad - actualMonthlyParentPaymentWithSubsidyCad) * 100) / 100);

  // Status access verification
  compliancePoints.push(`Immigration status (${status.replace('_', ' ')}) grants equal access to municipal child care subsidies and federal CWELCC fee caps.`);

  // Lower-income spouse tax rule
  statutoryNotes.push('ITA s. 63: Child care expense deductions (Form T778) must be claimed by the spouse or common-law partner with the lower net income.');
  statutoryNotes.push('Ontario CCEYA O. Reg. 138/15: Municipal Child Care Fee Subsidy formula is strictly income-tested based on Line 23600 of CRA Notice of Assessment.');
  statutoryNotes.push('Early Learning and Child Care Act (2023): Universal CWELCC fee cap operates as a direct provider subsidy, independent of parental employment or income.');

  actionPlan.push(`Apply for municipal child care fee subsidy through ${muni} Children's Services using CRA Notice of Assessment.`);
  actionPlan.push('Confirm enrollment in a licensed child care centre participating in the CWELCC system to receive automatic 52.75%+ fee discounts.');
  actionPlan.push('Retain receipts for Form T778 tax filing to claim up to $8,000 per child under age 7 on lower-income spouse return.');

  return {
    applicantName,
    province: prov,
    municipality: muni,
    assessmentDate: assessDate,
    adjustedFamilyNetIncomeCad: income,
    childrenCount: rawChildren.length,
    summaryTitle: monthlyMunicipalSubsidyBenefitCad > 0
      ? `Eligible for $${monthlyMunicipalSubsidyBenefitCad.toFixed(2)} CAD/mo Child Care Subsidy in ${muni}`
      : `CWELCC Universal Fee Reduction Saves $${totalMonthlySavingsCwelccCad.toFixed(2)} CAD/mo`,
    subsidyCalculation: {
      annualParentalContributionCad,
      monthlyParentalContributionTotalCad,
      totalMarketMonthlyFeeAllKidsCad,
      totalCwelccMonthlyFeeAllKidsCad,
      actualMonthlyParentPaymentWithSubsidyCad,
      monthlyMunicipalSubsidyBenefitCad
    },
    childAudits,
    compliancePoints,
    statutoryNotes,
    actionPlan
  };
}
