import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CORRECTIONS, planCorrections, templateSummary } from '../scripts/kb-corrections-2026-11-01.js';
import { seeds } from '../src/knowledge.js';
import { kycRecords } from '../src/kyc-records.js';
import { globalRecords } from '../src/global-records.js';
import { insiderImmigrationRecords } from '../src/insider-immigration-records.js';
import { technicalImmigrationRecords } from '../src/technical-immigration-records.js';
import { assertEnglishRecord } from '../src/language.js';
import { pickSourceSentence, extractPolicyDelta } from '../src/realtime-extractor.js';
import { REALTIME_SOURCES } from '../src/realtime-registry.js';
import { appSource } from './app-source.js';

const seedRecords = [...seeds, ...kycRecords, ...globalRecords, ...insiderImmigrationRecords, ...technicalImmigrationRecords];

// Values the 1 November 2026 audit confirmed as outdated or wrong. They must
// not come back into the seed files through a later bulk import.
const RETIRED = [
  /£38,700 standard/, /costs £10, remains valid/, /Climate Action Incentive Credit Application/,
  /11\.5% employer super guarantee/, /are 100% tax-free/, /Under Section 18b of the German Residence Act/,
  /turnover under €22,000/, /\(€69,300 annually\)/, /3 years for Master graduates/, /Temporary Graduate \(Subclass 457\)/,
  /\(2\.5% in 2024, 2025, and 2026\)/, /individuals who relocate to Canada to take up employment/,
  /Rent Pressure Zones \(RPZs, covering Dublin/, /of at least €38,000 \(or €64,000/, /Bill 175/
];

test('KB audit follow-up: tool modules no longer carry the retired values', () => {
  const tools = ['uk-skilled-worker-ilr-navigator.js', 'pr-matrix-simulator.js', 'corridors-registry.js', 'global-visa-matrix.js',
    'multi-country-gazette-crawler.js', 'newcomer-benefits-calculator.js', 'healthcare-navigator.js', 'settlement-calendar.js',
    'multilingual-layer.js', 'pnp-navigator.js', 'new-brunswick-provincial-nominee-skilled-worker-navigator.js',
    'federal-start-up-visa-designated-organization-navigator.js'];
  for (const file of tools) {
    const text = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
    // The gazette crawler may still *recognise* old figures in incoming text,
    // so only figures stated as values (£38,700, 38700, $73,150) are retired.
    for (const pattern of [/£38,700|\b38700\b/, /\b14,?690\b/, /Bill 175/, /Climate Action Incentive Application/, /\$73,150|\b73150\b/])
      assert.doesNotMatch(text, pattern, `${file} still contains ${pattern}`);
  }
  assert.doesNotMatch(appSource(), /Bill 175/);
});

test('KB audit: retired values are absent from every seed file', () => {
  for (const file of ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js']) {
    const text = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
    for (const pattern of RETIRED) assert.doesNotMatch(text, pattern, `${file} still contains ${pattern}`);
  }
});

test('KB audit: seed files already carry every correction for records they define', () => {
  const inSeeds = new Set(seedRecords.map(r => r.id));
  const { plan, problems } = planCorrections(seedRecords);
  const pending = plan.filter(p => p.kind === 'correct' && inSeeds.has(p.id)).map(p => p.id);
  assert.deepEqual(pending, []);
  assert.deepEqual(problems.filter(p => !p.endsWith('not in database')), []);
});

test('KB audit: every correction names a source and passes the English record policy', () => {
  for (const c of CORRECTIONS) {
    assert.ok(c.sources.length && c.sources.every(u => u.startsWith('https://')), c.id);
    assert.ok(c.note.length > 20, c.id);
  }
  const sample = { ...seedRecords.find(r => r.id === 'cra-moving-expenses-relocation-deduction') };
  const { plan } = planCorrections([sample]);
  for (const p of plan) assertEnglishRecord(p.next);
});

test('KB audit: country template text makes no unverified agency or province claims', () => {
  const text = templateSummary('Tuvalu');
  assert.match(text, /Tuvalu/);
  assert.match(text, /already been approved to immigrate/);
  assert.doesNotMatch(text, /Ontario|British Columbia|S\.U\.C\.C\.E\.S\.S|CIIP/);
});

test('Crawler change notices quote a readable sentence and never quote markup', () => {
  assert.equal(pickSourceSentence('<main>Vancouver TransLink adult single fare is $3.40 effective January 1, 2027.</main>'),
    'Vancouver TransLink adult single fare is $3.40 effective January 1, 2027.');
  assert.equal(pickSourceSentence('Newsroom =2020-08-09&pick=100" href="https://api.io.canada.ca/x" rel="external">IRCC news releases'), null);

  const source = REALTIME_SOURCES.find(s => s.risk !== 'high');
  const junk = extractPolicyDelta({ source, content: 'Menu =2020-08-09&pick=100" href="https://example.gc.ca/a" rel="external">More', delta: {} });
  assert.equal(junk.candidateRecord.status, 'pending', 'nothing checkable, so not published');
  assert.match(junk.candidateRecord.summary, /needs editorial review/);

  const good = extractPolicyDelta({ source, content: '<p>The adult fare is $3.40 effective January 1, 2027.</p>', delta: {} });
  assert.equal(good.candidateRecord.status, 'research_seed');
  assert.match(good.candidateRecord.summary, /The page now says: "The adult fare is \$3\.40 effective January 1, 2027\."/);
  assert.equal(good.candidateRecord.effectiveFrom, null);
});

test('KB audit: hollow crawler change notices are rejected, real records are not', () => {
  const hollow = { id: 'ca-ircc-news-8be12c8b', status: 'approved', summary: 'Official notice from IRCC regarding immigration policy. Effective date: 2026-10-31. Changes were detected in official regulatory documentation.' };
  const real = { id: 'ircc-express-entry-crs', status: 'approved', summary: 'The Express Entry Comprehensive Ranking System ranks candidates.' };
  const { plan } = planCorrections([hollow, real]);
  assert.deepEqual(plan.filter(p => p.kind === 'reject').map(p => p.id), ['ca-ircc-news-8be12c8b']);
});
