import test from 'node:test';
import assert from 'node:assert/strict';
import {assessChange,excerptDifference} from '../src/changes.js';
import {openStore} from '../src/store.js';
import {seeds} from '../src/knowledge.js';
import {createApp} from '../src/server.js';
const review={reviewer:'Test editor',note:'Test fixture access and evidence reviewed.',tier:'A'};
function input(key,content='Social Insurance Number: Apply. Allow 10 days.',changes={}){
 const today=new Date().toISOString().slice(0,10),expiresAt=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
 return {sourceId:'seed-sin-route',requestKey:key,content,record:{...seeds[0],checkedAt:today,expiresAt,status:'pending',...changes}};
}
function setup(){const s=openStore(':memory:');s.ingestion.permitSource('seed-sin-route',review);return s;}
function publish(s){const c=s.ingestion.ingest(input('first'));s.ingestion.decide(c.id,{...review,decision:'approve'});return c;}
test('excerpt spans reconstruct exact old and new text without erasing whitespace changes',()=>{
 for(const [before,after] of [['abc','abdc'],['a  b','a b'],['same','same'],['old','new'],['','new'],['old','']]){
  const d=excerptDifference(before,after),prefix=before.slice(0,d.commonPrefixCharacters),suffix=d.commonSuffixCharacters?before.slice(-d.commonSuffixCharacters):'';
  assert.equal(prefix+d.before+suffix,before);assert.equal(prefix+d.after+suffix,after);assert.equal(d.changed,before!==after);
 }
 assert.equal(excerptDifference(null,'text').available,false);
});
test('number and qualifier changes flag high-priority review without automatic approval',()=>{
 const r=assessChange({previous:seeds[0],next:seeds[0],previousContent:'Applicants may wait 10 days.',content:'Applicants must not wait 20 days.'});
 assert.equal(r.classification,'content_change');assert.equal(r.priority,'high');assert.ok(r.flags.includes('numeric_tokens_changed'));assert.ok(r.flags.includes('condition_words_changed'));assert.match(r.assessment,/Not proof/);
});
test('new, unchanged, freshness-only and missing-baseline states remain distinct',()=>{
 const base={previous:seeds[0],next:seeds[0],previousContent:'Same excerpt',content:'Same excerpt'};
 assert.equal(assessChange(base).classification,'unchanged');assert.equal(assessChange({...base,previous:null}).classification,'new_record');
 assert.equal(assessChange({...base,next:{...seeds[0],expiresAt:'2026-12-01'}}).classification,'freshness_metadata_only');
 assert.equal(assessChange({...base,previousContent:null}).classification,'baseline_excerpt_missing');
});
test('import captures the actual baseline and emits only one immutable event per retry',()=>{
 const s=setup();try{const before=s.records().find(r=>r.id==='sin-route'),req=input('first');const c=s.ingestion.ingest(req);s.ingestion.ingest(req);const events=s.ingestion.changes();assert.equal(events.length,1);assert.deepEqual(events[0].baselineRecord,before);assert.equal(events[0].report.excerptDiff.available,false);assert.equal(events[0].candidate_id,c.id);assert.throws(()=>s.db.exec('DELETE FROM change_events'),/Immutable/);assert.throws(()=>s.db.exec("UPDATE change_events SET report='{}'"),/Immutable/);}finally{s.db.close();}
});
test('snapshot comparison and impact hints include related records but leave public content unchanged',()=>{
 const s=setup();try{publish(s);const original=s.records().find(r=>r.id==='sin-route');const related={...original,id:'related-record'};s.db.prepare('INSERT INTO records VALUES (?,?)').run(related.id,JSON.stringify(related));
 const c=s.ingestion.ingest(input('second','Social Insurance Number: Apply. Applicants must allow 20 days.',{summary:'Proposed second test summary.'}));
 const change=s.ingestion.changes().find(x=>x.candidate_id===c.id);assert.equal(change.baseline_snapshot_id,original.snapshotId);assert.equal(change.report.priority,'high');assert.deepEqual(change.report.potentiallyAffectedRecordIds,['related-record','sin-route']);assert.deepEqual(s.records().find(r=>r.id==='sin-route'),original);assert.equal(s.ingestion.candidates().find(x=>x.id===c.id).changeReport.classification,'content_change');
 s.review('sin-route','rollback',review.reviewer,review.note);assert.deepEqual(s.ingestion.changes().find(x=>x.candidate_id===c.id).baselineRecord,original);
 }finally{s.db.close();}
});
test('unchanged excerpt is deduplicated while a new import retains its own comparison event',()=>{
 const s=setup();try{publish(s);s.ingestion.ingest(input('second'));assert.equal(s.db.prepare('SELECT count(*) AS n FROM snapshots').get().n,1);assert.equal(s.ingestion.changes().length,2);assert.equal(s.ingestion.candidates().find(c=>c.request_key==='second').changeReport.classification,'unchanged');}finally{s.db.close();}
});
test('rejection preserves the original comparison and never marks it published',()=>{
 const s=setup();try{const c=s.ingestion.ingest(input('first'));const report=s.ingestion.changes()[0].report;s.ingestion.decide(c.id,{...review,decision:'reject'});assert.deepEqual(s.ingestion.changes()[0].report,report);assert.equal(s.ingestion.changes()[0].status,'rejected');}finally{s.db.close();}
});
test('change history endpoint requires authorization',async()=>{
 const s=setup();s.ingestion.ingest(input('first'));const token='change-history-token-at-least-24',server=createApp(s,token,{});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{assert.equal((await fetch(base+'/admin/changes')).status,401);const result=await (await fetch(base+'/admin/changes',{headers:{Authorization:`Bearer ${token}`}})).json();assert.equal(result.changes.length,1);assert.ok(result.changes[0].report);}finally{await new Promise(r=>server.close(r));s.db.close();}
});
