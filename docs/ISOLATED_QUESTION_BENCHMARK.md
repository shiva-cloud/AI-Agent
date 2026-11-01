# Isolated question benchmark

Run `node scripts/benchmark-live-http.js` for the historical 180-question suite over loopback HTTP. The module is deliberately not named `*-test.js` or `test-*.js`, so Node's default test discovery cannot run it by accident. It is not a browser test. It uses an in-memory seed database, AI explicitly disabled, an OS-assigned loopback port, per-request deadlines and cleanup in a finally block. It never opens the working database. Report fields separate HTTP/request failures, answer-expectation mismatches and persisted trace counts. Any mismatch or incomplete trace count produces a failing CLI exit code.

`scripts/question-suite-180.js` contains the unchanged question definitions without executable benchmark work. Importing either benchmark module no longer opens storage, sends requests or writes report files. The direct-engine benchmark also uses in-memory storage and only executes when invoked as its entry point.

Validation on 30 October 2026: all 180 isolated HTTP requests completed successfully and persisted 180 traces. Ninety historical answer expectations matched; ninety did not. These mismatches remain visible and the command exits 1. Seed content and expected answers were not changed to improve the score. This is not independent gold evaluation or a claim of full topic coverage.

The earlier working-database S16 HTTP 500 did not reproduce with disposable seed data, including five repeated S16 requests in the regression suite. Its original cause remains unconfirmed; the isolated pass does not prove the former live condition is repaired. Do not rerun against live storage to infer otherwise. Any future production investigation should use sanitized diagnostics and an explicitly approved disposable snapshot.

`npm test` selects the isolated `test/*.test.js` suite. Three new regression tests enforce import isolation, S16 HTTP persistence and distinction between HTTP success and unmet answer expectations. KB/publication changes and live-provider evaluation remain outside this work package.
