import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {openJobQueue} from '../src/jobs.js';
import {runOneJob} from '../src/job-worker.js';
import {openStore} from '../src/store.js';
import {verifyDatabase} from '../src/verification.js';
const spec={requestKey:'fixture-job',kind:'source_check',targetId:'seed-sin-route'};

test('durable claims are exclusive across connections and stale workers cannot finish',()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-jobs-')),file=join(root,'jobs.sqlite');let a,b;
 let now=1000;const clock=()=>now;
 try {
  a=openJobQueue(file,{clock});const job=a.enqueue(spec);
  a.saveSchedule({scheduleId:'persistent-fixture',kind:'verify_snapshot',targetId:'snapshot-fixture',intervalMs:1000,nextRun:5000});
  a.close();a=null;
  a=openJobQueue(file,{clock});b=openJobQueue(file,{clock});assert.equal(a.get(job.id).state,'queued');
  const first=a.claim('worker-a',{leaseMs:100});assert.equal(b.claim('worker-b',{leaseMs:100}),null);
  now=1100;const second=b.claim('worker-b',{leaseMs:100});assert.equal(second.id,first.id);assert.notEqual(second.lease_token,first.lease_token);
  assert.equal(a.finish(first.id,first.lease_token),false);assert.equal(a.heartbeat(first.id,first.lease_token),false);
  assert.equal(b.finish(second.id,second.lease_token),true);assert.equal(a.get(job.id).state,'succeeded');
  assert.equal(a.enqueue(spec).id,job.id);assert.throws(()=>a.enqueue({...spec,targetId:'other'}),/conflict/);
  assert.equal(b.schedules()[0].next_run,5000);now=5000;
  assert.equal(a.dispatchDue().dispatched.length,1);assert.equal(b.dispatchDue().dispatched.length,0);
  assert.equal(b.schedules()[0].next_run,6000);
  const inspection=openJobQueue(file,{readOnly:true});
  try{assert.ok(inspection.list().items.length);assert.throws(()=>inspection.enqueue({...spec,requestKey:'read-only-write'}));}finally{inspection.close();}
  a.close();a=null;b.close();b=null;
  const evidence=join(root,'evidence.sqlite'),store=openStore(evidence);store.db.close();const before=verifyDatabase(evidence);
  assert.throws(()=>openJobQueue(evidence),/separate job database/);assert.deepEqual(verifyDatabase(evidence),before);
 }finally {
  a?.close();b?.close();const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-jobs-'));rmSync(resolved,{recursive:true,force:true});
 }
});

test('retries respect delay and attempt limit; lease exhaustion terminates',()=>{
 let now=1000;const q=openJobQueue(':memory:',{clock:()=>now});try {
  const job=q.enqueue({...spec,maxAttempts:2});let claimed=q.claim('fixture-worker',{leaseMs:100});
  assert.equal(q.finish(job.id,claimed.lease_token,{outcome:'failed',code:'handler_failed',retryDelayMs:500}),true);
  assert.equal(q.claim('fixture-worker'),null);now=1500;claimed=q.claim('fixture-worker',{leaseMs:100});assert.equal(claimed.attempts,2);
  now=1600;assert.equal(q.claim('fixture-worker'),null);assert.equal(q.get(job.id).state,'failed');assert.equal(q.get(job.id).last_code,'lease_expired');
 }finally{q.close();}
});

test('policy denied or missing handler never executes or retries a job',async()=>{
 const q=openJobQueue(':memory:');let calls=0;try {
  q.enqueue(spec);
  const blocked=await runOneJob(q,{workerId:'worker-test',authorize:()=>false,handlers:{source_check:()=>calls++}});
  assert.equal(blocked.status,'blocked');assert.equal(calls,0);
  q.enqueue({...spec,requestKey:'second'});
  const missing=await runOneJob(q,{workerId:'worker-test',authorize:()=>true});assert.equal(missing.code,'handler_missing');
  assert.equal((await runOneJob(q,{workerId:'worker-test',authorize:()=>true})).status,'idle');
 }finally{q.close();}
});

test('worker retries failures with fresh policy, then completes without retaining raw errors',async()=>{
 let now=Date.now(),policies=0,calls=0;const q=openJobQueue(':memory:',{clock:()=>now});try {
  const job=q.enqueue(spec);const options={workerId:'fixture-worker',authorize:()=>{policies++;return true;},handlers:{source_check:async()=>{if(++calls===1)throw new Error('secret private@example.com');}}};
  assert.equal((await runOneJob(q,options)).status,'queued');assert.ok(!JSON.stringify(q.get(job.id)).includes('private@example'));
  now+=1000;assert.equal((await runOneJob(q,options)).status,'succeeded');assert.equal(policies,2);assert.equal(calls,2);
 }finally{q.close();}
});

test('deadline aborts handler and delayed authorization cannot start it afterward',async()=>{
 const q=openJobQueue(':memory:');let release,calls=0;try {
  q.enqueue({...spec,maxAttempts:1});
  const result=await runOneJob(q,{workerId:'fixture-worker',timeoutMs:10,authorize:()=>new Promise(r=>release=r),handlers:{source_check:()=>calls++}});
  assert.equal(result.status,'failed');assert.equal(result.code,'deadline_exceeded');release(true);await new Promise(r=>setImmediate(r));assert.equal(calls,0);
 }finally{q.close();}
});

test('queue accepts only bounded English identifiers and known job kinds',()=>{
 const q=openJobQueue(':memory:');try {
  for(const changes of [{kind:'execute_shell'},{targetId:'https://example.com'},{requestKey:'private@example.com'},{maxAttempts:0},{availableAt:-1},{targetId:'\u0939\u093f'}])assert.throws(()=>q.enqueue({...spec,...changes}),/Invalid/);
  assert.throws(()=>q.claim('worker',{leaseMs:1}),/Invalid/);
 }finally{q.close();}
});

test('retention removes only old terminal jobs and preserves active schedule references',()=>{
 let now=1000;const q=openJobQueue(':memory:',{clock:()=>now});try{
  const first=q.enqueue(spec),claim=q.claim('worker-test');q.finish(first.id,claim.lease_token);
  q.saveSchedule({scheduleId:'keep',kind:'verify_snapshot',targetId:'fixture',intervalMs:1000,nextRun:1000});q.dispatchDue();
  const scheduled=q.claim('worker-test');q.finish(scheduled.id,scheduled.lease_token);
  q.enqueue({...spec,requestKey:'keep-queued'});
  now=5000;assert.equal(q.prune({before:4000}).deleted,1);assert.equal(q.get(first.id),undefined);
  assert.equal(q.get(scheduled.id).state,'succeeded');
  const page=q.list({limit:1});assert.equal(page.items.length,1);assert.ok(page.nextCursor);assert.equal(q.list({after:page.nextCursor}).items.length,1);
  assert.ok(!Object.keys(page.items[0]).includes('lease_token'));
  assert.throws(()=>q.prune({before:6000}),/Invalid/);
  assert.throws(()=>q.list({limit:101}),/Invalid/);
 }finally{q.close();}
});
