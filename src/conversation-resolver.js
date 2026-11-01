// Confirmed multi-turn context for Northstar Settlement Intelligence (contract context-1).
// The client holds the previous turn's context and sends it back as previousContext;
// the server stores none of it. A follow-up question ("Is it free?") may inherit the
// previous topic and place, but only when the new question lacks its own, only from a
// fresh and well-formed context, and every inherited value is reported back as an
// unconfirmed assumption so the client can show it and the user can correct it.

import {normalizeEnglishQuestion} from './question-normalization.js';
import {topics, cities} from './knowledge.js';
import {globalDestinations, resolveInputCountry} from './destinations.js';
import {findPlaces} from './geography.js';
import {parse} from './engine.js';

export const CONTEXT_CONTRACT_VERSION = 'context-1';
export const CONTEXT_TTL_MS = 30 * 60 * 1000;
const CLOCK_SKEW_MS = 2 * 60 * 1000;
const MAX_QUESTION_LENGTH = 2000;

const FOLLOW_UP_PATTERNS = [
  /\b(?:how much (?:does it cost|is (?:it|the fee|the application))|what is the cost|is it free)\b/i,
  /\b(?:what documents? (?:do I need|are required|should I bring)|what to bring)\b/i,
  /\b(?:can I (?:apply|do it|register) online|is it online)\b/i,
  /\b(?:how long (?:does it take|is the wait|is processing))\b/i,
  /\b(?:where do I go|where is the office|where can I apply|where to go)\b/i,
  /\b(?:who is eligible|am I eligible|can international students? get it|can work permit holders? get it)\b/i,
  /\b(?:what if (?:it expires|I lost it|it is delayed|I don't have a job))\b/i
];

const PRONOUN_REFERENCES = /\b(?:it|that|this|there|them|the card|the permit|the licence|the license|the number)\b/i;

// Elliptical follow-ups that only make sense after a previous question: "And for my wife?",
// "What about Vancouver?", "Same for students?". Limited to short questions so a full
// question that happens to start with "and" or "what about" is not treated as a follow-up.
const ELLIPTICAL_LEADS = /^(?:and|also|what about|how about|same (?:for|in|question)|for (?:my|our|a|an|the)|in (?:toronto|mississauga|brampton|vancouver|ontario|bc|british columbia)\b)/i;
const MAX_ELLIPTICAL_WORDS = 8;

// Phrases chosen so the deterministic parser recognizes the same topic again.
const TOPIC_PHRASES = {
  sin: 'Social Insurance Number (SIN)',
  health: 'OHIP health card coverage',
  housing: 'residential tenancy rental lease',
  community: 'settlement services',
  arrival: 'first days after arrival',
  employment: 'work permit credentials',
  money: 'bank account and taxes',
  family: 'family and children services',
  telecom: 'mobile phone plan',
  groceries: 'groceries and food costs',
  driving: 'driving licence exchange',
  transit: 'public transit fares',
  childcare: 'child care'
};

const TOPIC_LABELS = {
  sin: 'Social Insurance Number', health: 'health coverage', housing: 'housing and tenancy',
  community: 'community services', arrival: 'arrival', employment: 'work and credentials',
  money: 'banking and taxes', family: 'family services', telecom: 'phone and internet',
  groceries: 'groceries', driving: 'driving', transit: 'public transit', childcare: 'child care'
};

/**
 * Checks if a user's question is a follow-up query requiring antecedent context.
 * @param {string} question
 * @returns {boolean}
 */
export function isFollowUpQuestion(question) {
  if (!question || typeof question !== 'string') return false;
  const q = question.trim();
  if (q.length < 3) return false;
  const words = q.split(/\s+/).length;
  return FOLLOW_UP_PATTERNS.some(p => p.test(q))
    || (PRONOUN_REFERENCES.test(q) && words <= 8)
    || (ELLIPTICAL_LEADS.test(q) && words <= MAX_ELLIPTICAL_WORDS);
}

function report(status, reason, assumptions = [], expiresAt = null) {
  const message = assumptions.length
    ? `Assumed from your previous question: ${assumptions.map(a => `${a.field} ${a.label}`).join(', ')}. If this is wrong, ask again and name the topic and place.`
    : null;
  return {version: CONTEXT_CONTRACT_VERSION, status, reason, assumptions, requiresConfirmation: assumptions.length > 0, message, expiresAt};
}

// Accepts only the documented fields with known values; anything else is dropped, never echoed.
function readContext(previousContext, now) {
  if (!previousContext || typeof previousContext !== 'object' || Array.isArray(previousContext)) return {error: 'invalid_context'};
  const at = typeof previousContext.at === 'string' ? Date.parse(previousContext.at) : NaN;
  if (!Number.isFinite(at)) return {error: 'missing_timestamp'};
  if (at > now.getTime() + CLOCK_SKEW_MS) return {error: 'timestamp_in_future'};
  if (now.getTime() - at > CONTEXT_TTL_MS) return {error: 'expired'};
  const rawTopic = previousContext.topic ?? (Array.isArray(previousContext.intents) ? previousContext.intents[0] : undefined);
  const topic = typeof rawTopic === 'string' && topics.includes(rawTopic) ? rawTopic : null;
  const city = typeof previousContext.city === 'string' && Object.hasOwn(cities, previousContext.city) ? previousContext.city : null;
  let country = null;
  if (typeof previousContext.country === 'string') {
    try { country = resolveInputCountry(previousContext.country); } catch { country = null; }
  }
  if (!topic && !city && !country) return {error: 'no_usable_fields'};
  return {topic, city, country: country || (city ? 'CA' : null), expiresAt: new Date(at + CONTEXT_TTL_MS).toISOString()};
}

function namesCountry(question) {
  return /\b(?:canada|canadian)\b/i.test(question) || globalDestinations.some(([, pattern]) => pattern.test(question));
}

/**
 * Resolves a follow-up question against the client-held previous turn.
 * Returns the input to answer (previousContext removed) and a context report for the response.
 *
 * @param {object} input - { question, city, country, previousContext: { topic, city, country, at } }
 * @param {Date} [now]
 * @returns {{input: object, context: object}}
 */
export function resolveConversationTurn(input, now = new Date()) {
  const {previousContext, ...rest} = input || {};
  if (typeof rest.question !== 'string') return {input: rest, context: report('ignored', 'invalid_question')};

  const previous = readContext(previousContext, now);
  if (previous.error) return {input: rest, context: report('ignored', previous.error)};

  const currentQ = normalizeEnglishQuestion(rest.question);
  if (!isFollowUpQuestion(currentQ)) return {input: rest, context: report('not_applied', 'self_contained', [], previous.expiresAt)};

  const own = parse({question: currentQ});
  const assumptions = [];
  const resolved = {...rest};

  // Place: explicit selection or a place named in the question always wins over the previous turn.
  // Any registry place counts, including ones the pilot does not cover ("What about Ottawa?").
  const hasOwnPlace = Boolean(rest.city || rest.country || own.city || own.region || namesCountry(currentQ) || findPlaces(currentQ).length);
  if (!hasOwnPlace) {
    if (previous.country) {
      resolved.country = previous.country;
      assumptions.push({field: 'country', value: previous.country, label: previous.country === 'CA' ? 'Canada' : previous.country, source: 'previous_turn'});
    }
    if (previous.city && previous.country === 'CA') {
      resolved.city = previous.city;
      assumptions.push({field: 'city', value: previous.city, label: previous.city, source: 'previous_turn'});
    }
  }

  // Topic: only when the follow-up has no recognizable topic of its own.
  if (previous.topic && own.intents.length === 0) {
    const synthesized = `${currentQ} for ${TOPIC_PHRASES[previous.topic]}`;
    if (synthesized.length <= MAX_QUESTION_LENGTH) {
      resolved.question = synthesized;
      assumptions.push({field: 'topic', value: previous.topic, label: TOPIC_LABELS[previous.topic], source: 'previous_turn'});
    }
  }

  if (!assumptions.length) return {input: rest, context: report('not_applied', 'question_has_own_context', [], previous.expiresAt)};
  return {input: resolved, context: report('applied', null, assumptions, previous.expiresAt)};
}
