#!/usr/bin/env node
// Turns a person's review decisions into confirmed tags. Nothing is written unless every
// accepted decision is valid. A decision made against text that has since changed is
// skipped and reported, because the person judged different words.
//   node scripts/subject-tags-apply-review.js decisions.json [--db path] [--write]
// decisions.json: [{"id": "record-id", "decision": "approved|changed|none", "subjects": [], "hash": "...", "by": "...", "at": "..."}]
import {DatabaseSync} from 'node:sqlite';
import {readFileSync, writeFileSync} from 'node:fs';
import {recordTextHash, validateSubjectTags} from '../src/subject-tags.js';

const args = process.argv.slice(2);
const dbFlag = args.indexOf('--db');
const dbPath = dbFlag >= 0 ? args[dbFlag + 1] : new URL('../data/settlement.sqlite', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const tagFile = new URL('../src/subject-tags.json', import.meta.url);

export function applyDecisions(tags, decisions, records) {
  const byId = new Map(records.map(record => [record.id, record]));
  const next = {...tags};
  const report = {confirmed: 0, none: 0, staleSkipped: [], unknownRecord: [], invalid: []};
  for (const entry of decisions) {
    const record = byId.get(entry.id);
    if (!record) { report.unknownRecord.push(entry.id); continue; }
    if (entry.hash !== recordTextHash(record)) { report.staleSkipped.push(entry.id); continue; }
    if (!['approved', 'changed', 'none'].includes(entry.decision)) { report.invalid.push(entry.id); continue; }
    const subjects = entry.decision === 'none' ? [] : entry.subjects;
    if (!Array.isArray(subjects) || (entry.decision !== 'none' && !subjects.length)) { report.invalid.push(entry.id); continue; }
    next[entry.id] = {subjects, hash: entry.hash, status: 'confirmed', method: 'reviewer', reviewedBy: entry.by || null, reviewedAt: entry.at || null};
    report[entry.decision === 'none' ? 'none' : 'confirmed']++;
  }
  return {tags: next, report};
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const db = new DatabaseSync(dbPath, {readOnly: true});
  const records = db.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body));
  db.close();
  const decisions = JSON.parse(readFileSync(args[0], 'utf8'));
  const {tags, report} = applyDecisions(JSON.parse(readFileSync(tagFile, 'utf8')).tags, decisions, records);
  const problems = validateSubjectTags(new Map(Object.entries(tags)), records);
  console.log(JSON.stringify(report));
  if (problems.length || report.invalid.length || report.unknownRecord.length) {
    console.error(problems.slice(0, 20).join('\n'));
    console.error('Nothing written.');
    process.exitCode = 1;
  } else if (args.includes('--write')) {
    writeFileSync(tagFile, JSON.stringify({version: 1, tags: Object.fromEntries(Object.entries(tags).sort(([a], [b]) => a.localeCompare(b)))}, null, 1) + '\n');
    console.log('wrote src/subject-tags.json');
  }
}
