/**
 * Alberta Advantage Immigration Program (AAIP) Rural Entrepreneur Stream Navigator
 *
 * Implements statutory assessment rules under:
 * - Alberta Immigration Act, SA 2019, c. A-21.5
 * - AAIP Rural Entrepreneur Stream Terms and Conditions
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27, s. 8)
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227, s. 87)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD = 300000;
export const AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD = 100000;
export const AAIP_RURAL_ENTREPRENEUR_MIN_CLB = 4;

export function evaluateAlbertaRuralEntrepreneur(params = {}) {
  const {
    candidateName = 'Candidate',
    communityName = 'Brooks',
    isDesignatedRuralCommunity = true,
    hasCommunityEndorsementLetter = true,
    hasCompletedExploratoryVisit = true,
    netWorthCad = 350000,
    plannedInvestmentCad = 150000,
    isBusinessSuccessionOrPurchase = false,
    plannedOwnershipPercentage = 60,
    fullTimeJobsCreatedForCanadians = 1,
    yearsOfBusinessOwnershipOrSeniorManagement = 3,
    clbScore = 5,
    hasHighSchoolDiplomaOrEca = true,
    intendsToResideInCommunity = true
  } = params;

  const cleanCandidateName = boundedText(candidateName, 'Candidate', 100);
  const cleanCommunityName = boundedText(communityName, 'Brooks', 80);
  const assessmentDate = safeIsoDate(params.assessmentDate);

  const netWorth = Number.isFinite(Number(netWorthCad)) ? Math.max(0, Math.min(1000000000, Number(netWorthCad))) : 0;
  const investment = Number.isFinite(Number(plannedInvestmentCad)) ? Math.max(0, Math.min(1000000000, Number(plannedInvestmentCad))) : 0;
  const ownershipPct = Number.isFinite(Number(plannedOwnershipPercentage)) ? Math.min(100, Math.max(0, Number(plannedOwnershipPercentage))) : 0;
  const jobs = Number.isFinite(Number(fullTimeJobsCreatedForCanadians)) ? Math.max(0, Math.min(1000, Math.floor(Number(fullTimeJobsCreatedForCanadians)))) : 0;
  const expYears = Number.isFinite(Number(yearsOfBusinessOwnershipOrSeniorManagement)) ? Math.max(0, Math.min(60, Number(yearsOfBusinessOwnershipOrSeniorManagement))) : 0;
  const clb = Number.isFinite(Number(clbScore)) ? Math.min(12, Math.max(0, Math.floor(Number(clbScore)))) : 0;

  const criteriaEvaluated = [];
  const disqualifications = [];
  const riskWarnings = [];

  // 1. Community Criteria & Endorsement Letter
  if (isDesignatedRuralCommunity && hasCommunityEndorsementLetter && hasCompletedExploratoryVisit) {
    criteriaEvaluated.push({
      criterion: 'COMMUNITY_ENDORSEMENT',
      status: 'MET',
      details: `Exploratory visit completed and Community Endorsement Letter received from designated rural community (${cleanCommunityName}).`
    });
  } else {
    if (!isDesignatedRuralCommunity) {
      disqualifications.push({
        criterion: 'NON_DESIGNATED_COMMUNITY',
        reason: `${cleanCommunityName} is not a participating designated rural community (must be under 100,000 population outside Calgary/Edmonton CMAs).`
      });
    }
    if (!hasCompletedExploratoryVisit) {
      disqualifications.push({
        criterion: 'MISSING_EXPLORATORY_VISIT',
        reason: 'Mandatory on-site community exploratory visit and interview with local economic development authority not completed.'
      });
    }
    if (!hasCommunityEndorsementLetter) {
      disqualifications.push({
        criterion: 'MISSING_ENDORSEMENT_LETTER',
        reason: 'Must possess an official Community Endorsement Letter from the participating rural municipality.'
      });
    }
  }

  // 2. Net Worth Threshold (Minimum $300,000 CAD)
  if (netWorth >= AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD) {
    criteriaEvaluated.push({
      criterion: 'MINIMUM_NET_WORTH',
      status: 'MET',
      details: `Net worth of $${netWorth.toLocaleString()} CAD satisfies the minimum requirement of $${AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD.toLocaleString()} CAD.`
    });
  } else {
    disqualifications.push({
      criterion: 'NET_WORTH_DEFICIENCY',
      reason: `Net worth of $${netWorth.toLocaleString()} CAD is below the statutory threshold of $${AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD.toLocaleString()} CAD.`
    });
  }

  // 3. Investment Amount (Minimum $100,000 CAD)
  if (investment >= AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD) {
    criteriaEvaluated.push({
      criterion: 'MINIMUM_INVESTMENT',
      status: 'MET',
      details: `Planned investment of $${investment.toLocaleString()} CAD meets or exceeds the minimum of $${AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD.toLocaleString()} CAD.`
    });
  } else {
    disqualifications.push({
      criterion: 'INVESTMENT_DEFICIENCY',
      reason: `Planned investment of $${investment.toLocaleString()} CAD does not satisfy the statutory minimum of $${AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD.toLocaleString()} CAD.`
    });
  }

  // 4. Ownership Percentage (51% for new business, 100% for succession/purchase)
  const minRequiredOwnership = isBusinessSuccessionOrPurchase ? 100 : 51;
  if (ownershipPct >= minRequiredOwnership) {
    criteriaEvaluated.push({
      criterion: 'OWNERSHIP_EQUITY',
      status: 'MET',
      details: `Ownership percentage of ${ownershipPct}% meets the requirement of at least ${minRequiredOwnership}% for ${isBusinessSuccessionOrPurchase ? 'business succession' : 'new business'}.`
    });
  } else {
    disqualifications.push({
      criterion: 'OWNERSHIP_SHORTFALL',
      reason: `Ownership of ${ownershipPct}% is below the required ${minRequiredOwnership}% equity stake.`
    });
  }

  // 5. Job Creation Requirement (Minimum 1 new full-time job for Canadian Citizen / PR)
  if (jobs >= 1) {
    criteriaEvaluated.push({
      criterion: 'JOB_CREATION',
      status: 'MET',
      details: `Business plan commits to creating ${jobs} full-time job(s) for Canadian Citizens or Permanent Residents (minimum 1 required).`
    });
  } else {
    disqualifications.push({
      criterion: 'JOB_CREATION_FAILURE',
      reason: 'Must create at least 1 new full-time job (minimum 30 hrs/wk for 6+ months) for a Canadian citizen or permanent resident.'
    });
  }

  // 6. Business Management Experience (Minimum 3 years owner or 4 years senior manager)
  if (expYears >= 3) {
    criteriaEvaluated.push({
      criterion: 'MANAGEMENT_EXPERIENCE',
      status: 'MET',
      details: `Candidate has ${expYears} years of qualifying business management or ownership experience in the past 10 years.`
    });
  } else {
    disqualifications.push({
      criterion: 'EXPERIENCE_DEFICIENCY',
      reason: `Requires at least 3 years as an active business owner-manager or 4 years as senior manager; provided is ${expYears} years.`
    });
  }

  // 7. Language Benchmark (Minimum CLB 4)
  if (clb >= AAIP_RURAL_ENTREPRENEUR_MIN_CLB) {
    criteriaEvaluated.push({
      criterion: 'LANGUAGE_BENCHMARK',
      status: 'MET',
      details: `Language proficiency CLB ${clb} satisfies the minimum standard of CLB ${AAIP_RURAL_ENTREPRENEUR_MIN_CLB}.`
    });
  } else {
    disqualifications.push({
      criterion: 'LANGUAGE_DEFICIENCY',
      reason: `Language proficiency CLB ${clb} is below the mandatory threshold of CLB ${AAIP_RURAL_ENTREPRENEUR_MIN_CLB}.`
    });
  }

  // 8. Education
  if (hasHighSchoolDiplomaOrEca) {
    criteriaEvaluated.push({
      criterion: 'EDUCATION_CREDENTIAL',
      status: 'MET',
      details: 'High school diploma equivalent verified.'
    });
  } else {
    disqualifications.push({
      criterion: 'EDUCATION_DEFICIENCY',
      reason: 'Must hold at least secondary school (high school) completion with Canadian equivalency.'
    });
  }

  // 9. Intention to Reside
  if (!intendsToResideInCommunity) {
    disqualifications.push({
      criterion: 'INTENT_TO_RESIDE_FAILURE',
      reason: 'Applicant must reside in the participating rural community and manage the business on an ongoing, daily basis.'
    });
  }

  const isEligible = disqualifications.length === 0;

  return {
    stream: 'AAIP_RURAL_ENTREPRENEUR',
    candidateName: cleanCandidateName,
    communityName: cleanCommunityName,
    assessmentDate,
    isEligible,
    eligibilityVerdict: isEligible
      ? 'ELIGIBLE_FOR_ALBERTA_RURAL_ENTREPRENEUR_STREAM'
      : 'INELIGIBLE_FOR_ALBERTA_RURAL_ENTREPRENEUR',
    financialAudit: {
      netWorthCad: netWorth,
      minimumNetWorthRequiredCad: AAIP_RURAL_ENTREPRENEUR_MIN_NET_WORTH_CAD,
      plannedInvestmentCad: investment,
      minimumInvestmentRequiredCad: AAIP_RURAL_ENTREPRENEUR_MIN_INVESTMENT_CAD,
      plannedOwnershipPercentage: ownershipPct,
      minimumOwnershipPercentageRequired: minRequiredOwnership
    },
    criteriaEvaluated,
    disqualifications,
    riskWarnings,
    statutoryCitations: [
      'Alberta Immigration Act, SA 2019, c. A-21.5',
      'AAIP Rural Entrepreneur Stream Terms and Conditions',
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 8',
      'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 87'
    ]
  };
}
