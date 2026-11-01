/**
 * Northstar Employment Insurance (EI) & Parental Benefits Navigator (Recs 92, 93, 94, 95, 96)
 * Implements statutory standards for:
 * 1. EI Regular Benefits: 420-700 insurable hours grid & 55% benefit rate ($668/wk max)
 * 2. EI Voluntary Quit / Misconduct Just Cause Defense (EI Act s. 29(c))
 * 3. EI Sickness Benefits: 26 weeks statutory maximum & medical certificate
 * 4. Maternity (15 wks) & Standard (35 wks) vs Extended (61 wks) Parental Leave
 * 5. Quebec Parental Insurance Plan (QPIP): Exclusive non-transferable paternity benefits
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const EI_CONSTANTS = {
  MAX_INSURABLE_EARNINGS_CAD_2024: 63200,
  MAX_WEEKLY_BENEFIT_CAD_2024: 668, // 55% of $63,200 / 52
  EXTENDED_PARENTAL_RATE_PERCENT: 0.33,
  MAX_WEEKLY_EXTENDED_PARENTAL_CAD_2024: 401, // 33% rate

  SICKNESS_MAX_WEEKS: 26, // Extended from 15 weeks under Dec 2022 amendments
  MATERNITY_MAX_WEEKS: 15,
  STANDARD_PARENTAL_MAX_SINGLE_PARENT_WEEKS: 35,
  STANDARD_PARENTAL_SHARED_MAX_WEEKS: 40,
  EXTENDED_PARENTAL_MAX_SINGLE_PARENT_WEEKS: 61,
  EXTENDED_PARENTAL_SHARED_MAX_WEEKS: 69,

  SPECIAL_BENEFITS_INSURABLE_HOURS_REQUIRED: 600, // Sickness, Maternity, Parental

  QPIP_PATERNITY_BASIC_PLAN_WEEKS: 5,
  QPIP_PATERNITY_BASIC_PLAN_PERCENT: 0.70
};

/**
 * Evaluates EI Regular Benefits Eligibility & Payment Rate
 */
export function evaluateEiRegularBenefits(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    assessmentDate = '2026-10-31',
    insurableHoursAccrued = 650,
    regionalUnemploymentRatePercent = 7.5,
    averageWeeklyInsurableEarningsCad = 1100,
    reasonForSeparation = 'layoff_shortage_of_work' // 'layoff_shortage_of_work', 'quit', 'dismissed_misconduct'
  } = safeParams;

  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanHours = Number.isFinite(Number(insurableHoursAccrued)) ? Math.max(0, Math.floor(Number(insurableHoursAccrued))) : 650;
  const cleanUnempRate = Number.isFinite(Number(regionalUnemploymentRatePercent)) ? Math.min(30, Math.max(0, Number(regionalUnemploymentRatePercent))) : 7.5;
  const cleanEarnings = Number.isFinite(Number(averageWeeklyInsurableEarningsCad)) ? Math.max(0, Number(averageWeeklyInsurableEarningsCad)) : 1100;
  const cleanReason = boundedText(reasonForSeparation, 'layoff_shortage_of_work', 60);

  // Regional unemployment hours threshold table
  let requiredHours = 700;
  if (cleanUnempRate >= 13.1) requiredHours = 420;
  else if (cleanUnempRate >= 12.1) requiredHours = 455;
  else if (cleanUnempRate >= 11.1) requiredHours = 490;
  else if (cleanUnempRate >= 10.1) requiredHours = 525;
  else if (cleanUnempRate >= 9.1) requiredHours = 560;
  else if (cleanUnempRate >= 8.1) requiredHours = 595;
  else if (cleanUnempRate >= 7.1) requiredHours = 630;
  else if (cleanUnempRate >= 6.1) requiredHours = 665;
  else requiredHours = 700;

  const hasSufficientHours = cleanHours >= requiredHours;
  const isSeparationEligible = cleanReason === 'layoff_shortage_of_work';

  const weeklyBenefitRate = Math.min(
    Math.round(cleanEarnings * 0.55 * 100) / 100,
    EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD_2024
  );

  return {
    applicantName: cleanApplicantName,
    assessmentDate: cleanAssessmentDate,
    statutoryBasis: 'Employment Insurance Act (S.C. 1996, c. 23), s. 7, s. 14',
    isEligible: hasSufficientHours && isSeparationEligible,
    insurableHoursAccrued: cleanHours,
    regionalUnemploymentRatePercent: cleanUnempRate,
    requiredHoursThreshold: requiredHours,
    hoursSurplusOrDeficit: cleanHours - requiredHours,
    estimatedWeeklyBenefitCad: hasSufficientHours && isSeparationEligible ? weeklyBenefitRate : 0,
    maxStatutoryWeeklyRateCad: EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD_2024,
    waitingPeriod: '1-week non-payable waiting period applies at the start of the claim.',
    disqualifications: !isSeparationEligible
      ? [`Separation reason '${reasonForSeparation}' requires establishing just cause or lack of misconduct under EI Act s. 29.`]
      : (!hasSufficientHours ? [`Need ${requiredHours - cleanHours} more insurable hours in qualifying period.`] : [])
  };
}

/**
 * Audits Just Cause Defense for Voluntary Quit under EI Act s. 29(c)
 */
export function auditEiVoluntaryQuitJustCause(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    assessmentDate = '2026-10-31',
    quitReasonCategory = 'spouse_relocation',
    hasProofDocumentation = true
  } = safeParams;

  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanQuitReason = boundedText(quitReasonCategory, 'spouse_relocation', 60);

  const recognizedGrounds = [
    'spouse_relocation',
    'harassment',
    'wage_cut',
    'unsafe_conditions',
    'discrimination',
    'care_for_child_or_immediate_family',
    'employer_demands_illegal_acts'
  ];

  const isRecognizedGround = recognizedGrounds.includes(cleanQuitReason.toLowerCase());
  const isJustCauseEstablished = isRecognizedGround && hasProofDocumentation;

  return {
    applicantName: cleanApplicantName,
    assessmentDate: cleanAssessmentDate,
    statutoryBasis: 'Employment Insurance Act, s. 29(c) (Just Cause for Voluntarily Leaving Employment)',
    quitReasonCategory: cleanQuitReason,
    isJustCauseEstablished,
    statutoryRule: isJustCauseEstablished
      ? 'JUST CAUSE ESTABLISHED: Under EI Act s. 29(c), leaving employment is legally justified where the claimant had no reasonable alternative to leaving, having regard to all circumstances. The claimant is NOT disqualified from receiving EI benefits.'
      : 'DISQUALIFICATION RISK: Service Canada presumes voluntary quits are non-compensable unless documentary proof (e.g. medical notes, grievance letters, police reports, spouse proof of relocation) establishes that no reasonable alternative existed.',
    remedySteps: [
      'Submit Form INS5240 (Statements of Claimant) providing concrete timeline of employer conditions.',
      'Provide contemporaneous proof (emails objecting to conditions, medical notes, employer letter of relocation for spouse).',
      'If initial claim is refused, file a Request for Reconsideration within 30 days under s. 112.'
    ]
  };
}

/**
 * Evaluates EI Sickness, Maternity & Parental Leave Options
 */
export function evaluateEiParentalAndSicknessBenefits(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    assessmentDate = '2026-10-31',
    benefitType = 'parental_standard', // 'sickness', 'maternity', 'parental_standard', 'parental_extended', 'qpip_paternity'
    insurableHoursAccrued = 600,
    averageWeeklyEarningsCad = 1200,
    hasMedicalCertificate = true,
    provinceOfResidence = 'ON'
  } = safeParams;

  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanProvince = boundedText(provinceOfResidence, 'ON', 10).toUpperCase();
  const cleanHours = Number.isFinite(Number(insurableHoursAccrued)) ? Math.max(0, Math.floor(Number(insurableHoursAccrued))) : 600;
  const cleanEarnings = Number.isFinite(Number(averageWeeklyEarningsCad)) ? Math.max(0, Number(averageWeeklyEarningsCad)) : 1200;
  const meets600Hours = cleanHours >= EI_CONSTANTS.SPECIAL_BENEFITS_INSURABLE_HOURS_REQUIRED;

  if (benefitType === 'sickness') {
    const isEligible = meets600Hours && hasMedicalCertificate;
    return {
      applicantName: cleanApplicantName,
      assessmentDate: cleanAssessmentDate,
      benefitType: 'EI Sickness Benefits',
      statutoryBasis: 'Employment Insurance Act, s. 12(3)(c) (Amended Dec 2022 to 26 Weeks)',
      isEligible,
      maxDurationWeeks: EI_CONSTANTS.SICKNESS_MAX_WEEKS,
      weeklyRateCad: Math.min(cleanEarnings * 0.55, EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD_2024),
      medicalRequirement: 'Must obtain and retain a Medical Certificate signed by a medical doctor or nurse practitioner stating inability to work.'
    };
  }

  if (benefitType === 'maternity') {
    return {
      applicantName: cleanApplicantName,
      assessmentDate: cleanAssessmentDate,
      benefitType: 'EI Maternity Benefits',
      statutoryBasis: 'Employment Insurance Act, s. 12(3)(a)',
      isEligible: meets600Hours,
      maxDurationWeeks: EI_CONSTANTS.MATERNITY_MAX_WEEKS,
      weeklyRateCad: Math.min(cleanEarnings * 0.55, EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD_2024),
      notes: 'Available only to the person giving birth (including surrogate mothers).'
    };
  }

  if (cleanProvince === 'QC' || benefitType === 'qpip_paternity') {
    // Quebec Parental Insurance Plan (QPIP / RGAP)
    return {
      applicantName: cleanApplicantName,
      assessmentDate: cleanAssessmentDate,
      benefitType: 'Quebec QPIP Non-Transferable Paternity Benefits',
      statutoryBasis: 'An Act respecting parental insurance (CQLR c. A-29.011)',
      jurisdiction: 'Quebec (QPIP / RGAP)',
      isEligible: true,
      maxDurationWeeks: EI_CONSTANTS.QPIP_PATERNITY_BASIC_PLAN_WEEKS,
      benefitRatePercent: `${EI_CONSTANTS.QPIP_PATERNITY_BASIC_PLAN_PERCENT * 100}% of average weekly earnings`,
      feature: 'Non-transferable to the other parent: 5 dedicated weeks for the father/non-birthing parent to foster early bonding.'
    };
  }

  // Federal Standard vs Extended Parental
  const isExtended = benefitType === 'parental_extended';
  return {
    applicantName: cleanApplicantName,
    assessmentDate: cleanAssessmentDate,
    benefitType: isExtended ? 'EI Extended Parental Benefits' : 'EI Standard Parental Benefits',
    statutoryBasis: 'Employment Insurance Act, s. 12(3)(b)',
    isEligible: meets600Hours,
    durationWeeks: {
      maxSingleParentWeeks: isExtended ? EI_CONSTANTS.EXTENDED_PARENTAL_MAX_SINGLE_PARENT_WEEKS : EI_CONSTANTS.STANDARD_PARENTAL_MAX_SINGLE_PARENT_WEEKS,
      maxSharedWeeks: isExtended ? EI_CONSTANTS.EXTENDED_PARENTAL_SHARED_MAX_WEEKS : EI_CONSTANTS.STANDARD_PARENTAL_SHARED_MAX_WEEKS
    },
    weeklyBenefitRateCad: isExtended
      ? Math.min(cleanEarnings * EI_CONSTANTS.EXTENDED_PARENTAL_RATE_PERCENT, EI_CONSTANTS.MAX_WEEKLY_EXTENDED_PARENTAL_CAD_2024)
      : Math.min(cleanEarnings * 0.55, EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD_2024),
    irrevocabilityWarning: 'CRITICAL: Once an option (Standard 55% vs Extended 33%) is selected and benefits commence, THE CHOICE IS IRREVOCABLE. Both parents must select the same option.'
  };
}
