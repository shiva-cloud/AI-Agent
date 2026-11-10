import test from 'node:test';
import assert from 'node:assert/strict';
import {answer,parse} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {openStore} from '../src/store.js';
import {createVerifiedAnswer} from '../src/verified-answer.js';
import {humanizeGap} from '../public/errors.js';
const now=new Date('2026-10-28T12:00:00Z');
// Approval here is a synthetic retrieval fixture, never a live publication.
const approved=seeds.map(r=>({...r,status:'approved'}));

test('occupation and eligibility requests remain incomplete despite a generic approved guide',()=>{
  const result=answer({question:'Can I work as a nurse tomorrow in Toronto?'},approved,now);
  assert.equal(result.status,'partial');
  assert.equal(result.parsed.contractVersion,'query-2');
  assert.equal(result.parsed.requestedOutput,'eligibility');
  assert.ok(result.gaps.some(g=>g.reason==='missing_occupation_requirements'));
  assert.ok(result.gaps.some(g=>g.reason==='missing_personal_eligibility'));
  assert.equal(result.answerability.status,'incomplete');
  assert.ok(result.answerability.facets.every(f=>f.status==='unsupported'));
  assert.ok(result.claims.every(c=>c.kind==='source_guidance'));
});

test('first-week guide is not presented as a verified ordered checklist',()=>{
  // Premise reproduction: a corpus without any record declaring ordered steps.
  // The fuller dataset now carries one (checked 2026-10-28); this case still
  // guards against generic arrival guidance masquerading as a checklist.
  const result=answer({question:'First week in Vancouver'},seeds.filter(r=>!r.steps),now);
  assert.equal(result.status,'partial');assert.equal(result.parsed.requestedOutput,'checklist');
  assert.equal(result.answerability.providedOutput,'source_guidance');
  assert.ok(result.gaps.some(g=>g.reason==='missing_verified_checklist'));
  assert.ok(result.claims.some(c=>c.evidenceId==='bc-guide'));
});

test('personal eligibility facets are tracked separately for each topic',()=>{
  const result=answer({question:'Am I eligible for OHIP and childcare in Toronto?'},approved,now);
  assert.deepEqual(result.answerability.facets.map(f=>f.id),['eligibility_health','eligibility_childcare']);
  assert.equal(result.status,'partial');
  assert.equal(answer({question:'Toronto OHIP'},approved,now).parsed.facets.length,0);
});

test('location clarification and unavailable sources remain authoritative',()=>{
  const location=answer({question:'Can I work as a nurse in Paris?',city:'Toronto'},approved,now);
  assert.equal(location.status,'clarification');assert.equal(location.answerability.status,'needs_clarification');
  assert.equal(location.claims.length,0);
  const pending=answer({question:'Can I work as a nurse in Toronto?'},seeds,now);
  assert.equal(pending.status,'unavailable');assert.equal(pending.claims.length,0);
  assert.ok(pending.gaps.some(g=>g.reason==='awaiting_human_review'));
});

test('ordinary navigation preserves source guidance and medical visits do not imply employment',()=>{
  const result=answer({question:'How do I apply for a SIN?'},seeds,now);
  assert.equal(result.status,'guidance');assert.equal(result.answerability.status,'source_guidance_only');
  assert.deepEqual(result.parsed.facets,[]);
  assert.ok(!parse({question:'Find a doctor in Toronto'}).intents.includes('employment'));
});

test('facet gap reasons persist without the personal query',()=>{
  const store=openStore(':memory:');try {
    const result=answer({question:'Can I work as a nurse in Toronto? private@example.com'},approved,now);
    store.log(result);
    const gaps=store.db.prepare('SELECT reason FROM gaps').all();
    assert.ok(gaps.some(g=>g.reason==='missing_occupation_requirements'));
    assert.ok(!JSON.stringify(store.db.prepare('SELECT * FROM traces').all()).includes('private@example.com'));
    for(const gap of result.gaps)assert.ok(!humanizeGap(gap.reason).includes('_'));
  }finally{store.db.close();}
});

test('AI failure cannot remove the answerability contract or its missing facets',async()=>{
  const input={question:'First week in Vancouver'};
  const result=await createVerifiedAnswer({complete:async()=>{throw new Error('fixture failure');}})(input,seeds,now);
  assert.equal(result.ai.status,'fallback');assert.equal(result.status,'guidance');
  assert.deepEqual(result.answerability,answer(input,seeds,now).answerability);
});

test('objective statutory eligibility inquiries do not create missing personal eligibility facets',()=>{
  const parsed=parse({question:'What are the statutory eligibility requirements for OHIP in Toronto?'});
  assert.equal(parsed.requestedOutput,'source_guidance');
  assert.ok(!parsed.facets.some(f=>f.reason==='missing_personal_eligibility'));
});

test('non-licensing mentions of lawyer counsel or doctor sick notes do not create missing occupation requirements facets',()=>{
  const lawyerAid=parse({question:'What are my realistic work permit options in Toronto if I cannot afford a lawyer or consultant?'});
  assert.ok(!lawyerAid.facets.some(f=>f.reason==='missing_occupation_requirements'));
  const sickNote=parse({question:'Does Ontario legislation prohibit employers from demanding a doctor sick note for short-term sick leaves in Toronto?'});
  assert.ok(!sickNote.facets.some(f=>f.reason==='missing_occupation_requirements'));
  const genuineLicensing=parse({question:'How do foreign lawyers qualify as solicitors in the United Kingdom and seek employment?'});
  assert.ok(genuineLicensing.facets.some(f=>f.reason==='missing_occupation_requirements'));
});

test('persona boilerplate and family doctor mentions do not inject phantom multi-topic intents',()=>{
  const familyDoc=parse({question:'What common misconceptions about family doctor waitlist alternatives should a temporary foreign worker in Melbourne avoid?'});
  assert.deepEqual(familyDoc.intents,['health']);
  const bareNewcomer=parse({question:'What is the difference between misclassification as independent contractor and the closest related process for an elderly newcomer in Auckland?'});
  assert.deepEqual(bareNewcomer.intents,['employment']);
  const realEmploymentWorker=parse({question:'As a temporary foreign worker in Toronto, can my employer withhold my overtime wages?'});
  assert.deepEqual(realEmploymentWorker.intents,['employment']);
  const founderMedical=parse({question:'What is the difference between disability accommodation at medical appointments and the closest related process for a small business founder in Canterbury / Christchurch, New Zealand?'});
  assert.deepEqual(founderMedical.intents,['health']);
  const prLanguage=parse({question:'What common misconceptions about adult language training eligibility should a new permanent resident in Ireland / Dublin, European Union avoid?'});
  assert.deepEqual(prLanguage.intents,['community']);
  const communityFoodBank=parse({question:'People in my community keep giving different answers about food bank access without ID in Jurong, Singapore.'});
  assert.deepEqual(communityFoodBank.intents,['groceries']);
  const pensionPortability=parse({question:'What common misconceptions about pension portability after return migration should an elderly newcomer in Auckland, New Zealand avoid?'});
  assert.deepEqual(pensionPortability.intents,['money']);
  const partnerStatusBoilerplate=parse({question:'I am worried about renoviction in Brampton, Canada if my partner and I have different statuses.'});
  assert.deepEqual(partnerStatusBoilerplate.intents,['housing']);
});

test('police certificates, utility costs, customs, portal errors, and relationship evidence map to intended topics',()=>{
  const pcc=parse({question:'How do I apply for a police certificate in Toronto?'});
  assert.ok(pcc.intents.includes('employment'));
  const util=parse({question:'What are the rules for utility costs and water billing in Germany?'});
  assert.ok(util.intents.includes('housing'));
  const customs=parse({question:'What do I need for customs clearance and secondary inspection when arriving in Canada?'});
  assert.ok(customs.intents.includes('arrival'));
  const portal=parse({question:'How do I report a government portal error or online immigration account login issue in Toronto?'});
  assert.ok(portal.intents.includes('arrival'));
  const relEvidence=parse({question:'What counts as relationship evidence or proof of relationship in Toronto?'});
  assert.ok(relEvidence.intents.includes('family'));
  const pgwpWage=parse({question:'What post graduation pathways and wage obligations apply in Toronto?'});
  assert.ok(pgwpWage.intents.includes('employment'));
  const resCalc=parse({question:'Is there a residency day calculator in Toronto?'});
  assert.ok(resCalc.intents.includes('community'));
  const propStd=parse({question:'Is property standards complaint handled by a federal, provincial, state or local authority in United States?'});
  assert.deepEqual(propStd.intents,['housing']);
  const intlMove=parse({question:'Where can I find official information about international moving in Canada?'});
  assert.deepEqual(intlMove.intents,['arrival']);
  const rehab=parse({question:'What does rehabilitation mean in Canada?'});
  assert.deepEqual(rehab.intents,['employment']);
  const longTermCare=parse({question:'Where can I find official information about long term care eligibility in United Kingdom?'});
  assert.deepEqual(longTermCare.intents,['health']);
  const domesticAbuse=parse({question:'Which government or licensed body is responsible for domestic abuse on dependent status in Ontario / Brampton, Canada, and how can I verify that authority?'});
  assert.deepEqual(domesticAbuse.intents,['family']);
  const employerOrSponsor=parse({question:'If regional nomination withdrawn after federal application submission in Cork, Ireland and my employer or sponsor refuses to cooperate, what independent evidence could help?'});
  assert.deepEqual(employerOrSponsor.intents,['employment']);
  const changeInst=parse({question:'Can you build a step-by-step verification checklist for a temporary visitor in Abu Dhabi, United Arab Emirates after student changes institutions while permit conditions remain unclear, without guessing the legal outcome?'});
  assert.deepEqual(changeInst.intents,['employment']);
  const nurseUtility=parse({question:'Evaluate utility connection deposit for a foreign-trained nurse in Marseille, France where I have only a digital copy of my documents.'});
  assert.deepEqual(nurseUtility.intents,['housing']);
  assert.ok(!nurseUtility.facets.some(f=>f.reason==='missing_occupation_requirements'));
  const nurseLicense=parse({question:'How do I get licensed as a foreign-trained nurse in Ontario?'});
  assert.ok(nurseLicense.facets.some(f=>f.reason==='missing_occupation_requirements'));
  const missedAppeal=parse({question:'What should I ask the agency in Madrid, Spain before submitting anything about appeal deadline missed because notice sent to former address?'});
  assert.deepEqual(missedAppeal.intents,['community']);
  const borderSearch=parse({question:'Could border officer searches device affect my right to remain in Munich, Germany?'});
  assert.deepEqual(borderSearch.intents,['arrival']);
  const newArrivalVacc=parse({question:'Which exceptions might apply to child vaccination exemption for a new arrival in Brisbane, Australia?'});
  assert.ok(!newArrivalVacc.intents.includes('arrival'));
  const elecSetup=parse({question:'Who can use electricity account setup services in Western Australia / Perth?'});
  assert.deepEqual(elecSetup.intents,['housing']);
  const profPermits=parse({question:'Who can use professional permits services in Manitoba / Winnipeg?'});
  assert.deepEqual(profPermits.intents,['employment']);
  const passportConfisc=parse({question:'Is passport confiscation handled by a federal, provincial, state or local authority in European Union?'});
  assert.deepEqual(passportConfisc.intents,['employment']);
  const urgentProc=parse({question:'What does urgent processing mean in United States?'});
  assert.deepEqual(urgentProc.intents,['employment']);
  const homeCare=parse({question:'How do I start the process for home care access in New South Wales / Sydney?'});
  assert.deepEqual(homeCare.intents,['health']);
  const tuitionRefund=parse({question:'Where can I find official information about tuition refunds in Germany?'});
  assert.deepEqual(tuitionRefund.intents,['money']);
  const dualRes=parse({question:'Who can use dual residency services in North Rhine-Westphalia / Cologne?'});
  assert.deepEqual(dualRes.intents,['money']);
  const detentionRev=parse({question:'How can I verify the eligibility requirements for detention review in California / Los Angeles after a policy change?'});
  assert.deepEqual(detentionRev.intents,['community']);
  const provNom=parse({question:'How can I verify the eligibility requirements for provincial nomination in Portugal / Lisbon with limited savings?'});
  assert.deepEqual(provNom.intents,['employment']);
  const secScreen=parse({question:'Which official agency should I contact about security screening in Abu Dhabi, and what evidence should I prepare?'});
  assert.deepEqual(secScreen.intents,['employment']);
  const probateQ=parse({question:'How can I verify the eligibility requirements for probate in Scotland / Edinburgh with a pending appeal?'});
  assert.deepEqual(probateQ.intents,['money']);
  const affidavitsQ=parse({question:'How can I verify the eligibility requirements for affidavits in Victoria / Melbourne with an urgent deadline?'});
  assert.deepEqual(affidavitsQ.intents,['health']);
});
