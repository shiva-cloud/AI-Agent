import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewQueue} from '../src/review-queue.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
const now=new Date('2026-10-28T23:59:59Z');
test('real seed queue reports independent permission, review and provenance gaps',()=>{
 const store=openStore(':memory:');try{
  const before=JSON.stringify(store.records());
  const q=reviewQueue(store.records(),store.ingestion.sources(),[],now);
  assert.equal(q.counts.total,258);assert.equal(q.counts.pending_review,238);
  assert.equal(q.counts.expires_soon,61);assert.equal(q.counts.permission_review_needed,258);assert.equal(q.counts.snapshot_missing,258);
  assert.equal(q.counts.expired,undefined);assert.equal(JSON.stringify(store.records()),before);
 }finally{store.db.close();}
});
test('UTC expiry boundaries include expiry day and seven-day window',()=>{
 const dates=['2026-10-27','2026-10-28','2026-11-04','2026-11-05'];
 const q=reviewQueue(dates.map((expiresAt,i)=>({...seeds[0],id:`r${i}`,expiresAt})),[],[],now);
 assert.equal(q.counts.expired,1);assert.equal(q.counts.expires_soon,2);
 assert.equal(q.rows.find(r=>r.id==='r1').daysUntilExpiry,0);
 assert.ok(!q.rows.find(r=>r.id==='r3').flags.includes('expires_soon'));
});
test('suspension outranks expiry and explicit source identity does not fall back to another source',()=>{
 const records=[{...seeds[0],id:'old',expiresAt:'2026-10-01'},{...seeds[0],id:'suspended',sourceId:'blocked'},{...seeds[0],id:'missing',sourceId:'absent'}];
 const sources=[{id:'blocked',url:'https://example.com',suspended:1,policy:'unreviewed'},{id:'allowed',url:seeds[0].url,policy:'manual_permitted'}];
 const q=reviewQueue(records,sources,[],now);
 assert.equal(q.rows[0].id,'suspended');assert.equal(q.rows[1].id,'old');
 assert.equal(q.rows.find(r=>r.id==='missing').sourceId,null);
});
test('effective dates and candidate states are tracked without treating imports as published',()=>{
 const q=reviewQueue([{...seeds[0],effectiveFrom:'2026-10-29'},{...seeds[0],id:'ended',effectiveTo:'2026-10-28',status:'rejected'}],[],[
 {id:'pending',record_id:seeds[0].id,status:'pending'},
 {id:'done',record_id:seeds[0].id,status:'approved'},
 {id:'new',record_id:'new-record',status:'pending'}],now);
 assert.equal(q.counts.not_yet_effective,1);assert.equal(q.counts.no_longer_effective,1);assert.equal(q.counts.rejected,1);
 assert.deepEqual(q.rows.find(r=>r.id===seeds[0].id).candidateIds,['pending']);
 assert.deepEqual(q.newCandidates,[{id:'new',recordId:'new-record'}]);
});
test('triage is deterministic and does not mutate its inputs',()=>{
 const records=[...seeds].reverse(),before=JSON.stringify(records);
 assert.deepEqual(reviewQueue(records,[],[],now),reviewQueue(seeds,[],[],now));assert.equal(JSON.stringify(records),before);
});
test('review queue endpoint requires admin authorization and leaves database unchanged',async()=>{
 const store=openStore(':memory:'),token='review-queue-test-token-24-chars',server=createApp(store,token,{});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  assert.equal((await fetch(base+'/admin/review-queue')).status,401);
  const response=await fetch(base+'/admin/review-queue',{headers:{Authorization:`Bearer ${token}`}});
  assert.equal(response.status,200);assert.equal((await response.json()).counts.total,258);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM audits').get().n,0);
 }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});
