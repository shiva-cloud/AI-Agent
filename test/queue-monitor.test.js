import test from 'node:test';
import assert from 'node:assert/strict';
import {monitorQueue} from '../src/queue-monitor.js';
import {openJobQueue} from '../src/jobs.js';
import {getEventListeners} from 'node:events';
const ok={status:'ok',alerts:[]};
const attention=(count=1)=>({status:'attention',alerts:[{code:'queue_wait_exceeded',count}]});
async function sequence(reports,onEvent) {
 const controller=new AbortController();let index=0;const events=[];
 const result=await monitorQueue({signal:controller.signal,readHealth:()=>{const value=reports[index++];if(value instanceof Error)throw value;return value;},
  onEvent:onEvent??(event=>events.push(event)),wait:async()=>{if(index===reports.length)controller.abort();}});
 return {result,events};
}

test('monitor stays quiet when healthy and emits only condition transitions and recovery',async()=>{
 const {events,result}=await sequence([ok,ok,attention(),attention(2),{status:'attention',alerts:[{code:'expired_job_leases',count:1}]},ok,ok]);
 assert.deepEqual(events.map(e=>e.event),['queue_monitor_attention','queue_monitor_attention','queue_monitor_recovered']);
 assert.equal(result.polls,7);assert.equal(result.events,3);
});
test('unavailable and malformed health are sanitized, deduplicated and recover',async()=>{
 const {events,result}=await sequence([new Error('private path token'),new Error('secret'),{status:'attention',alerts:[{code:'private',count:1}]},ok]);
 assert.deepEqual(events.map(e=>e.event),['queue_monitor_unavailable','queue_monitor_recovered']);assert.equal(result.readFailures,3);
 assert.ok(!JSON.stringify(events).match(/private|secret|token/));
});
test('failed output delivery is retried and cannot silently acknowledge an alert',async()=>{
 let calls=0;const {result}=await sequence([attention(),attention(),attention()],()=>{if(++calls===1)throw new Error('sink failed');});
 assert.equal(calls,2);assert.equal(result.deliveryFailures,1);assert.equal(result.events,1);
});
test('monitor reads real queue health without dispatching or mutating jobs',async()=>{
 let now=0;const queue=openJobQueue(':memory:',{clock:()=>now}),controller=new AbortController(),events=[];
 try {
  const job=queue.enqueue({requestKey:'fixture',kind:'reindex',targetId:'private-fixture'});now=300000;
  const before=queue.get(job.id);
  await monitorQueue({signal:controller.signal,readHealth:()=>queue.health(),onEvent:event=>events.push(event),wait:async()=>controller.abort()});
  assert.deepEqual(queue.get(job.id),before);assert.equal(events[0].alerts[0].code,'queue_wait_exceeded');assert.ok(!JSON.stringify(events).includes('private'));
 }finally{queue.close();}
});
test('shutdown interrupts polling delay and pre-aborted monitor performs no reads',async()=>{
 const controller=new AbortController();let entered;const waiting=new Promise(resolve=>entered=resolve);
 const pending=monitorQueue({signal:controller.signal,readHealth:()=>ok,onEvent:()=>{},wait:(_ms,_value,{signal})=>new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>reject(new Error('stop')),{once:true});entered();})});
 await waiting;controller.abort();assert.equal((await pending).polls,1);
 assert.equal((await monitorQueue({signal:controller.signal,readHealth:()=>assert.fail(),onEvent:()=>{}})).polls,0);
 await assert.rejects(monitorQueue({signal:controller.signal,readHealth:()=>ok,onEvent:()=>{},intervalMs:0}),/configuration/);
});

test('stalled health reads and output delivery time out without starting overlapping operations',async()=>{
 for(const stalled of ['read','delivery']) {
  const controller=new AbortController();let reads=0,deliveries=0,operationSignal;
  const pending=monitorQueue({signal:controller.signal,operationTimeoutMs:20,
   readHealth:({signal})=>{reads++;if(stalled==='read'){operationSignal=signal;return new Promise(()=>{});}return attention();},
   onEvent:(_event,{signal})=>{deliveries++;operationSignal=signal;return new Promise(()=>{});},
   wait:()=>assert.fail('Timed out operations must not be retried')});
  await assert.rejects(pending,{code:'monitor_timeout'});
  assert.equal(reads,1);assert.equal(deliveries,stalled==='read'?0:1);assert.equal(operationSignal.aborted,true);
  assert.equal(getEventListeners(controller.signal,'abort').length,0);
 }
});

test('shutdown detaches an uncooperative callback and late rejection is handled',async()=>{
 const controller=new AbortController();let entered,rejectRead,operationSignal;
 const began=new Promise(resolve=>entered=resolve);
 const pending=monitorQueue({signal:controller.signal,readHealth:({signal})=>{operationSignal=signal;entered();return new Promise((_,reject)=>rejectRead=reject);},onEvent:()=>assert.fail()});
 await began;controller.abort();const result=await pending;
 assert.equal(result.status,'stopped');assert.equal(result.events,0);assert.equal(operationSignal.aborted,true);
 rejectRead(new Error('private late rejection'));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(getEventListeners(controller.signal,'abort').length,0);
});

test('completed operations release cancellation listeners and timeout validation is fail-closed',async()=>{
 const controller=new AbortController();
 await monitorQueue({signal:controller.signal,readHealth:()=>attention(),onEvent:()=>{},wait:async()=>controller.abort()});
 assert.equal(getEventListeners(controller.signal,'abort').length,0);
 for(const operationTimeoutMs of [0,60001,NaN,1.5])await assert.rejects(monitorQueue({signal:controller.signal,readHealth:()=>ok,onEvent:()=>{},operationTimeoutMs}),/configuration/);
});
