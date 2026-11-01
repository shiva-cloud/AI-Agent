import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {createAdminAuth} from '../src/admin-auth.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
import {request as httpRequest} from 'node:http';
const account={id:'fixture-admin',role:'admin',token:'fixture-token-'+ 'x'.repeat(32)};
test('credentials expire and invalid calendar expiries are rejected',()=>{
 const auth=createAdminAuth({actors:[{...account,expiresAt:'2000-01-01T00:00:00Z'}]});assert.equal(auth.authenticate('Bearer '+account.token),null);
 assert.throws(()=>createAdminAuth({actors:[{...account,expiresAt:'2026-02-31T00:00:00Z'}]}),/expiry/);
 assert.ok(createAdminAuth({actors:[{...account,expiresAt:'2099-01-01T00:00:00Z'}]}).authenticate('Bearer '+account.token));
});
test('file identities revoke, rotate and change roles without restarting; corrupt configuration fails closed',async()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-auth-')),file=join(root,'actors.json');
 const save=actors=>writeFileSync(file,JSON.stringify(actors));save([account]);
 const store=openStore(':memory:'),server=createApp(store,'legacy-token-that-is-long-enough',{}, {actorsFile:file});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;
 const request=token=>fetch(url+'/admin/session',{headers:{Authorization:'Bearer '+token}});
 try {
  assert.equal((await request(account.token)).status,200);
  // Pause after headers have passed authorization, then revoke before the body ends.
  const accepted=new Promise(resolve=>server.once('request',resolve));
  const pending=httpRequest(url+'/admin/reviews/ohip/decision',{method:'POST',headers:{Authorization:'Bearer '+account.token,'Content-Type':'application/json'}});
  const completed=new Promise((resolve,reject)=>{pending.on('error',reject);pending.on('response',response=>{response.resume();response.on('end',()=>resolve(response.statusCode));});});
  pending.flushHeaders();await accepted;save([]);
  pending.end(JSON.stringify({decision:'reject',note:'Revoked while receiving body.'}));
  assert.equal(await completed,401);assert.equal(store.summary().audits.length,0);
  save([account]);
  save([{...account,role:'reader'}]);assert.equal((await (await request(account.token)).json()).role,'reader');
  const denied=await fetch(url+'/admin/reviews/ohip/decision',{method:'POST',headers:{Authorization:'Bearer '+account.token,'Content-Type':'application/json'},body:JSON.stringify({decision:'reject',note:'Fixture denial test.'})});assert.equal(denied.status,403);
  const rotated={...account,token:'rotated-fixture-'+ 'y'.repeat(32)};save([rotated]);assert.equal((await request(account.token)).status,401);assert.equal((await request(rotated.token)).status,200);
  save([]);assert.equal((await request(rotated.token)).status,401);assert.equal((await request('legacy-token-that-is-long-enough')).status,401);
  writeFileSync(file,'invalid JSON');const invalid=await request(account.token);assert.equal(invalid.status,503);assert.equal((await invalid.json()).code,'identity_unavailable');
  save([account]);assert.equal((await request(account.token)).status,200);assert.equal(store.summary().audits.length,0);
 }finally{
  await new Promise(r=>server.close(r));store.db.close();const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-auth-'));rmSync(resolved,{recursive:true,force:true});
 }
});
