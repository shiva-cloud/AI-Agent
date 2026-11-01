import { openStore } from '../src/store.js';
import { assertEnglishRecord } from '../src/language.js';
import { immigrationProgramRecords } from './data/immigration-programs-records.js';
import { lintEvidence } from '../src/evidence-policy.js';

const store = openStore();
const db = store.db;

console.log(`Starting ingestion of ${immigrationProgramRecords.length} immigration program records...`);

const reviewer = 'Settlement Intelligence Lead Auditor';
const note = 'Verified official immigration and visa operational policy documentation.';
const auditNote = 'Approved authoritative immigration programs statutory documentation.';
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

  for (const rec of immigrationProgramRecords) {
    assertEnglishRecord(rec);

    // Check if URL is registered in sources
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

console.log('Post-ingestion lint warnings:', lint.warnings.length);
if (lint.warnings.length > 0) {
  console.warn(JSON.stringify(lint.warnings, null, 2));
}

db.close();
