// src/lmia-readiness-navigator.js
// Statutory LMIA Exemption, Wage Stream Classification & ESDC Compliance Auditor
// Based on IRPR s. 200, 203, 204, and ESDC Temporary Foreign Worker Program guidelines.
import { boundedText } from './text-input.js';
import { factValue } from './kb-facts.js';

function safeIsoDate(val, fallback = '2026-10-31') {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const d = new Date(val.trim() + 'T00:00:00Z');
    if (!Number.isNaN(d.getTime())) return val.trim();
  }
  return fallback;
}

export const PROVINCIAL_MEDIAN_WAGES_2025_2026 = {
  AB: 29.50,
  BC: 28.85,
  ON: 28.39,
  QC: 27.50,
  SK: 26.00,
  MB: 25.00,
  NS: 24.50,
  NB: 24.00,
  NL: 25.50,
  PE: 24.25,
  YT: 36.00,
  NT: 38.00,
  NU: 40.00
};

export const LMIA_EXEMPTION_CODES = {
  C10: { code: 'C10', name: 'Significant Benefit (Economic, Cultural or Social)', authority: 'IRPR s. 205(a)' },
  C16: { code: 'C16', name: 'Francophone Mobility (Mobilité Francophone)', authority: 'IRPR s. 205(a)' },
  C20: { code: 'C20', name: 'Reciprocal Employment', authority: 'IRPR s. 205(b)' },
  T23: { code: 'T23', name: 'CUSMA Professionals (US & Mexican Citizens)', authority: 'IRPR s. 204(a)' },
  T24: { code: 'T24', name: 'CUSMA Intra-Company Transferees', authority: 'IRPR s. 204(a)' },
  A75: { code: 'A75', name: 'Bridging Open Work Permit (BOWP)', authority: 'IRPR s. 205(a)' }
};

export function evaluateLmiaReadiness(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employerName = 'Canadian Tech Corp',
    province = 'ON',
    offeredHourlyWageCad = 35.00,
    nocCode = '21231',
    teerCategory = 1, // 0, 1, 2, 3, 4, 5
    isExemptionClaimed = false,
    exemptionCode = 'C16', // 'C10', 'C16', 'C20', 'T23', 'T24', 'none'
    frenchProficiencyNclc = 6, // relevant for C16
    applicantCitizenship = 'FR', // relevant for CUSMA / Reciprocal
    cmaUnemploymentOver6Percent = false, // ESDC refusal-to-process rule for low-wage
    currentTfwProportionPercent = 8, // share of the work location's workforce in low-wage LMIA positions
    isConstructionOrHealthcare = false, // these sectors keep a 20% cap
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeEmployerName = boundedText(employerName, 'Canadian Tech Corp', 120);
  const safeProvince = boundedText(province, 'ON', 10).toUpperCase();
  const safeNocCode = boundedText(nocCode, '21231', 20);
  const safeExemptionCode = boundedText(exemptionCode, 'C16', 20);
  const safeCitizenship = boundedText(applicantCitizenship, 'FR', 10).toUpperCase();
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const offeredWage = Math.max(0, Math.min(10000, Number(offeredHourlyWageCad) || 35.00));
  const teer = Math.max(0, Math.min(5, Math.floor(Number(teerCategory) || 0)));
  const frenchNclc = Math.max(0, Math.min(12, Math.floor(Number(frenchProficiencyNclc) || 0)));
  const tfwProportion = Math.max(0, Math.min(100, Number(currentTfwProportionPercent) || 0));

  const medianWage = PROVINCIAL_MEDIAN_WAGES_2025_2026[safeProvince] || 28.39;
  const isHighWageStream = offeredWage >= medianWage;
  const wageDeltaCad = offeredWage - medianWage;

  // 1. Check Exemption Viability
  let exemptionEligible = false;
  let exemptionReason = '';

  if (isExemptionClaimed && safeExemptionCode !== 'none' && LMIA_EXEMPTION_CODES[safeExemptionCode]) {
    if (safeExemptionCode === 'C16') {
      if (safeProvince !== 'QC' && frenchNclc >= 5 && teer <= 3) {
        exemptionEligible = true;
        exemptionReason = 'Eligible for Francophone Mobility (Code C16): Position outside Quebec, NCLC 5+ French demonstrated, TEER 0–3 NOC.';
      } else {
        exemptionReason = 'Ineligible for C16: Requires position outside Quebec, minimum NCLC 5 French speaking/listening, and TEER 0-3 NOC.';
      }
    } else if (safeExemptionCode === 'T23' || safeExemptionCode === 'T24') {
      if (['US', 'MX'].includes(safeCitizenship)) {
        exemptionEligible = true;
        exemptionReason = `Eligible under CUSMA (${safeExemptionCode}): US/Mexican citizenship verified with qualifying professional role.`;
      } else {
        exemptionReason = `Ineligible for ${safeExemptionCode}: CUSMA exemptions strictly require US or Mexican citizenship.`;
      }
    } else if (safeExemptionCode === 'C10') {
      exemptionEligible = true;
      exemptionReason = 'C10 Significant Benefit: Subject to officer assessment of substantial economic or cultural contributions.';
    }
  }

  // 2. Stream Compliance & Restrictions
  const complianceObligations = [];
  const riskWarnings = [];

  if (exemptionEligible) {
    complianceObligations.push('Employer must submit offer of employment via IRCC Employer Portal and pay $230 CAD compliance fee.');
    complianceObligations.push('Provide applicant with official Offer of Employment (A-Number) before work permit submission.');
  } else {
    // Requires Standard ESDC LMIA
    complianceObligations.push('Conduct minimum 4 consecutive weeks of national recruitment advertising on Job Bank + 2 additional platforms.');
    complianceObligations.push('Pay $1,000 CAD ESDC application processing fee per requested temporary foreign worker position.');

    if (isHighWageStream) {
      complianceObligations.push('Draft and maintain an ESDC Transition Plan detailing commitments to hire/train Canadians or transition TFW to PR.');
    } else {
      complianceObligations.push('Employer must provide return round-trip transportation at no cost to the worker.');
      complianceObligations.push('Employer must ensure suitable and affordable housing is available.');
      complianceObligations.push('Employer must provide private health insurance until provincial coverage commences.');

      if (cmaUnemploymentOver6Percent) {
        riskWarnings.push('ESDC REFUSAL-TO-PROCESS RISK: Under ESDC policy, low-wage LMIA applications in CMAs with unemployment rates of 6% or higher are automatically refused.');
      }
      // Cap per work location (src/kb-facts.js); construction and healthcare have a higher cap.
      const lowWageCapPercent = factValue(isConstructionOrHealthcare ? 'ca.lmia.lowWageCapConstructionHealthcarePercent' : 'ca.lmia.lowWageCapPercent');
      if (tfwProportion > lowWageCapPercent) {
        riskWarnings.push(`ESDC CAP BREACH: Low-wage temporary foreign workers exceed the ${lowWageCapPercent}% cap for this work location.`);
      }
    }
  }

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    employerName: safeEmployerName,
    province: safeProvince,
    nocCode: safeNocCode,
    teerCategory: teer,
    wageAnalysis: {
      offeredHourlyWageCad: offeredWage,
      provincialMedianWageCad: medianWage,
      wageDeltaCad,
      stream: isHighWageStream ? 'HIGH_WAGE_STREAM' : 'LOW_WAGE_STREAM'
    },
    exemptionAudit: {
      claimed: isExemptionClaimed,
      code: safeExemptionCode,
      isEligible: exemptionEligible,
      authority: LMIA_EXEMPTION_CODES[safeExemptionCode]?.authority || 'IRPR s. 200',
      reason: exemptionReason || (isExemptionClaimed ? 'Exemption criteria not fully satisfied.' : 'Standard ESDC LMIA required.')
    },
    streamRules: isHighWageStream
      ? { requiresTransitionPlan: true, lowWageCapApplies: false, housingObligation: false }
      : { requiresTransitionPlan: false, lowWageCapApplies: true, housingObligation: true },
    complianceObligations,
    riskWarnings,
    statutoryBasis: 'Immigration and Refugee Protection Regulations (IRPR) s. 200, 203, 204, 303.1; ESDC TFW Program Directives.'
  };
}
