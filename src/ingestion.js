import {ValidationError} from './api-errors.js';
import { createHash, randomUUID } from 'node:crypto';
import { assertEnglishData, assertEnglishRecord, assertEnglishText } from './language.js';
import { cities, topics } from './knowledge.js';
import { assessChange } from './changes.js';
import {recordHousingSubject} from './housing.js';
import { appendAudit } from './audit-chain.js';

const hash=text=>createHash('sha256').update(text).digest('hex');
const canonical=value=>JSON.stringify(value && typeof value==='object' ? (Array.isArray(value)?value.map(v=>JSON.parse(canonical(v))):Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(canonical(value[k]))]))) : value);
function text(value,name,min=1,max=1000) {
  assertEnglishText(value,name);
  if(value.trim().length<min || value.length>max) throw new ValidationError(`${name} must contain ${min}–${max} characters`);
  return value;
}
function identity(value) {if(typeof value!=='string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(value)) throw new ValidationError('Use a lowercase ID of at most 80 characters');return value;}
function reviewInput(input) {text(input.reviewer,'Reviewer',2,100);text(input.note,'Review note',10,1000);}
function date(value,name) {
  if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value) throw new ValidationError(`${name} must be a valid ISO date`);
}
function transaction(db,action) {db.exec('BEGIN IMMEDIATE');try{const result=action();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}

export function configureIngestion(db) {
  db.exec('PRAGMA foreign_keys=ON;');
  transaction(db,()=>{
    db.exec(`
      CREATE TABLE IF NOT EXISTS sources(id TEXT PRIMARY KEY,url TEXT NOT NULL UNIQUE,owner TEXT NOT NULL,tier TEXT NOT NULL CHECK(tier IN ('A','B','C','D','unclassified')),language TEXT NOT NULL CHECK(language='en'),policy TEXT NOT NULL CHECK(policy IN ('unreviewed','manual_permitted')),reviewer TEXT NOT NULL,note TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS audit_authorizations(audit_id INTEGER PRIMARY KEY REFERENCES audits(id),actor_id TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','reviewer')),mode TEXT NOT NULL CHECK(mode='individual'),payload_hash TEXT NOT NULL,at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS snapshots(id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES sources(id),content TEXT NOT NULL,content_hash TEXT NOT NULL,imported_at TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind='manual_excerpt'),UNIQUE(source_id,content_hash));
      CREATE TABLE IF NOT EXISTS candidates(id TEXT PRIMARY KEY,record_id TEXT NOT NULL,snapshot_id TEXT NOT NULL REFERENCES snapshots(id),body TEXT NOT NULL,base_hash TEXT,status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')),request_key TEXT NOT NULL UNIQUE,request_hash TEXT NOT NULL,created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS candidate_decisions(id INTEGER PRIMARY KEY,candidate_id TEXT NOT NULL REFERENCES candidates(id),decision TEXT NOT NULL CHECK(decision IN ('approve','reject')),reviewer TEXT NOT NULL,note TEXT NOT NULL,at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS publications(id INTEGER PRIMARY KEY,record_id TEXT NOT NULL,candidate_id TEXT NOT NULL UNIQUE REFERENCES candidates(id),snapshot_id TEXT NOT NULL REFERENCES snapshots(id),body TEXT NOT NULL,at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS source_policy_reviews(id INTEGER PRIMARY KEY,source_id TEXT NOT NULL REFERENCES sources(id),reviewer TEXT NOT NULL,note TEXT NOT NULL,at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS restorations(id INTEGER PRIMARY KEY,record_id TEXT NOT NULL,target_publication_id INTEGER NOT NULL REFERENCES publications(id),previous TEXT NOT NULL,next TEXT NOT NULL,reviewer TEXT NOT NULL,note TEXT NOT NULL,request_key TEXT NOT NULL UNIQUE,request_hash TEXT NOT NULL,at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS suspended_sources(source_id TEXT PRIMARY KEY REFERENCES sources(id),reviewer TEXT NOT NULL,note TEXT NOT NULL,at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS change_events(candidate_id TEXT PRIMARY KEY REFERENCES candidates(id),source_id TEXT NOT NULL REFERENCES sources(id),baseline_body TEXT,baseline_snapshot_id TEXT REFERENCES snapshots(id),report TEXT NOT NULL,at TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS candidates_status ON candidates(status,created_at);
      CREATE INDEX IF NOT EXISTS publications_record ON publications(record_id,id);
    `);
    const checks={
      sources:"english_text(NEW.id)=1 AND english_text(NEW.url)=1 AND english_text(NEW.owner)=1 AND english_text(NEW.reviewer)=1 AND english_text(NEW.note)=1",
      snapshots:"english_text(NEW.content)=1 AND english_text(NEW.id)=1 AND english_text(NEW.source_id)=1 AND english_text(NEW.content_hash)=1 AND english_text(NEW.imported_at)=1",
      candidates:"english_record(NEW.body)=1 AND NEW.record_id=json_extract(NEW.body,'$.id') AND english_text(NEW.id)=1 AND english_text(NEW.request_key)=1 AND english_text(NEW.request_hash)=1 AND english_text(NEW.base_hash)=1 AND english_text(NEW.created_at)=1",
      candidate_decisions:'english_text(NEW.reviewer)=1 AND english_text(NEW.note)=1 AND english_text(NEW.at)=1',
      publications:'english_record(NEW.body)=1 AND english_text(NEW.at)=1',
      source_policy_reviews:'english_text(NEW.reviewer)=1 AND english_text(NEW.note)=1 AND english_text(NEW.at)=1',
      restorations:"english_record(NEW.previous)=1 AND english_record(NEW.next)=1 AND NEW.record_id=json_extract(NEW.next,'$.id') AND english_text(NEW.reviewer)=1 AND english_text(NEW.note)=1 AND english_text(NEW.request_key)=1 AND english_text(NEW.request_hash)=1 AND english_text(NEW.at)=1",
      suspended_sources:'english_text(NEW.reviewer)=1 AND english_text(NEW.note)=1 AND english_text(NEW.at)=1',
      change_events:'(NEW.baseline_body IS NULL OR english_record(NEW.baseline_body)=1) AND english_json(NEW.report)=1 AND english_text(NEW.at)=1'
    };
    for(const [table,check] of Object.entries(checks)) for(const op of ['INSERT','UPDATE']) db.exec(`CREATE TRIGGER IF NOT EXISTS ${table}_english_${op.toLowerCase()} BEFORE ${op} ON ${table} WHEN NOT (${check}) BEGIN SELECT RAISE(ABORT,'English-only database policy violation'); END;`);
    for(const table of ['snapshots','publications','candidate_decisions','source_policy_reviews','restorations','change_events','audit_authorizations']) for(const op of ['UPDATE','DELETE']) db.exec(`CREATE TRIGGER IF NOT EXISTS ${table}_immutable_${op.toLowerCase()} BEFORE ${op} ON ${table} BEGIN SELECT RAISE(ABORT,'Immutable evidence history'); END;`);
    db.exec(`CREATE TRIGGER IF NOT EXISTS candidate_payload_immutable BEFORE UPDATE ON candidates
      WHEN NEW.id IS NOT OLD.id OR NEW.record_id IS NOT OLD.record_id OR NEW.snapshot_id IS NOT OLD.snapshot_id OR NEW.body IS NOT OLD.body OR NEW.base_hash IS NOT OLD.base_hash OR NEW.request_key IS NOT OLD.request_key OR NEW.request_hash IS NOT OLD.request_hash OR NEW.created_at IS NOT OLD.created_at
      BEGIN SELECT RAISE(ABORT,'Immutable candidate payload'); END;`);
    db.exec("CREATE TRIGGER IF NOT EXISTS candidates_immutable_delete BEFORE DELETE ON candidates BEGIN SELECT RAISE(ABORT,'Immutable candidate history'); END;");
    const insert=db.prepare("INSERT OR IGNORE INTO sources VALUES (?,?,?,'unclassified','en','unreviewed','','Manual access policy has not been reviewed.')");
    for(const row of db.prepare('SELECT body FROM records').all()) {const r=JSON.parse(row.body);insert.run(`seed-${r.id}`,r.url,new URL(r.url).hostname);}
    db.prepare('INSERT OR IGNORE INTO schema_migrations VALUES (2,?,?)').run('Source registry and immutable manual evidence ingestion',new Date().toISOString());
    db.prepare('INSERT OR IGNORE INTO schema_migrations VALUES (3,?,?)').run('Audited evidence version restoration',new Date().toISOString());
    db.prepare('INSERT OR IGNORE INTO schema_migrations VALUES (4,?,?)').run('Source suspension and publication withdrawal',new Date().toISOString());
    db.prepare('INSERT OR IGNORE INTO schema_migrations VALUES (5,?,?)').run('Immutable import comparisons and source impact hints',new Date().toISOString());
    db.prepare('INSERT OR IGNORE INTO schema_migrations VALUES (7,?,?)').run('Authenticated reviewer audit authorization events',new Date().toISOString());
  });
}

export function ingestionStore(db) {
  const current=id=>db.prepare('SELECT body FROM records WHERE id=?').get(id)?.body ?? null;
  const source=id=>db.prepare('SELECT * FROM sources WHERE id=?').get(id);
  function validateCandidate(record,s) {
    assertEnglishRecord(record);identity(record.id);
    if(record.topic==='telecom' && !record.telecomSubject)throw new ValidationError('Telecom evidence requires a telecomSubject');
    if(record.topic==='housing' && !recordHousingSubject(record)) throw new ValidationError('Housing evidence requires a housingSubject');
    if(record.url!==s.url) throw new ValidationError('Evidence URL must exactly match its registered source');
    // Canadian pilot places, plus any jurisdiction or topic already held by a stored record
    // (the global records), so those can be re-imported and published.
    const knownJurisdiction=['CA','ON','BC',...Object.keys(cities)].includes(record.jurisdiction) || Boolean(db.prepare("SELECT 1 FROM records WHERE json_extract(body,'$.jurisdiction')=? LIMIT 1").get(record.jurisdiction));
    const knownTopic=topics.includes(record.topic) || Boolean(db.prepare("SELECT 1 FROM records WHERE json_extract(body,'$.topic')=? LIMIT 1").get(record.topic));
    if(!knownTopic || !knownJurisdiction) throw new ValidationError('Unsupported topic or jurisdiction');
    date(record.checkedAt,'Checked date');date(record.expiresAt,'Expiry date');
    const today=new Date().toISOString().slice(0,10);
    if(record.checkedAt>today || record.expiresAt<=record.checkedAt || record.expiresAt<today) throw new ValidationError('Evidence must be checked on or before today and have a current expiry');
    for(const key of ['effectiveFrom','effectiveTo']) if(record[key]!=null) date(record[key],key);
    if(record.effectiveFrom && record.effectiveTo && record.effectiveFrom>=record.effectiveTo) throw new ValidationError('Effective date range is invalid');
    if(record.risk==='high' && !['A','B'].includes(s.tier)) throw new ValidationError('High-risk evidence requires a reviewed tier A or B source');
  }
  return {
    assertReviewable(record) {
      if(!record.sourceId || !record.snapshotId) throw new ValidationError('Approval requires a reviewed source and an imported evidence snapshot');
      const s=source(record.sourceId),snap=db.prepare('SELECT * FROM snapshots WHERE id=?').get(record.snapshotId ?? '');
      if(!s || s.policy!=='manual_permitted' || db.prepare('SELECT 1 FROM suspended_sources WHERE source_id=?').get(s.id)) throw new ValidationError('Source permission must be reviewed before approval');
      validateCandidate(record,s);
      if(!snap || snap.source_id!==s.id || hash(snap.content)!==snap.content_hash || !snap.content.includes(record.quote)) throw new ValidationError('Publication provenance check failed');
    },
    sources:()=>db.prepare('SELECT s.*,EXISTS(SELECT 1 FROM suspended_sources b WHERE b.source_id=s.id) AS suspended FROM sources s ORDER BY s.id').all(),
    registerSource(input) {
      assertEnglishData(input);identity(input.id);reviewInput(input);text(input.owner,'Owner',2,200);
      let url;try{url=new URL(input.url);}catch{throw new ValidationError('Use a canonical HTTPS source URL without credentials or fragment');}
      if(url.protocol!=='https:' || url.username || url.password || url.hash || url.href!==input.url) throw new ValidationError('Use a canonical HTTPS source URL without credentials or fragment');
      if(input.language!=='en' || !['A','B','C','D'].includes(input.tier)) throw new ValidationError('English source and tier A, B, C or D required');
      return transaction(db,()=>{
        if(db.prepare('SELECT 1 FROM sources WHERE id=? OR url=?').get(input.id,input.url))throw new ValidationError('Source ID or URL already registered',409);
        db.prepare("INSERT INTO sources VALUES (?,?,?,?, 'en','manual_permitted',?,?)").run(input.id,input.url,input.owner,input.tier,input.reviewer,input.note);
        db.prepare('INSERT INTO source_policy_reviews(source_id,reviewer,note,at) VALUES (?,?,?,?)').run(input.id,input.reviewer,input.note,new Date().toISOString());
        return source(input.id);
      });
    },
    permitSource(id,input) {
      reviewInput(input);if(!['A','B','C','D'].includes(input.tier)) throw new ValidationError('A reviewed source tier is required');
      return transaction(db,()=>{
        if(!source(id)) throw new ValidationError('Unknown source',404);
        db.prepare("UPDATE sources SET policy='manual_permitted',tier=?,reviewer=?,note=? WHERE id=?").run(input.tier,input.reviewer,input.note,id);
        db.prepare('DELETE FROM suspended_sources WHERE source_id=?').run(id);
        db.prepare('INSERT INTO source_policy_reviews(source_id,reviewer,note,at) VALUES (?,?,?,?)').run(id,input.reviewer,input.note,new Date().toISOString());
        return source(id);
      });
    },
    suspendSource(id,input) {
      reviewInput(input);
      return transaction(db,()=>{
        const s=source(id);if(!s) throw new ValidationError('Unknown source',404);
        const at=new Date().toISOString(),note=`Source suspended: ${input.note}`;
        db.prepare("UPDATE sources SET policy='unreviewed',reviewer=?,note=? WHERE id=?").run(input.reviewer,note,id);
        db.prepare('INSERT INTO suspended_sources VALUES (?,?,?,?) ON CONFLICT(source_id) DO UPDATE SET reviewer=excluded.reviewer,note=excluded.note,at=excluded.at').run(id,input.reviewer,input.note,at);
        db.prepare('INSERT INTO source_policy_reviews(source_id,reviewer,note,at) VALUES (?,?,?,?)').run(id,input.reviewer,note,at);
        const withdrawn=[];
        for(const row of db.prepare('SELECT id,body FROM records').all()) {
          const r=JSON.parse(row.body);
          if((r.sourceId===id || r.url===s.url) && ['approved','research_seed'].includes(r.status)) {
            const {reviewMethod:_withdrawn,...rest}=r;
            const next=JSON.stringify({...rest,status:'pending',reviewedAt:at});
            db.prepare('UPDATE records SET body=? WHERE id=?').run(next,r.id);
            appendAudit(db, { recordId: r.id, previous: row.body, next, reviewer: input.reviewer, note, at, action: 'reject' });
            withdrawn.push(r.id);
          }
        }
        return {sourceId:id,status:'suspended',withdrawn};
      });
    },
    ingest(input) {
      assertEnglishData(input);identity(input.requestKey);identity(input.sourceId);
      text(input.content,'English source excerpt',10,8000);
      if(!input.record || input.record.status!=='pending') throw new ValidationError('Imported evidence must have pending status');
      if('sourceId' in input.record || 'snapshotId' in input.record || 'reviewedAt' in input.record || 'reviewMethod' in input.record) throw new ValidationError('Publication provenance is assigned by the server');
      const requestHash=hash(canonical(input));
      return transaction(db,()=>{
        const previous=db.prepare('SELECT * FROM candidates WHERE request_key=?').get(input.requestKey);
        if(previous) {if(previous.request_hash!==requestHash) throw new ValidationError('Idempotency key already used for a different request',409);return {...previous,replayed:true};}
        const s=source(input.sourceId);
        if(!s || s.policy!=='manual_permitted') throw new ValidationError('Source requires a documented manual-access policy review');
        validateCandidate(input.record,s);
        if(!input.content.includes(input.record.quote)) throw new ValidationError('Evidence quote must occur exactly in the submitted excerpt');
        const contentHash=hash(input.content),at=new Date().toISOString();
        let snap=db.prepare('SELECT id FROM snapshots WHERE source_id=? AND content_hash=?').get(s.id,contentHash);
        if(!snap) {snap={id:randomUUID()};db.prepare("INSERT INTO snapshots VALUES (?,?,?,?,?,'manual_excerpt')").run(snap.id,s.id,input.content,contentHash,at);}
        const id=randomUUID(),base=current(input.record.id);
        db.prepare("INSERT INTO candidates VALUES (?,?,?,?,?,'pending',?,?,?)").run(id,input.record.id,snap.id,JSON.stringify(input.record),base===null?null:hash(base),input.requestKey,requestHash,at);
        const baselineRecord=base===null?null:JSON.parse(base),previousSnapshot=baselineRecord?.snapshotId?db.prepare('SELECT * FROM snapshots WHERE id=?').get(baselineRecord.snapshotId):null;
        const affected=db.prepare('SELECT body FROM records').all().map(r=>JSON.parse(r.body)).filter(r=>r.sourceId===s.id || r.url===s.url).map(r=>r.id);
        const report=assessChange({previous:baselineRecord,next:input.record,previousContent:previousSnapshot?.content ?? null,content:input.content,affectedRecordIds:affected});
        db.prepare('INSERT INTO change_events VALUES (?,?,?,?,?,?)').run(id,s.id,base,previousSnapshot?.id ?? null,JSON.stringify(report),at);
        return {...db.prepare('SELECT * FROM candidates WHERE id=?').get(id),replayed:false};
      });
    },
    candidates:()=>db.prepare('SELECT c.*,s.content,s.content_hash,s.source_id,e.report AS change_report FROM candidates c JOIN snapshots s ON s.id=c.snapshot_id LEFT JOIN change_events e ON e.candidate_id=c.id ORDER BY c.created_at DESC').all().map(c=>({...c,record:JSON.parse(c.body),changeReport:c.change_report?JSON.parse(c.change_report):null})),
    changes:()=>db.prepare('SELECT e.*,c.record_id,c.status,c.snapshot_id FROM change_events e JOIN candidates c ON c.id=e.candidate_id ORDER BY e.at DESC,e.candidate_id').all().map(e=>({...e,report:JSON.parse(e.report),baselineRecord:e.baseline_body?JSON.parse(e.baseline_body):null})),
    decide(id,input,authenticatedActor) {
      reviewInput(input);if(!['approve','reject'].includes(input.decision)) throw new ValidationError('Choose approve or reject');
      // 'source_verified' marks a publication made by the automated official-page
      // check (scripts/kb-verify-publish.js); users see it labelled as automated.
      const reviewMethod=input.reviewMethod ?? 'editorial_review';
      if(!['editorial_review','source_verified'].includes(reviewMethod)) throw new ValidationError('Unknown review method');
      return transaction(db,()=>{
        const c=db.prepare('SELECT * FROM candidates WHERE id=?').get(id);
        if(!c)throw new ValidationError('Candidate is missing',404);
        if(c.status!=='pending') throw new ValidationError('Candidate is already decided',409);
        const at=new Date().toISOString();let publicationId=null;
        if(input.decision==='approve') {
          const record=JSON.parse(c.body),snap=db.prepare('SELECT * FROM snapshots WHERE id=?').get(c.snapshot_id),s=source(snap.source_id);
          if(s.policy!=='manual_permitted') throw new ValidationError('Source policy must permit manual use');
          validateCandidate(record,s);
          if(hash(snap.content)!==snap.content_hash || !snap.content.includes(record.quote)) throw new ValidationError('Snapshot integrity check failed');
          const previous=current(c.record_id);
          if((previous===null?null:hash(previous))!==c.base_hash) throw new ValidationError('Published record changed; import a fresh candidate before approval',409);
          const next=JSON.stringify({...record,status:'approved',reviewedAt:at,reviewMethod,sourceId:s.id,snapshotId:snap.id});
          db.prepare('INSERT INTO records VALUES (?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(c.record_id,next);
          appendAudit(db, { recordId: c.record_id, previous: previous ?? c.body, next, reviewer: input.reviewer, note: input.note, at, action: input.decision, authenticatedActor });
          publicationId=Number(db.prepare('INSERT INTO publications(record_id,candidate_id,snapshot_id,body,at) VALUES (?,?,?,?,?)').run(c.record_id,c.id,c.snapshot_id,next,at).lastInsertRowid);
        }
        db.prepare('UPDATE candidates SET status=? WHERE id=?').run(input.decision==='approve'?'approved':'rejected',id);
        db.prepare('INSERT INTO candidate_decisions(candidate_id,decision,reviewer,note,at) VALUES (?,?,?,?,?)').run(id,input.decision,input.reviewer,input.note,at);
        return {id,status:input.decision==='approve'?'approved':'rejected',publicationId};
      });
    },
    history:id=>db.prepare('SELECT * FROM publications WHERE record_id=? ORDER BY id DESC').all(id).map(v=>({...v,record:JSON.parse(v.body)})),
    historyState(id) {
      const body=current(id);if(body===null) throw new ValidationError('Unknown evidence record',404);
      return {currentRecord:JSON.parse(body),currentHash:hash(body),restorations:db.prepare('SELECT id,target_publication_id,reviewer,note,at FROM restorations WHERE record_id=? ORDER BY id DESC').all(id)};
    },
    restore(id,input,authenticatedActor) {
      identity(id);identity(input.requestKey);reviewInput(input);
      if(!Number.isSafeInteger(input.publicationId) || input.publicationId<1 || typeof input.expectedHash!=='string' || !/^[a-f0-9]{64}$/.test(input.expectedHash)) throw new ValidationError('A publication ID and current record hash are required');
      const requestHash=hash(canonical({...input,recordId:id}));
      return transaction(db,()=>{
        const prior=db.prepare('SELECT * FROM restorations WHERE request_key=?').get(input.requestKey);
        if(prior) {if(prior.request_hash!==requestHash) throw new ValidationError('Restoration key already used for a different request',409);return {restorationId:prior.id,recordId:prior.record_id,publicationId:prior.target_publication_id,replayed:true};}
        const previous=current(id);
        if(previous===null || hash(previous)!==input.expectedHash) throw new ValidationError('Current evidence changed; reload history before restoring',409);
        const version=db.prepare('SELECT * FROM publications WHERE id=? AND record_id=?').get(input.publicationId,id);
        if(!version) throw new ValidationError('Publication does not belong to this evidence record');
        const record=JSON.parse(version.body),snap=db.prepare('SELECT * FROM snapshots WHERE id=?').get(version.snapshot_id),s=snap && source(snap.source_id);
        if(!s || s.policy!=='manual_permitted') throw new ValidationError('Source policy must permit manual use');
        validateCandidate(record,s);
        const today=new Date().toISOString().slice(0,10);
        if(record.status!=='approved' || (record.effectiveFrom && record.effectiveFrom>today) || (record.effectiveTo && record.effectiveTo<=today)) throw new ValidationError('Only currently effective approved versions can be restored');
        if(record.snapshotId!==snap.id || record.sourceId!==s.id || hash(snap.content)!==snap.content_hash || !snap.content.includes(record.quote)) throw new ValidationError('Historical snapshot provenance check failed');
        const at=new Date().toISOString(),next=JSON.stringify({...record,reviewedAt:at});
        const event=db.prepare('INSERT INTO restorations(record_id,target_publication_id,previous,next,reviewer,note,request_key,request_hash,at) VALUES (?,?,?,?,?,?,?,?,?)').run(id,version.id,previous,next,input.reviewer,input.note,input.requestKey,requestHash,at);
        db.prepare('UPDATE records SET body=? WHERE id=?').run(next,id);
        appendAudit(db, { recordId: id, previous, next, reviewer: input.reviewer, note: `Restore publication ${version.id}: ${input.note}`, at, action: 'approve', authenticatedActor });
        return {restorationId:Number(event.lastInsertRowid),recordId:id,publicationId:version.id,replayed:false};
      });
    }
  };
}
