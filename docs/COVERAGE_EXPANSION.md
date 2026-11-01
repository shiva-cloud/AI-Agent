# English knowledge expansion — 28 October 2026

Release 0.8.0 expands the research corpus from 9 to 19 records: 11 low-risk source-navigation summaries and 8 pending high-risk records. These are short research records, not 19 fully ingested documents or independently verified answers. Existing records and editorial decisions are preserved by startup's insert-if-missing behavior.

## Sources added

| Record | Scope | Official source | Status |
| --- | --- | --- | --- |
| fcac-bank-account | Canada / money | [FCAC account guide](https://www.canada.ca/en/financial-consumer-agency/services/banking/opening-bank-account.html) | Pending |
| cra-newcomers | Canada / money | [CRA newcomer guide](https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html) | Pending |
| jobbank-newcomers | Canada / employment | [Job Bank newcomer resources](https://www.jobbank.gc.ca/findajob/newcomers) | Pending |
| ontario-licence | Ontario / driving | [Ontario licence exchange](https://www.ontario.ca/page/exchange-out-province-drivers-licence) | Pending |
| icbc-foreign-licence | British Columbia / driving | [ICBC moving from outside Canada](https://www.icbc.com/driver-licensing/moving-bc/moving-from-another-country) | Pending |
| ttc-trip-planner | Toronto / transit | [TTC planner](https://www.ttc.ca/trip-planner) | Research summary |
| miway-trip-planner | Mississauga / transit | [MiWay](https://www.mississauga.ca/miway-transit/) | Research summary |
| brampton-trip-planner | Brampton / transit | [Brampton Transit planning](https://www.brampton.ca/EN/residents/transit/plan-your-trip) | Research summary |
| translink-trip-planner | Vancouver / transit | [TransLink planner](https://www.translink.ca/tripplanner) | Research summary |
| vancouver-library | Vancouver / community | [VPL learning resources](https://www.vpl.ca/guides/esl-french-and-literacy-resources) | Research summary |

## Research and publication limits

Official web pages or their search-index text were inspected. Direct fetches succeeded for FCAC, CRA, TTC and TransLink. Direct retrieval of Job Bank timed out and Ontario returned 403; their official search-index text informed navigation-only pending records. The other additions use official search-index excerpts. This access method is not an archived full-page capture. Quotes are short source headings or excerpts. Review metadata on the two failed-fetch records explicitly records the limitation.

All source-access policies remain unreviewed. No crawl permissions, snapshot imports, human approvals or publication events were fabricated. High-risk records expire on 4 November; low-risk summaries on 25 November 2026. Those dates are editorial refresh deadlines, not government effective dates. Expired guidance is withheld.

Transit responses link to the appropriate city operator. They do not calculate itineraries or provide live fares, arrivals or service availability. Financial and driving eligibility, tax obligations and professional recognition remain pending independent review. Driving imports must now be high-risk, matching the new seed classification.

## Validation and remaining work

Regression checks cover local transit isolation, withheld high-risk records, unsupported geography, expiry, English schema validation, unchanged missing-price behavior, and source inventory without fabricated permissions. The original 28 development scenarios remain unchanged and run against the expanded corpus. They are not independently labeled gold questions.

Still pending: school enrolment and childcare sources, telecom comparison data, grocery listings, broader housing coverage, source-access review and permitted snapshot ingestion, 30–50 curated documents, independently reviewed evaluation labels, PostgreSQL/vector retrieval, and production operations. The rule parser remains limited; this release does not promise understanding or answering every question.

## Issuing-country driving sources — 29 October 2026 (0.19.7)

Release 0.19.7 adds four pending high-risk records for the official licensing portals of the licence-issuing countries the parser already recognizes. Retrieval cites them only when the question names the issuing country (e.g. "exchange my Indian driving licence in Toronto"), alongside — never instead of — the Ontario/BC exchange guidance. Jurisdiction values use the licence-context country names exactly.

| Record | Issuing country | Official source | Status |
| --- | --- | --- | --- |
| india-sarathi-dl | India | [Parivahan: services on driver licence](https://parivahan.gov.in/en/faq/services-on-driver-license) (MoRTH/NIC Sarathi portal) | Pending |
| uk-dvla-share-licence | United Kingdom | [GOV.UK: view or share driving licence information](https://www.gov.uk/view-driving-licence) (GB; NI uses nidirect, disclosed in the record) | Pending |
| philippines-lto-ltms | Philippines | [LTO LTMS public portal](https://portal.lto.gov.ph/) | Pending |
| punjab-dlims-licence | Pakistan (Punjab) | [DLIMS Punjab](https://dlims.punjab.gov.pk/) (province scope disclosed; other provinces have separate authorities) | Pending |

The United States and Australia are deliberately omitted: licensing is administered by states, territories and provinces with no single national verification portal, so a national-level record would imply an authority it does not have. Official portals were confirmed through web research on 2026-10-29 (direct fetches of GOV.UK and DLIMS timed out; search-index titles informed the quotes, and the records' review notes say so). The records describe verification/navigation routes only; they do not verify an individual licence or decide Ontario/BC exchange eligibility, and they await independent human review like every other driving seed.

## All-country portal coverage — 30 October 2026 (0.19.26)

Release 0.19.26 extends driving-origin recognition from 24 to **200 issuing countries and territories**. It does not add 176 verified licensing guides. Instead, every country without a dedicated licensing record gets one broad national, government or state information entry point in `src/country-portals.js` (24 issuing jurisdictions already have dedicated records):

- **176 new high-risk records**, all `pending`, checked 2026-10-30 and expiring 2026-11-06. The corpus is now 257 records: 20 low-risk research summaries and 237 high-risk pending records.
- **Generic scope, stated in every summary**: the link is a national, government or state information entry point, not a licence-specific page. The pilot has not confirmed that the portal links to licensing guidance, and the record does not determine Ontario or British Columbia exchange eligibility. Where a live English page title was captured (24 entries), that title is used; the other 152 entries carry the explicit marker `No English page excerpt captured; link identified through research` rather than an invented quote.
- **Parser coverage**: `src/licence-context.js` imports the same country module and registers each country's aliases, so a phrase such as “Kenyan licence” or “licence issued in Peru” supplies the issuing country. Country names and adjectives are parsing coverage only; they say nothing about exchange agreements or legal eligibility.
- **Similar-name handling**: negative lookbehinds keep Papua New Guinea separate from Guinea, South Sudan from Sudan, the Democratic Republic of the Congo from the Republic of the Congo, and Bissau-Guinean from Guinean. `Northern Ireland` / `Northern Irish` route to the United Kingdom; `Irish` stays Ireland. `Dominican licence` intentionally remains ambiguous between Dominica and the Dominican Republic.
- **What was actually checked**: URLs and aliases came from Wikidata plus manual research. Live probes returned HTTP 200 for 130 of 200 candidate URLs; the other 70 returned 403/404/5xx or a network error from this environment. Some hosts serve content mainly in a local language. No page was archived, no source-access policy was reviewed, and no human reviewer approved a record. A future evidence batch must fetch a licence-specific English page, verify a verbatim quote and approve it before any public claim is possible.
- **No database mutation**: the new records are seeds and arrive through the normal startup insert-if-missing path. The working database was not rewritten for this batch.

The honest consequence: a question naming any recognized country can now cite an official starting point, but the answer remains `unavailable` with an `awaiting_human_review` gap. The 24 dedicated records remain the only ones with licence-specific summaries.

## Denmark and portal repairs — 30 October 2026 (0.19.27)

Release 0.19.27 closes the one-country gap left by the 0.19.26 generator. The country query returned “Kingdom of Denmark” (Q756617), which the generator excluded as a duplicate, so Denmark was absent from both `src/country-portals.js` and the parser aliases. The new `country-denmark-portal` covers `Denmark|Danish` at `https://denmark.dk/` with the captured title “Welcome to the official website of Denmark”. The issuing-country list is now **201 countries and territories**: 24 dedicated licensing jurisdictions plus 177 portal records. The corpus is 258 records: twenty low-risk summaries and 238 high-risk pending records.

Thirty existing portal URLs were replaced where the old link was non-English, tourism-only, stale or unreachable. The repairs cover Afghanistan, Algeria, Antigua and Barbuda, Armenia, Azerbaijan, Botswana, Bulgaria, Croatia, Cyprus, Czechia, El Salvador, Eritrea, Ethiopia, Guyana, Iceland, Indonesia, Italy, Kiribati, Latvia, Liechtenstein, Malaysia, Moldova, Morocco, Portugal, Qatar, Sao Tome and Principe, Slovenia, Switzerland, the UAE and Vatican City. A fresh probe of the 177 current URLs returned HTTP 200 for 118; the other 59 returned 403/404/5xx or a network error from this environment. Reachability is not an approval, and some hosts still serve content mainly in a local language.

The new record plus 19 repaired pages now carry a captured page title, so 44 of 177 portal records have one; the other 133 retain the explicit marker `No English page excerpt captured; link identified through research`. Every portal record remains `risk: 'high'`, `status: 'pending'`, checked 2026-10-30 and expiring 2026-11-06. No public claims, snapshots, source-permission reviews or independent human approvals were added. The records still describe a broad national entry point, not a verified licence-specific page, and do not determine Ontario or British Columbia exchange eligibility.
