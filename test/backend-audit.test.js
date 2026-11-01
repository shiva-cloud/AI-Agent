import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createAIRouter} from '../src/ai-router.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';

test('concurrent AI requests each try every provider at most once',async()=>{
 let release,started;const began=new Promise(r=>started=r);const wait=new Promise(r=>release=r);const calls=[];
 const router=createAIRouter({anyRouterKey:'fixture',openRouterKey:'fixture',fetchImpl:async(url,options)=>{
   const data=JSON.parse(JSON.parse(options.body).messages[1].content);calls.push([data.id,url]);
   if(data.id==='first'&&url.includes('anyrouter')){started();await wait;throw new Error('fixture outage');}
   return Response.json(({choices:[{finish_reason:'stop',message:{content:'{"ok":true}'}}]}));
 }});
 const first=router.complete({stage:'understand',instructions:'Fixture',data:{id:'first'}});await began;
 await router.complete({stage:'understand',instructions:'Fixture',data:{id:'second'}});release();
 assert.deepEqual(await first,{ok:true});
 assert.equal(new Set(calls.filter(c=>c[0]==='first').map(c=>c[1])).size,2);
});

test('API preserves split UTF-8 characters and rejects invalid JSON media types',async()=>{
 const store=openStore(':memory:'),server=createApp(store,undefined,{});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const root=`http://127.0.0.1:${server.address().port}`;
 try {
   const body=Buffer.from(JSON.stringify({question:'Toronto \u202e library'}));const split=body.indexOf(Buffer.from('\u202e'))+1;
   const result=await new Promise((resolve,reject)=>{
     const req=http.request(root+'/v1/questions/parse',{method:'POST',headers:{'Content-Type':'application/json'}},res=>{let text='';res.on('data',chunk=>text+=chunk);res.on('end',()=>resolve({status:res.statusCode,text}));});
     req.on('error',reject);req.write(body.subarray(0,split));setTimeout(()=>req.end(body.subarray(split)),20);
   });
   assert.equal(result.status,400);assert.match(result.text,/invisible formatting/);
   assert.equal((await fetch(root+'/v1/questions/parse',{method:'POST',headers:{'Content-Type':'application/json-invalid'},body:'{"question":"SIN"}'})).status,415);
   assert.equal((await fetch(root+'/v1/questions/parse',{method:'POST',headers:{'Content-Type':'Application/JSON; charset=utf-8'},body:'{"question":"SIN"}'})).status,200);
   const invalid=await fetch(root+'/v1/questions/parse',{method:'POST',headers:{'Content-Type':'application/json'},body:Buffer.from([0xff,0xfe])});
   assert.equal(invalid.status,400);assert.equal((await invalid.json()).error,'Invalid UTF-8 request');
 }finally{await new Promise(r=>server.close(r));store.db.close();}
});

test('storage failures return sanitized 500 errors, not 400 or false city 404',async()=>{
 const store=openStore(':memory:'),server=createApp(store,undefined,{});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const root=`http://127.0.0.1:${server.address().port}`;store.db.close();
 try {
  for(const path of ['/v1/stats','/v1/coverage/Toronto']){
   const response=await fetch(root+path);assert.equal(response.status,500);assert.deepEqual(await response.json(),{error:'Internal server error',code:'internal_error'});
  }
 }finally{await new Promise(r=>server.close(r));}
});
