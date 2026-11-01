import {makeSoakCopies} from './soak-fixture.js';
import {mkdtempSync,realpathSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {monitorEventLoopDelay} from 'node:perf_hooks';
import {openStore} from '../src/store.js';
import {createApp} from '../src/server.js';
import {openRuntimeMetrics} from '../src/runtime-metrics.js';

const seconds=Number(process.argv[2]??30),concurrency=Number(process.argv[3]??5),multiplier=Number(process.argv[4]??1);
if(!Number.isInteger(seconds)||seconds<1||seconds>3600||!Number.isInteger(concurrency)||concurrency<1||concurrency>32||!Number.isInteger(multiplier)||multiplier<1||multiplier>32||process.argv.length>5)throw new Error('Usage: soak-local.js [seconds 1–3600] [concurrency 1–32] [record multiplier 1–32]');
const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-soak-'));
let store,metrics,server;const loop=monitorEventLoopDelay({resolution:20});
const startMemory=process.memoryUsage();let peakRss=startMemory.rss;
try {
 store=openStore(join(root,'fixture.sqlite'));metrics=openRuntimeMetrics(join(root,'metrics.sqlite'));
 const seedRecords=store.records(),copies=makeSoakCopies(seedRecords,multiplier);
 store.db.exec('BEGIN IMMEDIATE');
 try {const insert=store.db.prepare('INSERT INTO records VALUES (?,?)');for(const record of copies)insert.run(record.id,JSON.stringify(record));store.db.exec('COMMIT');}
 catch(error){store.db.exec('ROLLBACK');throw error;}
 peakRss=Math.max(peakRss,process.memoryUsage().rss);
 server=createApp(store,null,{}, {metricsStore:metrics,trustedProxyIps:['127.0.0.1']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base=`http://127.0.0.1:${server.address().port}`,start=performance.now(),deadline=start+seconds*1000;
 const samples=[],http={},failures=[];let issued=0,success=0;loop.enable();
 await Promise.all(Array.from({length:concurrency},async()=>{
  while(performance.now()<deadline){
   const index=issued++,begin=performance.now();
   // Rotate synthetic clients below their quota to exercise application work.
   // The ordinary benchmark independently checks quota enforcement.
   const client=Math.floor(index/100)%9000;
   try {
    const response=await fetch(base+'/v1/answers',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':`198.18.${client>>8}.${client&255}`},body:JSON.stringify({question:['SIN application','Vancouver library','Toronto rent deposit','Brampton child care'][index%4]}),signal:AbortSignal.timeout(15000)});
    http[response.status]=(http[response.status]||0)+1;const body=await response.json();
    if(response.status!==200||!body.traceId||body.ai?.status!=='disabled'||body.claims.some(c=>!body.sources.some(s=>s.id===c.evidenceId)))throw new Error('Response contract failed');
    success++;
   }catch{if(failures.length<100)failures.push({request:index,code:'request_failed'});}
   const ms=performance.now()-begin;
   // Deterministic bounded sampling, with no per-request payload retention.
   if(samples.length<100000)samples.push(ms);
   peakRss=Math.max(peakRss,process.memoryUsage().rss);
  }
 }));
 loop.disable();samples.sort((a,b)=>a-b);const quantile=p=>samples.length?samples[Math.ceil(samples.length*p)-1]:null;
 const traces=store.db.prepare('SELECT count(*) n FROM traces').get().n;
 const report={status:success===issued&&traces===success?'passed':'failed',scope:'Synthetic local loopback, disposable WAL databases and durable metrics; external AI disabled. Not production or provider capacity.',seconds,concurrency,dataset:{multiplier,seedRecords:seedRecords.length,syntheticPendingRecords:copies.length,totalRecords:seedRecords.length+copies.length,distribution:'Repeated seed-shaped pending fixtures; no new verified evidence'},requests:issued,success,persistedTraces:traces,elapsedMs:performance.now()-start,http,latencyMs:{p50:quantile(.5),p95:quantile(.95),p99:quantile(.99),samples:samples.length,sampling:'first 100000 requests'},eventLoopDelayMs:{p99:loop.percentile(99)/1e6,max:loop.max/1e6},memoryBytes:{startRss:startMemory.rss,peakRss,endRss:process.memoryUsage().rss},failures};
 mkdirSync('artifacts',{recursive:true});writeFileSync('artifacts/local-soak.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.status!=='passed')process.exitCode=1;
}finally {
 loop.disable();if(server?.listening)await new Promise(resolve=>server.close(resolve));metrics?.close();store?.db.close();
 const resolved=realpathSync(root);if(dirname(resolved)!==parent||!basename(resolved).startsWith('northstar-soak-'))throw new Error('Unsafe cleanup');rmSync(resolved,{recursive:true,force:true});
}
