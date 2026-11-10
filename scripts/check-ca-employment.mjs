import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();

const caEmployment = records.filter(r => r.jurisdiction === 'CA' && r.topic === 'employment');
console.log('Records with jurisdiction CA and topic employment:', caEmployment.length);
for (const r of caEmployment) {
  console.log(`- [${r.id}]: "${r.title}" (status: ${r.status})`);
}
