import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {EventEmitter} from 'node:events';
import {openRuntimeMetrics,percentiles} from '../src/runtime-metrics.js';
import {createObservability} from '../src/observability.js';
import {openJobQueue} from '../src/jobs.js';

test('metrics survive reopen, merge connections and expire after thirty UTC days',()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-metrics-')),file=join(root,'metrics.sqlite');let a,b;let now=100*86400000;
 try {
  a=openRuntimeMetrics(file,{clock:()=>now});b=openRuntimeMetrics(file,{clock:()=>now});
  for(let i=0;i<95;i++)a.record({category:'answers',status:200,elapsed:10});
  for(let i=0;i<5;i++)b.record({category:'answers',status:200,elapsed:100});
  a.close();a=openRuntimeMetrics(file,{clock:()=>now});
  const bucket=a.snapshot().buckets[0];assert.equal(bucket.count,100);assert.equal(bucket.p95UpperBoundMs,10);assert.equal(bucket.p99UpperBoundMs,100);
  now+=29*86400000;assert.equal(a.snapshot().buckets[0].count,100);
  now+=86400000;assert.equal(a.snapshot().buckets.length,0);
  a.record({category:'admin',status:500,elapsed:70000});assert.equal(a.snapshot().buckets[0].p95UpperBoundMs,null);
  assert.throws(()=>a.record({category:'private@email.invalid',status:200,elapsed:1}));
  const queue=join(root,'jobs.sqlite');openJobQueue(queue).close();assert.throws(()=>openRuntimeMetrics(queue),/separate/);
 }finally{a?.close();b?.close();const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-metrics-'));rmSync(resolved,{recursive:true,force:true});}
});
test('persistence errors preserve local observations and never break response completion',()=>{
 const telemetry=createObservability({metricsStore:{record(){throw new Error('secret');},snapshot(){throw new Error('secret');}}});
 const res=new EventEmitter();res.setHeader=()=>{};res.statusCode=200;res.writableFinished=true;
 telemetry.begin({url:'/v1/answers?private'},res);res.emit('finish');res.emit('close');
 const report=telemetry.snapshot();assert.equal(report.persistenceFailures,2);assert.equal(report.buckets[0].count,1);assert.equal(report.persisted,null);assert.equal(JSON.stringify(report).includes('secret'),false);
 assert.deepEqual(percentiles(Array(14).fill(0)),{p95UpperBoundMs:null,p99UpperBoundMs:null});
});
