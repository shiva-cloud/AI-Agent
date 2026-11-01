# Query and answerability contract

The English deterministic parser returns additive contract `query-1` (parser `english-rules-0.9`). Existing city, region, intents, retrieval filters and missing slots remain compatible.

| Field | Values / meaning |
| --- | --- |
| `contractVersion` | `query-1` |
| `requestedOutput` | `source_guidance`, `eligibility`, `checklist` |
| `facets` | Array of `{id, topic, reason}`; topic is a supported topic or null |
| `facets[].id` | `occupation_requirements`, `eligibility_<topic>`, `ordered_checklist` |
| `facets[].reason` | Stable English machine code used in gaps and UI wording |

Answers add `answerability`:

| Field | Values / meaning |
| --- | --- |
| `version` | `answerability-1` |
| `requestedOutput` | Copied from the parsed request |
| `providedOutput` | `source_guidance` when there are claims; otherwise `none` |
| `status` | `needs_clarification`, `incomplete`, `source_guidance_only`, `unavailable` |
| `facets` | `{id, topic, status: "unsupported", reason}` for each recognized specialized request |

Current evidence records contain source summaries. Editorial approval does not establish support for personalized eligibility, professional requirements or an ordered checklist. These recognized requests therefore add explicit gaps even when a related guide is available. A guide may still be cited, but the answer becomes partial. Without claims it remains unavailable. A geography clarification takes precedence over retrieval.

Examples:

- `Can I work as a nurse tomorrow in Toronto?`: occupation requirements and employment eligibility facets; a generic employment guide does not close either gap.
- `First week in Vancouver`: requests a checklist; an available newcomer guide remains starting guidance and the ordered checklist gap stays visible.
- `Am I eligible for OHIP and childcare in Toronto?`: separate eligibility gaps for health and childcare.
- `How do I apply for a SIN?`: ordinary source navigation, with no inferred personal eligibility determination.

The AI rewriting layer preserves this contract and gaps; it cannot promote their status. Trace storage continues to omit raw questions, names, emails and personal status. Gap reason codes are persisted by the existing transaction.

## Limits and follow-on work

This is a conservative rule-based first contract, not universal question understanding. Occupation and eligibility phrasing coverage is limited. It does not decide legal requirements, collect personal immigration details, fabricate checklist steps or modify KB records. Supported facet evidence needs a future structured schema and reviewed content before any specialized facet can be marked supported.

The development evaluation dataset is versioned to `english-dev-2`: `first-week` now expects `partial` plus `missing_verified_checklist`, replacing the earlier misleading `guidance` expectation. All other labels remain unchanged. New contract tests independently exercise approved synthetic records, pending records, multiple facets, geography priority, privacy and AI failure.
