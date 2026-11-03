import {readFileSync} from 'node:fs';
const browserGlobals=JSON.parse(readFileSync(new URL('./eslint.browser-globals.json',import.meta.url),'utf8'));
// Minimal, dependency-free ESLint setup (flat config for ESLint 10).
//
// Scope: correctness-only rules that find real bugs. Deliberately no style
// rules, so adoption never re-formats the existing codebase. Browser scripts
// and backend code both enforce no-undef with explicit globals. Browser
// automation scripts also get browser globals for code run inside the page.
//
// Lint scope: src/, public/, scripts/ (excluding archived scripts) and test/.
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
  Response: 'readonly',
  Request: 'readonly',
  Headers: 'readonly',
  ReadableStream: 'readonly',
  Blob: 'readonly',
  FormData: 'readonly',
  Event: 'readonly',
  EventTarget: 'readonly',
};

export default defineConfig([
  {files:['public/**/*.js'],languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:browserGlobals},rules:{'no-undef':'error','no-dupe-keys':'error','no-unreachable':'error','no-const-assign':'error','no-import-assign':'error'}},
  globalIgnores([
    'node_modules/',
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
      'no-undef': 'error',
      // Symbol-level findings (unused declarations, imports) stay enforced.
      // Function-argument findings are off by deliberate policy: this codebase
      // documents each navigator's accepted input as destructured option
      // defaults (schema surface), and uniform callback signatures like
      // `ruleTemplate: (c, prof) =>` carry placeholder args by design.
      'no-unused-vars': ['warn', {
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
      }],
    },
  },
  {
    // Browser automation: callbacks passed to page.evaluate run in the page.
    files: ['scripts/browser-*.mjs'],
    languageOptions: { globals: { ...nodeGlobals, ...browserGlobals, scrollTo: 'readonly', innerWidth: 'readonly' } },
  },
]);
