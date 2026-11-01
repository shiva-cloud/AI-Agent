// Heuristic editorial signals, never a semantic or legal change determination.
const compareFields = ['title', 'summary', 'quote', 'url', 'topic', 'jurisdiction', 'housingSubject', 'telecomSubject', 'risk', 'effectiveFrom', 'effectiveTo', 'checkedAt', 'expiresAt'];
const dateFields = new Set(['checkedAt', 'expiresAt']);

function tokens(text, pattern) {
  if (typeof text !== 'string') return [];
  return [...new Set((text.match(pattern) || []).map(x => x.toLowerCase()))].sort();
}

function qualifierCounts(text) {
  if (typeof text !== 'string') return {};
  const out = {};
  for (const word of text.toLowerCase().match(/\b(?:not|no|unless|except|eligible|must|may|required|only)\b/g) || []) {
    out[word] = (out[word] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort());
}

export function excerptDifference(before, after) {
  if (before === null || before === undefined) return { available: false, reason: 'No earlier archived excerpt for comparison' };
  const b = String(before);
  const a = String(after ?? '');
  let prefix = 0, suffix = 0;
  while (prefix < b.length && prefix < a.length && b[prefix] === a[prefix]) prefix++;
  while (suffix < b.length - prefix && suffix < a.length - prefix && b[b.length - 1 - suffix] === a[a.length - 1 - suffix]) suffix++;
  return {
    available: true,
    changed: b !== a,
    commonPrefixCharacters: prefix,
    commonSuffixCharacters: suffix,
    before: b.slice(prefix, b.length - suffix),
    after: a.slice(prefix, a.length - suffix)
  };
}

export function assessChange(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    previous = null,
    next = {},
    previousContent = null,
    content = '',
    affectedRecordIds = []
  } = safeParams;

  const safeNext = (next && typeof next === 'object') ? next : {};
  const safeAffected = Array.isArray(affectedRecordIds) ? affectedRecordIds : [];
  const safeContent = typeof content === 'string' ? content : (content != null ? String(content) : '');

  const fields = previous
    ? compareFields.filter(field => (previous[field] ?? null) !== (safeNext[field] ?? null))
        .map(field => ({ field, before: previous[field] ?? null, after: safeNext[field] ?? null }))
    : [];

  const excerptDiff = excerptDifference(previousContent, safeContent);
  const flags = [];

  if (previousContent !== null && previousContent !== undefined) {
    if (JSON.stringify(tokens(previousContent, /\b\d+(?:[.,]\d+)*\b/g)) !== JSON.stringify(tokens(safeContent, /\b\d+(?:[.,]\d+)*\b/g))) {
      flags.push('numeric_tokens_changed');
    }
    if (JSON.stringify(qualifierCounts(previousContent)) !== JSON.stringify(qualifierCounts(safeContent))) {
      flags.push('condition_words_changed');
    }
  }

  if (fields.some(f => ['jurisdiction', 'url', 'housingSubject', 'telecomSubject'].includes(f.field))) {
    flags.push('scope_or_source_changed');
  }
  if (fields.some(f => ['effectiveFrom', 'effectiveTo'].includes(f.field))) {
    flags.push('effective_dates_changed');
  }
  if (fields.some(f => f.field === 'summary' || f.field === 'quote')) {
    flags.push('claim_text_changed');
  }

  let classification = 'new_record';
  if (previous) {
    if (fields.some(f => !dateFields.has(f.field)) || excerptDiff.changed) classification = 'content_change';
    else if (!excerptDiff.available) classification = 'baseline_excerpt_missing';
    else if (fields.length) classification = 'freshness_metadata_only';
    else classification = 'unchanged';
  }

  return {
    classification,
    priority: safeNext.risk === 'high' || previous?.risk === 'high' || flags.some(f => ['numeric_tokens_changed', 'condition_words_changed', 'scope_or_source_changed', 'effective_dates_changed'].includes(f)) ? 'high' : 'normal',
    fields,
    excerptDiff,
    flags,
    potentiallyAffectedRecordIds: [...new Set(safeAffected)].sort(),
    assessment: 'Heuristic comparison of manually supplied excerpts. Not proof of a website change, semantic equivalence or complete impact coverage.'
  };
}
