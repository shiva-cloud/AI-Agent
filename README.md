# Northstar — Settlement Intelligence

A runnable local foundation for the supplied Global Immigration & Settlement Intelligence plan. **Research prototype, not production or complete Phase 1.** No paid API key or third-party packages required. Node.js 24+ required; built-in SQLite currently emits an experimental-feature warning.

## Run

Documentation index: [docs/README.md](docs/README.md). Latest analysis and fix plan: [Hindi](docs/DEEP_ANALYSIS_PLAN_2026-11-03_HI.md). Earlier audit and remediation: [Hindi project review](docs/archive/DEEP_PROJECT_REVIEW_2026-11-01_HI.md), [fixes and remaining release requirements](docs/archive/REMEDIATION_2026-11-01.md). Static question-bank and narrative matches do not create reviewed claims. Multilingual queries needing confirmation return clarification. Calculator results remain preliminary and require independent source review.

```powershell
node src/server.js
```

Open http://127.0.0.1:3000. Data persists in `data/settlement.sqlite`; keep it private and excluded from Git. For the editorial console, configure a random `ADMIN_TOKEN` of at least 24 characters in your process environment before starting the server. The default has admin disabled. Do not publish this local server directly to the Internet.

This release is **English-only**. Startup migrates older bilingual evidence and audit snapshots to `language: en` and a single `summary` field. You can run the migration separately with `node scripts/migrate.js`. See `docs/LANGUAGE_POLICY.md` for validation rules and migration behavior.

```powershell
node --test
node scripts/benchmark.js
node scripts/http-benchmark.js
node scripts/evaluate.js
```

Two maintenance shortcuts run without touching the working database:

```powershell
npm run pre-flight   # engine, topic labels, wording checks and a migration dry-run on a throwaway temp copy
npm run policy-lint  # the same source/evidence audit the server prints at boot
```

## What works

- Public chat with English-only source summaries, city context, citations and freshness labels.
- Declared-evidence ordered checklists: a first-week/checklist/step-by-step request renders a real ordered list when a source record declares ordered steps (currently IRCC's official first-two-weeks explainer, national); topics without declared steps keep their honest gap.
- Official price benchmarks where a source is verifiable: published transit fares for all four pilot cities, Toronto's ONFB healthy-eating benchmark and BC's BCCDC food-costing benchmark (2022 survey, vintage disclosed) are low-risk research seeds; CMHC rent averages and official child-care fee evidence (City of Toronto TELCCS, Ontario CWELCC, BC fee-reduction program) are registered pending human review, so rent and child-care cost questions still return honest gaps instead of figures.
- One-step city clarification that preserves the original question in browser memory; conflicting locations still require editing. See `docs/CLARIFICATION.md`.
- Conservative deterministic intent parsing, limited English location aliases, multi-topic gap reporting, ambiguity clarification and geographic filtering.
- BM25 keyword ranking with English normalization and explainable candidate scores; see `docs/RETRIEVAL.md`. This is not vector search.
- The local evidence database (`data/settlement.sqlite`) held 906 records on 3 November 2026: 871 approved, 20 research seeds and 15 rejected (run `npm run kb:health` for current figures). A fresh database without a release snapshot starts from 258 built-in English research records in `src/knowledge.js`: twenty low-risk source summaries and 238 high-risk records pending independent human review. 201 issuing countries and territories are recognized for driving questions. Twenty-four issuing jurisdictions have dedicated licensing records; the remaining 177 have a broad national, government or state information entry point, not a verified licence-specific page. All issuing-country records are pending review, so driving questions cite them without making public claims. Housing and telecom retrieval distinguish supported subjects; telecom pricing remains a data gap. Research seeds are explicitly **not** human-verified facts. See `docs/COVERAGE_EXPANSION.md`, `docs/FAMILY_COVERAGE.md`, `docs/HOUSING_COVERAGE.md` and `docs/TELECOM_COVERAGE.md` for sources and research limits.
- Expiry and effective-date filters; a basic exact-key conflicting-claim guard.
- Shared calendar-date, risk and URL validation across retrieval and guarded database writes; see `docs/EVIDENCE_VALIDATION.md`.
- Local protected-token checks before AI rewrite verification, with a fixed application-written introduction; see `docs/REWRITE_VALIDATION.md` for limitations.
- Bounded optional AI concurrency with immediate baseline answers at capacity; see `docs/AI_CAPACITY.md`.
- SQLite traces without raw questions, feedback, gaps, transactional review audit and publication withdrawal.
- Admin bearer-token checks, body limits, IP rate limiting, same-origin checks, security headers, text-only DOM rendering.
- Authenticated review-priority dashboard with expiry, source-permission and provenance flags, topic filters and next actions; see `docs/REVIEW_QUEUE.md`.
- Repeatable 45-scenario development evaluation (with the original 28-scenario pilot dataset kept alongside) covering citation, geography, freshness and deterministic claim checks; see `docs/EVALUATION_EXPANSION.md`. These are not independently reviewed gold labels.
- Daily-equivalent hourly retention cleanup for traces/gaps/feedback older than 30 days; cleanup also on startup.

## What is deliberately unfinished

### Optional AnyRouter AI review pipeline

`src/verified-answer.js` provides an injectable three-pass pipeline: interpret the
question, rewrite existing source guidance, then independently check English and
meaning preservation before publication. `createApp` accepts `{ complete }` as its
third argument. The adapter receives `{stage, instructions, data, signal}` and must
return parsed JSON. The default adapter uses AnyRouter when `ANYROUTER_API_KEY`
is set in the server environment; otherwise AI stays disabled. Set that environment
variable securely before `node src/server.js`. Keys are never sent to the browser.
Only `anyrouter/free` is requested, with no paid-model fallback. Requests send the
question and relevant source guidance to AnyRouter and its selected upstream model.
See https://docs.anyrouter.dev/getting-started/quickstart and https://anyrouter.dev/free .
The interpretation guides wording; it does not override retrieval or geography.
Claim IDs, citations, review gates and limitations remain controlled by the engine.
Rejected drafts, malformed responses and a 45-second total timeout with AnyRouter
fall back to the original guidance. Automated tests use simulated providers.
AI review is probabilistic, not proof of correctness. Wording variation is prompted,
but unique wording on every request is not guaranteed.

As checked on 2026-10-28, OpenCode's current documentation restricts free-tier chat
models to its own client: https://opencode.ai/v2/docs/console/models/ . Direct free
API integration uses AnyRouter instead. Never silently switch to paid models or
impersonate an approved client. Do not commit API keys.

No built-in general-purpose LLM (only the optional AnyRouter wording layer described above), semantic embeddings, true hybrid retrieval, automatic crawler, scheduled source refresh, document snapshots, complete conversational memory, granular RBAC or production deployment. Topic matching produces **source guidance**, never a claim that the user's full question is solved. Unknown locations beyond the small dictionary need a validated entity resolver. Only English is supported. No verified telecom prices or employment eligibility. School registration is covered only by each pilot city's registered board records (TDSB for Toronto, VSB for Vancouver, the Peel District School Board and Dufferin-Peel Catholic District School Board for Mississauga and Brampton), and all family evidence remains pending independent human review, so school questions return honest gaps. Child-benefit evidence is registered but pending independent human review, so benefit questions cite the CRA records and still return honest gaps with no personal eligibility decision. The Interim Federal Health Program is registered pending independent human review, so interim-coverage questions cite the federal records and still return honest gaps. Ontario health-card document guidance and BC MSP enrolment guidance are likewise registered pending independent human review, so health-card and MSP questions return honest gaps with no personal eligibility decision. Foreign credential recognition and educational credential assessment evidence is registered pending independent human review, so credential questions cite the official records and still return honest gaps. Social Insurance Number basics and required-document guidance is published as low-risk research seeds: sin questions answer from the official ESDC pages' own statements, with no personal status or document acceptance confirmed anywhere. Grocery costs are benchmarked by official figures only — Toronto's ONFB and BC's BCCDC 2022 food-costing survey (no store prices, no Peel-level data); rent and child-care fee evidence is registered but awaiting independent human review, so those questions still return honest gaps. No 1,000-question human-reviewed English dataset or production accuracy measurements yet.

Publication withdrawal sends a record back to pending; it is not arbitrary historical source-version restoration. Human review does not extend freshness. Expired sources need re-ingestion, which is a next milestone.

## API

The admin console also supports a source registry, manual English excerpt imports, pending candidate review, immutable publication history, historical restoration and source suspension. See `docs/INGESTION.md` and `docs/RESTORATION.md` for workflows and API contracts. No automatic crawling is enabled.

Import comparisons highlight changed claims, dates, excerpt spans and potential source-related impacts. See `docs/CHANGE_TRACKING.md` for the comparison's limits.

`POST /v1/questions/parse`, `POST /v1/retrieval/search`, `POST /v1/answers`: JSON `{ "question": "...", "city": "Toronto", "country": "Canada", "language": "en" }`; city, country and language optional. `POST /v1/answers` also accepts an optional `previousContext` for short follow-up questions and then returns a `context` report (see `docs/CONVERSATION_CONTEXT.md`). Location clarifications include a `placeClarification` object (see `docs/GEOGRAPHY_REGISTRY.md`).

`GET /v1/topics`, `GET /v1/meta` and `GET /v1/stats`: public JSON. `/v1/stats` and `/v1/meta` return aggregate counts and package version only — no visitor data.

`GET /v1/coverage`: all four pilot cities, topic-level seed coverage. `GET /v1/coverage/{city}` adds the evidence behind each topic status; unknown cities answer 404 with `knownCities`. `GET /v1/changes` is the aggregate evidence-currency feed (counters plus the newest-checked records — no URLs, quotes or visitor data; `GET /v1/changes.xml` mirrors it as an Atom feed), `GET /v1/agencies` lists the human handoff organizations behind the "Talk to a person" panel (each entry dated, note-labeled, and stating how a person is reached), and `GET /v1/gaps` is the public failure-transparency feed — aggregate counts of what the pilot cannot answer yet, with ownership details staying token-gated. Unknown routes answer 404 with a `known` route list.

`POST /v1/feedback`: `{ "traceId": "...", "issue": "helpful|incorrect|missing|outdated" }`.

`GET /v1/geography`: the versioned place registry (geo-1) with each place's type, status and path.

`GET /admin/overview`: records, aggregated gaps, recent audit; requires `Authorization: Bearer ...`.

`POST /admin/reviews/{id}/decision`: `{ "decision": "approve|reject|rollback", "reviewer": "Name", "note": "Evidence and rationale" }`, authorized token required. Prototype reviewer names are self-declared, not identity-verified.

## Operations

Run `node scripts/backup.js` for a verified online SQLite backup, then `node scripts/restore-drill.js <backup-directory>` for an isolated recovery test. See `docs/RECOVERY.md`. Do not copy a live SQLite main file while ignoring its WAL. Never commit tokens, backups or user data. The restore drill does not replace the working database.

SaaS plans (optional): set `ACCOUNTS_DB_PATH` and `ACCOUNTS_SECRET` to enable Free, Plus, Pro and Team plans with monthly limits on chat answers and tool runs. Safety and legal-rights tools are always open. Manage accounts with `node scripts/accounts.js create "<name>" <plan>`; callers send `Authorization: Bearer nsk_…`. `GET /v1/plans` lists the plans. See `docs/SAAS_PLANS.md`, which also covers the market research and what is not built yet (billing, live IRCC data).

Admin panel: open `/manage` as an administrator to edit users, plans, limits, tool tiers, on/off switches and sign-up settings; every change is audited. Testing mode: `npm run start:test` starts a separate test server on http://127.0.0.1:3000 that signs every visitor in as the public demo administrator `demo@northstar.test` / `Northstar-Test-2026` (Free plan, unlimited). Never use testing mode in production; the server refuses to start with it when `NODE_ENV=production`.

Checking the UI locally: `.claude/launch.json` defines `northstar-ui-check`, which starts the server on port 3917 with a throwaway database under `%TEMP%` and AI providers disabled, so browser checks never touch `data/settlement.sqlite`. Because the service worker caches the page, clear it (or bump `CACHE_NAME` in `public/sw.js`) after changing public files. `test/frontend-integrity.test.js` catches scripts that do not parse and imports the server does not serve.

Monitoring: `node scripts/queue-monitor.js` (queue health, see `docs/QUEUE_MONITOR.md`) and `node scripts/runtime-monitor.js` (server error rate, answer latency and logging problems, see `docs/RUNTIME_MONITOR.md`) print transition events. Both can also send them to an HTTPS webhook (`ALERT_WEBHOOK_URL`, optional `ALERT_WEBHOOK_SECRET`) and remember delivered alerts across restarts (`ALERT_STATE_PATH`). No alert destination is configured by default.

The Dockerfile is an optional packaging starting point. Run `npm run release:db` before `docker build`: it writes `release/settlement.sqlite`, which the image ships as `SEED_DB_PATH` and copies into an empty `/app/data` volume on first start (an existing database is never overwritten). Without it a container would serve only the built-in research seeds. A local container check on 2 November 2026 built the image (`docker compose -f compose.local.yaml build app`), started the hardened stack, probed `/ready`, and answered a real `POST /v1/answers` with status `guidance`; the image now bundles the `corpus/` question index the resolver reads. The app intentionally binds loopback. Production needs TLS ingress, authenticated reviewers, durable database backups, secret management and the gates in `docs/PLAN.md`.

Ports deliberate mismatch note: the server always listens on `process.env.PORT || 3000` (loopback by default) and sends the PM2 ready signal after listen (`process.send('ready')`, matching `wait_ready: true`). The documented `npm start` path serves http://127.0.0.1:3000; the local container keeps the container port 3000 (Dockerfile health-check target) but publishes it on the host as `127.0.0.1:3100` (`compose.local.yaml`). PM2 is the one deliberate exception: `ecosystem.config.cjs` sets `PORT: 8080` under `env_production`, so a PM2-managed production process serves http://127.0.0.1:8080 — point any ingress, monitor (`RUNTIME_MONITOR_URL`) or load balancer at 8080 in that environment, never at 3000.

See `docs/PLAN.md`, `docs/RESEARCH.md`, `docs/ARCHITECTURE.md`, `docs/LANGUAGE_POLICY.md`, `docs/INGESTION.md`, and `docs/STATUS.md`.
