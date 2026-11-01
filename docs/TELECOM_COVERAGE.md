# Telecom coverage — 28 October 2026

Release 0.17.0 adds three pending English research records. The corpus now has 30 records: 11 low-risk navigation summaries and 19 pending high-risk records. Thirty short research records do not satisfy the original target of fully curated, archived and independently reviewed documents.

| Record | Subject | Source and access |
| --- | --- | --- |
| crtc-mobile-options | mobile | [CRTC plan-selection resources](https://web.crtc.gc.ca/eng/phone/mobile/options.htm); official search-index excerpt inspected, direct retrieval timed out |
| crtc-internet-code | internet | [CRTC Internet Code](https://crtc.gc.ca/eng/internet/code.htm); direct page inspected |
| ccts-complaints | complaint | [CCTS complaint assistance](https://www.ccts-cprst.ca/for-consumers/how-we-can-help/); direct page inspected |

All three have national scope, remain pending and expire on 4 November 2026 as an editorial refresh deadline. No consumer entitlement, compensation, cancellation fee or complaint outcome is decided. The CRTC page identifies applicability limits and ongoing consultation; the seed does not infer that every provider has identical obligations. Source permissions remain unreviewed and archived snapshots remain absent.

## Retrieval and safeguards

The parser now recognizes internet, broadband, wireless, cellphone, Wi-Fi, telecom and CCTS in addition to the existing mobile and SIM terms. Explicit telecom subjects separate mobile guidance, internet rights and complaint assistance. Unclassified telecom records are withheld from question retrieval. New telecom imports require subject metadata, and changes to that metadata appear in editorial comparisons. Telecom evidence now requires high-risk classification through shared validation.

Price-only questions do not retrieve these navigation summaries. They report missing live price data. A mixed price-and-rights question can return partial guidance after evidence approval while retaining the price gap. No provider tariff, cheapest-plan ranking, speed or coverage data was added. Detection uses narrow English rules and is not comprehensive semantic understanding; unrelated uses of telecom words may still require richer context handling.

Seven tests cover subject isolation, pending publication gates, price-only abstention even with approved fixtures, mixed price gaps, unrelated complaints, unsupported geography, metadata validation and import requirements. All 173 tests, both development evaluation datasets (58 scenarios) and the actual 30-record database verifier pass.

Pending: independent consumer-rights review, permitted archival capture, current provider pricing with regional terms and refresh rules, grocery coverage, remaining school/housing gaps, and production infrastructure/validation.
