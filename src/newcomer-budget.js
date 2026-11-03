// Newcomer Financial Budget & Living Runway Simulator
// Evaluates statutory rental deposits, official food-costing benchmarks,
// bridge healthcare policies, and federal tax credit offsets (CCB, GST/HST credit).

import { CANADIAN_METROS } from './city-comparison.js';
import { ValidationError } from './api-errors.js';
import { calculatorNumber } from './calculator-input.js';
import { boundedText, safeIsoDate } from './text-input.js';

export const OFFICIAL_FOOD_BASKET_MONTHLY = {
  single_adult: 425.00,
  couple: 820.00,
  family_3: 1120.00,
  family_4: 1395.00
};

export const MAX_MONTHLY_CCB_PER_CHILD = {
  under_6: 648.91,
  age_6_to_17: 547.41
};

/**
 * Calculates a detailed 12-month newcomer budget and financial runway.
 * @param {object} params
 * @param {string} params.city - e.g. 'Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'
 * @param {string} params.household - 'single' | 'couple' | 'family_1_child' | 'family_2_children'
 * @param {string} params.accommodation - '1bed' | '2bed' | 'shared'
 * @param {number} params.savingsCad - Total available liquid savings in CAD
 * @param {number} [params.monthlyIncomeNet] - Projected monthly net take-home salary
 * @returns {object} Full budget breakdown with runway months
 */
export function calculateNewcomerBudget({
  applicantName = 'Newcomer',
  city = 'Toronto',
  household = 'single',
  accommodation = '1bed',
  savingsCad = 25000,
  monthlyIncomeNet = 0,
  assessmentDate
} = {}) {
  const cleanApplicantName = boundedText(applicantName, 'Newcomer', 100);
  const safeDate = safeIsoDate(assessmentDate, new Date().toISOString().slice(0, 10));

  if (typeof city !== 'string' || !Object.hasOwn(CANADIAN_METROS, city)) throw new ValidationError('Unknown budget city');
  if (!['single', 'couple', 'family_1_child', 'family_2_children'].includes(household)) throw new ValidationError('Unknown household type');
  if (!['1bed', '2bed', 'shared'].includes(accommodation)) throw new ValidationError('Unknown accommodation type');
  const metro = CANADIAN_METROS[city];
  const rawSavings = calculatorNumber(savingsCad, 'Savings');
  const rawIncome = calculatorNumber(monthlyIncomeNet, 'Monthly income');
  const savings = Math.min(100000000, Math.max(0, rawSavings));
  const income = Math.min(100000000, Math.max(0, rawIncome));

  // Determine monthly rent based on unit choice
  let monthlyRent = metro.rent1BedMedian;
  if (accommodation === '2bed') monthlyRent = metro.rent2BedMedian;
  if (accommodation === 'shared') monthlyRent = Math.round(metro.rent1BedMedian * 0.58);

  // Upfront one-time setup costs
  // In Ontario: first + last month rent (RTA s.108); in BC: half month damage deposit (RTA s.19); in Alberta: 1 month security deposit
  let rentDepositRequired = monthlyRent; // Last month or security deposit
  if (metro.provinceCode === 'BC') rentDepositRequired = Math.round(monthlyRent * 0.5);

  const initialUpfrontCosts = {
    firstMonthRent: monthlyRent,
    statutoryRentDeposit: rentDepositRequired,
    temporaryStayFirst10Days: 1400,
    winterClothingAndEssentials: household.includes('family') ? 2200 : (household === 'couple' ? 1500 : 800),
    mobileSimAndHardwareSetup: household === 'single' ? 75 : 150,
    privateBridgeHealthInsurance: metro.healthcareWaitPeriod.includes('None') ? 0 : (household.includes('family') ? 600 : (household === 'couple' ? 380 : 190))
  };

  const totalOneTimeUpfront = Object.values(initialUpfrontCosts).reduce((sum, v) => sum + v, 0);

  // Monthly recurring expenses
  let foodBasket = OFFICIAL_FOOD_BASKET_MONTHLY.single_adult;
  let adultCount = 1;

  if (household === 'couple') {
    foodBasket = OFFICIAL_FOOD_BASKET_MONTHLY.couple;
    adultCount = 2;
  } else if (household === 'family_1_child') {
    foodBasket = OFFICIAL_FOOD_BASKET_MONTHLY.family_3;
    adultCount = 2;
  } else if (household === 'family_2_children') {
    foodBasket = OFFICIAL_FOOD_BASKET_MONTHLY.family_4;
    adultCount = 2;
  }

  const monthlyTransit = metro.transitMonthlyPass * adultCount;
  const monthlyUtilities = 185.00; // Hydro + home Wi-Fi
  const monthlyMobileLines = 45.00 * adultCount;
  const monthlyTenantInsurance = 32.00;

  const totalMonthlyExpenses = monthlyRent + foodBasket + monthlyTransit + monthlyUtilities + monthlyMobileLines + monthlyTenantInsurance;

  // Household size alone cannot establish benefit eligibility or payment timing.
  // Users may include confirmed recurring receipts in monthlyIncomeNet.
  const monthlyCcbOffset = 0;
  const monthlyGstCreditOffset = 0;
  const totalMonthlyGovernmentCredits = 0;

  const netMonthlyBurnRate = Math.max(0, totalMonthlyExpenses - totalMonthlyGovernmentCredits - income);

  // Runway calculation
  const remainingSavingsAfterUpfront = Math.max(0, savings - totalOneTimeUpfront);
  const runwayMonths = netMonthlyBurnRate > 0 
    ? Number((remainingSavingsAfterUpfront / netMonthlyBurnRate).toFixed(1))
    : (remainingSavingsAfterUpfront > 0 ? 36 : 0);

  // Health risk assessment
  const requiresBridgeHealthInsurance = !metro.healthcareWaitPeriod.includes('None');

  return {
    asOf: safeDate,
    assessmentDate: safeDate,
    applicantName: cleanApplicantName,
    city: metro.city,
    province: metro.province,
    household,
    accommodation,
    savingsCad: savings,
    projectedMonthlyIncomeNet: income,
    initialUpfrontCosts: {
      ...initialUpfrontCosts,
      totalOneTimeUpfront
    },
    monthlyRecurringExpenses: {
      rent: monthlyRent,
      foodBasketOfficial: foodBasket,
      transit: monthlyTransit,
      utilitiesAndInternet: monthlyUtilities,
      mobilePlans: monthlyMobileLines,
      tenantInsurance: monthlyTenantInsurance,
      totalMonthlyExpenses
    },
    monthlyGovernmentOffsets: {
      canadaChildBenefit: Math.round(monthlyCcbOffset),
      gstHstQuarterlyCreditMonthlyEquivalent: monthlyGstCreditOffset,
      totalMonthlyGovernmentCredits
    },
    netMonthlyBurnRate: Math.round(netMonthlyBurnRate),
    remainingSavingsAfterUpfront: Math.round(remainingSavingsAfterUpfront),
    runwayMonths,
    runwaySafetyAssessment: runwayMonths >= 6 
      ? 'Optimal (6+ months runway provides ample room to secure employment)'
      : (runwayMonths >= 3 ? 'Moderate (3–5 months runway; prioritize early job search or lower-cost accommodation)' : 'Critical (< 3 months runway; urgent need for employment or community settlement food support)'),
    bridgeHealthNotice: requiresBridgeHealthInsurance 
      ? `Attention: In ${metro.province}, ${metro.healthcarePlan} has a statutory waiting period (${metro.healthcareWaitPeriod}). Private bridge emergency insurance is strongly advised for your first 90 days.`
      : `Good news: In ${metro.province}, ${metro.healthcarePlan} provides immediate statutory health coverage from arrival.`
  };
}
