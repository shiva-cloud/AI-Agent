import {existsSync} from 'node:fs';
import {openJobQueue} from '../src/jobs.js';
let queue;
try {
  const path=process.env.JOB_DB_PATH;if(!path||!existsSync(path))throw new Error('JOB_DB_PATH must name an existing job database');
  queue=openJobQueue(path,{readOnly:true});
  console.log(JSON.stringify({summary:queue.summary(),jobs:queue.list({after:process.argv[2]||''}),schedules:queue.schedules()},null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
finally{queue?.close();}
