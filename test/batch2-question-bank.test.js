import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTION_BANK_BATCH_2,
  resolveQuestionBankItem,
  searchQuestionBankBatch2,
  getQuestionBankBatch2Stats
} from '../src/global-immigration-question-bank-resolver.js';
import { answer } from '../src/engine.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('Global Immigration Question Bank Batch 2: Integrity and Coverage', () => {
  assert.equal(QUESTION_BANK_BATCH_2.length, 200, 'Batch 2 must contain exactly 200 questions');
  const stats = getQuestionBankBatch2Stats();
  assert.equal(stats.totalQuestions, 200);
  assert.equal(stats.range, '1701 - 1900');

  const expectedCategories = [
    'A. Immigration Litigation and Judicial Review',
    'B. Immigration Fraud Detection and Document Verification',
    'C. Digital Identity and Immigration Technology',
    'D. International Taxation and Immigration Residency',
    'E. Business, Investor and Entrepreneur Immigration',
    'F. Geopolitical Disruptions and International Mobility',
    'G. Immigration Compliance and Regulatory Conflicts',
    'H. Immigration and International Family Law',
    'I. Immigration Research, Statistics and Policy Evaluation',
    'J. Extreme Hypothetical and Advanced Logical Scenarios'
  ];

  for (const cat of expectedCategories) {
    assert.equal(stats.categories[cat], 20, `Category ${cat} must contain exactly 20 questions`);
  }

  // Verify all items have complete metadata
  for (const item of QUESTION_BANK_BATCH_2) {
    assert.ok(item.id >= 1701 && item.id <= 1900, `Item ID ${item.id} out of range`);
    assert.ok(item.question && item.question.length > 10, `Item ${item.id} missing question`);
    assert.ok(item.statutoryRule && item.statutoryRule.length > 20, `Item ${item.id} missing statutory rule`);
    assert.ok(item.citation && item.citation.length > 5, `Item ${item.id} missing citation`);
    assert.ok(item.verdict && item.verdict.length > 10, `Item ${item.id} missing verdict`);
  }
});

test('Hallucination Trap Inoculation: 12 Landmark Precedents & Statutory Realities', () => {
  // Trap 1 & 2: Processing delay & cancellation financial losses (1701, 1707)
  const q1701 = resolveQuestionBankItem(1701);
  assert.match(q1701.citation, /Cooper v Hobart/i);
  assert.match(q1701.verdict, /No monetary liability/i);
  assert.match(q1701.statutoryRule, /Mandamus/i);

  const q1707 = resolveQuestionBankItem(1707);
  assert.match(q1707.citation, /Federal Courts Act RSC 1985 c F-7 s\. 18\.1/i);
  assert.match(q1707.verdict, /financial damages are barred/i);

  // Trap 3: Secret evidence / national security (1703)
  const q1703 = resolveQuestionBankItem(1703);
  assert.match(q1703.citation, /Charkaoui v Canada/i);
  assert.match(q1703.statutoryRule, /Special Advocate/i);

  // Trap 4: Legitimate expectations from policy announcements (1710)
  const q1710 = resolveQuestionBankItem(1710);
  assert.match(q1710.citation, /Mount Sinai Hospital Center/i);
  assert.match(q1710.verdict, /procedural rights to be heard only/i);

  // Trap 5: Misleading published guidance estoppel (1717)
  const q1717 = resolveQuestionBankItem(1717);
  assert.match(q1717.citation, /Western Fish Products/i);
  assert.match(q1717.statutoryRule, /Estoppel Does Not Lie Against the Crown/i);
  assert.match(q1717.verdict, /not bound by erroneous web guidance/i);

  // Trap 6: Translation agency error liability (1728)
  const q1728 = resolveQuestionBankItem(1728);
  assert.match(q1728.citation, /Medel v Canada/i);
  assert.match(q1728.statutoryRule, /Strict Statutory Liability/i);

  // Trap 7: Automated fraud risk scoring disclosure (1738)
  const q1738 = resolveQuestionBankItem(1738);
  assert.match(q1738.statutoryRule, /Access to Information/i);
  assert.match(q1738.verdict, /exempt from disclosure/i);

  // Trap 8: Biometrics privacy refusal (1743)
  const q1743 = resolveQuestionBankItem(1743);
  assert.match(q1743.statutoryRule, /IRPA s\. 10\.01/i);
  assert.match(q1743.verdict, /mandatory application rejection/i);

  // Trap 9: Blockchain educational credentials (1747)
  const q1747 = resolveQuestionBankItem(1747);
  assert.match(q1747.citation, /Lisbon Recognition Convention/i);
  assert.match(q1747.verdict, /No independent legal standing/i);

  // Trap 10: PR triggering worldwide tax liability (1763)
  const q1763 = resolveQuestionBankItem(1763);
  assert.match(q1763.citation, /7701\(b\)/i);
  assert.match(q1763.verdict, /Only in the US/i);

  // Trap 11: Foreign tax credits double taxation elimination (1771)
  const q1771 = resolveQuestionBankItem(1771);
  assert.match(q1771.citation, /Income Tax Act s\. 126/i);
  assert.match(q1771.verdict, /residual double taxation/i);

  // Trap 12: Climate displacement refugee status (1814)
  const q1814 = resolveQuestionBankItem(1814);
  assert.match(q1814.citation, /Teitiota v New Zealand/i);
  assert.match(q1814.verdict, /Not an independent refugee status/i);

  // Additional Trap: Representative fraud error (1840)
  const q1840 = resolveQuestionBankItem(1840);
  assert.match(q1840.statutoryRule, /IRPA s\. 40/i);
  assert.match(q1840.verdict, /Applicant is strictly liable/i);
});

test('Legal Evasion Inoculation: Concrete Standards & Landmark Multi-Factor Tests', () => {
  // 1702: Discretion vs Arbitrary Decision
  const q1702 = resolveQuestionBankItem(1702);
  assert.match(q1702.citation, /Canada \(Minister of Citizenship and Immigration\) v Vavilov/i);
  assert.match(q1702.statutoryRule, /justified, intelligible, and transparent/i);

  // 1704: Proportionality Standard
  const q1704 = resolveQuestionBankItem(1704);
  assert.match(q1704.citation, /Doré v Barreau du Québec/i);
  assert.match(q1704.statutoryRule, /R v Oakes/i);

  // 1708: Conflicting Tribunal vs Binding Court Judgment
  const q1708 = resolveQuestionBankItem(1708);
  assert.match(q1708.statutoryRule, /Stare decisis/i);
  assert.match(q1708.verdict, /ultra vires/i);

  // 1714: Conflicting Expert Opinions
  const q1714 = resolveQuestionBankItem(1714);
  assert.match(q1714.citation, /R v Mohan/i);
  assert.match(q1714.statutoryRule, /1\.\s*Relevance;\s*2\.\s*Necessity;\s*3\.\s*Absence of exclusionary rule;\s*4\.\s*Properly qualified expert/i);

  // 1744: Automated Processing & Human Review Rights
  const q1744 = resolveQuestionBankItem(1744);
  assert.match(q1744.statutoryRule, /Directive on Automated Decision-Making/i);
  assert.match(q1744.citation, /EU AI Act/i);

  // 1762: Tax Treaty Tie-Breaker
  const q1762 = resolveQuestionBankItem(1762);
  assert.match(q1762.citation, /OECD Model Tax Convention.*Article 4\(2\)/i);
  assert.match(q1762.statutoryRule, /cent(er|re) of vital interests/i);
});

test('Methodological & Scope Guidance: Category I Econometric Questions', () => {
  // 1861: Selection Bias in Refusal Rate
  const q1861 = resolveQuestionBankItem(1861);
  assert.match(q1861.statutoryRule, /Heckman two-stage selection corrections/i);

  // 1862: Survivor Bias in Administrative Processing Times
  const q1862 = resolveQuestionBankItem(1862);
  assert.match(q1862.statutoryRule, /Survivor Bias in Administrative Data/i);

  // 1864: Counterfactual Synthetic Controls
  const q1864 = resolveQuestionBankItem(1864);
  assert.match(q1864.statutoryRule, /Counterfactual Synthetic Controls/i);

  // 1865: Difference-in-Differences Policy Natural Experiments
  const q1865 = resolveQuestionBankItem(1865);
  assert.match(q1865.statutoryRule, /Difference-in-Differences \(DiD\) Analysis/i);
});

test('Search & Filter Question Bank Batch 2', () => {
  const allResults = searchQuestionBankBatch2({ limit: 50 });
  assert.equal(allResults.total, 200);
  assert.equal(allResults.items.length, 50);

  // Filter by category
  const taxResults = searchQuestionBankBatch2({ category: 'Taxation' });
  assert.equal(taxResults.total, 20);
  assert.ok(taxResults.items.every(item => item.category.includes('Taxation')));

  // Search by text
  const cooperResults = searchQuestionBankBatch2({ query: 'Cooper v Hobart' });
  assert.ok(cooperResults.total >= 1);
  assert.equal(cooperResults.items[0].id, 1701);

  // Pagination offset
  const page2 = searchQuestionBankBatch2({ limit: 10, offset: 10 });
  assert.equal(page2.items.length, 10);
  assert.equal(page2.offset, 10);
  assert.equal(page2.items[0].id, 1711);
});

test('Engine Answer Integration: Direct Resolution of Question Bank Queries', () => {for(const id of [1701,1814,1703]){const result=answer({question:'Explain question '+id,questionBankId:id},[]);assert.equal(result.questionBankMatch.id,id);assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);assert.equal(result.verification.editorReviewedClaims,0);assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'));assert.equal(result.status,'unavailable');}});

test('HTTP API Endpoints: /v1/question-bank/batch2, /v1/question-bank/batch2/stats, and /v1/question-bank/batch2/:id', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-admin-token-at-least-24-chars-long');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. GET /v1/question-bank/batch2/stats
    const statsRes = await fetch(`${baseUrl}/v1/question-bank/batch2/stats`);
    assert.equal(statsRes.status, 200);
    const stats = await statsRes.json();
    assert.equal(stats.totalQuestions, 200);
    assert.equal(stats.range, '1701 - 1900');
    assert.equal(Object.keys(stats.categories).length, 10);

    // 2. GET /v1/question-bank/batch2 (all items with pagination)
    const listRes = await fetch(`${baseUrl}/v1/question-bank/batch2?limit=15&offset=0`);
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.total, 200);
    assert.equal(listData.limit, 15);
    assert.equal(listData.offset, 0);
    assert.equal(listData.items.length, 15);
    assert.equal(listData.items[0].id, 1701);

    // 3. GET /v1/question-bank/batch2 with query filter
    const searchRes = await fetch(`${baseUrl}/v1/question-bank/batch2?q=Charkaoui`);
    assert.equal(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.ok(searchData.total >= 1);
    assert.equal(searchData.items[0].id, 1703);

    // 4. GET /v1/question-bank/batch2 with category filter
    const catRes = await fetch(`${baseUrl}/v1/question-bank/batch2?category=Litigation`);
    assert.equal(catRes.status, 200);
    const catData = await catRes.json();
    assert.equal(catData.total, 20);

    // 5. GET /v1/question-bank/batch2/:id for valid item (1701)
    const item1701Res = await fetch(`${baseUrl}/v1/question-bank/batch2/1701`);
    assert.equal(item1701Res.status, 200);
    const item1701Data = await item1701Res.json();
    assert.equal(item1701Data.item.id, 1701);
    assert.match(item1701Data.item.citation, /Cooper v Hobart/i);

    // 6. GET /v1/question-bank/batch2/:id for valid item (1814)
    const item1814Res = await fetch(`${baseUrl}/v1/question-bank/batch2/1814`);
    assert.equal(item1814Res.status, 200);
    const item1814Data = await item1814Res.json();
    assert.equal(item1814Data.item.id, 1814);
    assert.match(item1814Data.item.citation, /Teitiota/i);

    // 7. GET /v1/question-bank/batch2/:id for non-existent item (9999)
    const notFoundRes = await fetch(`${baseUrl}/v1/question-bank/batch2/9999`);
    assert.equal(notFoundRes.status, 404);
    const notFoundData = await notFoundRes.json();
    assert.equal(notFoundData.code, 'question_not_found');
    assert.match(notFoundData.error, /Question not found/i);

  } finally {
    server.close();
  }
});
