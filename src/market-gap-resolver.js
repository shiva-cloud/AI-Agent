// Shared lookup, search and statistics for the market-gap question catalogs.
// Each batch supplies its items (src/market-gap/batchN.json), its ID range and the
// scenario phrases that identify a question when no exact text match exists.
import { readFileSync } from 'node:fs';

export function loadMarketGapItems(file) {
  return Object.freeze(JSON.parse(readFileSync(new URL(`./market-gap/${file}`, import.meta.url), 'utf8')));
}

function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase()
    .replace(/[\s\p{P}]+/gu, ' ')
    .trim();
}

export function createMarketGapBatch({ items, first, last, scenarios }) {
  const itemById = new Map();
  const itemByNormalizedQuestion = new Map();
  for (const item of items) {
    itemById.set(item.id, item);
    itemByNormalizedQuestion.set(normalizeText(item.question), item);
  }
  const inRange = id => id >= first && id <= last;

  // Matched item for a numeric ID or question string, or null.
  function resolve(queryOrId) {
    if (queryOrId === undefined || queryOrId === null) return null;

    // 1. Direct numeric ID lookup
    if (typeof queryOrId === 'number' || /^\d+$/.test(String(queryOrId).trim())) {
      const id = Number(queryOrId);
      return inRange(id) ? itemById.get(id) || null : null;
    }

    // 2. Prefixed ID inside text (e.g. "GMS-MKT-Q80001"). A bare number inside a
    // question is never an ID: salaries and amounts like 80500 must not select a catalog item.
    const idMatch = String(queryOrId).match(/\bGMS-MKT-Q(\d{5})\b/i);
    if (idMatch && inRange(Number(idMatch[1]))) {
      const item = itemById.get(Number(idMatch[1]));
      if (item) return item;
    }

    const cleanQ = normalizeText(queryOrId);
    if (!cleanQ || cleanQ.length < 20) return null;

    // 3. Exact normalized question match
    const exact = itemByNormalizedQuestion.get(cleanQ);
    if (exact) return exact;

    // 4. Substring match with bounded length
    if (cleanQ.length >= 35) {
      for (const item of items) {
        const norm = normalizeText(item.question);
        if (norm.includes(cleanQ) || cleanQ.includes(norm)) return item;
      }
    }

    // 5. Scenario phrase, preferring the item for the country the question names
    for (const s of scenarios) {
      if (s.pattern.test(queryOrId)) {
        for (let id = s.range[0]; id <= s.range[1]; id++) {
          const candidate = itemById.get(id);
          if (candidate && cleanQ.includes(candidate.country.toLowerCase())) return candidate;
        }
        return itemById.get(s.range[0]) || null;
      }
    }

    return null;
  }

  function search(params = {}) {
    const safeParams = (params && typeof params === 'object') ? params : {};
    const { query, country, topic, limit = 20, offset = 0 } = safeParams;
    let results = items;
    if (country) {
      const cLower = country.toLowerCase().trim();
      results = results.filter(i => i.country.toLowerCase() === cLower);
    }
    if (topic) {
      const tLower = topic.toLowerCase().trim();
      results = results.filter(i => i.topic.toLowerCase() === tLower);
    }
    if (query && query.trim().length > 0) {
      const norm = normalizeText(query);
      results = results.filter(i =>
        normalizeText(i.question).includes(norm) ||
        i.citation.toLowerCase().includes(norm) ||
        i.statutoryRule.toLowerCase().includes(norm) ||
        i.verdict.toLowerCase().includes(norm) ||
        String(i.id).includes(norm)
      );
    }
    return { total: results.length, offset, limit, items: results.slice(offset, offset + limit) };
  }

  function stats() {
    const byTier = {};
    const byTopic = {};
    const byScenario = {};
    const byCountry = {};
    for (const item of items) {
      byTier[item.tier] = (byTier[item.tier] || 0) + 1;
      byTopic[item.topic] = (byTopic[item.topic] || 0) + 1;
      byScenario[item.scenarioName] = (byScenario[item.scenarioName] || 0) + 1;
      byCountry[item.country] = (byCountry[item.country] || 0) + 1;
    }
    return {
      totalQuestions: items.length,
      range: `${first} - ${last}`,
      tiers: byTier,
      topics: byTopic,
      scenarios: byScenario,
      totalCountries: Object.keys(byCountry).length
    };
  }

  return { resolve, search, stats };
}
