import test from 'node:test';
import assert from 'node:assert/strict';
import {createClientAddress,proxyAddressesFromEnvironment} from '../src/client-address.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
const req=(peer,forwarded)=>({socket:{remoteAddress:peer},headers:{'x-forwarded-for':forwarded}});
test('forwarded client identity requires an explicitly trusted immediate proxy',()=>{
 assert.equal(createClientAddress()(req('192.0.2.1','198.51.100.1')),'192.0.2.1');
 const resolve=createClientAddress(['127.0.0.1','192.0.2.1']);
 assert.equal(resolve(req('::ffff:127.0.0.1','203.0.113.9, 198.51.100.1, 192.0.2.1')),'198.51.100.1');
 assert.equal(resolve(req('127.0.0.1','2001:0db8:0:0:0:0:0:1')),'2001:db8::1');
 for(const header of ['unknown','198.51.100.1:123','198.51.100.1, bad','',Array(17).fill('192.0.2.1').join(','),'x'.repeat(2049)])assert.equal(resolve(req('127.0.0.1',header)),'127.0.0.1');
});
test('proxy configuration rejects wildcards, networks, names and malformed JSON',()=>{
 for(const ips of [true,['*'],['127.0.0.0/8'],['localhost'],['fe80::1%eth0'],Array(33).fill('127.0.0.1')])assert.throws(()=>createClientAddress(ips));
 assert.throws(()=>proxyAddressesFromEnvironment({TRUSTED_PROXY_IPS:'not json'}));
 assert.deepEqual(proxyAddressesFromEnvironment({}),[]);
});
test('HTTP quotas distinguish clients behind configured proxy and ignore forged headers by default',async()=>{
 for(const trusted of [false,true]) {
  const store=openStore(':memory:'),server=createApp(store,undefined,{}, {trustedProxyIps:trusted?['127.0.0.1']:[]});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/health`;
  const get=ip=>fetch(base,{headers:{'X-Forwarded-For':ip}});
  try {
   for(let i=0;i<120;i++){const r=await get('198.51.100.1');assert.equal(r.status,200);await r.text();}
   const denied=await get('198.51.100.1');assert.equal(denied.status,429);assert.ok(Number(denied.headers.get('retry-after'))>0);await denied.text();
   const other=await get('198.51.100.2');assert.equal(other.status,trusted?200:429);await other.text();
  }finally{await new Promise(resolve=>server.close(resolve));store.db.close();}
 }
});
