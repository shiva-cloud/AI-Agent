// Explicit injected policy and handlers: importing this module enables no network
// access or publication. Side-effecting handlers must implement idempotency/fencing.
import {JobPolicyDenied} from './job-policy.js';
export async function runOneJob(queue, options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const { workerId, authorize, handlers = {}, timeoutMs = 10000, signal } = safeOptions;
  if(typeof authorize!=='function')throw new Error('A job authorization policy is required');
  if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000)throw new Error('Invalid job deadline');
  if(signal&&typeof signal.addEventListener!=='function')throw new Error('Invalid worker shutdown signal');
  if(signal?.aborted)return {status:'stopped'};
  const job=queue.claim(workerId,{leaseMs:timeoutMs+1000});
  if(!job)return {status:'idle'};
  const controller=new AbortController();let timer,deadlineExpired=false,shutdownRequested=false,onStop;
  const stopped=new Promise((_,reject)=>{
    onStop=()=>{shutdownRequested=true;controller.abort();reject(new Error('worker stopped'));};
    signal?.addEventListener('abort',onStop,{once:true});
    if(signal?.aborted)onStop();
  });
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{deadlineExpired=true;controller.abort();reject(new Error('deadline'));},timeoutMs);});
  let outcome='failed',code='handler_failed';
  try {
    const execute=async()=>{
      if(controller.signal.aborted)throw new Error('worker stopped');
      const allowed=await authorize({kind:job.kind,targetId:job.target_id,signal:controller.signal});
      if(controller.signal.aborted)throw new Error('deadline');
      if(allowed!==true)return {outcome:'blocked',code:'policy_denied'};
      if(typeof handlers[job.kind]!=='function')return {outcome:'blocked',code:'handler_missing'};
      await handlers[job.kind]({jobId:job.id,targetId:job.target_id,attempt:job.attempts,leaseToken:job.lease_token,signal:controller.signal});
      return {outcome:'succeeded',code:''};
    };
    ({outcome,code}=await Promise.race([execute(),deadline,stopped]));
  }catch(error){
    if(error instanceof JobPolicyDenied){outcome='blocked';code='policy_denied';}
    else code=shutdownRequested?'worker_stopped':deadlineExpired?'deadline_exceeded':'handler_failed';
  }
  finally{clearTimeout(timer);signal?.removeEventListener('abort',onStop);controller.abort();}
  const saved=queue.finish(job.id,job.lease_token,{outcome,code,retryDelayMs:Math.min(60000,1000*2**(job.attempts-1))});
  return {jobId:job.id,status:saved?queue.get(job.id).state:'lease_lost',code};
}
