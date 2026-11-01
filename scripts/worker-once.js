import {databasePath} from '../src/runtime-config.js';
import {openJobQueue} from '../src/jobs.js';
import {evidenceWorkerOptions} from '../src/evidence-worker.js';
import {runOneJob} from '../src/job-worker.js';
let queue;
try {
  if(!process.env.JOB_DB_PATH)throw new Error('JOB_DB_PATH must name the separate job database');
  const evidencePath=databasePath(process.argv[2]);
  queue=openJobQueue(process.env.JOB_DB_PATH);
  const result=await runOneJob(queue,{workerId:'evidence-worker',...evidenceWorkerOptions(evidencePath,{indexPath:process.env.SEARCH_INDEX_PATH})});
  console.log(JSON.stringify(result,null,2));
  if(['failed','blocked','lease_lost','queued'].includes(result.status))process.exitCode=1;
}catch{console.error('Worker did not complete. Check configured paths, queue status and source policy.');process.exitCode=1;}
finally{queue?.close();}
