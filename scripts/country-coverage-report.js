// Country coverage KPI report (read-only).
// Measures the coverage matrix from docs/COUNTRY_COVERAGE_ANALYSIS_2026-11-03_HI.md:
// groups (Canada / big-12 / rest), publication chains, sub-national layers,
// navigator and tool-form parallelism, IRCC dependence, language contract.
// Does not write anything; safe to run against a live database.
//   node scripts/country-coverage-report.js [--db path] [--json]
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.argv.includes('--db')
  ? process.argv[process.argv.indexOf('--db') + 1]
  : join(root, 'data', 'settlement.sqlite');
const asJson = process.argv.includes('--json');

const BIG_TWELVE = [
  'Australia', 'United States', 'United Kingdom', 'Germany', 'United Arab Emirates',
  'New Zealand', 'France', 'Ireland', 'Netherlands', 'Singapore', 'Spain', 'Sweden'
];
const CITIES = ['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'];
const CA_PROVINCE_PREFIXES = ['alberta-', 'british-columbia-', 'bc-', 'ontario-', 'manitoba-', 'saskatchewan-',
  'new-brunswick-', 'nova-scotia-', 'prince-edward-', 'pei-', 'yukon-', 'quebec-', 'queens-',
  'newfoundland-', 'atlantic-', 'nunavut-', 'northwest-', 'calgary-'];
const NON_CA_NAVIGATOR_PREFIXES = ['australia-', 'uk-', 'us-', 'usa-', 'germany-', 'uae-', 'ireland-',
  'new-zealand-', 'singapore-', 'france-', 'netherlands-', 'spain-', 'sweden-', 'global-', 'eu-',
  'multi-country-', 'pr-matrix-', 'international-', 'global-immigration-question-bank-', 'market-gap-'];

const report = {
  db: existsSync(dbPath) ? dbPath : null,
  generatedAt: new Date().toISOString(),
  note: 'Coverage comparison of docs/COUNTRY_COVERAGE_ANALYSIS_2026-11-03_HI.md section 8; lower bounds freeze the 3 November 2026 build.'
};

// Navigator and tool-form parallelism only need the source tree.
const navFiles = existsSync(join(root, 'src'))
  ? readdirSync(join(root, 'src')).filter(f => /navigator|resolver|matrix/.test(f) && f.endsWith('.js'))
  : [];
report.navigatorFiles = {
  total: navFiles.length,
  canadaProvince: navFiles.filter(f => CA_PROVINCE_PREFIXES.some(p => f.startsWith(p))).length,
  nonCa: navFiles.filter(f => NON_CA_NAVIGATOR_PREFIXES.some(p => f.startsWith(p))).length
};

if (existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const parse = (b) => { try { return JSON.parse(b); } catch { return null; } };
  const recs = db.prepare('SELECT id, body FROM records').all().map(r => ({ id: r.id, ...parse(r.body) })).filter(Boolean);
  const auditedIds = new Set(db.prepare('SELECT DISTINCT record_id FROM audits WHERE note IS NOT NULL AND reviewer IS NOT NULL').all().map(r => r.record_id));
  const publishedIds = new Set(db.prepare('SELECT DISTINCT record_id FROM publications').all().map(r => r.record_id));

  const inGroup = (r) => {
    if (r.jurisdiction === 'CA') return 'CA-federal';
    if (r.jurisdiction === 'ON') return 'ON';
    if (r.jurisdiction === 'BC') return 'BC';
    if (CITIES.includes(r.jurisdiction)) return 'cities';
    if (BIG_TWELVE.includes(r.jurisdiction)) return 'BIG-12';
    return 'rest';
  };
  const avgSum = (list) => Math.round(list.reduce((a, r) => a + (r.summary || '').length, 0) / Math.max(list.length, 1));
  const topicSet = (list) => new Set(list.map(r => r.topic).filter(Boolean));

  report.groups = {};
  for (const g of ['CA-federal', 'ON', 'BC', 'cities', 'BIG-12', 'rest']) {
    const list = recs.filter(r => inGroup(r) === g);
    report.groups[g] = {
      records: list.length,
      approved: list.filter(r => r.status === 'approved').length,
      audited: list.filter(r => auditedIds.has(r.id)).length,
      published: list.filter(r => publishedIds.has(r.id)).length,
      avgSummaryLen: avgSum(list),
      topicsPresent: topicSet(list).size
    };
  }
  const restList = recs.filter(r => inGroup(r) === 'rest');
  report.rest = {
    distinctJurisdictions: new Set(restList.map(r => r.jurisdiction)).size,
    irccOnly: restList.filter(r => /^https?:\/\/(www\.)?(canada\.ca|ircc)/.test(r.url || '')).length,
    twoOrFewer: restList.reduce((m, r) => m.set(r.jurisdiction, (m.get(r.jurisdiction) || 0) + 1), new Map())
  };
  report.rest.twoOrFewer = Object.fromEntries([...report.rest.twoOrFewer].filter(([, n]) => n <= 2));
  report.languages = Object.fromEntries([...recs.reduce((m, r) => m.set(r.language || '(none)', (m.get(r.language || '(none)') || 0) + 1), new Map())]);
  report.publicationChain = { auditedRecords: auditedIds.size, publishedRecords: publishedIds.size };
  db.close();
}

const line = (label, value) => console.log(label.padEnd(46) + value);
console.log('=== Country coverage KPI report (read-only) ===');
line('navigator files total', String(report.navigatorFiles.total));
line('navigator files Canada province-domains', String(report.navigatorFiles.canadaProvince));
line('navigator files non-Canada', String(report.navigatorFiles.nonCa));
if (report.db) {
  console.log('');
  line('records total', String(Object.values(report.groups).reduce((a, g) => a + g.records, 0)));
  for (const [g, v] of Object.entries(report.groups)) {
    line(`${g}`, `n=${v.records} audited=${v.audited} published=${v.published} avgLen=${v.avgSummaryLen} topics=${v.topicsPresent}`);
  }
  line('rest distinct countries', String(report.rest.distinctJurisdictions));
  line('rest records pointing only at IRCC/canada.ca', String(report.rest.irccOnly));
  line('publication chain (audited / published)', `${report.publicationChain.auditedRecords} / ${report.publicationChain.publishedRecords}`);
  line('languages', Object.entries(report.languages).map(([k, n]) => `${k}=${n}`).join(' '));
} else {
  console.log('(evidence database not present; source-tree metrics only — run against a seeded database for record KPIs)');
}
if (asJson) console.log(JSON.stringify(report, null, 2));
