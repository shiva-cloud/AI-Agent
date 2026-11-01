import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {openJobQueue} from '../src/jobs.js';
import {runOneJob} from '../src/job-worker.js';
const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-worker-smoke-'));
let queue;
try {
  queue=openJobQueue(join(root,'jobs.sqlite'));
  queue.enqueue({requestKey:'fixture-one',kind:'verify_snapshot',targetId:'fixture-snapshot'});
  queue.enqueue({requestKey:'fixture-denied',kind:'source_check',targetId:'prohibited-source'});
  queue.saveSchedule({scheduleId:'fixture-recurring',kind:'verify_snapshot',targetId:'fixture-snapshot',intervalMs:1000,nextRun:Date.now()});
  const dispatch=queue.dispatchDue();
  const results=[];
  for(let i=0;i<3;i++)results.push(await runOneJob(queue,{workerId:'fixture-worker',authorize:job=>job.targetId==='fixture-snapshot',handlers:{verify_snapshot:async()=>{}}}));
  if(!results.some(r=>r.status==='succeeded')||!results.some(r=>r.status==='blocked'))throw new Error('Worker smoke failed');
  if(dispatch.dispatched.length!==1||queue.dispatchDue().dispatched.length!==0)throw new Error('Scheduler smoke failed');
  console.log(JSON.stringify({status:'passed',scope:'Disposable queue, synthetic policy and no-op handler; no network or evidence database access.',dispatch,results,summary:queue.summary()},null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
finally {
  queue?.close();const resolved=realpathSync(root);
  if(dirname(resolved)!==parent||!basename(resolved).startsWith('northstar-worker-smoke-'))throw new Error('Unsafe cleanup path');
  rmSync(resolved,{recursive:true,force:true});
}
