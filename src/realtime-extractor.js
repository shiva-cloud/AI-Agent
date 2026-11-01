/**
 * Real-Time Policy Semantic Extractor
 * 
 * Transforms detected content diffs and government notices into structured
 * intelligence payloads and compliant Knowledge Base evidence records.
 */

import { createHash, randomUUID } from 'node:crypto';
import { assertCalendarDate } from './evidence-policy.js';
import { assertEnglishText, assertEnglishRecord } from './language.js';

const MONTHS = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

export function extractDatesFromText(text) {
  if (typeof text !== 'string') return [];
  const results = [];
  
  // ISO matches: YYYY-MM-DD
  const isoMatches = text.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
  for (const m of isoMatches) results.push(m);

  // Month DD, YYYY matches
  const proseRegex = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})\b/gi;
  let match;
  while ((match = proseRegex.exec(text)) !== null) {
    const month = MONTHS[match[1].toLowerCase()];
    const day = match[2].padStart(2, '0');
    const year = match[3];
    results.push(`${year}-${month}-${day}`);
  }

  return [...new Set(results)].filter(value=>{try{assertCalendarDate(value,'Detected date');return true;}catch{return false;}}).sort();
}

const MARKUP_LEFTOVER = /[<>{}=|\\]|https?:|www\.|href|&[a-z#0-9]+;|"/i;
const SENTENCE_HINT = /\b(?:effective|rule|policy|guideline|rate|fare|eligible|requirement)\b/i;

/**
 * Returns a readable sentence from page text for use as a quote, or null.
 * Prefers sentences that state a rule, rate or date.
 */
export function pickSourceSentence(content) {
  if (typeof content !== 'string') return null;
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  // A full stop only ends a sentence before whitespace, so "$3.40" stays whole.
  const sentences = (text.match(/(?:[^.!?]|[.!?](?=\S))+[.!?]+(?=\s|$)/g) || [])
    .map(s => s.trim())
    .filter(s => s.length >= 20 && s.length <= 240 && /[a-z]/i.test(s) && !MARKUP_LEFTOVER.test(s));
  if (!sentences.length) return null;
  const chosen = sentences.find(s => SENTENCE_HINT.test(s)) || sentences[0];
  try { assertEnglishText(chosen, 'Quote'); } catch { return null; }
  return chosen;
}

/**
 * Extracts structured intelligence from a changed crawl record
 */
export function extractPolicyDelta({ source, content, delta, simulatedInput = null }) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  // Future expiry calculation (default 30 days for low risk, 14 days for high risk)
  const expiryDate = new Date(now.getTime() + (source.risk === 'high' ? 14 : 30) * 86400000).toISOString().slice(0, 10);

  // If a simulated structured payload is provided (e.g. from an AI model completion or admin test)
  if (simulatedInput) {
    const headline = simulatedInput.headline || source.name;
    const summary = simulatedInput.summary || `Official update published by ${source.name}.`;
    const quote = simulatedInput.quote || content.slice(0, Math.min(content.length, 120)) || 'Official regulatory notice published online.';
    const effectiveFrom = simulatedInput.effectiveFrom || null;
    const effectiveTo = simulatedInput.effectiveTo || null;
    const risk = source.risk === 'high' ? 'high' : (simulatedInput.risk || source.risk || 'high');

    assertEnglishText(headline, 'Headline');
    assertEnglishText(summary, 'Summary');

    const jurisdiction = source.city || source.region || source.country || 'CA';
    const recordId = `${source.id}-${createHash('sha256').update(content + todayStr).digest('hex').slice(0, 8)}`;

    const candidateRecord = {
      id: recordId,
      topic: source.topic,
      jurisdiction,
      title: headline,
      url: source.url,
      summary,
      quote: quote.length > 300 ? quote.slice(0, 300) : quote,
      risk,
      language: 'en',
      checkedAt: todayStr,
      expiresAt: expiryDate,
      effectiveFrom,
      effectiveTo,
      status: risk === 'high' ? 'pending' : 'research_seed',
      reviewBasis: `Automated real-time regulatory monitor detected official publication from ${source.name}.`,
      crawlPolicy: 'manual_only_until_access_policy_review'
    };

    assertEnglishRecord(candidateRecord);

    const liveAlert = {
      id: `alert-${randomUUID()}`,
      sourceId: source.id,
      recordId,
      country: source.country,
      region: source.region,
      city: source.city,
      tier: source.tier,
      topic: source.topic,
      headline,
      summary,
      url: source.url,
      detectedAt: now.toISOString(),
      effectiveFrom,
      effectiveTo,
      risk,
      status: 'active'
    };

    return {
      sourceContent: content,
    candidateRecord,
      liveAlert,
      deltaMetrics: delta
    };
  }

  // Automatic heuristic extraction from content
  
  const effectiveFrom = null; // Mentioned dates are not proof of a legal effective date.

  // Quote a clean sentence from the page. Markup leftovers (attributes, URLs,
  // entities) once became quotes, which left records with nothing checkable.
  const quote = pickSourceSentence(content);

  const headline = `${source.name} Source Change Detected`;
  const subject = source.subTopic.replace(/_/g, ' ');
  const summary = quote
    ? `${source.name} changed its ${subject} page. The page now says: "${quote}" This is an automated change notice. Effective date has not been verified, so check the official page before relying on it.`
    : `${source.name} changed its ${subject} page, but no readable statement could be extracted. This automated change notice needs editorial review before use.`;

  const jurisdiction = source.city || source.region || source.country || 'CA';
  const recordId = `${source.id}-${createHash('sha256').update(content + todayStr).digest('hex').slice(0, 8)}`;

  const candidateRecord = {
    id: recordId,
    topic: source.topic,
    jurisdiction,
    title: headline,
    url: source.url,
    summary,
    // The ingestor requires a verbatim quote; without a clean sentence the record
    // carries a raw excerpt but stays pending until an editor reviews it.
    quote: quote || content.trim().slice(0, 150) || source.name,
    risk: source.risk,
    language: 'en',
    checkedAt: todayStr,
    expiresAt: expiryDate,
    effectiveFrom,
    effectiveTo: null,
    // A notice with no readable statement is never published directly.
    status: source.risk === 'high' || !quote ? 'pending' : 'research_seed',
    reviewBasis: `Automated real-time regulatory monitor detected official publication from ${source.name}.`,
    crawlPolicy: 'manual_only_until_access_policy_review'
  };

  assertEnglishRecord(candidateRecord);

  const liveAlert = {
    id: `alert-${randomUUID()}`,
    sourceId: source.id,
    recordId,
    country: source.country,
    region: source.region,
    city: source.city,
    tier: source.tier,
    topic: source.topic,
    headline,
    summary,
    url: source.url,
    detectedAt: now.toISOString(),
    effectiveFrom,
    effectiveTo: null,
    risk: source.risk,
    status: 'active'
  };

  return {
    sourceContent: content,
    candidateRecord,
    liveAlert,
    deltaMetrics: delta
  };
}
