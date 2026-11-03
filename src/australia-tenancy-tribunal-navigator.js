/**
 * Australia Tenancy Tribunal & State Bond Navigator
 * 
 * Implements state-level statutory tenancy protections across:
 * - New South Wales (NSW): NCAT & Residential Tenancies Act 2010 (RTA 2010)
 * - Victoria (VIC): VCAT & Residential Tenancies Act 1997 (RTA 1997)
 * - Queensland (QLD): QCAT & Residential Tenancies Authority (RTRAA 2008)
 * - Western Australia (WA): DMIRS & Residential Tenancies Act 1987 (RTA 1987)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const AUSTRALIA_TENANCY_CONSTANTS = {
  MAX_BOND_WEEKS: {
    NSW: 4,
    VIC: 4, // 4 weeks for rent <= $900/wk (indexed)
    QLD: 4,
    WA: 4   // 4 weeks for rent <= $1,200/wk
  },
  MIN_RENT_INCREASE_INTERVAL_MONTHS: {
    NSW: 12,
    VIC: 12,
    QLD: 12,
    WA: 12
  },
  RENT_INCREASE_NOTICE_DAYS: {
    NSW: 60,
    VIC: 60,
    QLD: 60,
    WA: 60
  },
  TRIBUNAL_BY_STATE: {
    NSW: {
      name: 'NSW Civil and Administrative Tribunal (NCAT)',
      tribunalDivision: 'Consumer and Commercial Division',
      bondPortal: 'Rental Bonds Online (RBO) via NSW Fair Trading',
      governingAct: 'Residential Tenancies Act 2010 (NSW)'
    },
    VIC: {
      name: 'Victorian Civil and Administrative Tribunal (VCAT)',
      tribunalDivision: 'Residential Tenancies List',
      bondPortal: 'Residential Tenancies Bond Authority (RTBA)',
      governingAct: 'Residential Tenancies Act 1997 (Vic)'
    },
    QLD: {
      name: 'Queensland Civil and Administrative Tribunal (QCAT)',
      tribunalDivision: 'Residential Tenancies Disputes',
      bondPortal: 'Residential Tenancies Authority (RTA) Web Services',
      governingAct: 'Residential Tenancies and Rooming Accommodation Act 2008 (Qld)'
    },
    WA: {
      name: 'Magistrates Court of Western Australia (Residential Tenancies)',
      tribunalDivision: 'Civil Claims / Tenancy',
      bondPortal: 'BondsOnline via DMIRS Consumer Protection',
      governingAct: 'Residential Tenancies Act 1987 (WA)'
    }
  }
};

export function auditAustralianTenancy({
  tenantName = 'Tenant',
  state = 'NSW',
  weeklyRentAud = 650,
  bondPaidAud = 2600,
  rentIncreasePercent = 0,
  monthsSinceLastRentIncrease = 12,
  noticeGivenDays = 60,
  isPeriodicTenancy = true,
  assessmentDate
} = {}) {
  const cleanName = boundedText(tenantName, 'Tenant', 100);
  const cleanState = String(state).trim().toUpperCase();
  const safeDate = safeIsoDate(assessmentDate);
  const validState = ['NSW', 'VIC', 'QLD', 'WA'].includes(cleanState) ? cleanState : 'NSW';

  const safeRent = Number.isFinite(Number(weeklyRentAud)) ? Math.max(0, Number(weeklyRentAud)) : 0;
  const safeBond = Number.isFinite(Number(bondPaidAud)) ? Math.max(0, Number(bondPaidAud)) : 0;
  const safeIncrease = Number.isFinite(Number(rentIncreasePercent)) ? Math.max(0, Number(rentIncreasePercent)) : 0;
  const safeMonths = Number.isFinite(Number(monthsSinceLastRentIncrease)) ? Math.max(0, Number(monthsSinceLastRentIncrease)) : 12;
  const safeNoticeDays = Number.isFinite(Number(noticeGivenDays)) ? Math.max(0, Number(noticeGivenDays)) : 60;

  const tribunalInfo = AUSTRALIA_TENANCY_CONSTANTS.TRIBUNAL_BY_STATE[validState];
  const maxAllowedBond = safeRent * AUSTRALIA_TENANCY_CONSTANTS.MAX_BOND_WEEKS[validState];
  const isBondExcessive = safeBond > maxAllowedBond;
  const excessBondAud = isBondExcessive ? safeBond - maxAllowedBond : 0;

  const minInterval = AUSTRALIA_TENANCY_CONSTANTS.MIN_RENT_INCREASE_INTERVAL_MONTHS[validState];
  const isIntervalCompliant = safeIncrease === 0 || safeMonths >= minInterval;

  const minNotice = AUSTRALIA_TENANCY_CONSTANTS.RENT_INCREASE_NOTICE_DAYS[validState];
  const isNoticeCompliant = safeIncrease === 0 || safeNoticeDays >= minNotice;

  const violations = [];
  if (isBondExcessive) {
    violations.push(`BOND CAP EXCEEDED: Under the ${tribunalInfo.governingAct}, the maximum bond is strictly 4 weeks' rent ($${maxAllowedBond} AUD). Landlord unlawfully demanded an excess of $${excessBondAud} AUD.`);
  }
  if (!isIntervalCompliant) {
    violations.push(`PREMATURE RENT INCREASE: Rent cannot be increased more than once every ${minInterval} months in ${validState}. Only ${safeMonths} months have elapsed since the last increase.`);
  }
  if (!isNoticeCompliant) {
    violations.push(`INSUFFICIENT RENT INCREASE NOTICE: The law requires at least ${minNotice} days written notice in the approved statutory form. Only ${safeNoticeDays} days notice was provided.`);
  }

  return {
    jurisdiction: 'Australia',
    state: validState,
    tenantName: cleanName,
    assessmentDate: safeDate,
    tribunal: tribunalInfo.name,
    tribunalDivision: tribunalInfo.tribunalDivision,
    bondAuthority: tribunalInfo.bondPortal,
    governingLegislation: tribunalInfo.governingAct,
    financialSummary: {
      weeklyRentAud: safeRent,
      bondPaidAud: safeBond,
      maxStatutoryBondAud: maxAllowedBond,
      isBondCompliant: !isBondExcessive,
      excessBondAud
    },
    rentIncreaseAudit: {
      rentIncreasePercent: safeIncrease,
      monthsSinceLastIncrease: safeMonths,
      minMonthsRequired: minInterval,
      noticeGivenDays: safeNoticeDays,
      minNoticeDaysRequired: minNotice,
      isIncreaseLawful: isIntervalCompliant && isNoticeCompliant
    },
    statutoryRemedies: [
      `BOND LODGEMENT: Landlords must lodge bonds directly with ${tribunalInfo.bondPortal} within statutory timeframes (NSW: 10 working days; VIC: 10 days; QLD: 10 days; WA: 14 days).`,
      `EXCESSIVE RENT INCREASE CHALLENGE: If a rent increase is above market rate, tenants may apply to ${tribunalInfo.name} within 30 days of receiving notice to order a reduction.`,
      `REPAIR ORDERS: Urgent repairs (burst water pipes, gas leaks, broken toilets) must be reimbursed up to statutory emergency caps or resolved immediately via urgent application to ${tribunalInfo.name}.`
    ],
    violations,
    overallComplianceStatus: violations.length === 0 ? 'COMPLIANT' : 'STATUTORY_BREACH'
  };
}
