import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/settlement.sqlite', { readOnly: true });

const rows = db.prepare('SELECT id, body FROM records').all()
  .map((r) => ({ id: r.id, ...JSON.parse(r.body) }));

const by = (key) => {
  const m = {};
  for (const r of rows) m[r[key] ?? 'unknown'] = (m[r[key] ?? 'unknown'] || 0) + 1;
  return m;
};
console.log('TOTAL:', rows.length);
console.log('BY STATUS:', JSON.stringify(by('status')));
console.log('BY JURISDICTION:', JSON.stringify(by('jurisdiction')));
console.log('BY TOPIC:', JSON.stringify(by('topic')));

console.log('\n--- ALL RECORDS: jurisdiction | id | topic | status | risk | title ---');
for (const r of rows.sort((a, b) =>
  String(a.jurisdiction).localeCompare(String(b.jurisdiction)) || String(a.id).localeCompare(String(b.id)))) {
  console.log([r.jurisdiction, r.id, r.topic, r.status, r.risk, r.title].join(' | '));
}
