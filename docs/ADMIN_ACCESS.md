# Individual admin identities and roles

The standalone server supports `ADMIN_ACTORS_JSON`, a secret environment value containing an array of `{id, role, token}` objects. IDs use lowercase letters/digits/hyphens (2–64 characters, beginning with a letter). Tokens must be unique printable non-space ASCII strings of 32–256 characters. Generate cryptographically random tokens; length validation alone does not prove entropy. Configure this through the deployment's secret manager, never source control or logs.

| Role | Read admin endpoints | Import excerpts / edit gap work | Evidence decisions / restore | Source registration / permission / suspension |
| --- | --- | --- | --- | --- |
| reader | Yes | No | No | No |
| editor | Yes | Yes | No | No |
| reviewer | Yes | No | Yes | No |
| admin | Yes | Yes | Yes | Yes |

All existing publication/provenance and English-only checks still apply. Authorization runs before reading mutation bodies. Unknown mutation routes are denied to non-admin roles. Individual actors' stable IDs overwrite submitted `reviewer` and `actor` labels before invoking audit-producing operations. Owner fields remain assignment metadata, not authenticated identity.

`GET /admin/session` returns only authenticated ID, role and mode. The editorial UI shows this identity. A denied role receives 403 with `code: insufficient_role`; UI feedback distinguishes this from an origin-policy rejection. Mutation controls follow the authenticated role; backend permission enforcement remains authoritative.

## Migration from the legacy token

When both `ADMIN_ACTORS_JSON` and `ADMIN_ACTORS_FILE` are absent, existing `ADMIN_TOKEN` behavior is preserved for compatibility. That legacy mode still uses self-reported reviewer labels and is explicitly labeled in the UI. When the individual configuration is present, the shared token is never accepted as a fallback. An empty array locks out all accounts. Invalid JSON, invalid roles, duplicate IDs/tokens or malformed actor entries fail startup before opening the working database.

Validated credentials are held as SHA-256 digests inside the authentication module and compared with timing-safe equality. Deployment environment values remain secrets in process memory; this is not an encrypted credential vault. Environment JSON is read at startup; file-backed identities reload on each authentication. Rotate/revoke environment credentials by updating secrets and restarting; no credentials were generated, configured, rotated or printed during this implementation pass.

## Scope and limits

This implements authenticated role boundaries for the application's admin HTTP endpoints. It does not provide SSO, MFA, sessions, a user-management UI, enforced two-person review or database permissions against direct local filesystem access. All roles can read existing admin data; field-level restrictions are not implemented. Use TLS/protected deployment before remote access.

Tests cover fail-closed configuration, empty actor list, legacy fallback exclusion, role matrix, denied writes, missing/invalid credentials and spoof-resistant audit identities. Final validation: 248 tests, 58 developer evaluation cases and 10 pre-flight checks passed; UI syntax passed. Interactive browser verification remains pending. No live credentials or KB were changed and the running server was not restarted.

## Backend credential lifecycle update — 2026-10-29

`ADMIN_ACTORS_FILE` optionally names a protected local JSON file with the same actor array as `ADMIN_ACTORS_JSON`. Configure only one of these sources. Invalid initial file configuration prevents startup; missing, oversized (over 64 KiB), unreadable or invalid files at request time return sanitized HTTP 503 with `identity_unavailable`. There is no legacy-token fallback. An empty array disables all individual accounts.

The file is reread on each admin authentication, allowing token rotation, account removal and role changes without restarting. Mutation requests authenticate again after the body is received, before dispatching a write. Requests that have already completed cannot be revoked retroactively. Replace the file atomically and restrict filesystem access to trusted operators and the server account. Environment JSON remains startup configuration and needs a restart to change.

Actors may include `expiresAt`, an explicit UTC ISO timestamp in `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss.sssZ` format. Expired credentials are rejected. Invalid dates fail configuration validation. This provides credential revocation, not an SSO/MFA or server-session system. Browser sign-out only clears the local credential; it does not revoke that token for other clients.

Verification: 298 tests and isolated server smoke passed. The focused revocation suite also verifies removal while a POST body is in progress prevents mutation. No live accounts, databases or running services were changed. This section supersedes the earlier startup-only and no-dynamic-revocation statements above.

## Bounded identity configuration reads — 30 October 2026

File-backed authentication now opens one descriptor, checks that descriptor's regular-file size, and reads at most 65,537 bytes to enforce the 64 KiB boundary even if the file grows after the initial check. UTF-8 decoding is strict; invalid byte sequences fail closed. Temporary byte buffers are wiped and descriptors closed on success and failure. Atomic replacement remains supported and each request still reloads current credentials. In-place concurrent editing is not a supported publication protocol; use atomic replacement in a protected directory.

ADMIN_ACTORS_JSON now has the same 64 KiB UTF-8 byte limit before parsing. These bounds do not add SSO, MFA, sessions or separate-person review. No real identity files or credentials were inspected or changed.
