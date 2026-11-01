import test from 'node:test';
import assert from 'node:assert/strict';
import {getEventListeners} from 'node:events';
import {request} from 'node:http';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {seeds} from '../src/knowledge.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {resolve,promise};};
test('cancellation blocks later provider stages and holds capacity until an ignored call settles',async()=>{
 const controller=new AbortController(),entered=deferred(),pending=deferred();let calls=0,providerSignal;
 const run=createVerifiedAnswer({maxConcurrent:1,complete:({signal})=>{calls++;providerSignal=signal;entered.resolve();return pending.promise;}});
 const input={question:'SIN application'},now=new Date('2026-10-28');
 const first=run(input,seeds,now,{signal:controller.signal});await entered.promise;controller.abort();
 assert.equal((await first).ai.status,'fallback');assert.equal(providerSignal.aborted,true);
 assert.equal((await run(input,seeds,now)).ai.status,'busy');assert.equal(calls,1);
 assert.equal(getEventListeners(controller.signal,'abort').length,0);
 pending.resolve({intent:'SIN'});await new Promise(r=>setImmediate(r));assert.equal(calls,1);
 await assert.rejects(()=>run(input,seeds,now,{signal:controller.signal}));assert.equal(calls,1);
});
test('HTTP disconnect cancels provider work without writing a completed answer trace',async()=>{
 const entered=deferred(),cancelled=deferred(),events=[],store=openStore(':memory:');
 const server=createApp(store,undefined,{complete:({signal})=>new Promise((_,reject)=>{signal.addEventListener('abort',()=>{cancelled.resolve();reject(new Error('cancelled'));},{once:true});entered.resolve();})},{logger:e=>events.push(e)});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const req=request(`http://127.0.0.1:${server.address().port}/v1/answers`,{method:'POST',headers:{'Content-Type':'application/json'}});req.on('error',()=>{});
 try {
  req.end(JSON.stringify({question:'SIN application'}));await entered.promise;req.destroy();
  await cancelled.promise;await new Promise(resolve=>setImmediate(resolve));
  assert.equal(store.db.prepare('SELECT count(*) n FROM traces').get().n,0);
  assert.equal(events.filter(e=>e.event==='request_aborted').length,1);
 }finally{req.destroy();await new Promise(resolve=>server.close(resolve));store.db.close();}
});
