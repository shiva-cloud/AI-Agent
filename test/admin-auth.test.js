import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdminAuth,actorsFromEnvironment,canAccess} from '../src/admin-auth.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
const roles=['reader','editor','reviewer','admin'];
const actors=roles.map(role=>({id:`test-${role}`,role,token:`fixture-${role}-${'x'.repeat(32)}`}));

test('configured identities disable legacy fallback and malformed config fails closed',()=>{
 const auth=createAdminAuth({actors,legacyToken:'legacy-token-that-is-long-enough'});
 assert.equal(auth.authenticate('Bearer legacy-token-that-is-long-enough'),null);
 assert.equal(auth.authenticate('Bearer '+actors[0].token).id,'test-reader');
 assert.equal(createAdminAuth({actors:[],legacyToken:actors[0].token}).authenticate('Bearer '+actors[0].token),null);
 for(const config of [null,{},[actors[0],actors[0]],[{...actors[0],role:'root'}],[{...actors[0],token:'short'}]])assert.throws(()=>createAdminAuth({actors:config}));
 assert.throws(()=>actorsFromEnvironment({ADMIN_ACTORS_JSON:'bad JSON'}));
 assert.equal(actorsFromEnvironment({}),undefined);
});

test('role matrix denies publishing to editors and source policy to reviewers',()=>{
 for(const actor of actors)assert.equal(canAccess(actor,'GET','/admin/overview'),true);
 assert.equal(canAccess(actors[0],'POST','/admin/ingestion/run'),false);
 assert.equal(canAccess(actors[1],'POST','/admin/ingestion/run'),true);
 assert.equal(canAccess(actors[1],'POST','/admin/candidates/abc/decision'),false);
 assert.equal(canAccess(actors[2],'POST','/admin/candidates/abc/decision'),true);
 assert.equal(canAccess(actors[2],'POST','/admin/sources/abc/policy'),false);
 assert.equal(canAccess(actors[1],'POST','/admin/unknown'),false);
});

test('HTTP roles enforce boundaries and audit identity cannot be spoofed',async()=>{
 const store=openStore(':memory:'),server=createApp(store,'legacy-token-that-is-long-enough',{}, {actors});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const root=`http://127.0.0.1:${server.address().port}`;
 const post=(role,path,body)=>fetch(root+path,{method:'POST',headers:{Authorization:`Bearer ${actors.find(a=>a.role===role).token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
 try {
  const request={decision:'reject',reviewer:'spoofed-admin',note:'Synthetic role boundary fixture.'};
  for(const role of ['reader','editor'])assert.equal((await post(role,'/admin/reviews/ohip/decision',request)).status,403);
  assert.equal(store.summary().audits.length,0);
  assert.equal((await post('reviewer','/admin/reviews/ohip/decision',request)).status,200);
  assert.equal(store.summary().audits[0].reviewer,'test-reviewer');
  assert.equal((await post('reviewer','/admin/sources/seed-ohip/policy',{tier:'A',note:request.note})).status,403);
  assert.equal((await post('admin','/admin/sources/seed-ohip/policy',{tier:'A',reviewer:'spoof',note:request.note})).status,200);
  assert.equal(store.ingestion.sources().find(s=>s.id==='seed-ohip').reviewer,'test-admin');
  const session=await (await fetch(root+'/admin/session',{headers:{Authorization:`Bearer ${actors[0].token}`}})).json();
  assert.deepEqual(session,{id:'test-reader',role:'reader',mode:'individual'});
  assert.equal((await fetch(root+'/admin/session',{headers:{Authorization:'Bearer legacy-token-that-is-long-enough'}})).status,401);
 }finally{await new Promise(r=>server.close(r));store.db.close();}
});
