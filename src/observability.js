import {randomUUID} from 'node:crypto';
import {latencyBin,percentiles} from './runtime-metrics.js';

const stages=new Set(['dispatch','read_evidence','generate_answer','refresh_evidence','persist_answer','quota','identity']);
export function failureCategory(error) {
  // SQLite extended result codes retain the primary code in their low byte.
  // Emit only fixed labels, never arbitrary codes/messages supplied by a caller.
  if(error?.code==='ERR_SQLITE_ERROR'&&Number.isInteger(error.errcode)) {
    return ({5:'storage_busy',6:'storage_locked',8:'storage_readonly',10:'storage_io',11:'storage_corrupt',13:'storage_full',19:'storage_constraint'})[error.errcode&255]??'storage_error';
  }
  if(error instanceof TypeError)return 'type_error';
  if(error instanceof RangeError)return 'range_error';
  if(error instanceof SyntaxError)return 'syntax_error';
  return 'unclassified';
}

// Fixed categories avoid unbounded metric cardinality and user-controlled paths.
export function routeCategory(path) {
  if(path==='/v1/answers')return 'answers';
  if(path==='/ready'||path==='/health')return 'probes';
  if(path.startsWith('/admin/'))return 'admin';
  if(path.startsWith('/v1/'))return 'public_api';
  return 'other';
}
export function createObservability({logger=()=>{},metricsStore,maxPendingLogs=16}={}) {
  if(typeof logger!=='function'||!Number.isInteger(maxPendingLogs)||maxPendingLogs<1||maxPendingLogs>256)throw new Error('Invalid logging configuration');
  const buckets=new Map();let loggingFailures=0,persistenceFailures=0,loggingPending=0,loggingDropped=0;
  const emit=event=>{
    if(loggingPending>=maxPendingLogs){loggingDropped++;return;}
    loggingPending++;
    try {
      const result=logger(event);
      if(result&&typeof result.then==='function')Promise.resolve(result).then(()=>{loggingPending--;},()=>{loggingFailures++;loggingPending--;});
      else loggingPending--;
    }catch{loggingFailures++;loggingPending--;}
  };
  const contexts=new WeakMap();
  return {
    stage(res,value){const context=contexts.get(res);if(context&&stages.has(value))context.stage=value;},
    failure(res,error){const context=contexts.get(res);if(context)context.failure=failureCategory(error);},
    begin(req,res) {
      const requestId=randomUUID(),start=performance.now();let finished=false;
      const context={stage:'dispatch',failure:'unclassified'};contexts.set(res,context);
      let category='other';try{category=routeCategory(new URL(req.url,'http://localhost').pathname);}catch{}
      res.setHeader('X-Request-ID',requestId);
      const complete=aborted=>{
        if(finished)return;finished=true;
        const status=aborted?499:res.statusCode,key=`${category}:${status}`;
        const elapsed=performance.now()-start;
        const bucket=buckets.get(key)||{category,status,count:0,totalLatencyMs:0,maxLatencyMs:0,histogram:Array(14).fill(0)};
        bucket.histogram[latencyBin(elapsed)]++;
        bucket.count++;bucket.totalLatencyMs+=elapsed;bucket.maxLatencyMs=Math.max(bucket.maxLatencyMs,elapsed);buckets.set(key,bucket);
        try{metricsStore?.record({category,status,elapsed});}catch{persistenceFailures++;}
        if(status>=500||aborted){
          // No request body, raw URL, headers, IP, exception, or caller-provided ID.
          const event={event:aborted?'request_aborted':'request_failed',requestId,category,status,durationMs:Math.round(elapsed),at:new Date().toISOString(),stage:context.stage,failureCategory:aborted?'client_disconnect':context.failure};
          emit(event);
        }
        contexts.delete(res);
      };
      res.once('finish',()=>complete(false));res.once('close',()=>complete(!res.writableFinished));
      return requestId;
    },
    snapshot() {
      let persisted=null;try{persisted=metricsStore?.snapshot()??null;}catch{persistenceFailures++;}
      return {processLocal:true,loggingFailures,loggingPending,loggingDropped,persistenceFailures,persisted,buckets:[...buckets.values()].map(b=>({category:b.category,status:b.status,count:b.count,meanLatencyMs:Number((b.totalLatencyMs/b.count).toFixed(2)),maxLatencyMs:Number(b.maxLatencyMs.toFixed(2)),...percentiles(b.histogram),histogram:[...b.histogram]}))};
    }
  };
}

export function formatPrometheusMetrics(snapshot) {
  const lines = [
    '# HELP northstar_http_requests_total Total number of HTTP requests processed by Northstar',
    '# TYPE northstar_http_requests_total counter'
  ];
  for (const b of snapshot.buckets || []) {
    lines.push(`northstar_http_requests_total{category="${b.category}",status="${b.status}"} ${b.count}`);
    lines.push(`northstar_http_request_duration_mean_seconds{category="${b.category}",status="${b.status}"} ${(b.meanLatencyMs / 1000).toFixed(4)}`);
    if (b.p95 !== undefined) {
      lines.push(`northstar_http_request_duration_p95_seconds{category="${b.category}",status="${b.status}"} ${(b.p95 / 1000).toFixed(4)}`);
    }
  }
  lines.push('# HELP northstar_logging_failures_total Total number of failed log emissions');
  lines.push('# TYPE northstar_logging_failures_total counter');
  lines.push(`northstar_logging_failures_total ${snapshot.loggingFailures || 0}`);
  lines.push('# HELP northstar_process_uptime_seconds Current process uptime in seconds');
  lines.push('# TYPE northstar_process_uptime_seconds gauge');
  lines.push(`northstar_process_uptime_seconds ${Math.round(process.uptime())}`);
  return lines.join('\n') + '\n';
}
