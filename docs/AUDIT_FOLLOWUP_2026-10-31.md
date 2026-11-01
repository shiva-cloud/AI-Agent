# Follow-up audit: 18 reproduced failure cases

All 18 numbered regression tests in `test/audit-followup.test.js` failed against the code before these changes. All 18 pass after the fixes. These cases cover related input-validation failures as well as calculation and calendar-export defects; they are not 18 independent security vulnerabilities.

| # | Reproduced behavior before fix | Corrected behavior |
|---|---|---|
| 1 | Budget called without options throws a TypeError | Uses documented defaults |
| 2 | Unknown city silently becomes Toronto; inherited property names crash | Rejects unknown cities with a validation error |
| 3 | Unknown household gets a mismatched cost model; null/object crashes | Validates supported household choices |
| 4 | Unknown accommodation silently receives one-bedroom pricing | Rejects unsupported accommodation |
| 5 | Negative savings silently becomes zero | Rejects negative savings |
| 6 | Invalid money becomes zero; Infinity produces non-finite calculations | Rejects malformed/non-finite money and nonnumeric coercions |
| 7 | Zero salary is replaced with an $80,000 salary | Preserves zero in comparison calculations |
| 8 | Negative/invalid salary yields misleading or non-finite outflow | Validates salary before calculation |
| 9 | Zero, fractional or invalid household count affects transit/rent calculations | Requires a positive integer count |
| 10 | Duplicate cities prevent a meaningful two-city differential | Deduplicates cities, preserving order |
| 11 | February 30 rolls into March in calendar milestones | Rejects impossible landing dates |
| 12 | Fractional offsets truncate dates; extreme offsets cause RangeError | Validates integral offsets and representable dates |
| 13 | Malformed milestone records/collections crash with TypeError | Reports structured validation errors |
| 14 | Newlines in event text inject calendar properties/events | Escapes text and encodes UID components |
| 15 | Commas, semicolons and backslashes corrupt calendar TEXT values | Escapes reserved characters |
| 16 | Long UTF-8 content lines are emitted without folding | Folds at 75 octets without splitting Unicode characters |
| 17 | Duplicate milestone IDs produce identical event UIDs | Rejects duplicate IDs |
| 18 | Invalid expiry/reference dates can produce a “safe” result with NaN days | Rejects invalid dates before status evaluation |

## Changes and compatibility

Changed `src/newcomer-budget.js`, `src/city-comparison.js`, `src/settlement-calendar.js`, and `src/statutory-calculators.js`. Added `src/calculator-input.js` for consistent numeric validation. Valid numeric strings remain accepted for existing form/API callers. Invalid inputs now raise the existing `ValidationError`, which HTTP routes translate into status 400.

Calendar escaping and folding follow [RFC 5545 sections 3.1 and 3.3.11](https://www.rfc-editor.org/rfc/rfc5545). Date calculations and calendar formatting were corrected without changing immigration, medical or financial policy constants.

## Evidence

- **Final full verification: 793 tests passed, 0 failed**, including all 18 new failure cases and HTTP integration. Log: `scratch/audit-followup-confirmed.log`.
- `scratch/audit-followup-before.log`: 18 tests, 0 passed, 18 failed before fixes.
- `scratch/audit-followup-after.log`: 35 targeted tests passed after fixes, including existing module tests.
- An additional HTTP regression covers invalid GET/POST inputs and a valid zero-salary request.
- Full-suite log: `scratch/audit-followup-full.log`.
- Pre-flight log: `scratch/audit-followup-preflight.log`.
- TypeScript checks, OpenAPI validation, pre-flight and disposable-server smoke passed.
- The first full run recorded 793 tests with one wording-guard failure in files outside this batch. Those files changed concurrently; the current wording guard and this batch's HTTP/regression tests then passed together (21 tests). Final full rerun: `scratch/audit-followup-full-final.log`.
- That rerun encountered another concurrent wording/test change in the currency module (plural “Reports” versus singular “Report”). The current test already accepts the singular wording. A subsequent combined run of all touched modules, HTTP cases, currency tests and the wording guard passed **45/45**, recorded in `scratch/audit-followup-verified.log`. Neither wording change is counted among this batch's 18 fixes.

The previous audit's three moderate development-tool dependency warnings are unchanged; this batch does not modify dependencies. Production deployment, live external AI and independent verification of policy assertions are outside these tests.
