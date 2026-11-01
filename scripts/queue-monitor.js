import {openJobQueue} from '../src/jobs.js';
import {monitorQueue} from '../src/queue-monitor.js';
import {createWebhookSink} from '../src/alert-webhook.js';
import {openMonitorState,monitorStateKey} from '../src/monitor-state.js';
import {resolve} from 'node:path';

const controller=new AbortController(),stop=()=>controller.abort();
let stateDb=null;
try {
 const [interval='10000',...extra]=process.argv.slice(2);
 if(extra.length||!process.env.JOB_DB_PATH)throw new Error('Queue path required');
 // Optional: deliver each transition to an HTTPS webhook before writing it to stdout.
 // A failed delivery writes nothing, so the transition is retried on the next poll.
 const webhook=process.env.ALERT_WEBHOOK_URL?createWebhookSink({url:process.env.ALERT_WEBHOOK_URL,secret:process.env.ALERT_WEBHOOK_SECRET}):null;
 // Optional: remember the last delivered state so a restart neither repeats nor forgets alerts.
 if(process.env.ALERT_STATE_PATH)stateDb=openMonitorState(process.env.ALERT_STATE_PATH);
 const state=stateDb?.forMonitor(monitorStateKey('queue',resolve(process.env.JOB_DB_PATH)));
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
 await monitorQueue({signal:controller.signal,intervalMs:Number(interval),state,readHealth:()=>{
  const queue=openJobQueue(process.env.JOB_DB_PATH,{readOnly:true});
  try{return queue.health();}finally{queue.close();}
 },onEvent:async(event,{signal})=>{
  if(webhook)try{await webhook(event,{signal});}catch(error){console.error(`Alert webhook delivery failed (${error.code||'error'}); retrying on the next poll.`);throw error;}
  await new Promise((resolve,reject)=>process.stdout.write(JSON.stringify(event)+'\n',error=>error?reject(error):resolve()));
 }});
}catch(error){console.error(error?.code==='alert_webhook_config'||/^Use a separate monitor state/.test(error?.message||'')?`Queue monitor failed: ${error.message}.`:'Queue monitor failed. Check the queue path, polling interval, alert state path and output destination.');process.exitCode=1;}
finally{process.off('SIGINT',stop);process.off('SIGTERM',stop);stateDb?.close();}
