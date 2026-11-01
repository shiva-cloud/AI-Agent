import {existsSync} from 'node:fs';
import {openJobQueue} from '../src/jobs.js';
let queue;
try {
  const path=process.env.JOB_DB_PATH,days=Number(process.argv[2]);
  if(!path||!existsSync(path))throw new Error('JOB_DB_PATH must name an existing job database');
  if(!Number.isInteger(days)||days<1||days>3650)throw new Error('Pass a retention period of 1–3650 days');
  queue=openJobQueue(path);
  console.log(JSON.stringify(queue.prune({before:Date.now()-days*86400000,limit:1000}),null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
finally{queue?.close();}
