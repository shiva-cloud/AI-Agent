/**
 * Digital Platform Workers' Rights & Gig Worker Defense Engine
 *
 * Implements statutory standards under:
 * - Ontario Digital Platform Workers' Rights Act, 2022 (DPWRA), S.O. 2022 c. 7, Sched. 2
 * - British Columbia Employment Standards Amendment Act (Bill 48 Gig Workers Regulations, 2024)
 * - Supreme Court of Canada jurisprudence on platform arbitration (Heller v. Uber Technologies Inc., 2020 SCC 16)
 *
 * Key Statutory Rules:
 * - Engaged Time Minimum Wage: Platforms must pay at least statutory minimum wage for all
 *   "engaged time" (time spent fulfilling an assignment from acceptance to delivery/drop-off).
 *   - Ontario: $17.20/hr minimum wage.
 *   - BC: $20.88/hr (120% of general $17.40/hr minimum wage).
 * - Tips Protection: 100% prohibition against withholding tips or counting gratuities toward
 *   minimum wage obligations (DPWRA s. 8, BC ESA s. 30.3).
 * - De-platforming Written Notice: Minimum 2 weeks' written notice with specific reasons required
 *   prior to account suspension/deactivation, except for severe safety/fraud incidents (DPWRA s. 9).
 * - Domestic Dispute Resolution: Foreign arbitration clauses requiring overseas dispute filing
 *   are legally unconscionable and void under Heller v. Uber.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const PLATFORM_WORKER_CONSTANTS = Object.freeze({
  ON_MIN_ENGAGED_HOURLY_WAGE_CAD: 17.20,
  BC_MIN_ENGAGED_HOURLY_WAGE_CAD: 20.88,
  DEPLATFORMING_NOTICE_WINDOW_DAYS: 14,
  MAX_HOURS_TO_DELIVER_PAY_STUB: 24,
  STATUTORY_RECOVERY_LIMITATION_YEARS: 2
});

/**
 * Audits platform work earnings, engaged time, tip deductions, and de-platforming actions.
 *
 * @param {Object} options
 * @param {string} [options.province='ON'] - 'ON' or 'BC'
 * @param {string} [options.platformName='RideShare App'] - Platform operator name
 * @param {string} [options.workerType='rideshare_driver'] - 'rideshare_driver' or 'food_delivery'
 * @param {number} [options.engagedHoursInPeriod=40] - Hours actively fulfilling trips/orders
 * @param {number} [options.actualBasePayReceivedCad=550.0] - Base earnings excluding tips
 * @param {number} [options.tipsReceivedCad=120.0] - Gratuities received
 * @param {number} [options.unauthorizedDeductionsCad=0.0] - Deductions made by platform
 * @param {boolean} [options.tipsWithheldOrSubsidized=false] - Platform kept tips or applied to wage
 * @param {boolean} [options.hasDeplatformingAction=false] - Worker suspended or deactivated
 * @param {number} [options.noticeDaysGivenBeforeDeplatform=0] - Days notice before deactivation
 * @param {boolean} [options.providedWrittenReason=false] - Platform provided written reason
 * @param {boolean} [options.foreignArbitrationClauseInvoked=false] - Forced offshore arbitration
 * @param {string} [options.workerName='Worker'] - Worker's name
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive gig worker statutory assessment
 */
export function evaluatePlatformWorkerRights(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const prov = boundedText(safeOptions.province, 'ON', 10).toUpperCase();
  const platform = boundedText(safeOptions.platformName, 'Platform Operator', 100);
  const workerType = boundedText(safeOptions.workerType, 'rideshare_driver', 50).toLowerCase();
  const engagedHours = Math.max(0, Math.min(744, Number.isFinite(Number(safeOptions.engagedHoursInPeriod)) ? Number(safeOptions.engagedHoursInPeriod) : 40));
  const basePay = Math.max(0, Math.min(1000000, Number.isFinite(Number(safeOptions.actualBasePayReceivedCad)) ? Number(safeOptions.actualBasePayReceivedCad) : 550.0));
  const tips = Math.max(0, Math.min(1000000, Number.isFinite(Number(safeOptions.tipsReceivedCad)) ? Number(safeOptions.tipsReceivedCad) : 120.0));
  const deductions = Math.max(0, Math.min(1000000, Number.isFinite(Number(safeOptions.unauthorizedDeductionsCad)) ? Number(safeOptions.unauthorizedDeductionsCad) : 0.0));
  const tipsWithheld = Boolean(safeOptions.tipsWithheldOrSubsidized);
  const deplatformed = Boolean(safeOptions.hasDeplatformingAction);
  const noticeDays = Math.max(0, Math.min(365, Number.isFinite(Number(safeOptions.noticeDaysGivenBeforeDeplatform)) ? Math.floor(Number(safeOptions.noticeDaysGivenBeforeDeplatform)) : 0));
  const writtenReason = Boolean(safeOptions.providedWrittenReason);
  const foreignArbitration = Boolean(safeOptions.foreignArbitrationClauseInvoked);
  const workerName = boundedText(safeOptions.workerName, 'Worker', 100);
  const assessDate = safeIsoDate(safeOptions.assessmentDate, '2026-10-31');

  const statutoryRate = prov === 'BC'
    ? PLATFORM_WORKER_CONSTANTS.BC_MIN_ENGAGED_HOURLY_WAGE_CAD
    : PLATFORM_WORKER_CONSTANTS.ON_MIN_ENGAGED_HOURLY_WAGE_CAD;

  const minimumEngagedEarningsCad = Math.round(engagedHours * statutoryRate * 100) / 100;
  const wageShortfallCad = Math.max(0, Math.round((minimumEngagedEarningsCad - basePay) * 100) / 100);
  const hasWageTheft = wageShortfallCad > 0;

  const totalOwedCad = Math.round((wageShortfallCad + deductions + (tipsWithheld ? tips : 0)) * 100) / 100;

  const violations = [];
  const statutoryProtections = [];
  const actionPlan = [];
  const riskWarnings = [];

  // Minimum wage check
  if (hasWageTheft) {
    violations.push(`Sub-minimum wage: Base pay of $${basePay.toFixed(2)} CAD falls short of the $${minimumEngagedEarningsCad.toFixed(2)} CAD statutory floor for ${engagedHours} engaged hours at $${statutoryRate.toFixed(2)}/hr.`);
    statutoryProtections.push(`${prov === 'BC' ? 'BC Employment Standards Act (Bill 48)' : 'Ontario DPWRA s. 6'}: Minimum wage applies to all engaged time spent picking up, transporting, and delivering customers or orders.`);
    actionPlan.push(`File wage recovery claim for $${wageShortfallCad.toFixed(2)} CAD in unpaid statutory minimum wage.`);
  }

  // Tips check
  if (tipsWithheld) {
    violations.push('Unlawful tip retention: Platform deducted from or withheld gratuities earned from customers.');
    statutoryProtections.push(`${prov === 'BC' ? 'BC ESA s. 30.3' : 'Ontario DPWRA s. 8'}: Complete statutory prohibition on retaining or diverting tips. Tips are worker property and cannot subsidize platform pay guarantees.`);
    actionPlan.push(`Demand full reimbursement of $${tips.toFixed(2)} CAD in withheld customer tips.`);
  }

  // Deductions check
  if (deductions > 0) {
    violations.push(`Unauthorized platform deduction: Platform deducted $${deductions.toFixed(2)} CAD without clear statutory authorization.`);
    statutoryProtections.push('Arbitrary fees, transaction charges, or customer cancellation penalties cannot reduce earnings below the statutory minimum wage floor.');
  }

  // De-platforming check
  let unlawfulDeplatforming = false;
  if (deplatformed) {
    if (noticeDays < PLATFORM_WORKER_CONSTANTS.DEPLATFORMING_NOTICE_WINDOW_DAYS || !writtenReason) {
      unlawfulDeplatforming = true;
      violations.push(`Unlawful account deactivation: Platform failed to provide ${PLATFORM_WORKER_CONSTANTS.DEPLATFORMING_NOTICE_WINDOW_DAYS} days written notice with specific performance reasons (provided: ${noticeDays} days notice, written explanation: ${writtenReason ? 'Yes' : 'No'}).`);
      statutoryProtections.push(`${prov === 'BC' ? 'BC ESA Gig Worker Regulations' : 'Ontario DPWRA s. 9'}: Platform operators cannot suspend or terminate access without 2 weeks prior written notice and clear explanation.`);
      actionPlan.push('Submit formal reinstatement demand under DPWRA s. 9 citing failure of mandatory 14-day statutory notice.');
    }
  }

  // Foreign arbitration check
  if (foreignArbitration) {
    violations.push('Invalid foreign arbitration clause: Platform attempting to enforce out-of-country dispute forum.');
    statutoryProtections.push('Heller v. Uber Technologies Inc. (2020 SCC 16): Mandatory foreign arbitration clauses in gig contracts are unconscionable, contrary to public policy, and void. Workers retain full right to local ministry enforcement.');
    riskWarnings.push('UNCONSCIONABLE ARBITRATION CLAUSE VOID: You cannot be forced to pay thousands in foreign arbitration fees. The Ministry of Labour retains jurisdiction.');
  }

  const governingLegislation = prov === 'BC'
    ? 'BC Employment Standards Amendment Act (Bill 48, 2024)'
    : 'Ontario Digital Platform Workers\' Rights Act, 2022 (S.O. 2022 c. 7 Sched 2)';

  let summaryTitle = '';
  if (violations.length === 0) {
    summaryTitle = `Compliant Platform Earnings & Terms under ${prov === 'BC' ? 'BC ESA' : 'Ontario DPWRA'}`;
  } else {
    summaryTitle = `${violations.length} Statutory Violations Identified ($${totalOwedCad.toFixed(2)} CAD Restitution Claimable)`;
  }

  return {
    workerName,
    platformName: platform,
    province: prov,
    workerType,
    governingLegislation,
    assessmentDate: assessDate,
    summaryTitle,
    wageAudit: {
      engagedHours,
      statutoryEngagedHourlyRateCad: statutoryRate,
      minimumEngagedEarningsCad,
      actualBasePayReceivedCad: basePay,
      wageShortfallCad,
      hasWageTheft
    },
    restitutionSummary: {
      unpaidMinimumWageCad: wageShortfallCad,
      unauthorizedDeductionsCad: deductions,
      withheldTipsCad: tipsWithheld ? tips : 0.0,
      totalOwedCad
    },
    deplatformingAudit: {
      isDeplatformed: deplatformed,
      noticeDaysGiven: noticeDays,
      hasWrittenReason: writtenReason,
      isUnlawfulDeplatforming: unlawfulDeplatforming,
      statutoryNoticeDaysRequired: PLATFORM_WORKER_CONSTANTS.DEPLATFORMING_NOTICE_WINDOW_DAYS
    },
    foreignArbitrationPrecluded: foreignArbitration,
    violations,
    statutoryProtections,
    riskWarnings,
    actionPlan
  };
}
