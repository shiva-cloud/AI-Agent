import test from 'node:test';
import assert from 'node:assert/strict';
import {assertEnglishRecord} from '../src/language.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
const now=new Date('2026-10-28T12:00:00Z');
for(const patch of [
 {checkedAt:'2026-02-30'}, {expiresAt:'2026-13-01'}, {expiresAt:'2099'},
 {effectiveFrom:'2026-1-01'}, {effectiveTo:'2026-02-29'},
 {checkedAt:'2026-10-28',expiresAt:'2026-10-28'},
 {effectiveFrom:'2026-11-01',effectiveTo:'2026-10-31'}
])test(`invalid temporal metadata is rejected: ${JSON.stringify(patch)}`,()=>{
 const record={...seeds[0],...patch};
 assert.throws(()=>assertEnglishRecord(record));
 assert.equal(answer({question:'SIN'},[record],now).claims.length,0);
});
test('risk requirements apply to direct record validation and retrieval',()=>{
 for(const topic of ['health','housing','employment','money','driving','family','childcare']) {
  const record={...seeds[0],topic,risk:'low',status:'research_seed'};
  assert.throws(()=>assertEnglishRecord(record),/high-risk review/);
 }
 const record={...seeds.find(r=>r.id==='ohip'),risk:'low',status:'research_seed'};
 assert.equal(answer({question:'Toronto OHIP'},[record],now).claims.length,0);
});
test('database triggers reject invalid dates and low-risk regulatory records atomically',()=>{
 const store=openStore(':memory:');
 try{
  const original=JSON.stringify(store.records());
  for(const patch of [{expiresAt:'2099'},{topic:'health',risk:'low'},{url:'https://user:password@example.com'}]) {
   const record={...seeds[0],...patch};
   assert.throws(()=>store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(record),record.id),/policy violation/);
  }
  assert.equal(JSON.stringify(store.records()),original);
 }finally{store.db.close();}
});
test('future check dates remain stored history but cannot supply present answers',()=>{
 const record={...seeds[0],checkedAt:'2026-10-29',expiresAt:'2026-11-05'};
 assert.doesNotThrow(()=>assertEnglishRecord(record));
 const result=answer({question:'SIN'},[record],now);
 assert.equal(result.claims.length,0);assert.equal(result.gaps[0].reason,'future_check_date');
 assert.equal(answer({question:'SIN'},[record],new Date('2026-10-29T00:00:00Z')).status,'guidance');
});
test('real leap dates and valid historical records remain structurally valid',()=>{
 assert.doesNotThrow(()=>assertEnglishRecord({...seeds[0],checkedAt:'2024-02-29',expiresAt:'2024-03-01'}));
 assert.doesNotThrow(()=>assertEnglishRecord({...seeds[0],effectiveFrom:null,effectiveTo:null}));
});
