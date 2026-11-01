// src/us-h1b-opt-navigator.js
// Statutory US Immigration Navigator: H-1B 60-Day Grace Period, F-1 Cap-Gap & 245(k)
// Grounded in 8 CFR § 214.1(l)(2), 8 CFR § 214.2(f)(5)(vi), and INA § 245(k).

import { boundedText, safeIsoDate } from './text-input.js';

export function evaluateUsH1bOptStatus({
  visaStatus = 'h1b', // 'h1b', 'f1_opt', 'f1_stem_opt'
  lastDayWorkedDate = null,
  i94ExpirationDate = null,
  isSeverancePaidAsLumpSum = true,
  severancePayWeeks = 8,
  hasTimelyFiledH1bCos = false,
  h1bReceiptNoticeDate = null,
  unauthorizedWorkDaysAccrued = 0,
  hasPendingGreenCardI485 = false,
  applicantName = 'US Visa Holder',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeApplicant = boundedText(applicantName, 'US Visa Holder', 120);
  const safeVisaStatus = boundedText(visaStatus, 'h1b', 30);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeUnauthorizedDays = Math.max(0, Math.min(36500, Math.floor(Number(unauthorizedWorkDaysAccrued) || 0)));
  const currentDate = new Date(`${safeAssessmentDate}T00:00:00Z`);

  // 1. H-1B 60-Day Grace Period Evaluation (8 CFR § 214.1(l)(2))
  let h1bGracePeriodAudit = null;
  if (safeVisaStatus === 'h1b') {
    const safeLastWorkedStr = lastDayWorkedDate ? safeIsoDate(lastDayWorkedDate, safeAssessmentDate) : safeAssessmentDate;
    const lastWorked = new Date(`${safeLastWorkedStr}T00:00:00Z`);
    
    // 60 calendar days from the day after employment cessation
    const msPerDay = 86400000;
    const gracePeriodEnd = new Date(lastWorked.getTime() + (60 * msPerDay));

    // If I-94 expires sooner than 60 days, I-94 date controls!
    let effectiveDeadline = gracePeriodEnd;
    let isTruncatedByI94 = false;

    if (i94ExpirationDate) {
      const safeI94Str = safeIsoDate(i94ExpirationDate, '');
      if (safeI94Str) {
        const i94Date = new Date(`${safeI94Str}T00:00:00Z`);
        if (i94Date < gracePeriodEnd) {
          effectiveDeadline = i94Date;
          isTruncatedByI94 = true;
        }
      }
    }

    const daysRemaining = Math.max(0, Math.ceil((effectiveDeadline - currentDate) / msPerDay));
    const isGracePeriodActive = currentDate <= effectiveDeadline;

    h1bGracePeriodAudit = {
      isGracePeriodActive,
      daysRemaining,
      gracePeriodStartDate: lastWorked.toISOString().slice(0, 10),
      statutoryDeadlineDate: effectiveDeadline.toISOString().slice(0, 10),
      isTruncatedByI94,
      severanceWarning: 'USCIS PRECEDENT: Severance salary continuation does NOT extend lawful H-1B status. The 60-day clock strictly begins the day after active employment services cease, regardless of whether you receive biweekly severance pay.',
      legalOptions: [
        '1. H-1B Change of Employer: New employer files petition with USCIS requesting extension of stay before Day 60 (portability work authorization begins upon USCIS receipt under INA § 214(n)).',
        '2. Change of Status to B-2 Visitor: File Form I-539 requesting B-2 status to bridge an extra 6 months for job searching (must be filed before Day 60 expires).',
        '3. Dependent Spouse Status: Change to H-4, L-2, or F-2 if spouse maintains independent lawful status.',
        '4. Departure from the US: Must depart before the 60-day or I-94 deadline to prevent accruing unlawful presence (INA § 212(a)(9)(B)).'
      ]
    };
  }

  // 2. F-1 to H-1B Cap-Gap Auto-Extension (8 CFR § 214.2(f)(5)(vi))
  let capGapAudit = null;
  if (visaStatus === 'f1_opt' || visaStatus === 'f1_stem_opt') {
    const isBeneficiaryOfCapH1b = hasTimelyFiledH1bCos;
    capGapAudit = {
      isCapGapEligible: isBeneficiaryOfCapH1b,
      autoExtensionEndDate: `${safeAssessmentDate.slice(0, 4)}-09-30`,
      workAuthorizationBridge: isBeneficiaryOfCapH1b
        ? 'Employment authorization (EAD) automatically bridged through September 30 under 8 CFR § 214.2(f)(5)(vi).'
        : 'Not currently protected. Requires employer to have filed a timely H-1B cap petition requesting Change of Status (COS) before current OPT expires.',
      travelWarning: 'TRAVEL RESTRICTION: Leaving the United States during the Cap-Gap period before the H-1B takes effect on October 1 generally terminates the automatic change-of-status request.'
    };
  }

  // 3. INA § 245(k) Status Forgiveness Audit (Employment-Based Adjustment of Status)
  let section245kAudit = null;
  const max245kForgivenDays = 180;
  const isWithin245kForgiveness = safeUnauthorizedDays <= max245kForgivenDays;
  const daysBufferRemaining = Math.max(0, max245kForgivenDays - safeUnauthorizedDays);

  section245kAudit = {
    isCoveredCategory: Boolean(hasPendingGreenCardI485),
    unauthorizedWorkDaysAccrued: safeUnauthorizedDays,
    maxForgivenDays: max245kForgivenDays,
    isForgivableUnder245k: isWithin245kForgiveness,
    daysBufferRemaining,
    statutoryRule: 'INA § 245(k) forgives up to 180 aggregate days of status violations, unauthorized work, or failure to maintain continuous status for EB-1, EB-2, and EB-3 green card applicants. Any violation beyond 180 days results in mandatory I-485 denial.'
  };

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicant,
    visaStatus: safeVisaStatus,
    h1bGracePeriodAudit,
    capGapAudit,
    section245kAudit,
    statutoryBasis: 'Immigration and Nationality Act (INA) §§ 214(n), 245(k); 8 CFR § 214.1(l)(2), 8 CFR § 214.2(f)(5)(vi).'
  };
}
