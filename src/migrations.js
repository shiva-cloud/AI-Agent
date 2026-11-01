import { assertEnglishData, assertEnglishRecord, assertEnglishText } from './language.js';

function migrateRecord(raw) {
  const old=JSON.parse(raw);
  const {en,hi,...record}=old;
  const next={...record,summary:record.summary ?? en,language:record.language ?? 'en'};
  assertEnglishRecord(next);
  return JSON.stringify(next);
}

export function configureEnglishDatabase(db) {
  if (!db || typeof db.exec !== 'function') throw new Error('Database instance with exec() required');
  // Triggers also protect writes that bypass the repository methods. A connection
  // without these functions cannot write to the guarded tables.
  db.function('english_text',{deterministic:true},value=>{
    try {if(value!==null) assertEnglishText(value);return 1;}catch{return 0;}
  });
  db.function('english_json',{deterministic:true},value=>{
    try {assertEnglishData(JSON.parse(value));return 1;}catch{return 0;}
  });
  db.function('english_record',{deterministic:true},value=>{
    try {assertEnglishRecord(JSON.parse(value));return 1;}catch{return 0;}
  });
  db.exec('PRAGMA secure_delete=ON; CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL);');
  const applied=db.prepare('SELECT version FROM schema_migrations WHERE version=1').get();
  db.exec('BEGIN IMMEDIATE');
  try {
    if(!applied) {
      for(const row of db.prepare('SELECT id,body FROM records').all()) {
        db.prepare('UPDATE records SET body=? WHERE id=?').run(migrateRecord(row.body),row.id);
      }
      for(const row of db.prepare('SELECT * FROM audits').all()) {
        assertEnglishText(row.reviewer,'Legacy reviewer');
        assertEnglishText(row.note,'Legacy review note');
        db.prepare('UPDATE audits SET previous=?,next=? WHERE id=?').run(migrateRecord(row.previous),migrateRecord(row.next),row.id);
      }
      // Do not silently translate or delete historical editorial prose. If any
      // unconvertible data exists, roll the entire migration back for correction.
      for(const table of ['traces','gaps','feedback']) {
        for(const row of db.prepare(`SELECT * FROM ${table}`).all()) {
          assertEnglishData(row);
          if(table==='traces') assertEnglishData(JSON.parse(row.body));
        }
      }
      db.prepare('INSERT INTO schema_migrations VALUES (1,?,?)').run('English-only evidence and audit snapshots',new Date().toISOString());
    }
    const guards={
      records:"english_record(NEW.body)=1 AND NEW.id=json_extract(NEW.body,'$.id')",
      audits:'english_record(NEW.previous)=1 AND english_record(NEW.next)=1 AND english_text(NEW.reviewer)=1 AND english_text(NEW.note)=1 AND english_text(NEW.record_id)=1 AND english_text(NEW.at)=1',
      traces:'english_json(NEW.body)=1 AND english_text(NEW.id)=1 AND english_text(NEW.at)=1',
      gaps:'english_text(NEW.trace_id)=1 AND english_text(NEW.topic)=1 AND english_text(NEW.reason)=1 AND english_text(NEW.at)=1',
      feedback:'english_text(NEW.trace_id)=1 AND english_text(NEW.issue)=1 AND english_text(NEW.at)=1'
    };
    for(const [table,condition] of Object.entries(guards)) for(const operation of ['INSERT','UPDATE']) {
      db.exec(`CREATE TRIGGER IF NOT EXISTS ${table}_english_${operation.toLowerCase()}
        BEFORE ${operation} ON ${table} WHEN NOT (${condition})
        BEGIN SELECT RAISE(ABORT,'English-only database policy violation'); END;`);
    }
    // A record may only become "approved" through an editorial decision
    // (store.review or an ingestion decision), which stamps reviewMethod.
    // Bulk scripts and seed loaders writing straight to the table are refused.
    // Records that were already approved before this rule keep their status
    // and stay labelled as bulk-approved until an editor reviews them.
    // Malformed JSON is left to the English guard above, which reports it.
    // 'source_verified' is set only by an ingestion decision after an automated
    // check of the archived official page (src/source-verifier.js).
    const unreviewedApproval="CASE WHEN json_valid(NEW.body) THEN json_extract(NEW.body,'$.status')='approved' AND COALESCE(json_extract(NEW.body,'$.reviewMethod'),'') NOT IN ('editorial_review','source_verified') ELSE 0 END";
    const wasApproved="CASE WHEN json_valid(OLD.body) THEN json_extract(OLD.body,'$.status')='approved' ELSE 0 END";
    // Recreated on every start so databases created earlier get this version.
    db.exec(`DROP TRIGGER IF EXISTS records_editorial_approval_insert; DROP TRIGGER IF EXISTS records_editorial_approval_update;
      CREATE TRIGGER records_editorial_approval_insert
      BEFORE INSERT ON records WHEN ${unreviewedApproval}
      BEGIN SELECT RAISE(ABORT,'Approval requires an editorial review decision'); END;
      CREATE TRIGGER records_editorial_approval_update
      BEFORE UPDATE ON records WHEN (${unreviewedApproval}) AND NOT (${wasApproved})
      BEGIN SELECT RAISE(ABORT,'Approval requires an editorial review decision'); END;`);
    db.exec('COMMIT');
  } catch(error) {db.exec('ROLLBACK');throw error;}
  // Remove the discarded language payload from free pages and the live WAL.
  if(!applied) {db.exec('VACUUM; PRAGMA wal_checkpoint(TRUNCATE);');}
}
