/**
 * @file lease-assignment-navigator.js
 * @description Canadian Residential Tenancy Lease Assignment, Subletting & Fixed-Term Early Exit Diagnostic Engine.
 * 
 * Statutory & Regulatory Authority:
 * - Ontario Residential Tenancies Act, 2006 (SO 2006, c. 17):
 *   - s. 15: Void provisions (clauses prohibiting assignment or subletting, or charging arbitrary penalties, are void)
 *   - s. 95(1)-(3): Tenant right to request assignment in principle or to a specific person
 *   - s. 95(4): 7-Day Rule - If landlord refuses in principle or fails to respond within 7 days, tenant can terminate with Form N9 (30 days notice)
 *   - s. 95(5): Landlord cannot unreasonably refuse consent to a specific assignee
 *   - s. 95(7): Landlord may only charge reasonable out-of-pocket expenses incurred (e.g. credit check cost)
 *   - s. 96: Tenant application to LTB (Form A2) for unreasonable refusal
 * - British Columbia Residential Tenancy Act (SBC 2002, c. 78):
 *   - s. 34: Landlord must not unreasonably withhold consent for fixed-term tenancy of 6+ months
 *   - Residential Tenancy Regulation s. 17: Out-of-pocket expense limits
 * - Alberta Residential Tenancies Act (SA 2004, c. R-17.1):
 *   - s. 22(1)-(2): Tenant assignment/sublease with written consent; landlord cannot refuse without reasonable grounds
 *   - s. 22(3): 14-Day Deemed Consent Rule - Landlord failure to reply within 14 days constitutes deemed consent
 * - Quebec Civil Code of Quebec (CCQ, CQLR c. CCQ-1991):
 *   - arts. 1870-1871 & Bill 31 (2024 reform): If landlord refuses lease transfer without serious reason, lease is resiliated on transfer date
 * 
 * Features:
 * - Diagnoses statutory early exit rights from fixed-term leases without illegal penalty fees
 * - Computes statutory response clocks (7 days in ON, 14 days in AB)
 * - Calculates earliest legal termination dates (30 days N9 notice in ON)
 * - Audits illegal lease-break buyout fees, liquidated damages clauses, and excessive assignment charges
 * - Distinguishes Lease Assignment (permanent transfer of tenancy rights) vs Subletting (temporary vacancy with intent to return)
 * - Generates statutory notice templates (Assignment Request in Principle & Form N9 Termination Notice)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const LEASE_ASSIGNMENT_CONSTANTS = Object.freeze({
  STATUTES: {
    ONTARIO_RTA_ASSIGNMENT: 'Ontario Residential Tenancies Act, 2006 (SO 2006, c. 17), s. 95',
    ONTARIO_RTA_VOID_CLAUSE: 'Ontario Residential Tenancies Act, 2006 (SO 2006, c. 17), s. 15',
    BC_RTA_ASSIGNMENT: 'British Columbia Residential Tenancy Act (SBC 2002, c. 78), s. 34',
    ALBERTA_RTA_ASSIGNMENT: 'Alberta Residential Tenancies Act (SA 2004, c. R-17.1), s. 22',
    QUEBEC_BILL_31: 'Civil Code of Quebec (CCQ) art. 1870 & Bill 31 (Lease Transfer Resiliation)'
  },
  STATUTORY_RESPONSE_WINDOWS_DAYS: Object.freeze({
    ON: 7,
    AB: 14,
    BC: 10,
    QC: 15
  }),
  MAX_REASONABLE_ASSIGNMENT_FEE_CAD: Object.freeze({
    ON: 75, // Only actual out-of-pocket expenses (credit check ~$25-$50)
    BC: 100,
    AB: 50,
    QC: 0   // Under Bill 31, landlord can only charge reasonable credit check fees
  })
});

/**
 * Calculates days between two date strings (YYYY-MM-DD).
 * 
 * @param {string} fromDateStr
 * @param {string} toDateStr
 * @returns {number} Days elapsed
 */
export function calculateDaysBetween(fromDateStr, toDateStr) {
  if (!fromDateStr || !toDateStr) return 0;
  const safeFrom = safeIsoDate(fromDateStr, '2026-10-31');
  const safeTo = safeIsoDate(toDateStr, '2026-10-31');
  const from = new Date(safeFrom + 'T00:00:00Z');
  const to = new Date(safeTo + 'T00:00:00Z');
  const diffMs = to.getTime() - from.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Adds days to a date string (YYYY-MM-DD) and returns YYYY-MM-DD.
 * 
 * @param {string} dateStr
 * @param {number} daysToAdd
 * @returns {string} Target date string
 */
export function addDaysToDate(dateStr, daysToAdd) {
  const safeDate = safeIsoDate(dateStr, '2026-10-31');
  const d = new Date(safeDate + 'T00:00:00Z');
  const numDays = Number.isFinite(Number(daysToAdd)) ? Number(daysToAdd) : 0;
  d.setUTCDate(d.getUTCDate() + numDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Evaluates Residential Lease Assignment, Subletting, and Early Termination Rights.
 * 
 * @param {Object} input
 * @param {string} input.province - 'ON'|'BC'|'AB'|'QC'
 * @param {string} input.leaseType - 'fixed_term'|'month_to_month'
 * @param {string} input.requestType - 'assignment'|'sublet'
 * @param {string} input.requestStage - 'not_yet_requested'|'requested_awaiting_reply'|'refused_in_principle'|'refused_specific_candidate'|'landlord_failed_to_reply'|'landlord_consented'
 * @param {string} [input.requestDate] - 'YYYY-MM-DD' when request was served
 * @param {number} [input.daysSinceRequest=0] - Number of calendar days since written request served
 * @param {number} [input.monthlyRentCad=2400] - Current monthly rent in CAD
 * @param {number} [input.landlordDemandedPenaltyCad=0] - Arbitrary lease break fee demanded by landlord
 * @param {number} [input.landlordDemandedAssignmentFeeCad=0] - Assignment processing fee demanded
 * @param {string} [input.leaseEndDate] - 'YYYY-MM-DD' end date of fixed-term lease
 * @param {Date} [referenceDate=new Date()]
 * @returns {Object} Comprehensive legal diagnostic result
 */
export function evaluateLeaseAssignmentExit(input = {}, referenceDate = new Date()) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const cleanTenantName = boundedText(safeInput.tenantName, 'Tenant', 100);
  const cleanLandlordName = boundedText(safeInput.landlordName, 'Landlord / Property Manager', 100);
  const cleanRentalAddress = boundedText(safeInput.rentalAddress, 'Rental Address', 150);

  const province = boundedText(safeInput.province, 'ON', 10).toUpperCase();
  const leaseType = boundedText(safeInput.leaseType, 'fixed_term', 40);
  const requestType = boundedText(safeInput.requestType, 'assignment', 40);
  const stage = boundedText(safeInput.requestStage, 'not_yet_requested', 60);

  const monthlyRent = Math.max(0, Math.min(100000, Number(safeInput.monthlyRentCad) || 2400));
  const demandedPenalty = Math.max(0, Math.min(1000000, Number(safeInput.landlordDemandedPenaltyCad) || 0));
  const demandedAssignmentFee = Math.max(0, Math.min(1000000, Number(safeInput.landlordDemandedAssignmentFeeCad) || 0));

  const todayStr = referenceDate.toISOString().slice(0, 10);
  const safeDate = safeIsoDate(safeInput.assessmentDate, todayStr);
  const requestDate = safeIsoDate(safeInput.requestDate, todayStr);

  const rawDays = safeInput.daysSinceRequest !== undefined
    ? Number(safeInput.daysSinceRequest)
    : calculateDaysBetween(requestDate, todayStr);
  const daysSinceRequest = Math.max(0, Math.min(3650, Math.floor(rawDays || 0)));

  const statutoryResponseWindow = LEASE_ASSIGNMENT_CONSTANTS.STATUTORY_RESPONSE_WINDOWS_DAYS[province] || 7;
  const maxReasonableFee = LEASE_ASSIGNMENT_CONSTANTS.MAX_REASONABLE_ASSIGNMENT_FEE_CAD[province] || 75;

  const statutoryViolations = [];
  const legalRemedies = [];
  let isEarlyExitPermittedWithoutPenalty = false;
  let recommendedLegalForm = null;
  let noticePeriodDays = 0;
  let earliestEffectiveTerminationDate = null;
  let resolutionVerdict = 'IN_NEGOTIATION';

  // 1. Audit Illegal Lease Break Penalty Fee
  const isIllegalPenaltyDemanded = demandedPenalty > 0;
  if (isIllegalPenaltyDemanded) {
    statutoryViolations.push({
      clause: 'ILLEGAL_LEASE_BREAK_PENALTY',
      statute: province === 'ON'
        ? LEASE_ASSIGNMENT_CONSTANTS.STATUTES.ONTARIO_RTA_VOID_CLAUSE
        : `${province} Residential Tenancy Law`,
      finding: `Landlord demanded $${demandedPenalty.toLocaleString()} CAD lease cancellation penalty. This charge is legally void. Under Ontario RTA s. 15, landlords cannot charge arbitrary liquidated damages or lease-break penalties.`
    });
  }

  // 2. Audit Excessive Assignment Fee
  const isExcessiveAssignmentFee = demandedAssignmentFee > maxReasonableFee;
  if (isExcessiveAssignmentFee) {
    statutoryViolations.push({
      clause: 'EXCESSIVE_ASSIGNMENT_FEE',
      statute: province === 'ON'
        ? 'Ontario Residential Tenancies Act, 2006, s. 95(7)'
        : `${province} Residential Tenancy Regulation`,
      finding: `Landlord demanded $${demandedAssignmentFee.toLocaleString()} CAD to process assignment (statutory reasonable limit is ~$${maxReasonableFee} CAD for actual credit check costs). Excessive fees are unlawful and refundable via LTB Form T1.`
    });
  }

  // 3. Month-to-Month Baseline
  if (leaseType === 'month_to_month') {
    noticePeriodDays = province === 'ON' ? 60 : 30;
    earliestEffectiveTerminationDate = addDaysToDate(todayStr, noticePeriodDays);
    recommendedLegalForm = province === 'ON' ? 'Form N9 (Tenant\'s Notice to End the Tenancy)' : 'Notice to Vacate';
    resolutionVerdict = 'STANDARD_PERIODIC_NOTICE';
    legalRemedies.push({
      action: `Serve standard ${noticePeriodDays}-day notice to end tenancy`,
      statute: `${province} Tenancy Legislation`,
      details: `Because your lease is already month-to-month, you do not need assignment. You can terminate at the end of a rental period with standard notice.`
    });
  } else {
    // 4. Fixed-Term Assignment & Sublet Logic
    if (province === 'ON') {
      // Ontario RTA Section 95 Framework
      const isRefusedInPrinciple = stage === 'refused_in_principle';
      const isLandlordSilent = stage === 'landlord_failed_to_reply' || (stage === 'requested_awaiting_reply' && daysSinceRequest > 7);

      if (isRefusedInPrinciple || isLandlordSilent) {
        isEarlyExitPermittedWithoutPenalty = true;
        resolutionVerdict = 'RIGHT_TO_TERMINATE_WITH_30_DAYS_N9';
        recommendedLegalForm = 'Form N9 (Tenant\'s Notice to End the Tenancy)';
        noticePeriodDays = 30;
        earliestEffectiveTerminationDate = addDaysToDate(todayStr, 30);

        legalRemedies.push({
          action: 'Serve Form N9 with 30 days notice (RTA s. 95(4))',
          statute: LEASE_ASSIGNMENT_CONSTANTS.STATUTES.ONTARIO_RTA_ASSIGNMENT,
          details: isRefusedInPrinciple
            ? 'The landlord refused consent to assign in principle. Under RTA s. 95(4), you have the absolute right to serve Form N9 with a minimum of 30 days notice to end your fixed-term lease without any penalty.'
            : `The landlord failed to respond within 7 calendar days of your written request. Under RTA s. 95(4), you acquire the statutory right to terminate with Form N9 on 30 days notice.`
        });
      } else if (stage === 'refused_specific_candidate') {
        resolutionVerdict = 'UNREASONABLE_REFUSAL_DISPUTE';
        recommendedLegalForm = 'Form A2 (Application About an Assignment or Sublet)';
        legalRemedies.push({
          action: 'File Form A2 at LTB for unreasonable refusal or terminate',
          statute: 'Ontario RTA s. 95(5) & s. 96',
          details: 'Landlord cannot arbitrarily reject a qualified assignee. If they refuse without reasonable financial/credit grounds, apply to the LTB for an order terminating the tenancy or authorizing assignment.'
        });
      } else if (stage === 'requested_awaiting_reply') {
        const daysRemaining = Math.max(0, 7 - daysSinceRequest);
        resolutionVerdict = 'AWAITING_7_DAY_STATUTORY_DEADLINE';
        legalRemedies.push({
          action: `Wait for 7-day statutory deadline (${daysRemaining} days remaining)`,
          statute: 'Ontario RTA s. 95(4)',
          details: `The landlord has exactly 7 calendar days to respond. If they do not respond by day 7 (${addDaysToDate(requestDate, 7)}), you immediately unlock the right to serve Form N9 with 30 days notice.`
        });
      } else if (stage === 'not_yet_requested') {
        resolutionVerdict = 'STEP_1_SERVE_ASSIGNMENT_REQUEST';
        legalRemedies.push({
          action: 'Send formal written request asking: "Do you consent in principle to an assignment?"',
          statute: 'Ontario RTA s. 95(1)',
          details: 'Do not present a specific person yet. First ask for consent in principle. If the landlord says "No" or quotes an illegal buyout fee, you immediately win the right to exit on 30 days notice.'
        });
      }
    } else if (province === 'BC') {
      // British Columbia RTA Section 34
      const isRefused = stage === 'refused_in_principle' || stage === 'refused_specific_candidate';
      if (isRefused) {
        resolutionVerdict = 'BC_UNREASONABLE_REFUSAL_DISPUTE';
        legalRemedies.push({
          action: 'File RTB Dispute Resolution under BC RTA s. 34',
          statute: LEASE_ASSIGNMENT_CONSTANTS.STATUTES.BC_RTA_ASSIGNMENT,
          details: 'For fixed-term leases with 6+ months remaining, BC landlords cannot unreasonably withhold consent. Apply to RTB for an order ending tenancy or permitting assignment.'
        });
      }
    } else if (province === 'AB') {
      // Alberta RTA Section 22
      const isSilent = stage === 'landlord_failed_to_reply' || (stage === 'requested_awaiting_reply' && daysSinceRequest > 14);
      if (isSilent) {
        resolutionVerdict = 'ALBERTA_DEEMED_CONSENT_ACQUIRED';
        legalRemedies.push({
          action: 'Proceed with assignment under statutory deemed consent (Alberta RTA s. 22(3))',
          statute: LEASE_ASSIGNMENT_CONSTANTS.STATUTES.ALBERTA_RTA_ASSIGNMENT,
          details: 'Because the landlord failed to respond within 14 calendar days, consent is legally deemed to have been given. You may finalize the assignment.'
        });
      }
    } else if (province === 'QC') {
      // Quebec Bill 31
      if (stage === 'refused_in_principle' || stage === 'refused_specific_candidate') {
        isEarlyExitPermittedWithoutPenalty = true;
        resolutionVerdict = 'QUEBEC_BILL_31_LEASE_RESILIATED';
        earliestEffectiveTerminationDate = todayStr;
        legalRemedies.push({
          action: 'Lease resiliated on transfer date under Bill 31',
          statute: LEASE_ASSIGNMENT_CONSTANTS.STATUTES.QUEBEC_BILL_31,
          details: 'Under 2024 Bill 31 reforms to CCQ art. 1870, if a landlord refuses an assignment without serious grounds, the lease is resiliated on the assignment date without penalty.'
        });
      }
    }
  }

  // 5. Formal Notice Templates
  const noticeTemplates = {
    assignmentRequestLetter: `To: ${cleanLandlordName}\nDate: ${todayStr}\nRental Unit: ${cleanRentalAddress}\n\nDear Landlord,\n\nIn accordance with Section 95 of the Ontario Residential Tenancies Act, 2006 (or applicable provincial residential tenancy legislation), I am writing to formally request your consent in principle to assign my tenancy agreement for the rental unit located at ${cleanRentalAddress} to a new tenant.\n\nPlease confirm in writing within 7 calendar days whether you consent in principle to an assignment of the tenancy.\n\nThank you,\n${cleanTenantName}`,
    formN9TerminationNotice: isEarlyExitPermittedWithoutPenalty ? `Form N9 (Tenant's Notice to End the Tenancy) Details:\nStatutory Grounds: Ontario Residential Tenancies Act, 2006, s. 95(4)\nNotice Period: 30 days minimum\nEffective Termination Date: ${earliestEffectiveTerminationDate}\nTenant Liability: Rent liability ends on effective termination date. Last month rent deposit must be applied to the final 30-day period. Landlord must refund any remaining deposit balance within 30 days.` : null
  };

  return {
    tenantName: cleanTenantName,
    landlordName: cleanLandlordName,
    rentalAddress: cleanRentalAddress,
    assessmentDate: safeDate,
    province,
    leaseType,
    requestType,
    requestStage: stage,
    daysSinceRequest,
    statutoryResponseDeadlineDays: statutoryResponseWindow,
    isEarlyExitPermittedWithoutPenalty,
    resolutionVerdict,
    recommendedLegalForm,
    earliestEffectiveTerminationDate,
    demandedPenaltyCad: demandedPenalty,
    isIllegalPenaltyDemanded,
    demandedAssignmentFeeCad: demandedAssignmentFee,
    isExcessiveAssignmentFee,
    maxStatutoryOutofPocketFeeCad: maxReasonableFee,
    statutoryViolations,
    legalRemedies,
    noticeTemplates,
    statutoryAdvisories: [
      'Under Ontario RTA s. 15, clauses in residential leases that prohibit assignment or charge arbitrary buyout fees are void and unenforceable as a matter of law.',
      'A landlord who refuses assignment in principle immediately frees the tenant to terminate the tenancy on 30 days notice under Form N9 (RTA s. 95(4)).',
      'The landlord cannot charge arbitrary administrative fees ($500-$1000) for an assignment; only actual, documented out-of-pocket expenses (like a $30 credit check) are legally permitted under RTA s. 95(7).'
    ]
  };
}
