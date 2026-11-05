import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { spawnSync } from 'node:child_process';
import { openStore } from '../src/store.js';
import { seeds } from '../src/knowledge.js';
import { assessPublicEvidence, publicEvidence } from '../src/public-evidence.js';
import { publicationBacklog } from '../scripts/kb-publication-backlog.js';
import { verifyDatabase } from '../src/verification.js';

test('diagnostic reasons and public status share the same decision path', () => {
  const store=openStore(':memory:');
  try {
    const record={...seeds.find(r=>r.id==='sin-route'),id:'reason-fixture',risk:'high',status:'approved',reviewMethod:'editorial_review'};
    const audit=(next,reviewer='editorial-board')=>store.db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at) VALUES (?,?,?,?,?,?)')
      .run(record.id,JSON.stringify(record),JSON.stringify(next),reviewer,'Synthetic reason-code test.',new Date().toISOString());
    const check=expected=>{
      const result=assessPublicEvidence(store.db,[record])[0];
      assert.deepEqual(result.reasons,expected);
      assert.deepEqual(result.served,publicEvidence(store.db,[record])[0]);
    };
    check(['approval_audit_missing']);
    audit(record,'untrusted-name');check(['reviewer_untrusted']);
    audit({...record,status:'pending'});check(['latest_audit_not_approved']);
    audit({...record,summary:'A changed summary for a different record version.'});check(['audit_record_mismatch']);
    audit(record);check([]);
  }finally{store.db.close();}
});

test('backlog CLI emits pure JSON and leaves database contents/schema unchanged', () => {
  const root=mkdtempSync(join(tmpdir(),'northstar-publication-report-'));
  const file=join(root,'fixture.sqlite');
  const store=openStore(file);
  try {
    const record={...seeds.find(r=>r.id==='sin-route'),id:'report-fixture',risk:'high',status:'approved',reviewMethod:'editorial_review'};
    store.db.prepare('INSERT INTO records VALUES (?,?)').run(record.id,JSON.stringify(record));
    const before=verifyDatabase(file);
    const result=spawnSync(process.execPath,['scripts/kb-publication-backlog.js','--db',file,'--json'],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    const report=JSON.parse(result.stdout);
    const row=report.rows.find(r=>r.id===record.id);
    assert.ok(row.withholdingReasons.includes('approval_audit_missing'));
    assert.equal(row.owner,null);
    assert.equal(report.unassigned,report.total);
    assert.deepEqual(report,publicationBacklog(file));
    const after=verifyDatabase(file);
    assert.equal(before.dataDigest,after.dataDigest);
    assert.equal(before.schemaDigest,after.schemaDigest);
  }finally{
    store.db.close();
    const rel=relative(resolve(tmpdir()),resolve(root));
    assert.ok(!isAbsolute(rel)&&!rel.startsWith('..')&&rel.startsWith('northstar-publication-report-'));
    rmSync(root,{recursive:true,force:true});
  }
});
