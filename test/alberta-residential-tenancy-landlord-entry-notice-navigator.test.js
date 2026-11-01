import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALBERTA_ENTRY_NOTICE_CONSTANTS,
  evaluateAlbertaLandlordEntry
} from '../src/alberta-residential-tenancy-landlord-entry-notice-navigator.js';

test('Alberta Entry Notice - Constants reflect RTA ss. 23, 24', () => {
  assert.equal(ALBERTA_ENTRY_NOTICE_CONSTANTS.MINIMUM_NOTICE_HOURS, 24);
  assert.equal(ALBERTA_ENTRY_NOTICE_CONSTANTS.EARLIEST_PERMITTED_ENTRY_HOUR, 8);
  assert.equal(ALBERTA_ENTRY_NOTICE_CONSTANTS.LATEST_PERMITTED_ENTRY_HOUR, 20);
});

test('Alberta Entry Notice - Compliant 24-hour notice on a Tuesday at 2:00 PM', () => {
  const result = evaluateAlbertaLandlordEntry({
    noticeHoursGiven: 24,
    entryPurpose: 'REPAIRS_OR_MAINTENANCE',
    entryDayOfWeek: 'Tuesday',
    entryScheduledHour: 14,
    noticeSpecifiedDateAndTime: true,
    noticeSignedByLandlord: true
  });

  assert.equal(result.isEntryPermitted, true);
  assert.equal(result.complianceStatus, 'COMPLIANT_24H_ENTRY_NOTICE');
  assert.equal(result.statutoryViolations.length, 0);
});

test('Alberta Entry Notice - Detects unlawful Sunday entry under s. 24(3)(b)', () => {
  const result = evaluateAlbertaLandlordEntry({
    noticeHoursGiven: 48,
    entryPurpose: 'INSPECTION',
    entryDayOfWeek: 'Sunday', // Prohibited on Sunday!
    entryScheduledHour: 14
  });

  assert.equal(result.isEntryPermitted, false);
  assert.equal(result.complianceStatus, 'UNLAWFUL_ENTRY_BREACH_OF_QUIET_ENJOYMENT');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ENTRY_SCHEDULED_ON_SUNDAY'));
});

test('Alberta Entry Notice - Detects entry scheduled at 9:00 PM (outside 8am-8pm window)', () => {
  const result = evaluateAlbertaLandlordEntry({
    noticeHoursGiven: 24,
    entryPurpose: 'SHOW_PROSPECTIVE_TENANTS',
    entryDayOfWeek: 'Thursday',
    entryScheduledHour: 21 // 9:00 PM!
  });

  assert.equal(result.isEntryPermitted, false);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ENTRY_SCHEDULED_OUTSIDE_STATUTORY_HOURS'));
});

test('Alberta Entry Notice - Emergency entry requires no notice under s. 23(1)(a)', () => {
  const result = evaluateAlbertaLandlordEntry({
    entryPurpose: 'EMERGENCY',
    noticeHoursGiven: 0
  });

  assert.equal(result.isEntryPermitted, true);
  assert.equal(result.complianceStatus, 'ENTRY_STATUTORILY_PERMITTED');
  assert.equal(result.statutoryViolations.length, 0);
});
