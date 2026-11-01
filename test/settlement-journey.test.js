import test from 'node:test';
import assert from 'node:assert/strict';
import { IMMIGRATION_CATEGORIES, SETTLEMENT_PHASES, MASTER_MILESTONES, generateSettlementJourney } from '../src/settlement-journey.js';

test('IMMIGRATION_CATEGORIES contains key newcomer streams', () => {
  const keys = Object.keys(IMMIGRATION_CATEGORIES);
  assert.ok(keys.includes('pr_express_entry'));
  assert.ok(keys.includes('work_permit'));
  assert.ok(keys.includes('study_permit'));
  assert.ok(keys.includes('visitor_family'));
});

test('generateSettlementJourney computes statutory deadlines relative to landing date', () => {
  const roadmap = generateSettlementJourney('pr_express_entry', 'Toronto', '2026-11-01');
  assert.equal(roadmap.categoryKey, 'pr_express_entry');
  assert.equal(roadmap.city, 'Toronto');
  assert.equal(roadmap.landingDate, '2026-11-01');
  assert.ok(roadmap.totalMilestones > 8);
  assert.equal(roadmap.phases.length, SETTLEMENT_PHASES.length);

  // Check pre-departure phase calculation (-30 days from 2026-11-01 -> 2026-10-02)
  const preDeparture = roadmap.phases.find(p => p.id === 'pre_departure');
  assert.ok(preDeparture);
  assert.equal(preDeparture.targetDate, '2026-10-02');
  assert.ok(preDeparture.items.some(item => item.authority.includes('BSF186')));

  // Check first-week phase calculation (+7 days -> 2026-11-08)
  const firstWeek = roadmap.phases.find(p => p.id === 'first_week');
  assert.ok(firstWeek);
  assert.equal(firstWeek.targetDate, '2026-11-08');
  assert.ok(firstWeek.items.some(item => item.title.includes('Social Insurance Number')));
  assert.ok(firstWeek.items.some(item => item.authority.includes('Bank Act s.627.17')));
});

test('generateSettlementJourney filters milestones by stream eligibility', () => {
  const studentRoadmap = generateSettlementJourney('study_permit', 'Vancouver', '2026-09-01');
  const visitorRoadmap = generateSettlementJourney('visitor_family', 'Calgary', '2026-09-01');

  // Students get SIN & banking, but visitors cannot get SIN
  assert.ok(studentRoadmap.totalMilestones > visitorRoadmap.totalMilestones);
  const visitorItems = visitorRoadmap.phases.flatMap(p => p.items);
  assert.ok(!visitorItems.some(i => i.category === 'identity' && i.title.includes('Social Insurance Number')));
  assert.ok(visitorItems.some(i => i.category === 'customs' && i.title.includes('$10,000')));
});
