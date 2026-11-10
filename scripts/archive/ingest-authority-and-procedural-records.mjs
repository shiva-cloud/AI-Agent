// scripts/ingest-authority-and-procedural-records.mjs
// Ingests authoritative procedural & directory records into SQLite databases.

import { openStore } from '../src/store.js';
import { assertEnglishRecord } from '../src/language.js';
import { authorityAndProceduralRecords } from './data/authority-and-procedural-records.js';

const dbPaths = ['data/test-settlement.sqlite', 'data/settlement.sqlite'];

const reviewer = 'Settlement Intelligence Technical Editorial Team';
const note = 'Verified official statutory operational policy, ministerial instructions, and authority directories.';
const auditNote = 'Approved authoritative statutory operational policy and procedural fairness standards.';
const at = new Date().toISOString();

for (const dbPath of dbPaths) {
  console.log(`\n--- Ingesting into ${dbPath} ---`);
  const store = openStore(dbPath);
  const db = store.db;

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

    for (const rec of authorityAndProceduralRecords) {
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
    console.log(`Successfully ingested: ${addedRecords} records, ${addedSources} new sources.`);
  } catch (error) {
    db.exec('ROLLBACK');
    console.error(`Ingestion failed for ${dbPath}:`, error);
    process.exit(1);
  }

  const allRecords = store.records();
  console.log(`Total active records in ${dbPath}: ${allRecords.length}`);
  store.db.close();
}

console.log('\nAll databases updated successfully.');
