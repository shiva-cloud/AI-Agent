# Housing coverage and relevance — 28 October 2026

Release 0.10.0 adds four English pending research records, bringing the corpus to 27 records: 11 low-risk summaries and 16 high-risk records awaiting independent review.

| Record | Subject | Jurisdiction | Official source |
| --- | --- | --- | --- |
| ontario-rent-deposits | deposit | Ontario | [LTB guide, rent deposits section](https://tribunalsontario.ca/documents/ltb/Brochures/A%20Guide%20to%20the%20Residential%20Tenancies%20Act.html) |
| bc-tenancy-deposits | deposit | British Columbia | [Tenancy deposits and fees](https://www2.gov.bc.ca/gov/content?id=BC74652E526B4BFCAEC4329D8325D1B5) |
| bc-tenancy-agreements | agreement | British Columbia | [Tenancy agreements](https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/starting-a-tenancy/tenancy-agreements) |
| bc-rental-repairs | repairs | British Columbia | [Repairs and maintenance](https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/repairs-maintenance) |

Official search-index text informed the summaries. Direct retrieval of all three BC pages returned 502. Each record states this research limitation. Only short headings are quoted; no full-page snapshot, crawl permission, independent review or publication approval is implied. These records do not provide numerical limits, decide tenancy-law coverage or settle personal disputes. They remain pending and expire on 4 November 2026, an editorial refresh deadline.

## Retrieval change

Previously, housing topic and province matches could admit unrelated rental records. Retrieval now also matches an explicit housing subject before ranking. The optional `housingSubject` evidence field accepts deposit, agreement, repairs or eviction only, and is valid only for housing records. New housing imports require a subject. The original eviction record retains its known subject through a compatibility mapping without rewriting historical database rows. Other unclassified historical housing records are withheld from question answers until classified through review. Coverage inventory still counts them as stored records; inventory is not a promise of question answerability.

Changes to a housing subject appear in the editorial comparison report as scope changes. Snapshots and publication history remain immutable. The field is stored in the existing validated JSON record, so no SQL table migration is required.

Examples checked using approved test fixtures only:

- A Toronto rent-deposit question selects the Ontario deposit record, not eviction guidance.
- A Vancouver security-deposit question selects the BC deposit record, not the agreement or repair record.
- A Toronto deposit-and-repairs question is partial when only deposit evidence exists.
- Unknown rental-price or advance-rent questions remain unavailable rather than receiving broad legal summaries.
- A bank-deposit question does not become a housing question merely because it contains deposit.

This remains narrow English rule matching. It does not determine semantic entailment, handle every paraphrase or resolve exclusions. General repair questions still need rental context. Legal answers remain subject to independent review and evidence freshness.

## Validation and pending work

Ten housing regression tests cover subject/geography isolation, withheld pending sources, missing second subjects, metadata validation, change reporting and unclassified imports. All 126 tests pass, as do the unchanged 28 development evaluation cases. Developer fixtures are not independently reviewed accuracy labels.

Pending: full official-text capture under reviewed access policies, legal review, Ontario agreement and repair coverage, BC eviction coverage, rent increases and other housing subjects, richer language understanding, and production validation.
