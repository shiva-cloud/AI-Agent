import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {prepareOpenapiGenerator} from '../scripts/prepare-openapi-generator.js';

test('patched generator adapter is repeatable and retains URL header scoping',async()=>{
 const prepared=prepareOpenapiGenerator();assert.deepEqual(prepareOpenapiGenerator(),prepared);
 const require=createRequire(import.meta.url);
 const {readFileFromUrl}=require('@redocly/openapi-core/lib/utils.js');
 for(const [url,pattern,expected] of [
  ['https://example.invalid/v1/schema.json','example.invalid/**',true],
  ['https://example.invalid/v2/schema.json','example.invalid/{v1,v2}/**',true],
  ['https://example.invalid/v1/schema.json','https://example.invalid/**',true],
  ['http://example.invalid/v1/schema.json','https://example.invalid/**',false],
  ['https://example.invalid.evil.test/v1/schema.json','example.invalid/**',false],
  ['https://other.invalid/v1/schema.json','example.invalid/**',false]
 ]) {
  let observed;
  const result=await readFileFromUrl(url,{headers:[{matches:pattern,name:'X-Test-Marker',value:'synthetic-only'}],customFetch:async(_url,options)=>{observed=options.headers;return new Response('{}',{headers:{'Content-Type':'application/json'}});}});
  assert.equal(Boolean(observed['X-Test-Marker']),expected,`${url} / ${pattern}`);assert.equal(result.body,'{}');
 }
});
