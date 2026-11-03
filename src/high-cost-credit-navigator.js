/**
 * Newcomer Consumer Credit Agreement, High-Cost Credit & Payday Loan Defense Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Criminal Code of Canada, R.S.C. 1985, c. C-46:
 *   - s. 347 (Criminal rate of interest modernized to 35% APR)
 *   - s. 347.1 (Payday loan exemptions subject to strict provincial designation and caps)
 * - Ontario Payday Loans Act, 2008, S.O. 2008, c. 9:
 *   - s. 32 (Maximum allowable cost of borrowing: strictly $14 per $100 advanced)
 *   - s. 34 (Mandatory 2-day cooling-off cancellation without penalty)
 *   - s. 35 (Strict ban on rollover loans and concurrent multiple loans)
 *   - s. 36 (Cap on loan principal: maximum 50% of borrower net pay)
 *   - s. 40 (Prohibition of wage assignment to secure payday loans)
 * - British Columbia Business Practices and Consumer Protection Act (BPCPA):
 *   - Part 6.1 (Payday Lending regulations, $15 per $100 cap)
 * - Alberta Consumer Protection Act:
 *   - Payday Lending Regulation ($15 per $100 cap)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const CREDIT_DEFENSE_CONSTANTS = Object.freeze({
  FEDERAL_CRIMINAL_APR_CAP: 35.0,
  ONTARIO_MAX_FEE_PER_100: 14.0,
  BC_MAX_FEE_PER_100: 15.0,
  ALBERTA_MAX_FEE_PER_100: 15.0,
  PAYDAY_COOLING_OFF_DAYS: 2,
  MAX_PAYDAY_PERCENT_NET_PAY: 50.0
});

export const LOAN_TYPE_TAXONOMY = Object.freeze({
  payday_loan: {
    label: 'Payday Loan (Short-Term Advance)',
    statutoryFramework: 'Ontario Payday Loans Act, 2008 / BPCPA Part 6.1',
    coolingOffDays: 2
  },
  high_cost_installment: {
    label: 'High-Cost Installment Loan (Subprime Alternative Lender)',
    statutoryFramework: 'Criminal Code s. 347 (35% APR Cap) & Consumer Protection Act',
    coolingOffDays: 10
  },
  predatory_auto_loan: {
    label: 'Subprime Auto Financing & Negative Equity Rollover',
    statutoryFramework: 'Criminal Code s. 347 & Motor Vehicle Dealers Act (OMVIC)',
    coolingOffDays: 0
  },
  pawn_collateral_loan: {
    label: 'Collateral / Title / Pawn Advance',
    statutoryFramework: 'Provincial Consumer Protection & Pawnbrokers Act',
    coolingOffDays: 0
  }
});

/**
 * Diagnostic evaluation of consumer credit agreements, criminal interest caps,
 * payday borrowing fee ceilings ($14/$100), 2-day cooling-off rescission, and illegal rollover loans.
 */
export function evaluateConsumerCreditAgreement(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    province = 'ON',
    loanType = 'payday_loan',
    principalBorrowedCad = 1000,
    termDays = 14,
    statedAprPercent = 46.5,
    totalFeesChargedCad = 180,
    netMonthlyIncomeCad = 2400,
    isRolloverLoan = false,
    lenderAttemptedWageAssignment = false,
    daysSinceAgreement = 1,
    borrowerName = 'Consumer',
    lenderName = 'Quick Cash Financial Ltd.',
    assessmentDate = todayIso()
  } = safeParams;
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const type = boundedText(loanType, 'payday_loan', 40).toLowerCase();
  const principal = Math.max(1, Math.min(10000000, Number(principalBorrowedCad) || 1));
  const days = Math.max(1, Math.min(3650, Math.floor(Number(termDays) || 1)));
  const statedApr = Math.max(0, Math.min(10000, Number(statedAprPercent) || 0));
  const feesCharged = Math.max(0, Math.min(10000000, Number(totalFeesChargedCad) || 0));
  const netIncome = Math.max(0, Math.min(10000000, Number(netMonthlyIncomeCad) || 0));
  const rollover = Boolean(isRolloverLoan);
  const wageAssign = Boolean(lenderAttemptedWageAssignment);
  const daysElapsed = Math.max(0, Math.min(3650, Math.floor(Number(daysSinceAgreement) || 0)));

  // Safe text
  const bName = boundedText(borrowerName, 'Consumer', 120);
  const lName = boundedText(lenderName, 'Quick Cash Financial Ltd.', 120);
  const assessDate = safeIsoDate(assessmentDate, todayIso());

  // 1. Fee Cap Audit (Payday Loans Act)
  let maxAllowableFeePer100 = CREDIT_DEFENSE_CONSTANTS.ONTARIO_MAX_FEE_PER_100;
  if (prov === 'BC' || prov === 'AB') {
    maxAllowableFeePer100 = CREDIT_DEFENSE_CONSTANTS.BC_MAX_FEE_PER_100;
  }

  let statutoryMaxFeesCad = 0;
  let illegalOverchargeCad = 0;
  let hasPaydayFeeOvercharge = false;

  if (type === 'payday_loan') {
    statutoryMaxFeesCad = Math.round((principal / 100) * maxAllowableFeePer100 * 100) / 100;
    if (feesCharged > statutoryMaxFeesCad) {
      hasPaydayFeeOvercharge = true;
      illegalOverchargeCad = Math.round((feesCharged - statutoryMaxFeesCad) * 100) / 100;
    }
  }

  // 2. Criminal Code s. 347 35% APR Audit (for non-payday installment / auto / title loans)
  let isCriminalInterestBreach = false;
  

  if (type !== 'payday_loan' && statedApr > CREDIT_DEFENSE_CONSTANTS.FEDERAL_CRIMINAL_APR_CAP) {
    isCriminalInterestBreach = true;
  }

  // 3. Cooling-off Period Audit
  let withinCoolingOffPeriod = false;
  let coolingOffDaysAllowed = 2;
  if (type === 'payday_loan') {
    coolingOffDaysAllowed = CREDIT_DEFENSE_CONSTANTS.PAYDAY_COOLING_OFF_DAYS;
    withinCoolingOffPeriod = daysElapsed <= coolingOffDaysAllowed;
  } else if (type === 'high_cost_installment') {
    coolingOffDaysAllowed = 10;
    withinCoolingOffPeriod = daysElapsed <= coolingOffDaysAllowed;
  }

  // 4. Maximum Principal Cap Audit (50% of Net Monthly Income)
  let exceedsIncomeCap = false;
  let maximumPermittedPrincipalCad = 0;
  if (netIncome > 0 && type === 'payday_loan') {
    maximumPermittedPrincipalCad = Math.round(netIncome * (CREDIT_DEFENSE_CONSTANTS.MAX_PAYDAY_PERCENT_NET_PAY / 100));
    if (principal > maximumPermittedPrincipalCad) {
      exceedsIncomeCap = true;
    }
  }

  // 5. Statutory Violations & Defense Findings
  const statutoryViolations = [];

  if (isCriminalInterestBreach) {
    statutoryViolations.push({
      code: 'CRIMINAL_INTEREST_RATE_EXCEEDED',
      severity: 'CRITICAL',
      title: 'Criminal Code s. 347 Violation: Interest Exceeds 35% APR',
      message: `The stated interest rate (${statedApr}%) exceeds the modernized federal criminal interest rate cap of 35% APR. Under Canadian law, entering into an agreement to receive interest above 35% is a criminal offence. All interest and fees above the legal cap are void ab initio.`
    });
  }

  if (hasPaydayFeeOvercharge) {
    statutoryViolations.push({
      code: 'PAYDAY_FEE_CAP_EXCEEDED',
      severity: 'HIGH',
      title: `Excess Borrowing Fees: Overcharged $${illegalOverchargeCad.toFixed(2)} CAD`,
      message: `Under the Ontario Payday Loans Act, 2008 s. 32, the statutory maximum borrowing fee is strictly $${maxAllowableFeePer100} per $100 borrowed ($${statutoryMaxFeesCad.toFixed(2)} total). You were charged $${feesCharged.toFixed(2)}. The lender is statutorily required to refund the $${illegalOverchargeCad.toFixed(2)} excess.`
    });
  }

  if (rollover) {
    statutoryViolations.push({
      code: 'ILLEGAL_ROLLOVER_LOAN',
      severity: 'HIGH',
      title: 'Illegal Rollover / Extension Loan (Payday Loans Act s. 35)',
      message: 'Ontario and BC law strictly prohibits lenders from rolling over an existing payday loan into a new agreement or advancing a replacement loan before the prior loan is fully discharged. Any rollover fees or compounding charges are illegal.'
    });
  }

  if (wageAssign) {
    statutoryViolations.push({
      code: 'PROHIBITED_WAGE_ASSIGNMENT',
      severity: 'HIGH',
      title: 'Unlawful Wage Assignment Attempt (Payday Loans Act s. 40)',
      message: 'Payday lenders are statutorily barred from demanding or enforcing an assignment of your employment wages. Employers cannot lawfully deduct wages for a payday lender without a formal court garnishment order.'
    });
  }

  if (exceedsIncomeCap) {
    statutoryViolations.push({
      code: 'EXCEEDS_50_PERCENT_NET_PAY',
      severity: 'MODERATE',
      title: 'Loan Principal Exceeds 50% Net Monthly Income Statutory Cap',
      message: `Under Payday Loans Act s. 36, the maximum advance cannot exceed 50% of your net monthly pay ($${maximumPermittedPrincipalCad.toFixed(2)} CAD). Advancing $${principal.toFixed(2)} violates lending rules.`
    });
  }

  // Defense Verdict
  let defenseVerdict = 'COMPLIANT_WITHIN_STATUTORY_BOUNDS';
  if (isCriminalInterestBreach || hasPaydayFeeOvercharge || rollover || wageAssign) {
    defenseVerdict = 'STATUTORY_VIOLATIONS_DETECTED_REMEDIES_AVAILABLE';
  }

  // Pre-Litigation Rescission & Overcharge Demand Letter
  const demandLetter = `FORMAL NOTICE OF STATUTORY RESCISSION & DEMAND FOR REFUND OF ILLEGAL BORROWING CHARGES
Date: ${assessDate}
To: ${lName} (Lender)
From: ${bName} (Borrower)
Re: Consumer Credit Agreement #${type.toUpperCase()} — Statutory Notice of Violations

Please be advised that upon legal audit of the above-referenced credit agreement, the following statutory violations were identified under Canadian law:

${statutoryViolations.map((v, i) => `${i + 1}. ${v.title}\n   ${v.message}`).join('\n\n')}

${withinCoolingOffPeriod ? `EXERCISE OF STATUTORY COOLING-OFF CANCELLATION:
Take notice that I hereby exercise my absolute statutory right under ${prov === 'ON' ? 'Ontario Payday Loans Act s. 34' : 'Consumer Protection Legislation'} to CANCEL this agreement within the statutory cooling-off window. I enclose / tender the principal amount of $${principal.toFixed(2)} CAD. All interest and fees are immediately cancelled.\n` : ''}
DEMAND FOR RECTIFICATION & REFUND:
${hasPaydayFeeOvercharge ? `You are hereby required to immediately credit / refund the unlawful fee overcharge of $${illegalOverchargeCad.toFixed(2)} CAD within 10 business days.\n` : ''}
${wageAssign ? 'You are formally notified to immediately withdraw any unlawful wage assignment notice sent to my employer pursuant to Payday Loans Act s. 40.\n' : ''}
Take notice that if these violations are not remedied promptly, I reserve all statutory rights to file a formal complaint with the Ministry of Public and Business Service Delivery (Consumer Protection Ontario), report criminal interest under Criminal Code s. 347, and seek civil remedies in Small Claims Court.

Sincerely,

${bName}
Consumer / Borrower`;

  return {
    borrowerName: bName,
    lenderName: lName,
    assessmentDate: assessDate,
    province: prov,
    loanType: type,
    principalBorrowedCad: principal,
    termDays: days,
    feesChargedCad: feesCharged,
    statutoryMaxFeesCad,
    illegalOverchargeCad,
    hasPaydayFeeOvercharge,
    violatesCriminalInterestCap: isCriminalInterestBreach,
    isRolloverLoan: rollover,
    statedAprPercent: statedApr,
    defenseVerdict,
    withinCoolingOffPeriod,
    coolingOffDaysAllowed,
    statutoryViolations,
    demandLetter
  };
}
