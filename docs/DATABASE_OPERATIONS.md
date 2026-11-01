# Database selection for backend operations

Server startup and database CLI commands now share one selection rule:

1. Explicit database CLI argument, where supported.
2. `DB_PATH` environment variable.
3. `data/settlement.sqlite`, relative to the working directory.

Empty, whitespace-only and NUL-containing configured paths fail validation rather than silently selecting another database. Paths containing spaces are supported. Quote paths in shell commands. Relative configured paths remain relative to the current working directory; use absolute paths in deployment configuration.

| Command | Database argument | Behavior |
| --- | --- | --- |
| `node src/server.js` | Environment only | Opens configured store and applies migrations at startup |
| `node scripts/migrate.js [database]` | First | Applies migrations and seed initialization |
| `node scripts/migrate-dry-run.js [database]` | First | Read-only online backup; migration on disposable copy |
| `node scripts/verify-data.js [database]` | First | Read-only integrity and data verification |
| `node scripts/policy-lint.js [database]` | First | Read-only policy inspection; no migration or seeding |
| `node scripts/backup.js [database] [output-directory]` | First | Read-only source backup; default output `backups` |

`verify-backup.js` and `restore-drill.js` continue to require an explicit backup directory. They operate on that backup rather than the active server database. The restore drill writes a separate restored copy; it never overwrites the active database.

Policy lint requires an already initialized schema. Missing/uninitialized files fail without being created or upgraded. Expired evidence also causes a nonzero lint exit. Use the explicit migration command when migration is intended.

Tests execute commands as child processes from an isolated temporary working directory. They verify configuration precedence, absence of accidental default database creation, unchanged source schema/data digests, backup verification and restore drill completion. No live working database was opened or changed during those tests.
