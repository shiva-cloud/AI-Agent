import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {assertEnglishRecord} from './language.js';
import {tokenize,rankLexically,rankTokenized} from './search.js';
const hash=record=>createHash('sha256').update(JSON.stringify(record)).digest('hex');
export function openEvidenceIndex(path, options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const readOnly = Boolean(safeOptions.readOnly);
  if (typeof path !== 'string' || !path.trim()) throw new Error('Explicit index path required');
  if (!readOnly && path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { readOnly, timeout: 5000 });
  try {
    if (db.prepare("SELECT 1 FROM sqlite_master WHERE name IN ('records','jobs')").get()) throw new Error('Index must use a separate database');
    if (!readOnly) db.exec(`PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS indexed_records(id TEXT PRIMARY KEY,body_hash TEXT NOT NULL,tokens TEXT NOT NULL);
      CREATE VIRTUAL TABLE IF NOT EXISTS evidence_fts USING fts5(id UNINDEXED,tokens);`);
  } catch (error) { db.close(); throw error; }
  return {
    close: () => db.close(),
    rebuild(records) {
      const safeRecords = Array.isArray(records) ? records : [];
      const seen = new Set();
      const rows = safeRecords.map(record => {
        assertEnglishRecord(record); if (seen.has(record.id)) throw new Error('Duplicate index record'); seen.add(record.id);
        return [record.id, hash(record), tokenize(`${record.title} ${record.summary} ${record.quote} ${record.topic}`).join(' ')];
      });
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec('DELETE FROM indexed_records; DELETE FROM evidence_fts;');
        const insert = db.prepare('INSERT INTO indexed_records VALUES (?,?,?)'), fts = db.prepare('INSERT INTO evidence_fts VALUES (?,?)');
        for (const row of rows) { insert.run(...row); fts.run(row[0], row[2]); }
        db.exec('COMMIT'); return { indexed: rows.length };
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    rank(records, terms = []) {
      const safeRecords = Array.isArray(records) ? records : [];
      const safeTermsList = Array.isArray(terms) ? terms : [];
      const fallback = () => rankLexically(safeRecords, safeTermsList).map(r => ({ ...r, retrievalVersion: 'lexical-bm25-0.1' }));
      try {
        db.exec('BEGIN');
        const lookup = db.prepare('SELECT body_hash,tokens FROM indexed_records WHERE id=?'), indexed = new Map();
        for (const record of safeRecords) { const row = lookup.get(record.id); if (!row || row.body_hash !== hash(record)) { db.exec('COMMIT'); return fallback(); } indexed.set(record.id, row); }
        const safeTerms = [...new Set(safeTermsList.filter(term => typeof term === 'string' && /^[a-z0-9]+$/.test(term)))].slice(0, 100);
        const matches = safeTerms.length ? db.prepare('SELECT id,bm25(evidence_fts) AS score FROM evidence_fts WHERE evidence_fts MATCH ?').all(safeTerms.map(t => `"${t}"`).join(' OR ')) : [];
        // FTS supplies matches; rerank with the existing scope-local BM25
        // statistics. Global FTS scores change meaning across jurisdictions.
        const matchIds = new Set(matches.map(row => row.id));
        const ranked = rankTokenized(safeRecords.map(record => ({ record, words: indexed.get(record.id).tokens.split(' ') })), safeTerms)
          .map(r => ({ ...r, lexicalScore: matchIds.has(r.id) ? r.lexicalScore : 0, retrievalVersion: 'sqlite-fts5-bm25-1' }));
        db.exec('COMMIT'); return ranked;
      } catch (err) {
        console.warn('[evidence-index:fts_rank_fallback]', err.message);
        try { db.exec('ROLLBACK'); } catch (rbErr) { console.warn('[evidence-index:rollback]', rbErr.message); }
        return fallback();
      }
    }
  };
}
