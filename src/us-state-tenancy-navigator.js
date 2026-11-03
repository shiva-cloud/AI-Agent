/**
 * US State Tenancy & Rent Control Navigator
 * 
 * Implements statutory landlord-tenant protections across key US destination states:
 * - California (CA): AB 1482 (Tenant Protection Act of 2019, Cal. Civ. Code §§ 1946.2, 1947.12)
 * - New York (NY): HSTPA (Housing Stability and Tenant Protection Act of 2019, NY General Obligations Law § 7-108)
 * - Texas (TX): Texas Property Code Chapter 92 (Landlord Duty to Repair, Retaliation Defense)
 * - Florida (FL): Florida Statutes Chapter 83 Part II (Residential Landlord and Tenant Act)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const US_TENANCY_CONSTANTS = {
  CALIFORNIA: {
    MAX_RENT_CAP_PERCENT: 10.0, // 5% + local CPI, max 10%
    BASELINE_PERCENT: 5.0,
    JUST_CAUSE_THRESHOLD_MONTHS: 12,
    RELOCATION_ASSISTANCE_MONTHS: 1, // 1 month rent for no-fault eviction
    SECURITY_DEPOSIT_RETURN_DAYS: 21,
    MAX_SECURITY_DEPOSIT_MONTHS: 1 // AB 12 effective July 1, 2024 (1 month rent max)
  },
  NEW_YORK: {
    MAX_SECURITY_DEPOSIT_MONTHS: 1, // HSTPA 2019 strict cap
    SECURITY_DEPOSIT_RETURN_DAYS: 14, // 14 days with itemized bill
    LATE_FEE_MAX_USD: 50.0, // or 5% of monthly rent, whichever is less
    APPLICATION_FEE_CAP_USD: 20.0
  },
  TEXAS: {
    REPAIR_NOTICE_STATUTORY_DAYS: 7, // Texas Property Code § 92.056
    SECURITY_DEPOSIT_RETURN_DAYS: 30, // Texas Property Code § 92.103
    BAD_FAITH_RETENTION_PENALTY_USD: 100, // plus 3x deposit
    BAD_FAITH_RETENTION_MULTIPLIER: 3
  },
  FLORIDA: {
    SECURITY_DEPOSIT_RETURN_DAYS_NO_CLAIM: 15, // Fla. Stat. § 83.49(3)(a)
    SECURITY_DEPOSIT_CLAIM_NOTICE_DAYS: 30,    // Certified mail with itemized deductions
    TENANT_OBJECTION_WINDOW_DAYS: 15
  },
  WASHINGTON: {
    SECURITY_DEPOSIT_RETURN_DAYS: 30, // RCW 59.18.280 (30 days with specific itemized basis)
    PAY_OR_VACATE_NOTICE_DAYS: 14     // RCW 59.18.057
  },
  ILLINOIS: {
    SECURITY_DEPOSIT_RETURN_DAYS: 45, // Chicago RLTO § 5-12-080(c) (45 days or 30 days if deductions made)
    DEDUCTION_ITEMIZATION_DAYS: 30,
    PENALTY_MULTIPLIER: 2             // Chicago RLTO § 5-12-080(f)
  }
};

export function auditUsStateTenancy({
  tenantName = 'Tenant',
  state = 'CA',
  monthlyRentUsd = 2500,
  securityDepositPaidUsd = 2500,
  rentIncreasePercent = 0,
  tenancyDurationMonths = 14,
  isSingleFamilyHomeExempt = false,
  landlordClaimedDepositUsd = 0,
  daysSinceMoveOut = 0,
  landlordProvidedItemizedStatement = true,
  repairRequested = false,
  daysSinceRepairRequest = 0,
  landlordRemediedCondition = true,
  assessmentDate
} = {}) {
  const cleanName = boundedText(tenantName, 'Tenant', 100);
  const cleanState = String(state).trim().toUpperCase();
  const safeDate = safeIsoDate(assessmentDate);
  const validState = ['CA', 'NY', 'TX', 'FL', 'WA', 'IL'].includes(cleanState) ? cleanState : 'CA';

  const safeRent = Number.isFinite(Number(monthlyRentUsd)) ? Math.max(0, Number(monthlyRentUsd)) : 0;
  const safeDeposit = Number.isFinite(Number(securityDepositPaidUsd)) ? Math.max(0, Number(securityDepositPaidUsd)) : 0;
  const safeIncrease = Number.isFinite(Number(rentIncreasePercent)) ? Math.max(0, Number(rentIncreasePercent)) : 0;
  const safeTenure = Number.isFinite(Number(tenancyDurationMonths)) ? Math.max(0, Number(tenancyDurationMonths)) : 0;
  const safeClaimed = Number.isFinite(Number(landlordClaimedDepositUsd)) ? Math.max(0, Number(landlordClaimedDepositUsd)) : 0;
  const safeDaysSinceMove = Number.isFinite(Number(daysSinceMoveOut)) ? Math.max(0, Number(daysSinceMoveOut)) : 0;
  const safeDaysSinceRepair = Number.isFinite(Number(daysSinceRepairRequest)) ? Math.max(0, Number(daysSinceRepairRequest)) : 0;

  const violations = [];
  const statutoryRights = [];

  if (validState === 'CA') {
    // California AB 1482 & AB 12
    const maxAllowedDeposit = safeRent * US_TENANCY_CONSTANTS.CALIFORNIA.MAX_SECURITY_DEPOSIT_MONTHS;
    if (safeDeposit > maxAllowedDeposit) {
      violations.push(`CA SECURITY DEPOSIT EXCEEDED: Under California AB 12 (effective July 1, 2024, amending Civ. Code § 1950.5), residential security deposits are strictly capped at 1 month rent ($${maxAllowedDeposit} USD). Landlord charged $${safeDeposit} USD.`);
    }

    if (!isSingleFamilyHomeExempt) {
      if (safeIncrease > US_TENANCY_CONSTANTS.CALIFORNIA.MAX_RENT_CAP_PERCENT) {
        violations.push(`CA AB 1482 RENT CAP EXCEEDED: Proposed increase of ${safeIncrease}% exceeds the statutory ceiling (5% + local CPI, absolute cap of 10.0% under Cal. Civ. Code § 1947.12).`);
      }
      if (safeTenure >= US_TENANCY_CONSTANTS.CALIFORNIA.JUST_CAUSE_THRESHOLD_MONTHS) {
        statutoryRights.push('JUST CAUSE EVICTION PROTECTION: Tenancy exceeds 12 months; landlord cannot terminate without statutory at-fault or no-fault just cause (Cal. Civ. Code § 1946.2).');
        statutoryRights.push(`NO-FAULT RELOCATION ASSISTANCE: If terminated for no-fault just cause (owner move-in, substantial remodel), landlord must pay 1 month rent ($${safeRent} USD) as relocation assistance.`);
      }
    }

    if (safeDaysSinceMove > US_TENANCY_CONSTANTS.CALIFORNIA.SECURITY_DEPOSIT_RETURN_DAYS && !landlordProvidedItemizedStatement) {
      violations.push('CA DEPOSIT RETURN VIOLATION: Landlord failed to return deposit or provide itemized deductions with receipts within 21 calendar days (Cal. Civ. Code § 1950.5(g)). Forfeits right to retain deposit.');
    }
  } else if (validState === 'NY') {
    // New York HSTPA 2019
    const maxAllowedDeposit = safeRent * US_TENANCY_CONSTANTS.NEW_YORK.MAX_SECURITY_DEPOSIT_MONTHS;
    if (safeDeposit > maxAllowedDeposit) {
      violations.push(`NY HSTPA SECURITY DEPOSIT EXCEEDED: NY General Obligations Law § 7-108 strictly limits security deposits to 1 month rent ($${maxAllowedDeposit} USD). Demanding advance rent plus deposit violates state law.`);
    }

    if (safeDaysSinceMove > US_TENANCY_CONSTANTS.NEW_YORK.SECURITY_DEPOSIT_RETURN_DAYS && !landlordProvidedItemizedStatement) {
      violations.push(`NY 14-DAY DEPOSIT FORFEITURE: Landlord failed to deliver itemized accounting and refund within 14 days of vacancy. Under GOL § 7-108(1-e), landlord forfeits all rights to retain any portion of the deposit.`);
    }
    statutoryRights.push('LATE FEE STATUTORY CAP: Late fees cannot exceed $50 or 5% of monthly rent, whichever is less, and cannot be charged until rent is 5 days late (Real Property Law § 238-a).');
  } else if (validState === 'TX') {
    // Texas Property Code Ch 92
    if (repairRequested && !landlordRemediedCondition && safeDaysSinceRepair > US_TENANCY_CONSTANTS.TEXAS.REPAIR_NOTICE_STATUTORY_DAYS) {
      violations.push(`TX DUTY TO REPAIR BREACH: Landlord failed to make diligent effort to repair condition affecting physical health and safety within 7 days of certified written notice (Tex. Prop. Code § 92.056).`);
      statutoryRights.push('TX STATUTORY REPAIR REMEDIES: Tenant may terminate lease, repair and deduct up to 1 month rent, or sue for statutory damages of $500 + 1 month rent + court costs (Tex. Prop. Code § 92.0563).');
    }
    if (safeDaysSinceMove > US_TENANCY_CONSTANTS.TEXAS.SECURITY_DEPOSIT_RETURN_DAYS && !landlordProvidedItemizedStatement) {
      violations.push('TX BAD FAITH DEPOSIT RETENTION: Landlord failed to refund deposit within 30 days. Under Tex. Prop. Code § 92.109, bad faith retention makes landlord liable for $100 + 3x the deposit unlawfully retained.');
    }
  } else if (validState === 'FL') {
    // Florida Chapter 83
    if (safeClaimed > 0 && safeDaysSinceMove > US_TENANCY_CONSTANTS.FLORIDA.SECURITY_DEPOSIT_CLAIM_NOTICE_DAYS) {
      violations.push(`FL DEPOSIT CLAIM FORFEITURE: Under Fla. Stat. § 83.49(3)(a), landlord has 30 days to send written claim by certified mail. Missing this deadline forfeits right to impose claim against deposit.`);
    } else if (safeClaimed === 0 && safeDaysSinceMove > US_TENANCY_CONSTANTS.FLORIDA.SECURITY_DEPOSIT_RETURN_DAYS_NO_CLAIM) {
      violations.push(`FL 15-DAY RETURN BREACH: Landlord must return full deposit within 15 days if no claim is made.`);
    }
    statutoryRights.push('FL TENANT OBJECTION RIGHT: Tenant has 15 days from receipt of landlord certified notice to object in writing to proposed deposit deductions (Fla. Stat. § 83.49(3)(b)).');
  } else if (validState === 'WA') {
    // Washington State RLTA (RCW 59.18)
    if (safeDaysSinceMove > US_TENANCY_CONSTANTS.WASHINGTON.SECURITY_DEPOSIT_RETURN_DAYS && !landlordProvidedItemizedStatement) {
      violations.push('WA DEPOSIT RETURN VIOLATION: Landlord failed to deliver full refund and specific itemized statement within 30 days of vacating (RCW 59.18.280). Landlord liable for up to 2x the deposit amount plus attorney fees.');
    }
    statutoryRights.push('WA MOVE-IN CHECKLIST PROTECTION: Under RCW 59.18.260, no security deposit may be collected or retained unless a signed move-in condition checklist was provided at lease inception.');
    statutoryRights.push('WA 14-DAY NOTICE REQUIREMENT: Landlords must provide a statutory 14-day notice to pay rent or vacate before initiating unlawful detainer proceedings (RCW 59.18.057).');
  } else if (validState === 'IL') {
    // Illinois / Chicago RLTO (Municipal Code § 5-12-080)
    if (safeDaysSinceMove > US_TENANCY_CONSTANTS.ILLINOIS.SECURITY_DEPOSIT_RETURN_DAYS && !landlordProvidedItemizedStatement) {
      violations.push('IL/CHICAGO RLTO DEPOSIT VIOLATION: Under Chicago RLTO § 5-12-080(c), deposit must be returned within 45 days (or itemized within 30 days). Landlord liable for statutory penalty equal to 2x the deposit amount.');
    }
    statutoryRights.push('IL/CHICAGO RLTO INTEREST REQUIREMENT: Landlord must hold deposit in a federally insured Illinois account and pay annual interest within 30 days of each 12-month period (§ 5-12-080(a)).');
    statutoryRights.push('IL 5-DAY NOTICE REQUIREMENT: Illinois 735 ILCS 5/9-209 requires a 5-day written notice of demand for rent prior to tenancy termination.');
  }

  return {
    jurisdiction: 'United States',
    state: validState,
    tenantName: cleanName,
    assessmentDate: safeDate,
    financialOverview: {
      monthlyRentUsd: safeRent,
      securityDepositPaidUsd: safeDeposit,
      rentIncreasePercent: safeIncrease,
      tenancyDurationMonths: safeTenure
    },
    statutoryViolations: violations,
    isCompliant: violations.length === 0,
    statutoryRights,
    disputeForum: validState === 'CA'
      ? 'California Small Claims Court (claims up to $12,500 for natural persons)'
      : validState === 'NY'
      ? 'New York City Housing Court / Small Claims Court (claims up to $10,000)'
      : validState === 'TX'
      ? 'Texas Justice of the Peace (JP) Court (claims up to $20,000)'
      : validState === 'FL'
      ? 'Florida County Court / Small Claims Division (claims up to $8,000)'
      : validState === 'WA'
      ? 'Washington District Court Small Claims Division (claims up to $10,000)'
      : 'Cook County Circuit Court / First Municipal District (Chicago RLTO Claims)'
  };
}
