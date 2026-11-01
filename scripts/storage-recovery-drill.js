import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';

export async function runStorageRecoveryDrill({concurrency=8}={}) {
 if(!Number.isInteger(concurrency)||concurrency<1||concurrency>16)throw new Error('Concurrency must be 1–16');
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-storage-drill-')),file=join(root,'fixture.sqlite');
 let store,lock,server,locked=false;const events=[];
 try {
  store=openStore(file);lock=new DatabaseSync(file);
  server=createApp(store,null,{}, {logger:event=>events.push(event)});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin=`http://127.0.0.1:${server.address().port}`;
  const batch=()=>Promise.all(Array.from({length:concurrency},async()=>{
   const started=performance.now();
   const response=await fetch(origin+'/v1/answers',{method:'POST',signal:AbortSignal.timeout(Math.max(10000,concurrency*7000)),headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Toronto library internet'})});
   return {status:response.status,retryAfter:response.headers.get('retry-after'),body:await response.json(),latencyMs:performance.now()-started};
  }));
  const counts=()=>Object.fromEntries(['traces','gaps','gap_work_items','gap_work_events'].map(name=>[name,store.db.prepare(`SELECT count(*) n FROM ${name}`).get().n]));
  const before=await batch();assert.ok(before.every(r=>r.status===200));
  const baseline=counts();
  lock.exec('BEGIN IMMEDIATE');locked=true;
  const during=await batch();
  assert.ok(during.every(r=>r.status===503&&r.body.code==='storage_busy'&&r.retryAfter==='1'));
  assert.deepEqual(counts(),baseline,'Failed requests must not persist partial records');
  lock.exec('ROLLBACK');locked=false;
  const after=await batch();assert.ok(after.every(r=>r.status===200));
  assert.equal(counts().traces,2*concurrency);
  assert.equal(new Set([...before,...after].map(r=>r.body.traceId)).size,2*concurrency);
  assert.ok(events.length===concurrency&&events.every(e=>e.stage==='persist_answer'&&e.failureCategory==='storage_busy'));
  assert.equal(store.db.prepare('PRAGMA quick_check').get().quick_check,'ok');
  return {status:'passed',scope:'Disposable local WAL database; real second-connection write lock; AI disabled.',concurrency,
   phases:[['before',before],['locked',during],['recovered',after]].map(([phase,rows])=>({phase,requests:rows.length,statuses:[...new Set(rows.map(r=>r.status))],maxLatencyMs:Math.round(Math.max(...rows.map(r=>r.latencyMs)))})),
   persistedTraces:counts().traces,partialWrites:false,diagnosticEvents:events.length};
 }finally {
  if(locked)lock.exec('ROLLBACK');
  if(server?.listening)await new Promise(resolve=>server.close(resolve));
  lock?.close();store?.db.close();
  const actual=realpathSync(root);if(dirname(actual)!==parent||!basename(actual).startsWith('northstar-storage-drill-'))throw new Error('Unsafe cleanup');rmSync(actual,{recursive:true,force:true});
 }
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 try {console.log(JSON.stringify(await runStorageRecoveryDrill({concurrency:Number(process.argv[2]??8)}),null,2));}
 catch {console.error('Isolated storage recovery drill failed');process.exitCode=1;}
}
