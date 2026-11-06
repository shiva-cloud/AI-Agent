# Subject tags

A topic is too broad to decide whether a record answers a question: rent increases and subletting are both `housing`. Subject tags record what each evidence record is about, so an answer can be limited to records on the subject asked.

**Status: shadow only.** Tags change no answer. `answer()` exposes what they would do through a non-enumerable `subjectShadow`, which never reaches public JSON.

## Why tags are not in the record

The public evidence gate compares a record with its approval audit word for word. Adding a field to record bodies dropped served approved records from 493 to 207 in a dry run. Tags therefore live in `src/subject-tags.json`, keyed by record id.

Each tag stores a hash of the record's title and summary. When a record is edited the hash stops matching and the record counts as untagged, so a label can never outlive the text it was judged against.

Tags choose between records. They state no fact and are never shown, so they sit outside the publication chain. That does not make them harmless: a wrong tag cites the wrong record.

## Tag states

| Status | Method | Used for |
|---|---|---|
| `confirmed` | `template` | Records stamped from one template, tagged by script |
| `confirmed` | `reviewer` | A person checked the suggestion |
| `proposed` | `rule` | A pattern matched the title or summary. Only a suggestion, and the validator rejects it as confirmed |

## Commands

```bash
node scripts/subject-tags-propose.js --write
```

```bash
node scripts/subject-shadow-report.js --proposed --verbose
```

```bash
node scripts/subject-fit-benchmark.js
```

The proposer never changes the database and keeps reviewer-confirmed tags whose record is unchanged. The shadow report reads tuning questions only.

## Benchmarks

| File | Use |
|---|---|
| `evaluation/subject-fit.json` | Tuning. Rules may be written against it |
| `evaluation/subject-tags-holdout.json` | Phase gates only. A case that prompts a rule change stops being held out and moves to the tuning file |
| `evaluation/subject-tags-baseline.json` | Scores before tags affect any answer |

The questions are developer-written and judge subject only, not legal accuracy. The same developer wrote the rules, so the held-out set is not independent; real or third-party questions should replace it when available.

## Rollout

Each topic switches on separately once 95% of its records are tagged and a reviewer has sampled 10% of its tags. A question that matches no subject keeps the existing rules. Turning a topic's switch off restores them at once.

## Reviewing tags

`scripts/subject-tags-review-list.js` lists the publicly served records of the named topics with their suggestions. Decisions from a review are applied with `scripts/subject-tags-apply-review.js`, which skips any decision made against text that has since changed and writes nothing unless `--write` is passed.
