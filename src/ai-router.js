import { resolveAIPolicy } from './ai-policy.js';
import { readProviderResponse, discardProviderResponse } from './provider-response.js';
import { sanitizeZeroPII } from './community-translation-ledger.js';

export function sanitizePayloadPii(data) {
  if (!data) return data;
  if (typeof data === 'string') return sanitizeZeroPII(data);
  if (Array.isArray(data)) return data.map(sanitizePayloadPii);
  if (typeof data === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      out[k] = sanitizePayloadPii(v);
    }
    return out;
  }
  return data;
}

/**
 * Round-Robin AI Router with Instant Failover
 *
 * Features:
 * - Round-robin rotation across all configured AI providers
 * - Instant failover: if one provider fails / times out, the next is tried immediately
 * - Rate-limit detection (HTTP 429 / quota errors) with automatic cooldown
 * - Configurable per-provider timeout
 * - All providers expose a unified `complete({stage, instructions, data, signal})` interface
 */

// ── Provider definitions ────────────────────────────────────────────────

export const PINNED_MODELS = {
  claude_sonnet: 'anthropic/claude-3.5-sonnet-20241022',
  claude_haiku: 'anthropic/claude-3.5-haiku-20241022',
  gemini_flash: 'google/gemini-1.5-flash-002',
  gemini_pro: 'google/gemini-1.5-pro-002',
  gpt_4o_mini: 'openai/gpt-4o-mini-2024-07-18',
  ollama_llama3: 'llama3:8b-instruct'
};

export function makeOllamaProvider(endpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434', model = PINNED_MODELS.ollama_llama3, fetchImpl = fetch) {
  const url = `${endpoint.replace(/\/$/, '')}/api/chat`;
  return {
    name: 'ollama-local',
    model,
    cooldownUntil: 0,
    consecutiveFailures: 0,
    async complete({ stage, instructions, data, signal, timeoutMs = 25000 }) {
      const controller = new AbortController();
      const combined = combineSignals(signal, controller.signal);
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(url, {
          method: 'POST', redirect: 'error', signal: combined,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            stream: false,
            format: 'json',
            options: { temperature: stage === 'rewrite' ? 0.3 : 0.0 },
            messages: [
              { role: 'system', content: `${instructions} Output valid JSON conforming strictly to the requested schema.` },
              { role: 'user', content: JSON.stringify(sanitizePayloadPii(data)) }
            ]
          })
        });
        if (!response.ok) {
          discardProviderResponse(response);
          this.consecutiveFailures++;
          this.cooldownUntil = Date.now() + Math.min(300000, 30000 * Math.pow(2, this.consecutiveFailures));
          throw new Error(`Ollama HTTP ${response.status}`);
        }
        const parsedBody = await readProviderResponse(response, combined);
        const messageContent = parsedBody?.message?.content;
        if (!messageContent) throw new Error('Empty response from Ollama model');
        const jsonContent = JSON.parse(messageContent.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/u, '$1'));
        this.consecutiveFailures = 0;
        return jsonContent;
      } catch (err) {
        this.consecutiveFailures++;
        this.cooldownUntil = Date.now() + Math.min(300000, 30000 * Math.pow(2, this.consecutiveFailures));
        throw err;
      } finally {
        clearTimeout(timer);
      }
    }
  };
}

function makeAnyRouterProvider(apiKey, fetchImpl = fetch) {
  const endpoint = 'https://anyrouter.dev/api/v1/chat/completions';
  return {
    name: 'anyrouter-free',
    cooldownUntil: 0,   // epoch ms – 0 means available
    async complete({ stage, instructions, data, signal, timeoutMs = 30000 }) {
      const controller = new AbortController();
      const combined = combineSignals(signal, controller.signal);
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST', redirect: 'error', signal: combined,
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'anyrouter/free', stream: false, max_tokens: 2400,
            temperature: stage === 'rewrite' ? 0.4 : 0,
            messages: [
              { role: 'system', content: `${instructions} Return only valid JSON, without markdown fences.` },
              { role: 'user', content: JSON.stringify(sanitizePayloadPii(data)) }
            ]
          })
        });
        if (response.status === 429) { discardProviderResponse(response); this.cooldownUntil = Date.now() + 60000; throw new Error('rate_limited'); }
        if (!response.ok) { discardProviderResponse(response); throw new Error(`HTTP ${response.status}`); }
        return parseAIResponse(await readProviderResponse(response, combined));
      } finally { clearTimeout(timer); }
    }
  };
}

function makeOpenRouterProvider(apiKey, fetchImpl, models) {
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  let modelIndex = 0;
  return {
    name: 'openrouter',
    cooldownUntil: 0,
    async complete({ stage, instructions, data, signal, timeoutMs = 30000 }) {
      const controller = new AbortController();
      const combined = combineSignals(signal, controller.signal);
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const model = models[modelIndex % models.length];
      modelIndex++;
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST', redirect: 'error', signal: combined,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Settlement Intelligence'
          },
          body: JSON.stringify({
            model, stream: false, max_tokens: 2400,
            temperature: stage === 'rewrite' ? 0.4 : 0,
            messages: [
              { role: 'system', content: `${instructions} Return only valid JSON, without markdown fences.` },
              { role: 'user', content: JSON.stringify(sanitizePayloadPii(data)) }
            ]
          })
        });
        if (response.status === 429 || response.status === 402) {
          discardProviderResponse(response);
          this.cooldownUntil = Date.now() + 60000;
          throw new Error('rate_limited');
        }
        if (!response.ok) { discardProviderResponse(response); throw new Error(`HTTP ${response.status}`); }
        return parseAIResponse(await readProviderResponse(response, combined));
      } finally { clearTimeout(timer); }
    }
  };
}

// ── Shared helpers ──────────────────────────────────────────────────────

function combineSignals(external, internal) {
  if (!external) return internal;
  // AbortSignal.any is available in Node ≥ 20
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([external, internal]);
  // Fallback for older runtimes
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  external.addEventListener('abort', onAbort, { once: true });
  internal.addEventListener('abort', onAbort, { once: true });
  return controller.signal;
}

function parseAIResponse(body) {
  const choice = body?.choices?.[0];
  if (choice?.finish_reason !== 'stop') throw new Error('Incomplete AI response');
  const content = choice.message?.content;
  if (typeof content !== 'string' || content.length > 30000) throw new Error('Invalid AI response');
  const result = JSON.parse(content.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/u, '$1'));
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Invalid AI response');
  return result;
}

// ── Round-Robin Router ──────────────────────────────────────────────────

/**
 * Create the round-robin router.
 *
 * @param {Object} opts
 * @param {string} [opts.anyRouterKey]  - AnyRouter API key (env: ANYROUTER_API_KEY)
 * @param {string} [opts.openRouterKey] - OpenRouter API key (env: OPENROUTER_API_KEY)
 * @param {Function} [opts.fetchImpl]   - custom fetch (for testing)
 * @returns {{ complete, timeoutMs, providers }}
 */
export function createAIRouter({
  anyRouterKey = process.env.ANYROUTER_API_KEY,
  openRouterKey = process.env.OPENROUTER_API_KEY,
  fetchImpl = fetch,
  allowedProviders = process.env.AI_ALLOWED_PROVIDERS,
  openRouterModels = process.env.OPENROUTER_MODELS
} = {}) {
  const policy = resolveAIPolicy({ allowedProviders, openRouterModels });
  const providers = [];

  if (policy.allowedProviders.includes('anyrouter') && anyRouterKey?.trim()) {
    providers.push(makeAnyRouterProvider(anyRouterKey, fetchImpl));
  }
  if (policy.allowedProviders.includes('openrouter') && openRouterKey?.trim()) {
    providers.push(makeOpenRouterProvider(openRouterKey, fetchImpl, policy.openRouterModels));
  }
  if (policy.allowedProviders.includes('ollama') || process.env.ENABLE_OLLAMA === 'true') {
    providers.push(makeOllamaProvider(process.env.OLLAMA_ENDPOINT, process.env.OLLAMA_MODEL, fetchImpl));
  }

  if (providers.length === 0) return {};  // disabled – same contract as old anyRouterOptions()

  let nextIndex = 0;
  const timeoutMs = 12000;

  return {
    timeoutMs,
    providers,   // exposed for observability / tests

    /**
     * Try each provider in round-robin order.
     * On failure / rate-limit, immediately try the next.
     * Throws only if ALL providers fail.
     */
    async complete({ stage, instructions, data, signal }) {
      const tried = providers.length;
      const errors = [];
      const startIndex=nextIndex++;

      for (let attempt = 0; attempt < tried; attempt++) {
        signal?.throwIfAborted();
        const provider = providers[(startIndex+attempt) % providers.length];

        // Skip providers that are in cooldown (rate-limited)
        if (provider.cooldownUntil > Date.now()) {
          errors.push({ provider: provider.name, error: 'in_cooldown' });
          continue;
        }

        try {
          const result = await provider.complete({ stage, instructions, data, signal, timeoutMs: 4000 });
          return result;
        } catch (err) {
          signal?.throwIfAborted();
          errors.push({ provider: provider.name, error: err.message });
          // Continue to next provider immediately — no delay
        }
      }

      // All providers failed; throw with combined diagnostics
      const summary = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
      throw new Error(`All AI providers failed (${summary})`);
    },

    /**
     * Race top 2 available providers in parallel (Rec 117)
     */
    async race({ stage, instructions, data, signal }) {
      const active = providers.filter(p => p.cooldownUntil <= Date.now());
      if (active.length === 0) return this.complete({ stage, instructions, data, signal });
      if (active.length === 1) return active[0].complete({ stage, instructions, data, signal, timeoutMs: 4000 });

      const raceController = new AbortController();
      const combined = combineSignals(signal, raceController.signal);
      const candidates = active.slice(0, 2);

      const promises = candidates.map(p =>
        p.complete({ stage, instructions, data, signal: combined, timeoutMs: 4000 })
      );

      try {
        const winner = await Promise.any(promises);
        raceController.abort();
        return winner;
      } catch {
        return this.complete({ stage, instructions, data, signal });
      }
    }
  };
}

// ── Backward-compatible wrapper ─────────────────────────────────────────
// Drop-in replacement for the old anyRouterOptions() used by server.js

export function aiRouterOptions(opts) {
  return createAIRouter(opts);
}
