# Project diagnosis, 1 November 2026

**How this was checked:**
- syntax of all 600+ JS files;
- the full test suite (1,900 tests);
- lint and validators;
- every API path sent 6 input variants;
- a type-confusion fuzz of 182 tools;
- realistic typed numbers on 97 tools;
- every field of 30 tool forms tested one at a time, then re-tested in every dropdown mode;
- browser use at desktop, 1366 px and phone width.

All of this ran against a copy of the live database. Every item below was reproduced, and false alarms were removed.

## Fix status (updated the same day)

| # | Status | What changed |
|---|---|---|
| 1 | **In review: publish queue built** | Decision: an editor reviews and publishes each record. The admin desk now has a publish queue (health and housing first) that goes from official page to excerpt to approval. Records outside Canada can now be published. 664 records remain, and they reappear in answers as they are published. See `docs/KB_MAINTENANCE.md`. |
| 2 | Fixed | Address, email, phone, date and details fields accept missing or numeric values. The form defaults return 200. |
| 3 | Fixed | The GET handler maps study level, province, field, CLB, TEER and foreign experience. |
| 4 | Mostly fixed | The UK age is no longer assumed to be under 26. The visitor-visa income field now feeds the risk factors. |
| 5, 6 | Fixed | A wrong field type returns a 400 with a plain message. Output containing `[object Object]`, `NaN`, `Infinity` or `Invalid Date` is refused. Re-fuzz: 0 crashes and 0 garbage across 182 tools. |
| 7 | Fixed | "$75,000", "CAD 1,200" and "2,800 CAD" are read as numbers. Re-probe: 0 of 78 tools misread them. Moving-tax now echoes the number of days, not the raw text. |
| 8 | Fixed | Missing or non-text fields return 400, and bad paging values fall back to the defaults. |
| 9 | Fixed | Non-text fields are ignored, so `[object Object]` no longer appears. |
| 10 | Low, open | `csp-styles.js` re-applies the blocked styles, so the page looks correct. Only console noise remains. |
| 11 | Fixed | The CSP now allows `img-src 'self' data:`. The dropdown arrow is visible. |
| 12 | Fixed | Sidebar titles get their own line and break between words. |
| 13 | Fixed | The phone header is one 60 px row with no horizontal scroll. |
| 14 | Fixed | The source preamble and reported-speech joins are cleaned up. |
| 15 | Fixed | Tools are suggested from the question. Words that only appear in the sources break ties. |
| 16 | Fixed | `/v1/account` returns 204 when SaaS mode is off. |
| 20 | Fixed (found later) | "enrol in MSP" was read as an unknown place called "MSP", so the question got a clarification instead of an answer. Health-plan and ID acronyms are now ignored. |
| 17–19 | Low, open | Responses are compressed with brotli or gzip. The limits are deliberate. |

The API probe found 0 server errors after the fixes, the form probe found 0 dead fields, and `npm test` passed 2,058 of 2,058. Regression tests are in `test/diagnosis-2026-11-01.test.js`.

**What passed:**
- no syntax errors;
- 1,900 of 1,900 tests;
- policy-lint, verify-data, OpenAPI validation, typecheck, pre-flight and evaluation;
- security headers (CSP, X-Frame-Options, nosniff, referrer policy);
- admin routes refuse requests without a token;
- no secrets found in the code.

## Critical: users see wrong results or nothing

1. **Chat cannot answer health, housing, employment, money, driving, family, childcare or telecom questions.** Of 894 records only 227 are shown to users, and 201 of those are country templates. Shown per topic:
   - **None shown:** health 0 of 33, housing 0 of 88, employment 0 of 150, money 0 of 52, driving 0 of 211, family 0 of 32.
   - **Cause:** `src/public-evidence.js` withholds every high-risk record that has no editorial review plus publication. No high-risk record has one.
   - **Example:** "How do I get OHIP and a SIN?" answers only the SIN part.
   - **Fix:** review and publish records through `/v1/review`, or decide on a policy change. This is a product decision. The scheduled fact-check cannot unblock it, because by design it never approves records.
2. **`legal-notices` tool always crashes (HTTP 500) from the website.** The GET handler never passes `senderAddress` or `unitAddress`. `src/legal-notice-generator.js:108` then calls `.trim()` on `undefined`.
3. **`study-to-pr` tool ignores its whole form.** Study level, province, field of study, CLB and TEER have no effect, so every user gets the same answer.
4. **More tool form fields have no effect on the result.** Each was re-tested under every dropdown mode:
   - `visitor-visa-financial-ties`: Monthly income
   - `us-h1b-opt`: I-94 date
   - `uk-skilled-worker`: New entrant
   - `workplace-rights`: Regulated profession and Date of injury

## High: crashes and garbage output via the API

5. **17 tools crash (500) when a field has the wrong type.** Examples are `province` sent as a number, list or `null`. Most call `(x || 'ON').toUpperCase()` on a non-string:
   - banking-comparator, bowp-diagnostic, calendar-sync, customs-declaration
   - global-visa-matrix (null), healthcare-eligibility, homebuyer-eligibility, lease-guard
   - licence-exchange, medical-admissibility (null), moving-tax-calc, pnp-pathway
   - pr-matrix, small-claims, study-permit-cap-pal (null), super-visa-sponsor (null), tax-shield
6. **17 tools put `[object Object]`, `NaN` or `Infinity` into the text shown to users.** Examples:
   - a notice dated `DATE: [object Object]` (consumer-protection, rent-increase-defense);
   - `wage loss of $NaN` (esa-reprisal-defense);
   - `Contribute $NaN CAD` (tax-shield);
   - `$Infinity total remedies` (ontario T6).

   The same problem appears in eviction-defense, global-visa-matrix, homebuyer-tax-incentives, manitoba-general-holiday-pay, medical-admissibility, pgwp-eligibility, real-estate-assignment, speculation-tax-rebate, study-permit-cap-pal, study-to-pr, worker-classification and workplace-safety.
7. **45 of 97 tools silently misread numbers typed as "$75,000".** They fall back to a default or 0 and give a different answer without any error. The website's number inputs mostly prevent this, but API users and pasted text are affected.
8. **Community translations: errors returned as 500 instead of 400.**
   - `/v1/translations/community` with a non-numeric `limit` or `offset` gives "datatype mismatch".
   - `/v1/translations/community/submit` with missing fields throws a plain `Error`, which becomes a 500.
9. **`/v1/citations/bilingual` renders `[object Object]`** when the text fields are objects.

## Medium: visible to users in the website

10. **Inline styles blocked by CSP.** 89 console errors on the first load. The app writes `style="..."` that `style-src 'self'` blocks, so some elements lose their styling.
11. **Dropdown arrow icon missing.** The select arrow is a `data:` SVG, but CSP sets no `img-src`, so it is blocked.
12. **Sidebar category labels break letter by letter** ("CHAT & CASEWO RK", "PRE-IMMIG RATION") at 800 px and 1366 px, because the "Show Menu" buttons take the space.
13. **Mobile header is broken at 375 px.** "Menu" and "Search & Commands" wrap one letter per line and overlap the hero heading.
14. **Garbled "In short" sentence in answers.** The text reads "...you need a 9-digit identifier..., that the SIN is private, that it is illegal...", because the record's "The ESDC page states that" prefix is cut off.
15. **Unrelated tool suggestions.** An OHIP and SIN question suggests the PGWP evaluator and the customs assistant.
16. **`/v1/account` returns 404 twice on every page load** when SaaS mode is off, which adds console errors.

## Low: performance and maintenance

17. **The browser loads unminified `app.js` (1.2 MB) and a 347 KB `index.html`.** `app.min.js` is generated but never used. This makes the site slow on phones.
18. **Rate limit of 120 requests per minute.** A user clicking through many tools can hit HTTP 429.
19. **Request body limit.** Bodies of about 18 KB are rejected with 413, which can affect long pasted text such as officer notes.

## Not checked yet (usage limit reached)

- Every tool modal clicked through in the browser (only the HTTP paths were tested).
- Keyboard and screen-reader accessibility, beyond a tap-target check.
- `npm audit` for dependencies.
- The 9 tools whose POST handler could not be mapped automatically: settlement-journey, sinp-hard-to-fill, bc-esa-group-termination, alberta-overtime-banking, sinp-tech-talent, caregiver-direct-pr, on-creed-accommodation, legal-notices (POST) and poe-rights.

Reproduction scripts (scratchpad): api-probe.mjs, type-fuzz.mjs, real-input.mjs, form-effect.mjs, form-dead-confirm.mjs, served.mjs.
