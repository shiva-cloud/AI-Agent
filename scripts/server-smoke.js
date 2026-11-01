import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {openJobQueue} from '../src/jobs.js';
const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-server-smoke-'));
let child,exited;
try {
  const token=randomBytes(32).toString('hex');
  const env={...process.env,HOST:'127.0.0.1',PORT:'0',DB_PATH:join(root,'fixture.sqlite'),ADMIN_TOKEN:token,ANYROUTER_API_KEY:'',OPENROUTER_API_KEY:'',SEARCH_INDEX_PATH:'',PUBLIC_ORIGIN:''};
  delete env.ADMIN_ACTORS_JSON;
  delete env.ADMIN_ACTORS_FILE;
  delete env.TRUSTED_PROXY_IPS;
  delete env.RUNTIME_METRICS_PATH;
  env.ANSWER_CACHE_ENTRIES='8';
  env.RUNTIME_METRICS_PATH=join(root,'metrics.sqlite');
  delete env.ADMIN_JOB_DB_PATH;
  const queuePath=join(root,'jobs.sqlite');
  const queue=openJobQueue(queuePath);queue.close();env.ADMIN_JOB_DB_PATH=queuePath;
  child=spawn(process.execPath,[resolve('src/server.js')],{cwd:root,env,stdio:['ignore','pipe','pipe'],windowsHide:true});
  exited=new Promise(r=>child.once('exit',r));child.stderr.resume();
  const port=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Server startup deadline exceeded')),15000);
    let buffer='';const onData=chunk=>{buffer=(buffer+chunk.toString()).slice(-4096);const match=buffer.match(/Settlement pilot listening on port (\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}};
    child.stdout.on('data',onData);child.once('error',()=>{clearTimeout(timer);reject(new Error('Server process failed'));});
    child.once('exit',()=>{clearTimeout(timer);reject(new Error('Server exited before readiness'));});
  });
  const base=`http://127.0.0.1:${port}`;
  const get=(path,options={})=>fetch(base+path,{...options,signal:AbortSignal.timeout(5000)});
  assert.equal((await get('/ready')).status,200);
  assert.equal((await get('/')).status,200);
  assert.equal((await get('/admin/session')).status,401);
  const session=await get('/admin/session',{headers:{Authorization:`Bearer ${token}`}});assert.equal(session.status,200);
  const metrics=await (await get('/admin/runtime-metrics',{headers:{Authorization:`Bearer ${token}`}})).json();
  assert.ok(metrics.persisted.buckets.some(bucket=>bucket.category==='probes'&&bucket.count>=1));
  const queueHeaders={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  assert.equal((await get('/admin/jobs',{headers:queueHeaders})).status,200);
  const scheduled=await get('/admin/job-schedules',{method:'POST',headers:queueHeaders,body:JSON.stringify({scheduleId:'smoke-disabled',kind:'reindex',targetId:'fixture-index',intervalMs:60000,nextRun:0,enabled:false})});
  assert.equal(scheduled.status,200);assert.equal((await scheduled.json()).enabled,0);
  const schedules=await (await get('/admin/job-schedules',{headers:queueHeaders})).json();assert.equal(schedules.items.length,1);
  const response=await get('/v1/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Vancouver library'})});
  assert.equal(response.status,200);const answer=await response.json();assert.equal(answer.ai.status,'disabled');assert.ok(answer.traceId);
  assert.equal((await get('/ready',{headers:{Origin:'https://untrusted.invalid'}})).status,403);
  console.log(JSON.stringify({status:'passed',scope:'Child-process startup with disposable databases, temporary token and external AI disabled.',checks:['readiness','static UI','admin authorization','queue API','disabled schedule create/read','answer API','origin rejection'],shutdownScope:process.platform==='win32'?'Process termination; portable drain behavior is covered by lifecycle tests.':'SIGTERM shutdown.'},null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
finally {
  if(child&&child.exitCode===null){child.kill('SIGTERM');let timer;await Promise.race([exited,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Server did not stop; temporary directory preserved')),10000);})]).finally(()=>clearTimeout(timer));}
  const resolved=realpathSync(root);if(dirname(resolved)!==parent||!basename(resolved).startsWith('northstar-server-smoke-'))throw new Error('Unsafe cleanup path');rmSync(resolved,{recursive:true,force:true});
}
