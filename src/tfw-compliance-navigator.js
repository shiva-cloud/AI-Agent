/**
 * Temporary Foreign Worker (TFW) Closed Work Permit Employer Compliance & Wage Dedication Audit Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227:
 *   - ss. 209.2, 209.3 & 209.4 (Employer Compliance Inspection Regime)
 *   - s. 209.2(1)(a)(iv) (Mandatory obligation to provide substantially the same, but not less favorable, wages and working conditions)
 *   - s. 209.2(1)(a)(i) (Strict prohibition on recovering LMIA processing fees or recruitment costs from workers)
 *   - s. 209.95 (Administrative Monetary Penalties / AMPs up to $100,000 per violation, $1,000,000 maximum per year)
 *   - s. 207.1 (Vulnerable Worker Open Work Permit / VWOWP remedy for workers experiencing abuse)
 * - Ontario Employment Protection for Foreign Nationals Act, 2009 (EPFNA), S.O. 2009, c. 32:
 *   - ss. 7-8 (Strict ban on charging recruitment fees to foreign nationals and prohibition on passport confiscation)
 * - British Columbia Temporary Foreign Worker Protection Act (TFWPA), S.B.C. 2018, c. 45:
 *   - ss. 10-12 (Prohibition of recruitment fees, fee recovery, and document retention)
 * - ESDC / Service Canada TFW Program Policy:
 *   - Low-Wage & Agricultural housing standards and maximum allowable deductions
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const TFW_COMPLIANCE_CONSTANTS = Object.freeze({
  LMIA_GOVERNMENT_FEE_CAD: 1000.0,
  MAX_ANNUAL_EMPLOYER_AMP_CAD: 1000000.0,
  MAX_SINGLE_AMP_CAD: 100000.0
});

export const TFW_STREAMS = Object.freeze({
  low_wage: {
    label: 'TFWP Low-Wage Stream',
    housingRequirement: 'Employer must assist with or provide suitable and affordable housing',
    roundTripTravelPaidByEmployer: true
  },
  high_wage: {
    label: 'TFWP High-Wage Stream / Global Talent Stream',
    housingRequirement: 'Standard market accommodations',
    roundTripTravelPaidByEmployer: false
  },
  agriculture_sawp: {
    label: 'Seasonal Agricultural Worker Program (SAWP) & Primary Agriculture',
    housingRequirement: 'Employer must provide inspected and approved on-farm/off-farm housing (max $30/week or provincial guideline)',
    roundTripTravelPaidByEmployer: true
  }
});

/**
 * Diagnostic audit of employer LMIA compliance, unlawful deductions, passport retention,
 * wage underpayment, and eligibility for a Vulnerable Worker Open Work Permit.
 */
export function evaluateTfwEmployerCompliance({
  stream = 'low_wage',
  lmiaStipulatedHourlyWageCad = 24.50,
  actualPaidHourlyWageCad = 18.00,
  weeklyHoursContracted = 40,
  actualWeeklyHoursOffered = 30,
  prohibitedDeductionsChargedCad = 2500,
  recruiterFeeChargedCad = 5000,
  employerRetainedPassportOrPermit = false,
  assignedDifferentOccupation = false,
  unsafeHousingOrOvercharge = false,
  weeksWorked = 16,
  workerName = 'Temporary Foreign Worker',
  employerName = 'Farm & Logistics Ltd.',
  assessmentDate = '2026-10-31'
} = {}) {
  const streamKey = boundedText(stream, 30).toLowerCase() || 'low_wage';
  const streamConfig = TFW_STREAMS[streamKey] || TFW_STREAMS.low_wage;

  const lmiaWage = Number.isFinite(Number(lmiaStipulatedHourlyWageCad)) ? Math.max(0, Math.min(10000, Number(lmiaStipulatedHourlyWageCad))) : 24.50;
  const actualWage = Number.isFinite(Number(actualPaidHourlyWageCad)) ? Math.max(0, Math.min(10000, Number(actualPaidHourlyWageCad))) : 18.00;
  const contractedHours = Number.isFinite(Number(weeklyHoursContracted)) ? Math.max(0, Math.min(168, Number(weeklyHoursContracted))) : 40;
  const actualHours = Number.isFinite(Number(actualWeeklyHoursOffered)) ? Math.max(0, Math.min(168, Number(actualWeeklyHoursOffered))) : 30;
  const prohibitedDeductions = Number.isFinite(Number(prohibitedDeductionsChargedCad)) ? Math.max(0, Math.min(10000000, Number(prohibitedDeductionsChargedCad))) : 0;
  const recruiterFees = Number.isFinite(Number(recruiterFeeChargedCad)) ? Math.max(0, Math.min(10000000, Number(recruiterFeeChargedCad))) : 0;

  const passportRetained = Boolean(employerRetainedPassportOrPermit);
  const diffOccupation = Boolean(assignedDifferentOccupation);
  const badHousing = Boolean(unsafeHousingOrOvercharge);
  const weeks = Number.isFinite(Number(weeksWorked)) ? Math.max(1, Math.min(520, Math.floor(Number(weeksWorked)))) : 16;

  const safeWorker = boundedText(workerName, 120) || 'Temporary Foreign Worker';
  const safeEmployer = boundedText(employerName, 150) || 'Employer';
  const assessDate = safeIsoDate(assessmentDate);

  const violations = [];
  const complianceRisks = [];
  const actionPlan = [];

  // 1. Wage Underpayment Audit
  let hourlyUnderpayment = 0;
  let totalWageShortfallCad = 0;

  if (actualWage < lmiaWage) {
    hourlyUnderpayment = Math.round((lmiaWage - actualWage) * 100) / 100;
    // Shortfall per week = (lmiaWage * contractedHours) - (actualWage * actualHours)
    const expectedWeeklyPay = lmiaWage * contractedHours;
    const actualWeeklyPay = actualWage * actualHours;
    const weeklyShortfall = Math.max(0, expectedWeeklyPay - actualWeeklyPay);
    totalWageShortfallCad = Math.round(weeklyShortfall * weeks * 100) / 100;

    violations.push(`WAGE UNDERPAYMENT BREACH (IRPR s. 209.2(1)(a)(iv)): Employer is paying $${actualWage} CAD/hr, which is $${hourlyUnderpayment} CAD/hr below the legally mandated LMIA rate of $${lmiaWage} CAD/hr. Estimated accrued wage shortfall over ${weeks} weeks: $${totalWageShortfallCad} CAD.`);
  }

  // Hours reduction breach
  if (actualHours < contractedHours) {
    complianceRisks.push(`HOURS REDUCTION: Employer is offering only ${actualHours} hours/week compared to the contracted ${contractedHours} hours stipulated in the approved LMIA.`);
  }

  // 2. Unlawful Deductions & Recruiter Fees (EPFNA ss. 7-8 & IRPR s. 209.2)
  const totalIllegalDeductionsCad = Math.round((prohibitedDeductions + recruiterFees) * 100) / 100;

  if (totalIllegalDeductionsCad > 0) {
    violations.push(`ILLEGAL FEE RECOVERY & DEDUCTIONS: $${totalIllegalDeductionsCad} CAD in prohibited deductions/recruitment fees recovered from worker. Under IRPR s. 209.2(1)(a)(i) and EPFNA s. 7, employers cannot recover LMIA fees, legal fees, or recruiter costs from foreign workers.`);
    actionPlan.push({
      action: 'File Employment Standards Claim for Recovery of Prohibited Deductions',
      authority: 'Ontario EPFNA s. 7 / BC TFWPA s. 10',
      claimAmountCad: totalIllegalDeductionsCad
    });
  }

  // 3. Document Confiscation (Criminal & Regulatory)
  if (passportRetained) {
    violations.push('CRIMINAL DOCUMENT RETENTION: Employer withholding passport, work permit, or immigration documents violates Ontario EPFNA s. 8, BC TFWPA s. 12, and constitutes potential trafficking indicator under Criminal Code s. 279.01.');
    actionPlan.push({
      action: 'Demand Immediate Surrender of Confiscated Passport and Work Permit',
      authority: 'EPFNA s. 8 & Local Law Enforcement / CBSA Trafficking Unit',
      claimAmountCad: 0
    });
  }

  // 4. Different Occupation / Incompatible Duties
  if (diffOccupation) {
    violations.push('OCCUPATION MISALIGNMENT: Requiring worker to perform duties in an entirely different occupation or lower NOC classification than approved in the LMIA violates IRPR s. 209.2(1)(a)(iv).');
  }

  // 5. Housing Standards Non-Compliance
  if (badHousing) {
    violations.push('SUBSTANDARD HOUSING: Failure to provide safe, inspected, or affordable housing violating ESDC program criteria for agricultural/low-wage streams.');
  }

  // 6. Vulnerable Worker Open Work Permit (VWOWP) Eligibility
  let eligibleForVwowp = false;
  let vwowpReason = '';

  if (totalIllegalDeductionsCad > 0 || passportRetained || hourlyUnderpayment > 0 || badHousing) {
    eligibleForVwowp = true;
    vwowpReason = 'Worker has reasonable grounds to believe they are experiencing financial, psychological, or labour abuse under IRPR s. 207.1.';
    actionPlan.push({
      action: 'Submit Urgent Online Application for Vulnerable Worker Open Work Permit (VWOWP)',
      authority: 'IRPR s. 207.1 (Fee-Exempt LMIA-Free Open Work Permit)',
      claimAmountCad: 0
    });
  }

  // 7. Employer Sanction Exposure
  let employerSanctionExposure = 'Compliant';
  if (violations.length >= 2 || passportRetained || totalIllegalDeductionsCad > 5000) {
    employerSanctionExposure = 'High Risk of Heavy AMPs ($10,000 - $100,000+), Ineligibility Blacklisting & Referral for Inspection';
  } else if (violations.length === 1) {
    employerSanctionExposure = 'Moderate Risk of Warning, Correction Order or Monetary Penalty';
  }

  actionPlan.push({
    action: 'Report Employer Violations to ESDC / Service Canada Anonymous Tip Line (1-866-602-9448)',
    authority: 'IRPR ss. 209.2-209.4 Employer Compliance Regime',
    claimAmountCad: 0
  });

  const totalFinancialRestitutionDueCad = Math.round((totalWageShortfallCad + totalIllegalDeductionsCad) * 100) / 100;

  return {
    workerName: safeWorker,
    employerName: safeEmployer,
    stream: streamConfig.label,
    assessmentDate: assessDate,
    complianceStatus: violations.length === 0 ? 'Compliant' : 'Significant Violations Detected',
    wageAudit: {
      lmiaStipulatedHourlyWageCad: lmiaWage,
      actualPaidHourlyWageCad: actualWage,
      hourlyUnderpaymentCad: hourlyUnderpayment,
      contractedWeeklyHours: contractedHours,
      actualWeeklyHours: actualHours,
      weeksWorked: weeks,
      totalWageShortfallCad
    },
    unlawfulDeductionsAudit: {
      prohibitedDeductionsChargedCad: prohibitedDeductions,
      recruiterFeeChargedCad: recruiterFees,
      totalIllegalDeductionsCad
    },
    totalFinancialRestitutionDueCad,
    vwowpAssessment: {
      eligibleForVwowp,
      regulatoryBasis: 'IRPR s. 207.1',
      abuseGrounds: vwowpReason
    },
    employerSanctionExposure,
    violations,
    actionPlan
  };
}

/**
 * Generates a formal Pre-Complaint Settlement & Wage Restitution Demand Letter to the employer.
 */
export function generateTfwComplianceDemandLetter({
  workerName = 'Temporary Foreign Worker',
  employerName = 'Employer Inc.',
  wageShortfallCad = 3120,
  illegalDeductionsCad = 7500,
  hasPassportRetained = false,
  demandDate = '2026-10-31'
} = {}) {
  const wName = boundedText(workerName, 120) || 'Temporary Foreign Worker';
  const eName = boundedText(employerName, 150) || 'Employer Inc.';
  const shortfall = Number.isFinite(Number(wageShortfallCad)) ? Math.max(0, Math.min(10000000, Number(wageShortfallCad))) : 0;
  const deductions = Number.isFinite(Number(illegalDeductionsCad)) ? Math.max(0, Math.min(10000000, Number(illegalDeductionsCad))) : 0;
  const totalDue = Math.round((shortfall + deductions) * 100) / 100;
  const date = safeIsoDate(demandDate);

  return [
    '================================================================================',
    'FORMAL DEMAND FOR WAGE RESTITUTION & STATUTORY COMPLIANCE',
    `To: The Management of ${eName}`,
    `From: ${wName} | Date: ${date}`,
    '================================================================================',
    '',
    '1. STATUTORY NOTICE OF IRPR & EPFNA VIOLATIONS:',
    '   Please be advised that the current employment terms violate mandatory requirements under',
    '   the Immigration and Refugee Protection Regulations (IRPR ss. 209.2-209.4) and provincial worker protection laws:',
    shortfall > 0 ? `   - Unpaid LMIA Wage Shortfall: $${shortfall} CAD accrued due to below-LMIA hourly wage.` : '',
    deductions > 0 ? `   - Prohibited Recruitment & Processing Fees Recovered: $${deductions} CAD.` : '',
    hasPassportRetained ? '   - CRITICAL: Withholding personal immigration documents/passports violates EPFNA s. 8.' : '',
    '',
    '2. TOTAL RESTITUTION DEMANDED:',
    `   DEMAND IS HEREBY MADE for immediate reimbursement of $${totalDue} CAD within seven (7) business days.`,
    '',
    '3. REGULATORY CONSEQUENCES OF NON-COMPLIANCE:',
    '   Failure to remediate will result in formal reporting to:',
    '   - Service Canada / ESDC Employer Compliance Inspection Directorate (IRPR ss. 209.2 - 209.95).',
    '   - Ministry of Labour / Employment Standards Branch for recovery order with interest.',
    '   - Immigration, Refugees and Citizenship Canada (IRCC) under IRPR s. 207.1 (VWOWP).',
    '================================================================================'
  ].filter(line => line !== '').join('\n');
}
