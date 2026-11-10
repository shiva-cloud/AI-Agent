import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicEvidence } from '../src/public-evidence.js';
import { evaluate } from '../src/evaluation.js';

export function validateReviewedDataset(dataset) {
  const nonempty = value => typeof value === 'string' && value.trim().length > 0;
  if (!dataset || !nonempty(dataset.version) || !nonempty(dataset.author) ||
      !nonempty(dataset.reviewer) || dataset.author.trim() === dataset.reviewer.trim() ||
      dataset.reviewStatus !== 'approved' || !nonempty(dataset.reviewNote) ||
      !Number.isFinite(Date.parse(dataset.reviewedAt)) || !Number.isFinite(Date.parse(dataset.asOf)) ||
      !/^[a-f0-9]{64}$/.test(dataset.evidenceDigest || '')) throw new Error('Independent review metadata is incomplete');
  if (!Array.isArray(dataset.cases) || !dataset.cases.length) throw new Error('Reviewed cases are required');
  const ids = new Set();
  for (const item of dataset.cases) {
    if (!item || !nonempty(item.id) || ids.has(item.id) || !nonempty(item.question) ||
        !Array.isArray(item.intents) || !item.intents.every(nonempty) ||
        !(item.city === null || nonempty(item.city)) ||
        !['guidance', 'partial', 'unavailable', 'clarification'].includes(item.status) ||
        !nonempty(item.reviewRationale) || !Array.isArray(item.sourceUrls) || !item.sourceUrls.length ||
        !item.sourceUrls.every(url => { try { return new URL(url).protocol === 'https:'; } catch { return false; } })) {
      throw new Error('Invalid or duplicate reviewed case');
    }
    ids.add(item.id);
  }
}

export function evaluateReviewed(dataset, dbPath) {
  validateReviewedDataset(dataset);
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    db.exec('BEGIN');
    const records = db.prepare('SELECT body FROM records ORDER BY id').all().map(row => JSON.parse(row.body));
    const visible = publicEvidence(db, records);
    const digest = createHash('sha256').update(JSON.stringify(visible)).digest('hex');
    if (digest !== dataset.evidenceDigest) throw new Error('Reviewed evidence digest does not match the packaged public corpus');
    const report = evaluate(dataset, visible);
    return { ...report, evidenceDigest: digest, reviewer: dataset.reviewer,
      limitations: 'Results compare the engine with supplied reviewed labels. Reviewer identity and independence are attestations that must be verified by the release owner. Coverage is limited to the submitted cases.' };
  } finally { db.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [datasetPath, dbPath] = process.argv.slice(2);
  if (!datasetPath || !dbPath) throw new Error('Usage: evaluate-reviewed.js dataset.json evidence.sqlite');
  const report = evaluateReviewed(JSON.parse(readFileSync(datasetPath, 'utf8')), dbPath);
  console.log(JSON.stringify(report, null, 2));
  if (report.failures.length) process.exitCode = 1;
}
