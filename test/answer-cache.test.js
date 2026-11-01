import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnswerCache} from '../src/answer-cache.js';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';

test('cache expires at TTL, isolates caller mutation and evicts least-recently-used entries',()=>{
 let now=0,calls=0;const cache=createAnswerCache({maxEntries:2,ttlMs:100,clock:()=>now}),date=new Date('2026-10-28');
 const run=q=>cache.run({question:q},[],date,()=>({traceId:`fixture-${++calls}`,claims:[{text:q}]}));
 const first=run('a');first.claims[0].text='tampered';const hit=run('a');assert.equal(calls,1);assert.equal(hit.claims[0].text,'a');assert.notEqual(hit.traceId,first.traceId);
 run('b');run('a');run('c');run('b');assert.equal(calls,4);assert.equal(cache.stats().entries,2);
 now=100;run('b');assert.equal(calls,5);
 const small=createAnswerCache({maxBytes:1});small.run({},[],date,()=>({value:'oversized'}));assert.equal(small.stats().entries,0);
});

test('cache invalidates on evidence withdrawal and expiry day; input scopes remain separate',async()=>{
 const run=createVerifiedAnswer({cacheEntries:8}),date=new Date('2026-10-28'),input={question:'SIN application'};
 const first=await run(input,seeds,date),again=await run(input,seeds,date);
 assert.ok(first.claims.length);assert.deepEqual(again.claims,first.claims);assert.notEqual(first.traceId,again.traceId);
 const withdrawn=seeds.map(r=>r.topic==='sin'?{...r,status:'pending'}:r);
 assert.equal((await run(input,withdrawn,date)).claims.length,0);
 assert.equal((await run(input,seeds,new Date('2099-01-01'))).claims.length,0);
 const toronto=await run({question:'library',city:'Toronto'},seeds,date),vancouver=await run({question:'library',city:'Vancouver'},seeds,date);
 assert.equal(toronto.parsed.city,'Toronto');assert.equal(vancouver.parsed.city,'Vancouver');
 await assert.rejects(()=>run({question:'SIN application',language:'hi'},seeds,date));
});

test('HTTP cache hits retain independent persisted traces and feedback ownership',async()=>{
 const store=openStore(':memory:'),server=createApp(store,undefined,{}, {answerCacheEntries:8});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const post=(path,body)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try {
  const first=await (await post('/v1/answers',{question:'SIN application'})).json();
  const second=await (await post('/v1/answers',{question:'SIN application'})).json();
  assert.notEqual(first.traceId,second.traceId);assert.equal(store.db.prepare('SELECT count(*) n FROM traces').get().n,2);
  assert.equal((await post('/v1/feedback',{traceId:second.traceId,issue:'helpful'})).status,201);
  assert.equal(store.db.prepare('SELECT trace_id FROM feedback').get().trace_id,second.traceId);
 }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});
