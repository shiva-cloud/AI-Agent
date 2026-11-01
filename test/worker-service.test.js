import test from 'node:test';
import assert from 'node:assert/strict';
import {superviseWorker} from '../src/worker-service.js';
import {openJobQueue} from '../src/jobs.js';
test('supervised instances record presence and clean shutdown; stale workers remain detectable on idle queues',async()=>{
 let now=100000;const queue=openJobQueue(':memory:',{clock:()=>now}),controller=new AbortController();
 try {
  queue.workerPresence('crashed-instance');now+=30000;
  assert.equal(queue.health().workers.stale,1);assert.equal(queue.health().alerts[0].code,'worker_heartbeat_stale');
  queue.dispatchDue=()=>{assert.equal(queue.health().workers.active,1);controller.abort();};
  await superviseWorker(queue,{signal:controller.signal,workerId:'fixture',authorize:()=>true});
  assert.deepEqual(queue.health().workers,{active:0,stale:1,stopped:1});
  now+=604800001;queue.workerPresence('fresh-instance');assert.deepEqual(queue.health().workers,{active:1,stale:0,stopped:0});
 }finally{queue.close();}
});
test('supervisor retries transient dispatch failure and stops on cancellation',async()=>{
 const controller=new AbortController();let calls=0;const events=[];
 const queue={dispatchDue(){if(++calls===1)throw new Error('secret details');controller.abort();}};
 const result=await superviseWorker(queue,{signal:controller.signal,workerId:'fixture',authorize:()=>true,restartDelayMs:1,onRestart:event=>events.push(event)});
 assert.equal(result.restarts,1);assert.equal(result.status,'stopped');assert.equal(events.length,1);assert.ok(!JSON.stringify(events).includes('secret'));
});
test('supervisor exhausts bounded retries rather than restarting forever',async()=>{
 const controller=new AbortController();let calls=0;
 await assert.rejects(()=>superviseWorker({dispatchDue(){calls++;throw new Error('failure');}},{signal:controller.signal,authorize:()=>true,workerId:'fixture',maxRestarts:2,restartDelayMs:1}),/budget exhausted/);
 assert.equal(calls,3);
});
