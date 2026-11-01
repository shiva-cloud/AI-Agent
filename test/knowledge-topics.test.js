import test from 'node:test';
import assert from 'node:assert/strict';
import {topics, topicLabels} from '../src/knowledge.js';
import {assertEnglishData} from '../src/language.js';
import {answer, coverage, coverageDetail} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
const now=new Date('2026-10-28T23:59:59Z');

test('every topic id has a distinct human-readable label, all English',()=>{
  assert.deepEqual(Object.keys(topicLabels).sort(),[...topics].sort());
  assert.equal(new Set(Object.values(topicLabels)).size,topics.length);
  assertEnglishData(topicLabels);
});

test('coverage states its language per city so the UI never assumes',()=>{
  const cov=coverage(seeds,now);
  assert.ok(cov.every(c=>c.language==='en'));
  assert.ok(cov.every(c=>c.topics.every(t=>t.status)));
});

test('answers report why their status holds (citation mix plus unverified counts)',()=>{
  const guidance=answer({question:'How do I apply for a SIN?'},seeds,now);
  assert.equal(guidance.verification.claimsTotal,guidance.claims.length);
  assert.equal(guidance.verification.approvedClaims+guidance.verification.seedClaims,guidance.verification.claimsTotal);
  const unavailable=answer({question:'A carefree day in Toronto'},seeds,now);
  assert.equal(unavailable.status,'unavailable');
  assert.equal(unavailable.verification.claimsTotal,0);
  assert.ok(unavailable.verification.unverifiedTopics>=1);
});

test('coverageDetail exposes one city sheet with its evidence included',()=>{
  const detail=coverageDetail('Toronto',seeds,now);
  assert.equal(detail.city,'Toronto');assert.equal(detail.region,'ON');assert.equal(detail.language,'en');
  const sheet=detail.topics.find(t=>t.topic==='transit');
  assert.ok(sheet.evidence.length>=1);
  assert.ok(sheet.evidence.every(ev=>ev.id&&ev.title&&ev.url.startsWith('https://')));
  assert.ok(detail.topics.every(t=>['source_guidance','review_or_refresh_needed','missing'].includes(t.status)));
  assert.throws(()=>coverageDetail('Calgary',seeds,now),/Unknown pilot city/);
});
