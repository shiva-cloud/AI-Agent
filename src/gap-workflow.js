import {createHash} from 'node:crypto';
import {assertEnglishText} from './language.js';
import {ValidationError} from './api-errors.js';

export class GapWorkflowError extends ValidationError {
  constructor(message,statusCode=400){super(message,statusCode);}
}
export function configureGapWorkflow(db) {
  db.exec('BEGIN IMMEDIATE');
  try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS gap_work_items(
      id TEXT PRIMARY KEY, scope TEXT NOT NULL, topic TEXT NOT NULL, subject TEXT NOT NULL, reason TEXT NOT NULL,
      occurrences INTEGER NOT NULL CHECK(occurrences>0), status TEXT NOT NULL CHECK(status IN ('open','in_progress','resolved','deferred')),
      priority TEXT NOT NULL CHECK(priority IN ('low','normal','high','urgent')), owner TEXT NOT NULL,
      regression_ref TEXT NOT NULL, revision INTEGER NOT NULL, first_seen TEXT NOT NULL, last_seen TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS gap_work_events(id INTEGER PRIMARY KEY, item_id TEXT NOT NULL REFERENCES gap_work_items(id),
      actor TEXT NOT NULL,note TEXT NOT NULL,previous TEXT NOT NULL,next TEXT NOT NULL,at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS gap_work_status ON gap_work_items(status,priority);
  `);
    const checks={gap_work_items:['id','scope','topic','subject','reason','owner','regression_ref','first_seen','last_seen'].map(k=>`english_text(NEW.${k})=1`).join(' AND '),
      gap_work_events:'english_text(NEW.actor)=1 AND english_text(NEW.note)=1 AND english_json(NEW.previous)=1 AND english_json(NEW.next)=1 AND english_text(NEW.at)=1'};
    for(const [table,check] of Object.entries(checks))for(const op of ['INSERT','UPDATE'])db.exec(`CREATE TRIGGER IF NOT EXISTS ${table}_english_${op.toLowerCase()} BEFORE ${op} ON ${table} WHEN NOT (${check}) BEGIN SELECT RAISE(ABORT,'English-only database policy violation'); END;`);
    for(const op of ['UPDATE','DELETE'])db.exec(`CREATE TRIGGER IF NOT EXISTS gap_events_immutable_${op.toLowerCase()} BEFORE ${op} ON gap_work_events BEGIN SELECT RAISE(ABORT,'Immutable gap history'); END;`);
    db.prepare('INSERT OR IGNORE INTO schema_migrations VALUES (6,?,?)').run('Gap ownership, lifecycle and regression references',new Date().toISOString());
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error;}
}

export function gapWorkflow(db) {
  const get=id=>db.prepare('SELECT * FROM gap_work_items WHERE id=?').get(id);
  const event=(id,actor,note,previous,next,at)=>db.prepare('INSERT INTO gap_work_events(item_id,actor,note,previous,next,at) VALUES (?,?,?,?,?,?)').run(id,actor,note,JSON.stringify(previous),JSON.stringify(next),at);
  return {
    // Called inside the trace transaction; no raw question, trace ID or user identity retained.
    observe(result,at) {
      if(process.env.DISABLE_GAP_RECORDING==='1'||process.env.GAP_WORKFLOW_SILENT==='1'||process.env.GAP_WORKFLOW_ISOLATED==='1')return;
      const scope=result.parsed.missingSlots.includes('location')?'unresolved':result.parsed.city||result.parsed.region||'CA';
      const seen=new Set();
      for(const gap of result.gaps) {
        const parts=[scope,gap.topic||'unknown',gap.subject||'',gap.reason];
        const id=createHash('sha256').update(JSON.stringify(parts)).digest('hex');
        if(seen.has(id))continue;seen.add(id);
        const previous=get(id);
        if(!previous)db.prepare("INSERT INTO gap_work_items VALUES (?,?,?,?,?,1,'open','normal','','',1,?,?)").run(id,...parts,at,at);
        else {
          db.prepare("UPDATE gap_work_items SET occurrences=occurrences+1,last_seen=?,revision=revision+1,status=CASE WHEN status='resolved' THEN 'open' ELSE status END WHERE id=?").run(at,id);
          if(previous.status==='resolved')event(id,'system','Gap recurred after resolution.',previous,get(id),at);
        }
      }
    },
    list(after='') {
      if(typeof after!=='string'||(after && !/^[a-f0-9]{64}$/.test(after)))throw new GapWorkflowError('Invalid gap cursor');
      const rows=db.prepare('SELECT * FROM gap_work_items WHERE id>? ORDER BY id LIMIT 201').all(after);
      return {items:rows.slice(0,200),nextCursor:rows.length>200?rows[199].id:null};
    },
    history(id) {return db.prepare('SELECT * FROM gap_work_events WHERE item_id=? ORDER BY id DESC LIMIT 100').all(id);},
    // Public transparency aggregate: totals by status plus the open items with
    // the most occurrences. Emits scope/topic/subject/reason/occurrences only —
    // owner names, actors, notes, revisions, regression references and item
    // ids never cross this public boundary.
    publicSummary() {
      const totals={open:0,in_progress:0,resolved:0,deferred:0};
      for(const row of db.prepare('SELECT status,count(*) AS n FROM gap_work_items GROUP BY status').all())if(row.status in totals)totals[row.status]=row.n;
      const items=db.prepare("SELECT scope,topic,subject,reason,occurrences FROM gap_work_items WHERE status='open' ORDER BY occurrences DESC,reason LIMIT 12").all();
      return {totals:{open:totals.open,inProgress:totals.in_progress,resolved:totals.resolved,deferred:totals.deferred},items};
    },
    update(id,input) {
      if(!input || !Number.isInteger(input.revision)||input.revision<1)throw new GapWorkflowError('Current revision required');
      for(const [key,min,max] of [['owner',0,100],['actor',2,100],['note',10,1000],['regressionRef',0,300]]) {
        if(typeof input[key]!=='string'||input[key].trim().length<min||input[key].length>max)throw new GapWorkflowError(`Invalid ${key}`);
        assertEnglishText(input[key],key);
      }
      if(!['open','in_progress','resolved','deferred'].includes(input.status)||!['low','normal','high','urgent'].includes(input.priority))throw new GapWorkflowError('Invalid gap status or priority');
      if(['in_progress','resolved'].includes(input.status)&&!input.owner.trim())throw new GapWorkflowError('An owner is required');
      if(input.status==='resolved'&&!/^test\/[a-zA-Z0-9_/-]+\.test\.js(?:#[a-zA-Z0-9_-]+)?$/.test(input.regressionRef))throw new GapWorkflowError('Resolution requires a test/path.test.js regression reference');
      db.exec('BEGIN IMMEDIATE');
      try {
        const previous=get(id);if(!previous)throw new GapWorkflowError('Unknown gap item',404);
        if(previous.revision!==input.revision)throw new GapWorkflowError('Gap changed. Reload before saving.',409);
        db.prepare('UPDATE gap_work_items SET status=?,priority=?,owner=?,regression_ref=?,revision=revision+1 WHERE id=?').run(input.status,input.priority,input.owner.trim(),input.regressionRef,id);
        const next=get(id);event(id,input.actor.trim(),input.note,previous,next,new Date().toISOString());
        db.exec('COMMIT');return next;
      }catch(error){db.exec('ROLLBACK');throw error;}
    }
  };
}
