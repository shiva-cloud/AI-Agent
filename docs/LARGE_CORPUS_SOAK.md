# Larger disposable capacity fixtures

`node scripts/soak-local.js [seconds] [concurrency] [record-multiplier]` now supports a multiplier of 1–32, subject to a 10,000-record total cap. Defaults remain 30 seconds, five concurrent clients and the original seed dataset. Synthetic records are inserted only into the harness's disposable SQLite database. Copies have unique IDs, marked synthetic titles and pending status; they do not add verified evidence or factual coverage. Seed inputs are not mutated.

The report includes seed, synthetic and total record counts and describes the fixture distribution. Existing checks still verify HTTP success, citation linkage, disabled AI and persisted trace count. The standard result is written to artifacts/local-soak.json; redirect stdout to preserve separate runs. Durations are issue windows, so draining the final concurrent requests can extend elapsed time.

A short five-second diagnostic with 2,580 records and concurrency four revealed repeated validation of irrelevant records. Retrieval now filters jurisdiction/topic first and fully validates every candidate that can reach ranking. Malformed relevant records remain excluded. This reduces work without adding evidence, relaxing publication policy or changing the lexical ranking of the same scoped candidate set.

Observed diagnostic runs:

| Run | Requests / successful traces | p95 | Peak RSS |
| --- | --- | --- | --- |
| Before scope-first filtering | 12 / 12 | 2,648 ms | 264 MB |
| After scope-first filtering | 28 / 28 | 1,946 ms | 254 MB |

Artifacts: large-corpus-soak.json and large-corpus-soak-filtered.json. These short local runs are noisy, include startup/warm-up effects and are not a controlled performance study or production SLA. Event-loop delay remains substantial. Repeated seed-shaped pending copies do not represent independent real documents or representative approved-corpus ranking. Longer isolated runs with varied real-world distributions, external-provider latency and explicit service objectives remain open.
