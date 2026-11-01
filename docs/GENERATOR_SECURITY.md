# OpenAPI generator security compatibility patch

The generator remains openapi-typescript 7.13.0. Its Redocly 1.34.22 dependency
previously installed minimatch 5.x, affected by
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
The override pins minimatch 11.0.3. This is paired with a compatibility patch;
the override alone would break Redocly's callable CommonJS import.

`npm run api:client` first runs `scripts/prepare-openapi-generator.js`. It changes
only the import from `require('minimatch')` to its named `minimatch` export.
It verifies both installed versions and the SHA-256 hash of the complete upstream
file, allowing only the original file or the exactly patched form. Unexpected
dependency changes fail generation rather than applying a speculative edit.

No postinstall hook is required. `npm ci --ignore-scripts` remains supported;
use the npm generation command rather than bypassing it with the bare binary.
The adaptation affects development tooling only. Docker runtime has no npm
dependencies and does not invoke this script.

Verification on 1 November 2026: full npm audit reports zero findings, generated
API declarations are byte-for-byte identical before/after the change, and the
TypeScript contract passes. Mocked Redocly URL loading tests cover wildcard,
brace, protocol and hostile-host header matching without network access.
CI audits development dependencies and regenerates the client before typechecking.

Maintenance: when upstream Redocly/generator versions change, review whether the
adapter and override can be removed together. Do not simply change the hash to
bypass its failure. This is an explicitly maintained temporary compatibility
patch, not an upstream fix or a suppressed audit finding.
