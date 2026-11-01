import test from 'node:test';
import assert from 'node:assert/strict';
import { detectAndTranslateMultilingualQuery } from '../src/multilingual-layer.js';

test('Multilingual Layer — Accurately detects Devanagari Hindi student work question', () => {const result=detectAndTranslateMultilingualQuery('स्टूडेंट वीजा पर कितने घंटे काम कर सकते हैं?');assert.ok(result);assert.equal(result.isMultilingual,true);assert.equal(result.requiresConfirmation,true);assert.ok(result.canonicalStatutoryQuery.trim());assert.doesNotMatch(result.localizedSummary,/24 घंटे|मास्टर या पीएचडी|Unauthorized Work|तुरंत पात्र/);});

test('Multilingual Layer — Detects Hinglish query for spousal work permit', () => {const result=detectAndTranslateMultilingualQuery('kya main study visa pe biwi ko bulana chahta hu sowp milega?');assert.ok(result);assert.equal(result.isMultilingual,true);assert.equal(result.requiresConfirmation,true);assert.ok(result.canonicalStatutoryQuery.trim());assert.doesNotMatch(result.localizedSummary,/24 घंटे|मास्टर या पीएचडी|Unauthorized Work|तुरंत पात्र/);});

test('Multilingual Layer — Returns null for pure English statutory query', () => {
  const result = detectAndTranslateMultilingualQuery('What are the statutory requirements for Ontario OHIP eligibility?');
  assert.equal(result, null);
});

test('Multilingual Layer — Fallback for unmatched Devanagari provides English statutory query', () => {const result=detectAndTranslateMultilingualQuery('यह एक सामान्य प्रश्न है');assert.ok(result);assert.equal(result.isMultilingual,true);assert.equal(result.requiresConfirmation,true);assert.ok(result.canonicalStatutoryQuery.trim());assert.doesNotMatch(result.localizedSummary,/24 घंटे|मास्टर या पीएचडी|Unauthorized Work|तुरंत पात्र/);});

test('Multilingual Layer — Detects cash job / unauthorized work in Hinglish', () => {const result=detectAndTranslateMultilingualQuery('kya main cash job ya moonlighting kar sakta hu bina sin ke?');assert.ok(result);assert.equal(result.isMultilingual,true);assert.equal(result.requiresConfirmation,true);assert.ok(result.canonicalStatutoryQuery.trim());assert.doesNotMatch(result.localizedSummary,/24 घंटे|मास्टर या पीएचडी|Unauthorized Work|तुरंत पात्र/);});
