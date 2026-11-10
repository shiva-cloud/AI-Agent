import { DatabaseSync } from 'node:sqlite';
import { ingestionStore } from '../src/ingestion.js';
// Publishes withheld high-risk records after an automated check of their
// official pages (src/source-verifier.js). For each record in the publish queue
// it fetches the official page, and only if the quote is on the page word for
// word and every figure in the summary is in the saved excerpt too, it archives an
// excerpt and publishes the record with reviewMethod 'source_verified'.
// Answers label these "Checked against the official page · automated".
// Records that fail stay withheld; the report says why.
//
//   node scripts/kb-verify-publish.js                     check only, no writes
//   node scripts/kb-verify-publish.js --apply             back up, then publish
//   node scripts/kb-verify-publish.js --apply --db <path> use another database
//   node scripts/kb-verify-publish.js --queue-only        rank the queue and list
//       blockers without fetching any page or writing anything
//   --topic health   --limit 50                           narrow a run
//   --id rec-a,rec-b                                      verify only these records
//
// The report is written to data/kb-verify-publish-report.json.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openStore } from '../src/store.js';
import { publishQueue } from '../src/publish-queue.js';
import { verifyAgainstPage, fetchPageText } from '../src/source-verifier.js';
import { loadProgress, saveProgress, markRecords } from './kb-review-queue.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const REVIEWER = 'automated-source-check';
const KEEP_BACKUPS = 3;

function backup(db, dbPath) {
  const dir = join(dirname(dbPath), 'backups'); mkdirSync(dir, { recursive: true });
  const file = join(dir, `settlement-before-verify-publish-${Date.now()}.sqlite`);
  db.exec(`VACUUM INTO '${file.replaceAll("'", "''")}'`);
  const old = readdirSync(dir).filter(n => n.startsWith('settlement-before-verify-publish-')).sort().reverse().slice(KEEP_BACKUPS);
  for (const name of old) rmSync(join(dir, name), { force: true });
  return file;
}

/** Fetch each distinct URL once, a few at a time. */
async function fetchAll(urls, { concurrency = 4, fetchImpl } = {}) {
  const pages = new Map(), queue = [...urls];
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (queue.length) { const url = queue.shift(); pages.set(url, await fetchPageText(url, { fetchImpl })); }
  }));
  return pages;
}

export async function verifyAndPublish(store, { apply = false, topic = null, limit = Infinity, fetchImpl, now = new Date(), queueOnly = false, onPublished = null, ids = null } = {}) {
  const today = now.toISOString().slice(0, 10);
  const queue = publishQueue(store.db, store.records(), store.ingestion.sources(), store.ingestion.candidates(), now);
  const rows = queue.rows.filter(r => (queueOnly || r.state === 'ready') && (!topic || r.topic === topic) && (!ids || ids.includes(r.id))).slice(0, limit);
  // --queue-only: rank the queue and list blockers without touching the
  // network. Fetches stay limited to apply/check runs that actually verify.
  if (queueOnly) {
    const byTopic = {}, byState = {};
    const results = rows.map(r => {
      const t = byTopic[r.topic] ??= { checked: 0, passed: 0, published: 0, ready: 0, awaiting_approval: 0, blocked: 0 };
      t.checked++; t[r.state]++;
      byState[r.state] = (byState[r.state] || 0) + 1;
      return { id: r.id, topic: r.topic, jurisdiction: r.jurisdiction, url: r.url, state: r.state,
        blockers: r.blockers, withholdingReasons: r.withholdingReasons, nextActions: r.nextActions, pendingCandidates: r.pendingCandidates, ok: false, viaArchive: false, reason: 'queue_only', detail: null, published: false };
    });
    return { date: today, applied: false, queueOnly: true, withheldBefore: queue.total, checked: results.length,
      passed: 0, published: 0, byTopic, byReason: { queue_only: results.length }, byState, results };
  }
  const pages = await fetchAll(new Set(rows.map(r => r.url)), { fetchImpl });
  // Pages that are gone or block the fetch get one honest second chance: the
  // Internet Archive copy of the same official URL, when a snapshot exists.
  // The provenance note records that the archived copy was the evidence.
  const archiveTargets = new Map();
  for (const row of rows) {
    const page = pages.get(row.url);
    if (!page.text && ['http_404', 'http_403'].includes(page.error)) archiveTargets.set(row.id, `https://web.archive.org/web/2026/${row.url}`);
  }
  const archivePages = archiveTargets.size ? await fetchAll(new Set(archiveTargets.values()), { fetchImpl }) : new Map();
  const results = [];
  for (const row of rows) {
    const page = pages.get(row.url);
    let check = page.text ? verifyAgainstPage(row.draft, page.text) : { ok: false, reason: page.error, detail: page.detail ?? null };
    const primaryReason = check.reason ?? null;
    const primaryDetail = check.detail ?? null;
    let viaArchive = false;
    const archiveUrl = archiveTargets.get(row.id);
    if (!check.ok && archiveUrl) {
      const archived = archivePages.get(archiveUrl);
      check = archived?.text ? verifyAgainstPage(row.draft, archived.text)
        : { ok: false, reason: `archive_${archived?.error ?? 'page_unavailable'}`, detail: archived?.detail ?? null };
      if (check.ok) viaArchive = true;
      else if (!String(check.reason).startsWith('archive_')) check = { ok: false, reason: `archive_${check.reason}`, detail: check.detail ?? null };
    }
    const result = { id: row.id, topic: row.topic, jurisdiction: row.jurisdiction, url: row.url, ok: check.ok, viaArchive, primaryReason, primaryDetail, reason: check.reason ?? null, detail: check.detail ?? null, published: false };
    if (check.ok && apply) {
      try {
        const record = { ...row.draft, quote: check.quote };
        const candidate = store.ingestion.ingest({ sourceId: row.sourceId, requestKey: `verify-${row.id}-${today.replaceAll('-', '')}`.slice(0, 80), content: check.excerpt, record });
        if (candidate.status === 'pending') {
          store.ingestion.decide(candidate.id, { decision: 'approve', reviewer: REVIEWER, reviewMethod: 'source_verified',
            note: `Automated check on ${today}: the quote appears word for word on ${viaArchive ? 'the archived copy of the official page (web.archive.org)' : 'the official page'}, and every figure in the summary appears in the saved excerpt with matching currency/percent markers. This does not verify claim meaning. Not an editor's review.` });
        }
        result.published = true;
        if (onPublished) onPublished(result);
      } catch (e) { result.ok = false; result.reason = 'import_refused'; result.detail = e.message; }
    }
    results.push(result);
  }
  const byTopic = {}, byReason = {};
  for (const r of results) {
    const t = byTopic[r.topic] ??= { checked: 0, passed: 0, published: 0 };
    t.checked++; if (r.ok) t.passed++; if (r.published) t.published++;
    if (!r.ok) byReason[r.reason] = (byReason[r.reason] || 0) + 1;
  }
  return { date: today, applied: apply, withheldBefore: queue.total, checked: results.length,
    passed: results.filter(r => r.ok).length, published: results.filter(r => r.published).length, byTopic, byReason, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2), opt = name => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1]; };
  const apply = args.includes('--apply');
  const queueOnly = args.includes('--queue-only');
  const dbPath = opt('--db') || process.env.DB_PATH || join(root, 'data', 'settlement.sqlite');
  if (!existsSync(dbPath)) { console.error(`Database not found: ${dbPath}`); process.exit(1); }
  const readOnlyDb = apply && !queueOnly ? null : new DatabaseSync(dbPath, { readOnly: true });
  const store = readOnlyDb ? {
    db: readOnlyDb,
    records: () => readOnlyDb.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body)),
    ingestion: ingestionStore(readOnlyDb)
  } : openStore(dbPath);
  // The pre-publish backup. queue-only is a read-only listing; no backup then.
  const backupFile = apply && !queueOnly ? backup(store.db, dbPath) : null;
  const out = opt('--report') || join(root, 'data', 'kb-verify-publish-report.json');
  try {
    const report = await verifyAndPublish(store, { apply: apply && !queueOnly, topic: opt('--topic'), limit: Number(opt('--limit')) || Infinity,
      ids: args.includes('--id') ? args[args.indexOf('--id') + 1].split(',') : null,
      queueOnly, onPublished: r => console.log(`published: ${r.id}`) });
    report.backup = backupFile;
    // The report lands on disk before anything else can fail after a
    // publishing run: a lost report cost a manual chain probe once already.
    writeFileSync(out, JSON.stringify(report, null, 2));
    const { results, ...summary } = report;
    console.log(JSON.stringify(summary, null, 2));
    // Published records need no further daily fact-check; record them as
    // verified. A progress-file failure must not look like a lost publish.
    if (apply && !queueOnly && dbPath === join(root, 'data', 'settlement.sqlite')) {
      const ids = report.results.filter(r => r.published).map(r => r.id);
      if (ids.length) {
        try { saveProgress(markRecords(loadProgress(), ids, 'verified', 'Published after the automated official-page check.', report.date)); }
        catch (e) { console.error(`Published ${ids.length} record(s) but could not update the fact-check progress file: ${e.message}`); }
      }
    }
  } finally { store.db.close(); }
}
