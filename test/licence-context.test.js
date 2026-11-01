import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,answer} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
const now=new Date('2026-10-28T12:00:00Z');
for(const [phrase,country] of [['UK driving licence','United Kingdom'],['Australian licence','Australia'],['licence issued in the USA','United States'],['Indian driver licence','India'],['licence from Pakistan','Pakistan'],['Philippine licence','Philippines'],['Japanese licence','Japan'],['Ghanaian licence','Ghana'],['Hong Kong driving licence','Hong Kong'],['licence issued in Hong Kong','Hong Kong'],['licence issued in Japan','Japan'],['licence issued in Ghana','Ghana'],['Taiwanese driving licence','Taiwan'],['licence issued in Israel','Israel'],['Singaporean driving licence','Singapore'],['licence issued in Singapore','Singapore'],['Dutch driving licence','Netherlands'],['licence issued in the Netherlands','Netherlands'],['Irish driving licence','Ireland'],['licence issued in New Zealand','New Zealand'],['Norwegian driving licence','Norway'],['licence issued in Sweden','Sweden'],['Finnish driving licence','Finland'],['licence issued in Finland','Finland'],['Maltese driving licence','Malta'],['licence issued in Estonia','Estonia'],['Danish driving licence','Denmark']]) {
 test(`explicit ${phrase} supplies issuing country without overriding destination`,()=>{
  const question=`Can I exchange my ${phrase} in Toronto?`,parsed=parse({question});
  assert.equal(parsed.licenceCountry,country);assert.equal(parsed.city,'Toronto');assert.equal(parsed.ambiguous,false);assert.deepEqual(parsed.missingSlots,[]);
  const result=answer({question},seeds,now);assert.equal(result.clarification,null);assert.equal(result.status,'unavailable');assert.equal(result.claims.length,0);
  assert.ok(result.sources.some(s=>s.id==='ontario-licence'));
 });
}
test('issuer phrases do not hide unsupported destinations or other topics',()=>{
 for(const question of ['UK licence exchange in Australia','Australian licence in London','UK licence in Toronto and healthcare in Australia','Driving licence in UK']) {
  const result=answer({question,city:'Toronto'},seeds,now);assert.equal(result.status,'clarification');assert.equal(result.sources.length,0);
 }
 assert.equal(parse({question:'Australian SIN application',city:'Toronto'}).ambiguous,true);
});
test('nationality alone and unknown issuing countries retain clarification',()=>{
 for(const question of ['I am Indian and need a driving licence in Toronto','Toronto driving licence','Narnian licence in Toronto']) {
  assert.ok(parse({question}).missingSlots.includes('licence_country'));
 }
});
test('multiple issuing countries request disambiguation',()=>{
 const result=answer({question:'UK licence and Australian licence in Toronto'},seeds,now);
 assert.equal(result.parsed.licenceCountry,null);assert.equal(result.parsed.licenceCountryAmbiguous,true);assert.match(result.clarification,/more than one/);
});
test('origin alone does not establish a destination',()=>{
 const result=answer({question:'Exchange my UK licence'},seeds,now);
 assert.equal(result.status,'clarification');assert.ok(result.parsed.missingSlots.includes('location'));
});
test('recognized issuing countries cite their official licensing portal',()=>{
 for(const [phrase,id] of [['Indian driver licence','india-sarathi-dl'],['UK driving licence','uk-dvla-share-licence'],['licence from Pakistan','punjab-dlims-licence'],['Philippine licence','philippines-lto-ltms'],['German driving licence','germany-kba-licence'],['French licence','france-ants-licence'],['Ukrainian licence','ukraine-hsc-licence'],['Nigerian licence','nigeria-frsc-licence'],['Australian driving licence','australia-overseas-drivers'],['Japanese licence','japan-mpd-licence'],['Ghanaian licence','ghana-dvla-licence'],['Hong Kong licence','hongkong-td-licence'],['Taiwanese driving licence','taiwan-mvdis-licence'],['Israeli licence','israel-govil-licence'],['Singaporean licence','singapore-spf-licence'],['Dutch licence','netherlands-rdw-licence'],['Irish licence','ireland-ndls-licence'],['New Zealand licence','newzealand-nzta-licence'],['Norwegian licence','norway-vegvesen-licence'],['Swedish licence','sweden-transportstyrelsen-licence'],['Finnish licence','finland-traficom-licence'],['Maltese licence','malta-tm-licence'],['Estonian licence','estonia-transpordiamet-licence'],['Danish licence','country-denmark-portal']]) {
  const result=answer({question:`Can I exchange my ${phrase} in Toronto?`},seeds,now);
  assert.ok(result.sources.some(s=>s.id===id),`${id} should be cited for "${phrase}"`);
  assert.ok(result.claims.length===0,'issuing-country records are pending review, so they must not become claims');
 }
});
test('countries without a dedicated licensing record cite their broad national entry point',()=>{
 for(const [phrase,id] of [['Brazilian licence','country-brazil-portal'],['Malaysian licence','country-malaysia-portal'],['Kenyan licence','country-kenya-portal'],['Vietnamese licence','country-vietnam-portal'],['Moroccan licence','country-morocco-portal'],['Peruvian licence','country-peru-portal']]) {
  const result=answer({question:`Can I exchange my ${phrase} in Toronto?`},seeds,now);
  assert.ok(result.sources.some(s=>s.id===id),`${id} should be cited for "${phrase}"`);
  assert.equal(result.claims.length,0,'country portal records are pending review, so they must not become claims');
  assert.equal(result.status,'unavailable');
 }
});
test('country aliases keep similar names and regions distinct',()=>{
 for(const [phrase,country] of [['Papua New Guinea licence','Papua New Guinea'],['Papua New Guinean licence','Papua New Guinea'],['South Sudan licence','South Sudan'],['Sudanese licence','Sudan'],['Democratic Republic of the Congo licence','DR Congo'],['Republic of the Congo licence','Republic of the Congo'],['Bissau-Guinean licence','Guinea-Bissau'],['Northern Ireland licence','United Kingdom'],['Northern Irish licence','United Kingdom'],['Irish licence','Ireland'],['Danish licence','Denmark']]) {
  const parsed=parse({question:`Can I exchange my ${phrase} in Toronto?`});
  assert.equal(parsed.licenceCountry,country,`"${phrase}" should identify ${country}`);
  assert.equal(parsed.licenceCountryAmbiguous,false);
 }
 assert.equal(parse({question:'Dominican licence in Toronto'}).licenceCountryAmbiguous,true,'Dominica and the Dominican Republic share the adjective');
});
test('US licences route through the official state directory and Australian licences reach their official records',()=>{
 const us=answer({question:'Can I exchange my licence issued in the USA in Toronto?'},seeds,now);
 assert.ok(us.sources.some(s=>s.id==='usa-gov-motor-vehicle-services'),'the USA.gov state directory should be cited');
 assert.ok(!us.sources.some(s=>s.jurisdiction==='Australia'),'the USA query must not receive Australian records');
 const au=answer({question:'Can I exchange my Australian licence in Toronto?'},seeds,now);
 assert.ok(au.sources.some(s=>s.id==='australia-overseas-drivers'),'the Australian gateway record should be cited');
 assert.ok(au.sources.some(s=>s.id==='australia-dvs-licence'),'the national licensing record should be cited');
 assert.ok(!au.sources.some(s=>s.jurisdiction==='United States'),'the Australian query must not receive US records');
});
test('unsupported-place matching uses word boundaries',()=>{
 assert.equal(parse({question:'Susan needs Toronto library services'}).ambiguous,false);
});
test('unknown issuing places still clarify while masked country spans keep the Canadian city',()=>{
 assert.equal(answer({question:'I lived in Kakarot and hold its licence, moving to Toronto'},seeds,now).status,'clarification');
 assert.equal(parse({question:'licence issued in Kakarot in Toronto'}).missingSlots.includes('licence_country'),true);
 assert.equal(parse({question:'licence issued in Kakarot in Toronto'}).city,'Toronto');
});
