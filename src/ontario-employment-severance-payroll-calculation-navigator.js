/**
 * Ontario Employment Severance Pay & $2.5M Payroll Navigator
 *
 * Computes statutory severance pay, prorated partial-year months, 26-week statutory cap,
 * and $2.5M Ontario payroll qualification thresholds under Ontario's Employment
 * Standards Act, 2000 (ESA), ss. 64, 65, and O. Reg. 288/01.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ONTARIO_SEVERANCE_CONSTANTS = Object.freeze({
  MIN_YEARS_SERVICE_FOR_SEVERANCE: 5, // s. 64(1)(a)
  STATUTORY_PAYROLL_THRESHOLD_CAD: 2500000, // $2.5 million annual Ontario payroll
  DISCONTINUANCE_MIN_EMPLOYEES_TERMINATED: 50,
  MAX_STATUTORY_SEVERANCE_WEEKS: 26, // s. 65(1)
  STATUTORY_AUTHORITY: 'Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 64-66'
});

/**
 * Calculates statutory severance pay and audits eligibility thresholds under Ontario ESA s. 64.
 *
 * @param {Object} params
 * @param {number} [params.completedYearsOfService=6] - Full completed years of continuous employment
 * @param {number} [params.additionalCompletedMonthsOfService=6] - Additional months worked beyond full years (0-11)
 * @param {number} [params.regularWeeklyWageCad=1200] - Regular non-overtime weekly wages
 * @param {number} [params.employerOntarioAnnualPayrollCad=3000000] - Total annual gross Ontario payroll of employer
 * @param {boolean} [params.isPermanentDiscontinuanceOfBusiness=false] - Termination due to permanent discontinuance of 50+ staff
 * @param {boolean} [params.isTerminatedForWilfulMisconduct=false] - Fired for wilful misconduct (exempt under O. Reg. 288/01 s. 9)
 * @param {number} [params.statutorySeveranceAlreadyPaidCad=0] - Severance already remitted by employer
 * @param {string} [params.employeeName='Employee']
 * @param {string} [params.employerName='Employer']
 * @param {string} [params.assessmentDate=todayIso()]
 * @returns {Object} Comprehensive statutory severance pay audit and entitlements
 */
export function calculateOntarioStatutorySeverance({
  completedYearsOfService = 6,
  additionalCompletedMonthsOfService = 6,
  regularWeeklyWageCad = 1200,
  employerOntarioAnnualPayrollCad = 3000000,
  isPermanentDiscontinuanceOfBusiness = false,
  isTerminatedForWilfulMisconduct = false,
  statutorySeveranceAlreadyPaidCad = 0,
  employeeName = 'Employee',
  employerName = 'Employer',
  assessmentDate = todayIso()
} = {}) {
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanEmployee = boundedText(employeeName, 'Employee', 100);
  const cleanEmployer = boundedText(employerName, 'Employer', 120);

  const years = Math.max(0, Math.min(60, Math.floor(Number(completedYearsOfService) || 0)));
  const months = Math.max(0, Math.min(11, Math.floor(Number(additionalCompletedMonthsOfService) || 0)));
  const weeklyWage = Math.max(0, Math.min(100000, Number(regularWeeklyWageCad) || 0));
  const payroll = Math.max(0, Math.min(1000000000, Number(employerOntarioAnnualPayrollCad) || 0));
  const alreadyPaid = Math.max(0, Math.min(1000000000, Number(statutorySeveranceAlreadyPaidCad) || 0));
  const isPermanentDiscontinuance = Boolean(isPermanentDiscontinuanceOfBusiness);
  const isWilfulMisconduct = Boolean(isTerminatedForWilfulMisconduct);

  const totalExactYears = years + (months / 12);
  const meets5YearTenureRequirement = totalExactYears >= ONTARIO_SEVERANCE_CONSTANTS.MIN_YEARS_SERVICE_FOR_SEVERANCE;
  const meetsPayrollOrDiscontinuanceRequirement =
    payroll >= ONTARIO_SEVERANCE_CONSTANTS.STATUTORY_PAYROLL_THRESHOLD_CAD ||
    isPermanentDiscontinuance;

  const isEligibleForSeverance = meets5YearTenureRequirement && meetsPayrollOrDiscontinuanceRequirement && !isWilfulMisconduct;

  // Severance weeks formula: completed years + (completed months / 12), capped at 26 weeks
  const rawSeveranceWeeks = isEligibleForSeverance ? totalExactYears : 0;
  const cappedSeveranceWeeks = Math.min(ONTARIO_SEVERANCE_CONSTANTS.MAX_STATUTORY_SEVERANCE_WEEKS, rawSeveranceWeeks);
  const totalSeverancePayEntitledCad = Number((cappedSeveranceWeeks * weeklyWage).toFixed(2));
  const severanceDeficitOwedCad = Math.max(0, totalSeverancePayEntitledCad - alreadyPaid);

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  if (isWilfulMisconduct) {
    return {
      assessmentDate: safeAssessmentDate,
      jurisdiction: 'ONTARIO_CANADA',
      employeeName: cleanEmployee,
      employerName: cleanEmployer,
      isEligibleForSeverance: false,
      isTerminatedForWilfulMisconduct: true,
      severanceWeeksEntitled: 0,
      totalSeverancePayEntitledCad: 0,
      legalVerdict: 'Employee is disqualified from statutory severance pay due to wilful misconduct under O. Reg. 288/01 s. 9.',
      statutoryViolations: [],
      actionableRemedies: [
        {
          action: 'DISPUTE_WILFUL_MISCONDUCT_FINDING',
          remedyDescription: 'Wilful misconduct has a higher legal threshold than common law just cause; dispute characterization via Ministry of Labour claim.'
        }
      ],
      statutoryCitations: ['Employment Standards Act, 2000, S.O. 2000, c. 41, s. 64; O. Reg. 288/01, s. 9']
    };
  }

  if (!meets5YearTenureRequirement) {
    riskWarnings.push({
      warningType: 'TENURE_UNDER_5_YEARS',
      description: `Employee has ${totalExactYears.toFixed(2)} years of service. Section 64(1)(a) requires a minimum of 5 completed years of service for severance pay.`
    });
  }

  if (!meetsPayrollOrDiscontinuanceRequirement) {
    riskWarnings.push({
      warningType: 'PAYROLL_BELOW_2_5_MILLION',
      description: `Employer's annual Ontario payroll is $${payroll} (below statutory $2.5M threshold) and termination is not part of a 50+ discontinuance.`
    });
  }

  if (isEligibleForSeverance && severanceDeficitOwedCad > 0) {
    statutoryViolations.push({
      rule: 'FAILURE_TO_PAY_STATUTORY_SEVERANCE',
      statute: 'Employment Standards Act, 2000, s. 64',
      finding: `Employer owes $${severanceDeficitOwedCad} in unpaid statutory severance pay (${cappedSeveranceWeeks.toFixed(2)} weeks of regular wages).`
    });
    actionableRemedies.push({
      action: 'FILE_MINISTRY_OF_LABOUR_SEVERANCE_CLAIM',
      remedyDescription: `File an Employment Standards claim with the Ontario Ministry of Labour to recover $${severanceDeficitOwedCad} in unpaid severance pay within the 2-year limitation period.`
    });
  }

  let complianceStatus = isEligibleForSeverance
    ? (severanceDeficitOwedCad === 0 ? 'SEVERANCE_FULLY_SATISFIED' : 'STATUTORY_SEVERANCE_PAY_OWED')
    : 'NOT_ENTITLED_TO_STATUTORY_SEVERANCE';

  let legalVerdict = isEligibleForSeverance
    ? `Employee qualifies for ${cappedSeveranceWeeks.toFixed(2)} weeks statutory severance ($${totalSeverancePayEntitledCad}). ${severanceDeficitOwedCad > 0 ? `Shortfall of $${severanceDeficitOwedCad} is immediately payable.` : 'Full entitlement has been satisfied.'}`
    : `Employee is not entitled to statutory severance pay under ESA s. 64 (${!meets5YearTenureRequirement ? 'service under 5 years' : 'employer payroll under $2.5M'}). Common law Bardal notice may still apply.`;

  return {
    assessmentDate: safeAssessmentDate,
    jurisdiction: 'ONTARIO_CANADA',
    employeeName: cleanEmployee,
    employerName: cleanEmployer,
    completedYearsOfService: years,
    additionalCompletedMonthsOfService: months,
    totalExactYearsOfService: Number(totalExactYears.toFixed(2)),
    regularWeeklyWageCad: weeklyWage,
    isEligibleForSeverance,
    meets5YearTenureRequirement,
    meetsPayrollOrDiscontinuanceRequirement,
    complianceStatus,
    legalVerdict,
    severanceCalculation: {
      rawSeveranceWeeks: Number(rawSeveranceWeeks.toFixed(2)),
      cappedSeveranceWeeks: Number(cappedSeveranceWeeks.toFixed(2)),
      isSubjectTo26WeekCap: rawSeveranceWeeks > ONTARIO_SEVERANCE_CONSTANTS.MAX_STATUTORY_SEVERANCE_WEEKS,
      totalSeverancePayEntitledCad,
      statutorySeveranceAlreadyPaidCad: alreadyPaid,
      severanceDeficitOwedCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, 2000, S.O. 2000, c. 41, ss. 64, 65, 66',
      'Termination and Severance of Employment Regulation, O. Reg. 288/01',
      'Ontario Labour Relations Board Severance Jurisprudence'
    ]
  };
}
