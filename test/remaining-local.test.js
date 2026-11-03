import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {SubscriptionManager} from '../src/realtime-subscriptions.js';
import {mountAppLifecycle} from '../public/app-lifecycle.js';
import {readFileSync,mkdtempSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {syncEncryptedBackupOffsite,pruneOldBackups} from '../src/offsite-backup-sync.js';
import {decryptBuffer} from '../src/db-encryption.js';
import {createApp} from '../src/server.js';
import {assertFiniteInput} from '../src/finite-input.js';

test('nested overflowing JSON numbers are rejected before calculator arithmetic',()=>{
 for(const text of ['{"income":1e309}','{"family":[{"income":-1e999}]}'])assert.throws(()=>assertFiniteInput(JSON.parse(text)));
 assert.doesNotThrow(()=>assertFiniteInput({income:0,netWorth:-10,children:[1,2]}));
 let nested={};for(let i=0;i<34;i++)nested={child:nested};assert.throws(()=>assertFiniteInput(nested));
});

test('encrypted mirror includes committed WAL writes and requires an explicit strong passphrase',async t=>{
 await assert.rejects(()=>syncEncryptedBackupOffsite({passphrase:''}),/explicit backup passphrase/);
 assert.throws(()=>pruneOldBackups('unused',-1),/retention/);
 const root=mkdtempSync(join(tmpdir(),'northstar-wal-mirror-')),path=join(root,'source.sqlite');
 const source=new DatabaseSync(path);t.after(()=>source.close());
 source.exec("PRAGMA journal_mode=WAL;CREATE TABLE proof(value TEXT);INSERT INTO proof VALUES ('committed WAL value')");
 const passphrase='fixture-only-passphrase-with-more-than-24-chars';
 const result=await syncEncryptedBackupOffsite({sourceDbPath:path,localBackupDir:join(root,'local'),remoteBackupDir:join(root,'mirror'),passphrase});
 const restored=join(root,'restored.sqlite');writeFileSync(restored,decryptBuffer(readFileSync(result.remotePath),passphrase));
 const readback=new DatabaseSync(restored,{readOnly:true});try{assert.equal(readback.prepare('SELECT value FROM proof').get().value,'committed WAL value');}finally{readback.close();}
});

test('subscription scopes include national notices but exclude other cities and provinces',t=>{
 const store=openStore(':memory:');t.after(()=>store.db.close());const manager=new SubscriptionManager(store.db);
 manager.subscribe({contactEndpoint:'https://receiver.example.invalid',country:'Canada',region:'on',city:'Toronto',topic:'housing'});
 for(const [region,city,count] of [[null,null,1],['ON',null,1],['BC',null,0],['ON','Toronto',1],['BC','Vancouver',0]])assert.equal(manager.findMatchingSubscribers({country:'CA',region,city,topic:'housing'}).length,count);
 assert.equal(manager.findMatchingSubscribers({country:'CA',topic:'transit'}).length,0);
});

test('subscription retention previews before redacting inactive contacts; recent delivery protects active subscriptions',t=>{
 const store=openStore(':memory:');t.after(()=>store.db.close());const manager=new SubscriptionManager(store.db);
 const ids=Array.from({length:2},()=>manager.subscribe({contactEndpoint:'https://receiver.example.invalid'}).subscriptionId);
 store.db.prepare("UPDATE realtime_subscriptions SET created_at='2020-01-01T00:00:00.000Z'").run();
 store.db.prepare("UPDATE realtime_subscriptions SET last_notified_at='2026-10-31T00:00:00.000Z' WHERE id=?").run(ids[1]);
 const options={now:new Date('2026-11-01'),days:365};assert.equal(manager.retain(options).affected,1);
 assert.equal(manager.listActiveSubscriptions().length,2);
 assert.equal(manager.retain({...options,apply:true}).affected,1);
 assert.equal(manager.listActiveSubscriptions().length,1);
 assert.equal(store.db.prepare('SELECT contact_endpoint FROM realtime_subscriptions WHERE id=?').get(ids[0]).contact_endpoint,'');
 assert.equal(manager.retain({...options,apply:true}).affected,0);
 assert.throws(()=>manager.retain({days:-1}));
});

function target(){return {listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},emit(name,event={}){return this.listeners[name]?.(event);},children:[],append(...items){this.children.push(...items);},setAttribute(){}};}
test('updates wait for user action and dirty forms require confirmation without storing data',async()=>{
 const doc=target();doc.readyState='complete';doc.body=target();doc.createElement=()=>target();
 let reloads=0,activated=0,confirm=false;
 const workers=target(),registration=target();registration.waiting={postMessage(message){assert.equal(message.type,'ACTIVATE_UPDATE');activated++;}};workers.register=async()=>registration;
 const win=target();win.navigator={serviceWorker:workers};win.location={reload(){reloads++;}};win.confirm=()=>confirm;
 mountAppLifecycle(win,doc);await Promise.resolve();
 const banner=doc.body.children[0],button=banner.children[1];assert.equal(banner.hidden,false);assert.equal(reloads,0);assert.equal(activated,0);
 doc.emit('input',{target:{matches:()=>true}});let prevented=false;win.emit('beforeunload',{preventDefault(){prevented=true;}});assert.equal(prevented,true);
 button.emit('click');assert.equal(activated,0);
 confirm=true;button.emit('click');assert.equal(activated,1);assert.equal(reloads,0);
 workers.emit('controllerchange');assert.equal(reloads,1);
});

test('every transitive frontend module is served with JavaScript content type',async t=>{
 const store=openStore(':memory:'),server=createApp(store,undefined,{});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));store.db.close();});
 const seen=new Set();async function inspect(path){if(seen.has(path))return;seen.add(path);
  const res=await fetch(`http://127.0.0.1:${server.address().port}/${path}`);assert.equal(res.status,200,path);assert.match(res.headers.get('content-type'),/javascript/,path);
  const source=await res.text();assert.equal(source,readFileSync(new URL('../public/'+path,import.meta.url),'utf8'));
  for(const match of source.matchAll(/import\s+(?:[^;'"\n]*?from\s*)?['"](\.{1,2}\/[^'"]+)['"]/g))await inspect(new URL(match[1],'http://northstar.test/'+path).pathname.slice(1));
 }
 await inspect('app.js');await inspect('tool-modal.js');assert.ok(seen.has('app-lifecycle.js'));
 const worker=readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
 const assets=worker.match(/const PRECACHE_URLS\s*=\s*\[([\s\S]*?)\]/)[1];
 for(const match of assets.matchAll(/'([^']+)'/g)){
   const res=await fetch(`http://127.0.0.1:${server.address().port}${match[1]}`);
   assert.equal(res.status,200,`Precache asset ${match[1]}`);
 }
});

test('every documented calculator POST rejects numeric overflow through HTTP',async t=>{
 const store=openStore(':memory:'),server=createApp(store,undefined,{}, {trustedProxyIps:['127.0.0.1']});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));store.db.close();});
 const contract=JSON.parse(readFileSync(new URL('../docs/openapi.json',import.meta.url),'utf8'));
 const paths=Object.entries(contract.paths).filter(([path,operations])=>path.startsWith('/v1/tools/')&&operations.post).map(([path])=>path);
 assert.ok(paths.length>100);let index=0;
 for(const path of paths){index++;const res=await fetch(`http://127.0.0.1:${server.address().port}${path}`,{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':`198.51.${Math.floor(index/250)}.${index%250+1}`},body:'{"nested":{"value":1e309}}'});assert.equal(res.status,400,path);assert.match((await res.json()).error,/finite/i,path);}
});
