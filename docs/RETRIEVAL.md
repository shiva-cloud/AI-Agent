# English lexical retrieval baseline

The executable app now uses a small local BM25 implementation to rank eligible-topic evidence after validating the record and filtering jurisdiction. This is a lexical baseline, not semantic, vector or hybrid search.

## Request path

1. Validate English input and resolve the supported city/province.
2. Detect topics using word-boundary-aware patterns. For example, `parent` no longer triggers `rent`, and `Social Insurance Number` does not accidentally trigger health insurance.
3. Normalize common English inflections and selected official acronyms into query terms.
4. Filter evidence to the confirmed jurisdiction hierarchy and requested topics. Ambiguous or unsupported locations produce no retrieval candidates.
5. Score title, summary, quote and topic tokens with BM25 (`k1=1.2`, `b=0.75`). Add a small locality preference: 0.6 for city evidence, 0.3 for provincial evidence, 0 for federal evidence. These weights are engineering defaults, not learned or calibrated probabilities.
6. Apply existing publication, effective-date and freshness checks before a record can supply an answer claim. Unavailable evidence may still be returned internally to explain review/freshness gaps.
7. Always include each selected claim's source in the displayed citation ledger, even when other high-ranking records are unavailable.

The response includes retrieval version, candidate IDs, matched terms and ranking scores. Scores measure relative keyword relevance; they are not confidence or factual accuracy. Persisted traces retain versions, candidate IDs, scores and eligibility reasons, but omit question text, query terms and matched terms.

The index is built in memory per request over the scoped records. This is acceptable for the nine-seed local baseline, not a benchmarked architecture for a large corpus. PostgreSQL lexical indexes, embeddings, hybrid fusion and measured reranking remain pending.

## Repeatable evaluation

Run:

```text
node scripts/evaluate.js
```

This evaluates a fixed nine-seed fixture at a fixed date against `evaluation/english-pilot.json`, writes `artifacts/evaluation.json`, and exits unsuccessfully if a labeled case fails. It deliberately does not run against mutable production records, so editorial approvals do not change the regression baseline.

The initial dataset contains 28 developer-authored English cases covering source guidance, pending review, unsupported locations, missing data, partial answers and parser boundaries. It is not independently human-reviewed gold data. The runner reports intent micro-F1, location match, expected response status, Recall@5, mean reciprocal rank, citation-link completeness and local engine timing.

Citation-link completeness checks whether claims have source objects. It does not test whether those sources semantically entail every claim. A clean run on this small set is not a production accuracy score, a factual correctness guarantee, or fulfillment of the original 200/1,000-question evaluation gates.

## Known limitations

- No vector search or model-based paraphrase understanding.
- Unknown international locations can fall outside the hand-maintained dictionary.
- Topic guidance can still be relevant without answering every subquestion; responses retain the source-guidance label.
- The dataset is small and was used during implementation, so it is not a held-out generalization benchmark.
- The current host has Docker installed, but the Docker Linux engine was unavailable when checked. PostgreSQL validation has not run; no database-container startup or production deployment is claimed.

Next validation milestone: independently review and expand the English corpus and question set, then compare lexical and hybrid retrieval on the same held-out scenarios.
