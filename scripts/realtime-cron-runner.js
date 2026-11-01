#!/usr/bin/env node
/**
 * Standalone Real-Time Cron Job Runner
 * 
 * 100% Native Node.js — ZERO OpenAI API Requirement.
 * 
 * Usage:
 *   node scripts/realtime-cron-runner.js --once
 *   node scripts/realtime-cron-runner.js --daemon --interval 60000
 */

import { openStore } from '../src/store.js';
import { databasePath } from '../src/runtime-config.js';
import { runCronCycle, startCronWorker, getCronStats } from '../src/realtime-cron.js';

const isOnce = process.argv.includes('--once');
const isDaemon = process.argv.includes('--daemon');
const intervalIdx = process.argv.indexOf('--interval');
const intervalMs = intervalIdx !== -1 && process.argv[intervalIdx + 1] ? Number(process.argv[intervalIdx + 1]) : 60000;

const store = openStore(databasePath());

console.log(`[Autonomous Cron] Initializing Native Web Scraper & Ingestion Worker...`);
console.log(`[Autonomous Cron] Mode: ${isOnce ? 'Single Run (--once)' : `Daemon Loop (Every ${intervalMs / 1000}s)`}`);
console.log(`[Autonomous Cron] AI Dependency: NONE (100% Deterministic AST & Regex Validation)`);

if (isOnce || !isDaemon) {
  try {
    const summary = await runCronCycle({ store });
    console.log(`[Autonomous Cron] Run Complete:`);
    console.log(`  - Total Sources Checked: ${summary.totalSources}`);
    console.log(`  - Sources With Verified Changes: ${summary.changedSources}`);
    console.log(`  - Duration: ${summary.durationMs}ms`);
    console.log(`  - Status: ${summary.success ? 'SUCCESS' : 'FAILED'}`);
    process.exitCode = summary.success ? 0 : 1;
  } catch (err) {
    console.error(`[Autonomous Cron] Error:`, err.message);
    process.exitCode = 1;
  } finally {
    store.db.close();
  }
} else {
  const controller = new AbortController();
  const onSignal = () => {
    console.log(`\n[Autonomous Cron] Shutting down gracefully...`);
    controller.abort();

  };

  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);

  console.log(`[Autonomous Cron] Starting background scheduled worker. Press Ctrl+C to stop.`);
  try { await startCronWorker({ store, intervalMs, signal: controller.signal }); } finally { store.db.close(); }
}
