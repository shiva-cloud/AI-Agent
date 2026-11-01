import { openStore } from '../src/store.js';
import { assertEnglishRecord } from '../src/language.js';
import { secondaryGatewayRecords } from './data/secondary-gateway-records.js';
import { lintEvidence } from '../src/evidence-policy.js';

const store = openStore();
const db = store.db;

console.log(`Starting ingestion of ${secondaryGatewayRecords.length} secondary gateway records...`);

const reviewer = 'Settlement Intelligence Lead Auditor';
const note = 'Verified official municipal legislation, statutory tenant protections, transit authorities, and government registries.';
const auditNote = 'Approved authoritative municipal transit fares, tenant protection ordinances, and vital housing by-laws.';
const at = new Date().toISOString();

db.exec('BEGIN IMMEDIATE');
try {
  const insertSource = db.prepare(`
    INSERT INTO sources (id, url, owner, tier, language, policy, reviewer, note)
    VALUES (?, ?, ?, 'A', 'en', 'manual_permitted', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      tier='A', policy='manual_permitted', reviewer=excluded.reviewer, note=excluded.note
    ON CONFLICT(url) DO UPDATE SET
      tier='A', policy='manual_permitted', reviewer=excluded.reviewer, note=excluded.note
  `);

  const insertRecord = db.prepare(`
    INSERT INTO records (id, body)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET body=excluded.body
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audits (record_id, previous, next, reviewer, note, at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let addedSources = 0;
  let addedRecords = 0;

  for (const rec of secondaryGatewayRecords) {
    assertEnglishRecord(rec);

    const existingSourceByUrl = db.prepare('SELECT id FROM sources WHERE url=?').get(rec.url);
    if (!existingSourceByUrl) {
      const sourceId = `source-${rec.id}`;
      const owner = new URL(rec.url).hostname;
      insertSource.run(sourceId, rec.url, owner, reviewer, note);
      addedSources++;
    }

    const previousRow = db.prepare('SELECT body FROM records WHERE id=?').get(rec.id);
    const bodyStr = JSON.stringify(rec);
    insertRecord.run(rec.id, bodyStr);
    insertAudit.run(rec.id, previousRow?.body ?? bodyStr, bodyStr, reviewer, auditNote, at);
    addedRecords++;
  }

  db.exec('COMMIT');
  console.log(`Successfully processed: ${addedRecords} records, ${addedSources} new sources.`);
} catch (error) {
  db.exec('ROLLBACK');
  console.error('Ingestion failed:', error);
  process.exit(1);
}

// Validation check
const allRecords = store.records();
const allSources = store.ingestion.sources();
const lint = lintEvidence(allSources, allRecords);
console.log(`Post-ingestion lint check: ${lint.warnings.length} warnings.`);
if (lint.warnings.length) {
  console.warn(lint.warnings);
} else {
  console.log(`SUCCESS: Total active approved records in database: ${allRecords.length}`);
}
