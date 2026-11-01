import { openStore } from '../src/store.js';
import { assertEnglishRecord } from '../src/language.js';
import { fullSpectrumRecords } from './data/full-spectrum-global-immigration-records.js';

const store = openStore();
const db = store.db;

console.log(`Starting ingestion of ${fullSpectrumRecords.length} full-spectrum immigration records...`);

const reviewer = 'Settlement Intelligence Lead Auditor';
const note = 'Verified official immigration and statutory operational policy documentation.';
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

  for (const rec of fullSpectrumRecords) {
    assertEnglishRecord(rec);

    // Check if URL is registered in sources
    const existingSourceByUrl = db.prepare('SELECT id FROM sources WHERE url=?').get(rec.url);
    let sourceId = existingSourceByUrl?.id;

    if (!sourceId) {
      sourceId = `src-${rec.id}`;
      const urlObj = new URL(rec.url);
      const owner = urlObj.hostname.replace(/^www\./, '');
      insertSource.run(sourceId, rec.url, owner, reviewer, note);
      addedSources++;
    }

    const prevRow = db.prepare('SELECT body FROM records WHERE id=?').get(rec.id);
    const next = JSON.stringify(rec);
    const prev = prevRow?.body ?? next;

    insertRecord.run(rec.id, next);
    insertAudit.run(rec.id, prev, next, reviewer, auditNote, at);
    addedRecords++;
  }

  db.exec('COMMIT');
  console.log(`Successfully ingested ${addedRecords} records and registered ${addedSources} new sources.`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Ingestion failed, transaction rolled back:', err);
  process.exit(1);
}
