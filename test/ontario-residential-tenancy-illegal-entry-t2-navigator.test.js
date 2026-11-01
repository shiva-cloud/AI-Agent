import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONTARIO_T2_ENTRY_CONSTANTS,
  evaluateOntarioIllegalEntryT2
} from '../src/ontario-residential-tenancy-illegal-entry-t2-navigator.js';

test('Ontario T2 Illegal Entry - Constants reflect RTA ss. 25-27', () => {
  assert.equal(ONTARIO_T2_ENTRY_CONSTANTS.MIN_NOTICE_HOURS, 24);
  assert.equal(ONTARIO_T2_ENTRY_CONSTANTS.EARLIEST_ENTRY_HOUR, 8);
  assert.equal(ONTARIO_T2_ENTRY_CONSTANTS.LATEST_ENTRY_HOUR, 20);
  assert.equal(ONTARIO_T2_ENTRY_CONSTANTS.LIMITATION_PERIOD_YEARS, 1);
});

test('Ontario T2 Illegal Entry - Compliant entry with 24h notice at 2:00 PM', () => {
  const result = evaluateOntarioIllegalEntryT2({
    writtenNoticeGiven: true,
    noticeHoursGiven: 24,
    entryScheduledHour: 14,
    noticeSpecifiedTimeWindow: true,
    noticeStatedValidPurpose: true
  });

  assert.equal(result.isUnlawfulEntry, false);
  assert.equal(result.complianceStatus, 'COMPLIANT_LANDLORD_ENTRY');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.remedySummary.totalClaimCad, 0);
});

test('Ontario T2 Illegal Entry - Unlawful entry with only 4 hours notice at 9:00 PM', () => {
  // $2000 rent. 15% abatement = $300 + $150 locks = $450 total claim
  const result = evaluateOntarioIllegalEntryT2({
    writtenNoticeGiven: true,
    noticeHoursGiven: 4,
    entryScheduledHour: 21, // 9pm
    monthlyRentCad: 2000,
    outOfPocketExpensesCad: 150
  });

  assert.equal(result.isUnlawfulEntry, true);
  assert.equal(result.complianceStatus, 'UNLAWFUL_ENTRY_STATUTORY_BREACH');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_ADVANCE_ENTRY_NOTICE'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ENTRY_OUTSIDE_STATUTORY_HOURS'));
  assert.equal(result.remedySummary.totalClaimCad, 450);
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_LTB_FORM_T2_REMEDY_SUBMISSION'));
});

test('Ontario T2 Illegal Entry - Genuine emergency entry is statutorily exempt', () => {
  const result = evaluateOntarioIllegalEntryT2({
    isEmergencyEntry: true,
    writtenNoticeGiven: false,
    noticeHoursGiven: 0
  });

  assert.equal(result.isUnlawfulEntry, false);
  assert.equal(result.complianceStatus, 'COMPLIANT_LANDLORD_ENTRY');
  assert.equal(result.statutoryViolations.length, 0);
});
