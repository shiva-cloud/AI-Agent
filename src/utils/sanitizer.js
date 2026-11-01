/**
 * Input sanitization and bounded text helpers for settlement tools
 */

export function boundedText(val, fallbackOrMax = '', maxLength = 100) {
  let fallback = '';
  let limit = 100;
  if (typeof fallbackOrMax === 'number') {
    limit = fallbackOrMax;
    fallback = '';
  } else if (typeof fallbackOrMax === 'string') {
    fallback = fallbackOrMax;
    limit = typeof maxLength === 'number' ? maxLength : 100;
  }
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, limit);
}

export function sanitizeText(val, maxLength = 1000) {
  if (typeof val !== 'string') return '';
  return val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}
