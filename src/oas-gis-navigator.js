/**
 * Senior Newcomer Old Age Security (OAS), Guaranteed Income Supplement (GIS) & International Social Security Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Old Age Security Act (OASA), R.S.C. 1985, c. O-9:
 *   - s. 3(1) (Full OAS pension requirement: 40 years of residence in Canada after age 18)
 *   - s. 3(2) (Partial OAS pension requirement: minimum 10 years of residence after age 18 to receive in Canada)
 *   - s. 9(2) (Portability requirement: minimum 20 years of residence to receive OAS outside Canada indefinitely)
 *   - s. 11 (Guaranteed Income Supplement / GIS for low-income seniors resident in Canada)
 *   - s. 11(7) (Strict statutory bar: sponsored seniors under Family Class sponsorship undertaking barred from GIS)
 * - Income Tax Act (ITA), R.S.C. 1985, c. 1 (5th Supp.):
 *   - s. 180.2 (OAS Recovery Tax / Pension Clawback: 15% on net world income above threshold)
 * - International Social Security Totalization Agreements:
 *   - Canada has bilateral social security agreements with 50+ countries permitting combination of credits
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const OAS_GIS_CONSTANTS = Object.freeze({
  MINIMUM_OAS_AGE: 65,
  FULL_OAS_YEARS_REQUIRED: 40,
  MIN_RESIDENCE_YEARS_INLAND: 10,
  MIN_RESIDENCE_YEARS_PORTABLE_ABROAD: 20,
  MAX_FULL_MONTHLY_OAS_CAD: 727.67,
  MAX_MONTHLY_GIS_CAD: 1086.88,
  OAS_CLAWBACK_THRESHOLD_ANNUAL_CAD: 90997.0,
  OAS_CLAWBACK_RATE_PERCENT: 15.0,
  PGP_SPONSORSHIP_UNDERTAKING_YEARS: 20
});

export const TOTALIZATION_PARTNER_COUNTRIES = Object.freeze({
  US: 'United States (Social Security SSA)',
  UK: 'United Kingdom (National Insurance NIC)',
  IN: 'India (Employees’ Provident Fund Organization EPFO)',
  PH: 'Philippines (Social Security System SSS)',
  IT: 'Italy (INPS)',
  DE: 'Germany (Deutsche Rentenversicherung)',
  FR: 'France (CNAV)',
  AU: 'Australia (Centrelink / Age Pension Agreement)',
  IE: 'Ireland (PRSI)',
  ES: 'Spain (Seguridad Social)'
});

/**
 * Diagnostic evaluation of Old Age Security (OAS), 40ths pension proration,
 * 20-year international portability, GIS sponsorship undertaking bar, and totalization agreements.
 */
export function evaluateOasGisEligibility({
  ageYears = 67,
  yearsResidedInCanadaAfter18 = 12,
  countryOfOrigin = 'OTHER',
  yearsContributedToOriginSocialSecurity = 0,
  isCanadianCitizenOrLegalResident = true,
  livesInCanada = true,
  isUnderFamilyClassSponsorship = false,
  sponsorshipYearsRemaining = 0,
  annualNetWorldIncomeCad = 18000,
  applicantName = 'Senior Newcomer',
  assessmentDate = todayIso()
} = {}) {
  const age = Math.max(0, Math.min(130, Math.floor(Number(ageYears) || 0)));
  const yearsCanada = Math.max(0, Math.min(100, Math.floor(Number(yearsResidedInCanadaAfter18) || 0)));
  const originCountry = boundedText(countryOfOrigin, 'OTHER', 50).toUpperCase();
  const foreignYears = Math.max(0, Math.min(100, Math.floor(Number(yearsContributedToOriginSocialSecurity) || 0)));
  const hasLegalStatus = Boolean(isCanadianCitizenOrLegalResident);
  const inland = Boolean(livesInCanada);
  const sponsored = Boolean(isUnderFamilyClassSponsorship);
  const sponsorRemaining = Math.max(0, Math.min(30, Math.floor(Number(sponsorshipYearsRemaining) || 0)));
  const annualIncome = Math.max(0, Math.min(1000000000, Number(annualNetWorldIncomeCad) || 0));

  const safeApplicant = boundedText(applicantName, 'Senior Newcomer', 120);
  const assessDate = safeIsoDate(assessmentDate, todayIso());

  const statutoryNotes = [];
  const riskWarnings = [];
  const actionChecklist = [];

  // 1. Basic Age & Legal Status Audit
  let meetsBasicAgeAndStatus = false;
  if (age < OAS_GIS_CONSTANTS.MINIMUM_OAS_AGE) {
    riskWarnings.push(`AGE REQUIREMENT NOT MET: Current age (${age}) is below the statutory threshold of 65 (OASA s. 3). Applicant cannot receive OAS until age 65.`);
  } else if (!hasLegalStatus) {
    riskWarnings.push('LEGAL STATUS DISQUALIFIER: Applicant must be a Canadian citizen, permanent resident, or legal temporary resident (with valid status) on the day before approval.');
  } else {
    meetsBasicAgeAndStatus = true;
  }

  // 2. OAS Years of Residence & Totalization Audit
  const partnerMatch = TOTALIZATION_PARTNER_COUNTRIES[originCountry] || null;
  let totalCombinedYears = yearsCanada;
  let totalizationApplied = false;

  if (partnerMatch && foreignYears > 0) {
    totalCombinedYears = yearsCanada + foreignYears;
    totalizationApplied = true;
    statutoryNotes.push(`INTERNATIONAL SOCIAL SECURITY TOTALIZATION: Bilateral agreement with ${partnerMatch} applies. Foreign contribution credits (${foreignYears} years) can be added to Canadian residency (${yearsCanada} years) to satisfy the 10-year or 20-year qualifying threshold.`);
  }

  let oasEligible = false;
  let portableOutsideCanada = false;
  let pensionFractionNumerator = 0;
  let monthlyOasGrossCad = 0;

  if (meetsBasicAgeAndStatus) {
    const requiredMinYears = inland ? OAS_GIS_CONSTANTS.MIN_RESIDENCE_YEARS_INLAND : OAS_GIS_CONSTANTS.MIN_RESIDENCE_YEARS_PORTABLE_ABROAD;
    const qualifyingYears = totalizationApplied ? totalCombinedYears : yearsCanada;

    if (qualifyingYears >= requiredMinYears) {
      oasEligible = true;
      // Pension fraction is strictly based on Canadian residence years (up to 40)
      pensionFractionNumerator = Math.min(OAS_GIS_CONSTANTS.FULL_OAS_YEARS_REQUIRED, yearsCanada);
      // Minimum payment fraction numerator is 10/40 once qualified
      const fractionalRate = pensionFractionNumerator / OAS_GIS_CONSTANTS.FULL_OAS_YEARS_REQUIRED;
      monthlyOasGrossCad = Math.round(OAS_GIS_CONSTANTS.MAX_FULL_MONTHLY_OAS_CAD * fractionalRate * 100) / 100;

      // Portability check (20 years)
      if (yearsCanada >= OAS_GIS_CONSTANTS.MIN_RESIDENCE_YEARS_PORTABLE_ABROAD || (totalizationApplied && totalCombinedYears >= OAS_GIS_CONSTANTS.MIN_RESIDENCE_YEARS_PORTABLE_ABROAD)) {
        portableOutsideCanada = true;
        statutoryNotes.push('PORTABILITY CONFIRMED: Has at least 20 qualifying years (OASA s. 9(2)). Pension can be paid indefinitely outside Canada.');
      } else {
        portableOutsideCanada = false;
        statutoryNotes.push('INLAND LIMITATION: If applicant leaves Canada for more than 6 consecutive months, OAS payments will be suspended until they return (OASA s. 9(2)).');
      }

      actionChecklist.push(`Submit Service Canada Form ISP-3000 (Application for Old Age Security) 6 months prior to eligibility.`);
    } else {
      oasEligible = false;
      riskWarnings.push(`INSUFFICIENT RESIDENCE: Has accumulated only ${yearsCanada} Canadian residence years (totalized: ${qualifyingYears} years). Minimum ${requiredMinYears} years required.`);
    }
  }

  // 3. Guaranteed Income Supplement (GIS) & Sponsorship Undertaking Bar (OASA s. 11(7))
  let gisEligible = false;
  let gisBarredBySponsorship = false;
  let monthlyGisCad = 0;
  let gisStatusMessage = '';

  if (oasEligible && inland) {
    if (sponsored && sponsorRemaining > 0) {
      gisBarredBySponsorship = true;
      gisEligible = false;
      gisStatusMessage = `STRICT STATUTORY BAR (OASA s. 11(7)): Under Family Class sponsorship undertaking, sponsored parents/grandparents are legally prohibited from receiving GIS for the duration of the ${OAS_GIS_CONSTANTS.PGP_SPONSORSHIP_UNDERTAKING_YEARS}-year undertaking (${sponsorRemaining} years remaining). The sponsor is financially responsible.`;
      riskWarnings.push(gisStatusMessage);
    } else if (annualIncome < 21624) {
      // Income threshold check for non-sponsored or completed undertakings
      gisEligible = true;
      // Approximate sliding scale GIS
      monthlyGisCad = Math.max(50, Math.round((OAS_GIS_CONSTANTS.MAX_MONTHLY_GIS_CAD - (annualIncome / 24)) * 100) / 100);
      gisStatusMessage = `Eligible for estimated $${monthlyGisCad} CAD/month in GIS based on reported income.`;
      actionChecklist.push('Apply for Guaranteed Income Supplement (GIS) via Service Canada Form ISP-3025.');
    } else {
      gisEligible = false;
      gisStatusMessage = 'Net world income exceeds single low-income GIS qualification cutoff.';
    }
  } else {
    gisStatusMessage = 'GIS requires active OAS eligibility and physical residence inside Canada.';
  }

  // 4. OAS Recovery Tax / Clawback Audit (ITA s. 180.2)
  let clawbackTriggered = false;
  let annualClawbackCad = 0;
  let netMonthlyOasCad = monthlyOasGrossCad;

  if (oasEligible && annualIncome > OAS_GIS_CONSTANTS.OAS_CLAWBACK_THRESHOLD_ANNUAL_CAD) {
    clawbackTriggered = true;
    const excessIncome = annualIncome - OAS_GIS_CONSTANTS.OAS_CLAWBACK_THRESHOLD_ANNUAL_CAD;
    annualClawbackCad = Math.round(excessIncome * (OAS_GIS_CONSTANTS.OAS_CLAWBACK_RATE_PERCENT / 100) * 100) / 100;
    const monthlyClawback = Math.round((annualClawbackCad / 12) * 100) / 100;
    netMonthlyOasCad = Math.max(0, Math.round((monthlyOasGrossCad - monthlyClawback) * 100) / 100);
    riskWarnings.push(`OAS CLAWBACK (ITA s. 180.2): Annual income ($${annualIncome} CAD) exceeds threshold ($${OAS_GIS_CONSTANTS.OAS_CLAWBACK_THRESHOLD_ANNUAL_CAD} CAD). 15% clawback applies ($${annualClawbackCad} CAD/year, approx $${monthlyClawback} CAD/month).`);
  }

  const totalMonthlyBenefitCad = Math.round((netMonthlyOasCad + monthlyGisCad) * 100) / 100;

  return {
    asOf: assessDate,
    applicantName: safeApplicant,
    assessmentDate: assessDate,
    ageEvaluated: age,
    yearsResidedCanada: yearsCanada,
    countryOfOrigin: originCountry,
    oasAudit: {
      eligibleForOas: oasEligible,
      fractionOfFullPension: `${pensionFractionNumerator}/${OAS_GIS_CONSTANTS.FULL_OAS_YEARS_REQUIRED}`,
      monthlyOasGrossCad,
      netMonthlyOasCad,
      portableOutsideCanada,
      totalizationApplied,
      combinedQualifyingYears: totalCombinedYears
    },
    gisAudit: {
      eligibleForGis: gisEligible,
      gisBarredBySponsorship,
      monthlyGisCad,
      sponsorshipYearsRemaining: sponsorRemaining,
      statusMessage: gisStatusMessage
    },
    clawbackAudit: {
      clawbackTriggered,
      clawbackThresholdCad: OAS_GIS_CONSTANTS.OAS_CLAWBACK_THRESHOLD_ANNUAL_CAD,
      annualClawbackCad
    },
    totalMonthlyBenefitCad,
    statutoryNotes,
    riskWarnings,
    actionChecklist
  };
}

/**
 * Generates an executive Senior Retirement & Settlement Roadmap memorandum.
 */
export function generateSeniorBenefitRoadmap({
  applicantName = 'Senior Newcomer',
  monthlyOasCad = 218.30,
  monthlyGisCad = 0,
  isBarredGis = false,
  sponsorshipYearsRemaining = 15
} = {}) {
  const name = boundedText(applicantName, 'Senior Newcomer', 120);
  const oas = Number(monthlyOasCad) || 0;
  const gis = Number(monthlyGisCad) || 0;
  const barred = Boolean(isBarredGis);

  return [
    '================================================================================',
    'SENIOR NEWCOMER OAS & GIS BENEFIT ROADMAP',
    `Applicant: ${name} | Legal Authorities: Old Age Security Act & Tax Treaties`,
    '================================================================================',
    '',
    '1. OLD AGE SECURITY (OAS) BENEFIT ENTITLEMENT:',
    `   - Estimated Monthly OAS Benefit: $${oas} CAD/month (Prorated to Canadian residence years).`,
    '   - Service Canada calculates partial pension in 40ths (minimum 10 years inland, 20 years abroad).',
    '',
    '2. GUARANTEED INCOME SUPPLEMENT (GIS) ASSESSMENT:',
    barred
      ? `   - [STRICT BAR] Ineligible for GIS due to active Family Sponsorship Undertaking (${sponsorshipYearsRemaining} yrs remaining).`
      : `   - Estimated Monthly GIS Benefit: $${gis} CAD/month (Non-taxable low-income supplement).`,
    '',
    '3. FILING & COMPLIANCE REQUIREMENTS:',
    '   - File annual Canadian income tax returns (T1 General) every year by April 30 to maintain benefits.',
    '   - Report any foreign pensions or worldwide income on CRA Line 11500.',
    '================================================================================'
  ].join('\n');
}
