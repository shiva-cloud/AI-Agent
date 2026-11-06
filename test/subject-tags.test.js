import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {SUBJECTS, SUBJECT_IDS, questionSubjects, proposeRecordSubjects} from '../src/subject-vocabulary.js';
import {loadSubjectTags, recordTextHash, subjectShadow, subjectsOfRecord, validateSubjectTags} from '../src/subject-tags.js';
import {publicEvidence} from '../src/public-evidence.js';
import {openStore} from '../src/store.js';
import {topics} from '../src/knowledge.js';

const NOW = new Date('2026-11-06T12:00:00Z');
const record = (id, topic, summary, extra = {}) => ({
  id, topic, jurisdiction: 'ON', title: summary, summary, quote: summary, url: `https://example.gov/${id}`,
  checkedAt: '2026-10-01', expiresAt: '2027-10-01', risk: 'high', status: 'approved', language: 'en', ...extra
});
const tagged = (rec, subjects, status = 'confirmed', method = 'reviewer') => [rec.id, {subjects, hash: recordTextHash(rec), status, method}];

test('every subject is unique, in a known topic and recognises its own example', () => {
  assert.equal(SUBJECT_IDS.size, SUBJECTS.length);
  assert.ok(SUBJECTS.length >= 80 && SUBJECTS.length <= 120, `${SUBJECTS.length} subjects`);
  for (const subject of SUBJECTS) {
    assert.ok(topics.includes(subject.topic), `${subject.id}: ${subject.topic}`);
    assert.ok(!subject.ask.global && !subject.about.global, `${subject.id}: a global regex keeps state between calls`);
    assert.ok(subject.ask.test(subject.example), `${subject.id}: ${subject.example}`);
  }
});

test('vocabulary examples never copy a held-out question', () => {
  for (const name of ['subject-fit-holdout', 'subject-tags-holdout']) {
    const held = new Set(JSON.parse(readFileSync(new URL(`../evaluation/${name}.json`, import.meta.url), 'utf8')).cases.map(c => c.q));
    for (const subject of SUBJECTS) assert.ok(!held.has(subject.example), subject.id);
  }
});

test('questions map to subjects, limited to the recognised topics', () => {
  assert.ok(questionSubjects('Can I sublet my place?').includes('sublet'));
  assert.ok(questionSubjects('How do I report a scam?', ['community']).includes('fraud-reporting'));
  assert.deepEqual(questionSubjects('Can I sublet my place?', ['money']), []);
  assert.deepEqual(questionSubjects('Tell me something nice'), []);
  assert.deepEqual(questionSubjects(''), []);
});

test('a suggestion comes only from the same topic and the record text', () => {
  assert.deepEqual(proposeRecordSubjects(record('a', 'housing', 'Tenants may sublet with landlord consent.')), ['sublet']);
  assert.deepEqual(proposeRecordSubjects(record('b', 'money', 'Tenants may sublet with landlord consent.')), []);
});

test('a tag stops counting when the record text changes', () => {
  const rec = record('a', 'housing', 'Tenants may sublet.');
  const tags = new Map([tagged(rec, ['sublet'])]);
  assert.deepEqual(subjectsOfRecord(rec, tags), ['sublet']);
  assert.deepEqual(subjectsOfRecord({...rec, summary: 'Tenants may not sublet.'}, tags), []);
  assert.deepEqual(subjectsOfRecord({...rec, status: 'pending'}, tags), ['sublet'], 'status is not part of the judged text');
});

test('a proposed tag counts only when asked for', () => {
  const rec = record('a', 'housing', 'Tenants may sublet.');
  const tags = new Map([tagged(rec, ['sublet'], 'proposed', 'rule')]);
  assert.deepEqual(subjectsOfRecord(rec, tags), []);
  assert.deepEqual(subjectsOfRecord(rec, tags, {includeProposed: true}), ['sublet']);
});

test('the validator names each kind of problem', () => {
  const rec = record('a', 'housing', 'Tenants may sublet.');
  const hash = recordTextHash(rec);
  const problems = tags => validateSubjectTags(new Map(tags), [rec]).join('\n');
  assert.equal(problems([tagged(rec, ['sublet'])]), '');
  assert.match(problems([['a', {subjects: ['nope'], hash, status: 'confirmed', method: 'reviewer'}]]), /unknown subject/);
  assert.equal(problems([['a', {subjects: [], hash, status: 'confirmed', method: 'reviewer'}]]), '', 'a reviewer may decide nothing fits');
  assert.match(problems([['a', {subjects: [], hash, status: 'proposed', method: 'rule'}]]), /no subjects/);
  assert.match(problems([['a', {subjects: ['sublet', 'sublet'], hash, status: 'proposed', method: 'rule'}]]), /repeated/);
  assert.match(problems([['ghost', {subjects: ['sublet'], hash, status: 'proposed', method: 'rule'}]]), /no such record/);
  assert.match(problems([['a', {subjects: ['sublet'], hash: '0'.repeat(16), status: 'proposed', method: 'rule'}]]), /stale/);
  assert.match(problems([['a', {subjects: ['sublet'], hash, status: 'confirmed', method: 'rule'}]]), /without a reviewer/);
});

test('review decisions become confirmed tags only for the text that was judged', async () => {
  const {applyDecisions} = await import('../scripts/subject-tags-apply-review.js');
  const a = record('a', 'housing', 'Tenants may sublet.');
  const b = record('b', 'housing', 'Rent guideline.');
  const c = record('c', 'housing', 'Deposit rules.');
  const hash = recordTextHash;
  const {tags, report} = applyDecisions({}, [
    {id: 'a', decision: 'approved', subjects: ['sublet'], hash: hash(a), by: 'u1', at: '2026-11-06'},
    {id: 'b', decision: 'none', subjects: ['rent-increase'], hash: hash(b)},
    {id: 'c', decision: 'changed', subjects: ['deposit'], hash: 'stale000stale000'},
    {id: 'ghost', decision: 'approved', subjects: ['sublet'], hash: 'x'},
    {id: 'a', decision: 'maybe', subjects: ['sublet'], hash: hash(a)}
  ], [a, b, c]);
  assert.deepEqual(tags.a.subjects, ['sublet']);
  assert.equal(tags.a.method, 'reviewer');
  assert.deepEqual(tags.b.subjects, [], 'none clears the subjects even if some were sent');
  assert.equal(tags.c, undefined);
  assert.deepEqual(report.staleSkipped, ['c']);
  assert.deepEqual(report.unknownRecord, ['ghost']);
  assert.deepEqual(report.invalid, ['a']);
  assert.deepEqual(validateSubjectTags(new Map(Object.entries(tags)), [a, b, c]), []);
});

test('the committed tag file is valid, and no rule suggestion is treated as confirmed', () => {
  const tags = loadSubjectTags();
  assert.deepEqual(validateSubjectTags(tags), []);
  for (const [id, tag] of tags) assert.ok(tag.status === 'proposed' || tag.method !== 'rule', id);
});

test('shadow routing reports its decision without changing anything', () => {
  const sublet = record('sublet', 'housing', 'Tenants may sublet.');
  const rent = record('rent', 'housing', 'Rent guideline.');
  const tags = new Map([tagged(sublet, ['sublet'])]);
  const parsed = {intents: ['housing']};
  const claims = [{evidenceId: 'rent'}];
  const run = candidates => subjectShadow({question: 'Can I sublet?', parsed, candidates, claims, tags});
  const live = run([{...rent, available: true}, {...sublet, available: true}]);
  assert.deepEqual([live.decision, live.wouldCite, live.changed], ['tagged_record', ['sublet'], true]);
  assert.equal(run([{...rent, available: true}, {...sublet, available: false}]).decision, 'awaiting_review');
  assert.equal(run([{...rent, available: true}]).decision, 'no_tagged_record');
  const unknown = subjectShadow({question: 'Tell me something nice', parsed, candidates: [], claims, tags});
  assert.deepEqual([unknown.decision, unknown.changed], ['existing_rules', false]);
});

test('answers carry the shadow diagnostic out of sight', () => {
  const result = answer({question: 'How do I get a SIN?'}, seeds, NOW);
  assert.ok(result.subjectShadow?.subjects.includes('sin-application'));
  assert.ok(!Object.keys(result).includes('subjectShadow'));
  assert.ok(!JSON.stringify(result).includes('subjectShadow'));
});

test('tags live outside record bodies, so the evidence gate is untouched', () => {
  const store = openStore(':memory:');
  const before = publicEvidence(store.db, store.records());
  assert.ok(store.records().every(rec => !Object.hasOwn(rec, 'subjects')));
  loadSubjectTags();
  assert.deepEqual(publicEvidence(store.db, store.records()), before);
  store.db.close();
});
