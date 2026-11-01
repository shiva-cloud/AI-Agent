import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStatutoryTimeline } from '../src/timeline-calendar-sync.js';

test('Timeline Calendar Sync — Generates RFC 5545 compliant work permit alerts', () => {
  const result = evaluateStatutoryTimeline({
    milestoneType: 'work_permit_expiry',
    anchorDate: '2026-12-31',
    applicantName: 'Harpreet Singh'
  });

  assert.equal(result.totalEventsGenerated, 5);
  assert.ok(result.icsContent.includes('BEGIN:VCALENDAR'));
  assert.ok(result.icsContent.includes('END:VCALENDAR'));
  assert.ok(result.icsContent.includes('IRPR s. 182'));
  assert.ok(result.icsContent.includes('VALARM'));
});

test('Timeline Calendar Sync — Generates Arrival settlement milestones and tax deadline', () => {
  const result = evaluateStatutoryTimeline({
    milestoneType: 'arrival_date',
    anchorDate: '2026-05-15'
  });

  assert.ok(result.totalEventsGenerated >= 4);
  const titles = result.events.map(e => e.title);
  assert.ok(titles.some(t => t.includes('SIN')));
  assert.ok(titles.some(t => t.includes('OHIP')));
  assert.ok(titles.some(t => t.includes('Tax Return')));
});

test('Timeline Calendar Sync — Generates PR landing Citizenship Act s. 5 milestone', () => {
  const result = evaluateStatutoryTimeline({
    milestoneType: 'pr_landing',
    anchorDate: '2026-01-01'
  });

  assert.equal(result.totalEventsGenerated, 2);
  assert.ok(result.events[0].title.includes('Citizenship'));
  assert.ok(result.events[0].description.includes('1,095 days'));
});
