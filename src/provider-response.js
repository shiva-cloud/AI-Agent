// Limit decoded HTTP body bytes before parsing provider-controlled JSON.
export const MAX_PROVIDER_RESPONSE_BYTES = 256 * 1024;

export function discardProviderResponse(response) {
  try { void response.body?.cancel().catch(() => {}); } catch {}
}

export async function readProviderResponse(response, signal) {
  const length = response.headers?.get('content-length');
  if (length && /^\d+$/.test(length) && Number(length) > MAX_PROVIDER_RESPONSE_BYTES) {
    discardProviderResponse(response);
    throw new Error('AI response exceeds size limit');
  }
  const reader = response.body?.getReader?.();
  if (!reader) {
    if (typeof response.json === 'function') return response.json();
    throw new Error('Missing AI response body');
  }
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', cancel, { once: true });
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let size = 0;
    let text = '';
    while (true) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      signal?.throwIfAborted();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_PROVIDER_RESPONSE_BYTES) throw new Error('AI response exceeds size limit');
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    try { return JSON.parse(text); }
    catch { throw new Error('Invalid AI response JSON'); }
  } catch (error) {
    cancel();
    throw error;
  } finally {
    signal?.removeEventListener('abort', cancel);
    reader.releaseLock();
  }
}
