# Shared evidence validation

Release 0.15.0 moves structural date and topic-risk requirements into shared record validation. Previously, manual ingestion checked these rules, but direct database writes and retrieval relied on a weaker record validator. A malformed expiry or an incorrectly low-risk regulatory record could therefore bypass the import-specific checks.

The shared validator now requires real, zero-padded ISO calendar dates for checked/expiry dates and any effective dates. Expiry must follow the checked date, and an effective end must follow its start. Health, housing, employment, money, driving, family and childcare records must be high-risk. Research-seed status remains forbidden for high-risk records. Evidence URLs cannot embed usernames or passwords.

These checks apply through the existing record validator to retrieval, database triggers, manual imports and database verification. Invalid records are excluded from retrieval. Writes through guarded connections fail without modifying the row. The SQL schema and migration history do not change; restarting a process loads the stricter validation functions. Historical audit records are not rewritten. An invalid historical record will cause verification to report an error and requires an explicit repair decision.

Structural validation remains time-independent so old, valid historical records can still be inspected. Retrieval separately withholds future source-check dates with `future_check_date`. The manual importer already prohibits future check dates. Existing expiry and effective-date gates still apply. The evaluation checker also rejects claims based on future-checked evidence.

Eleven new tests cover invalid calendar dates and ranges, valid leap dates, high-risk downgrades, direct database writes, credential-bearing URLs and future-check retrieval. All 163 project tests and 58 development evaluation scenarios pass. The actual 27-record database passes verification with unchanged data and schema digests.

This validates structure and policy consistency, not truth or English prose quality. Independent evidence review, permitted archival capture and production validation remain pending. Older running server processes need a restart to load the updated validator.
