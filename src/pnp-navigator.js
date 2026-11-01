/**
 * @file pnp-navigator.js
 * @description Provincial Nominee Program (PNP) Points & Tech Draw Diagnostic Engine.
 * 
 * Statutory & Regulatory Authority:
 * - Immigration and Refugee Protection Act (IRPA, SC 2001, c. 27), ss. 8(1), 10(2), 87(1)
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227), s. 87
 * - Express Entry Ministerial Instructions s. 23(1) (600 Bonus CRS Points for Enhanced Nomination)
 * - British Columbia Immigration Programs Act (SBC 2015, c. 23) & BC PNP Skills Immigration Scoring Matrix
 * - Ontario Immigration Act, 2015 (SO 2015, c. 8) & O. Reg. 199/15 (OINP Human Capital Priorities & Tech Draws)
 * - Alberta Labour Mobility Act & AAIP Accelerated Tech Pathway Directives
 * 
 * Features:
 * - Computes BC PNP Skills Immigration score (0-200 points) across Human Capital and Economic Factors
 * - Evaluates eligibility for BC Tech Stream (35 targeted NOCs, weekly draws, ~85 pt cutoff vs ~125 pt general)
 * - Evaluates eligibility for OINP Human Capital Priorities Tech Draws (Express Entry linked, targeted tech NOCs)
 * - Evaluates eligibility for Alberta AAIP Accelerated Tech Pathway (CRS 300+ with Alberta Tech employer)
 * - Differentiates Enhanced (+600 CRS Points) vs Base Provincial Streams
 * - Audits Settlement Funds (LICO 2024 benchmarks vs job offer exemption under IRPR s. 87(2))
 * - Computes strategic score optimization levers (wage thresholds, regional relocation, language boosts)
 */

import { factValue } from './kb-facts.js';

export const PNP_CONSTANTS = Object.freeze({
  STATUTES: {
    IRPA_PNP_AUTHORITY: 'Immigration and Refugee Protection Act (SC 2001, c. 27), s. 87(1)',
    IRPR_ENHANCED_PNP: 'Express Entry Ministerial Instructions s. 23(1) (600 Bonus CRS Points)',
    BC_IMMIGRATION_ACT: 'British Columbia Immigration Programs Act (SBC 2015, c. 23)',
    ONTARIO_IMMIGRATION_ACT: 'Ontario Immigration Act, 2015 (SO 2015, c. 8) & O. Reg. 199/15',
    ALBERTA_AAIP_DIRECTIVE: 'Alberta Advantage Immigration Program (AAIP) Accelerated Tech Pathway Directive'
  },
  BC_PNP_BENCHMARKS: {
    MAX_TOTAL_POINTS: 200,
    RECENT_TECH_CUTOFF: 85,
    RECENT_GENERAL_CUTOFF: 125,
    MIN_HOURLY_WAGE_BC: 17.40
  },
  TARGETED_TECH_NOCS: Object.freeze([
    '20012', // Computer and information systems managers
    '21210', // Mathematicians, statisticians and actuaries
    '21211', // Data scientists
    '21220', // Cybersecurity specialists
    '21221', // Business systems specialists
    '21222', // Information systems specialists
    '21223', // Database analysts and data administrators
    '21230', // Computer systems developers and programmers
    '21231', // Software engineers and designers
    '21232', // Software developers and programmers
    '21233', // Web designers
    '21234', // Web developers and programmers
    '21300', // Civil engineers
    '21310', // Electrical and electronics engineers
    '21311', // Computer engineers (except software engineers)
    '21320', // Chemical engineers
    '21399', // Other professional engineers
    '22220', // Computer network technicians
    '22221', // User support technicians
    '22222', // Information systems testing technicians
    '22310', // Electrical and electronics engineering technologists
    '51120', // Producers, directors, choreographers
    '52120'  // Graphic designers and illustrators
  ]),
  OINP_TECH_NOCS: Object.freeze([
    '20012', // Computer and info systems managers
    '21211', // Data scientists
    '21223', // Database analysts and data administrators
    '21230', // Computer systems developers and programmers
    '21231', // Software engineers and designers
    '21232', // Software developers and programmers
    '21233', // Web designers
    '21234', // Web developers and programmers
    '21311'  // Computer engineers
  ]),
  // Express Entry settlement funds from src/kb-facts.js; the name is kept for existing callers.
  get LICO_FUNDS_2024() { return (({ additionalPerPerson, ...bySize }) => Object.freeze({ ...bySize, ADDITIONAL_PER_PERSON: additionalPerPerson }))(factValue('ca.expressEntry.settlementFundsCad')); }
});

/**
 * Calculates BC PNP Skills Immigration Score (0 to 200 points).
 * 
 * @param {Object} input
 * @param {number} input.yearsOfDirectExperience
 * @param {boolean} input.hasOneYearCanadianExperience
 * @param {boolean} input.currentlyWorkingForBcEmployer
 * @param {string} input.educationLevel - 'doctoral'|'masters'|'post_grad_cert'|'bachelors'|'diploma_2yr'|'secondary'
 * @param {boolean} input.completedBcEducation
 * @param {boolean} input.completedCanadianEducationOutsideBc
 * @param {boolean} input.hasProfessionalDesignationBc
 * @param {number} input.clbLevel - 4 to 10
 * @param {boolean} input.isBilingualEnglishAndFrench
 * @param {number} input.hourlyWage - Wage in CAD/hr
 * @param {string} input.jobLocationArea - 'area_1_metro_van'|'area_2_regional'|'area_3_rural'
 * @param {boolean} input.hasRegionalEducationOrExperience
 * @returns {Object} Score breakdown and total
 */
export function calculateBcPnpPoints(input) {
  const expYears = Number(input.yearsOfDirectExperience || 0);
  const hasCdnExp = Boolean(input.hasOneYearCanadianExperience);
  const worksInBc = Boolean(input.currentlyWorkingForBcEmployer);
  const edu = input.educationLevel || 'bachelors';
  const bcEdu = Boolean(input.completedBcEducation);
  const cdnEduOutsideBc = Boolean(input.completedCanadianEducationOutsideBc);
  const designation = Boolean(input.hasProfessionalDesignationBc);
  const clb = Number(input.clbLevel || 7);
  const bilingual = Boolean(input.isBilingualEnglishAndFrench);
  const wage = Number(input.hourlyWage || 25);
  const area = input.jobLocationArea || 'area_1_metro_van';
  const regionalExp = Boolean(input.hasRegionalEducationOrExperience);

  // 1. Direct Work Experience (Max 40 pts)
  let expBase = 0;
  if (expYears >= 5) expBase = 20;
  else if (expYears >= 4) expBase = 16;
  else if (expYears >= 3) expBase = 12;
  else if (expYears >= 2) expBase = 8;
  else if (expYears >= 1) expBase = 4;

  let expBonus = 0;
  if (hasCdnExp) expBonus += 10;
  if (worksInBc) expBonus += 10;
  const experiencePoints = Math.min(40, expBase + expBonus);

  // 2. Highest Education (Max 40 pts)
  let eduBase = 0;
  if (edu === 'doctoral') eduBase = 27;
  else if (edu === 'masters') eduBase = 22;
  else if (edu === 'post_grad_cert') eduBase = 15;
  else if (edu === 'bachelors') eduBase = 15;
  else if (edu === 'diploma_2yr') eduBase = 10;
  else eduBase = 0; // secondary or none

  let eduBonus = 0;
  if (bcEdu) eduBonus += 8;
  else if (cdnEduOutsideBc) eduBonus += 6;
  if (designation) eduBonus += 5;
  const educationPoints = Math.min(40, eduBase + eduBonus);

  // 3. Language Proficiency (Max 40 pts)
  let langBase = 0;
  if (clb >= 9) langBase = 30;
  else if (clb === 8) langBase = 25;
  else if (clb === 7) langBase = 20;
  else if (clb === 6) langBase = 15;
  else if (clb === 5) langBase = 10;
  else if (clb === 4) langBase = 5;
  else langBase = 0;

  let langBonus = 0;
  if (bilingual && clb >= 4) langBonus += 10;
  const languagePoints = Math.min(40, langBase + langBonus);

  const humanCapitalTotal = experiencePoints + educationPoints + languagePoints; // Max 120 pts

  // 4. Hourly Wage (Max 55 pts)
  let wagePoints = 0;
  if (wage >= 40.0) wagePoints = 55;
  else if (wage >= 35.0) wagePoints = 45;
  else if (wage >= 30.0) wagePoints = 35;
  else if (wage >= 25.0) wagePoints = 25;
  else if (wage >= 20.0) wagePoints = 15;
  else if (wage >= 17.50) wagePoints = 5;
  else wagePoints = 0;

  // 5. Area of Employment (Max 25 pts)
  let areaBase = 0;
  if (area === 'area_3_rural') areaBase = 25;
  else if (area === 'area_2_regional') areaBase = 15;
  else areaBase = 0; // area_1_metro_van

  let areaBonus = 0;
  if (regionalExp && area !== 'area_1_metro_van') areaBonus += 10;
  const areaPoints = Math.min(25, areaBase + areaBonus);

  const economicFactorsTotal = wagePoints + areaPoints; // Max 80 pts
  const totalPoints = Math.min(200, humanCapitalTotal + economicFactorsTotal);

  return {
    totalPoints,
    breakdown: {
      humanCapitalFactors: {
        total: humanCapitalTotal,
        maxPossible: 120,
        directExperiencePoints: experiencePoints,
        highestEducationPoints: educationPoints,
        languageProficiencyPoints: languagePoints
      },
      economicFactors: {
        total: economicFactorsTotal,
        maxPossible: 80,
        hourlyWagePoints: wagePoints,
        areaOfEmploymentPoints: areaPoints
      }
    }
  };
}

/**
 * Assesses Settlement Funds Required under LICO Benchmarks.
 * 
 * @param {number} familySize
 * @param {number} liquidSavingsCad
 * @param {boolean} currentlyEmployedInProvinceWithJobOffer
 * @returns {Object} Funds audit result
 */
export function auditSettlementFunds(familySize = 1, liquidSavingsCad = 0, currentlyEmployedInProvinceWithJobOffer = false) {
  const size = Math.max(1, Math.min(10, Math.floor(familySize)));
  let requiredFunds = 0;
  if (size <= 7) {
    requiredFunds = PNP_CONSTANTS.LICO_FUNDS_2024[size];
  } else {
    requiredFunds = PNP_CONSTANTS.LICO_FUNDS_2024[7] + (size - 7) * PNP_CONSTANTS.LICO_FUNDS_2024.ADDITIONAL_PER_PERSON;
  }

  const isExempt = Boolean(currentlyEmployedInProvinceWithJobOffer);
  const meetsRequirement = isExempt || (liquidSavingsCad >= requiredFunds);
  const shortfall = isExempt ? 0 : Math.max(0, requiredFunds - liquidSavingsCad);

  return {
    isExempt,
    familySize: size,
    requiredFundsCad: requiredFunds,
    providedFundsCad: liquidSavingsCad,
    meetsRequirement,
    shortfallCad: shortfall,
    statutoryBasis: isExempt
      ? 'IRPR s. 87(2) Exemption: Applicant is currently authorized to work in Canada and holds a valid job offer.'
      : 'IRCC LICO Low-Income Cut-Off Benchmark (Updated 2024/2025).'
  };
}

/**
 * Diagnoses Provincial Nominee Program (PNP) Opportunities, Scores, and Tech Pathways.
 * 
 * @param {Object} input
 * @param {string} input.targetProvince - 'BC' | 'ON' | 'AB'
 * @param {string} input.nocCode - 5-digit NOC 2021 code (e.g. '21231')
 * @param {number} input.hourlyWage - Hourly wage in CAD
 * @param {boolean} input.hasFullTimeJobOffer - Whether candidate has a permanent or min 1-year job offer
 * @param {boolean} input.hasActiveExpressEntryProfile - Active Express Entry profile (CRS candidate)
 * @param {number} [input.expressEntryCrsScore=450] - Current CRS score without nomination
 * @param {number} [input.yearsOfDirectExperience=3] - Years of skilled experience in NOC
 * @param {boolean} [input.hasOneYearCanadianExperience=true] - 1+ year Canadian work experience
 * @param {boolean} [input.currentlyWorkingForBcEmployer=true] - Currently working for BC employer
 * @param {string} [input.educationLevel='bachelors'] - Level of education
 * @param {boolean} [input.completedBcEducation=false] - Completed degree in BC
 * @param {boolean} [input.completedCanadianEducationOutsideBc=false] - Completed degree in rest of Canada
 * @param {boolean} [input.hasProfessionalDesignationBc=false] - Licensed or registered trades/professional
 * @param {number} [input.clbLevel=8] - First language CLB
 * @param {boolean} [input.isBilingualEnglishAndFrench=false] - CLB 4+ in both English and French
 * @param {string} [input.jobLocationArea='area_1_metro_van'] - 'area_1_metro_van'|'area_2_regional'|'area_3_rural'
 * @param {boolean} [input.hasRegionalEducationOrExperience=false] - 1+ yr study or work in BC regional area
 * @param {number} [input.familySize=1] - Number of dependents
 * @param {number} [input.liquidSavingsCad=25000] - Unencumbered liquid funds in CAD
 * @returns {Object} Comprehensive PNP diagnostic result
 */
export function evaluateProvincialNomineePathway(input = {}) {
  const province = (input.targetProvince || 'BC').toUpperCase();
  const noc = String(input.nocCode || '21231').trim();
  const wage = Number(input.hourlyWage || 35);
  const hasJobOffer = Boolean(input.hasFullTimeJobOffer);
  const hasEeProfile = Boolean(input.hasActiveExpressEntryProfile);
  const baseCrs = Number(input.expressEntryCrsScore || 450);

  // 1. Calculate BC PNP Points
  const bcPoints = calculateBcPnpPoints({
    yearsOfDirectExperience: input.yearsOfDirectExperience,
    hasOneYearCanadianExperience: input.hasOneYearCanadianExperience,
    currentlyWorkingForBcEmployer: input.currentlyWorkingForBcEmployer,
    educationLevel: input.educationLevel,
    completedBcEducation: input.completedBcEducation,
    completedCanadianEducationOutsideBc: input.completedCanadianEducationOutsideBc,
    hasProfessionalDesignationBc: input.hasProfessionalDesignationBc,
    clbLevel: input.clbLevel,
    isBilingualEnglishAndFrench: input.isBilingualEnglishAndFrench,
    hourlyWage: wage,
    jobLocationArea: input.jobLocationArea,
    hasRegionalEducationOrExperience: input.hasRegionalEducationOrExperience
  });

  // 2. Tech Stream Eligibility Checks
  const isTargetedTechNoc = PNP_CONSTANTS.TARGETED_TECH_NOCS.includes(noc);
  const isOinpTechNoc = PNP_CONSTANTS.OINP_TECH_NOCS.includes(noc);

  // BC Tech rules: Targeted NOC + job offer min 365 days (1 year) + wage meets BC minimum
  const qualifiesForBcTech = isTargetedTechNoc && hasJobOffer && wage >= PNP_CONSTANTS.BC_PNP_BENCHMARKS.MIN_HOURLY_WAGE_BC;

  // OINP Tech rules: Targeted OINP Tech NOC + Active Express Entry + CRS typically in draw window
  const qualifiesForOinpTech = isOinpTechNoc && hasEeProfile && (baseCrs >= 440 && baseCrs <= 490);

  // AAIP Tech rules: Tech NOC + Job offer in Alberta + Active Express Entry with min 300 CRS
  const qualifiesForAaipTech = isTargetedTechNoc && hasJobOffer && hasEeProfile && baseCrs >= 300;

  // 3. Nomination Stream & CRS Impact
  const streamType = hasEeProfile ? 'ENHANCED_EXPRESS_ENTRY' : 'BASE_PROVINCIAL_STREAM';
  const bonusCrsPoints = hasEeProfile ? 600 : 0;
  const projectedPostNominationCrs = hasEeProfile ? baseCrs + 600 : null;

  // 4. Settlement Funds
  const fundsAudit = auditSettlementFunds(
    input.familySize || 1,
    input.liquidSavingsCad || 0,
    hasJobOffer
  );

  // 5. BC PNP Verdict & Cutoff Comparison
  let bcLikelihood = 'UNLIKELY';
  const cutoffDiffTech = bcPoints.totalPoints - PNP_CONSTANTS.BC_PNP_BENCHMARKS.RECENT_TECH_CUTOFF;
  const cutoffDiffGeneral = bcPoints.totalPoints - PNP_CONSTANTS.BC_PNP_BENCHMARKS.RECENT_GENERAL_CUTOFF;

  if (qualifiesForBcTech) {
    if (cutoffDiffTech >= 5) bcLikelihood = 'VERY_STRONG';
    else if (cutoffDiffTech >= 0) bcLikelihood = 'COMPETITIVE';
    else bcLikelihood = 'BELOW_TECH_CUTOFF';
  } else {
    if (cutoffDiffGeneral >= 5) bcLikelihood = 'VERY_STRONG';
    else if (cutoffDiffGeneral >= 0) bcLikelihood = 'COMPETITIVE';
    else bcLikelihood = 'BELOW_GENERAL_CUTOFF';
  }

  // 6. Actionable Optimization Levers
  const strategicLevers = [];

  // Wage Lever
  if (wage < 40) {
    const nextTierWage = wage < 20 ? 20 : wage < 25 ? 25 : wage < 30 ? 30 : wage < 35 ? 35 : 40;
    strategicLevers.push({
      action: `Negotiate hourly compensation to at least $${nextTierWage.toFixed(2)}/hr`,
      pointsGain: wage < 25 ? '+10 BC PNP Pts' : '+10 to +20 BC PNP Pts',
      impact: 'Moves candidate into a higher wage scoring bracket under BC Skills Immigration Economic Factors.'
    });
  }

  // Regional Relocation Lever
  if (input.jobLocationArea === 'area_1_metro_van' || !input.jobLocationArea) {
    strategicLevers.push({
      action: 'Secure qualifying employment in Area 2 (Victoria/Kelowna/Fraser Valley) or Area 3 (Northern/Interior BC)',
      pointsGain: '+15 to +25 BC PNP Pts',
      impact: 'Eliminates Metro Vancouver congestion penalty and awards regional economic development points.'
    });
  }

  // Language Lever
  if (Number(input.clbLevel || 7) < 9) {
    strategicLevers.push({
      action: 'Upgrade English / French test score from current level to CLB 9+ (IELTS 8.0 Listening, 7.0 others or CELPIP 9)',
      pointsGain: `+${(9 - Number(input.clbLevel || 7)) * 5} to +10 BC PNP Pts & +25 Federal CRS Pts`,
      impact: 'Achieves maximum points in the Language Proficiency human capital factor.'
    });
  }

  // Bilingual Lever
  if (!input.isBilingualEnglishAndFrench) {
    strategicLevers.push({
      action: 'Attain NCLC 4+ in second official language (French / English) for official bilingualism bonus',
      pointsGain: '+10 BC PNP Pts & up to +50 Federal CRS Pts',
      impact: 'Triggers bilingual bonus points across both provincial matrix and federal Express Entry pool.'
    });
  }

  // Express Entry Profile Lever
  if (!hasEeProfile) {
    strategicLevers.push({
      action: 'Create and submit an active Express Entry profile (IRPA s. 10.3)',
      pointsGain: '+600 Federal CRS Points upon Nomination',
      impact: 'Turns a base provincial nomination into an enhanced (Express Entry) nomination, which adds 600 CRS points and usually leads to an invitation in a later draw.'
    });
  }

  // 7. Statutory Violations or Blockers
  const statutoryBlockers = [];
  if (wage < PNP_CONSTANTS.BC_PNP_BENCHMARKS.MIN_HOURLY_WAGE_BC && hasJobOffer) {
    statutoryBlockers.push({
      code: 'SUB_MINIMUM_WAGE',
      statute: 'BC Employment Standards Act & BC PNP Policy',
      message: `Offered wage ($${wage.toFixed(2)}/hr) is below the BC statutory minimum threshold ($${PNP_CONSTANTS.BC_PNP_BENCHMARKS.MIN_HOURLY_WAGE_BC.toFixed(2)}/hr). Application will be rejected.`
    });
  }

  if (!fundsAudit.meetsRequirement) {
    statutoryBlockers.push({
      code: 'INSUFFICIENT_SETTLEMENT_FUNDS',
      statute: 'IRPR s. 87(2) & IRCC LICO Benchmarks',
      message: `Unemployed/non-LMIA applicant lacks mandatory settlement funds ($${fundsAudit.requiredFundsCad.toLocaleString()} CAD required for family of ${fundsAudit.familySize}; shortfall is $${fundsAudit.shortfallCad.toLocaleString()} CAD).`
    });
  }

  return {
    province,
    nocCode: noc,
    streamType,
    bonusCrsPoints,
    projectedPostNominationCrs,
    bcPnpScore: bcPoints.totalPoints,
    bcScoreBreakdown: bcPoints.breakdown,
    bcTechEligibility: {
      isTargetedTechNoc,
      qualifiesForBcTech,
      currentCutoff: PNP_CONSTANTS.BC_PNP_BENCHMARKS.RECENT_TECH_CUTOFF,
      pointsVsCutoff: cutoffDiffTech,
      likelihood: bcLikelihood,
      statutoryAdvisory: qualifiesForBcTech
        ? 'Candidate holds an eligible Tech NOC with qualifying full-time job offer. Eligible for weekly targeted BC Tech draws at significantly lower point thresholds (~85 vs ~125).'
        : 'Candidate does not meet BC Tech criteria (either NOC is non-tech or job offer duration is under 365 days). Must compete in general draws (~125 points).'
    },
    oinpTechEligibility: {
      isOinpTechNoc,
      qualifiesForOinpTech,
      statutoryAdvisory: qualifiesForOinpTech
        ? 'Candidate matches Ontario Human Capital Priorities Tech Draw parameters (NOC ' + noc + ', Express Entry active, CRS within target band). High probability of Ontario Notification of Interest (NOI).'
        : 'Candidate does not match current OINP Tech Draw filters (requires targeted tech NOC and active Express Entry profile).'
    },
    aaipTechEligibility: {
      qualifiesForAaipTech,
      statutoryAdvisory: qualifiesForAaipTech
        ? 'Eligible for Alberta Advantage Immigration Program (AAIP) Accelerated Tech Pathway (CRS 300+, tech NOC, Alberta employer). Fast-tracked provincial nomination processing.'
        : 'Ineligible for AAIP Accelerated Tech Pathway (requires job offer from Alberta tech employer, tech NOC, and active Express Entry profile).'
    },
    settlementFunds: fundsAudit,
    strategicLevers,
    statutoryBlockers,
    statutoryAdvisories: [
      'Provincial nomination certificates expire after 6 months; federal PR application must be submitted before expiry.',
      'Under IRPA s. 87(1), applicants must intend to reside in the nominating province. Landing in another province without justification risks misrepresentation (IRPA s. 40).',
      'Enhanced nominations grant an immediate +600 points in Express Entry pool under Express Entry Ministerial Instructions s. 23(1).'
    ]
  };
}
