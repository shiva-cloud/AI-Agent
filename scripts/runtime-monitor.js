import {monitorRuntime,createRuntimeMetricsFetcher} from '../src/runtime-monitor.js';
import {createWebhookSink} from '../src/alert-webhook.js';
import {openMonitorState,monitorStateKey} from '../src/monitor-state.js';

// Usage: RUNTIME_MONITOR_URL=http://127.0.0.1:3000 ADMIN_TOKEN=... node scripts/runtime-monitor.js [interval-ms]
// Optional: ALERT_WEBHOOK_URL / ALERT_WEBHOOK_SECRET, ALERT_STATE_PATH, RUNTIME_ALERT_ERROR_RATE (0-1), RUNTIME_ALERT_ANSWER_P95_MS.
const controller=new AbortController(),stop=()=>controller.abort();
let stateDb=null;
try {
 const [interval='60000',...extra]=process.argv.slice(2);
 if(extra.length||!process.env.RUNTIME_MONITOR_URL)throw new Error('Server URL required');
 const thresholds={};
 if(process.env.RUNTIME_ALERT_ERROR_RATE)thresholds.errorRate=Number(process.env.RUNTIME_ALERT_ERROR_RATE);
 if(process.env.RUNTIME_ALERT_ANSWER_P95_MS)thresholds.answerP95Ms=Number(process.env.RUNTIME_ALERT_ANSWER_P95_MS);
 const fetchSnapshot=createRuntimeMetricsFetcher({baseUrl:process.env.RUNTIME_MONITOR_URL,token:process.env.ADMIN_TOKEN});
 const webhook=process.env.ALERT_WEBHOOK_URL?createWebhookSink({url:process.env.ALERT_WEBHOOK_URL,secret:process.env.ALERT_WEBHOOK_SECRET}):null;
 if(process.env.ALERT_STATE_PATH)stateDb=openMonitorState(process.env.ALERT_STATE_PATH);
 const state=stateDb?.forMonitor(monitorStateKey('runtime',new URL(process.env.RUNTIME_MONITOR_URL).origin));
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
 await monitorRuntime({signal:controller.signal,intervalMs:Number(interval),thresholds,fetchSnapshot,state,onEvent:async(event,{signal})=>{
  if(webhook)try{await webhook(event,{signal});}catch(error){console.error(`Alert webhook delivery failed (${error.code||'error'}); retrying on the next poll.`);throw error;}
  await new Promise((resolve,reject)=>process.stdout.write(JSON.stringify(event)+'\n',error=>error?reject(error):resolve()));
 }});
}catch(error){
 const known=error?.code==='alert_webhook_config'||/^(Runtime monitor|An admin token|Invalid runtime alert|Use a separate monitor state)/.test(error?.message||'');
 console.error(known?`Runtime monitor failed: ${error.message}.`:'Runtime monitor failed. Check the server URL, admin token, polling interval, alert state path and output destination.');process.exitCode=1;
}
finally{process.off('SIGINT',stop);process.off('SIGTERM',stop);stateDb?.close();}
