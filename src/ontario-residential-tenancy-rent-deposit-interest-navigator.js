/**
 * Ontario Residential Tenancy Rent Deposit Interest & Offset Navigator
 *
 * Audits last month's rent deposit rules, annual statutory interest calculations
 * matching provincial rent increase guidelines, interest-to-deposit top-up offsets,
 * and tenant deduction rights under Ontario's Residential Tenancies Act, 2006 (RTA),
 * ss. 105, 106, 120, and 135 (LTB Form T1).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

export const ONTARIO_RENT_DEPOSIT_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 105, 106, 135',
  MAX_RENT_DEPOSIT_PERIOD: 'ONE_MONTH_RENT', // s. 106(2)
  DAMAGE_DEPOSITS_PROHIBITED: true, // s. 105
  ANNUAL_GUIDELINE_RATES: Object.freeze({
    2021: 0.0,
    2022: 1.2,
    2023: 2.5,
    2024: 2.5,
    2025: 2.5,
    2026: 2.5
  }),
  DEFAULT_GUIDELINE_RATE: 2.5
});

/**
 * Audits last month's rent deposit interest, landlord compliance, and offset amounts.
 *
 * @param {Object} params
 * @param {number} [params.initialDepositAmountCad=2000] - Amount initially paid as last month's rent deposit
 * @param {number} [params.currentMonthlyRentCad=2100] - Current lawful monthly rent
 * @param {number} [params.tenancyDurationYears=2] - Number of completed years deposit has been held
 * @param {number} [params.guidelineInterestRatePercent=2.5] - Provincial annual guideline interest rate
 * @param {boolean} [params.landlordPaidAnnualInterest=false] - Whether landlord paid out interest annually
 * @param {boolean} [params.depositAppliedToLastMonthRentIncrease=true] - Whether interest was rolled into deposit to offset rent increase
 * @param {boolean} [params.landlordDemandedDamageDeposit=false] - Whether landlord demanded extra security/damage deposit
 * @param {number} [params.extraDepositPaidCad=0] - Dollar amount of illegal damage/key/security deposit collected
 * @returns {Object} Comprehensive rent deposit interest audit and Form T1 determination
 */
export function evaluateOntarioRentDepositInterest({
  initialDepositAmountCad = 2000,
  currentMonthlyRentCad = 2100,
  tenancyDurationYears = 2,
  guidelineInterestRatePercent = 2.5,
  landlordPaidAnnualInterest = false,
  depositAppliedToLastMonthRentIncrease = true,
  landlordDemandedDamageDeposit = false,
  extraDepositPaidCad = 0
} = {}) {
  const deposit = Number.isFinite(Number(initialDepositAmountCad)) ? Math.max(0, Math.min(100000, Number(initialDepositAmountCad))) : 2000;
  const currentRent = Number.isFinite(Number(currentMonthlyRentCad)) ? Math.max(0, Math.min(100000, Number(currentMonthlyRentCad))) : 2100;
  const years = Number.isFinite(Number(tenancyDurationYears)) ? Math.max(0, Math.min(50, Number(tenancyDurationYears))) : 2;
  const ratePct = Number.isFinite(Number(guidelineInterestRatePercent)) ? Math.max(0, Math.min(100, Number(guidelineInterestRatePercent))) : ONTARIO_RENT_DEPOSIT_CONSTANTS.DEFAULT_GUIDELINE_RATE;
  const extraDeposit = Number.isFinite(Number(extraDepositPaidCad)) ? Math.max(0, Math.min(100000, Number(extraDepositPaidCad))) : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Prohibited Deposits (s. 105)
  if (landlordDemandedDamageDeposit || extraDeposit > 0) {
    statutoryViolations.push({
      rule: 'PROHIBITED_SECURITY_OR_DAMAGE_DEPOSIT',
      statute: 'Residential Tenancies Act s. 105',
      finding: `Landlord collected $${extraDeposit.toFixed(2)} as a damage or extra deposit. Under s. 105, only last month's rent and a refundable key deposit (at actual replacement cost) are legal.`
    });
    actionableRemedies.push({
      action: 'RECOVER_ILLEGAL_DEPOSIT_VIA_FORM_T1',
      remedyDescription: `File LTB Form T1 (Tenant Application for a Rebate of Money the Landlord Owes) Reason 1 to recover $${extraDeposit.toFixed(2)}.`
    });
  }

  // 2. Annual Interest Calculation (s. 106(6))
  // Total statutory interest accrued over the duration
  const annualInterestRate = ratePct / 100;
  const annualInterestCad = Math.round(deposit * annualInterestRate * 100) / 100;
  const totalInterestAccruedCad = Math.round(annualInterestCad * years * 100) / 100;

  // 3. Offset against Rent Increases (s. 106(7))
  // Under s. 106(7), where rent increases by guideline and interest equals guideline, the interest automatically tops up deposit
  const rentDifferenceCad = Math.max(0, currentRent - deposit);
  let totalInterestOwedToTenantCad = 0;
  let depositShortfallCad = 0;

  if (depositAppliedToLastMonthRentIncrease) {
    // Interest is credited toward the higher last month rent
    const netCredit = totalInterestAccruedCad - rentDifferenceCad;
    if (netCredit >= 0) {
      totalInterestOwedToTenantCad = Math.round(netCredit * 100) / 100;
    } else {
      depositShortfallCad = Math.round(Math.abs(netCredit) * 100) / 100;
    }
  } else if (!landlordPaidAnnualInterest) {
    totalInterestOwedToTenantCad = totalInterestAccruedCad;
  }

  if (!landlordPaidAnnualInterest && !depositAppliedToLastMonthRentIncrease && totalInterestAccruedCad > 0) {
    statutoryViolations.push({
      rule: 'UNPAID_ANNUAL_RENT_DEPOSIT_INTEREST',
      statute: 'Residential Tenancies Act s. 106(6)',
      finding: `Landlord failed to pay annual interest of $${totalInterestAccruedCad.toFixed(2)} accrued on the last month's rent deposit over ${years} year(s).`
    });
    actionableRemedies.push({
      action: 'DEDUCT_INTEREST_FROM_FUTURE_RENT',
      remedyDescription: `Under RTA s. 106(9), tenant may directly deduct $${totalInterestAccruedCad.toFixed(2)} from the next rental payment with written notice to the landlord.`
    });
  }

  const totalOwedCad = Math.round((totalInterestOwedToTenantCad + extraDeposit) * 100) / 100;
  let complianceStatus = 'COMPLIANT_RENT_DEPOSIT_MANAGEMENT';
  let legalVerdict = 'Rent deposit and interest administration appears compliant with Ontario RTA s. 106.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'STATUTORY_RENT_DEPOSIT_VIOLATION';
    legalVerdict = `Landlord committed statutory infractions under RTA ss. 105/106. Total amount recoverable by tenant: $${totalOwedCad.toFixed(2)}.`;
  }

  return {
    jurisdiction: 'ONTARIO_CANADA',
    initialDepositAmountCad: deposit,
    currentMonthlyRentCad: currentRent,
    tenancyDurationYears: years,
    guidelineInterestRatePercent: ratePct,
    complianceStatus,
    legalVerdict,
    interestAudit: {
      annualInterestCad,
      totalInterestAccruedCad,
      rentDifferenceCad,
      depositAppliedToLastMonthRentIncrease,
      totalInterestOwedToTenantCad,
      depositShortfallCad,
      illegalDepositPaidCad: extraDeposit,
      totalAmountOwedToTenantCad: totalOwedCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancies Act, 2006, S.O. 2006, c. 17, ss. 105 (Security deposits limitation), 106 (Rent deposit interest & offset), 135 (Application for rebate)',
      'Ontario Regulation 516/06 (Annual Rent Increase Guideline calculation)'
    ]
  };
}