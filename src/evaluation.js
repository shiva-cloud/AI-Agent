import { answer, parse, retrieve } from './engine.js';

export function checkAnswerConstraints(item,result,records,now=new Date()) {
  const safeRecords = Array.isArray(records) ? records : [];
  const safeNow = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
  const safeResult = (result && typeof result === 'object') ? result : { sources: [], claims: [], gaps: [], parsed: {} };
  const safeItem = (item && typeof item === 'object') ? item : {};
  const issues=[],byId=new Map(safeRecords.map(r=>[r.id,r]));
  const parsed = safeResult.parsed || {};
  const scope=new Set(['CA',parsed.region,parsed.city,parsed.licenceCountry].filter(Boolean));
  const date=safeNow.toISOString().slice(0,10);
  for(const source of safeResult.sources || []) {
    const record=byId.get(source.id);
    if(!record || source.url!==record.url)issues.push(`source_identity:${source.id}`);
    if(record && !scope.has(record.jurisdiction))issues.push(`source_geography:${source.id}`);
  }
  for(const claim of safeResult.claims || []) {
    const record=byId.get(claim.evidenceId);
    if(!(safeResult.sources || []).some(s=>s.id===claim.evidenceId))issues.push(`unlinked_claim:${claim.id}`);
    if(!record || claim.text!==record.summary)issues.push(`claim_text:${claim.id}`);
    if(record && (!['approved','research_seed'].includes(record.status)||record.checkedAt>date||record.expiresAt<date||(record.effectiveFrom&&record.effectiveFrom>date)||(record.effectiveTo&&record.effectiveTo<=date)))issues.push(`unavailable_claim:${claim.id}`);
  }
  if(safeItem.maxClaims!==undefined && (safeResult.claims || []).length>safeItem.maxClaims)issues.push('claim_limit');
  for(const id of safeItem.requiredSources||[])if(!(safeResult.sources || []).some(s=>s.id===id))issues.push(`required_source:${id}`);
  for(const id of safeItem.forbiddenSources||[])if((safeResult.sources || []).some(s=>s.id===id))issues.push(`forbidden_source:${id}`);
  for(const id of safeItem.requiredClaims||[])if(!(safeResult.claims || []).some(c=>c.evidenceId===id))issues.push(`required_claim:${id}`);
  for(const reason of safeItem.requiredGapReasons||[])if(!(safeResult.gaps || []).some(g=>g.reason===reason))issues.push(`required_gap:${reason}`);
  return issues;
}

export function evaluate(dataset,records,searchIndex) {
  const safeDataset = (dataset && typeof dataset === 'object') ? dataset : { cases: [], asOf: new Date().toISOString() };
  const safeRecords = Array.isArray(records) ? records : [];
  const now = (safeDataset.asOf && !isNaN(Date.parse(safeDataset.asOf))) ? new Date(safeDataset.asOf) : new Date();
  const failures=[],latencies=[];
  let truePositive=0,falsePositive=0,falseNegative=0,locations=0,statuses=0,recalled=0,expected=0,reciprocalRanks=0,answerable=0,linked=0,claims=0,constraintPasses=0;
  for(const item of safeDataset.cases || []) {
    const input={question:item.question,...item.input},parsed=parse(input),start=performance.now();
    const caseNow=(item.asOf && !isNaN(Date.parse(item.asOf)))?new Date(item.asOf):now;
    const result=answer(input,safeRecords,caseNow,searchIndex);latencies.push(performance.now()-start);
    const expectedIntents=new Set(item.intents),actual=new Set(parsed.intents),issues=[];
    for(const intent of actual) expectedIntents.has(intent)?truePositive++:falsePositive++;
    for(const intent of expectedIntents) if(!actual.has(intent))falseNegative++;
    if(actual.size!==expectedIntents.size || [...actual].some(t=>!expectedIntents.has(t)))issues.push('intent');
    if(parsed.city===item.city)locations++;else issues.push('location');
    if(result.status===item.status)statuses++;else issues.push(`status:${result.status}`);
    if(item.expectedEvidence?.length) {
      answerable++;
      const ranked=retrieve(parsed,safeRecords,caseNow,searchIndex).filter(r=>r.available).map(r=>r.id);
      const first=ranked.findIndex(id=>item.expectedEvidence.includes(id));
      reciprocalRanks+=first<0?0:1/(first+1);
      expected+=item.expectedEvidence.length;
      for(const id of item.expectedEvidence) {if(ranked.slice(0,5).includes(id))recalled++;else issues.push(`retrieval:${id}`);}
    }
    for(const claim of result.claims){claims++;if(result.sources.some(s=>s.id===claim.evidenceId))linked++;else issues.push(`citation:${claim.id}`);}
    const constraints=checkAnswerConstraints(item,result,safeRecords,caseNow);
    if(!constraints.length)constraintPasses++;else issues.push(...constraints);
    if(issues.length)failures.push({id:item.id,issues});
  }
  latencies.sort((a,b)=>a-b);
  const divide=(a,b)=>b?a/b:null;
  const caseCount = (safeDataset.cases || []).length;
  return {dataset:safeDataset.version,labelStatus:safeDataset.labelStatus,asOf:safeDataset.asOf,cases:caseCount,
    intentMicroF1:divide(2*truePositive,2*truePositive+falsePositive+falseNegative),locationAccuracy:divide(locations,caseCount),expectedStatusAccuracy:divide(statuses,caseCount),
    recallAt5:divide(recalled,expected),meanReciprocalRank:divide(reciprocalRanks,answerable),citationLinkCompleteness:divide(linked,claims),answerConstraintPassRate:divide(constraintPasses,caseCount),
    latencyMs:{scope:'Local engine only; no HTTP, persistence or external AI',p50:latencies[Math.floor(latencies.length*.5)],p95:latencies[Math.floor(latencies.length*.95)]},
    limitations:'Small developer regression set. Citation links do not measure semantic support or factual correctness. Not production accuracy or a human-reviewed release audit.',failures};
}
