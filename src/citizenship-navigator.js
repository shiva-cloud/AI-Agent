// src/citizenship-navigator.js
// Canadian Citizenship Eligibility & Statutory Physical Presence Engine.
// Evaluates Citizenship Act (R.S.C. 1985, c. C-29) s. 5(1)(c) 1,095-day requirement,
// s. 5(1.001) pre-PR half-day credit (max 365 days), CRA 3-year tax filing rule (s. 5(1)(c.1)),
// and CLB 4 language requirement for ages 18-54 (s. 5(1)(d)).
// Pure ES module with zero npm dependencies.



export const CITIZENSHIP_STATUTORY_CONSTANTS = {
  statutoryDaysRequired: 1095, // 3 full years
  lookbackWindowYears: 5,
  maxPrePrCreditedDays: 365, // Max 1 full year credit (requires 730 actual days)
  prePrCreditMultiplier: 0.5,
  requiredTaxYears: 3,
  languageExemptionAgeMin: 18,
  languageExemptionAgeMax: 54,
  requiredClbLevel: 4,
  adultFeeCad: 630, // $530 processing + $100 right of citizenship
  minorFeeCad: 100,
  refundableRightOfCitizenshipFeeCad: 100
};

export function evaluateCitizenshipEligibility(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicationDate = null,
    prLandingDate = '2024-01-01',
    prePrDaysPresent = 0,
    postPrDaysAbsent = 0,
    taxYearsFiledCount = 3,
    applicantAge = 32,
    languageProofType = 'celpip',
    hasCriminalProhibitions = false
  } = safeParams;
  const parsedApp = applicationDate ? new Date(applicationDate) : new Date();
  const appDate = !isNaN(parsedApp.getTime()) ? parsedApp : new Date();
  const parsedLanding = new Date(prLandingDate);
  const landingDate = !isNaN(parsedLanding.getTime()) ? parsedLanding : new Date(appDate.getTime() - 365 * 24 * 60 * 60 * 1000);

  // 5-year eligibility window: exactly 5 years prior to application date
  const windowStartDate = new Date(appDate);
  windowStartDate.setFullYear(windowStartDate.getFullYear() - CITIZENSHIP_STATUTORY_CONSTANTS.lookbackWindowYears);

  // Post-PR physical presence calculation
  // Days since landing up to application date
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceLanding = Math.max(0, Math.floor((appDate.getTime() - landingDate.getTime()) / msPerDay));
  const safePostPrAbsences = Number.isFinite(Number(postPrDaysAbsent)) ? Math.max(0, Math.floor(Number(postPrDaysAbsent))) : 0;
  const postPrCreditedDays = Math.max(0, daysSinceLanding - safePostPrAbsences);

  // Pre-PR physical presence calculation under s. 5(1.001)
  // Each day as temporary resident = 0.5 day, capped at 365 days
  const actualPrePrDays = Number.isFinite(Number(prePrDaysPresent)) ? Math.max(0, Math.floor(Number(prePrDaysPresent))) : 0;
  const rawPrePrCredit = Math.floor(actualPrePrDays * CITIZENSHIP_STATUTORY_CONSTANTS.prePrCreditMultiplier);
  const prePrCreditedDays = Math.min(CITIZENSHIP_STATUTORY_CONSTANTS.maxPrePrCreditedDays, rawPrePrCredit);
  const prePrCapApplied = rawPrePrCredit > CITIZENSHIP_STATUTORY_CONSTANTS.maxPrePrCreditedDays;

  // Total Credited Days
  const totalCreditedDays = prePrCreditedDays + postPrCreditedDays;
  const surplusOrShortfall = totalCreditedDays - CITIZENSHIP_STATUTORY_CONSTANTS.statutoryDaysRequired;
  const hasMetPhysicalPresence = totalCreditedDays >= CITIZENSHIP_STATUTORY_CONSTANTS.statutoryDaysRequired;

  // Forward projection: if not yet eligible, compute earliest application date
  let earliestEligibleDate = null;
  if (hasMetPhysicalPresence) {
    earliestEligibleDate = appDate.toISOString().slice(0, 10);
  } else {
    const daysNeeded = CITIZENSHIP_STATUTORY_CONSTANTS.statutoryDaysRequired - totalCreditedDays;
    const projectedDate = new Date(appDate.getTime() + daysNeeded * msPerDay);
    earliestEligibleDate = projectedDate.toISOString().slice(0, 10);
  }

  // Tax Compliance under s. 5(1)(c.1)
  const taxesFiled = Number.isFinite(Number(taxYearsFiledCount)) ? Math.min(10, Math.max(0, Math.floor(Number(taxYearsFiledCount)))) : 0;
  const hasMetTaxes = taxesFiled >= CITIZENSHIP_STATUTORY_CONSTANTS.requiredTaxYears;

  // Language Requirement under s. 5(1)(d)
  const age = Number.isFinite(Number(applicantAge)) ? Math.min(120, Math.max(0, Math.floor(Number(applicantAge)))) : 30;
  const isLanguageRequired = age >= CITIZENSHIP_STATUTORY_CONSTANTS.languageExemptionAgeMin &&
                             age <= CITIZENSHIP_STATUTORY_CONSTANTS.languageExemptionAgeMax;

  let languageStatus = 'proof_required';
  let languageNote = '';

  if (!isLanguageRequired) {
    languageStatus = 'exempt_by_age';
    languageNote = `Exempt from language proof: applicant age ${age} is outside the mandatory 18 to 54 statutory age bracket.`;
  } else if (['celpip', 'ielts', 'canadian_degree', 'foreign_degree_english'].includes(String(languageProofType).toLowerCase())) {
    languageStatus = 'compliant';
    languageNote = `Satisfied with official proof: ${languageProofType.toUpperCase()} meeting minimum CLB 4 in speaking and listening.`;
  } else {
    languageStatus = 'proof_required';
    languageNote = 'Must provide official proof of CLB 4+ in speaking and listening before submitting application.';
  }

  // Prohibitions under s. 22
  const isProhibited = Boolean(hasCriminalProhibitions);

  // Overall Readiness Assessment
  let overallStatus = 'not_yet_eligible';
  let summaryHeadline = '';

  if (isProhibited) {
    overallStatus = 'prohibited';
    summaryHeadline = 'Application Prohibited under Citizenship Act s. 22 (Criminal / Sentencing Bar).';
  } else if (hasMetPhysicalPresence && hasMetTaxes && (languageStatus === 'compliant' || languageStatus === 'exempt_by_age')) {
    overallStatus = 'eligible_now';
    summaryHeadline = `Fully Eligible for Canadian Citizenship! Accumulated ${totalCreditedDays} credited days (surplus of +${surplusOrShortfall} days).`;
  } else {
    overallStatus = 'not_yet_eligible';
    const missing = [];
    if (!hasMetPhysicalPresence) missing.push(`${Math.abs(surplusOrShortfall)} more physical presence days needed`);
    if (!hasMetTaxes) missing.push(`${CITIZENSHIP_STATUTORY_CONSTANTS.requiredTaxYears - taxesFiled} more tax years to file`);
    if (languageStatus === 'proof_required') missing.push('official CLB 4 language test/diploma needed');
    summaryHeadline = `Not Yet Eligible: ${missing.join(', ')}. Earliest projected eligible date: ${earliestEligibleDate}.`;
  }

  const statutoryAdvisories = [
    'The Pre-PR Half-Day Rule (s. 5(1.001)): Time spent on a valid Work Permit or Study Permit counts as 0.5 days per day present, up to a maximum statutory cap of 365 days. 730 actual days as a temporary resident yields the full 1-year credit.',
    'Travel Buffer Recommendation: Never apply with exactly 1,095 days. IRCC officers rigorously cross-reference CBSA entry/exit records and airline manifests. A calculation discrepancy of even 1 day results in mandatory application refusal and forfeiture of $530 processing fees. Maintain a safety buffer of at least 15 to 30 extra days.',
    'Day of Departure & Return: Under IRCC calculation rules, the day you leave Canada and the day you return to Canada both count as physical presence days in Canada.',
    'Tax Filing Requirement (s. 5(1)(c.1)): You must have filed Canadian income tax returns for at least 3 taxation years within your 5-year eligibility period, even if your income was zero.'
  ];

  return {
    asOf: new Date().toISOString().slice(0, 10),
    applicationDate: appDate.toISOString().slice(0, 10),
    prLandingDate: landingDate.toISOString().slice(0, 10),
    eligibilityWindow: {
      startDate: windowStartDate.toISOString().slice(0, 10),
      endDate: appDate.toISOString().slice(0, 10),
      windowYears: CITIZENSHIP_STATUTORY_CONSTANTS.lookbackWindowYears
    },
    physicalPresenceAudit: {
      prePrActualDaysPresent: actualPrePrDays,
      prePrCreditedDays,
      prePrStatutoryCapApplied: prePrCapApplied,
      postPrDaysSinceLanding: daysSinceLanding,
      postPrDaysAbsent: safePostPrAbsences,
      postPrCreditedDays,
      totalCreditedDays,
      statutoryRequirementDays: CITIZENSHIP_STATUTORY_CONSTANTS.statutoryDaysRequired,
      surplusOrShortfallDays: surplusOrShortfall,
      hasMetPhysicalPresence,
      earliestProjectedEligibleDate: earliestEligibleDate
    },
    taxCompliance: {
      taxYearsFiled: taxesFiled,
      requiredTaxYears: CITIZENSHIP_STATUTORY_CONSTANTS.requiredTaxYears,
      hasMetTaxRequirement: hasMetTaxes,
      statute: 'Citizenship Act s. 5(1)(c.1)'
    },
    languageAudit: {
      applicantAge: age,
      isLanguageRequired,
      clbLevelRequired: CITIZENSHIP_STATUTORY_CONSTANTS.requiredClbLevel,
      status: languageStatus,
      note: languageNote,
      statute: 'Citizenship Act s. 5(1)(d)'
    },
    prohibitionsAudit: {
      hasCriminalProhibitions: isProhibited,
      statute: 'Citizenship Act s. 22'
    },
    overallReadiness: {
      status: overallStatus,
      summaryHeadline,
      isEligibleNow: overallStatus === 'eligible_now'
    },
    governmentFeeSchedule: {
      adultFeeCad: CITIZENSHIP_STATUTORY_CONSTANTS.adultFeeCad,
      minorFeeCad: CITIZENSHIP_STATUTORY_CONSTANTS.minorFeeCad,
      refundableRightOfCitizenshipFeeCad: CITIZENSHIP_STATUTORY_CONSTANTS.refundableRightOfCitizenshipFeeCad
    },
    statutoryChecklist: [
      'Print official Physical Presence Calculation report (Form CIT 0407) from IRCC online calculator.',
      'Gather CRA Notices of Assessment (NOAs) for 3 taxation years within your 5-year eligibility window.',
      isLanguageRequired ? 'Attach proof of CLB 4+ in English or French (CELPIP-G, IELTS General, or Canadian diploma).' : 'Language proof exempt (outside 18-54 age bracket).',
      'Provide biographical page copies of all valid and expired passports held during the 5-year period.',
      'Pay $630 CAD government processing fee on the IRCC payment portal and submit online application.'
    ],
    statutoryAdvisories,
    statutoryAuthority: 'Citizenship Act (R.S.C. 1985, c. C-29), Section 5(1) & Citizenship Regulations'
  };
}
