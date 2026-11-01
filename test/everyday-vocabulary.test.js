import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from '../src/engine.js';

const probes = JSON.parse(readFileSync(new URL('../evaluation/everyday-vocabulary-probes.json', import.meta.url), 'utf8'));

test('everyday newcomer vocabulary is recognised as the expected topic', () => {
  const misses = probes.cases.filter(c => !parse({ question: c.question }).intents.includes(c.intent));
  assert.deepEqual(misses.map(c => c.question), []);
  assert.ok(probes.cases.length >= 50);
});

test('new vocabulary does not override geography or credential context', () => {
  // A topic is recognised, but an uncovered place still needs clarification.
  const montreal = parse({ question: 'Living in Montreal, need a doctor' });
  assert.deepEqual(montreal.intents, ['health']);
  assert.equal(montreal.ambiguous, true);

  // Pharmacy credentials stay an employment question, not a health one.
  assert.deepEqual(parse({ question: 'Which body evaluates foreign pharmacy degrees in Brampton?' }).intents, ['employment']);

  // An emergency phone number is an arrival question, not a phone plan.
  assert.equal(parse({ question: 'What is the emergency phone number in Toronto?' }).intents.includes('telecom'), false);
  assert.ok(parse({ question: 'How do I get a phone number in Toronto?' }).intents.includes('telecom'));

  // A food bank is not a bank.
  assert.deepEqual(parse({ question: 'Where is a food bank in Brampton?' }).intents, ['groceries']);
  assert.ok(parse({ question: 'How do I open a bank account in Brampton?' }).intents.includes('money'));

  // "walk in" as ordinary words is not a walk-in clinic.
  assert.deepEqual(parse({ question: 'Another uneventful afternoon walk in Toronto' }).intents, []);

  assert.equal(parse({ question: 'How do I find a family doctor in Toronto?' }).parserVersion, 'english-rules-0.12');
});
