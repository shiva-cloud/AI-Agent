import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {createObservability,failureCategory} from '../src/observability.js';
import {EventEmitter} from 'node:events';
import {humanizeError} from '../public/errors.js';

test('diagnostic categories use bounded labels and extended SQLite primary codes',()=>{
 for(const [code,label] of [[5,'storage_busy'],[6,'storage_locked'],[8,'storage_readonly'],[10,'storage_io'],[11,'storage_corrupt'],[13,'storage_full'],[2067,'storage_constraint'],[999,'storage_error']]) {
  assert.equal(failureCategory({code:'ERR_SQLITE_ERROR',errcode:code,message:'secret'}),label);
 }
 assert.equal(failureCategory({code:'private@example.com',errcode:5}),'unclassified');
 assert.equal(failureCategory(new TypeError('secret')),'type_error');
});

test('answer failures identify read, refresh and persistence phases without exposing exception data',async()=>{
 for(const stage of ['read_evidence','refresh_evidence','persist_answer']) {
  const store=openStore(':memory:'),events=[];
  const originalRecords=store.records;let reads=0;
  const fail=()=>{throw Object.assign(new Error('private@example.com secret-token database-path'),{code:'ERR_SQLITE_ERROR',errcode:5});};
  if(stage==='persist_answer')store.log=fail;
  else store.records=()=>{
    reads++;
    if(stage==='refresh_evidence'&&reads===1) {
      try{store.db.exec('UPDATE evidence_revision SET revision=revision+1 WHERE id=1');}catch{}
    }
    if(reads===(stage==='read_evidence'?1:2))return fail();
    return originalRecords();
  };
  const server=createApp(store,null,{}, {logger:event=>events.push(event)});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {
   const response=await fetch(`http://127.0.0.1:${server.address().port}/v1/answers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Toronto library internet'})});
   assert.equal(response.status,503);assert.equal(response.headers.get('retry-after'),'1');const body=await response.json();
   assert.equal(events.length,1);assert.equal(events[0].stage,stage);assert.equal(events[0].failureCategory,'storage_busy');
   assert.equal(events[0].requestId,response.headers.get('x-request-id'));
   assert.ok(!JSON.stringify({events,body}).match(/private@example|secret-token|database-path/));
   assert.equal(body.code,'storage_busy');
   assert.equal(store.db.prepare('SELECT count(*) n FROM traces').get().n,0);
  }finally{await new Promise(r=>server.close(r));store.db.close();}
 }
});

test('unknown stage values cannot enter logs and completion discards diagnostic state',()=>{
 const events=[],telemetry=createObservability({logger:event=>events.push(event)}),res=new EventEmitter();
 res.setHeader=()=>{};res.statusCode=500;res.writableFinished=true;
 telemetry.begin({url:'/v1/answers'},res);telemetry.stage(res,'secret');telemetry.failure(res,new Error('private'));
 res.emit('finish');telemetry.stage(res,'persist_answer');res.emit('close');
 assert.equal(events.length,1);assert.equal(events[0].stage,'dispatch');assert.equal(events[0].failureCategory,'unclassified');
});

test('request IDs correlate sanitized failures and metrics remain admin-only',async()=>{
 const store=openStore(':memory:'),events=[],token='test-observability-admin-token',server=createApp(store,token,{}, {logger:event=>events.push(event)});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const root=`http://127.0.0.1:${server.address().port}`,headers={Authorization:`Bearer ${token}`};
 try {
  const ready=await fetch(root+'/ready');assert.match(ready.headers.get('x-request-id'),/^[a-f0-9-]{36}$/);
  assert.equal((await fetch(root+'/admin/runtime-metrics')).status,401);
  store.records=()=>{throw new Error('private@example.com secret-token');};
  const failed=await fetch(root+'/v1/stats?private@example.com',{headers:{'X-Request-ID':'secret-token',Authorization:'Bearer secret-token'}});
  assert.equal(failed.status,500);await failed.json();
  const metrics=await (await fetch(root+'/admin/runtime-metrics',{headers})).json();
  assert.equal(events.length,1);assert.equal(events[0].requestId,failed.headers.get('x-request-id'));
  assert.notEqual(events[0].requestId,ready.headers.get('x-request-id'));
  assert.equal(events[0].category,'public_api');
  assert.ok(humanizeError({status:500,requestId:events[0].requestId}).body.includes(events[0].requestId));
  assert.ok(!humanizeError({status:500,requestId:'private@example.com'}).body.includes('private@example.com'));
  assert.ok(metrics.buckets.some(b=>b.category==='public_api'&&b.status===500&&b.count===1));
  assert.ok(!JSON.stringify({events,metrics}).match(/private@example|secret-token/));
 }finally{await new Promise(r=>server.close(r));store.db.close();}
});

test('aborts count once and logger failures cannot break responses',async()=>{
 const telemetry=createObservability({logger:async()=>{throw new Error('failed sink');}});
 const res=new EventEmitter();res.setHeader=()=>{};res.statusCode=200;res.writableFinished=false;
 telemetry.begin({url:'/arbitrary-user-path?secret'},res);res.emit('close');res.emit('finish');
 await new Promise(r=>setImmediate(r));
 const metrics=telemetry.snapshot();assert.equal(metrics.loggingFailures,1);
 assert.equal(metrics.buckets.length,1);assert.equal(metrics.buckets[0].status,499);assert.equal(metrics.buckets[0].count,1);
 assert.ok(!JSON.stringify(metrics).includes('secret'));
});
