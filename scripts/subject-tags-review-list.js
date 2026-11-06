#!/usr/bin/env node
// Prints the records a person should check for the named topics, with the suggested
// subjects and the subjects to choose from. Only records currently served to the public
// are listed, because those are the ones that can appear in an answer. Read-only.
//   node scripts/subject-tags-review-list.js housing,employment [--db path] > list.json
import {DatabaseSync} from 'node:sqlite';
import {publicEvidence} from '../src/public-evidence.js';
import {SUBJECTS, proposeRecordSubjects} from '../src/subject-vocabulary.js';
import {recordTextHash} from '../src/subject-tags.js';

const args = process.argv.slice(2);
const topics = (args[0] || '').split(',').filter(Boolean);
if (!topics.length) throw new Error('Name the topics, for example: housing,employment');
const dbFlag = args.indexOf('--db');
const dbPath = dbFlag >= 0 ? args[dbFlag + 1] : new URL('../data/settlement.sqlite', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const db = new DatabaseSync(dbPath, {readOnly: true});
const records = publicEvidence(db, db.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body)));
db.close();

const today = new Date().toISOString().slice(0, 10);
const items = records
  .filter(record => topics.includes(record.topic) && ['approved', 'research_seed'].includes(record.status) && record.expiresAt >= today)
  .sort((a, b) => a.topic.localeCompare(b.topic) || a.jurisdiction.localeCompare(b.jurisdiction) || a.id.localeCompare(b.id))
  .map(record => ({
    id: record.id, topic: record.topic, jurisdiction: record.jurisdiction, title: record.title, summary: record.summary,
    url: record.url, hash: recordTextHash(record), suggested: proposeRecordSubjects(record)
  }));
const subjects = SUBJECTS.filter(subject => subject.recordTopics.some(topic => topics.includes(topic)))
  .map(subject => ({id: subject.id, topics: subject.recordTopics, example: subject.example}));
console.log(JSON.stringify({generatedAt: today, topics, items, subjects}));
