# Runtime readiness and shutdown

## Probes

- `GET /health`: existing liveness response. It does not prove storage or content readiness.
- `GET /ready`: 200 `{ "status": "ready" }` only while accepting requests and a database query succeeds. Returns 503 with `reason: "storage_unavailable"` or `"draining"` otherwise. No database exception details are exposed.

Readiness is independent of visitor rate quotas. It checks the existing SQLite connection, not disk write capacity, source freshness, factual coverage, AI provider availability or production release approval.

## Shutdown

SIGINT and SIGTERM initiate one shared shutdown operation. The service marks itself draining, stops accepting connections, closes idle connections, and allows active HTTP responses up to 15 seconds. Remaining connections are then closed. Cleanup clears the purge interval and closes SQLite once. Requests reaching a draining server receive 503 with `code: "service_draining"`.

The 15-second grace window exceeds the 12-second AI answer budget. An external provider that ignores cancellation can still retain an underlying operation; this remains an adapter-level limitation. No source publication or deployment is performed by shutdown.

## Configuration and container

Local defaults remain `HOST=127.0.0.1`, `PORT=3000`, `DB_PATH=data/settlement.sqlite`. Environment overrides support an isolated deployment directory without changing the live local database.

The Dockerfile binds inside the container to `0.0.0.0`, runs as the unprivileged `node` user, declares `/app/data` as persistent storage, and probes `/ready`. A deployment must mount writable durable storage at `/app/data`, configure admin credentials separately, and terminate TLS at its reverse proxy. Do not bake credentials into the image. A container health check is not a full staging acceptance test.

The HTTP drain and readiness behavior is tested locally with in-memory fixtures and temporary servers. Docker CLI validation could not connect to the local Docker Desktop Linux engine (daemon unavailable), so no image build or run is claimed. The container image and platform signal delivery require validation on the target runtime before deployment. No public deployment or restart of the working application was performed in this implementation pass.
