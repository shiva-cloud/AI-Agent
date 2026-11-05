import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { assertEnglishRecord, assertEnglishData } from './language.js';
import { authorizationDigest } from './audit-chain.js';

export const dataTables=['records','audits','traces','gaps','feedback','schema_migrations','sources','snapshots','candidates','candidate_decisions','publications','source_policy_reviews','restorations','suspended_sources','change_events','gap_work_items','gap_work_events','archived_stale_records','live_updates','crawl_snapshots','cron_crawl_logs','realtime_subscriptions','realtime_deliveries'];
export function verifyDatabase(path) {
  const db=new DatabaseSync(path,{readOnly:true,timeout:5000});
  try {
    db.exec('BEGIN');
    if(db.prepare('PRAGMA integrity_check').all().some(r=>r.integrity_check!=='ok')) throw new Error('SQLite integrity check failed');
    if(db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Evidence reference integrity check failed');
    const counts={},digest=createHash('sha256');
    for(const table of [...dataTables,...['audit_authorizations','realtime_evidence_snapshots','crawl_permissions','crawl_permission_audit','community_translation_ledger','translation_endorsements','translation_events','evidence_revision'].filter(t=>!dataTables.includes(t))]) {
      if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table)) {
        if(table.startsWith('gap_work_')&&db.prepare('SELECT 1 FROM schema_migrations WHERE version=6').get())throw new Error('Gap workflow migration is incomplete');
        if(table==='audit_authorizations'&&db.prepare('SELECT 1 FROM schema_migrations WHERE version=7').get())throw new Error('Audit authorization migration is incomplete');
        continue;
      }
      counts[table]=0;digest.update(`${table}\n`);
      for(const row of db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).iterate()) {
        counts[table]++;
        if(table==='audit_authorizations') {
          const audit=db.prepare('SELECT * FROM audits WHERE id=?').get(row.audit_id);
          if(!audit || row.actor_id!==audit.reviewer || row.mode!=='individual' || !['admin','reviewer'].includes(row.role) ||
            row.at!==audit.at || row.payload_hash!==authorizationDigest(audit)) throw new Error('Audit authorization integrity mismatch');
        }
        if(table==='community_translation_ledger') {
          // Translation text is intentionally multilingual; include every field in
          // the recovery digest without applying the English evidence restriction.
          if(!['pending','endorsed','verified','rejected'].includes(row.status) || !row.id || !row.target_locale || !row.suggested_translation) throw new Error('Invalid translation ledger entry');
        } else if(table==='translation_events'||table==='translation_endorsements') {
          if(!row.translation_id || !row.actor || !row.at)throw new Error('Invalid translation moderation entry');
        } else if(table==='crawl_snapshots'||table==='realtime_evidence_snapshots') {
          assertEnglishData({ source_id: row.source_id, hash: row.hash, last_checked_at: row.last_checked_at });
        } else {
          assertEnglishData(row);
        }
        if(table==='records')assertEnglishRecord(JSON.parse(row.body));
        if(table==='traces')assertEnglishData(JSON.parse(row.body));
        if(table==='archived_stale_records')assertEnglishRecord(JSON.parse(row.body));
        if(table==='gap_work_events'){assertEnglishData(JSON.parse(row.previous));assertEnglishData(JSON.parse(row.next));}
        if(['audits','restorations'].includes(table)){assertEnglishRecord(JSON.parse(row.previous));assertEnglishRecord(JSON.parse(row.next));}
        if(['candidates','publications'].includes(table))assertEnglishRecord(JSON.parse(row.body));
        if(table==='sources' && row.language!=='en')throw new Error('Unsupported source language');
        if(table==='change_events'){assertEnglishData(JSON.parse(row.report));if(row.baseline_body)assertEnglishRecord(JSON.parse(row.baseline_body));}
        if(table==='snapshots' && createHash('sha256').update(row.content).digest('hex')!==row.content_hash)throw new Error('Snapshot content hash mismatch');
        if(table==='realtime_evidence_snapshots' && createHash('sha256').update(row.content).digest('hex')!==row.content_hash)throw new Error('Realtime snapshot content hash mismatch');
        if(table==='crawl_snapshots' && row.content && createHash('sha256').update(row.content).digest('hex')!==row.hash)throw new Error('Crawler checkpoint hash mismatch');
        digest.update(JSON.stringify(row)+'\n');
      }
    }
    const schema=db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all();
    const schemaDigest=createHash('sha256').update(JSON.stringify(schema)).digest('hex');
    const migrations=db.prepare('SELECT version,name FROM schema_migrations ORDER BY version').all();
    db.exec('COMMIT');
    return {integrity:'ok',language:'en',counts,migrations,dataDigest:digest.digest('hex'),schemaDigest,
      validation:'Database structure, references, snapshot hashes and English schema/script checks passed. English prose quality and factual correctness still require editorial review.'};
  } finally {db.close();}
}
