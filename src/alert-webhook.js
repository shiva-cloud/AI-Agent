import {createHmac, timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';

// Optional HTTPS webhook delivery for queue- and runtime-monitor events (B10).
// Sends only the documented event fields, signs them when a secret is configured,
// refuses redirects, and never puts the URL or secret into an error message.
// A failed delivery throws so the monitor leaves the transition unacknowledged and
// retries it on the next poll.

const EVENTS = new Set(['queue_monitor', 'runtime_monitor'].flatMap(prefix => ['attention', 'unavailable', 'recovered'].map(kind => `${prefix}_${kind}`)));
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);
export const MIN_SECRET_LENGTH = 32;

function configError(message) {
  const error = new Error(message); error.code = 'alert_webhook_config'; return error;
}

export function parseWebhookUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw configError('Alert webhook URL is not a valid URL'); }
  if (url.username || url.password) throw configError('Alert webhook URL must not contain credentials');
  if (url.hash) throw configError('Alert webhook URL must not contain a fragment');
  if (url.protocol === 'http:' && !LOOPBACK.has(url.hostname)) throw configError('Alert webhook URL must use HTTPS (plain HTTP is allowed only for loopback testing)');
  if (!['https:', 'http:'].includes(url.protocol)) throw configError('Alert webhook URL must use HTTPS');
  if (!url.hostname || (isIP(url.hostname) === 0 && !url.hostname.includes('.') && !LOOPBACK.has(url.hostname))) throw configError('Alert webhook URL needs a fully qualified host name');
  return url;
}

function payload(event) {
  if (!event || !EVENTS.has(event.event) || typeof event.status !== 'string' || !Array.isArray(event.alerts) || typeof event.at !== 'string') {
    throw new Error('Unsupported alert event');
  }
  return JSON.stringify({
    event: event.event,
    status: event.status,
    alerts: event.alerts.map(alert => ({code: String(alert.code), count: Number(alert.count)})),
    at: event.at
  });
}

/** Signature over "<timestamp>.<body>", sent as X-Northstar-Signature: sha256=<hex>. */
export function signWebhookBody(secret, timestamp, body) {
  return 'sha256=' + createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

/**
 * For receivers: checks X-Northstar-Signature in constant time and rejects timestamps
 * further than `toleranceSeconds` from now (default five minutes) to limit replays.
 * `body` must be the raw request body exactly as received.
 */
export function verifyWebhookSignature({secret, timestamp, body, signature, toleranceSeconds = 300, now = () => Date.now()}) {
  if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH || typeof body !== 'string') return false;
  if (typeof timestamp !== 'string' || !/^\d{1,12}$/.test(timestamp) || typeof signature !== 'string') return false;
  if (Math.abs(Math.floor(now() / 1000) - Number(timestamp)) > toleranceSeconds) return false;
  const expected = Buffer.from(signWebhookBody(secret, timestamp, body));
  const received = Buffer.from(signature);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function createWebhookSink({url, secret, fetchImpl = globalThis.fetch, now = () => Date.now()} = {}) {
  const target = parseWebhookUrl(url);
  if (secret !== undefined && secret !== '' && (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH)) {
    throw configError(`Alert webhook secret must be at least ${MIN_SECRET_LENGTH} characters`);
  }
  if (typeof fetchImpl !== 'function') throw configError('fetch is unavailable');
  const signingSecret = secret || null;

  return async function deliver(event, {signal} = {}) {
    const body = payload(event);
    const headers = {'Content-Type': 'application/json', 'User-Agent': 'northstar-queue-monitor'};
    if (signingSecret) {
      const timestamp = String(Math.floor(now() / 1000));
      headers['X-Northstar-Timestamp'] = timestamp;
      headers['X-Northstar-Signature'] = signWebhookBody(signingSecret, timestamp, body);
    }
    let response;
    try {
      response = await fetchImpl(target, {method: 'POST', headers, body, signal, redirect: 'error'});
    } catch {
      const error = new Error('Alert webhook delivery failed'); error.code = 'alert_webhook_unreachable'; throw error;
    }
    try { await response.body?.cancel(); } catch { /* response body is not needed */ }
    if (!response.ok) {
      const error = new Error(`Alert webhook responded with HTTP ${response.status}`); error.code = 'alert_webhook_rejected'; throw error;
    }
  };
}
