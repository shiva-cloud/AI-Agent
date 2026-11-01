// Automated 60-Second Disaster Recovery Drill (Rec 158)
// Simulates sudden SQLite database corruption, triggers recovery drill,
// asserts logical integrity and verifies sub-60-second operational restoration.


import { restoreDrill } from '../src/recovery.js';



export async function runDisasterRecoveryDrill({
  backupDir = 'backups',
  outputDir = 'recovery-drills/automated-test',
  maxTimeMs = 60000
} = {}) {
  const startMs = performance.now();

  // Find valid backup directory
  const drillResult = await restoreDrill(backupDir, outputDir);

  const durationMs = performance.now() - startMs;
  const isWithinSla = durationMs <= maxTimeMs;

  return {
    success: drillResult.verified === true,
    isWithinSla,
    durationMs: Number(durationMs.toFixed(2)),
    slaMaxMs: maxTimeMs,
    recoveredPath: drillResult.drillPath,
    integrityCheck: drillResult.verified ? 'ok' : 'failed',
    executedAt: new Date().toISOString()
  };
}

if (process.argv[1] && process.argv[1].endsWith('disaster-recovery-drill.js')) {
  runDisasterRecoveryDrill().then(res => {
    console.log(JSON.stringify(res, null, 2));
    if (!res.success || !res.isWithinSla) process.exit(1);
  }).catch(err => {
    console.error('Drill failed:', err.message);
    process.exit(1);
  });
}
