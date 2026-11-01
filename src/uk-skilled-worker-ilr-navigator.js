// src/uk-skilled-worker-ilr-navigator.js
// UK Skilled Worker Salary Thresholds (22 July 2025 rules), ILR 180-Day Absence & Section 21 Housing Invalidation
// Grounded in UK Immigration Rules Appendix Skilled Worker, Appendix Continuous Residence, Deregulation Act 2015
// and the Renters' Rights Act 2025, which abolished Section 21 notices in England from 1 May 2026.

import { boundedText, safeIsoDate } from './text-input.js';
import { factValue } from './kb-facts.js';

// Thresholds come from src/kb-facts.js (rules from 22 July 2025, HC 997). Health and
// care roles on national pay scales (e.g. NHS Agenda for Change) use their own figure.
export const UK_SALARY_THRESHOLDS = {
  get STANDARD_GENERAL_FLOOR_GBP() { return factValue('uk.skilledWorker.generalThresholdGbp'); },
  get TRANSITIONAL_PRE_APRIL_2024_GBP() { return factValue('uk.skilledWorker.transitionalGbp'); },
  get NEW_ENTRANT_FLOOR_GBP() { return factValue('uk.skilledWorker.newEntrantGbp'); },
  get HEALTH_AND_CARE_EXEMPTION_GBP() { return factValue('uk.skilledWorker.healthCarePayScaleGbp'); },
};
// Kept for existing imports; values are the current ones above.
export const UK_SALARY_THRESHOLDS_2024 = Object.defineProperties({
  get GRANDFATHERED_PRE_APRIL_2024_GBP() { return UK_SALARY_THRESHOLDS.TRANSITIONAL_PRE_APRIL_2024_GBP; }
},Object.getOwnPropertyDescriptors(UK_SALARY_THRESHOLDS));
export const SECTION_21_ABOLISHED_FROM = '2026-05-01';

export function evaluateUkSkilledWorkerAndIlr({
  annualOfferedSalaryGbp = 35000,
  socCode = '2136',
  isPreApril2024VisaHolder = false,
  isNewEntrantRecentGraduate = false,
  isHealthAndCareOccupation = false,
  maxAbsenceDaysInAny12Months = 95,
  totalAbsenceDays5Years = 280,
  applicantAge = null,
  landlordGasSafetyProvided = true,
  landlordEpcProvided = true,
  landlordHowToRentProvided = true,
  depositProtectedWithin30Days = true,
  noticeServedDate = null,
  applicantName = 'UK Migrant',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeApplicant = boundedText(applicantName, 'UK Migrant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeSocCode = boundedText(socCode, '2136', 20);
  const safeSalary = Math.max(0, Math.min(10000000, Number(annualOfferedSalaryGbp) || 0));
  const safe12MonthAbsence = Math.max(0, Math.min(365, Math.floor(Number(maxAbsenceDaysInAny12Months) || 0)));
  const safe5YearAbsence = Math.max(0, Math.min(1825, Math.floor(Number(totalAbsenceDays5Years) || 0)));
  // Age only counts when given; an assumed age would make everyone a "new entrant".
  const safeAge = applicantAge === null || applicantAge === undefined || applicantAge === '' || !Number.isFinite(Number(applicantAge))
    ? null : Math.max(0, Math.min(120, Math.floor(Number(applicantAge))));

  // 1. Skilled Worker Salary Compliance (rules from 22 July 2025)
  let applicableThresholdGbp = UK_SALARY_THRESHOLDS.STANDARD_GENERAL_FLOOR_GBP;
  let thresholdCategory = 'General threshold from 22 July 2025 (£41,700, or the going rate if higher)';

  if (isHealthAndCareOccupation) {
    applicableThresholdGbp = UK_SALARY_THRESHOLDS.HEALTH_AND_CARE_EXEMPTION_GBP;
    thresholdCategory = 'Health and Care roles on national pay scales (£25,000, or the going rate if higher)';
  } else if (isPreApril2024VisaHolder) {
    applicableThresholdGbp = UK_SALARY_THRESHOLDS.TRANSITIONAL_PRE_APRIL_2024_GBP;
    thresholdCategory = 'Transitional rate for visas first granted before 4 April 2024 (£31,300 from 22 July 2025)';
  } else if (isNewEntrantRecentGraduate || (safeAge !== null && safeAge < 26)) {
    applicableThresholdGbp = UK_SALARY_THRESHOLDS.NEW_ENTRANT_FLOOR_GBP;
    thresholdCategory = 'New entrant rate (£33,400 minimum for under-26s or recent graduates)';
  }

  const isSalaryCompliant = safeSalary >= applicableThresholdGbp;
  const salaryShortfallGbp = Math.max(0, applicableThresholdGbp - safeSalary);

  // 2. ILR 180-Day Rolling Absence Rule (Appendix Continuous Residence)
  const maxAllowableRollingAbsenceDays = 180;
  const isContinuousResidenceMaintained = safe12MonthAbsence <= maxAllowableRollingAbsenceDays;
  const absenceBufferDays = Math.max(0, maxAllowableRollingAbsenceDays - safe12MonthAbsence);

  // 3. Section 21 Eviction Invalidation Audit (Deregulation Act 2015)
  const section21Defects = [];
  if (!landlordGasSafetyProvided) {
    section21Defects.push('No valid Gas Safety Certificate provided to tenant before moving in (Trecarrell House v. Rouncefield).');
  }
  if (!landlordEpcProvided) {
    section21Defects.push('No valid Energy Performance Certificate (EPC) provided.');
  }
  if (!landlordHowToRentProvided) {
    section21Defects.push('Landlord failed to provide government "How to rent: the checklist for renting in England" guide.');
  }
  if (!depositProtectedWithin30Days) {
    section21Defects.push('Tenancy deposit not protected in an authorized custodial scheme within 30 days (Housing Act 2004 s. 213).');
  }

  // Section 21 notices cannot be served in England from 1 May 2026.
  const effectiveNoticeDate = noticeServedDate ? safeIsoDate(noticeServedDate, safeAssessmentDate) : safeAssessmentDate;
  const section21Abolished = effectiveNoticeDate >= SECTION_21_ABOLISHED_FROM;
  const isSection21EvictionValid = !section21Abolished && section21Defects.length === 0;

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicant,
    socCode: safeSocCode,
    salaryCompliance: {
      annualOfferedSalaryGbp: safeSalary,
      applicableThresholdGbp,
      thresholdCategory,
      isSalaryCompliant,
      salaryShortfallGbp,
      statutoryNotes: isSalaryCompliant
        ? 'Offered salary meets or exceeds the statutory threshold for your qualifying route.'
        : `Deficit of £${salaryShortfallGbp.toLocaleString()} GBP. Certificate of Sponsorship (CoS) will be rejected unless salary is increased or occupation qualifies for discounts.`
    },
    ilrContinuousResidence: {
      maxAbsenceDaysInAny12Months: safe12MonthAbsence,
      maxAllowableRollingAbsenceDays,
      isContinuousResidenceMaintained,
      absenceBufferDays,
      totalAbsenceDays5Years: safe5YearAbsence,
      statutoryRule: 'Under Appendix Continuous Residence, absences from the UK must not exceed 180 days in any rolling 12-month period across the 5-year qualifying period. Any single 12-month window exceeding 180 days breaks the continuity clock.'
    },
    housingSection21Defense: {
      isSection21NoticeValid: isSection21EvictionValid,
      section21Abolished,
      defectsFoundCount: section21Defects.length,
      statutoryDefects: section21Defects,
      remedyAdvice: section21Abolished
        ? 'Section 21 no-fault notices were abolished in England from 1 May 2026 (Renters\' Rights Act 2025). A notice served on or after that date has no effect; the landlord must use a Section 8 ground. Get advice from Shelter or a housing adviser.'
        : isSection21EvictionValid
          ? 'Notice appears procedurally standard. Verify 2 full months notice period was provided, and that court proceedings start within the deadlines set by the Renters\' Rights Act 2025.'
          : 'This Section 21 notice is likely invalid because of the landlord defects listed (Deregulation Act 2015). Raise them in your court defence and get housing advice.'
    },
    statutoryBasis: 'UK Immigration Rules Appendix Skilled Worker; Appendix Continuous Residence; Deregulation Act 2015 s. 33; Renters\' Rights Act 2025.'
  };
}
