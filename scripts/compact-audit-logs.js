#!/usr/bin/env node
// scripts/compact-audit-logs.js
// Maintenance utility for rolling compaction and vacuuming of Northstar SQLite store.
// Prunes ephemeral traces, gaps, and feedback older than the retention threshold (default 90 days).
// Optionally runs SQLite VACUUM to reclaim free pages and shrink on-disk database size.

import { openStore } from '../src/store.js';
import { databasePath } from '../src/runtime-config.js';

function parseArgs() {
  const args = process.argv.slice(2);
  let retentionDays = 90;
  let vacuum = false;

  for (const arg of args) {
    if (arg.startsWith('--days=')) {
      retentionDays = parseInt(arg.split('=')[1], 10) || 90;
    } else if (arg === '--vacuum') {
      vacuum = true;
    }
  }
  return { retentionDays, vacuum };
}

async function main() {
  const { retentionDays, vacuum } = parseArgs();
  const dbPath = databasePath();
  console.log(`[compactor] Opening store at: ${dbPath}`);
  const store = openStore(dbPath);

  try {
    console.log(`[compactor] Running rolling purge with ${retentionDays}-day retention threshold...`);
    const result = store.compact({ retentionDays, vacuum });
    console.log(`[compactor] Compaction completed successfully:`);
    console.log(`  - Retention Cutoff: ${result.cutoff}`);
    console.log(`  - Deleted Traces:   ${result.deletedTraces}`);
    console.log(`  - Deleted Gaps:     ${result.deletedGaps}`);
    console.log(`  - Deleted Feedback: ${result.deletedFeedback}`);
    if (vacuum) {
      console.log(`  - VACUUM executed:  reclaimed unused on-disk pages.`);
    } else {
      console.log(`  - Incremental vacuum executed.`);
    }
  } finally {
    store.db.close();
    console.log(`[compactor] Store connection closed.`);
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname || process.argv[1]?.endsWith('compact-audit-logs.js')) {
  main().catch(err => {
    console.error('[compactor] Error during compaction:', err);
    process.exit(1);
  });
}
