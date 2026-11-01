import test from 'node:test';
import assert from 'node:assert/strict';
import { isFollowUpQuestion, resolveConversationTurn, CONTEXT_TTL_MS } from '../src/conversation-resolver.js';
import { parse } from '../src/engine.js';

const now = new Date('2026-10-31T12:00:00Z');
const fresh = new Date(now.getTime() - 60_000).toISOString();

test('isFollowUpQuestion detects common follow-up query patterns', () => {
  assert.equal(isFollowUpQuestion('How much does it cost?'), true);
  assert.equal(isFollowUpQuestion('What documents do I need to bring?'), true);
  assert.equal(isFollowUpQuestion('Can I apply online?'), true);
  assert.equal(isFollowUpQuestion('How long does it take?'), true);
  assert.equal(isFollowUpQuestion('Where do I go?'), true);
  assert.equal(isFollowUpQuestion('Is it free?'), true);

  // Self-contained questions should return false
  assert.equal(isFollowUpQuestion('How do I apply for a Social Insurance Number in Toronto?'), false);
  assert.equal(isFollowUpQuestion('What are tenant rights regarding heat in Ontario?'), false);
  assert.equal(isFollowUpQuestion(''), false);
  assert.equal(isFollowUpQuestion(null), false);
});

test('follow-up inherits topic and place as reported, unconfirmed assumptions', () => {
  const { input, context } = resolveConversationTurn({
    question: 'What documents do I need to bring?',
    previousContext: { question: 'My SIN is 123 456 789', topic: 'sin', city: 'Toronto', country: 'CA', at: fresh }
  }, now);

  assert.ok(input.question.includes('Social Insurance Number'));
  assert.equal(input.city, 'Toronto');
  assert.equal(input.country, 'CA');
  assert.equal('previousContext' in input, false);
  assert.equal(context.status, 'applied');
  assert.equal(context.requiresConfirmation, true);
  assert.deepEqual(context.assumptions.map(a => a.field).sort(), ['city', 'country', 'topic']);
  assert.match(context.message, /Assumed from your previous question/);
  assert.equal(context.expiresAt, new Date(Date.parse(fresh) + CONTEXT_TTL_MS).toISOString());
  // The previous question text is never carried or echoed.
  assert.equal(JSON.stringify({ input, context }).includes('123 456 789'), false);

  const parsed = parse(input);
  assert.ok(parsed.intents.includes('sin'));
  assert.equal(parsed.city, 'Toronto');
  assert.equal(parsed.ambiguous, false);
});

test('self-contained questions inherit nothing, including place', () => {
  const { input, context } = resolveConversationTurn({
    question: 'How do I get a SIN?',
    previousContext: { topic: 'housing', city: 'Toronto', at: fresh }
  }, now);
  assert.equal(input.question, 'How do I get a SIN?');
  assert.equal(input.city, undefined);
  assert.equal(input.country, undefined);
  assert.equal(context.status, 'not_applied');
  assert.equal(context.reason, 'self_contained');
  assert.deepEqual(context.assumptions, []);
});

test('a place named or selected in the follow-up wins over the previous turn', () => {
  const named = resolveConversationTurn({ question: 'How much does it cost in Vancouver?', previousContext: { topic: 'transit', city: 'Toronto', at: fresh } }, now);
  assert.equal(named.input.city, undefined);
  assert.equal(parse(named.input).city, 'Vancouver');
  assert.deepEqual(named.context.assumptions.map(a => a.field), ['topic']);

  const otherCountry = resolveConversationTurn({ question: 'How much is it in the UK?', previousContext: { topic: 'transit', city: 'Toronto', at: fresh } }, now);
  assert.equal(otherCountry.input.city, undefined);
  assert.equal(otherCountry.input.country, undefined);

  const selected = resolveConversationTurn({ question: 'Is it free?', city: 'Brampton', previousContext: { topic: 'transit', city: 'Toronto', at: fresh } }, now);
  assert.equal(selected.input.city, 'Brampton');
  assert.equal(selected.context.assumptions.some(a => a.field === 'city'), false);
});

test('expired, future, untimestamped or malformed context is ignored, never defaulted to Canada', () => {
  const ask = previousContext => resolveConversationTurn({ question: 'Is it free?', previousContext }, now);
  const cases = [
    [{ topic: 'sin', city: 'Toronto' }, 'missing_timestamp'],
    [{ topic: 'sin', at: new Date(now.getTime() - CONTEXT_TTL_MS - 1).toISOString() }, 'expired'],
    [{ topic: 'sin', at: new Date(now.getTime() + 10 * 60_000).toISOString() }, 'timestamp_in_future'],
    [{ topic: 'sin(', city: 'Atlantis', country: 'Narnia', at: fresh }, 'no_usable_fields'],
    ['sin', 'invalid_context'],
    [['sin'], 'invalid_context']
  ];
  for (const [previousContext, reason] of cases) {
    const { input, context } = ask(previousContext);
    assert.equal(context.status, 'ignored', reason);
    assert.equal(context.reason, reason);
    assert.equal(input.question, 'Is it free?');
    assert.equal(input.country, undefined);
    assert.equal(input.city, undefined);
  }
});

test('short elliptical follow-ups are recognized; long or standalone questions are not', () => {
  for (const q of ['And for my wife?', 'What about Vancouver?', 'How about for students?', 'Same for Brampton?', 'For my kids?', 'In Brampton?', 'Also for international students?']) {
    assert.equal(isFollowUpQuestion(q), true, q);
  }
  for (const q of ['And how do I open a bank account in Toronto as a newcomer with no credit history?', 'Formal requirements for a work permit', 'Information about rent']) {
    assert.equal(isFollowUpQuestion(q), false, q);
  }

  const wife = resolveConversationTurn({ question: 'And for my wife?', previousContext: { topic: 'sin', city: 'Toronto', at: fresh } }, now);
  assert.ok(wife.input.question.includes('Social Insurance Number'));
  assert.equal(wife.input.city, 'Toronto');

  const vancouver = resolveConversationTurn({ question: 'What about Vancouver?', previousContext: { topic: 'transit', city: 'Toronto', at: fresh } }, now);
  assert.deepEqual(vancouver.context.assumptions.map(a => a.field), ['topic']);
  assert.equal(parse(vancouver.input).city, 'Vancouver');
  assert.ok(parse(vancouver.input).intents.includes('transit'));
});

test('any place named in a follow-up blocks place inheritance, including uncovered places and provinces', () => {
  for (const question of ['What about tenant rights in Ontario?', 'What about Ottawa?', 'Is it free in BC?', 'What about London?']) {
    const { input, context } = resolveConversationTurn({ question, previousContext: { topic: 'sin', city: 'Toronto', at: fresh } }, now);
    assert.equal(input.city, undefined, question);
    assert.equal(input.country, undefined, question);
    assert.equal(context.assumptions.some(a => a.field === 'city' || a.field === 'country'), false, question);
  }
  // An uncovered place still reaches the geography gate instead of being answered for Toronto.
  const ottawa = resolveConversationTurn({ question: 'What about Ottawa?', previousContext: { topic: 'sin', city: 'Toronto', at: fresh } }, now);
  assert.equal(parse(ottawa.input).ambiguous, true);
});

test('regex-like topic or city values cannot break resolution', () => {
  assert.doesNotThrow(() => resolveConversationTurn({ question: 'Is it free?', previousContext: { topic: '(', city: '[', at: fresh } }, now));
});
