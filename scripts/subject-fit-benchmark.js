#!/usr/bin/env node
// Scores whether answers stay on the subject that was asked, using the real records
// through the public evidence gate. Read-only. Developer-authored questions: this
// measures subject fit, not legal accuracy, and is not real user traffic.
//   node scripts/subject-fit-benchmark.js [--verbose] [--db path]
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {answer} from '../src/engine.js';
import {publicEvidence} from '../src/public-evidence.js';

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const dbFlag = args.indexOf('--db');
const dbPath = dbFlag >= 0 ? args[dbFlag + 1] : new URL('../data/settlement.sqlite', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const db = new DatabaseSync(dbPath, {readOnly: true});
const records = publicEvidence(db, db.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body)));
db.close();
const byId = new Map(records.map(record => [record.id, record]));

export function scoreCase(testCase, result, recordsById) {
  const about = new RegExp(testCase.about, 'i');
  const fits = result.claims.map(claim => {
    const record = recordsById.get(claim.evidenceId);
    return about.test(`${record.title} ${record.summary}`);
  });
  if (!fits.length) return {kind: result.status === 'clarification' ? 'clarify' : 'abstain', fits};
  if (fits.every(Boolean)) return {kind: 'on_subject', fits};
  return {kind: fits[0] ? 'lead_on_subject' : fits.some(Boolean) ? 'lead_off_subject' : 'wrong', fits};
}

for (const name of ['subject-fit', 'subject-fit-holdout', 'subject-tags-holdout']) {
  const {cases} = JSON.parse(readFileSync(new URL(`../evaluation/${name}.json`, import.meta.url), 'utf8'));
  const totals = {n: cases.length, on_subject: 0, lead_on_subject: 0, lead_off_subject: 0, wrong: 0, abstain: 0, clarify: 0};
  for (const testCase of cases) {
    const result = answer({question: testCase.q}, records, new Date());
    const {kind, fits} = scoreCase(testCase, result, byId);
    totals[kind]++;
    if (verbose && kind !== 'on_subject') {
      const claims = result.claims.map((claim, index) => `${fits[index] ? '' : 'X '}${claim.evidenceId}`).join(', ');
      console.log(`${kind.padEnd(16)} ${testCase.q.slice(0, 62).padEnd(62)} ${claims.slice(0, 90)}`);
    }
  }
  console.log(name, JSON.stringify(totals));
}
