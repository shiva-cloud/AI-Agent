import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_REST_PERIOD_CONSTANTS,
  auditAlbertaEmploymentRestPeriods
} from '../src/alberta-employment-rest-periods-shift-limits-navigator.js';

test('Alberta Rest Periods - Constants reflect ESC ss. 16-19', () => {
  assert.equal(ALBERTA_REST_PERIOD_CONSTANTS.MANDATORY_REST_MINUTES_PER_5_HOURS, 30);
  assert.equal(ALBERTA_REST_PERIOD_CONSTANTS.MINIMUM_HOURS_REST_BETWEEN_SHIFTS, 8);
  assert.equal(ALBERTA_REST_PERIOD_CONSTANTS.MAX_CONSECUTIVE_WORK_DAYS_WITHOUT_REST, 24);
  assert.equal(ALBERTA_REST_PERIOD_CONSTANTS.MANDATORY_CONSECUTIVE_REST_DAYS_AFTER_24_DAYS, 4);
});

test('Alberta Rest Periods - Fully compliant 8-hour shift and 12-hour rest gap', () => {
  const result = auditAlbertaEmploymentRestPeriods({
    shiftDurationHours: 8,
    restBreakMinutesProvided: 30,
    hoursBetweenConsecutiveShifts: 12,
    consecutiveWorkDaysWorked: 5,
    consecutiveRestDaysProvidedAfterBlock: 2
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_WITH_ALBERTA_REST_STANDARDS');
  assert.equal(result.shiftAudit.hasCompliantIntraShiftBreak, true);
  assert.equal(result.shiftAudit.hasCompliantInterShiftRest, true);
  assert.equal(result.shiftAudit.hasExceeded24DayLimit, false);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Alberta Rest Periods - Detects failure to provide 30-min break on 8-hour shift', () => {
  const result = auditAlbertaEmploymentRestPeriods({
    shiftDurationHours: 8,
    restBreakMinutesProvided: 15, // Only 15 mins
    hoursBetweenConsecutiveShifts: 10,
    consecutiveWorkDaysWorked: 5
  });

  assert.equal(result.complianceStatus, 'NON_COMPLIANT_REST_STANDARDS_BREACHED');
  assert.equal(result.shiftAudit.hasCompliantIntraShiftBreak, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'FAILURE_TO_PROVIDE_30_MINUTE_REST_PERIOD'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'MANDATE_30_MINUTE_DAILY_REST'));
});

test('Alberta Rest Periods - Detects illegal "clopening" shift with only 6 hours rest', () => {
  const result = auditAlbertaEmploymentRestPeriods({
    shiftDurationHours: 8,
    restBreakMinutesProvided: 30,
    hoursBetweenConsecutiveShifts: 6, // Under 8 hours!
    consecutiveWorkDaysWorked: 3
  });

  assert.equal(result.complianceStatus, 'NON_COMPLIANT_REST_STANDARDS_BREACHED');
  assert.equal(result.shiftAudit.hasCompliantInterShiftRest, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_REST_BETWEEN_SHIFTS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'REVISE_SHIFT_SCHEDULE_TO_8_HOUR_GAP'));
});

test('Alberta Rest Periods - Detects violation of 24 consecutive work days cap (s. 16(2))', () => {
  const result = auditAlbertaEmploymentRestPeriods({
    shiftDurationHours: 8,
    restBreakMinutesProvided: 30,
    hoursBetweenConsecutiveShifts: 12,
    consecutiveWorkDaysWorked: 26, // Exceeds 24!
    consecutiveRestDaysProvidedAfterBlock: 0
  });

  assert.equal(result.complianceStatus, 'NON_COMPLIANT_REST_STANDARDS_BREACHED');
  assert.equal(result.shiftAudit.hasExceeded24DayLimit, true);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'EXCEEDED_24_CONSECUTIVE_WORK_DAYS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'GRANT_MANDATORY_4_CONSECUTIVE_REST_DAYS'));
});

test('Alberta Rest Periods - Managerial employee is statutorily exempt', () => {
  const result = auditAlbertaEmploymentRestPeriods({
    isManagerOrSupervisor: true,
    shiftDurationHours: 12,
    restBreakMinutesProvided: 0,
    hoursBetweenConsecutiveShifts: 4,
    consecutiveWorkDaysWorked: 30
  });

  assert.equal(result.isStatutorilyExemptFromRestProvisions, true);
  assert.equal(result.complianceStatus, 'EXEMPT_MANAGERIAL_SUPERVISORY');
  assert.equal(result.statutoryViolations.length, 0);
});
