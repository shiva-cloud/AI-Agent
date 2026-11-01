/**
 * Alberta Opportunity Stream (AOS) & Tourism/Hospitality (AAIP) Navigator
 *
 * Implements statutory assessment under:
 * - Alberta Advantage Immigration Program (AAIP) Terms and Conditions & Ministerial Directives
 * - Immigration and Refugee Protection Act (SC 2001 c. 27) ss. 10, 87
 * - Immigration and Refugee Protection Regulations (SOR/2002-227) s. 204(c) (T13 Provincial Support)
 * - National Occupational Classification (NOC 2021 Version 1.0) & TEER Categories
 *
 * Key Statutory Rules:
 * - Work Experience Requirement (AOS):
 *   (a) Minimum 12 months full-time (at least 30 hrs/week) work experience in Alberta in current occupation
 *       within the last 18 months; OR
 *   (b) Minimum 24 months full-time experience in Canada or abroad within the last 30 months; OR
 *   (c) For Post-Graduation Work Permit (PGWP) holders: Minimum 6 months full-time experience in Alberta
 *       in an occupation directly related to field of study at an approved Alberta DLI.
 * - Language Benchmarks (NOC/TEER Aligned):
 *   - TEER 0, 1, 2, 3 occupations: Minimum CLB 5 in English (or NCLC 5 in French) across all 4 abilities.
 *   - TEER 4 and 5 occupations: Minimum CLB 4 in English or French.
 *   - Regulated Health Occupations (NOC 32101, 31301, etc.): Minimum CLB 7.
 * - Education Requirement: High school diploma equivalent to Canadian standard (verified by ECA unless Canadian).
 * - Eligible Work Permit Types: Must hold a valid work permit supported by an approved LMIA, or an LMIA-exempt
 *   work permit under international trade agreements (CUSMA/GATS), Francophone Mobility (C16), or an eligible PGWP.
 * - Ineligible Occupations: Certain NOCs are on the AAIP Ineligible Occupations List (e.g. food delivery couriers,
 *   home child care providers under pilot streams, certain elementary clerical positions).
 * - Tourism and Hospitality Stream (THS): Specific dedicated allocation for workers in designated hospitality
 *   and food service occupations with at least 6 months of continuous employment with an approved Alberta operator.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const AAIP_AOS_CONSTANTS = Object.freeze({
  MIN_ALBERTA_EXPERIENCE_MONTHS_STANDARD: 12,
  ALBERTA_WINDOW_MONTHS_STANDARD: 18,
  MIN_ALBERTA_EXPERIENCE_MONTHS_PGWP: 6,
  MIN_GENERAL_EXPERIENCE_MONTHS: 24,
  GENERAL_WINDOW_MONTHS: 30,
  MIN_CLB_TEER_0_1_2_3: 5,
  MIN_CLB_TEER_4_5: 4,
  MIN_CLB_HEALTHCARE: 7,
  MIN_WEEKLY_FULL_TIME_HOURS: 30,
  APPLICATION_FEE_CAD: 840.0
});

export const AAIP_INELIGIBLE_NOC_CODES = Object.freeze([
  '65201', // Food and beverage servers (unless applying under Tourism and Hospitality Stream)
  '75201', // Delivery service drivers and door-to-door distributors
  '65310', // Light duty cleaners (in private households)
  '44100'  // Home child care providers (directed to federal pilot)
]);

/**
 * Evaluates candidate eligibility for the Alberta Opportunity Stream (AOS) and Tourism & Hospitality Stream (THS).
 *
 * @param {Object} options
 * @param {string} [options.workPermitType='lmia_based'] - 'lmia_based', 'pgwp_alberta_grad', 'pgwp_non_alberta_grad', 'francophone_c16', 'cusma_t23', 'open_spousal'
 * @param {number} [options.albertaWorkExperienceMonths=14] - Months worked full-time in Alberta in current occupation
 * @param {number} [options.nonAlbertaWorkExperienceMonths=0] - Other full-time Canadian or foreign experience
 * @param {number} [options.teerCategory=2] - TEER category (0, 1, 2, 3, 4, 5)
 * @param {string} [options.nocCode='21231'] - 5-digit NOC 2021 code
 * @param {number} [options.languageClbLevel=6] - Minimum CLB level across all 4 abilities
 * @param {boolean} [options.hasCanadianHighSchoolOrEca=true] - High school diploma verified by ECA or Canadian credential
 * @param {boolean} [options.hasPermanentJobOfferInAlberta=true] - Full-time, non-seasonal job offer from Alberta employer
 * @param {string} [options.sector='general'] - 'general', 'tourism_hospitality', 'tech', 'healthcare'
 * @param {boolean} [options.isGraduatedFromAlbertaDli=true] - Completed credential at approved Alberta post-secondary institution
 * @param {string} [options.candidateName='AAIP Candidate'] - Name of applicant
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive AAIP AOS & THS diagnostic
 */
export function evaluateAlbertaOpportunityStream(options = {}) {
  const permitType = typeof options.workPermitType === 'string' ? options.workPermitType.trim().toLowerCase() : 'lmia_based';
  const abMonths = Number.isFinite(Number(options.albertaWorkExperienceMonths))
    ? Math.max(0, Math.min(600, Math.floor(Number(options.albertaWorkExperienceMonths))))
    : 14;
  const otherMonths = Number.isFinite(Number(options.nonAlbertaWorkExperienceMonths))
    ? Math.max(0, Math.min(600, Math.floor(Number(options.nonAlbertaWorkExperienceMonths))))
    : 0;
  const teer = Number.isFinite(Number(options.teerCategory))
    ? Math.max(0, Math.min(5, Math.floor(Number(options.teerCategory))))
    : 2;
  const noc = boundedText(options.nocCode, '21231', 10);
  const clb = Number.isFinite(Number(options.languageClbLevel))
    ? Math.max(0, Math.min(12, Math.floor(Number(options.languageClbLevel))))
    : 6;
  const hasEca = options.hasCanadianHighSchoolOrEca !== false;
  const hasJobOffer = options.hasPermanentJobOfferInAlberta !== false;
  const sector = typeof options.sector === 'string' ? options.sector.trim().toLowerCase() : 'general';
  const abGrad = options.isGraduatedFromAlbertaDli !== false;
  const candidate = boundedText(options.candidateName, 'AAIP Candidate', 100);
  const assessDate = safeIsoDate(options.assessmentDate, '2026-10-31');

  const violationsAndBars = [];
  const statutoryProtections = [];
  const actionPlan = [];
  const eligibleStreams = [];

  // 1. Audit Work Permit Eligibility
  let isWorkPermitEligible = true;
  if (permitType === 'pgwp_non_alberta_grad') {
    isWorkPermitEligible = false;
    violationsAndBars.push('INELIGIBLE WORK PERMIT: Post-Graduation Work Permit holders who graduated from an institution outside Alberta are strictly barred from the Alberta Opportunity Stream.');
  } else if (permitType === 'open_spousal') {
    // Open spousal work permits are generally accepted for AOS if other conditions met
    statutoryProtections.push('Spousal Open Work Permit (C41/C42) is recognized for the Alberta Opportunity Stream provided the candidate meets Alberta employment requirements.');
  } else {
    statutoryProtections.push(`Work Permit Status: ${permitType.replace(/_/g, ' ').toUpperCase()} is recognized under AAIP program guidelines.`);
  }

  // 2. Audit Occupation & Ineligible NOC List
  const isIneligibleNoc = AAIP_INELIGIBLE_NOC_CODES.includes(noc);
  const isTourismSector = sector === 'tourism_hospitality';

  if (isIneligibleNoc && !(isTourismSector && noc === '65201')) {
    violationsAndBars.push(`INELIGIBLE OCCUPATION: NOC ${noc} is on the Alberta Ineligible Occupations List for standard AOS.`);
  }

  // 3. Audit Work Experience Requirements
  let isExperienceSatisfied = false;
  if (permitType === 'pgwp_alberta_grad') {
    if (abGrad && abMonths >= AAIP_AOS_CONSTANTS.MIN_ALBERTA_EXPERIENCE_MONTHS_PGWP) {
      isExperienceSatisfied = true;
      statutoryProtections.push(`PGWP Alberta Graduate: ${abMonths} months of Alberta experience satisfies the 6-month post-secondary threshold.`);
    } else {
      violationsAndBars.push(`Insufficient experience for PGWP holder: Requires at least ${AAIP_AOS_CONSTANTS.MIN_ALBERTA_EXPERIENCE_MONTHS_PGWP} months of related Alberta work experience.`);
    }
  } else {
    // Standard worker route
    if (abMonths >= AAIP_AOS_CONSTANTS.MIN_ALBERTA_EXPERIENCE_MONTHS_STANDARD) {
      isExperienceSatisfied = true;
      statutoryProtections.push(`Standard Alberta Route: ${abMonths} months full-time Alberta experience meets the 12-month in 18-month requirement.`);
    } else if (abMonths + otherMonths >= AAIP_AOS_CONSTANTS.MIN_GENERAL_EXPERIENCE_MONTHS && abMonths >= 1) {
      isExperienceSatisfied = true;
      statutoryProtections.push(`Combined Experience Route: ${abMonths + otherMonths} months total experience (including Canadian/foreign) meets the 24-month in 30-month requirement.`);
    } else {
      violationsAndBars.push(`Experience shortfall: Requires at least 12 months full-time Alberta work experience (or 24 months combined). Currently has ${abMonths} Alberta months.`);
    }
  }

  // 4. Audit Language Benchmark
  let minClbRequired = teer <= 3 ? AAIP_AOS_CONSTANTS.MIN_CLB_TEER_0_1_2_3 : AAIP_AOS_CONSTANTS.MIN_CLB_TEER_4_5;
  if (sector === 'healthcare' && teer <= 2) {
    minClbRequired = AAIP_AOS_CONSTANTS.MIN_CLB_HEALTHCARE;
  }

  const isLanguageSatisfied = clb >= minClbRequired;
  if (isLanguageSatisfied) {
    statutoryProtections.push(`Language Benchmark: CLB ${clb} satisfies the minimum requirement of CLB ${minClbRequired} for TEER ${teer} (${sector} sector).`);
  } else {
    violationsAndBars.push(`Language deficiency: CLB ${clb} is below the mandatory CLB ${minClbRequired} threshold for TEER ${teer} occupations.`);
  }

  // 5. Audit Education & Job Offer
  if (!hasEca) {
    violationsAndBars.push('Education verification missing: An Educational Credential Assessment (ECA) is mandatory for foreign secondary or post-secondary credentials.');
  }

  if (!hasJobOffer) {
    violationsAndBars.push('Job offer missing: AAIP requires a genuine, full-time, non-seasonal job offer from an active Alberta employer.');
  }

  // 6. Synthesize Eligible AAIP Streams
  const isBaseAosEligible = isWorkPermitEligible && !isIneligibleNoc && isExperienceSatisfied && isLanguageSatisfied && hasEca && hasJobOffer;
  if (isBaseAosEligible) {
    eligibleStreams.push({
      streamName: 'Alberta Opportunity Stream (AOS)',
      status: 'QUALIFIES_FOR_EXPRESSION_OF_INTEREST',
      applicationFeeCad: AAIP_AOS_CONSTANTS.APPLICATION_FEE_CAD
    });
    actionPlan.push('Submit Expression of Interest (EOI) via the AAIP Portal under the Alberta Opportunity Stream.');
  }

  // Check Tourism & Hospitality Stream
  if (isTourismSector && abMonths >= 6 && hasJobOffer && isLanguageSatisfied && hasEca) {
    eligibleStreams.push({
      streamName: 'AAIP Tourism and Hospitality Stream',
      status: 'QUALIFIES_FOR_DEDICATED_ALLOCATION',
      applicationFeeCad: AAIP_AOS_CONSTANTS.APPLICATION_FEE_CAD
    });
    actionPlan.push('Consider applying under the Tourism and Hospitality Stream: Requires only 6 months of continuous Alberta employer experience.');
  }

  if (violationsAndBars.length > 0) {
    actionPlan.push('Address highlighted statutory bars (accumulate required Alberta months, retake language test, or secure compliant work permit) prior to portal submission.');
  }

  return {
    candidateName: candidate,
    assessmentDate: assessDate,
    overallVerdict: eligibleStreams.length > 0 ? 'ELIGIBLE_FOR_AAIP_NOMINATION' : 'INELIGIBLE_UNDER_CURRENT_CRITERIA',
    isAosEligible: isBaseAosEligible,
    workPermitAudit: {
      permitType,
      isWorkPermitEligible,
      graduatedFromAlbertaDli: abGrad
    },
    workExperienceAudit: {
      albertaMonths: abMonths,
      otherExperienceMonths: otherMonths,
      isExperienceSatisfied,
      requiredAlbertaMonths: permitType === 'pgwp_alberta_grad' ? AAIP_AOS_CONSTANTS.MIN_ALBERTA_EXPERIENCE_MONTHS_PGWP : AAIP_AOS_CONSTANTS.MIN_ALBERTA_EXPERIENCE_MONTHS_STANDARD
    },
    languageAudit: {
      candidateClb: clb,
      requiredClb: minClbRequired,
      isLanguageSatisfied
    },
    occupationAudit: {
      nocCode: noc,
      teerCategory: teer,
      sector,
      isIneligibleOccupation: isIneligibleNoc
    },
    eligibleStreams,
    violationsAndBars,
    statutoryProtections,
    actionPlan
  };
}
