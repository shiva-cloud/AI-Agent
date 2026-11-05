// Administrative routes (/admin/*). server.js authenticates the actor and checks
// canAccess(role, method, path) before these run; POST input already carries the
// individual reviewer identity. Each handler returns true when it answered the request.
import { reviewQueue } from '../review-queue.js';
import { publishQueue } from '../publish-queue.js';
import { defaultTokenQuotaManager } from '../ai-token-quota.js';

export function handleAdminGet(ctx) {
  const { actor, noIntentMetrics, observability, options, path, store, url } = ctx;
  const send = (code, body) => { ctx.send(code, body); return true; };
    if(path==='/admin/job-health') {
      if(!options.jobQueue)return send(503,{error:'Job management is not configured',code:'queue_unavailable'});
      return send(200,options.jobQueue.health());
    }
    const scheduleHistory=path.match(/^\/admin\/job-schedules\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,127})\/history$/);
    if(scheduleHistory) {
      if(!options.jobQueue)return send(503,{error:'Job management is not configured',code:'queue_unavailable'});
      return send(200,options.jobQueue.scheduleHistory(scheduleHistory[1],{after:url.searchParams.has('after')?Number(url.searchParams.get('after')):0,limit:url.searchParams.has('limit')?Number(url.searchParams.get('limit')):100}));
    }
    if(path==='/admin/jobs'||path==='/admin/job-schedules') {
      if(!options.jobQueue)return send(503,{error:'Job management is not configured',code:'queue_unavailable'});
      if(path==='/admin/job-schedules')return send(200,{items:options.jobQueue.schedules()});
      return send(200,options.jobQueue.list({after:url.searchParams.get('after')??'',limit:url.searchParams.has('limit')?Number(url.searchParams.get('limit')):100}));
    }
    if(path==='/admin/session')return send(200,actor);
    if(path==='/admin/metrics') return send(200,{processLocal:true,note:'Aggregate counts since this server start. No question text, IP or identifier is retained; counters reset on restart.',unrecognizedIntent:{total:noIntentMetrics.total,days:[...noIntentMetrics.days.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([day,count])=>({day,count}))}});
    if(path==='/admin/overview') return send(200,store.summary());
    if(path==='/admin/runtime-metrics')return send(200,observability.snapshot());
    if(path==='/admin/gap-work')return send(200,store.gapWork.list(url.searchParams.get('after')||''));
    const gapHistory=path.match(/^\/admin\/gap-work\/([a-f0-9]{64})\/history$/);
    if(gapHistory)return send(200,{events:store.gapWork.history(gapHistory[1])});
    if(path==='/admin/review-queue') return send(200,reviewQueue(store.records(),store.ingestion.sources(),store.ingestion.candidates()));
    if(path==='/admin/publish-queue') return send(200,publishQueue(store.db,store.records(),store.ingestion.sources(),store.ingestion.candidates()));
    if(path==='/admin/sources') return send(200,{sources:store.ingestion.sources()});
    if(path==='/admin/candidates') return send(200,{candidates:store.ingestion.candidates()});
    if(path==='/admin/changes') return send(200,{changes:store.ingestion.changes()});
    const history=path.match(/^\/admin\/records\/([a-z0-9-]+)\/history$/);
    if(history) return send(200,{versions:store.ingestion.history(history[1]),...store.ingestion.historyState(history[1])});
    if(path==='/admin/cost-analytics') return send(200, defaultTokenQuotaManager.getCostSummary());
  return false;
}

export function handleAdminPost(ctx) {
  const { actor, input, options, path, store, translations } = ctx;
  // This context is supplied after server authentication, never from JSON input.
  const authenticatedActor = actor?.mode === 'individual' ? actor : undefined;
  const send = (code, body) => { ctx.send(code, body); return true; };
    if(path==='/admin/job-schedules') {
      if(!options.jobQueue)return send(503,{error:'Job management is not configured',code:'queue_unavailable'});
      return send(200,options.jobQueue.saveSchedule(input,{id:actor.id,mode:actor.mode}));
    }
    if(path==='/admin/translations/endorse') {
      const result = translations.endorseTranslation({...input,actor:actor.id || 'legacy-admin'});
      if (!result) return send(404, { error: 'Translation not found' });
      return send(200, { success: true, translation: result });
    }
    if(path==='/admin/translations/verify') {
      const result = translations.verifyTranslation({...input,actor:actor.id || 'legacy-admin'});
      if (!result) return send(404, { error: 'Translation not found' });
      return send(200, { success: true, translation: result });
    }
    const gapUpdate=path.match(/^\/admin\/gap-work\/([a-f0-9]{64})$/);
    if(gapUpdate)return send(200,store.gapWork.update(gapUpdate[1],input));
    if(path==='/admin/sources') return send(201,store.ingestion.registerSource(input));
    if(path==='/admin/ingestion/run') {const result=store.ingestion.ingest(input);return send(result.replayed?200:201,result);}
    const restore=path.match(/^\/admin\/records\/([a-z0-9-]+)\/restore$/);
    if(restore) return send(200,store.ingestion.restore(restore[1],input,authenticatedActor));
    const policy=path.match(/^\/admin\/sources\/([a-z0-9-]+)\/policy$/);
    if(policy) return send(200,store.ingestion.permitSource(policy[1],input));
    const suspension=path.match(/^\/admin\/sources\/([a-z0-9-]+)\/suspend$/);
    if(suspension) return send(200,store.ingestion.suspendSource(suspension[1],input));
    const candidate=path.match(/^\/admin\/candidates\/([a-z0-9-]+)\/decision$/);
    if(candidate) return send(200,store.ingestion.decide(candidate[1],input,authenticatedActor));
    const review=path.match(/^\/admin\/reviews\/([a-z0-9-]+)\/decision$/);
    if(review) return send(200,store.review(review[1],input.decision,input.reviewer,input.note,authenticatedActor));
  return false;
}
