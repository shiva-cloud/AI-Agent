import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,realpathSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {databasePath,assertTestModeAllowed,seedDatabaseFromSnapshot} from '../src/runtime-config.js';
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
  let policyStatus=0;
  for(const name of ['verify-data','migrate-dry-run','policy-lint','migrate']) {
   const result=run(name),report=JSON.parse(result.stdout);
   // This is a DB-path contract test, not a claim that time-sensitive seed
   // evidence never expires. Policy lint must retain its expired-data exit code.
   if(name==='policy-lint')policyStatus=report.warnings.some(w=>w.code==='evidence_expired')?1:0;
   assert.equal(result.status,name==='policy-lint'?policyStatus:0,`${name}: ${result.stderr}`);assert.ok(report);
  }
  assert.equal(verifyDatabase(file).dataDigest,before.dataDigest);
  assert.equal(verifyDatabase(file).schemaDigest,before.schemaDigest);
  const backup=run('backup');assert.equal(backup.status,0,backup.stderr);
  const saved=JSON.parse(backup.stdout);assert.equal(saved.verification.dataDigest,before.dataDigest);
  assert.equal(run('verify-backup',[saved.directory]).status,0);
  assert.equal(run('restore-drill',[saved.directory]).status,0);
  assert.equal(run('verify-data',[file],join(root,'absent.sqlite')).status,0);
  for(const name of ['migrate','policy-lint','migrate-dry-run'])assert.equal(run(name,[file],join(root,'absent.sqlite')).status,name==='policy-lint'?policyStatus:0);
  const missing=join(root,'absent.sqlite');assert.notEqual(run('policy-lint',[],missing).status,0);assert.equal(existsSync(missing),false);
  assert.equal(existsSync(join(root,'data')),false);
 }finally {
  const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-config-'));
  rmSync(resolved,{recursive:true,force:true});
 }
});

test('testing mode runs only on a loopback listener and never in production', () => {
  assert.doesNotThrow(()=>assertTestModeAllowed({}));
  assert.doesNotThrow(()=>assertTestModeAllowed({TEST_MODE:'0',HOST:'0.0.0.0'}));
  for(const HOST of [undefined,'127.0.0.1','::1','localhost'])assert.doesNotThrow(()=>assertTestModeAllowed({TEST_MODE:'1',HOST}));
  assert.throws(()=>assertTestModeAllowed({TEST_MODE:'1',NODE_ENV:'production'}),/NODE_ENV=production/);
  for(const HOST of ['0.0.0.0','::','192.168.1.5','example.com'])assert.throws(()=>assertTestModeAllowed({TEST_MODE:'1',HOST}),/loopback HOST/);
  assert.throws(()=>assertTestModeAllowed({TEST_MODE:'1',PUBLIC_ORIGIN:'https://northstar.example'}),/HTTPS PUBLIC_ORIGIN/);
  const server=fileURLToPath(new URL('../src/server.js',import.meta.url));
  const refused=spawnSync(process.execPath,[server],{env:{...process.env,TEST_MODE:'1',NODE_ENV:'',HOST:'0.0.0.0',ACCOUNTS_DB_PATH:':memory:',DB_PATH:':memory:',PORT:'0'},encoding:'utf8',timeout:20000});
  assert.notEqual(refused.status,0);
  assert.match(refused.stderr,/loopback HOST/);
});

test('a release snapshot seeds only an absent database and never overwrites one', () => {
  const dir=mkdtempSync(join(tmpdir(),'seed-snapshot-'));
  try {
    const seed=join(dir,'seed.sqlite'),target=join(dir,'volume','settlement.sqlite');
    const store=openStore(seed);store.db.close();
    assert.equal(seedDatabaseFromSnapshot(target,undefined),false);
    assert.equal(seedDatabaseFromSnapshot(':memory:',seed),false);
    assert.throws(()=>seedDatabaseFromSnapshot(target,join(dir,'missing.sqlite')),/SEED_DB_PATH does not exist/);
    assert.equal(seedDatabaseFromSnapshot(target,seed),true);
    assert.ok(existsSync(target));
    assert.equal(seedDatabaseFromSnapshot(target,seed),false);
  } finally {
    rmSync(dir,{recursive:true,force:true});
  }
});
