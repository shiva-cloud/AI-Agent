import { openStore } from '../src/store.js';

const store = openStore('data/settlement.sqlite');
const tables = store.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

for (const t of tables) {
    if (t.name.startsWith('sqlite_') || t.name.includes('fts')) continue;
    try {
        const count = store.db.prepare(`SELECT count(*) as c FROM ${t.name}`).get().c;
        console.log(`Table ${t.name}: ${count} rows`);
    } catch (err) {
        console.log(`Table ${t.name}: error ${err.message}`);
    }
}

// Check records table body statuses
const allRows = store.db.prepare("SELECT body FROM records").all();
const statusMap = {};
for (const r of allRows) {
    try {
        const obj = JSON.parse(r.body);
        const s = obj.status || 'no_status';
        statusMap[s] = (statusMap[s] || 0) + 1;
    } catch (e) { }
}
console.log('All record status counts in DB:', statusMap);

// Check if there are any pending reviews or pending items
const queue = store.db.prepare("SELECT count(*) as c FROM records WHERE json_extract(body, '$.status') = 'pending'").get();
console.log('Records with status=pending:', queue.c);

// Check review queue function
console.log('reviewQueue function exists:', Boolean(store.reviewQueue));

// Check review_queue or pending in other tables
store.db.close();
