import test from 'node:test';
import assert from 'node:assert/strict';
import {runBackupService} from '../src/backup-service.js';

test('retention runs only after success and its failure does not retry a completed backup',async()=>{
 const controller=new AbortController(),events=[];let backups=0,retentions=0;
 const result=await runBackupService({signal:controller.signal,backup:async()=>{if(++backups===1)throw new Error();},retention:async()=>{retentions++;throw new Error('private');},wait:async ms=>{if(ms===86400000)controller.abort();},onEvent:event=>events.push(event)});
 assert.equal(backups,2);assert.equal(retentions,1);assert.equal(result.successes,1);assert.equal(result.retentionFailures,1);assert.equal(events.at(-1).event,'backup_retention_failed');assert.ok(!JSON.stringify(events).includes('private'));
});

test('failed backups and shutdown never start retention',async()=>{
 for(const fail of [true,false]) {
  const controller=new AbortController();
  await runBackupService({signal:controller.signal,backup:async()=>{controller.abort();if(fail)throw new Error();},retention:()=>assert.fail('retention must not start')});
 }
});

test('scheduled backups retry transient failures without overlapping and use fixed-delay cadence',async()=>{
 const controller=new AbortController(),events=[],waits=[];let calls=0,active=0;
 const result=await runBackupService({signal:controller.signal,intervalMs:60000,retryDelayMs:1000,backup:async()=>{assert.equal(active++,0);await Promise.resolve();active--;if(++calls===1)throw new Error('secret path');},wait:async ms=>{waits.push(ms);if(ms===60000)controller.abort();},onEvent:event=>events.push(event)});
 assert.equal(result.successes,1);assert.equal(result.failures,1);assert.deepEqual(waits,[1000,60000]);assert.equal(JSON.stringify(events).includes('secret'),false);
});
test('failed cycle exhausts retry budget then waits for the next interval',async()=>{
 const controller=new AbortController(),events=[];let calls=0;
 const result=await runBackupService({signal:controller.signal,maxRetries:2,backup:async()=>{calls++;throw new Error();},wait:async ms=>{if(ms===86400000)controller.abort();},onEvent:event=>events.push(event)});
 assert.equal(calls,3);assert.equal(result.failures,3);assert.equal(events.at(-1).event,'backup_cycle_exhausted');
});
test('shutdown waits for an active backup and starts no further backup',async()=>{
 const controller=new AbortController();let finish,entered;const began=new Promise(r=>{entered=r;});let calls=0;
 const running=runBackupService({signal:controller.signal,backup:()=>{calls++;entered();return new Promise(r=>{finish=r;});}});
 await began;controller.abort();finish();assert.equal((await running).successes,1);assert.equal(calls,1);
 const result=await runBackupService({signal:controller.signal,backup:()=>{assert.fail('must not run');}});assert.equal(result.successes,0);
});
test('shutdown after failure and logging failure do not mask backup result',async()=>{
 const controller=new AbortController();
 const result=await runBackupService({signal:controller.signal,backup:async()=>{controller.abort();throw new Error();},onEvent:()=>{throw new Error();}});
 assert.equal(result.failures,1);assert.equal(result.eventFailures,1);
 await assert.rejects(()=>runBackupService({signal:controller.signal,backup:()=>{},intervalMs:0}),/configuration/);
});
test('shutdown interrupts an in-progress retry delay',async()=>{
 const controller=new AbortController();let waiting;const began=new Promise(r=>{waiting=r;});
 const running=runBackupService({signal:controller.signal,backup:async()=>{throw new Error();},wait:(_ms,_value,{signal})=>new Promise((_,reject)=>{signal.addEventListener('abort',()=>reject(new Error('stopped')),{once:true});waiting();})});
 await began;controller.abort();const result=await running;assert.equal(result.failures,1);assert.equal(result.status,'stopped');
});

test('stalled asynchronous logging has one in-flight slot and cannot block backup or shutdown',async()=>{
 const controller=new AbortController();let backups=0,logs=0,rejectLog;
 const result=await runBackupService({signal:controller.signal,backup:async()=>{backups++;},
  onEvent:()=>{logs++;return new Promise((_,reject)=>rejectLog=reject);},
  wait:async()=>{if(backups===4)controller.abort();}});
 assert.equal(result.successes,4);assert.equal(logs,1);assert.equal(result.eventDrops,3);assert.equal(result.eventPending,true);
 rejectLog(new Error('late private logger failure'));await new Promise(resolve=>setImmediate(resolve));
});

test('settled logger rejection releases capacity for later backup events',async()=>{
 const controller=new AbortController();let backups=0,logs=0,rejectLog;
 const result=await runBackupService({signal:controller.signal,backup:async()=>{backups++;},
  onEvent:()=>{logs++;return logs===1?new Promise((_,reject)=>rejectLog=reject):undefined;},
  wait:async()=>{if(backups===1){rejectLog(new Error('sink failed'));await new Promise(resolve=>setImmediate(resolve));}else controller.abort();}});
 assert.equal(result.successes,2);assert.equal(logs,2);assert.equal(result.eventFailures,1);assert.equal(result.eventDrops,0);assert.equal(result.eventPending,false);
});

test('invalid logger rejects before any backup and hostile thenable failures are isolated',async()=>{
 const controller=new AbortController();
 await assert.rejects(runBackupService({signal:controller.signal,backup:()=>assert.fail(),onEvent:null}),/configuration/);
 const result=await runBackupService({signal:controller.signal,backup:async()=>{},onEvent:()=>({get then(){throw new Error('private');}}),wait:async()=>controller.abort()});
 assert.equal(result.successes,1);assert.equal(result.eventFailures,1);assert.equal(result.eventPending,false);
});
