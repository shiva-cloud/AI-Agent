/**
 * Federal Parents and Grandparents Super Visa Medical Insurance & LICO Navigator
 *
 * Audits 5-year stay per entry authorizations, private medical insurance compliance
 * ($100,000 minimum coverage for 1 year from Canadian or designated foreign insurers),
 * upfront Immigration Medical Examination (IME) rules, and child/grandchild sponsor
 * Low-Income Cut-Off (LICO) thresholds under IRPA s. 15(1) and Ministerial Instructions.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const FEDERAL_SUPER_VISA_CONSTANTS = Object.freeze({
  PROGRAM_NAME: 'Parents and Grandparents Super Visa',
  MAX_INITIAL_STAY_YEARS: 5, // 2022 amendment increased from 2 to 5 years
  MIN_MEDICAL_INSURANCE_COVERAGE_CAD: 100000,
  MIN_INSURANCE_VALIDITY_DAYS: 365,
  STATUTORY_AUTHORITY: 'Immigration and Refugee Protection Act, SC 2001, c. 27, s. 15(1); Ministerial Instructions',
  LICO_BENCHMARK_2024: Object.freeze({
    1: 29380,
    2: 36576,
    3: 44966,
    4: 54594,
    5: 61920,
    6: 69835,
    7: 77751
  })
});

/**
 * Audits Super Visa medical insurance coverage, upfront medical exam, and sponsor LICO income.
 *
 * @param {Object} params
 * @param {number} [params.medicalInsuranceCoverageCad=100000] - Total emergency medical coverage in CAD
 * @param {number} [params.insurancePolicyValidityDays=365] - Total days of continuous valid coverage
 * @param {boolean} [params.insuranceFromApprovedProvider=true] - From Canadian insurer or designated foreign provider
 * @param {boolean} [params.proofOfInsurancePaymentProvided=true] - Paid in full or approved installment plan with receipt
 * @param {boolean} [params.completedUpfrontImeMedicalExam=true] - Completed panel physician medical exam
 * @param {number} [params.sponsorAnnualIncomeCad=65000] - Sponsor's Notice of Assessment (NOA) line 15000 income
 * @param {number} [params.householdSizeIncludingApplicants=4] - Total household members plus visiting parents/grandparents
 * @returns {Object} Comprehensive Super Visa eligibility audit and LICO determination
 */
export function evaluateFederalSuperVisaInsuranceLico(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Parent/Grandparent',
    sponsorName = 'Child/Grandchild',
    assessmentDate = todayIso(),
    medicalInsuranceCoverageCad = 100000,
    insurancePolicyValidityDays = 365,
    insuranceFromApprovedProvider = true,
    proofOfInsurancePaymentProvided = true,
    completedUpfrontImeMedicalExam = true,
    sponsorAnnualIncomeCad = 65000,
    householdSizeIncludingApplicants = 4,
    insuranceProviderName = 'Approved Insurer',
    policyNumber = 'SV-INS-001'
  } = safeParams;
  const cleanApplicantName = boundedText(applicantName, 'Parent/Grandparent', 100);
  const cleanSponsorName = boundedText(sponsorName, 'Child/Grandchild', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanProvider = boundedText(insuranceProviderName, 'Approved Insurer');
  const cleanPolicy = boundedText(policyNumber, 'SV-INS-001');
  const coverage = Math.max(0, Math.min(10000000, Number.isFinite(Number(medicalInsuranceCoverageCad)) ? Number(medicalInsuranceCoverageCad) : 0));
  const daysValid = Math.max(0, Math.min(3650, Number.isFinite(Number(insurancePolicyValidityDays)) ? Number(insurancePolicyValidityDays) : 0));
  const income = Math.max(0, Math.min(10000000, Number.isFinite(Number(sponsorAnnualIncomeCad)) ? Number(sponsorAnnualIncomeCad) : 0));
  const hSize = Math.max(1, Math.min(7, Number.isFinite(Number(householdSizeIncludingApplicants)) ? Math.round(Number(householdSizeIncludingApplicants)) : 1));

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Medical Insurance Coverage Audit ($100k min, 1 year validity)
  if (coverage < FEDERAL_SUPER_VISA_CONSTANTS.MIN_MEDICAL_INSURANCE_COVERAGE_CAD) {
    statutoryViolations.push({
      rule: 'SUBSTANDARD_MEDICAL_INSURANCE_COVERAGE',
      statute: 'IRPA s. 15(1) Super Visa Ministerial Instructions',
      finding: `Insurance coverage is $${coverage.toLocaleString()} CAD. Minimum $100,000 CAD emergency hospitalization and repatriation coverage is mandatory.`
    });
    actionableRemedies.push({
      action: 'UPGRADE_INSURANCE_POLICY_TO_100K',
      remedyDescription: 'Endorse insurance policy to provide at least $100,000 CAD emergency coverage.'
    });
  }

  if (daysValid < FEDERAL_SUPER_VISA_CONSTANTS.MIN_INSURANCE_VALIDITY_DAYS) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_INSURANCE_VALIDITY_PERIOD',
      statute: 'Super Visa Operational Guidelines',
      finding: `Policy valid for ${daysValid} days. Must cover at least 365 days from date of expected entry into Canada.`
    });
  }

  if (!insuranceFromApprovedProvider) {
    statutoryViolations.push({
      rule: 'UNAPPROVED_INSURANCE_UNDERWRITER',
      statute: 'IRCC Super Visa Insurer Designation Notice',
      finding: 'Policy must be underwritten by an authorized Canadian insurance company or a designated foreign insurance provider.'
    });
  }

  if (!proofOfInsurancePaymentProvided) {
    riskWarnings.push({
      warningType: 'MISSING_PAYMENT_PROOF',
      description: 'Quotes are insufficient. Application must include official payment receipt or proof of approved monthly installment program.'
    });
  }

  // 2. Upfront Medical Examination (IME)
  if (!completedUpfrontImeMedicalExam) {
    statutoryViolations.push({
      rule: 'MISSING_UPFRONT_IMMIGRATION_MEDICAL_EXAMINATION',
      statute: 'IRPR s. 30(1)(a)',
      finding: 'Super Visa applicants must complete an upfront immigration medical examination with an e-Medical panel physician.'
    });
    actionableRemedies.push({
      action: 'BOOK_PANEL_PHYSICIAN_IME_EXAM',
      remedyDescription: 'Locate an IRCC-approved panel physician and book an upfront Super Visa IME.'
    });
  }

  // 3. Sponsor Income LICO Audit
  const requiredLicoCad = FEDERAL_SUPER_VISA_CONSTANTS.LICO_BENCHMARK_2024[hSize] || 54594;
  const incomeDeficitCad = Math.max(0, requiredLicoCad - income);

  if (incomeDeficitCad > 0) {
    statutoryViolations.push({
      rule: 'SPONSOR_INCOME_BELOW_LICO_THRESHOLD',
      statute: 'IRPR s. 2 / Ministerial Instructions',
      finding: `Sponsor NOA income of $${income.toLocaleString()} CAD is below the required LICO benchmark of $${requiredLicoCad.toLocaleString()} CAD for household size ${hSize}. Deficit: $${incomeDeficitCad.toLocaleString()} CAD.`
    });
    actionableRemedies.push({
      action: 'ADD_CO_SIGNING_SPOUSE_INCOME',
      remedyDescription: 'Include spouse or common-law partner of the Canadian child/grandchild as a co-signer to combine Line 15000 NOA incomes.'
    });
  }

  const isEligible = statutoryViolations.length === 0;
  let eligibilityVerdict = 'ELIGIBLE_FOR_SUPER_VISA';
  let legalVerdict = 'Applicant and sponsor satisfy all Super Visa insurance, medical exam, and LICO income criteria. Qualifies for up to 5-year stay per entry.';

  if (!isEligible) {
    eligibilityVerdict = 'INELIGIBLE_FOR_SUPER_VISA';
    legalVerdict = `Super Visa criteria not met due to ${statutoryViolations.length} statutory deficiency${statutoryViolations.length === 1 ? '' : 's'}. Review necessary conditions before applying.`;
  }

  return {
    applicantName: cleanApplicantName,
    sponsorName: cleanSponsorName,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    insuranceProviderName: cleanProvider,
    policyNumber: cleanPolicy,
    programName: FEDERAL_SUPER_VISA_CONSTANTS.PROGRAM_NAME,
    maxStayPerEntryYears: FEDERAL_SUPER_VISA_CONSTANTS.MAX_INITIAL_STAY_YEARS,
    householdSize: hSize,
    isEligible,
    eligibilityVerdict,
    legalVerdict,
    financialSummary: {
      insuranceCoverageCad: coverage,
      policyValidityDays: daysValid,
      sponsorIncomeCad: income,
      requiredLicoCad,
      incomeDeficitCad,
      hasCoSignerOption: incomeDeficitCad > 0
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Act, SC 2001, c. 27, s. 15(1)',
      'Immigration and Refugee Protection Regulations, SOR/2002-227, s. 30 (Medical examinations)',
      'Ministerial Instructions Regarding the Parent and Grandparent Super Visa (Bill C-242 Revisions)'
    ]
  };
}