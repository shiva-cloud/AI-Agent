// scripts/debug-sweden.mjs
import { openStore } from '../src/store.js';
import { parse, retrieve } from '../src/engine.js';
import { subjectEvidenceMatcher } from '../src/requested-subject.js';
import { highRiskTopics } from '../src/evidence-policy.js';
import { tokenize } from '../src/search.js';
import { recordHousingSubjects } from '../src/housing.js';

const q = 'I am embarrassed to ask: where can a caregiver get free or low-cost help with landlord refuses written lease around Gothenburg, Sweden when my agent stopped responding?';
const store = openStore();
const records = store.records();
const parsed = parse({ question: q });
const candidates = retrieve(parsed, records);
console.log('Candidates count:', candidates.length);
const r = candidates[0];
console.log('Candidate ID:', r.id);

const CANADIAN_REGION_NAMES = Object.freeze({ON:'ontario',BC:'british columbia',AB:'alberta',QC:'quebec',MB:'manitoba',SK:'saskatchewan',NS:'nova scotia',NB:'new brunswick',PE:'prince edward island',NL:'newfoundland labrador',YT:'yukon',NT:'northwest territories',NU:'nunavut'});
function substantiveTerms(terms, parsed) {
  const place = new Set(tokenize([parsed.city, parsed.region, CANADIAN_REGION_NAMES[parsed.region], parsed.country, 'canada', 'canadian'].filter(Boolean).join(' ')));
  return (terms || []).filter(term => !place.has(term));
}
const GENERIC_QUESTION_TERMS = new Set('case newcomer another under date available who policy law eligibility status assessment guidance authority document legal rules government analyze responsible different compare options required requirement much many long need needed get got find help know tell want use using as while than by if not but any some all there who which why will may might must also have has had was were been am very more most less best new free local official common normal normally general basic main minimum maximum apply start process work file people person thing things way'.split(' '));
const hasInformativeOverlap = (matchedTerms, parsed) => substantiveTerms(matchedTerms, parsed).some(term => !GENERIC_QUESTION_TERMS.has(term));

const askedTerms = new Set(substantiveTerms(parsed.queryTerms, parsed));
const coversNamedSubject = subjectEvidenceMatcher(q);
const questionIsSpecific = askedTerms.size > 1 && [...askedTerms].some(term => !GENERIC_QUESTION_TERMS.has(term));

console.log('r.matchedTerms:', r.matchedTerms);
console.log('hasInformativeOverlap:', hasInformativeOverlap(r.matchedTerms, parsed));
console.log('coversNamedSubject:', coversNamedSubject(r));
console.log('questionIsSpecific:', questionIsSpecific);
console.log('highRiskTopics.has(r.topic):', highRiskTopics.has(r.topic));

const fitsQuestion = r => {
  if (!coversNamedSubject(r)) return false;
  if (!parsed.intents.length) return hasInformativeOverlap(r.matchedTerms, parsed);
  return (questionIsSpecific && highRiskTopics.has(r.topic)) ? hasInformativeOverlap(r.matchedTerms, parsed) : true;
};
console.log('fitsQuestion:', fitsQuestion(r));

const bestScore = Math.max(0, ...candidates.filter(c => c.status !== 'rejected' && fitsQuestion(c)).map(c => c.score));
console.log('bestScore:', bestScore);
const relevant = candidates.filter(c => c.topic === 'housing' && coversNamedSubject(c) && fitsQuestion(c));
console.log('relevant count:', relevant.length);
const usable = relevant.filter(c => c.available && (!highRiskTopics.has(c.topic) || c.score >= bestScore * 0.3));
console.log('usable count:', usable.length);

for (const subject of parsed.housingSubjects) {
  console.log('Checking housing subject:', subject);
  console.log('recordHousingSubjects has subject?', recordHousingSubjects(r).has(subject));
}

