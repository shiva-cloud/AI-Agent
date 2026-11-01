import {setTimeout as delay} from 'node:timers/promises';
import {runOneJob} from './job-worker.js';

// Explicit opt-in loop. No default handlers, process-global timer or network.
export async function runScheduler(queue,{signal,pollMs=1000,...workerOptions}={}) {
  if(!signal||typeof signal.addEventListener!=='function')throw new Error('A shutdown AbortSignal is required');
  if(!Number.isInteger(pollMs)||pollMs<10||pollMs>60000)throw new Error('Invalid scheduler poll interval');
  if(typeof workerOptions.authorize!=='function')throw new Error('A job authorization policy is required');
  while(!signal.aborted) {
    queue.dispatchDue();
    if(signal.aborted)break;
    await runOneJob(queue,{...workerOptions,signal});
    if(signal.aborted)break;
    try{await delay(pollMs,undefined,{signal});}catch(error){if(!signal.aborted)throw error;}
  }
}
