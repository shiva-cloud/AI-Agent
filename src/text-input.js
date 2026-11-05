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
  const cleaned = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.slice(0, limit) : defaultVal;
}

// The calendar date tools assess "as of" when the caller gives none: today in UTC,
// matching the ISO dates used everywhere else. NORTHSTAR_TODAY (YYYY-MM-DD) pins it
// for reproducible runs and tests; an invalid value is ignored.
export function todayIso(now = new Date()) {
  const pinned = process.env.NORTHSTAR_TODAY;
  if (isIsoCalendarDate(pinned)) return pinned;
  return now.toISOString().slice(0, 10);
}

export function isIsoCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

export function safeIsoDate(val, fallback = todayIso()) {
  if (typeof val === 'string' && isIsoCalendarDate(val.trim())) return val.trim();
  return fallback;
}

export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase()
    .replace(/[\s\p{P}]+/gu, ' ')
    .trim();
}


