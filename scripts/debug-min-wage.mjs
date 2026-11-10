import { parse, answer, retrieve } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

const q = "What does minimum wage mean in Canada?";
const parsed = parse({ question: q });
console.log('Parsed:', JSON.stringify(parsed, null, 2));

const subject = requestedSubject(q);
console.log('Requested subject:', subject);

// What records match minimum wage in Canada?
const minWageRecs = records.filter(r => (r.jurisdiction === 'CA' || ['ON','BC','AB','QC'].includes(r.jurisdiction)) && /minimum wage/i.test(r.title + ' ' + (r.summary || '')));
console.log('Minimum wage records in CA:', minWageRecs.length);
for (const r of minWageRecs) {
  console.log(`- [${r.id}] (jurisdiction: ${r.jurisdiction}, topic: ${r.topic}): "${r.title}" (status: ${r.status})`);
  const matcher = subjectEvidenceMatcher(q);
  console.log(`  matcher(r): ${matcher(r)}`);
}

const res = answer({ question: q }, records);
console.log('\nAnswer:');
console.log('status:', res.status);
console.log('claims:', res.claims);
console.log('gaps:', res.gaps);
