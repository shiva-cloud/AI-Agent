import test from 'node:test';
import assert from 'node:assert/strict';
import {openJobQueue} from '../src/jobs.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';

const actors=['reader','editor','reviewer','admin'].map(role=>({id:`queue-${role}`,role,token:`queue-fixture-${role}-${'x'.repeat(32)}`}));
const spec={scheduleId:'fixture-schedule',kind:'reindex',targetId:'fixture-index',intervalMs:60000,nextRun:0,revision:0};
async function fixture(run,{configured=true}={}) {
  const store=openStore(':memory:'),queue=openJobQueue(':memory:');
  const server=createApp(store,undefined,{}, {actors,jobQueue:configured?queue:undefined});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const request=(path,role='admin',body,extra={})=>fetch(base+path,{method:body===undefined?'GET':'POST',headers:{...(role?{Authorization:`Bearer ${actors.find(a=>a.role===role).token}`}:{ }),'Content-Type':'application/json',...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
  try {await run({queue,store,request});}
  finally {await new Promise(resolve=>server.close(resolve));queue.close();store.db.close();}
}

test('queue HTTP reads require authentication and omit worker credentials',()=>fixture(async({queue,request})=>{
  queue.enqueue({requestKey:'fixture-one',kind:'reindex',targetId:'fixture-index'});
  queue.enqueue({requestKey:'fixture-two',kind:'reindex',targetId:'fixture-index'});
  const claimed=queue.claim('fixture-worker');
  assert.equal((await request('/admin/jobs',null)).status,401);
  for(const role of ['reader','editor','reviewer','admin'])assert.equal((await request('/admin/jobs',role)).status,200);
  const first=await (await request('/admin/jobs?limit=1','reader')).json();
  assert.equal(first.items.length,1);assert.ok(first.nextCursor);
  const second=await (await request('/admin/jobs?limit=1&after='+first.nextCursor,'reader')).json();
  assert.equal(second.items.length,1);assert.equal(second.nextCursor,null);assert.notEqual(first.items[0].id,second.items[0].id);
  const serialized=JSON.stringify([first,second]);
  for(const secret of ['lease_token','worker_id','request_key',claimed.lease_token])assert.equal(serialized.includes(secret),false);
  for(const query of ['limit=0','limit=101','limit=abc','after=bad'])assert.equal((await request('/admin/jobs?'+query)).status,400);
}));

test('schedule HTTP writes require admin and reject stale revisions without dispatch',()=>fixture(async({queue,store,request})=>{
  for(const role of ['reader','editor','reviewer'])assert.equal((await request('/admin/job-schedules',role,spec)).status,403);
  assert.equal((await request('/admin/job-schedules','admin',spec,{Origin:'https://untrusted.invalid'})).status,403);
  assert.equal(queue.schedules().length,0);
  assert.equal((await request('/admin/job-schedules','admin',{...spec,intervalMs:0})).status,400);
  const created=await request('/admin/job-schedules','admin',{...spec,actor:'spoofed',identity:{mode:'individual',id:'spoofed'}});assert.equal(created.status,200);assert.equal((await created.json()).revision,1);
  const responses=await Promise.all([true,false].map(enabled=>request('/admin/job-schedules','admin',{...spec,revision:1,enabled})));
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
  const conflict=responses.find(r=>r.status===409);assert.equal((await conflict.json()).code,'conflict');
  const current=queue.schedules()[0];
  assert.equal((await request('/admin/job-schedules','admin',{...spec,revision:current.revision,enabled:false})).status,200);
  const listing=await (await request('/admin/job-schedules','reader')).json();assert.equal(listing.items[0].enabled,0);
  const historyPath='/admin/job-schedules/fixture-schedule/history';
  assert.equal((await request(historyPath,null)).status,401);
  const history=await (await request(historyPath+'?limit=1','reader')).json();
  assert.equal(history.items.length,1);assert.equal(history.items[0].actor_id,'queue-admin');assert.equal(history.items[0].actor_mode,'individual');assert.equal(history.items[0].before,null);assert.equal(history.items[0].after.revision,1);
  const remaining=await (await request(historyPath+'?after='+history.nextCursor,'reader')).json();assert.equal(remaining.items.length,2);assert.equal(remaining.nextCursor,null);
  assert.equal((await request(historyPath+'?after=-1')).status,400);
  assert.equal((await request('/admin/job-schedules/missing/history')).status,404);
  assert.equal(queue.list().items.length,0);assert.equal(store.summary().audits.length,0);
}));

test('optional queue API reports unavailable when no queue is configured',()=>fixture(async({request})=>{
  for(const path of ['/admin/jobs','/admin/job-schedules']) {
    const response=await request(path);assert.equal(response.status,503);assert.equal((await response.json()).code,'queue_unavailable');
  }
  assert.equal((await request('/admin/job-schedules','admin',spec)).status,503);
},{configured:false}));

test('queue storage errors are sanitized by the HTTP boundary',()=>fixture(async({queue,request})=>{
  queue.list=()=>{throw new Error('private database path and secret');};
  const response=await request('/admin/jobs');assert.equal(response.status,500);
  assert.deepEqual(await response.json(),{error:'Internal server error',code:'internal_error'});
}));
