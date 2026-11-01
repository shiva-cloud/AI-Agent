/**
 * Real-Time Crawler & Change Detection Engine
 * 
 * Supports automated polling, conditional HTTP checks (ETag / Last-Modified),
 * HTML boilerplate cleansing, and AST / lexical change detection.
 */

import { createHash } from 'node:crypto';
import { REALTIME_SOURCES } from './realtime-registry.js';
import { publicHttpsUrl } from './crawl-policy.js';
export const MAX_CRAWL_BYTES = 1024 * 1024;

export function cleanHtmlContent(rawHtml) {
  if (typeof rawHtml !== 'string') return '';
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeContentHash(text) {
  return createHash('sha256').update(typeof text === 'string' ? text : '').digest('hex');
}

/**
 * Detects whether a page is a JavaScript Single-Page Application (SPA) shell
 * that requires dynamic headless rendering to extract actual text content.
 */
export function detectSpaShell(rawHtml) {
  if (typeof rawHtml !== 'string') return false;
  if (/<(?:div|main|section)[^>]+id=["'](?:root|app|__next|main-app)["']\s*>\s*<\/(?:div|main|section)>/i.test(rawHtml)) return true;
  if (/<noscript>[^<]*(?:enable|need|requires?)\s+javascript/i.test(rawHtml)) return true;
  const cleaned = cleanHtmlContent(rawHtml);
  if (cleaned.length < 120 && (rawHtml.match(/<script\b/gi) || []).length >= 2) return true;
  return false;
}

export function extractNumericTokens(text) {
  return [...new Set((text.match(/\b\d+(?:[.,]\d+)*\b/g) || []).map(x => x.toLowerCase()))].sort();
}

export function extractConditionWords(text) {
  const words = text.toLowerCase().match(/\b(?:must|mandatory|pause|paused|halt|effective|freeze|cap|capped|quota|threshold|eligible|ineligible|require|required|increase|decrease|rate|fee)\b/g) || [];
  const counts = {};
  for (const w of words) counts[w] = (counts[w] || 0) + 1;
  return counts;
}

export function detectContentDelta(previousContent, currentContent) {
  if (previousContent === null || previousContent === undefined) {
    return {
      changed: true,
      changeType: 'initial_crawl',
      summary: 'Initial baseline snapshot established',
      numericDiff: false,
      conditionDiff: false,
      characterLengthDelta: currentContent.length
    };
  }

  if (previousContent === currentContent) {
    return {
      changed: false,
      changeType: 'no_change',
      summary: 'Content unchanged',
      numericDiff: false,
      conditionDiff: false,
      characterLengthDelta: 0
    };
  }

  const prevNums = extractNumericTokens(previousContent);
  const currNums = extractNumericTokens(currentContent);
  const numericDiff = JSON.stringify(prevNums) !== JSON.stringify(currNums);

  const prevConditions = extractConditionWords(previousContent);
  const currConditions = extractConditionWords(currentContent);
  const conditionDiff = JSON.stringify(prevConditions) !== JSON.stringify(currConditions);

  let changeType = 'content_update';
  if (numericDiff && conditionDiff) changeType = 'critical_policy_revision';
  else if (numericDiff) changeType = 'rate_or_quota_revision';
  else if (conditionDiff) changeType = 'eligibility_condition_shift';

  return {
    changed: true,
    changeType,
    summary: `Detected ${changeType}: length delta ${currentContent.length - previousContent.length} chars`,
    numericDiff,
    conditionDiff,
    characterLengthDelta: currentContent.length - previousContent.length,
    addedNumbers: currNums.filter(n => !prevNums.includes(n)),
    removedNumbers: prevNums.filter(n => !currNums.includes(n))
  };
}

/**
 * Fetches and audits a single source
 */
export async function pollSource(source, previousState = null, options = {}) {
  publicHttpsUrl(source.url);
  const fetcher = options.fetcher || (async (url, init) => {
    if (typeof fetch === 'function') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs || 8000);
      try {
        const signal=options.signal ? AbortSignal.any([controller.signal,options.signal]) : controller.signal;
        const res = await fetch(url, { ...init, signal, redirect:'error' });
        if(Number(res.headers.get('content-length'))>MAX_CRAWL_BYTES){await res.body?.cancel();throw new Error('Source exceeds size limit');}
        const cType = (res.headers.get('content-type') || '').toLowerCase();
        if (cType && (cType.includes('application/pdf') || cType.includes('application/octet-stream') || cType.includes('image/') || cType.includes('audio/') || cType.includes('video/'))) {
          await res.body?.cancel();
          throw new Error(`Unsupported binary or non-text content type: ${cType}`);
        }
        let size=0;const chunks=[];
        if(res.body)for await(const chunk of res.body){size+=chunk.length;if(size>MAX_CRAWL_BYTES)throw new Error('Source exceeds size limit');chunks.push(chunk);}
        const text = Buffer.concat(chunks).toString('utf8');
        return { status: res.status, ok: res.ok, text, headers: res.headers };
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error('No fetch implementation available');
  });

  const headers = {};
  if (previousState?.etag) headers['If-None-Match'] = previousState.etag;
  if (previousState?.lastModified) headers['If-Modified-Since'] = previousState.lastModified;

  const nowIso = new Date().toISOString();
  try {
    const res = await fetcher(source.url, { headers });
    if (res.status === 304) {
      return {
        sourceId: source.id,
        status: 'unchanged_304',
        changed: false,
        checkedAt: nowIso,
        hash: previousState?.hash || null,
        etag: previousState?.etag || null,
        lastModified: previousState?.lastModified || null
      };
    }

    if (!res.ok && res.status !== 200) {
      return {
        sourceId: source.id,
        status: `http_${res.status}`,
        changed: false,
        checkedAt: nowIso,
        error: `HTTP response ${res.status}`
      };
    }

    const contentType = ((res.headers?.get ? res.headers.get('content-type') : res.headers?.['content-type']) || '').toLowerCase();
    if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream') || contentType.includes('image/') || contentType.includes('audio/') || contentType.includes('video/'))) {
      return {
        sourceId: source.id,
        status: 'unsupported_binary',
        changed: false,
        checkedAt: nowIso,
        error: `Unsupported binary content type: ${contentType}`
      };
    }

    const rawHtml = res.text || '';
    if(Buffer.byteLength(rawHtml)>MAX_CRAWL_BYTES)throw new Error('Source exceeds size limit');
    const cleaned = cleanHtmlContent(rawHtml);
    const isSpa = detectSpaShell(rawHtml);
    if(isSpa || !cleaned.trim())return {sourceId:source.id,status:isSpa?'unsupported_spa':'empty_content',changed:false,checkedAt:nowIso};
    const hash = computeContentHash(cleaned);
    const etag = res.headers?.get ? res.headers.get('etag') : res.headers?.etag || null;
    const lastModified = res.headers?.get ? res.headers.get('last-modified') : res.headers?.['last-modified'] || null;

    if (previousState?.hash && previousState.hash === hash) {
      return {
        sourceId: source.id,
        source,
        status: 'content_identical',
        changed: false,
        checkedAt: nowIso,
        hash,
        etag,
        lastModified,
        content: cleaned,
        rawContentSample: cleaned.slice(0, 500),
        delta: { changed: false, changeType: 'no_change' },
        isSpaShell: isSpa
      };
    }

    const delta = detectContentDelta(previousState?.content ?? null, cleaned);

    return {
      sourceId: source.id,
      source,
      status: delta.changed ? 'content_changed' : 'content_identical',
      changed: delta.changed,
      checkedAt: nowIso,
      hash,
      etag,
      lastModified,
      content: cleaned,
      rawContentSample: cleaned.slice(0, 500),
      delta,
      isSpaShell: isSpa,
      renderingAdvice: isSpa ? 'Client-side SPA shell detected; recommended headless rendering pipeline for complete DOM extraction' : null
    };
  } catch (err) {
    return {
      sourceId: source.id,
      status: 'fetch_error',
      changed: false,
      checkedAt: nowIso,
      error: err.message
    };
  }
}

/**
 * Runs a crawl cycle across a batch of sources
 */
export async function runCrawlCycle(sources = REALTIME_SOURCES, stateMap = new Map(), options = {}) {
  const results = [];
  for (const source of sources) {
    const previousState = stateMap.get(source.id) || null;
    const result = await pollSource(source, previousState, options);
    results.push(result);
    if (result.hash) {
      stateMap.set(source.id, {
        hash: result.hash,
        content: result.content,
        etag: result.etag,
        lastModified: result.lastModified,
        lastCheckedAt: result.checkedAt
      });
    }
  }
  return {
    totalChecked: results.length,
    changedCount: results.filter(r => r.changed).length,
    results
  };
}
