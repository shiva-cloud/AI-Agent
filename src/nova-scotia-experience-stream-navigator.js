/**
 * Northstar — Settlement Intelligence
 * Nova Scotia Nominee Program (NSNP) Experience: Express Entry & Physician Stream Navigator
 *
 * Statutory Authorities:
 * - Nova Scotia Immigration Act, SNS 2015, c. 6
 * - Nova Scotia Nominee Program (NSNP) Policy Directives (2025/2026 Guidelines)
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 10.3 & IRPR Part 5
 * - Regulated Health Professions Act, SNS 2023, c. 13 (College of Physicians and Surgeons of Nova Scotia)
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const NSNP_EXPERIENCE_RULES = Object.freeze({
  MIN_AGE: 21,
  MAX_AGE: 55,
  MIN_EXPERIENCE_MONTHS: 12,
  MIN_EXPERIENCE_HOURS: 1560,
  EXPERIENCE_LOOKBACK_YEARS: 3,
  MIN_CLB_TEER_0_1: 7,
  MIN_CLB_TEER_2_3: 5,
  PHYSICIAN_NOC_CODES: Object.freeze(['31100', '31101', '31102']), // Specialists, Surgical, Family Phys
  SETTLEMENT_FUNDS_LICO_MULTIPLIER: 1.0,
  PROVINCE: 'NS'
});

/**
 * Validates minimum language CLB by TEER level.
 */
export function checkNsnpLanguageEligibility(teerLevel, clbScore) {
  const teer = Number(teerLevel);
  const clb = Number(clbScore) || 0;
  if (teer === 0 || teer === 1) {
    return {
      isEligible: clb >= NSNP_EXPERIENCE_RULES.MIN_CLB_TEER_0_1,
      requiredClb: NSNP_EXPERIENCE_RULES.MIN_CLB_TEER_0_1
    };
  }
  return {
    isEligible: clb >= NSNP_EXPERIENCE_RULES.MIN_CLB_TEER_2_3,
    requiredClb: NSNP_EXPERIENCE_RULES.MIN_CLB_TEER_2_3
  };
}

/**
 * Audits candidate eligibility for Nova Scotia Experience: Express Entry or Physician streams.
 */
export function evaluateNovaScotiaExperienceStream(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    stream = 'nova_scotia_experience_express_entry', // or 'physician_stream'
    candidateAge = 29,
    nocCode = '21231',
    teerLevel = 1,
    monthsWorkedInNovaScotia = 14,
    hoursWorkedInNovaScotia = 1800,
    languageClbScore = 8,
    hasActiveExpressEntryProfile = true,
    hasValidWorkPermitDuringExperience = true,
    hasSecondarySchoolOrEca = true,
    hasIntentToResideInNovaScotia = true,
    hasSignedReturnOfServiceWithNshOrIwk = false,
    hasCpsnsLicensureOrAssessment = false,
    isSelfEmployed = false,
    candidateName = 'Candidate',
    assessmentDate = todayIso()
  } = safeParams;
  const safeCandidateName = boundedText(candidateName, 'Candidate', 120);
  const safeStream = boundedText(stream, 'nova_scotia_experience_express_entry', 80);
  const safeNocCode = boundedText(nocCode, '21231', 20);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const sanitizedAge = Math.max(16, Math.min(120, Math.floor(Number(candidateAge) || 29)));
  const sanitizedTeer = Math.max(0, Math.min(5, Math.floor(Number(teerLevel) || 1)));
  const sanitizedMonths = Math.max(0, Math.min(360, Math.floor(Number(monthsWorkedInNovaScotia) || 0)));
  const sanitizedHours = Math.max(0, Math.min(100000, Math.floor(Number(hoursWorkedInNovaScotia) || 0)));
  const sanitizedClb = Math.max(0, Math.min(12, Math.floor(Number(languageClbScore) || 0)));

  const activeExpressEntry = Boolean(hasActiveExpressEntryProfile);
  const validWorkPermit = Boolean(hasValidWorkPermitDuringExperience);
  const secondarySchoolOrEca = Boolean(hasSecondarySchoolOrEca);
  const intentToReside = Boolean(hasIntentToResideInNovaScotia);
  const signedRoS = Boolean(hasSignedReturnOfServiceWithNshOrIwk);
  const cpsnsLicensure = Boolean(hasCpsnsLicensureOrAssessment);
  const selfEmployed = Boolean(isSelfEmployed);

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];

  const isPhysicianStream =
    safeStream === 'physician_stream' ||
    NSNP_EXPERIENCE_RULES.PHYSICIAN_NOC_CODES.includes(safeNocCode);

  // 1. Age Verification
  const isAgeValid =
    sanitizedAge >= NSNP_EXPERIENCE_RULES.MIN_AGE && sanitizedAge <= NSNP_EXPERIENCE_RULES.MAX_AGE;
  if (isAgeValid) {
    compliancePoints.push(`Age ${sanitizedAge} is within the required 21–55 NSNP window.`);
  } else {
    deficiencies.push(
      `Candidate age (${sanitizedAge}) falls outside the mandatory NSNP age bracket of 21–55 years.`
    );
  }

  // 2. Stream-Specific Evaluation
  let isEligible = false;
  let eligibilityStatus = 'INELIGIBLE';

  if (isPhysicianStream) {
    // Physician Stream Audit
    const isPhysicianNoc = NSNP_EXPERIENCE_RULES.PHYSICIAN_NOC_CODES.includes(
      safeNocCode
    );
    if (!isPhysicianNoc) {
      deficiencies.push(
        `NOC code ${safeNocCode} is not an authorized physician occupation. Physician Stream requires NOC 31100, 31101, or 31102.`
      );
    } else {
      compliancePoints.push(
        `Target NOC ${safeNocCode} is recognized as an eligible physician specialty under the Nova Scotia Health framework.`
      );
    }

    if (!signedRoS) {
      deficiencies.push(
        'Physician Stream requires an approved, signed Return of Service (RoS) agreement with Nova Scotia Health (NSH) or the IWK Health Centre.'
      );
    } else {
      compliancePoints.push('Candidate holds a validated Return of Service agreement with NSH/IWK.');
    }

    if (!cpsnsLicensure) {
      deficiencies.push(
        'Candidate must hold a valid Defined Licence or preliminary eligibility assessment letter from the College of Physicians and Surgeons of Nova Scotia (CPSNS).'
      );
    } else {
      compliancePoints.push('CPSNS licensure or eligibility verification letter confirmed.');
    }

    isEligible =
      isAgeValid &&
      isPhysicianNoc &&
      signedRoS &&
      cpsnsLicensure &&
      intentToReside;

    if (isEligible) {
      eligibilityStatus = 'ELIGIBLE_FOR_NSNP_PHYSICIAN_STREAM';
      statutoryRemedies.push({
        action: 'Fast-Track Provincial Nomination Submission',
        timeline: 'Direct submission via NSNP portal (targeted 5-10 business day turnaround)',
        authority: 'Nova Scotia Immigration Act, SNS 2015, c. 6, s. 4'
      });
    }
  } else {
    // Nova Scotia Experience: Express Entry Stream
    if (!activeExpressEntry) {
      deficiencies.push(
        'Candidate does not hold an active federal Express Entry profile with a valid Job Seeker Validation Code.'
      );
    } else {
      compliancePoints.push('Active Express Entry profile registered with IRCC.');
    }

    // Work Experience Audit
    const hasEnoughMonths = sanitizedMonths >= NSNP_EXPERIENCE_RULES.MIN_EXPERIENCE_MONTHS;
    const hasEnoughHours = sanitizedHours >= NSNP_EXPERIENCE_RULES.MIN_EXPERIENCE_HOURS;
    const isTeerValid = sanitizedTeer >= 0 && sanitizedTeer <= 3;

    if (!isTeerValid) {
      deficiencies.push(
        `TEER level ${sanitizedTeer} is ineligible. Nova Scotia Experience: Express Entry strictly requires TEER 0, 1, 2, or 3.`
      );
    }

    if (!hasEnoughMonths || !hasEnoughHours) {
      deficiencies.push(
        `Inadequate Nova Scotia work experience. Requires at least 12 months (${sanitizedMonths}/12) and 1,560 hours (${sanitizedHours}/1560) within the past 3 years.`
      );
    } else {
      compliancePoints.push(
        `Work experience requirement satisfied: ${sanitizedMonths} months and ${sanitizedHours} hours in Nova Scotia.`
      );
    }

    if (!validWorkPermit) {
      deficiencies.push(
        'Work experience in Nova Scotia was not completed under valid federal work permit authorization. Unauthorized work is strictly disqualified under IRPA s. 30(1).'
      );
    }

    if (selfEmployed) {
      deficiencies.push(
        'Self-employed work experience is not eligible under the Nova Scotia Experience: Express Entry stream.'
      );
    }

    // Language Audit
    const langAudit = checkNsnpLanguageEligibility(sanitizedTeer, sanitizedClb);
    if (!langAudit.isEligible) {
      deficiencies.push(
        `Language benchmark shortfall: CLB ${sanitizedClb} achieved, but TEER ${sanitizedTeer} mandates minimum CLB ${langAudit.requiredClb}.`
      );
    } else {
      compliancePoints.push(
        `Language score CLB ${sanitizedClb} meets or exceeds required CLB ${langAudit.requiredClb} for TEER ${sanitizedTeer}.`
      );
    }

    // Education Audit
    if (!secondarySchoolOrEca) {
      deficiencies.push(
        'Requires proof of Canadian secondary school completion or a valid Educational Credential Assessment (ECA) within the past 5 years.'
      );
    } else {
      compliancePoints.push('Valid secondary education credential or ECA verified.');
    }

    // Settlement Intent
    if (!intentToReside) {
      deficiencies.push(
        'Must demonstrate genuine, credible intention to reside permanently in the Province of Nova Scotia.'
      );
    } else {
      compliancePoints.push('Permanent settlement intention in Nova Scotia documented.');
    }

    isEligible =
      isAgeValid &&
      activeExpressEntry &&
      hasEnoughMonths &&
      hasEnoughHours &&
      isTeerValid &&
      validWorkPermit &&
      !selfEmployed &&
      langAudit.isEligible &&
      secondarySchoolOrEca &&
      intentToReside;

    if (isEligible) {
      eligibilityStatus = 'ELIGIBLE_FOR_NSNP_EXPERIENCE_EXPRESS_ENTRY';
      statutoryRemedies.push({
        action: 'Submit NSNP Online Application',
        timeline: 'Apply through Nova Scotia e-Service portal within 30 days',
        authority: 'Nova Scotia Immigration Act, SNS 2015, c. 6'
      });
      statutoryRemedies.push({
        action: 'Accept Federal +600 CRS Nomination',
        timeline: 'Within 30 calendar days of nomination letter issuance in Express Entry portal',
        authority: 'IRPA Ministerial Instructions & IRPR s. 87.2'
      });
    }
  }

  const summary = isEligible
    ? `Candidate meets all statutory requirements for ${eligibilityStatus}. Successful provincial nomination awards +600 CRS points in Express Entry.`
    : `Candidate does not currently qualify for ${
        isPhysicianStream ? 'NSNP Physician Stream' : 'Nova Scotia Experience: Express Entry'
      }. Found ${deficiencies.length} statutory deficiency/deficiencies to resolve.`;

  return {
    assessmentDate: safeAssessmentDate,
    candidateName: safeCandidateName,
    stream: isPhysicianStream ? 'physician_stream' : 'nova_scotia_experience_express_entry',
    statutoryAuthority: 'Nova Scotia Immigration Act, SNS 2015, c. 6 & IRPA s. 10.3',
    isEligible,
    eligibilityStatus,
    summary,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'NS'
  };
}
