// Quality rules for knowledge-base content, shared by `npm run kb:health` and
// the test suite so every new or edited record is checked the same way.
// Rules flag problems; they never delete content.

import { assertEnglishRecord } from './language.js';

// Text that carries no checkable fact (found in the November 2026 audit).
export const FILLER_PATTERNS = [
  /Official statutory guidance regarding/i,
  /Changes were detected in official regulatory documentation/i,
  /Directrices estatutarias oficiales sobre/i
];

// Figures retired because they were replaced; they must not return as current facts.
export const RETIRED_PATTERNS = [
  /£38,700 standard/, /costs £10, remains valid/, /Climate Action Incentive Credit Application/,
  /11\.5% employer super guarantee/, /are 100% tax[-]free/, /Under Section 18b of the German Residence Act/,
  /turnover under €22,000/, /\(€69,300 annually\)/, /3 years for Master graduates/, /Temporary Graduate \(Subclass 457\)/,
  /\(2\.5% in 2024, 2025, and 2026\)/, /individuals who relocate to Canada to take up employment/,
  /Rent Pressure Zones \(RPZs, covering Dublin/, /of at least €38,000 \(or €64,000/, /Bill 175/,
  /"WP-EXT"/, /priced at €49 per calendar month/, /up to \$5,000 annually in pre-tax dollars/,
  /minimum of 6 continuous months of full-time work experience/, /TSMIT - \$73,150/
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns blocking problems for one evidence record (empty array if fine). */
export function checkRecord(record) {
  if (!record || typeof record !== 'object') return ['invalid record object'];
  const problems = [];
  const text = `${record.title || ''} ${record.summary || ''} ${record.quote || ''}`;
  try { assertEnglishRecord(record); } catch (e) { problems.push(`policy: ${e.message}`); }
  if (!/^https:\/\//.test(record.url || '')) problems.push('source URL must be https');
  if (!ISO_DATE.test(record.checkedAt || '')) problems.push('checkedAt missing or not YYYY-MM-DD');
  if (!ISO_DATE.test(record.expiresAt || '')) problems.push('expiresAt missing or not YYYY-MM-DD');
  if ((record.summary || '').length < 60) problems.push('summary too short to carry a fact');
  for (const p of FILLER_PATTERNS) if (p.test(text) && record.status !== 'rejected') problems.push(`filler text: ${p.source}`);
  for (const p of RETIRED_PATTERNS) if (p.test(text)) problems.push(`retired figure: ${p.source}`);
  return problems;
}

/** Checks a list of records, including duplicate ids. */
export function checkRecords(records) {
  if (!Array.isArray(records)) return [];
  const seen = new Set(); const issues = [];
  for (const r of records) {
    if (!r || typeof r !== 'object') {
      issues.push({ id: 'unknown', problem: 'invalid record object' });
      continue;
    }
    if (seen.has(r.id)) issues.push({ id: r.id, problem: 'duplicate id' });
    seen.add(r.id);
    for (const problem of checkRecord(r)) issues.push({ id: r.id, problem });
  }
  return issues;
}

/** Non-blocking warnings: records that need editorial attention soon. */
export function recordWarnings(record, today = new Date().toISOString().slice(0, 10), warningDays = 14) {
  if (!record || typeof record !== 'object') return [];
  const warnings = [];
  if (record.expiresAt && record.expiresAt < today) warnings.push('expired');
  else if (record.expiresAt) {
    const days = (Date.parse(record.expiresAt) - Date.parse(today)) / 86400000;
    if (days <= warningDays) warnings.push(`expires in ${Math.round(days)} days`);
  }
  if (record.status === 'approved' && record.reviewMethod !== 'editorial_review') warnings.push('approved without editorial review');
  return warnings;
}
