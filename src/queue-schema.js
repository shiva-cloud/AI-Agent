// Validate compatibility before migrations or journal-mode changes. This is a
// schema gate, not a full integrity check or a substitute for offline backups.
export function queueSchemaVersion(db,{allowEmpty=false}={}) {
  const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(row=>row.name);
  if(!tables.length&&allowEmpty)return 0;
  if(!tables.includes('job_meta')||tables.includes('records'))throw new Error('Unsupported queue schema');
  const versions=db.prepare('SELECT version FROM job_meta ORDER BY version LIMIT 5').all().map(row=>row.version);
  if(!versions.length||versions.length>4||versions.some((version,index)=>version!==index+1))throw new Error('Unsupported queue schema');
  const version=versions.length;
  db.prepare('SELECT id,request_key,kind,target_id,state,attempts,max_attempts,available_at,lease_until,lease_token,worker_id,last_code,created_at,updated_at FROM jobs LIMIT 0').all();
  if(version>=2)db.prepare('SELECT id,kind,target_id,interval_ms,next_run,enabled,max_attempts,revision,last_job_id,last_dispatched FROM job_schedules LIMIT 0').all();
  if(version>=3)db.prepare('SELECT sequence,schedule_id,actor_id,actor_mode,changed_at,before_json,after_json FROM schedule_events LIMIT 0').all();
  if(version>=4)db.prepare('SELECT id,state,last_seen FROM worker_presence LIMIT 0').all();
  return version;
}
