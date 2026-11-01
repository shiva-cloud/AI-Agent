// src/tax-shield-optimizer.js
// Newcomer Tax Shield & Wealth Optimization Navigator.
// Calculates First Home Savings Account (FHSA), TFSA room, RRSP deduction, Canada Child Benefit (CCB), and GST/HST credit.

import { boundedText, safeIsoDate } from './text-input.js';

export const PROVINCIAL_MARGINAL_RATES = {
  ON: { federal: 0.205, provincial: 0.0915, combined: 0.2965 }, // Ontario middle bracket
  BC: { federal: 0.205, provincial: 0.077, combined: 0.282 },   // BC middle bracket
  AB: { federal: 0.205, provincial: 0.10, combined: 0.305 },    // Alberta flat 10%
  QC: { federal: 0.205, provincial: 0.14, combined: 0.345 }     // Quebec
};

export function evaluateTaxShield(input = {}) {
  const taxpayerName = boundedText(input.taxpayerName, 'Taxpayer', 100);
  const assessmentDate = safeIsoDate(input.assessmentDate, '2026-10-31');
  const annualEmploymentIncomeCad = Math.max(0, Math.min(100000000, Number(input.annualEmploymentIncomeCad) || 75000));
  const province = boundedText(input.province, 'ON', 10).toUpperCase();
  const childrenUnder6 = Math.max(0, Math.min(20, Math.floor(Number(input.childrenUnder6) || 0)));
  const children6to17 = Math.max(0, Math.min(20, Math.floor(Number(input.children6to17) || 0)));
  const isTaxResident = Boolean(input.isTaxResident ?? true);
  const planToBuyFirstHome = Boolean(input.planToBuyFirstHome ?? true);
  const fhsaContributionCad = Math.max(0, Math.min(8000, Number(input.fhsaContributionCad ?? 8000) || 0));
  const tfsaContributionCad = Math.max(0, Math.min(100000000, Number(input.tfsaContributionCad ?? 7000) || 0));
  const rrspContributionCad = Math.max(0, Math.min(100000000, Number(input.rrspContributionCad ?? 0) || 0));

  const rates = PROVINCIAL_MARGINAL_RATES[province] || PROVINCIAL_MARGINAL_RATES.ON;

  // 1. FHSA Optimization
  const fhsaTaxDeduction = planToBuyFirstHome ? fhsaContributionCad : 0;
  const fhsaTaxSavingsCad = Math.round(fhsaTaxDeduction * rates.combined);

  // 2. TFSA Room and Non-Resident Hazard
  let tfsaRoomCad = isTaxResident ? 7000 : 0;
  let tfsaPenaltyWarning = null;
  if (!isTaxResident && tfsaContributionCad > 0) {
    const penaltyRateMonthly = 0.01;
    tfsaPenaltyWarning = {
      isLiableForPenalty: true,
      monthlyPenaltyCad: Math.round(tfsaContributionCad * penaltyRateMonthly),
      statutoryLegalBasis: 'Income Tax Act (ITA) s. 207.02 - 1% per month penalty tax on TFSA contributions made by non-residents',
      advice: 'Cease TFSA contributions immediately until CRA confirms Canadian tax residency status.'
    };
  }

  // 3. RRSP Deduction
  const rrspTaxSavingsCad = Math.round(rrspContributionCad * rates.combined);

  // 4. Canada Child Benefit (CCB) Estimation (2024/2025 benefit year)
  // Max per child under 6: $7,787 ($648.91/mo); 6-17: $6,570 ($547.50/mo)
  // Base phase-out starts at AFNI $36,502
  const maxCcb = (childrenUnder6 * 7787) + (children6to17 * 6570);
  let estimatedAnnualCcbCad = 0;
  if (maxCcb > 0) {
    const totalChildren = childrenUnder6 + children6to17;
    const reductionThreshold = 36502;
    if (annualEmploymentIncomeCad <= reductionThreshold) {
      estimatedAnnualCcbCad = maxCcb;
    } else {
      const reductionRate = totalChildren === 1 ? 0.07 : totalChildren === 2 ? 0.135 : 0.19;
      const reduction = (annualEmploymentIncomeCad - reductionThreshold) * reductionRate;
      estimatedAnnualCcbCad = Math.max(0, Math.round(maxCcb - reduction));
    }
  }

  // 5. GST/HST Credit Estimation (Base single $519, child $179)
  let estimatedGstCreditCad = 0;
  if (annualEmploymentIncomeCad <= 55000) {
    estimatedGstCreditCad = Math.round(Math.max(0, 519 + (childrenUnder6 + children6to17) * 179 - (annualEmploymentIncomeCad > 42000 ? (annualEmploymentIncomeCad - 42000) * 0.05 : 0)));
  }

  // Total Immediate Refund Lift
  const totalTaxSavingsCad = fhsaTaxSavingsCad + rrspTaxSavingsCad;
  const totalDirectCashBenefitsCad = estimatedAnnualCcbCad + estimatedGstCreditCad;
  const netFirstYearFinancialShieldCad = totalTaxSavingsCad + totalDirectCashBenefitsCad;

  return {
    taxpayerName,
    assessmentDate,
    province,
    annualEmploymentIncomeCad,
    marginalTaxRatePercent: +(rates.combined * 100).toFixed(2),
    fhsaShield: {
      annualLimitCad: 8000,
      lifetimeLimitCad: 40000,
      contributionCad: fhsaContributionCad,
      estimatedIncomeTaxDeductionCad: fhsaTaxSavingsCad,
      qualifiesTaxFreeHomeWithdrawal: planToBuyFirstHome,
      statutoryLegalBasis: 'Income Tax Act (ITA) s. 146.6 (First Home Savings Account Rules)'
    },
    tfsaShield: {
      annualRoom2025Cad: tfsaRoomCad,
      taxFreeInvestmentGrowth: true,
      penaltyWarning: tfsaPenaltyWarning,
      statutoryLegalBasis: 'Income Tax Act (ITA) s. 146.2'
    },
    childAndFamilyBenefits: {
      estimatedAnnualCcbCad,
      estimatedMonthlyCcbCad: Math.round(estimatedAnnualCcbCad / 12),
      estimatedAnnualGstCreditCad: estimatedGstCreditCad,
      eligibilityCondition: 'Must file Form RC151 (GST/HST Credit Application for Individuals Becoming Residents of Canada) with first tax return',
      statutoryLegalBasis: 'Income Tax Act (ITA) s. 122.61 (Canada Child Benefit Rules)'
    },
    totalFirstYearFinancialShieldCad: netFirstYearFinancialShieldCad,
    wealthActionPlan: [
      `Contribute $${fhsaContributionCad.toLocaleString()} CAD to an FHSA before December 31 to claim an instant $${fhsaTaxSavingsCad.toLocaleString()} income tax deduction.`,
      isTaxResident 
        ? `Deposit up to $${tfsaRoomCad.toLocaleString()} CAD into a TFSA for tax-exempt capital gains and dividends.`
        : 'Do NOT contribute to a TFSA until CRA physical/factual residency is established to avoid the 1% monthly penalty.',
      childrenUnder6 + children6to17 > 0 
        ? `Apply for Canada Child Benefit to unlock ~$${estimatedAnnualCcbCad.toLocaleString()} CAD in non-taxable monthly government deposits.`
        : 'Ensure form RC151 or your first T1 General tax return reports your arrival date to automatically receive GST/HST quarterly rebates.'
    ]
  };
}
