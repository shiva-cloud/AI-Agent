/**
 * Autonomous Real-Time Cron Job Engine
 * 
 * 100% self-contained. ZERO dependency on OpenAI or external paid APIs.
 * Runs on a scheduled recurring loop:
 * - Scrapes official municipal & national immigration portals directly
 * - Cleans HTML and calculates SHA-256 AST content hashes
 * - Detects numeric, rule condition, and date shifts ("प्रॉपर तरीके से जांच")
 * - Validates evidence schema and quote authenticity against live source text
 * - Automatically ingests verified updates into the Knowledge Base (KB)
 * - Instantly purges stale answer cache so users get fresh data in chat
 */

import {configureCrawlPolicy,isCrawlPermitted} from './crawl-policy.js';
import { setTimeout as delay } from 'node:timers/promises';
import {randomUUID} from 'node:crypto';
import { REALTIME_SOURCES } from './realtime-registry.js';
import { pollSource } from './realtime-crawler.js';
import { extractPolicyDelta } from './realtime-extractor.js';

export function configureCronTables(db) {
  configureCrawlPolicy(db);
  db.exec('CREATE TABLE IF NOT EXISTS cron_worker_leases(worker_id TEXT PRIMARY KEY, expires_at INTEGER NOT NULL)');
  db.exec(`
    CREATE TABLE IF NOT EXISTS crawl_snapshots (
      source_id TEXT PRIMARY KEY,
      hash TEXT NOT NULL,
      etag TEXT,
      last_modified TEXT,
      content_sample TEXT,
      last_checked_at TEXT NOT NULL,
      last_changed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cron_crawl_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      duration_ms REAL NOT NULL,
      total_sources INTEGER NOT NULL,
      changed_sources INTEGER NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT
    );
  `);
  if(!db.prepare('PRAGMA table_info(crawl_snapshots)').all().some(c=>c.name==='content'))db.exec('ALTER TABLE crawl_snapshots ADD COLUMN content TEXT');
}

/**
 * Runs a single crawl & verification cycle across all registered city and national sources
 */
export async function runCronCycle({ store, answerCache = null, fetcher = null, sources = REALTIME_SOURCES, signal } = {}) {
  const startedAt=new Date().toISOString(),started=performance.now(),db=store.db;
  configureCronTables(db);
  const results=[];let changedSources=0,failedSources=0,blockedSources=0;
  for(const source of sources) {
    if(signal?.aborted)break;
    try {
      if(!isCrawlPermitted(db,source)){blockedSources++;results.push({sourceId:source.id,status:'policy_blocked',changed:false});continue;}
      const old=db.prepare('SELECT * FROM crawl_snapshots WHERE source_id=?').get(source.id);
      // Legacy samples cannot reconstruct a complete baseline: force a full fetch.
      const previous=old?.content?{hash:old.hash,etag:old.etag,lastModified:old.last_modified,content:old.content}:null;
      const result=await pollSource(source,previous,{fetcher,signal});
      results.push(result);
      if(!['content_changed','content_identical','unchanged_304'].includes(result.status)){failedSources++;continue;}
      if(result.changed){
        if(!store.realtime)throw new Error('Realtime ingestion unavailable');
        await store.realtime.ingestPolicyUpdate(extractPolicyDelta({source,content:result.content,delta:result.delta}));
        changedSources++;
      }
      const at=new Date().toISOString();
      db.prepare(`INSERT INTO crawl_snapshots(source_id,hash,etag,last_modified,content_sample,last_checked_at,last_changed_at,content) VALUES (?,?,?,?,?,?,?,?)
        ON CONFLICT(source_id) DO UPDATE SET hash=excluded.hash,etag=excluded.etag,last_modified=excluded.last_modified,content_sample=excluded.content_sample,last_checked_at=excluded.last_checked_at,last_changed_at=excluded.last_changed_at,content=excluded.content`).run(source.id,result.hash,result.etag||old?.etag||null,result.lastModified||old?.last_modified||null,(result.content||old?.content||'').slice(0,500),at,result.changed?at:old?.last_changed_at||at,result.content??old?.content??null);
    }catch{failedSources++;results.push({sourceId:source.id,status:'ingestion_failed',changed:false});}
  }
  if(changedSources)answerCache?.clear?.();
  const status=signal?.aborted?'cancelled':failedSources?'partial_failure':blockedSources?'policy_blocked':'success';
  const finishedAt=new Date().toISOString(),durationMs=performance.now()-started;
  db.prepare('INSERT INTO cron_crawl_logs(started_at,finished_at,duration_ms,total_sources,changed_sources,status) VALUES (?,?,?,?,?,?)').run(startedAt,finishedAt,durationMs,sources.length,changedSources,status);
  return {success:status==='success',status,startedAt,finishedAt,durationMs,totalSources:sources.length,changedSources,failedSources,blockedSources,results};
}

/**
 * Starts the autonomous cron worker loop in the background
 */
export async function startCronWorker({ store, intervalMs = 60000, signal, answerCache = null, fetcher = null, sources = REALTIME_SOURCES } = {}) {
  if (!signal || typeof signal.addEventListener !== 'function') {
    throw new Error('A shutdown AbortSignal is required to run the cron worker');
  }

  if(!Number.isInteger(intervalMs)||intervalMs<10||intervalMs>2147483647)throw new Error('Invalid polling interval');
  configureCronTables(store.db);
  const workerId=randomUUID();
  const heartbeat=()=>store.db.prepare('INSERT INTO cron_worker_leases VALUES (?,?) ON CONFLICT(worker_id) DO UPDATE SET expires_at=excluded.expires_at').run(workerId,Date.now()+60000);
  heartbeat();
  const heartbeatTimer=setInterval(()=>{try{heartbeat();}catch{/* A failed heartbeat expires rather than reporting stale health. */}},15000);
  heartbeatTimer.unref();
  try {
  // Initial immediate run on start
  if (!signal.aborted) {
    try {
      await runCronCycle({ store, answerCache, fetcher, sources, signal });
    } catch (err) {
      if (!signal.aborted) console.error('[Cron Worker] Initial cycle error:', err.message);
    }
  }

  // Recurring loop
  while (!signal.aborted) {
    try {
      await delay(intervalMs, undefined, { signal });
    } catch (err) {
      if (signal.aborted) break;
      throw err;
    }

    if (signal.aborted) break;

    try {
      await runCronCycle({ store, answerCache, fetcher, sources, signal });
    } catch (err) {
      if (!signal.aborted) console.error('[Cron Worker] Scheduled cycle error:', err.message);
    }
  }
  } finally {
    clearInterval(heartbeatTimer);
    store.db.prepare('DELETE FROM cron_worker_leases WHERE worker_id=?').run(workerId);
  }
}

/**
 * Returns summary metrics of the cron jobs
 */
export function getCronStats(db) {
  configureCronTables(db);
  const totalSnapshots = db.prepare('SELECT count(*) as count FROM crawl_snapshots').get()?.count || 0;
  const recentLogs = db.prepare('SELECT * FROM cron_crawl_logs ORDER BY id DESC LIMIT 10').all();
  const lastLog = recentLogs[0] || null;

  return {
    autonomousCronActive: Boolean(db.prepare('SELECT 1 FROM cron_worker_leases WHERE expires_at>? LIMIT 1').get(Date.now())),
    totalMonitoredSources: REALTIME_SOURCES.length,
    trackedSnapshots: totalSnapshots,
    lastRunAt: lastLog?.started_at || null,
    lastDurationMs: lastLog?.duration_ms || null,
    lastStatus: lastLog?.status || 'idle',
    recentLogs
  };
}
