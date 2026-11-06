/**
 * Northstar — Settlement Intelligence Platform
 * Batch 40 Verification Suite — Recommendations 666 to 680
 *
 * Covers:
 * Rec 666: Cryptographic Provenance Hash Chain & SHA-256 Ledger (Rec 110)
 * Rec 667: Knowledge Base Quality Invariants & Content Health Auditor
 * Rec 668: Core Knowledge Seeds, Multi-City Coverage & Agency Handoffs
 * Rec 669: Authoritative KYC, Bank Act s. 627.17 & FINTRAC Regulatory Dataset
 * Rec 670: Strict English Language Policy, Invisible Format & Script Guard
 * Rec 671: Client Accept-Language Header Detector & Auto-Localizer (RFC 2616)
 * Rec 672: Canadian Language Benchmark (CLB / NCLC) Conversion Engine
 * Rec 673: Lease Assignment, Subletting & Early Exit Navigator (RTA s. 95 7-Day Rule)
 * Rec 674: Residential Lease Guardian & Predatory Clause Audit Engine (RTA s. 14 & s. 105)
 * Rec 675: Statutory Legal Notice & Demand Letter Generator (LTB T2, ESA, OHSA)
 * Rec 676: Relocation Directional Country & Licence Context Disambiguation
 * Rec 677: Graceful Server Lifecycle & Connection Draining Shutdown Engine
 * Rec 678: LMIA Exemption, Wage Stream & ESDC Readiness Auditor (C16, CUSMA T23)
 * Rec 679: Outgoing Account Notification Mailer & Environment Factory
 * Rec 680: Administration API & Manage Panel Controller
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { computeProvenanceHash, createProvenanceBlock, verifyProvenanceChain, GENESIS_HASH } from '../src/kb-provenance-chain.js';
import { checkRecord, checkRecords, recordWarnings } from '../src/kb-quality.js';
import { seeds, cities, topics, topicLabels, agencies } from '../src/knowledge.js';
import { kycRecords, checkedAt as kycCheckedAt, expiresAt as kycExpiresAt } from '../src/kyc-records.js';
import { assertEnglishText, assertEnglishData } from '../src/language.js';
import { detectPreferredLanguage } from '../src/language-detector.js';
import { convertLanguageScores } from '../src/language-score-clb.js';
import { evaluateLeaseAssignmentExit, calculateDaysBetween, addDaysToDate } from '../src/lease-assignment-navigator.js';
import { auditLeaseAgreement } from '../src/lease-guard.js';
import { generateLegalNotice, NOTICE_TYPES } from '../src/legal-notice-generator.js';
import { licenceContext, originCountryContext } from '../src/licence-context.js';
import { createShutdown } from '../src/lifecycle.js';
import { evaluateLmiaReadiness } from '../src/lmia-readiness-navigator.js';
import { createMailer, mailerFromEnvironment, accountEmails } from '../src/mailer.js';
import { handleManage } from '../src/manage-api.js';

test('Rec 666: Cryptographic Provenance Hash Chain & SHA-256 Ledger — Rec 110', () => {
  // 1. Genesis block creation
  const genesis = createProvenanceBlock({
    previousHash: GENESIS_HASH,
    recordId: 'rec-001',
    data: { id: 'rec-001', title: 'First Provenance Record' },
    actor: 'admin_audit',
    timestamp: '2026-11-01T12:00:00.000Z'
  });
  assert.equal(genesis.previousHash, GENESIS_HASH);
  assert.equal(genesis.index, 0);
  assert.ok(genesis.hash && genesis.hash.length === 64);

  // 2. Chained second block
  const block2 = createProvenanceBlock({
    previousHash: genesis.hash,
    recordId: 'rec-002',
    data: { id: 'rec-002', title: 'Second Provenance Record' },
    actor: 'editor_1',
    timestamp: '2026-11-01T12:05:00.000Z'
  });
  assert.equal(block2.previousHash, genesis.hash);
  assert.ok(block2.hash && block2.hash.length === 64);

  // 3. Verification of valid chain
  const verification = verifyProvenanceChain([genesis, block2]);
  assert.equal(verification.isValid, true);
  assert.equal(verification.blockCount, 2);
  assert.equal(verification.violations.length, 0);

  // 4. Tamper detection: modifying data breaks chain
  const tamperedBlock2 = { ...block2, data: { ...block2.data, title: 'Tampered Title' } };
  const tamperedVerify = verifyProvenanceChain([genesis, tamperedBlock2]);
  assert.equal(tamperedVerify.isValid, false);
  assert.ok(tamperedVerify.violations.length > 0);

  // 5. Safe handling on null payload
  const nullHash = computeProvenanceHash({
    previousHash: GENESIS_HASH,
    recordId: 'rec-null',
    canonicalPayload: null
  });
  assert.ok(nullHash && nullHash.length === 64);
});

test('Rec 667: Knowledge Base Quality Invariants & Content Health Auditor', () => {
  // 1. Safe handling on null
  assert.deepEqual(checkRecord(null), ['invalid record object']);
  assert.deepEqual(checkRecords(null), []);
  assert.deepEqual(recordWarnings(null), []);

  // 2. Valid record check
  const validRecord = {
    id: 'test-rec-1',
    topic: 'housing',
    jurisdiction: 'ON',
    title: 'Valid Ontario Residential Tenancies Guidance',
    url: 'https://www.ontario.ca/laws/statute/06r17',
    summary: 'Under the Ontario Residential Tenancies Act 2006, landlords cannot require security deposits or charge illegal fees.',
    quote: 'Landlords cannot demand a security deposit.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2027-01-30',
    housingSubject: 'deposit'
  };
  const problems = checkRecord(validRecord);
  assert.equal(problems.length, 0);

  // 3. Identification of retired figure
  const retiredRecord = {
    ...validRecord,
    id: 'test-rec-2',
    summary: 'The previous rule stated that UK general salary threshold was £38,700 standard before recent revisions.'
  };
  const retiredProblems = checkRecord(retiredRecord);
  assert.ok(retiredProblems.some(p => p.includes('retired figure')));

  // 4. Duplicate ID detection in checkRecords
  const duplicateIssues = checkRecords([validRecord, validRecord]);
  assert.ok(duplicateIssues.some(i => i.problem === 'duplicate id'));
});

test('Rec 668: Core Knowledge Seeds, Multi-City Coverage & Agency Handoffs', () => {
  // 1. Verify 13 statutory topics and 100% label parity
  assert.equal(topics.length, 13);
  for (const topic of topics) {
    assert.ok(topicLabels[topic], `Missing human-readable label for topic ${topic}`);
  }

  // 2. Pilot cities
  assert.ok(cities.Toronto);
  assert.ok(cities.Mississauga);
  assert.ok(cities.Brampton);
  assert.ok(cities.Vancouver);

  // 3. Human handoff agencies
  assert.ok(agencies.Toronto && agencies.Toronto.length >= 2);
  assert.ok(agencies.Vancouver && agencies.Vancouver.length >= 1);
  assert.ok(agencies.national && agencies.national.length >= 2);

  // 4. Seeds array integrity
  assert.ok(Array.isArray(seeds));
  assert.ok(seeds.length >= 5);
  for (const seed of seeds) {
    assert.equal(seed.language, 'en');
    assert.ok(seed.url.startsWith('https://'));
    assert.ok(topics.includes(seed.topic));
  }
});

test('Rec 669: Authoritative KYC, Bank Act s. 627.17 & FINTRAC Regulatory Dataset', () => {
  assert.ok(Array.isArray(kycRecords));
  assert.ok(kycRecords.length >= 6);
  assert.match(kycCheckedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(kycExpiresAt, /^\d{4}-\d{2}-\d{2}$/);

  // Check Bank Act s. 627.17 record
  const bankActRecord = kycRecords.find(r => r.id === 'fintrac-banking-kyc-bank-act');
  assert.ok(bankActRecord);
  assert.equal(bankActRecord.topic, 'money');
  // Rewritten in the official page's words on 2026-11-06; that page does not cite the section.
  assert.match(bankActRecord.summary, /bank account/i);

  // Check FINTRAC $10,000 threshold record
  const fintracRecord = kycRecords.find(r => r.id === 'fintrac-large-wire-transfer-kyc');
  assert.ok(fintracRecord);
  assert.ok(fintracRecord.summary.includes('$10,000'));
});

test('Rec 670: Strict English Language Policy, Invisible Format & Script Guard', () => {
  // 1. Valid English text
  assert.equal(assertEnglishText('Hello world and welcome to Canada.'), 'Hello world and welcome to Canada.');

  // 2. Reject non-Latin characters (e.g. Cyrillic, Devanagari, Hanzi)
  assert.throws(
    () => assertEnglishText('Привет мир'),
    /must be in English/
  );
  assert.throws(
    () => assertEnglishText('नमस्ते दुनिया'),
    /must be in English/
  );

  // 3. Reject invisible formatting characters
  assert.throws(
    () => assertEnglishText('Text with \u200B zero-width space'),
    /unsupported invisible formatting/
  );

  // 4. assertEnglishData recursive validation
  assert.doesNotThrow(() => assertEnglishData({ valid: 'text', items: ['one', 'two'] }));
  assert.throws(() => assertEnglishData({ valid: 'text', items: ['valid', 'мир'] }));
});

test('Rec 671: Client Accept-Language Header Detector & Auto-Localizer — RFC 2616', () => {
  // 1. Null / empty header defaults to English
  assert.equal(detectPreferredLanguage(null).detected, 'en');
  assert.equal(detectPreferredLanguage('').detected, 'en');

  // 2. Detect French with high q-factor
  const frResult = detectPreferredLanguage('fr-CA,fr;q=0.9,en;q=0.8');
  assert.equal(frResult.detected, 'fr');
  assert.equal(frResult.isRtl, false);

  // 3. Detect Hindi
  const hiResult = detectPreferredLanguage('hi-IN,hi;q=0.9,en;q=0.5');
  assert.equal(hiResult.detected, 'hi');

  // 4. Detect Punjabi
  const paResult = detectPreferredLanguage('pa-IN,pa;q=0.95');
  assert.equal(paResult.detected, 'pa');

  // 5. Detect Arabic (RTL)
  const arResult = detectPreferredLanguage('ar-SA,ar;q=0.9,en;q=0.1');
  assert.equal(arResult.detected, 'ar');
  assert.equal(arResult.isRtl, true);
});

test('Rec 672: Canadian Language Benchmark (CLB / NCLC) Conversion Engine', () => {
  // 1. Safe handling on null
  const nullResult = convertLanguageScores(null);
  assert.equal(nullResult.accepted, false);

  // 2. IELTS General: all 6.0 = CLB 7 (Express Entry minimum)
  const ieltsClb7 = convertLanguageScores({
    test: 'ielts_general',
    reading: 6.0,
    writing: 6.0,
    listening: 6.0,
    speaking: 6.0
  });
  assert.equal(ieltsClb7.accepted, true);
  assert.equal(ieltsClb7.overallLevel, 7);
  assert.equal(ieltsClb7.milestones.expressEntryMinimumClb7, true);

  // 3. CELPIP-General direct mapping
  const celpip = convertLanguageScores({
    test: 'celpip_general',
    reading: 9,
    writing: 8,
    listening: 9,
    speaking: 8
  });
  assert.equal(celpip.accepted, true);
  assert.equal(celpip.overallLevel, 8);

  // 4. Rejection of unaccepted tests
  const academic = convertLanguageScores({ test: 'ielts_academic' });
  assert.equal(academic.accepted, false);
  assert.ok(academic.message.includes('IELTS Academic is not accepted'));
});

test('Rec 673: Lease Assignment, Subletting & Early Exit Navigator — RTA s. 95 7-Day Rule', () => {
  // 1. Safe handling on null
  const nullResult = evaluateLeaseAssignmentExit(null);
  assert.equal(typeof nullResult, 'object');

  // 2. Ontario 7-day rule: Landlord refused in principle
  const onRefusal = evaluateLeaseAssignmentExit({
    province: 'ON',
    leaseType: 'fixed_term',
    requestType: 'assignment',
    requestStage: 'refused_in_principle',
    monthlyRentCad: 2500,
    landlordDemandedPenaltyCad: 5000 // Illegal 2-month buyout penalty
  });
  assert.equal(onRefusal.isEarlyExitPermittedWithoutPenalty, true);
  assert.equal(onRefusal.resolutionVerdict, 'RIGHT_TO_TERMINATE_WITH_30_DAYS_N9');
  assert.equal(onRefusal.isIllegalPenaltyDemanded, true);
  assert.equal(onRefusal.demandedPenaltyCad, 5000);

  // 3. Ontario 7-day rule: Landlord failed to respond within 7 days
  const onNoReply = evaluateLeaseAssignmentExit({
    province: 'ON',
    leaseType: 'fixed_term',
    requestType: 'assignment',
    requestStage: 'landlord_failed_to_reply',
    daysSinceRequest: 8
  });
  assert.equal(onNoReply.isEarlyExitPermittedWithoutPenalty, true);

  // 4. Date math utilities
  assert.equal(calculateDaysBetween('2026-11-01', '2026-11-08'), 7);
  assert.equal(addDaysToDate('2026-11-01', 30), '2026-12-01');
});

test('Rec 674: Residential Lease Guardian & Predatory Clause Audit Engine — RTA s. 14 & s. 105', () => {
  // 1. Safe handling on null
  const nullResult = auditLeaseAgreement(null);
  assert.equal(typeof nullResult, 'object');

  // 2. Ontario predatory clauses: No pets + damage deposit + 3 months rent upfront
  const onAudit = auditLeaseAgreement({
    province: 'ON',
    monthlyRentCad: 2000,
    standardFormUsed: false,
    depositDemands: {
      rentDepositMonths: 3,
      damageDepositCad: 2000,
      keyDepositCad: 200
    },
    clausesPresent: ['no_pets', 'no_guests']
  });

  // Standard form remedy: Right to demand Form 2229E and withhold 1 month rent under s. 12.1(5)
  assert.equal(onAudit.standardFormStatus.isCompliant, false);
  assert.ok(onAudit.standardFormStatus.statutoryRemedy.rentWithholding);

  // Deposit violations: $4,000 excess rent + $2,000 illegal damage + $150 excess key = $6,150
  assert.equal(onAudit.depositAudit.totalUnlawfulExcessCad, 6150);

  // Clauses audit: no_pets is void under s. 14, no_guests is void under s. 22
  assert.ok(onAudit.clauseAudits.some(c => c.key === 'no_pets' && c.isLegal === false));
  assert.ok(onAudit.clauseAudits.some(c => c.key === 'no_guests' && c.isLegal === false));
});

test('Rec 675: Statutory Legal Notice & Demand Letter Generator — LTB T2, ESA, OHSA', () => {
  // 1. Rejection on missing or invalid type
  assert.throws(
    () => generateLegalNotice({ type: 'invalid_type' }),
    /Invalid or missing notice type/
  );

  // 2. Generate Ontario LTB Form T2 notice
  const t2Notice = generateLegalNotice({
    type: NOTICE_TYPES.ONTARIO_LTB_T2,
    senderName: 'Jane Tenant',
    senderAddress: '100 Queen St W, Toronto, ON',
    recipientName: 'Predatory Property Management Inc.',
    recipientAddress: '200 Bay St, Toronto, ON',
    unitAddress: 'Apt 4B, 100 Queen St W',
    incidentDate: '2026-10-31',
    issues: ['Illegal entry without 24 hours notice', 'Harassment and lock change threats']
  });
  assert.equal(typeof t2Notice, 'object');
  assert.ok(t2Notice.formalNoticeText.includes('Tenant') || t2Notice.printReadyHtml.includes('LTB Form T2'));
  assert.ok(t2Notice.printReadyHtml.includes('Ontario Residential Tenancies Act'));
  assert.ok(t2Notice.statutorySections.some(s => s.includes('RTA s. 27')));

  // 3. Generate ESA Unpaid Wages Notice
  const esaNotice = generateLegalNotice({
    type: NOTICE_TYPES.ESA_UNPAID_WAGES,
    senderName: 'John Worker',
    senderAddress: '50 Main St, Hamilton, ON',
    recipientName: 'Constructive Employer Corp',
    recipientAddress: '100 Industrial Rd, Hamilton, ON',
    totalClaimAmount: 3200,
    issues: ['Unpaid overtime pay (44+ hours)', '4% accrued vacation pay arrears']
  });
  assert.ok(esaNotice.formalNoticeText.includes('Employment Standards Act') || esaNotice.printReadyHtml.includes('Employment Standards Act'));
  assert.ok(esaNotice.formalNoticeText.includes('3200') || esaNotice.printReadyHtml.includes('3200'));
});

test('Rec 676: Relocation Directional Country & Licence Context Disambiguation', () => {
  // 1. Safe handling on null / non-string
  assert.deepEqual(licenceContext(null), { licenceCountry: null, licenceCountryAmbiguous: false, destinationText: '' });
  assert.deepEqual(originCountryContext(null), { originCountry: null, destinationText: '' });

  // 2. Licence country extraction
  const ukLicence = licenceContext('I have a UK driving license and want to drive in Toronto');
  assert.equal(ukLicence.licenceCountry, 'United Kingdom');
  assert.equal(ukLicence.licenceCountryAmbiguous, false);

  const usLicence = licenceContext('Can I exchange my California driver licence in Vancouver?');
  assert.equal(usLicence.licenceCountry, 'United States');

  // 3. Origin country extraction
  const originIndia = originCountryContext('I am moving from India to Mississauga next month');
  assert.equal(originIndia.originCountry, 'India');

  const originFrance = originCountryContext('As a newcomer from France settling in Montreal');
  assert.equal(originFrance.originCountry, 'France');
});

test('Rec 677: Graceful Server Lifecycle & Connection Draining Shutdown Engine', async () => {
  let closed = false;
  let cleanedUp = false;
  const mockServer = {
    beginDrain() {},
    closeAllConnections() {},
    closeIdleConnections() {},
    close(cb) {
      closed = true;
      cb();
    }
  };

  const shutdown = createShutdown(mockServer, {
    graceMs: 1000,
    cleanup: () => { cleanedUp = true; }
  });

  await shutdown();
  assert.equal(closed, true);
  assert.equal(cleanedUp, true);

  // Idempotent call returns same pending promise
  await shutdown();
});

test('Rec 678: LMIA Exemption, Wage Stream & ESDC Readiness Auditor — C16 & CUSMA T23', () => {
  // 1. Safe handling on null
  const nullResult = evaluateLmiaReadiness(null);
  assert.equal(typeof nullResult, 'object');

  // 2. High-wage vs Low-wage stream in Ontario (median wage = $28.39)
  const highWage = evaluateLmiaReadiness({
    province: 'ON',
    offeredHourlyWageCad: 35.00
  });
  assert.equal(highWage.wageAnalysis.stream, 'HIGH_WAGE_STREAM');
  assert.equal(highWage.wageAnalysis.provincialMedianWageCad, 28.39);

  const lowWage = evaluateLmiaReadiness({
    province: 'ON',
    offeredHourlyWageCad: 22.00,
    cmaUnemploymentOver6Percent: true
  });
  assert.equal(lowWage.wageAnalysis.stream, 'LOW_WAGE_STREAM');
  assert.ok(lowWage.riskWarnings.some(w => w.includes('CMA UNEMPLOYMENT RATE FREEZE') || w.includes('REFUSAL-TO-PROCESS')));

  // 3. Francophone Mobility C16 Exemption
  const c16Exempt = evaluateLmiaReadiness({
    province: 'ON',
    isExemptionClaimed: true,
    exemptionCode: 'C16',
    frenchProficiencyNclc: 7,
    teerCategory: 1
  });
  assert.equal(c16Exempt.exemptionAudit.isEligible, true);
  assert.equal(c16Exempt.exemptionAudit.code, 'C16');

  // 4. CUSMA Professional T23 Exemption for US/Mexican citizen
  const cusmaExempt = evaluateLmiaReadiness({
    isExemptionClaimed: true,
    exemptionCode: 'T23',
    applicantCitizenship: 'US'
  });
  assert.equal(cusmaExempt.exemptionAudit.isEligible, true);
});

test('Rec 679: Outgoing Account Notification Mailer & Environment Factory', async () => {
  // 1. Console provider mailer
  let lastOutput = '';
  const consoleMailer = createMailer({
    provider: 'console',
    write: text => { lastOutput += text; }
  });
  assert.equal(consoleMailer.provider, 'console');

  const sent = await consoleMailer.send({
    to: 'newcomer@example.com',
    subject: 'Welcome to Northstar',
    text: 'Please confirm your email address.'
  });
  assert.equal(sent, true);
  assert.ok(lastOutput.includes('newcomer@example.com'));

  // 2. Email template generators
  const verifyEmail = accountEmails.verify('https://northstar.example/verify?t=123', 24);
  assert.ok(verifyEmail.subject.includes('Confirm your email'));
  assert.ok(verifyEmail.text.includes('24 hours'));

  const resetEmail = accountEmails.reset('https://northstar.example/reset?t=456', 15);
  assert.ok(resetEmail.subject.includes('Reset your Northstar password'));
  assert.ok(resetEmail.text.includes('15 minutes'));

  // 3. mailerFromEnvironment without EMAIL_PROVIDER returns null
  assert.equal(mailerFromEnvironment({}), null);
});

test('Rec 680: Administration API & Manage Panel Controller — handleManage routes', () => {
  // Unhandled non-manage routes return null
  const unhandledGet = handleManage({
    accounts: {},
    method: 'GET',
    path: '/v1/unknown'
  });
  assert.equal(unhandledGet, null);

  const unhandledPost = handleManage({
    accounts: {},
    method: 'POST',
    path: '/v1/unknown'
  });
  assert.equal(unhandledPost, null);

  // Manage /me route
  const meRoute = handleManage({
    accounts: {},
    method: 'GET',
    path: '/v1/manage/me',
    actor: { id: 'admin-1', role: 'admin' },
    testMode: true
  });
  assert.equal(meRoute.status, 200);
  assert.equal(meRoute.body.actor.id, 'admin-1');
  assert.equal(meRoute.body.testMode, true);
});
