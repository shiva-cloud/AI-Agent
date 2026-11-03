/**
 * Federal Francophone Community Immigration Pilot (FCIP) Navigator
 *
 * Implements statutory assessment rules under:
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27, s. 14.1)
 * - Ministerial Instructions: Francophone Community Immigration Pilot (FCIP 2024–2029)
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227, s. 87)
 * - Canadian Language Benchmarks (Niveaux de compétence linguistique canadiens - NCLC)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FCIP_PARTICIPATING_COMMUNITIES = Object.freeze([
  { community: 'Sudbury', province: 'ON', designatedOrganization: 'Réseau de développement économique et d’employabilité (RDÉE Ontario)' },
  { community: 'Hearst', province: 'ON', designatedOrganization: 'Conseil de développement du Grand Hearst' },
  { community: 'Clare', province: 'NS', designatedOrganization: 'Conseil de développement économique de la Nouvelle-Écosse (CDÉNÉ)' },
  { community: 'Acadian_Peninsula', province: 'NB', designatedOrganization: 'Commission de services régionaux Péninsule acadienne' },
  { community: 'Evangeline', province: 'PE', designatedOrganization: 'RDÉE Île-du-Prince-Édouard' },
  { community: 'Saint_Boniface', province: 'MB', designatedOrganization: 'Conseil de développement économique des municipalités bilingues du Manitoba (CDEM)' },
  { community: 'Gravelbourg', province: 'SK', designatedOrganization: 'Conseil économique et coopératif de la Saskatchewan (CÉCS)' },
  { community: 'Plamondon', province: 'AB', designatedOrganization: 'Conseil de développement économique de l’Alberta (CDÉA)' },
  { community: 'Prince_George', province: 'BC', designatedOrganization: 'Société de développement économique de la Colombie-Britannique (SDECB)' }
]);

export const FCIP_SETTLEMENT_FUNDS_2026 = Object.freeze({
  1: 7345, // 50% of LICO for rural/community pilots
  2: 9144,
  3: 11242,
  4: 13649,
  5: 15480,
  additionalPerPerson: 1979
});

export function calculateFcipSettlementFunds(familySize = 1) {
  const size = Math.max(1, Math.min(30, Number.isFinite(Number(familySize)) ? Math.round(Number(familySize)) : 1));
  if (size <= 5) {
    return FCIP_SETTLEMENT_FUNDS_2026[size];
  }
  return FCIP_SETTLEMENT_FUNDS_2026[5] + ((size - 5) * FCIP_SETTLEMENT_FUNDS_2026.additionalPerPerson);
}

export function evaluateFrancophoneCommunityPilot(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    candidateName = 'Candidate',
    assessmentDate = todayIso(),
    communityName = 'Sudbury',
    hasCommunityRecommendationLetter = true,
    targetNocTeer = 2,
    hasPermanentFullTimeJobOffer = true,
    jobOfferWithinCommunity = true,
    jobOfferMeetsMedianWage = true,
    frenchNclcSpeaking = 5,
    frenchNclcListening = 5,
    frenchNclcReading = 5,
    frenchNclcWriting = 5,
    monthsOfWorkExperiencePastThreeYears = 12,
    hasHighSchoolDiplomaOrEca = true,
    currentlyWorkingInCanada = false,
    liquidSettlementFundsCad = 10000,
    familySize = 1,
    intendsToResideInCommunity = true
  } = safeParams;

  const cleanCandidateName = boundedText(candidateName, 'Candidate', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanCommName = boundedText(communityName, 'Sudbury', 80);
  const normalizedComm = cleanCommName.trim().toLowerCase();
  const matchedCommunity = FCIP_PARTICIPATING_COMMUNITIES.find(
    c => c.community.toLowerCase() === normalizedComm || c.community.toLowerCase().replace('_', ' ') === normalizedComm
  );

  const teer = Math.max(0, Math.min(5, Number.isFinite(Number(targetNocTeer)) ? Math.round(Number(targetNocTeer)) : 2));
  const minRequiredNclc = (teer >= 0 && teer <= 3) ? 5 : 4;

  const criteriaEvaluated = [];
  const disqualifications = [];
  const riskWarnings = [];

  // 1. Participating Community & Recommendation Letter
  if (matchedCommunity) {
    criteriaEvaluated.push({
      criterion: 'PARTICIPATING_FRANCOPHONE_COMMUNITY',
      status: 'MET',
      details: `${matchedCommunity.community} (${matchedCommunity.province}) is an officially designated Francophone minority pilot community.`
    });
  } else {
    disqualifications.push({
      criterion: 'NON_PARTICIPATING_COMMUNITY',
      reason: `'${communityName}' is not a participating community under the Francophone Community Immigration Pilot schedule.`
    });
  }

  if (hasCommunityRecommendationLetter) {
    criteriaEvaluated.push({
      criterion: 'COMMUNITY_RECOMMENDATION_LETTER',
      status: 'MET',
      details: 'Official endorsement letter issued by the designated Francophone community economic organization verified.'
    });
  } else {
    disqualifications.push({
      criterion: 'MISSING_COMMUNITY_RECOMMENDATION',
      reason: 'Statutory eligibility requires a formal recommendation letter issued by the designated local Francophone organization.'
    });
  }

  // 2. Job Offer Criteria (Full-time, permanent, located in community, prevailing wage)
  if (hasPermanentFullTimeJobOffer && jobOfferWithinCommunity && jobOfferMeetsMedianWage) {
    criteriaEvaluated.push({
      criterion: 'QUALIFYING_JOB_OFFER',
      status: 'MET',
      details: `Full-time permanent offer in TEER ${teer} meeting median wage located within the participating community.`
    });
  } else {
    if (!hasPermanentFullTimeJobOffer) {
      disqualifications.push({
        criterion: 'NON_PERMANENT_OFFER',
        reason: 'The offer must be permanent, full-time (at least 30 hours per week), and non-seasonal.'
      });
    }
    if (!jobOfferWithinCommunity) {
      disqualifications.push({
        criterion: 'JOB_OUTSIDE_COMMUNITY',
        reason: 'The physical workplace must be situated within the boundaries of the designated Francophone community.'
      });
    }
    if (!jobOfferMeetsMedianWage) {
      disqualifications.push({
        criterion: 'SUB_MEDIAN_WAGE',
        reason: 'Offered wage must meet or exceed the prevailing provincial/territorial median hourly wage for the occupation.'
      });
    }
  }

  // 3. French Language Proficiency (NCLC 5 for TEER 0–3, NCLC 4 for TEER 4–5)
  const spk = Math.max(0, Math.min(12, Number.isFinite(Number(frenchNclcSpeaking)) ? Number(frenchNclcSpeaking) : 0));
  const lis = Math.max(0, Math.min(12, Number.isFinite(Number(frenchNclcListening)) ? Number(frenchNclcListening) : 0));
  const rd = Math.max(0, Math.min(12, Number.isFinite(Number(frenchNclcReading)) ? Number(frenchNclcReading) : 0));
  const wr = Math.max(0, Math.min(12, Number.isFinite(Number(frenchNclcWriting)) ? Number(frenchNclcWriting) : 0));
  const minFrench = Math.min(spk, lis, rd, wr);

  if (minFrench >= minRequiredNclc) {
    criteriaEvaluated.push({
      criterion: 'FRENCH_LANGUAGE_PROFICIENCY',
      status: 'MET',
      details: `French language proficiency (Speaking: ${spk}, Listening: ${lis}, Reading: ${rd}, Writing: ${wr}) satisfies minimum NCLC ${minRequiredNclc} for TEER ${teer}.`
    });
  } else {
    disqualifications.push({
      criterion: 'FRENCH_BENCHMARK_UNSATISFIED',
      reason: `Target NOC TEER ${teer} requires minimum NCLC ${minRequiredNclc} across all four abilities in French; lowest skill scored NCLC ${minFrench}.`
    });
  }

  // 4. Work Experience Requirement (At least 1 year / 1,560 hours in past 3 years)
  const expMonths = Math.max(0, Math.min(36, Number.isFinite(Number(monthsOfWorkExperiencePastThreeYears)) ? Number(monthsOfWorkExperiencePastThreeYears) : 0));
  if (expMonths >= 12) {
    criteriaEvaluated.push({
      criterion: 'QUALIFYING_WORK_EXPERIENCE',
      status: 'MET',
      details: `Candidate has ${expMonths} months of qualifying work experience in the past 3 years (minimum 12 months required).`
    });
  } else {
    disqualifications.push({
      criterion: 'EXPERIENCE_SHORTFALL',
      reason: `Requires at least 12 continuous full-time months of related experience within the past 3 years; candidate has ${expMonths} months.`
    });
  }

  // 5. Education (High school diploma or ECA)
  if (hasHighSchoolDiplomaOrEca) {
    criteriaEvaluated.push({
      criterion: 'EDUCATION_CREDENTIAL',
      status: 'MET',
      details: 'Secondary school completion (high school) verified by ECA or Canadian schooling.'
    });
  } else {
    disqualifications.push({
      criterion: 'EDUCATION_DEFICIENCY',
      reason: 'Applicant must hold a Canadian high school diploma or foreign equivalent verified by an ECA.'
    });
  }

  // 6. Settlement Funds Audit
  const size = Math.max(1, Math.min(30, Number.isFinite(Number(familySize)) ? Math.round(Number(familySize)) : 1));
  const requiredFunds = currentlyWorkingInCanada ? 0 : calculateFcipSettlementFunds(size);
  const providedFunds = Math.max(0, Math.min(1000000000, Number.isFinite(Number(liquidSettlementFundsCad)) ? Number(liquidSettlementFundsCad) : 0));

  if (currentlyWorkingInCanada) {
    criteriaEvaluated.push({
      criterion: 'SETTLEMENT_FUNDS_EXEMPTION',
      status: 'MET',
      details: 'Candidate is currently authorized and employed in Canada; settlement funds requirement is waived.'
    });
  } else if (providedFunds >= requiredFunds) {
    criteriaEvaluated.push({
      criterion: 'SETTLEMENT_FUNDS',
      status: 'MET',
      details: `Available liquid funds ($${providedFunds.toLocaleString()} CAD) meet the pilot requirement of $${requiredFunds.toLocaleString()} CAD for family size ${size}.`
    });
  } else {
    disqualifications.push({
      criterion: 'SETTLEMENT_FUNDS_DEFICIENCY',
      reason: `Settlement funds of $${providedFunds.toLocaleString()} CAD fall below the statutory threshold of $${requiredFunds.toLocaleString()} CAD for family size ${size}.`
    });
  }

  // 7. Intention to Reside
  if (!intendsToResideInCommunity) {
    disqualifications.push({
      criterion: 'INTENT_TO_RESIDE_FAILURE',
      reason: 'The applicant must establish a genuine intention to settle and establish permanent residence within the Francophone minority community.'
    });
  }

  const isEligible = disqualifications.length === 0;

  return {
    candidateName: cleanCandidateName,
    assessmentDate: cleanAssessmentDate,
    stream: 'FRANCOPHONE_COMMUNITY_IMMIGRATION_PILOT',
    communityDetails: matchedCommunity || null,
    isEligible,
    eligibilityVerdict: isEligible
      ? 'ELIGIBLE_FOR_FRANCOPHONE_COMMUNITY_PILOT_PR'
      : 'INELIGIBLE_FOR_FRANCOPHONE_COMMUNITY_PILOT',
    criteriaEvaluated,
    disqualifications,
    riskWarnings,
    financialAudit: {
      familySize: size,
      isExemptDueToCanadianWork: currentlyWorkingInCanada,
      requiredFundsCad: requiredFunds,
      providedFundsCad: providedFunds,
      hasSufficientFunds: currentlyWorkingInCanada || providedFunds >= requiredFunds
    },
    statutoryCitations: [
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 14.1',
      'Ministerial Instructions: Francophone Community Immigration Pilot (FCIP 2024–2029)',
      'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 87'
    ]
  };
}
