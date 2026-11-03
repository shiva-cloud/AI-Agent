/**
 * Atlantic Immigration Program (AIP) Diagnostic Engine
 *
 * Implements statutory assessment under the Immigration and Refugee Protection Act (IRPA) s. 12(2),
 * Atlantic Immigration Program Regulations, and bilateral federal-provincial agreements for
 * New Brunswick, Nova Scotia, Prince Edward Island, and Newfoundland & Labrador.
 *
 * Key Statutory Rules:
 * - 4 Participating Provinces: NB, NS, PE, NL.
 * - Streams:
 *   1. Atlantic International Graduate: 2-year post-secondary diploma/degree from recognized
 *      publicly funded Atlantic DLI, lived in province >= 16 months during 2 years of study.
 *      Exempt from past work experience requirements!
 *   2. Atlantic High-Skilled Worker (TEER 0, 1, 2, 3): 1 year (1,560 hrs) work exp in past 5 years;
 *      job offer >= 1 year duration.
 *   3. Atlantic Intermediate-Skilled Worker (TEER 4): 1 year work exp in past 5 years;
 *      job offer must be permanent/indeterminate.
 * - Language Standards: CLB 5 for TEER 0–3; CLB 4 for TEER 4.
 * - Settlement Funds: LICO benchmark; applicants already living and working legally in Canada
 *   with a valid work permit are statutorily exempt from fund requirements.
 * - Work Permit Support: Provincial endorsement letter authorizes 2-year C18 work permit.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const AIP_CONSTANTS = Object.freeze({
  ATLANTIC_PROVINCES: Object.freeze(['NB', 'NS', 'PE', 'NL']),
  MIN_GRADUATE_STUDY_YEARS: 2,
  MIN_GRADUATE_RESIDENCE_MONTHS: 16,
  MIN_WORK_EXPERIENCE_HOURS: 1560,
  WORK_EXP_LOOKBACK_YEARS: 5,
  MIN_CLB_TEER_0_1_2_3: 5,
  MIN_CLB_TEER_4: 4,
  LMIA_EXEMPTION_CODE: 'C18',
  LICO_FUNDS_TABLE_CAD: Object.freeze({
    1: 3586.0,
    2: 4465.0,
    3: 5489.0,
    4: 6665.0,
    5: 7560.0,
    6: 8527.0,
    7: 9494.0
  })
});

export const ATLANTIC_PROVINCE_NAMES = Object.freeze({
  NB: 'New Brunswick',
  NS: 'Nova Scotia',
  PE: 'Prince Edward Island',
  NL: 'Newfoundland and Labrador'
});

/**
 * Evaluates candidate eligibility under the Atlantic Immigration Program (AIP).
 *
 * @param {Object} options
 * @param {string} [options.province='NS'] - 'NB', 'NS', 'PE', 'NL'
 * @param {string} [options.stream='international_graduate'] - 'international_graduate', 'high_skilled', 'intermediate_skilled'
 * @param {number} [options.nocTeer=1] - TEER 0, 1, 2, 3, 4
 * @param {number} [options.clbLevel=5] - Language benchmark
 * @param {boolean} [options.hasDesignatedEmployerJobOffer=true] - Job offer from designated employer
 * @param {boolean} [options.isJobOfferFullTimeNonSeasonal=true] - >= 30 hrs/week
 * @param {number} [options.jobOfferDurationMonths=24] - 12+ months or 0 for permanent
 * @param {boolean} [options.isPermanentJobOffer=false] - Indeterminate contract
 * @param {boolean} [options.hasAtlanticTwoYearCredential=true] - For graduate stream
 * @param {number} [options.monthsResidedInAtlanticDuringStudy=16] - For graduate stream
 * @param {number} [options.hoursWorkExperiencePast5Years=1560] - For skilled streams
 * @param {number} [options.familySize=1] - Household size
 * @param {number} [options.settlementFundsCad=5000] - Available funds
 * @param {boolean} [options.isCurrentlyWorkingInCanadaOnValidPermit=false] - Fund exemption
 * @param {string} [options.candidateName='Candidate'] - Candidate name
 * @param {string} [options.assessmentDate=todayIso()] - Date of assessment
 * @returns {Object} Comprehensive AIP diagnostic
 */
export function evaluateAtlanticImmigrationEligibility(options = {}) {
  const prov = boundedText(options.province, 'NS', 10).toUpperCase();
  const stream = boundedText(options.stream, 'international_graduate', 50).toLowerCase();
  const teer = Number.isFinite(Number(options.nocTeer)) ? Math.max(0, Math.min(5, Math.floor(Number(options.nocTeer)))) : 1;
  const clb = Number.isFinite(Number(options.clbLevel)) ? Math.max(0, Math.min(12, Math.floor(Number(options.clbLevel)))) : 5;
  const designatedOffer = options.hasDesignatedEmployerJobOffer !== false;
  const fullTimeOffer = options.isJobOfferFullTimeNonSeasonal !== false;
  const offerMonths = Number.isFinite(Number(options.jobOfferDurationMonths)) ? Math.max(0, Math.min(360, Math.floor(Number(options.jobOfferDurationMonths)))) : 24;
  const permOffer = Boolean(options.isPermanentJobOffer);
  const gradCredential = options.hasAtlanticTwoYearCredential !== false;
  const residenceMonths = Number.isFinite(Number(options.monthsResidedInAtlanticDuringStudy)) ? Math.max(0, Math.min(120, Math.floor(Number(options.monthsResidedInAtlanticDuringStudy)))) : 16;
  const expHours = Number.isFinite(Number(options.hoursWorkExperiencePast5Years)) ? Math.max(0, Math.min(100000, Number(options.hoursWorkExperiencePast5Years))) : 1560;
  const famSize = Number.isFinite(Number(options.familySize)) ? Math.max(1, Math.min(20, Math.floor(Number(options.familySize)))) : 1;
  const funds = Number.isFinite(Number(options.settlementFundsCad)) ? Math.max(0, Math.min(1000000000, Number(options.settlementFundsCad))) : 5000.0;
  const workingInCanada = Boolean(options.isCurrentlyWorkingInCanadaOnValidPermit);
  const candidateName = boundedText(options.candidateName, 'Candidate', 100);
  const assessDate = safeIsoDate(options.assessmentDate, todayIso());

  const compliancePoints = [];
  const deficiencies = [];
  const riskWarnings = [];
  const requiredSteps = [];
  const statutoryNotes = [];

  // 1. Province Check
  const isAtlanticProv = AIP_CONSTANTS.ATLANTIC_PROVINCES.includes(prov);
  if (isAtlanticProv) {
    compliancePoints.push(`Target province ${ATLANTIC_PROVINCE_NAMES[prov]} is a designated Atlantic Immigration Program participant.`);
  } else {
    deficiencies.push(`Province ${prov} is outside Atlantic Canada. AIP is restricted to NB, NS, PE, and NL.`);
  }

  // 2. Job Offer Check
  if (designatedOffer) {
    compliancePoints.push('Job offer is from an officially designated Atlantic employer.');
  } else {
    deficiencies.push('Employer is not designated under the Atlantic Immigration Program.');
  }

  if (fullTimeOffer) {
    compliancePoints.push('Job offer is full-time (at least 30 hours per week) and non-seasonal.');
  } else {
    deficiencies.push('Job offer must be full-time (>= 30 hours/week) and non-seasonal.');
  }

  // Contract duration rules: TEER 0-3 needs >= 1 year; TEER 4 needs permanent
  if (teer <= 3) {
    if (offerMonths >= 12 || permOffer) {
      compliancePoints.push(`Job offer duration (${permOffer ? 'Permanent' : offerMonths + ' months'}) meets 1-year minimum for TEER ${teer}.`);
    } else {
      deficiencies.push(`TEER ${teer} positions require at least a 1-year (12-month) contract.`);
    }
  } else {
    // TEER 4
    if (permOffer) {
      compliancePoints.push('TEER 4 intermediate job offer is permanent (indeterminate), satisfying AIP regulations.');
    } else {
      deficiencies.push('TEER 4 positions require a permanent (indeterminate) job offer. Fixed-term contracts are statutorily barred for TEER 4.');
    }
  }

  // 3. Language Check
  const requiredClb = teer <= 3 ? AIP_CONSTANTS.MIN_CLB_TEER_0_1_2_3 : AIP_CONSTANTS.MIN_CLB_TEER_4;
  if (clb >= requiredClb) {
    compliancePoints.push(`Language score CLB ${clb} meets or exceeds required CLB ${requiredClb} for TEER ${teer}.`);
  } else {
    deficiencies.push(`Language score CLB ${clb} is below mandatory CLB ${requiredClb} for TEER ${teer}.`);
  }

  // 4. Stream-Specific Criteria
  if (stream === 'international_graduate') {
    if (gradCredential) {
      compliancePoints.push('Completed at least 2 years of full-time post-secondary study at recognized publicly funded Atlantic DLI.');
    } else {
      deficiencies.push('Must hold a recognized 2-year post-secondary degree, diploma, or certificate from an Atlantic public institution.');
    }

    if (residenceMonths >= AIP_CONSTANTS.MIN_GRADUATE_RESIDENCE_MONTHS) {
      compliancePoints.push(`Resided in Atlantic Canada for ${residenceMonths} months (>= 16-month statutory requirement).`);
    } else {
      deficiencies.push(`Must have physically resided in the Atlantic province for at least 16 months during the 24 months of study (reported: ${residenceMonths} months).`);
    }

    compliancePoints.push('EXEMPT from prior work experience requirements under AIP International Graduate regulations.');
  } else {
    // High-skilled or Intermediate-skilled
    if (expHours >= AIP_CONSTANTS.MIN_WORK_EXPERIENCE_HOURS) {
      compliancePoints.push(`Work experience of ${expHours} hours meets 1-year (1,560 hours) threshold.`);
    } else {
      deficiencies.push(`Work experience of ${expHours} hours is below the 1,560-hour threshold.`);
    }
  }

  // 5. Settlement Funds Check
  const requiredFunds = AIP_CONSTANTS.LICO_FUNDS_TABLE_CAD[Math.min(famSize, 7)] || 9494.0;
  let fundsExempt = false;

  if (workingInCanada) {
    fundsExempt = true;
    compliancePoints.push('STATUTORILY EXEMPT from settlement funds proof: Candidate is currently living and working in Canada with a valid work permit.');
  } else if (funds >= requiredFunds) {
    compliancePoints.push(`Settlement funds of $${funds.toLocaleString()} CAD meet required LICO threshold of $${requiredFunds.toLocaleString()} CAD for family of ${famSize}.`);
  } else {
    deficiencies.push(`Settlement funds of $${funds.toLocaleString()} CAD are below the $${requiredFunds.toLocaleString()} CAD LICO requirement for family size of ${famSize}.`);
  }

  const overallEligible = isAtlanticProv && designatedOffer && fullTimeOffer && (teer <= 3 ? (offerMonths >= 12 || permOffer) : permOffer) &&
    (clb >= requiredClb) &&
    (stream === 'international_graduate' ? (gradCredential && residenceMonths >= AIP_CONSTANTS.MIN_GRADUATE_RESIDENCE_MONTHS) : (expHours >= AIP_CONSTANTS.MIN_WORK_EXPERIENCE_HOURS)) &&
    (fundsExempt || funds >= requiredFunds);

  let summaryTitle = '';
  if (overallEligible) {
    summaryTitle = `Eligible for Atlantic Immigration Program (${ATLANTIC_PROVINCE_NAMES[prov] || prov} - ${stream.replace('_', ' ').toUpperCase()})`;
    requiredSteps.push('Employer completes settlement plan via settlement service provider organization (e.g. YMCA / Immigrant Services Association of Nova Scotia - ISANS).');
    requiredSteps.push(`Employer submits application for provincial endorsement to ${ATLANTIC_PROVINCE_NAMES[prov]} provincial immigration office.`);
    requiredSteps.push('Upon receiving Provincial Endorsement Certificate, candidate applies for Permanent Residence online through IRCC PR Portal.');
    requiredSteps.push('Candidate requests Referral Letter from province to apply for 2-year AIP work permit (LMIA-exempt code C18) while PR is processed.');
  } else {
    summaryTitle = `Ineligible for Atlantic Immigration Program (${deficiencies.length} Deficiencies Identified)`;
  }

  statutoryNotes.push('Atlantic Immigration Program Regulations (IRPA s. 12(2)): Employer-driven immigration pathway targeting demographic and economic growth across Atlantic Canada.');
  statutoryNotes.push('C18 Work Permit: Foreign workers with a valid provincial AIP endorsement can obtain a 2-year closed work permit without an LMIA.');
  statutoryNotes.push('Zero-Experience Exemption: Atlantic international graduates are not required to have previous work experience to qualify.');

  return {
    candidateName,
    assessmentDate: assessDate,
    province: prov,
    stream,
    nocTeer: teer,
    overallEligible,
    summaryTitle,
    jobOfferAudit: {
      isDesignatedEmployer: designatedOffer,
      isFullTimeNonSeasonal: fullTimeOffer,
      isPermanentContract: permOffer,
      contractDurationMonths: offerMonths
    },
    languageAudit: {
      candidateClb: clb,
      requiredClb,
      meetsLanguageThreshold: clb >= requiredClb
    },
    settlementFundsAudit: {
      familySize: famSize,
      fundsAvailableCad: funds,
      requiredLicoCad: requiredFunds,
      isStatutorilyExempt: fundsExempt
    },
    compliancePoints,
    deficiencies,
    riskWarnings,
    requiredSteps,
    statutoryNotes
  };
}
