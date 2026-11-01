import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {createApp} from '../src/server.js';
const input={owner:'Engineering',actor:'Test editor',note:'Regression fixture completed.',regressionRef:'test/query-contract.test.js',status:'resolved',priority:'high'};
const log=(s,city='Toronto')=>s.log(answer({question:`${city} rent private@example.com`},seeds));

test('gaps aggregate by scope, deduplicate and retain no personal query',()=>{
 const s=openStore(':memory:');try {
  log(s);log(s);log(s,'Vancouver');const items=s.gapWork.list().items;
  assert.equal(items.length,2);assert.equal(items.find(i=>i.scope==='Toronto').occurrences,2);
  assert.ok(!JSON.stringify(items).includes('private@example.com'));
  assert.equal(s.db.prepare('SELECT version FROM schema_migrations WHERE version=6').get().version,6);
 }finally{s.db.close();}
});

test('resolution requires ownership and test reference, rejects stale saves and reopens on recurrence',()=>{
 const s=openStore(':memory:');try {
  log(s);const row=s.gapWork.list().items[0];
  assert.throws(()=>s.gapWork.update(row.id,{...input,revision:row.revision,owner:''}),/owner/);
  assert.throws(()=>s.gapWork.update(row.id,{...input,revision:row.revision,regressionRef:''}),/regression reference/);
  const resolved=s.gapWork.update(row.id,{...input,revision:row.revision});assert.equal(resolved.status,'resolved');
  assert.throws(()=>s.gapWork.update(row.id,{...input,revision:row.revision}),e=>e.statusCode===409);
  log(s);const reopened=s.gapWork.list().items[0];assert.equal(reopened.status,'open');assert.equal(reopened.owner,'Engineering');
  assert.equal(s.gapWork.history(row.id).length,2);
  assert.throws(()=>s.db.exec('DELETE FROM gap_work_events'),/Immutable/);
 }finally{s.db.close();}
});

test('English guards and audit failures roll back lifecycle mutations',()=>{
 const s=openStore(':memory:');try {
  log(s);const row=s.gapWork.list().items[0];
  assert.throws(()=>s.gapWork.update(row.id,{...input,revision:row.revision,owner:'\u0939\u093f'}),/English/);
  assert.throws(()=>s.db.prepare('UPDATE gap_work_items SET owner=?').run('\u0939\u093f'),/English/);
  s.db.exec("CREATE TRIGGER fail_event BEFORE INSERT ON gap_work_events BEGIN SELECT RAISE(ABORT,'fixture failure'); END;");
  assert.throws(()=>s.gapWork.update(row.id,{...input,revision:row.revision}),/fixture failure/);
  assert.deepEqual(s.gapWork.list().items[0],row);
 }finally{s.db.close();}
});

test('gap workflow endpoints require admin authorization and return conflict status',async()=>{
 const s=openStore(':memory:'),token='fixture-admin-token-long-enough',server=createApp(s,token,{});
 log(s);await new Promise(r=>server.listen(0,'127.0.0.1',r));const root=`http://127.0.0.1:${server.address().port}`;
 const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
 try {
  assert.equal((await fetch(root+'/admin/gap-work')).status,401);
  const {items}=await (await fetch(root+'/admin/gap-work',{headers})).json();const row=items[0];
  const url=root+'/admin/gap-work/'+row.id,body=JSON.stringify({...input,revision:row.revision});
  assert.equal((await fetch(url,{method:'POST',headers,body})).status,200);
  assert.equal((await fetch(url,{method:'POST',headers,body})).status,409);
  const history=await (await fetch(url+'/history',{headers})).json();assert.equal(history.events.length,1);
 }finally{await new Promise(r=>server.close(r));s.db.close();}
});

test('queue failure rolls back trace and gap logging as one transaction',()=>{
 const s=openStore(':memory:');try {
  s.db.exec("CREATE TRIGGER fail_work BEFORE INSERT ON gap_work_items BEGIN SELECT RAISE(ABORT,'fixture failure'); END;");
  assert.throws(()=>log(s),/fixture failure/);
  for(const table of ['traces','gaps','gap_work_items'])assert.equal(s.db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n,0);
 }finally{s.db.close();}
});

test('queue pagination is bounded and aggregate work survives raw trace retention',()=>{
 const s=openStore(':memory:');try {
  const result=answer({question:'Toronto groceries'},seeds);
  result.gaps=Array.from({length:201},(_,i)=>({topic:'groceries',reason:`fixture_reason_${i}`}));s.log(result);
  const first=s.gapWork.list();assert.equal(first.items.length,200);assert.ok(first.nextCursor);
  const last=s.gapWork.list(first.nextCursor);assert.equal(last.items.length,1);assert.equal(last.nextCursor,null);
  s.db.exec("UPDATE traces SET at='2000-01-01'; UPDATE gaps SET at='2000-01-01';");s.purge();
  assert.equal(s.db.prepare('SELECT count(*) AS n FROM traces').get().n,0);
  assert.equal(s.gapWork.list().items.length,200);
 }finally{s.db.close();}
});
