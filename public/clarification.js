// Supported pilot cities. Order matches the geographic grouping used in the UI.
const CITIES = ['Toronto', 'Mississauga', 'Brampton', 'Vancouver'];

/**
 * Decide which city-choice buttons to show.
 * Only when the answer is a clarification and the only missing slot is location.
 * Never shows choices when the question already names a conflicting/unsupported place,
 * because a chosen city must never overwrite that information.
 *
 * @param {any} result - The answer object from /v1/answers
 * @returns {string[]}
 */
export function locationChoices(result) {
  if (result?.status !== 'clarification') return [];
  if (result.parsed?.missingSlots?.includes('location') !== true) return [];
  if (result.parsed?.ambiguous) return [];
  if (result.parsed?.city) return [];
  if (result.parsed?.region) return [];
  return [...CITIES];
}

/**
 * Build a follow-up request after the user picks a city.
 * Validates the choice before sending so the client never asks the server
 * for something it will reject anyway.
 *
 * @param {object} original - {question} of the unanswered request
 * @param {any} result - the clarification answer (only used for validation)
 * @param {string} city - one of the supported pilot cities
 * @returns {{question:string,city:string,language:'en'}}
 */
export function locationFollowUp(original, result, city) {
  if (!locationChoices(result).includes(city)) {
    throw new Error('Edit the question to resolve conflicting or unsupported locations.');
  }
  if (typeof original?.question !== 'string' || !original.question.trim()) {
    throw new Error('The original question is required.');
  }
  return { question: original.question, city, language: 'en' };
}
