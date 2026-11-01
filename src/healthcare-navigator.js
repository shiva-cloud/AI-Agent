// src/healthcare-navigator.js
// Pan-Canadian Provincial Universal Healthcare Eligibility & Bridge Insurance Calculator.
// Pure ES module with zero npm dependencies.

import {ValidationError} from './api-errors.js';
import {assertCalendarDate} from './evidence-policy.js';

export const PROVINCIAL_HEALTH_PLANS = {
  ON: {
    province: 'Ontario',
    provinceCode: 'ON',
    planName: 'Ontario Health Insurance Plan (OHIP)',
    governingBody: 'ServiceOntario / Ministry of Health',
    statute: 'Health Insurance Act, R.R.O. 1990, Reg. 552 (amended to remove the 3-month waiting period, first suspended on March 19, 2020)',
    hasWaitingPeriod: false,
    waitingPeriodRule: 'Immediate coverage upon establishing residence and approval by ServiceOntario.',
    workPermitMinMonths: 6,
    workPermitRequiresEmployment: true,
    internationalStudentEligible: false, // In Ontario, international students receive private UHIP through universities
    acceptedProofOfResidence: [
      'Ontario Driver’s Licence or Ontario Photo Card',
      'Residential lease agreement or property deed',
      'Utility bill (hydro, gas, water, internet) mailed to your Ontario address',
      'Bank statement from Canadian chartered bank showing Ontario address'
    ]
  },
  BC: {
    province: 'British Columbia',
    provinceCode: 'BC',
    planName: 'Medical Services Plan (MSP)',
    governingBody: 'Health Insurance BC (HIBC)',
    statute: 'Medicare Protection Act [RSBC 1996] c. 286, s. 7',
    hasWaitingPeriod: true,
    waitingPeriodRule: 'The remainder of the arrival month PLUS two full calendar months (approx. 60–90 days).',
    workPermitMinMonths: 6,
    workPermitRequiresEmployment: false,
    internationalStudentEligible: true, // BC covers international students with study permit >= 6 months ($75/mo health fee)
    acceptedProofOfResidence: [
      'BC Driver’s Licence or BC Services Card',
      'Residential tenancy agreement signed by landlord and tenant',
      'Utility bill or pay stub showing BC residential address',
      'Canadian bank account statement with BC address'
    ]
  },
  AB: {
    province: 'Alberta',
    provinceCode: 'AB',
    planName: 'Alberta Health Care Insurance Plan (AHCIP)',
    governingBody: 'Alberta Health / Registry Agents',
    statute: 'Alberta Health Care Insurance Act, RSA 2000, c. A-20',
    hasWaitingPeriod: false,
    waitingPeriodRule: 'Immediate coverage beginning on the exact date of arrival in Alberta from outside Canada.',
    workPermitMinMonths: 6,
    workPermitRequiresEmployment: false,
    internationalStudentEligible: true, // Study permit >= 12 months (or 6+ months with intent to stay 12+ months)
    acceptedProofOfResidence: [
      'Alberta Driver’s Licence or Alberta Identification Card',
      'Residential lease or mortgage agreement',
      'Utility bill or bank statement showing Alberta address',
      'Written confirmation of employment in Alberta'
    ]
  },
  QC: {
    province: 'Quebec',
    provinceCode: 'QC',
    planName: 'Régie de l’assurance maladie du Québec (RAMQ)',
    governingBody: 'RAMQ',
    statute: 'Health Insurance Act, CQLR c. A-29, s. 9 (Délai de carence de 3 mois)',
    hasWaitingPeriod: true,
    waitingPeriodRule: 'Statutory 3-month waiting period (Délai de carence) from date of arrival, unless exempt under a bilateral social security accord.',
    workPermitMinMonths: 6,
    workPermitRequiresEmployment: true,
    internationalStudentEligible: false,
    acceptedProofOfResidence: [
      'Quebec Driver’s Licence',
      'Residential lease agreement in Quebec',
      'Proof of active employment or employer contract in Quebec',
      'Hydro-Québec or telephone utility bill'
    ]
  },
  MB: {
    province: 'Manitoba',
    provinceCode: 'MB',
    planName: 'Manitoba Health',
    governingBody: 'Manitoba Health and Seniors Care',
    statute: 'The Health Services Insurance Act, C.C.S.M. c. H35',
    hasWaitingPeriod: false,
    waitingPeriodRule: 'Immediate coverage upon arrival from abroad for eligible permanent residents and work permit holders with 12+ month permits.',
    workPermitMinMonths: 12,
    workPermitRequiresEmployment: true,
    internationalStudentEligible: false,
    acceptedProofOfResidence: [
      'Manitoba Driver’s Licence',
      'Residential tenancy agreement in Manitoba',
      'Formal employment offer / contract in Manitoba',
      'Manitoba Hydro bill or bank statement'
    ]
  },
  SK: {
    province: 'Saskatchewan',
    provinceCode: 'SK',
    planName: 'Saskatchewan Health Card',
    governingBody: 'eHealth Saskatchewan',
    statute: 'The Saskatchewan Medical Care Insurance Act',
    hasWaitingPeriod: false,
    waitingPeriodRule: 'Immediate coverage for eligible work permit holders (6+ months) arriving directly from outside Canada.',
    workPermitMinMonths: 6,
    workPermitRequiresEmployment: true,
    internationalStudentEligible: true,
    acceptedProofOfResidence: [
      'Saskatchewan Driver’s Licence',
      'Signed residential lease agreement',
      'SaskPower / SaskEnergy utility bill',
      'Canadian bank account statement with Saskatchewan address'
    ]
  }
};

export const RAMQ_BILATERAL_ACCORD_COUNTRIES = new Set([
  'Belgium', 'Denmark', 'Finland', 'France', 'Greece',
  'Luxembourg', 'Norway', 'Portugal', 'Romania', 'Sweden'
]);

/**
 * Calculates calendar coverage effective date given a landing date and provincial rules.
 */
function computeEffectiveDate(provinceCode, landingDate) {
  const d = new Date(landingDate);
  if (isNaN(d.getTime())) return null;

  if (provinceCode === 'ON' || provinceCode === 'AB' || provinceCode === 'MB' || provinceCode === 'SK') {
    // Immediate coverage from landing date
    return new Date(d);
  }

  if (provinceCode === 'BC') {
    // Balance of arrival month + 2 full calendar months
    // Example: Arrives Oct 15 -> Oct balance + Nov (1) + Dec (2) -> Coverage begins Jan 1
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth(); // 0-indexed
    return new Date(Date.UTC(year, month + 3, 1));
  }

  if (provinceCode === 'QC') {
    // Exact 3 calendar months from arrival
    const eff = new Date(d);
    eff.setUTCMonth(eff.getUTCMonth() + 3);
    return eff;
  }

  return new Date(d);
}

/**
 * Evaluates universal provincial healthcare eligibility, waiting periods, and private bridge insurance requirements.
 * 
 * @param {object} options
 * @param {string} [options.province='ON'] - 'ON', 'BC', 'AB', 'QC', 'MB', 'SK'
 * @param {string} [options.immigrationStatus='pr'] - 'pr', 'work_permit', 'study_permit', 'visitor', 'refugee'
 * @param {number} [options.workPermitDurationMonths=12] - Duration of work permit in months
 * @param {boolean} [options.hasEmploymentOffer=true] - Whether applicant has Ontario/Quebec/Manitoba employment offer
 * @param {string} [options.landingDateStr] - 'YYYY-MM-DD' landing date (defaults to today)
 * @param {string} [options.originCountry='India'] - Origin country (checked for RAMQ accords)
 * @param {number} [options.householdSize=1] - Number of persons needing bridge insurance
 * @returns {object} Full healthcare diagnostic assessment
 */
export function evaluateHealthcareEligibility(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const {
    province = 'ON',
    immigrationStatus = 'pr',
    workPermitDurationMonths = 12,
    hasEmploymentOffer = true,
    landingDateStr,
    originCountry = 'India',
    householdSize = 1
  } = safeOptions;
  if (typeof province !== 'string' || !Object.hasOwn(PROVINCIAL_HEALTH_PLANS, province.toUpperCase())) throw new ValidationError('Choose a supported province');
  if (!['pr','work_permit','study_permit','visitor','refugee'].includes(immigrationStatus)) throw new ValidationError('Choose a supported immigration status');
  if (typeof hasEmploymentOffer !== 'boolean') throw new ValidationError('Employment offer must be true or false');
  if (!Number.isFinite(Number(workPermitDurationMonths)) || Number(workPermitDurationMonths)<0 || Number(workPermitDurationMonths)>1200) throw new ValidationError('Invalid work permit duration');
  if (!Number.isInteger(Number(householdSize)) || Number(householdSize)<1 || Number(householdSize)>20) throw new ValidationError('Household size must be 1–20');
  if (landingDateStr !== undefined) assertCalendarDate(landingDateStr, 'Landing date');
  const provCode = province.toUpperCase();
  const metroPlan = PROVINCIAL_HEALTH_PLANS[provCode];
  const permitMonths = Number.isFinite(Number(workPermitDurationMonths)) ? Math.max(0, Number(workPermitDurationMonths)) : 12;
  const safeHousehold = Math.min(20, Math.max(1, Number.isFinite(Number(householdSize)) ? Math.floor(Number(householdSize)) : 1));
  
  const landingDate = landingDateStr ? new Date(landingDateStr + 'T00:00:00Z') : new Date();
  const validLanding = isNaN(landingDate.getTime()) ? new Date() : landingDate;
  const validLandingStr = validLanding.toISOString().slice(0, 10);

  let isEligible = true;
  let ineligibilityReason = null;
  let isAccordExempt = false;

  // Eligibility verification by status
  if (immigrationStatus === 'visitor') {
    isEligible = false;
    ineligibilityReason = 'Visitors / Temporary Resident Visa holders are NOT eligible for provincial public healthcare under statutory regulations. Comprehensive travel medical emergency insurance is mandatory for the entire stay.';
  } else if (immigrationStatus === 'study_permit') {
    if (!metroPlan.internationalStudentEligible) {
      isEligible = false;
      ineligibilityReason = `In ${metroPlan.province}, international students are not covered by provincial public healthcare (${metroPlan.planName}). Students must enroll in university/college group health plans (e.g. UHIP in Ontario).`;
    }
  } else if (immigrationStatus === 'work_permit') {
    if (permitMonths < metroPlan.workPermitMinMonths) {
      isEligible = false;
      ineligibilityReason = `Work permit duration (${permitMonths} months) does not meet ${metroPlan.province} statutory minimum of ${metroPlan.workPermitMinMonths} months.`;
    } else if (metroPlan.workPermitRequiresEmployment && !hasEmploymentOffer) {
      isEligible = false;
      ineligibilityReason = `In ${metroPlan.province}, open work permit holders must provide proof of full-time employment (at least 6 months, minimum 30 hrs/wk) to activate public healthcare coverage.`;
    }
  }

  // Bilateral Accord check for Quebec
  if (provCode === 'QC' && RAMQ_BILATERAL_ACCORD_COUNTRIES.has(originCountry)) {
    isAccordExempt = true;
  }

  // Calculate Waiting Period Days & Effective Date
  let effectiveDate = validLanding;
  let waitingDays = 0;
  let bridgeInsuranceRequired = false;

  if (isEligible) {
    if (metroPlan.hasWaitingPeriod && !isAccordExempt) {
      effectiveDate = computeEffectiveDate(provCode, validLanding);
      waitingDays = Math.max(0, Math.ceil((effectiveDate.getTime() - validLanding.getTime()) / (1000 * 60 * 60 * 24)));
      bridgeInsuranceRequired = waitingDays > 0;
    } else {
      effectiveDate = validLanding;
      waitingDays = 0;
      bridgeInsuranceRequired = false;
    }
  } else {
    // If ineligible, 100% bridge insurance required
    waitingDays = 365;
    bridgeInsuranceRequired = true;
  }

  // Estimate Bridge Insurance Cost ($2.80/day per person standard rate)
  const dailyRatePerPerson = safeHousehold > 2 ? 2.20 : 2.80;
  const estimatedBridgeCostCad = bridgeInsuranceRequired 
    ? Math.round(waitingDays * dailyRatePerPerson * safeHousehold)
    : 0;

  // Free Community Health Centre Access note
  const chcAdvisory = 'If you experience an urgent health condition or need chronic medication refills while waiting for your provincial health card, Community Health Centres (CHCs) receive government funding to provide free ($0) primary healthcare to uninsured newcomers.';

  return {
    asOf: new Date().toISOString().slice(0, 10),
    assessmentType: 'preliminary_assessment',
    sourceCheckedAt: null,
    notice: 'Rule-based estimate requiring confirmation by the provincial authority. This is not an approval of coverage.',
    province: metroPlan.province,
    provinceCode: metroPlan.provinceCode,
    planName: metroPlan.planName,
    governingBody: metroPlan.governingBody,
    statute: metroPlan.statute,
    immigrationStatus,
    originCountry,
    isEligible,
    ineligibilityReason,
    isAccordExempt,
    landingDate: validLandingStr,
    coverageEffectiveDate: isEligible ? effectiveDate.toISOString().slice(0, 10) : 'Not Applicable (Ineligible)',
    waitingPeriodDays: waitingDays,
    bridgeInsuranceRequired,
    householdSize: safeHousehold,
    estimatedBridgeCostCad,
    acceptedProofOfResidence: metroPlan.acceptedProofOfResidence,
    chcAdvisory,
    statutoryGuidance: isAccordExempt
      ? `Under the Quebec-${originCountry} Social Security Agreement, you are exempt from the RAMQ 3-month waiting period. Present your Form SE-401-Q-207 or national health affiliation document at RAMQ registration.`
      : (bridgeInsuranceRequired 
          ? `Attention: In ${metroPlan.province}, statutory waiting rules apply (${metroPlan.waitingPeriodRule}). You have ${waitingDays} days without public coverage. Private emergency insurance is critically essential.`
          : `Great news: In ${metroPlan.province}, ${metroPlan.planName} provides immediate statutory coverage starting from your landing date (${validLandingStr}). No 3-month waiting period applies.`)
  };
}
