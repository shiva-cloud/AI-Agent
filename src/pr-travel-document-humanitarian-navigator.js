/**
 * Permanent Resident Travel Document (PRTD) & Humanitarian/Compassionate (H&C) Engine
 *
 * Implements statutory assessment under:
 * - Immigration and Refugee Protection Act (SC 2001 c. 27) ss. 28(2)(c), 31(3), 63(4), 67(1)(c)
 * - Immigration and Refugee Protection Regulations (SOR/2002-227) s. 61 (PRTD Issuance)
 * - Supreme Court Landmark Precedents: Kanthasamy v. Canada (MCI), 2015 SCC 61; Chieu v. Canada, 2002 SCC 3
 * - Federal Court Precedents on Residency Obligation H&C: Bufete v. Canada, 2016 FC 714
 *
 * Key Statutory Rules:
 * - Mandatory H&C Review (IRPA s. 28(2)(c)): When a permanent resident outside Canada fails to satisfy
 *   the 730-day residency obligation, a visa officer MUST consider whether humanitarian and compassionate
 *   considerations, taking into account the Best Interests of a Child (BIOC), justify the retention of status.
 * - Assessment Factors (Kanthasamy & Guidelines):
 *   (1) Reasons for departure and compelling factors preventing return (e.g. critical illness of parents,
 *       custody orders abroad, sudden travel restrictions);
 *   (2) Degree of establishment in Canada prior to departure (years of residence, Canadian employment history,
 *       tax filings, real property ownership, community involvement);
 *   (3) Best Interests of a Child (BIOC) under 18 directly affected (education, emotional stability, citizenship);
 *   (4) Hardship to family members in Canada who are Canadian citizens or PRs.
 * - Statutory Right of Appeal (IRPA s. 63(4)): If the PRTD is refused, the PR has a statutory right to appeal
 *   to the Immigration Appeal Division (IAD) within 60 days of receiving the refusal notice.
 * - Mandatory 365-Day In-Person Travel Document (IRPA s. 31(3)(c)):
 *   If the applicant was physically present in Canada for at least 365 days during the 5 years immediately
 *   preceding the examination, the visa officer MUST issue a PRTD to allow the applicant to return to Canada
 *   to attend their IAD appeal hearing in person.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const PRTD_HC_CONSTANTS = Object.freeze({
  STATUTORY_RESIDENCY_DAYS_REQUIRED: 730,
  FIVE_YEAR_BENCHMARK_DAYS: 1825,
  IN_PERSON_APPEAL_TRAVEL_DOCUMENT_DAYS: 365,
  IAD_APPEAL_LIMITATION_DAYS: 60,
  PRTD_APPLICATION_FEE_CAD: 50.0
});

/**
 * Evaluates H&C grounds, BIOC factors, and appeal rights for a PR facing residency obligation breach abroad.
 *
 * @param {Object} options
 * @param {number} [options.daysPhysicallyInCanadaLast5Years=420] - Days physically present in Canada
 * @param {string} [options.reasonForAbsenceCategory='care_for_critically_ill_family'] - 'care_for_critically_ill_family', 'own_serious_medical_treatment', 'family_custody_dispute', 'involuntary_delay', 'employment_abroad_non_canadian', 'personal_choice'
 * @param {boolean} [options.hasDocumentaryProofOfCompellingCircumstance=true] - Medical records, death certificates, hospital records
 * @param {number} [options.yearsResidedInCanadaPriorToAbsence=4] - Total historical years lived in Canada
 * @param {boolean} [options.filedCanadianTaxesConsecutively=true] - CRA Notice of Assessments filed
 * @param {boolean} [options.ownsResidentialHomeOrAssetsInCanada=true] - Owns real estate, pension, or substantial assets in Canada
 * @param {boolean} [options.hasMinorCanadianChildrenAffected=true] - Child under 18 affected by PR loss
 * @param {boolean} [options.hasCanadianCitizenSpouseInCanada=false] - Spouse is in Canada
 * @param {string} [options.applicantName='PR Applicant Abroad'] - Name of applicant
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive PRTD H&C evaluation and IAD appeal audit
 */
export function evaluatePrtdHumanitarian(options = {}) {
  const physicalDays = Number.isFinite(Number(options.daysPhysicallyInCanadaLast5Years)) ? Math.max(0, Math.min(1825, Math.floor(Number(options.daysPhysicallyInCanadaLast5Years)))) : 420;
  const rawReason = boundedText(options.reasonForAbsenceCategory, 50).toLowerCase() || 'care_for_critically_ill_family';
  const reasonCategory = ['care_for_critically_ill_family', 'own_serious_medical_treatment', 'family_custody_dispute', 'involuntary_delay', 'employment_abroad_non_canadian', 'personal_choice'].includes(rawReason)
    ? rawReason
    : 'care_for_critically_ill_family';

  const hasProof = options.hasDocumentaryProofOfCompellingCircumstance !== false;
  const yearsInCanada = Number.isFinite(Number(options.yearsResidedInCanadaPriorToAbsence)) ? Math.max(0, Math.min(60, Number(options.yearsResidedInCanadaPriorToAbsence))) : 4;
  const filedTaxes = options.filedCanadianTaxesConsecutively !== false;
  const hasAssets = options.ownsResidentialHomeOrAssetsInCanada !== false;
  const hasBioc = Boolean(options.hasMinorCanadianChildrenAffected);
  const spouseInCanada = Boolean(options.hasCanadianCitizenSpouseInCanada);
  const applicant = boundedText(options.applicantName, 120) || 'PR Applicant Abroad';
  const assessDate = safeIsoDate(options.assessmentDate);

  const meetsStandardResidency = physicalDays >= PRTD_HC_CONSTANTS.STATUTORY_RESIDENCY_DAYS_REQUIRED;
  const shortfallDays = meetsStandardResidency ? 0 : PRTD_HC_CONSTANTS.STATUTORY_RESIDENCY_DAYS_REQUIRED - physicalDays;

  // 1. Evaluate H&C Merits Score & Factor Breakdown
  let hcStrength = 'WEAK';
  let hcScore = 0;
  const positiveHcFactors = [];
  const riskFactors = [];
  const riskWarnings = [];
  const statutoryProtections = [];
  const actionPlan = [];

  // Compelling reasons factor
  if (['care_for_critically_ill_family', 'own_serious_medical_treatment'].includes(reasonCategory)) {
    if (hasProof) {
      hcScore += 35;
      positiveHcFactors.push(`Compassionate ground: Documentary evidence substantiates absence for ${reasonCategory.replace(/_/g, ' ')} (satisfies Kanthasamy threshold).`);
    } else {
      hcScore += 15;
      riskFactors.push(`Uncorroborated reason: Absence category is compassionate, but lacks formal third-party hospital records, death certificates, or medical practitioner letters.`);
    }
  } else if (['family_custody_dispute', 'involuntary_delay'].includes(reasonCategory)) {
    if (hasProof) {
      hcScore += 25;
      positiveHcFactors.push('Legal or physical impediment prevented timely return to Canada.');
    } else {
      hcScore += 10;
      riskFactors.push('Impediment or delay is not supported by court orders or flight cancellation logs.');
    }
  } else {
    riskFactors.push('Absence due to voluntary foreign employment or personal convenience carries low H&C weight under established IAD jurisprudence.');
  }

  // Establishment in Canada factor
  let establishmentScore = 0;
  if (yearsInCanada >= 3) establishmentScore += 15;
  if (filedTaxes) establishmentScore += 10;
  if (hasAssets) establishmentScore += 10;
  hcScore += establishmentScore;

  if (establishmentScore >= 20) {
    positiveHcFactors.push(`Substantial establishment: ${yearsInCanada} years historical residence, consecutive tax compliance, and Canadian assets/real estate.`);
  } else {
    riskFactors.push('Limited Canadian ties or failure to maintain tax residency reduces establishment weight.');
  }

  // Best Interests of a Child (BIOC) factor
  if (hasBioc) {
    hcScore += 30;
    positiveHcFactors.push('Best Interests of a Child (BIOC): S.C.C. Kanthasamy requires officers to be "alert, alive and sensitive" to the welfare and educational/medical stability of minor children.');
    statutoryProtections.push('IRPA s. 28(2)(c) & Kanthasamy: Best interests of a child is an independent statutory consideration that can justify retaining status.');
  }

  // Family hardship in Canada
  if (spouseInCanada) {
    hcScore += 15;
    positiveHcFactors.push('Family Unity: Separation from a spouse or dependents physically living in Canada supports compassionate intervention.');
  }

  // Determine overall H&C strength
  if (hcScore >= 65) {
    hcStrength = 'STRONG';
  } else if (hcScore >= 45) {
    hcStrength = 'MODERATE';
  } else {
    hcStrength = 'VULNERABLE';
  }

  // 2. Mandatory 365-Day In-Person Travel Document Rule (IRPA s. 31(3)(c))
  const qualifiesForMandatoryAppealTravelDoc = physicalDays >= PRTD_HC_CONSTANTS.IN_PERSON_APPEAL_TRAVEL_DOCUMENT_DAYS;
  if (qualifiesForMandatoryAppealTravelDoc) {
    statutoryProtections.push(`IRPA s. 31(3)(c) Statutory Right: With ${physicalDays} days in Canada (>= 365 days), if the officer refuses the PRTD and an appeal is filed, Canada MUST issue a travel document to enable in-person attendance at the IAD hearing.`);
  } else {
    riskWarnings.push(`Under 365 days physically in Canada (${physicalDays} days). If refused, applicant must apply to the IAD for special leave to appear in person or conduct hearing virtually.`);
  }

  // 3. Right of Appeal (IRPA s. 63(4))
  statutoryProtections.push(`IRPA s. 63(4): 60-day limitation window to file Notice of Appeal with the Immigration Appeal Division (IAD) following any written refusal.`);

  // 4. Action Plan
  actionPlan.push('Submit Form IMM 5524 via the PR Portal attaching a comprehensive "Request for Humanitarian & Compassionate Relief under IRPA s. 28(2)(c)".');
  actionPlan.push('Collate medical practitioner reports, hospital records, and death certificates proving involuntary duration of absence.');
  if (hasBioc) {
    actionPlan.push('Obtain birth certificates, school records, and family impact affidavits detailing the Best Interests of the Child.');
  }
  actionPlan.push('If a negative determination (Section 44 report) is issued, immediately file an IAD appeal within the strict 60-day statutory window.');

  return {
    applicantName: applicant,
    assessmentDate: assessDate,
    residencyOverview: {
      physicalDaysInCanada: physicalDays,
      residencyObligationSatisfied: meetsStandardResidency,
      daysShortfall: shortfallDays,
      benchmarkDays: PRTD_HC_CONSTANTS.STATUTORY_RESIDENCY_DAYS_REQUIRED
    },
    humanitarianAssessment: {
      overallHcStrength: hcStrength,
      hcScore,
      absenceReasonCategory: reasonCategory,
      isAbsenceDocumented: hasProof,
      bestInterestsOfChildEngaged: hasBioc,
      positiveHcFactors,
      riskFactors
    },
    appealRights: {
      statutoryAppealRight: 'IRPA s. 63(4) (60 calendar days to file with IAD)',
      qualifiesForMandatoryInPersonTravelDocument: qualifiesForMandatoryAppealTravelDoc,
      statutoryAuthority: 'IRPA s. 31(3)(c)'
    },
    statutoryProtections,
    riskWarnings,
    actionPlan
  };
}
