import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { appSourceFiles } from './app-source.js';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

test('every u-* utility class used in index.html is defined in styles.css', () => {
  const used = new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(c => c.startsWith('u-')));
  const missing = [...used].filter(cls => !new RegExp(`\\.${cls}\\s*\\{`).test(css));
  assert.deepEqual(missing, []);
  assert.ok(used.size >= 10);
});

// The CSP blocks inline style="" and on*="" attributes and logs a violation for each.
// Static styles live in inline-styles.css (data-s), computed ones in data-style, which
// csp-styles.js applies; handlers are delegated listeners.
const templateFiles = [new URL('../public/index.html', import.meta.url), new URL('../public/tool-modal.js', import.meta.url), ...appSourceFiles()];
test('index.html and app templates carry no inline style or event-handler attributes', () => {
  const hits = [];
  for (const file of templateFiles) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const match = line.match(/(?:^|[\s"'`])(style|on[a-z]+)=\\?["']/);
      if (match) hits.push(`${file.pathname.split('/').slice(-2).join('/')}:${i + 1}: ${match[1]}=`);
    });
  }
  assert.deepEqual(hits, []);
  const check = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/convert-inline-styles.js', import.meta.url)), '--check'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8' });
  assert.equal(check.status, 0, check.stdout);
});

test('every data-s key used in the app has a rule in inline-styles.css', () => {
  const generated = readFileSync(new URL('../public/inline-styles.css', import.meta.url), 'utf8');
  const defined = new Set([...generated.matchAll(/^\[data-s~="([^"]+)"\]/gm)].map(m => m[1]));
  const used = new Set(templateFiles.flatMap(file => [...readFileSync(file, 'utf8').matchAll(/data-s=\\?["']([^"'\\]+)/g)].flatMap(m => m[1].split(/\s+/))));
  assert.deepEqual([...used].filter(k => !defined.has(k)), []);
  assert.ok(used.size > 300);
  assert.match(readFileSync(new URL('../public/index.html', import.meta.url), 'utf8'), /<link rel="stylesheet" href="\/inline-styles\.css">/);
});

test('no element carries two class attributes', () => {
  assert.equal(/<[^>]*\sclass="[^"]*"[^>]*\sclass="/.test(html), false);
});
