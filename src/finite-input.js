import {ValidationError} from './api-errors.js';

// JSON.parse accepts 1e309 as Infinity. Reject it before calculators perform
// arithmetic, rather than returning JSON null for a misleading numeric result.
export function assertFiniteInput(value, depth=0) {
  if(depth>32)throw new ValidationError('Input nesting exceeds 32 levels');
  if(typeof value==='number'&&!Number.isFinite(value))throw new ValidationError('Numeric input must be finite');
  if(value&&typeof value==='object')for(const item of Object.values(value))assertFiniteInput(item,depth+1);
}
