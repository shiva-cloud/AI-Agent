/**
 * Ontario Works (OW) & ODSP Social Assistance Asset Limits, Clawbacks & Immigration Undertaking Impact Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Ontario Works Act, 1997, S.O. 1997, c. 25, Sched. A; O. Reg. 134/98 (General)
 * - Ontario Disability Support Program Act, 1997, S.O. 1997, c. 25, Sched. B; O. Reg. 222/98 (General)
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 132 (Sponsorship Undertakings)
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 132, s. 133(1)(j) (Sponsorship Default Bar)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const SOCIAL_ASSISTANCE_CONSTANTS = Object.freeze({
  OW_ASSET_LIMIT_SINGLE_CAD: 10000,
  OW_ASSET_LIMIT_COUPLE_CAD: 15000,
  OW_ASSET_LIMIT_DEPENDENT_CHILD_CAD: 500,
  ODSP_ASSET_LIMIT_SINGLE_CAD: 40000,
  ODSP_ASSET_LIMIT_COUPLE_CAD: 50000,
  ODSP_ASSET_LIMIT_DEPENDENT_CHILD_CAD: 500,
  OW_MAX_MONTHLY_SINGLE_CAD: 733,
  OW_MAX_MONTHLY_COUPLE_CAD: 1136,
  ODSP_MAX_MONTHLY_SINGLE_CAD: 1308,
  OW_EARNINGS_EXEMPTION_FLAT_CAD: 200,
  OW_EARNINGS_CLAWBACK_RATE: 0.50,
  ODSP_EARNINGS_EXEMPTION_FLAT_CAD: 1000,
  ODSP_EARNINGS_CLAWBACK_RATE: 0.75,
  PRIMARY_VEHICLE_EXEMPTION_DEFAULT_CAD: 10000
});

/**
 * Diagnostic evaluation of Ontario social assistance eligibility (OW vs ODSP),
 * liquid asset limits, monthly benefit calculations, employment income clawbacks,
 * and Family Class immigration sponsorship undertaking default liabilities.
 */
export function evaluateSocialAssistance({
  program = 'ontario_works',
  immigrationStatus = 'permanent_resident',
  familyComposition = 'single',
  dependentChildrenCount = 0,
  liquidAssetsCad = 4500,
  primaryVehicleValueCad = 8000,
  ownsPrimaryResidence = false,
  grossMonthlyEmploymentIncomeCad = 0,
  monthlyShelterCostCad = 650,
  isSponsoredImmigrant = false,
  sponsorshipYearsRemaining = 0,
  applicantName = 'Applicant',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeApplicant = boundedText(applicantName, 'Applicant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const prog = boundedText(program, 'ontario_works', 50).toLowerCase();
  const status = boundedText(immigrationStatus, 'permanent_resident', 50).toLowerCase();
  const fam = boundedText(familyComposition, 'single', 30).toLowerCase();
  const kids = Math.max(0, Math.min(20, Math.floor(Number(dependentChildrenCount) || 0)));
  const liquid = Math.max(0, Math.min(100000000, Number(liquidAssetsCad) || 0));
  const vehVal = Math.max(0, Math.min(10000000, Number(primaryVehicleValueCad) || 0));
  const ownsHome = Boolean(ownsPrimaryResidence);
  const earnedIncome = Math.max(0, Math.min(1000000, Number(grossMonthlyEmploymentIncomeCad) || 0));
  
  const sponsored = Boolean(isSponsoredImmigrant);
  const sponsorYears = Math.max(0, Math.min(30, Math.floor(Number(sponsorshipYearsRemaining) || 0)));

  const isOdsp = prog === 'odsp';

  // 1. Status Eligibility Check
  let isStatusEligible = false;
  let statusGuidance = '';

  if (['citizen', 'permanent_resident', 'protected_person', 'refugee_claimant'].includes(status)) {
    isStatusEligible = true;
    statusGuidance = status === 'refugee_claimant'
      ? 'Refugee claimants with a valid Refugee Protection Claimant Document are statutorily eligible for Ontario Works while awaiting IRB hearings.'
      : 'Immigration status satisfies statutory social assistance residency criteria in Ontario.';
  } else if (['work_permit', 'study_permit', 'visitor'].includes(status)) {
    isStatusEligible = false;
    statusGuidance = 'Temporary residents (work permit, study permit, visitor) are generally ineligible for ongoing OW/ODSP because temporary status requires independent financial self-sufficiency. In extreme medical or humanitarian crises, discretionary short-term Emergency Assistance may be requested under OW s. 7(3).';
  } else {
    isStatusEligible = false;
    statusGuidance = 'Status must be verified with an Ontario Works or ODSP caseworker.';
  }

  // 2. Liquid Asset Limit Audit
  let baseAssetLimit = isOdsp
    ? (fam === 'single' ? SOCIAL_ASSISTANCE_CONSTANTS.ODSP_ASSET_LIMIT_SINGLE_CAD : SOCIAL_ASSISTANCE_CONSTANTS.ODSP_ASSET_LIMIT_COUPLE_CAD)
    : (fam === 'single' ? SOCIAL_ASSISTANCE_CONSTANTS.OW_ASSET_LIMIT_SINGLE_CAD : SOCIAL_ASSISTANCE_CONSTANTS.OW_ASSET_LIMIT_COUPLE_CAD);

  const totalAssetLimit = baseAssetLimit + (kids * (isOdsp ? SOCIAL_ASSISTANCE_CONSTANTS.ODSP_ASSET_LIMIT_DEPENDENT_CHILD_CAD : SOCIAL_ASSISTANCE_CONSTANTS.OW_ASSET_LIMIT_DEPENDENT_CHILD_CAD));
  const isWithinAssetLimit = liquid <= totalAssetLimit;
  const excessAssetsCad = Math.max(0, liquid - totalAssetLimit);

  // Vehicle asset exemption evaluation
  const vehicleExempt = vehVal <= SOCIAL_ASSISTANCE_CONSTANTS.PRIMARY_VEHICLE_EXEMPTION_DEFAULT_CAD;
  const nonExemptVehiclePortionCad = Math.max(0, vehVal - SOCIAL_ASSISTANCE_CONSTANTS.PRIMARY_VEHICLE_EXEMPTION_DEFAULT_CAD);

  // 3. Base Maximum Monthly Benefit
  let maxMonthlyBenefit = 0;
  if (isOdsp) {
    maxMonthlyBenefit = SOCIAL_ASSISTANCE_CONSTANTS.ODSP_MAX_MONTHLY_SINGLE_CAD;
  } else {
    maxMonthlyBenefit = (fam === 'single' && kids === 0)
      ? SOCIAL_ASSISTANCE_CONSTANTS.OW_MAX_MONTHLY_SINGLE_CAD
      : SOCIAL_ASSISTANCE_CONSTANTS.OW_MAX_MONTHLY_COUPLE_CAD;
  }

  // 4. Employment Income Clawback Formula
  let earningsExemption = isOdsp
    ? SOCIAL_ASSISTANCE_CONSTANTS.ODSP_EARNINGS_EXEMPTION_FLAT_CAD
    : SOCIAL_ASSISTANCE_CONSTANTS.OW_EARNINGS_EXEMPTION_FLAT_CAD;

  let clawbackRate = isOdsp
    ? SOCIAL_ASSISTANCE_CONSTANTS.ODSP_EARNINGS_CLAWBACK_RATE
    : SOCIAL_ASSISTANCE_CONSTANTS.OW_EARNINGS_CLAWBACK_RATE;

  let netDeductionFromEarningsCad = 0;
  if (earnedIncome > earningsExemption) {
    netDeductionFromEarningsCad = Math.round((earnedIncome - earningsExemption) * clawbackRate);
  }

  const estimatedMonthlyDisbursementCad = Math.max(0, maxMonthlyBenefit - netDeductionFromEarningsCad);

  // 5. Immigration Sponsorship Undertaking Default Liability
  let sponsorshipDebtRisk = null;
  if (sponsored && sponsorYears > 0) {
    sponsorshipDebtRisk = {
      isDefaultTriggered: true,
      undertakingYearsLeft: sponsorYears,
      legalImpact: 'CRITICAL STATUTORY DEFAULT: Under IRPA s. 132 and O. Reg. 134/98 s. 48, if a sponsored family member receives Ontario Works or ODSP during the undertaking period, the Canadian sponsor incurs an immediate statutory debt to the Crown equal to the full amount of all social assistance disbursed. Furthermore, under IRPR s. 133(1)(j), the sponsor is legally barred from sponsoring any other spouse, parent, child, or family member in the future until the entire debt is reimbursed to the province.'
    };
  }

  // 6. Practical Action Plan
  const actionPlan = [
    {
      step: 1,
      title: 'Verify Asset Portfolio Compliance',
      action: `Ensure total non-exempt liquid bank deposits, investments, and cash remain below your statutory limit ($${totalAssetLimit.toLocaleString('en-CA')} CAD).`
    },
    {
      step: 2,
      title: 'Submit Online Social Assistance Application',
      action: 'Apply online through the Ontario Ministry of Children, Community and Social Services portal with your SIN, bank statements, lease agreement, and immigration documentation.'
    },
    {
      step: 3,
      title: 'Review Monthly Income Reporting Obligations',
      action: `Report all employment earnings every month by the 16th. For ${isOdsp ? 'ODSP' : 'Ontario Works'}, the first $${earningsExemption}/month of earned wages is fully exempt from clawback.`
    },
    {
      step: 4,
      title: 'Sponsorship Undertaking Warning Review',
      action: sponsored
        ? 'Before finalizing receipt of benefits, notify the sponsor that benefits collected will create an official government collection debt against them.'
        : 'Confirm that no active family sponsorship undertaking applies to your arrival.'
    }
  ];

  const warnings = [
    'Right to Appeal: If your Ontario Works or ODSP application is denied or benefits are reduced, you have the right to request an Internal Review within 30 days and appeal to the Social Benefits Tribunal (SBT).',
    'Asset Exemptions: Your primary residence and one motor vehicle are exempt assets and do not count toward your liquid asset limit.',
    'Social Assistance & Citizenship: Receiving Ontario Works or ODSP does NOT disqualify you from Canadian citizenship or permanent residency renewals.'
  ];

  return {
    applicantName: safeApplicant,
    assessmentDate: safeAssessmentDate,
    program: isOdsp ? 'ODSP (Ontario Disability Support Program)' : 'Ontario Works (OW)',
    immigrationStatus: status,
    eligibility: {
      isStatusEligible,
      statusGuidance,
      isWithinAssetLimit,
      isOverallEligible: isStatusEligible && isWithinAssetLimit
    },
    assetAudit: {
      liquidAssetsCad: liquid,
      statutoryAssetLimitCad: totalAssetLimit,
      isWithinAssetLimit,
      excessAssetsCad,
      primaryVehicle: {
        valueCad: vehVal,
        isExempt: vehicleExempt,
        nonExemptValueCad: nonExemptVehiclePortionCad
      },
      primaryResidenceExempt: ownsHome
    },
    benefitCalculation: {
      baseMaximumMonthlyBenefitCad: maxMonthlyBenefit,
      grossEmploymentEarningsCad: earnedIncome,
      flatEarningsExemptionCad: earningsExemption,
      clawbackRatePercent: Math.round(clawbackRate * 100),
      netMonthlyDeductionCad: netDeductionFromEarningsCad,
      estimatedMonthlyDisbursementCad
    },
    sponsorshipUndertakingImpact: sponsorshipDebtRisk,
    actionPlan,
    warnings,
    statutoryCitations: [
      'Ontario Works Act, 1997, S.O. 1997, c. 25, Sched. A, ss. 7, 8, 48',
      'Ontario Disability Support Program Act, 1997, S.O. 1997, c. 25, Sched. B, ss. 5, 14',
      'O. Reg. 134/98 (Ontario Works - General), Part IV (Assets) & Part V (Income)',
      'O. Reg. 222/98 (ODSP - General), Part IV (Assets) & Part V (Income)',
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 132 (Sponsorship Liability)',
      'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 133(1)(j) (Default Bar)'
    ]
  };
}
