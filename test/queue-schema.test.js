import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,realpathSync,rmSync,readFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {openJobQueue} from '../src/jobs.js';
import {verifyQueue,backupQueue} from '../src/queue-recovery.js';

async function fixture(run) {
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-schema-'));
 try{await run(root);}finally{const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-schema-'));rmSync(resolved,{recursive:true,force:true});}
}

test('unsupported and malformed queue schemas are rejected without rewriting database bytes',()=>fixture(async root=>{
 for(const [name,sql] of [
  ['future','INSERT INTO job_meta VALUES (5)'],
  ['gap','DELETE FROM job_meta WHERE version=2'],
  ['empty-meta','DELETE FROM job_meta'],
  ['missing-table','DROP TABLE schedule_events'],
  ['missing-column','ALTER TABLE jobs RENAME COLUMN lease_token TO incompatible_token']
 ]) {
  const file=join(root,name+'.sqlite');openJobQueue(file).close();
  const db=new DatabaseSync(file);try{db.exec(sql);db.exec('PRAGMA journal_mode=DELETE');}finally{db.close();}
  const before=readFileSync(file);
  for(const readOnly of [true,false])assert.throws(()=>openJobQueue(file,{readOnly}));
  assert.throws(()=>verifyQueue(file));
  const output=join(root,name+'-backup');
  await assert.rejects(()=>backupQueue(file,output,Buffer.alloc(32,1)));
  assert.equal(existsSync(output),false);assert.deepEqual(readFileSync(file),before);
 }
}));

test('an unrelated database is not initialized as a queue',()=>fixture(root=>{
 const file=join(root,'unrelated.sqlite'),db=new DatabaseSync(file);
 db.exec('CREATE TABLE unrelated(value TEXT); INSERT INTO unrelated VALUES (\'preserve\')');db.close();
 const before=readFileSync(file);assert.throws(()=>openJobQueue(file),/Unsupported queue schema/);assert.deepEqual(readFileSync(file),before);
}));

test('v1 queues remain readable and upgrade with existing jobs preserved',()=>fixture(root=>{
 const file=join(root,'v1.sqlite');let q=openJobQueue(file);
 const job=q.enqueue({requestKey:'fixture',kind:'reindex',targetId:'fixture-index'});q.close();
 const db=new DatabaseSync(file);
 db.exec('DROP TABLE schedule_events; DROP TABLE job_schedules; DELETE FROM job_meta WHERE version>1');db.close();
 q=openJobQueue(file,{readOnly:true});try{assert.equal(q.get(job.id).state,'queued');}finally{q.close();}
 q=openJobQueue(file);try{q.checkReady();assert.equal(q.get(job.id).request_key,'fixture');assert.equal(q.schedules().length,0);}finally{q.close();}
}));
