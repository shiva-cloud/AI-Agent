// Minimal, dependency-free ESLint setup (flat config for ESLint 10).
//
// Scope: correctness-only rules that find real bugs. Deliberately no style
// rules, so adoption never re-formats the existing codebase. every module in
// scope already runs under the full test suite, so no-undef stays off — it
// would only force an enumeration of many globals for a class of error the
// runtime suite catches immediately.
//
// Lint scope: src/, scripts/ (excluding the archived one-off scripts) and test/.
// Everything else is data, generated content, assets or docs.
import { defineConfig, globalIgnores } from 'eslint/config';

const nodeGlobals = {
  // Node.js environment actually referenced across src/scripts/test.
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  setImmediate: 'readonly',
  clearImmediate: 'readonly',
  TextEncoder: 'readonly',
  TextDecoder: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  fetch: 'readonly',
  crypto: 'readonly',
  performance: 'readonly',
  AbortController: 'readonly',
  AbortSignal: 'readonly',
  structuredClone: 'readonly',
  queueMicrotask: 'readonly',
  SharedArrayBuffer: 'readonly',
  Atomics: 'readonly',
  WeakRef: 'readonly',
  FinalizationRegistry: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  WebSocket: 'readonly',
};

export default defineConfig([
  globalIgnores([
    'node_modules/',
    'public/',
    'generated/',
    'artifacts/',
    'scratch/',
    'recovery-drills/',
    'backups/',
    'corpus/',
    'data/',
    'docs/',
    'scripts/archive/',
  ]),
  {
    files: ['src/**/*.js', 'scripts/**/*.{js,mjs}', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: {
      'no-const-assign': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-dupe-keys': 'error',
      'no-unsafe-negation': 'error',
      'no-unused-vars': 'warn',
    },
  },
]);
