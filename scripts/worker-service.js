import {existsSync} from 'node:fs';
import {openJobQueue} from '../src/jobs.js';
import {databasePath} from '../src/runtime-config.js';
import {evidenceWorkerOptions} from '../src/evidence-worker.js';
import {superviseWorker} from '../src/worker-service.js';
let queue;const controller=new AbortController(),stop=()=>controller.abort();
try {
  const evidence=databasePath(process.argv[2]),jobs=process.env.JOB_DB_PATH;
  if(!jobs||!existsSync(jobs)||!existsSync(evidence))throw new Error('Existing queue and evidence paths required');
  queue=openJobQueue(jobs);process.on('SIGINT',stop);process.on('SIGTERM',stop);
  await superviseWorker(queue,{signal:controller.signal,workerId:'evidence-service',...evidenceWorkerOptions(evidence,{indexPath:process.env.SEARCH_INDEX_PATH}),onRestart:event=>console.error(JSON.stringify(event))});
}catch{console.error('Worker service stopped after a configuration or runtime failure.');process.exitCode=1;}
finally{process.off('SIGINT',stop);process.off('SIGTERM',stop);queue?.close();}
