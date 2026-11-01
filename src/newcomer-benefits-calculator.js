// src/newcomer-benefits-calculator.js
// Statutory CRA Newcomer Benefits & Federal/Provincial Tax Credits Calculator.
// Implements official Income Tax Act s.122.5 (GST/HST Credit) & s.122.6 (Canada Child Benefit).
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate } from './text-input.js';

export const CRA_BENEFIT_RATES = {
  ccb: {
    maxAnnualUnder6: 7787, // $648.91 / mo
    maxAnnual6to17: 6570,  // $547.50 / mo
    baseIncomeThreshold: 36502,
    secondaryIncomeThreshold: 79000,
    reductionTier1: { 1: 0.070, 2: 0.135, 3: 0.190, 4: 0.230 },
    reductionTier2: { 1: 0.032, 2: 0.057, 3: 0.080, 4: 0.095 }
  },
  gstHst: {
    baseSingle: 519,
    baseCouple: 680,
    perChild: 179,
    incomeThreshold: 44324,
    reductionRate: 0.05
  },
  provincialChildAnnualMax: {
    ON: 1680, // Ontario Child Benefit (OCB)
    BC: 1750, // BC Family Benefit
    AB: 1469, // Alberta Child and Family Benefit (ACFB)
    QC: 1600, // Retraite Québec Allocation famille
    MB: 500,
    SK: 500
  }
};

/**
 * Calculates annual Canada Child Benefit based on child counts and family net income.
 */
export function calculateCcbAnnual(under6Count = 0, age6to17Count = 0, familyIncomeCad = 0) {
  const nUnder6 = Math.min(20, Math.floor(Math.max(0, Number.isFinite(Number(under6Count)) ? Number(under6Count) : 0)));
  const n6to17 = Math.min(20, Math.floor(Math.max(0, Number.isFinite(Number(age6to17Count)) ? Number(age6to17Count) : 0)));
  const totalChildren = nUnder6 + n6to17;
  if (totalChildren === 0) return 0;

  const maxTotalBenefit = (nUnder6 * CRA_BENEFIT_RATES.ccb.maxAnnualUnder6) + (n6to17 * CRA_BENEFIT_RATES.ccb.maxAnnual6to17);
  const income = Math.max(0, Number.isFinite(Number(familyIncomeCad)) ? Number(familyIncomeCad) : 0);

  if (income <= CRA_BENEFIT_RATES.ccb.baseIncomeThreshold) {
    return Math.round(maxTotalBenefit);
  }

  const childKey = Math.min(4, Math.max(1, totalChildren));
  const tier1Rate = CRA_BENEFIT_RATES.ccb.reductionTier1[childKey];
  const tier2Rate = CRA_BENEFIT_RATES.ccb.reductionTier2[childKey];

  let reduction = 0;
  if (income <= CRA_BENEFIT_RATES.ccb.secondaryIncomeThreshold) {
    reduction = (income - CRA_BENEFIT_RATES.ccb.baseIncomeThreshold) * tier1Rate;
  } else {
    const tier1Span = CRA_BENEFIT_RATES.ccb.secondaryIncomeThreshold - CRA_BENEFIT_RATES.ccb.baseIncomeThreshold;
    const tier1Reduction = tier1Span * tier1Rate;
    const tier2Reduction = (income - CRA_BENEFIT_RATES.ccb.secondaryIncomeThreshold) * tier2Rate;
    reduction = tier1Reduction + tier2Reduction;
  }

  return Math.max(0, Math.round(maxTotalBenefit - reduction));
}

/**
 * Calculates GST/HST Credit under Income Tax Act Section 122.5.
 */
export function calculateGstHstCreditAnnual(maritalStatus = 'single', totalChildren = 0, familyIncomeCad = 0) {
  const isCouple = maritalStatus === 'married' || maritalStatus === 'couple';
  const baseCredit = isCouple ? CRA_BENEFIT_RATES.gstHst.baseCouple : CRA_BENEFIT_RATES.gstHst.baseSingle;
  const childrenCredit = Math.min(20, Math.floor(Math.max(0, Number.isFinite(Number(totalChildren)) ? Number(totalChildren) : 0))) * CRA_BENEFIT_RATES.gstHst.perChild;
  const maxCredit = baseCredit + childrenCredit;

  const income = Math.max(0, Number.isFinite(Number(familyIncomeCad)) ? Number(familyIncomeCad) : 0);
  if (income <= CRA_BENEFIT_RATES.gstHst.incomeThreshold) {
    return Math.round(maxCredit);
  }

  const reduction = (income - CRA_BENEFIT_RATES.gstHst.incomeThreshold) * CRA_BENEFIT_RATES.gstHst.reductionRate;
  return Math.max(0, Math.round(maxCredit - reduction));
}

/**
 * Calculates estimated provincial child & carbon tax credits.
 */
export function calculateProvincialBenefitAnnual(province = 'ON', totalChildren = 0, familyIncomeCad = 0) {
  const provCode = (province || 'ON').toUpperCase();
  const maxPerChild = CRA_BENEFIT_RATES.provincialChildAnnualMax[provCode] || 0;
  const children = Math.min(20, Math.floor(Math.max(0, Number.isFinite(Number(totalChildren)) ? Number(totalChildren) : 0)));
  if (children === 0 || maxPerChild === 0) return 0;

  const maxTotal = children * maxPerChild;
  const income = Math.max(0, Number.isFinite(Number(familyIncomeCad)) ? Number(familyIncomeCad) : 0);

  // Taper threshold approximately $35,000 with 8% phase-out
  if (income <= 35000) return Math.round(maxTotal);
  const reduction = (income - 35000) * 0.08;
  return Math.max(0, Math.round(maxTotal - reduction));
}

/**
 * Master newcomer benefits assessment engine.
 * 
 * @param {object} options
 * @param {string} [options.province='ON'] - Canadian province code ('ON', 'BC', 'AB', 'QC', 'MB', 'SK')
 * @param {number} [options.adjustedFamilyNetIncomeCad=30000] - Estimated net income (CAD)
 * @param {string} [options.maritalStatus='single'] - 'single', 'married', 'couple'
 * @param {number} [options.childrenUnder6Count=1] - Children aged 0-5
 * @param {number} [options.children6to17Count=0] - Children aged 6-17
 * @param {string} [options.landingDateStr] - YYYY-MM-DD
 * @returns {object} Comprehensive CRA statutory benefits assessment
 */
export function calculateNewcomerBenefits({
  applicantName = 'Applicant',
  province = 'ON',
  adjustedFamilyNetIncomeCad = 30000,
  maritalStatus = 'single',
  childrenUnder6Count = 0,
  children6to17Count = 0,
  landingDateStr,
  assessmentDate
} = {}) {
  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const provCode = boundedText(province, 'ON', 10).toUpperCase();
  const cleanMarital = boundedText(maritalStatus, 'single', 30);
  const income = Math.max(0, Math.min(100000000, Number.isFinite(Number(adjustedFamilyNetIncomeCad)) ? Number(adjustedFamilyNetIncomeCad) : 0));
  const under6 = Math.min(20, Math.floor(Math.max(0, Number.isFinite(Number(childrenUnder6Count)) ? Number(childrenUnder6Count) : 0)));
  const over6 = Math.min(20, Math.floor(Math.max(0, Number.isFinite(Number(children6to17Count)) ? Number(children6to17Count) : 0)));
  const totalKids = under6 + over6;

  const todayStr = new Date().toISOString().slice(0, 10);
  const validLandingStr = safeIsoDate(landingDateStr, todayStr);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayStr);

  // Calculate annual statutory amounts
  const ccbAnnual = calculateCcbAnnual(under6, over6, income);
  const gstHstAnnual = calculateGstHstCreditAnnual(cleanMarital, totalKids, income);
  const provincialAnnual = calculateProvincialBenefitAnnual(provCode, totalKids, income);
  const totalAnnualGovernmentCredits = ccbAnnual + gstHstAnnual + provincialAnnual;

  // Monthly and Quarterly Cashflow calculations
  const ccbMonthly = Math.round(ccbAnnual / 12);
  const gstHstQuarterly = Math.round(gstHstAnnual / 4);
  const gstHstMonthlyEquivalent = Math.round(gstHstAnnual / 12);
  const provincialMonthly = Math.round(provincialAnnual / 12);
  const totalMonthlyLiquidityCad = ccbMonthly + gstHstMonthlyEquivalent + provincialMonthly;

  // Filing packet instructions
  const requiredForms = [
    {
      formCode: 'Form RC151',
      // The Canada Carbon Rebate (formerly Climate Action Incentive) ended in 2025.
      formTitle: 'GST/HST Credit Application for Individuals Who Become Residents of Canada',
      statutoryBasis: 'Income Tax Act s. 122.5',
      action: 'Complete and mail to your regional CRA Tax Centre immediately upon landing. Allows you to receive quarterly GST credits without filing an annual tax return first.'
    }
  ];

  if (totalKids > 0) {
    requiredForms.push({
      formCode: 'Form RC66',
      formTitle: 'Canada Child Benefits Application',
      statutoryBasis: 'Income Tax Act s. 122.6',
      action: 'Primary applicant (mother by statutory presumption, or primary caregiver) must submit Form RC66 to activate CCB payments.'
    });
    requiredForms.push({
      formCode: 'Schedule RC66SCH',
      formTitle: 'Status in Canada and Income Information for the Canada Child Benefits Application',
      statutoryBasis: 'IRCC / CRA Data Sharing Protocol',
      action: 'Report your global world income for the 2 calendar years prior to arrival so CRA can calculate your benefit tier.'
    });
  }

  const strategicNotes = [
    'Retroactive payments: CRA allows retroactive benefit payments up to 11 months prior to the date your application is processed.',
    'Not taxable: Canada Child Benefit and GST/HST credit payments are not taxable income.',
    'Direct Deposit: Set up CRA direct deposit through your Canadian bank portal (RBC, TD, Scotiabank, BMO, CIBC) to receive funds automatically on the 20th of each month.'
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    applicantName: cleanApplicantName,
    province: provCode,
    landingDate: validLandingStr,
    familyProfile: {
      maritalStatus: cleanMarital,
      adjustedFamilyNetIncomeCad: income,
      childrenUnder6Count: under6,
      children6to17Count: over6,
      totalChildrenCount: totalKids
    },
    annualTotals: {
      ccbAnnual,
      gstHstAnnual,
      provincialAnnual,
      totalAnnualGovernmentCredits
    },
    cashflowSchedule: {
      ccbMonthly,
      gstHstQuarterly,
      gstHstMonthlyEquivalent,
      provincialMonthly,
      totalMonthlyLiquidityCad
    },
    requiredForms,
    strategicNotes,
    statutoryAuthority: 'Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.)) ss. 122.5, 122.6'
  };
}
