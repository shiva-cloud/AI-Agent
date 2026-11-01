// src/express-entry-tie-breaking-navigator.js
// Express Entry Tie-Breaking Rule & Category-Based Selection Runway Engine
// Statutory Basis: Immigration and Refugee Protection Act (IRPA) s. 10.3 (Ministerial Instructions)

import { boundedText } from './text-input.js';

export const EXPRESS_ENTRY_RULES = {
  STATUTE: 'Immigration and Refugee Protection Act, S.C. 2001, c. 27, s. 10.3',
  TIE_BREAKER_BASIS: 'Profile Submission Timestamp (UTC)',
  PROVINCIAL_NOMINATION_BONUS_POINTS: 600,
  FRENCH_BILINGUAL_BONUS_POINTS: 50,
  CANADIAN_MASTERS_BONUS_POINTS: 30,
  CANADIAN_SIBLING_BONUS_POINTS: 15,
  CATEGORY_BENCHMARKS: {
    french_language: { name: 'French-Language Proficiency (NCLC 7+)', typicalCutoff: 410, volatility: 'LOW' },
    healthcare: { name: 'Healthcare Occupations', typicalCutoff: 445, volatility: 'MODERATE' },
    trades: { name: 'Trade Occupations', typicalCutoff: 435, volatility: 'MODERATE' },
    stem: { name: 'STEM Occupations', typicalCutoff: 490, volatility: 'HIGH' },
    transport: { name: 'Transport Occupations', typicalCutoff: 430, volatility: 'MODERATE' },
    agriculture: { name: 'Agriculture & Agri-Food', typicalCutoff: 395, volatility: 'LOW' },
    cec_general: { name: 'Canadian Experience Class (General)', typicalCutoff: 520, volatility: 'HIGH' }
  }
};

/**
 * Computes tie-breaking eligibility, age decay projection, and category-based ITA probability.
 *
 * @param {Object} input
 * @param {number} input.candidateCrs - Candidate's current Comprehensive Ranking System (CRS) score
 * @param {string} input.profileSubmissionUtc - ISO timestamp when Express Entry profile was submitted (e.g., '2026-03-15T14:30:00Z')
 * @param {string} input.targetCategory - 'french_language', 'healthcare', 'trades', 'stem', 'transport', 'agriculture', 'cec_general'
 * @param {number} input.candidateAge - Current age of candidate in years
 * @param {number} input.simulatedRoundCutoff - Simulated or historical draw CRS cutoff score
 * @param {string} input.simulatedTieBreakUtc - Simulated draw tie-breaking UTC timestamp
 * @param {boolean} input.isFrenchNclc7 - Holds NCLC 7 or higher in French
 * @param {boolean} input.hasCanadianMasterOrPhd - Completed Canadian master's or PhD degree
 * @param {boolean} input.hasProvincialNomination - Holds active PNP provincial nomination
 * @param {string} [input.candidateName] - Candidate name
 * @returns {Object} Deterministic tie-breaking audit, score trajectory, and strategic recommendations
 */
export function evaluateExpressEntryTieBreak(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const {
    candidateCrs = 485,
    profileSubmissionUtc = '2026-04-01T10:00:00Z',
    targetCategory = 'stem',
    candidateAge = 29,
    simulatedRoundCutoff = 485,
    simulatedTieBreakUtc = '2026-04-10T00:00:00Z',
    isFrenchNclc7 = false,
    hasCanadianMasterOrPhd = false,
    hasProvincialNomination = false,
    candidateName = 'Candidate'
  } = safeInput;

  const findings = [];
  const strategicJumps = [];

  const cleanName = boundedText(candidateName, 'Candidate', 120);
  const cleanTargetCategory = boundedText(targetCategory, 'stem', 60).toLowerCase();
  const rawCrs = Number.isFinite(Number(candidateCrs)) ? Math.max(0, Math.min(1200, Math.round(Number(candidateCrs)))) : 485;
  const cutoff = Number.isFinite(Number(simulatedRoundCutoff)) ? Math.max(0, Math.min(1200, Math.round(Number(simulatedRoundCutoff)))) : 485;
  const age = Number.isFinite(Number(candidateAge)) ? Math.max(0, Math.min(120, Math.round(Number(candidateAge)))) : 29;

  // Effective score calculation
  let effectiveCrs = rawCrs;
  if (hasProvincialNomination && rawCrs < 600) {
    effectiveCrs += EXPRESS_ENTRY_RULES.PROVINCIAL_NOMINATION_BONUS_POINTS;
  }

  // 1. Tie-Breaking Mechanics
  const candidateTimestampMs = Date.parse(profileSubmissionUtc);
  const tieBreakTimestampMs = Date.parse(simulatedTieBreakUtc);
  const validCandidateDate = Number.isFinite(candidateTimestampMs);
  const validTieBreakDate = Number.isFinite(tieBreakTimestampMs);

  let tieBreakStatus = 'NOT_APPLICABLE';
  let receivesIta = false;

  if (effectiveCrs > cutoff) {
    receivesIta = true;
    tieBreakStatus = 'EXCEEDS_CUTOFF';
    findings.push({
      type: 'CLEARED_CUTOFF',
      details: `CRS ${effectiveCrs} is above the draw cutoff of ${cutoff}. Tie-breaking rule does not apply.`
    });
  } else if (effectiveCrs === cutoff) {
    if (!validCandidateDate || !validTieBreakDate) {
      receivesIta = false;
      tieBreakStatus = 'INVALID_TIMESTAMP';
      findings.push({
        type: 'TIMESTAMP_PARSE_ERROR',
        details: `Invalid UTC timestamp supplied for profile submission ('${profileSubmissionUtc}') or draw tie-break ('${simulatedTieBreakUtc}'). Cannot verify tie-break precedence.`
      });
    } else if (candidateTimestampMs <= tieBreakTimestampMs) {
      receivesIta = true;
      tieBreakStatus = 'WON_TIE_BREAKER';
      findings.push({
        type: 'TIE_BREAKER_FAVOURABLE',
        details: `CRS matches cutoff (${cutoff}). Profile was registered on ${profileSubmissionUtc}, before the draw cutoff timestamp of ${simulatedTieBreakUtc}. ITA is granted under IRPA s. 10.3.`
      });
    } else {
      receivesIta = false;
      tieBreakStatus = 'LOST_TIE_BREAKER';
      findings.push({
        type: 'TIE_BREAKER_UNFAVOURABLE',
        details: `CRS matches cutoff (${cutoff}), but profile was submitted after the tie-breaking timestamp (${profileSubmissionUtc} > ${simulatedTieBreakUtc}). No ITA issued this round.`
      });
    }
  } else {
    receivesIta = false;
    tieBreakStatus = 'BELOW_CUTOFF';
    findings.push({
      type: 'BELOW_CUTOFF',
      details: `CRS ${effectiveCrs} is ${cutoff - effectiveCrs} point(s) below the current round cutoff of ${cutoff}.`
    });
  }

  // 2. Category Assessment
  const benchmark = EXPRESS_ENTRY_RULES.CATEGORY_BENCHMARKS[cleanTargetCategory] || EXPRESS_ENTRY_RULES.CATEGORY_BENCHMARKS.cec_general;
  const gapToBenchmark = benchmark.typicalCutoff - effectiveCrs;
  const isCompetitiveInCategory = effectiveCrs >= benchmark.typicalCutoff;

  // 3. Age Decay Runway
  let nextBirthdayPenalty = 0;
  if (age >= 29 && age < 39) {
    nextBirthdayPenalty = 5;
  } else if (age >= 39 && age < 45) {
    nextBirthdayPenalty = 10;
  } else if (age >= 45) {
    nextBirthdayPenalty = 0;
  }

  const ageRunwayYears = Math.max(0, 45 - age);

  // 4. Score Growth Leverage Strategies
  if (!isFrenchNclc7) {
    strategicJumps.push({
      strategy: 'French Language Proficiency (NCLC 7+)',
      pointsGain: EXPRESS_ENTRY_RULES.FRENCH_BILINGUAL_BONUS_POINTS,
      impact: 'Unlocks French category draws (lowest cutoffs ~410) plus +50 additional bilingual bonus points.'
    });
  }
  if (!hasProvincialNomination) {
    strategicJumps.push({
      strategy: 'Provincial Nominee Program (PNP) Nomination',
      pointsGain: EXPRESS_ENTRY_RULES.PROVINCIAL_NOMINATION_BONUS_POINTS,
      impact: 'Positions you for selection in the next Express Entry draw with an automatic +600 points.'
    });
  }
  if (!hasCanadianMasterOrPhd) {
    strategicJumps.push({
      strategy: 'Canadian Graduate Degree (Master\'s/PhD)',
      pointsGain: EXPRESS_ENTRY_RULES.CANADIAN_MASTERS_BONUS_POINTS,
      impact: 'Yields +30 CRS bonus points for 3+ year or graduate Canadian credential.'
    });
  }

  return {
    candidateName: cleanName,
    statutoryAuthority: EXPRESS_ENTRY_RULES.STATUTE,
    currentScore: effectiveCrs,
    simulatedRound: {
      cutoff,
      tieBreakUtc: simulatedTieBreakUtc,
      candidateSubmissionUtc: profileSubmissionUtc,
      receivesIta,
      tieBreakStatus
    },
    categoryAudit: {
      categoryKey: cleanTargetCategory,
      categoryName: benchmark.name,
      typicalCutoff: benchmark.typicalCutoff,
      isCompetitive: isCompetitiveInCategory,
      gapToCutoff: gapToBenchmark > 0 ? gapToBenchmark : 0
    },
    ageRunway: {
      currentAge: age,
      nextBirthdayPenaltyPoints: nextBirthdayPenalty,
      remainingRunwayYearsToAge45: ageRunwayYears
    },
    summary: receivesIta
      ? `${cleanName} receives an ITA in this round (${tieBreakStatus === 'WON_TIE_BREAKER' ? 'won tie-breaker by UTC submission time' : 'score exceeds draw cutoff'}).`
      : `${cleanName} is not issued an ITA (${tieBreakStatus === 'LOST_TIE_BREAKER' ? 'profile registered after tie-break timestamp' : 'score below cutoff'}).`,
    findings,
    strategicJumps,
    jurisdiction: 'Federal Canada (IRCC)'
  };
}
