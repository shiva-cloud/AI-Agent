# Destination input and response contract

The parser's existing global destination names and OpenAPI response enum now share `src/destinations.js`. The response `country` can be `CA`, United States, United Kingdom, Australia, Germany, United Arab Emirates, New Zealand or Ireland. This documents existing parser scope; it does not certify evidence coverage in those countries or add new KB content.

The optional request `country` accepts those canonical names case-insensitively, trimming surrounding whitespace; `Canada` also maps to `CA`. Provided empty, non-string, unsupported or over-80-character values now return HTTP 400 instead of silently falling back. Omit the property to preserve inference from question text. This deliberately tightens previously permissive invalid-input behavior.

An explicit country conflicting with a country named in the question, or a global selection conflicting with Canadian city/region context, produces location clarification. Neither selection silently overrides the other. Existing licence-origin and newcomer-origin handling remains separate from destination selection. Ambiguous/unsupported geography still prevents claims.

Request schemas document the input field, response schemas list supported values and generated client types match. Actual HTTP parse/answer contract tests exercise every supported country, and parser tests cover normalization, rejection and conflicts. This is a shared country definition, not the complete hierarchical/versioned city-region-neighborhood registry in the roadmap.

## Country abbreviations in question text — 31 October 2026

Text inference now recognizes dotted U.S./U.S.A., U.K. and U.A.E. with or without a final period, including at end-of-input and before punctuation. The unsupported-destination scanner retains periods and consults the same global patterns instead of a separate mismatched alias list. Conflicting destinations still require clarification. Ordinary pronoun "us" is not treated as the United States, and longer dotted words are not accepted as abbreviations.

This change concerns question-text inference only. The explicit country input contract still accepts canonical country names and Canada/CA as documented above. No geographic hierarchy, new country coverage, language translation or KB facts were introduced.

## Multiple cities and residence wording — 31 October 2026

Parser version english-rules-0.11 no longer treats living/residing/staying in a city as permission to ignore another named pilot city. Multiple distinct cities always require location clarification, including cities in the same province and requests with a selected city. Sentence order cannot select the answer jurisdiction. Repeated mentions of one city remain unambiguous. This is intentionally conservative: origin-versus-destination interpretation, per-clause geography and comparison answers need a dedicated context contract before they can safely bypass clarification. The AI stage does not run when this geography gate requests clarification.

## Cross-Country Capabilities Matrix — 31 October 2026

The table below aligns platform feature support across recognized global destinations, explicitly documenting answer support, statutory calculators, gazette crawlers, and multilingual guide availability.

| Destination Country | Code | Answer Guidance Support | Statutory Tools & Navigators | Gazette Crawlers | Corridor Guides |
| --- | --- | --- | --- | --- | --- |
| Canada | `CA` | Comprehensive (Toronto, Vancouver, Mississauga, Brampton, Calgary, etc.) | 50+ Navigators (ESA, LTB, RTB, OHIP, MSP, CCB, CRS, Bardal, SABS, FHSA) | IRCC Operational Gazettes, ESDC Labour Updates | 54 Corridors (ES, FR, AR, ZH, HI, TL, etc.) |
| United States | `US` | Cross-border residency, J-1 waiver rules, CBP 72h ITN export | Cross-Border Banking & USD/CAD Currency Exchange, US Vehicle Import (MVSA s. 7) | US Federal Register (89 FR) Immigrant Rules | Bilateral US-CA Corridor Guides |
| United Kingdom | `UK` | NHS registration, Youth Mobility Scheme, reciprocal driving exchange | Driver Licence Reciprocal Exchange, Cross-Border Currency Exchange | UK Home Office Gazettes | Bilateral UK-CA Corridor Guides |
| Australia | `AU` | Medicare RHCA agreements, Transport for NSW licence exchange, VEVO checks | Driver Licence Reciprocal Exchange, Currency Transfer | Australia Department of Home Affairs (DHA) | Bilateral AU-CA Corridor Guides |
| Germany | `DE` | Chancenkarte (Opportunity Card) points, Anmeldung residence, B-level vocational | Chancenkarte Points Calculator, Foreign Credential Assessment | Bundesgesetzblatt Immigrant Decrees | Bilateral DE-CA Corridor Guides |
| United Arab Emirates | `AE` | Golden Visa employment/investor thresholds, Ejari tenancy registration | UAE Golden Visa Navigator, Cross-Border Wire Transfer | ICP Operational Updates | Bilateral UAE-CA Corridor Guides |
| Ireland | `IE` | NDLS driver licence reciprocal exchange, Irish citizenship foreign births | Driver Licence Reciprocal Exchange | Irish Immigration Delivery Updates | Bilateral IE-CA Corridor Guides |
| New Zealand | `NZ` | NZTA driver licence exchange, reciprocal health arrangements | Driver Licence Reciprocal Exchange | Immigration New Zealand Directives | Bilateral NZ-CA Corridor Guides |
