import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {PassThrough} from 'node:stream';
import {readRequestBody} from '../src/request-body.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';

test('body reader preserves split bytes and releases listeners on success and rejection',async()=>{
 for(const oversized of [false,true]) {
  const req=new PassThrough();req.headers={};
  const before=['data','end','error','aborted','close'].map(name=>req.listenerCount(name));
  const pending=readRequestBody(req,{maxBytes:4,timeoutMs:1000});
  req.write(Buffer.from([0x22,0xc2]));req.end(Buffer.from(oversized?[0xa3,0x22,0x20]:[0xa3,0x22]));
  if(oversized)await assert.rejects(pending,error=>error.status===413);
  else assert.equal((await pending).toString(),'"£"');
  assert.deepEqual(['data','end','error','aborted','close'].map(name=>req.listenerCount(name)),before);
 }
});

test('disconnect and advertised oversize terminate body reads',async()=>{
 const req=new PassThrough();req.headers={};const pending=readRequestBody(req);req.emit('aborted');
 await assert.rejects(pending,error=>error.status===400);
 const declared=new PassThrough();declared.headers={'content-length':'12001'};
 await assert.rejects(readRequestBody(declared),error=>error.status===413);
 assert.equal(declared.listenerCount('data'),0);
});

test('slow and oversized HTTP uploads receive bounded errors; healthy requests still work',async()=>{
 const store=openStore(':memory:'),server=createApp(store,null,{}, {bodyTimeoutMs:50});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
 const request=oversized=>new Promise((resolve,reject)=>{
  const req=http.request({host:'127.0.0.1',port,path:'/v1/answers',method:'POST',headers:{'Content-Type':'application/json',...(oversized?{'Content-Length':'12001'}:{'Transfer-Encoding':'chunked'})}},res=>{
   let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>{resolve({status:res.statusCode,headers:res.headers,body:JSON.parse(body)});req.destroy();});
  });
  req.on('error',reject);req.flushHeaders();if(!oversized)req.write('{');
 });
 try {
  const slow=await request(false);assert.equal(slow.status,408);assert.equal(slow.body.code,'request_timeout');assert.equal(slow.headers.connection,'close');
  assert.equal((await request(true)).status,413);
  assert.equal(store.db.prepare('SELECT count(*) n FROM traces').get().n,0);
  const healthy=await fetch(`http://127.0.0.1:${port}/v1/questions/parse`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Toronto library'})});
  assert.equal(healthy.status,200);await healthy.json();
 }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
});
