// Subject tags live outside record bodies: the public evidence gate compares a record
// with its approval audit word for word, so a new body field would withhold it. Each
// tag stores a hash of the text it was judged against, so editing a record un-tags it
// rather than leaving a stale label. Tags choose between records and state no fact.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {SUBJECT_IDS, questionSubjects} from './subject-vocabulary.js';

export const TAG_STATUSES = Object.freeze(['proposed', 'confirmed']);
export const TAG_METHODS = Object.freeze(['template', 'rule', 'reviewer']);

export const recordTextHash = record => createHash('sha256').update(`${record.title}\n${record.summary}`).digest('hex').slice(0, 16);

export function loadSubjectTags(url = new URL('./subject-tags.json', import.meta.url)) {
  return new Map(Object.entries(JSON.parse(readFileSync(url, 'utf8')).tags));
}

/** A record's subjects, or [] when untagged, stale or not at the accepted status. */
export function subjectsOfRecord(record, tags, {includeProposed = false} = {}) {
  const tag = tags.get(record.id);
  if (!tag || tag.hash !== recordTextHash(record)) return [];
  return tag.status === 'confirmed' || includeProposed ? tag.subjects : [];
}

/** Problems in a tag set, as readable strings. Records are optional: pass them to check ids and hashes. */
export function validateSubjectTags(tags, records = null) {
  const problems = [];
  const byId = records && new Map(records.map(record => [record.id, record]));
  for (const [id, tag] of tags) {
    if (!Array.isArray(tag.subjects) || !tag.subjects.length) problems.push(`${id}: no subjects`);
    for (const subject of tag.subjects || []) if (!SUBJECT_IDS.has(subject)) problems.push(`${id}: unknown subject ${subject}`);
    if (new Set(tag.subjects).size !== tag.subjects?.length) problems.push(`${id}: repeated subject`);
    if (!TAG_STATUSES.includes(tag.status)) problems.push(`${id}: bad status ${tag.status}`);
    if (!TAG_METHODS.includes(tag.method)) problems.push(`${id}: bad method ${tag.method}`);
    if (typeof tag.hash !== 'string' || !/^[0-9a-f]{16}$/.test(tag.hash)) problems.push(`${id}: bad hash`);
    if (tag.status === 'confirmed' && tag.method === 'rule') problems.push(`${id}: a rule suggestion cannot be confirmed without a reviewer`);
    if (byId && !byId.has(id)) problems.push(`${id}: no such record`);
    else if (byId && tag.hash !== recordTextHash(byId.get(id))) problems.push(`${id}: stale, the record text changed`);
  }
  return problems;
}

/**
 * What subject routing would do with this question. Diagnostic only: nothing here
 * changes an answer. Unrecognised questions stay on the existing rules.
 */
export function subjectShadow({question, parsed, candidates, claims, tags, includeProposed = false}) {
  const subjects = questionSubjects(question, parsed.intents.length ? parsed.intents : null);
  const current = claims.map(claim => claim.evidenceId);
  if (!subjects.length) return {subjects, decision: 'existing_rules', wouldCite: current, current, changed: false};
  const onSubject = candidates.filter(record => subjectsOfRecord(record, tags, {includeProposed}).some(subject => subjects.includes(subject)));
  const live = onSubject.filter(record => record.available);
  const wouldCite = live.slice(0, 2).map(record => record.id);
  const decision = live.length ? 'tagged_record' : onSubject.length ? 'awaiting_review' : 'no_tagged_record';
  return {subjects, decision, wouldCite, current, changed: wouldCite.join() !== current.join()};
}
