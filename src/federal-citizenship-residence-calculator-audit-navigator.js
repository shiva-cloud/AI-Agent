/**
 * Federal Citizenship Physical Presence & Residence Audit Navigator
 *
 * Evaluates citizenship physical presence compliance under Canada's
 * Citizenship Act, R.S.C. 1985, c. C-29, ss. 5(1)(c), 5(1.001), 21, and IRPR.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const CITIZENSHIP_PRESENCE_REQUIREMENTS = Object.freeze({
  STATUTORY_PRESENCE_DAYS_REQUIRED: 1095, // 3 out of 5 years
  ELIGIBILITY_WINDOW_YEARS: 5,
  MAX_TEMPORARY_RESIDENT_CREDIT_DAYS: 365, // Max 1 year credit
  TEMPORARY_RESIDENT_DAY_MULTIPLIER: 0.5, // 1 day TR = 0.5 day credit
  PERMANENT_RESIDENT_DAY_MULTIPLIER: 1.0, // 1 day PR = 1.0 day credit
  CITIZENSHIP_APPLICATION_FEE_ADULT_CAD: 630, // $530 processing + $100 right of citizenship
  CITIZENSHIP_APPLICATION_FEE_MINOR_CAD: 100,
  STATUTORY_AUTHORITY: 'Citizenship Act, R.S.C. 1985, c. C-29, s. 5(1)(c)'
});

/**
 * Audits physical presence and calculates statutory eligibility for Canadian citizenship.
 *
 * @param {Object} params
 * @param {string} [params.applicationTargetDate] - Target date for application (YYYY-MM-DD)
 * @param {number} [params.daysPresentAsPermanentResident=0] - Full days physically present in Canada as PR in 5-yr window
 * @param {number} [params.daysPresentAsTemporaryResident=0] - Full days present as TR (work/study/visitor/TRP) before PR in 5-yr window
 * @param {number} [params.daysSpentIncarceratedOrProbation=0] - Ineligible days under s. 21 (jail, probation, parole)
 * @param {boolean} [params.isAdultApplicant=true] - Whether applicant is 18+ (s. 5(1)) vs minor under 18 (s. 5(2))
 * @param {boolean} [params.hasIncomeTaxFilingCompliance=true] - Met tax obligations under Income Tax Act for relevant taxation years
 * @param {boolean} [params.meetsLanguageAndKnowledgeCriteria=true] - CLB 4 English/French and knowledge of Canada (ages 18-54)
 * @param {number} [params.applicantAge=30] - Age of applicant
 * @returns {Object} Physical presence audit and eligibility assessment
 */
export function auditCitizenshipPhysicalPresence(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    assessmentDate = todayIso(),
    applicationTargetDate = '2026-10-31',
    daysPresentAsPermanentResident = 0,
    daysPresentAsTemporaryResident = 0,
    daysSpentIncarceratedOrProbation = 0,
    isAdultApplicant = true,
    hasIncomeTaxFilingCompliance = true,
    meetsLanguageAndKnowledgeCriteria = true,
    applicantAge = 30
  } = safeParams;

  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const sanitizedTargetDate = safeIsoDate(applicationTargetDate, '');
  const validTargetDate = Boolean(sanitizedTargetDate);
  const effectiveDate = validTargetDate ? sanitizedTargetDate : cleanAssessmentDate;

  const prDays = Math.max(0, Math.min(3650, Number.isFinite(Number(daysPresentAsPermanentResident)) ? Number(daysPresentAsPermanentResident) : 0));
  const rawTrDays = Math.max(0, Math.min(3650, Number.isFinite(Number(daysPresentAsTemporaryResident)) ? Number(daysPresentAsTemporaryResident) : 0));
  const penalDays = Math.max(0, Math.min(3650, Number.isFinite(Number(daysSpentIncarceratedOrProbation)) ? Number(daysSpentIncarceratedOrProbation) : 0));
  const age = Math.max(0, Math.min(120, Number.isFinite(Number(applicantAge)) ? Number(applicantAge) : 30));

  // 1. Calculate Temporary Resident Credit (s. 5(1.001)): 0.5x raw days up to 365 credit days
  const unroundedTrCredit = rawTrDays * CITIZENSHIP_PRESENCE_REQUIREMENTS.TEMPORARY_RESIDENT_DAY_MULTIPLIER;
  const allowableTrCreditDays = Math.min(
    CITIZENSHIP_PRESENCE_REQUIREMENTS.MAX_TEMPORARY_RESIDENT_CREDIT_DAYS,
    Math.floor(unroundedTrCredit)
  );

  // 2. Net qualifying physical presence
  const grossCreditedDays = prDays + allowableTrCreditDays;
  const netQualifyingPresenceDays = Math.max(0, grossCreditedDays - penalDays);

  const daysRequired = CITIZENSHIP_PRESENCE_REQUIREMENTS.STATUTORY_PRESENCE_DAYS_REQUIRED;
  const surplusOrDeficitDays = netQualifyingPresenceDays - daysRequired;
  const meetsPhysicalPresenceThreshold = surplusOrDeficitDays >= 0;

  // 3. Language & Knowledge requirement age exemptions (s. 5(1)(d), (e)): required only for ages 18-54
  const isSubjectToLanguageKnowledge = age >= 18 && age <= 54;
  

  // 4. Ineligibility and risk flags
  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  if (!meetsPhysicalPresenceThreshold) {
    const deficit = Math.abs(surplusOrDeficitDays);
    statutoryViolations.push({
      rule: 'INSUFFICIENT_PHYSICAL_PRESENCE',
      statute: 'Citizenship Act s. 5(1)(c)(i)',
      finding: `Deficit of ${deficit} physical presence day${deficit === 1 ? '' : 's'}. You have ${netQualifyingPresenceDays} credited days out of the mandatory ${daysRequired} days.`
    });
    actionableRemedies.push({
      action: 'ACCRUE_REMAINING_DAYS_AS_PR',
      remedyDescription: `Remain physically present in Canada as a Permanent Resident for at least ${deficit} additional day${deficit === 1 ? '' : 's'} before submitting Form CIT 0002.`
    });
  }

  if (penalDays > 0) {
    statutoryViolations.push({
      rule: 'STATUTORY_PROHIBITION_PENAL_TIME',
      statute: 'Citizenship Act s. 21',
      finding: `${penalDays} day${penalDays === 1 ? '' : 's'} spent serving a sentence, on probation, or incarcerated are statutorily excluded from physical presence.`
    });
  }

  if (!hasIncomeTaxFilingCompliance) {
    statutoryViolations.push({
      rule: 'INCOME_TAX_FILING_NON_COMPLIANCE',
      statute: 'Citizenship Act s. 5(1)(c)(iii)',
      finding: 'Applicant has not fulfilled Canadian income tax filing obligations for the required taxation years within the 5-year eligibility window.'
    });
    actionableRemedies.push({
      action: 'SUBMIT_OUTSTANDING_TAX_RETURNS',
      remedyDescription: 'File all outstanding T1 personal income tax returns with the Canada Revenue Agency (CRA) and obtain Notices of Assessment.'
    });
  }

  if (isSubjectToLanguageKnowledge && !meetsLanguageAndKnowledgeCriteria) {
    statutoryViolations.push({
      rule: 'LANGUAGE_OR_KNOWLEDGE_NOT_MET',
      statute: 'Citizenship Act s. 5(1)(d), (e)',
      finding: 'Applicants aged 18 to 54 must demonstrate CLB 4 English or French proficiency and pass the Canadian citizenship knowledge test.'
    });
    actionableRemedies.push({
      action: 'OBTAIN_CLB4_AND_PREPARE_TEST',
      remedyDescription: 'Enroll in LINC or prepare standardized test results (CELPIP-G, IELTS General, TEF Canada, or Canadian secondary/post-secondary credential).'
    });
  }

  if (!validTargetDate) {
    riskWarnings.push({
      warningType: 'INVALID_APPLICATION_TARGET_DATE',
      description: `Target date '${applicationTargetDate}' is not a valid ISO date format. Defaulted to '${effectiveDate}'.`
    });
  }

  if (rawTrDays > 0 && unroundedTrCredit > CITIZENSHIP_PRESENCE_REQUIREMENTS.MAX_TEMPORARY_RESIDENT_CREDIT_DAYS) {
    riskWarnings.push({
      warningType: 'TEMPORARY_RESIDENT_CAP_REACHED',
      description: `Raw temporary resident days (${rawTrDays}) exceeded the maximum allowable credit of 365 days. Only 365 days could be credited.`
    });
  }

  if (surplusOrDeficitDays >= 0 && surplusOrDeficitDays < 15) {
    riskWarnings.push({
      warningType: 'SLIM_PRESENCE_BUFFER',
      description: `Surplus of ${surplusOrDeficitDays} day${surplusOrDeficitDays === 1 ? '' : 's'} leaves virtually no buffer for border calculation discrepancies or leap-year day adjustments. IRCC strongly recommends a 15-30 day cushion.`
    });
  }

  // 5. Final verdict determination
  let eligibilityVerdict = 'ELIGIBLE_FOR_CITIZENSHIP';
  let isEligible = true;

  if (statutoryViolations.length > 0) {
    isEligible = false;
    if (!meetsPhysicalPresenceThreshold) {
      eligibilityVerdict = 'INELIGIBLE_INSUFFICIENT_PRESENCE';
    } else if (!hasIncomeTaxFilingCompliance) {
      eligibilityVerdict = 'INELIGIBLE_TAX_NON_COMPLIANCE';
    } else {
      eligibilityVerdict = 'INELIGIBLE_STATUTORY_REQUIREMENTS_NOT_MET';
    }
  }

  const statutoryFeeCad = isAdultApplicant
    ? CITIZENSHIP_PRESENCE_REQUIREMENTS.CITIZENSHIP_APPLICATION_FEE_ADULT_CAD
    : CITIZENSHIP_PRESENCE_REQUIREMENTS.CITIZENSHIP_APPLICATION_FEE_MINOR_CAD;

  return {
    applicantName: cleanApplicantName,
    assessmentDate: cleanAssessmentDate,
    jurisdiction: 'FEDERAL_CANADA',
    applicationTargetDate: effectiveDate,
    isAdultApplicant,
    applicantAge: age,
    isEligible,
    eligibilityVerdict,
    presenceSummary: {
      daysRequired,
      daysCreditedFromPermanentResidence: prDays,
      rawDaysAsTemporaryResident: rawTrDays,
      creditedDaysFromTemporaryResidence: allowableTrCreditDays,
      daysExcludedUnderPenalProhibition: penalDays,
      netQualifyingPresenceDays,
      surplusOrDeficitDays,
      meetsPhysicalPresenceThreshold
    },
    statutoryFees: {
      applicationFeeCad: statutoryFeeCad,
      isRightOfCitizenshipIncluded: isAdultApplicant
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Citizenship Act, R.S.C. 1985, c. C-29, ss. 5(1)(c), 5(1.001), 21',
      'Immigration and Refugee Protection Act, S.C. 2001, c. 27',
      'Citizenship Regulations, SOR/93-246'
    ]
  };
}
