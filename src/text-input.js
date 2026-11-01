// Free-text values that tools echo back (job titles, condition names, vehicle models) or
// scan (lease clauses). Non-strings fall back to the default instead of failing or
// printing "[object Object]"; control characters are removed and length is bounded.
export function boundedText(value, fallback = '', maxLength = 120) {
  let defaultVal = '';
  let limit = 120;
  if (typeof fallback === 'number') {
    limit = fallback;
    defaultVal = '';
  } else if (typeof fallback === 'string') {
    defaultVal = fallback;
    limit = typeof maxLength === 'number' ? maxLength : 120;
  }
  if (typeof value !== 'string') return defaultVal;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.slice(0, limit) : defaultVal;
}

export function safeIsoDate(val, fallback = '2026-10-31') {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const t = Date.parse(val.trim());
    if (!Number.isNaN(t)) return val.trim();
  }
  return fallback;
}

