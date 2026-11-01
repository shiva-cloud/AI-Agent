import test from 'node:test';
import assert from 'node:assert/strict';
import {openJobQueue} from '../src/jobs.js';
import {runScheduler} from '../src/scheduler.js';
const spec={scheduleId:'fixture',kind:'verify_snapshot',targetId:'fixture-snapshot',intervalMs:1000,nextRun:1000};

test('due schedules coalesce downtime, avoid overlap, and retain cadence',()=>{
 let now=999;const q=openJobQueue(':memory:',{clock:()=>now});try{
  q.saveSchedule(spec);assert.equal(q.dispatchDue().dispatched.length,0);
  now=10000;const first=q.dispatchDue();assert.equal(first.dispatched.length,1);assert.equal(q.schedules()[0].next_run,11000);
  assert.equal(q.dispatchDue().dispatched.length,0);
  now=11000;assert.deepEqual(q.dispatchDue().skipped,['fixture']);
  const job=q.claim('fixture-worker');q.finish(job.id,job.lease_token);
  now=12000;assert.equal(q.dispatchDue().dispatched.length,1);
 }finally{q.close();}
});

test('schedule revisions protect edits and pausing stops new dispatches',()=>{
 const q=openJobQueue(':memory:',{clock:()=>1000});try{
  const initial=q.saveSchedule(spec);
  assert.throws(()=>q.saveSchedule(spec),/revision conflict/);
  const paused=q.saveSchedule({...spec,revision:initial.revision,enabled:false});assert.equal(q.dispatchDue().dispatched.length,0);
  q.saveSchedule({...spec,revision:paused.revision,enabled:true});assert.equal(q.dispatchDue().dispatched.length,1);
  assert.throws(()=>q.saveSchedule({...spec,revision:paused.revision}),/revision conflict/);
  for(const changes of [{intervalMs:1},{nextRun:-1},{enabled:'true'},{kind:'fetch_any_url'}])assert.throws(()=>q.saveSchedule({...spec,...changes}),/Invalid/);
 }finally{q.close();}
});

test('dispatch batches are bounded without losing deferred schedules',()=>{
 const q=openJobQueue(':memory:',{clock:()=>1000});try{
  for(let i=0;i<3;i++)q.saveSchedule({...spec,scheduleId:`fixture-${i}`});
  assert.equal(q.dispatchDue({limit:2}).dispatched.length,2);assert.equal(q.dispatchDue({limit:2}).dispatched.length,1);
  assert.throws(()=>q.dispatchDue({limit:101}),/Invalid/);
 }finally{q.close();}
});

test('opt-in loop executes fixture jobs then stops without a background timer',async()=>{
 const q=openJobQueue(':memory:');const controller=new AbortController();let calls=0;
 try{
  q.saveSchedule({...spec,nextRun:Date.now()});
  const finish=q.finish;
  q.finish=(...args)=>{const saved=finish(...args);controller.abort();return saved;};
  await runScheduler(q,{signal:controller.signal,pollMs:10,workerId:'fixture-worker',authorize:()=>true,handlers:{verify_snapshot:async()=>{calls++;}}});
  assert.equal(calls,1);assert.equal(q.summary()[0].state,'succeeded');
  await runScheduler(q,{signal:controller.signal,workerId:'fixture-worker',authorize:()=>true});assert.equal(calls,1);
  await assert.rejects(()=>runScheduler(q,{workerId:'fixture-worker',authorize:()=>true}),/AbortSignal/);
 }finally{q.close();}
});
