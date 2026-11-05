// Conservative mechanical matching. This does not establish semantic entailment:
// the same amount can still describe a different person, condition or benefit.
const NUMBER = String.raw`\d+(?:,\d{3})*(?:\.\d+)?`;
const CURRENCY = String.raw`(?:CAD|USD|GBP|EUR|CA\$|US\$|C\$|[$£€])`;
const UNIT = String.raw`(?:(?:business|calendar)\s+days?|seconds?|minutes?|hours?|days?|weeks?|months?|years?|percent(?:age)?(?:\s+points?)?|per\s+cent|%|square\s+(?:feet|foot|metres?|meters?)|kilomet(?:er|re)s?|centimet(?:er|re)s?|met(?:er|re)s?|miles?|kilograms?|grams?|pounds?|inches|inch|feet|foot|km|cm|kg|lb|lbs)`;
const BOUND = String.raw`(?:at\s+least|at\s+most|up\s+to|more\s+than|less\s+than|minimum(?:\s+of)?|maximum(?:\s+of)?|over|under)`;
const PATTERN = String.raw`(?<![\p{L}\p{N}])(?:(?<bound>${BOUND})\s+)?(?<currency>${CURRENCY}\s*)?(?<first>-?${NUMBER})(?:\s*(?:[-–—]|to)\s*(?<last>${NUMBER}))?(?:\s*(?<suffixCurrency>CAD|USD|GBP|EUR)\b)?(?:\s*-?\s*(?<unit>${UNIT})(?![\p{L}]))?(?:\s*(?:/|per\s+)(?<rate>hours?|days?|weeks?|months?|years?)(?![\p{L}]))?`;
const currencies = { 'CA$': 'CAD', 'C$': 'CAD', 'US$': 'USD', '£': 'GBP', '€': 'EUR' };
const amount = value => value?.replaceAll(',', '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
const unitKey = value => {
  if (!value) return '';
  const normalized = value.toLowerCase().replace(/\s+/g, ' ');
  if (/^(%|percent|percentage|per cent)$/.test(normalized)) return '%';
  if (/^(kilomet(er|re)s?|km)$/.test(normalized)) return 'km';
  if (/^(centimet(er|re)s?|cm)$/.test(normalized)) return 'cm';
  if (/^met(er|re)s?$/.test(normalized)) return 'metre';
  if (/^(kilograms?|kg)$/.test(normalized)) return 'kg';
  if (/^(pounds?|lbs?)$/.test(normalized)) return 'pound';
  if (/^(feet|foot)$/.test(normalized)) return 'foot';
  if (/^inch(es)?$/.test(normalized)) return 'inch';
  if (/^square (feet|foot)$/.test(normalized)) return 'square foot';
  if (/^square met(er|re)s?$/.test(normalized)) return 'square metre';
  return normalized.replace(/s$/, '');
};
const boundKey = value => {
  const text = value?.toLowerCase().replace(/\s+/g, ' ') || '';
  if (/^(at least|minimum( of)?)$/.test(text)) return '>=';
  if (/^(at most|up to|maximum( of)?)$/.test(text)) return '<=';
  if (/^(more than|over)$/.test(text)) return '>';
  if (/^(less than|under)$/.test(text)) return '<';
  return text;
};

export function figureClaims(text) {
  return [...String(text).replaceAll('−', '-').matchAll(new RegExp(PATTERN, 'giu'))].map(match => {
    const g = match.groups;
    const prefix = g.currency?.trim().toUpperCase() || '';
    const suffix = g.suffixCurrency?.toUpperCase() || '';
    const currency = prefix === '$' && suffix ? suffix : currencies[prefix] || prefix || suffix;
    // Conflicting currency markers must never collapse to an ordinary amount.
    const conflict = suffix && currency && currency !== '$' && currency !== suffix ? suffix : '';
    return { text: match[0].trim(), key: JSON.stringify([boundKey(g.bound), currency, conflict, amount(g.first), amount(g.last) || '', unitKey(g.unit), unitKey(g.rate)]) };
  });
}

export function missingFigureClaims(summary, evidence) {
  const available = new Set(figureClaims(evidence).map(claim => claim.key));
  return [...new Set(figureClaims(summary).filter(claim => !available.has(claim.key)).map(claim => claim.text))];
}
