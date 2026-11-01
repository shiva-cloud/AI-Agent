# Architecture and implementation boundary

## Request flow (current slice, one process)

```
 Browser (vanilla JS, CSP 'self')
   │  fetch, same-origin only
   ▼
 server.js http.createServer
   ├─ origin check (403 on mismatch)
   ├─ rate limiter ← one bucket per route family + client IP
   │     v1: 120/60s · admin: 60/60s · static: 240/60s   (429 + Retry-After)
   ├─ admin gate: ADMIN_TOKEN present & ≥24 chars, else 503;
   │     timing-safe Bearer compare, else 401
   ▼
 GET  /v1/coverage       ─┐
 GET  /v1/topics         ─┤ knowledge.js catalog + labels
 GET  /v1/meta           ─┘ package.json version, mode
 GET  /static/*          → public/* with content-hash ETag (no-cache, 304)
 POST /v1/questions/parse → engine.parse        (rules only)
 POST /v1/retrieval/search→ parse + retrieve    (available records only)
 POST /v1/answers ─────────────────────────┐
   │   verified-answer.js                  │
   │     ├─ engine.answer → status/claims/sources/gaps/verification
   │     └─ optional bounded AI rewrite (4 slots, 12s, verify stage;
   │        fallback = baseline untouched, never self-approved)
   │   store.log: traces + gaps (no question text)
   └─ knowledge-changed check → rebuild from latest records
 POST /v1/feedback        → trace-linked issue row
 /admin/*                 → store.summary / review-queue / ingestion /
                            candidates / changes / history / metrics
   │                        ▼
   └──────────── openStore() ─ SQLite (WAL, English-only triggers,
                               secure_delete, migrations, purge >30d)
```

## Current executable slice

Browser → local Node HTTP API → validated rule parser → geographic/topic/freshness filters → fixed source summaries → claim/source ledger → SQLite trace and gap persistence.

Question text remains in memory only for the request. Browser location context is explicitly selected or replaced by a recognized city in the current question; no personal profile is inferred. The UI retains no chat history or admin token across reloads. Only source IDs, topics, status and timings are persisted for traces; this protects privacy but limits post-hoc debugging. Opt-in redacted question capture requires a future consent and retention design.

This slice intentionally uses prewritten English-only summaries. It demonstrates the evidence/publication boundaries without letting a language model manufacture eligibility, phone numbers or facts. Rule coverage is limited and should not be confused with broad semantic understanding.

## Target production path

1. Validate request and remove unnecessary identifiers.
2. Parse intent/facets using rules plus a constrained English classifier. Validate all returned enums and IDs. Preserve only explicitly confirmed consequential context.
3. Resolve country/province/city/neighborhood against a versioned gazetteer. Clarify genuine ambiguities.
4. Filter by geography, permitted source tier, approval, effective date, freshness and applicability.
5. Run lexical and semantic queries independently; fuse with reciprocal-rank fusion, then benchmark a reranker.
6. Retrieve exceptions and opposing evidence; evaluate answerability for each facet.
7. Build a claim ledger before composing prose. Prefer deterministic formatting for dates, requirements, amounts and contacts.
8. Optional model paraphrasing operates only over permitted claims. Validate claims after composition; fall back to source-bound templates on failure.
9. Emit partial/unavailable statuses and specific knowledge gaps. Log versions and decisions without unnecessary personal data.

## Production data model additions to the supplied plan

- `question_facets`, `facet_evidence`, `answerability_decisions`: distinguish relevant passage from supported answer.
- `knowledge_versions`, `publication_events`, `fact_versions`: atomic publish and true rollback.
- `source_policy_reviews`, `source_dependencies`: explicit acquisition permission and shared upstream dependencies.
- `evaluation_sets`, `evaluation_items`, `evaluation_runs`: frozen splits, reviewer provenance and regressions.
- `review_assignments`: verified identity, roles and second-review requirement for high-risk changes.

Use PostgreSQL constraints for valid parent hierarchy, non-overlapping effective versions where applicable, immutable evidence references and source-document hashes. Store immutable raw snapshots in object storage only where licensed. Add pgvector behind an adapter so lexical-only fallback remains available and measurable.

## Update worker

Allowlisted source → access-policy check → conditional request → immutable snapshot and hash → content diff → candidate extraction → affected fact set → risk review → transactional publication/version bump → cache invalidation → regression evaluation → rollback on failed publication checks.

Never publish extraction output directly. Source fetch failures produce an operational alert, not deletions. An approved summary can still expire; a review action does not reset its source-check timestamp. The local console supports withdrawal to pending, not historical-source rollback.

## Security, operations and deployment gates

Before external deployment: authenticated admin identities, role-based access, CSRF policy suitable for the chosen auth, TLS, reverse-proxy-aware rate limiting, secret rotation, network egress restrictions, redacted telemetry, parser sandboxing, encrypted backups, restore drills, dependency scanning, accessible UI audit and load testing.

Local bearer-token admin is a development control only. Source review notes may contain personal data if reviewers enter it; production policy and retention must cover editorial audit data separately. Audit rows currently persist indefinitely; request traces/gaps/feedback have 30-day cleanup.

## Rollout

Internal editorial alpha → invited pilot within explicitly covered topics → measured expansion. Do not launch merely because the server starts. Version source data, evaluation definitions and software together in release manifests; verify restore and rollback before public traffic.
