// src/australia-germany-global-navigator.js
// Australia Condition 8607 & MES Exemption | Germany Chancenkarte & Nebenkosten 12-Month Rule
// Grounded in Australian Migration Regs 1994, ITAA 1936, German AufenthG § 20a, and BGB § 556(3).

import { boundedText, safeIsoDate } from './text-input.js';

export function evaluateAustraliaReforms({
  applicantName = 'Applicant',
  visaSubclass = '482_tss',
  daysSinceCeasedEmployment = 35,
  totalCumulativeCessationDays = 35,
  isTemporaryResidentForTax = true,
  hasMedicareEntitlementStatement = false,
  annualTaxableIncomeAud = 95000,
  assessmentDate
} = {}) {
  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanVisaSubclass = boundedText(visaSubclass, '482_tss', 50);
  const safeDate = safeIsoDate(assessmentDate);

  const safeDaysSince = Number.isFinite(Number(daysSinceCeasedEmployment))
    ? Math.max(0, Math.min(36500, Math.floor(Number(daysSinceCeasedEmployment))))
    : 0;
  const safeCumulativeDays = Number.isFinite(Number(totalCumulativeCessationDays))
    ? Math.max(0, Math.min(36500, Math.floor(Number(totalCumulativeCessationDays))))
    : 0;
  const safeIncome = Number.isFinite(Number(annualTaxableIncomeAud))
    ? Math.max(0, Math.min(100000000, Number(annualTaxableIncomeAud)))
    : 0;

  // 1. Australia Subclass 482 Condition 8607 (July 2024 Reform)
  const maxConsecutiveDaysAllowed = 180;
  const maxCumulativeDaysAllowed = 365;

  const consecutiveDaysRemaining = Math.max(0, maxConsecutiveDaysAllowed - safeDaysSince);
  const isCondition8607Compliant = safeDaysSince <= maxConsecutiveDaysAllowed &&
                                   safeCumulativeDays <= maxCumulativeDaysAllowed;

  // 2. Medicare Levy 2% Exemption (ITAA 1936 s. 251T)
  const standardMedicareLevyRate = 0.02; // 2%
  const potentialMedicareLevySavedAud = Math.round(safeIncome * standardMedicareLevyRate);

  return {
    jurisdiction: 'Australia',
    applicantName: cleanApplicantName,
    assessmentDate: safeDate,
    condition8607Audit: {
      visaSubclass: cleanVisaSubclass,
      daysSinceCeasedEmployment: safeDaysSince,
      maxConsecutiveDaysAllowed,
      consecutiveDaysRemaining,
      isCompliant: isCondition8607Compliant,
      statutoryRights: [
        '180-DAY TRANSFER WINDOW: Under the July 1, 2024 reform, you have 180 consecutive calendar days (up to 365 days cumulative across your visa period) to find a new sponsor, apply for a different visa, or depart.',
        'INTERIM WORK RIGHTS: You may work for any employer in any occupation during this 180-day window to support yourself while seeking a new sponsor.',
        'STATUS COMPLIANCE: As long as you remain within the 180-day window, your visa will not be considered for cancellation under section 116(1)(b) of the Migration Act 1958.'
      ]
    },
    medicareLevyExemption: {
      isTemporaryResident: Boolean(isTemporaryResidentForTax),
      hasMes: Boolean(hasMedicareEntitlementStatement),
      annualPotentialTaxSavingsAud: potentialMedicareLevySavedAud,
      statutoryAdvice: Boolean(hasMedicareEntitlementStatement)
        ? `You hold a valid MES. Claim the 365-day full Medicare levy exemption in your ATO Individual Tax Return, saving $${potentialMedicareLevySavedAud.toLocaleString()} AUD.`
        : `Temporary residents not eligible for Medicare should apply for a Medicare Entitlement Statement (MES) via Services Australia before lodging tax return to save 2% ($${potentialMedicareLevySavedAud.toLocaleString()} AUD).`
    },
    statutoryBasis: 'Migration Regulations 1994 condition 8607 (July 2024 amendment); Income Tax Assessment Act 1936 s. 251T.'
  };
}

export function evaluateGermanyChancenkarteAndTenancy({
  applicantName = 'Applicant',
  chancenkartePoints = 6,
  germanLanguageLevel = 'A2', // 'None', 'A1', 'A2', 'B1', 'B2', 'C1'
  applicantAge = 31,
  secondaryWorkHoursPerWeek = 20,
  nebenkostenInvoiceMonthsAfterPeriod = 14, // BGB 556(3) 12-month rule
  nebenkostenArrearsDemandedEur = 850,
  assessmentDate
} = {}) {
  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const cleanLang = boundedText(germanLanguageLevel, 'A2', 20);
  const safeDate = safeIsoDate(assessmentDate);

  const safePoints = Number.isFinite(Number(chancenkartePoints))
    ? Math.max(0, Math.min(100, Math.floor(Number(chancenkartePoints))))
    : 0;
  const safeAge = Number.isFinite(Number(applicantAge))
    ? Math.max(0, Math.min(120, Math.floor(Number(applicantAge))))
    : 0;
  const safeHours = Number.isFinite(Number(secondaryWorkHoursPerWeek))
    ? Math.max(0, Math.min(168, Number(secondaryWorkHoursPerWeek)))
    : 0;
  const safeInvoiceMonths = Number.isFinite(Number(nebenkostenInvoiceMonthsAfterPeriod))
    ? Math.max(0, Math.min(1200, Math.floor(Number(nebenkostenInvoiceMonthsAfterPeriod))))
    : 0;
  const safeArrears = Number.isFinite(Number(nebenkostenArrearsDemandedEur))
    ? Math.max(0, Math.min(100000000, Number(nebenkostenArrearsDemandedEur)))
    : 0;

  // 1. Chancenkarte (Opportunity Card) - AufenthG § 20a
  const minRequiredPoints = 6;
  const isChancenkarteEligible = safePoints >= minRequiredPoints;
  const isWorkHoursCompliant = safeHours <= 20;

  // 2. Nebenkosten 12-Month Landlord Preclusion Rule - BGB § 556(3)
  const isBilledWithin12Months = safeInvoiceMonths <= 12;
  const isTenantLiableForArrears = isBilledWithin12Months;

  return {
    jurisdiction: 'Germany',
    applicantName: cleanApplicantName,
    assessmentDate: safeDate,
    germanLanguageLevel: cleanLang,
    applicantAge: safeAge,
    chancenkarteAudit: {
      chancenkartePoints: safePoints,
      minRequiredPoints,
      isPointsEligible: isChancenkarteEligible,
      secondaryWorkHoursPerWeek: safeHours,
      isWorkHoursCompliant,
      statutoryRights: [
        'PART-TIME SECONDARY WORK: Permitted to work up to 20 hours per week in any secondary employment under AufenthG § 20a.',
        'TRIAL WORK (PROBEARBEIT): Permitted to undertake two-week trial employment periods with potential employers without special agency approval.',
        'TRANSITION TO RESIDENCE TITLE: May switch directly inside Germany to an EU Blue Card (§ 18g) or Skilled Worker permit (§ 18a/b) upon securing a qualifying job offer.'
      ]
    },
    nebenkostenTenancyAudit: {
      nebenkostenInvoiceMonthsAfterPeriod: safeInvoiceMonths,
      statutoryCutoffMonths: 12,
      isBilledWithinDeadline: isBilledWithin12Months,
      isTenantObligatedToPay: isTenantLiableForArrears,
      arrearsDemandedEur: safeArrears,
      legalRule: isBilledWithin12Months
        ? 'Invoice received within the statutory 12-month period. Tenant must pay legitimate substantiated utility arrears within 30 days.'
        : `Ausschlussfrist (BGB § 556(3)): Landlord missed the strict 12-month statutory preclusion deadline (billed after ${safeInvoiceMonths} months). Landlord is LEGALLY PRECLUDED from claiming the €${safeArrears} EUR in arrears.`
    },
    statutoryBasis: 'AufenthG § 20a (Skilled Immigration Act 2024); BGB § 556(3) (Bürgerliches Gesetzbuch).'
  };
}
