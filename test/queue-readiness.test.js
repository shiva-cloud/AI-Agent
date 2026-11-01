import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {openJobQueue} from '../src/jobs.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {verifyQueue} from '../src/queue-recovery.js';

test('readiness reflects configured queue failure, recovery and drain without exposing errors',async()=>{
 const store=openStore(':memory:'),queue=openJobQueue(':memory:');
 const original=queue.checkReady;
 const server=createApp(store,undefined,{}, {jobQueue:queue});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
  assert.equal((await fetch(base+'/ready')).status,200);
  queue.checkReady=()=>{throw new Error('private path and secret');};
  const failed=await fetch(base+'/ready');assert.equal(failed.status,503);
  assert.deepEqual(await failed.json(),{status:'not_ready',reason:'queue_unavailable'});
  assert.equal((await fetch(base+'/health')).status,200);
  queue.checkReady=original;assert.equal((await fetch(base+'/ready')).status,200);
  server.beginDrain();assert.equal((await (await fetch(base+'/ready')).json()).reason,'draining');
 }finally{await new Promise(resolve=>server.close(resolve));queue.close();store.db.close();}
});

test('queue readiness is read-only and detects missing tables and unsupported versions',()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-ready-')),path=join(root,'queue.sqlite');
 let queue,db;
 try {
  queue=openJobQueue(path);queue.saveSchedule({scheduleId:'fixture',kind:'reindex',targetId:'fixture-index',intervalMs:1000,nextRun:0});
  const before=verifyQueue(path);queue.checkReady();assert.deepEqual(verifyQueue(path),before);
  const reader=openJobQueue(path,{readOnly:true});try{reader.checkReady();}finally{reader.close();}
  db=new DatabaseSync(path);db.exec('INSERT INTO job_meta VALUES (99)');
  assert.throws(()=>queue.checkReady(),/Unsupported/);db.exec('DELETE FROM job_meta WHERE version=99');
  queue.checkReady();db.exec('DROP TABLE schedule_events');assert.throws(()=>queue.checkReady());
 }finally {
  db?.close();queue?.close();const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-ready-'));rmSync(resolved,{recursive:true,force:true});
 }
});

test('primary database missing records table fails readiness even with an open connection',async()=>{
 const db=new DatabaseSync(':memory:'),server=createApp({db},undefined,{});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/ready`);
  assert.equal(response.status,503);assert.deepEqual(await response.json(),{status:'not_ready',reason:'storage_unavailable'});
 }finally{await new Promise(resolve=>server.close(resolve));db.close();}
});
