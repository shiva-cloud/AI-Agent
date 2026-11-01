# English-only content contract

This release has one content language: English (`en`). This applies to source summaries, evidence excerpts, editorial metadata, review notes, UI copy and API responses. No alternate-language fields or automatic translation are supported. The curated source set must use English documents.

## Evidence schema

The previous `en`/`hi` summary pair is replaced by:

```json
{
  "language": "en",
  "summary": "One canonical English source summary."
}
```

All existing evidence/provenance fields remain. Evidence validation rejects unknown fields, non-English language labels, missing required fields, non-HTTPS source URLs and non-Latin script letters. Accented Latin names and ordinary Unicode punctuation are allowed. Human review is still required for high-risk publication.

## Write boundaries

- Questions: English only. An explicit language other than `en` or an unsupported writing system returns HTTP 400. Invalid questions produce no answer trace. Raw questions are never stored.
- Evidence: English schema validation runs on seed insertion and retrieval. Invalid evidence is not served.
- Review notes: English prose and Latin-script reviewer display names. Rejected notes cannot change publication state.
- SQLite: insert/update triggers validate records, audit snapshots, traces, gap metadata and feedback. JSON is parsed before checking, so Unicode escapes cannot hide unsupported script content. Connections without the registered validation functions fail closed for protected writes.
- Feedback: fixed English issue identifiers, with no free-text comment field.

Script validation alone cannot distinguish English from Spanish, French or romanized Hindi. Do not describe it as complete language detection. Canonical seed prose is curated in English; additional Latin-script prose requires editorial review. A future language classifier must be evaluated before being used for ingestion acceptance.

## Migration 1

Run `node scripts/migrate.js`, or start the server: migration runs before seed insertion and before serving requests.

The migration is transactional and versioned. It renames `en` to `summary`, removes `hi`, sets the language to `en`, and converts both sides of historical audit snapshots. Record IDs, approval status, source URLs, dates and English audit notes remain intact. Running it again is a no-op for content.

If legacy data contains non-English prose outside the removed translation field, migration fails and rolls back. An operator must provide reviewed English replacements; it never invents translations or drops audit rows. Do not run the old application against the migrated database: it expects the old schema.

Secure deletion, vacuum and WAL truncation remove discarded payloads from the active SQLite files during migration. This is not a guarantee of forensic erasure from disk, external backups or filesystem snapshots. Backups should be access-controlled and managed under a documented retention policy.

## Validation

Tests exercise new databases, old bilingual databases, approval/provenance preservation, historical snapshot conversion, idempotence, atomic failure, escaped JSON, direct SQL writes and API rejection before persistence. Current UI assets and project documentation are English-only. Test fixtures intentionally contain escaped non-English strings to verify rejection; they are not production seed content.
