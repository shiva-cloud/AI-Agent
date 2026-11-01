import test from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {publishQueue, publishDraft, PUBLISH_TOPIC_ORDER} from '../src/publish-queue.js';
import {publicEvidence} from '../src/public-evidence.js';
import {cleanExcerpt} from '../public/editorial.js';

const queueOf=store=>publishQueue(store.db,store.records(),store.ingestion.sources(),store.ingestion.candidates());
const reviewer={reviewer:'Test Editor',note:'Checked against the official page for this test.'};
const today=new Date().toISOString().slice(0,10);
// Recreates legacy rows that seed scripts approved without an editor, before the
// approval trigger existed; the trigger is dropped on this in-memory copy only.
function bulkApprove(store,match=()=>true){
 store.db.exec('DROP TRIGGER IF EXISTS records_editorial_approval_update');
 const ids=[];
 for(const r of store.records()){
  if(r.risk!=='high'||r.topic==='housing'||r.topic==='telecom'||!(r.expiresAt>today)||!match(r))continue;
  const {reviewMethod:_r,sourceId:_s,snapshotId:_n,...rest}=r;
  store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify({...rest,status:'approved'}),r.id);ids.push(r.id);
 }
 return ids;
}

test('publish queue lists withheld high-risk records, health first, with a clean draft',()=>{
 const store=openStore(':memory:');
 assert.ok(bulkApprove(store).length>1,'fixture needs withheld records');
 const q=queueOf(store);
 const served=publicEvidence(store.db,store.records());
 const withheld=store.records().filter((r,i)=>r.status==='approved'&&served[i].status==='pending');
 assert.equal(q.total,withheld.length);
 const ranks=q.rows.map(r=>PUBLISH_TOPIC_ORDER.indexOf(r.topic));
 assert.deepEqual(ranks,[...ranks].sort((a,b)=>a-b),'rows are ordered by topic priority');
 for(const row of q.rows){
  for(const key of ['sourceId','snapshotId','reviewedAt','reviewMethod'])assert.ok(!(key in row.draft),`${row.id} draft keeps ${key}`);
  assert.equal(row.draft.status,'pending');
 }
 assert.equal(publishDraft({id:'x',status:'approved',reviewMethod:'editorial_review',checkedAt:'2020-01-01'},'2026-11-01').checkedAt,'2026-11-01');
});

test('an editor import plus a reviewer approval publishes a withheld record',()=>{
 const store=openStore(':memory:');bulkApprove(store);
 const row=queueOf(store).rows.find(r=>r.sourceId);
 assert.ok(row,'expected a withheld record to publish');
 store.ingestion.permitSource(row.sourceId,{tier:'A',...reviewer});
 assert.equal(queueOf(store).rows.find(r=>r.id===row.id).state,'ready');
 const candidate=store.ingestion.ingest({sourceId:row.sourceId,requestKey:`publish-${row.id}-1`.slice(0,80),content:`Official page text. ${row.quote} More page text.`,record:row.draft});
 assert.equal(queueOf(store).rows.find(r=>r.id===row.id).state,'awaiting_approval');
 store.ingestion.decide(candidate.id,{decision:'approve',...reviewer});
 assert.ok(!queueOf(store).rows.some(r=>r.id===row.id),'published record leaves the queue');
 const records=store.records(),i=records.findIndex(r=>r.id===row.id);
 assert.equal(publicEvidence(store.db,records)[i].status,'approved');
});

test('records outside Canada can be re-imported under their stored jurisdiction',()=>{
 const store=openStore(':memory:');bulkApprove(store);
 const row=queueOf(store).rows.find(r=>!r.canada&&r.sourceId);
 assert.ok(row,'fixture needs a withheld record outside Canada');
 store.ingestion.permitSource(row.sourceId,{tier:'A',...reviewer});
 assert.doesNotThrow(()=>store.ingestion.ingest({sourceId:row.sourceId,requestKey:`publish-${row.id}-1`.slice(0,80),content:`Official page text. ${row.quote}`,record:row.draft}));
 assert.throws(()=>store.ingestion.ingest({sourceId:row.sourceId,requestKey:`publish-${row.id}-2`.slice(0,80),content:`Official page text. ${row.quote}`,record:{...row.draft,jurisdiction:'Atlantis'}}),/jurisdiction/);
});

test('pasted page text is cleaned of typographic quotes and invisible characters',()=>{
 assert.equal(cleanExcerpt('“You’re eligible”​  \n'),'"You\'re eligible"');
});

test('GET /admin/publish-queue requires an admin token',async()=>{
 const token='publish-queue-token-that-is-long-enough';
 const server=createApp(openStore(':memory:'),token);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const root=`http://127.0.0.1:${server.address().port}/admin/publish-queue`;
 try {
  assert.equal((await fetch(root)).status,401);
  const body=await (await fetch(root,{headers:{Authorization:`Bearer ${token}`}})).json();
  assert.ok(Array.isArray(body.rows));
  assert.deepEqual(body.topicOrder.slice(0,2),['health','housing']);
 } finally { server.close(); }
});
