/**
 * British Columbia PNP Skills Immigration Tech Navigator
 *
 * Evaluates registration score, employer longevity, 35 in-demand tech NOCs,
 * and minimum 1-year job offer criteria under the BC Provincial Nominee Program (BC PNP)
 * and the Provincial Immigration Programs Act, SBC 2015, c. 35.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_PNP_TECH_CONSTANTS = Object.freeze({
  DESIGNATED_TECH_NOC_COUNT: 35,
  MIN_JOB_OFFER_DURATION_DAYS: 365, // Minimum 1 year job offer
  MIN_EMPLOYER_METRO_VANCOUVER_FULLTIME_STAFF: 5,
  MIN_EMPLOYER_REGIONAL_FULLTIME_STAFF: 3,
  BC_PNP_APPLICATION_FEE_CAD: 1475,
  STATUTORY_AUTHORITY: 'Provincial Immigration Programs Act, SBC 2015, c. 35; BC PNP Tech Guide'
});

export const BC_TECH_QUALIFYING_NOCS = Object.freeze([
  '10030', '20012', '21100', '21210', '21211', '21220', '21221', '21222',
  '21223', '21230', '21231', '21232', '21233', '21234', '21300', '21301',
  '21310', '21311', '21320', '21399', '22212', '22214', '22220', '22221',
  '22222', '22310', '22312', '50011', '51111', '51112', '51120', '52112',
  '52113', '52120', '53111'
]);

/**
 * Audits BC PNP Tech stream eligibility, employer eligibility, wage adequacy, and SIRS points.
 *
 * @param {Object} params
 * @param {string} [params.nocCode='21231'] - 5-digit 2021 NOC Code (e.g. 21231 Software engineers and designers)
 * @param {number} [params.jobOfferDurationDays=365] - Duration of the full-time job offer in days
 * @param {boolean} [params.isJobOfferFullTime=true] - At least 30 hours per week
 * @param {number} [params.hourlyWageCad=45.00] - Offered hourly wage
 * @param {number} [params.regionalMedianHourlyWageCad=38.50] - ESDC median wage for the occupation in the region
 * @param {string} [params.jobLocationRegion='METRO_VANCOUVER'] - Region: 'METRO_VANCOUVER', 'REGIONAL_OUTSIDE_VANCOUVER'
 * @param {number} [params.employerFullTimeEmployeesCount=8] - Number of full-time Canadian PR/citizen staff on payroll
 * @param {number} [params.yearsOfDirectTechExperience=3] - Directly related tech work experience in years
 * @param {number} [params.languageClbLevel=7] - English or French CLB level in all 4 competencies
 * @param {string} [params.highestEducationLevel='bachelors_degree'] - Highest credential
 * @returns {Object} Comprehensive BC PNP Tech stream assessment
 */
export function evaluateBcTechPilotEligibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    nocCode = '21231',
    jobOfferDurationDays = 365,
    isJobOfferFullTime = true,
    hourlyWageCad = 45.00,
    regionalMedianHourlyWageCad = 38.50,
    jobLocationRegion = 'METRO_VANCOUVER',
    employerFullTimeEmployeesCount = 8,
    yearsOfDirectTechExperience = 3,
    languageClbLevel = 7,
    highestEducationLevel = 'bachelors_degree',
    candidateName = 'Tech Candidate',
    employerName = 'BC Tech Employer',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeCandidateName = boundedText(candidateName, 'Tech Candidate', 100);
  const safeEmployerName = boundedText(employerName, 'BC Tech Employer', 150);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeNocCode = boundedText(nocCode, '21231', 10);
  const safeJobLocationRegion = boundedText(jobLocationRegion, 'METRO_VANCOUVER', 40);
  const safeHighestEducation = boundedText(highestEducationLevel, 'bachelors_degree', 40);

  const wage = Math.max(0, Math.min(10000, Number.isFinite(Number(hourlyWageCad)) ? Number(hourlyWageCad) : 45.00));
  const medianWage = Math.max(0, Math.min(10000, Number.isFinite(Number(regionalMedianHourlyWageCad)) ? Number(regionalMedianHourlyWageCad) : 38.50));
  const duration = Math.max(0, Math.min(36500, Number.isFinite(Number(jobOfferDurationDays)) ? Number(jobOfferDurationDays) : 365));
  const staffCount = Math.max(0, Math.min(100000, Number.isFinite(Number(employerFullTimeEmployeesCount)) ? Number(employerFullTimeEmployeesCount) : 8));
  const expYears = Math.max(0, Math.min(60, Number.isFinite(Number(yearsOfDirectTechExperience)) ? Number(yearsOfDirectTechExperience) : 3));
  const clb = Math.max(0, Math.min(12, Number.isFinite(Number(languageClbLevel)) ? Number(languageClbLevel) : 7));

  const isNocInTechList = BC_TECH_QUALIFYING_NOCS.includes(safeNocCode);
  const meetsJobOfferDuration = duration >= BC_PNP_TECH_CONSTANTS.MIN_JOB_OFFER_DURATION_DAYS;
  const meetsWageRequirement = wage >= medianWage;

  const minStaffRequired = safeJobLocationRegion === 'METRO_VANCOUVER'
    ? BC_PNP_TECH_CONSTANTS.MIN_EMPLOYER_METRO_VANCOUVER_FULLTIME_STAFF
    : BC_PNP_TECH_CONSTANTS.MIN_EMPLOYER_REGIONAL_FULLTIME_STAFF;

  const meetsEmployerStaffThreshold = staffCount >= minStaffRequired;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. NOC List Audit
  if (!isNocInTechList) {
    statutoryViolations.push({
      rule: 'NON_DESIGNATED_TECH_NOC',
      statute: 'BC PNP Tech Stream Policy',
      finding: `NOC ${safeNocCode} is not among the 35 designated technology occupations eligible for weekly Tech draws.`
    });
    actionableRemedies.push({
      action: 'APPLY_UNDER_STANDARD_SKILLS_IMMIGRATION',
      remedyDescription: 'Apply through standard BC PNP Skilled Worker stream; requires permanent indeterminate job offer.'
    });
  }

  // 2. Job Offer Duration Audit (1-year exception for Tech)
  if (!meetsJobOfferDuration || !isJobOfferFullTime) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_JOB_OFFER_DURATION_OR_HOURS',
      statute: 'BC PNP Tech Stream Policy s. 3.2',
      finding: `Job offer duration is ${duration} days (${isJobOfferFullTime ? 'full-time' : 'part-time'}). Minimum 365 days of full-time (30+ hrs/wk) employment required.`
    });
    actionableRemedies.push({
      action: 'EXTEND_JOB_OFFER_CONTRACT',
      remedyDescription: 'Obtain an amended employment contract showing at least 365 days remaining from application date.'
    });
  }

  // 3. Wage vs Median Audit
  if (!meetsWageRequirement) {
    statutoryViolations.push({
      rule: 'WAGE_BELOW_REGIONAL_MEDIAN',
      statute: 'BC PNP Skills Immigration Wage Criteria',
      finding: `Offered wage ($${wage}/hr) is below the ESDC regional median wage ($${medianWage}/hr) for NOC ${safeNocCode}.`
    });
    actionableRemedies.push({
      action: 'INCREASE_WAGE_TO_MARKET_MEDIAN',
      remedyDescription: `Employer must increase wage to at least $${medianWage}/hr to satisfy provincial wage standards.`
    });
  }

  // 4. Employer Staffing Audit
  if (!meetsEmployerStaffThreshold) {
    statutoryViolations.push({
      rule: 'EMPLOYER_STAFFING_BELOW_MINIMUM',
      statute: 'BC PNP Employer Eligibility Criteria',
      finding: `Employer has ${staffCount} full-time staff in ${safeJobLocationRegion}. Minimum ${minStaffRequired} permanent full-time Canadian citizens/PRs required.`
    });
    actionableRemedies.push({
      action: 'EMPLOYER_MUST_EXPAND_PAYROLL_OR_USE_PARTNER',
      remedyDescription: `Employer must document at least ${minStaffRequired} full-time staff on T4/payroll summaries.`
    });
  }

  // 5. Estimated SIRS Points Calculation (Skills Immigration Registration System)
  let sirsPoints = 0;
  // Wage points: up to 55 points (1 pt per $1/hr above minimum, roughly)
  sirsPoints += Math.min(55, Math.floor(wage * 1.1));
  // Experience points: up to 25 points
  sirsPoints += Math.min(25, expYears * 4);
  // Language points: up to 30 points
  if (clb >= 9) sirsPoints += 30;
  else if (clb >= 7) sirsPoints += 20;
  else if (clb >= 5) sirsPoints += 10;
  // Education points: up to 25 points
  if (safeHighestEducation === 'masters_degree' || safeHighestEducation === 'doctorate') sirsPoints += 25;
  else if (safeHighestEducation === 'bachelors_degree') sirsPoints += 20;
  else sirsPoints += 10;
  // Regional points
  if (safeJobLocationRegion !== 'METRO_VANCOUVER') sirsPoints += 15;

  let eligibilityVerdict = 'ELIGIBLE_FOR_BC_PNP_TECH_DRAW';
  let isEligible = true;

  if (statutoryViolations.length > 0) {
    isEligible = false;
    if (!isNocInTechList) {
      eligibilityVerdict = 'INELIGIBLE_NON_TECH_NOC';
    } else if (!meetsJobOfferDuration) {
      eligibilityVerdict = 'INELIGIBLE_INSUFFICIENT_JOB_OFFER_DURATION';
    } else {
      eligibilityVerdict = 'INELIGIBLE_STATUTORY_REQUIREMENTS_NOT_MET';
    }
  }

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    stream: 'BC_PNP_SKILLS_IMMIGRATION_TECH',
    candidateName: safeCandidateName,
    employerName: safeEmployerName,
    assessmentDate: safeAssessmentDate,
    nocCode: safeNocCode,
    isNocInTechList,
    isEligible,
    eligibilityVerdict,
    criteriaSummary: {
      offeredHourlyWageCad: wage,
      regionalMedianHourlyWageCad: medianWage,
      jobOfferDurationDays: duration,
      jobLocationRegion: safeJobLocationRegion,
      employerFullTimeStaffCount: staffCount,
      minEmployerStaffRequired: minStaffRequired,
      estimatedSirsScore: sirsPoints
    },
    statutoryFees: {
      bcpnpApplicationFeeCad: BC_PNP_TECH_CONSTANTS.BC_PNP_APPLICATION_FEE_CAD
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Provincial Immigration Programs Act, SBC 2015, c. 35',
      'Provincial Immigration Programs Regulation, B.C. Reg. 20/2017',
      'BC PNP Skills Immigration Program Guide - Tech Pathway'
    ]
  };
}
