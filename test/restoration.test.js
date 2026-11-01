import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {seeds} from '../src/knowledge.js';
import {createApp} from '../src/server.js';
import {answer} from '../src/engine.js';
const review={reviewer:'Test editor',note:'Test evidence reviewed for current applicability.',tier:'A'};
function setup(){const s=openStore(':memory:');s.ingestion.permitSource('seed-sin-route',review);return s;}
function publish(s,key,changes={}) {
 const today=new Date().toISOString().slice(0,10),expiresAt=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
 const record={...seeds[0],status:'pending',checkedAt:today,expiresAt,...changes};
 const c=s.ingestion.ingest({sourceId:'seed-sin-route',requestKey:key,content:'Social Insurance Number: Apply. Test evidence excerpt.',record});
 return s.ingestion.decide(c.id,{...review,decision:'approve'}).publicationId;
}
function request(s,id,key='restore-one'){return {...review,publicationId:id,requestKey:key,expectedHash:s.ingestion.historyState('sin-route').currentHash};}
test('restoration preserves immutable publications and original evidence dates',()=>{
 const s=setup();try{const first=publish(s,'first'),original=s.records().find(r=>r.id==='sin-route');publish(s,'second',{summary:'Second test summary.'});const history=s.ingestion.history('sin-route');const r=s.ingestion.restore('sin-route',request(s,first));assert.equal(r.publicationId,first);const active=s.records().find(r=>r.id==='sin-route');assert.equal(active.summary,original.summary);assert.equal(active.snapshotId,original.snapshotId);assert.equal(active.checkedAt,original.checkedAt);assert.equal(active.expiresAt,original.expiresAt);assert.deepEqual(s.ingestion.history('sin-route'),history);assert.equal(s.ingestion.historyState('sin-route').restorations.length,1);assert.match(s.summary().audits[0].note,/Restore publication/);}finally{s.db.close();}
});
test('restore retries are idempotent and a reused key with new content fails',()=>{
 const s=setup();try{const first=publish(s,'first');publish(s,'second',{summary:'Updated test summary.'});const req=request(s,first);const event=s.ingestion.restore('sin-route',req);assert.equal(s.ingestion.restore('sin-route',req).restorationId,event.restorationId);assert.throws(()=>s.ingestion.restore('sin-route',{...req,note:'A different review rationale.'}),/key already used/);assert.equal(s.ingestion.historyState('sin-route').restorations.length,1);}finally{s.db.close();}
});
test('changed active state blocks an old restoration request atomically',()=>{
 const s=setup();try{const first=publish(s,'first'),req=request(s,first);s.review('sin-route','rollback',review.reviewer,review.note);assert.throws(()=>s.ingestion.restore('sin-route',req),/changed/);assert.equal(s.ingestion.historyState('sin-route').restorations.length,0);assert.equal(s.records().find(r=>r.id==='sin-route').status,'pending');}finally{s.db.close();}
});
test('cross-record publication references and unknown versions fail',()=>{
 const s=setup();try{const first=publish(s,'first');assert.throws(()=>s.ingestion.restore('ohip',{...request(s,first),expectedHash:s.ingestion.historyState('ohip').currentHash}),/does not belong/);assert.throws(()=>s.ingestion.restore('sin-route',request(s,9999)),/does not belong/);}finally{s.db.close();}
});
test('inactive effective dates and revoked source permission prevent restoration',()=>{
 const s=setup();try{
  const past=new Date(Date.now()-86400000).toISOString().slice(0,10);
  const old=publish(s,'past-policy',{effectiveTo:past});assert.throws(()=>s.ingestion.restore('sin-route',request(s,old)),/currently effective/);
  const current=publish(s,'current-policy');s.db.prepare("UPDATE sources SET policy='unreviewed' WHERE id=?").run('seed-sin-route');assert.throws(()=>s.ingestion.restore('sin-route',request(s,current)),/Source policy/);
 }finally{s.db.close();}
});
test('restoration audit cannot be edited or deleted',()=>{
 const s=setup();try{const first=publish(s,'first');s.ingestion.restore('sin-route',request(s,first));assert.throws(()=>s.db.exec('DELETE FROM restorations'),/Immutable/);assert.throws(()=>s.db.exec("UPDATE restorations SET note='Changed note'"),/Immutable/);}finally{s.db.close();}
});
test('expired historical evidence cannot be revived by restoration',t=>{
 const s=setup();try{const first=publish(s,'first'),req=request(s,first);t.mock.timers.enable({apis:['Date'],now:Date.now()+8*86400000});assert.throws(()=>s.ingestion.restore('sin-route',req),/current expiry/);assert.equal(s.ingestion.historyState('sin-route').restorations.length,0);}finally{s.db.close();}
});
test('restore endpoint is authenticated and history supplies optimistic concurrency token',async()=>{
 const s=setup(),first=publish(s,'first'),token='restoration-token-at-least-24',server=createApp(s,token,{});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{const headers={'Content-Type':'application/json',Authorization:`Bearer ${token}`};const state=await (await fetch(base+'/admin/records/sin-route/history',{headers})).json();assert.match(state.currentHash,/^[a-f0-9]{64}$/);const body=JSON.stringify({...request(s,first),expectedHash:state.currentHash});assert.equal((await fetch(base+'/admin/records/sin-route/restore',{method:'POST',headers:{'Content-Type':'application/json'},body})).status,401);assert.equal((await fetch(base+'/admin/records/sin-route/restore',{method:'POST',headers,body})).status,200);}finally{await new Promise(r=>server.close(r));s.db.close();}
});
test('an in-flight AI response is discarded when its evidence is withdrawn',async()=>{
 const s=setup();publish(s,'first');let release,entered;const gate=new Promise(r=>release=r),started=new Promise(r=>entered=r);const baseline=answer({question:'SIN'},s.records());
 const complete=async({stage})=>{if(stage==='understand'){entered();await gate;return {intent:'SIN application route'};}if(stage==='rewrite')return {message:'Starting guidance.',claims:baseline.claims.map(({id,text})=>({id,text}))};return {english:true,meaningPreserved:true,noUnsupportedClaims:true,questionRespected:true};};
 const server=createApp(s,undefined,{complete});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{const pending=fetch(base+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'SIN'})});await started;s.review('sin-route','rollback',review.reviewer,review.note);release();const response=await pending,result=await response.json();assert.equal(result.ai.status,'knowledge_changed');assert.ok(result.claims.every(c=>c.evidenceId!=='sin-route'),'withdrawn claim absent');const trace=JSON.parse(s.db.prepare('SELECT body FROM traces').get().body);assert.ok(!JSON.stringify(trace.evidence).includes('sin-route'));}finally{release();await new Promise(r=>server.close(r));s.db.close();}
});
test('source suspension withdraws all active guidance and blocks reapproval and imports',()=>{
 const s=setup();try{publish(s,'first');const duplicate={...seeds[0],id:'same-source',status:'research_seed'};s.db.prepare('INSERT INTO records VALUES (?,?)').run(duplicate.id,JSON.stringify(duplicate));const result=s.ingestion.suspendSource('seed-sin-route',review);assert.deepEqual(result.withdrawn.sort(),['same-source','sin-route']);assert.equal(answer({question:'SIN'},s.records()).claims.every(c=>c.evidenceId!=='sin-route'),true);assert.throws(()=>s.review('sin-route','approve',review.reviewer,review.note),/suspended/);assert.throws(()=>publish(s,'blocked'),/policy review/);assert.equal(s.ingestion.sources().find(r=>r.id==='seed-sin-route').suspended,1);assert.equal(s.ingestion.history('sin-route').length,1);}finally{s.db.close();}
});
test('renewed source permission does not silently republish withdrawn guidance',()=>{
 const s=setup();try{const first=publish(s,'first');s.ingestion.suspendSource('seed-sin-route',review);s.ingestion.permitSource('seed-sin-route',review);assert.equal(s.records().find(r=>r.id==='sin-route').status,'pending');assert.ok(answer({question:'SIN'},s.records()).claims.every(c=>c.evidenceId!=='sin-route'),'withdrawn claim absent');s.ingestion.restore('sin-route',request(s,first));assert.ok(answer({question:'SIN'},s.records()).claims.some(c=>c.evidenceId==='sin-route'),'restored claim present');}finally{s.db.close();}
});
test('source suspension also protects legacy research seeds from reapproval',()=>{
 const s=openStore(':memory:');try{s.ingestion.suspendSource('seed-sin-route',review);assert.throws(()=>s.review('sin-route','approve',review.reviewer,review.note),/suspended/);assert.equal(s.records().find(r=>r.id==='sin-route').status,'pending');}finally{s.db.close();}
});
test('imported high-risk evidence cannot bypass a downgraded source tier through legacy review',()=>{
 const s=setup();try{publish(s,'first',{risk:'high'});s.ingestion.suspendSource('seed-sin-route',review);s.ingestion.permitSource('seed-sin-route',{...review,tier:'D'});assert.throws(()=>s.review('sin-route','approve',review.reviewer,review.note),/tier A or B/);assert.equal(s.records().find(r=>r.id==='sin-route').status,'pending');}finally{s.db.close();}
});
test('source suspension API requires auth and immediately removes public claims',async()=>{
 const s=setup();publish(s,'first');const token='suspension-token-at-least-24',server=createApp(s,token,{});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,body=JSON.stringify(review),headers={'Content-Type':'application/json'};
 try{assert.equal((await fetch(base+'/admin/sources/seed-sin-route/suspend',{method:'POST',headers,body})).status,401);assert.equal((await fetch(base+'/admin/sources/seed-sin-route/suspend',{method:'POST',headers:{...headers,Authorization:`Bearer ${token}`},body})).status,200);const result=await (await fetch(base+'/v1/answers',{method:'POST',headers,body:JSON.stringify({question:'SIN'})})).json();assert.ok(result.claims.every(c=>c.evidenceId!=='sin-route'),'withdrawn claim gone from public claims');}finally{await new Promise(r=>server.close(r));s.db.close();}
});
