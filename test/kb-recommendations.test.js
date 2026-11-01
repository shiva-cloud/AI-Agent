import test from 'node:test';
import assert from 'node:assert/strict';
import { queryTerms, rankLexically } from '../src/search.js';
import { extractStatutoryCitations, linkifyStatutoryCitations } from '../src/citation-linker.js';
import { auditKbRecordExpiries, flagImpendingExpiriesInDb } from '../src/kb-expiry-monitor.js';
import { createProvenanceBlock, verifyProvenanceChain, GENESIS_HASH } from '../src/kb-provenance-chain.js';
import { classifyPolicySeverity, auditStatutoryHierarchyConflict } from '../src/kb-policy-classifier.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('KB Synset Expansion: resolves newcomer colloquial queries to statutory keywords', () => {
  // Test 1: Sick toddler
  const termsSick = queryTerms('where can i take my sick toddler without paying in Brampton');
  assert.ok(termsSick.includes('health'));
  assert.ok(termsSick.includes('clinic'));

  // Test 2: Locked out by landlord
  const termsLockout = queryTerms('my landlord changed the locks and kicked me out');
  assert.ok(termsLockout.includes('eviction'));
  assert.ok(termsLockout.includes('ltb'));

  // Test 3: Unpaid overtime
  const termsOvertime = queryTerms('my employer withheld my pay and unpaid overtime');
  assert.ok(termsOvertime.includes('wage'));
  assert.ok(termsOvertime.includes('esa'));

  // Test 4: First home & FHSA
  const termsHome = queryTerms('how do i save for my first home using fhsa');
  assert.ok(termsHome.includes('fhsa'));
  assert.ok(termsHome.includes('hbp'));

  // Test 5: Overseas parental gift
  const termsGift = queryTerms('receiving an overseas gift wire transfer from my parents');
  assert.ok(termsGift.includes('gift'));
  assert.ok(termsGift.includes('fintrac'));
});

test('Statutory Citation Linker: extracts and auto-links legislative references across jurisdictions', () => {
  const sampleLegalText = 'Under IRPA s. 182, status restoration is available. In Ontario, RTA s. 120 regulates rent, while in Germany AufenthG § 20a governs Chancenkarte and US 8 CFR § 214.1 governs status.';

  const citations = extractStatutoryCitations(sampleLegalText);
  assert.ok(citations.length >= 4);

  const statutes = citations.map(c => c.statute);
  assert.ok(statutes.includes('IRPA'));
  assert.ok(statutes.includes('RTA (Ontario)'));
  assert.ok(statutes.includes('AufenthG'));
  assert.ok(statutes.includes('8 CFR'));

  // Test Markdown linkification
  const markdownLinked = linkifyStatutoryCitations(sampleLegalText, 'markdown');
  assert.ok(markdownLinked.includes('[IRPA s. 182](https://laws-lois.justice.gc.ca/eng/acts/I-2.5/section-182.html)'));
  assert.ok(markdownLinked.includes('[RTA s. 120](https://www.ontario.ca/laws/statute/06r17)'));

  // Test HTML linkification
  const htmlLinked = linkifyStatutoryCitations(sampleLegalText, 'html');
  assert.ok(htmlLinked.includes('<a href="https://laws-lois.justice.gc.ca/eng/acts/I-2.5/section-182.html"'));
});

test('KB Expiry Monitor: audits SQLite database records and flags impending expirations', () => {
  const store = openStore(':memory:');

  // Audit using today's date
  const audit = auditKbRecordExpiries(store.db, {
    referenceDate: '2026-10-31',
    warningDays: 14
  });

  assert.ok(audit.totalRecordsAudited > 0);
  assert.ok(audit.counts.compliantCount >= 0);
  assert.ok(audit.summary.includes('records'));

  // Flag impending expiries
  const flagResult = flagImpendingExpiriesInDb(store.db, {
    referenceDate: '2026-10-31',
    warningDays: 14
  });
  assert.equal(flagResult.success, true);
});

test('KB Provenance Hash Chain: constructs tamper-evident chain and detects modifications', () => {
  // 1. Genesis block
  const b0 = createProvenanceBlock({
    previousHash: GENESIS_HASH,
    recordId: 'rec-001',
    data: { title: 'IRCC Policy Manual' },
    actor: 'crawler_bot_1',
    timestamp: '2026-10-31T10:00:00Z'
  });
  assert.equal(b0.previousHash, GENESIS_HASH);
  assert.ok(b0.hash.length === 64);

  // 2. Second block chained to b0
  const b1 = createProvenanceBlock({
    previousHash: b0.hash,
    recordId: 'rec-001',
    data: { title: 'IRCC Policy Manual (Approved)' },
    action: 'editorial_approve',
    actor: 'editor_jane',
    timestamp: '2026-10-31T12:00:00Z'
  });
  assert.equal(b1.previousHash, b0.hash);

  // 3. Verify valid chain
  const validChainCheck = verifyProvenanceChain([b0, b1]);
  assert.equal(validChainCheck.isValid, true);
  assert.equal(validChainCheck.blockCount, 2);
  assert.equal(validChainCheck.violations.length, 0);

  // 4. Tamper with b0 data payload
  const tamperedB0 = { ...b0, data: { title: 'Tampered Malicious Injected Content' } };
  const tamperedChainCheck = verifyProvenanceChain([tamperedB0, b1]);
  assert.equal(tamperedChainCheck.isValid, false);
  assert.ok(tamperedChainCheck.violations.length > 0);
});

test('KB Policy Classifier: categorizes urgency tiers and detects federal-provincial conflicts', () => {
  // Test Tier 1: Critical Urgent (Border Ban)
  const critical = classifyPolicySeverity({
    title: 'Ministerial Directive: Immediate Border Flagpoling Ban on PGWP',
    summary: 'Foreign nationals are strictly prohibited from applying at ports of entry.',
    risk: 'high'
  });
  assert.equal(critical.tier, 1);
  assert.equal(critical.severity, 'CRITICAL_URGENT');
  assert.equal(critical.requiresImmediateBroadcast, true);

  // Test Tier 2: Policy Change (Wage & LICO revision)
  const policyChange = classifyPolicySeverity({
    title: 'ESDC Provincial Median Wage Threshold Update for LMIA Stream',
    summary: 'Ontario high wage stream increases to $28.39/hr.',
    risk: 'low'
  });
  assert.equal(policyChange.tier, 2);
  assert.equal(policyChange.severity, 'POLICY_CHANGE');

  // Test Hierarchy Conflict: Canada Health Act Portability vs Provincial Wait
  const healthConflict = auditStatutoryHierarchyConflict({
    subjectMatter: 'healthcare',
    provincialRule: { waitingPeriodDays: 120 } // > 90 days = violation
  });
  assert.equal(healthConflict.hasConflict, true);
  assert.equal(healthConflict.conflicts[0].conflictType, 'CANADA_HEALTH_ACT_PORTABILITY_BREACH');
});

test('HTTP API KB Endpoints: verifies /v1/kb/* contracts for citations, expiry, provenance, and policy classification', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-admin-token-at-least-24-chars-long');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. GET /v1/kb/citations
    const resCit = await fetch(`${baseUrl}/v1/kb/citations?text=IRPA+s.+182+restoration`);
    assert.equal(resCit.status, 200);
    const bodyCit = await resCit.json();
    assert.ok(bodyCit.totalCitations >= 1);
    assert.ok(bodyCit.linkifiedText.includes('laws-lois.justice.gc.ca'));

    // 2. GET /v1/kb/expiry-audit
    const resExp = await fetch(`${baseUrl}/v1/kb/expiry-audit?warningDays=14`);
    assert.equal(resExp.status, 200);
    const bodyExp = await resExp.json();
    assert.ok(bodyExp.totalRecordsAudited > 0);

    // 3. GET /v1/kb/provenance-check
    const resProv = await fetch(`${baseUrl}/v1/kb/provenance-check`);
    assert.equal(resProv.status, 200);
    const bodyProv = await resProv.json();
    assert.equal(bodyProv.isValid, true);

    // 4. POST /v1/kb/classify-policy
    const resClassify = await fetch(`${baseUrl}/v1/kb/classify-policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New CBSA Port Ban on Flagpoling',
        summary: 'Effective immediately, PGWP applicants cannot flagpole.',
        risk: 'high'
      })
    });
    assert.equal(resClassify.status, 200);
    const bodyClassify = await resClassify.json();
    assert.equal(bodyClassify.classification.tier, 1);

  } finally {
    await new Promise(res => server.close(res));
  }
});
