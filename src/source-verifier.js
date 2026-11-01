// Automated source check for withheld high-risk records. A record passes only
// when its official page, fetched now, contains the record's quote word for
// word and every figure in its summary. Passing records are published with
// reviewMethod 'source_verified', which the site labels as an automated check,
// never as an editor's review.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', ndash: '–', mdash: '—', hellip: '…', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', ocirc: 'ô', uuml: 'ü', ouml: 'ö', auml: 'ä', szlig: 'ß', copy: '©', reg: '®', trade: '™', middot: '·', bull: '•', pound: '£', euro: '€', shy: '' };

/** Same clean-up the editorial desk applies to pasted text. */
export function normalizeText(text) {
  return String(text)
    .replace(/[​-‏‪-‮⁠-⁯﻿­]/g, '')
    .replace(/[   ]/g, ' ')
    .replace(/[‘’‛′]/g, "'").replace(/[“”‟″]/g, '"')
    .replace(/\s+/g, ' ').trim();
}

/** Visible text of an HTML page, one block per line. */
export function htmlToText(html) {
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/?(p|div|li|ul|ol|h[1-6]|br|tr|td|th|section|article|header|footer|main|nav|table|dt|dd|blockquote)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .split('\n').map(normalizeText).filter(Boolean).join('\n');
}

// Figures a summary can state: money, percentages, plain numbers, years.
const FIGURE = /(?:[$£€]\s?)?\d[\d,]*(?:\.\d+)?\s?%?/g;
const figureKey = f => f.replace(/[$£€\s,]/g, '').replace(/\.0+$/, '');

/** Figures in the summary that the page does not contain. */
export function missingFigures(summary, pageText) {
  const page = new Set((pageText.match(FIGURE) || []).map(figureKey));
  return [...new Set((summary.match(FIGURE) || []).map(f => f.trim()))]
    .filter(f => { const k = figureKey(f); return k && !page.has(k) && !page.has(k.replace(/%$/, '')); });
}

/** A window of page text around the quote, at most `size` characters, that contains it exactly. */
export function excerptAround(pageText, quote, size = 2400) {
  const flat = normalizeText(pageText);
  const at = flat.indexOf(quote);
  if (at === -1) return null;
  const pad = Math.max(0, Math.floor((size - quote.length) / 2));
  let start = Math.max(0, at - pad), end = Math.min(flat.length, at + quote.length + pad);
  // Start and end on word boundaries so the excerpt reads cleanly.
  if (start > 0) { const s = flat.indexOf(' ', start); if (s !== -1 && s < at) start = s + 1; }
  if (end < flat.length) { const e = flat.lastIndexOf(' ', end); if (e > at + quote.length) end = e; }
  return flat.slice(start, end);
}

const ENGLISH_ONLY = /[^\p{Script=Latin}\P{L}]/u;

/**
 * Check one record against already-fetched page text.
 * Returns {ok:true, excerpt} or {ok:false, reason}.
 */
export function verifyAgainstPage(record, pageText) {
  if (!pageText) return { ok: false, reason: 'page_unavailable' };
  const quote = normalizeText(record.quote || '');
  // A page title such as "Post-study work visa" proves nothing about the summary.
  if (quote.split(' ').length < 8) return { ok: false, reason: 'quote_too_short' };
  let excerpt = excerptAround(pageText, quote);
  if (!excerpt) return { ok: false, reason: 'quote_not_on_page' };
  // The archive accepts English (Latin script) text only; drop other-script words.
  if (ENGLISH_ONLY.test(excerpt)) {
    excerpt = normalizeText(excerpt.split(' ').filter(w => !ENGLISH_ONLY.test(w)).join(' '));
    if (!excerpt.includes(quote)) return { ok: false, reason: 'quote_not_on_page' };
  }
  const missing = missingFigures(record.summary || '', normalizeText(pageText));
  if (missing.length) return { ok: false, reason: 'summary_figure_not_on_page', detail: missing.join(', ') };
  // `quote` is the record's quote with typographic quotes made plain, as stored in the excerpt.
  return { ok: true, excerpt, quote };
}

/** Fetch an official page as text. Never throws; returns null text on failure. */
export async function fetchPageText(url, { fetchImpl = fetch, timeoutMs = 20000 } = {}) {
  try {
    const res = await fetchImpl(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'NorthstarSourceCheck/1.0 (settlement information accuracy check)', Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'en' }
    });
    if (!res.ok) return { text: null, error: `http_${res.status}` };
    const type = res.headers.get('content-type') || '';
    if (!/html|text\/plain/i.test(type)) return { text: null, error: 'not_html' };
    return { text: htmlToText(await res.text()), error: null };
  } catch (e) {
    return { text: null, error: e?.name === 'TimeoutError' ? 'timeout' : 'network_error' };
  }
}
