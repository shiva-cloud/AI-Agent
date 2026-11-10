import { openStore } from '../src/store.js';
import { parse, retrieve } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();
const q = 'What common misconceptions about closed work permit job loss should a temporary foreign worker in Wellington, New Zealand avoid?';

const parsed = parse({ question: q });
const searchIntents = parsed.intents;
const candidates = retrieve(parsed, records);

console.log('Search intents:', searchIntents);
console.log('Candidates count:', candidates.length);

// Let's test the filtering loop from engine.js lines 716-755:
// We need to see what fails:
// Is it fitsQuestion?
// Is it coversRequiredSubjects?
// Is it relevant?
// Is it usable?

