/**
 * Alberta Employment Rest Periods & Shift Limits Navigator
 *
 * Audits daily rest intervals, inter-shift rest hours, and consecutive work day
 * limits under Alberta's Employment Standards Code, RSA 2000, c. E-9, ss. 16–19,
 * and Alta. Reg. 14/1997.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const ALBERTA_REST_PERIOD_CONSTANTS = Object.freeze({
  MANDATORY_REST_MINUTES_PER_5_HOURS: 30, // s. 18(1)
  MINIMUM_HOURS_REST_BETWEEN_SHIFTS: 8, // s. 19
  MAX_CONSECUTIVE_WORK_DAYS_WITHOUT_REST: 24, // s. 16(2)
  MANDATORY_CONSECUTIVE_REST_DAYS_AFTER_24_DAYS: 4, // s. 16(2)
  STATUTORY_AUTHORITY: 'Employment Standards Code, RSA 2000, c. E-9, ss. 16-19'
});

/**
 * Audits shift lengths, meal/rest breaks, rest between shifts, and consecutive work days under Alberta ESC.
 *
 * @param {Object} params
 * @param {number} [params.shiftDurationHours=8] - Total continuous scheduled duration of the shift
 * @param {number} [params.restBreakMinutesProvided=30] - Total minutes of rest/meal breaks provided during the shift
 * @param {boolean} [params.isBreakSplitIntoTwoPeriods=false] - Whether 30 mins was split into two 15-min breaks by agreement
 * @param {number} [params.hoursBetweenConsecutiveShifts=12] - Rest hours between the end of one shift and the start of the next
 * @param {number} [params.consecutiveWorkDaysWorked=5] - Number of consecutive calendar days worked without a full day off
 * @param {number} [params.consecutiveRestDaysProvidedAfterBlock=2] - Days of rest provided at end of work block
 * @param {boolean} [params.isManagerOrSupervisor=false] - Whether worker is in a managerial/exempt capacity (Alta. Reg. 14/1997 s. 2(1))
 * @param {boolean} [params.isUrgentAccidentOrEmergency=false] - Section 19(2) emergency life/property exception
 * @returns {Object} Comprehensive rest periods audit and compliance assessment
 */
export function auditAlbertaEmploymentRestPeriods({
  shiftDurationHours = 8,
  restBreakMinutesProvided = 30,
  isBreakSplitIntoTwoPeriods = false,
  hoursBetweenConsecutiveShifts = 12,
  consecutiveWorkDaysWorked = 5,
  consecutiveRestDaysProvidedAfterBlock = 2,
  isManagerOrSupervisor = false,
  isUrgentAccidentOrEmergency = false,
  employeeName = 'Employee',
  assessmentDate = '2026-10-31'
} = {}) {
  const cleanEmployee = boundedText(employeeName, 'Employee', 120);
  const cleanDate = safeIsoDate(assessmentDate, '2026-10-31');
  const shiftHours = Number.isFinite(Number(shiftDurationHours))
    ? Math.max(0, Math.min(24, Number(shiftDurationHours)))
    : 0;
  const breakMinutes = Number.isFinite(Number(restBreakMinutesProvided))
    ? Math.max(0, Math.min(1440, Number(restBreakMinutesProvided)))
    : 0;
  const interShiftRest = Number.isFinite(Number(hoursBetweenConsecutiveShifts))
    ? Math.max(0, Math.min(168, Number(hoursBetweenConsecutiveShifts)))
    : 0;
  const consecutiveDays = Number.isFinite(Number(consecutiveWorkDaysWorked))
    ? Math.max(0, Math.min(365, Math.floor(Number(consecutiveWorkDaysWorked))))
    : 0;
  const restDaysProvided = Number.isFinite(Number(consecutiveRestDaysProvidedAfterBlock))
    ? Math.max(0, Math.min(365, Math.floor(Number(consecutiveRestDaysProvidedAfterBlock))))
    : 0;

  // 1. Check Managerial Exemption
  if (isManagerOrSupervisor) {
    return {
      assessmentDate: cleanDate,
      employeeName: cleanEmployee,
      jurisdiction: 'ALBERTA_CANADA',
      isManagerOrSupervisor: true,
      isStatutorilyExemptFromRestProvisions: true,
      complianceStatus: 'EXEMPT_MANAGERIAL_SUPERVISORY',
      legalVerdict: 'Employee is exempt from statutory rest period requirements under Alta. Reg. 14/1997 s. 2(1) as a manager/supervisor.',
      statutoryViolations: [],
      statutoryFindings: [
        'Managers and supervisors are exempt from hours of work and rest period standards under Alta. Reg. 14/1997.'
      ],
      actionableRemedies: [],
      statutoryCitations: [
        'Employment Standards Code, RSA 2000, c. E-9',
        'Employment Standards Regulation, Alta. Reg. 14/1997, s. 2(1)'
      ]
    };
  }

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 2. Intra-Shift Rest Period Audit (s. 18): 30 mins per 5 consecutive hours worked
  const numberOf5HourBlocks = Math.floor(shiftHours / 5);
  const requiredBreakMinutes = numberOf5HourBlocks * ALBERTA_REST_PERIOD_CONSTANTS.MANDATORY_REST_MINUTES_PER_5_HOURS;
  const hasIntraShiftBreakViolation = shiftHours > 5 && breakMinutes < 30;

  if (hasIntraShiftBreakViolation) {
    statutoryViolations.push({
      rule: 'FAILURE_TO_PROVIDE_30_MINUTE_REST_PERIOD',
      statute: 'Employment Standards Code s. 18(1)',
      finding: `Shift length of ${shiftHours} hours requires at least 30 minutes of rest. Employer provided only ${breakMinutes} minute${breakMinutes === 1 ? '' : 's'}.`
    });
    actionableRemedies.push({
      action: 'MANDATE_30_MINUTE_DAILY_REST',
      remedyDescription: 'Employer must provide at least 30 minutes of rest (paid or unpaid) during or immediately following each 5 consecutive hours of work.'
    });
  }

  // 3. Inter-Shift Rest Period Audit (s. 19): At least 8 consecutive hours rest between shifts
  const hasInterShiftRestViolation = interShiftRest < ALBERTA_REST_PERIOD_CONSTANTS.MINIMUM_HOURS_REST_BETWEEN_SHIFTS && !isUrgentAccidentOrEmergency;

  if (hasInterShiftRestViolation) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_REST_BETWEEN_SHIFTS',
      statute: 'Employment Standards Code s. 19(1)',
      finding: `Provided only ${interShiftRest} hour${interShiftRest === 1 ? '' : 's'} of rest between shifts. Statute requires a minimum of 8 consecutive hours of rest between shifts.`
    });
    actionableRemedies.push({
      action: 'REVISE_SHIFT_SCHEDULE_TO_8_HOUR_GAP',
      remedyDescription: 'Ensure at least 8 full consecutive hours elapse between the end of one shift and the commencement of the subsequent shift.'
    });
  } else if (isUrgentAccidentOrEmergency && interShiftRest < ALBERTA_REST_PERIOD_CONSTANTS.MINIMUM_HOURS_REST_BETWEEN_SHIFTS) {
    riskWarnings.push({
      warningType: 'EMERGENCY_OVERRIDE_INVOKED',
      description: 'The 8-hour inter-shift rest period was curtailed due to an urgent accident or emergency under s. 19(2).'
    });
  }

  // 4. Consecutive Work Days Audit (ss. 16, 17)
  // Max 24 consecutive days without rest. After 24 days, employee MUST get 4 consecutive days off.
  let hasConsecutiveDayViolation = false;

  if (consecutiveDays > ALBERTA_REST_PERIOD_CONSTANTS.MAX_CONSECUTIVE_WORK_DAYS_WITHOUT_REST) {
    hasConsecutiveDayViolation = true;
    statutoryViolations.push({
      rule: 'EXCEEDED_24_CONSECUTIVE_WORK_DAYS',
      statute: 'Employment Standards Code s. 16(2)',
      finding: `Employee worked ${consecutiveDays} consecutive calendar days without rest. The Code strictly caps consecutive work at 24 calendar days.`
    });
    actionableRemedies.push({
      action: 'GRANT_MANDATORY_4_CONSECUTIVE_REST_DAYS',
      remedyDescription: 'Immediately release employee from work duties for at least 4 consecutive calendar days of rest pursuant to s. 16(2).'
    });
  } else if (consecutiveDays >= 21) {
    riskWarnings.push({
      warningType: 'APPROACHING_STATUTORY_CONSECUTIVE_DAY_CEILING',
      description: `Employee has worked ${consecutiveDays} consecutive days. Section 16(2) mandates 4 consecutive days off if work reaches 24 consecutive days.`
    });
  }

  // Check rest days provided after block
  if (consecutiveDays > 14 && consecutiveDays <= 24 && restDaysProvided < 3) {
    riskWarnings.push({
      warningType: 'POTENTIAL_INSUFFICIENT_CONSECUTIVE_DAYS_OFF',
      description: `For extended work cycles (e.g. 3-4 week blocks), s. 17 requires proportional consecutive rest days (3 days for 3 weeks; 4 days for 4 weeks).`
    });
  }

  let complianceStatus = 'COMPLIANT_WITH_ALBERTA_REST_STANDARDS';
  let legalVerdict = 'All shift lengths, meal breaks, inter-shift rest gaps, and consecutive work day limits comply with Alberta Employment Standards Code.';

  if (statutoryViolations.length > 0) {
    complianceStatus = 'NON_COMPLIANT_REST_STANDARDS_BREACHED';
    legalVerdict = `Employer is in statutory violation of Alberta Employment Standards Code rest period and shift scheduling requirements (${statutoryViolations.length} infraction${statutoryViolations.length === 1 ? '' : 's'}).`;
  }

  return {
    assessmentDate: cleanDate,
    employeeName: cleanEmployee,
    jurisdiction: 'ALBERTA_CANADA',
    isManagerOrSupervisor: false,
    isStatutorilyExemptFromRestProvisions: false,
    complianceStatus,
    legalVerdict,
    shiftAudit: {
      shiftDurationHours: shiftHours,
      restBreakMinutesProvided: breakMinutes,
      isBreakSplitIntoTwoPeriods,
      hasCompliantIntraShiftBreak: !hasIntraShiftBreakViolation,
      hoursBetweenConsecutiveShifts: interShiftRest,
      hasCompliantInterShiftRest: !hasInterShiftRestViolation,
      consecutiveWorkDaysWorked: consecutiveDays,
      consecutiveRestDaysProvidedAfterBlock: restDaysProvided,
      hasExceeded24DayLimit: hasConsecutiveDayViolation
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Code, RSA 2000, c. E-9, ss. 16, 17, 18, 19',
      'Employment Standards Regulation, Alta. Reg. 14/1997',
      'Alberta Labour and Immigration Employment Standards Guidance'
    ]
  };
}
