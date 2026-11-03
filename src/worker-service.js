import {runScheduler} from './scheduler.js';
import {randomUUID} from 'node:crypto';

export async function superviseWorker(queue,options={}) {
 const instanceId=randomUUID();let timer;
 if(options.signal?.aborted)return {restarts:0,status:'stopped'};
 if(queue.workerPresence) {
  queue.workerPresence(instanceId);
  timer=setInterval(()=>{try{queue.workerPresence(instanceId);}catch{/* Stale presence exposes failed persistence without crashing the timer. */}},10000);
  timer.unref();
 }
 try{return await runSupervisor(queue,options);}
 finally{clearInterval(timer);try{queue.workerPresence?.(instanceId,'stopped');}catch{/* Existing heartbeat becomes stale if storage is unavailable. */}}
}

// Bounded restart supervisor for transient queue/loop failures. Does not swallow
// an endless failure cycle or start any default jobs/handlers.
async function runSupervisor(queue,{signal,maxRestarts=3,restartDelayMs=1000,onRestart=()=>{},...options}={}) {
  if(!signal||!Number.isInteger(maxRestarts)||maxRestarts<0||maxRestarts>10||!Number.isInteger(restartDelayMs)||restartDelayMs<1||restartDelayMs>60000)throw new Error('Invalid worker supervision options');
  let restarts=0;
  while(!signal.aborted) {
    try {await runScheduler(queue,{signal,...options});return {restarts,status:'stopped'};}
    catch(error){
      if(signal.aborted)return {restarts,status:'stopped'};
      if(restarts>=maxRestarts)throw new Error('Worker restart budget exhausted');
      restarts++;
      try {
        Promise.resolve(onRestart({event:'worker_restart',attempt:restarts})).catch(err => {
          console.warn('[worker-service:onRestart]', err.message);
        });
      } catch (err) {
        console.warn('[worker-service:onRestart_sync]', err.message);
      }
      const {setTimeout:delay}=await import('node:timers/promises');
      try{await delay(restartDelayMs,undefined,{signal});}catch{if(!signal.aborted)throw error;}
    }
  }
  return {restarts,status:'stopped'};
}
