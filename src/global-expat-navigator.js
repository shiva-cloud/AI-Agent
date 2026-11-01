/**
 * Northstar Global Expat & Tenancy Navigator
 * Covers statutory expat, labor, and tenancy rights for:
 * 1. UAE: Wages Protection System (WPS) & End of Service Gratuity (Federal Decree-Law No. 33/2021 Art. 6, 51)
 * 2. Dubai: RERA 12-Month Notary Eviction Rule (Law No. 33/2008 Art. 25(2))
 * 3. New Zealand: AEWV 90-Day Redundancy Cushion (INZ Instructions WK3) & Tenancy Bond 23-Day Lodgement (RTA 1986 s. 23)
 * 4. Ireland: Critical Skills Employment Permit (CSEP) Stamp 4 21-Month Fast-Track & RPZ 2% Rent Cap
 * 5. Singapore: Employment Pass COMPASS 40-Point Scoring Framework (MOM)
 */

export const GLOBAL_EXPAT_CONSTANTS = {
  UAE_GRATUITY_FIRST_5_YEARS_DAYS_PER_YEAR: 21,
  UAE_GRATUITY_BEYOND_5_YEARS_DAYS_PER_YEAR: 30,
  UAE_MAX_GRATUITY_YEARS_BASIC: 2, // Maximum 2 years total basic salary

  DUBAI_RERA_EVICTION_NOTICE_MONTHS: 12,

  NZ_AEWV_REDUNDANCY_CUSHION_DAYS: 90,
  NZ_BOND_LODGEMENT_MAX_WORKING_DAYS: 23,
  NZ_BOND_UNLAWFUL_RETENTION_EXEMPLARY_DAMAGES_NZD: 1500,

  IRELAND_CSEP_STAMP4_MONTHS_MIN: 21,
  IRELAND_RPZ_ANNUAL_RENT_CAP_PERCENT: 2.0,

  SINGAPORE_COMPASS_PASS_MARK: 40
};

/**
 * Calculates UAE End of Service Gratuity & Audits Unlawful Deductions
 */
export function evaluateUaeGratuityAndWps(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    monthlyBasicSalaryAed = 15000,
    yearsOfService = 3.5,
    isTerminationOrResignation = 'termination',
    unlawfulDeductionsClaimedByEmployerAed = 0, // e.g. visa or recruitment costs
  } = safeParams;
  const dailyBasic = monthlyBasicSalaryAed / 30;
  let totalGratuityAed = 0;

  if (yearsOfService < 1) {
    totalGratuityAed = 0; // No gratuity for less than 1 year under Art. 51
  } else if (yearsOfService <= 5) {
    totalGratuityAed = yearsOfService * (GLOBAL_EXPAT_CONSTANTS.UAE_GRATUITY_FIRST_5_YEARS_DAYS_PER_YEAR * dailyBasic);
  } else {
    const first5Years = 5 * (GLOBAL_EXPAT_CONSTANTS.UAE_GRATUITY_FIRST_5_YEARS_DAYS_PER_YEAR * dailyBasic);
    const remainingYears = (yearsOfService - 5) * (GLOBAL_EXPAT_CONSTANTS.UAE_GRATUITY_BEYOND_5_YEARS_DAYS_PER_YEAR * dailyBasic);
    totalGratuityAed = first5Years + remainingYears;
  }

  // Cap at 2 years of basic salary
  const maxCapAed = monthlyBasicSalaryAed * 24;
  totalGratuityAed = Math.min(totalGratuityAed, maxCapAed);
  totalGratuityAed = Math.round(totalGratuityAed);

  // Unlawful deductions audit under Article 6 of UAE Labor Law
  const hasUnlawfulDeductions = unlawfulDeductionsClaimedByEmployerAed > 0;

  return {
    jurisdiction: 'United Arab Emirates (MoHRE)',
    statutoryBasis: 'Federal Decree-Law No. 33/2021 on Regulation of Labour Relations, Art. 6 & Art. 51',
    monthlyBasicSalaryAed,
    yearsOfService,
    accruedGratuityAed: totalGratuityAed,
    deductionsAudit: {
      hasUnlawfulDeductions,
      attemptedDeductionAed: unlawfulDeductionsClaimedByEmployerAed,
      isDeductionLegallyBarred: hasUnlawfulDeductions,
      statutoryShield: 'Under Federal Decree-Law No. 33/2021 Article 6, employers are STRICTLY PROHIBITED from charging or recovering recruitment costs, visa processing fees, or Emirates ID fees from the employee. Any deduction from gratuity for visa expenses is illegal and actionable via MoHRE.'
    }
  };
}

/**
 * Audits Dubai RERA 12-Month Notary Eviction Notice under Law No. 33/2008 Art. 25(2)
 */
export function auditDubaiReraEvictionNotice(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    evictionReason = 'personal_use', // 'personal_use', 'sale_of_property', 'major_demolition'
    noticeMethod = 'email', // 'notary_public', 'registered_mail', 'email', 'whatsapp'
    noticeMonthsGiven = 12
  } = safeParams;
  const isFormalNotaryOrRegistered = ['notary_public', 'registered_mail'].includes(noticeMethod.toLowerCase());
  const has12Months = noticeMonthsGiven >= GLOBAL_EXPAT_CONSTANTS.DUBAI_RERA_EVICTION_NOTICE_MONTHS;

  const isValidNotice = isFormalNotaryOrRegistered && has12Months;
  const defects = [];

  if (!isFormalNotaryOrRegistered) {
    defects.push(`Notice served via '${noticeMethod}' is completely invalid. Under Dubai Law No. 33/2008 Article 25(2), eviction notices MUST be sent through the Notary Public or by registered post.`);
  }
  if (!has12Months) {
    defects.push(`Notice period was ${noticeMonthsGiven} months. Statutory requirement is strictly 12 full months.`);
  }

  return {
    jurisdiction: 'Dubai, UAE (RERA / Rental Dispute Centre)',
    statutoryBasis: 'Dubai Law No. 33/2008 amending Law No. 26/2007, Art. 25(2)',
    evictionReason,
    isValidNotice,
    defects,
    tenantRights: !isValidNotice
      ? 'The eviction notice is legally void. The tenant can submit a dispute to the Rental Dispute Centre (RDC) to cancel the eviction and remain in the property at the RERA Rental Index rate.'
      : 'Notice meets formal criteria. Landlord cannot re-rent the property for 2 years (if personal use) or 3 years (if demolition) under Art. 26.'
  };
}

/**
 * Evaluates New Zealand AEWV Redundancy Cushion & Tenancy Bond Lodgement
 */
export function evaluateNewZealandAewvAndTenancy(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    daysSinceJobLoss = 20,
    tenancyBondPaidNzd = 2400,
    bondWorkingDaysSincePayment = 30,
    bondLodgedWithMbie = false
  } = safeParams;
  const cushionRemainingDays = Math.max(0, GLOBAL_EXPAT_CONSTANTS.NZ_AEWV_REDUNDANCY_CUSHION_DAYS - daysSinceJobLoss);
  const isCushionActive = daysSinceJobLoss <= GLOBAL_EXPAT_CONSTANTS.NZ_AEWV_REDUNDANCY_CUSHION_DAYS;

  // Bond audit under NZ Residential Tenancies Act 1986 s. 23
  const isBondBreached = !bondLodgedWithMbie && bondWorkingDaysSincePayment > GLOBAL_EXPAT_CONSTANTS.NZ_BOND_LODGEMENT_MAX_WORKING_DAYS;

  return {
    jurisdiction: 'New Zealand (Immigration NZ & Tenancy Services)',
    aewvRedundancyAudit: {
      statutoryBasis: 'Immigration New Zealand Operational Manual, Instructions WK3',
      isCushionActive,
      cushionRemainingDays,
      advice: isCushionActive
        ? `Worker has ${cushionRemainingDays} days remaining under the 90-day variation of conditions cushion to secure a job offer from an INZ accredited employer or transition to a Job Search / Visitor Visa.`
        : '90-day cushion expired. Worker must apply for Section 61 request or depart NZ to avoid unlawful status.'
    },
    tenancyBondAudit: {
      statutoryBasis: 'Residential Tenancies Act 1986 (RTA) s. 23',
      bondAmountNzd: tenancyBondPaidNzd,
      isLandlordInBreach: isBondBreached,
      statutoryDeadlineDays: GLOBAL_EXPAT_CONSTANTS.NZ_BOND_LODGEMENT_MAX_WORKING_DAYS,
      workingDaysElapsed: bondWorkingDaysSincePayment,
      exemplaryDamagesPayableNzd: isBondBreached ? GLOBAL_EXPAT_CONSTANTS.NZ_BOND_UNLAWFUL_RETENTION_EXEMPLARY_DAMAGES_NZD : 0,
      legalConsequence: isBondBreached
        ? `Landlord breached RTA s. 23 by failing to lodge bond with MBIE within 23 working days. The Tenancy Tribunal can order exemplary damages of up to $1,500 NZD payable directly to the tenant.`
        : 'Bond is within the lawful 23 working-day lodgement window.'
    }
  };
}

/**
 * Evaluates Ireland Critical Skills Employment Permit (CSEP) Stamp 4 transition & RPZ rent cap
 */
export function evaluateIrelandCsepAndRpz(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    monthsWorkedOnCsep = 22,
    currentAnnualRentEur = 24000,
    proposedAnnualRentEur = 25500,
    isInRentPressureZone = true
  } = safeParams;
  const isStamp4Eligible = monthsWorkedOnCsep >= GLOBAL_EXPAT_CONSTANTS.IRELAND_CSEP_STAMP4_MONTHS_MIN;

  // RPZ rent cap: 2% per year under Residential Tenancies Act 2004 s. 19
  const rentIncreaseEur = proposedAnnualRentEur - currentAnnualRentEur;
  const percentageIncrease = (rentIncreaseEur / currentAnnualRentEur) * 100;
  const maxAllowedRentIncreaseEur = Math.round(currentAnnualRentEur * (GLOBAL_EXPAT_CONSTANTS.IRELAND_RPZ_ANNUAL_RENT_CAP_PERCENT / 100));

  const isRentIncreaseCompliant = !isInRentPressureZone || (percentageIncrease <= GLOBAL_EXPAT_CONSTANTS.IRELAND_RPZ_ANNUAL_RENT_CAP_PERCENT);

  return {
    jurisdiction: 'Ireland (DETE & RTB)',
    csepStamp4Audit: {
      statutoryBasis: 'Department of Enterprise, Trade and Employment (DETE) CSEP Framework; INIS Stamp 4 Rules',
      monthsWorkedOnCsep,
      isStamp4Eligible,
      benefit: isStamp4Eligible
        ? 'Worker has completed the mandatory 21 months on a CSEP and is eligible to apply for Stamp 4 permission from Immigration Service Delivery (ISD). Stamp 4 grants unrestricted right to work without needing an employment permit.'
        : `Worker has completed ${monthsWorkedOnCsep} of 21 required months. ${GLOBAL_EXPAT_CONSTANTS.IRELAND_CSEP_STAMP4_MONTHS_MIN - monthsWorkedOnCsep} months remaining until Stamp 4 transition.`
    },
    rpzTenancyAudit: {
      statutoryBasis: 'Residential Tenancies Act 2004 (as amended), s. 19',
      isInRentPressureZone,
      proposedPercentageIncrease: Math.round(percentageIncrease * 100) / 100,
      maxStatutoryAnnualPercent: GLOBAL_EXPAT_CONSTANTS.IRELAND_RPZ_ANNUAL_RENT_CAP_PERCENT,
      maxAllowedIncreaseEur: maxAllowedRentIncreaseEur,
      isRentIncreaseCompliant,
      remedy: !isRentIncreaseCompliant
        ? `The proposed increase of ${percentageIncrease.toFixed(2)}% violates the 2% RPZ statutory cap. The tenant can file a dispute with the Residential Tenancies Board (RTB) to overturn the unlawful rent increase and recover overpayments.`
        : 'Rent increase conforms to RPZ guidelines.'
    }
  };
}

/**
 * Evaluates Singapore Employment Pass COMPASS (Complementarity Assessment Framework)
 */
export function evaluateSingaporeCompassPass(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    salaryPoints = 20, // 0, 10, or 20 (C1: Salary vs local PMET norms)
    qualificationPoints = 10, // 0, 10, or 20 (C2: Top-tier institution = 20, Degree-equivalent = 10)
    diversityPoints = 10, // 0, 10, or 20 (C3: Nationality share < 5% = 20, 5-25% = 10)
    localSupportPoints = 10, // 0, 10, or 20 (C4: Local PMET share >= 50th percentile = 20)
    bonusSkillsShortagePoints = 0, // 0 or 20 (Shortage Occupation List)
    bonusStrategicEconomicPoints = 0 // 0 or 10 (Partnering with MOM on economic projects)
  } = safeParams;
  const totalCompassScore = salaryPoints + qualificationPoints + diversityPoints + localSupportPoints +
    bonusSkillsShortagePoints + bonusStrategicEconomicPoints;

  const isPassingScore = totalCompassScore >= GLOBAL_EXPAT_CONSTANTS.SINGAPORE_COMPASS_PASS_MARK;

  return {
    jurisdiction: 'Singapore (Ministry of Manpower - MOM)',
    statutoryBasis: 'MOM Employment Pass COMPASS Framework (Effective Sept 2023)',
    totalScore: totalCompassScore,
    passThreshold: GLOBAL_EXPAT_CONSTANTS.SINGAPORE_COMPASS_PASS_MARK,
    isPassingScore,
    breakdown: {
      c1SalaryPoints: salaryPoints,
      c2QualificationPoints: qualificationPoints,
      c3DiversityPoints: diversityPoints,
      c4LocalSupportPoints: localSupportPoints,
      bonusSkillsShortagePoints,
      bonusStrategicEconomicPoints
    },
    verdict: isPassingScore
      ? `PASS (${totalCompassScore}/40 points): Application satisfies the COMPASS framework criteria for EP approval.`
      : `DEFICIT (${totalCompassScore}/40 points): Application is ${GLOBAL_EXPAT_CONSTANTS.SINGAPORE_COMPASS_PASS_MARK - totalCompassScore} points short of the mandatory 40-point threshold.`
  };
}
