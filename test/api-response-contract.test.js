import {destinationCountries} from '../src/destinations.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
import {openJobQueue} from '../src/jobs.js';
import {openRuntimeMetrics} from '../src/runtime-metrics.js';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
const validator=new Ajv2020({strict:false,allErrors:true});addFormats(validator);
function check(value,schema) {
 const validate=validator.compile(schema);
 assert.ok(validate(value),JSON.stringify(validate.errors));
}
test('real operational HTTP responses conform to published structural schemas',async()=>{
 const spec=JSON.parse(readFileSync(new URL('../docs/openapi.json',import.meta.url))),store=openStore(':memory:'),queue=openJobQueue(':memory:'),token='fixture-contract-token-'+'x'.repeat(32);
 const metricsStore=openRuntimeMetrics(':memory:');
 const server=createApp(store,token,{}, {jobQueue:queue,metricsStore});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 let lastBody;
 const request=async(path,method='get',body,template=path,auth=true)=>{
  const response=await fetch(base+path,{method:method.toUpperCase(),headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const schema=(spec.paths[template][method].responses[response.status]??spec.paths[template][method].responses.default).content['application/json'].schema;
  const result=await response.json();check(result,schema);lastBody=result;return response.status;
 };
 try {
  for(const path of ['/health','/ready','/v1/meta','/v1/topics','/admin/session','/admin/jobs','/admin/job-schedules','/admin/job-health'])assert.equal(await request(path),200);
  assert.equal(await request('/admin/session','get',undefined,'/admin/session',false),401);
  queue.enqueue({requestKey:'fixture-job',kind:'reindex',targetId:'all'});queue.claim('fixture-worker');
  assert.equal(await request('/admin/jobs'),200);
  for(const question of ['SIN application','What is OHIP?','Can I work as a nurse tomorrow in Toronto?','First week in Vancouver','Vancouver driving licence','How do I bake bread?','Toronto library internet','What is the SIN processing time in Toronto?']) {
   assert.equal(await request('/v1/questions/parse','post',{question}),200);
   assert.equal(await request('/v1/answers','post',{question}),200);
  }
  for(const country of destinationCountries) {
   const input={question:country==='CA'?'Toronto library':'How do I open a bank account?',country};
   assert.equal(await request('/v1/questions/parse','post',input),200);assert.equal(lastBody.country,country);
   assert.equal(await request('/v1/answers','post',input),200);assert.equal(lastBody.parsed.country,country);
  }
  assert.equal(await request('/v1/questions/parse','post',{question:'Toronto library',country:'Atlantis'}),400);
  assert.equal(await request('/v1/coverage'),200);
  for(const path of ['/admin/runtime-metrics','/admin/metrics','/admin/gap-work','/admin/sources','/admin/overview'])assert.equal(await request(path),200);
  assert.equal(await request('/v1/retrieval/search','post',{question:'SIN application'}),200);
  assert.equal(await request('/admin/sources','post',{id:'fixture-source',url:'https://example.invalid/fixture',owner:'Fixture agency',tier:'A',language:'en',reviewer:'fixture-reviewer',note:'Synthetic source registration for contract tests.'}),201);
  assert.equal(await request('/admin/sources/fixture-source/policy','post',{tier:'A',reviewer:'fixture-reviewer',note:'Synthetic source permission for contract tests.'},'/admin/sources/{id}/policy'),200);
  for(const path of ['/v1/stats','/v1/changes','/v1/gaps','/v1/agencies','/admin/review-queue'])assert.equal(await request(path),200);
  const record={...store.records().find(r=>r.topic==='sin'),id:'fixture-import',url:'https://example.invalid/fixture',status:'pending',checkedAt:new Date().toISOString().slice(0,10),expiresAt:new Date(Date.now()+86400000*10).toISOString().slice(0,10)};
  delete record.sourceId;delete record.snapshotId;delete record.reviewedAt;
  const imported={requestKey:'fixture-import',sourceId:'fixture-source',content:record.quote,record};
  assert.equal(await request('/admin/ingestion/run','post',imported),201);const candidateId=lastBody.id;
  assert.equal(await request('/admin/ingestion/run','post',imported),200);
  for(const path of ['/admin/candidates','/admin/changes'])assert.equal(await request(path),200);
  assert.equal(await request(`/admin/candidates/${candidateId}/decision`,'post',{decision:'approve',reviewer:'fixture-reviewer',note:'Synthetic approval in disposable contract test.'},'/admin/candidates/{id}/decision'),200);
  const publicationId=lastBody.publicationId;
  assert.equal(await request('/admin/records/fixture-import/history','get',undefined,'/admin/records/{id}/history'),200);
  const expectedHash=lastBody.currentHash;
  assert.equal(await request('/admin/records/fixture-import/restore','post',{requestKey:'fixture-restore',publicationId,expectedHash,reviewer:'fixture-reviewer',note:'Synthetic restore in disposable contract test.'},'/admin/records/{id}/restore'),200);
  assert.equal(await request('/admin/sources/fixture-source/suspend','post',{reviewer:'fixture-reviewer',note:'Synthetic suspension in disposable contract test.'},'/admin/sources/{id}/suspend'),200);
  assert.equal(await request('/v1/coverage/Toronto','get',undefined,'/v1/coverage/{city}'),200);
  assert.equal(await request('/admin/job-schedules','post',{scheduleId:'fixture',kind:'reindex',targetId:'all',intervalMs:1000,nextRun:0}),200);
  assert.equal(await request('/admin/job-schedules/fixture/history','get',undefined,'/admin/job-schedules/{id}/history'),200);
  assert.equal(await request('/admin/job-health'),200);server.beginDrain();assert.equal(await request('/ready'),503);
 }finally{await new Promise(resolve=>server.close(resolve));metricsStore.close();queue.close();store.db.close();}
});
