import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {answer} from '../src/engine.js';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {openAccounts} from '../src/accounts.js';
import {createTranslationLedger} from '../src/community-translation-ledger.js';
import {stampAssessmentProvenance,verifyAssessmentProvenance} from '../src/security-guard.js';
import ts from 'typescript';

async function withServer(run){
 const store=openStore(':memory:');const server=createApp(store,'remediation-admin-secret-32chars',{});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{await run(`http://127.0.0.1:${server.address().port}`,store);}finally{await new Promise(r=>server.close(r));store.db.close();}
}
test('resolvers cannot invent reviewed evidence or erase outstanding gaps',()=>{
 for(const input of [{question:'Can I travel outside Canada while on maintained status PGWP in Toronto?',city:'Toronto'},{question:'My employer kept my passport in Toronto.',city:'Toronto'},{question:'What is the answer to question 1901?',questionBankId:1901},{question:'Explain this scenario',marketGapId:82001}]){
  const result=answer(input,[],new Date('2026-11-01T00:00:00Z'));
  assert.equal(result.claims.length,0);assert.equal(result.verification.editorReviewedClaims,0);
  assert.notEqual(result.status,'guidance');assert.ok(result.gaps.length);
 }
});
test('invalid healthcare inputs fail closed over HTTP',async()=>withServer(async base=>{
 for(const suffix of ['province=ZZ','status=unknown','date=bad-date','date=2026-02-30','household=-1','permitMonths=Infinity']){
  const response=await fetch(`${base}/v1/tools/healthcare-eligibility?${suffix}`);
  assert.equal(response.status,400,suffix);
 }
}));
test('Hinglish country and missing translation certainty survive the HTTP boundary',async()=>withServer(async base=>{
 const response=await fetch(base+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Germany mein health card kaise milega?'})});
 assert.equal(response.status,200);const body=await response.json();
 assert.equal(body.status,'clarification');assert.notEqual(body.parsed.country,'CA');assert.equal(body.claims.length,0);
 assert.doesNotMatch(body.multilingual.localizedSummary,/OHIP|MSP|तुरंत पात्र/);
}));
test('journey contract preserves date/category/city and returns phase items',async()=>withServer(async base=>{
 const response=await fetch(base+'/v1/tools/settlement-journey?date=2027-02-15&category=study_permit&city=Vancouver');
 assert.equal(response.status,200);const body=await response.json();
 assert.equal(body.landingDate,'2027-02-15');assert.equal(body.city,'Vancouver');assert.equal(body.categoryKey,'study_permit');
 assert.ok(body.phases.some(p=>p.items.length));
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(app,/settlement-journey\?date=/);assert.match(app,/data\.phases\.flatMap/);
}));
test('quota reservations are shared, refundable, idempotent and fixed to their month',()=>{
 const dir=mkdtempSync(join(tmpdir(),'northstar-quota-fix-'));let now=new Date('2026-11-30T23:59:59Z');
 const a=openAccounts(join(dir,'accounts.sqlite'),{clock:()=>now}),b=openAccounts(join(dir,'accounts.sqlite'),{clock:()=>now});
 try{
  for(let i=0;i<499;i++)a.record({metered:true,subject:'probe',feature:'chat'});
  const request={method:'POST',path:'/v1/answers',account:{plan:'plus'},subject:'probe'};
  const reserved=a.reserve(request);assert.throws(()=>b.reserve(request),e=>e.code==='plan_quota_exceeded');
  a.release(reserved);const next=b.reserve(request);
  now=new Date('2026-12-01T00:00:01Z');b.record(next);b.record(next);
  assert.equal(a.usage('probe','plus').features.chat.used,0);
  now=new Date('2026-11-30T23:59:59Z');assert.equal(a.usage('probe','plus').features.chat.used,500);
 }finally{a.close();b.close();rmSync(dir,{recursive:true,force:true});}
});
test('FTS startup is idempotent over three restarts',()=>{
 const dir=mkdtempSync(join(tmpdir(),'northstar-fts-fix-'));let expected;
 try{for(let i=0;i<3;i++){const s=openStore(join(dir,'evidence.sqlite'));try{
  const row=s.db.prepare('SELECT count(*) n,count(distinct id) uniqueIds FROM records_fts').get();
  assert.equal(row.n,row.uniqueIds);expected??=row.n;assert.equal(row.n,expected);
 }finally{s.db.close();}}}finally{rmSync(dir,{recursive:true,force:true});}
});
test('public translation feed omits pending submissions and moderation details',async()=>withServer(async(base,store)=>{
 const submission={termOrRecordId:'audit-fixture',targetLocale:'hi',suggestedTranslation:'Test translation',notes:'private editorial note',counselorName:'Unverified Name'};
 const response=await fetch(base+'/v1/translations/community/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(submission)});
 assert.equal(response.status,201);const {translation}=await response.json();
 const pending=await(await fetch(base+'/v1/translations/community?status=pending&limit=-1')).json();assert.deepEqual(pending.items,[]);
 const ledger=createTranslationLedger(store.db);ledger.verifyTranslation({id:translation.id,actor:'verified-moderator'});
 const published=await(await fetch(base+'/v1/translations/community')).json();assert.equal(published.items.length,1);
 for(const field of ['notes','counselor_name','organization_credential','original_text','verified_by'])assert.equal(field in published.items[0],false);
}));
test('ledger isolates stores and counts distinct authenticated moderators',()=>{
 const db1=new DatabaseSync(':memory:'),db2=new DatabaseSync(':memory:');
 try{
  const one=createTranslationLedger(db1),two=createTranslationLedger(db2);
  const entry=one.submitTranslationSuggestion({termOrRecordId:'x',targetLocale:'hi',suggestedTranslation:'Synthetic'});
  assert.equal(two.listTranslations().items.length,0);
  one.endorseTranslation({id:entry.id,actor:'alice'});const duplicate=one.endorseTranslation({id:entry.id,actor:'alice'});
  assert.equal(duplicate.endorse_count,1);assert.equal(duplicate.status,'pending');
  one.endorseTranslation({id:entry.id,actor:'bob'});assert.equal(one.endorseTranslation({id:entry.id,actor:'carol'}).status,'endorsed');
  assert.throws(()=>one.verifyTranslation({id:entry.id,verifiedBy:'spoofed'}));
  const verified=one.verifyTranslation({id:entry.id,actor:'alice',verifiedBy:'spoofed'});assert.equal(verified.verified_by,'alice');
  assert.throws(()=>db1.exec('DELETE FROM translation_events'));
 }finally{db1.close();db2.close();}
});
test('provenance rejects nested, array and timestamp mutations and requires a secret',()=>{
 const previous=process.env.AUDIT_SIGNING_SECRET;
 try{
  delete process.env.AUDIT_SIGNING_SECRET;assert.throws(()=>stampAssessmentProvenance({x:1}));
  process.env.AUDIT_SIGNING_SECRET='a-test-secret-with-more-than-32-characters';
  const original=stampAssessmentProvenance({assessment:{eligible:false,amount:100},items:[{value:1}]});
  assert.equal(verifyAssessmentProvenance(original),true);
  for(const mutate of [v=>v.assessment.eligible=true,v=>v.items[0].value=2,v=>v.securityProvenance.timestamp='2020-01-01']){
   const copy=structuredClone(original);mutate(copy);assert.equal(verifyAssessmentProvenance(copy),false);
  }
 }finally{if(previous===undefined)delete process.env.AUDIT_SIGNING_SECRET;else process.env.AUDIT_SIGNING_SECRET=previous;}
});
test('route dispatch contains no duplicate literal path in the same block',()=>{
 const text=readFileSync(new URL('../src/server.js',import.meta.url),'utf8');const ast=ts.createSourceFile('server.js',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 function visit(node){if(ts.isBlock(node)){const seen=new Set();for(const s of node.statements){if(!ts.isIfStatement(s))continue;const m=/^path\s*===\s*['"]([^'"]+)['"]$/.exec(s.expression.getText(ast));if(m){assert.ok(!seen.has(m[1]),m[1]);seen.add(m[1]);}}}ts.forEachChild(node,visit);}visit(ast);
});
