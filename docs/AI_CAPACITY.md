# Bounded optional AI work

Release 0.19.0 bounds concurrent rewrite pipelines per `createVerifiedAnswer` instance. The default is four; callers may provide an integer `maxConcurrent` from 1 to 32. Existing provider options are unchanged and no environment configuration or credentials were edited.

An answerable request arriving at capacity immediately returns the deterministic source-backed baseline with `ai.status: busy`. There is no waiting queue, provider call or automatic retry for that request. Missing evidence and clarification still return `not_applicable` before using AI capacity. This is separate from the HTTP request-rate limiter.

Slots are released after normal completion or failure. A timed-out request returns its baseline at the existing deadline and signals cancellation. If the provider ignores cancellation, the slot remains reserved until the outstanding operation actually settles. This deliberately prevents an unresponsive adapter from creating unlimited concurrent operations through repeated timeout/retry cycles. If every slot is held by a permanently stuck adapter, subsequent requests continue with baseline guidance; recovery requires adapter completion or a process restart.

The limit is per process/instance, not a distributed quota. It does not bound upstream retries inside an adapter or protect against a provider performing synchronous blocking work. It also does not establish a production throughput target. The timer duration is validated to avoid invalid or overflowing JavaScript timer settings.

Five mock-provider tests cover saturation without extra calls, release after rejection, ignored cancellation, bypass for pending evidence/clarification and invalid configuration. All 191 project tests pass. No live provider calls or working-database changes were needed. Distributed capacity controls, live-provider load tests and operational alerting remain pending. Restart an older server process to load this change.

## Caller cancellation

createVerifiedAnswer accepts an optional fourth argument {signal}. A signal already aborted rejects before baseline/provider execution. During provider work, cancellation aborts the internal signal and returns the ordinary fallback to library callers; HTTP disconnect callers receive no response. No later provider stage starts after cancellation. Event listeners and deadlines are cleaned up; an abort-ignoring operation still retains its capacity slot until settlement. Cancellation is cooperative and does not establish provider billing cancellation or interrupt synchronous blocking code.

The server passes response-disconnect cancellation to the answer pipeline. A request detected as disconnected before answer persistence does not write a completed trace or gaps; request-aborted telemetry still records the sanitized event. Disconnect occurring after persistence cannot undo that write. Normal request-body completion does not cancel processing.

## Provider HTTP response limits

Provider JSON envelopes are limited to 256 KiB of decoded HTTP body bytes before parsing. Declared oversize is rejected early; streamed bytes are always counted. Strict UTF-8 decoding, stream cancellation on limit/abort, and discarded HTTP error bodies prevent unbounded application accumulation. The existing 30,000-character message limit still applies after envelope parsing. This does not bound transport buffers or a chunk already allocated by fetch. Injected fetch implementations must expose standard Response readable bodies. Oversized/malformed responses follow existing failover and baseline fallback paths. No live provider request was used to validate this change.
