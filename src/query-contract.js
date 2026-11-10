import {normalizeEnglishQuestion} from './question-normalization.js';
/**
 * Additive query contract. Facets describe what the user requests; they are not
 * facts about eligibility. No raw question or personal status belongs here.
 */
export function queryRequirements(question, intents) {
  question=normalizeEnglishQuestion(question);
  const facets=[];
  const add=(id,topic,reason)=>facets.push({id,topic,reason});
  const checklist=/\bcheck[ -]?list\b|\bfirst (?:week|7 days)\b|\bstep[ -]by[ -]step\b/i.test(question);
  const isObjectiveParameter=/\b(?:contribution cap|stamp duty threshold|eligibility code|eligible age limit|first home guarantee)\b/i.test(question);
  const eligibility=!isObjectiveParameter && (/\beligib(?:le|ility)\b|\bqualif(?:y|ies|ied|ication)\b|\b(?:am i|are we|is my (?:spouse|partner|child)) (?:allowed|entitled)\b|\b(?:can|could) (?:i|we|my (?:spouse|partner|child|children)) (?:get|receive|claim|apply|work|drive|enrol|enroll)\b/i.test(question));
  const occupation=/\b(?:nurs(?:e|es|ing)|doctors?|physicians?|dentists?|pharmacists?|engineers?|teachers?|electricians?|lawyers?)\b/i.test(question);
  const processing=/\bprocessing (?:times?|duration)\b|\bhow long (?:does|will|would|can|should)\b[^?.!]{0,160}\btake\b|\bhow (?:many|much) (?:business |working )?(?:days|weeks|months|time)\b[^?.!]{0,100}\b(?:process|processing|receive|wait)\b/i.test(question);
  const isStatutoryPeriod=/\b(?:statutory\s+deadline|return\s+deadline|reporting\s+deadline|\d+[- ](?:day|month)\s+(?:statutory\s+)?deadline)\b/i.test(question);
  const deadline=!isStatutoryPeriod && (/\b(?:application|submission|renewal|registration) deadlines?\b|\bdeadlines? (?:for|to)\b|\bwhen (?:must|should|do) (?:i|we) (?:apply|renew|submit|register)\b|\bby when\b[^?.!]{0,80}\b(?:apply|renew|submit|register)\b/i.test(question));
  if(intents.includes('employment') && occupation) add('occupation_requirements','employment','missing_occupation_requirements');
  if(eligibility) for(const topic of intents.filter(t=>['sin','health','employment','money','family','childcare','driving'].includes(t))) {
    add(`eligibility_${topic}`,topic,'missing_personal_eligibility');
  }
  if(checklist) add('ordered_checklist',intents.includes('arrival')?'arrival':intents.length===1?intents[0]:null,'missing_verified_checklist');
  // No source-summary flag proves a current processing estimate or applicable
  // deadline. Multi-topic questions keep an unassigned facet rather than
  // inventing which topic a timing phrase applies to.
  if(intents.length&&processing)add('processing_time',intents.length===1?intents[0]:null,'missing_verified_processing_time');
  if(intents.length&&deadline)add('application_deadline',intents.length===1?intents[0]:null,'missing_verified_deadline');
  return {contractVersion:'query-2',requestedOutput:checklist?'checklist':eligibility?'eligibility':intents.length&&(processing||deadline)?'timeline':'source_guidance',facets};
}

export function assessAnswerability(parsed, claims, gaps) {
  // Current records are source summaries unless the evidence itself declares
  // ordered steps (P1-5). Do not infer this support from keywords or from an
  // editorial approved flag. Personal eligibility and occupation requirements
  // remain unsupported: no record can speak to a person's own situation.
  const checklistTopics=new Set(claims.filter(c=>c.kind==='checklist').map(c=>c.topic));
  const supported=f=>f.id==='ordered_checklist'&&(f.topic===null?checklistTopics.size>0:checklistTopics.has(f.topic));
  return {
    version:'answerability-1',
    requestedOutput:parsed.requestedOutput,
    providedOutput:claims.length?claims.some(c=>c.kind==='checklist')?'checklist':'source_guidance':'none',
    status:parsed.missingSlots.includes('location')?'needs_clarification':claims.length?(gaps.length?'incomplete':'source_guidance_only'):'unavailable',
    facets:parsed.facets.map(f=>supported(f)?{id:f.id,topic:f.topic,status:'supported',reason:null}:{id:f.id,topic:f.topic,status:'unsupported',reason:f.reason})
  };
}
