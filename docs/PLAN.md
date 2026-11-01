# Execution plan — English-only settlement intelligence

Updated: 28 October 2026. This revision supersedes the bilingual roadmap. The product, canonical database content, evidence summaries, editorial notes, API output and documentation use English only. The pilot cities remain Toronto, Mississauga, Brampton and Vancouver.

## Decisions

1. Handle every question honestly: answer from evidence, ask for material missing context, give a partial answer or abstain. Do not promise an accurate factual answer to every possible question.
2. Separate answerability from retrieval. A related passage is not necessarily an answer to the specific question. Check each requested facet against evidence before reporting completion.
3. Measure city coverage separately from topic depth. One library source does not establish comprehensive settlement coverage.
4. Keep source-check date separate from legal effective date. Unknown effective dates must remain unknown.
5. Use three execution paths: a fast path for approved deterministic guidance; a normal path for hybrid retrieval and validated composition; an asynchronous research/review path for missing evidence.
6. Start with a modular monolith. The production target is a TypeScript service, PostgreSQL/pgvector and an ingestion worker. Add a separate extraction service only when required by parsing/OCR needs. The current Node/SQLite application is an executable prototype.
7. High-risk health, tenancy, tax, benefits, employment and immigration facts require accountable human review. Research seeds are not independently verified facts.
8. Start automated updates with change detection and review. A failed fetch is not deletion, and newly extracted claims do not automatically become published evidence.
9. English correctness comes before any additional language. Do not add translation fields, multilingual embeddings or language selectors in this phase.

## Current work completed

- Local public UI, source summaries, location/topic filtering, review console, feedback and gap queue.
- English-only evidence schema using one `summary` field with `language: en`.
- Transactional migration of old bilingual records and audit snapshots without changing approval or provenance.
- API, editorial-write and database-trigger validation; unsupported-language requests are rejected before traces are stored.
- Regression tests covering migration, persistence, source scope, citations, freshness, review gates and API access control.

The script guard rejects non-Latin writing systems and hidden direction controls. It is not a semantic language detector: English and romanized foreign-language text can share the same alphabet. Editorial review remains responsible for English prose correctness. Existing legacy prose that cannot be safely migrated causes an atomic failure, rather than silent translation or deletion.

## Milestones and exit gates

Estimates assume one experienced full-time engineer and a part-time settlement/domain reviewer. They are planning ranges, not delivery promises.

| Milestone | Estimate | Deliverable | Exit gate |
|---|---:|---|---|
| M0 — Local vertical slice | Implemented, limited scope | English UI, source summaries, parser, review/gaps, migration, tests | Executable local demo; stale/pending evidence withheld |
| M1 — Data foundation | 1–2 weeks | PostgreSQL migrations, ontology, source policies, immutable snapshots, 30–50 curated English documents | Traceable provenance, human approval for high-risk claims, restore drill |
| M2 — Retrieval and understanding | 2 weeks | English normalization, validated parser, lexical + vector fusion, confirmed follow-up context, facet decomposition | First 200 independently reviewed English questions; measured retrieval baseline |
| M3 — Grounded answers | 1–2 weeks | Claim ledger, supported-facet check, exception/conflict retrieval, partial answers | At least 98% audited citation precision; no critical unsupported claims in the defined release audit |
| M4 — Editorial updates | 1–2 weeks | Permitted conditional fetch, diffs, impact mapping, reviewer identities, historical rollback, cache invalidation | Changed, rejected, stale and failed-fetch scenarios pass |
| M5 — Limited pilot | 2 weeks | 100–200 reviewed English documents, 1,000 human-reviewed English evaluation items, load/security/accessibility checks | Data, retrieval, answer and update gates pass before expansion |

The initial production-pilot estimate remains roughly 7–10 weeks after the local foundation, subject to editorial capacity and infrastructure access. Generated questions alone do not count as gold labels.

## Knowledge priorities

Ten workstreams: identity/SIN; health enrollment; renting and tenant rights; employment and credentials; banking, tax and benefits; schools and childcare; transit and driving; telecom; groceries and basic needs; newcomer and community support. Arrival checklists aggregate these facts rather than duplicate them. Neighborhood and price comparisons remain unsupported until dated local evidence exists.

Label each evaluation item with geography, required user slots, intents, risk, expected source IDs, answerability, supported facets, exceptions and unacceptable claims. Reserve a held-out set and an adversarial set; keep paraphrases of the same scenario in the same split.

## Quality and speed targets

- At least 95% explicit-location extraction accuracy on independently labeled pilot questions.
- Retrieval Recall@5 of at least 90% for answerable questions, measured by city and topic.
- At least 98% citation precision, including whether evidence entails the actual claim.
- At least 95% correct abstention on known-unanswerable questions. Also measure false abstention and answer usefulness.
- No critical unsupported claims in the defined high-risk audit; this is not a universal zero-error guarantee.
- Proposed p95 targets: cached approved guidance below 300 ms, normal retrieval/composition below 2.5 s, complex composition below 5 s. Validate these with realistic source counts and concurrent traffic before making promises.
- Cache keys include confirmed geography, question facets, material eligibility context and knowledge version. Invalidate on publication, expiry and withdrawal.

## Next work package

Complete access-policy reviews for the nine seed sources, appoint domain reviewers, add PostgreSQL migrations and versioned snapshots, expand to 30–50 curated English documents, and create the first 200 independently reviewed English evaluation questions. Then measure lexical, vector and hybrid retrieval against the same held-out set.

Paid models, hosting and reviewer identity setup remain external prerequisites. Select model providers only after a measured English evaluation; do not invent infrastructure costs or silently assume production deployment is complete.
