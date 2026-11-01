/**
 * Version contract: the package version, the newest CHANGELOG milestone heading
 * and STATUS.md's "Current release" line must agree. `/v1/meta` serves the
 * package version publicly, so a drift here misinforms every consumer.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('package.json version matches the newest CHANGELOG milestone and STATUS release line', () => {
  const pkg = JSON.parse(readFileSync(`${root}package.json`, 'utf8'));
  const changelog = readFileSync(`${root}docs/CHANGELOG.md`, 'utf8');
  const status = readFileSync(`${root}docs/STATUS.md`, 'utf8');

  const headings = [...changelog.matchAll(/^## (\d+\.\d+\.\d+) /gm)].map(match => match[1]);
  assert.ok(headings.length > 0, 'CHANGELOG has no milestone headings');
  const newest = headings[0];
  assert.equal(pkg.version, newest, `package.json version must equal the newest CHANGELOG heading (${newest})`);

  const statusRelease = /## Current release:\s*(\d+\.\d+\.\d+)/.exec(status)?.[1];
  assert.ok(statusRelease, 'STATUS.md is missing a "## Current release: x.y.z" line');
  assert.equal(statusRelease, newest, `STATUS.md current release must equal the newest CHANGELOG heading (${newest})`);

  // Every historical heading keeps its position: newest first, no duplicates.
  assert.equal(new Set(headings).size, headings.length, 'no duplicate CHANGELOG milestone numbers');
  const semver = version => version.split('.').map(Number);
  const older = (later, earlier) => {
    const a = semver(later), b = semver(earlier);
    return a[0] !== b[0] ? a[0] < b[0] : a[1] !== b[1] ? a[1] < b[1] : a[2] < b[2];
  };
  for (let i = 1; i < headings.length; i++) {
    assert.ok(older(headings[i], headings[i - 1]), `CHANGELOG headings must be strictly newest-first (${headings[i]} after ${headings[i - 1]})`);
  }
});
