import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {composePresentation} from '../src/answer-composer.js';

const sinSeed=seeds.find(r=>r.id==='sin-route');
const input={question:'How do I apply for a SIN?'};

test('records that arrive approved from seeds or scripts are labelled bulk-approved, not reviewed',()=>{
 const bulk={...sinSeed,status:'approved',reviewedAt:'2026-10-30T12:00:00.000Z'};
 const result=answer(input,[bulk]);
 const source=result.sources.find(s=>s.id==='sin-route');
 assert.equal(source.reviewMethod,'bulk_approval');
 assert.equal(result.verification.editorReviewedClaims,0);
 assert.equal(result.verification.bulkApprovedClaims,1);
 assert.equal(composePresentation(result).sections[0].reviewMethod,'bulk_approval');
});

test('the answer view never calls a bulk approval a review',async()=>{
 const {reviewLabel}=await import('../public/answer-view.js');
 assert.equal(reviewLabel({status:'approved',reviewMethod:'editorial_review'})[0],'Reviewed by an editor');
 assert.equal(reviewLabel({status:'approved',reviewMethod:'bulk_approval'})[0],'Bulk-approved · not individually reviewed');
 assert.equal(reviewLabel({status:'approved'})[0],'Bulk-approved · not individually reviewed');
 assert.equal(reviewLabel({status:'research_seed',reviewMethod:'none'})[1],'status-seed');
});

test('research seeds report no approval at all',()=>{
 const result=answer(input,[sinSeed]);
 assert.equal(result.sources.find(s=>s.id==='sin-route').reviewMethod,'none');
});

test('the database refuses approvals that bypass editorial review',()=>{
 const store=openStore(':memory:');try {
  const insert=store.db.prepare('INSERT OR REPLACE INTO records VALUES (?,?)');
  // A bulk script inserting an approved record, or replacing one, is refused.
  assert.throws(()=>insert.run('bulk-fixture',JSON.stringify({...sinSeed,id:'bulk-fixture',status:'approved'})),/editorial review/);
  // Flipping a pending or seed record to approved directly is refused too.
  const update=store.db.prepare('UPDATE records SET body=? WHERE id=?');
  assert.throws(()=>update.run(JSON.stringify({...sinSeed,status:'approved'}),'sin-route'),/editorial review/);
  // Seed and pending writes are unaffected.
  assert.doesNotThrow(()=>insert.run('seed-fixture',JSON.stringify({...sinSeed,id:'seed-fixture'})));
 }finally{store.db.close();}
});

test('the review queue lists bulk-approved records as needing an editor',async()=>{
 const {reviewQueue}=await import('../src/review-queue.js');
 const now=new Date('2026-10-30T12:00:00Z');
 const bulk={...sinSeed,id:'bulk',status:'approved',risk:'high',checkedAt:'2026-10-30',expiresAt:'2027-01-31'};
 const reviewed={...bulk,id:'reviewed',reviewMethod:'editorial_review'};
 const queue=reviewQueue([bulk,reviewed],[],[],now);
 const row=id=>queue.rows.find(r=>r.id===id);
 assert.ok(row('bulk').flags.includes('editor_review_needed'));
 assert.equal(row('bulk').reasonCode,'high_risk_editor_review_needed');
 assert.equal(row('bulk').priority,3);
 assert.ok(!row('reviewed').flags.includes('editor_review_needed'));
 assert.equal(queue.counts.editor_review_needed,1);
});

test('an editorial decision stamps reviewMethod; rollback and source suspension clear it',()=>{
 const store=openStore(':memory:');try {
  const review={reviewer:'Fixture reviewer',note:'Synthetic fixture review only.',tier:'A'};
  const checkedAt=new Date().toISOString().slice(0,10),expiresAt=new Date(Date.now()+86400000*7).toISOString().slice(0,10);
  store.ingestion.permitSource('seed-sin-route',review);
  // Importers cannot claim editorial review for themselves.
  assert.throws(()=>store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'claim-review',content:sinSeed.quote,
   record:{...sinSeed,status:'pending',checkedAt,expiresAt,reviewMethod:'editorial_review'}}),/provenance/);
  const candidate=store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'provenance-fixture',content:sinSeed.quote,record:{...sinSeed,status:'pending',checkedAt,expiresAt}});
  store.ingestion.decide(candidate.id,{...review,decision:'approve'});
  const published=store.records().find(r=>r.id==='sin-route');
  assert.equal(published.reviewMethod,'editorial_review');
  assert.equal(answer(input,store.records()).sources.find(s=>s.id==='sin-route').reviewMethod,'editorial_review');
  assert.equal(store.review('sin-route','rollback',review.reviewer,review.note).reviewMethod,undefined);
  assert.equal(store.review('sin-route','approve',review.reviewer,review.note).reviewMethod,'editorial_review');
  store.ingestion.suspendSource('seed-sin-route',review);
  assert.equal(store.records().find(r=>r.id==='sin-route').reviewMethod,undefined);
 }finally{store.db.close();}
});
