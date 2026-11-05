import {publicEvidence} from './public-evidence.js';
import { createPublicEvidenceSnapshot } from './evidence-revision.js';
import { assertFiniteInput } from './finite-input.js';
import { createStreamLogger } from './stream-logger.js';
import { readRequestBody, RequestBodyError } from './request-body.js';
import { checkStorageReadiness } from './storage-readiness.js';
import { openSharedRateLimits } from './shared-rate-limit.js';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { appModuleFiles } from './app-modules.js';
import { fileURLToPath } from 'node:url';
import { createHash, timingSafeEqual } from 'node:crypto';
import { brotliCompress, gzip, constants as zlibConstants } from 'node:zlib';
import { promisify } from 'node:util';
import { handleToolGet, handleToolPost } from './routes/tools.js';
import { handleAdminGet, handleAdminPost } from './routes/admin.js';
const rawBrotli = promisify(brotliCompress);
const compressBrotli = (buf) => rawBrotli(buf, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } });
const compressGzip = promisify(gzip);
import { answer, parse, retrieve, coverage, coverageDetail, countryCoverage, deconstructNarrative, resolveNarrativeCrisis, detectLegalMyth, cleanEmotionalFluff, normalizeSlangAndTypos } from './engine.js';
import { handleCatalogRoute } from './routes/catalog.js';
import { topics, topicLabels, cities, agencies } from './knowledge.js';
import { lintEvidence } from './evidence-policy.js';
import { openStore } from './store.js';
import { createVerifiedAnswer } from './verified-answer.js';
import { composePresentation } from './answer-composer.js';
import { aiRouterOptions } from './ai-router.js';
import { createRateLimiter } from './rate-limit.js';
import { createShutdown } from './lifecycle.js';
import { errorResponse, responseBody, ToolInputError } from './api-errors.js';
import { databasePath, publicOrigin, validateProductionAccounts, assertTestModeAllowed, seedDatabaseFromSnapshot } from './runtime-config.js';
import { createObservability, formatPrometheusMetrics } from './observability.js';
import { createAdminAuth, createFileAdminAuth, AdminConfigUnavailable, actorsFromEnvironment, canAccess } from './admin-auth.js';
import { openEvidenceIndex } from './evidence-index.js';
import { openJobQueue } from './jobs.js';
import { openRuntimeMetrics } from './runtime-metrics.js';
import { createClientAddress, proxyAddressesFromEnvironment } from './client-address.js';
import { getLocalizedKit, SUPPORTED_LANGUAGES } from './i18n-dictionary.js';
import { resolveConversationTurn } from './conversation-resolver.js';
import { GEOGRAPHY_VERSION, places, placePath } from './geography.js';
import { publicCatalog } from './plans.js';
import { handleManage } from './manage-api.js';
import { PlanError, accountSubject, openAccounts, VERIFY_HOURS, RESET_MINUTES } from './accounts.js';
import { accountEmails, mailerFromEnvironment } from './mailer.js';
import { REALTIME_SOURCES, MONITORED_DESTINATIONS, queryRealtimeSources } from './realtime-registry.js';

import { extractPolicyDelta } from './realtime-extractor.js';
import { getCronStats, runCronCycle } from './realtime-cron.js';
import { SUPPORTED_CORRIDORS } from './corridors-registry.js';
import { detectAndTranslateMultilingualQuery } from './multilingual-layer.js';
import { SubscriptionManager } from './realtime-subscriptions.js';
import { generateSriManifest } from './sri-integrity.js';
import { listAllGlossaryTerms, lookupStatutoryTerm } from './statutory-glossary.js';
import { extractStatutoryCitations, linkifyStatutoryCitations } from './citation-linker.js';
import { auditKbRecordExpiries } from './kb-expiry-monitor.js';
import { createProvenanceBlock, verifyProvenanceChain } from './kb-provenance-chain.js';
import { classifyPolicySeverity, auditStatutoryHierarchyConflict } from './kb-policy-classifier.js';
import { auditMultiCountryGazettes, syncCorridorMigrationRules, translatePolicyDelta } from './multi-country-gazette-crawler.js';
import { getLocaleDictionary, getSupportedLocales } from './ui-locale-dictionary.js';
import { searchGlossary, getGlossaryCategories, getGlossaryTerm } from './settlement-glossary-500.js';
import { initTranslationLedger } from './community-translation-ledger.js';
import { getAirportPhrases, getAirportCategories, getAirportPhraseById } from './airport-phrasebook.js';
import { getAvailableSpeechProfiles } from './audio-speech-helper.js';
import { generateBilingualView } from './bilingual-view-helper.js';

import { normalizeTypedNumber, normalizeToolInput, applyFormAliases, validateToolAliasInput, TOOL_OUTPUT_GARBAGE, TOOL_INPUT_ERROR, ASSUMPTION_NOTICE, trackQuery, trackBody } from './tool-input.js';
// Static routes for public/app/*.js, fixed at startup like the rest of the file list.
const APP_MODULE_ROUTES=Object.fromEntries(appModuleFiles().map(file=>['/'+file,file]));
export function createApp(store=openStore(), adminToken=process.env.ADMIN_TOKEN, aiOptions=aiRouterOptions(),options={}) {
  const translations=initTranslationLedger(store.db);
  const subscriptionManager = new SubscriptionManager(store.db);
 const evidenceSnapshot=createPublicEvidenceSnapshot(store.db,()=>publicEvidence(store.db,store.records()));
 const readPublicRecords=()=>evidenceSnapshot().records;
 const bodyTimeoutMs=options.bodyTimeoutMs??10000;
 if(!Number.isInteger(bodyTimeoutMs)||bodyTimeoutMs<1||bodyTimeoutMs>15000)throw new Error('Invalid body timeout');
 const observability=createObservability(options);
 const allowedOrigin=publicOrigin(options.publicOrigin);
 const clientAddress=createClientAddress(options.trustedProxyIps);
 if(options.actorsFile&&options.actors!==undefined)throw new Error('Choose one individual identity configuration source');
  const auth=options.actorsFile?createFileAdminAuth(options.actorsFile):createAdminAuth({actors:options.actors,legacyToken:adminToken});
  // Prometheus metrics are operational data, not public content. When a
  // dedicated METRICS_TOKEN is configured only that bearer may scrape; otherwise
  // any valid admin actor may, and with admin fully disabled (loopback dev
  // default) the endpoints stay open.
  const metricsToken=typeof options.metricsToken==='string'&&options.metricsToken.length>=24?options.metricsToken:null;
  const metricsAuthorized=req=>{
    if(metricsToken){
      const header=req.headers.authorization;
      if(typeof header!=='string'||!header.startsWith('Bearer '))return false;
      const given=Buffer.from(header.slice(7)),expected=Buffer.from(metricsToken);
      return given.length===expected.length&&timingSafeEqual(given,expected);
    }
    if(auth.mode!=='disabled')return Boolean(auth.authenticate(req.headers.authorization));
    return true;
  };
 const verifiedAnswer=createVerifiedAnswer({...aiOptions,searchIndex:options.searchIndex,cacheEntries:options.answerCacheEntries??0});
 let draining=false;
 // Route families get separate rate-limit buckets, so answering questions is
 // never throttled by static reloads and admin traffic is capped harder.
 // Custom rules override per family; families they omit keep the default rule,
 // so a partial override cannot leave a family without a limiter.
 const DEFAULT_RATE_LIMITS={v1:{limit:120,windowMs:60000},tools:{limit:240,windowMs:60000},admin:{limit:60,windowMs:60000},static:{limit:240,windowMs:60000}};
 const rules={...DEFAULT_RATE_LIMITS,...(options.rateLimits??{})};
 const limiters=Object.fromEntries(Object.entries(rules).map(([family,rule])=>[family,options.quotaStore?options.quotaStore.createLimiter(family,rule):createRateLimiter(rule)]));
 // Tool runs get their own bucket so quick form retries never starve chat answers.
 const familyOf=path=>path.startsWith('/admin/')?'admin':path.startsWith('/v1/tools/')?'tools':path.startsWith('/v1/')||path==='/health'?'v1':'static';
 // Aggregate, process-local counts of questions the engine could not interpret.
 // No question text, IP or identifier is retained; this is demand signal for
 // editors, not user data. It resets when the server restarts.
 const encodedAssets=new Map();
 const setEncodedAsset=(key,promise)=>{
  if(encodedAssets.size>=256){
   const oldest=encodedAssets.keys().next().value;
   encodedAssets.delete(oldest);
  }
  encodedAssets.set(key,promise);
 };
 const noIntentMetrics={total:0,days:new Map()};
 const server=http.createServer(async(req,res)=>{
  observability.begin(req,res);
  const headers={'Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()','Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Resource-Policy':'same-origin'};
  const isToolRequest=String(req.url||'').startsWith('/v1/tools/');
  // Tool inputs read but not supplied; a successful result names them (see trackQuery/trackBody).
  const assumedInputs=new Set();
  let account=null,entitlement=null;
  const send=(code,body)=>{
   if(isToolRequest&&code<300){headers['X-Assessment-Type']='preliminary-unreviewed';headers['X-Source-Review']='required';}
   if(isToolRequest&&code<300&&assumedInputs.size&&body&&typeof body==='object'&&!Array.isArray(body))body={...body,assumedInputs:[...assumedInputs].sort(),assumptionNotice:ASSUMPTION_NOTICE};
   let text=JSON.stringify(responseBody(code,body));
   // A tool that rendered a wrong-typed value into its text answers 400 instead of showing garbage.
   if(isToolRequest&&code<300&&TOOL_OUTPUT_GARBAGE.test(text)){code=400;text=JSON.stringify(responseBody(400,TOOL_INPUT_ERROR));}
   if(entitlement){
     const reservation=entitlement;
     entitlement=null;
     try {
       if(code<400)options.accounts.record(reservation);else options.accounts.release(reservation);
     } catch(error) {
       if(code<400)try{options.accounts.release(reservation);}catch(releaseError){observability.failure(res,releaseError);}
       // Clear before propagating so the error response cannot retry failing accounting.
       throw error;
     }
   }
   res.writeHead(code,headers);res.end(text);
  };
  try {
   const url=new URL(req.url,'http://localhost'), path=url.pathname;
   if(/^\/v1\/(?:question-bank|market-gap|global-settlement)(?:\/|$)/.test(path))headers['X-Evidence-Status']='unreviewed-research-catalog';
   // Rebuild rather than set(), so a repeated key (?a=1&a=2) keeps every value.
   if(isToolRequest){const entries=[...url.searchParams];url.search='';for(const [k,v] of entries)url.searchParams.append(k,String(normalizeTypedNumber(v)));}
   if(req.headers.origin && req.headers.origin!==(allowedOrigin||`http://${req.headers.host}`)) return send(403,{error:'Cross-origin requests are not allowed'});
   if(isToolRequest && req.method==='GET')validateToolAliasInput(path,url.searchParams);
   if(req.method==='GET' && path==='/ready') {
     if(draining)return send(503,{status:'not_ready',reason:'draining'});
     try {checkStorageReadiness(store.db);}
     catch {return send(503,{status:'not_ready',reason:'storage_unavailable'});}
     if(options.jobQueue) {
       try {options.jobQueue.checkReady();}
       catch {return send(503,{status:'not_ready',reason:'queue_unavailable'});}
     }
     if(options.accounts) {
       try {options.accounts.checkReady();}
       catch {return send(503,{status:'not_ready',reason:'accounts_unavailable'});}
     }
     if(options.quotaStore) {
       try {options.quotaStore.checkReady();}
       catch {return send(503,{status:'not_ready',reason:'quota_unavailable'});}
     }
     return send(200,{status:'ready'});
   }
   if(draining){headers['Connection']='close';return send(503,{error:'Service is restarting. Please retry shortly.',code:'service_draining'});}
   observability.stage(res,'quota');
   let quota;
   try {quota=limiters[familyOf(path)](clientAddress(req));}
   catch(error) {observability.failure(res,error);return send(503,{error:'Request quota service unavailable',code:'quota_unavailable'});}
   if(!quota.allowed){headers['Retry-After']=String(quota.retryAfterSeconds);return send(429,{error:'Please wait before trying again'});}
   // SaaS mode (options.accounts): plan access and monthly quotas for chat answers and tools.
   // Only successful responses are counted; safety and legal-rights tools are never metered.
   res.once('close',()=>{if(entitlement){try{options.accounts.release(entitlement);}catch(error){observability.failure(res,error);}entitlement=null;}});
   const sessionToken=/(?:^|;\s*)ns_session=([A-Za-z0-9_-]{20,100})(?:;|$)/.exec(req.headers.cookie||'')?.[1]??null;
   // Links in account emails use the configured public origin; a request's Host header is
   // trusted only for loopback development, so nobody can make the server mail a link to their own site.
   const linkOrigin=()=>allowedOrigin||(/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(req.headers.host||'')?`http://${req.headers.host}`:null);
   const sendAccountEmail=(to,kind,token)=>{
     const origin=linkOrigin();
     if(!options.mailer||!origin||!token)return false;
     const link=`${origin}/?${kind}=${encodeURIComponent(token)}`;
     const message=kind==='verify'?accountEmails.verify(link,VERIFY_HOURS):accountEmails.reset(link,RESET_MINUTES);
     options.mailer.send({to,...message}); // not awaited: the response must not depend on delivery
     return true;
   };
   const sessionCookie=(token,maxAge)=>`ns_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${allowedOrigin?.startsWith('https:')?'; Secure':''}`;
   if(path==='/v1/plans'&&req.method==='GET')return send(200,options.accounts?options.accounts.registry().publicCatalog():publicCatalog());
   if(path==='/v1/test-mode'&&req.method==='GET')return options.testMode?send(200,{enabled:true,email:options.testMode.email,password:options.testMode.password,notice:'Testing mode: this demo account and its password are public. Do not store real data.'}):send(404,{error:'Testing mode is off.',code:'test_mode_off'});
   // Without plans there is no account; 204 tells the website so without a console error.
   if(!options.accounts&&req.method==='GET'&&(path==='/v1/account'||path==='/v1/account/usage'||path==='/v1/account/keys')){res.writeHead(204,headers);return res.end();}
   if(options.accounts&&path.startsWith('/v1/')) {
     try {
       const authorization=req.headers.authorization;
       // An API key wins over a browser session; without either the caller is on Free.
       account=typeof authorization==='string'&&authorization.startsWith('Bearer nsk_')?options.accounts.authenticate(authorization):options.accounts.sessionAccount(sessionToken);
       const subject=account?accountSubject(account):options.accounts.anonymousSubject(clientAddress(req));
       const visitorPlan=account?.plan??options.accounts.anonymousPlan();
       if(path==='/v1/account'&&req.method==='GET')return send(200,{account:account?{id:account.id,name:account.name,plan:account.plan,email:account.email??null,emailVerified:account.emailVerified??null,isAdmin:Boolean(account.isAdmin&&!account.keyId)}:null,emailEnabled:Boolean(options.mailer),testMode:Boolean(options.testMode),plan:visitorPlan,usage:options.accounts.usage(subject,visitorPlan)});
       // Administration: an administrator's browser session or an admin-role ADMIN token; never an API key.
       if(path.startsWith('/v1/manage/')){
         let manager=account?.isAdmin&&!account.keyId?(account.email??account.id):null;
         if(!manager&&typeof authorization==='string'&&authorization.startsWith('Bearer ')&&!authorization.startsWith('Bearer nsk_')){const admin=auth.authenticate(authorization);if(admin?.role==='admin')manager='token:'+(admin.id??'legacy');}
         if(!manager)return send(account?403:401,{error:account?'Your account is not an administrator.':'Log in as an administrator.',code:account?'not_admin':'login_required'});
         req.manager=manager;
         if(req.method==='GET'){const result=handleManage({accounts:options.accounts,method:'GET',path,query:url.searchParams,actor:manager,testMode:options.testMode});return result?send(result.status,result.body):send(404,{error:'Not found'});}
       }
       // API keys are managed only from a signed-in browser session, never with an API key,
       // so a leaked key cannot mint or revoke keys.
       if(path==='/v1/account/usage'&&req.method==='GET'){
         if(!account)return send(401,{error:'Log in or use an API key to see account usage.',code:'login_required'});
         return send(200,options.accounts.usageReport(account.id,account.plan));
       }
       if(path==='/v1/account/keys'&&req.method==='GET'){
         const owner=options.accounts.sessionAccount(sessionToken);
         if(!owner)return send(401,{error:'Log in to manage API keys.',code:'login_required'});
         return send(200,{keys:options.accounts.listKeys(owner.id),limit:options.accounts.keyLimitFor(owner.plan)});
       }
       entitlement=options.accounts.reserve({method:req.method,path,account,subject});
     }catch(error){
       if(error instanceof PlanError)return send(error.status,{error:error.message,code:error.code,...error.details});
       throw error;
     }
     if(entitlement) {
       headers['X-Plan']=entitlement.plan;
       if(entitlement.metered){headers['X-Quota-Limit']=entitlement.limit===null?'unlimited':String(entitlement.limit);if(entitlement.limit!==null)headers['X-Quota-Remaining']=String(entitlement.remaining-1);headers['X-Quota-Reset']=entitlement.resetAt;}
       if(entitlement.metered)entitlement.keyId=account?.keyId??null;

     }
   }
   let actor=null;
   if(path.startsWith('/admin/')) {
    observability.stage(res,'identity');
    if(auth.mode==='disabled') return send(503,{error:'Admin disabled. Configure individual actors or ADMIN_TOKEN and restart.'});
    actor=auth.authenticate(req.headers.authorization);
    if(!actor)return send(401,{error:'Admin authorization required'});
    if(!canAccess(actor,req.method,path))return send(403,{error:'Your role cannot perform this action',code:'insufficient_role'});
   }
   observability.stage(res,'dispatch');
   if (['/v1/realtime/simulate','/v1/realtime/poll','/v1/realtime/subscriptions'].includes(path)) {
     actor=auth.authenticate(req.headers.authorization);
     if(!actor)return send(401,{error:'Admin authorization required'});
     if(actor.role!=='admin')return send(403,{error:'Administrator role required'});
     if(path==='/v1/realtime/simulate' && options.allowRealtimeSimulation!==true)return send(403,{error:'Simulation is disabled',code:'simulation_disabled'});
   }
   if(req.method==='GET') {
    if(handleAdminGet({actor,noIntentMetrics,observability,options,path,store,url,send}))return;
    if(path==='/health') return send(200,{status:'ok',mode:'research-pilot'});
    const catalog=handleCatalogRoute(req.method,path,url.searchParams);
    if(catalog)return send(catalog.status,catalog.body);
    if(handleToolGet({path,url:trackQuery(url,assumedInputs),send}))return;
    if(path==='/v1/kb/citations') {
      const text = url.searchParams.get('text') || 'Under IRPA s. 182 and RTA s. 120, statutory compliance is required.';
      const format = url.searchParams.get('format') || 'markdown';
      return send(200, {
        totalCitations: extractStatutoryCitations(text).length,
        citations: extractStatutoryCitations(text),
        linkifiedText: linkifyStatutoryCitations(text, format)
      });
    }
    if(path==='/v1/kb/expiry-audit') {
      const warningDays = url.searchParams.get('warningDays') ? Number(url.searchParams.get('warningDays')) : 14;
      return send(200, auditKbRecordExpiries(store.db, { warningDays }));
    }
    if(path==='/v1/kb/provenance-check') {
      const blocks = [
        createProvenanceBlock({ recordId: 'seed-genesis', data: { title: 'Genesis Ingestion' }, actor: 'system' })
      ];
      return send(200, verifyProvenanceChain(blocks));
    }
    if(path==='/v1/corridors') return send(200, { corridors: SUPPORTED_CORRIDORS });
    if(path==='/v1/realtime/gazettes') {
      const country = url.searchParams.get('country') || 'CA';
      const action = url.searchParams.get('action');
      if (action === 'corridor') {
        const origin = url.searchParams.get('origin') || 'IN';
        const dest = url.searchParams.get('destination') || 'CA';
        return send(200, syncCorridorMigrationRules({ originCountry: origin, destinationCountry: dest }));
      }
      if (action === 'translate') {
        const term = url.searchParams.get('term') || 'OVERTIME_PAY';
        const lang = url.searchParams.get('lang') || 'hi';
        return send(200, translatePolicyDelta({ termKey: term, targetLanguage: lang }));
      }
      return send(200, auditMultiCountryGazettes({ country }));
    }
    if(path==='/v1/glossary') {
      const term = url.searchParams.get('term');
      if (term) {
        const found = lookupStatutoryTerm(term);
        if (!found) return send(404, { error: 'Term not found in statutory glossary', term });
        return send(200, { term: found });
      }
      const category = url.searchParams.get('category');
      const country = url.searchParams.get('country');
      const search = url.searchParams.get('q');
      const terms = listAllGlossaryTerms({ category, country, search });
      return send(200, { totalTerms: terms.length, terms });
    }
    if(path.startsWith('/v1/i18n/languages')) return send(200, { languages: SUPPORTED_LANGUAGES });
    const i18nMatch = path.match(/^\/v1\/i18n\/([a-z0-9_-]{2,10})$/i);
    if(i18nMatch) return send(200, getLocalizedKit(i18nMatch[1]));
    if(path==='/v1/coverage') return send(200,{coverage:coverage(readPublicRecords())});
    if(path==='/v1/coverage/countries') return send(200, countryCoverage(readPublicRecords()));
    const cityDetail=path.match(/^\/v1\/coverage\/([A-Za-z]+)$/);
    if(cityDetail) {
      const name=cityDetail[1].charAt(0).toUpperCase()+cityDetail[1].slice(1).toLowerCase();
      if(!Object.hasOwn(cities,name))return send(404,{error:'Unknown pilot city',knownCities:Object.keys(cities)});
      return send(200,coverageDetail(name,readPublicRecords()));
    }
    if(path==='/v1/stats') {
      const records=readPublicRecords(),today=new Date().toISOString().slice(0,10);
      const pendingReview=records.filter(r=>r.status==='pending').length;
      return send(200,{asOf:today,cities:Object.keys(cities).length,topics:topics.length,records:records.length,pendingReview,englishOnly:true,
        nextExpiry:records.map(r=>r.expiresAt).sort()[0] ?? null,
        note:'Aggregate research-pilot footprint. No visitor data is involved.'});
    }
    if(path==='/v1/changes') {
      const records=readPublicRecords(),today=new Date().toISOString().slice(0,10),day=Date.parse(today),soon=86400000*7;
      const counts={total:records.length,
        expired:records.filter(r=>r.expiresAt<today).length,
        expiringSoon:records.filter(r=>r.expiresAt>=today&&Date.parse(r.expiresAt)-day<=soon).length,
        recentlyChecked:records.filter(r=>Date.parse(r.checkedAt)<=day&&day-Date.parse(r.checkedAt)<=soon).length,
        pendingReview:records.filter(r=>r.status==='pending').length};
      const items=records.map(r=>({id:r.id,title:r.title,topic:r.topic,jurisdiction:r.jurisdiction,status:r.status,checkedAt:r.checkedAt,expiresAt:r.expiresAt}))
        .sort((a,b)=>b.checkedAt.localeCompare(a.checkedAt)||b.id.localeCompare(a.id)).slice(0,12);
      return send(200,{language:'en',asOf:today,counts,items,note:'Aggregate evidence currency, no visitor data. Each item carries its own checked and expiry dates.'});
    }
    if(path==='/v1/agencies') return send(200,{language:'en',checkedAt:'2026-10-28',...agencies});
    if(path==='/v1/gaps') {
      const summary=store.gapWork.publicSummary();
      return send(200,{language:'en',asOf:new Date().toISOString().slice(0,10),...summary,
        note:'Aggregate counts of open unanswered-demand items. No question text, owner, note or identifier is public.'});
    }
    if(path==='/v1/changes.xml') {
      const items=readPublicRecords().map(r=>({id:r.id,title:r.title,topic:r.topic,status:r.status,checkedAt:r.checkedAt,expiresAt:r.expiresAt}))
        .sort((a,b)=>b.checkedAt.localeCompare(a.checkedAt)||b.id.localeCompare(a.id)).slice(0,12);
      const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
      const updated=items[0]?.checkedAt??new Date().toISOString().slice(0,10);
      const xml='<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n<title>Northstar evidence currency</title>\n<subtitle>Aggregate source-checked evidence currency for the settlement research pilot. No visitor data.</subtitle>\n<link rel="self" href="/v1/changes.xml"/>\n<updated>' + esc(updated) + '</updated>\n<id>/v1/changes.xml</id>\n' + items.map(i=>'<entry>\n<title>' + esc(i.title) + '</title>\n<id>' + esc(i.id) + '</id>\n<updated>' + esc(i.checkedAt) + '</updated>\n<summary>' + esc(i.status.replaceAll('_',' ') + ' Â· checked ' + i.checkedAt + ' Â· expires ' + i.expiresAt) + '</summary>\n</entry>\n').join('') + '</feed>';
      res.writeHead(200,{...headers,'Content-Type':'application/atom+xml; charset=utf-8'});
      return res.end(xml);
    }
    if(path==='/v1/topics') return send(200,{language:'en',languages:['en'],topics:topics.map(t=>({id:t,label:topicLabels[t]||t}))});
    if(path==='/v1/geography') return send(200, { version: GEOGRAPHY_VERSION, places: places.map(({ aliases, ...p }) => ({ ...p, path: placePath(p.id) })) });
    if(path==='/v1/meta') {
      const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url)));
      return send(200,{name:pkg.name,version:pkg.version,language:'en',mode:'research-preview'});
    }
    if(path==='/v1/realtime/updates') {
      const country = url.searchParams.get('country') || null;
      const region = url.searchParams.get('region') || null;
      const city = url.searchParams.get('city') || null;
      const topic = url.searchParams.get('topic') || null;
      const updates = store.realtime.findActiveAlerts({ country, region, city, topic });
      return send(200, {
        total: updates.length,
        updates
      });
    }
    if(path==='/v1/realtime/matrix') {
      const activeAlerts = store.realtime.findActiveAlerts({});
      return send(200, {
        destinations: MONITORED_DESTINATIONS,
        totalSources: REALTIME_SOURCES.length,
        activeAlertsCount: activeAlerts.length,
        sources: REALTIME_SOURCES.map(s => ({
          id: s.id,
          country: s.country,
          region: s.region,
          city: s.city,
          tier: s.tier,
          topic: s.topic,
          name: s.name,
          risk: s.risk,
          checkIntervalMinutes: s.checkIntervalMinutes
        }))
      });
    }
    if(path==='/v1/realtime/cron-stats') {
      return send(200, getCronStats(store.db));
    }
    if(path==='/v1/realtime/feed.xml') {
      const alerts = store.realtime?.findActiveAlerts ? store.realtime.findActiveAlerts({}) : [];
      const esc = s => String(s || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
      const updated = alerts[0]?.effective_date ?? new Date().toISOString().slice(0,10);
      const xml = '<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n<title>Northstar Real-Time Policy &amp; Settlement Alerts</title>\n<subtitle>Automated statutory policy changes and city regulatory updates across destination countries.</subtitle>\n<link rel="self" href="/v1/realtime/feed.xml"/>\n<updated>' + esc(updated) + '</updated>\n<id>/v1/realtime/feed.xml</id>\n' + alerts.map(a => '<entry>\n<title>' + esc(a.title) + '</title>\n<id>alert:' + esc(a.id) + '</id>\n<updated>' + esc(a.created_at || a.effective_date) + '</updated>\n<summary>' + esc('[' + (a.country || 'CA') + (a.city ? ' / ' + a.city : '') + '] ' + (a.summary || a.statutory_rule || '')) + '</summary>\n</entry>\n').join('') + '</feed>';
      res.writeHead(200,{...headers,'Content-Type':'application/atom+xml; charset=utf-8'});
      return res.end(xml);
    }
    if(path==='/v1/metrics') {
      if(!metricsAuthorized(req))return send(401,{error:'Metrics authorization required',code:'metrics_unauthorized'});
      return send(200, { prometheus: formatPrometheusMetrics(observability.snapshot()) });
    }
    if(path==='/metrics') {
      if(!metricsAuthorized(req))return send(401,{error:'Metrics authorization required',code:'metrics_unauthorized'});
      res.writeHead(200, { ...headers, 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' });
      return res.end(formatPrometheusMetrics(observability.snapshot()));
    }
    if(path==='/v1/meta/sri') {
      const publicDir = fileURLToPath(new URL('../public', import.meta.url));
      return send(200, { sri: generateSriManifest(publicDir) });
    }
    if(path==='/v1/realtime/subscriptions') {
      const country = url.searchParams.get('country') || 'CA';
      const city = url.searchParams.get('city') || null;
      const topic = url.searchParams.get('topic') || null;
      return send(200, { subscriptions: subscriptionManager.listActiveSubscriptions({ country, city, topic }) });
    }

    // --- Multilingual, Regional Locales & Community Ledger Endpoints ---
    const localeMatch = path.match(/^\/v1\/locales\/([a-z]{2})$/);
    if(localeMatch) {
      return send(200, { locale: localeMatch[1], dictionary: getLocaleDictionary(localeMatch[1]), supported: getSupportedLocales() });
    }
    if(path==='/v1/locales') {
      return send(200, { supported: getSupportedLocales() });
    }

    if(path==='/v1/glossary/multilingual/categories') {
      return send(200, { categories: getGlossaryCategories() });
    }
    const termMatch = path.match(/^\/v1\/glossary\/multilingual\/([a-zA-Z0-9_-]+)$/);
    if(termMatch && termMatch[1] !== 'categories') {
      const term = getGlossaryTerm(termMatch[1]);
      if (!term) return send(404, { error: 'Term not found' });
      return send(200, { term });
    }
    if(path==='/v1/glossary/multilingual') {
      const q = url.searchParams.get('q') || '';
      const category = url.searchParams.get('category') || null;
      const lang = url.searchParams.get('lang') || 'en';
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      return send(200, searchGlossary({ query: q, category, lang, limit, offset }));
    }

    if(path==='/v1/translations/community') {
      const status = url.searchParams.get('status') || null;
      const locale = url.searchParams.get('locale') || null;
      const termOrRecordId = url.searchParams.get('recordId') || null;
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      return send(200, translations.listPublicTranslations({ status, locale, termOrRecordId, limit, offset }));
    }

    if(path==='/v1/phrasebook/airport/categories') {
      return send(200, { categories: getAirportCategories() });
    }
    const phraseMatch = path.match(/^\/v1\/phrasebook\/airport\/([a-zA-Z0-9_-]+)$/);
    if(phraseMatch && phraseMatch[1] !== 'categories') {
      const phrase = getAirportPhraseById(phraseMatch[1]);
      if (!phrase) return send(404, { error: 'Phrase not found' });
      return send(200, { phrase });
    }
    if(path==='/v1/phrasebook/airport') {
      const category = url.searchParams.get('category') || null;
      const q = url.searchParams.get('q') || '';
      const lang = url.searchParams.get('lang') || 'en';
      return send(200, { phrases: getAirportPhrases({ category, query: q, lang }) });
    }

    if(path==='/v1/speech/profiles') {
      return send(200, { profiles: getAvailableSpeechProfiles() });
    }

    const files={'/':'index.html','/offline.html':'offline.html','/offline.css':'offline.css','/app.js':'app.js','/editorial.js':'editorial.js','/admin-permissions.js':'admin-permissions.js','/gap-work.js':'gap-work.js','/clarification.js':'clarification.js','/errors.js':'errors.js','/answer-view.js':'answer-view.js','/styles.css':'styles.css','/favicon.svg':'favicon.svg','/manifest.json':'manifest.json','/sw.js':'sw.js','/immigration-workspace.js':'immigration-workspace.js','/immigration-workspace-ui.js':'immigration-workspace-ui.js','/app-lifecycle.js':'app-lifecycle.js','/csp-styles.js':'csp-styles.js','/plan-access.js':'plan-access.js','/manage':'manage.html','/manage.js':'manage.js','/manage.css':'manage.css','/tool-modal.js':'tool-modal.js','/tool-modal.css':'tool-modal.css','/inline-styles.css':'inline-styles.css','/explorer.html':'explorer.html','/explorer.css':'explorer.css','/explorer.js':'explorer.js',...APP_MODULE_ROUTES};
    if(Object.hasOwn(files,path)) {
     headers['Content-Type']=path.endsWith('.js')?'text/javascript; charset=utf-8':path.endsWith('.css')?'text/css; charset=utf-8':path.endsWith('.svg')?'image/svg+xml':path.endsWith('.json')?'application/manifest+json; charset=utf-8':'text/html; charset=utf-8';
     let body=await readFile(new URL('../public/' + files[path],import.meta.url));
     const etag='"static-' + createHash('sha256').update(body).digest('hex').slice(0,20) + '"';
     if(req.headers['if-none-match']===etag){res.writeHead(304,{...headers,'ETag':etag,'Cache-Control':'no-cache'});return res.end();}

     headers['Vary'] = 'Accept-Encoding';
     const acceptEncoding = req.headers['accept-encoding'] || '';
     if (body.length > 512) {
       if (acceptEncoding.includes('br')) {
         headers['Content-Encoding'] = 'br';
         const key=etag+':br';
         if(!encodedAssets.has(key)){setEncodedAsset(key,compressBrotli(body));}
         try{body=await encodedAssets.get(key);}catch(error){encodedAssets.delete(key);throw error;}
       } else if (acceptEncoding.includes('gzip')) {
         headers['Content-Encoding'] = 'gzip';
         const key=etag+':gzip';
         if(!encodedAssets.has(key)){setEncodedAsset(key,compressGzip(body));}
         try{body=await encodedAssets.get(key);}catch(error){encodedAssets.delete(key);throw error;}
       }
     }
     res.writeHead(200,{...headers,'ETag':etag,'Cache-Control':'no-cache'});return res.end(body);
    }
   }
   if(req.method==='POST') {
    if(req.headers['content-type']?.split(';')[0].trim().toLowerCase()!=='application/json') return send(415,{error:'Use application/json'});
    const body=await readRequestBody(req,{timeoutMs:bodyTimeoutMs});
    let raw;try{raw=new TextDecoder('utf-8',{fatal:true}).decode(body);}catch{return send(400,{error:'Invalid UTF-8 request'});}
    let input;try {input=JSON.parse(raw);}catch{return send(400,{error:'Invalid JSON'});}
    if(!input || typeof input!=='object' || Array.isArray(input)) return send(400,{error:'JSON object required'});
    assertFiniteInput(input);
    if(isToolRequest){normalizeToolInput(input);applyFormAliases(path,input);}
    if(options.accounts&&req.manager&&path.startsWith('/v1/manage/')){
      try{const result=handleManage({accounts:options.accounts,method:'POST',path,query:url.searchParams,input,actor:req.manager,testMode:options.testMode});return result?send(result.status,result.body):send(404,{error:'Not found'});}
      catch(error){if(error instanceof PlanError)return send(error.status,{error:error.message,code:error.code,...error.details});throw error;}
    }
    // Customer sign-up and login (SaaS mode). Sessions use an HttpOnly, SameSite=Strict cookie;
    // cross-origin requests were already refused above.
    if(options.accounts&&['/v1/auth/signup','/v1/auth/login','/v1/auth/logout','/v1/auth/password','/v1/auth/verify','/v1/auth/verify/resend','/v1/auth/reset/request','/v1/auth/reset/confirm','/v1/account/keys','/v1/account/keys/revoke'].includes(path)) {
      try {
        if(path==='/v1/auth/logout'){options.accounts.logOut(sessionToken);headers['Set-Cookie']=sessionCookie('',0);return send(200,{loggedOut:true});}
        if(path==='/v1/auth/password'){await options.accounts.changePasswordAsync(sessionToken,input.currentPassword,input.newPassword);return send(200,{passwordChanged:true});}
        if(path==='/v1/auth/verify'){options.accounts.verifyEmail(input.token);return send(200,{emailVerified:true});}
        if(path==='/v1/account/keys'||path==='/v1/account/keys/revoke'){
          const owner=options.accounts.sessionAccount(sessionToken);
          if(!owner)return send(401,{error:'Log in to manage API keys.',code:'login_required'});
          if(path==='/v1/account/keys/revoke')return options.accounts.revokeKey(owner.id,input.id)?send(200,{revoked:true}):send(404,{error:'No active key with that id on your account.',code:'key_not_found'});
          // When email is configured, confirm it before issuing keys.
          if(options.mailer&&!owner.emailVerified)return send(403,{error:'Confirm your email before creating API keys.',code:'email_not_verified'});
          const key=options.accounts.issueKey(owner.id,typeof input.label==='string'?input.label:null);
          return send(201,{apiKey:key,keys:options.accounts.listKeys(owner.id),notice:'Copy this key now. It will not be shown again.'});
        }
        if(path==='/v1/auth/verify/resend'){
          const {account:who,token}=options.accounts.newVerifyToken(sessionToken);
          if(who.emailVerified)return send(200,{status:'already_verified'});
          return send(202,{status:token&&sendAccountEmail(who.email,'verify',token)?'sent':'not_sent',message:token?(options.mailer?'Check your inbox for a new confirmation link.':'Email is not configured on this server.'):'You asked for several links recently. Try again in an hour.'});
        }
        if(path==='/v1/auth/reset/request'){
          // Same answer whether or not the email has an account.
          const reset=options.accounts.requestPasswordReset(input.email);
          if(reset)sendAccountEmail(reset.email,'reset',reset.token);
          return send(202,{status:'accepted',message:'If an account exists for that email, a reset link is on its way. It expires in '+RESET_MINUTES+' minutes.'});
        }
        if(path==='/v1/auth/reset/confirm'){await options.accounts.resetPasswordWithTokenAsync(input.token,input.newPassword);headers['Set-Cookie']=sessionCookie('',0);return send(200,{passwordReset:true});}
        const result=path==='/v1/auth/signup'?await options.accounts.signUpAsync(input):await options.accounts.logInAsync(input);
        if(path==='/v1/auth/signup')sendAccountEmail(result.account.email,'verify',result.verifyToken);
        headers['Set-Cookie']=sessionCookie(result.sessionToken,options.accounts.sessionMaxAgeSeconds);
        const a=result.account;
        return send(path==='/v1/auth/signup'?201:200,{account:{id:a.id,name:a.name,plan:a.plan,email:a.email,emailVerified:Boolean(a.emailVerified)}});
      }catch(error){
        if(error instanceof PlanError)return send(error.status,{error:error.message,code:error.code});
        throw error;
      }
    }
    if(actor){
      actor=auth.authenticate(req.headers.authorization);
      if(!actor)return send(401,{error:'Admin authorization required'});
      if(!canAccess(actor,req.method,path))return send(403,{error:'Your role cannot perform this action',code:'insufficient_role'});
    }
    if(actor?.mode==='individual')input={...input,reviewer:actor.id,actor:actor.id};
    if(handleAdminPost({actor,input,options,path,store,translations,send}))return;
    if(path==='/v1/questions/parse') return send(200,parse(input));

    // Multilingual & Community Ledger POST Endpoints (Rec 126 & Rec 131)
    if(path==='/v1/citations/bilingual') {
      return send(200, generateBilingualView(input));
    }
    if(path==='/v1/translations/community/submit') {
      const result = translations.submitTranslationSuggestion(input);
      return send(201, { success: true, translation: result });
    }
    if(path==='/v1/realtime/simulate') {
      const sourceId = input.sourceId || 'ca-bc-vancouver-tenant-services';
      const source = REALTIME_SOURCES.find(s => s.id === sourceId) || REALTIME_SOURCES[0];
      const todayIso = new Date().toISOString().slice(0, 10);
      const simulatedContent = input.content || `${source.name} official announcement on ${todayIso}. New regulations and updated conditions apply to all newcomer applications.`;
      const extracted = extractPolicyDelta({
        source,
        content: simulatedContent,
        delta: { changed: true, changeType: 'simulated_policy_update' },
        simulatedInput: {
          headline: input.headline || `${source.name} Policy Update`,
          summary: input.summary || `Official update regarding ${source.subTopic.replace(/_/g, ' ')}.`,
          quote: input.quote || simulatedContent.slice(0, 120),
          risk: input.risk || source.risk || 'high',
          effectiveFrom: input.effectiveFrom || todayIso
        }
      });
      const ingested = await store.realtime.ingestPolicyUpdate(extracted);
      return send(200, {
        message: 'Simulated real-time update ingested successfully',
        sourceId: source.id,
        alertId: ingested.alertId,
        recordId: ingested.recordId,
        risk: ingested.risk,
        status: ingested.status,
        liveAlert: extracted.liveAlert
      });
    }
    if(path==='/v1/realtime/poll') {
      const filterCountry = input.country || null;
      const filterCity = input.city || null;
      const sourcesToPoll = queryRealtimeSources({ country: filterCountry, city: filterCity });
      const crawlResult = await runCronCycle({store,sources:sourcesToPoll});
      return send(200, {
        polled: crawlResult.totalSources,
        changed: crawlResult.changedSources,
        status: crawlResult.status,
        failed: crawlResult.failedSources,
        blocked: crawlResult.blockedSources,
        details: crawlResult.results.map(r => ({
          sourceId: r.sourceId,
          status: r.status,
          changed: r.changed,
          checkedAt: r.checkedAt
        }))
      });
    }
    if(handleToolPost({input:trackBody(input,assumedInputs),path,send}))return;
    if(path==='/v1/realtime/subscriptions') {
      if(input.action==='cancel')return send(200,{cancelled:subscriptionManager.cancel(input.subscriptionId)});
      return send(200, subscriptionManager.subscribe(input));
    }
    if(path==='/v1/kb/classify-policy') {
      const classification = classifyPolicySeverity(input || {});
      let hierarchyConflict = null;
      if (input?.federalRule && input?.provincialRule) {
        hierarchyConflict = auditStatutoryHierarchyConflict(input);
      }
      return send(200, {
        evaluatedAt: new Date().toISOString(),
        classification,
        hierarchyConflict
      });
    }
    if(path==='/v1/realtime/gazettes') {
      
      if (input.action === 'corridor') {
        return send(200, syncCorridorMigrationRules({ originCountry: input.originCountry, destinationCountry: input.destinationCountry }));
      }
      if (input.action === 'translate') {
        return send(200, translatePolicyDelta({ termKey: input.termKey, targetLanguage: input.targetLanguage }));
      }
      return send(200, auditMultiCountryGazettes(input));
    }
    if(path==='/v1/query/deconstruct') {
      const q = input?.question || input?.query || input?.text || '';
      return send(200, { success: true, ...deconstructNarrative(q) });
    }
    if(path==='/v1/query/normalize') {
      const q = input?.question || input?.query || input?.text || '';
      const fluffCleaned = cleanEmotionalFluff(q);
      const normalized = normalizeSlangAndTypos(fluffCleaned);
      const myth = detectLegalMyth(q) || detectLegalMyth(normalized);
      return send(200, { success: true, original: q, normalized, myth });
    }
    if(path==='/v1/query/narrative-crisis') {
      const q = input?.question || input?.query || input?.text || '';
      return send(200, { success: true, match: resolveNarrativeCrisis(q, input) });
    }
    if(path==='/v1/retrieval/search') return send(200,{results:retrieve(parse(input),readPublicRecords(),new Date(),options.searchIndex).filter(r=>r.available)});
    if(path==='/v1/answers') {
      let context=null;
      if(input && Object.hasOwn(input,'previousContext')) ({input,context}=resolveConversationTurn(input,new Date()));
      const multilingualAudit = detectAndTranslateMultilingualQuery(input?.question);
      if(multilingualAudit && !multilingualAudit.requiresConfirmation && multilingualAudit.canonicalStatutoryQuery) {
        input = { ...input, question: multilingualAudit.canonicalStatutoryQuery };
      }
      observability.stage(res,'read_evidence');
      const {records:initial,version}=evidenceSnapshot();
      const requestController=new AbortController();
      const disconnected=()=>{if(!res.writableFinished)requestController.abort();};
      res.once('close',disconnected);
      if(res.destroyed)requestController.abort();
      let result;
      observability.stage(res,'generate_answer');
      try{result=await verifiedAnswer(input,initial,new Date(),{signal:requestController.signal,realtimeStore:store.realtime,evidenceVersion:version});}
      finally{res.off('close',disconnected);}
      if(requestController.signal.aborted||res.destroyed)return;
      observability.stage(res,'refresh_evidence');
      const {records:latest,version:latestVersion}=evidenceSnapshot();
      if(version!==latestVersion) {
        const fresh=answer(input,latest,new Date(),options.searchIndex,{realtimeStore:store.realtime});
        result={...fresh,ai:{status:'knowledge_changed'},presentation:composePresentation(fresh)};
      }
      if(context)result={...result,context};
      if(multilingualAudit)result={...result,multilingual:multilingualAudit};
      if(result.gaps.some(g=>g.reason==='unrecognized_intent')) {
        noIntentMetrics.total++;
        const day=new Date().toISOString().slice(0,10);
        noIntentMetrics.days.set(day,(noIntentMetrics.days.get(day)||0)+1);
      }
      observability.stage(res,'persist_answer');
      store.log(result);return send(200,result);
    }
    if(path==='/v1/feedback') {store.feedback(input.traceId,input.issue);return send(201,{saved:true});}
   }
   send(404,{error:'Not found',known:['/health','/ready','/v1/coverage','/v1/coverage/:city','/v1/topics','/v1/geography','/v1/meta','/v1/stats','/v1/changes','/v1/changes.xml','/v1/agencies','/v1/gaps','/v1/answers (POST)','/v1/feedback (POST)','/admin/* (token required)']});
  } catch(e) {
    observability.failure(res,e);
    if(res.destroyed||res.writableEnded)return;
    if(e instanceof RequestBodyError){headers['Connection']='close';return send(e.status,{error:e.message,code:e.code});}
    if(e instanceof AdminConfigUnavailable)return send(503,{error:'Admin identity configuration unavailable',code:'identity_unavailable'});
    if(e instanceof ToolInputError)return send(400,{error:e.message,code:e.code});
    const failure=errorResponse(e);if(failure.body.code==='storage_busy')headers['Retry-After']='1';send(failure.status,failure.body);
  }
 });
 server.requestTimeout=15000;
 server.beginDrain=()=>{draining=true;};
 return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 assertTestModeAllowed();
 validateProductionAccounts();
 const actors=actorsFromEnvironment();
 const actorsFile=process.env.ADMIN_ACTORS_FILE;
 if(actorsFile&&actors!==undefined)throw new Error('Choose ADMIN_ACTORS_FILE or ADMIN_ACTORS_JSON');
 if(actorsFile)createFileAdminAuth(actorsFile);
 const origin=publicOrigin(process.env.PUBLIC_ORIGIN);
 const trustedProxyIps=proxyAddressesFromEnvironment();
 let quotaStore;
 if(process.env.RATE_LIMIT_DB_PATH) {
   if(!/^[a-fA-F0-9]{64}$/.test(process.env.RATE_LIMIT_KEY??''))throw new Error('RATE_LIMIT_KEY must contain 64 hexadecimal characters');
   const quotaKey=Buffer.from(process.env.RATE_LIMIT_KEY,'hex');
   try {quotaStore=openSharedRateLimits(process.env.RATE_LIMIT_DB_PATH,{key:quotaKey});}finally{quotaKey.fill(0);}
 }
  const answerCacheEntries=Number(process.env.ANSWER_CACHE_ENTRIES??0);
  if(!Number.isInteger(answerCacheEntries)||answerCacheEntries<0||answerCacheEntries>1000)throw new Error('ANSWER_CACHE_ENTRIES must be 0-1000');
  const metricsToken=process.env.METRICS_TOKEN;
  if(metricsToken!==undefined&&(typeof metricsToken!=='string'||metricsToken.length<24))throw new Error('METRICS_TOKEN must be at least 24 characters when set');
 createAdminAuth({actors,legacyToken:process.env.ADMIN_TOKEN});
 let jobQueue;
 if(process.env.ADMIN_JOB_DB_PATH) {
   // Validate an existing queue before opening it for administrative writes.
   // Never create a queue implicitly from an HTTP-server configuration typo.
   try {
     const check=openJobQueue(process.env.ADMIN_JOB_DB_PATH,{readOnly:true});
     try {check.list({limit:1});check.schedules();}finally{check.close();}
     jobQueue=openJobQueue(process.env.ADMIN_JOB_DB_PATH);
     jobQueue.checkReady();
   }catch{jobQueue?.close();throw new Error('Configured admin job database is unavailable');}
 }
 let accounts,mailer;
 if(process.env.ACCOUNTS_DB_PATH) {
   mailer=mailerFromEnvironment(process.env,{onError:error=>console.error('Account email was not delivered: '+error.message)});
   if(mailer?.provider==='console')console.error('EMAIL_PROVIDER=console prints account links to this log. Use it for development only.');
   // ACCOUNTS_SECRET (64 hex) keeps anonymous Free-plan metering stable across restarts.
   const secret=/^[a-fA-F0-9]{64}$/.test(process.env.ACCOUNTS_SECRET??'')?Buffer.from(process.env.ACCOUNTS_SECRET,'hex'):undefined;
   if(!secret)console.error('ACCOUNTS_SECRET not set: anonymous Free-plan usage resets when the server restarts.');
   accounts=openAccounts(process.env.ACCOUNTS_DB_PATH,{secret});
 }
 // Testing mode: a public demo administrator, signed in automatically by the web app.
 // Only on a loopback listener and never with NODE_ENV=production (assertTestModeAllowed); the password is reset at every start.
 let testMode;
 if(process.env.TEST_MODE==='1') {
   if(!accounts)throw new Error('TEST_MODE=1 needs ACCOUNTS_DB_PATH (npm run start:test sets it)');
   testMode={email:process.env.TEST_MODE_EMAIL||'demo@northstar.test',password:process.env.TEST_MODE_PASSWORD||'Northstar-Test-2026'};
   accounts.ensureAccount({...testMode,name:'Demo administrator',plan:'free',isAdmin:true});
   console.error('TESTING MODE: demo administrator '+testMode.email+' / '+testMode.password+' is public and signs in automatically. Do not use real data.');
 }
 let searchIndex;
 if(process.env.SEARCH_INDEX_PATH){try{searchIndex=openEvidenceIndex(process.env.SEARCH_INDEX_PATH,{readOnly:true});}catch{console.error('Search index unavailable; lexical fallback enabled.');}}
 if(seedDatabaseFromSnapshot(databasePath(),process.env.SEED_DB_PATH))console.log('Evidence database seeded from release snapshot.');
 const store=openStore(databasePath());store.purge();
 if(!store.records().some(r=>r.status==='approved'))console.error('Evidence database has no approved records: only built-in research seeds will be served. Set SEED_DB_PATH or restore a backup.');
 let metricsStore;
 if(process.env.RUNTIME_METRICS_PATH)metricsStore=openRuntimeMetrics(process.env.RUNTIME_METRICS_PATH);
 accounts?.purgeExpired();
 const timer=setInterval(()=>{try{store.purge();accounts?.purgeExpired();}catch(error){console.error('Retention maintenance failed:',error.message);}},3600000);timer.unref();
 // Policy lint at boot: summarize drift compactly without blocking startup.
 // Hard assertions already enforce correctness at write time; this audit exists
 // so a human sees pending review states and expiring evidence first.
 const policyReport=lintEvidence(store.ingestion.sources(),store.records());
 const byCode={};for(const w of policyReport.warnings)byCode[w.code]=(byCode[w.code]||0)+1;
 console.log('policy-lint:',Object.keys(byCode).length?JSON.stringify(byCode):'no warnings');
 const runtimeLogger=createStreamLogger(process.stderr);
  const server=createApp(store,process.env.ADMIN_TOKEN,aiRouterOptions(),{actors,actorsFile,searchIndex,jobQueue,accounts,mailer,testMode,trustedProxyIps,metricsStore,quotaStore,answerCacheEntries,metricsToken,publicOrigin:origin,logger:event=>runtimeLogger.log(event)});
 const shutdown=createShutdown(server,{cleanup:()=>{clearInterval(timer);accounts?.close();quotaStore?.close();metricsStore?.close();jobQueue?.close();searchIndex?.close();store.db.close();}});
 const onSignal=()=>{shutdown().catch(()=>{console.error('Shutdown failed');process.exitCode=1;});};
 process.on('SIGINT',onSignal);process.on('SIGTERM',onSignal);
 server.once('close',()=>{process.off('SIGINT',onSignal);process.off('SIGTERM',onSignal);});
 server.listen(Number(process.env.PORT || 3000),process.env.HOST || '127.0.0.1',()=>{console.log('Settlement pilot listening on port '+server.address().port);process.send?.('ready');});
}
