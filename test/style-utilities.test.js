import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

test('every u-* utility class used in index.html is defined in styles.css', () => {
  const used = new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(c => c.startsWith('u-')));
  const missing = [...used].filter(cls => !new RegExp(`\\.${cls}\\s*\\{`).test(css));
  assert.deepEqual(missing, []);
  assert.ok(used.size >= 10);
});

// Inline style="" attributes are blocked by the CSP and re-applied in JavaScript by
// csp-styles.js. Keep the static page from growing new ones; move repeated layout to classes.
test('index.html does not gain new inline style attributes', () => {
  const count = (html.match(/\sstyle="/g) || []).length;
  assert.ok(count <= 80, `index.html has ${count} inline style attributes; use a class in styles.css instead`);
});

test('no element carries two class attributes', () => {
  assert.equal(/<[^>]*\sclass="[^"]*"[^>]*\sclass="/.test(html), false);
});
