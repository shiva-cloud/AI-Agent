# Optional deterministic answer cache

Set `ANSWER_CACHE_ENTRIES` to an integer from 1 to 1000 to enable the standalone server's process-local cache. Default 0 disables it. Embedded callers use `answerCacheEntries` in createApp options; createVerifiedAnswer accepts `cacheEntries`. Invalid standalone settings fail before database initialization. No running service was reconfigured.

The cache stores only the deterministic baseline. AI rewrite/verification still runs per request when enabled. Each hit returns a fresh trace ID, current request latency, and an independent object; the existing HTTP path persists its trace and accepts trace-specific feedback. Cache reuse does not promote evidence status or bypass the existing post-answer knowledge-change check.

Keys hash the exact input object, including location/language and unknown input fields. Any change in serialized evidence or UTC calendar day flushes the cache. Date gates in this application use whole UTC dates. TTL is 60 seconds, with least-recently-used eviction and a 4 MiB serialized-payload budget in addition to the entry cap. Oversized responses bypass storage. Actual JavaScript heap overhead can exceed the serialized budget.

Raw questions are not stored as keys, but response parser fields such as queryTerms can contain question-derived personal text. Enabling caching therefore retains some request-derived data in process memory beyond the request. It is not anonymization. No disk persistence or cross-process cache exists. Expired entries are removed lazily on the next cache access; an idle process may retain expired memory until another request or process exit. Keep caching disabled where that retention is unsuitable.

Every lookup still hashes current evidence and serializes input. No production speed improvement is claimed without corpus/workload measurements. Ordering-only changes can cause conservative misses. Index-only changes do not invalidate a baseline while evidence remains unchanged; index ranking must preserve the established lexical contract. Distributed caching and caching AI drafts are not implemented.

Regression coverage: exact TTL, entry/byte bounds, LRU eviction, mutation isolation, distinct traces, geography separation, invalid-language rejection, evidence withdrawal, calendar expiry and independent HTTP trace/feedback persistence.
