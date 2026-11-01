/**
 * Medical Inadmissibility Excessive Demand Mitigation Engine (IRPA s. 38(1)(c) & Hilewitz/Sapru Standards)
 * 
 * Statutory & Jurisdictional Authorities:
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27:
 *   - s. 38(1)(c) (Inadmissibility on health grounds: excessive demand on health or social services)
 *   - s. 38(2) (Statutory exemptions: sponsored spouses, common-law partners, dependent children, and Convention refugees)
 * - IRCC Operational Bulletins & Cost Thresholds:
 *   - Excessive demand threshold set at 3x Canadian average per capita health and social services expenditure
 *   - 2026 Statutory Threshold: $26,364 CAD / year ($131,820 CAD over 5-year assessment window)
 * - Supreme Court & Federal Court of Appeal Jurisprudence:
 *   - Hilewitz v. Canada (MCI), 2005 SCC 57: Medical officers MUST conduct an individualized assessment of the applicant's
 *     ability and intent to defray health/social service costs using personal financial resources.
 *   - Sapru v. Canada (MCI), 2011 FCA 35: Viable mitigation plans (private drug insurance, savings, trusts) can overcome
 *     excessive demand findings for outpatient prescription medication.
 *   - Colaco v. Canada (MCI), 2007 FCA 282: Mitigation plans for publicly funded inpatient hospital care or physician services
 *     are legally ineffective (no opt-out from Canadian medicare).
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const EXCESSIVE_DEMAND_CONSTANTS = Object.freeze({
  ANNUAL_COST_THRESHOLD_CAD: 26364.0,
  FIVE_YEAR_CUMULATIVE_THRESHOLD_CAD: 131820.0,
  PFL_RESPONSE_WINDOW_DAYS: 60,
  MAX_YEARS_ASSESSED: 5
});

export const MITIGATION_VIABILITY_RULES = Object.freeze({
  outpatient_prescription_drugs: {
    serviceType: 'Outpatient Prescription Medication',
    canBeMitigatedPrivately: true,
    legalAuthority: 'Sapru v. Canada (MCI), 2011 FCA 35',
    requirements: 'Demonstrate binding private insurance or liquid capital to purchase drugs directly without provincial formulary claims.'
  },
  special_education_services: {
    serviceType: 'Special Education & Developmental Social Services',
    canBeMitigatedPrivately: true,
    legalAuthority: 'Hilewitz v. Canada (MCI), 2005 SCC 57',
    requirements: 'Contract with private tutoring, private specialized academy, or dedicated private therapists.'
  },
  inpatient_physician_hospital_care: {
    serviceType: 'Physician Visits & Inpatient Hospitalization',
    canBeMitigatedPrivately: false,
    legalAuthority: 'Colaco v. Canada (MCI), 2007 FCA 282',
    requirements: 'Statutorily funded under Canada Health Act. Private payment cannot opt out of public hospital services.'
  },
  organ_transplant_dialysis: {
    serviceType: 'Dialysis & Solid Organ Transplants',
    canBeMitigatedPrivately: false,
    legalAuthority: 'IRPA s. 38(1)(c) & Public Waitlist Standards',
    requirements: 'Increases wait times for Canadian residents; cannot be mitigated through private payment.'
  }
});

/**
 * Diagnostic evaluation of excessive demand medical admissibility under IRPA s. 38,
 * statutory exemptions under s. 38(2), and individualized mitigation plan viability under Hilewitz and Sapru.
 */
export function evaluateExcessiveDemandMitigation(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    immigrationStream = 'economic_express_entry', // 'economic_express_entry' | 'spousal_sponsorship' | 'refugee_protected_person' | 'pnp'
    diagnosedCondition = 'Multiple Sclerosis',
    estimatedAnnualMedicationCostCad = 18000,
    estimatedAnnualHospitalCostCad = 4000,
    estimatedAnnualSocialServicesCostCad = 2000,
    hasPrivateInsuranceDrugCoverage = true,
    privateInsuranceDrugLimitAnnualCad = 25000,
    liquidFundsAvailableForCareCad = 60000,
    receivedProceduralFairnessLetter = true,
    pflReceivedDate = '2026-10-01',
    applicantName = 'Medical Applicant',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const stream = boundedText(immigrationStream, 'economic_express_entry', 50).toLowerCase();
  const condition = boundedText(diagnosedCondition, 'Medical Condition', 100);
  const meds = Math.max(0, Math.min(10000000, Number.isFinite(Number(estimatedAnnualMedicationCostCad)) ? Number(estimatedAnnualMedicationCostCad) : 0));
  const hospital = Math.max(0, Math.min(10000000, Number.isFinite(Number(estimatedAnnualHospitalCostCad)) ? Number(estimatedAnnualHospitalCostCad) : 0));
  const social = Math.max(0, Math.min(10000000, Number.isFinite(Number(estimatedAnnualSocialServicesCostCad)) ? Number(estimatedAnnualSocialServicesCostCad) : 0));

  const hasDrugInsurance = Boolean(hasPrivateInsuranceDrugCoverage);
  const drugInsuranceLimit = Math.max(0, Math.min(10000000, Number.isFinite(Number(privateInsuranceDrugLimitAnnualCad)) ? Number(privateInsuranceDrugLimitAnnualCad) : 0));
  const liquidFunds = Math.max(0, Math.min(10000000, Number.isFinite(Number(liquidFundsAvailableForCareCad)) ? Number(liquidFundsAvailableForCareCad) : 0));

  const hasPfl = Boolean(receivedProceduralFairnessLetter);
  const pflDate = pflReceivedDate ? safeIsoDate(pflReceivedDate, '2026-10-01') : null;
  const assessDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeApplicant = boundedText(applicantName, 'Applicant', 100);

  const statutoryNotes = [];
  const riskWarnings = [];
  const requiredDocuments = [];

  // 1. Statutory Exemption under IRPA s. 38(2)
  const isStatutorilyExempt = stream === 'spousal_sponsorship' || stream === 'refugee_protected_person';

  // 2. Gross Public Cost Calculation (Before Mitigation)
  const grossAnnualCostCad = meds + hospital + social;
  const grossFiveYearCostCad = grossAnnualCostCad * EXCESSIVE_DEMAND_CONSTANTS.MAX_YEARS_ASSESSED;
  const exceedsThresholdUnmitigated = grossAnnualCostCad > EXCESSIVE_DEMAND_CONSTANTS.ANNUAL_COST_THRESHOLD_CAD;

  // 3. Mitigation Calculation (Sapru & Hilewitz Standards)
  // Outpatient medication can be mitigated by insurance or liquid funds
  let mitigatedMedicationCostCad = meds;
  let drugInsuranceAppliedCad = 0;

  if (hasDrugInsurance && drugInsuranceLimit > 0) {
    drugInsuranceAppliedCad = Math.min(meds, drugInsuranceLimit);
    mitigatedMedicationCostCad = meds - drugInsuranceAppliedCad;
  }

  // Social services can be mitigated by personal liquid funds (spread over 5 years)
  const annualLiquidContributionCad = Math.min(social, Math.round(liquidFunds / 5));
  const mitigatedSocialServicesCad = social - annualLiquidContributionCad;

  // Hospital inpatient costs CANNOT be mitigated privately under Colaco
  const mitigatedHospitalCostCad = hospital;

  const netAnnualPublicCostCad = mitigatedMedicationCostCad + mitigatedSocialServicesCad + mitigatedHospitalCostCad;
  const netFiveYearPublicCostCad = netAnnualPublicCostCad * EXCESSIVE_DEMAND_CONSTANTS.MAX_YEARS_ASSESSED;
  const exceedsThresholdMitigated = netAnnualPublicCostCad > EXCESSIVE_DEMAND_CONSTANTS.ANNUAL_COST_THRESHOLD_CAD;

  let admissibilityStatus = 'admissible';
  let summaryTitle = '';

  if (isStatutorilyExempt) {
    admissibilityStatus = 'statutorily_exempt';
    summaryTitle = 'Statutorily Exempt from Excessive Demand (IRPA s. 38(2))';
    statutoryNotes.push('IRPA s. 38(2): Spouses, common-law partners, dependent children, and Convention refugees are legally exempt from excessive demand inadmissibility regardless of medical costs.');
  } else if (!exceedsThresholdUnmitigated) {
    admissibilityStatus = 'admissible_unmitigated';
    summaryTitle = 'Admissible: Expected Costs Below Excessive Demand Threshold';
    statutoryNotes.push(`Total expected public cost ($${grossAnnualCostCad.toLocaleString()} CAD/yr) is below the statutory threshold ($${EXCESSIVE_DEMAND_CONSTANTS.ANNUAL_COST_THRESHOLD_CAD.toLocaleString()} CAD/yr).`);
  } else if (!exceedsThresholdMitigated) {
    admissibilityStatus = 'admissible_with_mitigation';
    summaryTitle = 'Admissible with Mitigation Plan (Hilewitz / Sapru Precedent)';
    statutoryNotes.push(`Individualized Mitigation Plan successfully offsets outpatient drug and social service costs, reducing public liability to $${netAnnualPublicCostCad.toLocaleString()} CAD/yr (below $${EXCESSIVE_DEMAND_CONSTANTS.ANNUAL_COST_THRESHOLD_CAD.toLocaleString()} threshold).`);
  } else {
    admissibilityStatus = 'inadmissible_excessive_demand';
    summaryTitle = 'Inadmissible: Residual Public Costs Exceed Excessive Demand Threshold';
    riskWarnings.push(`Residual unmitigated public costs ($${netAnnualPublicCostCad.toLocaleString()} CAD/yr) exceed the 3x per capita threshold ($${EXCESSIVE_DEMAND_CONSTANTS.ANNUAL_COST_THRESHOLD_CAD.toLocaleString()} CAD/yr).`);
    if (hospital > EXCESSIVE_DEMAND_CONSTANTS.ANNUAL_COST_THRESHOLD_CAD) {
      riskWarnings.push('COLACO HOSPITALIZATION PRECLUSION: Inpatient hospital and physician costs cannot be offset by private funds or insurance under Canadian medicare laws (Colaco 2007 FCA 282).');
    }
  }

  // PFL Response Timeline
  let daysRemainingToRespond = 0;
  if (hasPfl && pflDate) {
    const pTime = Date.parse(pflDate);
    const aTime = Date.parse(assessDate);
    if (Number.isFinite(pTime) && Number.isFinite(aTime)) {
      const daysElapsed = Math.floor((aTime - pTime) / (1000 * 60 * 60 * 24));
      daysRemainingToRespond = Math.max(0, EXCESSIVE_DEMAND_CONSTANTS.PFL_RESPONSE_WINDOW_DAYS - daysElapsed);

      if (daysRemainingToRespond <= 15) {
        riskWarnings.push(`URGENT PFL DEADLINE: Only ${daysRemainingToRespond} days remaining to submit formal Mitigation Plan and evidence to IRCC medical officer.`);
      }
    }
  }

  requiredDocuments.push('Declaration of Ability and Intent (Form IMM 5544)');
  requiredDocuments.push('Detailed Physician Comprehensive Medical Report & Treatment Forecast');
  requiredDocuments.push('Proof of Comprehensive Private Health / Drug Insurance Coverage (Letter of Benefit Confirmation)');
  requiredDocuments.push('Certified Bank Statements & Trust Account Funding Proof ($60k+ CAD Liquid)');

  return {
    applicantName: safeApplicant,
    diagnosedCondition: condition,
    immigrationStream: stream,
    assessmentDate: assessDate,
    admissibilityStatus,
    summaryTitle,
    costAssessment: {
      annualStatutoryThresholdCad: EXCESSIVE_DEMAND_CONSTANTS.ANNUAL_COST_THRESHOLD_CAD,
      fiveYearCumulativeThresholdCad: EXCESSIVE_DEMAND_CONSTANTS.FIVE_YEAR_CUMULATIVE_THRESHOLD_CAD,
      grossAnnualCostCad,
      grossFiveYearCostCad,
      drugInsuranceOffsetAnnualCad: drugInsuranceAppliedCad,
      personalSavingsOffsetAnnualCad: annualLiquidContributionCad,
      netAnnualPublicCostCad,
      netFiveYearPublicCostCad
    },
    pflAudit: {
      hasReceivedPfl: hasPfl,
      pflReceivedDate: pflDate,
      responseWindowDays: EXCESSIVE_DEMAND_CONSTANTS.PFL_RESPONSE_WINDOW_DAYS,
      daysRemainingToRespond
    },
    mitigationViability: {
      outpatientMedicationViable: hasDrugInsurance || liquidFunds > meds,
      hospitalCareMitigable: false, // Prohibited under Colaco
      statutoryExemptionApplies: isStatutorilyExempt
    },
    statutoryNotes,
    riskWarnings,
    requiredDocuments
  };
}
