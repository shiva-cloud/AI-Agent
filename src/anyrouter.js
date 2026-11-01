import { resolveAIPolicy } from './ai-policy.js';
import { readProviderResponse, discardProviderResponse } from './provider-response.js';

const endpoint = 'https://anyrouter.dev/api/v1/chat/completions';

export function anyRouterOptions({ apiKey = process.env.ANYROUTER_API_KEY, fetchImpl = fetch, allowedProviders = process.env.AI_ALLOWED_PROVIDERS } = {}) {
  const policy = resolveAIPolicy({ allowedProviders });
  if (!policy.allowedProviders.includes('anyrouter') || !apiKey?.trim()) return {};
  return {
    timeoutMs: 12000,
    async complete({ stage, instructions, data, signal }) {
      const response = await fetchImpl(endpoint, {
        method: 'POST', redirect: 'error', signal,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // This route is documented as free; never fall back to a paid model.
          model: 'anyrouter/free', stream: false, max_tokens: 2400,
          temperature: stage === 'rewrite' ? 0.7 : 0,
          messages: [
            { role: 'system', content: `${instructions} Return only valid JSON, without markdown fences.` },
            { role: 'user', content: JSON.stringify(data) }
          ]
        })
      });
      if (!response.ok) { discardProviderResponse(response); throw new Error('AI service unavailable'); }
      const body = await readProviderResponse(response, signal);
      const choice = body?.choices?.[0];
      if (choice?.finish_reason !== 'stop') throw new Error('Incomplete AI response');
      const content = choice.message?.content;
      if (typeof content !== 'string' || content.length > 30000) throw new Error('Invalid AI response');
      const result = JSON.parse(content.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/u, '$1'));
      if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Invalid AI response');
      return result;
    }
  };
}
