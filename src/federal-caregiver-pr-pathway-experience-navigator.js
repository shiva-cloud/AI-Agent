/**
 * Federal Caregiver Permanent Residence Pathway Experience Navigator
 *
 * Audits qualifying Canadian work experience (12 months full-time under the 2023 revised
 * standard), Home Child Care Provider (NOC 44100) vs Home Support Worker (NOC 44101),
 * private household employment verification, CLB 5 language benchmarks, and 1-year
 * post-secondary credential/ECA rules under IRPA s. 14.1 and Caregiver Pilot instructions.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FEDERAL_CAREGIVER_CONSTANTS = Object.freeze({
  PROGRAM_NAME: 'Caregiver Permanent Residence Pathway (HCCPP / HSWP)',
  MIN_QUALIFYING_EXPERIENCE_MONTHS: 12, // 2023 standard reduced from 24 to 12 months
  EXPERIENCE_LOOKBACK_MONTHS: 36,
  MIN_WEEKLY_FULL_TIME_HOURS: 30,
  MIN_LANGUAGE_CLB_LEVEL: 5,
  QUALIFYING_NOCS: Object.freeze(['44100', '44101']),
  STATUTORY_AUTHORITY: 'Immigration and Refugee Protection Act, SC 2001, c. 27, s. 14.1; Caregiver Pilot Ministerial Instructions'
});

/**
 * Audits caregiver permanent residence eligibility, qualifying experience, language, and education.
 *
 * @param {Object} params
 * @param {string} [params.nocCode='44100'] - '44100' (Home Child Care Provider) or '44101' (Home Support Worker)
 * @param {number} [params.completedCanadianExperienceMonths=12] - Full-time months worked in Canada
 * @param {number} [params.averageWeeklyHours=35] - Average weekly hours worked
 * @param {boolean} [params.experienceInPrivateHousehold=true] - Employed in a private home (not institutional)
 * @param {number} [params.clbReading=5] - CLB reading score (1-12)
 * @param {number} [params.clbWriting=5] - CLB writing score (1-12)
 * @param {number} [params.clbListening=5] - CLB listening score (1-12)
 * @param {number} [params.clbSpeaking=5] - CLB speaking score (1-12)
 * @param {boolean} [params.hasOneYearPostSecondaryOrEca=true] - Holds 1-year Canadian credential or foreign ECA
 * @param {boolean} [params.hasValidCanadianWorkPermitOrStatus=true] - Holds valid legal status in Canada
 * @returns {Object} Comprehensive Caregiver PR audit and pathway assessment
 */
export function evaluateFederalCaregiverPrPathway(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    caregiverName = 'Caregiver',
    assessmentDate = todayIso(),
    nocCode = '44100',
    completedCanadianExperienceMonths = 12,
    averageWeeklyHours = 35,
    experienceInPrivateHousehold = true,
    clbReading = 5,
    clbWriting = 5,
    clbListening = 5,
    clbSpeaking = 5,
    hasOneYearPostSecondaryOrEca = true,
    hasValidCanadianWorkPermitOrStatus = true,
    employerName = 'Private Household Employer',
    careRecipientCategory = 'Child or Elderly Care'
  } = safeParams;
  const cleanCaregiverName = boundedText(caregiverName, 'Caregiver', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanEmployer = boundedText(employerName, 'Private Household Employer');
  const cleanCategory = boundedText(careRecipientCategory, 'Child or Elderly Care');
  const noc = boundedText(nocCode, '44100', 20);
  const monthsExp = Math.max(0, Math.min(360, Number.isFinite(Number(completedCanadianExperienceMonths)) ? Number(completedCanadianExperienceMonths) : 0));
  const weeklyHours = Math.max(0, Math.min(168, Number.isFinite(Number(averageWeeklyHours)) ? Number(averageWeeklyHours) : 0));
  const rCLB = Math.max(0, Math.min(12, Number.isFinite(Number(clbReading)) ? Number(clbReading) : 0));
  const wCLB = Math.max(0, Math.min(12, Number.isFinite(Number(clbWriting)) ? Number(clbWriting) : 0));
  const lCLB = Math.max(0, Math.min(12, Number.isFinite(Number(clbListening)) ? Number(clbListening) : 0));
  const sCLB = Math.max(0, Math.min(12, Number.isFinite(Number(clbSpeaking)) ? Number(clbSpeaking) : 0));

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. NOC Code Audit
  const isValidNoc = FEDERAL_CAREGIVER_CONSTANTS.QUALIFYING_NOCS.includes(noc);
  if (!isValidNoc) {
    statutoryViolations.push({
      rule: 'INELIGIBLE_CAREGIVER_NOC_CODE',
      statute: 'Caregiver Pilot Ministerial Instructions',
      finding: `NOC code '${noc}' is not eligible. Must be NOC 44100 (Home child care provider) or NOC 44101 (Home support worker).`
    });
  }

  // 2. Work Experience Audit (12 months full-time)
  const isFullTime = weeklyHours >= FEDERAL_CAREGIVER_CONSTANTS.MIN_WEEKLY_FULL_TIME_HOURS;
  if (!isFullTime) {
    statutoryViolations.push({
      rule: 'SUBSTANDARD_WEEKLY_HOURS_NOT_FULL_TIME',
      statute: 'Caregiver Pilot Operational Guidelines',
      finding: `Average weekly hours is ${weeklyHours}. Ministerial Instructions require full-time employment of at least 30 hours per week.`
    });
  }

  const meetsExperienceMonths = monthsExp >= FEDERAL_CAREGIVER_CONSTANTS.MIN_QUALIFYING_EXPERIENCE_MONTHS;
  if (!meetsExperienceMonths) {
    const deficitMonths = FEDERAL_CAREGIVER_CONSTANTS.MIN_QUALIFYING_EXPERIENCE_MONTHS - monthsExp;
    statutoryViolations.push({
      rule: 'INSUFFICIENT_QUALIFYING_CANADIAN_WORK_EXPERIENCE',
      statute: 'Caregiver Pilot 2023 Revision (12-Month Rule)',
      finding: `Accumulated ${monthsExp} months experience. Minimum 12 months full-time Canadian experience required for Direct to PR stream.`
    });
    actionableRemedies.push({
      action: 'ACCRUE_REMAINING_MONTHS_OF_WORK_EXPERIENCE',
      remedyDescription: `Work an additional ${deficitMonths} full-time month${deficitMonths === 1 ? '' : 's'} under a valid work permit to qualify.`
    });
  }

  if (!experienceInPrivateHousehold) {
    statutoryViolations.push({
      rule: 'INSTITUTIONAL_EXPERIENCE_EXCLUDED',
      statute: 'IRPR s. 14.1 & Pilot Instructions',
      finding: 'Experience in daycares, schools, or institutional nursing homes does not qualify. Care must be provided in a private home setting.'
    });
  }

  // 3. Language Benchmark Audit (CLB 5 in all 4 skills)
  const minClbAchieved = Math.min(rCLB, wCLB, lCLB, sCLB);
  if (minClbAchieved < FEDERAL_CAREGIVER_CONSTANTS.MIN_LANGUAGE_CLB_LEVEL) {
    statutoryViolations.push({
      rule: 'BELOW_MINIMUM_CLB_5_BENCHMARK',
      statute: 'Caregiver Pilot Ministerial Instructions',
      finding: `Lowest language skill is CLB ${minClbAchieved}. Candidate must attain at least CLB 5 across all four abilities (R:${rCLB}, W:${wCLB}, L:${lCLB}, S:${sCLB}).`
    });
    actionableRemedies.push({
      action: 'RETAKE_LANGUAGE_TEST_FOR_CLB_5',
      remedyDescription: 'Retake IELTS General, CELPIP-G, TEF, or TCF Canada to achieve CLB 5 or higher in each component.'
    });
  }

  // 4. Education Credential Audit
  if (!hasOneYearPostSecondaryOrEca) {
    statutoryViolations.push({
      rule: 'MISSING_1_YEAR_POST_SECONDARY_OR_ECA',
      statute: 'Caregiver Pilot Ministerial Instructions',
      finding: 'Applicant must hold a Canadian 1-year post-secondary credential or an Educational Credential Assessment (ECA) confirming foreign equivalent.'
    });
    actionableRemedies.push({
      action: 'OBTAIN_EDUCATIONAL_CREDENTIAL_ASSESSMENT',
      remedyDescription: 'Submit foreign diplomas to WES, ICAS, or CES for official Canadian equivalency assessment.'
    });
  }

  if (!hasValidCanadianWorkPermitOrStatus) {
    riskWarnings.push({
      warningType: 'LEGAL_STATUS_MAINTENANCE_REQUIRED',
      description: 'Caregiver must hold valid temporary resident status or maintained status in Canada while accumulating qualifying hours.'
    });
  }

  const isEligible = statutoryViolations.length === 0;
  let eligibilityVerdict = 'ELIGIBLE_FOR_CAREGIVER_DIRECT_PR';
  let legalVerdict = 'Candidate satisfies all 12-month work experience, CLB 5, and post-secondary educational criteria under the Caregiver PR stream.';

  if (!isEligible) {
    eligibilityVerdict = 'INELIGIBLE_FOR_CAREGIVER_DIRECT_PR';
    legalVerdict = `Candidate does not qualify for Caregiver PR due to ${statutoryViolations.length} statutory deficiency${statutoryViolations.length === 1 ? '' : 's'}. Review necessary conditions before applying.`;
  }

  return {
    caregiverName: cleanCaregiverName,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    employerName: cleanEmployer,
    careRecipientCategory: cleanCategory,
    programName: FEDERAL_CAREGIVER_CONSTANTS.PROGRAM_NAME,
    nocCode: noc,
    completedExperienceMonths: monthsExp,
    isEligible,
    eligibilityVerdict,
    legalVerdict,
    qualificationSummary: {
      meets12MonthExperienceThreshold: meetsExperienceMonths && isFullTime,
      privateHouseholdConfirmed: experienceInPrivateHousehold,
      minClbAchieved,
      meetsClb5LanguageThreshold: minClbAchieved >= 5,
      hasPostSecondaryOrEca: hasOneYearPostSecondaryOrEca
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Act, SC 2001, c. 27, s. 14.1',
      'Ministerial Instructions: Home Child Care Provider Pilot & Home Support Worker Pilot (April 2023 12-Month Experience Standard)'
    ]
  };
}