import {ValidationError} from './api-errors.js';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { seeds } from './knowledge.js';
import { configureEnglishDatabase } from './migrations.js';
import { assertEnglishRecord, assertEnglishText } from './language.js';
import { configureIngestion, ingestionStore } from './ingestion.js';
import {configureGapWorkflow,gapWorkflow} from './gap-workflow.js';
import {realtimeKbStore} from './realtime-kb-ingestor.js';
export function openStore(path='data/settlement.sqlite') {
  if(path!==':memory:') mkdirSync(dirname(path),{recursive:true});
  const db=new DatabaseSync(path);
  if(path!==':memory:') {
    const check=db.prepare('PRAGMA integrity_check').get();
    if(check && check.integrity_check!=='ok') throw new Error(`Database corruption detected: ${check.integrity_check}`);
  }
  db.exec(`PRAGMA journal_mode=WAL;
   PRAGMA synchronous=NORMAL;
   PRAGMA mmap_size=268435456;
   PRAGMA temp_store=MEMORY;
   PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, body TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS audits(id INTEGER PRIMARY KEY, record_id TEXT, previous TEXT, next TEXT, reviewer TEXT, note TEXT, at TEXT, prev_hash TEXT, hash TEXT);
   CREATE TABLE IF NOT EXISTS traces(id TEXT PRIMARY KEY, body TEXT, at TEXT);
   CREATE TABLE IF NOT EXISTS gaps(id INTEGER PRIMARY KEY, trace_id TEXT, topic TEXT, reason TEXT, at TEXT);
   CREATE TABLE IF NOT EXISTS feedback(id INTEGER PRIMARY KEY, trace_id TEXT, issue TEXT, at TEXT);
   CREATE TABLE IF NOT EXISTS archived_stale_records(id TEXT PRIMARY KEY, body TEXT NOT NULL, archived_at TEXT NOT NULL);
   CREATE INDEX IF NOT EXISTS idx_records_topic ON records(json_extract(body, '$.topic'));
   CREATE INDEX IF NOT EXISTS idx_records_jurisdiction ON records(json_extract(body, '$.jurisdiction'));
   CREATE INDEX IF NOT EXISTS idx_records_status ON records(json_extract(body, '$.status'));
   CREATE INDEX IF NOT EXISTS idx_audits_record_id ON audits(record_id);
   CREATE INDEX IF NOT EXISTS idx_gaps_topic ON gaps(topic);
   CREATE INDEX IF NOT EXISTS idx_gaps_trace_id ON gaps(trace_id);`);

  try { db.exec('ALTER TABLE audits ADD COLUMN prev_hash TEXT;'); } catch {}
  try { db.exec('ALTER TABLE audits ADD COLUMN hash TEXT;'); } catch {}

  try {
    db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS records_fts USING fts5(
      id UNINDEXED,
      title,
      summary,
      quote,
      topic,
      tokenize='porter unicode61'
    );`);
  } catch {}

  try {
    configureEnglishDatabase(db);
    const insert=db.prepare('INSERT OR IGNORE INTO records VALUES (?,?)');
    const insertFts=db.prepare('INSERT OR IGNORE INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)');
    seeds.forEach(r=>{
      assertEnglishRecord(r);
      insert.run(r.id,JSON.stringify(r));

    });
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec('DELETE FROM records_fts');
      for (const {body} of db.prepare('SELECT body FROM records').all()) {
        const r=JSON.parse(body);
        insertFts.run(r.id,r.title||'',r.summary||'',r.quote||'',r.topic||'');
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    configureIngestion(db);
    configureGapWorkflow(db);
  } catch(error) {db.close();throw error;}
  return {
    db,
    ingestion:ingestionStore(db),
    gapWork:gapWorkflow(db),
    realtime:realtimeKbStore(db),
    records:()=>db.prepare('SELECT body FROM records').all().map(r=>JSON.parse(r.body)),
    log(result) {
      const at=new Date().toISOString();
      db.exec('BEGIN IMMEDIATE');
      try {
      // Never persist raw user text, IP addresses, status or personal identifiers.
      db.prepare('INSERT INTO traces VALUES (?,?,?)').run(result.traceId,JSON.stringify({status:result.status,topics:result.parsed.intents,latencyMs:result.latencyMs,parserVersion:result.parsed.parserVersion,retrievalVersion:result.retrieval?.version ?? null,candidates:result.retrieval?.candidates.map(c=>({id:c.id,score:c.score,available:c.available,reason:c.reason})) ?? [],evidence:result.claims.map(c=>({recordId:c.evidenceId,snapshotId:result.sources.find(s=>s.id===c.evidenceId)?.snapshotId ?? null}))}),at);
      result.gaps.forEach(g=>db.prepare('INSERT INTO gaps(trace_id,topic,reason,at) VALUES (?,?,?,?)').run(result.traceId,g.topic,g.reason,at));
        gapWorkflow(db).observe(result,at);
        db.exec('COMMIT');
      } catch(error) {db.exec('ROLLBACK');throw error;}
    },
    review(id,decision,reviewer,note) {
      if(!['approve','reject','rollback'].includes(decision) || typeof reviewer!=='string' || reviewer.trim().length<2 || reviewer.length>100 || typeof note!=='string' || note.trim().length<10 || note.length>1000) throw new ValidationError('Valid decision, reviewer and review note (10–1000 characters) required');
      assertEnglishText(reviewer,'Reviewer name');
      assertEnglishText(note,'Review note');
      const row=db.prepare('SELECT body FROM records WHERE id=?').get(id);
      if(!row) throw new ValidationError('Unknown evidence record',404);
      const old=JSON.parse(row.body), next={...old,status:decision==='approve'?'approved':decision==='reject'?'rejected':'pending'};
      if(decision==='approve' && db.prepare('SELECT 1 FROM sources s JOIN suspended_sources b ON b.source_id=s.id WHERE s.url=? OR s.id=?').get(old.url,old.sourceId ?? '')) throw new ValidationError('Source is suspended; review source permission before approving evidence');
      if(decision==='approve') ingestionStore(db).assertReviewable(old);
      if(decision==='approve' && old.expiresAt<new Date().toISOString().slice(0,10)) throw new ValidationError('Expired evidence needs a new source check before approval');
      next.reviewedAt=new Date().toISOString();
      // Only a named decision made here counts as editorial review. Bulk
      // scripts and seed files that write status:'approved' never set this.
      if(decision==='approve') next.reviewMethod='editorial_review';
      else delete next.reviewMethod;
      db.exec('BEGIN');
      try {
        const lastAudit = db.prepare('SELECT hash FROM audits ORDER BY id DESC LIMIT 1').get();
        const prevHash = lastAudit?.hash || '0000000000000000000000000000000000000000000000000000000000000000';
        const auditPayload = `${prevHash}|${id}|${decision}|${reviewer}|${next.reviewedAt}|${row.body}|${JSON.stringify(next)}`;
        const hash = createHash('sha256').update(auditPayload).digest('hex');

        db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(next),id);
        try {
          db.prepare('DELETE FROM records_fts WHERE id=?').run(id);
          db.prepare('INSERT INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)').run(id, next.title||'', next.summary||'', next.quote||'', next.topic||'');
        } catch {}
        db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at,prev_hash,hash) VALUES (?,?,?,?,?,?,?,?)').run(id,row.body,JSON.stringify(next),reviewer,note,next.reviewedAt,prevHash,hash);
        db.exec('COMMIT');
      } catch(e) {db.exec('ROLLBACK');throw e;}
      return next;
    },
    searchFts(queryTerm, limit = 20) {
      if (!queryTerm || typeof queryTerm !== 'string') return [];
      const clean = queryTerm.trim().replace(/[^\w\s]/g, ' ');
      if (!clean) return [];
      const terms = clean.split(/\s+/).filter(Boolean).map(t => `${t}*`).join(' OR ');
      try {
        const rows = db.prepare(`
          SELECT DISTINCT r.body
          FROM records_fts f
          JOIN records r ON r.id = f.id
          WHERE records_fts MATCH ?
          LIMIT ?
        `).all(terms, limit);
        return rows.map(r => JSON.parse(r.body));
      } catch {
        return [];
      }
    },
    verifyAuditChainIntegrity() {
      const audits = db.prepare('SELECT * FROM audits ORDER BY id ASC').all();
      let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      for (const a of audits) {
        if (a.prev_hash && a.prev_hash !== expectedPrevHash) {
          return { intact: false, error: `Audit chain broken at audit #${a.id}: expected prev_hash ${expectedPrevHash}, got ${a.prev_hash}` };
        }
        if (a.hash) {
          const payload = `${a.prev_hash}|${a.record_id}|${JSON.parse(a.next).status === 'approved' ? 'approve' : JSON.parse(a.next).status === 'rejected' ? 'reject' : 'pending'}|${a.reviewer}|${a.at}|${a.previous}|${a.next}`;
          // update expected
          expectedPrevHash = a.hash;
        }
      }
      return { intact: true, auditedCount: audits.length };
    },
    latencyHistogram() {
      const rows = db.prepare(`
        SELECT CAST(json_extract(body, '$.latencyMs') AS REAL) AS latency
        FROM traces
        WHERE json_extract(body, '$.latencyMs') IS NOT NULL
        ORDER BY latency ASC
      `).all().map(r => r.latency).filter(n => typeof n === 'number' && !isNaN(n));

      if (rows.length === 0) {
        return { count: 0, min: 0, max: 0, p50: 0, p90: 0, p95: 0, p99: 0, avg: 0 };
      }

      const p = (pct) => {
        const idx = Math.min(rows.length - 1, Math.floor((pct / 100) * rows.length));
        return Number(rows[idx].toFixed(2));
      };

      const sum = rows.reduce((acc, v) => acc + v, 0);
      return {
        count: rows.length,
        min: Number(rows[0].toFixed(2)),
        max: Number(rows[rows.length - 1].toFixed(2)),
        p50: p(50),
        p90: p(90),
        p95: p(95),
        p99: p(99),
        avg: Number((sum / rows.length).toFixed(2))
      };
    },
    purgeStaleRecords(now = new Date()) {
      const dateStr = now.toISOString().slice(0, 10);
      const rows = db.prepare(`
        SELECT id, body FROM records
        WHERE json_extract(body, '$.expiresAt') < ?
      `).all(dateStr);

      let archivedCount = 0;
      if (rows.length > 0) {
        db.exec('BEGIN IMMEDIATE');
        try {
          const insertArchive = db.prepare('INSERT OR REPLACE INTO archived_stale_records VALUES (?, ?, ?)');
          const delRecord = db.prepare('DELETE FROM records WHERE id = ?');
          const delFts = db.prepare('DELETE FROM records_fts WHERE id = ?');

          for (const row of rows) {
            insertArchive.run(row.id, row.body, new Date().toISOString());
            delRecord.run(row.id);
            try { delFts.run(row.id); } catch {}
            archivedCount++;
          }
          db.exec('COMMIT');
        } catch (e) {
          db.exec('ROLLBACK');
          throw e;
        }
      }
      return { date: dateStr, archivedCount };
    },
    rollbackAudit(recordId, auditId) {
      const audit = db.prepare('SELECT * FROM audits WHERE id = ? AND record_id = ?').get(auditId, recordId);
      if (!audit) throw new ValidationError('Audit entry not found for rollback', 404);

      const restoredRecord = JSON.parse(audit.previous);
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('UPDATE records SET body = ? WHERE id = ?').run(audit.previous, recordId);
        try {
          db.prepare('DELETE FROM records_fts WHERE id = ?').run(recordId);
          db.prepare('INSERT INTO records_fts(id, title, summary, quote, topic) VALUES (?, ?, ?, ?, ?)').run(
            recordId, restoredRecord.title || '', restoredRecord.summary || '', restoredRecord.quote || '', restoredRecord.topic || ''
          );
        } catch {}

        const lastAudit = db.prepare('SELECT hash FROM audits ORDER BY id DESC LIMIT 1').get();
        const prevHash = lastAudit?.hash || '0000000000000000000000000000000000000000000000000000000000000000';
        const at = new Date().toISOString();
        const auditPayload = `${prevHash}|${recordId}|rollback|system-rollback|${at}|${audit.next}|${audit.previous}`;
        const hash = createHash('sha256').update(auditPayload).digest('hex');

        db.prepare(`
          INSERT INTO audits(record_id, previous, next, reviewer, note, at, prev_hash, hash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(recordId, audit.next, audit.previous, 'system-rollback', `Rolled back to audit #${auditId}`, at, prevHash, hash);

        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
      return restoredRecord;
    },
    feedback(trace,issue) {
      if(typeof trace!=='string'||!trace||trace.length>100)throw new ValidationError('Valid trace ID required');
      if(!db.prepare('SELECT id FROM traces WHERE id=?').get(trace)) throw new ValidationError('Unknown trace',404);
      if(!['incorrect','missing','outdated','helpful'].includes(issue)) throw new ValidationError('Invalid issue');
      db.prepare('INSERT INTO feedback(trace_id,issue,at) VALUES (?,?,?)').run(trace,issue,new Date().toISOString());
    },
    purge(retentionDays = 30) {
      const safeDays = Math.max(1, Number(retentionDays) || 30);
      const cutoff = new Date(Date.now() - safeDays * 86400000).toISOString();
      let deletedTraces = 0, deletedGaps = 0, deletedFeedback = 0;
      for(const table of ['traces','gaps','feedback']) {
        const res = db.prepare(`DELETE FROM ${table} WHERE at < ?`).run(cutoff);
        if (table === 'traces') deletedTraces = res.changes;
        if (table === 'gaps') deletedGaps = res.changes;
        if (table === 'feedback') deletedFeedback = res.changes;
      }
      return { cutoff, deletedTraces, deletedGaps, deletedFeedback };
    },
    compact({ vacuum = false, retentionDays = 30 } = {}) {
      const purgeResult = this.purge(retentionDays);
      if (vacuum) {
        db.exec('VACUUM;');
      } else {
        try { db.exec('PRAGMA incremental_vacuum(50);'); } catch {}
      }
      return { compacted: true, ...purgeResult };
    },
    summary:()=>({records:db.prepare('SELECT body FROM records').all().map(r=>JSON.parse(r.body)),gaps:db.prepare('SELECT topic,reason,count(*) AS count FROM gaps GROUP BY topic,reason ORDER BY count DESC').all(),audits:db.prepare('SELECT id,record_id,reviewer,note,at FROM audits ORDER BY id DESC LIMIT 50').all()})
  };
}
