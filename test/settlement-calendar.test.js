// test/settlement-calendar.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SETTLEMENT_MILESTONES,
  calculateMilestoneDeadlines,
  generateIcsContent,
  formatIcsDate,
  formatIcsTimestamp
} from '../src/settlement-calendar.js';

test('DEFAULT_SETTLEMENT_MILESTONES spans from pre-arrival to 180 days with statutory citations', () => {
  assert.ok(DEFAULT_SETTLEMENT_MILESTONES.length >= 10);
  const first = DEFAULT_SETTLEMENT_MILESTONES[0];
  const last = DEFAULT_SETTLEMENT_MILESTONES[DEFAULT_SETTLEMENT_MILESTONES.length - 1];

  assert.equal(first.dayOffset, -30);
  assert.equal(last.dayOffset, 180);

  for (const m of DEFAULT_SETTLEMENT_MILESTONES) {
    assert.ok(m.id);
    assert.ok(m.title);
    assert.ok(m.statute);
    assert.ok(m.description);
    assert.ok(typeof m.dayOffset === 'number');
  }
});

test('calculateMilestoneDeadlines computes correct calendar dates relative to landing', () => {
  const landing = '2026-11-01';
  const calculated = calculateMilestoneDeadlines(landing);

  // Day 0 must match landing date
  const day0 = calculated.find(m => m.dayOffset === 0);
  assert.equal(day0.targetDate, '2026-11-01');

  // Day -30 must be in October 2026
  const dayMinus30 = calculated.find(m => m.dayOffset === -30);
  assert.equal(dayMinus30.targetDate, '2026-10-02');

  // Day 14 must be November 15, 2026
  const day14 = calculated.find(m => m.dayOffset === 14);
  assert.equal(day14.targetDate, '2026-11-15');

  // Day 180 must be April 30, 2027
  const day180 = calculated.find(m => m.dayOffset === 180);
  assert.equal(day180.targetDate, '2027-04-30');
});

test('formatIcsDate and formatIcsTimestamp conform to RFC 5545 format', () => {
  const d = new Date('2026-11-01T12:00:00Z');
  assert.equal(formatIcsDate(d), '20261101');
  assert.equal(formatIcsTimestamp(d), '20261101T120000Z');
});

test('generateIcsContent produces structurally valid RFC 5545 iCalendar data', () => {
  const landing = '2026-11-01';
  const ics = generateIcsContent(landing);

  assert.ok(ics.startsWith('BEGIN:VCALENDAR'), 'Must start with BEGIN:VCALENDAR');
  assert.ok(ics.includes('VERSION:2.0'), 'Must declare VERSION:2.0');
  assert.ok(ics.includes('PRODID:-//Northstar Settlement Intelligence'), 'Must declare PRODID');
  assert.ok(ics.includes('BEGIN:VEVENT'), 'Must contain VEVENT blocks');
  assert.ok(ics.includes('UID:northstar-milestone-m-0-2026-11-01@settlement.local'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261101'));
  assert.ok(ics.includes('SUMMARY:Port of Entry Landing & Goods Endorsement'));
  assert.ok(ics.includes('BEGIN:VALARM'), 'Must include reminder alarms');
  assert.ok(ics.includes('TRIGGER:-P1D'), 'Alarm must trigger 1 day prior');
  assert.ok(ics.includes('END:VCALENDAR'), 'Must end with END:VCALENDAR');
});
