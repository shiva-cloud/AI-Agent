// src/express-entry-optimizer.js
// Canadian Express Entry Comprehensive Ranking System (CRS) & Category-Based Selection Optimizer.
// Audits CRS points under IRPA s. 10.2 & s. 10.3 Ministerial Instructions, Bill C-19 category-based
// selection rounds, and calculates mathematical optimization levers across:
// - Core Human Capital Points (Age, Education, First/Second Official Language, Canadian Experience)
// - Spouse/Common-Law Factors
// - Skill Transferability Multipliers (Education x CLB, Foreign Work x Canadian Experience)
// - Additional Points (Provincial Nomination 600, Bilingual Bonus 50, Canadian Study, Sibling).
//   Arranged-employment (job offer) points were removed by IRCC on 25 March 2025 and score 0.
// - Category-Based Draw Eligibility (French, STEM, Healthcare, Trades, Transport, Agriculture).
// Pure ES module with zero npm runtime dependencies.

import { boundedText } from './text-input.js';

export const CRS_STATUTORY_CONSTANTS = {
  MAX_TOTAL_POINTS: 1200,
  MAX_CORE_HUMAN_CAPITAL_SINGLE: 500,
  MAX_CORE_HUMAN_CAPITAL_MARRIED: 460,
  MAX_SPOUSE_FACTORS: 40,
  MAX_SKILL_TRANSFERABILITY: 100,
  MAX_ADDITIONAL_POINTS: 600,
  PNP_NOMINATION_POINTS: 600,
  ARRANGED_EMPLOYMENT_POINTS: 0, // Removed from CRS effective 25 March 2025
  ARRANGED_EMPLOYMENT_POINTS_REMOVED_ON: '2025-03-25',
  FRENCH_BILINGUAL_BONUS_HIGH_ENGLISH: 50, // NCLC 7+ French + CLB 5+ English
  FRENCH_BILINGUAL_BONUS_LOW_ENGLISH: 25,  // NCLC 7+ French + CLB <=4 English
  CANADIAN_STUDY_1_OR_2_YEARS: 15,
  CANADIAN_STUDY_3_PLUS_YEARS_OR_MASTERS: 30,
  SIBLING_IN_CANADA_POINTS: 15
};

// Benchmark category-based selection cut-off scores (approximate operational benchmarks)
export const BENCHMARK_DRAW_CUTOFFS = {
  general_all_program: { name: 'General / All-Program Draw', cutoff: 535, stream: 'General' },
  canadian_experience_class: { name: 'Canadian Experience Class (CEC)', cutoff: 515, stream: 'CEC' },
  french_language_proficiency: { name: 'Category 1: French-Language Proficiency', cutoff: 418, stream: 'French' },
  healthcare_occupations: { name: 'Category 2: Healthcare Occupations', cutoff: 438, stream: 'Healthcare' },
  stem_occupations: { name: 'Category 3: STEM Occupations', cutoff: 491, stream: 'STEM' },
  trade_occupations: { name: 'Category 4: Trade Occupations', cutoff: 433, stream: 'Trades' },
  transport_occupations: { name: 'Category 5: Transport Occupations', cutoff: 430, stream: 'Transport' },
  agriculture_occupations: { name: 'Category 6: Agriculture & Agri-Food', cutoff: 420, stream: 'Agriculture' },
  provincial_nominee_program: { name: 'Provincial Nominee Program (PNP)', cutoff: 735, stream: 'PNP' }
};

export const AGE_POINTS_TABLE = {
  17: { single: 0, married: 0 },
  18: { single: 99, married: 90 },
  19: { single: 105, married: 95 },
  20: { single: 110, married: 100 },
  21: { single: 110, married: 100 },
  22: { single: 110, married: 100 },
  23: { single: 110, married: 100 },
  24: { single: 110, married: 100 },
  25: { single: 110, married: 100 },
  26: { single: 110, married: 100 },
  27: { single: 110, married: 100 },
  28: { single: 110, married: 100 },
  29: { single: 110, married: 100 },
  30: { single: 105, married: 95 },
  31: { single: 99, married: 90 },
  32: { single: 94, married: 85 },
  33: { single: 88, married: 80 },
  34: { single: 83, married: 75 },
  35: { single: 77, married: 70 },
  36: { single: 72, married: 65 },
  37: { single: 66, married: 60 },
  38: { single: 61, married: 55 },
  39: { single: 55, married: 50 },
  40: { single: 50, married: 45 },
  41: { single: 39, married: 35 },
  42: { single: 28, married: 25 },
  43: { single: 17, married: 15 },
  44: { single: 6, married: 5 },
  45: { single: 0, married: 0 }
};

export function getAgePoints(age, isMarried) {
  const a = Math.max(17, Math.min(45, Math.round(Number.isFinite(Number(age)) ? Number(age) : 29)));
  const row = AGE_POINTS_TABLE[a] || { single: 0, married: 0 };
  return isMarried ? row.married : row.single;
}

export function getEducationPoints(educationLevel, isMarried) {
  const norm = String(educationLevel || 'bachelors').toLowerCase().trim();
  switch (norm) {
    case 'doctoral':
    case 'phd':
      return isMarried ? 140 : 150;
    case 'masters':
    case 'professional_degree':
      return isMarried ? 126 : 135;
    case 'two_or_more_degrees':
    case 'double_credential':
      return isMarried ? 119 : 128;
    case 'bachelors':
    case 'degree_3_year':
      return isMarried ? 112 : 120;
    case 'diploma_2_year':
      return isMarried ? 91 : 98;
    case 'certificate_1_year':
      return isMarried ? 84 : 90;
    case 'secondary':
    case 'high_school':
      return isMarried ? 28 : 30;
    default:
      return 0;
  }
}

export function getLanguageAbilityPoints(clb, isMarried) {
  const c = Math.max(0, Math.min(10, Math.floor(Number.isFinite(Number(clb)) ? Number(clb) : 0)));
  if (c >= 10) return isMarried ? 32 : 34;
  if (c === 9) return isMarried ? 29 : 31;
  if (c === 8) return isMarried ? 22 : 23;
  if (c === 7) return isMarried ? 16 : 17;
  if (c === 6) return isMarried ? 8 : 9;
  if (c === 4 || c === 5) return 6;
  return 0;
}

export function getCanadianExperiencePoints(years, isMarried) {
  const y = Math.max(0, Math.min(50, Math.floor(Number.isFinite(Number(years)) ? Number(years) : 0)));
  if (y >= 5) return isMarried ? 70 : 80;
  if (y === 4) return isMarried ? 63 : 72;
  if (y === 3) return isMarried ? 56 : 64;
  if (y === 2) return isMarried ? 46 : 53;
  if (y === 1) return isMarried ? 35 : 40;
  return 0;
}

export function evaluateExpressEntryCrs(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    age = 29,
    educationLevel = 'masters', // 'doctoral', 'masters', 'two_or_more_degrees', 'bachelors', 'diploma_2_year', 'certificate_1_year', 'secondary'
    firstLanguageClb = { reading: 9, writing: 9, listening: 9, speaking: 9 }, // Object or uniform number
    secondLanguageClb = { reading: 0, writing: 0, listening: 0, speaking: 0 },
    canadianWorkExperienceYears = 1,
    foreignWorkExperienceYears = 3,
    isMarried = false,
    spouseFactors = {
      educationLevel: 'bachelors',
      firstLanguageClb: 7,
      canadianWorkExperienceYears: 0
    },
    certificateOfQualification = false, // Trade certification
    hasProvincialNomination = false,
    hasArrangedEmploymentLmia = false, // Accepted for API compatibility; scores 0 since 25 March 2025
    canadianEducationLevel = 'post_secondary_3_plus_years', // 'none', 'post_secondary_1_or_2_years', 'post_secondary_3_plus_years'
    hasSiblingInCanada = false,
    frenchNclcLevel = 0, // French language NCLC score
    targetOccupationNoc = '21231', // NOC code e.g. 21231 (Software Engineer)
    occupationCategory = 'stem' // 'stem', 'healthcare', 'trades', 'transport', 'agriculture', 'none'
  } = safeParams;
  const normAge = Math.max(16, Math.min(65, Math.round(Number.isFinite(Number(age)) ? Number(age) : 29)));
  const normMarried = Boolean(isMarried);
  const normCdnExp = Math.max(0, Math.min(50, Number.isFinite(Number(canadianWorkExperienceYears)) ? Number(canadianWorkExperienceYears) : 0));
  const normForeignExp = Math.max(0, Math.min(50, Number.isFinite(Number(foreignWorkExperienceYears)) ? Number(foreignWorkExperienceYears) : 0));
  const normFrench = Math.max(0, Math.min(12, Number.isFinite(Number(frenchNclcLevel)) ? Number(frenchNclcLevel) : 0));
  const normCategory = boundedText(occupationCategory, 'none', 60).toLowerCase();
  const normNoc = boundedText(targetOccupationNoc, '21231', 20);
  const normEdu = boundedText(educationLevel, 'masters', 60);
  const normCdnEdu = boundedText(canadianEducationLevel, 'post_secondary_3_plus_years', 60);

  // Normalize First Language CLB
  let clbRead = 9, clbWrite = 9, clbListen = 9, clbSpeak = 9;
  if (typeof firstLanguageClb === 'number') {
    const val = Math.max(0, Math.min(12, Number.isFinite(firstLanguageClb) ? firstLanguageClb : 9));
    clbRead = clbWrite = clbListen = clbSpeak = val;
  } else if (typeof firstLanguageClb === 'object' && firstLanguageClb !== null) {
    clbRead = Math.max(0, Math.min(12, Number.isFinite(Number(firstLanguageClb.reading)) ? Number(firstLanguageClb.reading) : 9));
    clbWrite = Math.max(0, Math.min(12, Number.isFinite(Number(firstLanguageClb.writing)) ? Number(firstLanguageClb.writing) : 9));
    clbListen = Math.max(0, Math.min(12, Number.isFinite(Number(firstLanguageClb.listening)) ? Number(firstLanguageClb.listening) : 9));
    clbSpeak = Math.max(0, Math.min(12, Number.isFinite(Number(firstLanguageClb.speaking)) ? Number(firstLanguageClb.speaking) : 9));
  }
  const minFirstLangClb = Math.min(clbRead, clbWrite, clbListen, clbSpeak);
  const avgFirstLangClb = (clbRead + clbWrite + clbListen + clbSpeak) / 4;

  // 1. Core Human Capital Points
  const agePoints = getAgePoints(normAge, normMarried);
  const educationPoints = getEducationPoints(normEdu, normMarried);
  const firstLangPoints = getLanguageAbilityPoints(clbRead, normMarried)
    + getLanguageAbilityPoints(clbWrite, normMarried)
    + getLanguageAbilityPoints(clbListen, normMarried)
    + getLanguageAbilityPoints(clbSpeak, normMarried);

  // Second language points
  let secondLangPoints = 0;
  if (normFrench >= 5) {
    const ptsPerBand = normFrench >= 9 ? (normMarried ? 6 : 6) : normFrench >= 7 ? 3 : 1;
    secondLangPoints = Math.min(normMarried ? 22 : 24, ptsPerBand * 4);
  }

  const cdnExpPoints = getCanadianExperiencePoints(normCdnExp, normMarried);
  const subtotalHumanCapital = agePoints + educationPoints + firstLangPoints + secondLangPoints + cdnExpPoints;

  // 2. Spouse Factors (if applicable)
  let spousePoints = 0;
  let spouseBreakdown = { education: 0, language: 0, cdnExperience: 0 };
  const safeSpouseFactors = (spouseFactors && typeof spouseFactors === 'object') ? spouseFactors : {};
  if (normMarried) {
    // Spouse Education (Max 10)
    const spEdu = boundedText(safeSpouseFactors.educationLevel, 'bachelors', 60).toLowerCase();
    if (['doctoral', 'phd', 'masters'].includes(spEdu)) spouseBreakdown.education = 10;
    else if (['two_or_more_degrees', 'bachelors'].includes(spEdu)) spouseBreakdown.education = 9;
    else if (['diploma_2_year'].includes(spEdu)) spouseBreakdown.education = 8;
    else if (['certificate_1_year'].includes(spEdu)) spouseBreakdown.education = 7;
    else if (['secondary'].includes(spEdu)) spouseBreakdown.education = 2;

    // Spouse Language (Max 20: 5 pts per ability if CLB 9+, 3 pts if CLB 7-8, 1 pt if CLB 5-6)
    const spClb = Math.max(0, Math.min(12, Number.isFinite(Number(safeSpouseFactors.firstLanguageClb)) ? Number(safeSpouseFactors.firstLanguageClb) : 7));
    const spPtsPerAbility = spClb >= 9 ? 5 : spClb >= 7 ? 3 : spClb >= 5 ? 1 : 0;
    spouseBreakdown.language = Math.min(20, spPtsPerAbility * 4);

    // Spouse Canadian Experience (Max 10)
    const spCdnExp = Math.max(0, Math.min(50, Number.isFinite(Number(safeSpouseFactors.canadianWorkExperienceYears)) ? Number(safeSpouseFactors.canadianWorkExperienceYears) : 0));
    if (spCdnExp >= 5) spouseBreakdown.cdnExperience = 10;
    else if (spCdnExp === 4) spouseBreakdown.cdnExperience = 9;
    else if (spCdnExp === 3) spouseBreakdown.cdnExperience = 8;
    else if (spCdnExp === 2) spouseBreakdown.cdnExperience = 7;
    else if (spCdnExp === 1) spouseBreakdown.cdnExperience = 5;

    spousePoints = spouseBreakdown.education + spouseBreakdown.language + spouseBreakdown.cdnExperience;
  }

  // 3. Skill Transferability Factors (Max 100)
  // Check if first language has all CLB 7+ or CLB 9+
  const isAllClb7Plus = minFirstLangClb >= 7;
  const isAllClb9Plus = minFirstLangClb >= 9;

  // A. Education + Language (Max 50)
  let eduLangTransfer = 0;
  const isHighEdu = ['masters', 'doctoral', 'phd', 'two_or_more_degrees'].includes(String(educationLevel).toLowerCase());
  const isPostSec = isHighEdu || ['bachelors', 'diploma_2_year', 'certificate_1_year'].includes(String(educationLevel).toLowerCase());

  if (isHighEdu) {
    if (isAllClb9Plus) eduLangTransfer = 50;
    else if (isAllClb7Plus) eduLangTransfer = 25;
  } else if (isPostSec) {
    if (isAllClb9Plus) eduLangTransfer = 25;
    else if (isAllClb7Plus) eduLangTransfer = 13;
  }

  // B. Education + Canadian Work Experience (Max 50)
  let eduCdnExpTransfer = 0;
  if (normCdnExp >= 2) {
    eduCdnExpTransfer = isHighEdu ? 50 : isPostSec ? 25 : 0;
  } else if (normCdnExp === 1) {
    eduCdnExpTransfer = isHighEdu ? 25 : isPostSec ? 13 : 0;
  }
  const educationTransferSubtotal = Math.min(50, eduLangTransfer + eduCdnExpTransfer);

  // C. Foreign Work Experience + Language (Max 50)
  let foreignExpLangTransfer = 0;
  if (normForeignExp >= 3) {
    if (isAllClb9Plus) foreignExpLangTransfer = 50;
    else if (isAllClb7Plus) foreignExpLangTransfer = 25;
  } else if (normForeignExp >= 1) {
    if (isAllClb9Plus) foreignExpLangTransfer = 25;
    else if (isAllClb7Plus) foreignExpLangTransfer = 13;
  }

  // D. Foreign Work Experience + Canadian Work Experience (Max 50)
  let foreignExpCdnExpTransfer = 0;
  if (normForeignExp >= 3) {
    foreignExpCdnExpTransfer = normCdnExp >= 2 ? 50 : normCdnExp === 1 ? 25 : 0;
  } else if (normForeignExp >= 1) {
    foreignExpCdnExpTransfer = normCdnExp >= 2 ? 25 : normCdnExp === 1 ? 13 : 0;
  }
  const foreignExpTransferSubtotal = Math.min(50, foreignExpLangTransfer + foreignExpCdnExpTransfer);

  // E. Certificate of Qualification in a trade (Max 50)
  let tradeCertTransfer = 0;
  if (certificateOfQualification) {
    if (isAllClb7Plus) tradeCertTransfer = 50;
    else if (minFirstLangClb >= 5) tradeCertTransfer = 25;
  }

  const skillTransferabilityTotal = Math.min(CRS_STATUTORY_CONSTANTS.MAX_SKILL_TRANSFERABILITY, educationTransferSubtotal + foreignExpTransferSubtotal + tradeCertTransfer);

  // 4. Additional Points (Max 600)
  let additionalPoints = 0;
  const additionalBreakdown = {
    provincialNomination: 0,
    arrangedEmployment: 0,
    canadianStudy: 0,
    frenchBilingualism: 0,
    siblingInCanada: 0
  };

  if (hasProvincialNomination) {
    additionalBreakdown.provincialNomination = CRS_STATUTORY_CONSTANTS.PNP_NOMINATION_POINTS;
  }

  // Job offers no longer add CRS points; the field stays in the breakdown as 0.
  additionalBreakdown.arrangedEmployment = CRS_STATUTORY_CONSTANTS.ARRANGED_EMPLOYMENT_POINTS;

  const normCdnStudy = normCdnEdu.toLowerCase();
  if (normCdnStudy === 'post_secondary_3_plus_years' || normCdnStudy === 'masters' || normCdnStudy === 'doctoral') {
    additionalBreakdown.canadianStudy = CRS_STATUTORY_CONSTANTS.CANADIAN_STUDY_3_PLUS_YEARS_OR_MASTERS;
  } else if (normCdnStudy === 'post_secondary_1_or_2_years') {
    additionalBreakdown.canadianStudy = CRS_STATUTORY_CONSTANTS.CANADIAN_STUDY_1_OR_2_YEARS;
  }

  // French Bilingual Bonus
  if (normFrench >= 7) {
    const isEnglishClb5Plus = minFirstLangClb >= 5;
    additionalBreakdown.frenchBilingualism = isEnglishClb5Plus
      ? CRS_STATUTORY_CONSTANTS.FRENCH_BILINGUAL_BONUS_HIGH_ENGLISH
      : CRS_STATUTORY_CONSTANTS.FRENCH_BILINGUAL_BONUS_LOW_ENGLISH;
  }

  if (hasSiblingInCanada) {
    additionalBreakdown.siblingInCanada = CRS_STATUTORY_CONSTANTS.SIBLING_IN_CANADA_POINTS;
  }

  additionalPoints = Math.min(
    CRS_STATUTORY_CONSTANTS.MAX_ADDITIONAL_POINTS,
    additionalBreakdown.provincialNomination
    + additionalBreakdown.arrangedEmployment
    + additionalBreakdown.canadianStudy
    + additionalBreakdown.frenchBilingualism
    + additionalBreakdown.siblingInCanada
  );

  // Total CRS Score
  const totalCrsScore = Math.min(CRS_STATUTORY_CONSTANTS.MAX_TOTAL_POINTS, subtotalHumanCapital + spousePoints + skillTransferabilityTotal + additionalPoints);

  // 5. Category-Based Selection Draw Evaluation
  const categoryEligibility = {
    french: {
      name: 'Category 1: French-Language Proficiency',
      isEligible: normFrench >= 7,
      benchmarkCutoff: BENCHMARK_DRAW_CUTOFFS.french_language_proficiency.cutoff,
      scoreSurplus: totalCrsScore - BENCHMARK_DRAW_CUTOFFS.french_language_proficiency.cutoff,
      likelyInvited: normFrench >= 7 && totalCrsScore >= BENCHMARK_DRAW_CUTOFFS.french_language_proficiency.cutoff
    },
    stem: {
      name: 'Category 3: STEM Occupations',
      isEligible: normCategory === 'stem',
      benchmarkCutoff: BENCHMARK_DRAW_CUTOFFS.stem_occupations.cutoff,
      scoreSurplus: totalCrsScore - BENCHMARK_DRAW_CUTOFFS.stem_occupations.cutoff,
      likelyInvited: normCategory === 'stem' && totalCrsScore >= BENCHMARK_DRAW_CUTOFFS.stem_occupations.cutoff
    },
    healthcare: {
      name: 'Category 2: Healthcare Occupations',
      isEligible: normCategory === 'healthcare',
      benchmarkCutoff: BENCHMARK_DRAW_CUTOFFS.healthcare_occupations.cutoff,
      scoreSurplus: totalCrsScore - BENCHMARK_DRAW_CUTOFFS.healthcare_occupations.cutoff,
      likelyInvited: normCategory === 'healthcare' && totalCrsScore >= BENCHMARK_DRAW_CUTOFFS.healthcare_occupations.cutoff
    },
    trades: {
      name: 'Category 4: Trade Occupations',
      isEligible: normCategory === 'trades' || certificateOfQualification,
      benchmarkCutoff: BENCHMARK_DRAW_CUTOFFS.trade_occupations.cutoff,
      scoreSurplus: totalCrsScore - BENCHMARK_DRAW_CUTOFFS.trade_occupations.cutoff,
      likelyInvited: (normCategory === 'trades' || certificateOfQualification) && totalCrsScore >= BENCHMARK_DRAW_CUTOFFS.trade_occupations.cutoff
    },
    transport: {
      name: 'Category 5: Transport Occupations',
      isEligible: normCategory === 'transport',
      benchmarkCutoff: BENCHMARK_DRAW_CUTOFFS.transport_occupations.cutoff,
      scoreSurplus: totalCrsScore - BENCHMARK_DRAW_CUTOFFS.transport_occupations.cutoff,
      likelyInvited: normCategory === 'transport' && totalCrsScore >= BENCHMARK_DRAW_CUTOFFS.transport_occupations.cutoff
    },
    agriculture: {
      name: 'Category 6: Agriculture & Agri-Food',
      isEligible: normCategory === 'agriculture',
      benchmarkCutoff: BENCHMARK_DRAW_CUTOFFS.agriculture_occupations.cutoff,
      scoreSurplus: totalCrsScore - BENCHMARK_DRAW_CUTOFFS.agriculture_occupations.cutoff,
      likelyInvited: normCategory === 'agriculture' && totalCrsScore >= BENCHMARK_DRAW_CUTOFFS.agriculture_occupations.cutoff
    },
    canadianExperienceClass: {
      name: 'Canadian Experience Class (CEC)',
      isEligible: normCdnExp >= 1,
      benchmarkCutoff: BENCHMARK_DRAW_CUTOFFS.canadian_experience_class.cutoff,
      scoreSurplus: totalCrsScore - BENCHMARK_DRAW_CUTOFFS.canadian_experience_class.cutoff,
      likelyInvited: normCdnExp >= 1 && totalCrsScore >= BENCHMARK_DRAW_CUTOFFS.canadian_experience_class.cutoff
    },
    generalAllProgram: {
      name: 'General / All-Program Draw',
      isEligible: true,
      benchmarkCutoff: BENCHMARK_DRAW_CUTOFFS.general_all_program.cutoff,
      scoreSurplus: totalCrsScore - BENCHMARK_DRAW_CUTOFFS.general_all_program.cutoff,
      likelyInvited: totalCrsScore >= BENCHMARK_DRAW_CUTOFFS.general_all_program.cutoff
    }
  };

  // 6. Strategic Score Optimization Levers
  const optimizationLevers = [];

  // A. Retaking Language Exam for CLB 10
  if (!isAllClb9Plus) {
    const potentialClb10Points = (getLanguageAbilityPoints(10, normMarried) * 4) - firstLangPoints;
    let transferGain = 0;
    if (isHighEdu && !isAllClb9Plus) transferGain += (50 - eduLangTransfer);
    else if (isPostSec && !isAllClb9Plus) transferGain += (25 - eduLangTransfer);

    if (normForeignExp >= 3 && !isAllClb9Plus) transferGain += (50 - foreignExpLangTransfer);
    else if (normForeignExp >= 1 && !isAllClb9Plus) transferGain += (25 - foreignExpLangTransfer);

    const netLanguageOptimization = potentialClb10Points + Math.min(50, transferGain);
    optimizationLevers.push({
      lever: 'Retake English (IELTS / CELPIP) to achieve CLB 10',
      potentialPointsGain: netLanguageOptimization,
      projectedNewCrs: totalCrsScore + netLanguageOptimization,
      feasibility: 'MEDIUM (depends on your current level; many people need several months of preparation and a retake)',
      impactSummary: `Unlocks +${potentialClb10Points} human capital points plus +${transferGain} points through the skill transferability multiplier.`
    });
  }

  // B. Learning French to NCLC 7
  if (normFrench < 7) {
    const frenchBonus = minFirstLangClb >= 5 ? 50 : 25;
    const secondLangGain = 24 - secondLangPoints;
    const totalFrenchGain = frenchBonus + secondLangGain;
    optimizationLevers.push({
      lever: 'Learn French to NCLC 7 (TEF Canada / TCF Canada)',
      potentialPointsGain: totalFrenchGain,
      projectedNewCrs: totalCrsScore + totalFrenchGain,
      feasibility: 'LOW to MEDIUM (often a year or more of study for a beginner)',
      impactSummary: `Unlocks +${frenchBonus} bilingual bonus points under IRPA s. 10.3 AND qualifies you for Category 1 French draws with cut-offs ~${BENCHMARK_DRAW_CUTOFFS.french_language_proficiency.cutoff}.`
    });
  }

  // C. 1 Additional Year of Canadian Work Experience
  if (normCdnExp < 3) {
    const cdnExpGain = getCanadianExperiencePoints(normCdnExp + 1, normMarried) - cdnExpPoints;
    let transferGain = 0;
    if (normCdnExp === 0) {
      transferGain += (isHighEdu ? 25 : isPostSec ? 13 : 0);
      if (normForeignExp >= 3) transferGain += 25;
    } else if (normCdnExp === 1) {
      transferGain += (isHighEdu ? 25 : isPostSec ? 12 : 0);
      if (normForeignExp >= 3) transferGain += 25;
    }
    const netCdnExpGain = cdnExpGain + transferGain;
    optimizationLevers.push({
      lever: 'Gain 1 Additional Year of Canadian Work Experience (TEER 0/1/2/3)',
      potentialPointsGain: netCdnExpGain,
      projectedNewCrs: totalCrsScore + netCdnExpGain,
      feasibility: 'MEDIUM (requires valid work authorization and skilled work in TEER 0-3 for the full year)',
      impactSummary: `Unlocks +${cdnExpGain} Canadian experience points plus +${transferGain} points in foreign experience transferability.`
    });
  }

  // D. Provincial Nominee Program (PNP) Nomination
  if (!hasProvincialNomination) {
    optimizationLevers.push({
      lever: 'Target Provincial Nominee Program (OINP, BC PNP, AAIP)',
      potentialPointsGain: 600,
      projectedNewCrs: Math.min(1200, totalCrsScore + 600),
      feasibility: 'VARIES (each province has its own streams, eligibility rules and limited intakes)',
      impactSummary: `A provincial nomination adds 600 points, which is usually enough for an Invitation to Apply (ITA) in a PNP draw.`
    });
  }

  // Sort optimization levers by potential gain descending
  optimizationLevers.sort((a, b) => b.potentialPointsGain - a.potentialPointsGain);

  const statutoryAdvisories = [
    `Profile expiry: an Express Entry profile stays in the pool for up to 12 months. If you are not invited by then, it expires and you must create a new profile.`,
    `Draw rules: IRCC decides the type, size and cut-off of each draw under Ministerial Instructions (IRPA s. 10.3). A score below recent general-draw cut-offs can still be invited in a category-based draw you qualify for.`,
    `Cut-off scores are illustrative: the draw cut-offs used here are fixed reference values, not live data. Cut-offs change every round, so compare your score with the latest rounds on the IRCC website.`,
    `Language Test Validity Floor: Under IRPR s. 74, language tests (IELTS, CELPIP, TEF, TCF, PTE Core) must be less than 2 years old on the day you submit your final e-APR application.`
  ];
  if (hasArrangedEmploymentLmia) {
    statutoryAdvisories.unshift(
      'Job offers no longer add CRS points: since 25 March 2025, a job offer (including one supported by an LMIA) gives 0 points. It can still help you qualify for some programs, such as the Federal Skilled Worker or Federal Skilled Trades programs, or for a provincial nomination.'
    );
  }

  return {
    totalCrsScore,
    targetOccupationNoc: normNoc,
    occupationCategory: normCategory,
    breakdown: {
      humanCapital: {
        agePoints,
        educationPoints,
        firstLanguagePoints: firstLangPoints,
        secondLanguagePoints: secondLangPoints,
        canadianExperiencePoints: cdnExpPoints,
        subtotal: subtotalHumanCapital
      },
      spouseFactors: {
        education: spouseBreakdown.education,
        language: spouseBreakdown.language,
        canadianExperience: spouseBreakdown.cdnExperience,
        total: spousePoints
      },
      skillTransferability: {
        educationTransferSubtotal,
        foreignExperienceTransferSubtotal: foreignExpTransferSubtotal,
        tradeCertificate: tradeCertTransfer,
        total: skillTransferabilityTotal
      },
      additionalPoints: {
        provincialNomination: additionalBreakdown.provincialNomination,
        arrangedEmployment: additionalBreakdown.arrangedEmployment,
        canadianStudy: additionalBreakdown.canadianStudy,
        frenchBilingualism: additionalBreakdown.frenchBilingualism,
        siblingInCanada: additionalBreakdown.siblingInCanada,
        total: additionalPoints
      }
    },
    categoryEligibility,
    optimizationLevers,
    statutoryAdvisories,
    statutoryAuthority: 'Immigration and Refugee Protection Act (S.C. 2001, c. 27, ss. 10.2 & 10.3)'
  };
}
