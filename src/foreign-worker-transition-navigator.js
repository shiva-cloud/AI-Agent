/**
 * Temporary Foreign Worker (TFW) Transition & Policy Engine
 *
 * Implements statutory assessment under:
 * - Immigration and Refugee Protection Act (SC 2001 c. 27) ss. 22(2), 30, 200–205
 * - Temporary Foreign Worker Program (TFWP) 2024–2026 Policy Directives & Ministerial Instructions
 * - Employment and Social Development Canada (ESDC) LMIA Cap and Refusal-to-Process Guidelines
 *
 * Key Statutory Rules:
 * - Low-Wage Stream Cap: Employers are capped at 10% TFWs in the low-wage stream per location
 *   (reduced from 20%). Exceptions: Construction and Healthcare sectors maintain a 20% cap.
 * - Refusal to Process in High-Unemployment CMAs: ESDC will not process low-wage LMIA applications
 *   in Census Metropolitan Areas (CMAs) with an unemployment rate of 6.0% or higher.
 * - Work Permit Duration Limits: Low-wage LMIA work permits are limited to a maximum duration of 1 year.
 *   High-wage stream permits may be granted for up to 3 years.
 * - Dual Intent (IRPA s. 22(2)): An intention by a foreign national to become a permanent resident
 *   does not preclude them from being a temporary resident, provided the officer is satisfied that
 *   they will leave Canada by the end of the authorized stay.
 * - Strategic Transition Alternatives:
 *   (1) Francophone Mobility (LMIA Exemption Code C16 under IRPR s. 205(a)) for candidates with NCLC 5+;
 *   (2) Provincial Nominee Program (PNP) employer-driven streams;
 *   (3) Category-based Express Entry (Healthcare, STEM, Trades, Agriculture, Transport);
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const TFW_TRANSITION_CONSTANTS = Object.freeze({
  LOW_WAGE_CMA_UNEMPLOYMENT_FREEZE_RATE: 6.0,
  STANDARD_LOW_WAGE_EMPLOYER_CAP_PERCENT: 10,
  CONSTRUCTION_HEALTHCARE_EMPLOYER_CAP_PERCENT: 20,
  MAX_LOW_WAGE_WORK_PERMIT_DURATION_MONTHS: 12,
  HIGH_WAGE_WORK_PERMIT_DURATION_MONTHS: 36,
  MINIMUM_REMAINING_EXPIRY_RUNWAY_DAYS: 90
});

/**
 * Evaluates foreign worker transition feasibility, LMIA cap risks, and alternative work permit routes.
 *
 * @param {Object} options
 * @param {number} [options.wagePerHour=20.0] - Hourly wage in CAD
 * @param {number} [options.provincialMedianWage=28.39] - Provincial median hourly wage in CAD
 * @param {string} [options.employerLocationCma='Toronto'] - City / Census Metropolitan Area
 * @param {number} [options.cmaUnemploymentRate=6.8] - Current CMA unemployment rate in %
 * @param {string} [options.sector='general'] - 'healthcare', 'construction', 'hospitality', 'retail', 'tech_engineering', 'general'
 * @param {number} [options.currentWorkPermitExpiryDays=120] - Days until current work permit expires
 * @param {number} [options.cumulativeCanadianExperienceMonths=12] - Months of skilled work in Canada
 * @param {boolean} [options.hasFrenchProficiencyNclc5=false] - NCLC 5+ in oral French
 * @param {boolean} [options.hasProvincialNominationStreamFit=false] - Meets criteria for PNP job-offer stream
 * @param {boolean} [options.isApplyingDualIntent=true] - Preparing PR application concurrently
 * @param {string} [options.workerName='Temporary Foreign Worker'] - Worker name
 * @param {string} [options.assessmentDate=todayIso()] - Date of assessment
 * @returns {Object} Comprehensive foreign worker transition diagnostic
 */
export function evaluateForeignWorkerTransition(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const wage = Number.isFinite(Number(safeOptions.wagePerHour)) ? Math.max(0, Math.min(10000, Number(safeOptions.wagePerHour))) : 20.0;
  const medianWage = Number.isFinite(Number(safeOptions.provincialMedianWage)) ? Math.max(10, Math.min(10000, Number(safeOptions.provincialMedianWage))) : 28.39;
  const cma = boundedText(safeOptions.employerLocationCma, 50) || 'Toronto';
  const unempRate = Number.isFinite(Number(safeOptions.cmaUnemploymentRate)) ? Math.max(0, Math.min(100, Number(safeOptions.cmaUnemploymentRate))) : 6.8;
  const rawSector = boundedText(safeOptions.sector, 30).toLowerCase();
  const sector = ['healthcare', 'construction', 'hospitality', 'retail', 'tech_engineering'].includes(rawSector) ? rawSector : 'general';

  const expiryDays = Number.isFinite(Number(safeOptions.currentWorkPermitExpiryDays)) ? Math.max(0, Math.min(36500, Math.floor(Number(safeOptions.currentWorkPermitExpiryDays)))) : 120;
  const cdnExpMonths = Number.isFinite(Number(safeOptions.cumulativeCanadianExperienceMonths)) ? Math.max(0, Math.min(600, Math.floor(Number(safeOptions.cumulativeCanadianExperienceMonths)))) : 12;
  const frenchNclc5 = Boolean(safeOptions.hasFrenchProficiencyNclc5);
  const pnpFit = Boolean(safeOptions.hasProvincialNominationStreamFit);
  const dualIntent = safeOptions.isApplyingDualIntent !== false;
  const worker = boundedText(safeOptions.workerName, 120) || 'Temporary Foreign Worker';
  const assessDate = safeIsoDate(safeOptions.assessmentDate);

  // 1. Determine Stream Classification: Low-Wage vs High-Wage
  const isHighWage = wage >= medianWage;
  const streamClassification = isHighWage ? 'HIGH_WAGE_STREAM' : 'LOW_WAGE_STREAM';

  // 2. Audit LMIA Processing Freeze & Employer Cap
  const isSectorExempt = ['healthcare', 'construction'].includes(sector);
  const applicableEmployerCapPercent = isSectorExempt
    ? TFW_TRANSITION_CONSTANTS.CONSTRUCTION_HEALTHCARE_EMPLOYER_CAP_PERCENT
    : TFW_TRANSITION_CONSTANTS.STANDARD_LOW_WAGE_EMPLOYER_CAP_PERCENT;

  let isSubjectToCmaFreeze = false;
  const lmiaRisks = [];
  const statutoryProtections = [];
  const viablePathways = [];
  const actionPlan = [];

  if (!isHighWage) {
    if (!isSectorExempt && unempRate >= TFW_TRANSITION_CONSTANTS.LOW_WAGE_CMA_UNEMPLOYMENT_FREEZE_RATE) {
      isSubjectToCmaFreeze = true;
      lmiaRisks.push(`ESDC REFUSAL TO PROCESS: ${cma} CMA has an unemployment rate of ${unempRate.toFixed(1)}% (>= 6.0% threshold). Low-wage LMIA applications in non-exempt sectors are refused automatically without review.`);
    }
    lmiaRisks.push(`10% Employer Cap: Employer cannot exceed ${applicableEmployerCapPercent}% low-wage TFWs at this work location.`);
    lmiaRisks.push(`1-Year Limit: Work permits issued under the low-wage stream are capped at 12 months maximum.`);
  } else {
    statutoryProtections.push(`High-Wage Stream: Hourly wage of $${wage.toFixed(2)} meets or exceeds provincial median ($${medianWage.toFixed(2)}). Not subject to CMA 6.0% refusal freeze or 10% employer cap.`);
    statutoryProtections.push(`Up to 3-Year Duration: High-wage LMIA work permits can be approved for up to 36 months.`);
  }

  // 3. Evaluate Strategic Transition Alternatives
  if (frenchNclc5) {
    viablePathways.push({
      pathwayName: 'Francophone Mobility Program (LMIA Exemption C16)',
      feasibility: 'HIGH',
      description: 'Permits employer-specific work permit without an LMIA outside Quebec for TEER 0–5 occupations.',
      statutoryReference: 'IRPR s. 205(a)'
    });
    actionPlan.push('Prioritize Francophone Mobility C16 work permit: Employer pays $230 compliance fee on Employer Portal with zero LMIA wait times.');
  }

  if (pnpFit) {
    viablePathways.push({
      pathwayName: 'Provincial Nominee Program (PNP) Employer Stream',
      feasibility: 'HIGH',
      description: 'Provincial nomination provides 600 CRS points for Express Entry or direct provincial work permit support letter (T13).',
      statutoryReference: 'IRPR s. 204(c)'
    });
    actionPlan.push('Submit provincial expression of interest / application under the provincial employer-sponsored stream.');
  }

  if (cdnExpMonths >= 12) {
    viablePathways.push({
      pathwayName: 'Canadian Experience Class (CEC) / Category-Based Express Entry',
      feasibility: 'MEDIUM_HIGH',
      description: `${cdnExpMonths} months of Canadian skilled experience satisfies base CEC criteria under IRPR s. 87.1.`,
      statutoryReference: 'IRPR s. 87.1'
    });
    actionPlan.push('Create or update Express Entry profile to capture Canadian Experience points and category targeting.');
  }

  // 4. Dual Intent Audit
  if (dualIntent) {
    statutoryProtections.push('IRPA s. 22(2) Dual Intent: Pursuing permanent residence while on a temporary work permit is recognized by statute. An officer cannot refuse a work permit solely because the applicant intends to settle permanently.');
  }

  // 5. Runway Assessment
  let runwayStatus = 'HEALTHY';
  if (expiryDays <= 30) {
    runwayStatus = 'CRITICAL_URGENCY';
    actionPlan.unshift('URGENT: Work permit expires in under 30 days. Submit extension or change of conditions immediately to maintain legal status under IRPR s. 186(u).');
  } else if (expiryDays <= TFW_TRANSITION_CONSTANTS.MINIMUM_REMAINING_EXPIRY_RUNWAY_DAYS) {
    runwayStatus = 'WARNING_ACTION_REQUIRED';
    actionPlan.unshift(`Action required: Only ${expiryDays} days remaining before expiry. Initiate employer paperwork immediately.`);
  }

  return {
    workerName: worker,
    assessmentDate: assessDate,
    currentPermitRunway: {
      daysRemaining: expiryDays,
      status: runwayStatus,
      isUnder90Days: expiryDays <= TFW_TRANSITION_CONSTANTS.MINIMUM_REMAINING_EXPIRY_RUNWAY_DAYS
    },
    streamClassification: {
      stream: streamClassification,
      wagePerHourCad: wage,
      provincialMedianWageCad: medianWage,
      wageDifferentialCad: Number((wage - medianWage).toFixed(2)),
      isHighWage
    },
    lmiaAudit: {
      employerLocationCma: cma,
      cmaUnemploymentRatePercent: unempRate,
      isSubjectToCmaFreeze,
      sector,
      isSectorExemptFromFreeze: isSectorExempt,
      applicableEmployerCapPercent,
      maxWorkPermitDurationMonths: isHighWage ? TFW_TRANSITION_CONSTANTS.HIGH_WAGE_WORK_PERMIT_DURATION_MONTHS : TFW_TRANSITION_CONSTANTS.MAX_LOW_WAGE_WORK_PERMIT_DURATION_MONTHS,
      risksAndBars: lmiaRisks
    },
    viablePathways,
    statutoryProtections,
    actionPlan
  };
}
