#!/usr/bin/env node
// What subject routing would change, using the tuning questions only. The held-out
// sets are scored by subject-fit-benchmark.js at phase gates and must not be read here.
//   node scripts/subject-shadow-report.js [--db path] [--proposed] [--verbose]
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {answer} from '../src/engine.js';
import {publicEvidence} from '../src/public-evidence.js';
import {loadSubjectTags, subjectShadow} from '../src/subject-tags.js';

const args = process.argv.slice(2);
const dbFlag = args.indexOf('--db');
const dbPath = dbFlag >= 0 ? args[dbFlag + 1] : new URL('../data/settlement.sqlite', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const includeProposed = args.includes('--proposed');
const verbose = args.includes('--verbose');

const db = new DatabaseSync(dbPath, {readOnly: true});
const records = publicEvidence(db, db.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body)));
db.close();
const byId = new Map(records.map(record => [record.id, record]));
const tags = loadSubjectTags();
const {cases} = JSON.parse(readFileSync(new URL('../evaluation/subject-fit.json', import.meta.url), 'utf8'));

const totals = {n: cases.length, subjectRecognised: 0, changed: 0, tagged_record: 0, awaiting_review: 0, no_tagged_record: 0, existing_rules: 0, currentOnSubject: 0, wouldBeOnSubject: 0};
for (const testCase of cases) {
  const about = new RegExp(testCase.about, 'i');
  const fits = id => { const record = byId.get(id); return about.test(`${record.title} ${record.summary}`); };
  const result = answer({question: testCase.q}, records, new Date());
  const candidates = (result.retrieval?.candidates || []).map(({id, available}) => ({...byId.get(id), available}));
  const shadow = subjectShadow({question: testCase.q, parsed: result.parsed, candidates, claims: result.claims, tags, includeProposed});
  totals[shadow.decision]++;
  if (shadow.subjects.length) totals.subjectRecognised++;
  if (shadow.changed) totals.changed++;
  if (shadow.current.length && shadow.current.every(fits)) totals.currentOnSubject++;
  if (shadow.wouldCite.length && shadow.wouldCite.every(fits)) totals.wouldBeOnSubject++;
  if (verbose && shadow.changed) console.log(`${shadow.decision.padEnd(17)} ${testCase.q.slice(0, 54).padEnd(54)} now: ${shadow.current.join(',').slice(0, 44).padEnd(44)} then: ${shadow.wouldCite.join(',').slice(0, 44)}`);
}
console.log(JSON.stringify({includeProposed, tags: tags.size, ...totals}));
