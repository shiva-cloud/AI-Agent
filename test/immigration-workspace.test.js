import test from 'node:test';
import assert from 'node:assert/strict';
import { auditChecklist, auditHistory, planFamilyDeadlines, reviewChanges } from '../public/immigration-workspace.js';

test('checklist flags missing, translation and expiry issues without declaring completeness', () => {
  const result = auditChecklist({ submissionDate: '2027-02-01', documents: [{ name: 'Passport', status: 'ready', expiry: '2027-01-01' }, { name: 'Letter', status: 'translation' }] });
  assert.match(result.items[0], /Expires before/); assert.match(result.items[1], /Translation/);
  assert.match(result.summary, /does not confirm/);
  assert.throws(() => auditChecklist({ submissionDate: '2026-02-30', documents: [] }), /valid calendar/);
});
test('history detects inclusive gaps and nested overlaps without inventing uncovered dates', () => {
  const result = auditHistory({ startDate: '2026-01-01', endDate: '2026-01-31', periods: [{ label: 'Long', start: '2026-01-02', end: '2026-01-30' }, { label: 'Nested', start: '2026-01-05', end: '2026-01-10' }] });
  assert.equal(result.items.length, 3); assert.match(result.items[0], /2026-01-01 to 2026-01-01/); assert.match(result.items[1], /Overlapping/); assert.match(result.items[2], /2026-01-31/);
  assert.throws(() => auditHistory({ startDate: '2026-02-01', endDate: '2026-01-01', periods: [] }), /end must/);
});
test('family planner sorts preparation dates and catches shared deadlines', () => {
  const result = planFamilyDeadlines({ asOf: '2026-11-01', tasks: [{ person: 'A', task: 'Letter', deadline: '2026-11-20', preparationDays: 25 }, { person: 'B', task: 'Review', deadline: '2026-11-20', preparationDays: 0 }] });
  assert.match(result.items[0], /2026-10-26/); assert.match(result.items[0], /already/); assert.match(result.items[2], /collision/);
  assert.throws(() => planFamilyDeadlines({ asOf: '2026-11-01', tasks: [{ person: 'A', task: 'x', deadline: '2026-11-20', preparationDays: null }] }), /whole number/);
});
test('change review ignores identical values, rejects inherited keys and keeps input immutable', () => {
  const input = { changes: [{ field: 'address', previous: 'Old', current: 'New' }] }, before = JSON.stringify(input);
  assert.match(reviewChanges(input).items[0], /address/); assert.equal(JSON.stringify(input), before);
  assert.match(reviewChanges({ changes: [{ field: 'family', previous: 'same', current: 'same' }] }).items[0], /No differences/);
  assert.throws(() => reviewChanges({ changes: [{ field: 'constructor', previous: 'a', current: 'b' }] }), /supported/);
});
