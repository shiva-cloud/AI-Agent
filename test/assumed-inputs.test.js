import test from 'node:test';
import assert from 'node:assert/strict';
import { trackQuery, trackBody } from '../src/tool-input.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

// A tool that silently fills a missing input with a default (salary 80000, a 2024
// landing date) presents an invented person's result as the reader's. Responses name
// every input the tool read but the caller did not supply.

test('query and body trackers record inputs that were read but missing or blank', () => {
  const missing = new Set();
  const url = trackQuery(new URL('http://x/?a=1&b=&c=%20'), missing);
  assert.equal(url.searchParams.get('a'), '1');
  url.searchParams.get('b'); url.searchParams.get('c'); url.searchParams.get('d');
  assert.equal(url.searchParams.has('a'), true);
  assert.deepEqual([...missing].sort(), ['b', 'c', 'd']);

  const body = new Set();
  const input = trackBody({ x: 0, y: false, z: '' }, body);
  assert.equal(input.x, 0);
  assert.equal(input.y, false);
  input.z; input.w; JSON.stringify(input); input.then;
  assert.deepEqual([...body].sort(), ['w', 'z'], 'zero and false are real values; JSON/promise probes are not inputs');
});

test('tool responses list assumed inputs only when some were missing, and only on success', async () => {
  const store = openStore(':memory:');
  const server = createApp(store);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const partial = await (await fetch(`${base}/v1/tools/us-h1b-opt?status=h1b&lastWorked=2026-09-15`)).json();
    assert.deepEqual(partial.assumedInputs, ['hasH1bCos', 'hasI485', 'i94', 'unauthorizedDays']);
    assert.match(partial.assumptionNotice, /built-in default values/);

    const complete = await (await fetch(`${base}/v1/tools/compare-cities?cities=Toronto,Vancouver&salary=90000&household=2`)).json();
    assert.equal(complete.assumedInputs, undefined);
    assert.equal(complete.assumptionNotice, undefined);

    const post = await (await fetch(`${base}/v1/tools/ei-disqualification`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ separationType: 'quit', insurableHoursAccumulated: 700 }) })).json();
    assert.ok(post.assumedInputs.includes('justCauseReason'));
    assert.ok(!post.assumedInputs.includes('separationType'));
    assert.ok(!post.assumedInputs.includes('insurableHoursAccumulated'));

    const failed = await fetch(`${base}/v1/tools/does-not-exist`);
    assert.equal(failed.status, 404);
    assert.equal((await failed.json()).assumedInputs, undefined);
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});
