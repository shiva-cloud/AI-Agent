/**
 * UK Devolved Tenancy Navigator (Scotland, Wales, Northern Ireland)
 * 
 * Implements non-English tenancy rights across the devolved nations:
 * - Scotland: Private Housing (Tenancies) (Scotland) Act 2016 (Private Residential Tenancy - PRT)
 * - Wales: Renting Homes (Wales) Act 2016 (Standard Occupation Contracts)
 * - Northern Ireland: Private Tenancies (Northern Ireland) Order 2006 & Tenancy Deposit Schemes Regulations (NI) 2012
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const UK_DEVOLVED_TENANCY_CONSTANTS = {
  SCOTLAND: {
    TENANCY_TYPE: 'Private Residential Tenancy (PRT)',
    NO_FAULT_EVICTIONS_PERMITTED: false, // Section 21 does NOT exist in Scotland
    MAX_DEPOSIT_MONTHS: 2,
    STATUTORY_EVICTION_GROUNDS_COUNT: 18,
    NOTICE_TO_LEAVE_DAYS_SHORT_TENANCY: 28, // <= 6 months tenure
    NOTICE_TO_LEAVE_DAYS_LONG_TENANCY: 84,  // > 6 months tenure
    TRIBUNAL: 'First-tier Tribunal for Scotland (Housing and Property Chamber)'
  },
  WALES: {
    TENANCY_TYPE: 'Standard Occupation Contract',
    NO_FAULT_NOTICE_MONTHS: 6, // 6 months notice required under Section 173
    MIN_MORATORIUM_BEFORE_NOTICE_MONTHS: 6, // Landlord cannot issue s.173 notice in first 6 months
    WRITTEN_STATEMENT_STATUTORY_DEADLINE_DAYS: 14,
    FIT_FOR_HUMAN_HABITATION_MANDATORY: true // Electrical safety, smoke and CO alarms mandatory
  },
  NORTHERN_IRELAND: {
    TENANCY_TYPE: 'Private Tenancy',
    BOND_PROTECTION_DEADLINE_DAYS: 28, // Tenancy Deposit Schemes Regulations (NI) 2012
    MAX_DEPOSIT_MONTHS: 1, // Private Tenancies Act (NI) 2022
    NOTICE_TO_QUIT_WEEKS_TIERS: Object.freeze([
      { maxYears: 1, weeksRequired: 4 },
      { maxYears: 10, weeksRequired: 8 },
      { maxYears: Infinity, weeksRequired: 12 }
    ])
  }
};

export function auditUkDevolvedTenancy({
  tenantName = 'Tenant',
  nation = 'Scotland',
  monthlyRentGbp = 1000,
  depositPaidGbp = 1000,
  tenureDurationMonths = 12,
  noticeGivenDays = 28,
  noticeType = 'notice_to_leave',
  evictionGround = 'landlord_intends_to_sell',
  assessmentDate
} = {}) {
  const cleanName = boundedText(tenantName, 'Tenant', 100);
  const cleanNation = String(nation).trim().toLowerCase();
  const safeDate = safeIsoDate(assessmentDate);

  const isScotland = cleanNation.includes('scot');
  const isWales = cleanNation.includes('wales') || cleanNation.includes('cymru');
  const isNI = cleanNation.includes('ni') || cleanNation.includes('northern ireland');

  const resolvedNation = isScotland ? 'Scotland' : isWales ? 'Wales' : isNI ? 'Northern Ireland' : 'Scotland';
  const safeRent = Number.isFinite(Number(monthlyRentGbp)) ? Math.max(0, Number(monthlyRentGbp)) : 0;
  const safeDeposit = Number.isFinite(Number(depositPaidGbp)) ? Math.max(0, Number(depositPaidGbp)) : 0;
  const safeTenure = Number.isFinite(Number(tenureDurationMonths)) ? Math.max(0, Number(tenureDurationMonths)) : 0;
  const safeNoticeDays = Number.isFinite(Number(noticeGivenDays)) ? Math.max(0, Number(noticeGivenDays)) : 0;

  const violations = [];
  const statutoryProtections = [];

  if (resolvedNation === 'Scotland') {
    const maxAllowedDeposit = safeRent * UK_DEVOLVED_TENANCY_CONSTANTS.SCOTLAND.MAX_DEPOSIT_MONTHS;
    if (safeDeposit > maxAllowedDeposit) {
      violations.push(`SCOTLAND DEPOSIT EXCEEDED: Under the Housing (Scotland) Act 2006, deposits are strictly capped at 2 months rent (£${maxAllowedDeposit} GBP). Landlord charged £${safeDeposit} GBP.`);
    }

    const minRequiredNotice = safeTenure <= 6 ? 28 : 84;
    // Certain grounds allow 28 days even after 6 months (rent arrears, breach)
    const isGroundRequiring84Days = ['landlord_intends_to_sell', 'landlord_family_move_in', 'refurbishment'].includes(evictionGround);
    if (safeTenure > 6 && isGroundRequiring84Days && safeNoticeDays < 84) {
      violations.push(`SCOTLAND NOTICE DEFICIENCY: For tenancies exceeding 6 months under ground "${evictionGround}", landlord must provide at least 84 days notice via statutory Notice to Leave. Only ${safeNoticeDays} days provided.`);
    }

    statutoryProtections.push('OPEN-ENDED TENANCY: In Scotland, fixed-term leases are abolished. Tenancies are open-ended PRTs with no end date.');
    statutoryProtections.push('NO SECTION 21 "NO-FAULT" EVICTIONS: Landlord can only evict using one of the 18 statutory grounds under Schedule 3 of the 2016 Act.');
    statutoryProtections.push(`TRIBUNAL DISPUTE: Landlord cannot enforce eviction without an order from the ${UK_DEVOLVED_TENANCY_CONSTANTS.SCOTLAND.TRIBUNAL}.`);
  } else if (resolvedNation === 'Wales') {
    const minNoticeDays = 180; // 6 months
    if (noticeType === 'section_173' && safeTenure < 6) {
      violations.push('WALES 6-MONTH MORATORIUM: Landlord cannot issue a section 173 no-fault notice during the first 6 months of the contract.');
    }
    if (noticeType === 'section_173' && safeNoticeDays < minNoticeDays) {
      violations.push(`WALES 6-MONTH NOTICE BREACH: Under the Renting Homes (Wales) Act 2016, no-fault notices require at least 6 months notice (approx 180 days). Only ${safeNoticeDays} days given.`);
    }
    statutoryProtections.push('STANDARD OCCUPATION CONTRACT: Tenants are contract-holders with statutory rights under the Renting Homes (Wales) Act 2016.');
    statutoryProtections.push('WRITTEN STATEMENT ENTITLEMENT: Landlord must provide the full written statement within 14 days of occupation.');
  } else if (resolvedNation === 'Northern Ireland') {
    const maxAllowedDeposit = safeRent * UK_DEVOLVED_TENANCY_CONSTANTS.NORTHERN_IRELAND.MAX_DEPOSIT_MONTHS;
    if (safeDeposit > maxAllowedDeposit) {
      violations.push(`NI DEPOSIT CAP EXCEEDED: Under the Private Tenancies Act (NI) 2022, security deposits are capped at 1 month rent (£${maxAllowedDeposit} GBP). Landlord charged £${safeDeposit} GBP.`);
    }
    statutoryProtections.push('TENANCY DEPOSIT SCHEME MANDATORY: Deposit must be protected in an approved NI scheme (TDS Northern Ireland or MyDeposits NI) within 28 days.');
    statutoryProtections.push('ENERGY PERFORMANCE COMPLIANCE: Landlords must supply a valid Energy Performance Certificate (EPC) free of charge.');
  }

  return {
    jurisdiction: 'United Kingdom',
    devolvedNation: resolvedNation,
    tenantName: cleanName,
    assessmentDate: safeDate,
    financialSummary: {
      monthlyRentGbp: safeRent,
      depositPaidGbp: safeDeposit,
      tenureMonths: safeTenure
    },
    evictionAudit: {
      noticeType,
      noticeGivenDays: safeNoticeDays,
      evictionGround,
      isNoticeLawful: violations.length === 0
    },
    statutoryViolations: violations,
    statutoryProtections,
    isCompliant: violations.length === 0
  };
}
