import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {seeds} from '../src/knowledge.js';
import {answer} from '../src/engine.js';
import {createApp} from '../src/server.js';
const review={reviewer:'Test reviewer',note:'Test fixture permission and evidence reviewed.',tier:'A'};
function fixture(key='test-import',changes={}) {
  const today=new Date().toISOString().slice(0,10),expiry=new Date(Date.now()+86400000*7).toISOString().slice(0,10);
  const content=`${seeds[0].quote} Social Insurance Number: Apply. This is a test excerpt, not new researched evidence.`;
  return {sourceId:'seed-sin-route',requestKey:key,content,record:{...seeds[0],status:'pending',checkedAt:today,expiresAt:expiry,...changes}};
}
function ready(){const store=openStore(':memory:');store.ingestion.permitSource('seed-sin-route',review);return store;}
test('registry migration inventories seeds without falsely claiming source permission',()=>{
 const s=openStore(':memory:');try{assert.equal(s.ingestion.sources().length,new Set(seeds.map(r=>r.url)).size);assert.ok(s.ingestion.sources().every(x=>x.policy==='unreviewed'));assert.throws(()=>s.ingestion.ingest(fixture()),/policy review/);assert.equal(s.db.prepare('SELECT count(*) AS n FROM snapshots').get().n,0);}finally{s.db.close();}
});
test('manual import is pending, snapshot-backed and idempotent',()=>{
 const s=ready();try{const original=s.records().find(r=>r.id==='sin-route');const c=s.ingestion.ingest(fixture());assert.equal(c.status,'pending');assert.deepEqual(s.records().find(r=>r.id==='sin-route'),original);assert.equal(s.ingestion.ingest(fixture()).id,c.id);assert.throws(()=>s.ingestion.ingest({...fixture(),content:'A different English excerpt.'}),/Idempotency/);assert.equal(s.db.prepare('SELECT count(*) AS n FROM snapshots').get().n,1);}finally{s.db.close();}
});
test('quote, URL, calendar date, risk and geography validation reject unsupported provenance',()=>{
 const s=ready();try{for(const changes of [{quote:'Absent quote'},{url:'https://example.com/'},{checkedAt:'2026-02-31'},{jurisdiction:'Paris'},{topic:'unknown'},{topic:'health',risk:'low'},{status:'approved'},{snapshotId:'fake'}])assert.throws(()=>s.ingestion.ingest(fixture('test-import',changes)));assert.equal(s.ingestion.candidates().length,0);}finally{s.db.close();}
});
test('publication stores immutable history and snapshot-aware answer traces',()=>{
 const s=ready();try{const c=s.ingestion.ingest(fixture());const result=s.ingestion.decide(c.id,{...review,decision:'approve'});assert.ok(result.publicationId);const r=s.records().find(r=>r.id==='sin-route');assert.equal(r.status,'approved');assert.equal(r.snapshotId,c.snapshot_id);assert.equal(s.ingestion.history(r.id).length,1);const a=answer({question:'SIN'},s.records());s.log(a);const trace=JSON.parse(s.db.prepare('SELECT body FROM traces').get().body);assert.equal(trace.evidence.find(e=>e.recordId==='sin-route')?.snapshotId,c.snapshot_id);assert.throws(()=>s.ingestion.decide(c.id,{...review,decision:'approve'}),/already decided/);}finally{s.db.close();}
});
test('stale concurrent candidate cannot overwrite a publication',()=>{
 const s=ready();try{const c=s.ingestion.ingest(fixture('first'));const d=s.ingestion.ingest(fixture('second',{summary:'A different proposed English summary.'}));s.ingestion.decide(c.id,{...review,decision:'approve'});assert.throws(()=>s.ingestion.decide(d.id,{...review,decision:'approve'}),/changed/);assert.equal(s.ingestion.candidates().find(x=>x.id===d.id).status,'pending');assert.equal(s.ingestion.history('sin-route').length,1);}finally{s.db.close();}
});
test('rejection does not change public records and records the decision',()=>{
 const s=ready();try{const before=s.records();const c=s.ingestion.ingest(fixture());s.ingestion.decide(c.id,{...review,decision:'reject'});assert.deepEqual(s.records(),before);assert.equal(s.db.prepare('SELECT decision FROM candidate_decisions').get().decision,'reject');assert.equal(s.ingestion.history('sin-route').length,0);}finally{s.db.close();}
});
test('snapshots, publication history and candidate payloads cannot be edited',()=>{
 const s=ready();try{const c=s.ingestion.ingest(fixture());assert.throws(()=>s.db.prepare('UPDATE snapshots SET content=? WHERE id=?').run('Changed text',c.snapshot_id),/Immutable/);assert.throws(()=>s.db.exec('DELETE FROM snapshots'),/Immutable/);assert.throws(()=>s.db.prepare('UPDATE candidates SET body=? WHERE id=?').run(JSON.stringify({...fixture().record,summary:"Changed candidate summary."}),c.id),/Immutable/);s.ingestion.decide(c.id,{...review,decision:'approve'});assert.throws(()=>s.db.exec('DELETE FROM publications'),/Immutable/);}finally{s.db.close();}
});
test('new high-risk evidence needs authoritative tier and explicit approval',()=>{
 const s=openStore(':memory:');try{s.ingestion.permitSource('seed-sin-route',{...review,tier:'D'});assert.throws(()=>s.ingestion.ingest(fixture('high',{risk:'high'})),/tier A or B/);s.ingestion.permitSource('seed-sin-route',review);const c=s.ingestion.ingest(fixture('new-record',{id:'new-evidence',risk:'high'}));assert.ok(!s.records().some(r=>r.id==='new-evidence'));s.ingestion.decide(c.id,{...review,decision:'approve'});assert.equal(s.records().find(r=>r.id==='new-evidence').status,'approved');}finally{s.db.close();}
});
test('non-English and forged metadata never enter snapshots',()=>{
 const s=ready();try{assert.throws(()=>s.ingestion.ingest({...fixture(),content:'English text \u0939\u093f\u0928\u094d\u0926\u0940'}),/English/);assert.throws(()=>s.ingestion.ingest(fixture('reviewed',{reviewedAt:'2026-10-28'})),/server/);assert.equal(s.db.prepare('SELECT count(*) AS n FROM snapshots').get().n,0);}finally{s.db.close();}
});
test('source registration rejects duplicates and supports audited manual permission',()=>{
 const s=ready();try{const input={id:'test-source',url:'https://example.com/settlement',owner:'Test owner',language:'en',tier:'C',...review};s.ingestion.registerSource(input);assert.equal(s.ingestion.sources().find(x=>x.id==='test-source').policy,'manual_permitted');assert.throws(()=>s.ingestion.registerSource(input));assert.throws(()=>s.ingestion.registerSource({...input,id:'unsafe',url:'https://user:password@example.com/'}),/canonical/);}finally{s.db.close();}
});
test('all ingestion endpoints require auth; API import, decision and history work together',async()=>{
 const s=openStore(':memory:'),token='ingestion-test-token-at-least-24',server=createApp(s,token);await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const post=(path,body,authorized=true)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(authorized?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
 try {
  assert.equal((await post('/admin/ingestion/run',fixture(),false)).status,401);
  assert.equal((await fetch(base+'/admin/candidates')).status,401);
  assert.equal((await fetch(base+'/editorial.js')).status,200);
  assert.equal((await post('/admin/sources/seed-sin-route/policy',review)).status,200);
  const response=await post('/admin/ingestion/run',fixture());assert.equal(response.status,201);const c=await response.json();
  assert.equal((await post('/admin/ingestion/run',fixture())).status,200);
  assert.equal((await post(`/admin/candidates/${c.id}/decision`,{...review,decision:'approve'})).status,200);
  const history=await (await fetch(base+'/admin/records/sin-route/history',{headers:{Authorization:`Bearer ${token}`}})).json();assert.equal(history.versions.length,1);
 }finally{await new Promise(r=>server.close(r));s.db.close();}
});
