import {openJobQueue} from '../src/jobs.js';
let queue;
try {
 queue=openJobQueue(process.env.JOB_DB_PATH,{readOnly:true});
 const result=queue.health();console.log(JSON.stringify(result,null,2));
 if(result.status==='attention')process.exitCode=2;
}catch{console.error('Queue health unavailable. Check the queue path, schema and filesystem access.');process.exitCode=1;}
finally{queue?.close();}
