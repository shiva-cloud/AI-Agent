import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewQueue} from '../src/review-queue.js';
import {seeds} from '../src/knowledge.js';
const now=new Date('2026-10-28T23:59:59Z');
const mk=(id,extra)=>({...seeds[0],id,...extra});

test('expiresSoonDays is data: a tighter threshold re-bands soon-expiring records as routine',()=>{
  const record=mk('soon',{expiresAt:'2026-11-02'}); // 5 days out
  const wide=reviewQueue([record],[],[],now);
  assert.equal(wide.rows[0].priority,2);assert.equal(wide.rows[0].reasonCode,'expiring_soon');
  assert.equal(wide.thresholds.expiresSoonDays,7);
  const tight=reviewQueue([record],[],[],now,{expiresSoonDays:3});
  assert.equal(tight.rows[0].priority,4);assert.equal(tight.rows[0].reasonCode,'routine');
  assert.equal(tight.thresholds.expiresSoonDays,3);
});

test('reasonCode reduces overlapping flags to the strongest single reason',()=>{
  const sources=[{id:'blocked',url:'https://example.com',suspended:1,policy:'unreviewed'}];
  const q=reviewQueue([mk('s',{sourceId:'blocked'}),mk('e',{expiresAt:'2026-10-01'}),mk('p',{status:'pending',risk:'high'}),mk('r',{})],sources,[],now);
  assert.equal(q.rows.find(x=>x.id==='s').reasonCode,'source_suspended');
  assert.equal(q.rows.find(x=>x.id==='e').reasonCode,'evidence_expired');
  assert.equal(q.rows.find(x=>x.id==='p').reasonCode,'high_risk_pending_review');
  assert.equal(q.rows.find(x=>x.id==='r').reasonCode,'routine');
});
