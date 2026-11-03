import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { KB_FACTS, factValue, factsDueForReview } from '../src/kb-facts.js';
import { checkRecord, checkRecords } from '../src/kb-quality.js';
import { healthReport, seedRecords, glossaryIssues } from '../scripts/kb-health.js';
import { pruneBackups } from '../scripts/kb-corrections-2026-11-01.js';
import { nextBatch, markRecords, reviewStatus } from '../scripts/kb-review-queue.js';
import { UK_SALARY_THRESHOLDS } from '../src/uk-skilled-worker-ilr-navigator.js';
import { requiredSettlementFunds } from '../src/proof-of-funds.js';
import { MULTI_COUNTRY_GAZETTE_CONSTANTS } from '../src/multi-country-gazette-crawler.js';
import { NB_SETTLEMENT_FUNDS_2026 } from '../src/new-brunswick-provincial-nominee-skilled-worker-navigator.js';
import { SUV_SETTLEMENT_FUNDS_2026 } from '../src/federal-start-up-visa-designated-organization-navigator.js';
import { ESA_CONSTANTS, calculateOntarioOvertimePay } from '../src/esa-wage-theft-navigator.js';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

test('every seed record passes the KB quality rules (new records are checked automatically)', () => {
  assert.deepEqual(checkRecords(seedRecords()), []);
});

test('the glossary has every language and no filler definitions', () => {
  assert.deepEqual(glossaryIssues(), []);
});

test('every tracked fact has a value, dates and an https source', () => {
  for (const [key, f] of Object.entries(KB_FACTS)) {
    assert.ok(f.value !== undefined && f.value !== null, key);
    for (const d of ['effectiveFrom', 'checkedAt', 'reviewBy']) assert.match(f[d], ISO, `${key}.${d}`);
    assert.ok(f.reviewBy > f.effectiveFrom, `${key} reviewBy must come after effectiveFrom`);
    assert.match(f.source, /^https:\/\//, key);
  }
  assert.throws(() => factValue('no.such.fact'));
  assert.deepEqual(factsDueForReview('2000-01-01'), []);
  assert.ok(factsDueForReview('2100-01-01').length === Object.keys(KB_FACTS).length);
});

test('tools read changing figures from the registry, so one edit updates all of them', () => {
  assert.equal(UK_SALARY_THRESHOLDS.STANDARD_GENERAL_FLOOR_GBP, factValue('uk.skilledWorker.generalThresholdGbp'));
  assert.equal(MULTI_COUNTRY_GAZETTE_CONSTANTS.UK_SKILLED_WORKER_GENERAL_THRESHOLD_GBP, factValue('uk.skilledWorker.generalThresholdGbp'));
  assert.equal(MULTI_COUNTRY_GAZETTE_CONSTANTS.AU_CORE_SKILLS_INCOME_THRESHOLD_AUD, factValue('au.coreSkillsIncomeThresholdAud'));
  assert.equal(MULTI_COUNTRY_GAZETTE_CONSTANTS.ESDC_LOW_WAGE_CAP_PERCENT, factValue('ca.lmia.lowWageCapPercent'));
  const funds = factValue('ca.expressEntry.settlementFundsCad');
  assert.equal(requiredSettlementFunds(1), funds[1]);
  assert.equal(requiredSettlementFunds(9), funds[7] + 2 * funds.additionalPerPerson);
  // NB/SUV constants are getter views (factTable) over the same registry row,
  // so compare by value: one registry edit must still reach every tool.
  assert.deepEqual(NB_SETTLEMENT_FUNDS_2026, funds);
  assert.deepEqual(SUV_SETTLEMENT_FUNDS_2026, funds);
  assert.equal(ESA_CONSTANTS.ONTARIO_GENERAL_MINIMUM_WAGE_HOURLY, factValue('ca.ontario.generalMinimumWageCad'));
  assert.equal(calculateOntarioOvertimePay({ hourlyRateCad: 15, weeklyHoursWorked: 40 }).hourlyRateCad, factValue('ca.ontario.generalMinimumWageCad'));
});

test('quality rules catch filler, retired figures and missing fields', () => {
  const good = { id: 'x', topic: 'housing', jurisdiction: 'ON', title: 'Ontario rent increases', url: 'https://www.ontario.ca/page/residential-rent-increases', summary: 'The Ontario rent increase guideline for 2026 is 2.1 per cent for units first occupied before 15 November 2018.', quote: 'The rent increase guideline is the maximum a landlord can raise rent.', risk: 'high', language: 'en', status: 'approved', checkedAt: '2026-11-01', expiresAt: '2027-01-31', effectiveFrom: null, effectiveTo: null, reviewBasis: 'Checked against the official page.', crawlPolicy: 'manual_only_until_access_policy_review' };
  assert.deepEqual(checkRecord(good), []);
  assert.ok(checkRecord({ ...good, summary: 'Official statutory guidance regarding rent under established housing frameworks for everyone.' }).some(p => p.startsWith('filler')));
  assert.ok(checkRecord({ ...good, summary: `${good.summary} The fee costs £10, remains valid for two years.` }).some(p => p.startsWith('retired')));
  assert.ok(checkRecord({ ...good, url: 'http://example.org' }).some(p => p.includes('https')));
  assert.ok(checkRecords([good, good]).some(i => i.problem === 'duplicate id'));
});

test('health report runs without a database and reports no blocking problems', () => {
  const report = healthReport({ dbPath: join(tmpdir(), 'no-such-northstar.sqlite') });
  assert.equal(report.ok, true);
  assert.equal(report.counts.databaseRecords, null);
});

test('review queue serves high-risk unreviewed records first and never repeats a marked record', () => {
  const rows = [
    { id: 'low-old', status: 'approved', risk: 'low', checkedAt: '2026-01-01', summary: 'Fee is 10 dollars.' },
    { id: 'high-new', status: 'approved', risk: 'high', checkedAt: '2026-10-01', summary: 'Threshold is 100.' },
    { id: 'high-old', status: 'approved', risk: 'high', checkedAt: '2026-05-01', summary: 'Threshold is 50.' },
    { id: 'reviewed', status: 'approved', risk: 'high', reviewMethod: 'editorial_review', checkedAt: '2026-01-01', summary: 'x 1' },
    { id: 'pending', status: 'pending', risk: 'high', checkedAt: '2026-01-01', summary: 'x 1' }
  ];
  const progress = { records: {} };
  assert.deepEqual(nextBatch(rows, progress, 2).map(r => r.id), ['high-old', 'high-new']);
  markRecords(progress, ['high-old', 'high-new'], 'verified', 'checked', '2026-11-02');
  assert.deepEqual(nextBatch(rows, progress, 5).map(r => r.id), ['low-old']);
  assert.deepEqual(reviewStatus(rows, progress), { total: 3, checked: 2, remaining: 1, verified: 2, corrected: 0, 'needs-human': 0 });
  assert.throws(() => markRecords(progress, ['low-old'], 'approved'));
});

test('backup pruning keeps the original and the two newest copies', () => {
  const dir = mkdtempSync(join(tmpdir(), 'kb-backups-'));
  try {
    const names = ['settlement-before-kb-audit-2026-11-01.sqlite', ...[1, 2, 3, 4].map(n => `settlement-before-kb-audit-2026-11-01-${1000 + n}.sqlite`), 'unrelated.sqlite'];
    for (const n of names) writeFileSync(join(dir, n), 'x');
    const result = pruneBackups(dir);
    const left = readdirSync(dir).sort();
    assert.deepEqual(left, ['settlement-before-kb-audit-2026-11-01-1003.sqlite', 'settlement-before-kb-audit-2026-11-01-1004.sqlite', 'settlement-before-kb-audit-2026-11-01.sqlite', 'unrelated.sqlite']);
    assert.equal(result.removed.length, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
