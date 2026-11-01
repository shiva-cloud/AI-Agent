import {setTimeout as delay} from 'node:timers/promises';

// Fixed-delay cadence deliberately prevents overlapping or catch-up backups.
export async function runBackupService({backup,retention,signal,intervalMs=86400000,retryDelayMs=60000,maxRetries=2,onEvent=()=>{},wait=delay}={}) {
 if((retention!==undefined&&typeof retention!=='function')||typeof backup!=='function'||typeof onEvent!=='function'||!signal||typeof signal.addEventListener!=='function'||!Number.isSafeInteger(intervalMs)||intervalMs<60000||intervalMs>604800000||!Number.isSafeInteger(retryDelayMs)||retryDelayMs<1000||retryDelayMs>3600000||!Number.isInteger(maxRetries)||maxRetries<0||maxRetries>5)throw new Error('Invalid backup service configuration');
 let successes=0,failures=0,eventFailures=0,retentionFailures=0,eventDrops=0,eventPending=false;
 // Best-effort diagnostics never block backups or accumulate an unbounded queue.
 // Keep the slot until an asynchronous logger actually settles, even at shutdown.
 const emit=event=>{
  if(eventPending){eventDrops++;return;}
  eventPending=true;
  try {
   const result=onEvent(event);
   if(result&&typeof result.then==='function')Promise.resolve(result).then(()=>{eventPending=false;},()=>{eventFailures++;eventPending=false;});
   else eventPending=false;
  }catch{eventFailures++;eventPending=false;}
 };
 const pause=async ms=>{try{await wait(ms,undefined,{signal});}catch(error){if(!signal.aborted)throw error;}};
 while(!signal.aborted) {
  let completed=false;
  for(let attempt=0;attempt<=maxRetries&&!signal.aborted;attempt++) {
   const started=performance.now();
   try {
    await backup();successes++;completed=true;
    emit({event:'backup_succeeded',attempt:attempt+1,durationMs:Math.round(performance.now()-started)});break;
   }catch {
    failures++;emit({event:'backup_failed',attempt:attempt+1});
    if(attempt<maxRetries&&!signal.aborted)await pause(retryDelayMs);
   }
  }
  if(completed&&retention&&!signal.aborted) {
   try {await retention();emit({event:'backup_retention_succeeded'});}
   catch {retentionFailures++;emit({event:'backup_retention_failed'});}
  }
  if(!completed&&!signal.aborted)emit({event:'backup_cycle_exhausted'});
  if(!signal.aborted)await pause(intervalMs);
 }
 return {status:'stopped',successes,failures,eventFailures,retentionFailures,eventDrops,eventPending};
}
