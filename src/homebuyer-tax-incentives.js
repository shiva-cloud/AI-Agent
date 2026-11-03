/**
 * Northstar — First-Time Home Buyer Tax Incentives, FHSA & RRSP HBP Tax Engine
 *
 * Implements statutory tax rules under:
 * - Income Tax Act (ITA), RSC 1985, c. 1 (5th Supp.):
 *   - s. 146.6 (First Home Savings Account - FHSA $8k/yr, $40k lifetime, tax-free qualifying withdrawal)
 *   - s. 146(5.1) (Home Buyers' Plan - HBP 2024 Budget increase from $35k to $60k per person, 5-yr repayment grace)
 *   - s. 118.05 (First-Time Home Buyers' Tax Credit - HBTC Line 31270: $10,000 amount = $1,500 federal tax relief)
 * - Ontario Land Transfer Tax Act, RSO 1990, c. L.6, s. 9.1 ($4,000 provincial LTT rebate)
 * - City of Toronto Municipal Code, Chapter 760 ($4,475 municipal MLTT rebate = $8,475 total Toronto rebate)
 * - BC Property Transfer Tax Act, RSBC 1996, c. 378, s. 5 (First Time Home Buyers' Program threshold $835k-$860k)
 *
 * Pure ES module with zero npm runtime dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const HOMEBUYER_CONSTANTS = {
  FHSA_ANNUAL_LIMIT_CAD: 8000,
  FHSA_LIFETIME_LIMIT_CAD: 40000,
  FHSA_MAX_CARRYFORWARD_CAD: 8000,
  HBP_MAX_WITHDRAWAL_CAD: 60000, // Budget 2024 increased from $35,000 to $60,000
  HBP_REPAYMENT_YEARS: 15,
  HBTC_AMOUNT_CAD: 10000,
  HBTC_FEDERAL_RATE: 0.15, // 15% non-refundable credit = $1,500 CAD
  ONTARIO_LTT_MAX_REBATE_CAD: 4000,
  TORONTO_MLTT_MAX_REBATE_CAD: 4475,
  BC_PTT_EXEMPTION_THRESHOLD_CAD: 835000,
  BC_PTT_PHASE_OUT_MAX_CAD: 860000
};

/**
 * Diagnostic evaluation of newcomer and first-time homebuyer tax incentives, FHSA, and RRSP HBP.
 */
export function evaluateHomebuyerTaxIncentives(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    province = 'ON',
    city = 'Toronto',
    homePurchasePriceCad = 750000,
    isFirstTimeHomeBuyer = true,
    marginalTaxRatePercent = 35.0,
    applicant1 = {
      annualIncomeCad: 85000,
      rrspBalanceCad: 45000,
      fhsaBalanceCad: 16000,
      fhsaYearsActive: 2
    },
    hasSpouseOrPartner = false,
    applicant2 = null,
    plannedPurchaseYear = 2026,
    applicantName = 'Homebuyer',
    assessmentDate = todayIso()
  } = safeParams;
  const safeApplicant = boundedText(applicantName, 'Homebuyer', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const cityName = boundedText(city, 'Toronto', 60);
  const price = Math.max(10000, Math.min(100000000, Number(homePurchasePriceCad) || 750000));
  const taxRate = Math.min(60, Math.max(15, Number(marginalTaxRatePercent) || 35.0)) / 100;
  const isFthb = Boolean(isFirstTimeHomeBuyer);

  const a1 = {
    annualIncomeCad: Math.max(0, Math.min(100000000, Number(applicant1?.annualIncomeCad) || 80000)),
    rrspBalanceCad: Math.max(0, Math.min(100000000, Number(applicant1?.rrspBalanceCad) || 0)),
    fhsaBalanceCad: Math.max(0, Math.min(100000000, Number(applicant1?.fhsaBalanceCad) || 0)),
    fhsaYearsActive: Math.max(0, Math.min(50, Math.floor(Number(applicant1?.fhsaYearsActive) || 1)))
  };

  const a2 = hasSpouseOrPartner ? {
    annualIncomeCad: Math.max(0, Math.min(100000000, Number(applicant2?.annualIncomeCad) || 0)),
    rrspBalanceCad: Math.max(0, Math.min(100000000, Number(applicant2?.rrspBalanceCad) || 0)),
    fhsaBalanceCad: Math.max(0, Math.min(100000000, Number(applicant2?.fhsaBalanceCad) || 0)),
    fhsaYearsActive: Math.max(0, Math.min(50, Math.floor(Number(applicant2?.fhsaYearsActive) || 0)))
  } : null;

  // 1. FHSA Evaluation (ITA s. 146.6)
  // Max lifetime $40k per person, $8k per active year (plus carryforward up to $16k)
  const a1FhsaAvailable = isFthb ? Math.min(HOMEBUYER_CONSTANTS.FHSA_LIFETIME_LIMIT_CAD, a1.fhsaBalanceCad) : 0;
  const a2FhsaAvailable = (isFthb && a2) ? Math.min(HOMEBUYER_CONSTANTS.FHSA_LIFETIME_LIMIT_CAD, a2.fhsaBalanceCad) : 0;
  const totalFhsaWithdrawalCad = Math.round((a1FhsaAvailable + a2FhsaAvailable) * 100) / 100;
  const totalFhsaTaxSavingsCad = Math.round(totalFhsaWithdrawalCad * taxRate * 100) / 100;

  // 2. RRSP Home Buyers' Plan (HBP) Evaluation (ITA s. 146(5.1))
  // Budget 2024 cap: $60,000 per person
  const a1HbpAvailable = isFthb ? Math.min(HOMEBUYER_CONSTANTS.HBP_MAX_WITHDRAWAL_CAD, a1.rrspBalanceCad) : 0;
  const a2HbpAvailable = (isFthb && a2) ? Math.min(HOMEBUYER_CONSTANTS.HBP_MAX_WITHDRAWAL_CAD, a2.rrspBalanceCad) : 0;
  const totalHbpWithdrawalCad = Math.round((a1HbpAvailable + a2HbpAvailable) * 100) / 100;
  const annualHbpRepaymentRequiredCad = Math.round((totalHbpWithdrawalCad / HOMEBUYER_CONSTANTS.HBP_REPAYMENT_YEARS) * 100) / 100;
  
  // Budget 2024 5-year grace period rule
  const repaymentStartYear = plannedPurchaseYear + 5;

  // Total tax-free down payment unlocked
  const totalTaxFreeDownPaymentCad = Math.round((totalFhsaWithdrawalCad + totalHbpWithdrawalCad) * 100) / 100;

  // 3. First-Time Home Buyers' Tax Credit (HBTC / Line 31270)
  const hbtcFederalTaxSavingsCad = isFthb ? Math.round(HOMEBUYER_CONSTANTS.HBTC_AMOUNT_CAD * HOMEBUYER_CONSTANTS.HBTC_FEDERAL_RATE) : 0;

  // 4. Land Transfer Tax (LTT) Rebate Audit
  let lttRebateCad = 0;
  let lttRebateDetails = 'No provincial first-time homebuyer LTT rebate applicable.';

  if (isFthb) {
    if (prov === 'ON') {
      if (cityName.toLowerCase() === 'toronto') {
        lttRebateCad = HOMEBUYER_CONSTANTS.ONTARIO_LTT_MAX_REBATE_CAD + HOMEBUYER_CONSTANTS.TORONTO_MLTT_MAX_REBATE_CAD;
        lttRebateDetails = `Combined Ontario ($${HOMEBUYER_CONSTANTS.ONTARIO_LTT_MAX_REBATE_CAD.toLocaleString()}) and City of Toronto Municipal LTT ($${HOMEBUYER_CONSTANTS.TORONTO_MLTT_MAX_REBATE_CAD.toLocaleString()}) rebate totaling $${lttRebateCad.toLocaleString()} CAD.`;
      } else {
        lttRebateCad = HOMEBUYER_CONSTANTS.ONTARIO_LTT_MAX_REBATE_CAD;
        lttRebateDetails = `Ontario provincial Land Transfer Tax rebate up to $${HOMEBUYER_CONSTANTS.ONTARIO_LTT_MAX_REBATE_CAD.toLocaleString()} CAD.`;
      }
    } else if (prov === 'BC') {
      if (price <= HOMEBUYER_CONSTANTS.BC_PTT_EXEMPTION_THRESHOLD_CAD) {
        lttRebateCad = Math.round((Math.min(200000, price) * 0.01 + Math.max(0, price - 200000) * 0.02) * 100) / 100;
        lttRebateDetails = `Full exemption from BC Property Transfer Tax under First Time Home Buyers' Program (property price $${price.toLocaleString()} <= $${HOMEBUYER_CONSTANTS.BC_PTT_EXEMPTION_THRESHOLD_CAD.toLocaleString()} CAD threshold).`;
      } else if (price < HOMEBUYER_CONSTANTS.BC_PTT_PHASE_OUT_MAX_CAD) {
        const ratio = (HOMEBUYER_CONSTANTS.BC_PTT_PHASE_OUT_MAX_CAD - price) / (HOMEBUYER_CONSTANTS.BC_PTT_PHASE_OUT_MAX_CAD - HOMEBUYER_CONSTANTS.BC_PTT_EXEMPTION_THRESHOLD_CAD);
        const fullTax = Math.round((200000 * 0.01 + (price - 200000) * 0.02) * 100) / 100;
        lttRebateCad = Math.round(fullTax * ratio * 100) / 100;
        lttRebateDetails = `Proportional partial exemption from BC Property Transfer Tax ($${lttRebateCad.toLocaleString()} CAD) in phase-out range ($835k-$860k).`;
      } else {
        lttRebateCad = 0;
        lttRebateDetails = `BC Property Transfer Tax exemption phased out (property price $${price.toLocaleString()} exceeds $${HOMEBUYER_CONSTANTS.BC_PTT_PHASE_OUT_MAX_CAD.toLocaleString()} CAD maximum).`;
      }
    } else if (prov === 'AB') {
      lttRebateCad = 0;
      lttRebateDetails = 'Alberta does not levy a Land Transfer Tax (only nominal Land Titles registration fee applies).';
    }
  }

  // 5. Total Combined Tax Advantage
  const totalCombinedTaxAdvantageCad = Math.round((totalFhsaTaxSavingsCad + hbtcFederalTaxSavingsCad + lttRebateCad) * 100) / 100;

  // 6. Actionable Strategic Recommendations
  const strategicRecommendations = [];

  if (isFthb) {
    if (a1.fhsaBalanceCad < HOMEBUYER_CONSTANTS.FHSA_LIFETIME_LIMIT_CAD) {
      strategicRecommendations.push(`Maximize FHSA Contributions: Contribute up to $8,000 CAD/year (lifetime cap $40,000 CAD). Contributions generate immediate tax deductions at your ${Math.round(taxRate * 100)}% marginal rate while qualifying withdrawals are non-taxable.`);
    }
    strategicRecommendations.push(`Utilize Federal HBP $60,000 Cap: Federal Budget 2024 increased the RRSP Home Buyers' Plan limit from $35,000 to $60,000 per person. Together with your partner, you can withdraw up to $120,000 CAD tax-free.`);
    strategicRecommendations.push(`Benefit from 5-Year HBP Repayment Grace Period: For withdrawals made up to 2025/2026, repayment of the 15-year annual installments ($${annualHbpRepaymentRequiredCad.toLocaleString()} CAD/year) does not begin until ${repaymentStartYear}.`);
    strategicRecommendations.push(`Claim Line 31270 HBTC: Claim the $10,000 First-Time Home Buyers' Tax Credit on your CRA T1 return for $1,500 CAD direct federal tax reduction.`);
    if (lttRebateCad > 0) {
      strategicRecommendations.push(`Claim Land Transfer Tax Rebate: Ensure your real estate closing lawyer applies for the $${lttRebateCad.toLocaleString()} CAD first-time buyer rebate directly at the registry.`);
    }
  } else {
    strategicRecommendations.push('Previous homeownership in the past 4 years disqualifies you from FHSA qualifying withdrawals and HBP eligibility. Standard RRSP withdrawals will be subject to withholding taxes.');
  }

  return {
    applicantName: safeApplicant,
    assessmentDate: safeAssessmentDate,
    asOf: safeAssessmentDate,
    province: prov,
    city: cityName,
    homePurchasePriceCad: price,
    isFirstTimeHomeBuyer: isFthb,
    marginalTaxRatePercent: Math.round(taxRate * 100),
    fhsaEvaluation: {
      isEligible: isFthb,
      applicant1WithdrawalCad: a1FhsaAvailable,
      applicant2WithdrawalCad: a2FhsaAvailable,
      totalFhsaWithdrawalCad,
      estimatedDeductionTaxRefundCad: totalFhsaTaxSavingsCad,
      statute: 'ITA s. 146.6'
    },
    hbpEvaluation: {
      isEligible: isFthb,
      maxPerPersonLimitCad: HOMEBUYER_CONSTANTS.HBP_MAX_WITHDRAWAL_CAD,
      applicant1WithdrawalCad: a1HbpAvailable,
      applicant2WithdrawalCad: a2HbpAvailable,
      totalHbpWithdrawalCad,
      annualRepaymentRequiredCad: annualHbpRepaymentRequiredCad,
      repaymentGraceYears: 5,
      repaymentStartYear,
      statute: 'ITA s. 146(5.1) (Budget 2024 Expansion)'
    },
    downPaymentUnlocked: {
      totalTaxFreeDownPaymentCad,
      combinedFhsaAndHbpRatio: Math.round((totalTaxFreeDownPaymentCad / price) * 1000) / 10
    },
    taxCreditsAndRebates: {
      hbtcTaxSavingsCad: hbtcFederalTaxSavingsCad,
      lttRebateCad,
      lttRebateDetails,
      totalCombinedTaxAdvantageCad
    },
    strategicRecommendations,
    statutoryReferences: [
      'Income Tax Act s. 146.6 (First Home Savings Account)',
      'Income Tax Act s. 146(5.1) (Home Buyers\' Plan $60k Expansion & 5-Year Grace Period)',
      'Income Tax Act s. 118.05 (First-Time Home Buyers\' Tax Credit - Line 31270)',
      prov === 'ON' ? 'Ontario Land Transfer Tax Act s. 9.1 & Toronto Municipal Code c. 760' : 'BC Property Transfer Tax Act s. 5'
    ]
  };
}
