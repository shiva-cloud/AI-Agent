import {setTimeout as delay} from 'node:timers/promises';

const queueCodes=new Set(['worker_heartbeat_stale','queue_wait_exceeded','expired_job_leases','schedule_dispatch_late','failed_jobs_retained','blocked_jobs_retained']);
async function boundedOperation(callback,signal,timeoutMs) {
 const controller=new AbortController();let timer,onAbort;
 const interrupted=new Promise(resolve=>{
  onAbort=()=>{resolve({type:'aborted'});controller.abort();};
  signal.addEventListener('abort',onAbort,{once:true});
  timer=setTimeout(()=>{resolve({type:'timeout'});controller.abort();},timeoutMs);
 });
 try {
  if(signal.aborted){onAbort();return {type:'aborted'};}
  const operation=Promise.resolve().then(()=>signal.aborted?{type:'aborted'}:callback(controller.signal)).then(
   value=>({type:'completed',value}),()=>({type:'failed'}));
  return await Promise.race([interrupted,operation]);
 }finally{clearTimeout(timer);signal.removeEventListener('abort',onAbort);}
}
function timeoutFailure() {
 const error=new Error('Queue monitor operation timed out');error.code='monitor_timeout';return error;
}
function normalize(report,codes) {
 if(!report||!['ok','attention'].includes(report.status)||!Array.isArray(report.alerts)||report.alerts.length>codes.size)throw new Error('Invalid queue health report');
 const alerts=report.alerts.map(alert=>{
  if(!codes.has(alert.code)||!Number.isSafeInteger(alert.count)||alert.count<1)throw new Error('Invalid queue alert');
  return {code:alert.code,count:alert.count};
 }).sort((a,b)=>a.code.localeCompare(b.code));
 if(new Set(alerts.map(a=>a.code)).size!==alerts.length||(report.status==='ok')!==(alerts.length===0))throw new Error('Inconsistent queue health report');
 return {status:report.status,alerts};
}

export function monitorQueue(options={}) {
 return monitorTransitions({...options,codes:queueCodes,eventPrefix:'queue_monitor'});
}

// A persisted state must look exactly like one this monitor would produce.
function restoreState(saved,codes) {
 try {
  const [status,alertCodes,...rest]=JSON.parse(saved);
  if(rest.length||!['ok','attention','unavailable'].includes(status)||!Array.isArray(alertCodes)||alertCodes.some(code=>!codes.has(code)))return null;
  if((status==='attention')!==(alertCodes.length>0))return null;
  return JSON.stringify([status,[...alertCodes].sort()]);
 }catch{return null;}
}

// Shared transition monitor: polls a health report of {status, alerts:[{code,count}]}
// restricted to `codes`, and emits `${eventPrefix}_attention|_unavailable|_recovered`.
// readHealth may return null for "no observation yet" (for example a fresh baseline).
// The optional `state` ({load, save}) keeps the last delivered state across restarts,
// so a restart neither repeats an already-delivered alert nor forgets an undelivered one.
export async function monitorTransitions({readHealth,onEvent,signal,intervalMs=10000,operationTimeoutMs=5000,wait=delay,codes,eventPrefix,state:store}={}) {
 if(!(codes instanceof Set)||!/^[a-z_]+$/.test(eventPrefix??''))throw new Error('Invalid monitor configuration');
 if(store!==undefined&&(typeof store?.load!=='function'||typeof store?.save!=='function'))throw new Error('Invalid monitor state store');
 if(typeof readHealth!=='function'||typeof onEvent!=='function'||!signal||typeof signal.addEventListener!=='function'||!Number.isInteger(intervalMs)||intervalMs<1000||intervalMs>3600000||!Number.isInteger(operationTimeoutMs)||operationTimeoutMs<1||operationTimeoutMs>60000)throw new Error('Invalid queue monitor configuration');
 let previous=null,polls=0,readFailures=0,deliveryFailures=0,events=0,stateFailures=0;
 if(store)try{previous=restoreState(await store.load(),codes);}catch{stateFailures++;}
 const remember=state=>{previous=state;if(store)try{store.save(state);}catch{stateFailures++;}};
 while(!signal.aborted) {
  let report;
  const read=await boundedOperation(operationSignal=>readHealth({signal:operationSignal}),signal,operationTimeoutMs);
  if(read.type==='aborted'||signal.aborted)break;
  if(read.type==='timeout')throw timeoutFailure();
  const observed=!(read.type==='completed'&&read.value===null);
  if(observed)try {if(read.type==='failed')throw new Error();report=normalize(read.value,codes);}catch{readFailures++;report={status:'unavailable',alerts:[]};}
  polls++;
  if(signal.aborted)break;
  // Count/age changes alone do not repeat alerts. A new condition or recovery does.
  const state=observed?JSON.stringify([report.status,report.alerts.map(a=>a.code)]):previous;
  if(observed&&previous===null&&report.status==='ok')remember(state);
  else if(state!==previous) {
   const event={event:`${eventPrefix}_${report.status==='unavailable'?'unavailable':report.status==='ok'?'recovered':'attention'}`,
    status:report.status,alerts:report.alerts,at:new Date().toISOString()};
   const delivered=await boundedOperation(operationSignal=>onEvent(event,{signal:operationSignal}),signal,operationTimeoutMs);
   if(delivered.type==='aborted'||signal.aborted)break;
   if(delivered.type==='timeout')throw timeoutFailure();
   if(delivered.type==='failed')deliveryFailures++;
   else {events++;remember(state);}
  }
  if(!signal.aborted)try{await wait(intervalMs,undefined,{signal});}catch(error){if(!signal.aborted)throw error;}
 }
 return {status:'stopped',polls,events,readFailures,deliveryFailures,stateFailures};
}
