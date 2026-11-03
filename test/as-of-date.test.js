import test from 'node:test';
import assert from 'node:assert/strict';
import { todayIso, safeIsoDate } from '../src/text-input.js';
import { evaluateUsH1bOptStatus } from '../src/us-h1b-opt-navigator.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

// Tools assess "as of" today when no date is given; a fixed date in code made every
// countdown drift (an H-1B grace period read 14 days left when 11 remained).
function withToday(date, fn) {
  const previous = process.env.NORTHSTAR_TODAY;
  process.env.NORTHSTAR_TODAY = date;
  try { return fn(); } finally { if (previous === undefined) delete process.env.NORTHSTAR_TODAY; else process.env.NORTHSTAR_TODAY = previous; }
}

test('todayIso follows the clock, can be pinned, and ignores an invalid pin', () => {
  assert.equal(todayIso(new Date('2027-02-03T23:59:00Z')), process.env.NORTHSTAR_TODAY || '2027-02-03');
  withToday('2026-12-25', () => assert.equal(todayIso(), '2026-12-25'));
  withToday('not-a-date', () => assert.equal(todayIso(new Date('2027-01-01T00:00:00Z')), '2027-01-01'));
  withToday('2026-12-25', () => assert.equal(safeIsoDate('garbage'), '2026-12-25'));
});

test('a countdown without an explicit date is measured from today, not a date in the code', () => {
  const input = { visaStatus: 'h1b', lastDayWorkedDate: '2026-09-15' };
  withToday('2026-11-03', () => {
    const audit = evaluateUsH1bOptStatus(input).h1bGracePeriodAudit;
    assert.equal(audit.statutoryDeadlineDate, '2026-11-14');
    assert.equal(audit.daysRemaining, 11);
    assert.equal(audit.isGracePeriodActive, true);
  });
  withToday('2026-11-20', () => {
    const audit = evaluateUsH1bOptStatus(input).h1bGracePeriodAudit;
    assert.equal(audit.daysRemaining, 0);
    assert.equal(audit.isGracePeriodActive, false);
  });
  // An explicit date still wins.
  assert.equal(evaluateUsH1bOptStatus({ ...input, assessmentDate: '2026-10-31' }).h1bGracePeriodAudit.daysRemaining, 14);
});

test('the status-restoration routes pass the caller\'s assessment date to the evaluator', async () => {
  const store = openStore(':memory:');
  const server = createApp(store);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/v1/tools/canada-status-admissibility`;
  try {
    const post = await (await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: 'restoration', statusExpiredDate: '2026-03-10', assessmentDate: '2026-04-10' }) })).json();
    assert.equal(post.assessmentDate, '2026-04-10');
    const get = await (await fetch(`${base}?category=restoration&expiredDate=2026-03-10&assessmentDate=2026-04-10`)).json();
    assert.equal(get.assessmentDate, '2026-04-10');
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});
