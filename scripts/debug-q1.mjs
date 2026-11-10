import { answer } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

const q1 = "Where can I find official information about mobile plan cancellation in United Kingdom?";
const rec = records.find(r => r.id === 'uk-consumer-contracts-14day-cooling-off-telecom-kyc');

console.log('Record details:');
console.log('title:', rec.title);
console.log('summary:', rec.summary);
console.log('quote:', rec.quote);

console.log('\nRequested subject from q1:');
console.log('requestedSubject(q1):', requestedSubject(q1));

console.log('\nDoes matcher match?');
console.log('matcher:', subjectEvidenceMatcher(rec, q1));
