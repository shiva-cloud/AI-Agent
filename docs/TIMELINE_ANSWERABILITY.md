# Timing questions and answerability

Query contract `query-2` recognizes explicit processing-time and application/submission/renewal/registration deadline requests. It adds `processing_time` and `application_deadline` facets with `missing_verified_processing_time` and `missing_verified_deadline` gap reasons. A timing-only request uses `requestedOutput: timeline`; checklist and eligibility output preferences keep precedence when combined, while all recognized facets remain present.

One recognized topic supplies the facet topic. Multiple topics produce an unassigned timing facet instead of guessing which subject the timing phrase modifies. Merely mentioning an arrival date, yesterday or a first-week checklist does not trigger these timing patterns. Typography normalization still runs first.

Current source summaries, approved status and ordered checklist steps do not declare structured verified processing estimates or applicable deadline facts. The new facets therefore remain unsupported. Relevant source guidance can still be returned, but the answer is marked incomplete/partial rather than claiming the requested timing is covered. No deadline, duration or personal date is inferred or persisted into gap-work metadata. Existing geography, language, publication and AI fallback gates remain unchanged.

This is conservative pattern-based coverage, not general temporal reasoning. Negation, arbitrary date arithmetic, broad scheduling questions, wait-period rules and detailed per-clause topic attribution remain outside this change. Structured verified temporal evidence and independent unseen-question evaluation are still required. No KB records or approvals were changed.
