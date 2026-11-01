import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {createShutdown} from '../src/lifecycle.js';
import {humanizeError} from '../public/errors.js';
const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));

test('readiness checks storage and draining without exposing database errors',async()=>{
  const store=openStore(':memory:'),server=createApp(store,undefined,{});await listen(server);
  const root=`http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(root+'/ready')).status,200);
    store.db.close();
    const failed=await fetch(root+'/ready');assert.equal(failed.status,503);
    assert.deepEqual(await failed.json(),{status:'not_ready',reason:'storage_unavailable'});
    server.beginDrain();
    const draining=await fetch(root+'/ready');assert.equal(draining.status,503);
    assert.equal((await draining.json()).reason,'draining');
    const answer=await fetch(root+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'SIN'})});
    assert.equal(answer.status,503);assert.equal((await answer.json()).code,'service_draining');
  }finally{await createShutdown(server)();}
});

test('shutdown waits for an active response and cleans up once across repeated signals',async()=>{
  let release,started;
  const began=new Promise(resolve=>{started=resolve;});
  const wait=new Promise(resolve=>{release=resolve;});
  let cleanups=0,drains=0;
  const server=http.createServer(async(_req,res)=>{started();await wait;res.end('finished');});
  server.beginDrain=()=>{drains++;};await listen(server);
  const response=fetch(`http://127.0.0.1:${server.address().port}`);await began;
  const stop=createShutdown(server,{cleanup:()=>{cleanups++;},graceMs:1000});
  const first=stop();assert.equal(stop(),first);assert.equal(cleanups,0);
  release();assert.equal(await (await response).text(),'finished');await first;
  assert.equal(cleanups,1);assert.equal(drains,1);assert.equal(server.listening,false);
});

test('shutdown closes stalled connections after the grace deadline',async()=>{
  let started;const began=new Promise(resolve=>{started=resolve;});
  const server=http.createServer(()=>started());await listen(server);
  const response=fetch(`http://127.0.0.1:${server.address().port}`).catch(error=>error);
  await began;let cleaned=false;
  await createShutdown(server,{graceMs:30,cleanup:()=>{cleaned=true;}})();
  assert.equal(cleaned,true);assert.ok(await response instanceof Error);
});

test('service and editorial outages have distinct English messages',()=>{
  assert.equal(humanizeError({status:503,message:'Service is restarting'}).title,'Service temporarily unavailable');
  assert.equal(humanizeError({status:503,message:'Admin disabled. Set ADMIN_TOKEN'}).title,'Editorial console unavailable');
});
