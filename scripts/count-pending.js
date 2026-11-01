import { openStore } from '../src/store.js';
import { lintEvidence } from '../src/evidence-policy.js';

const store = openStore();
const db = store.db;

const records = store.records();
const pendingRecords = records.filter(r => r.status === 'pending').length;
const approvedRecords = records.filter(r => r.status === 'approved').length;
const seedRecords = records.filter(r => r.status === 'research_seed').length;

const sources = store.ingestion.sources();
const unreviewedSources = sources.filter(s => s.policy === 'unreviewed').length;
const permittedSources = sources.filter(s => s.policy === 'manual_permitted').length;

const openGaps = db.prepare("SELECT count(*) as c FROM gap_work_items WHERE status = 'open'").get().c;
const inProgressGaps = db.prepare("SELECT count(*) as c FROM gap_work_items WHERE status = 'in_progress'").get().c;
const deferredGaps = db.prepare("SELECT count(*) as c FROM gap_work_items WHERE status = 'deferred'").get().c;
const resolvedGaps = db.prepare("SELECT count(*) as c FROM gap_work_items WHERE status = 'resolved'").get().c;

const today = new Date().toISOString().slice(0, 10);
const expired = records.filter(r => r.expiresAt < today).length;
const expiringSoon30 = records.filter(r => r.expiresAt >= today && (Date.parse(r.expiresAt) - Date.parse(today)) <= 30 * 86400000).length;

const lint = lintEvidence(sources, records);

console.log(JSON.stringify({
  corePendingCount: pendingRecords + unreviewedSources + openGaps + expired + lint.warnings.length,
  breakdown: {
    pendingRecords,
    approvedRecords,
    seedRecords,
    totalRecords: records.length,
    unreviewedSources,
    permittedSources,
    totalSources: sources.length,
    openGaps,
    inProgressGaps,
    deferredGaps,
    resolvedGaps,
    totalGaps: openGaps + inProgressGaps + deferredGaps + resolvedGaps,
    expiredEvidence: expired,
    expiringSoon30Days: expiringSoon30,
    policyLintWarnings: lint.warnings.length,
    expiryDate: records[0]?.expiresAt
  }
}, null, 2));

db.close();
