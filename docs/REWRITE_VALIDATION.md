# Local AI rewrite checks

Release 0.18.0 adds provider-independent checks to the optional answer rewrite pipeline. Before semantic verification, every rewritten claim must retain the same protected-token multiset as its original claim: numeric strings, selected English number words, URL/email tokens, currency and percentage markers, and selected condition words (no, not, never, cannot, must, may, only, unless, except). A mismatch returns the deterministic baseline without exposing the rejected draft.

The introduction displayed to users is always the application-written baseline introduction. A generated introduction cannot add an unsupported promise even if the external verification response approves it. Existing claim IDs, citations, publication gates, deadlines and semantic verification remain in force. No provider credentials or configuration were changed.

## Scope and limitations

This is a conservative lexical guard, not proof of semantic equivalence. Reordering the same numbers or changing a unit can preserve the token signature while changing meaning; many names, dates written in words and conditions are outside this check. The separate semantic review remains necessary and is itself fallible. Harmless rewrites that change protected wording can cause fallback. This tradeoff favors retaining sourced baseline text over accepting a questionable rewrite.

The checks normalize case, Unicode compatibility characters and common ASCII negative contractions. They preserve token counts per claim rather than across the whole answer. They do not execute links or contact addresses. Fixed introductory text prevents generated introductory claims; it does not prove that rewritten claim text is correct.

Thirteen new tests cover changed numbers, numeric dates, amounts, currencies, percentages, number words, modality, negation, URLs and email addresses; accepted wording changes; pipeline rejection before semantic review; and unsupported introductions. All 186 project tests pass using mock providers, without external API calls. Live-provider quality and larger independently reviewed groundedness evaluations remain pending.
