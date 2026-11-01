import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {checkStorageReadiness} from '../src/storage-readiness.js';

function fixture(t) {
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-ready-'));
 t.after(()=>{const actual=realpathSync(root);assert.equal(dirname(actual),parent);assert.ok(basename(actual).startsWith('northstar-ready-'));rmSync(actual,{recursive:true,force:true});});
 return join(root,'fixture.sqlite');
}

test('readiness detects a real write lock and recovers without changing database contents',async t=>{
 const file=fixture(t),store=openStore(file),lock=new DatabaseSync(file),server=createApp(store,null,{});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}/ready`;
 let locked=false;
 const before=JSON.stringify(store.summary());
 try {
  store.db.exec('PRAGMA busy_timeout=5000');
  assert.equal((await fetch(url)).status,200);
  lock.exec('BEGIN IMMEDIATE');locked=true;
  const response=await fetch(url,{signal:AbortSignal.timeout(2000)});
  assert.equal(response.status,503);assert.deepEqual(await response.json(),{status:'not_ready',reason:'storage_unavailable'});
  assert.equal(store.db.prepare('PRAGMA busy_timeout').get().timeout,5000);
  lock.exec('ROLLBACK');locked=false;
  assert.equal((await fetch(url)).status,200);
  assert.equal(JSON.stringify(store.summary()),before);
  assert.equal(store.db.prepare('SELECT count(*) n FROM traces').get().n,0);
 }finally{if(locked)lock.exec('ROLLBACK');await new Promise(resolve=>server.close(resolve));lock.close();store.db.close();}
});

test('readiness rejects read-only and query-only connections and preserves caller transactions',t=>{
 const file=fixture(t),store=openStore(file);
 try {
  const readonlyFile=file+'.readonly';
  const fixtureDb=new DatabaseSync(readonlyFile);fixtureDb.exec('CREATE TABLE records(id TEXT); CREATE TABLE traces(id TEXT)');fixtureDb.close();
  const readonly=new DatabaseSync(readonlyFile,{readOnly:true});
  try{assert.throws(()=>checkStorageReadiness(readonly),/readonly|read.only/i);}finally{readonly.close();}
  store.db.exec('PRAGMA query_only=1');assert.throws(()=>checkStorageReadiness(store.db));store.db.exec('PRAGMA query_only=0');
  store.db.exec('BEGIN IMMEDIATE');
  assert.throws(()=>checkStorageReadiness(store.db),/transaction/);
  // The probe must not roll back a transaction it did not create.
  assert.throws(()=>store.db.exec('BEGIN IMMEDIATE'),/transaction/);
  store.db.exec('ROLLBACK');assert.doesNotThrow(()=>checkStorageReadiness(store.db));
 }finally{store.db.close();}
});
