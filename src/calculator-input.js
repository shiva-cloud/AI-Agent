import { ValidationError } from './api-errors.js';
import { isIsoCalendarDate } from './text-input.js';

export function calculatorChoice(value, name, choices) {
  if (typeof value !== 'string' || !choices.includes(value.trim())) throw new ValidationError(`${name} must be one of ${choices.join(', ')}`);
  return value.trim();
}

export function calculatorBoolean(value, name) {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new ValidationError(`${name} must be true or false`);
}

export function calculatorDate(value, name) {
  if (typeof value !== 'string' || !isIsoCalendarDate(value.trim())) throw new ValidationError(`${name} must be a valid ISO calendar date`);
  return value.trim();
}

// Numeric strings remain supported for existing form/API callers. Coercions of
// null, booleans, arrays and blank strings must not invent a monetary value.
export function calculatorNumber(value, name, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
  if ((typeof value !== 'number' && typeof value !== 'string') ||
      (typeof value === 'string' && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))) {
    throw new ValidationError(`${name} must be a number`);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) {
    if (max < Number.MAX_SAFE_INTEGER) {
      throw new ValidationError(`${name} must be a finite ${integer ? 'integer' : 'number'} between ${min} and ${max}`);
    }
    throw new ValidationError(`${name} must be a finite ${integer ? 'integer' : 'number'} of at least ${min}`);
  }
  return number;
}
