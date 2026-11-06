#!/usr/bin/env node
// Suggests subject tags for review. Reads the records, writes nothing to the database.
// Templated records are tagged outright; everything else stays `proposed` until a person
// confirms it. Confirmed tags already in the file are kept unless their record changed.
//   node scripts/subject-tags-propose.js [--db path] [--write]
import {DatabaseSync} from 'node:sqlite';
import {readFileSync, writeFileSync} from 'node:fs';
import {proposeRecordSubjects} from '../src/subject-vocabulary.js';
import {recordTextHash, validateSubjectTags} from '../src/subject-tags.js';

const args = process.argv.slice(2);
const dbFlag = args.indexOf('--db');
const dbPath = dbFlag >= 0 ? args[dbFlag + 1] : new URL('../data/settlement.sqlite', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const tagFile = new URL('../src/subject-tags.json', import.meta.url);

const db = new DatabaseSync(dbPath, {readOnly: true});
const records = db.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body));
db.close();
const existing = JSON.parse(readFileSync(tagFile, 'utf8')).tags;

// Records stamped from one template carry the same meaning, so no judgement is needed.
const templateSubjects = record => /-settlement-services$/.test(record.id) ? ['settlement-services'] : /^country-.*-portal$/.test(record.id) ? ['getting-a-licence'] : null;

const tags = {};
const stats = {records: records.length, kept: 0, template: 0, proposed: 0, untagged: 0, staleDropped: 0};
const byTopic = {};
for (const record of [...records].sort((a, b) => a.id.localeCompare(b.id))) {
  const topic = byTopic[record.topic] ||= {records: 0, tagged: 0};
  topic.records++;
  const hash = recordTextHash(record);
  const previous = existing[record.id];
  if (previous && previous.status === 'confirmed' && previous.method === 'reviewer') {
    if (previous.hash === hash) { tags[record.id] = previous; stats.kept++; topic.tagged++; continue; }
    stats.staleDropped++;
  }
  const template = templateSubjects(record);
  const subjects = template || proposeRecordSubjects(record);
  if (!subjects.length) { stats.untagged++; continue; }
  tags[record.id] = {subjects, hash, status: template ? 'confirmed' : 'proposed', method: template ? 'template' : 'rule'};
  stats[template ? 'template' : 'proposed']++;
  topic.tagged++;
}

const problems = validateSubjectTags(new Map(Object.entries(tags)), records);
console.log(JSON.stringify(stats));
for (const [topic, {records: total, tagged}] of Object.entries(byTopic).sort((a, b) => b[1].records - a[1].records)) {
  console.log(`${topic.padEnd(12)} ${String(tagged).padStart(4)} of ${String(total).padStart(4)} have a tag or suggestion`);
}
if (problems.length) {
  console.error(problems.slice(0, 20).join('\n'));
  process.exitCode = 1;
} else if (args.includes('--write')) {
  writeFileSync(tagFile, JSON.stringify({version: 1, tags}, null, 1) + '\n');
  console.log('wrote src/subject-tags.json');
}
