import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {routeSource} from './route-sources.js';
import {canAccess} from '../src/admin-auth.js';

test('published API inventory roles match backend authorization policy',()=>{
 const spec=JSON.parse(readFileSync(new URL('../docs/openapi.json',import.meta.url)));
 assert.equal(spec.openapi,'3.1.0');const identifiers=new Set();
 for(const [path,operations] of Object.entries(spec.paths))for(const [method,operation] of Object.entries(operations)) {
  assert.ok(!identifiers.has(operation.operationId));identifiers.add(operation.operationId);
  for(const [status,response] of Object.entries(operation.responses)) {
   if(!/^2\d\d$/.test(status))continue;
   const schema=response.content?.['application/json']?.schema;
   if(schema)assert.ok(schema.properties&&Object.keys(schema.properties).length,`${method} ${path} still has a generic success envelope`);
  }
  if(method==='post') {
   const body=operation.requestBody.content['application/json'].schema;
   const alternatives=body.oneOf||[body];
   for(const alternative of alternatives){
    assert.ok(alternative.required?.length,`${path} needs request requirements in every alternative`);
    for(const field of alternative.required)assert.ok(alternative.properties?.[field]||body.properties?.[field],`${path} missing property ${field}`);
   }
  }
  if(!path.startsWith('/admin/'))continue;
  assert.deepEqual(operation.security,[{bearerAuth:[]}]);
  const concrete=path.replace('{id}',path.includes('gap-work')?'a'.repeat(64):'fixture');
  for(const role of ['reader','editor','reviewer','admin'])assert.equal(operation['x-allowed-roles'].includes(role),canAccess({role},method.toUpperCase(),concrete),`${method} ${path} ${role}`);
 }
 const server=routeSource();
 for(const match of server.matchAll(/path==='(\/(?:admin|v1)\/[^']+|\/health|\/ready)'/g))assert.ok(spec.paths[match[1]],`Missing literal route ${match[1]}`);
});
