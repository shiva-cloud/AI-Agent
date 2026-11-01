import test from 'node:test';
import assert from 'node:assert/strict';
import { SETTLEMENT_GLOSSARY_500, getGlossaryCount, getGlossaryTerm, searchGlossary, GLOSSARY_CATEGORIES } from '../src/settlement-glossary-500.js';
import { GLOSSARY_CONCEPTS, GLOSSARY_AREAS } from '../src/glossary-concepts.js';

const LANGS = ['en', 'hi', 'pa', 'es', 'fr', 'ar'];

test('glossary keeps all 500 ids, unique, with every language filled in', () => {
  assert.equal(getGlossaryCount(), 500);
  assert.equal(new Set(SETTLEMENT_GLOSSARY_500.map(t => t.id)).size, 500);
  for (const t of SETTLEMENT_GLOSSARY_500) {
    assert.ok(GLOSSARY_CATEGORIES.includes(t.category), t.id);
    for (const l of LANGS) {
      assert.ok(t[`term_${l}`]?.trim(), `${t.id} term_${l}`);
      assert.ok(t[`def_${l}`]?.trim().length > 20, `${t.id} def_${l}`);
    }
  }
});

test('glossary carries no content-free filler definitions', () => {
  for (const t of SETTLEMENT_GLOSSARY_500) {
    assert.doesNotMatch(t.def_en, /Official statutory guidance regarding/, t.id);
    assert.doesNotMatch(t.def_es, /Directrices estatutarias oficiales sobre/, t.id);
  }
});

test('concept names are translated, not left in English', () => {
  const englishNames = GLOSSARY_CONCEPTS.map(([, name]) => name.en);
  for (const t of SETTLEMENT_GLOSSARY_500.filter(t => /_\d+$/.test(t.id))) {
    for (const l of ['hi', 'pa', 'es', 'fr', 'ar']) {
      const concept = t[`term_${l}`].split(': ').pop();
      assert.ok(!englishNames.includes(concept), `${t.id} term_${l} still English: ${concept}`);
    }
  }
});

test('earlier concept ids still resolve, with the area context for that category', () => {
  const t = getGlossaryTerm('house_appeal_right_78') || getGlossaryTerm('house_appeal_right_77');
  const any = t || SETTLEMENT_GLOSSARY_500.find(x => x.id.startsWith('house_appeal_right_'));
  assert.ok(any);
  assert.match(any.def_en, /review a decision/);
  assert.match(any.def_en, /Landlord and Tenant Board/);
  assert.equal(getGlossaryTerm('imm_verification_requirement_17').category, 'immigration');
  assert.equal(getGlossaryTerm('emp_customs_declaration_500').acronym, 'EMP-500');
  assert.equal(Object.keys(GLOSSARY_AREAS).length, 12);
  assert.equal(GLOSSARY_CONCEPTS.length, 41);
});

test('search finds concept terms by English and Hindi words and by category', () => {
  const appeal = searchGlossary({ query: 'appeal', limit: 50 });
  assert.ok(appeal.total >= 12);
  const housing = searchGlossary({ query: 'appeal', category: 'housing' });
  assert.ok(housing.terms.every(t => t.category === 'housing') && housing.total >= 1);
  const hindi = searchGlossary({ query: 'अपील', lang: 'hi' });
  assert.ok(hindi.total >= 12);
  assert.match(hindi.terms[0].definition, /अपील/);
  const emergency = searchGlossary({ query: 'shelter', category: 'emergency_safety', lang: 'pa' });
  assert.ok(emergency.total >= 1);
  assert.match(emergency.terms[0].definition, /9-1-1/);
});
