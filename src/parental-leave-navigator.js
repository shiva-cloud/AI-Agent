// src/parental-leave-navigator.js
// Canadian Statutory Parental & Maternity Leave (EI) / Employment Standards Engine.
// Audits federal Employment Insurance cash replacement benefits, provincial job protection,
// and work permit status continuity under:
// - Employment Insurance Act (S.C. 1996, c. 23, ss. 12, 19, 22, 23: Maternity & Parental benefits)
// - Employment Insurance Regulations (SOR/96-332: 600 insurable hours requirement)
// - Ontario Employment Standards Act, 2000 (S.O. 2000, c. 41, Part XIV ss. 46-53: Job-protected leave)
// - British Columbia Employment Standards Act (RSBC 1996, c. 113, Part 6 ss. 50-51)
// - Alberta Employment Standards Code (RSA 2000, c. E-9, ss. 45-53: 90-day rule)
// - Quebec Parental Insurance Plan (QPIP / RQAP: CQLR c. A-29.011 / EI Act s. 69 opt-out)
// - IRPR ss. 186, 200 & 201 (Work permit holder EI entitlement & maintained status).
// Pure ES module with zero npm runtime dependencies.

export const EI_STATUTORY_CONSTANTS = {
  MIN_INSURABLE_HOURS_EI: 600, // 600 hours in 52-week qualifying period
  MAX_INSURABLE_EARNINGS_ANNUAL_CAD: 65700, // 2025 federal insurable ceiling
  MAX_WEEKLY_INSURABLE_EARNINGS_CAD: 1263.46, // 65,700 / 52
  STANDARD_BENEFIT_RATE: 0.55, // 55% of average weekly insurable earnings
  STANDARD_MAX_WEEKLY_CAD: 695, // 2025 statutory cap
  EXTENDED_BENEFIT_RATE: 0.33, // 33% of average weekly insurable earnings
  EXTENDED_MAX_WEEKLY_CAD: 417, // 2025 statutory cap
  MATERNITY_WEEKS_MAX: 15,
  PARENTAL_STANDARD_WEEKS_SINGLE: 35,
  PARENTAL_STANDARD_WEEKS_SHARED: 40, // 5-week "use-it-or-lose-it" second parent incentive
  PARENTAL_EXTENDED_WEEKS_SINGLE: 61,
  PARENTAL_EXTENDED_WEEKS_SHARED: 69, // 8-week second parent incentive
  QPIP_QUALIFYING_INCOME_CAD: 2000 // Quebec QPIP insurable earnings floor
};

export const PROVINCIAL_JOB_PROTECTION_STANDARDS = {
  ON: {
    province: 'Ontario',
    statute: 'Employment Standards Act, 2000 (Part XIV, ss. 46-53)',
    minServiceWeeksForJobProtection: 13,
    maternityLeaveWeeks: 17,
    parentalLeaveWeeks: 61, // 63 weeks if no pregnancy leave taken
    guaranteedReinstatement: true,
    tribunal: 'Ontario Labour Relations Board (OLRB) / Ministry of Labour'
  },
  BC: {
    province: 'British Columbia',
    statute: 'British Columbia Employment Standards Act (RSBC 1996, c. 113, Part 6)',
    minServiceWeeksForJobProtection: 0, // Immediate statutory job protection in BC
    maternityLeaveWeeks: 17,
    parentalLeaveWeeks: 61, // 62 weeks if no maternity leave
    guaranteedReinstatement: true,
    tribunal: 'BC Employment Standards Branch (ESB)'
  },
  AB: {
    province: 'Alberta',
    statute: 'Employment Standards Code (RSA 2000, c. E-9, ss. 45-53)',
    minServiceWeeksForJobProtection: 13, // 90 consecutive calendar days (~13 weeks)
    maternityLeaveWeeks: 16,
    parentalLeaveWeeks: 62,
    guaranteedReinstatement: true,
    tribunal: 'Alberta Employment Standards'
  },
  QC: {
    province: 'Quebec',
    statute: 'Act respecting labour standards (CQLR c. N-1.1) & QPIP (RQAP)',
    minServiceWeeksForJobProtection: 0,
    maternityLeaveWeeks: 18,
    parentalLeaveWeeks: 32, // Plus 5 weeks paternity
    guaranteedReinstatement: true,
    tribunal: 'CNESST / QPIP'
  },
  OTHER: {
    province: 'Other Province / Federal Jurisdiction',
    statute: 'Canada Labour Code (R.S.C., 1985, c. L-2) / Provincial Standards',
    minServiceWeeksForJobProtection: 13,
    maternityLeaveWeeks: 17,
    parentalLeaveWeeks: 61,
    guaranteedReinstatement: true,
    tribunal: 'Provincial Ministry of Labour'
  }
};

export function evaluateParentalLeave({
  province = 'ON',
  immigrationStatus = 'permanent_resident', // 'permanent_resident', 'work_permit_holder', 'canadian_citizen', 'study_permit_holder'
  insurableHoursWorkedPast52Weeks = 700,
  annualGrossSalaryCad = 60000,
  leaveType = 'maternity_and_parental', // 'maternity_and_parental', 'parental_only', 'maternity_only'
  parentalOption = 'standard', // 'standard', 'extended'
  isSharingWithPartner = true,
  employerServiceWeeks = 16,
  workPermitExpiryDate = null
} = {}) {
  const normProv = String(province || 'ON').toUpperCase().trim();
  const provRules = PROVINCIAL_JOB_PROTECTION_STANDARDS[normProv] || PROVINCIAL_JOB_PROTECTION_STANDARDS.OTHER;
  const normStatus = String(immigrationStatus || 'permanent_resident').toLowerCase().trim();
  const normLeaveType = String(leaveType || 'maternity_and_parental').toLowerCase().trim();
  const normOption = String(parentalOption || 'standard').toLowerCase().trim();
  const hoursWorked = Math.max(0, Number.isFinite(Number(insurableHoursWorkedPast52Weeks)) ? Number(insurableHoursWorkedPast52Weeks) : 0);
  const salary = Math.max(0, Number.isFinite(Number(annualGrossSalaryCad)) ? Number(annualGrossSalaryCad) : 0);
  const serviceWeeks = Math.max(0, Number.isFinite(Number(employerServiceWeeks)) ? Number(employerServiceWeeks) : 0);
  const isSharing = Boolean(isSharingWithPartner);

  const isQuebec = normProv === 'QC';
  const statutoryViolations = [];
  const statutoryAdvisories = [];
  const actionChecklist = [];
  const workPermitVulnerabilities = [];

  // 1. Evaluate Federal EI / Quebec QPIP Cash Eligibility
  let isEligibleForCash = false;
  let hoursShortfall = 0;

  if (isQuebec) {
    // Quebec QPIP uses income threshold ($2,000) rather than 600 hours
    isEligibleForCash = salary >= EI_STATUTORY_CONSTANTS.QPIP_QUALIFYING_INCOME_CAD;
    if (!isEligibleForCash) {
      hoursShortfall = 0;
      statutoryViolations.push({
        rule: 'QPIP Insurable Earnings Floor',
        statute: 'Act respecting parental insurance (CQLR c. A-29.011)',
        legalFinding: `You have not accumulated the required $2,000 CAD minimum insurable earnings in Quebec to qualify for QPIP cash benefits.`
      });
    }
  } else {
    // Federal EI requires 600 insurable hours
    isEligibleForCash = hoursWorked >= EI_STATUTORY_CONSTANTS.MIN_INSURABLE_HOURS_EI;
    if (!isEligibleForCash) {
      hoursShortfall = EI_STATUTORY_CONSTANTS.MIN_INSURABLE_HOURS_EI - hoursWorked;
      statutoryViolations.push({
        rule: 'EI Insurable Hours Threshold',
        statute: 'Employment Insurance Act (S.C. 1996, c. 23, s. 12(2) & SOR/96-332)',
        legalFinding: `You have accumulated ${hoursWorked} insurable hours in the past 52 weeks, which is ${hoursShortfall} hours short of the mandatory 600-hour threshold for EI parental benefits.`
      });
    }
  }

  // 2. Evaluate Provincial Job Protection
  const isEligibleForJobProtection = serviceWeeks >= provRules.minServiceWeeksForJobProtection;
  const serviceWeeksShortfall = Math.max(0, provRules.minServiceWeeksForJobProtection - serviceWeeks);

  if (!isEligibleForJobProtection) {
    statutoryViolations.push({
      rule: 'Provincial Minimum Length of Service for Job-Protected Leave',
      statute: provRules.statute,
      legalFinding: `In ${provRules.province}, job-protected maternity/parental leave requires at least ${provRules.minServiceWeeksForJobProtection} weeks of employment with your current employer. You have ${serviceWeeks} weeks (${serviceWeeksShortfall} weeks short). Your employer is not statutorily prohibited from replacing or terminating your position during an unapproved absence.`
    });
  }

  // 3. Temporary Resident / Work Permit Holder Rights Audit
  if (normStatus === 'work_permit_holder') {
    statutoryAdvisories.push(
      `Work Permit Holder Entitlement: Temporary foreign workers who pay EI deductions on their paystubs are 100% entitled to federal EI parental benefits under the Employment Insurance Act. Taking parental leave does NOT constitute illegal work or breach your permit conditions.`
    );

    if (workPermitExpiryDate) {
      const expiry = new Date(workPermitExpiryDate);
      const now = new Date();
      const daysToExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysToExpiry < 365) {
        workPermitVulnerabilities.push({
          risk: 'Work Permit Expiry Mid-Leave',
          daysToExpiry,
          actionRequired: `Your work permit expires in ${daysToExpiry} days. If your permit expires while on parental leave, Service Canada will freeze EI benefit disbursements until you supply proof of a valid renewed work permit or maintained status confirmation under IRPR s. 201.`
        });
      }
    }
  } else if (normStatus === 'study_permit_holder') {
    statutoryAdvisories.push(
      `Study Permit Notice: International students are generally not entitled to EI benefits unless they hold a valid SIN and have accumulated 600 insurable hours through authorized on-campus or off-campus employment under IRPR s. 186(v). Taking leave from studies requires an Authorized Leave letter under IRPR s. 220.1 to avoid losing PGWP rights.`
    );
  }

  // 4. Calculate Benefit Amounts and Durations
  // Average weekly insurable earnings
  const cappedAnnualEarnings = Math.min(salary, EI_STATUTORY_CONSTANTS.MAX_INSURABLE_EARNINGS_ANNUAL_CAD);
  const weeklyEarnings = cappedAnnualEarnings / 52;

  // Maternity weeks
  let maternityWeeks = 0;
  if (normLeaveType === 'maternity_and_parental' || normLeaveType === 'maternity_only') {
    maternityWeeks = isQuebec ? 18 : EI_STATUTORY_CONSTANTS.MATERNITY_WEEKS_MAX;
  }

  // Parental weeks calculation
  let parentalWeeksSingle = 0;
  let parentalWeeksShared = 0;
  let weeklyRatePct = 0;
  let maxWeeklyCap = 0;

  if (normOption === 'extended') {
    weeklyRatePct = EI_STATUTORY_CONSTANTS.EXTENDED_BENEFIT_RATE;
    maxWeeklyCap = EI_STATUTORY_CONSTANTS.EXTENDED_MAX_WEEKLY_CAD;
    parentalWeeksSingle = EI_STATUTORY_CONSTANTS.PARENTAL_EXTENDED_WEEKS_SINGLE;
    parentalWeeksShared = EI_STATUTORY_CONSTANTS.PARENTAL_EXTENDED_WEEKS_SHARED;
  } else {
    // Standard
    weeklyRatePct = EI_STATUTORY_CONSTANTS.STANDARD_BENEFIT_RATE;
    maxWeeklyCap = EI_STATUTORY_CONSTANTS.STANDARD_MAX_WEEKLY_CAD;
    parentalWeeksSingle = EI_STATUTORY_CONSTANTS.PARENTAL_STANDARD_WEEKS_SINGLE;
    parentalWeeksShared = EI_STATUTORY_CONSTANTS.PARENTAL_STANDARD_WEEKS_SHARED;
  }

  const parentalWeeks = isSharing ? parentalWeeksShared : parentalWeeksSingle;
  const totalWeeks = (normLeaveType === 'parental_only') ? parentalWeeks : (maternityWeeks + parentalWeeks);

  // Weekly benefit amount
  const calculatedWeekly = weeklyEarnings * weeklyRatePct;
  const weeklyBenefitCad = (salary >= EI_STATUTORY_CONSTANTS.MAX_INSURABLE_EARNINGS_ANNUAL_CAD)
    ? maxWeeklyCap
    : Math.min(calculatedWeekly, maxWeeklyCap);

  // Maternity weekly benefit is always 55% under federal EI
  const maternityWeeklyCad = (salary >= EI_STATUTORY_CONSTANTS.MAX_INSURABLE_EARNINGS_ANNUAL_CAD)
    ? EI_STATUTORY_CONSTANTS.STANDARD_MAX_WEEKLY_CAD
    : Math.min(weeklyEarnings * EI_STATUTORY_CONSTANTS.STANDARD_BENEFIT_RATE, EI_STATUTORY_CONSTANTS.STANDARD_MAX_WEEKLY_CAD);

  let totalProjectedCashPayoutCad = 0;
  if (isEligibleForCash) {
    if (normLeaveType === 'maternity_and_parental') {
      totalProjectedCashPayoutCad = (maternityWeeks * maternityWeeklyCad) + (parentalWeeks * weeklyBenefitCad);
    } else if (normLeaveType === 'maternity_only') {
      totalProjectedCashPayoutCad = maternityWeeks * maternityWeeklyCad;
    } else {
      totalProjectedCashPayoutCad = parentalWeeks * weeklyBenefitCad;
    }
  }

  // 5. Standard vs Extended Financial Comparison
  const standardParentalWeeks = isSharing ? EI_STATUTORY_CONSTANTS.PARENTAL_STANDARD_WEEKS_SHARED : EI_STATUTORY_CONSTANTS.PARENTAL_STANDARD_WEEKS_SINGLE;
  const standardWeekly = Math.min(weeklyEarnings * EI_STATUTORY_CONSTANTS.STANDARD_BENEFIT_RATE, EI_STATUTORY_CONSTANTS.STANDARD_MAX_WEEKLY_CAD);
  const standardTotalParental = standardParentalWeeks * standardWeekly;

  const extendedParentalWeeks = isSharing ? EI_STATUTORY_CONSTANTS.PARENTAL_EXTENDED_WEEKS_SHARED : EI_STATUTORY_CONSTANTS.PARENTAL_EXTENDED_WEEKS_SINGLE;
  const extendedWeekly = Math.min(weeklyEarnings * EI_STATUTORY_CONSTANTS.EXTENDED_BENEFIT_RATE, EI_STATUTORY_CONSTANTS.EXTENDED_MAX_WEEKLY_CAD);
  const extendedTotalParental = extendedParentalWeeks * extendedWeekly;

  const comparisonBetweenOptions = {
    standard: {
      option: 'Standard Parental (12 Months Total)',
      parentalWeeks: standardParentalWeeks,
      totalLeaveDurationWeeks: maternityWeeks + standardParentalWeeks,
      replacementRatePct: 55,
      weeklyCad: Number(standardWeekly.toFixed(2)),
      totalParentalPayoutCad: Number(standardTotalParental.toFixed(2)),
      totalCombinedPayoutCad: Number(((maternityWeeks * maternityWeeklyCad) + standardTotalParental).toFixed(2)),
      notes: 'Higher weekly income replacement. Ideal if returning to work within 12 months.'
    },
    extended: {
      option: 'Extended Parental (18 Months Total)',
      parentalWeeks: extendedParentalWeeks,
      totalLeaveDurationWeeks: maternityWeeks + extendedParentalWeeks,
      replacementRatePct: 33,
      weeklyCad: Number(extendedWeekly.toFixed(2)),
      totalParentalPayoutCad: Number(extendedTotalParental.toFixed(2)),
      totalCombinedPayoutCad: Number(((maternityWeeks * maternityWeeklyCad) + extendedTotalParental).toFixed(2)),
      notes: 'Lower weekly payout spread over 18 months. Total payout is roughly equivalent to standard.'
    }
  };

  // 6. Action Checklist
  actionChecklist.push(
    {
      stepNumber: 1,
      agency: 'Employer HR / Payroll',
      action: 'Provide formal written notice of pregnancy/parental leave at least 2 to 4 weeks before start date (as required under provincial employment standards).',
      timing: '2 to 4 weeks prior to leave'
    },
    {
      stepNumber: 2,
      agency: 'Employer Payroll',
      action: 'Request employer submit your electronic Record of Employment (ROE) directly to Service Canada within 5 calendar days of final pay period.',
      timing: 'Immediately after last day of work'
    },
    {
      stepNumber: 3,
      agency: 'Service Canada / MSCA',
      action: 'Submit your online application for EI Maternity and Parental benefits via My Service Canada Account (MSCA). Do not wait for the ROE to apply.',
      timing: 'Within 4 weeks of final work shift'
    },
    {
      stepNumber: 4,
      agency: 'CRA (Canada Revenue Agency)',
      action: 'Apply for the Canada Child Benefit (CCB) and GST/HST credit via Automated Benefits Application (ABA) at birth registration or via CRA My Account.',
      timing: 'Immediately upon child birth'
    }
  );

  // 7. Statutory Advisories
  statutoryAdvisories.push(
    `Irrevocable Parental Choice: Under federal EI regulations, once you begin receiving parental benefits under Standard (55%) or Extended (33%), you CANNOT change your option. Both parents must select the same option.`,
    `Second Parent Incentive: Under EI Act s. 23, sharing parental leave unlocks an extra 5 weeks of standard benefits (40 total) or 8 weeks of extended benefits (69 total). These bonus weeks cannot be taken by one parent alone.`,
    `Guaranteed Job Reinstatement: Under ${provRules.statute}, it is unlawful for an employer to terminate, penalize, or eliminate your position because of pregnancy or parental leave. You are statutorily entitled to return to your exact position or a comparable position with identical wage and seniority accrual.`
  );

  const resolutionVerdict = (isEligibleForCash && isEligibleForJobProtection)
    ? 'FULLY_PROTECTED_AND_FUNDED'
    : (!isEligibleForCash && isEligibleForJobProtection)
      ? 'JOB_PROTECTED_UNFUNDED_LEAVE'
      : (isEligibleForCash && !isEligibleForJobProtection)
        ? 'EI_FUNDED_UNPROTECTED_JOB_RISK'
        : 'INELIGIBLE_FOR_EI_AND_JOB_PROTECTION';

  return {
    province: normProv,
    provincialStatute: provRules.statute,
    immigrationStatus: normStatus,
    resolutionVerdict,
    isEligibleForCashBenefits: isEligibleForCash,
    hoursWorkedPast52Weeks: hoursWorked,
    hoursShortfall,
    isEligibleForProvincialJobProtection: isEligibleForJobProtection,
    serviceWeeksWithEmployer: serviceWeeks,
    serviceWeeksShortfall,
    selectedOption: normOption,
    weeklyBenefitCad: Number(weeklyBenefitCad.toFixed(2)),
    maternityWeeks,
    parentalWeeks,
    totalBenefitDurationWeeks: totalWeeks,
    totalProjectedCashPayoutCad: Number(totalProjectedCashPayoutCad.toFixed(2)),
    comparisonBetweenOptions,
    statutoryViolations,
    workPermitVulnerabilities,
    actionChecklist,
    statutoryAdvisories,
    statutoryAuthority: 'Employment Insurance Act (S.C. 1996, c. 23) & Provincial Employment Standards'
  };
}
