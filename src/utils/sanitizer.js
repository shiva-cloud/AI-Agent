/**
 * Input sanitization and bounded text helpers for settlement tools
 */

export { boundedText } from '../text-input.js';

export function sanitizeText(val, maxLength = 1000) {
  if (typeof val !== 'string') return '';
  return val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[<>]/g, '').trim().slice(0, maxLength);
}
