/**
 * Auto Insurance Discrimination, Foreign Driving History Credit & SABS Accident Benefits Engine
 * 
 * Statutory & Regulatory Authorities:
 * - Ontario Insurance Act, R.S.O. 1990, c. I.8, ss. 237, 268, 439
 * - Statutory Accident Benefits Schedule (SABS), O. Reg. 34/10
 * - FSRA Bulletin on Rating Rules & "Take-All-Comers" Underwriting Requirements
 * - British Columbia Insurance (Vehicle) Act & ICBC Enhanced Care Model
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const AUTO_INSURANCE_CONSTANTS = Object.freeze({
  ONTARIO_SABS_IRB_STANDARD_WEEKLY_CAP_CAD: 400,
  ONTARIO_SABS_IRB_PERCENT_GROSS: 0.70,
  ONTARIO_SABS_IRB_WAITING_PERIOD_DAYS: 7,
  ONTARIO_SABS_IRB_MAX_STANDARD_WEEKS: 104,
  ONTARIO_SABS_NEB_WEEKLY_CAD: 185,
  ONTARIO_SABS_NEB_WAITING_PERIOD_WEEKS: 4,
  ONTARIO_MIG_LIMIT_CAD: 3500,
  ONTARIO_NON_CAT_LIMIT_CAD: 65000,
  ONTARIO_CAT_LIMIT_CAD: 1000000,
  BC_ICBC_INCOME_REPLACEMENT_PERCENT_NET: 0.90,
  BC_ICBC_MAX_GROSS_INCOME_CAD: 113000
});

// Postal code forward sortation area (FSA) high risk zones in the GTA
const GTA_HIGH_PREMIUM_FSAS = new Set([
  'L6P', 'L6R', 'L6S', 'L6T', 'L6V', 'L6W', 'L6X', 'L6Y', 'L6Z', 'L7A', // Brampton
  'L4T', 'L4W', 'L4X', 'L4Y', 'L4Z', 'L5A', 'L5B', 'L5C', 'L5K', 'L5L', 'L5M', 'L5N', 'L5R', 'L5V', 'L5W', // Mississauga
  'M1B', 'M1C', 'M1E', 'M1G', 'M1H', 'M1J', 'M1K', 'M1L', 'M1M', 'M1N', 'M1P', 'M1R', 'M1S', 'M1T', 'M1V', 'M1W', 'M1X', // Scarborough
  'M9L', 'M9M', 'M9N', 'M9P', 'M9R', 'M9V', 'M9W', // North York / Etobicoke North
  'L4L', 'L4H', 'L4J' // Vaughan
]);

/**
 * Evaluates automobile insurance rating territory, foreign claims-free letter recognition,
 * SABS statutory accident benefit entitlements, and Take-All-Comers regulatory violations.
 */
export function evaluateAutoInsuranceProfile({
  province = 'ON',
  postalCode = 'L6Y 1A1',
  annualGrossIncomeCad = 75000,
  employmentStatus = 'employed',
  weeksEmployedPast52 = 52,
  foreignDrivingYears = 5,
  hasForeignExperienceLetter = false,
  canadianLicenceClass = 'G',
  optionalIrbEndorsementWeeklyCad = 400,
  experiencedRefusalOrUnreasonableDelay = false,
  driverName = 'Driver',
  assessmentDate = todayIso()
} = {}) {
  const safeDriverName = boundedText(driverName, 'Driver', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const rawPostal = boundedText(postalCode, 'L6Y 1A1', 20).toUpperCase().replace(/\s+/g, '');
  const fsa = rawPostal.slice(0, 3);
  const income = Math.max(0, Math.min(10000000, Number(annualGrossIncomeCad) || 0));
  const weeksWorked = Math.max(0, Math.min(52, Number(weeksEmployedPast52) || 0));
  const foreignYears = Math.max(0, Math.min(60, Number(foreignDrivingYears) || 0));
  const hasLetter = Boolean(hasForeignExperienceLetter);
  
  const irbCap = Math.max(400, Math.min(2000, Number(optionalIrbEndorsementWeeklyCad) || 400));
  const refusalReported = Boolean(experiencedRefusalOrUnreasonableDelay);

  // 1. Rating Territory & Experience Credit Analysis
  const isHighPremiumZone = prov === 'ON' && GTA_HIGH_PREMIUM_FSAS.has(fsa);
  const territoryTier = isHighPremiumZone ? 'HIGH_RISK_PREMIUM_ZONE' : (prov === 'ON' ? 'STANDARD_ZONE' : 'PROVINCIAL_RATING_ZONE');

  // Baseline novice driver premium (no recognized experience)
  let baseNovicePremiumCad = isHighPremiumZone ? 6200 : 4200;
  if (prov === 'BC') baseNovicePremiumCad = 3600;
  if (prov === 'AB') baseNovicePremiumCad = 4800;

  // Credit calculation
  let eligibleDrivingYearsRecognized = 0;
  let experienceDiscountRate = 0;

  if (hasLetter && foreignYears > 0) {
    eligibleDrivingYearsRecognized = foreignYears;
    if (foreignYears >= 6) {
      experienceDiscountRate = 0.55; // Up to 55% discount
    } else if (foreignYears >= 3) {
      experienceDiscountRate = 0.40;
    } else if (foreignYears >= 1) {
      experienceDiscountRate = 0.25;
    }
  }

  const estimatedAnnualPremiumWithCredit = Math.round(baseNovicePremiumCad * (1 - experienceDiscountRate));
  const estimatedAnnualSavingsCad = baseNovicePremiumCad - estimatedAnnualPremiumWithCredit;
  const savingsPercent = Math.round((estimatedAnnualSavingsCad / baseNovicePremiumCad) * 100);

  // 2. Foreign Experience Letter Audit
  const requiredLetterElements = [
    'Official insurer letterhead with company registration and contact details',
    'Policyholder full legal name matching Canadian driver licence',
    'Exact inception date and cancellation/expiry date of coverage',
    'Explicit claims-free status (or breakdown of at-fault claims with loss amounts)',
    'Primary named driver status (named insured rather than secondary driver)',
    'Certified English translation if originally issued in another language'
  ];

  const insurersAcceptingForeignLetters = [
    'Desjardins Insurance (Recognizes up to 10+ years international driving history)',
    'Aviva Canada (Accepts licensed insurer experience letters with 3+ years history)',
    'Intact Insurance (Considers prior foreign history under affiliate underwriting guidelines)',
    'CAA South Central Ontario (Recognizes prior claims-free history from select countries)',
    'Travelers Canada (Credits documented international licensed experience)'
  ];

  // 3. SABS Accident Benefits Calculation (Ontario O. Reg. 34/10)
  const grossWeeklyIncomeCad = Math.round((income / 52) * 100) / 100;
  let eligibleBenefitType = 'INELIGIBLE';
  let weeklyIncomeReplacementCad = 0;
  let waitingPeriodDays = 0;
  let durationWeeks = 0;
  let optionalCoverageRecommendation = '';

  if (prov === 'ON') {
    // SABS s. 4-7: Employed at accident or worked 26 of 52 weeks
    const isQualifyingWorker = employmentStatus === 'employed' || employmentStatus === 'self_employed' || weeksWorked >= 26;

    if (isQualifyingWorker) {
      eligibleBenefitType = 'INCOME_REPLACEMENT_BENEFIT';
      const calculated70Percent = Math.round(grossWeeklyIncomeCad * AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_IRB_PERCENT_GROSS);
      weeklyIncomeReplacementCad = Math.min(irbCap, calculated70Percent);
      waitingPeriodDays = AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_IRB_WAITING_PERIOD_DAYS;
      durationWeeks = AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_IRB_MAX_STANDARD_WEEKS;

      if (irbCap === 400 && calculated70Percent > 400) {
        optionalCoverageRecommendation = `Standard Ontario statutory IRB ceiling is $400/week ($20,800/yr). Your calculated 70% income is $${calculated70Percent}/week ($${Math.round(calculated70Percent * 52).toLocaleString()}/yr). You face a weekly shortfall of $${calculated70Percent - 400}. Consider adding Optional Income Replacement Endorsement (OPCF 47) for $600, $800, or $1,000/week.`;
      } else {
        optionalCoverageRecommendation = 'Your optional income replacement endorsement adequately covers your gross weekly income.';
      }
    } else if (employmentStatus === 'student' || employmentStatus === 'unemployed') {
      // SABS s. 12: Non-Earner Benefit
      eligibleBenefitType = 'NON_EARNER_BENEFIT';
      weeklyIncomeReplacementCad = AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_NEB_WEEKLY_CAD;
      waitingPeriodDays = AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_NEB_WAITING_PERIOD_WEEKS * 7;
      durationWeeks = AUTO_INSURANCE_CONSTANTS.ONTARIO_SABS_IRB_MAX_STANDARD_WEEKS;
      optionalCoverageRecommendation = 'Non-earner benefit pays $185/week after a 4-week waiting period if completely unable to carry on a normal life.';
    }
  } else if (prov === 'BC') {
    eligibleBenefitType = 'INCOME_REPLACEMENT_BENEFIT';
    const netIncomeCapped = Math.min(income, AUTO_INSURANCE_CONSTANTS.BC_ICBC_MAX_GROSS_INCOME_CAD);
    weeklyIncomeReplacementCad = Math.round(((netIncomeCapped * AUTO_INSURANCE_CONSTANTS.BC_ICBC_INCOME_REPLACEMENT_PERCENT_NET) / 52) * 100) / 100;
    waitingPeriodDays = 8;
    durationWeeks = 104;
    optionalCoverageRecommendation = 'ICBC Enhanced Care automatically covers 90% of net income up to $113,000 gross with no litigation requirement.';
  }

  // 4. "Take-All-Comers" Regulatory Audit (Insurance Act s. 237)
  const takeAllComersAudit = {
    isViolationSuspected: refusalReported,
    complaintAuthority: prov === 'ON' ? 'Financial Services Regulatory Authority of Ontario (FSRA)' : 'Provincial Superintendent of Insurance',
    statutoryReference: prov === 'ON' ? 'Ontario Insurance Act s. 237 & FSRA Unfair or Deceptive Acts or Practices (UDAP) Rule' : 'Provincial Insurance Act',
    stepsToEnforce: refusalReported ? [
      'Demand immediate written explanation from insurer or broker detailing the underwriting declination rule',
      'Verify broker submitted quote to all contracted carriers rather than screening out newcomer applicants',
      'File formal regulatory complaint with FSRA via online consumer portal or 1-800-668-0128',
      'Escalate to the General Insurance OmbudService (GIO) for independent dispute resolution',
      'Obtain binding interim coverage through the Facility Association if standard market unlawfully refuses quotes'
    ] : [
      'Broker is adhering to FSRA underwriting rules',
      'Request quotes from direct writers (Desjardins, Belairdirect, CAA) as well as independent brokers'
    ]
  };

  // 5. Statutory Citations & Guidance
  const statutoryCitations = [
    'Ontario Insurance Act, R.S.O. 1990, c. I.8, s. 237 ("Take-All-Comers" underwriting duty)',
    'Statutory Accident Benefits Schedule (SABS), O. Reg. 34/10, ss. 4-7 (Income Replacement Benefit)',
    'Statutory Accident Benefits Schedule (SABS), O. Reg. 34/10, s. 12 (Non-Earner Benefit)',
    'Statutory Accident Benefits Schedule (SABS), O. Reg. 34/10, s. 18 (Minor Injury Guideline $3,500)',
    'Financial Services Regulatory Authority of Ontario (FSRA) Act, 2016, S.O. 2016, c. 37'
  ];

  const officialGuidance = [
    `Experience Credit: Providing a certified Claims-Free Experience Letter saves approximately $${estimatedAnnualSavingsCad.toLocaleString()} CAD per year (${savingsPercent}% reduction).`,
    `SABS Income Protection: In Ontario, standard statutory income replacement is capped at $400 CAD/week regardless of earnings unless OPCF 47 endorsement is purchased.`,
    `Postal Code Fairness: While insurers price by territory FSA, refusing to quote or delaying newcomer quotes violates the mandatory Take-All-Comers rule under Insurance Act s. 237.`,
    `Licence Exchange: Exchange your foreign driver licence for an Ontario G2 or G within 60 days of taking up residency (HTA s. 32).`
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    driverName: safeDriverName,
    province: prov,
    postalCode: rawPostal || 'N/A',
    forwardSortationArea: fsa || 'N/A',
    ratingTerritoryAnalysis: {
      territoryTier,
      isHighPremiumZone,
      estimatedAnnualPremiumWithoutCreditCad: baseNovicePremiumCad,
      estimatedAnnualPremiumWithExperienceCreditCad: estimatedAnnualPremiumWithCredit,
      estimatedAnnualSavingsCad,
      savingsPercent
    },
    experienceLetterAudit: {
      isLetterValid: hasLetter && foreignYears > 0,
      eligibleDrivingYearsRecognized,
      requiredLetterElements,
      insurersAcceptingForeignLetters
    },
    sabsAccidentBenefits: {
      eligibleBenefitType,
      weeklyIncomeReplacementCad,
      grossWeeklyIncomeCad,
      statutoryWeeklyCeilingCad: prov === 'ON' ? irbCap : 1950,
      annualReplacementCad: weeklyIncomeReplacementCad * 52,
      waitingPeriodDays,
      durationWeeks,
      medicalRehabCoverageCad: AUTO_INSURANCE_CONSTANTS.ONTARIO_NON_CAT_LIMIT_CAD,
      catastrophicCoverageCad: AUTO_INSURANCE_CONSTANTS.ONTARIO_CAT_LIMIT_CAD,
      optionalCoverageRecommendation
    },
    takeAllComersAudit,
    statutoryCitations,
    officialGuidance
  };
}
