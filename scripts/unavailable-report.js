// Demand-gap report (read-only): which topics most often end without a
// verified answer. Uses the aggregate trace records only — no question text,
// no identifiers. This is the content roadmap, derived from real demand.
//   node scripts/unavailable-report.js [--days 30] [--db path]
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1]; };
const days = Math.max(1, Math.min(365, Number(opt('--days')) || 30));
const dbPath = opt('--db') || join(root, 'data', 'settlement.sqlite');
const db = new DatabaseSync(dbPath, { readOnly: true });

const since = new Date(Date.now() - days * 86400000).toISOString();
const traces = db.prepare('SELECT body, at FROM traces WHERE at >= ?').all(since)
  .map(r => { try { return { at: r.at, ...JSON.parse(r.body) }; } catch { return null; } })
  .filter(Boolean);

const byTopic = new Map();
let unavailable = 0, total = 0;
for (const t of traces) {
  total++;
  const topics = Array.isArray(t.topics) && t.topics.length ? t.topics : ['(no topic)'];
  const failed = t.status === 'unavailable' || (Array.isArray(t.gaps) && t.gaps.length > 0);
  for (const topic of topics) {
    let entry = byTopic.get(topic);
    if (!entry) { entry = { total: 0, unavailable: 0 }; byTopic.set(topic, entry); }
    entry.total++;
    if (failed) entry.unavailable++;
  }
  if (t.status === 'unavailable') unavailable++;
}
const topics = [...byTopic.entries()]
  .map(([topic, v]) => ({ topic, ...v, unavailableShare: v.total ? Number((v.unavailable / v.total).toFixed(3)) : 0 }))
  .filter(t => t.unavailable > 0)
  .sort((a, b) => b.unavailable - a.unavailable)
  .slice(0, 20);
console.log(JSON.stringify({ windowDays: days, totalTraces: total, unavailableTotal: unavailable, unavailableShare: total ? Number((unavailable / total).toFixed(3)) : 0, topTopics: topics }, null, 2));
db.close();
