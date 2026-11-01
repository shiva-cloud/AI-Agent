import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,answer} from '../src/engine.js';
import {destinationCountries,resolveInputCountry} from '../src/destinations.js';

test('explicit supported countries normalize while unsupported values fail closed',()=>{
 for(const country of destinationCountries)assert.equal(resolveInputCountry(` ${country.toLowerCase()} `),country);
 assert.equal(resolveInputCountry('Canada'),'CA');
 for(const country of ['',null,42,{},'Atlantis','x'.repeat(81)])assert.throws(()=>parse({question:'Toronto library',country}),/supported destination/);
});

test('country selection cannot override a contradictory explicit country or Canadian city',()=>{
 for(const input of [
  {question:'Bank account in the United Kingdom',country:'Germany'},
  {question:'Bank account in Germany',country:'Canada'},
  {question:'Toronto bank account',country:'Germany'},
  {question:'Bank account in Australia',country:'United States'}
 ]) {
  const parsed=parse(input);assert.equal(parsed.ambiguous,true);assert.ok(parsed.missingSlots.includes('location'));
  const result=answer(input,[]);assert.equal(result.status,'clarification');assert.equal(result.claims.length,0);
 }
});

test('explicit countries and matching textual destinations retain their scope',()=>{
 for(const country of destinationCountries.filter(country=>country!=='CA')) {
  assert.equal(parse({question:'How do I open a bank account?',country}).country,country);
  assert.equal(parse({question:`Bank account in ${country}`,country}).country,country);
 }
 assert.equal(parse({question:'Toronto bank account',country:'Canada'}).country,'CA');
});

test('dotted country abbreviations work at sentence boundaries and before further words',()=>{
 for(const [country,aliases] of [['United States',['U.S.','U.S','U.S.A.','U.S.A']],['United Kingdom',['U.K.','U.K']],['United Arab Emirates',['U.A.E.','U.A.E']]]) {
  for(const alias of aliases)for(const ending of ['', '?',' for newcomers']) {
   const parsed=parse({question:`How do I open a bank account in ${alias}${ending}`});
   assert.equal(parsed.country,country,alias+ending);assert.equal(parsed.ambiguous,false,alias+ending);
  }
 }
});

test('abbreviations retain conflict gates and do not match longer words or ordinary us',()=>{
 for(const question of ['Banking in U.S. and U.K.','Banking in U.K. and Toronto','Banking in U.A.E. and France']) {
  const result=answer({question},[]);assert.equal(result.status,'clarification');assert.equal(result.claims.length,0);
 }
 for(const place of ['U.S.Aardvark','U.Kingdom','U.A.Emiratex'])assert.equal(parse({question:`Bank account in ${place}`}).ambiguous,true);
 const pronoun=parse({question:'Can you help us open a bank account in Toronto?'});
 assert.equal(pronoun.country,'CA');assert.equal(pronoun.ambiguous,false);
});
