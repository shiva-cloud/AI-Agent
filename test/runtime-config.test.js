import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,realpathSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,basename} from 'node:path';
import {databasePath} from '../src/runtime-config.js';
import {openStore} from '../src/store.js';
import {verifyDatabase} from '../src/verification.js';

test('database path precedence is explicit, environment, default; invalid paths fail closed',()=>{
 assert.equal(databasePath('explicit.sqlite',{DB_PATH:'env.sqlite'}),'explicit.sqlite');
 assert.equal(databasePath(undefined,{DB_PATH:'env.sqlite'}),'env.sqlite');
 assert.equal(databasePath(undefined,{}),'data/settlement.sqlite');
 for(const value of ['',' ','bad\0path'])assert.throws(()=>databasePath(undefined,{DB_PATH:value}),/DB_PATH/);
});

test('operational CLI commands honor DB_PATH without touching a default database',()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-config-')),file=join(root,'configured.sqlite');
 const run=(name,args=[],envPath=file)=>spawnSync(process.execPath,[resolve('scripts',name+'.js'),...args],{cwd:root,env:{...process.env,DB_PATH:envPath},encoding:'utf8'});
 try {
  const store=openStore(file);store.db.close();const before=verifyDatabase(file);
  for(const name of ['verify-data','migrate-dry-run','policy-lint','migrate']) {
   const result=run(name);assert.equal(result.status,0,result.stderr);assert.ok(JSON.parse(result.stdout));
  }
  assert.equal(verifyDatabase(file).dataDigest,before.dataDigest);
  assert.equal(verifyDatabase(file).schemaDigest,before.schemaDigest);
  const backup=run('backup');assert.equal(backup.status,0,backup.stderr);
  const saved=JSON.parse(backup.stdout);assert.equal(saved.verification.dataDigest,before.dataDigest);
  assert.equal(run('verify-backup',[saved.directory]).status,0);
  assert.equal(run('restore-drill',[saved.directory]).status,0);
  assert.equal(run('verify-data',[file],join(root,'absent.sqlite')).status,0);
  for(const name of ['migrate','policy-lint','migrate-dry-run'])assert.equal(run(name,[file],join(root,'absent.sqlite')).status,0);
  const missing=join(root,'absent.sqlite');assert.notEqual(run('policy-lint',[],missing).status,0);assert.equal(existsSync(missing),false);
  assert.equal(existsSync(join(root,'data')),false);
 }finally {
  const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-config-'));
  rmSync(resolved,{recursive:true,force:true});
 }
});
