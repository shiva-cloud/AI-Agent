import test from 'node:test';
import assert from 'node:assert/strict';
import {validateContract} from '../scripts/validate-openapi.js';
test('independent OpenAPI and JSON Schema validators accept the published contract',async()=>{
 const result=await validateContract();assert.equal(result.status,'passed');assert.ok(result.schemas>50);
});
