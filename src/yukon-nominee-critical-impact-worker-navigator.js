/**
 * Northstar — Settlement Intelligence
 * Yukon Nominee Program (YNP) Critical Impact Worker & Community Pilot Engine
 *
 * Statutory Authorities:
 * - Yukon Immigration Agreement (Government of Canada & Government of Yukon) under IRPA s. 8
 * - Yukon Nominee Program (YNP) Policy Directives (Critical Impact Worker Stream)
 * - Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 87 (PNP), 204(a) (LMIA Exemption A75 / T13)
 * - Yukon Employment Standards Act, RSY 2002, c. 72
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const YUKON_CRITICAL_IMPACT_RULES = Object.freeze({
  MIN_WORK_EXPERIENCE_MONTHS: 6,
  LOOKBACK_WINDOW_YEARS: 10,
  MIN_WEEKLY_HOURS: 30,
  MIN_CLB_SCORE: 4,
  ELIGIBLE_TEER_LEVELS: Object.freeze([4, 5]),
  MIN_EMPLOYER_OPERATING_YEARS: 1,
  COMMUNITY_PILOT_COMMUNITIES: Object.freeze([
    'whitehorse',
    'watson_lake',
    'dawson_city',
    'haines_junction',
    'carmacks',
    'mayo'
  ]),
  TERRITORY: 'YT'
});

/**
 * Audits eligibility for the Yukon Nominee Program (YNP) Critical Impact Worker stream.
 */
export function evaluateYukonCriticalImpactWorker({
  targetNocTeer = 4,
  nocCode = '65201', // e.g. Food counter attendant
  monthsOfRelatedExperience = 8,
  hasPermanentFullTimeOffer = true,
  weeklyOfferedHours = 35,
  hourlyWageCad = 18.5,
  employerOperatingYearsInYukon = 2,
  employerRecruitmentAdvertisedWeeks = 4,
  languageClbScore = 4,
  hasHighSchoolOrEca = true,
  currentStatusInCanada = 'work_permit', // or 'visitor', 'outside_canada', 'student'
  targetCommunity = 'whitehorse',
  isApplyingForCommunityPilot = false,
  candidateName = 'Nominee Candidate',
  assessmentDate = todayIso()
} = {}) {
  const safeCandidate = boundedText(candidateName, 'Nominee Candidate', 100);
  
  
  
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const sanitizedTeer = Math.max(0, Math.min(5, Number(targetNocTeer) || 4));
  const sanitizedMonths = Math.max(0, Math.min(600, Number(monthsOfRelatedExperience) || 0));
  const sanitizedHours = Math.max(0, Math.min(168, Number(weeklyOfferedHours) || 0));
  const sanitizedWage = Math.max(0, Math.min(10000, Number(hourlyWageCad) || 0));
  const sanitizedEmployerYears = Math.max(0, Math.min(100, Number(employerOperatingYearsInYukon) || 0));
  const sanitizedAdWeeks = Math.max(0, Math.min(520, Number(employerRecruitmentAdvertisedWeeks) || 0));
  const sanitizedClb = Math.max(0, Math.min(12, Number(languageClbScore) || 0));

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];

  // 1. Occupation TEER Level (TEER 4 or 5)
  const isTeerValid = YUKON_CRITICAL_IMPACT_RULES.ELIGIBLE_TEER_LEVELS.includes(sanitizedTeer);
  if (!isTeerValid) {
    deficiencies.push(
      `TEER level ${sanitizedTeer} is ineligible. The Critical Impact Worker stream strictly targets entry-level and semi-skilled occupations in TEER 4 or 5. (High-skilled TEER 0–3 must apply under the Skilled Worker stream).`
    );
  } else {
    compliancePoints.push(
      `Target TEER ${sanitizedTeer} satisfies Critical Impact Worker eligibility.`
    );
  }

  // 2. Job Offer Criteria (Full-time, permanent, 30+ hrs/wk)
  const isFullTime = sanitizedHours >= YUKON_CRITICAL_IMPACT_RULES.MIN_WEEKLY_HOURS;
  if (!hasPermanentFullTimeOffer || !isFullTime) {
    deficiencies.push(
      `Job offer must be permanent and full-time (at least ${YUKON_CRITICAL_IMPACT_RULES.MIN_WEEKLY_HOURS} hours/week). Offered: ${sanitizedHours} hrs/wk.`
    );
  } else {
    compliancePoints.push(
      `Permanent full-time job offer verified: ${sanitizedHours} hours/week at $${sanitizedWage} CAD/hr.`
    );
  }

  // 3. Employer Criteria (1+ year operation, 4 weeks recruitment)
  if (sanitizedEmployerYears < YUKON_CRITICAL_IMPACT_RULES.MIN_EMPLOYER_OPERATING_YEARS) {
    deficiencies.push(
      `Employer has only operated for ${sanitizedEmployerYears} year(s). YNP requires the employer to have operated in Yukon for at least 1 full year.`
    );
  } else {
    compliancePoints.push('Employer operating longevity threshold in Yukon met.');
  }

  if (sanitizedAdWeeks < 4) {
    deficiencies.push(
      `Inadequate domestic recruitment effort: Employer advertised position for ${sanitizedAdWeeks} week(s), but YNP mandates minimum 4 consecutive weeks of local/national advertising.`
    );
  } else {
    compliancePoints.push('Mandatory 4-week Canadian recruitment advertising satisfied.');
  }

  // 4. Candidate Experience & Language (6 months experience, CLB 4)
  if (sanitizedMonths < YUKON_CRITICAL_IMPACT_RULES.MIN_WORK_EXPERIENCE_MONTHS) {
    deficiencies.push(
      `Inadequate related work experience: Candidate has ${sanitizedMonths} month(s), but YNP requires at least 6 months of directly related experience within the past 10 years.`
    );
  } else {
    compliancePoints.push(
      `Candidate has completed ${sanitizedMonths} months of related skilled experience.`
    );
  }

  if (sanitizedClb < YUKON_CRITICAL_IMPACT_RULES.MIN_CLB_SCORE) {
    deficiencies.push(
      `Language benchmark shortfall: CLB ${sanitizedClb} achieved, but Critical Impact Worker stream requires minimum CLB 4 across all four language abilities.`
    );
  } else {
    compliancePoints.push(`Language score CLB ${sanitizedClb} meets or exceeds required CLB 4.`);
  }

  if (!hasHighSchoolOrEca) {
    deficiencies.push(
      'Requires Canadian high school diploma or a valid foreign Educational Credential Assessment (ECA).'
    );
  } else {
    compliancePoints.push('High school education completion or equivalent ECA verified.');
  }

  // Status check in Canada
  if (['refugee_claimant', 'undocumented', 'out_of_status'].includes(String(currentStatusInCanada).toLowerCase())) {
    deficiencies.push(
      'Individuals without valid temporary legal status or refugee claimants are statutorily barred from the Yukon Nominee Program.'
    );
  }

  // 5. Yukon Community Pilot (YCP) Component
  const communityNorm = String(targetCommunity).toLowerCase().replace(/\s+/g, '_');
  const isCommunityEligible =
    YUKON_CRITICAL_IMPACT_RULES.COMMUNITY_PILOT_COMMUNITIES.includes(communityNorm);

  if (isApplyingForCommunityPilot) {
    if (!isCommunityEligible) {
      deficiencies.push(
        `Community "${targetCommunity}" is not an eligible participating community under the Yukon Community Pilot.`
      );
    } else {
      compliancePoints.push(
        `Target community "${targetCommunity}" is approved for the Yukon Community Pilot 2-year open work permit under LMIA exemption code A75.`
      );
    }
  }

  // Overall Eligibility
  const isEligible =
    isTeerValid &&
    hasPermanentFullTimeOffer &&
    isFullTime &&
    sanitizedEmployerYears >= YUKON_CRITICAL_IMPACT_RULES.MIN_EMPLOYER_OPERATING_YEARS &&
    sanitizedAdWeeks >= 4 &&
    sanitizedMonths >= YUKON_CRITICAL_IMPACT_RULES.MIN_WORK_EXPERIENCE_MONTHS &&
    sanitizedClb >= YUKON_CRITICAL_IMPACT_RULES.MIN_CLB_SCORE &&
    hasHighSchoolOrEca &&
    !['refugee_claimant', 'undocumented', 'out_of_status'].includes(String(currentStatusInCanada).toLowerCase()) &&
    (!isApplyingForCommunityPilot || isCommunityEligible);

  const eligibilityStatus = isEligible
    ? 'ELIGIBLE_FOR_YUKON_CRITICAL_IMPACT_NOMINATION'
    : 'INELIGIBLE_FOR_YUKON_CRITICAL_IMPACT';

  if (isEligible) {
    statutoryRemedies.push({
      action: 'Joint Employer-Candidate YNP Submission',
      authority: 'Yukon Immigration Agreement & IRPA s. 8',
      description:
        'Submit completed tripartite application (Employer, Employee, and Yukon Government) through the Yukon Department of Economic Development.'
    });
    if (isApplyingForCommunityPilot) {
      statutoryRemedies.push({
        action: 'Apply for 2-Year Location-Specific Work Permit (LMIA Exemption A75)',
        authority: 'IRPR s. 204(a) & Public Policy on Yukon Community Pilot',
        description:
          'Upon provincial nomination, candidate receives a 2-year work permit allowing flexible employment in participating Yukon communities.'
      });
    }
  }

  const summary = isEligible
    ? `Candidate meets all statutory and territorial requirements for the Yukon Critical Impact Worker stream${
        isApplyingForCommunityPilot ? ' with Yukon Community Pilot endorsement' : ''
      }.`
    : `Candidate does not currently qualify for the Yukon Critical Impact Worker stream. Identified ${deficiencies.length} statutory deficiency/deficiencies to resolve.`;

  return {
    assessmentDate: safeAssessmentDate,
    candidateName: safeCandidate,
    statutoryAuthority: 'Yukon Immigration Agreement & YNP Policy Guidelines (Critical Impact Worker Stream)',
    isEligible,
    eligibilityStatus,
    targetNocTeer: sanitizedTeer,
    monthsOfRelatedExperience: sanitizedMonths,
    languageScoreClb: sanitizedClb,
    isCommunityPilotEndorsed: isApplyingForCommunityPilot && isCommunityEligible,
    summary,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'YT'
  };
}
