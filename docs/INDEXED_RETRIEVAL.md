# Optional indexed retrieval engineering

The in-progress search regression is resolved. SQLite FTS5 supplies term matches from a separately stored tokenized corpus; scope-local BM25 reranking preserves the existing scoring contract instead of applying global corpus scores across jurisdictions. This is indexed lexical retrieval, not embeddings or semantic/hybrid search. No speed improvement is claimed without representative corpus benchmarking.

Index rows contain evidence IDs, hashes and normalized tokens. Rebuild validates every record and atomically replaces the index contents. The index refuses an evidence or job database path. `SEARCH_INDEX_PATH` is opt-in; the server opens it read-only. Missing/unavailable startup indexes use lexical fallback.

Each retrieval uses current evidence for geography, subject, publication and date gates. It compares scoped record hashes before using index matches. Missing, changed or closed index storage falls back to the current lexical scorer. Removed records cannot enter results through old index rows. Search terms are normalized/quoted rather than treated as user-supplied FTS syntax.

An explicitly configured worker may run `reindex` with target `all` when `SEARCH_INDEX_PATH` is present. It reads the evidence database without modification and writes only the separate derived index. No live reindex job was run. The request to exclude KB work means no further content, source-fetch, parsing, approval or KB schema expansion is being pursued.

Tests cover regression question contracts in indexed mode, stale/removed/withdrawn evidence, review and expiry gates, invalid rebuild preservation, hostile FTS tokens, persistence and read-only evidence digest preservation. Broader semantic retrieval remains outside the completed implementation.
