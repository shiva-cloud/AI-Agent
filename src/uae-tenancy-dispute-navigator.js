/**
 * UAE Tenancy & Rent Increase Dispute Navigator (Dubai & Abu Dhabi)
 * 
 * Implements emirate-level tenancy laws:
 * - Dubai: Law No. 26 of 2007, Law No. 33 of 2008, Decree No. 43 of 2013 (RERA Rent Index & Rental Dispute Center - RDC)
 * - Abu Dhabi: Law No. 20 of 2006, Chairman of Executive Council Resolution No. 14 of 2016 (Tawtheeq & 5% Rent Cap)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const UAE_TENANCY_CONSTANTS = {
  DUBAI: {
    RERA_PORTAL: 'Ejari (Dubai Land Department)',
    DISPUTE_BODY: 'Rental Dispute Center (RDC)',
    STATUTORY_RENEWAL_NOTICE_DAYS: 90, // Law No. 33 of 2008 art. 14 (90 days written notice before lease expiry)
    DEPOSIT_FURNISHED_PERCENT: 10,     // Standard market practice (10% furnished)
    DEPOSIT_UNFURNISHED_PERCENT: 5,   // Standard market practice (5% unfurnished)
    EVICTION_NOTICE_MONTHS: 12        // Law No. 33 of 2008 art. 25(2) (12 months via Notary Public / registered mail)
  },
  ABU_DHABI: {
    TAWTHEEQ_PORTAL: 'Tamm / Department of Municipalities and Transport (DMT)',
    DISPUTE_BODY: 'Rent Dispute Committee (RDC Abu Dhabi)',
    MAX_ANNUAL_RENT_INCREASE_CAP_PERCENT: 5.0, // Resolution No. 14 of 2016 (5% annual rent cap)
    STATUTORY_RENEWAL_NOTICE_MONTHS: 2         // 2 months notice prior to lease expiry for any variation
  }
};

/**
 * Calculates lawful rent increase under Dubai Decree No. 43 of 2013
 */
export function calculateDubaiReraIncrease(currentRentAed, averageMarketRentAed) {
  const current = Math.max(0, Number(currentRentAed) || 0);
  const market = Math.max(0, Number(averageMarketRentAed) || 0);
  if (current === 0 || market === 0 || current >= market) {
    return { maxIncreasePercent: 0, lawfulRentAed: current, reason: 'Current rent is at or above market rate; no increase permitted.' };
  }

  const discountPercent = ((market - current) / market) * 100;

  let maxIncreasePercent = 0;
  let reason = '';

  if (discountPercent <= 10) {
    maxIncreasePercent = 0;
    reason = `Current rent is ${discountPercent.toFixed(1)}% below market (<= 10% below). Under Decree 43, NO rent increase is permitted.`;
  } else if (discountPercent <= 20) {
    maxIncreasePercent = 5;
    reason = `Current rent is ${discountPercent.toFixed(1)}% below market (11-20% below). Maximum allowable increase is 5%.`;
  } else if (discountPercent <= 30) {
    maxIncreasePercent = 10;
    reason = `Current rent is ${discountPercent.toFixed(1)}% below market (21-30% below). Maximum allowable increase is 10%.`;
  } else if (discountPercent <= 40) {
    maxIncreasePercent = 15;
    reason = `Current rent is ${discountPercent.toFixed(1)}% below market (31-40% below). Maximum allowable increase is 15%.`;
  } else {
    maxIncreasePercent = 20;
    reason = `Current rent is ${discountPercent.toFixed(1)}% below market (> 40% below). Maximum allowable increase is capped at 20%.`;
  }

  const lawfulRentAed = Math.round(current * (1 + maxIncreasePercent / 100));
  return {
    discountPercent: Number(discountPercent.toFixed(2)),
    maxIncreasePercent,
    lawfulRentAed,
    reason
  };
}

export function auditUaeTenancy({
  tenantName = 'Tenant',
  emirate = 'Dubai',
  currentRentAed = 80000,
  averageMarketRentAed = 100000,
  proposedRentAed = 95000,
  noticeGivenDays = 90,
  isRegisteredOnPortal = true,
  evictionNoticeGiven = false,
  evictionNoticeMonths = 0,
  evictionServedViaNotary = true,
  assessmentDate
} = {}) {
  const cleanName = boundedText(tenantName, 'Tenant', 100);
  const cleanEmirate = String(emirate).trim().toLowerCase();
  const safeDate = safeIsoDate(assessmentDate);
  const isAbuDhabi = cleanEmirate.includes('abu dhabi');
  const resolvedEmirate = isAbuDhabi ? 'Abu Dhabi' : 'Dubai';

  const safeCurrent = Math.max(0, Number(currentRentAed) || 0);
  const safeMarket = Math.max(0, Number(averageMarketRentAed) || 0);
  const safeProposed = Math.max(0, Number(proposedRentAed) || 0);
  const safeNoticeDays = Math.max(0, Number(noticeGivenDays) || 0);
  const safeEvictionMonths = Math.max(0, Number(evictionNoticeMonths) || 0);

  const violations = [];
  const statutoryRights = [];

  let reraResult = null;
  let maxAllowableRentAed = safeCurrent;

  if (resolvedEmirate === 'Dubai') {
    reraResult = calculateDubaiReraIncrease(safeCurrent, safeMarket);
    maxAllowableRentAed = reraResult.lawfulRentAed;

    // Check notice period (90 days)
    if (safeProposed > safeCurrent && safeNoticeDays < UAE_TENANCY_CONSTANTS.DUBAI.STATUTORY_RENEWAL_NOTICE_DAYS) {
      violations.push(`DUBAI 90-DAY NOTICE VIOLATION: Under Law No. 33 of 2008 art. 14, any amendment to tenancy terms or rent must be served at least 90 days prior to lease expiry. Landlord gave only ${safeNoticeDays} days notice.`);
    }

    // Check proposed rent vs RERA cap
    if (safeProposed > maxAllowableRentAed) {
      const overchargeAed = safeProposed - maxAllowableRentAed;
      violations.push(`RERA RENT INCREASE EXCEEDED: Under Decree No. 43 of 2013, the maximum lawful rent is AED ${maxAllowableRentAed} (${reraResult.maxIncreasePercent}% increase). Landlord proposed AED ${safeProposed} (excess of AED ${overchargeAed}).`);
    }

    // Check eviction notice (12 months via Notary)
    if (evictionNoticeGiven) {
      if (safeEvictionMonths < UAE_TENANCY_CONSTANTS.DUBAI.EVICTION_NOTICE_MONTHS) {
        violations.push(`EVICTION NOTICE DEFICIENCY: Under Law No. 33 of 2008 art. 25(2), eviction for landlord personal use or sale requires 12 months written notice. Notice was only ${safeEvictionMonths} months.`);
      }
      if (!evictionServedViaNotary) {
        violations.push('SERVICE METHOD INVALID: Under Dubai tenancy law, 12-month eviction notice MUST be served via Notary Public or registered post. Email, WhatsApp, or informal verbal notice is legally invalid.');
      }
    }

    statutoryRights.push(`EJARI REGISTRATION: Registration on the Ejari portal is mandatory for utility connection (DEWA) and enforces lease terms before the Rental Dispute Center (RDC).`);
    statutoryRights.push(`OFFER AND DEPOSIT PROCEDURE: If landlord refuses to renew at the lawful RERA rent, tenant may deposit rent cheques at the RDC to legally renew the lease.`);
  } else {
    // Abu Dhabi 5% annual cap
    const maxIncreasePercent = UAE_TENANCY_CONSTANTS.ABU_DHABI.MAX_ANNUAL_RENT_INCREASE_CAP_PERCENT;
    maxAllowableRentAed = Math.round(safeCurrent * (1 + maxIncreasePercent / 100));

    if (safeNoticeDays < 60) {
      violations.push(`ABU DHABI 2-MONTH NOTICE BREACH: Under Abu Dhabi Law No. 20 of 2006, landlord must provide at least 2 months written notice prior to contract renewal.`);
    }

    if (safeProposed > maxAllowableRentAed) {
      violations.push(`ABU DHABI 5% CAP EXCEEDED: Annual rent increase cannot exceed 5% (max AED ${maxAllowableRentAed}). Proposed rent of AED ${safeProposed} is unlawful.`);
    }

    statutoryRights.push('TAWTHEEQ CONTRACT MANDATORY: Tenancy contracts must be registered on Tawtheeq via Tamm portal to validate residency and activate ADDC utilities.');
  }

  return {
    jurisdiction: 'United Arab Emirates',
    emirate: resolvedEmirate,
    tenantName: cleanName,
    assessmentDate: safeDate,
    portal: resolvedEmirate === 'Dubai' ? UAE_TENANCY_CONSTANTS.DUBAI.RERA_PORTAL : UAE_TENANCY_CONSTANTS.ABU_DHABI.TAWTHEEQ_PORTAL,
    disputeForum: resolvedEmirate === 'Dubai' ? UAE_TENANCY_CONSTANTS.DUBAI.DISPUTE_BODY : UAE_TENANCY_CONSTANTS.ABU_DHABI.DISPUTE_BODY,
    financialOverview: {
      currentRentAed: safeCurrent,
      marketAverageAed: safeMarket,
      proposedRentAed: safeProposed,
      maxStatutoryRentAed: maxAllowableRentAed,
      isProposedRentLawful: safeProposed <= maxAllowableRentAed,
      ...(reraResult ? { reraCalculatorDetails: reraResult } : {})
    },
    statutoryViolations: violations,
    isCompliant: violations.length === 0,
    statutoryRights
  };
}
