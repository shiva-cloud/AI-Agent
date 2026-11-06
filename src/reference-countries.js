// Countries outside the destination corridors where the knowledge base still holds
// a few published records about life in that country (national tax, public health,
// licensing). A question about one can use those records, labelled as limited
// coverage; everything else about the country stays out of scope.
import {destinationCountries, globalDestinations} from './destinations.js';
import {findPlaces, places} from './geography.js';

export const REFERENCE_COVERAGE_VERSION = 'reference-1';

const CORRIDORS = new Set(destinationCountries);
// Also a US state, so the name alone does not identify the country.
const HOMONYMS = new Set(['Georgia']);
const placeById = new Map(places.map(place => [place.id, place]));

function isReferenceCountryName(name) {
  if (typeof name !== 'string' || CORRIDORS.has(name) || HOMONYMS.has(name)) return false;
  const place = placeById.get(name);
  if (place) return place.type === 'country' && place.status === 'outside_canada';
  // Unregistered names may still be places inside a corridor or inside Canada.
  return !findPlaces(name).length && !globalDestinations.some(([, pattern]) => pattern.test(name));
}

// "Newcomers moving from Poland to Canada" records describe leaving that country.
// They answer an origin question (already in scope through the origin country),
// never a question about living there.
export function describesLifeInCountry(record) {
  return !/-settlement-services$/.test(record?.id || '') && !/\bmoving from\b.*\bto Canada\b/i.test(record?.summary || '');
}

// A country's few records cover one narrow subject per topic (its money records are
// about income tax, not bank deposits), so the broad topic match is not enough.
const SUBJECT_SIGNALS = Object.freeze({
  money: /\b(?:tax|taxes|taxation|taxpayer|income|vat|revenue)\b/i,
  // Not "medical" or a bare "licence": a medical inadmissibility review and a
  // regulated-profession licence are immigration and credential questions.
  health: /\b(?:health|healthcare|hospital|doctor|clinic|medicine)\b/i,
  driving: /\b(?:driving|drivers?|driver's|road test)\b/i
});
export function recordFitsSubject(record, question) {
  return SUBJECT_SIGNALS[record?.topic]?.test(question) ?? true;
}

const escapeName = name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
const countryPatterns = new Map();
function patternFor(name) {
  if (!countryPatterns.has(name)) {
    countryPatterns.set(name, new RegExp(`(?:\\b(?:in|within|inside|(?:move|moved|moving|relocate|relocated|relocating)\\s+to)\\s+(?:the\\s+)?|,\\s*)${escapeName(name)}(?![\\w-])`, 'i'));
  }
  return countryPatterns.get(name);
}

/**
 * The one reference country a question is about, or null. "From Kenya" is where
 * someone comes from, not a place named here. A Canadian place or a second
 * country makes the question something else.
 */
export function namedReferenceCountry(question, parsed, records) {
  if (typeof question !== 'string' || parsed?.country !== 'CA' || parsed.city || parsed.region) return null;
  if (/\b(?:canada|canadian)\b/i.test(question)) return null;
  const names = new Set();
  for (const record of records) {
    if (isReferenceCountryName(record?.jurisdiction) && describesLifeInCountry(record)) names.add(record.jurisdiction);
  }
  const named = [...names].filter(name => patternFor(name).test(question));
  // "Papua New Guinea" also contains "Guinea": keep only the longest overlapping name.
  const distinct = named.filter(name => !named.some(other => other !== name && other.includes(name)));
  return distinct.length === 1 ? distinct[0] : null;
}

export function referenceCoverageNotice(country) {
  return {
    version: REFERENCE_COVERAGE_VERSION,
    country,
    message: `Northstar has limited coverage for ${country}. This comes from the few official records we hold, not a full settlement guide, so check the details with the authority named here.`
  };
}
