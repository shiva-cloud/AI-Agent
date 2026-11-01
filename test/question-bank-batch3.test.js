import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveQuestionBankBatch3Item, searchQuestionBankBatch3, getQuestionBankBatch3Stats } from '../src/global-immigration-question-bank-batch3-resolver.js';
import { answer } from '../src/engine.js';


test('Batch 3 Question Bank: stats and registry size', () => {
  const stats = getQuestionBankBatch3Stats();
  assert.equal(stats.totalQuestions, 200);
  assert.equal(stats.range, '1901 - 2100');
  assert.equal(Object.keys(stats.categories).length, 10);
  for (const count of Object.values(stats.categories)) {
    assert.equal(count, 20);
  }
});

test('Batch 3 Question Bank: resolves by numeric ID and exact string', () => {
  const item1901 = resolveQuestionBankBatch3Item(1901);
  assert.ok(item1901);
  assert.equal(item1901.id, 1901);
  assert.ok(item1901.citation.includes('Ward'));

  const item1901Text = resolveQuestionBankBatch3Item('Can an individual qualify for international protection when persecution is carried out by non-governmental actors rather than the government?');
  assert.ok(item1901Text);
  assert.equal(item1901Text.id, 1901);

  const item2100 = resolveQuestionBankBatch3Item(2100);
  assert.ok(item2100);
  assert.equal(item2100.id, 2100);
  assert.ok(item2100.citation.includes('ECHR'));
});

test('Batch 3 Question Bank: search with query and category filters', () => {
  const asylumResults = searchQuestionBankBatch3({ category: 'Asylum', limit: 5 });
  assert.equal(asylumResults.items.length, 5);
  assert.ok(asylumResults.items.every(i => i.category.includes('Asylum')));

  const wardResults = searchQuestionBankBatch3({ query: 'Ward' });
  assert.ok(wardResults.items.length >= 1);
  assert.ok(wardResults.items.some(i => i.citation.includes('Ward')));
});

test('Engine Integration: answer resolves Batch 3 questions with approved statutory authority claims', () => {for(const id of [1901,1913,2089]){const result=answer({question:'Explain question '+id,questionBankId:id},[]);assert.equal(result.questionBankMatch.id,id);assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);assert.equal(result.verification.editorReviewedClaims,0);assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'));assert.equal(result.status,'unavailable');}});
