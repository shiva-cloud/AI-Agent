import { openStore } from '../src/store.js';

const store = openStore('data/settlement.sqlite');
const openGaps = store.db.prepare("SELECT scope, topic, subject, reason, occurrences, regression_ref FROM gap_work_items WHERE status = 'open'").all();
console.log('Open gap work items count:', openGaps.length);
console.log(JSON.stringify(openGaps, null, 2));

store.db.close();
