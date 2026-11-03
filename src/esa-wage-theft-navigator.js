/**
 * Northstar ESA Wage Theft & Employment Standards Navigator (Recs 76, 77, 78, 80, 81, 100)
 * Implements statutory standards for:
 * 1. Ontario ESA Overtime (s. 22): 44 hours/week threshold, 1.5x regular rate, averaging agreements.
 * 2. Ontario ESA Vacation Pay Step-Up (s. 35.1): 4% (< 5 yrs) steps up to 6% (>= 5 yrs).
 * 3. Ontario Public Holiday Pay Formula (s. 24): regular wages in 4 weeks prior / 20.
 * 4. Ontario Statutory Severance Pay (s. 64): $2.5M payroll or 50+ layoffs, 1 wk/yr up to 26 wks.
 * 5. Contractor vs Employee Misclassification (s. 5.1 & Sagaz): 5-factor test, reverse burden.
 * 6. Pay Equity & Equal Pay for Equal Work (s. 42.1): Agency temp workers vs direct employees.
 */

import { boundedText, safeIsoDate } from './text-input.js';
import { factValue } from './kb-facts.js';

export const ESA_CONSTANTS = {
  ONTARIO_OVERTIME_THRESHOLD_WEEKLY_HOURS: 44,
  ONTARIO_OVERTIME_RATE_MULTIPLIER: 1.5,
  get ONTARIO_GENERAL_MINIMUM_WAGE_HOURLY() { return factValue('ca.ontario.generalMinimumWageCad'); },

  ONTARIO_VACATION_PAY_UNDER_5_YEARS_PERCENT: 0.04, // 4% (2 weeks)
  ONTARIO_VACATION_PAY_5_YEARS_OR_MORE_PERCENT: 0.06, // 6% (3 weeks)
  ONTARIO_VACATION_STEP_UP_YEARS_THRESHOLD: 5,

  ONTARIO_SEVERANCE_PAYROLL_THRESHOLD_CAD: 2500000, // $2.5 Million
  ONTARIO_SEVERANCE_MASS_LAYOFF_THRESHOLD: 50,
  ONTARIO_SEVERANCE_MINIMUM_SERVICE_YEARS: 5,
  ONTARIO_SEVERANCE_MAX_WEEKS: 26,

  ONTARIO_PUBLIC_HOLIDAY_DIVISOR: 20
};

/**
 * Calculates Ontario Overtime Pay and Audits Overtime Averaging Agreements
 */
export function calculateOntarioOvertimePay(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    hourlyRateCad = 25,
    weeklyHoursWorked = 52,
    hasAveragingAgreement = false,
    averagingPeriodWeeks = 1,
    hasMinistryApproval = false,
    assessmentDate
  } = safeParams;
  const cleanEmployee = boundedText(employeeName, 'Employee', 100);
  const safeDate = safeIsoDate(assessmentDate);

  const rawHourly = Number.isFinite(Number(hourlyRateCad)) ? Math.max(0, Math.min(100000, Number(hourlyRateCad))) : 25;
  const rawHours = Number.isFinite(Number(weeklyHoursWorked)) ? Math.max(0, Math.min(168, Number(weeklyHoursWorked))) : 52;
  const rawWeeks = Number.isFinite(Number(averagingPeriodWeeks)) ? Math.max(1, Math.min(52, Math.floor(Number(averagingPeriodWeeks)))) : 1;

  const standardThreshold = ESA_CONSTANTS.ONTARIO_OVERTIME_THRESHOLD_WEEKLY_HOURS;
  const regularRate = Math.max(rawHourly, ESA_CONSTANTS.ONTARIO_GENERAL_MINIMUM_WAGE_HOURLY);
  const overtimeRate = regularRate * ESA_CONSTANTS.ONTARIO_OVERTIME_RATE_MULTIPLIER;

  let overtimeHours = 0;
  let regularHours = 0;

  if (hasAveragingAgreement && rawWeeks > 1) {
    const totalAveragingThreshold = standardThreshold * rawWeeks;
    // Overtime occurs when total hours across averaging period exceed 44 * weeks
    const totalHoursInPeriod = rawHours * rawWeeks;
    const totalOvertime = Math.max(0, totalHoursInPeriod - totalAveragingThreshold);
    overtimeHours = totalOvertime / rawWeeks;
    regularHours = rawHours - overtimeHours;
  } else {
    regularHours = Math.min(rawHours, standardThreshold);
    overtimeHours = Math.max(0, rawHours - standardThreshold);
  }

  const regularPayCad = regularHours * regularRate;
  const overtimePayCad = overtimeHours * overtimeRate;
  const totalWeeklyPayCad = regularPayCad + overtimePayCad;

  const warnings = [];
  if (hasAveragingAgreement && rawWeeks > 4 && !hasMinistryApproval) {
    warnings.push('Averaging agreements spanning more than 4 weeks require approval from the Director of Employment Standards under ESA s. 22(2).');
  }
  if (rawHourly < ESA_CONSTANTS.ONTARIO_GENERAL_MINIMUM_WAGE_HOURLY) {
    warnings.push(`Hourly wage ($${rawHourly}) is below Ontario minimum wage ($${ESA_CONSTANTS.ONTARIO_GENERAL_MINIMUM_WAGE_HOURLY}/hr). Wage shortfall must be remedied.`);
  }

  return {
    employeeName: cleanEmployee,
    assessmentDate: safeDate,
    statutoryBasis: 'Employment Standards Act, 2000 (ESA), s. 22',
    hourlyRateCad: regularRate,
    overtimeRateCad: overtimeRate,
    standardWeeklyThresholdHours: standardThreshold,
    regularHours,
    overtimeHours,
    regularPayCad: Math.round(regularPayCad * 100) / 100,
    overtimePayCad: Math.round(overtimePayCad * 100) / 100,
    totalWeeklyPayCad: Math.round(totalWeeklyPayCad * 100) / 100,
    warnings
  };
}

/**
 * Calculates Ontario Vacation Pay Step-Up under ESA s. 35.1
 */
export function calculateVacationPayStepUp(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    grossEarningsCad = 60000,
    yearsOfService = 5.2
  } = safeParams;
  const cleanEmployee = boundedText(employeeName, 'Employee', 100);
  const rawEarnings = Number.isFinite(Number(grossEarningsCad)) ? Math.max(0, Math.min(100000000, Number(grossEarningsCad))) : 0;
  const rawYears = Number.isFinite(Number(yearsOfService)) ? Math.max(0, Math.min(60, Number(yearsOfService))) : 0;

  const isEligibleFor6Percent = rawYears >= ESA_CONSTANTS.ONTARIO_VACATION_STEP_UP_YEARS_THRESHOLD;
  const applicableRatePercent = isEligibleFor6Percent
    ? ESA_CONSTANTS.ONTARIO_VACATION_PAY_5_YEARS_OR_MORE_PERCENT
    : ESA_CONSTANTS.ONTARIO_VACATION_PAY_UNDER_5_YEARS_PERCENT;

  const entitlementWeeks = isEligibleFor6Percent ? 3 : 2;
  const statutoryVacationPayCad = Math.round(rawEarnings * applicableRatePercent * 100) / 100;

  // Calculate underpayment if employer only paid 4% to an employee with 5+ years
  let potentialUnderpaymentCad = 0;
  if (isEligibleFor6Percent) {
    const defaultFourPercentPay = rawEarnings * ESA_CONSTANTS.ONTARIO_VACATION_PAY_UNDER_5_YEARS_PERCENT;
    potentialUnderpaymentCad = statutoryVacationPayCad - defaultFourPercentPay;
  }

  return {
    employeeName: cleanEmployee,
    statutoryBasis: 'Employment Standards Act, 2000 (ESA), s. 33, s. 35.1',
    yearsOfService: rawYears,
    entitlementWeeks,
    applicableRatePercent: `${applicableRatePercent * 100}%`,
    statutoryVacationPayCad,
    isStepUpTriggered: isEligibleFor6Percent,
    stepUpDeltaCad: potentialUnderpaymentCad,
    rule: isEligibleFor6Percent
      ? 'Upon completion of 5 years of employment, employees are statutorily entitled to at least 3 weeks of vacation time and 6% vacation pay. Employers failing to step up vacation pay are liable for retroactive ESA claims up to 2 years back.'
      : 'Employees with under 5 years of service are entitled to 2 weeks of vacation time and 4% vacation pay.'
  };
}

/**
 * Calculates Ontario Public Holiday Pay under ESA s. 24
 */
export function calculatePublicHolidayPay(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    wagesEarnedInPrior4WeeksCad = 3600,
    vacationPayPayableInPrior4WeeksCad = 144
  } = safeParams;
  const cleanEmployee = boundedText(employeeName, 'Employee', 100);
  const rawWages = Number.isFinite(Number(wagesEarnedInPrior4WeeksCad)) ? Math.max(0, Math.min(10000000, Number(wagesEarnedInPrior4WeeksCad))) : 0;
  const rawVacation = Number.isFinite(Number(vacationPayPayableInPrior4WeeksCad)) ? Math.max(0, Math.min(10000000, Number(vacationPayPayableInPrior4WeeksCad))) : 0;

  const totalInPrior4Weeks = rawWages + rawVacation;
  const publicHolidayPayCad = Math.round((totalInPrior4Weeks / ESA_CONSTANTS.ONTARIO_PUBLIC_HOLIDAY_DIVISOR) * 100) / 100;

  return {
    employeeName: cleanEmployee,
    statutoryBasis: 'Employment Standards Act, 2000 (ESA), s. 24(1)',
    formula: '(Regular wages earned in 4 work weeks prior + vacation pay payable) / 20',
    wagesInPrior4WeeksCad: rawWages,
    vacationPayInPrior4WeeksCad: rawVacation,
    statutoryHolidayPayCad: publicHolidayPayCad,
    rules: [
      'First and Last Rule: Employee must work their entire regularly scheduled shift before and after the holiday unless they had reasonable cause for failure to perform work (ESA s. 26).',
      'If employee works on the public holiday, employer must either pay premium pay (1.5x regular rate) plus regular holiday pay, OR pay regular rate for hours worked plus provide a substitute day off with holiday pay (ESA s. 27).'
    ]
  };
}

/**
 * Evaluates Ontario ESA Statutory Severance Pay under s. 64 ($2.5M payroll / 50+ layoffs)
 */
export function evaluateEsaStatutorySeverance(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    employerName = 'Employer',
    yearsOfContinuousService = 6.5,
    regularWeeklyWagesCad = 1200,
    employerOntarioPayrollCad = 3000000,
    permanentLayoffCountIn6Months = 0
  } = safeParams;
  const cleanEmployee = boundedText(employeeName, 'Employee', 100);
  const cleanEmployer = boundedText(employerName, 'Employer', 120);

  const rawService = Number.isFinite(Number(yearsOfContinuousService)) ? Math.max(0, Math.min(60, Number(yearsOfContinuousService))) : 0;
  const rawWages = Number.isFinite(Number(regularWeeklyWagesCad)) ? Math.max(0, Math.min(100000, Number(regularWeeklyWagesCad))) : 0;
  const rawPayroll = Number.isFinite(Number(employerOntarioPayrollCad)) ? Math.max(0, Math.min(1000000000, Number(employerOntarioPayrollCad))) : 0;
  const rawLayoffs = Number.isFinite(Number(permanentLayoffCountIn6Months)) ? Math.max(0, Math.min(100000, Math.floor(Number(permanentLayoffCountIn6Months)))) : 0;

  const meetsPayrollThreshold = rawPayroll >= ESA_CONSTANTS.ONTARIO_SEVERANCE_PAYROLL_THRESHOLD_CAD;
  const meetsMassLayoffThreshold = rawLayoffs >= ESA_CONSTANTS.ONTARIO_SEVERANCE_MASS_LAYOFF_THRESHOLD;
  const meetsServiceThreshold = rawService >= ESA_CONSTANTS.ONTARIO_SEVERANCE_MINIMUM_SERVICE_YEARS;

  const qualifiesForSeverance = meetsServiceThreshold && (meetsPayrollThreshold || meetsMassLayoffThreshold);

  // Severance formula: 1 week per completed year of employment + (completed months / 12)
  const severanceWeeks = Math.min(rawService, ESA_CONSTANTS.ONTARIO_SEVERANCE_MAX_WEEKS);
  const severancePayCad = qualifiesForSeverance ? Math.round(severanceWeeks * rawWages * 100) / 100 : 0;

  const disqualificationReasons = [];
  if (!meetsServiceThreshold) {
    disqualificationReasons.push(`Employee service (${rawService} years) is less than the 5-year statutory minimum under ESA s. 64(1).`);
  }
  if (!meetsPayrollThreshold && !meetsMassLayoffThreshold) {
    disqualificationReasons.push(`Employer Ontario payroll ($${rawPayroll.toLocaleString()}) is below the $2.5M threshold, and layoff count (${rawLayoffs}) is below 50 employees.`);
  }

  return {
    employeeName: cleanEmployee,
    employerName: cleanEmployer,
    statutoryBasis: 'Employment Standards Act, 2000 (ESA), s. 64, s. 65',
    qualifiesForSeverance,
    severanceWeeks: qualifiesForSeverance ? Math.round(severanceWeeks * 10) / 10 : 0,
    statutorySeverancePayCad: severancePayCad,
    meetsPayrollThreshold,
    meetsServiceThreshold,
    disqualificationReasons,
    criticalDistinction: 'CRITICAL: ESA Statutory Severance Pay (s. 64) is completely SEPARATE from and IN ADDITION TO statutory Notice of Termination / Pay in Lieu of Notice (s. 57). An employee with 6.5 years of service is entitled to 6 weeks of termination notice PLUS 6.5 weeks of statutory severance pay.'
  };
}

/**
 * Audits Contractor vs Employee Misclassification under ESA s. 5.1 & Sagaz Test
 */
export function auditContractorMisclassification(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    workerName = 'Worker',
    employerName = 'Employer',
    hasControlOverSchedule = false, // false = employer sets hours
    ownsToolsAndEquipment = false, // false = employer provides laptop/tools
    hasSubcontractingRights = false, // false = must perform work personally
    bearsFinancialRiskOfLoss = false, // false = fixed hourly/salary rate
    isIntegratedIntoBusiness = true // true = wears uniform, represents business
  } = safeParams;
  const cleanWorker = boundedText(workerName, 'Worker', 100);
  const cleanEmployer = boundedText(employerName, 'Employer', 120);

  let employeeScore = 0;
  const factors = [];

  // Factor 1: Control
  if (!hasControlOverSchedule) {
    employeeScore += 25;
    factors.push('Employer dictates hours, location, and supervision of work (Indicates Employee status).');
  } else {
    factors.push('Worker controls own schedule and execution of tasks (Indicates Independent Contractor).');
  }

  // Factor 2: Ownership of Tools
  if (!ownsToolsAndEquipment) {
    employeeScore += 20;
    factors.push('Employer supplies primary tools, software, or specialized equipment (Indicates Employee status).');
  } else {
    factors.push('Worker invests in and maintains own capital equipment.');
  }

  // Factor 3: Subcontracting
  if (!hasSubcontractingRights) {
    employeeScore += 20;
    factors.push('Worker cannot hire replacements or delegate work (Strict personal service requirement indicates Employee).');
  } else {
    factors.push('Worker is contractually permitted to hire assistants or substitutes.');
  }

  // Factor 4: Financial Risk & Profit
  if (!bearsFinancialRiskOfLoss) {
    employeeScore += 20;
    factors.push('Worker receives fixed pay with zero risk of capital loss (Indicates Employee status).');
  } else {
    factors.push('Worker bears overhead expenses and possibility of financial loss.');
  }

  // Factor 5: Integration
  if (isIntegratedIntoBusiness) {
    employeeScore += 15;
    factors.push('Worker is integral to core operations, uses company email/branding (Indicates Employee status).');
  }

  const isMisclassified = employeeScore >= 50;

  return {
    workerName: cleanWorker,
    employerName: cleanEmployer,
    statutoryBasis: 'Employment Standards Act, 2000 (ESA), s. 5.1; 671122 Ontario Ltd. v. Sagaz Industries Canada Inc. [2001 SCC 59]',
    misclassificationScoreOutOf100: employeeScore,
    classificationVerdict: isMisclassified ? 'MISCLASSIFIED EMPLOYEE (ENTITLED TO ESA RIGHTS)' : 'BONA FIDE INDEPENDENT CONTRACTOR',
    isMisclassified,
    reverseBurdenOfProof: 'Under ESA s. 5.1, employers are strictly prohibited from treating an employee as an independent contractor. If a complaint is filed, the LEGAL BURDEN OF PROOF RESTS ON THE EMPLOYER to prove the worker is not an employee.',
    remediesAvailableIfMisclassified: [
      'Retroactive overtime pay under ESA s. 22.',
      'Retroactive 4% or 6% vacation pay under ESA s. 35.1.',
      'Public holiday pay for all statutory holidays worked or unworked.',
      'Statutory termination and severance pay under ESA s. 57 & s. 64.',
      'CPP and EI employer contribution back-taxes assessed by the CRA.'
    ],
    factorsAnalysis: factors
  };
}

/**
 * Audits Pay Equity & Equal Pay for Equal Work (ESA s. 42.1)
 */
export function auditEqualPayForEqualWork(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    workerName = 'Worker',
    temporaryAgencyHourlyRateCad = 18.50,
    permanentEmployeeHourlyRateCad = 24.00,
    substantiallySameWork = true,
    justifiedBySeniorityOrMerit = false
  } = safeParams;
  const cleanWorker = boundedText(workerName, 'Worker', 100);
  const rawAgency = Number.isFinite(Number(temporaryAgencyHourlyRateCad)) ? Math.max(0, Math.min(10000, Number(temporaryAgencyHourlyRateCad))) : 0;
  const rawPerm = Number.isFinite(Number(permanentEmployeeHourlyRateCad)) ? Math.max(0, Math.min(10000, Number(permanentEmployeeHourlyRateCad))) : 0;

  const wageDisparityCad = rawPerm - rawAgency;
  const isViolation = Boolean(substantiallySameWork) && wageDisparityCad > 0 && !Boolean(justifiedBySeniorityOrMerit);

  return {
    workerName: cleanWorker,
    statutoryBasis: 'Employment Standards Act, 2000 (ESA), s. 42.1 (Equal Pay for Equal Work - Employment Status)',
    temporaryAgencyHourlyRateCad: rawAgency,
    permanentEmployeeHourlyRateCad: rawPerm,
    hourlyDisparityCad: Math.max(0, wageDisparityCad),
    isEqualPayViolation: isViolation,
    legalRule: isViolation
      ? `VIOLATION: Under ESA s. 42.1, temporary help agency employees cannot be paid less than permanent full-time employees performing substantially the same work requiring the same skill, effort, and responsibility under similar working conditions. Disparity of $${wageDisparityCad.toFixed(2)}/hr is illegal.`
      : 'No statutory equal pay violation detected (either wages are equal, work differs, or differential is justified by a bona fide seniority or merit system under s. 42.1(2)).'
  };
}
