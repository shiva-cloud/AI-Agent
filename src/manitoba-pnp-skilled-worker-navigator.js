/**
 * Manitoba Provincial Nominee Program (MPNP) Skilled Worker & EOI Ranking Engine
 *
 * Implements statutory assessment under:
 * - Manitoba Provincial Nominee Program (MPNP) Criteria & Ministerial Directives
 * - Immigration and Refugee Protection Act (SC 2001 c. 27) ss. 10, 87
 * - Immigration and Refugee Protection Regulations (SOR/2002-227) s. 204(c) (T13 Work Permit Support)
 * - MPNP Expression of Interest (EOI) 1,000-Point Ranking Matrix
 *
 * Key Statutory Rules:
 * - Skilled Worker in Manitoba (SWM) Stream:
 *   - Current full-time employment in Manitoba for at least 6 continuous months with the same employer
 *     who has issued a long-term, permanent job offer.
 *   - Out-of-Province Graduates: Must complete at least 12 continuous months of employment in Manitoba
 *     to qualify under SWM.
 * - MPNP 1,000-Point Ranking Factors:
 *   (1) Language (up to 125 pts first official language + 25 pts second official language);
 *   (2) Age (up to 75 pts for ages 21–45);
 *   (3) Work Experience (up to 75 pts + 100 pts bonus for continuous Manitoba work >= 6 months);
 *   (4) Education (up to 125 pts for Master's/PhD or two post-secondary degrees);
 *   (5) Adaptability (up to 500 pts for Manitoba work connection, or 200 pts for close relative supporter,
 *       plus 50 pts for regional employment outside Winnipeg).
 * - Risk Factor Point Deductions:
 *   - Study in another Canadian province: -100 points.
 *   - Work in another Canadian province: -100 points.
 * - Manitoba Supporter Criteria: Must be a Canadian citizen or permanent resident, resident in Manitoba
 *   for at least 1 year, and a close relative (parent, child, sibling, aunt/uncle, niece/nephew, first cousin).
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const MPNP_CONSTANTS = Object.freeze({
  MIN_MANITOBA_WORK_MONTHS_LOCAL_GRAD: 6,
  MIN_MANITOBA_WORK_MONTHS_OUT_OF_PROVINCE_GRAD: 12,
  MANITOBA_WORK_CONNECTION_POINTS: 500,
  MANITOBA_SUPPORTER_POINTS: 200,
  REGIONAL_EMPLOYMENT_POINTS: 50,
  OUT_OF_PROVINCE_STUDY_PENALTY_POINTS: -100,
  OUT_OF_PROVINCE_WORK_PENALTY_POINTS: -100,
  APPLICATION_FEE_CAD: 500.0,
  MIN_FULL_TIME_WEEKLY_HOURS: 30
});

/**
 * Evaluates MPNP Skilled Worker in Manitoba eligibility and computes 1,000-point EOI score.
 *
 * @param {Object} options
 * @param {number} [options.monthsWorkedInManitoba=8] - Continuous months worked for current Manitoba employer
 * @param {boolean} [options.isOutOfProvinceGraduate=false] - Graduated from college/university in another province
 * @param {boolean} [options.hasPermanentManitobaJobOffer=true] - Long-term, permanent full-time job offer
 * @param {number} [options.firstLanguageClb=7] - CLB in first official language (English or French)
 * @param {number} [options.secondLanguageClb=0] - CLB in second official language
 * @param {number} [options.candidateAge=30] - Age in years
 * @param {number} [options.totalYearsOfWorkExperience=4] - Total years of skilled work experience
 * @param {string} [options.highestEducationLevel='bachelors_degree'] - 'masters_phd', 'two_post_secondary', 'bachelors_degree', 'two_year_post_secondary', 'one_year_post_secondary', 'high_school'
 * @param {boolean} [options.hasCloseFamilySupporterInManitoba=false] - Close relative who is citizen/PR living in MB >= 1 yr
 * @param {boolean} [options.isJobLocatedOutsideWinnipeg=true] - Regional destination in Manitoba
 * @param {boolean} [options.hasPastStudyInAnotherProvince=false] - Studied in another Canadian province
 * @param {boolean} [options.hasPastWorkInAnotherProvince=false] - Worked in another Canadian province
 * @param {string} [options.candidateName='MPNP Candidate'] - Candidate name
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive MPNP EOI calculation and eligibility diagnostic
 */
export function evaluateManitobaPnpSkilledWorker(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const mbMonths = Number.isFinite(Number(safeOptions.monthsWorkedInManitoba)) ? Math.max(0, Math.min(600, Math.floor(Number(safeOptions.monthsWorkedInManitoba)))) : 8;
  const isOopGrad = Boolean(safeOptions.isOutOfProvinceGraduate);
  const hasJobOffer = safeOptions.hasPermanentManitobaJobOffer !== false;
  const clb1 = Number.isFinite(Number(safeOptions.firstLanguageClb)) ? Math.max(0, Math.min(10, Math.floor(Number(safeOptions.firstLanguageClb)))) : 7;
  const clb2 = Number.isFinite(Number(safeOptions.secondLanguageClb)) ? Math.max(0, Math.min(10, Math.floor(Number(safeOptions.secondLanguageClb)))) : 0;
  const age = Number.isFinite(Number(safeOptions.candidateAge)) ? Math.max(18, Math.min(75, Math.floor(Number(safeOptions.candidateAge)))) : 30;
  const totalExp = Number.isFinite(Number(safeOptions.totalYearsOfWorkExperience)) ? Math.max(0, Math.min(50, Number(safeOptions.totalYearsOfWorkExperience))) : 4;
  const rawEdu = boundedText(safeOptions.highestEducationLevel, 'bachelors_degree', 50).toLowerCase();
  const hasFamilySupporter = Boolean(safeOptions.hasCloseFamilySupporterInManitoba);
  const isRegional = Boolean(safeOptions.isJobLocatedOutsideWinnipeg);
  const pastOopStudy = Boolean(safeOptions.hasPastStudyInAnotherProvince);
  const pastOopWork = Boolean(safeOptions.hasPastWorkInAnotherProvince);
  const candidate = boundedText(safeOptions.candidateName, 'MPNP Candidate', 100);
  const assessDate = safeIsoDate(safeOptions.assessmentDate, '2026-10-31');

  const statutoryProtections = [];
  const riskWarnings = [];
  const actionPlan = [];

  // 1. Audit Base Stream Eligibility (Skilled Worker in Manitoba)
  const minRequiredMonths = isOopGrad
    ? MPNP_CONSTANTS.MIN_MANITOBA_WORK_MONTHS_OUT_OF_PROVINCE_GRAD
    : MPNP_CONSTANTS.MIN_MANITOBA_WORK_MONTHS_LOCAL_GRAD;

  const isEmploymentDurationSatisfied = mbMonths >= minRequiredMonths;
  let isStreamEligible = isEmploymentDurationSatisfied && hasJobOffer;

  if (isEmploymentDurationSatisfied && hasJobOffer) {
    statutoryProtections.push(`Skilled Worker in Manitoba: ${mbMonths} months continuous employment satisfies the ${minRequiredMonths}-month threshold with a permanent job offer.`);
  } else {
    if (!isEmploymentDurationSatisfied) {
      riskWarnings.push(`Employment Duration Shortfall: Has ${mbMonths} months in Manitoba. Requires ${minRequiredMonths} continuous months (out-of-province grads require 12 months).`);
    }
    if (!hasJobOffer) {
      riskWarnings.push('Missing Permanent Job Offer: MPNP requires a long-term, full-time non-seasonal offer from an established Manitoba employer.');
    }
  }

  // 2. Calculate MPNP 1,000-Point Ranking Matrix
  let pointsLanguage = 0;
  if (clb1 >= 8) pointsLanguage = 125;
  else if (clb1 === 7) pointsLanguage = 110;
  else if (clb1 === 6) pointsLanguage = 90;
  else if (clb1 === 5) pointsLanguage = 70;
  else if (clb1 === 4) pointsLanguage = 50;

  if (clb2 >= 5) pointsLanguage += 25;

  let pointsAge = 0;
  if (age >= 21 && age <= 45) pointsAge = 75;
  else if (age >= 46 && age <= 49) pointsAge = 40;
  else pointsAge = 0;

  let pointsWorkExp = 0;
  if (totalExp >= 4) pointsWorkExp = 75;
  else if (totalExp >= 3) pointsWorkExp = 60;
  else if (totalExp >= 2) pointsWorkExp = 50;
  else if (totalExp >= 1) pointsWorkExp = 40;

  // 100 bonus points for 6+ months continuous work in Manitoba
  if (mbMonths >= 6) {
    pointsWorkExp += 100;
  }

  let pointsEducation = 70; // default 1-yr
  if (['masters_phd', 'two_post_secondary'].includes(rawEdu)) pointsEducation = 125;
  else if (rawEdu === 'bachelors_degree') pointsEducation = 110;
  else if (rawEdu === 'two_year_post_secondary') pointsEducation = 100;
  else if (rawEdu === 'high_school') pointsEducation = 0;

  let pointsAdaptability = 0;
  if (mbMonths >= 6) {
    pointsAdaptability += MPNP_CONSTANTS.MANITOBA_WORK_CONNECTION_POINTS; // 500 pts
  } else if (hasFamilySupporter) {
    pointsAdaptability += MPNP_CONSTANTS.MANITOBA_SUPPORTER_POINTS; // 200 pts
  }

  if (isRegional) {
    pointsAdaptability += MPNP_CONSTANTS.REGIONAL_EMPLOYMENT_POINTS; // 50 pts
    statutoryProtections.push('Regional Destination: 50 bonus points awarded for employment outside the Winnipeg Capital Region.');
  }

  let pointsRiskDeductions = 0;
  if (pastOopStudy) {
    pointsRiskDeductions += MPNP_CONSTANTS.OUT_OF_PROVINCE_STUDY_PENALTY_POINTS;
    riskWarnings.push('Risk Deduction (-100 pts): Previous post-secondary education in another Canadian province deducted under MPNP EOI rules.');
  }
  if (pastOopWork) {
    pointsRiskDeductions += MPNP_CONSTANTS.OUT_OF_PROVINCE_WORK_PENALTY_POINTS;
    riskWarnings.push('Risk Deduction (-100 pts): Previous work experience in another Canadian province deducted under MPNP EOI rules.');
  }

  const totalEoiScore = Math.max(
    0,
    pointsLanguage + pointsAge + pointsWorkExp + pointsEducation + pointsAdaptability + pointsRiskDeductions
  );

  // 3. Build Action Plan
  if (isStreamEligible) {
    actionPlan.push(`Create an MPNP online account and submit an Expression of Interest (EOI) profile with calculated score of ${totalEoiScore} points.`);
    actionPlan.push('Collate Manitoba employer Letter of Reference, job offer, and 6 consecutive pay statements.');
    if (isRegional) {
      actionPlan.push('Provide proof of regional physical residence (residential lease outside Winnipeg).');
    }
  } else {
    actionPlan.push(`Accumulate remaining ${minRequiredMonths - mbMonths} months of full-time continuous Manitoba work experience to fulfill baseline SWM requirements.`);
  }

  return {
    candidateName: candidate,
    assessmentDate: assessDate,
    streamVerdict: isStreamEligible ? 'QUALIFIES_FOR_SKILLED_WORKER_IN_MANITOBA' : 'INELIGIBLE_UNDER_CURRENT_RULES',
    isStreamEligible,
    eoiScoreSummary: {
      totalEoiPoints: totalEoiScore,
      pointsLanguage,
      pointsAge,
      pointsWorkExperience: pointsWorkExp,
      pointsEducation,
      pointsAdaptability,
      riskDeductions: pointsRiskDeductions
    },
    employmentAudit: {
      monthsWorkedInManitoba: mbMonths,
      requiredMonths: minRequiredMonths,
      isOutOfProvinceGraduate: isOopGrad,
      hasPermanentJobOffer: hasJobOffer
    },
    statutoryProtections,
    riskWarnings,
    actionPlan
  };
}

export const assessManitobaPnpSkilledWorker = evaluateManitobaPnpSkilledWorker;

