import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,relative,isAbsolute} from 'node:path';
import {openStore} from '../src/store.js';
import {verifyDatabase} from '../src/verification.js';
import {createBackup,verifyBackup,restoreDrill} from '../src/recovery.js';
import {seeds} from '../src/knowledge.js';
import {answer} from '../src/engine.js';
import {publicEvidence} from '../src/public-evidence.js';

function workspace(){const root=mkdtempSync(join(tmpdir(),'northstar-recovery-'));return {root,file:join(root,'source.sqlite'),backups:join(root,'backups'),drills:join(root,'drills')};}
function cleanup(root){const rel=relative(resolve(tmpdir()),resolve(root));assert.ok(!isAbsolute(rel) && !rel.startsWith('..') && rel.startsWith('northstar-recovery-'));rmSync(root,{recursive:true,force:true});}

test('authenticated authorization survives backup/restore and corrupt bindings fail verification',async()=>{
 const w=workspace(),store=openStore(w.file);
 let restored;
 try {
  const actor={id:'recovery-reviewer',role:'reviewer',mode:'individual'};
  const note='Synthetic authenticated recovery fixture review.';
  const seed=seeds.find(r=>r.id==='sin-route');
  const record={...seed,id:'recovery-auth-fixture',risk:'high',status:'pending',quote:'Applicants must submit their supporting documents with the completed application.',checkedAt:new Date().toISOString().slice(0,10),expiresAt:'2099-01-01'};
  store.ingestion.permitSource('seed-sin-route',{reviewer:'editorial-board',note,tier:'A'});
  const candidate=store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'recovery-auth-import',content:record.quote,record});
  store.ingestion.decide(candidate.id,{decision:'approve',reviewer:actor.id,note,reviewMethod:'source_verified'},actor);
  const before=verifyDatabase(w.file);
  assert.equal(before.counts.audit_authorizations,1);
  const saved=await createBackup(w.file,w.backups);
  assert.equal((await verifyBackup(saved.directory)).verification.dataDigest,before.dataDigest);
  const report=await restoreDrill(saved.directory,w.drills);
  restored=openStore(report.restoredDatabase);
  assert.equal(publicEvidence(restored.db,restored.records()).find(r=>r.id===record.id).status,'approved');
  store.db.exec('DROP TRIGGER audit_authorizations_immutable_update');
  store.db.exec("UPDATE audit_authorizations SET payload_hash='corrupt'");
  assert.throws(()=>verifyDatabase(w.file),/Audit authorization integrity mismatch/);
 }finally{restored?.db.close();store.db.close();cleanup(w.root);}
});
test('online backup includes committed WAL writes and preserves schema and logical state',async()=>{
 const w=workspace(),store=openStore(w.file);try{
  store.review('sin-route','reject','Test reviewer','Evidence withdrawn for backup test.');
  store.log(answer({question:'Indian groceries in Brampton'},seeds));
  const gap=store.gapWork.list().items[0];
  store.gapWork.update(gap.id,{revision:gap.revision,status:'in_progress',priority:'high',owner:'Engineering',actor:'Test editor',note:'Investigating regression fixture.',regressionRef:''});
  const before=verifyDatabase(w.file),saved=await createBackup(w.file,w.backups),checked=await verifyBackup(saved.directory);
  assert.equal(checked.verification.counts.audits,1);assert.equal(checked.verification.dataDigest,before.dataDigest);assert.equal(checked.verification.schemaDigest,before.schemaDigest);assert.equal(verifyDatabase(w.file).dataDigest,before.dataDigest);
  assert.equal(checked.verification.counts.gap_work_items,1);assert.equal(checked.verification.counts.gap_work_events,1);
 }finally{store.db.close();cleanup(w.root);}
});
test('restore drill preserves working database and passes deterministic answer smoke checks',async()=>{
 const w=workspace(),store=openStore(w.file);try{
  const before=verifyDatabase(w.file),saved=await createBackup(w.file,w.backups),report=await restoreDrill(saved.directory,w.drills);
  assert.equal(report.status,'passed');assert.equal(report.verification.dataDigest,before.dataDigest);assert.equal(report.smoke.length,3);assert.ok(report.smoke.every(s=>s.citationsLinked));assert.notEqual(report.restoredDatabase,w.file);assert.equal(verifyDatabase(w.file).dataDigest,before.dataDigest);assert.ok(existsSync(join(report.directory,'report.json')));
 }finally{store.db.close();cleanup(w.root);}
});
test('repeated backups and drills create distinct directories instead of overwriting files',async()=>{
 const w=workspace(),store=openStore(w.file);try{
  const a=await createBackup(w.file,w.backups),original=readFileSync(join(a.directory,'manifest.json'),'utf8'),b=await createBackup(w.file,w.backups);
  assert.notEqual(a.directory,b.directory);assert.equal(readFileSync(join(a.directory,'manifest.json'),'utf8'),original);
  const one=await restoreDrill(a.directory,w.drills),two=await restoreDrill(a.directory,w.drills);assert.notEqual(one.directory,two.directory);
 }finally{store.db.close();cleanup(w.root);}
});
test('changed backup bytes are rejected before a recovery directory is created',async()=>{
 const w=workspace(),store=openStore(w.file);try{
  const saved=await createBackup(w.file,w.backups),path=join(saved.directory,'database.sqlite'),bytes=readFileSync(path);bytes[200]^=1;writeFileSync(path,bytes);
  await assert.rejects(()=>restoreDrill(saved.directory,w.drills),/checksum mismatch/);assert.ok(!existsSync(w.drills));
 }finally{store.db.close();cleanup(w.root);}
});
test('manifest path substitution and altered logical digests are rejected',async()=>{
 const w=workspace(),store=openStore(w.file);try{
  const saved=await createBackup(w.file,w.backups),path=join(saved.directory,'manifest.json'),manifest=JSON.parse(readFileSync(path,'utf8'));
  writeFileSync(path,JSON.stringify({...manifest,databaseFile:'../source.sqlite'}));await assert.rejects(()=>verifyBackup(saved.directory),/manifest/);
  writeFileSync(path,JSON.stringify({...manifest,verification:{...manifest.verification,dataDigest:'0'.repeat(64)}}));await assert.rejects(()=>verifyBackup(saved.directory),/differs/);
 }finally{store.db.close();cleanup(w.root);}
});
test('incomplete output cannot be mistaken for a verified backup',async()=>{
 const w=workspace();try{await assert.rejects(()=>verifyBackup(w.root));await assert.rejects(()=>createBackup(w.file,w.backups));assert.ok(!existsSync(w.backups));}finally{cleanup(w.root);}
});
test('invalid snapshot hashes prevent completion manifests',async()=>{
 const w=workspace(),store=openStore(w.file);try{
  const reviewer={reviewer:'Test reviewer',note:'Test fixture permission reviewed.',tier:'A'};store.ingestion.permitSource('seed-sin-route',reviewer);
  const today=new Date().toISOString().slice(0,10),expiresAt=new Date(Date.now()+86400000*7).toISOString().slice(0,10);
  store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'test-snapshot',content:'Social Insurance Number: Apply. Test excerpt.',record:{...seeds[0],status:'pending',checkedAt:today,expiresAt}});
  store.db.exec('DROP TRIGGER snapshots_immutable_update');store.db.exec("UPDATE snapshots SET content_hash='incorrect'");
  await assert.rejects(()=>createBackup(w.file,w.backups),/Snapshot content hash mismatch/);
  const outputs=readdirSync(w.backups);assert.equal(outputs.length,1);assert.ok(!existsSync(join(w.backups,outputs[0],'manifest.json')));
 }finally{store.db.close();cleanup(w.root);}
});
