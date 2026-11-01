import fs from 'node:fs';
import { openStore } from '../src/store.js';

const store = openStore();
const db = store.db;

const rows = db.prepare('SELECT id, body FROM records').all();
let updated = 0;

db.exec('BEGIN IMMEDIATE');
try {
  for (const row of rows) {
    const r = JSON.parse(row.body);
    if (r.checkedAt === '2026-11-01') {
      r.checkedAt = '2026-10-31';
      db.prepare('UPDATE records SET body = ? WHERE id = ?').run(JSON.stringify(r), r.id);
      updated++;
    }
  }
  db.exec('COMMIT');
  console.log(`Updated ${updated} records in SQLite.`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Update failed:', err);
  process.exit(1);
}

let gr = fs.readFileSync('src/global-records.js', 'utf8');
const count = (gr.match(/'2026-11-01'/g) || []).length;
if (count > 0) {
  gr = gr.replaceAll("'2026-11-01'", "'2026-10-31'");
  fs.writeFileSync('src/global-records.js', gr, 'utf8');
  console.log(`Replaced ${count} occurrences in src/global-records.js.`);
}
