/**
 * Quebec CSQ Skilled Worker & Arrima Selection Navigator
 *
 * Evaluates points and statutory eligibility for the Quebec Selection Certificate
 * (Certificat de sélection du Québec - CSQ) under the Programme de sélection
 * des travailleurs qualifiés (PSTQ / PRTQ) and the Arrima Expression of Interest portal.
 *
 * Statutory Authorities:
 * - Loi sur l'immigration au Québec, RLRQ c. I-0.2.1
 * - Règlement sur l'immigration au Québec, RLRQ c. I-0.2.1, r. 3
 * - Grille synthèse du Programme régulier des travailleurs qualifiés (PRTQ / PSTQ)
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const QUEBEC_CSQ_GRID_CONSTANTS = Object.freeze({
  PASS_MARK_SINGLE_APPLICANT: 50,
  PASS_MARK_SPOUSE_ACCOMPANYING: 59,
  MANDATORY_FRENCH_ORAL_NIVEAU_MINIMUM: 7, // EQCLF Niveau 7 (B2 threshold)
  MAX_AGE_POINTS: 16, // Ages 18-35
  VOM_POINTS_MONTREAL_CMM: 10,
  VOM_POINTS_REGIONS_OUTSIDE_CMM: 14,
  FINANCIAL_AUTONOMY_CONTRACT_MONTHS: 3,
  CSQ_APPLICATION_FEE_MAIN_APPLICANT_CAD: 919, // 2024-2025 MIFI tariff
  CSQ_APPLICATION_FEE_DEPENDENT_CAD: 196,
  STATUTORY_AUTHORITY: "Loi sur l'immigration au Québec, RLRQ c. I-0.2.1, r. 3"
});

/**
 * Calculates Quebec PRTQ/PSTQ points grid score and audits CSQ eligibility.
 *
 * @param {Object} params
 * @param {boolean} [params.hasAccompanyingSpouse=false] - Whether spouse/common-law partner is accompanying
 * @param {number} [params.applicantAge=30] - Age of the principal applicant
 * @param {string} [params.educationLevel='bachelor_3_years'] - Highest level of completed education
 * @param {string} [params.areaOfTrainingSection='SECTION_B'] - Area of training rating (SECTION_A, SECTION_B, SECTION_C, NONE)
 * @param {number} [params.monthsOfQualifiedExperience=36] - Months of skilled work experience (NOC TEER 0, 1, 2, 3)
 * @param {number} [params.frenchOralListeningNiveau=7] - French listening niveau (EQCLF 0-12, TEFAQ/TCF-Québec)
 * @param {number} [params.frenchOralSpeakingNiveau=7] - French speaking niveau (EQCLF 0-12)
 * @param {number} [params.englishListeningClb=5] - English listening CLB (IELTS General)
 * @param {number} [params.englishSpeakingClb=5] - English speaking CLB
 * @param {boolean} [params.hasQuebecStudyOrWorkStay=true] - Completed 6+ months study or work in Quebec
 * @param {boolean} [params.hasValidatedJobOffer=false] - Validated Job Offer (Offre d'emploi validée - VOM)
 * @param {boolean} [params.isJobOfferOutsideMontrealCmm=false] - Job offer located outside Communauté métropolitaine de Montréal
 * @param {number} [params.numberOfChildrenUnder12=0] - Dependent children under age 12
 * @param {number} [params.numberOfChildren13to21=0] - Dependent children aged 13 to 21
 * @param {boolean} [params.signedFinancialAutonomyContract=true] - Signed 3-month legal financial autonomy contract
 * @returns {Object} Quebec CSQ points evaluation, French threshold audit, and admissibility assessment
 */
export function evaluateQuebecCsqSkilledWorker({
  hasAccompanyingSpouse = false,
  applicantAge = 30,
  educationLevel = 'bachelor_3_years',
  areaOfTrainingSection = 'SECTION_B',
  monthsOfQualifiedExperience = 36,
  frenchOralListeningNiveau = 7,
  frenchOralSpeakingNiveau = 7,
  englishListeningClb = 5,
  englishSpeakingClb = 5,
  hasQuebecStudyOrWorkStay = true,
  hasValidatedJobOffer = false,
  isJobOfferOutsideMontrealCmm = false,
  numberOfChildrenUnder12 = 0,
  numberOfChildren13to21 = 0,
  signedFinancialAutonomyContract = true,
  candidateName = 'Demandeur',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeCandidateName = boundedText(candidateName, 120) || 'Demandeur';
  const safeAssessmentDate = safeIsoDate(assessmentDate);
  const safeEducationLevel = boundedText(educationLevel, 50) || 'bachelor_3_years';
  const safeAreaOfTraining = boundedText(areaOfTrainingSection, 30) || 'SECTION_B';

  const accompanyingSpouse = Boolean(hasAccompanyingSpouse);
  const quebecStay = Boolean(hasQuebecStudyOrWorkStay);
  const validatedJobOffer = Boolean(hasValidatedJobOffer);
  const outsideCmm = Boolean(isJobOfferOutsideMontrealCmm);
  const signedContract = Boolean(signedFinancialAutonomyContract);

  const age = Number.isFinite(Number(applicantAge)) ? Math.max(0, Math.min(120, Math.floor(Number(applicantAge)))) : 30;
  const expMonths = Number.isFinite(Number(monthsOfQualifiedExperience)) ? Math.max(0, Math.min(600, Math.floor(Number(monthsOfQualifiedExperience)))) : 0;
  const frListen = Number.isFinite(Number(frenchOralListeningNiveau)) ? Math.max(0, Math.min(12, Math.floor(Number(frenchOralListeningNiveau)))) : 0;
  const frSpeak = Number.isFinite(Number(frenchOralSpeakingNiveau)) ? Math.max(0, Math.min(12, Math.floor(Number(frenchOralSpeakingNiveau)))) : 0;
  const enListen = Number.isFinite(Number(englishListeningClb)) ? Math.max(0, Math.min(12, Math.floor(Number(englishListeningClb)))) : 0;
  const enSpeak = Number.isFinite(Number(englishSpeakingClb)) ? Math.max(0, Math.min(12, Math.floor(Number(englishSpeakingClb)))) : 0;
  const kidsUnder12 = Number.isFinite(Number(numberOfChildrenUnder12)) ? Math.max(0, Math.min(20, Math.floor(Number(numberOfChildrenUnder12)))) : 0;
  const kids13to21 = Number.isFinite(Number(numberOfChildren13to21)) ? Math.max(0, Math.min(20, Math.floor(Number(numberOfChildren13to21)))) : 0;

  const pointsBreakdown = {};

  // 1. Education Points (Max 14)
  const educationScores = {
    secondary_diploma: 2,
    post_secondary_general_2_years: 4,
    technical_post_secondary_3_years: 8,
    bachelor_1_or_2_years: 4,
    bachelor_3_years: 10,
    masters_degree: 12,
    doctorate_degree: 14
  };
  pointsBreakdown.education = educationScores[safeEducationLevel] || 0;

  // 2. Area of Training Points (Domaine de formation) (Max 12)
  const trainingScores = {
    SECTION_A: 12,
    SECTION_B: 9,
    SECTION_C: 6,
    SECTION_D: 2,
    NONE: 0
  };
  pointsBreakdown.areaOfTraining = trainingScores[safeAreaOfTraining] || 0;

  // 3. Work Experience (Max 8)
  if (expMonths >= 48) pointsBreakdown.workExperience = 8;
  else if (expMonths >= 24) pointsBreakdown.workExperience = 6;
  else if (expMonths >= 6) pointsBreakdown.workExperience = 4;
  else pointsBreakdown.workExperience = 0;

  // 4. Age Points (Max 16)
  if (age >= 18 && age <= 35) pointsBreakdown.age = 16;
  else if (age === 36) pointsBreakdown.age = 14;
  else if (age === 37) pointsBreakdown.age = 12;
  else if (age === 38) pointsBreakdown.age = 10;
  else if (age === 39) pointsBreakdown.age = 8;
  else if (age === 40) pointsBreakdown.age = 6;
  else if (age === 41) pointsBreakdown.age = 4;
  else if (age === 42) pointsBreakdown.age = 2;
  else pointsBreakdown.age = 0;

  // 5. Language Proficiency
  // French Oral: Listening (max 8) + Speaking (max 8)
  const scoreFrenchBand = (lvl) => {
    if (lvl >= 9) return 8; // Niveaux 9-12 = 8 pts
    if (lvl >= 7) return 7; // Niveaux 7-8 = 7 pts
    if (lvl >= 5) return 5; // Niveaux 5-6 = 5 pts
    return 0; // Below niveau 5 = 0 pts
  };
  pointsBreakdown.frenchListening = scoreFrenchBand(frListen);
  pointsBreakdown.frenchSpeaking = scoreFrenchBand(frSpeak);
  pointsBreakdown.frenchTotalOral = pointsBreakdown.frenchListening + pointsBreakdown.frenchSpeaking;

  // English Oral: Listening (max 3) + Speaking (max 3)
  const scoreEnglishBand = (clb) => {
    if (clb >= 9) return 3;
    if (clb >= 7) return 2;
    if (clb >= 5) return 1;
    return 0;
  };
  pointsBreakdown.englishListening = scoreEnglishBand(enListen);
  pointsBreakdown.englishSpeaking = scoreEnglishBand(enSpeak);
  pointsBreakdown.englishTotal = pointsBreakdown.englishListening + pointsBreakdown.englishSpeaking;

  // 6. Stay in Quebec (Max 5)
  pointsBreakdown.quebecStay = quebecStay ? 5 : 0;

  // 7. Validated Job Offer (VOM)
  if (validatedJobOffer) {
    pointsBreakdown.validatedJobOffer = outsideCmm
      ? QUEBEC_CSQ_GRID_CONSTANTS.VOM_POINTS_REGIONS_OUTSIDE_CMM
      : QUEBEC_CSQ_GRID_CONSTANTS.VOM_POINTS_MONTREAL_CMM;
  } else {
    pointsBreakdown.validatedJobOffer = 0;
  }

  // 8. Children (Max 8 for <12; Max 4 for 13-21)
  const childUnder12Pts = Math.min(8, kidsUnder12 * 4);
  const child13to21Pts = Math.min(4, kids13to21 * 2);
  pointsBreakdown.children = childUnder12Pts + child13to21Pts;

  // 9. Financial Autonomy Contract (1 pt, mandatory)
  pointsBreakdown.financialAutonomy = signedContract ? 1 : 0;

  // Calculate Total Score
  const totalScore = Object.values(pointsBreakdown).reduce((sum, val) => sum + val, 0);

  const passMarkRequired = accompanyingSpouse
    ? QUEBEC_CSQ_GRID_CONSTANTS.PASS_MARK_SPOUSE_ACCOMPANYING
    : QUEBEC_CSQ_GRID_CONSTANTS.PASS_MARK_SINGLE_APPLICANT;

  const meetsPointsThreshold = totalScore >= passMarkRequired;

  // Mandatory French Oral Threshold Audit (Niveau 7 minimum in both listening & speaking)
  const meetsMandatoryFrenchOralThreshold =
    frListen >= QUEBEC_CSQ_GRID_CONSTANTS.MANDATORY_FRENCH_ORAL_NIVEAU_MINIMUM &&
    frSpeak >= QUEBEC_CSQ_GRID_CONSTANTS.MANDATORY_FRENCH_ORAL_NIVEAU_MINIMUM;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  if (!meetsMandatoryFrenchOralThreshold) {
    statutoryViolations.push({
      rule: 'FRENCH_ORAL_PROFICIENCY_BELOW_NIVEAU_7',
      statute: "Règlement sur l'immigration au Québec, r. 3, Annexe A",
      finding: `French oral proficiency is below mandatory Niveau 7. Listening: Niveau ${frListen}, Speaking: Niveau ${frSpeak}. PSTQ requires minimum Niveau 7 oral.`
    });
    actionableRemedies.push({
      action: 'FRENCH_FRANCISISATION_PREPARATION',
      remedyDescription: 'Enroll in intensive French courses (Francisation Québec) to attain EQCLF Niveau 7 (B2) in both listening and speaking before applying for CSQ.'
    });
  }

  if (!signedContract) {
    statutoryViolations.push({
      rule: 'FINANCIAL_AUTONOMY_CONTRACT_UNSIGNED',
      statute: "Loi sur l'immigration au Québec s. 12 & Règlement r. 3 s. 36",
      finding: 'The 3-month legal financial autonomy undertaking (Contrat d’autonomie financière) has not been signed.'
    });
    actionableRemedies.push({
      action: 'SIGN_FINANCIAL_AUTONOMY_UNDERTAKING',
      remedyDescription: 'Complete and sign Form A-0522-OF undertaking to provide for own needs and dependents for the initial 3 months in Quebec.'
    });
  }

  if (!meetsPointsThreshold) {
    const deficit = passMarkRequired - totalScore;
    statutoryViolations.push({
      rule: 'INSUFFICIENT_CSQ_POINTS',
      statute: "Règlement sur l'immigration au Québec, Grille de sélection",
      finding: `Total score of ${totalScore} points fails the pass mark of ${passMarkRequired} points (deficit of ${deficit} point${deficit === 1 ? '' : 's'}).`
    });
    actionableRemedies.push({
      action: 'INCREASE_POINTS_VIA_VOM_OR_FRENCH',
      remedyDescription: 'Obtain a Validated Job Offer (VOM) outside Montreal (+14 points) or advance French written and oral test competencies.'
    });
  }

  if (validatedJobOffer && !outsideCmm) {
    riskWarnings.push({
      warningType: 'MONTREAL_CMM_LOWER_VOM_WEIGHT',
      description: 'Job offer is inside the Montreal Metropolitan Community (CMM), awarding 10 points instead of 14 points awarded for regional job offers.'
    });
  }

  let eligibilityVerdict = 'ELIGIBLE_FOR_CSQ_INVITATION';
  let isEligible = true;

  if (statutoryViolations.length > 0) {
    isEligible = false;
    if (!meetsMandatoryFrenchOralThreshold) {
      eligibilityVerdict = 'INELIGIBLE_MANDATORY_FRENCH_NOT_MET';
    } else if (!meetsPointsThreshold) {
      eligibilityVerdict = 'INELIGIBLE_BELOW_PASS_MARK';
    } else {
      eligibilityVerdict = 'INELIGIBLE_STATUTORY_REQUIREMENTS_NOT_MET';
    }
  }

  const baseFee = QUEBEC_CSQ_GRID_CONSTANTS.CSQ_APPLICATION_FEE_MAIN_APPLICANT_CAD;
  const depCount = (accompanyingSpouse ? 1 : 0) + kidsUnder12 + kids13to21;
  const totalApplicationFeeCad = baseFee + depCount * QUEBEC_CSQ_GRID_CONSTANTS.CSQ_APPLICATION_FEE_DEPENDENT_CAD;

  return {
    jurisdiction: 'QUEBEC_CANADA',
    stream: 'PROGRAMME_SELECTION_TRAVAILLEURS_QUALIFIES_PSTQ',
    candidateName: safeCandidateName,
    assessmentDate: safeAssessmentDate,
    hasAccompanyingSpouse: accompanyingSpouse,
    applicantAge: age,
    totalScore,
    passMarkRequired,
    meetsPointsThreshold,
    meetsMandatoryFrenchOralThreshold,
    isEligible,
    eligibilityVerdict,
    pointsBreakdown,
    feeEstimateCad: totalApplicationFeeCad,
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      "Loi sur l'immigration au Québec, RLRQ c. I-0.2.1",
      "Règlement sur l'immigration au Québec, RLRQ c. I-0.2.1, r. 3",
      "Guide des procédures d'immigration - Ministère de l'Immigration, de la Francisation et de l'Intégration (MIFI)"
    ]
  };
}
