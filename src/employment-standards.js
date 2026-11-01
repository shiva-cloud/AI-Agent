// src/employment-standards.js
// Canadian Employment Standards & Worker Misclassification Counter-Strike Engine.
// Audits true legal worker status (Employee vs Independent Contractor) against the
// Ontario Employment Standards Act, 2000 (S.O. 2000, c. 41, s. 5.3 - statutory ban on misclassification),
// BC Employment Standards Act (RSBC 1996, c. 113), and Supreme Court of Canada precedent (Sagaz Industries, 2001 SCC 59).
// Computes cumulative statutory wage theft: unpaid overtime (1.5x), mandatory 4% vacation pay,
// statutory public holiday pay, and employer CPP/EI liability recoupment.
// Pure ES module with zero npm dependencies.
import {boundedText} from './text-input.js';

export const PROVINCIAL_OVERTIME_THRESHOLDS = {
  ON: { weeklyHoursThreshold: 44, overtimeMultiplier: 1.5, statute: 'Ontario ESA 2000 s. 22' },
  BC: { weeklyHoursThreshold: 40, overtimeMultiplier: 1.5, dailyHoursThreshold: 8, statute: 'BC ESA s. 35' },
  AB: { weeklyHoursThreshold: 44, overtimeMultiplier: 1.5, dailyHoursThreshold: 8, statute: 'Alberta ESC s. 21' },
  FED: { weeklyHoursThreshold: 40, overtimeMultiplier: 1.5, statute: 'Canada Labour Code s. 169' }
};

export const STATUTORY_VACATION_PAY_RATE = 0.04; // 4% of gross earnings (equivalent to 2 weeks paid vacation)
export const EMPLOYER_CPP_RATE_2026 = 0.0595; // 5.95%
export const EMPLOYER_EI_RATE_2026 = 0.02296; // 1.4x employee rate (1.64% * 1.4)

export function auditWorkerClassificationAndWageTheft(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  let {
    province = 'ON',
    jobTitle = 'Contract Specialist',
    hourlyRateCad = 25,
    averageWeeklyHoursWorked = 50,
    weeksWorkedTotal = 52,
    contractLabelsWorkerAs = 'independent_contractor', // 'independent_contractor', 'sole_proprietorship', 'employee'
    // Common Law Sagaz Criteria
    employerSetsScheduleAndLocation = true,
    employerProvidesToolsAndLaptop = true,
    workerCannotHireSubcontractors = true,
    workerHasNoRiskOfFinancialLoss = true,
    workerWorksExclusivelyForEmployer = true,
    wasVacationPayPaid = false,
    wasOvertimePayPaid = false,
    publicHolidaysWorkedCount = 5
  } = safeOptions;
  jobTitle = boundedText(jobTitle, 'Contract Specialist');
  const normProv = String(province || 'ON').toUpperCase().trim();
  const provRules = PROVINCIAL_OVERTIME_THRESHOLDS[normProv] || PROVINCIAL_OVERTIME_THRESHOLDS.ON;
  const rate = Math.max(10, Number(hourlyRateCad) || 25);
  const weeklyHours = Math.max(1, Number(averageWeeklyHoursWorked) || 50);
  const totalWeeks = Math.max(1, Number(weeksWorkedTotal) || 52);

  // 1. Misclassification Audit (Sagaz Industries / ESA s. 5.3)
  const employeeIndicators = [];
  const contractorIndicators = [];

  if (employerSetsScheduleAndLocation) {
    employeeIndicators.push('Control: Employer controls work hours, core schedule, and physical/virtual working location.');
  } else {
    contractorIndicators.push('Autonomy: Worker independently sets their own work hours and location.');
  }

  if (employerProvidesToolsAndLaptop) {
    employeeIndicators.push('Tools: Employer supplies essential equipment, software licenses, email, and laptop.');
  } else {
    contractorIndicators.push('Tools: Worker owns and maintains their own specialized tools and commercial equipment.');
  }

  if (workerCannotHireSubcontractors) {
    employeeIndicators.push('Subcontracting: Worker must personally perform the work and cannot hire replacements or subcontractors.');
  } else {
    contractorIndicators.push('Delegation: Worker possesses unrestricted right to hire sub-contractors to execute the tasks.');
  }

  if (workerHasNoRiskOfFinancialLoss) {
    employeeIndicators.push('Financial Risk: Worker bears zero risk of business financial loss and has no capital invested.');
  } else {
    contractorIndicators.push('Financial Risk: Worker incurs overhead expenses and bears real risk of insolvency or loss.');
  }

  if (workerWorksExclusivelyForEmployer) {
    employeeIndicators.push('Integration: Worker is economically dependent and works exclusively for a single client/business.');
  } else {
    contractorIndicators.push('Market: Worker markets services openly to multiple competing commercial clients.');
  }

  const isMisclassifiedEmployee = employeeIndicators.length >= 3;
  let classificationVerdict = 'LEGITIMATE_INDEPENDENT_CONTRACTOR';

  if (contractLabelsWorkerAs !== 'employee' && isMisclassifiedEmployee) {
    classificationVerdict = 'UNLAWFUL_EMPLOYEE_MISCLASSIFICATION';
  } else if (contractLabelsWorkerAs === 'employee') {
    classificationVerdict = 'PROPERLY_CLASSIFIED_EMPLOYEE';
  }

  // 2. Wage Theft Computations if Misclassified as Contractor
  const regularHoursPerWeek = Math.min(weeklyHours, provRules.weeklyHoursThreshold);
  const overtimeHoursPerWeek = Math.max(0, weeklyHours - provRules.weeklyHoursThreshold);

  // Base gross earnings actually paid (assuming paid flat rate for all hours)
  const totalHoursWorked = weeklyHours * totalWeeks;
  const grossPayActuallyReceivedCad = totalHoursWorked * rate;

  // Unpaid Overtime: 0.5x premium on overtime hours (since 1.0x was ostensibly included in flat hourly)
  let unpaidOvertimeCad = 0;
  if (!wasOvertimePayPaid && overtimeHoursPerWeek > 0) {
    unpaidOvertimeCad = Math.round(overtimeHoursPerWeek * totalWeeks * rate * 0.5);
  }

  // Unpaid Vacation Pay (4% of all gross wages)
  let unpaidVacationPayCad = 0;
  if (!wasVacationPayPaid) {
    unpaidVacationPayCad = Math.round(grossPayActuallyReceivedCad * STATUTORY_VACATION_PAY_RATE);
  }

  // Unpaid Statutory Public Holiday Pay (avg day = regularHoursPerWeek / 5 * rate)
  const avgDayPayCad = Math.round((regularHoursPerWeek / 5) * rate);
  const unpaidHolidayPayCad = Math.round(Math.max(0, Number(publicHolidaysWorkedCount) || 0) * avgDayPayCad);

  // Employer CPP & EI Misallocation (Taxes illegally forced onto the worker or evaded)
  const employerCppLiabilityCad = Math.round(Math.min(grossPayActuallyReceivedCad, 68500) * EMPLOYER_CPP_RATE_2026);
  const employerEiLiabilityCad = Math.round(Math.min(grossPayActuallyReceivedCad, 65700) * EMPLOYER_EI_RATE_2026);
  const totalEmployerTaxesEvadedCad = employerCppLiabilityCad + employerEiLiabilityCad;

  const totalDirectWageTheftCad = unpaidOvertimeCad + unpaidVacationPayCad + unpaidHolidayPayCad;
  const totalStatutoryEmployerLiabilityCad = totalDirectWageTheftCad + totalEmployerTaxesEvadedCad;

  // 3. Official Demand Letter to Employer / Ministry of Labour Claim Draft
  const officialDemandLetter = `FORMAL NOTICE OF UNLAWFUL EMPLOYEE MISCLASSIFICATION & DEMAND FOR STATUTORY WAGE ARREARS
Date: ${new Date().toISOString().slice(0, 10)}
To: Management / Payroll Directorate, Employer
From: Worker (${jobTitle})
Re: Statutory Claim under ${provRules.statute} & Misclassification Prohibition

PLEASE TAKE FORMAL NOTICE that despite labelling our contractual relationship as an "Independent Contractor / Sole Proprietorship", under the binding common law test established by the Supreme Court of Canada in 671122 Ontario Ltd. v. Sagaz Industries Canada Inc. (2001 SCC 59) and ${normProv === 'ON' ? 'Section 5.3 of the Employment Standards Act, 2000' : 'the Employment Standards Act'}, I am as a matter of law an EMPLOYEE.

1. EVIDENCE OF EMPLOYEE STATUS:
${employeeIndicators.map((e, i) => `${i + 1}. ${e}`).join('\n')}

2. STATUTORY WAGE THEFT ARREARS CALCULATION:
Pursuant to provincial employment standards, you are statutorily indebted to me for the following unpaid wage entitlements accrued over ${totalWeeks} weeks:
- Unpaid Statutory Overtime Premium (${overtimeHoursPerWeek} hrs/wk beyond ${provRules.weeklyHoursThreshold} hrs at 1.5x): $${unpaidOvertimeCad.toLocaleString()} CAD
- Unpaid Mandatory 4% Statutory Vacation Pay: $${unpaidVacationPayCad.toLocaleString()} CAD
- Unpaid Statutory Public Holiday Pay (${publicHolidaysWorkedCount} holidays): $${unpaidHolidayPayCad.toLocaleString()} CAD
TOTAL DIRECT WAGE ARREARS OWED: $${totalDirectWageTheftCad.toLocaleString()} CAD

3. EMPLOYER TAX & STATUTORY DEDUCTION LIABILITY:
By failing to withhold and remit source deductions, the company is additionally liable to the Canada Revenue Agency (CRA) under the Income Tax Act, CPP Act, and Employment Insurance Act for unpaid employer contributions:
- Employer CPP Contribution Liability: $${employerCppLiabilityCad.toLocaleString()} CAD
- Employer EI Contribution Liability (1.4x rate): $${employerEiLiabilityCad.toLocaleString()} CAD

DEMAND FOR REMEDY:
Please remit the full statutory wage arrears of $${totalDirectWageTheftCad.toLocaleString()} CAD within fifteen (15) business days. In the absence of full settlement, I will formally file an Employment Standards Claim with the Ministry of Labour / Employment Standards Branch and request an official Ruling on Worker Status (Form CPT1) from the Canada Revenue Agency. Under Section 5.3 and Section 74 (Anti-Reprisal), any retaliatory action is strictly prohibited and subject to prosecution and administrative penalties.`;

  const statutoryAdvisories = [
    'A Contract Label Means Nothing: Just because your contract says "Independent Contractor" or you invoice via a Sole Proprietorship does NOT make you a contractor. The Ministry of Labour and courts look exclusively at operational reality (control, tools, risk of loss).',
    'Explicit Misclassification Ban (Ontario ESA s. 5.3): Ontario law explicitly prohibits employers from misclassifying employees as independent contractors. Employers who violate this face prosecution and administrative fines.',
    'CRA CPT1 Ruling: If an employer refuses to pay overtime or holiday pay, you can request an official, legally binding Ruling on Worker Status from the CRA (Form CPT1). The CRA will audit the employer and force them to pay back-taxes.',
    'Anti-Reprisal Protection (ESA s. 74): An employer CANNOT legally fire, discipline, or threaten you for asking about your statutory overtime, vacation pay, or filing an employment standards claim.'
  ];

  return {
    asOf: new Date().toISOString().slice(0, 10),
    province: normProv,
    jobTitle,
    hourlyRateCad: rate,
    classificationVerdict,
    isMisclassifiedEmployee,
    hoursSummary: {
      weeklyHoursWorked: weeklyHours,
      statutoryOvertimeThreshold: provRules.weeklyHoursThreshold,
      overtimeHoursPerWeek,
      totalWeeksWorked: totalWeeks,
      totalHoursWorked
    },
    wageTheftAudit: {
      grossPayActuallyReceivedCad,
      unpaidOvertimeCad,
      unpaidVacationPayCad,
      unpaidHolidayPayCad,
      totalDirectWageTheftCad,
      employerCppLiabilityCad,
      employerEiLiabilityCad,
      totalStatutoryEmployerLiabilityCad
    },
    commonLawFactors: {
      employeeIndicators,
      contractorIndicators,
      governingPrecedent: '671122 Ontario Ltd. v. Sagaz Industries Canada Inc. (2001 SCC 59)'
    },
    officialDemandLetter,
    statutoryAdvisories,
    statutoryAuthority: provRules.statute
  };
}
