/**
 * Federal Self-Employed Persons Program Navigator
 *
 * Implements statutory assessment rules under:
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27, s. 12(2))
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227):
 *   - Section 88(1): Definition of Self-Employed Person, Relevant Experience, Cultural Activities, Athletics
 *   - Section 100: Selection Criteria and Point System (35-point statutory pass mark)
 *   - Section 101: Selection Criteria Breakdown (Education, Experience, Age, Language, Adaptability)
 * - IRCC Ministerial Instructions: Temporary Intake Pause through end of 2026
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const SELF_EMPLOYED_PASS_MARK_POINTS = 35;
export const SELF_EMPLOYED_MAX_POINTS = 100;

export const ELIGIBLE_ACTIVITIES = Object.freeze({
  CULTURAL_ACTIVITIES: 'CULTURAL_ACTIVITIES',
  ATHLETICS: 'ATHLETICS'
});

export function evaluateSelfEmployedProgram(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const applicantName = boundedText(safeParams.applicantName, 'Self-Employed Applicant', 100);
  const assessmentDate = safeIsoDate(safeParams.assessmentDate, todayIso());
  const activityType = boundedText(safeParams.activityType, 'CULTURAL_ACTIVITIES', 50).toUpperCase();
  const selfExp = Number.isFinite(Number(safeParams.yearsOfSelfEmployedExperience)) ? Math.max(0, Math.min(50, Number(safeParams.yearsOfSelfEmployedExperience))) : 3;
  const worldExp = Number.isFinite(Number(safeParams.yearsOfWorldClassParticipation)) ? Math.max(0, Math.min(50, Number(safeParams.yearsOfWorldClassParticipation))) : 0;
  const educationLevel = boundedText(safeParams.educationLevel, 'BACHELORS', 50).toUpperCase();
  const age = Number.isFinite(Number(safeParams.applicantAge)) ? Math.max(0, Math.min(120, Math.floor(Number(safeParams.applicantAge)))) : 32;
  const clb1 = Number.isFinite(Number(safeParams.firstOfficialLanguageClb)) ? Math.max(0, Math.min(12, Math.floor(Number(safeParams.firstOfficialLanguageClb)))) : 7;
  const clb2 = Number.isFinite(Number(safeParams.secondOfficialLanguageClb)) ? Math.max(0, Math.min(12, Math.floor(Number(safeParams.secondOfficialLanguageClb)))) : 0;
  const rawAdapt = safeParams.adaptabilityFactors || {};
  const adaptabilityFactors = {
    spouseEducationLevel: boundedText(rawAdapt.spouseEducationLevel, 'BACHELORS', 50).toUpperCase(),
    previousCanadianStudyYears: Number.isFinite(Number(rawAdapt.previousCanadianStudyYears)) ? Math.max(0, Math.min(50, Number(rawAdapt.previousCanadianStudyYears))) : 0,
    previousCanadianWorkYears: Number.isFinite(Number(rawAdapt.previousCanadianWorkYears)) ? Math.max(0, Math.min(50, Number(rawAdapt.previousCanadianWorkYears))) : 0,
    hasCloseRelativeInCanada: Boolean(rawAdapt.hasCloseRelativeInCanada)
  };
  const intendsAndAbleToBeSelfEmployed = safeParams.intendsAndAbleToBeSelfEmployed !== false;
  const willMakeSignificantContributionToCanada = safeParams.willMakeSignificantContributionToCanada !== false;
  
  

  const disqualifications = [];
  const riskWarnings = [];
  const pointsBreakdown = {};

  // 1. Relevant Experience Definition (IRPR s. 88(1))
  // Must have at least 2 one-year periods within the 5 years before applying:
  // - 2 years of self-employment; OR
  // - 2 years of world-class participation; OR
  // - 1 year of self-employment + 1 year of world-class participation.
  const totalQualifyingYears = selfExp + worldExp;

  const hasTwoQualifyingYears = (selfExp >= 2) || (worldExp >= 2) || (selfExp >= 1 && worldExp >= 1);

  if (!hasTwoQualifyingYears) {
    disqualifications.push({
      criterion: 'RELEVANT_EXPERIENCE_SHORTFALL',
      reason: `IRPR s. 88(1) requires at least two 1-year periods of relevant self-employment or world-class participation in ${activityType} within the past 5 years.`
    });
  }

  // 2. Points Grid: Factor 1 - Experience (IRPR s. 101, max 35 points)
  let expPoints = 0;
  if (totalQualifyingYears >= 5) {
    expPoints = 35;
  } else if (totalQualifyingYears === 4) {
    expPoints = 30;
  } else if (totalQualifyingYears === 3) {
    expPoints = 25;
  } else if (totalQualifyingYears === 2) {
    expPoints = 20;
  } else {
    expPoints = 0;
  }
  pointsBreakdown.experience = expPoints;

  // 3. Points Grid: Factor 2 - Education (IRPR s. 101, max 25 points)
  let eduPoints = 0;
  switch (String(educationLevel).toUpperCase()) {
    case 'MASTERS_OR_PHD':
      eduPoints = 25;
      break;
    case 'BACHELORS':
    case 'THREE_YEAR_POST_SEC':
      eduPoints = 20; // 2 or 3-year university degree / credential
      break;
    case 'TWO_YEAR_DIPLOMA':
      eduPoints = 15;
      break;
    case 'ONE_YEAR_DIPLOMA':
      eduPoints = 12;
      break;
    case 'HIGH_SCHOOL':
      eduPoints = 5;
      break;
    default:
      eduPoints = 0;
  }
  pointsBreakdown.education = eduPoints;

  // 4. Points Grid: Factor 3 - Age (IRPR s. 101, max 10 points)
  let agePoints = 0;
  if (age >= 21 && age <= 49) {
    agePoints = 10;
  } else if (age === 20 || age === 50) {
    agePoints = 8;
  } else if (age === 19 || age === 51) {
    agePoints = 6;
  } else if (age === 18 || age === 52) {
    agePoints = 4;
  } else if (age === 17 || age === 53) {
    agePoints = 2;
  } else {
    agePoints = 0;
  }
  pointsBreakdown.age = agePoints;

  // 5. Points Grid: Factor 4 - Language (IRPR s. 101, max 24 points)
  let lang1Points = 0;
  if (clb1 >= 8) {
    lang1Points = 16;
  } else if (clb1 >= 6) {
    lang1Points = 12;
  } else if (clb1 >= 4) {
    lang1Points = 8;
  }

  let lang2Points = 0;
  if (clb2 >= 6) {
    lang2Points = 8;
  } else if (clb2 >= 4) {
    lang2Points = 4;
  }

  pointsBreakdown.language = Math.min(24, lang1Points + lang2Points);

  // 6. Points Grid: Factor 5 - Adaptability (IRPR s. 101, max 6 points)
  let adaptPoints = 0;
  const adapt = adaptabilityFactors;
  if (adapt.spouseEducationLevel === 'POST_SECONDARY') {
    adaptPoints += 4;
  } else if (adapt.spouseEducationLevel === 'SECONDARY') {
    adaptPoints += 3;
  }
  if ((Number(adapt.previousCanadianStudyYears) || 0) >= 2) adaptPoints += 5;
  if ((Number(adapt.previousCanadianWorkYears) || 0) >= 1) adaptPoints += 5;
  if (adapt.hasCloseRelativeInCanada) adaptPoints += 5;

  pointsBreakdown.adaptability = Math.min(6, adaptPoints);

  // Total Points Calculation
  const totalPoints = pointsBreakdown.experience +
    pointsBreakdown.education +
    pointsBreakdown.age +
    pointsBreakdown.language +
    pointsBreakdown.adaptability;

  if (totalPoints < SELF_EMPLOYED_PASS_MARK_POINTS) {
    disqualifications.push({
      criterion: 'SELECTION_GRID_PASS_MARK_FAILURE',
      reason: `Total score of ${totalPoints} points is below the statutory pass mark of ${SELF_EMPLOYED_PASS_MARK_POINTS} points under IRPR s. 100.`
    });
  }

  // 7. Intention, Ability, and Significant Contribution (IRPR s. 88(1))
  if (!intendsAndAbleToBeSelfEmployed) {
    disqualifications.push({
      criterion: 'INTENTION_OR_ABILITY_FAILURE',
      reason: 'The applicant must establish genuine intention and financial/professional ability to create their own employment in Canada.'
    });
  }

  if (!willMakeSignificantContributionToCanada) {
    disqualifications.push({
      criterion: 'SIGNIFICANT_CONTRIBUTION_DEFICIENCY',
      reason: 'Under IRPR s. 88(1), self-employed applicants must demonstrate that their activities will make a significant contribution to cultural or athletic life in Canada.'
    });
  }

  // 8. Ministerial Instructions Intake Pause Advisory
  riskWarnings.push({
    warning: 'MINISTERIAL_INSTRUCTIONS_INTAKE_PAUSE',
    details: 'IRCC has paused intake of new applications under the Self-Employed Persons Program until the end of 2026 to process existing backlogs. Candidates may prepare portfolios but cannot submit new federal applications until intake resumes.'
  });

  const isEligible = disqualifications.length === 0;

  return {
    applicantName,
    assessmentDate,
    program: 'FEDERAL_SELF_EMPLOYED_PERSONS',
    activityType: String(activityType).toUpperCase(),
    isEligible,
    eligibilityVerdict: isEligible
      ? 'ELIGIBLE_FOR_SELF_EMPLOYED_PERSONS_CLASS'
      : 'INELIGIBLE_FOR_SELF_EMPLOYED_PERSONS_CLASS',
    pointsSummary: {
      totalPoints,
      passMark: SELF_EMPLOYED_PASS_MARK_POINTS,
      maxPoints: SELF_EMPLOYED_MAX_POINTS,
      isPassMarkSatisfied: totalPoints >= SELF_EMPLOYED_PASS_MARK_POINTS,
      breakdown: pointsBreakdown
    },
    relevantExperienceAudit: {
      selfEmployedYears: selfExp,
      worldClassYears: worldExp,
      totalQualifyingYears,
      satisfiesStatutoryTwoYearThreshold: hasTwoQualifyingYears
    },
    disqualifications,
    riskWarnings,
    statutoryCitations: [
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 12(2)',
      'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, ss. 88(1), 100, 101',
      'Ministerial Instructions regarding Temporary Intake Pause for Self-Employed Persons Program'
    ]
  };
}
