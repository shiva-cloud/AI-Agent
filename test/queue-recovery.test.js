import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {randomBytes} from 'node:crypto';
import {openJobQueue} from '../src/jobs.js';
import {verifyQueue,backupQueue,restoreQueueDrill} from '../src/queue-recovery.js';

test('encrypted WAL queue backup restores schedules and jobs without changing source',async()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-queue-recovery-')),file=join(root,'source.sqlite'),q=openJobQueue(file),key=randomBytes(32);
 try {
  q.workerPresence('fixture-presence');
  q.saveSchedule({scheduleId:'fixture',kind:'verify_snapshot',targetId:'private-fixture-id',nextRun:Date.now(),intervalMs:1000});q.dispatchDue();
  q.enqueue({requestKey:'extra',kind:'verify_snapshot',targetId:'second-fixture'});const claimed=q.claim('fixture-worker');
  const before=verifyQueue(file),saved=await backupQueue(file,join(root,'backups'),key);
  assert.deepEqual(verifyQueue(file),before);assert.deepEqual(saved.verification,before);assert.equal(before.counts.worker_presence,1);
  assert.ok(!readFileSync(join(saved.directory,'queue.enc')).includes(Buffer.from('private-fixture-id')));
  assert.deepEqual(readdirSync(saved.directory).sort(),['manifest.json','queue.enc']);
  const restored=await restoreQueueDrill(saved.directory,join(root,'drills'),key);assert.deepEqual(restored.verification,before);
  const copy=openJobQueue(restored.database,{readOnly:true});try{assert.equal(copy.get(claimed.id).state,'running');assert.equal(copy.schedules().length,1);assert.deepEqual(copy.scheduleHistory('fixture'),q.scheduleHistory('fixture'));assert.equal(before.counts.schedule_events,1);}finally{copy.close();}
  assert.deepEqual(verifyQueue(file),before);
  await assert.rejects(()=>restoreQueueDrill(saved.directory,join(root,'wrong-key'),randomBytes(32)));
  for(const dir of readdirSync(join(root,'wrong-key')))assert.deepEqual(readdirSync(join(root,'wrong-key',dir)),[]);
  const encrypted=join(saved.directory,'queue.enc'),bytes=readFileSync(encrypted);bytes[0]^=1;writeFileSync(encrypted,bytes);
  await assert.rejects(()=>restoreQueueDrill(saved.directory,join(root,'tampered'),key),/checksum/);assert.equal(existsSync(join(root,'tampered')),false);
 }finally {
  key.fill(0);q.close();const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-queue-recovery-'));rmSync(resolved,{recursive:true,force:true});
 }
});
