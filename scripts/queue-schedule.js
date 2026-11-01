import {existsSync,readFileSync,statSync} from 'node:fs';
import {openJobQueue} from '../src/jobs.js';
let queue;
try {
  const path=process.env.JOB_DB_PATH,input=process.argv[2];
  if(!path||!existsSync(path)||!input||statSync(input).size>4096)throw new Error('Existing queue and bounded schedule file required');
  const spec=JSON.parse(readFileSync(input,'utf8'));
  queue=openJobQueue(path);console.log(JSON.stringify(queue.saveSchedule(spec),null,2));
}catch{console.error('Schedule was not saved. Check JOB_DB_PATH, JSON fields and current revision.');process.exitCode=1;}
finally{queue?.close();}
