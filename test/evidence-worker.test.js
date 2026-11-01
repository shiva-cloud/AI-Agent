import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {openStore} from '../src/store.js';
import {openJobQueue} from '../src/jobs.js';
import {runOneJob} from '../src/job-worker.js';
import {evidenceWorkerOptions} from '../src/evidence-worker.js';
import {verifyDatabase} from '../src/verification.js';
import {seeds} from '../src/knowledge.js';
import {openEvidenceIndex} from '../src/evidence-index.js';
import {answer} from '../src/engine.js';
const reviewer={reviewer:'Fixture reviewer',note:'Synthetic permission for testing only.',tier:'A'};

async function fixture(fn) {
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-handler-')),file=join(root,'evidence.sqlite'),jobs=join(root,'jobs.sqlite');
 const store=openStore(file),queue=openJobQueue(jobs);
 try {
  store.ingestion.permitSource('seed-sin-route',reviewer);
  const record={...seeds[0],status:'pending',checkedAt:new Date().toISOString().slice(0,10),expiresAt:new Date(Date.now()+7*86400000).toISOString().slice(0,10)};
  const candidate=store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'fixture-candidate',content:record.quote,record});
  await fn({store,queue,file,jobs,root,candidateId:candidate.id,snapshotId:candidate.snapshot_id,options:evidenceWorkerOptions(file)});
 }finally {
  queue.close();store.db.close();const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-handler-'));rmSync(resolved,{recursive:true,force:true});
 }
}

test('real snapshot handler verifies stored content and links without changing evidence',async()=>fixture(async({queue,file,snapshotId,options})=>{
 const before=verifyDatabase(file);
 const result=options.handlers.verify_snapshot({targetId:snapshotId});assert.equal(result.linkedRecords,1);
 queue.enqueue({requestKey:'fixture',kind:'verify_snapshot',targetId:snapshotId});
 assert.equal((await runOneJob(queue,{workerId:'fixture-worker',...options})).status,'succeeded');
 assert.deepEqual(verifyDatabase(file),before);
}));

test('suspension between authorization and verification blocks execution',async()=>fixture(async({store,queue,snapshotId,options})=>{
 queue.enqueue({requestKey:'fixture',kind:'verify_snapshot',targetId:snapshotId});
 const result=await runOneJob(queue,{workerId:'fixture-worker',...options,authorize:input=>{
  assert.equal(options.authorize(input),true);store.ingestion.suspendSource('seed-sin-route',reviewer);return true;
 }});
 assert.equal(result.status,'blocked');assert.equal(result.code,'policy_denied');
 assert.equal(store.db.prepare('SELECT count(*) AS n FROM publications').get().n,0);
}));

test('tampered snapshot fails verification without deleting or publishing data',async()=>fixture(async({store,queue,snapshotId,options})=>{
 store.db.exec('DROP TRIGGER snapshots_immutable_update');
 store.db.prepare('UPDATE snapshots SET content_hash=? WHERE id=?').run('0'.repeat(64),snapshotId);
 queue.enqueue({requestKey:'fixture',kind:'verify_snapshot',targetId:snapshotId,maxAttempts:1});
 const result=await runOneJob(queue,{workerId:'fixture-worker',...options});assert.equal(result.status,'failed');assert.equal(result.code,'handler_failed');
 assert.equal(store.db.prepare('SELECT count(*) AS n FROM snapshots').get().n,1);
 assert.equal(store.db.prepare('SELECT count(*) AS n FROM publications').get().n,0);
}));

test('missing snapshots and unsupported production job kinds are denied',async()=>fixture(async({queue,options})=>{
 for(const [kind,targetId] of [['source_check','seed-sin-route'],['reindex','all'],['verify_snapshot','missing']]) {
  queue.enqueue({requestKey:`fixture-${kind}`,kind,targetId});
  assert.equal((await runOneJob(queue,{workerId:'fixture-worker',...options})).status,'blocked');
 }
}));

test('worker CLI uses isolated configured paths and does not create missing evidence',async()=>fixture(async({queue,jobs,file,snapshotId,root})=>{
 queue.enqueue({requestKey:'cli-fixture',kind:'verify_snapshot',targetId:snapshotId});const before=verifyDatabase(file);
 const run=path=>spawnSync(process.execPath,[resolve('scripts/worker-once.js')],{cwd:root,env:{...process.env,DB_PATH:path,JOB_DB_PATH:jobs},encoding:'utf8'});
 const result=run(file);assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).status,'succeeded');assert.deepEqual(verifyDatabase(file),before);
 queue.enqueue({requestKey:'missing-file',kind:'verify_snapshot',targetId:snapshotId,maxAttempts:1});
 const missing=join(root,'missing.sqlite');assert.notEqual(run(missing).status,0);assert.equal(existsSync(missing),false);
}));

test('published provenance is verified separately from the snapshot hash',async()=>fixture(async({store,candidateId,snapshotId,options})=>{
 store.ingestion.decide(candidateId,{...reviewer,decision:'approve'});
 assert.equal(options.handlers.verify_snapshot({targetId:snapshotId}).linkedRecords,2);
 store.db.exec('DROP TRIGGER publications_immutable_update');
 const row=store.db.prepare('SELECT id,body FROM publications').get();
 store.db.prepare('UPDATE publications SET body=? WHERE id=?').run(JSON.stringify({...JSON.parse(row.body),snapshotId:'wrong-snapshot'}),row.id);
 assert.throws(()=>options.handlers.verify_snapshot({targetId:snapshotId}),/provenance/);
}));

test('reindex job builds separate persistent FTS storage without changing evidence',async()=>fixture(async({queue,file,root,store})=>{
 const before=verifyDatabase(file),indexPath=join(root,'search.sqlite');
 queue.enqueue({requestKey:'reindex-fixture',kind:'reindex',targetId:'all',maxAttempts:1});
 assert.equal((await runOneJob(queue,{workerId:'fixture-worker',...evidenceWorkerOptions(file,{indexPath})})).status,'succeeded');
 const index=openEvidenceIndex(indexPath,{readOnly:true});
 try{assert.equal(answer({question:'Vancouver library'},store.records(),new Date('2026-10-28'),index).retrieval.version,'sqlite-fts5-bm25-1');}finally{index.close();}
 assert.deepEqual(verifyDatabase(file),before);
 assert.throws(()=>openEvidenceIndex(file),/separate database/);assert.deepEqual(verifyDatabase(file),before);
}));
