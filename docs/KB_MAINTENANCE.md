# Keeping the knowledge base correct

Content is never deleted to fix a problem. It is corrected, rejected with an audit trail, or flagged for review, so nothing has to be re-added later.

## The four parts

| Part | File | What it does |
| --- | --- | --- |
| Fact registry | `src/kb-facts.js` | One place for figures that change on a schedule (salary thresholds, settlement funds, caps, guidelines). Each figure has its source, the date it took effect, the date it was checked and a `reviewBy` date. Tools import from here, so a change is made once. |
| Quality rules | `src/kb-quality.js` | Rules every record must pass: English record policy, https source, valid dates, a summary long enough to carry a fact, no filler text, no retired figures. They run inside `npm test`, so a bad record added by any person or session fails the tests straight away. |
| Health check | `npm run kb:health` | One read-only report, described below. |
| Corrections | `npm run kb:corrections` (dry run) / `npm run kb:corrections:apply` | Applies text corrections to both the database and the seed files. It backs up first, writes a hash-chained audit row per record and can safely run again. |

### What the health check reports

**Blocking problems.** These make the command exit with an error:
- records that break the quality rules;
- glossary entries with filler or a missing language.

**Warnings:**
- facts past their review date;
- expired records, and records expiring within 14 days;
- seed files out of sync with the database;
- approved records that were never editorially reviewed.

## Automatic schedule

Two scheduled tasks in the Claude desktop app do the routine below. Nobody has to remember it.

| Task | When | What it does |
| --- | --- | --- |
| `northstar-kb-daily-review` | Monday to Friday, 20:00 | Takes the next 20 unreviewed records from `npm run kb:review -- next 20` and checks them against official sources. It applies confirmed corrections with the correction script, which backs up first and writes an audit row. Then it marks each record verified, corrected or needs-human, runs the tests and writes to `docs/KB_MAINTENANCE_LOG.md`. |
| `northstar-kb-weekly-health` | Sunday, 20:00 (a different day from the daily run, so the two never edit the same files at once) | Runs `npm run kb:health` and fixes blocking problems. It updates facts past their review date, re-checks expiring records and moves one tool's hard-coded figures into `src/kb-facts.js`. Then it runs the tests and writes to the log. |

- **App must be open.** The tasks run while the app is open. If it was closed at the scheduled time, the task runs the next time the app starts.
- **Progress.** Review progress is kept in `data/kb-review-progress.json` and shown by `npm run kb:health`.
- **Permissions.** The tasks never delete content and never mark records as editorially approved. Anything they cannot confirm is marked needs-human and listed in the log.
- **Managing the tasks.** Pause, edit or run them from "Scheduled" in the app sidebar. The prompts are in `C:\Users\shiva\.claude\scheduled-tasks\`.

## Routine

**Every week:** run `npm run kb:health`.
- **Blocking problem:** fix the record text. Use the correction script for records already in the database.
- **Fact past its review date:** check the official source. Then update `value`, `effectiveFrom`, `checkedAt` and `reviewBy` together in `src/kb-facts.js`.
- **Expired or expiring record:** re-check the source, then approve it again through `/v1/review`.

**When a yearly figure changes** (for example Australia's Core Skills Income Threshold every 1 July, or IRCC proof of funds every summer):
1. Update the fact in `src/kb-facts.js`. The tools pick up the new value automatically.
2. If KB records quote the old figure, add an entry to `CORRECTIONS` in `scripts/kb-corrections-2026-11-01.js`. Give it the exact old text, the new text and an official source.
3. Run the corrections dry run, then the apply command.
4. If the old figure must never return, add it to `RETIRED_PATTERNS` in `src/kb-quality.js`.

**When adding new records:** `npm test` checks them automatically. A record with filler, an http link, missing dates or a retired figure fails the test, with the record id and the reason.

**If a record turns out to be wrong but cannot be fixed yet:** do not delete it. Reject it through `/v1/review` (or the correction script's reject list) with a note. It stops appearing in answers, it stays in the audit log, and it can be restored later with `rollbackAudit()`.

## Publishing withheld high-risk records

Public answers hide an approved **high-risk** record until an editor has checked it against an archived excerpt of its official page. As of 1 November 2026 that is 664 records. They are kept, not deleted, and they come back as soon as they are published.

**Where:** sign in to the admin panel and open **Publish queue: withheld high-risk records** at the top of the editorial desk. Topics are ordered health, housing, employment, money, family, childcare, then the rest. Canadian records come first within each topic. The same data is available from `GET /admin/publish-queue`.

**For each record:**
1. Click **Open the official page**. Confirm the summary is still correct.
2. Copy the part of the page that contains the quote shown on the card, and paste it into the box. Curly quotes, non-breaking spaces and invisible characters are cleaned automatically.
3. If the page wording changed, open **Edit the record before submitting** and correct the quote, the summary or `expiresAt`.
4. Click **Submit excerpt for approval** (editor or admin role).
5. Approve it in the same card (reviewer or admin role). That creates the publication, and the record appears in answers right away.

**Card states:**
- **Ready to check:** nothing blocks the record.
- **Awaiting approval:** an excerpt was submitted, and the record now needs a reviewer's decision.
- **Blocked:** the card lists what to fix first, for example a missing `housingSubject` or an unregistered source.

Records outside Canada can be published too. A candidate may use any jurisdiction that a stored record already has. A new, unknown jurisdiction is still refused.

## Backups

- `kb:corrections:apply` copies the database to `data/backups/` before every change.
- It always keeps the original pre-audit copy, `settlement-before-kb-audit-2026-11-01.sqlite`, plus the two newest copies. Older copies made by the script are removed automatically.

## Known limits

- **Translations.** Glossary translations (Hindi, Punjabi, Spanish, French, Arabic) have not had a native-speaker review.
- **Editorial review.** Most approved records were approved by bulk import scripts, not by an editor (`npm run kb:health` shows how many). Low- and medium-risk ones are still served. High-risk ones are withheld until they are published through the publish queue above.
- **Facts in other tools.** The registry covers the figures that were duplicated across tools. Other tools still contain their own figures, and those should move into `src/kb-facts.js` when they are next edited.
