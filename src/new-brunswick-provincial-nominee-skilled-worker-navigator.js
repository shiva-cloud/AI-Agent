/**
 * New Brunswick Provincial Nominee Program (NBPNP) Skilled Worker Stream Navigator
 *
 * Implements statutory assessment rules under:
 * - New Brunswick Immigration Act, SNB 2019, c. 25
 * - NBPNP Skilled Worker Stream Policy and Guide
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27, s. 8)
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227, s. 87)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

import { factTable } from './kb-facts.js';

export const NBPNP_PASS_MARK_POINTS = 60;
export const NBPNP_MAX_POINTS = 100;

// Express Entry settlement funds from src/kb-facts.js (same table as src/proof-of-funds.js).
export const NB_SETTLEMENT_FUNDS_2026 = factTable('ca.expressEntry.settlementFundsCad');

export function calculateNbpnpSettlementFunds(familySize = 1) {
  const size = Math.max(1, Math.min(20, Math.floor(Number(familySize) || 1)));
  if (size <= 7) {
    return NB_SETTLEMENT_FUNDS_2026[size];
  }
  return NB_SETTLEMENT_FUNDS_2026[7] + ((size - 7) * NB_SETTLEMENT_FUNDS_2026.additionalPerPerson);
}

export function evaluateNbpnpSkilledWorker(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantAge = 30,
    targetNocTeer = 2,
    firstLanguageClb = 7,
    hasSecondOfficialLanguageClb5Plus = false,
    educationLevel = 'BACHELORS', // 'HIGH_SCHOOL', 'ONE_YEAR_POST_SEC', 'TWO_YEAR_POST_SEC', 'BACHELORS', 'MASTERS_OR_PHD'
    yearsOfRelatedExperience = 3,
    hasPermanentFullTimeJobOfferInNb = true,
    employerOperatedTwoYearsInNb = true,
    jobOfferWageMeetsMedian = true,
    currentlyWorkingInNb = false,
    liquidFundsCad = 15000,
    familySize = 1,
    adaptabilityFactors = {
      spouseClb5Plus: false,
      previousNbStudyYears: 0,
      previousNbWorkYears: 0,
      hasCloseFamilyInNb: false
    },
    intendsToResideInNb = true,
    candidateName = 'Candidate',
    assessmentDate = todayIso()
  } = safeParams;

  const safeCandidateName = boundedText(candidateName, 'Candidate', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const age = Math.max(0, Math.min(120, Math.floor(Number(applicantAge) || 0)));
  const teer = Math.max(0, Math.min(5, Math.floor(Number(targetNocTeer) || 0)));
  const clb = Math.max(0, Math.min(12, Math.floor(Number(firstLanguageClb) || 0)));
  const expYears = Math.max(0, Math.min(50, Math.floor(Number(yearsOfRelatedExperience) || 0)));
  const funds = Math.max(0, Math.min(1000000000, Number(liquidFundsCad) || 0));
  const size = Math.max(1, Math.min(20, Math.floor(Number(familySize) || 1)));
  const hasSecondLang = Boolean(hasSecondOfficialLanguageClb5Plus);
  const hasJobOffer = Boolean(hasPermanentFullTimeJobOfferInNb);
  const employerTwoYears = Boolean(employerOperatedTwoYearsInNb);
  const wageMeetsMedian = Boolean(jobOfferWageMeetsMedian);
  const workingInNb = Boolean(currentlyWorkingInNb);
  const intentToReside = Boolean(intendsToResideInNb);

  const disqualifications = [];
  const riskWarnings = [];
  const pointsBreakdown = {};

  // 1. Age Factor (Max 10 points)
  let agePoints = 0;
  if (age >= 22 && age <= 55) {
    agePoints = 10;
  } else if (age >= 19 && age <= 21) {
    agePoints = 5;
  } else {
    agePoints = 0;
    disqualifications.push({
      criterion: 'AGE_INELIGIBILITY',
      reason: `Applicant age ${age} is outside the statutory eligibility range of 19 to 55 years.`
    });
  }
  pointsBreakdown.age = agePoints;

  // 2. Language Factor (Max 28 points)
  // Check minimum threshold first: TEER 0-3 needs CLB 5; TEER 4-5 needs CLB 4
  const minRequiredClb = (teer >= 0 && teer <= 3) ? 5 : 4;
  if (clb < minRequiredClb) {
    disqualifications.push({
      criterion: 'LANGUAGE_THRESHOLD_BREACH',
      reason: `Target NOC TEER ${teer} requires minimum CLB ${minRequiredClb}; applicant has CLB ${clb}.`
    });
  }

  let langPoints = 0;
  if (clb >= 9) {
    langPoints = 24;
  } else if (clb === 8) {
    langPoints = 20;
  } else if (clb === 7) {
    langPoints = 16;
  } else if (clb === 6) {
    langPoints = 12;
  } else if (clb === 5) {
    langPoints = 8;
  } else if (clb === 4 && teer >= 4) {
    langPoints = 6;
  }

  if (hasSecondLang) {
    langPoints += 4;
  }
  pointsBreakdown.language = Math.min(28, langPoints);

  // 3. Education Factor (Max 20 points)
  let eduPoints = 0;
  switch (boundedText(educationLevel, 'BACHELORS', 40).toUpperCase()) {
    case 'MASTERS_OR_PHD':
      eduPoints = 20;
      break;
    case 'BACHELORS':
      eduPoints = 18;
      break;
    case 'TWO_YEAR_POST_SEC':
      eduPoints = 16;
      break;
    case 'ONE_YEAR_POST_SEC':
      eduPoints = 14;
      break;
    case 'HIGH_SCHOOL':
      eduPoints = 10;
      break;
    default:
      eduPoints = 0;
      disqualifications.push({
        criterion: 'EDUCATION_DEFICIENCY',
        reason: 'Applicant must have at least secondary school (high school) completion with Canadian equivalency.'
      });
  }
  pointsBreakdown.education = eduPoints;

  // 4. Work Experience Factor (Max 20 points)
  let expPoints = 0;
  if (expYears >= 6) {
    expPoints = 20;
  } else if (expYears >= 4) {
    expPoints = 16;
  } else if (expYears >= 2) {
    expPoints = 12;
  } else if (expYears >= 1) {
    expPoints = 8;
  } else {
    expPoints = 0;
    disqualifications.push({
      criterion: 'WORK_EXPERIENCE_DEFICIENCY',
      reason: `Applicant has ${expYears} years of experience; minimum 1 continuous full-time year (1,560 hours) required.`
    });
  }
  pointsBreakdown.workExperience = expPoints;

  // 5. Job Offer in New Brunswick (Max 10 points)
  let jobOfferPoints = 0;
  if (hasJobOffer && employerTwoYears && wageMeetsMedian) {
    jobOfferPoints = 10;
  } else {
    if (!hasJobOffer) {
      disqualifications.push({
        criterion: 'MANDATORY_JOB_OFFER_MISSING',
        reason: 'Applicant must hold a genuine, permanent, full-time non-seasonal job offer from an eligible New Brunswick employer.'
      });
    }
    if (!employerTwoYears) {
      disqualifications.push({
        criterion: 'EMPLOYER_TENURE_DEFICIENCY',
        reason: 'The hiring employer must have operated actively in New Brunswick for at least 2 consecutive years.'
      });
    }
    if (!wageMeetsMedian) {
      disqualifications.push({
        criterion: 'SUB_MEDIAN_WAGE_RATE',
        reason: 'The offered wage must meet or exceed the provincial median wage for the occupation in New Brunswick.'
      });
    }
  }
  pointsBreakdown.jobOffer = jobOfferPoints;

  // 6. Adaptability Factor (Max 12 points)
  let adaptPoints = 0;
  const adapt = adaptabilityFactors || {};
  if (adapt.spouseClb5Plus) adaptPoints += 5;
  if (Math.max(0, Math.min(20, Math.floor(Number(adapt.previousNbStudyYears) || 0))) >= 2) adaptPoints += 5;
  if (Math.max(0, Math.min(50, Math.floor(Number(adapt.previousNbWorkYears) || 0))) >= 1) adaptPoints += 5;
  if (adapt.hasCloseFamilyInNb) adaptPoints += 5;

  pointsBreakdown.adaptability = Math.min(12, adaptPoints);

  // Total Points Calculation
  const totalPoints = pointsBreakdown.age +
    pointsBreakdown.language +
    pointsBreakdown.education +
    pointsBreakdown.workExperience +
    pointsBreakdown.jobOffer +
    pointsBreakdown.adaptability;

  if (totalPoints < NBPNP_PASS_MARK_POINTS) {
    disqualifications.push({
      criterion: 'POINTS_GRID_DEFICIENCY',
      reason: `Total score of ${totalPoints} points is below the statutory pass mark of ${NBPNP_PASS_MARK_POINTS} out of ${NBPNP_MAX_POINTS} points.`
    });
  }

  // 7. Settlement Funds Requirement
  const requiredFunds = calculateNbpnpSettlementFunds(size);
  if (!workingInNb && funds < requiredFunds) {
    disqualifications.push({
      criterion: 'INSUFFICIENT_SETTLEMENT_FUNDS',
      reason: `Applicant is not currently working in NB and available liquid funds ($${funds.toLocaleString()} CAD) fall below the statutory threshold of $${requiredFunds.toLocaleString()} CAD for family size ${size}.`
    });
  } else if (workingInNb) {
    riskWarnings.push({
      warning: 'SETTLEMENT_FUNDS_EXEMPTION_APPLIED',
      details: 'Applicant is currently employed in NB under valid authorization; statutory settlement funds requirement is waived.'
    });
  }

  // 8. Intent to Reside
  if (!intentToReside) {
    disqualifications.push({
      criterion: 'INTENT_TO_RESIDE_FAILURE',
      reason: 'Applicant must demonstrate a genuine intention to live and establish permanent residence in New Brunswick.'
    });
  }

  const isEligible = disqualifications.length === 0;

  return {
    stream: 'NBPNP_SKILLED_WORKER',
    candidateName: safeCandidateName,
    assessmentDate: safeAssessmentDate,
    isEligible,
    eligibilityVerdict: isEligible
      ? 'ELIGIBLE_FOR_NBPNP_SKILLED_WORKER_NOMINATION'
      : 'INELIGIBLE_FOR_NBPNP_SKILLED_WORKER',
    pointsSummary: {
      totalPoints,
      passMark: NBPNP_PASS_MARK_POINTS,
      maxPoints: NBPNP_MAX_POINTS,
      isPassMarkSatisfied: totalPoints >= NBPNP_PASS_MARK_POINTS,
      breakdown: pointsBreakdown
    },
    settlementFundsAudit: {
      isExemptDueToCurrentNbEmployment: workingInNb,
      familySize: size,
      requiredFundsCad: workingInNb ? 0 : requiredFunds,
      providedFundsCad: funds,
      hasSufficientFunds: workingInNb || funds >= requiredFunds
    },
    disqualifications,
    riskWarnings,
    statutoryCitations: [
      'New Brunswick Immigration Act, SNB 2019, c. 25',
      'New Brunswick Provincial Nominee Program (NBPNP) Skilled Worker Stream Guide',
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 8',
      'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 87'
    ]
  };
}
