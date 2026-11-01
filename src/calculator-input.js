import { ValidationError } from './api-errors.js';

// Numeric strings remain supported for existing form/API callers. Coercions of
// null, booleans, arrays and blank strings must not invent a monetary value.
export function calculatorNumber(value, name, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
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
