/**
 * Alberta Advantage Immigration Program (AAIP) Rural Renewal & Rural Entrepreneur Diagnostic Engine
 * 
 * Statutory & Policy Authorities:
 * - Alberta Advantage Immigration Program (AAIP) Terms and Conditions & Economic Development Mandates
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27 s. 8 & s. 10
 * - Canada-Alberta Agreement on Provincial Nominees (CAAPN):
 *   - Rural Renewal Stream: Community-driven economic immigration pathway for participating rural municipalities
 *     with populations under 100,000 outside Calgary and Edmonton Census Metropolitan Areas (CMAs).
 *   - Rural Entrepreneur Stream: Community-sponsored business establishment pathway.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const RURAL_AAIP_CONSTANTS = Object.freeze({
  MIN_COMMUNITY_POPULATION_CEILING: 100000,
  MIN_WORK_EXPERIENCE_MONTHS: 12,
  WORK_EXP_WINDOW_MONTHS: 18,
  MIN_CLB_TEER_0_1_2_3: 5,
  MIN_CLB_TEER_4_5: 4,
  MIN_ENTREPRENEUR_NET_WORTH_CAD: 300000.0,
  MIN_ENTREPRENEUR_INVESTMENT_CAD: 100000.0,
  MIN_BUSINESS_OWNERSHIP_PERCENT: 51.0,
  MIN_RURAL_JOBS_CREATED: 1
});

export const DESIGNATED_RURAL_COMMUNITIES = Object.freeze({
  brooks: { name: 'Brooks', region: 'Southern Alberta', economicOrg: 'Brooks Region Economic Development' },
  whitecourt: { name: 'Whitecourt', region: 'Central-West Alberta', economicOrg: 'Town of Whitecourt Economic Dev' },
  innisfail: { name: 'Innisfail', region: 'Central Alberta', economicOrg: 'Innisfail Chamber of Commerce & Town' },
  slave_lake: { name: 'Slave Lake', region: 'Northern Alberta', economicOrg: 'Lesser Slave Lake Economic Alliance' },
  taber: { name: 'Taber', region: 'Southern Alberta', economicOrg: 'Town of Taber Economic Development' },
  drayton_valley: { name: 'Drayton Valley', region: 'Central Alberta', economicOrg: 'Town of Drayton Valley' },
  peace_river: { name: 'Peace River', region: 'Northern Alberta', economicOrg: 'Peace River Economic Development' },
  cold_lake: { name: 'Cold Lake', region: 'Eastern Alberta', economicOrg: 'City of Cold Lake Economic Development' },
  pincher_creek: { name: 'Pincher Creek', region: 'Southwestern Alberta', economicOrg: 'Town of Pincher Creek' }
});

export const RURAL_SETTLEMENT_FUNDS_LICO_2026 = Object.freeze({
  1: 15181.0,
  2: 18903.0,
  3: 23238.0,
  4: 28216.0,
  5: 32007.0,
  6: 36100.0,
  7: 40193.0
});

/**
 * Diagnostic evaluation of Alberta Rural Renewal and Rural Entrepreneur PNP stream eligibility.
 */
export function evaluateRuralRenewalEligibility({
  streamType = 'rural_renewal', // 'rural_renewal' | 'rural_entrepreneur'
  selectedCommunity = 'brooks',
  hasCommunityEndorsementLetter = true,
  hasGenuineJobOffer = true,
  jobOfferIsFullTimeNonSeasonal = true,
  jobNocTeer = 2, // 0, 1, 2, 3, 4, 5
  clbLevel = 5,
  hasHighSchoolOrEca = true,
  monthsWorkExperiencePast18Months = 14,
  familySize = 2,
  liquidSettlementFundsCad = 20000,
  isCurrentlyLivingAndWorkingInAlberta = false,
  // Entrepreneur fields
  netWorthCad = 350000,
  plannedInvestmentCad = 120000,
  plannedOwnershipPercent = 51.0,
  jobsCreatedCount = 1,
  hasCompletedCommunityExploratoryVisit = true,
  applicantName = 'AAIP Candidate',
  assessmentDate = '2026-10-31'
} = {}) {
  const stream = boundedText(streamType, 'rural_renewal', 40).toLowerCase();
  const commKey = boundedText(selectedCommunity, 'brooks', 50).toLowerCase();
  const community = DESIGNATED_RURAL_COMMUNITIES[commKey] || {
    name: 'Other Designated Community',
    region: 'Rural Alberta',
    economicOrg: 'Designated Community Partnership'
  };

  const endorsed = Boolean(hasCommunityEndorsementLetter);
  const teer = Math.max(0, Math.min(5, Math.floor(Number(jobNocTeer) || 0)));
  const clb = Math.max(0, Math.min(12, Math.floor(Number(clbLevel) || 0)));
  const education = Boolean(hasHighSchoolOrEca);
  const expMonths = Math.max(0, Math.min(600, Math.floor(Number(monthsWorkExperiencePast18Months) || 0)));
  const fSize = Math.max(1, Math.min(7, Math.floor(Number(familySize) || 1)));
  const funds = Math.max(0, Math.min(1000000000, Number(liquidSettlementFundsCad) || 0));
  const workingInAb = Boolean(isCurrentlyLivingAndWorkingInAlberta);

  const safeApplicant = boundedText(applicantName, 'Candidate', 120);
  const assessDate = safeIsoDate(assessmentDate, '2026-10-31');

  const deficiencies = [];
  const compliancePoints = [];
  const roadmapSteps = [];

  let overallEligible = false;
  let summaryTitle = '';

  if (stream === 'rural_renewal') {
    // 1. Community Endorsement Letter
    if (endorsed) {
      compliancePoints.push(`Holds mandatory Endorsement Letter from ${community.name} (${community.economicOrg}).`);
    } else {
      deficiencies.push(`Missing mandatory Community Endorsement Letter issued by ${community.name}.`);
    }

    // 2. Genuine Full-Time Job Offer
    if (hasGenuineJobOffer && jobOfferIsFullTimeNonSeasonal) {
      compliancePoints.push(`Holds bona fide, full-time non-seasonal job offer in ${community.name} (TEER ${teer}).`);
    } else {
      deficiencies.push('Job offer must be full-time, non-seasonal, and based in the designated rural municipality.');
    }

    // 3. Work Experience Threshold (12 months in past 18 months)
    if (expMonths >= RURAL_AAIP_CONSTANTS.MIN_WORK_EXPERIENCE_MONTHS) {
      compliancePoints.push(`Satisfies 12-month work experience mandate (${expMonths} months completed in past 18 months).`);
    } else {
      deficiencies.push(`Insufficient qualifying work experience: ${expMonths} months completed (minimum 12 months required within past 18 months).`);
    }

    // 4. Language Benchmark by TEER
    const minClbRequired = teer <= 3 ? RURAL_AAIP_CONSTANTS.MIN_CLB_TEER_0_1_2_3 : RURAL_AAIP_CONSTANTS.MIN_CLB_TEER_4_5;
    if (clb >= minClbRequired) {
      compliancePoints.push(`Language score CLB ${clb} meets minimum requirement (CLB ${minClbRequired} for TEER ${teer}).`);
    } else {
      deficiencies.push(`Language score CLB ${clb} falls below minimum threshold (CLB ${minClbRequired} required for TEER ${teer}).`);
    }

    // 5. Education
    if (education) {
      compliancePoints.push('Education requirement satisfied (Canadian high school or equivalent ECA).');
    } else {
      deficiencies.push('Missing Canadian high school diploma or Educational Credential Assessment (ECA).');
    }

    // 6. Settlement Funds
    const licoNeeded = RURAL_SETTLEMENT_FUNDS_LICO_2026[fSize] || RURAL_SETTLEMENT_FUNDS_LICO_2026[1];
    if (workingInAb) {
      compliancePoints.push('Settlement funds exemption applied (currently residing and legally working in Alberta).');
    } else if (funds >= licoNeeded) {
      compliancePoints.push(`Available liquid funds of $${funds.toLocaleString()} CAD meet LICO requirement ($${licoNeeded.toLocaleString()} CAD for family of ${fSize}).`);
    } else {
      deficiencies.push(`Available funds of $${funds.toLocaleString()} CAD fall short of LICO requirement ($${licoNeeded.toLocaleString()} CAD needed).`);
    }

    overallEligible = deficiencies.length === 0;
    summaryTitle = overallEligible
      ? `Eligible for AAIP Rural Renewal Stream in ${community.name}`
      : `Deficiencies Identified for AAIP Rural Renewal Stream in ${community.name}`;

    roadmapSteps.push(`Maintain continuous full-time employment with sponsoring employer in ${community.name}.`);
    roadmapSteps.push('Submit formal AAIP portal application with Community Endorsement Letter.');
    roadmapSteps.push('Upon AAIP nomination certificate issuance, apply to IRCC for permanent residence via non-Express Entry portal.');
    roadmapSteps.push('Apply for AAIP 204(c) work permit support letter if current temporary status is expiring.');

  } else {
    // Entrepreneur Stream
    const nWorth = Math.max(0, Math.min(1000000000, Number(netWorthCad) || 0));
    const invest = Math.max(0, Math.min(1000000000, Number(plannedInvestmentCad) || 0));
    const ownPct = Math.max(0, Math.min(100, Number(plannedOwnershipPercent) || 0));
    const jobs = Math.max(0, Math.min(1000, Math.floor(Number(jobsCreatedCount) || 0)));
    const visit = Boolean(hasCompletedCommunityExploratoryVisit);

    if (endorsed) {
      compliancePoints.push(`Community Support Letter secured from ${community.name}.`);
    } else {
      deficiencies.push(`Missing Community Support Letter from ${community.name}.`);
    }

    if (visit) {
      compliancePoints.push('Completed mandatory in-person community exploratory visit.');
    } else {
      deficiencies.push('Must complete mandatory in-person community exploratory visit before endorsement.');
    }

    if (nWorth >= RURAL_AAIP_CONSTANTS.MIN_ENTREPRENEUR_NET_WORTH_CAD) {
      compliancePoints.push(`Net worth of $${nWorth.toLocaleString()} CAD meets $300k minimum.`);
    } else {
      deficiencies.push(`Net worth of $${nWorth.toLocaleString()} CAD is below required $300,000 CAD.`);
    }

    if (invest >= RURAL_AAIP_CONSTANTS.MIN_ENTREPRENEUR_INVESTMENT_CAD) {
      compliancePoints.push(`Planned investment of $${invest.toLocaleString()} CAD meets $100k rural benchmark.`);
    } else {
      deficiencies.push(`Planned investment of $${invest.toLocaleString()} CAD is below required $100,000 CAD.`);
    }

    if (ownPct >= RURAL_AAIP_CONSTANTS.MIN_BUSINESS_OWNERSHIP_PERCENT) {
      compliancePoints.push(`Equity ownership of ${ownPct}% meets 51% minimum.`);
    } else {
      deficiencies.push(`Ownership percentage of ${ownPct}% is below required 51% threshold.`);
    }

    if (jobs >= RURAL_AAIP_CONSTANTS.MIN_RURAL_JOBS_CREATED) {
      compliancePoints.push(`Committed to creating ${jobs} full-time jobs for Canadian citizens/PRs.`);
    } else {
      deficiencies.push('Must create at least 1 full-time job for a Canadian citizen or permanent resident.');
    }

    overallEligible = deficiencies.length === 0;
    summaryTitle = overallEligible
      ? `Eligible for AAIP Rural Entrepreneur Stream in ${community.name}`
      : `Deficiencies Identified for AAIP Rural Entrepreneur Stream in ${community.name}`;

    roadmapSteps.push('Execute Business Performance Agreement with Government of Alberta.');
    roadmapSteps.push('Obtain AAIP 205(a) C11 Entrepreneur Work Permit to establish enterprise in rural community.');
    roadmapSteps.push('Operate business actively for minimum 12 consecutive months.');
    roadmapSteps.push('Submit Final Report to AAIP to receive provincial nomination for permanent residence.');
  }

  return {
    applicantName: safeApplicant,
    streamType: stream,
    designatedCommunity: community,
    assessmentDate: assessDate,
    overallEligible,
    summaryTitle,
    compliancePoints,
    deficiencies,
    roadmapSteps,
    statutoryBasis: 'Alberta Advantage Immigration Program (AAIP) & Canada-Alberta Agreement on Provincial Nominees'
  };
}
