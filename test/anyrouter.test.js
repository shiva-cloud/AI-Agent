import test from 'node:test';
import assert from 'node:assert/strict';
import { anyRouterOptions } from '../src/anyrouter.js';

test('absent key disables network integration', () => {
  assert.deepEqual(anyRouterOptions({apiKey:''}), {});
});
test('adapter pins free route and sends credentials only to fixed origin', async () => {
  const signal = new AbortController().signal;
  const options = anyRouterOptions({apiKey:'test-secret', fetchImpl:async (url, init) => {
    assert.equal(url,'https://anyrouter.dev/api/v1/chat/completions');
    assert.equal(init.redirect,'error'); assert.equal(init.signal,signal);
    const body=JSON.parse(init.body);
    assert.equal(body.model,'anyrouter/free');assert.equal(body.stream,false);
    assert.ok(!init.body.includes('test-secret'));
    return Response.json(({choices:[{finish_reason:'stop',message:{content:'{"intent":"SIN guidance"}'}}]}));
  }});
  assert.deepEqual(await options.complete({stage:'understand',instructions:'Interpret',data:{question:'SIN?'},signal}),{intent:'SIN guidance'});
});
test('service errors, truncation and invalid JSON are rejected', async () => {
  for (const response of [{ok:false},Response.json(({choices:[{finish_reason:'length',message:{content:'{}'}}]})),Response.json(({choices:[{finish_reason:'stop',message:{content:'not JSON'}}]}))]) {
    const {complete}=anyRouterOptions({apiKey:'test',fetchImpl:async()=>response});
    await assert.rejects(()=>complete({stage:'verify',instructions:'Check',data:{}}));
  }
});
