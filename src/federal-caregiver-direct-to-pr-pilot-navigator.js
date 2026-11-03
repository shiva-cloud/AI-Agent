/**
 * Federal Caregiver Direct-to-PR Pilot Navigator
 *
 * Implements statutory assessment rules under:
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27, s. 14.1)
 * - Ministerial Instructions: Home Child Care Provider Pilot & Home Support Worker Pilot
 * - Enhanced 2024-2026 Direct-to-PR Caregiver Pathway Policies
 * - National Occupational Classification (NOC 44100 & 44101)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const CAREGIVER_ELIGIBLE_NOCS = Object.freeze({
  '44100': {
    noc: '44100',
    title: 'Home child care providers',
    targetRecipient: 'CHILDREN_UNDER_18',
    minimumClb: 4
  },
  '44101': {
    noc: '44101',
    title: 'Home support workers and related occupations',
    targetRecipient: 'SENIORS_OR_PERSONS_WITH_DISABILITIES',
    minimumClb: 4
  }
});

export const CAREGIVER_MINIMUM_CLB = 4;

export function evaluateCaregiverDirectToPr(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    nocCode = '44100',
    jobOfferFullTime = true, // At least 30 hrs/wk
    jobOfferNonSeasonal = true,
    jobOfferOutsideQuebec = true,
    employerType = 'PRIVATE_HOUSEHOLD', // 'PRIVATE_HOUSEHOLD' vs 'COMMERCIAL_FACILITY'
    careRecipientType = 'CHILDREN_UNDER_18', // 'CHILDREN_UNDER_18', 'SENIORS_65_PLUS', 'PERSON_WITH_DISABILITY'
    employerMeetsLicoIncomeTest = true,
    jobRequiresMandatoryLiveIn = false, // Strictly prohibited
    clbSpeaking = 4,
    clbListening = 4,
    clbReading = 4,
    clbWriting = 4,
    hasHighSchoolDiplomaOrEca = true,
    canadianCaregiverExperienceMonths = 0, // 0 for direct job offer stream, or >= 6 months
    hasValidLegalStatusInCanada = true,
    applicantLocation = 'IN_CANADA', // 'IN_CANADA' or 'OUTSIDE_CANADA'
    applicantName = 'Applicant',
    assessmentDate = todayIso()
  } = safeParams;

  const safeApplicantName = boundedText(applicantName, 120) || 'Applicant';
  const safeAssessmentDate = safeIsoDate(assessmentDate);
  const normalizedNoc = boundedText(nocCode, 10);
  const safeEmployerType = boundedText(employerType, 50) || 'PRIVATE_HOUSEHOLD';
  const safeCareRecipientType = boundedText(careRecipientType, 50) || 'CHILDREN_UNDER_18';
  const safeApplicantLocation = boundedText(applicantLocation, 30) || 'IN_CANADA';

  const fullTimeOffer = Boolean(jobOfferFullTime);
  const nonSeasonalOffer = Boolean(jobOfferNonSeasonal);
  const outsideQuebecOffer = Boolean(jobOfferOutsideQuebec);
  const licoPassed = Boolean(employerMeetsLicoIncomeTest);
  const mandatoryLiveIn = Boolean(jobRequiresMandatoryLiveIn);
  const highSchoolOrEca = Boolean(hasHighSchoolDiplomaOrEca);
  const validLegalStatus = Boolean(hasValidLegalStatusInCanada);

  const matchedNoc = CAREGIVER_ELIGIBLE_NOCS[normalizedNoc] || null;

  const criteriaEvaluated = [];
  const disqualifications = [];
  const riskWarnings = [];

  // 1. NOC Code Eligibility (NOC 44100 or 44101)
  if (matchedNoc) {
    criteriaEvaluated.push({
      criterion: 'ELIGIBLE_CAREGIVER_NOC',
      status: 'MET',
      details: `NOC ${matchedNoc.noc} (${matchedNoc.title}) is an authorized occupation under the Caregiver Pilots.`
    });
  } else {
    disqualifications.push({
      criterion: 'INELIGIBLE_NOC_CODE',
      reason: `NOC ${normalizedNoc || 'UNSPECIFIED'} is not eligible. The Caregiver Pilot is strictly restricted to NOC 44100 (Child care) and NOC 44101 (Home support).`
    });
  }

  // 2. Private Household Employer Criteria
  if (safeEmployerType === 'PRIVATE_HOUSEHOLD') {
    criteriaEvaluated.push({
      criterion: 'PRIVATE_HOUSEHOLD_EMPLOYER',
      status: 'MET',
      details: 'Job offer is situated in a private household residence.'
    });
  } else {
    disqualifications.push({
      criterion: 'COMMERCIAL_EMPLOYER_PROHIBITION',
      reason: 'Job offer cannot be from a commercial business, day care centre, or nursing facility; it must be from an individual or private household employer.'
    });
  }

  // 3. Genuine Care Recipient Alignment
  if (matchedNoc) {
    if (matchedNoc.noc === '44100' && safeCareRecipientType !== 'CHILDREN_UNDER_18') {
      disqualifications.push({
        criterion: 'RECIPIENT_MISMATCH',
        reason: 'NOC 44100 (Home child care provider) requires care of children under 18 years of age.'
      });
    } else if (matchedNoc.noc === '44101' && safeCareRecipientType === 'CHILDREN_UNDER_18') {
      disqualifications.push({
        criterion: 'RECIPIENT_MISMATCH',
        reason: 'NOC 44101 (Home support worker) requires care of seniors (65+) or individuals with physical/mental disability.'
      });
    } else {
      criteriaEvaluated.push({
        criterion: 'QUALIFYING_CARE_RECIPIENT',
        status: 'MET',
        details: `Care recipient category (${safeCareRecipientType}) aligns with target NOC ${matchedNoc.noc}.`
      });
    }
  }

  // 4. Job Offer Characteristics (Full-time, non-seasonal, outside Quebec)
  if (fullTimeOffer && nonSeasonalOffer && outsideQuebecOffer) {
    criteriaEvaluated.push({
      criterion: 'QUALIFYING_JOB_OFFER',
      status: 'MET',
      details: 'Job offer is genuine, full-time (30+ hrs/wk), non-seasonal, and outside the province of Quebec.'
    });
  } else {
    if (!fullTimeOffer || !nonSeasonalOffer) {
      disqualifications.push({
        criterion: 'JOB_HOURS_DEFICIENCY',
        reason: 'The offer must be full-time (at least 30 hours per week) and non-seasonal.'
      });
    }
    if (!outsideQuebecOffer) {
      disqualifications.push({
        criterion: 'QUEBEC_JURISDICTION_EXCLUSION',
        reason: 'The Federal Caregiver Pilot excludes employment destinations within the province of Quebec.'
      });
    }
  }

  // 5. Employer Financial Ability (LICO threshold)
  if (licoPassed) {
    criteriaEvaluated.push({
      criterion: 'EMPLOYER_FINANCIAL_ABILITY',
      status: 'MET',
      details: 'Household employer meets the financial ability / Notice of Assessment income threshold.'
    });
  } else {
    disqualifications.push({
      criterion: 'EMPLOYER_INSUFFICIENT_INCOME',
      reason: 'The hiring household must demonstrate sufficient gross income (via CRA Notice of Assessment) to support paying prevailing wages.'
    });
  }

  // 6. Prohibition Against Mandatory Live-in (IRCC Policy)
  if (mandatoryLiveIn) {
    riskWarnings.push({
      warning: 'PROHIBITED_MANDATORY_LIVE_IN_CONDITION',
      details: 'Employers are strictly prohibited by federal policy from requiring caregivers to live in the home. Caregivers must be free to choose whether to live in or live out.'
    });
  }

  // 7. Language Proficiency (Minimum CLB 4 across all 4 abilities)
  const spk = Number.isFinite(Number(clbSpeaking)) ? Math.min(12, Math.max(0, Math.floor(Number(clbSpeaking)))) : 0;
  const lis = Number.isFinite(Number(clbListening)) ? Math.min(12, Math.max(0, Math.floor(Number(clbListening)))) : 0;
  const rd = Number.isFinite(Number(clbReading)) ? Math.min(12, Math.max(0, Math.floor(Number(clbReading)))) : 0;
  const wr = Number.isFinite(Number(clbWriting)) ? Math.min(12, Math.max(0, Math.floor(Number(clbWriting)))) : 0;
  const minScore = Math.min(spk, lis, rd, wr);

  if (minScore >= CAREGIVER_MINIMUM_CLB) {
    criteriaEvaluated.push({
      criterion: 'OFFICIAL_LANGUAGE_BENCHMARK',
      status: 'MET',
      details: `Language scores (Speaking: ${spk}, Listening: ${lis}, Reading: ${rd}, Writing: ${wr}) satisfy minimum CLB ${CAREGIVER_MINIMUM_CLB}.`
    });
  } else {
    disqualifications.push({
      criterion: 'LANGUAGE_BENCHMARK_UNSATISFIED',
      reason: `Applicant must achieve at least CLB ${CAREGIVER_MINIMUM_CLB} in each of the four language skills; lowest score is CLB ${minScore}.`
    });
  }

  // 8. Education Requirement (High school diploma or ECA)
  if (highSchoolOrEca) {
    criteriaEvaluated.push({
      criterion: 'EDUCATION_CREDENTIAL',
      status: 'MET',
      details: 'Applicant possesses an educational credential equivalent to a Canadian secondary school diploma.'
    });
  } else {
    disqualifications.push({
      criterion: 'EDUCATION_DEFICIENCY',
      reason: 'Applicant must hold a Canadian high school diploma or foreign equivalent verified by an Educational Credential Assessment (ECA).'
    });
  }

  // 9. Legal Status (if in Canada)
  if (safeApplicantLocation === 'IN_CANADA' && !validLegalStatus) {
    disqualifications.push({
      criterion: 'LACK_OF_LEGAL_STATUS_IN_CANADA',
      reason: 'Applicants residing within Canada must hold valid temporary resident status or maintained status.'
    });
  }

  const isEligible = disqualifications.length === 0;

  return {
    applicantName: safeApplicantName,
    assessmentDate: safeAssessmentDate,
    stream: 'FEDERAL_CAREGIVER_DIRECT_TO_PR_PILOT',
    targetNoc: matchedNoc || null,
    isEligible,
    eligibilityVerdict: isEligible
      ? 'ELIGIBLE_FOR_CAREGIVER_DIRECT_TO_PR'
      : 'INELIGIBLE_FOR_CAREGIVER_PILOT',
    criteriaEvaluated,
    disqualifications,
    riskWarnings,
    experienceCategory: (Number.isFinite(Number(canadianCaregiverExperienceMonths)) ? Math.max(0, Math.floor(Number(canadianCaregiverExperienceMonths))) : 0) >= 6
      ? 'DIRECT_PR_WITH_CANADIAN_EXPERIENCE'
      : 'DIRECT_PR_WITH_QUALIFYING_JOB_OFFER',
    statutoryCitations: [
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 14.1',
      'Ministerial Instructions: Home Child Care Provider Pilot and Home Support Worker Pilot',
      'Enhanced Direct-to-PR Caregiver Pilots Operational Guidelines (2024–2026)'
    ]
  };
}
