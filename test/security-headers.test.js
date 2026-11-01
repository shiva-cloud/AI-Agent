import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('API, static and feed responses carry the browser hardening headers', async () => {
  const server = createApp(openStore(':memory:'), 'security-headers-token-24-chars', {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/v1/meta', '/', '/app.js', '/v1/changes.xml', '/no-such-route']) {
      const res = await fetch(base + path);
      await res.arrayBuffer();
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff', path);
      assert.equal(res.headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=(), payment=(), usb=()', path);
      assert.equal(res.headers.get('cross-origin-resource-policy'), 'same-origin', path);
      assert.ok(res.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"), path);
    }
    assert.equal((await fetch(base + '/')).headers.get('cross-origin-opener-policy'), 'same-origin');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
