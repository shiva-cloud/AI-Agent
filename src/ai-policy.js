// Historical defaults retained for compatibility; availability is not certified.
export const DEFAULT_OPENROUTER_MODELS = Object.freeze([
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'poolside/laguna-s-2.1:free',
  'google/gemma-4-31b-it:free',
  'cohere/north-mini-code:free',
  'dots-studio/dots-3-note-preview:free'
]);

function array(value, fallback, name, valid, min, max) {
  let parsed = value ?? fallback;
  if (typeof parsed === 'string') {
    if (parsed.length > 4096) throw new Error(`Invalid ${name}`);
    try { parsed = JSON.parse(parsed); } catch { throw new Error(`Invalid ${name}`); }
  }
  if (!Array.isArray(parsed) || parsed.length < min || parsed.length > max ||
      parsed.some(item => typeof item !== 'string' || !valid(item)) || new Set(parsed).size !== parsed.length) {
    throw new Error(`Invalid ${name}`);
  }
  return Object.freeze([...parsed]);
}

export function resolveAIPolicy({ allowedProviders, openRouterModels } = {}) {
  return Object.freeze({
    allowedProviders: array(allowedProviders, ['anyrouter', 'openrouter'], 'AI_ALLOWED_PROVIDERS',
      value => ['anyrouter', 'openrouter'].includes(value), 0, 2),
    openRouterModels: array(openRouterModels, DEFAULT_OPENROUTER_MODELS, 'OPENROUTER_MODELS',
      value => value.length <= 160 && /^[a-zA-Z0-9][a-zA-Z0-9._-]*\/[a-zA-Z0-9][a-zA-Z0-9._-]*:free$/.test(value), 1, 16)
  });
}
