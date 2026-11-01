import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

test('every form control in index.html has an accessible name', () => {
  const unlabelled = [];
  for (const match of html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
    const attrs = match[2];
    if (/type="hidden"|aria-label=|aria-labelledby=/.test(attrs)) continue;
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    const before = html.slice(0, match.index);
    const wrapped = before.lastIndexOf('<label') > before.lastIndexOf('</label>');
    const forLabel = id && html.includes(`for="${id}"`);
    if (!wrapped && !forLabel) unlabelled.push(id || match[0].slice(0, 60));
  }
  assert.deepEqual(unlabelled, []);
});

test('page metadata and language markup are present', () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<meta name="description" content="[^"]{40,}">/);
  for (const [value, lang] of [['french', 'fr'], ['hindi', 'hi'], ['punjabi', 'pa'], ['chinese', 'zh-Hans'], ['spanish', 'es']]) {
    assert.match(html, new RegExp(`<option value="${value}" lang="${lang}">`), value);
  }
  const manifest = JSON.parse(readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));
  assert.equal(/KYC/.test(manifest.description), false);
});
