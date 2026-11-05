import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,relative,resolve,isAbsolute} from 'node:path';
import {openStore,verifyAuditChain} from '../src/store.js';
import {seeds} from '../src/knowledge.js';
import {publicEvidence} from '../src/public-evidence.js';
import {runFamilyCorrections,planFamilyCorrections,corrections,correctedSeedText} from '../scripts/kb-family-source-review-2026-11-04.js';

test('seed sync handles escaped Unicode, retries and unexpected edits safely',()=>{
 const input=corrections.map(c=>`  record('${c.id}','topic',\r\n    'Prefix\\u2019s ${c.expected}',\r\n    'quote'),`).join('\r\n');
 const output=correctedSeedText(input);
 for(const c of corrections)assert.ok(output.includes(JSON.stringify(c.summary)));
 assert.equal(correctedSeedText(output),output);
 assert.throws(()=>correctedSeedText(input.replace(corrections[0].expected,'Unrelated replacement')),/Seed changed/);
 assert.throws(()=>correctedSeedText(input+'\r\n'+input),/Ambiguous/);
});

test('family source corrections remove publication claims and reject unexpected text',()=>{
  // Fixture remains stable after the real seed summaries are synchronized.
  const records=corrections.map(c=>({...seeds.find(r=>r.id===c.id),summary:c.expected,status:'approved',expiresAt:'2027-01-31',snapshotId:'old',reviewMethod:'source_verified',reviewedAt:'2026-11-01'}));
  const plan=planFamilyCorrections(records);
  assert.equal(plan.length,2);
  for(const entry of plan){assert.equal(entry.next.status,'pending');assert.equal(entry.next.snapshotId,undefined);assert.equal(entry.next.reviewMethod,undefined);}
  assert.throws(()=>planFamilyCorrections(records.map(r=>({...r,summary:'Unexpected concurrent replacement.'}))),/Record changed/);
  assert.deepEqual(planFamilyCorrections(plan.map(p=>p.next)),[]);
});

test('applied correction is backed up, audited, indexed, withheld and idempotent',()=>{
  const root=mkdtempSync(join(tmpdir(),'northstar-family-review-'));
  const file=join(root,'fixture.sqlite');let store=openStore(file);
  try {
    for(const c of corrections){const old={...seeds.find(r=>r.id===c.id),summary:c.expected,status:'pending',expiresAt:'2027-01-31'};store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(old),c.id);}
    store.db.close();store=null;
    const dry=runFamilyCorrections({path:file});assert.equal(dry.count,2);
    const result=runFamilyCorrections({path:file,apply:true});assert.ok(existsSync(result.backup));assert.equal(result.count,2);
    assert.equal(runFamilyCorrections({path:file,apply:true}).count,0);
    store=openStore(file);
    assert.equal(verifyAuditChain(store.db).intact,true);
    for(const c of corrections){
      const record=store.records().find(r=>r.id===c.id);
      assert.equal(record.summary,c.summary);assert.equal(publicEvidence(store.db,[record])[0].status,'pending');
      assert.equal(store.db.prepare('SELECT summary FROM records_fts WHERE id=?').get(c.id).summary,c.summary);
    }
  }finally{
    store?.db.close();const rel=relative(resolve(tmpdir()),resolve(root));
    assert.ok(!isAbsolute(rel)&&!rel.startsWith('..')&&rel.startsWith('northstar-family-review-'));rmSync(root,{recursive:true,force:true});
  }
});
