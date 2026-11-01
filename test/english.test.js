import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../src/store.js';
import { seeds } from '../src/knowledge.js';
import { parse, answer } from '../src/engine.js';
import { assertEnglishRecord } from '../src/language.js';
import { createApp } from '../src/server.js';
const nonEnglish='\u0939\u093f\u0928\u094d\u0926\u0940';

test('all seeds use one English summary without alternate-language fields',()=>{
  for(const r of seeds){assertEnglishRecord(r);assert.equal(r.language,'en');assert.ok(!('en' in r));assert.ok(!('hi' in r));}
});
test('unsupported language options and mixed scripts are rejected',()=>{
  for(const language of ['hi','fr','',null,7]) assert.throws(()=>parse({question:'SIN',language}),/Only English/);
  assert.throws(()=>parse({question:`SIN ${nonEnglish}`}),/English/);
});
test('English punctuation and Latin proper names are accepted',()=>{
  assert.equal(parse({question:'Can I use Achēv’s newcomer services in Brampton?'}).language,'en');
});
test('retrieval fails closed for invalid-language evidence',()=>{
  for(const r of [{...seeds[0],language:'hi'},{...seeds[0],summary:nonEnglish},{...seeds[0],hi:'Extra translation'}]) {
    assert.equal(answer({question:'SIN'},[r],new Date('2026-10-28')).claims.length,0);
  }
});
test('non-English review notes cannot change status or create audit rows',()=>{
  const store=openStore(':memory:');try {
    assert.throws(()=>store.review('ohip','approve','Reviewer',`Source reviewed ${nonEnglish}`),/English/);
    assert.equal(store.records().find(r=>r.id==='ohip').status,'pending');
    assert.equal(store.summary().audits.length,0);
  }finally{store.db.close();}
});
test('database triggers guard inserts and updates, including escaped JSON',()=>{
  const store=openStore(':memory:');try {
    const bad={...seeds[0],summary:nonEnglish};
    assert.throws(()=>store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(bad),'sin-route'),/English-only/);
    const escaped=JSON.stringify({...seeds[0],id:'bad',summary:nonEnglish}).replace(/[\u0900-\u097f]/gu,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
    assert.throws(()=>store.db.prepare('INSERT INTO records VALUES (?,?)').run('bad',escaped),/English-only/);
    assert.throws(()=>store.db.prepare('INSERT INTO traces VALUES (?,?,?)').run('bad',JSON.stringify({text:nonEnglish}),'2026-10-28'),/English-only/);
    assert.throws(()=>store.db.prepare('INSERT INTO gaps(trace_id,topic,reason,at) VALUES (?,?,?,?)').run('t','sin',nonEnglish,'2026-10-28'),/English-only/);
    assert.throws(()=>store.db.prepare('INSERT INTO feedback(trace_id,issue,at) VALUES (?,?,?)').run('t',nonEnglish,'2026-10-28'),/English-only/);
  }finally{store.db.close();}
});

function legacyDatabase(file,note='Original English review note') {
 const db=new DatabaseSync(file);
 db.exec('CREATE TABLE records(id TEXT PRIMARY KEY,body TEXT NOT NULL); CREATE TABLE audits(id INTEGER PRIMARY KEY,record_id TEXT,previous TEXT,next TEXT,reviewer TEXT,note TEXT,at TEXT);');
 const {summary,language,...rest}=seeds[0];
 const old={...rest,en:summary,hi:nonEnglish,status:'approved'};
 const raw=JSON.stringify(old);
 db.prepare('INSERT INTO records VALUES (?,?)').run(old.id,raw);
 db.prepare('INSERT INTO audits VALUES (1,?,?,?,?,?,?)').run(old.id,raw,raw,'Original reviewer',note,'2026-10-27T00:00:00Z');
 db.close();return old;
}
test('legacy data and audit snapshots migrate without losing approval or provenance; reopening is idempotent',()=>{
 const dir=mkdtempSync(join(tmpdir(),'northstar-migration-')),file=join(dir,'test.sqlite');
 try {
  const old=legacyDatabase(file);let store=openStore(file);
  const migrated=store.records().find(r=>r.id===old.id);
  assert.equal(migrated.summary,old.en);assert.equal(migrated.status,'approved');assert.equal(migrated.url,old.url);
  const audit=store.db.prepare('SELECT * FROM audits').get();
  for(const key of ['previous','next']){const r=JSON.parse(audit[key]);assertEnglishRecord(r);assert.equal(r.summary,old.en);assert.ok(!('hi' in r));}
  assert.equal(audit.note,'Original English review note');store.db.close();
  store=openStore(file);try{assert.equal(store.db.prepare('SELECT count(*) AS n FROM schema_migrations').get().n,6);assert.equal(store.summary().audits.length,1);}finally{store.db.close();}
  assert.ok(!readFileSync(file).includes(Buffer.from(nonEnglish)));
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('untranslatable legacy prose aborts the migration atomically',()=>{
 const dir=mkdtempSync(join(tmpdir(),'northstar-migration-')),file=join(dir,'test.sqlite');
 try {
  const old=legacyDatabase(file,nonEnglish);
  assert.throws(()=>openStore(file),/Legacy review note/);
  const db=new DatabaseSync(file);
  assert.deepEqual(JSON.parse(db.prepare('SELECT body FROM records').get().body),old);
  assert.equal(db.prepare('SELECT count(*) AS n FROM schema_migrations').get().n,0);db.close();
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('English-only API rejects requests before persistence and serves a single-language UI',async()=>{
 const store=openStore(':memory:'),server=createApp(store);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
  for(const path of ['/v1/answers','/v1/questions/parse','/v1/retrieval/search']) {
   const response=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'SIN',language:'hi'})});
   assert.equal(response.status,400);assert.match((await response.json()).error,/Only English/);
  }
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM traces').get().n,0);
  const html=await (await fetch(base)).text();assert.match(html,/English only/);assert.ok(!html.includes('value="hi"'));
  const r=await (await fetch(base+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'SIN',language:'en'})})).json();
  assert.equal(r.parsed.language,'en');assert.ok(r.claims.length);assert.ok(!JSON.stringify(r).includes('"hi"'));
 }finally {await new Promise(r=>server.close(r));store.db.close();}
});
