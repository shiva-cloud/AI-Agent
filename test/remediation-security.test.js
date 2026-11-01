import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {REALTIME_SOURCES} from '../src/realtime-registry.js';
import {runCronCycle} from '../src/realtime-cron.js';
import {permitCrawl} from '../src/crawl-policy.js';
import {extractPolicyDelta,extractDatesFromText} from '../src/realtime-extractor.js';
import {SubscriptionManager} from '../src/realtime-subscriptions.js';
import {enqueueAlerts,deliverPending} from '../src/realtime-delivery.js';
import {dispatchAlertWebhook} from '../src/realtime-alerts.js';

test('realtime mutations and contact listing require admin; simulation disabled even for admin',async t=>{
 const store=openStore(':memory:'),server=createApp(store,'test-legacy-admin-token-24ch',{});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(async()=>{await new Promise(r=>server.close(r));store.db.close();});
 const root=`http://127.0.0.1:${server.address().port}`;
 for(const [path,method] of [['simulate','POST'],['poll','POST'],['subscriptions','GET'],['subscriptions','POST']]){
  const r=await fetch(`${root}/v1/realtime/${path}`,{method,headers:{'Content-Type':'application/json'},...(method==='POST'?{body:'{}'}:{})});
  assert.equal(r.status,401);
 }
 const r=await fetch(`${root}/v1/realtime/simulate`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer test-legacy-admin-token-24ch'},body:'{}'});
 assert.equal(r.status,403);assert.equal((await r.json()).code,'simulation_disabled');
});

test('crawler permission, failed ingestion retry and complete baseline are enforced',async t=>{
 const store=openStore(':memory:');t.after(()=>store.db.close());
 const source=REALTIME_SOURCES.find(s=>s.id==='ca-bc-vancouver-translink');let calls=0;
 const content='<main>'+('Official transit service information. '.repeat(30))+'Fare is $3.40.</main>';
 const fetcher=async()=>{calls++;return {status:200,ok:true,text:content,headers:{get:()=>null}};};
 let result=await runCronCycle({store,sources:[source],fetcher});
 assert.equal(result.status,'policy_blocked');assert.equal(calls,0);
 permitCrawl(store.db,source,{reviewer:'Test reviewer',note:'Mock-only source permission for regression test.'});
 const original=store.realtime.ingestPolicyUpdate;store.realtime.ingestPolicyUpdate=async()=>{throw new Error('Test transient failure');};
 result=await runCronCycle({store,sources:[source],fetcher});
 assert.equal(result.success,false);assert.equal(store.db.prepare('SELECT count(*) n FROM crawl_snapshots').get().n,0);
 store.realtime.ingestPolicyUpdate=original;
 result=await runCronCycle({store,sources:[source],fetcher});assert.equal(result.changedSources,1);
 assert.ok(store.db.prepare('SELECT content FROM crawl_snapshots').get().content.length>500);
 result=await runCronCycle({store,sources:[source],fetcher});assert.equal(result.changedSources,0);assert.equal(result.success,true);
});

test('extractor does not invent effective dates or downgrade high-risk sources',()=>{
 const source=REALTIME_SOURCES.find(s=>s.risk==='high');
 const payload=extractPolicyDelta({source,content:'A notice published on 2026-10-31.',delta:{changed:true}});
 assert.equal(payload.candidateRecord.effectiveFrom,null);assert.ok(payload.sourceContent);
 assert.deepEqual(extractDatesFromText('2026-02-30 and February 29, 2026 and 2028-02-29'),['2028-02-29']);
 assert.equal(extractPolicyDelta({source,content:'Official source text.',simulatedInput:{risk:'low'}}).candidateRecord.risk,'high');
});

test('webhook retries use stable delivery identity and cancellation erases contact data',async t=>{
 const store=openStore(':memory:');t.after(()=>store.db.close());
 const source=REALTIME_SOURCES.find(s=>s.id==='ca-bc-vancouver-translink');
 await store.realtime.ingestPolicyUpdate(extractPolicyDelta({source,content:'Official transit fare information has changed.',delta:{changed:true}}));
 const manager=new SubscriptionManager(store.db);
 assert.throws(()=>manager.subscribe({contactEndpoint:'user@example.invalid',channel:'email'}));
 const sub=manager.subscribe({contactEndpoint:'https://receiver.example.invalid/events',city:'Vancouver'});
 assert.equal(enqueueAlerts(store),1);assert.equal(enqueueAlerts(store),1);
 const keys=[];let success=false;
 const fetcher=async(_url,init)=>{keys.push(init.headers['Idempotency-Key']);assert.ok(init.headers['X-Northstar-Signature']);return {ok:success,status:success?200:503};};
 const now=Date.now();assert.equal((await deliverPending(store,{fetcher,secret:'s'.repeat(32),now})).retry,1);
 success=true;assert.equal((await deliverPending(store,{fetcher,secret:'s'.repeat(32),now:now+60001})).delivered,1);
 assert.equal(keys[0],keys[1]);assert.equal((await deliverPending(store,{fetcher})).delivered,0);
 manager.cancel(sub.subscriptionId);const row=store.db.prepare('SELECT * FROM realtime_subscriptions WHERE id=?').get(sub.subscriptionId);
 assert.equal(row.is_active,0);assert.equal(row.contact_endpoint,'');
});

test('webhook timeout bounds an unresponsive provider',async()=>{
 const result=await dispatchAlertWebhook({id:'test'},{url:'https://receiver.example.invalid/events',timeoutMs:10},()=>new Promise(()=>{}));
 assert.equal(result.dispatched,false);
});
