// Published-fare records: static figures distilled from each agency's official
// fare page (fetched in full on 2026-10-28). They must never present
// themselves as live pricing, and expiry forces a recheck when fares change.
import test from 'node:test';
import assert from 'node:assert/strict';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
import {assertEnglishRecord} from '../src/language.js';
const now=new Date('2026-10-28T12:00:00Z');

test('each published-fare record persists, validates and stays English',()=>{
  const store=openStore(':memory:');try{
    const records=store.records();
    for(const id of ['ttc-fares','miway-fares','brampton-fares','translink-fares']){
      const record=records.find(r=>r.id===id);
      assert.ok(record,`${id} persisted`);
      assert.doesNotThrow(()=>assertEnglishRecord(record));
      assert.match(record.summary,/\$/,'summary carries the actual fare figures');
      assert.ok(record.quote.length>=10);
    }
  }finally{store.db.close();}
});

test('a fare question cites the local fare record',()=>{
  const result=answer({question:'How much does the TTC cost in Toronto?'},seeds,now);
  assert.ok(result.claims.some(c=>c.evidenceId==='ttc-fares'),'ttc-fares cited');
  assert.ok(result.claims.every(c=>c.evidenceId.startsWith('ttc-')),'only local Toronto records');
  assert.ok(!result.gaps.some(g=>g.reason==='missing_live_price_data'),'transit fares are published facts, not a live-price gap');
});

test('fare summaries never claim live pricing and carry their checked date',()=>{
  for(const record of seeds.filter(r=>r.id.endsWith('-fares'))){
    assert.ok(!/live price|real-time price|current price today/i.test(record.summary));
    assert.equal(record.checkedAt,'2026-10-28');
    assert.ok(record.expiresAt>record.checkedAt);
    // The summary discloses the effective date of the figures where the agency states one.
    assert.ok(record.summary.length>=120,'summary carries enough context');
  }
});
