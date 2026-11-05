import test from 'node:test';
import assert from 'node:assert/strict';
import { queryTerms } from '../src/search.js';
import { parse, retrieve } from '../src/engine.js';
import { insiderImmigrationRecords } from '../src/insider-immigration-records.js';
import { openEvidenceIndex } from '../src/evidence-index.js';

test('maintained-status travel uses official re-entry vocabulary without expanding unrelated queries',()=>{
  for(const question of ['Can I travel on maintained status?', 'Can I leave Canada on implied status?', 'Can I re-enter Canada with maintained status?']) {
    const terms=queryTerms(question);
    for(const term of ['leaves','entry','resume'])assert.ok(terms.includes(term),question);
  }
  for(const question of ['Am I eligible for a PGWP?', 'Can I leave my job?', 'How do I extend maintained status?']) {
    assert.equal(queryTerms(question).includes('resume'),false,question);
  }
});

test('maintained-status travel guidance ranks ahead of adjacent PGWP topics in lexical and indexed retrieval',()=>{
  const index=openEvidenceIndex(':memory:');
  try {
    index.rebuild(insiderImmigrationRecords);
    for(const question of [
      'Can I travel outside Canada while on maintained status PGWP in Toronto?',
      'Can I leave Canada and return while on implied status in Toronto?'
    ]) {
      const parsed=parse({question,city:'Toronto'});
      const date=new Date('2026-10-31T12:00:00Z');
      const plain=retrieve(parsed,insiderImmigrationRecords,date);
      const indexed=retrieve(parsed,insiderImmigrationRecords,date,index);
      assert.equal(plain[0].id,'ircc-maintained-status-travel-trap');
      assert.equal(indexed[0].id,plain[0].id);
      assert.equal(indexed[0].score,plain[0].score);
    }
  }finally{index.close();}
});
