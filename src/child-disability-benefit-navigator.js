/**
 * Child Disability Benefit (CDB) & Registered Disability Savings Plan (RDSP) Engine
 *
 * Implements statutory assessment under:
 * - Income Tax Act (RSC 1985 c. 1 (5th Supp.)) s. 122.61 (Child Disability Benefit)
 * - Income Tax Act s. 118.3 & s. 118.4 (Disability Tax Credit eligibility & Form T2201)
 * - Income Tax Act s. 146.4 (Registered Disability Savings Plans)
 * - Canada Disability Savings Act (SC 2004 c. 26) ss. 5–6 (Grants and Bonds)
 * - Canada Disability Savings Regulations (SOR/2005-37) ss. 3–5 (Assistance Holdback Amount)
 *
 * Key Statutory Rules:
 * - Disability Tax Credit (DTC) Prerequisite: To receive the CDB or open an RDSP with grant matching,
 *   the child must have an approved Form T2201 certified by an authorized medical practitioner
 *   confirming a severe and prolonged impairment (lasting or expected to last >= 12 months).
 * - Child Disability Benefit (CDB): A tax-free monthly supplement to the Canada Child Benefit (CCB)
 *   for eligible children under age 18. Maximum 2026 benefit is $3,173.00/year ($264.41/month).
 *   Phase-out begins at adjusted family net income (AFNI) of $79,000 at a 3.2% reduction rate.
 * - Canada Disability Savings Grant (CDSG):
 *   - Tier 1 (Family Net Income <= $111,733): 300% on the first $500 ($1,500) + 200% on the next $1,000 ($2,000)
 *     = $3,500 max annual grant on a $1,500 contribution.
 *   - Tier 2 (Family Net Income > $111,733): 100% on the first $1,000 = $1,000 max annual grant.
 *   - Lifetime Grant Cap: $70,000.
 * - Canada Disability Savings Bond (CDSB):
 *   - Available with $0 contribution for low/modest-income beneficiaries.
 *   - Full $1,000/year if family income <= $36,502; pro-rated up to $55,867.
 *   - Lifetime Bond Cap: $20,000.
 * - 10-Year Repayment Rule: All grants and bonds paid within the preceding 10 years must be held
 *   back (Assistance Holdback Amount) and would be returned to the Government if the plan is closed.
 * - 10-Year Retroactive Catch-Up: CRA allows claiming unused grant entitlements up to $10,500/year.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const DISABILITY_BENEFIT_CONSTANTS = Object.freeze({
  ANNUAL_CDB_MAX_AMOUNT_CAD: 3173.0,
  MONTHLY_CDB_MAX_AMOUNT_CAD: 264.41,
  CDB_PHASE_OUT_INCOME_THRESHOLD_CAD: 79000.0,
  CDB_PHASE_OUT_RATE_SINGLE_CHILD: 0.032,
  RDSP_MAX_LIFETIME_GRANT_CAD: 70000.0,
  RDSP_MAX_LIFETIME_BOND_CAD: 20000.0,
  RDSP_TIER1_INCOME_THRESHOLD_CAD: 111733.0,
  RDSP_BOND_FULL_INCOME_THRESHOLD_CAD: 36502.0,
  RDSP_BOND_CUTOFF_INCOME_THRESHOLD_CAD: 55867.0,
  RDSP_HOLDBACK_RULE_YEARS: 10,
  CHILD_AGE_LIMIT_CDB_YEARS: 18,
  RDSP_GRANT_AGE_LIMIT_YEARS: 49
});

/**
 * Evaluates Child Disability Benefit (CDB) and RDSP Grant/Bond entitlements.
 *
 * @param {Object} options
 * @param {number} [options.childAgeYears=8] - Age of the child in years
 * @param {boolean} [options.hasApprovedDtcT2201=true] - Form T2201 approved by CRA
 * @param {boolean} [options.dtcConditionIsProlonged=true] - Severe impairment lasting >= 12 months
 * @param {number} [options.familyNetIncomeCad=55000] - Adjusted Family Net Income (AFNI)
 * @param {number} [options.annualRdspContributionCad=1500] - Proposed annual RDSP deposit
 * @param {number} [options.unclaimedPastYears=3] - Prior tax years eligible for retroactive catch-up
 * @param {string} [options.childName='Eligible Child'] - Child name
 * @param {string} [options.parentName='Parent / Legal Guardian'] - Parent name
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive CDB & RDSP diagnostic
 */
export function evaluateChildDisabilityBenefit(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const age = Math.max(0, Math.min(100, Number.isFinite(Number(safeOptions.childAgeYears)) ? Math.floor(Number(safeOptions.childAgeYears)) : 8));
  const hasDtc = Boolean(safeOptions.hasApprovedDtcT2201);
  const isProlonged = safeOptions.dtcConditionIsProlonged !== false;
  const afni = Math.max(0, Math.min(10000000, Number.isFinite(Number(safeOptions.familyNetIncomeCad)) ? Number(safeOptions.familyNetIncomeCad) : 55000));
  const contribution = Math.max(0, Math.min(1000000, Number.isFinite(Number(safeOptions.annualRdspContributionCad)) ? Number(safeOptions.annualRdspContributionCad) : 1500));
  const pastYears = Math.max(0, Math.min(10, Number.isFinite(Number(safeOptions.unclaimedPastYears)) ? Math.floor(Number(safeOptions.unclaimedPastYears)) : 0));
  const child = boundedText(safeOptions.childName, 'Eligible Child', 100);
  const parent = boundedText(safeOptions.parentName, 'Parent / Legal Guardian', 100);
  const assessDate = safeIsoDate(safeOptions.assessmentDate, '2026-10-31');

  const statutoryProtections = [];
  const riskWarnings = [];
  const actionPlan = [];

  // 1. DTC Eligibility & Prerequisite Gate
  const dtcEligible = hasDtc && isProlonged;
  if (!hasDtc) {
    riskWarnings.push('DTC CERTIFICATE REQUIRED: Form T2201 (Disability Tax Credit Certificate) must be certified by a physician, nurse practitioner, or psychologist and approved by the CRA before CDB payments or RDSP grants can be released.');
    actionPlan.push('Download CRA Form T2201 and take it to child\'s medical specialist for formal impairment certification.');
  } else {
    statutoryProtections.push('ITA s. 118.3: Approved DTC opens eligibility for Child Disability Benefit, RDSP grants/bonds, and medical expense deductions.');
  }

  // 2. Child Disability Benefit (CDB) Calculation
  let annualCdbCad = 0;
  let monthlyCdbCad = 0;
  let cdbEligible = false;

  if (dtcEligible && age < DISABILITY_BENEFIT_CONSTANTS.CHILD_AGE_LIMIT_CDB_YEARS) {
    cdbEligible = true;
    if (afni <= DISABILITY_BENEFIT_CONSTANTS.CDB_PHASE_OUT_INCOME_THRESHOLD_CAD) {
      annualCdbCad = DISABILITY_BENEFIT_CONSTANTS.ANNUAL_CDB_MAX_AMOUNT_CAD;
      monthlyCdbCad = DISABILITY_BENEFIT_CONSTANTS.MONTHLY_CDB_MAX_AMOUNT_CAD;
    } else {
      const excessIncome = afni - DISABILITY_BENEFIT_CONSTANTS.CDB_PHASE_OUT_INCOME_THRESHOLD_CAD;
      const reduction = excessIncome * DISABILITY_BENEFIT_CONSTANTS.CDB_PHASE_OUT_RATE_SINGLE_CHILD;
      annualCdbCad = Math.max(0, Number((DISABILITY_BENEFIT_CONSTANTS.ANNUAL_CDB_MAX_AMOUNT_CAD - reduction).toFixed(2)));
      monthlyCdbCad = Number((annualCdbCad / 12).toFixed(2));
    }
    statutoryProtections.push(`ITA s. 122.61: Eligible for tax-free Child Disability Benefit of $${monthlyCdbCad.toFixed(2)}/month ($${annualCdbCad.toFixed(2)}/year).`);
  } else if (age >= DISABILITY_BENEFIT_CONSTANTS.CHILD_AGE_LIMIT_CDB_YEARS) {
    riskWarnings.push(`Child is ${age} years old. CDB terminates at age 18. Transition to adult DTC transfer and Ontario/provincial disability support programs (e.g. ODSP/AISH).`);
  }

  // 3. RDSP Grant & Bond Calculation
  let estimatedGrantCad = 0;
  let estimatedBondCad = 0;
  const isGrantEligibleAge = age <= DISABILITY_BENEFIT_CONSTANTS.RDSP_GRANT_AGE_LIMIT_YEARS;

  if (dtcEligible && isGrantEligibleAge) {
    // Grant calculation
    if (afni <= DISABILITY_BENEFIT_CONSTANTS.RDSP_TIER1_INCOME_THRESHOLD_CAD) {
      const tier1_first500 = Math.min(contribution, 500);
      const tier1_next1000 = Math.min(Math.max(0, contribution - 500), 1000);
      estimatedGrantCad = (tier1_first500 * 3.0) + (tier1_next1000 * 2.0);
    } else {
      estimatedGrantCad = Math.min(contribution, 1000) * 1.0;
    }

    // Bond calculation (does not require contribution)
    if (afni <= DISABILITY_BENEFIT_CONSTANTS.RDSP_BOND_FULL_INCOME_THRESHOLD_CAD) {
      estimatedBondCad = 1000.0;
    } else if (afni < DISABILITY_BENEFIT_CONSTANTS.RDSP_BOND_CUTOFF_INCOME_THRESHOLD_CAD) {
      const slope = 1000.0 / (DISABILITY_BENEFIT_CONSTANTS.RDSP_BOND_CUTOFF_INCOME_THRESHOLD_CAD - DISABILITY_BENEFIT_CONSTANTS.RDSP_BOND_FULL_INCOME_THRESHOLD_CAD);
      estimatedBondCad = Math.max(0, Number((1000.0 - slope * (afni - DISABILITY_BENEFIT_CONSTANTS.RDSP_BOND_FULL_INCOME_THRESHOLD_CAD)).toFixed(2)));
    }

    statutoryProtections.push(`Canada Disability Savings Act s. 5: Federal government matches contributions with up to $${estimatedGrantCad.toFixed(2)} in CDSG grants annually.`);
    if (estimatedBondCad > 0) {
      statutoryProtections.push(`Canada Disability Savings Act s. 6: Child qualifies for $${estimatedBondCad.toFixed(2)} annual Canada Disability Savings Bond with $0 required deposits.`);
    }
  }

  // 4. Retroactive Catch-Up Audit
  let retroactivePotentialCad = 0;
  if (dtcEligible && pastYears > 0) {
    // Maximum catch-up grant is $10,500/year under CDSA rules
    retroactivePotentialCad = Math.min(10500, pastYears * 3500);
    statutoryProtections.push(`10-Year Carry Forward: Up to $${retroactivePotentialCad.toFixed(2)} in unused past grants can be unlocked through catch-up deposits.`);
    actionPlan.push(`Contribute catch-up deposits to maximize the ${pastYears}-year retroactive grant entitlement.`);
  }

  // 5. 10-Year Holdback Rule Advisory
  riskWarnings.push('10-YEAR ASSISTANCE HOLDBACK RULE: Grants and bonds received in the past 10 years must be repaid if the RDSP is closed or if DTC certification lapses. Long-term preservation is required.');

  if (dtcEligible) {
    actionPlan.push('Open an RDSP with a major financial institution (RBC, TD, BMO, CIBC, Scotiabank) naming the child as beneficiary.');
    actionPlan.push(`Deposit $${contribution.toFixed(2)} to trigger estimated $${estimatedGrantCad.toFixed(2)} in federal matching grants.`);
  }

  return {
    beneficiaryName: child,
    parentName: parent,
    assessmentDate: assessDate,
    dtcStatus: {
      hasApprovedFormT2201: hasDtc,
      isSevereAndProlonged: isProlonged,
      isDtcPrerequisiteSatisfied: dtcEligible
    },
    childDisabilityBenefit: {
      isEligible: cdbEligible,
      childAgeYears: age,
      familyNetIncomeCad: afni,
      annualBenefitCad: annualCdbCad,
      monthlyBenefitCad: monthlyCdbCad,
      incomeThresholdCad: DISABILITY_BENEFIT_CONSTANTS.CDB_PHASE_OUT_INCOME_THRESHOLD_CAD
    },
    rdspEntitlements: {
      isGrantEligibleAge,
      proposedAnnualContributionCad: contribution,
      estimatedAnnualGrantCad: estimatedGrantCad,
      estimatedAnnualBondCad: estimatedBondCad,
      totalAnnualGovernmentAssistanceCad: estimatedGrantCad + estimatedBondCad,
      retroactiveCatchUpPotentialCad: retroactivePotentialCad,
      lifetimeGrantLimitCad: DISABILITY_BENEFIT_CONSTANTS.RDSP_MAX_LIFETIME_GRANT_CAD,
      lifetimeBondLimitCad: DISABILITY_BENEFIT_CONSTANTS.RDSP_MAX_LIFETIME_BOND_CAD
    },
    statutoryProtections,
    riskWarnings,
    actionPlan
  };
}
