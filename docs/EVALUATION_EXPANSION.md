# Expanded development evaluation

Release 0.12.0 preserves the original 28-case dataset and adds 30 explicitly authored scenarios in `evaluation/english-expanded.json`. Run both with `node scripts/evaluate.js`. Reports are written separately to `artifacts/evaluation.json` and `artifacts/evaluation-expanded.json`; either dataset failing makes the command fail.

The new scenarios cover transit in all four cities, Vancouver library resources, schools, childcare, housing subjects, banking, taxes, employment, licence sources, selected-city overrides, missing geography, mixed pending/available topics, prompt injection and UTC expiry boundaries. Expected labels are authored in the fixture, not derived from the engine at evaluation time.

## Answer constraints

Every evaluated answer is checked for source identity and URL consistency, source geography, citation linkage, publication status, expiry and effective dates. Deterministic claims must exactly equal their evidence summary. Individual fixtures can require or forbid source IDs, require actual claim IDs, cap claim count, or require a gap reason. A citation alone therefore cannot make a fabricated claim pass.

The answer-constraint pass rate is separate from intent, status and retrieval metrics. The original set retains its retrieval labels. The expanded set emphasizes output behavior and does not define ranked retrieval labels, so its Recall@5 and MRR are null rather than invented scores. Per-case dates allow deterministic expiry-boundary checks without modifying stored evidence.

Five evaluator tests include deliberately corrupted outputs to demonstrate that invented text, wrong geography, changed source URLs, unpublished/expired evidence, missing citations and unmet fixture constraints are detected. All 137 tests and 58 evaluation scenarios pass on this release.

## Limits and remaining work

These are small developer-authored regression datasets, not independently reviewed gold labels. Exact summary equality tests the deterministic engine, not semantic correctness of the source summary or externally rewritten AI output. A source can be outdated or incorrectly summarized while these checks still pass. This suite does not evaluate live providers, answer quality across arbitrary questions, production load, or browser behavior.

Pending work includes independent subject-matter review, the planned larger gold dataset, paraphrase and ambiguity coverage, provider-specific groundedness evaluations, and production performance validation. No human review or source approval has been fabricated to improve evaluation results.

## Issuing-country cases and evaluator scope alignment — 29 October 2026 (0.19.7)

Release 0.19.7 adds two expanded-set cases: "Exchange my Indian driving licence in Toronto" (must cite the Ontario exchange guide and India's Sarathi record) and "Exchange my UK driving licence in Vancouver" (must cite ICBC and GOV.UK's DVLA record, with the Ontario guide forbidden). Both expect status `unavailable` with zero claims — every driving record is still pending independent review, so the cases pin citation geography, not published guidance.

The same release fixed a latent evaluator gap: the constraint checker kept its own Canada-only jurisdiction scope, so any issuing-country citation would have failed as a `source_geography` issue. The checker now mirrors the engine scope in `src/evaluation.js`.

The expanded set now holds 37 authored cases (65 combined with the preserved 28-case pilot); 283 project tests and both datasets pass. Counts include the concurrent 0.19.5–0.19.8 batches; per-batch detail lives in `CHANGELOG.md`. Labels remain developer-authored fixtures, not independently reviewed gold labels.
