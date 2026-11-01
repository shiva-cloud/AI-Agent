# Geography registry (geo-1)

`src/geography.js` holds one versioned, typed hierarchy of every place the parser recognizes. Before geo-1, pilot city aliases lived in `engine.js`, province patterns in `parse()`, and supported/unsupported lists in separate regular expressions. They now come from one table. Tests: `test/geography-registry.test.js`.

## Model

Each place has `id`, `type` (`country`, `region`, `city`, `neighbourhood`), `name`, `parent`, `status` and `aliases`. Aliases are case-insensitive pattern fragments matched on word boundaries.

| Status | Meaning | Places in geo-1 |
| --- | --- | --- |
| `supported` | Answered by the pilot | Canada; Ontario, British Columbia; Toronto, Mississauga, Brampton, Vancouver; Square One (Mississauga) |
| `known_unsupported` | Always needs clarification | Quebec, Alberta, Manitoba, Nova Scotia; Ottawa, Montreal, Calgary, Edmonton, Winnipeg, Halifax; France, Paris |
| `outside_canada` | Needs clarification when the question is otherwise Canadian | United Kingdom, London; Australia, Sydney, Melbourne; United States, New York; United Arab Emirates, Dubai |

A neighbourhood resolves to its city (Square One → Mississauga → ON → CA). "London" is recorded under the United Kingdom, but it may also mean London, Ontario; either reading still requires clarification. Manitoba and Nova Scotia have no aliases yet. They exist only as parents for Winnipeg and Halifax, so mentioning them by name does not change parsing.

## Parser and API

- `parse()` uses `supportedCitiesIn` and `supportedRegionsIn` from the registry. Unsupported-place detection uses the same table. Parsed questions carry `geographyVersion: "geo-1"`.
- `GET /v1/geography` publishes the places with `path` (for example `["CA","BC","Vancouver"]`). Aliases are not published.
- Unknown places after "in", "near", "moving to" and similar words still require clarification. The resolver never infers Canada from an unknown place.

## Location clarifications

When an answer needs a location, `clarification` now explains the specific problem, and an optional `placeClarification` object carries the details:

| `reason` | Example question | Message (shortened) |
| --- | --- | --- |
| `unsupported_place` | "Moving to London, what about rent?" | London could mean London, Ontario or London, United Kingdom. This pilot does not cover either place yet… To ask about the United Kingdom as a whole, choose it as the destination country… |
| `multiple_cities` | "Rent in Mississauga and Brampton" | Ask about one city at a time… |
| `conflicting_regions` | "Toronto BC health" | Your question mentions places in more than one province (Ontario and British Columbia)… |
| `conflicting_countries` | Two countries | Ask about one country at a time. |
| `unknown_place` | "Rent in Springfield" | We could not recognise the place in your question… |
| `missing_location` | "Can my landlord evict me?" | Which city is your question about?… |

- `mentioned` lists every registry place named in the question, plus places with the same name (London, ON is recorded without an alias so parsing is unchanged), each with a label, status and path.
- `selectableCities` holds the four pilot cities only for `missing_location` with no city or region. It is empty in every other case, because a chosen city must never overwrite a place the user wrote. This matches the existing UI rule in `public/clarification.js`.
- The public UI still shows the `clarification` text and its own city buttons; it does not read `placeClarification` yet.

## Verification

The change was designed to keep existing parsing unchanged. A before/after comparison of `parse()` on 505 inputs (the QA dataset, both evaluation sets, benchmark CSV questions and 17 extra place probes) showed zero differences in intents, city, region, country, ambiguity, missing slots and licence country. The full suite passed 702/702 (`artifacts/backend-geography-registry-tests.txt`), and both evaluation sets (28 pilot + 68 expanded) passed with no failures.

## Limits

- Place labels are pilot configuration written by developers, not an independently reviewed gazetteer.
- There are no neighbourhoods beyond Square One, no postal codes, and no other Canadian provinces or cities beyond those listed.
- The registry does not resolve per-clause geography ("from Paris to Toronto" still needs clarification) and adds no new coverage. Global destination country detection still comes from `src/destinations.js`.
