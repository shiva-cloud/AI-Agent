import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {openJobQueue} from '../src/jobs.js';
import {verifyQueue,backupQueue,restoreQueueDrill} from '../src/queue-recovery.js';
import {randomBytes} from 'node:crypto';
const spec={scheduleId:'audit-fixture',kind:'reindex',targetId:'index-fixture',intervalMs:60000,nextRun:0};

test('schedule audit records accepted changes only and distinguishes local from authenticated actors',()=>{
 const q=openJobQueue(':memory:',{clock:()=>1000});
 try {
  q.saveSchedule(spec);
  q.saveSchedule({...spec,revision:1,enabled:false},{mode:'individual',id:'fixture-admin'});
  assert.throws(()=>q.saveSchedule({...spec,revision:1}),/conflict/);
  assert.throws(()=>q.saveSchedule({...spec,revision:2},{mode:'individual',id:null}),/identity/);
  const events=q.scheduleHistory(spec.scheduleId).items;
  assert.equal(events.length,2);assert.equal(events[0].actor_mode,'local');assert.equal(events[0].actor_id,null);
  assert.equal(events[1].actor_id,'fixture-admin');assert.equal(events[1].changed_at,1000);
  assert.equal(events[1].before.enabled,1);assert.equal(events[1].after.enabled,0);
  q.dispatchDue();assert.equal(q.scheduleHistory(spec.scheduleId).items.length,2);
 }finally{q.close();}
});

test('v2 recovery remains compatible; migration preserves schedules and audit failures roll back writes',async()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-schedule-audit-')),file=join(root,'queue.sqlite');
 let q,db;const key=randomBytes(32);
 try {
  q=openJobQueue(file);q.saveSchedule(spec);q.close();q=null;
  db=new DatabaseSync(file);
  db.exec('DROP TRIGGER schedule_events_no_update; DROP TRIGGER schedule_events_no_delete; DROP TABLE schedule_events; DROP TABLE worker_presence; DELETE FROM job_meta WHERE version>=3;');
  db.close();db=null;
  const before=verifyQueue(file);
  const saved=await backupQueue(file,join(root,'backup'),key),restored=await restoreQueueDrill(saved.directory,join(root,'restore'),key);
  assert.deepEqual(restored.verification,before);
  q=openJobQueue(file);assert.equal(q.schedules()[0].revision,1);assert.equal(q.scheduleHistory(spec.scheduleId).items.length,0);
  q.saveSchedule({...spec,revision:1,enabled:false},{mode:'legacy',id:null});
  db=new DatabaseSync(file);
  assert.throws(()=>db.exec('UPDATE schedule_events SET actor_id=\'tampered\''),/immutable/);
  assert.throws(()=>db.exec('DELETE FROM schedule_events'),/immutable/);
  db.exec("CREATE TRIGGER fixture_block_audit BEFORE INSERT ON schedule_events BEGIN SELECT RAISE(ABORT,'fixture audit failure'); END;");
  assert.throws(()=>q.saveSchedule({...spec,revision:2}),/fixture audit failure/);
  assert.equal(q.schedules()[0].revision,2);assert.equal(q.schedules()[0].enabled,0);assert.equal(q.scheduleHistory(spec.scheduleId).items.length,1);
  db.exec('DROP TRIGGER fixture_block_audit');
  const digest=verifyQueue(file).dataDigest;
  q.saveSchedule({...spec,revision:2});assert.notEqual(verifyQueue(file).dataDigest,digest);
 }finally {
  db?.close();q?.close();key.fill(0);
  const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-schedule-audit-'));rmSync(resolved,{recursive:true,force:true});
 }
});
