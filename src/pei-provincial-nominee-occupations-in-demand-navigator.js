/**
 * PEI Provincial Nominee Program (PEI PNP) Occupations in Demand Navigator
 *
 * Implements statutory assessment rules under:
 * - Prince Edward Island Provincial Nominee Program (PEI PNP) Occupations in Demand Stream
 * - Prince Edward Island Immigration Framework & Labour Market Priorities
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27, s. 8)
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227, s. 87)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const PEI_ELIGIBLE_TARGET_NOCS = Object.freeze([
  {
    noc: '33102',
    title: 'Nurse aides, orderlies and patient service associates',
    teer: 3,
    sector: 'Healthcare',
    minimumClb: 4
  },
  {
    noc: '73300',
    title: 'Transport truck drivers',
    teer: 3,
    sector: 'Transportation',
    minimumClb: 4
  },
  {
    noc: '75110',
    title: 'Construction trades helpers and labourers',
    teer: 5,
    sector: 'Construction',
    minimumClb: 4
  },
  {
    noc: '65310',
    title: 'Light duty cleaners',
    teer: 5,
    sector: 'Hospitality & Services',
    minimumClb: 4
  },
  {
    noc: '95109',
    title: 'Other labourers in processing, manufacturing and utilities',
    teer: 5,
    sector: 'Manufacturing',
    minimumClb: 4
  },
  {
    noc: '94141',
    title: 'Industrial butchers and meat cutters, poultry preparers and related workers',
    teer: 4,
    sector: 'Food Processing',
    minimumClb: 4
  },
  {
    noc: '85100',
    title: 'Livestock labourers',
    teer: 5,
    sector: 'Agriculture',
    minimumClb: 4
  },
  {
    noc: '85101',
    title: 'Harvesting labourers',
    teer: 5,
    sector: 'Agriculture',
    minimumClb: 4
  },
  {
    noc: '84120',
    title: 'Specialized livestock workers and farm machinery operators',
    teer: 4,
    sector: 'Agriculture',
    minimumClb: 4
  }
]);

export const PEI_SETTLEMENT_FUNDS_BASE_CAD = 10000;
export const PEI_ADDITIONAL_DEPENDENT_CAD = 2000;

export function evaluatePeiOccupationsInDemand(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    nocCode = '',
    jobOfferFullTime = false,
    jobOfferPermanentOrTwoYears = false,
    employerOperatedTwoYearsInPei = false,
    hasValidWorkPermitOrAuthorization = true,
    monthsOfDirectExperienceInLastFiveYears = 0,
    applicantAge = 30,
    clbScore = 0,
    hasHighSchoolDiplomaOrEca = false,
    liquidFundsCad = 0,
    familySize = 1,
    intendsToResideInPei = true,
    candidateName = 'Candidate',
    assessmentDate = '2026-10-31'
  } = safeParams;

  const safeCandidateName = boundedText(candidateName, 'Candidate', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');

  const normalizedNoc = boundedText(nocCode, '', 20).trim();
  const matchedNoc = PEI_ELIGIBLE_TARGET_NOCS.find(item => item.noc === normalizedNoc);

  const fullTime = Boolean(jobOfferFullTime);
  const permanentOrTwoYears = Boolean(jobOfferPermanentOrTwoYears);
  const employerTwoYears = Boolean(employerOperatedTwoYearsInPei);
  const validAuthorization = Boolean(hasValidWorkPermitOrAuthorization);
  const highSchoolOrEca = Boolean(hasHighSchoolDiplomaOrEca);
  const intentToReside = Boolean(intendsToResideInPei);

  const expMonths = Math.max(0, Math.min(360, Math.floor(Number(monthsOfDirectExperienceInLastFiveYears) || 0)));
  const age = Math.max(0, Math.min(120, Math.floor(Number(applicantAge) || 0)));
  const clb = Math.max(0, Math.min(12, Math.floor(Number(clbScore) || 0)));
  const providedFunds = Math.max(0, Math.min(1000000000, Number(liquidFundsCad) || 0));
  const validFamilySize = Math.max(1, Math.min(20, Math.floor(Number(familySize) || 1)));

  const criteria = [];
  const disqualifications = [];
  const riskWarnings = [];

  // 1. Target Occupation Check
  if (matchedNoc) {
    criteria.push({
      criterion: 'ELIGIBLE_TARGET_NOC',
      status: 'MET',
      details: `NOC ${matchedNoc.noc} (${matchedNoc.title}) is an authorized PEI in-demand target occupation in ${matchedNoc.sector}.`
    });
  } else {
    disqualifications.push({
      criterion: 'INELIGIBLE_NOC_CODE',
      reason: `NOC ${normalizedNoc || 'UNSPECIFIED'} is not currently designated on the PEI Occupations in Demand schedule.`
    });
  }

  // 2. Job Offer Criteria (Full-time, permanent or at least 2-year contract)
  if (fullTime && permanentOrTwoYears) {
    criteria.push({
      criterion: 'QUALIFYING_JOB_OFFER',
      status: 'MET',
      details: 'Job offer is full-time (at least 30 hrs/wk) and either non-seasonal permanent or a minimum 2-year contract.'
    });
  } else {
    disqualifications.push({
      criterion: 'JOB_OFFER_DEFICIENCY',
      reason: 'Job offer must be full-time, non-seasonal, and permanent or provide a minimum 2-year contract with an eligible PEI employer.'
    });
  }

  // 3. Employer Operating Longevity in PEI (At least 2 continuous years)
  if (employerTwoYears) {
    criteria.push({
      criterion: 'EMPLOYER_ELIGIBILITY',
      status: 'MET',
      details: 'Employer has operated actively with commercial presence in PEI for at least 2 continuous years.'
    });
  } else {
    disqualifications.push({
      criterion: 'EMPLOYER_TENURE_DEFICIENCY',
      reason: 'Employer must have an active commercial operation in Prince Edward Island for at least 2 consecutive years.'
    });
  }

  // 4. Work Experience Requirement (At least 1 year / 1,560 hours directly related within last 5 years)
  const requiredMonths = 12;
  if (expMonths >= requiredMonths) {
    criteria.push({
      criterion: 'DIRECT_WORK_EXPERIENCE',
      status: 'MET',
      details: `Applicant has ${expMonths} months of directly related work experience in the past 5 years (minimum: 12 months).`
    });
  } else {
    disqualifications.push({
      criterion: 'EXPERIENCE_DEFICIENCY',
      reason: `Applicant has ${expMonths} months of direct experience; statutory minimum is 12 months (1,560 hours) within the past 5 years.`
    });
  }

  // 5. Age Limits (18 to 59 years)
  if (age >= 18 && age <= 59) {
    criteria.push({
      criterion: 'AGE_ELIGIBILITY',
      status: 'MET',
      details: `Applicant age ${age} satisfies the PEI statutory window (18 to 59 years inclusive).`
    });
  } else {
    disqualifications.push({
      criterion: 'AGE_DISQUALIFICATION',
      reason: `Applicant age ${age} falls outside the eligible age range of 18 to 59 years.`
    });
  }

  // 6. Language Benchmark (Minimum CLB 4 across all abilities)
  const minRequiredClb = matchedNoc ? matchedNoc.minimumClb : 4;
  if (clb >= minRequiredClb) {
    criteria.push({
      criterion: 'OFFICIAL_LANGUAGE_PROFICIENCY',
      status: 'MET',
      details: `Language proficiency CLB ${clb} satisfies the minimum benchmark of CLB ${minRequiredClb} in English or French.`
    });
  } else {
    disqualifications.push({
      criterion: 'LANGUAGE_DEFICIENCY',
      reason: `Language proficiency CLB ${clb} does not meet the mandatory statutory minimum of CLB ${minRequiredClb}.`
    });
  }

  // 7. Education Requirement (High school diploma or ECA)
  if (highSchoolOrEca) {
    criteria.push({
      criterion: 'EDUCATION_CREDENTIAL',
      status: 'MET',
      details: 'Applicant holds an equivalent secondary school completion (high school) credential verified by ECA or Canadian schooling.'
    });
  } else {
    disqualifications.push({
      criterion: 'EDUCATION_DEFICIENCY',
      reason: 'Applicant must hold at least a secondary school (high school) diploma, verified by an approved Educational Credential Assessment (ECA) if foreign.'
    });
  }

  // 8. Settlement Funds Assessment
  const requiredFunds = PEI_SETTLEMENT_FUNDS_BASE_CAD + ((validFamilySize - 1) * PEI_ADDITIONAL_DEPENDENT_CAD);

  if (providedFunds >= requiredFunds) {
    criteria.push({
      criterion: 'SETTLEMENT_FUNDS',
      status: 'MET',
      details: `Settlement funds of $${providedFunds.toLocaleString()} CAD meet or exceed the PEI guideline threshold of $${requiredFunds.toLocaleString()} CAD for a family size of ${validFamilySize}.`
    });
  } else {
    riskWarnings.push({
      warning: 'INSUFFICIENT_SETTLEMENT_FUNDS',
      details: `Available liquid funds ($${providedFunds.toLocaleString()} CAD) are below the recommended guideline of $${requiredFunds.toLocaleString()} CAD for family of ${validFamilySize}. Proof of employment income may mitigate at officer discretion.`
    });
  }

  // 9. Intention to Reside & Status
  if (!intentToReside) {
    disqualifications.push({
      criterion: 'INTENT_TO_RESIDE_DEFICIENCY',
      reason: 'Statutory eligibility requires a bona fide intention to settle and establish economic residence in Prince Edward Island.'
    });
  }

  if (!validAuthorization) {
    riskWarnings.push({
      warning: 'NO_LEGAL_RESIDENT_STATUS',
      details: 'Applicant must maintain legal status in Canada if currently residing inside the country.'
    });
  }

  const isEligible = disqualifications.length === 0;

  return {
    candidateName: safeCandidateName,
    assessmentDate: safeAssessmentDate,
    stream: 'PEI_PNP_OCCUPATIONS_IN_DEMAND',
    targetNoc: matchedNoc || null,
    isEligible,
    eligibilityVerdict: isEligible
      ? 'ELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND_NOMINATION'
      : 'INELIGIBLE_FOR_PEI_OCCUPATIONS_IN_DEMAND',
    criteriaEvaluated: criteria,
    disqualifications,
    riskWarnings,
    financialAssessment: {
      familySize: validFamilySize,
      requiredSettlementFundsCad: requiredFunds,
      providedFundsCad: providedFunds,
      isFundsRequirementSatisfied: providedFunds >= requiredFunds
    },
    statutoryCitations: [
      'Prince Edward Island Provincial Nominee Program (PEI PNP) Occupations in Demand Guidelines',
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 8 (Federal-Provincial Agreements)',
      'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 87 (Provincial Nominee Class)'
    ]
  };
}
