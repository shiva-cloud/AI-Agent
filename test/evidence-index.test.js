import test from 'node:test';
import assert from 'node:assert/strict';
import {openEvidenceIndex} from '../src/evidence-index.js';
import {answer,parse,retrieve} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {readFileSync} from 'node:fs';
import {evaluate} from '../src/evaluation.js';
const now=new Date('2026-10-28T12:00:00Z');

test('indexed mode passes the development question contracts',()=>{
 const index=openEvidenceIndex(':memory:');try{
  index.rebuild(seeds);
  for(const name of ['english-pilot','english-expanded']){
   const dataset=JSON.parse(readFileSync(new URL(`../evaluation/${name}.json`,import.meta.url),'utf8'));
   assert.deepEqual(evaluate(dataset,seeds,index).failures,[],name);
  }
 }finally{index.close();}
});

test('FTS retrieval preserves jurisdiction, review and expiry gates',()=>{
 const index=openEvidenceIndex(':memory:');try{
  assert.equal(index.rebuild(seeds).indexed,seeds.length);
  const result=answer({question:'Vancouver library'},seeds,now,index);
  assert.equal(result.retrieval.version,'sqlite-fts5-bm25-1');
  assert.ok(result.claims.some(c=>c.evidenceId==='vancouver-library'));
  assert.ok(!result.sources.some(s=>s.id==='toronto-library'));
  assert.equal(answer({question:'Toronto OHIP'},seeds,now,index).claims.length,0);
  assert.equal(answer({question:'SIN'},seeds,new Date('2027-01-01'),index).claims.length,0);
  assert.equal(answer({question:'SIN in Paris'},seeds,now,index).status,'clarification');
 }finally{index.close();}
});

test('stale, empty or closed index falls back to current records',()=>{
 const index=openEvidenceIndex(':memory:');
 assert.equal(answer({question:'SIN'},seeds,now,index).retrieval.version,'lexical-bm25-0.1');
 index.rebuild(seeds);
 const changed=seeds.map(r=>r.id==='sin-route'?{...r,status:'rejected'}:r);
 const withdrawn=answer({question:'SIN'},changed,now,index);assert.ok(!withdrawn.claims.some(c=>c.evidenceId==='sin-route'));assert.equal(withdrawn.retrieval.version,'lexical-bm25-0.1');
 const removed=seeds.filter(r=>r.id!=='sin-route');assert.ok(!answer({question:'SIN'},removed,now,index).sources.some(s=>s.id==='sin-route'));
 index.close();assert.equal(answer({question:'SIN'},seeds,now,index).retrieval.version,'lexical-bm25-0.1');
});

test('invalid rebuild preserves index and FTS syntax is not accepted as query operators',()=>{
 const index=openEvidenceIndex(':memory:');try{
  index.rebuild(seeds);assert.throws(()=>index.rebuild([...seeds,seeds[0]]),/Duplicate/);
  assert.throws(()=>index.rebuild([{...seeds[0],language:'hi'}]),/language/);
  assert.equal(answer({question:'SIN'},seeds,now,index).retrieval.version,'sqlite-fts5-bm25-1');
  const ranked=retrieve({...parse({question:'SIN'}),queryTerms:['" OR *','sin']},seeds,now,index);
  assert.ok(ranked.length);assert.ok(ranked.every(r=>!r.matchedTerms.includes('" OR *')));
 }finally{index.close();}
});
