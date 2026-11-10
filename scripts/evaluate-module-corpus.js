// Reproducible diagnostics for the supplied 5,000-question corpus.
// These metrics do not establish answer correctness or independent review.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { answer } from '../src/engine.js';
import { publicEvidence } from '../src/public-evidence.js';
const datasetPath = process.argv[2] || 'scratch/extracted_questions_by_module.json';
const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
const db = new DatabaseSync(process.argv[3] || 'data/settlement.sqlite', { readOnly: true });
let records;
try {
  db.exec('BEGIN');
  records = publicEvidence(db, db.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body)));
} finally { db.close(); }
const now = new Date(), modules = {}, results = [], seen = new Set();
for (const [module, cases] of Object.entries(dataset)) {
  const counts = { total: cases.length, statuses: {}, urgentHelp: 0, errors: 0, countryScopeViolations: 0, countryLabelMismatches: 0, gapReasons: {} };
  for (const item of cases) {
    if (seen.has(item.question)) counts.repeatedQuestions = (counts.repeatedQuestions || 0) + 1;
    seen.add(item.question);
    try {
      const result = answer({ question: item.question }, records, now);
      const expectedCountry = item.country === 'Canada' ? 'CA' : item.country;
      const countryLabelMismatch = Boolean(expectedCountry && expectedCountry !== result.parsed.country);
      if (countryLabelMismatch) counts.countryLabelMismatches++;
      const scope = new Set([result.parsed.country, result.parsed.region, result.parsed.city, result.parsed.licenceCountry].filter(Boolean));
      const violations = result.sources.filter(source => !scope.has(source.jurisdiction)).map(source => source.id);
      const gapReasons = [...new Set(result.gaps.map(gap => gap.reason))];
      for (const reason of gapReasons) counts.gapReasons[reason] = (counts.gapReasons[reason] || 0) + 1;
      counts.statuses[result.status] = (counts.statuses[result.status] || 0) + 1;
      if (result.urgentHelp) counts.urgentHelp++;
      if (violations.length) counts.countryScopeViolations++;
      results.push({ id: item.id, module, question: item.question, status: result.status, country: result.parsed.country, expectedCountry, countryLabelMismatch, gapReasons, clarificationReason: result.placeClarification?.reason || null, claims: result.claims.map(claim => claim.evidenceId), urgentHelp: result.urgentHelp?.kind || null, scopeViolations: violations });
    } catch (error) { counts.errors++; results.push({ id: item.id, module, error: error.message }); }
  }
  modules[module] = counts;
  console.log(module, JSON.stringify(counts));
}
mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/module-5000-diagnostics.json', JSON.stringify({ asOf: now.toISOString(), datasetPath, total: results.length, uniqueQuestions: seen.size, limitations: 'Corpus-derived questions. Forum origin and independent correctness labels are unverified. Scope diagnostics compare sources with parsed geography and cannot detect a wrong parsed destination.', modules, results }, null, 2));
if (results.some(result => result.error || result.scopeViolations?.length)) process.exitCode = 1;
