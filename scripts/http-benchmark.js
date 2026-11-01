import {mkdtempSync,mkdirSync,writeFileSync,rmSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {performance} from 'node:perf_hooks';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
const parent=realpathSync(tmpdir()),directory=mkdtempSync(join(parent,'settlement-http-'));
const store=openStore(join(directory,'benchmark.sqlite'));
// An explicit empty adapter disables all external AI calls, regardless of environment.
const server=createApp(store,undefined,{});
const times=[],statuses={},failures=[];
const queries=['SIN application','Toronto bus','Vancouver library','Brampton child care','Toronto rent deposit','London health','Mississauga jobs','Vancouver driving licence'];
try {
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base=`http://127.0.0.1:${server.address().port}`,started=performance.now();let next=0;
 await Promise.all(Array.from({length:5},async()=>{
  while(next<80){const index=next++,start=performance.now();
   try{
    const response=await fetch(base+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:queries[index%queries.length]}),signal:AbortSignal.timeout(10000)});
    const result=await response.json();times.push(performance.now()-start);
    if(response.status!==200||!result.traceId||result.ai?.status!=='disabled')throw new Error(`Unexpected response ${response.status}`);
    if(result.claims.some(c=>!result.sources.some(s=>s.id===c.evidenceId)))throw new Error('Unlinked claim');
    statuses[result.status]=(statuses[result.status]||0)+1;
   }catch(error){failures.push({index,error:error.message});}
  }
 }));
 const elapsedMs=performance.now()-started;
 const traces=store.db.prepare('SELECT count(*) AS n FROM traces').get().n;
 if(traces!==80)failures.push({error:`Expected 80 persisted traces, got ${traces}`});
 // The preceding 80 requests consumed the same per-IP window.
 for(let i=0;i<40;i++)if((await fetch(base+'/health')).status!==200)failures.push({error:'Premature throttle'});
 const blocked=await fetch(base+'/health');
 if(blocked.status!==429||!Number.isInteger(Number(blocked.headers.get('retry-after')))||Number(blocked.headers.get('retry-after'))<1)failures.push({error:'Missing throttle or retry guidance'});
 times.sort((a,b)=>a-b);const percentile=p=>times.length?times[Math.min(times.length-1,Math.ceil(times.length*p)-1)]:null;
 const report={createdAt:new Date().toISOString(),scope:'Local loopback HTTP, file-backed SQLite WAL, 80 answers, concurrency 5, external AI explicitly disabled. Not a production capacity or provider latency result.',requests:80,concurrency:5,elapsedMs,requestsPerSecond:80/(elapsedMs/1000),latencyMs:{p50:percentile(.5),p95:percentile(.95),p99:percentile(.99)},statuses,persistedTraces:traces,throttle:{status:blocked.status,retryAfterSeconds:Number(blocked.headers.get('retry-after'))},failures};
 mkdirSync('artifacts',{recursive:true});writeFileSync('artifacts/http-benchmark.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 if(failures.length)process.exitCode=1;
}finally{
 if(server.listening)await new Promise(resolve=>server.close(resolve));store.db.close();
 const resolved=realpathSync(directory);
 if(dirname(resolved)!==parent||!basename(resolved).startsWith('settlement-http-'))throw new Error('Refusing cleanup outside benchmark temporary directory');
 rmSync(resolved,{recursive:true,force:true});
}
