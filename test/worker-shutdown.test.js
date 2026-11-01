import test from 'node:test';
import assert from 'node:assert/strict';
import {getEventListeners} from 'node:events';
import {openJobQueue} from '../src/jobs.js';
import {runOneJob} from '../src/job-worker.js';
import {runScheduler} from '../src/scheduler.js';

const enqueue=(queue,maxAttempts=3)=>queue.enqueue({requestKey:'fixture-stop',kind:'reindex',targetId:'fixture-index',maxAttempts});
test('an already stopped worker does not claim or consume an attempt',async()=>{
 const queue=openJobQueue(':memory:'),controller=new AbortController();
 try {
  const job=enqueue(queue);controller.abort();
  assert.deepEqual(await runOneJob(queue,{workerId:'fixture-worker',authorize:()=>true,signal:controller.signal}),{status:'stopped'});
  assert.equal(queue.get(job.id).attempts,0);assert.equal(queue.get(job.id).state,'queued');
 }finally{queue.close();}
});

test('shutdown aborts pending authorization and late approval cannot start a handler',async()=>{
 const queue=openJobQueue(':memory:'),controller=new AbortController();let approve,started,executions=0;
 const began=new Promise(resolve=>{started=resolve;});
 try {
  const job=enqueue(queue);
  const running=runOneJob(queue,{workerId:'fixture-worker',signal:controller.signal,authorize:()=>{started();return new Promise(resolve=>{approve=resolve;});},handlers:{reindex:()=>{executions++;}}});
  await began;controller.abort();const result=await running;
  assert.equal(result.code,'worker_stopped');assert.equal(result.status,'queued');
  const saved=queue.get(job.id);assert.equal(saved.lease_token,null);assert.equal(saved.worker_id,null);assert.equal(saved.attempts,1);
  approve(true);await new Promise(resolve=>setImmediate(resolve));assert.equal(executions,0);
  assert.equal(getEventListeners(controller.signal,'abort').length,0);
 }finally{queue.close();}
});

test('scheduler stop reaches the active handler and late completion cannot overwrite the saved result',async()=>{
 const queue=openJobQueue(':memory:'),controller=new AbortController();let started,finish,handlerSignal;
 const began=new Promise(resolve=>{started=resolve;});
 try {
  const job=enqueue(queue,1);
  const running=runScheduler(queue,{workerId:'fixture-worker',signal:controller.signal,pollMs:10,authorize:()=>true,handlers:{reindex:({signal})=>{handlerSignal=signal;started();return new Promise(resolve=>{finish=resolve;});}}});
  await began;controller.abort();await running;
  assert.equal(handlerSignal.aborted,true);assert.equal(queue.get(job.id).state,'failed');assert.equal(queue.get(job.id).last_code,'worker_stopped');
  finish();await new Promise(resolve=>setImmediate(resolve));assert.equal(queue.get(job.id).state,'failed');
  assert.equal(getEventListeners(controller.signal,'abort').length,0);
 }finally{queue.close();}
});

test('successful jobs remove their external shutdown listener',async()=>{
 const queue=openJobQueue(':memory:'),controller=new AbortController();
 try {
  enqueue(queue);const result=await runOneJob(queue,{workerId:'fixture-worker',signal:controller.signal,authorize:()=>true,handlers:{reindex:()=>{}}});
  assert.equal(result.status,'succeeded');assert.equal(getEventListeners(controller.signal,'abort').length,0);
 }finally{queue.close();}
});
