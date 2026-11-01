// src/severance-bardal-calculator.js
// Common Law Severance (Bardal Factors) vs Statutory Employment Standards (ESA) Estimator
// Grounded in Bardal v. Globe & Mail Ltd. (1960), Ontario ESA 2000 ss. 54, 57, 64, and Canadian common law jurisprudence.

import { boundedText, safeIsoDate } from './text-input.js';

export function calculateSeveranceAndNotice({
  employeeAge = 46,
  yearsOfService = 7.5,
  annualSalaryCad = 90000,
  employmentRole = 'management_professional', // 'executive', 'management_professional', 'specialist_technical', 'clerical_administrative', 'general_labour'
  employerPayrollOver2Point5Million = true,
  hasSignedEnforceableEsaOnlyClause = false,
  availabilityOfSimilarJobs = 'scarce', // 'abundant', 'moderate', 'scarce'
  province = 'ON',
  applicantName = 'Terminated Employee',
  assessmentDate = null
} = {}) {
  const safeAssessmentDate = safeIsoDate(assessmentDate);
  const cleanYears = Number.isFinite(Number(yearsOfService)) && Number(yearsOfService) >= 0 ? Math.min(60, Number(yearsOfService)) : 0;
  const cleanSalary = Number.isFinite(Number(annualSalaryCad)) && Number(annualSalaryCad) >= 0 ? Math.min(10000000, Number(annualSalaryCad)) : 0;
  const cleanAge = Number.isFinite(Number(employeeAge)) && Number(employeeAge) >= 14 ? Math.min(100, Number(employeeAge)) : 35;
  const cleanApplicant = boundedText(applicantName, 'Terminated Employee', 120);
  const cleanProvince = boundedText(province, 'ON', 10).toUpperCase();
  const weeklyPayCad = Math.round((cleanSalary / 52) * 100) / 100;

  // 1. Provincial Statutory Minimums (Ontario ESA Model)
  // ESA Termination Notice (s. 57): 1 week per completed year up to max 8 weeks.
  const completedYears = Math.floor(cleanYears);
  const statutoryNoticeWeeks = cleanYears === 0 ? 0 : Math.min(Math.max(1, completedYears), 8);
  const statutoryNoticePayCad = Math.round(statutoryNoticeWeeks * weeklyPayCad * 100) / 100;

  // ESA Severance Pay (s. 64): Requires 5+ years of service AND employer payroll >= $2.5M
  let statutorySeveranceWeeks = 0;
  let isEsaSeveranceTriggered = false;

  if (cleanYears >= 5 && employerPayrollOver2Point5Million) {
    isEsaSeveranceTriggered = true;
    // Exactly 1 week per completed year, plus pro-rated months, capped at 26 weeks
    statutorySeveranceWeeks = Math.min(Math.round(cleanYears * 10) / 10, 26);
  }
  const statutorySeverancePayCad = Math.round(statutorySeveranceWeeks * weeklyPayCad * 100) / 100;
  const totalStatutoryFloorCad = statutoryNoticePayCad + statutorySeverancePayCad;
  const totalStatutoryFloorWeeks = statutoryNoticeWeeks + statutorySeveranceWeeks;

  // 2. Common Law Reasonable Notice (Bardal Analysis)
  // If employee signed a bulletproof, legally enforceable ESA-only clause that complies strictly with statutory minimums,
  // common law is displaced. However, under Waksdale v. Swegon North America (2020 ONCA 391), if any part of the
  // termination clause violates ESA (e.g. overreaching "for cause" provisions), the entire clause is void.
  let commonLawNoticeMonths = 0;
  let isContractClauseVulnerable = !hasSignedEnforceableEsaOnlyClause;

  if (hasSignedEnforceableEsaOnlyClause) {
    // Limited to statutory floor by contract
    commonLawNoticeMonths = Math.round((totalStatutoryFloorWeeks / 4.33) * 10) / 10;
  } else {
    // 4 Core Bardal Factors:
    // Factor A: Length of Service Baseline (~0.75 - 1 month per year of service)
    let baselineMonths = cleanYears * 0.9;

    // Factor B: Character of Employment
    let roleMultiplier = 1.0;
    if (employmentRole === 'executive') roleMultiplier = 1.4;
    else if (employmentRole === 'management_professional') roleMultiplier = 1.2;
    else if (employmentRole === 'specialist_technical') roleMultiplier = 1.1;
    else if (employmentRole === 'clerical_administrative') roleMultiplier = 0.85;
    else roleMultiplier = 0.75;

    let adjustedMonths = baselineMonths * roleMultiplier;

    // Factor C: Age of Employee (Older workers face tougher re-employment barriers)
    if (cleanAge >= 55) adjustedMonths += 3.5;
    else if (cleanAge >= 45) adjustedMonths += 2.0;
    else if (cleanAge < 30) adjustedMonths -= 1.0;

    // Factor D: Availability of Similar Employment
    if (availabilityOfSimilarJobs === 'scarce') adjustedMonths += 2.5;
    else if (availabilityOfSimilarJobs === 'abundant') adjustedMonths -= 1.5;

    // Customary 24-month common law ceiling
    commonLawNoticeMonths = Math.min(Math.max(2, Math.round(adjustedMonths * 10) / 10), 24);
  }

  const commonLawEstimatedPayCad = Math.round((commonLawNoticeMonths * (annualSalaryCad / 12)) * 100) / 100;
  const severanceGapCad = Math.max(0, commonLawEstimatedPayCad - totalStatutoryFloorCad);

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: cleanApplicant,
    province: cleanProvince,
    profileAudit: {
      employeeAge: cleanAge,
      yearsOfService: cleanYears,
      annualSalaryCad: cleanSalary,
      weeklyPayCad,
      employmentRole,
      hasSignedEnforceableEsaOnlyClause
    },
    statutoryMinimumEntitlement: {
      governingAct: 'Ontario Employment Standards Act, 2000 (ss. 54, 57, 64)',
      noticePeriodWeeks: statutoryNoticeWeeks,
      noticePayCad: statutoryNoticePayCad,
      severancePayWeeks: statutorySeveranceWeeks,
      severancePayCad: statutorySeverancePayCad,
      isSeveranceTriggered: isEsaSeveranceTriggered,
      totalStatutoryMinimumPayCad: totalStatutoryFloorCad,
      statutorySummary: `Statutory floor under ESA: ${totalStatutoryFloorWeeks} weeks ($${totalStatutoryFloorCad.toLocaleString()} CAD).`
    },
    commonLawEntitlement: {
      jurisprudencePrecedent: 'Bardal v. Globe & Mail Ltd. (1960); Waksdale v. Swegon North America (2020 ONCA 391)',
      estimatedNoticePeriodMonths: commonLawNoticeMonths,
      estimatedNoticePayCad: commonLawEstimatedPayCad,
      contractEnforceabilityNote: hasSignedEnforceableEsaOnlyClause
        ? 'Contract purports to restrict severance to ESA minimums. However, post-Waksdale ONCA rulings render 80%+ of pre-2022 clauses unenforceable if "for cause" provisions exceed ESA standards.'
        : 'Common law presumption applies. Employee is entitled to reasonable notice of termination.',
      potentialSeveranceGainDeltaCad: severanceGapCad
    },
    severanceReleaseTrapWarnings: [
      'DEADLINE TACTIC: Employers frequently state severance offers expire within 48 to 72 hours. This deadline is arbitrary and legally unenforceable. Take at least 7 to 14 days to consult an employment lawyer.',
      'FULL AND FINAL RELEASE: Signing the release form forfeits all common law rights, human rights claims, and unpaid overtime bonuses permanently.',
      'BENEFIT CONTINUATION: Statutory notice period (first 1–8 weeks) requires mandatory continuation of all health, dental, and life insurance benefits under ESA s. 60(1)(c).',
      'DUTY TO MITIGATE: Under common law, you must make reasonable efforts to seek comparable employment. If you secure a new job, remaining notice pay may be subject to mitigation clawback unless negotiated as a lump-sum.'
    ],
    statutoryBasis: 'Employment Standards Act, 2000, S.O. 2000, c. 41; Bardal v. Globe & Mail Ltd., 1960 CanLII 294 (ON SC).'
  };
}
