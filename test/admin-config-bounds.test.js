import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync,writeFileSync,renameSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {actorsFromEnvironment,createFileAdminAuth,AdminConfigUnavailable} from '../src/admin-auth.js';

test('environment identity configuration is bounded by UTF-8 bytes',()=>{
 assert.deepEqual(actorsFromEnvironment({ADMIN_ACTORS_JSON:'[]'+' '.repeat(65534)}),[]);
 for(const value of ['[]'+' '.repeat(65535),'é'.repeat(32769),42,null])assert.throws(()=>actorsFromEnvironment({ADMIN_ACTORS_JSON:value}),/Invalid ADMIN_ACTORS_JSON/);
});

test('identity file enforces byte boundary, rejects invalid UTF-8 and reloads atomic replacements',()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-auth-bounds-')),file=join(root,'actors.json');
 const actor={id:'fixture-reader',role:'reader',token:'fixture-token-'+ 'x'.repeat(32)},json=JSON.stringify([actor]);
 try {
  writeFileSync(file,json+' '.repeat(65536-Buffer.byteLength(json)));
  const auth=createFileAdminAuth(file);
  assert.equal(auth.authenticate('Bearer '+actor.token).id,actor.id);
  writeFileSync(file,json+' '.repeat(65537-Buffer.byteLength(json)));
  assert.throws(()=>auth.authenticate('Bearer '+actor.token),AdminConfigUnavailable);
  // Invalid bytes inside a JSON string would be silently replaced by ordinary UTF-8 decoding.
  writeFileSync(file,Buffer.concat([Buffer.from(json.slice(0,-2)+',"note":"'),Buffer.from([0xff]),Buffer.from('"}]')]));
  assert.throws(()=>auth.authenticate('Bearer '+actor.token),{message:'Admin identity configuration unavailable'});
  const replacement=join(root,'new.json');writeFileSync(replacement,'[]');renameSync(replacement,file);
  assert.equal(auth.authenticate('Bearer '+actor.token),null);
  for(let i=0;i<100;i++){writeFileSync(file,'invalid');assert.throws(()=>auth.authenticate('Bearer '+actor.token),AdminConfigUnavailable);}
  writeFileSync(file,json);assert.equal(auth.authenticate('Bearer '+actor.token).id,actor.id);
 }finally{const actual=realpathSync(root);assert.equal(dirname(actual),parent);assert.ok(basename(actual).startsWith('northstar-auth-bounds-'));rmSync(actual,{recursive:true,force:true});}
});
