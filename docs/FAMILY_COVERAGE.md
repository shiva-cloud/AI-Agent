# School and childcare research — 28 October 2026

Release 0.9.0 adds four English research records, bringing the corpus to 23 records: 11 low-risk navigation summaries and 12 pending high-risk records. No new source is independently human reviewed or published as answer guidance.

| Record | Scope | Source and access | Review status |
| --- | --- | --- | --- |
| tdsb-registration | Toronto, family/school | [TDSB registration](https://www.tdsb.on.ca/Registration/Pre-Registration-Questions-and-Answers), direct page inspected | Pending |
| vsb-registration | Vancouver, family/school | [VSB Grades 1–12 registration](https://vsb.bc.ca/grades-1-12-school-registration), direct page and official search text inspected | Pending |
| ontario-childcare | Ontario, childcare | [Find and pay for child care](https://www.ontario.ca/page/find-and-pay-child-care), official search-index text inspected | Pending |
| bc-childcare | British Columbia, childcare | [Child care information for families](https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/family-information), official search-index excerpt inspected; direct fetch returned 502 | Pending |

## Scope and unresolved evidence

TDSB is one Toronto school board. Its record does not represent all boards or determine catchment, eligibility, tuition or placement. The Vancouver record covers the linked Grades 1–12 guide. No personal registration route is inferred: the newer [general registration page](https://vsb.bc.ca/grades-1-12-school-registration) and [NWC page](https://www.vsb.bc.ca/nwc/online-registration) describe routes differently and require editorial reconciliation before procedural claims are approved.

The [Peel welcome-centre page](https://www.peelschools.org/welcome-centres) returned 403. Search results exposed third-party references but did not provide sufficient official content in this research pass. No school record was added for Brampton or Mississauga. Their school queries continue to report missing evidence. The Ontario childcare resource applies at provincial scope to those cities without implying local vacancies or subsidy approval.

The childcare topic recognizes childcare, child care, child-care, daycare, day care and day-care. Plain childcare queries no longer match school records solely because of the word child. School and childcare intents are both retained when explicitly requested. This is a rules-based improvement, not general language understanding.

Family and childcare imports now require high-risk classification and the existing authoritative-source review workflow. Seeds expire on 4 November 2026, an editorial refresh deadline rather than a policy effective date. Source access policies remain unreviewed. No archived full-page snapshots, publication decisions or permissions were invented.

## Validation and next work

Ten new tests cover wording variants, geographic isolation, missing Peel school evidence, withheld guidance, multi-topic parsing and risk-downgrade rejection. The original 28 development evaluation cases still pass against the expanded corpus. They do not measure independent factual accuracy.

Pending: official Peel school content, other school boards, human reconciliation of Vancouver registration routes, childcare provider data and vacancy freshness, independent evidence review, permitted snapshot ingestion, and broader housing/telecom/grocery coverage. Production infrastructure and release validation also remain incomplete.

## Release 0.19.9 — Peel school boards (29 October 2026)

| Record | Scope | Source and access | Review status |
| --- | --- | --- | --- |
| pdsb-registration-mississauga | Mississauga, family/school | [PDSB Register for School](https://www.peelschools.org/registration), direct page inspected in full | Pending |
| pdsb-registration-brampton | Brampton, family/school | [PDSB Register for School](https://www.peelschools.org/registration), direct page inspected in full | Pending |
| dpcdsb-registration-mississauga | Mississauga, family/school | [DPCDSB Admissions](https://www.dpcdsb.org/admissions), direct page inspected in full | Pending |
| dpcdsb-registration-brampton | Brampton, family/school | [DPCDSB Admissions](https://www.dpcdsb.org/admissions), direct page inspected in full | Pending |

The 0.9.0 hole documented above is closed for registration routes: the Peel District School Board (public) and the Dufferin-Peel Catholic District School Board (Catholic, "Open Access" secondary) now serve both Peel pilot cities. Both boards publish one shared regional page, so the per-city entries carry identical summaries — same evidence, city-scoped registration — and every quote is a verbatim substring of its cited page.

Still open, kept honest: the welcome-centre route (the 0.9.0 pass met an HTTP 403 there and this pass did not re-check it), so the Newcomer Reception and Assessment Centre detail remains unregistered. No Conseil scolaire Viamonde or private-school records exist, the Catholic board's elementary admissions rule is disclosed verbatim without deciding whether any particular family qualifies, and every record stays pending independent human review with the same high-risk gating as the rest of the corpus. Where a family arrives from a non-Canadian jurisdiction, the DPCDSB records carry the board's own statement that admission for non-Canadians happens on an individual basis through its Admissions Department.
