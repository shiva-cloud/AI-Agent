import test from 'node:test';
import assert from 'node:assert/strict';
import {openJobQueue} from '../src/jobs.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';

test('health distinguishes future work, backlog, expired leases and disabled schedules without executing anything',()=>{
 let now=0;const queue=openJobQueue(':memory:',{clock:()=>now});
 try {
  assert.equal(queue.health().status,'ok');assert.equal(queue.health().oldestReadyAgeMs,null);
  const running=queue.enqueue({requestKey:'running',kind:'reindex',targetId:'private-fixture'});queue.claim('private-worker',{leaseMs:1000});
  queue.enqueue({requestKey:'queued',kind:'reindex',targetId:'private-fixture'});
  queue.enqueue({requestKey:'future',kind:'reindex',targetId:'private-fixture',availableAt:1000000});
  queue.saveSchedule({scheduleId:'enabled',kind:'reindex',targetId:'all',intervalMs:60000,nextRun:0});
  queue.saveSchedule({scheduleId:'disabled',kind:'reindex',targetId:'all',intervalMs:60000,nextRun:0,enabled:false});
  now=300000;const before=queue.get(running.id),report=queue.health();
  assert.equal(report.readyJobs,1);assert.equal(report.oldestReadyAgeMs,300000);assert.equal(report.expiredLeases,1);assert.equal(report.dueSchedules,1);
  assert.deepEqual(report.alerts.map(a=>a.code),['queue_wait_exceeded','expired_job_leases','schedule_dispatch_late']);
  assert.deepEqual(queue.get(running.id),before);assert.equal(queue.list().items.length,3);assert.equal(queue.schedules()[0].revision,1);
  assert.equal(JSON.stringify(report).includes('private'),false);
  assert.throws(()=>queue.health({queueAgeMs:0}));
 }finally{queue.close();}
});

test('health reports retained failures and policy blocks as separate signals',()=>{
 const queue=openJobQueue(':memory:');
 try {
  for(const outcome of ['failed','blocked']) {
   queue.enqueue({requestKey:outcome,kind:'reindex',targetId:'all',maxAttempts:1});const job=queue.claim('fixture');queue.finish(job.id,job.lease_token,{outcome,code:outcome==='failed'?'handler_failed':'policy_denied'});
  }
  assert.deepEqual(queue.health().alerts.map(a=>a.code),['failed_jobs_retained','blocked_jobs_retained']);
 }finally{queue.close();}
});

test('queue health API is authenticated and accepts read-only roles',async()=>{
 const store=openStore(':memory:'),queue=openJobQueue(':memory:'),token='fixture-reader-'+ 'x'.repeat(32);
 const server=createApp(store,undefined,{}, {jobQueue:queue,actors:[{id:'fixture-reader',role:'reader',token}]});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/admin/job-health`;
 try {
  assert.equal((await fetch(url)).status,401);
  const response=await fetch(url,{headers:{Authorization:'Bearer '+token}});assert.equal(response.status,200);assert.equal((await response.json()).status,'ok');
 }finally{await new Promise(resolve=>server.close(resolve));queue.close();store.db.close();}
});
