import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSoakCopies} from '../scripts/soak-fixture.js';
import {seeds} from '../src/knowledge.js';
import {assertEnglishRecord} from '../src/language.js';
import {parse,retrieve} from '../src/engine.js';

test('load expansion is bounded, valid English and always pending without mutating source records',()=>{
 const source=seeds.slice(0,3),before=structuredClone(source),copies=makeSoakCopies(source,3);
 assert.equal(copies.length,6);assert.equal(new Set(copies.map(r=>r.id)).size,6);
 for(const record of copies){assert.equal(record.status,'pending');assert.doesNotThrow(()=>assertEnglishRecord(record));assert.match(record.title,/^Synthetic load fixture:/);}
 copies[0].title='Changed';assert.deepEqual(source,before);
 assert.deepEqual(makeSoakCopies(source,1),[]);
});
test('invalid sizes and identity collisions reject before expansion',()=>{
 for(const multiplier of [0,-1,33,1.5,NaN])assert.throws(()=>makeSoakCopies(seeds,multiplier));
 assert.throws(()=>makeSoakCopies(Array(5001).fill(seeds[0]),2));
 assert.throws(()=>makeSoakCopies([{...seeds[0],id:'soak-1-0'}],2),/collision/);
});

test('scope filtering still validates every ranked candidate and excludes invalid evidence',()=>{
 const original=seeds.find(r=>r.topic==='sin'&&r.jurisdiction==='CA');assert.ok(original);
 const records=[original,null,{...original,id:'bad-language',summary:'हिंदी'},
  {...original,id:'bad-status',status:'invented'},{...original,id:'wrong-country',jurisdiction:'unrelated'},
  {...original,id:'wrong-topic',topic:'unrelated'}];
 const results=retrieve(parse({question:'SIN application in Toronto'}),records,new Date('2026-10-28T12:00:00Z'));
 assert.deepEqual(results.map(r=>r.id),[original.id]);
});
