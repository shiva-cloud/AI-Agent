# AI provider and model configuration

The server reads these optional environment settings when constructing its AI router. No running service or credential is changed automatically.

- `AI_ALLOWED_PROVIDERS`: JSON array containing unique `anyrouter` and/or `openrouter` names. Default: both. `[]` disables both even when credentials exist. The legacy AnyRouter adapter honors this setting too.
- `OPENROUTER_MODELS`: JSON array of 1–16 unique explicit `vendor/model:free` identifiers, each at most 160 characters. Default: the historical list in `src/ai-policy.js`. This is a syntactic restriction, not a guarantee of price or model availability.

For example, set `AI_ALLOWED_PROVIDERS` to `["openrouter"]` and supply a reviewed model list in `OPENROUTER_MODELS`. Do not treat the synthetic model names in tests as deployable models. Empty strings, malformed JSON, duplicates, unsupported providers, URLs and identifiers without the `:free` suffix are rejected with configuration-only error messages. Configuration strings are limited to 4 KiB. Validation occurs before constructing providers, including when no key is configured.

Lists are copied and frozen at construction. Request payloads cannot override them. Restart or reconstruct the router to change policy. OpenRouter rotates through only this list, one model per provider attempt; failure may use another enabled provider but never adds a model outside configuration. AnyRouter retains its fixed `anyrouter/free` route. Fixed HTTPS endpoints and redirect rejection remain enforced. An allowlist permits a provider; a credential is still required to enable it.

Existing data minimization, concurrency limits, response size limits, deadlines and deterministic fallback remain in effect. Operators still need to review provider retention, processing location, account routing, current availability and cost before enabling live calls. This application configuration does not enforce a provider's internal subprocessor selection or establish an approved data-processing agreement. No live service terms or model availability were verified as part of this implementation.
