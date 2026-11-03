import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {ValidationError} from './api-errors.js';
import {queueSchemaVersion} from './queue-schema.js';

const kinds=new Set(['source_check','verify_snapshot','reindex']);
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value);
const integer=(value,min,max)=>Number.isSafeInteger(value)&&value>=min&&value<=max;
export function openJobQueue(path,{clock=Date.now,readOnly=false}={}) {
  if(typeof path!=='string'||!path.trim())throw new Error('An explicit job database path is required');
  if(!readOnly&&path!==':memory:')mkdirSync(dirname(path),{recursive:true});
  const db=new DatabaseSync(path,{timeout:5000,readOnly});
  try {
    if(db.prepare("SELECT 1 FROM sqlite_master WHERE name='records'").get())throw new Error('Use a separate job database, not the evidence database');
    queueSchemaVersion(db,{allowEmpty:!readOnly});
    if(!readOnly)db.exec(`PRAGMA journal_mode=WAL;
      BEGIN IMMEDIATE;
      CREATE TABLE IF NOT EXISTS jobs(
        id TEXT PRIMARY KEY,request_key TEXT NOT NULL UNIQUE,kind TEXT NOT NULL,target_id TEXT NOT NULL,
        state TEXT NOT NULL CHECK(state IN ('queued','running','succeeded','failed','blocked')),
        attempts INTEGER NOT NULL DEFAULT 0,max_attempts INTEGER NOT NULL,
        available_at INTEGER NOT NULL,lease_until INTEGER,lease_token TEXT,worker_id TEXT,
        last_code TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS jobs_ready ON jobs(state,available_at);
      CREATE TABLE IF NOT EXISTS job_meta(version INTEGER PRIMARY KEY);
      INSERT OR IGNORE INTO job_meta VALUES (1);
      CREATE TABLE IF NOT EXISTS job_schedules(
        id TEXT PRIMARY KEY,kind TEXT NOT NULL,target_id TEXT NOT NULL,interval_ms INTEGER NOT NULL,
        next_run INTEGER NOT NULL,enabled INTEGER NOT NULL CHECK(enabled IN (0,1)),max_attempts INTEGER NOT NULL,
        revision INTEGER NOT NULL,last_job_id TEXT,last_dispatched INTEGER);
      CREATE INDEX IF NOT EXISTS schedules_due ON job_schedules(enabled,next_run);
      INSERT OR IGNORE INTO job_meta VALUES (2);
      CREATE TABLE IF NOT EXISTS schedule_events(
        sequence INTEGER PRIMARY KEY AUTOINCREMENT,schedule_id TEXT NOT NULL,
        actor_id TEXT,actor_mode TEXT NOT NULL,changed_at INTEGER NOT NULL,
        before_json TEXT,after_json TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS schedule_events_page ON schedule_events(schedule_id,sequence);
      CREATE TRIGGER IF NOT EXISTS schedule_events_no_update BEFORE UPDATE ON schedule_events BEGIN SELECT RAISE(ABORT,'Schedule events are immutable'); END;
      CREATE TRIGGER IF NOT EXISTS schedule_events_no_delete BEFORE DELETE ON schedule_events BEGIN SELECT RAISE(ABORT,'Schedule events are immutable'); END;
      INSERT OR IGNORE INTO job_meta VALUES (3);
      CREATE TABLE IF NOT EXISTS worker_presence(id TEXT PRIMARY KEY,state TEXT NOT NULL CHECK(state IN ('running','stopped')),last_seen INTEGER NOT NULL);
      INSERT OR IGNORE INTO job_meta VALUES (4);
      COMMIT;`);
  }catch(error){db.close();throw error;}
  const transact=fn=>{db.exec('BEGIN IMMEDIATE');try{const value=fn();db.exec('COMMIT');return value;}catch(error){db.exec('ROLLBACK');throw error;}};
  const current=jobId=>db.prepare('SELECT * FROM jobs WHERE id=?').get(jobId);
  const owns=(row,token,now)=>row&&row.state==='running'&&row.lease_token===token&&row.lease_until>now;
  return {
    close:()=>db.close(),
    checkReady() {
      const versions=db.prepare('SELECT version FROM job_meta ORDER BY version').all().map(row=>row.version);
      if(JSON.stringify(versions)!=='[1,2,3,4]')throw new Error('Unsupported queue schema');
      // Probe the tables used by admin reads and writes, without changing jobs,
      // acquiring a write transaction or scanning an unbounded queue.
      db.prepare('SELECT id,state,available_at,lease_until FROM jobs LIMIT 1').get();
      db.prepare('SELECT id,revision,next_run,enabled FROM job_schedules LIMIT 1').get();
      db.prepare('SELECT sequence,schedule_id,actor_mode,before_json,after_json FROM schedule_events LIMIT 1').get();
      db.prepare('SELECT id,state,last_seen FROM worker_presence LIMIT 1').get();
    },
    workerPresence(workerId,state='running') {
      if(!id(workerId)||!['running','stopped'].includes(state))throw new ValidationError('Invalid worker presence');
      return transact(()=>{
        const now=clock();db.prepare('DELETE FROM worker_presence WHERE last_seen<?').run(now-604800000);
        if(!db.prepare('SELECT 1 FROM worker_presence WHERE id=?').get(workerId)&&db.prepare('SELECT count(*) n FROM worker_presence').get().n>=1000)throw new Error('Worker presence capacity exceeded');
        db.prepare('INSERT INTO worker_presence VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,last_seen=excluded.last_seen').run(workerId,state,now);
      });
    },
    get:jobId=>current(jobId),
    health({queueAgeMs=300000,scheduleLagMs=300000}={}) {
      if(!integer(queueAgeMs,1000,86400000)||!integer(scheduleLagMs,1000,86400000))throw new ValidationError('Invalid queue health thresholds');
      const now=clock();db.exec('BEGIN');
      try {
        const states={queued:0,running:0,succeeded:0,failed:0,blocked:0};
        for(const row of db.prepare('SELECT state,count(*) count FROM jobs GROUP BY state').all())states[row.state]=row.count;
        const ready=db.prepare("SELECT count(*) count,min(available_at) oldest FROM jobs WHERE state='queued' AND available_at<=?").get(now);
        const overdue=db.prepare("SELECT count(*) count FROM jobs WHERE state='queued' AND available_at<=?").get(now-queueAgeMs).count;
        const expired=db.prepare("SELECT count(*) count FROM jobs WHERE state='running' AND lease_until<=?").get(now).count;
        const schedules=db.prepare('SELECT count(*) count,min(next_run) oldest FROM job_schedules WHERE enabled=1 AND next_run<=?').get(now);
        const late=db.prepare('SELECT count(*) count FROM job_schedules WHERE enabled=1 AND next_run<=?').get(now-scheduleLagMs).count;
        const presenceAvailable=!!db.prepare("SELECT 1 FROM sqlite_master WHERE name='worker_presence'").get();
        const workers=presenceAvailable?db.prepare("SELECT sum(CASE WHEN state='running' AND last_seen>? THEN 1 ELSE 0 END) active,sum(CASE WHEN state='running' AND last_seen<=? THEN 1 ELSE 0 END) stale,sum(CASE WHEN state='stopped' THEN 1 ELSE 0 END) stopped FROM worker_presence").get(now-30000,now-30000):null;
        db.exec('COMMIT');
        const alerts=[];
        if(workers?.stale)alerts.push({code:'worker_heartbeat_stale',count:workers.stale,action:'Check registered worker processes; heartbeat is older than 30 seconds.'});
        if(overdue)alerts.push({code:'queue_wait_exceeded',count:overdue,action:'Check worker availability, capacity and retry failures.'});
        if(expired)alerts.push({code:'expired_job_leases',count:expired,action:'Check worker shutdown or crashes; the next claim recovers expired leases.'});
        if(late)alerts.push({code:'schedule_dispatch_late',count:late,action:'Check that the scheduler service is running against this queue.'});
        if(states.failed)alerts.push({code:'failed_jobs_retained',count:states.failed,action:'Inspect failed jobs and fix their cause before explicitly scheduling replacement work.'});
        if(states.blocked)alerts.push({code:'blocked_jobs_retained',count:states.blocked,action:'Inspect authorization or missing handlers; do not bypass source policy.'});
        return {asOf:new Date(now).toISOString(),status:alerts.length?'attention':'ok',states,workers:workers?{active:workers.active||0,stale:workers.stale||0,stopped:workers.stopped||0}:null,
          readyJobs:ready.count,oldestReadyAgeMs:ready.oldest===null?null:now-ready.oldest,
          expiredLeases:expired,dueSchedules:schedules.count,oldestScheduleLagMs:schedules.oldest===null?null:now-schedules.oldest,
          thresholds:{queueAgeMs,scheduleLagMs},alerts};
      }catch(error){try{db.exec('ROLLBACK');}catch(rbErr){console.warn('[jobs:rollback]', rbErr.message);}throw error;}
    },
    list({after='',limit=100}={}) {
      if(typeof after!=='string'||(after&&!/^[a-f0-9-]{36}$/.test(after))||!integer(limit,1,100))throw new ValidationError('Invalid queue page');
      const rows=db.prepare('SELECT id,kind,target_id,state,attempts,max_attempts,available_at,lease_until,last_code,created_at,updated_at FROM jobs WHERE id>? ORDER BY id LIMIT ?').all(after,limit+1);
      return {items:rows.slice(0,limit),nextCursor:rows.length>limit?rows[limit-1].id:null};
    },
    prune({before,limit=100}={}) {
      if(!integer(before,0,clock())||!integer(limit,1,1000))throw new Error('Invalid retention boundary');
      return transact(()=>{
        const rows=db.prepare("SELECT id FROM jobs WHERE state IN ('succeeded','failed','blocked') AND updated_at<? AND id NOT IN (SELECT last_job_id FROM job_schedules WHERE last_job_id IS NOT NULL) ORDER BY updated_at,id LIMIT ?").all(before,limit);
        const remove=db.prepare('DELETE FROM jobs WHERE id=?');for(const row of rows)remove.run(row.id);
        return {deleted:rows.length};
      });
    },
    schedules:()=>db.prepare('SELECT * FROM job_schedules ORDER BY id LIMIT 1000').all(),
    scheduleHistory(scheduleId,{after=0,limit=100}={}) {
      if(!id(scheduleId)||!integer(after,0,Number.MAX_SAFE_INTEGER)||!integer(limit,1,100))throw new ValidationError('Invalid schedule history page');
      if(!db.prepare('SELECT 1 FROM job_schedules WHERE id=?').get(scheduleId))throw new ValidationError('Schedule not found',404);
      const rows=db.prepare('SELECT * FROM schedule_events WHERE schedule_id=? AND sequence>? ORDER BY sequence LIMIT ?').all(scheduleId,after,limit+1);
      return {items:rows.slice(0,limit).map(({before_json,after_json,...row})=>({...row,before:before_json?JSON.parse(before_json):null,after:JSON.parse(after_json)})),nextCursor:rows.length>limit?rows[limit-1].sequence:null};
    },
    saveSchedule({scheduleId,kind,targetId,intervalMs,nextRun,enabled=true,maxAttempts=3,revision=0},identity={mode:'local',id:null}) {
      if(!identity||!['local','legacy','individual'].includes(identity.mode)||(identity.mode==='individual'?!id(identity.id):identity.id!==null))throw new ValidationError('Invalid schedule audit identity');
      if(!id(scheduleId)||!id(targetId)||!kinds.has(kind)||!integer(intervalMs,1000,604800000)||!integer(nextRun,0,Number.MAX_SAFE_INTEGER-604800000)||typeof enabled!=='boolean'||!integer(maxAttempts,1,10)||!integer(revision,0,Number.MAX_SAFE_INTEGER))throw new ValidationError('Invalid schedule specification');
      return transact(()=>{
        const previous=db.prepare('SELECT * FROM job_schedules WHERE id=?').get(scheduleId);
        if((previous?.revision||0)!==revision)throw new ValidationError('Schedule revision conflict',409);
        if(!previous&&db.prepare('SELECT count(*) AS n FROM job_schedules').get().n>=1000)throw new ValidationError('Schedule limit reached',409);
        db.prepare(`INSERT INTO job_schedules(id,kind,target_id,interval_ms,next_run,enabled,max_attempts,revision) VALUES (?,?,?,?,?,?,?,1)
          ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,target_id=excluded.target_id,interval_ms=excluded.interval_ms,next_run=excluded.next_run,enabled=excluded.enabled,max_attempts=excluded.max_attempts,revision=job_schedules.revision+1`).run(scheduleId,kind,targetId,intervalMs,nextRun,Number(enabled),maxAttempts);
        const updated=db.prepare('SELECT * FROM job_schedules WHERE id=?').get(scheduleId);
        db.prepare('INSERT INTO schedule_events(schedule_id,actor_id,actor_mode,changed_at,before_json,after_json) VALUES (?,?,?,?,?,?)').run(scheduleId,identity.id,identity.mode,clock(),previous?JSON.stringify(previous):null,JSON.stringify(updated));
        return updated;
      });
    },
    dispatchDue({limit=100}={}) {
      if(!integer(limit,1,100))throw new Error('Invalid dispatch limit');
      return transact(()=>{
        const now=clock(),dispatched=[],skipped=[];
        const due=db.prepare('SELECT * FROM job_schedules WHERE enabled=1 AND next_run<=? ORDER BY next_run,id LIMIT ?').all(now,limit);
        for(const schedule of due) {
          // Coalesce downtime to one dispatch; maintain cadence beyond now.
          const next=schedule.next_run+(Math.floor((now-schedule.next_run)/schedule.interval_ms)+1)*schedule.interval_ms;
          if(!Number.isSafeInteger(next))throw new Error('Schedule time exceeds safe range');
          const last=schedule.last_job_id?current(schedule.last_job_id):null;
          let jobId=schedule.last_job_id;
          if(last&&['queued','running'].includes(last.state))skipped.push(schedule.id);
          else {
            // The ':' namespace cannot collide with user enqueue request keys.
            const key=`schedule:${schedule.id}:${schedule.revision}:${schedule.next_run}`;
            jobId=randomUUID();
            db.prepare("INSERT INTO jobs(id,request_key,kind,target_id,state,max_attempts,available_at,created_at,updated_at) VALUES (?,?,?,?,'queued',?,?,?,?)").run(jobId,key,schedule.kind,schedule.target_id,schedule.max_attempts,now,now,now);
            dispatched.push({scheduleId:schedule.id,jobId});
          }
          db.prepare('UPDATE job_schedules SET next_run=?,last_job_id=?,last_dispatched=?,revision=revision+1 WHERE id=?').run(next,jobId,jobId===schedule.last_job_id?schedule.last_dispatched:now,schedule.id);
        }
        return {dispatched,skipped};
      });
    },
    enqueue({requestKey,kind,targetId,maxAttempts=3,availableAt=clock()}) {
      if(!id(requestKey)||!id(targetId)||!kinds.has(kind)||!integer(maxAttempts,1,10)||!integer(availableAt,0,Number.MAX_SAFE_INTEGER))throw new Error('Invalid job specification');
      return transact(()=>{
        const prior=db.prepare('SELECT * FROM jobs WHERE request_key=?').get(requestKey);
        if(prior){if(prior.kind!==kind||prior.target_id!==targetId||prior.max_attempts!==maxAttempts)throw new Error('Job idempotency conflict');return prior;}
        const now=clock(),jobId=randomUUID();
        db.prepare("INSERT INTO jobs(id,request_key,kind,target_id,state,max_attempts,available_at,created_at,updated_at) VALUES (?,?,?,?,'queued',?,?,?,?)").run(jobId,requestKey,kind,targetId,maxAttempts,availableAt,now,now);
        return current(jobId);
      });
    },
    claim(workerId,{leaseMs=30000}={}) {
      if(!id(workerId)||!integer(leaseMs,100,300000))throw new Error('Invalid worker or lease duration');
      return transact(()=>{
        const now=clock();
        db.prepare("UPDATE jobs SET state=CASE WHEN attempts>=max_attempts THEN 'failed' ELSE 'queued' END,lease_token=NULL,lease_until=NULL,worker_id=NULL,last_code='lease_expired',updated_at=? WHERE state='running' AND lease_until<=?").run(now,now);
        const next=db.prepare("SELECT id FROM jobs WHERE state='queued' AND attempts<max_attempts AND available_at<=? ORDER BY available_at,created_at,id LIMIT 1").get(now);
        if(!next)return null;
        db.prepare("UPDATE jobs SET state='running',attempts=attempts+1,lease_token=?,lease_until=?,worker_id=?,updated_at=? WHERE id=?").run(randomUUID(),now+leaseMs,workerId,now,next.id);
        return current(next.id);
      });
    },
    heartbeat(jobId,token,leaseMs=30000) {
      if(!integer(leaseMs,100,300000))throw new Error('Invalid lease duration');
      return transact(()=>{const now=clock();if(!owns(current(jobId),token,now))return false;
        db.prepare('UPDATE jobs SET lease_until=?,updated_at=? WHERE id=?').run(now+leaseMs,now,jobId);return true;});
    },
    finish(jobId,token,{outcome='succeeded',code='',retryDelayMs=1000}={}) {
      if(!['succeeded','failed','blocked'].includes(outcome)||!['','handler_failed','policy_denied','handler_missing','deadline_exceeded','worker_stopped'].includes(code)||!integer(retryDelayMs,0,86400000))throw new Error('Invalid job outcome');
      return transact(()=>{
        const now=clock(),row=current(jobId);if(!owns(row,token,now))return false;
        const state=outcome==='failed'&&row.attempts<row.max_attempts?'queued':outcome;
        db.prepare('UPDATE jobs SET state=?,available_at=?,lease_token=NULL,lease_until=NULL,worker_id=NULL,last_code=?,updated_at=? WHERE id=?').run(state,now+retryDelayMs,code,now,jobId);return true;
      });
    },
    summary:()=>db.prepare('SELECT state,count(*) AS count FROM jobs GROUP BY state ORDER BY state').all()
  };
}
