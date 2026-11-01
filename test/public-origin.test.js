import test from 'node:test';
import assert from 'node:assert/strict';
import {publicOrigin} from '../src/runtime-config.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
test('proxy origin configuration rejects paths, credentials and invalid protocols',()=>{
 assert.equal(publicOrigin('https://example.com'),'https://example.com');assert.equal(publicOrigin(),undefined);
 for(const value of ['https://example.com/','https://user:pass@example.com','file:///tmp','null','https://example.com/path'])assert.throws(()=>publicOrigin(value),/PUBLIC_ORIGIN/);
});
test('HTTPS proxy origin is explicit and forwarded headers cannot grant access',async()=>{
 const store=openStore(':memory:'),server=createApp(store,undefined,{}, {publicOrigin:'https://example.com'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const root=`http://127.0.0.1:${server.address().port}`;
 try {
  assert.equal((await fetch(root+'/ready',{headers:{Origin:'https://example.com'}})).status,200);
  assert.equal((await fetch(root+'/ready',{headers:{Origin:root}})).status,403);
  assert.equal((await fetch(root+'/ready',{headers:{Origin:'https://evil.invalid','X-Forwarded-Host':'evil.invalid','X-Forwarded-Proto':'https'}})).status,403);
 }finally{await new Promise(r=>server.close(r));store.db.close();}
});
