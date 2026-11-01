import test from 'node:test';
import assert from 'node:assert/strict';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {seeds} from '../src/knowledge.js';

test('all provider stages omit raw question identifiers and parser search terms',async()=>{
 const requests=[];
 const run=createVerifiedAnswer({complete:async request=>{
   requests.push(JSON.parse(JSON.stringify(request.data)));
   if(request.stage==='understand')return {intent:'Find SIN guidance'};
   if(request.stage==='rewrite')return {message:'Source guidance.',claims:request.data.baseline.claims};
   return {english:true,meaningPreserved:true,noUnsupportedClaims:true,questionRespected:true};
 }});
 const result=await run({question:'How do I get a SIN? My name is Zorvella, email zorvella@example.invalid, phone 416-555-0199, passport ZX9182736.'},seeds,new Date('2026-10-28'));
 assert.equal(result.ai.status,'checked');assert.equal(requests.length,3);
 const transmitted=JSON.stringify(requests).toLowerCase();
 for(const value of ['zorvella','example.invalid','416-555-0199','zx9182736','queryterms','my name'])assert.equal(transmitted.includes(value),false,value);
 assert.ok(requests[1].baseline.claims.length);assert.equal(requests[0].context.country,'CA');
});
