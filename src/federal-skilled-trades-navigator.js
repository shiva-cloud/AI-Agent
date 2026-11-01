/**
 * Northstar — Settlement Intelligence
 * Express Entry Federal Skilled Trades Program (FSTP) Engine
 *
 * Statutory Authorities:
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 87.2 (Federal Skilled Trades Class)
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 10.3 (Ministerial Instructions)
 * - Red Seal Program (Canadian Council of Directors of Apprenticeship - CCDA)
 * - Provincial Trades Regulatory Bodies (Skilled Trades Ontario, SkilledTradesBC, AIT Alberta)
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const FSTP_STATUTORY_RULES = Object.freeze({
  MIN_YEARS_EXPERIENCE: 2,
  MIN_HOURS_EXPERIENCE: 3120,
  EXPERIENCE_LOOKBACK_YEARS: 5,
  MIN_CLB_SPEAKING_LISTENING: 5,
  MIN_CLB_READING_WRITING: 4,
  ELIGIBLE_MAJOR_GROUPS: Object.freeze(['72', '73', '82', '83', '92', '93']),
  ELIGIBLE_SPECIFIC_GROUPS: Object.freeze(['63200', '62200']), // Cooks, Butchers, Chefs
  JOB_OFFER_MIN_DURATION_YEARS: 1,
  MAX_EMPLOYERS_ON_OFFER: 2,
  JURISDICTION: 'CA'
});

/**
 * Validates NOC trade group eligibility for FSTP under IRPR s. 87.2(1).
 */
export function isNocEligibleForSkilledTrades(nocCode) {
  const code = String(nocCode || '').trim();
  if (code.length < 2) return false;
  const majorGroup = code.slice(0, 2);
  if (FSTP_STATUTORY_RULES.ELIGIBLE_MAJOR_GROUPS.includes(majorGroup)) {
    return true;
  }
  return FSTP_STATUTORY_RULES.ELIGIBLE_SPECIFIC_GROUPS.some(spec => code.startsWith(spec));
}

/**
 * Evaluates candidate eligibility for the Federal Skilled Trades Program (FSTP).
 */
export function evaluateFederalSkilledTradesProgram(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    nocCode = '72410', // e.g. Automotive service technicians
    yearsOfTradesExperience = 3,
    hoursOfTradesExperience = 4500,
    hasCanadianCertificateOfQualification = false,
    certifyingProvince = 'ON',
    hasQualifyingCanadianJobOffer = true,
    jobOfferDurationYears = 1,
    numberOfEmployersOnJobOffer = 1,
    clbSpeaking = 5,
    clbListening = 5,
    clbReading = 4,
    clbWriting = 4,
    hasActiveExpressEntryProfile = true,
    candidateName = 'Tradesperson',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeNoc = boundedText(nocCode, '72410', 20);
  const sanitizedYears = Number.isFinite(Number(yearsOfTradesExperience)) ? Math.max(0, Math.min(50, Number(yearsOfTradesExperience))) : 3;
  const sanitizedHours = Number.isFinite(Number(hoursOfTradesExperience)) ? Math.max(0, Math.min(100000, Number(hoursOfTradesExperience))) : 4500;
  const qualCert = Boolean(hasCanadianCertificateOfQualification);
  const certProv = boundedText(certifyingProvince, 'ON', 20).toUpperCase();
  const qualifyingOffer = Boolean(hasQualifyingCanadianJobOffer);
  const sanitizedJobDuration = Number.isFinite(Number(jobOfferDurationYears)) ? Math.max(0, Math.min(30, Number(jobOfferDurationYears))) : 1;
  const sanitizedEmployers = Number.isFinite(Number(numberOfEmployersOnJobOffer)) ? Math.max(1, Math.min(20, Math.floor(Number(numberOfEmployersOnJobOffer)))) : 1;

  const sanitizedSpeaking = Number.isFinite(Number(clbSpeaking)) ? Math.max(0, Math.min(12, Math.floor(Number(clbSpeaking)))) : 5;
  const sanitizedListening = Number.isFinite(Number(clbListening)) ? Math.max(0, Math.min(12, Math.floor(Number(clbListening)))) : 5;
  const sanitizedReading = Number.isFinite(Number(clbReading)) ? Math.max(0, Math.min(12, Math.floor(Number(clbReading)))) : 4;
  const sanitizedWriting = Number.isFinite(Number(clbWriting)) ? Math.max(0, Math.min(12, Math.floor(Number(clbWriting)))) : 4;

  const activeEeProfile = Boolean(hasActiveExpressEntryProfile);
  
  
  const name = boundedText(candidateName, 'Tradesperson', 100);
  const assessDate = safeIsoDate(assessmentDate, '2026-10-31');

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];

  // 1. NOC Trade Group Eligibility
  const isTradeNoc = isNocEligibleForSkilledTrades(safeNoc);
  if (!isTradeNoc) {
    deficiencies.push(
      `NOC ${safeNoc} is not in an eligible trade group. IRPR s. 87.2(1) strictly limits FSTP to Major Groups 72, 73, 82, 83, 92, 93, or Minor Groups 63200 (cooks/butchers) and 62200 (chefs).`
    );
  } else {
    compliancePoints.push(`NOC ${safeNoc} belongs to an approved FSTP skilled trades category.`);
  }

  // 2. Work Experience Requirements (2 years / 3,120 hours in past 5 years)
  const hasSufficientExperience =
    sanitizedYears >= FSTP_STATUTORY_RULES.MIN_YEARS_EXPERIENCE &&
    sanitizedHours >= FSTP_STATUTORY_RULES.MIN_HOURS_EXPERIENCE;

  if (!hasSufficientExperience) {
    deficiencies.push(
      `Experience shortfall: Candidate has completed ${sanitizedYears} years (${sanitizedHours} hours), but IRPR s. 87.2(3)(a) mandates at least 2 full years (3,120 hours) within the 5-year lookback period.`
    );
  } else {
    compliancePoints.push(
      `Skilled trades experience satisfied: ${sanitizedYears} years (${sanitizedHours} hours) in the target trade.`
    );
  }

  // 3. Trade Prerequisite: Certificate of Qualification OR Qualifying Job Offer
  const hasValidJobOffer =
    qualifyingOffer &&
    sanitizedJobDuration >= FSTP_STATUTORY_RULES.JOB_OFFER_MIN_DURATION_YEARS &&
    sanitizedEmployers <= FSTP_STATUTORY_RULES.MAX_EMPLOYERS_ON_OFFER;

  const hasTradePrerequisite = qualCert || hasValidJobOffer;

  if (!hasTradePrerequisite) {
    deficiencies.push(
      'Missing mandatory trades prerequisite under IRPR s. 87.2(3)(b): Candidate must hold EITHER a valid Certificate of Qualification issued by a Canadian provincial/territorial authority (e.g. Red Seal) OR a valid full-time continuous Canadian job offer of at least 1 year from up to 2 employers.'
    );
  } else {
    if (qualCert) {
      compliancePoints.push(
        `Holds valid Canadian Certificate of Qualification issued in ${certProv} satisfying IRPR s. 87.2(3)(b)(ii).`
      );
    }
    if (hasValidJobOffer) {
      compliancePoints.push(
        `Qualifying full-time job offer confirmed from ${sanitizedEmployers} employer(s) for ${sanitizedJobDuration} year(s).`
      );
    }
  }

  if (qualifyingOffer && sanitizedEmployers > FSTP_STATUTORY_RULES.MAX_EMPLOYERS_ON_OFFER) {
    deficiencies.push(
      `Job offer involves ${sanitizedEmployers} employers. IRPR s. 87.2(3)(b)(i) restricts qualifying offers to a maximum of 2 employers.`
    );
  }

  // 4. Language Benchmarks (CLB 5 Speaking/Listening, CLB 4 Reading/Writing)
  const isSpeakingValid = sanitizedSpeaking >= FSTP_STATUTORY_RULES.MIN_CLB_SPEAKING_LISTENING;
  const isListeningValid = sanitizedListening >= FSTP_STATUTORY_RULES.MIN_CLB_SPEAKING_LISTENING;
  const isReadingValid = sanitizedReading >= FSTP_STATUTORY_RULES.MIN_CLB_READING_WRITING;
  const isWritingValid = sanitizedWriting >= FSTP_STATUTORY_RULES.MIN_CLB_READING_WRITING;

  const isLanguageCompliant =
    isSpeakingValid && isListeningValid && isReadingValid && isWritingValid;

  if (!isLanguageCompliant) {
    deficiencies.push(
      `Language benchmark shortfall: FSTP requires minimum CLB 5 in Speaking (achieved: ${sanitizedSpeaking}) and Listening (achieved: ${sanitizedListening}), and minimum CLB 4 in Reading (achieved: ${sanitizedReading}) and Writing (achieved: ${sanitizedWriting}).`
    );
  } else {
    compliancePoints.push(
      `Language thresholds satisfied: Speaking ${sanitizedSpeaking}, Listening ${sanitizedListening}, Reading ${sanitizedReading}, Writing ${sanitizedWriting}.`
    );
  }

  // 5. Express Entry Profile
  if (!activeEeProfile) {
    deficiencies.push(
      'Candidate does not hold an active federal Express Entry pool profile.'
    );
  } else {
    compliancePoints.push('Active Express Entry profile registered.');
  }

  // Overall Eligibility
  const isEligible =
    isTradeNoc &&
    hasSufficientExperience &&
    hasTradePrerequisite &&
    isLanguageCompliant &&
    activeEeProfile;

  const eligibilityStatus = isEligible ? 'ELIGIBLE_FOR_FSTP' : 'INELIGIBLE_FOR_FSTP';

  if (isEligible) {
    statutoryRemedies.push({
      action: 'Enter Express Entry Category-Based Draws (Trades Category)',
      description:
        'Ensure Express Entry profile is tagged with qualifying NOC to receive Invitations to Apply (ITA) under category-based trade selection rounds with reduced CRS cutoffs.',
      statutoryAuthority: 'IRPA s. 10.3 & Ministerial Instructions'
    });
    if (qualCert) {
      statutoryRemedies.push({
        action: 'Claim +50 CRS Points for Certificate of Qualification',
        description:
          'Under the Comprehensive Ranking System (CRS), a valid provincial Certificate of Qualification awards up to 50 additional CRS points.',
        statutoryAuthority: 'IRPR Schedule 1 (CRS Ministerial Instructions)'
      });
    }
  } else {
    if (!qualCert && !qualifyingOffer) {
      statutoryRemedies.push({
        action: 'Pursue Provincial Trade Challenge / Red Seal Exam',
        description:
          'Apply for Trade Equivalency Assessment through the provincial regulatory body (e.g. Skilled Trades Ontario Trade Assessment) to sit for the Certificate of Qualification examination without re-apprenticing.',
        statutoryAuthority: 'Building Opportunities in the Skilled Trades Act, 2021, S.O. 2021, c. 28'
      });
    }
  }

  const summary = isEligible
    ? 'Candidate satisfies all statutory prerequisites for the Federal Skilled Trades Program under IRPR s. 87.2 and qualifies for dedicated trade category draws in Express Entry.'
    : `Candidate does not currently qualify for FSTP. Found ${deficiencies.length} statutory deficiency/deficiencies to resolve.`;

  return {
    assessmentDate: assessDate,
    candidateName: name,
    statutoryAuthority: 'Immigration and Refugee Protection Regulations, SOR/2002-227, s. 87.2 (Federal Skilled Trades Class)',
    isEligible,
    eligibilityStatus,
    nocCode: safeNoc,
    isTradeNoc,
    yearsOfTradesExperience: sanitizedYears,
    hasTradePrerequisite,
    languageScores: {
      speaking: sanitizedSpeaking,
      listening: sanitizedListening,
      reading: sanitizedReading,
      writing: sanitizedWriting,
      isLanguageCompliant
    },
    summary,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'CA'
  };
}
