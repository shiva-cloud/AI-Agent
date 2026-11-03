# Audit fixes — 2 November 2026

Audit baseline: `DEEP_QA_REPORT_2026-11-02_HI.md` (v0.19.49).

## Implemented

- A01: diagnosis tests import input helpers from their owning module, `src/tool-input.js`. The previously skipped file now executes.
- A02: proof-of-funds rejects unsupported programs, invalid/fractional/out-of-range family counts, non-finite/negative money and invalid job-offer booleans. Valid numeric query strings remain supported. Omitted defaults remain distinct from invalid values.
- A03–A04: worker classification requires a supported province and explicit pay, hours, duration, holiday, classification-factor and payment-status facts. Empty or incomplete requests return validation errors rather than fabricated liability. Both GET and POST enforce the contract. Zero amounts are preserved instead of becoming assumed wages/hours.
- A05: KB health exposes `technicalHealth` and `publicationReadiness` separately. `--publication-ready` exits nonzero while editorial review remains incomplete. This does not manufacture editorial approval.
- A06: KB reads have a bounded 3-second busy timeout, always close the connection, and CLI failures return structured `storage_busy` / `health_check_failed` results with a nonzero exit.
- API request requirements and generated client refreshed. Existing successful tests now supply explicit worker facts; invalid-input tests assert rejection rather than silent substitution.

## Validation

- Focused existing suites: 44/44 passed (`artifacts/FIX_2026-11-02_focus.txt`).
- New direct and HTTP regression tests: 2/2 passed (`artifacts/FIX_2026-11-02_regressions.txt`).
- OpenAPI export/validation, client generation, TypeScript and lint ran successfully.
- Journey Chromium check passed with no page errors.
- Final full suite: **2,300/2,300 passed**, zero failed/skipped/cancelled; 64 seconds (`artifacts/FIX_2026-11-02_verified.txt`).
- Publication-readiness CLI correctly exits 1 with `NOT READY (589 records need editorial review)`; technical preflight passes.

## Remaining audit scope

A07–A10 are broader follow-up programs, not fully closed by these fixes: every calculator's route-specific boundary matrix, independent content fixtures, complete frontend static analysis/accessibility coverage, and incremental server/UI module extraction. Live provider, deployment, offsite recovery and billing checks require the configured external environment. The 589-record editorial-provenance gap remains visible and publication readiness remains false. No production deployment or editorial publication was performed.

Compatibility change: callers of worker-classification must now provide the required facts. Returning HTTP 400 for incomplete requests is intentional. Consumers should show missing-input errors and ask users to complete their actual facts.
