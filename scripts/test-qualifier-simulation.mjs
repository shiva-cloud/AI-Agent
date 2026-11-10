import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { parse, answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

// Test the critical regression tests from test/requested-subject.test.js:
const regressionChecks = [
  { q: 'How do I start the process for employer specific permit in Toronto?', r: { title: 'What is work?', summary: 'Wages are paid by an employer. Some visitors do not need a work permit. This does not decide whether a specific activity is work.' }, expected: false },
  { q: 'How do I start the process for employer specific permit in Toronto?', r: { title: 'What is work? Remote work for an employer outside Canada', summary: 'Wages are paid by an employer. This record does not issue work permits or decide whether a specific activity is work.' }, expected: false },
  { q: 'How do I start the process for employer specific permit in Toronto?', r: { title: 'Employer-specific work permits', summary: 'Requirements for an employer-specific permit.' }, expected: true },
  { q: 'What does rental deposit fraud mean in Canada?', expectedSubject: 'rental deposit fraud' },
  { q: 'What does SIN mean in Canada?', expectedMatch: true, r: { title: 'Social Insurance Number', summary: '' } }
];

console.log('Running sanity checks...');
for (const c of regressionChecks) {
  if (c.expectedSubject) {
    const sub = requestedSubject(c.q);
    if (sub !== c.expectedSubject) {
      console.error(`FAIL: expectedSubject "${c.expectedSubject}", got "${sub}"`);
    } else {
      console.log(`PASS: requestedSubject "${sub}"`);
    }
  } else if (c.expected !== undefined) {
    const matcher = subjectEvidenceMatcher(c.q);
    const res = matcher(c.r);
    if (res !== c.expected) {
      console.error(`FAIL: matcher expected ${c.expected}, got ${res}`);
    } else {
      console.log(`PASS: matcher check ${c.r.title.slice(0, 30)} -> ${res}`);
    }
  }
}

