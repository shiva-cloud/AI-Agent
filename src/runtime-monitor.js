import {monitorTransitions} from './queue-monitor.js';
import {latencyBounds} from './runtime-metrics.js';

// Runtime alerting for the HTTP server (B10). Reads the process-local counters from
// GET /admin/runtime-metrics, compares each poll with the previous one, and reports
// problems in that window only. Counters are cumulative per server process, so a drop
// in any counter means the server restarted; that poll only resets the baseline.

export const runtimeCodes = new Set(['server_error_rate_high', 'answer_latency_high', 'logging_dropped', 'logging_failures', 'metrics_persistence_failures']);

export const defaultThresholds = Object.freeze({
  minRequests: 20,          // fewer requests in a window never raise an error-rate alert
  errorRate: 0.05,          // share of requests answered with HTTP 5xx (client disconnects excluded)
  minAnswers: 10,           // fewer answers in a window never raise a latency alert
  answerP95Ms: 10000        // answers p95 upper bound above this raises an alert
});

function validThresholds(value) {
  const t = {...defaultThresholds, ...value};
  if (!Number.isInteger(t.minRequests) || t.minRequests < 1 || !(t.errorRate > 0 && t.errorRate <= 1)
    || !Number.isInteger(t.minAnswers) || t.minAnswers < 1 || !latencyBounds.includes(t.answerP95Ms)) {
    throw new Error(`Invalid runtime alert thresholds; answerP95Ms must be one of ${latencyBounds.join(', ')}`);
  }
  return t;
}

function readSnapshot(snapshot) {
  const counter = name => {
    if (!Number.isSafeInteger(snapshot?.[name]) || snapshot[name] < 0) throw new Error('Invalid runtime metrics');
    return snapshot[name];
  };
  if (!Array.isArray(snapshot?.buckets)) throw new Error('Invalid runtime metrics');
  const buckets = new Map();
  for (const b of snapshot.buckets) {
    if (typeof b?.category !== 'string' || !Number.isInteger(b.status) || !Number.isSafeInteger(b.count) || !Array.isArray(b.histogram)
      || b.histogram.length !== latencyBounds.length + 1 || b.histogram.some(n => !Number.isSafeInteger(n) || n < 0)) throw new Error('Invalid runtime metrics');
    buckets.set(`${b.category}:${b.status}`, {category: b.category, status: b.status, count: b.count, histogram: b.histogram});
  }
  return {loggingDropped: counter('loggingDropped'), loggingFailures: counter('loggingFailures'), persistenceFailures: counter('persistenceFailures'), buckets};
}

function windowBetween(previous, current) {
  const counters = ['loggingDropped', 'loggingFailures', 'persistenceFailures'];
  if (counters.some(name => current[name] < previous[name])) return null;
  const buckets = [];
  for (const [key, bucket] of current.buckets) {
    const before = previous.buckets.get(key);
    const count = bucket.count - (before?.count ?? 0);
    if (count < 0) return null;
    const histogram = bucket.histogram.map((n, i) => n - (before?.histogram[i] ?? 0));
    if (histogram.some(n => n < 0)) return null;
    if (count) buckets.push({...bucket, count, histogram});
  }
  if ([...previous.buckets.keys()].some(key => !current.buckets.has(key))) return null;
  return {buckets, ...Object.fromEntries(counters.map(name => [name, current[name] - previous[name]]))};
}

export function evaluateRuntimeWindow(window, thresholds = defaultThresholds) {
  const t = validThresholds(thresholds);
  const alerts = [];
  const counted = window.buckets.filter(b => b.status !== 499);
  const total = counted.reduce((sum, b) => sum + b.count, 0);
  const errors = counted.filter(b => b.status >= 500).reduce((sum, b) => sum + b.count, 0);
  if (total >= t.minRequests && errors / total >= t.errorRate) alerts.push({code: 'server_error_rate_high', count: errors});

  const answers = window.buckets.filter(b => b.category === 'answers' && b.status < 400);
  const histogram = latencyBounds.map((_, i) => answers.reduce((sum, b) => sum + b.histogram[i], 0)).concat(answers.reduce((sum, b) => sum + b.histogram.at(-1), 0));
  const answerCount = histogram.reduce((a, b) => a + b, 0);
  if (answerCount >= t.minAnswers) {
    const limit = latencyBounds.indexOf(t.answerP95Ms);
    const slow = histogram.slice(limit + 1).reduce((a, b) => a + b, 0);
    // p95 upper bound exceeds the threshold exactly when more than 5% fall in higher bins.
    if (slow > answerCount - Math.ceil(answerCount * 0.95)) alerts.push({code: 'answer_latency_high', count: slow});
  }
  if (window.loggingDropped) alerts.push({code: 'logging_dropped', count: window.loggingDropped});
  if (window.loggingFailures) alerts.push({code: 'logging_failures', count: window.loggingFailures});
  if (window.persistenceFailures) alerts.push({code: 'metrics_persistence_failures', count: window.persistenceFailures});
  return {status: alerts.length ? 'attention' : 'ok', alerts};
}

/**
 * Returns a readHealth function for monitorTransitions. The first successful poll, and the
 * first poll after a server restart, only set the baseline and return null (no observation),
 * so a persisted "attention" state is neither confirmed nor falsely recovered.
 */
export function createRuntimeHealthReader({fetchSnapshot, thresholds} = {}) {
  if (typeof fetchSnapshot !== 'function') throw new Error('fetchSnapshot is required');
  const t = validThresholds(thresholds);
  let previous = null;
  return async ({signal} = {}) => {
    const current = readSnapshot(await fetchSnapshot({signal}));
    const window = previous && windowBetween(previous, current);
    previous = current;
    return window ? evaluateRuntimeWindow(window, t) : null;
  };
}

/** Fetches /admin/runtime-metrics with a bearer token; errors never include the token or URL. */
export function createRuntimeMetricsFetcher({baseUrl, token, fetchImpl = globalThis.fetch}) {
  let url;
  try { url = new URL('/admin/runtime-metrics', baseUrl); } catch { throw new Error('Runtime monitor base URL is not a valid URL'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Runtime monitor base URL must be http(s) without credentials');
  // The admin token is sent with every poll, so plain HTTP is allowed only on this machine.
  if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Runtime monitor base URL must use HTTPS unless it is a loopback address');
  if (typeof token !== 'string' || token.length < 24) throw new Error('An admin token of at least 24 characters is required');
  return async ({signal} = {}) => {
    const response = await fetchImpl(url, {headers: {Authorization: `Bearer ${token}`}, signal, redirect: 'error'});
    if (!response.ok) { try { await response.body?.cancel(); } catch {} throw new Error(`Runtime metrics returned HTTP ${response.status}`); }
    return response.json();
  };
}

export function monitorRuntime({fetchSnapshot, thresholds, ...options} = {}) {
  return monitorTransitions({...options, readHealth: createRuntimeHealthReader({fetchSnapshot, thresholds}), codes: runtimeCodes, eventPrefix: 'runtime_monitor'});
}
