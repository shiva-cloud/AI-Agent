import { openStore } from '../src/store.js';

const store = openStore();
const db = store.db;

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('All Tables and Counts:');
for (const t of tables) {
  const row = db.prepare(`SELECT count(*) as c FROM ${t.name}`).get();
  console.log(`- ${t.name}: ${row.c}`);
}

db.close();
