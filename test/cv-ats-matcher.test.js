// test/cv-ats-matcher.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractJdKeywords,
  auditCvPrivacyAndStyle,
  scoreCvAgainstJd,
  normalizeAtsText
} from '../src/ats-matcher.js';

test('normalizeAtsText handles punctuation, case, and whitespace', () => {
  const input = 'Node.JS,  TypeScript / AWS & CI/CD Pipelines...';
  const out = normalizeAtsText(input);
  assert.equal(out, 'node.js typescript aws ci cd pipelines');
});

test('extractJdKeywords identifies target technical skills in job descriptions', () => {
  const jd = `
    We are seeking a Staff Engineer with expertise in TypeScript, Node.js, and PostgreSQL.
    You will lead distributed systems design on AWS, build CI/CD pipelines, and mentor engineers.
  `;
  const kw = extractJdKeywords(jd);
  assert.ok(kw.includes('typescript'));
  assert.ok(kw.includes('node.js'));
  assert.ok(kw.includes('postgresql'));
  assert.ok(kw.includes('aws'));
  assert.ok(kw.includes('distributed systems'));
  assert.ok(kw.includes('mentoring'));
  assert.ok(!kw.includes('python')); // Not in JD
});

test('auditCvPrivacyAndStyle flags illegal discrimination markers and buzzwords', () => {
  const badCv = `
    John Doe
    SIN: 123-456-789 | Date of Birth: 1994-05-12 | Marital Status: Married
    A rockstar guru who is a hard-working go-getter.
  `;
  const audit = auditCvPrivacyAndStyle(badCv);
  assert.equal(audit.privacyClean, false);
  assert.equal(audit.privacyFlags.length, 3);
  assert.ok(audit.privacyFlags.some(f => f.id === 'sin_ssn'));
  assert.ok(audit.privacyFlags.some(f => f.id === 'dob'));
  assert.ok(audit.privacyFlags.some(f => f.id === 'marital_status'));

  assert.equal(audit.buzzwordsClean, false);
  assert.ok(audit.detectedBuzzwords.includes('rockstar'));
  assert.ok(audit.detectedBuzzwords.includes('guru'));
  assert.ok(audit.detectedBuzzwords.includes('hard-working'));
  assert.ok(audit.detectedBuzzwords.includes('go-getter'));
});

test('scoreCvAgainstJd calculates accurate match score and missing keywords', () => {
  const jd = 'Senior Backend Developer: TypeScript, Node.js, Docker, Kubernetes, AWS, PostgreSQL, Redis.';
  const goodCv = `
    Software Engineer with 6 years experience in TypeScript, Node.js, and PostgreSQL.
    Deployed containerized services with Docker on AWS.
  `;

  const result = scoreCvAgainstJd({ cvText: goodCv, jdText: jd });
  assert.ok(result.targetKeywordsCount > 0);
  assert.ok(result.matched.includes('typescript'));
  assert.ok(result.matched.includes('node.js'));
  assert.ok(result.matched.includes('docker'));
  assert.ok(result.matched.includes('aws'));
  assert.ok(result.matched.includes('postgresql'));
  assert.ok(result.missing.includes('kubernetes'));
  assert.ok(result.missing.includes('redis'));

  assert.ok(result.matchScore >= 70);
  assert.equal(result.audit.privacyClean, true);
});

test('scoreCvAgainstJd flags critical privacy issues even with high match', () => {
  const jd = 'TypeScript developer needed.';
  const cvWithSin = 'TypeScript expert. SIN: 987-654-321.';
  const result = scoreCvAgainstJd({ cvText: cvWithSin, jdText: jd });
  assert.equal(result.recommendationTier, 'critical_fix');
  assert.match(result.guidance, /CRITICAL: Remove personal privacy identifiers/i);
});
