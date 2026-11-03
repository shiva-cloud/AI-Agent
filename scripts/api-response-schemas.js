import {destinationCountries} from '../src/destinations.js';
const text={type:'string'},number={type:'number'},integer={type:'integer'},nullableInt={type:['integer','null']},nullableText={type:['string','null']};
const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const array=items=>({type:'array',items});
export const scheduleSchema=object({id:text,kind:{enum:['source_check','verify_snapshot','reindex']},target_id:text,interval_ms:integer,next_run:integer,enabled:{enum:[0,1]},max_attempts:integer,revision:integer,last_job_id:nullableText,last_dispatched:nullableInt});
const job=object({id:text,kind:text,target_id:text,state:{enum:['queued','running','succeeded','failed','blocked']},attempts:integer,max_attempts:integer,available_at:integer,lease_until:nullableInt,last_code:text,created_at:integer,updated_at:integer});
const workers=object({active:integer,stale:integer,stopped:integer});
const boolean={type:'boolean'};
const facet=object({id:text,topic:nullableText,reason:text});
const relocationClause={type:['object','null'],properties:{originRaw:text,destRaw:text,originCity:nullableText,originRegion:nullableText,originCountry:nullableText,destCity:nullableText,destRegion:nullableText,destCountry:nullableText,isDestSupported:boolean,isOriginSupported:boolean},additionalProperties:true};
const parsed=object({intents:array(text),city:nullableText,region:nullableText,country:{enum:destinationCountries},language:{const:'en'},licenceCountry:nullableText,licenceCountryAmbiguous:boolean,risk:{enum:['low','high']},missingSlots:array(text),ambiguous:boolean,queryTerms:array(text),housingSubjects:array(text),telecom:object({subjects:array(text),priceRequest:boolean}),contractVersion:text,requestedOutput:{enum:['source_guidance','eligibility','checklist','timeline']},facets:array(facet),parserVersion:text,geographyVersion:{const:'geo-1'},relocation:relocationClause,thresholds:{anyOf:[{type:'object',additionalProperties:true},{type:'null'}]}});
const claim=object({id:text,text:text,evidenceId:text,status:{enum:['approved','research_seed']},kind:{enum:['source_guidance','checklist']}});
Object.assign(claim.properties,{steps:array(text),topic:text});
const reviewMethod={enum:['editorial_review','bulk_approval','none'],description:'Who approved the evidence: a named editorial decision, a bulk script or seed file, or not approved.'};
const source=object({id:text,title:text,url:{type:'string',format:'uri'},quote:text,checkedAt:{type:'string',format:'date'},expiresAt:{type:'string',format:'date'},status:text,reviewMethod,jurisdiction:text,snapshotId:nullableText});
const gap=object({topic:nullableText,reason:text});gap.properties.subject=text;
const answerSchema=object({traceId:text,parsed,status:{enum:['guidance','partial','unavailable','clarification']},claims:array(claim),sources:array(source),gaps:array(gap),clarification:nullableText,notice:text,message:text,
 answerability:object({version:text,requestedOutput:text,providedOutput:{enum:['source_guidance','checklist','none']},status:{enum:['needs_clarification','incomplete','source_guidance_only','unavailable']},facets:array(object({id:text,topic:nullableText,status:{enum:['supported','unsupported']},reason:nullableText}))}),
 verification:object({claimsTotal:integer,approvedClaims:integer,editorReviewedClaims:integer,sourceVerifiedClaims:integer,bulkApprovedClaims:integer,seedClaims:integer,reviewPendingTopics:integer,unverifiedTopics:integer}),latencyMs:number,
 ai:object({status:{enum:['disabled','not_applicable','busy','checked','fallback','knowledge_changed']}})});
// Present only on location clarifications (docs/GEOGRAPHY_REGISTRY.md).
answerSchema.properties.placeClarification=object({version:{const:'geo-1'},reason:{enum:['unsupported_place','multiple_cities','conflicting_regions','conflicting_countries','unknown_place','missing_location']},message:text,
 mentioned:array(object({id:text,label:text,type:{enum:['country','region','city','neighbourhood']},status:{enum:['supported','known_unsupported','outside_canada']},path:array(text)})),
 selectableCities:array({enum:['Toronto','Mississauga','Brampton','Vancouver']})});
// Present only when the request sent previousContext (contract context-1, docs/CONVERSATION_CONTEXT.md).
answerSchema.properties.context=object({version:{const:'context-1'},status:{enum:['applied','not_applied','ignored']},
 reason:{enum:[null,'invalid_question','invalid_context','missing_timestamp','timestamp_in_future','expired','no_usable_fields','self_contained','question_has_own_context']},
 assumptions:array(object({field:{enum:['topic','city','country']},value:text,label:text,source:{const:'previous_turn'}})),
 requiresConfirmation:boolean,message:nullableText,expiresAt:{type:['string','null'],format:'date-time'}});
answerSchema.properties.retrieval=object({version:text,candidates:array(object({id:text,score:number,matchedTerms:array(text),available:boolean,reason:text}))});
// Reader-facing structure built from the published claims (src/answer-composer.js).
const presentationPoint=object({text:nullableText,items:array(text)});
const presentationSection=object({id:text,claimId:text,evidenceId:text,topic:nullableText,heading:text,authority:nullableText,basis:nullableText,lead:nullableText,points:array(presentationPoint),steps:array(text),limits:array(text),status:{enum:['approved','research_seed']},reviewMethod,relevance:{enum:['primary','related']},sourceIndex:nullableInt});
answerSchema.properties.presentation=object({version:{const:'presentation-1'},headline:text,place:nullableText,topics:array(text),summary:array(text),summarySource:{enum:['evidence','ai_checked']},
 keyFacts:array(object({kind:{enum:['amount','percent','time','form']},value:text,context:text,claimId:text})),
 sections:array(presentationSection),nextSteps:array(object({text,claimId:text})),
 citations:array(object({index:integer,id:text,title:text,url:{type:'string',format:'uri'},authority:nullableText,checkedAt:{type:'string',format:'date'},status:text,reviewMethod}))});
answerSchema.properties.liveAlerts={type:'array',items:{type:'object',additionalProperties:true}};
answerSchema.properties.presentation.properties.breakingAlert={anyOf:[{type:'object',additionalProperties:true},{type:'null'}]};
answerSchema.properties.presentation.properties.liveAlerts={type:'array',items:{type:'object',additionalProperties:true}};
const suggestedTool=object({id:text,title:text,description:text,endpoint:text,buttonLabel:text,badge:text});
answerSchema.properties.presentation.properties.suggestedTools=array(suggestedTool);
answerSchema.properties.presentation.properties.mythWarning={anyOf:[{type:'object',additionalProperties:true},{type:'null'}]};
answerSchema.properties.multilingual={anyOf:[{type:'object',additionalProperties:true},{type:'null'}]};
answerSchema.properties.presentation.properties.multilingual={anyOf:[{type:'object',additionalProperties:true},{type:'null'}]};
const coverageTopic=object({topic:text,status:{enum:['source_guidance','review_or_refresh_needed','missing']},count:integer});
const cityCoverage=object({city:text,region:text,language:{const:'en'},topics:array(coverageTopic)});
export function addResponseSchemas(paths) {
 const response=(path,method,status,schema)=>{paths[path][method].responses[status]={description:status==='200'?'Successful operation':'Operation response',content:{'application/json':{schema}}};};
 response('/admin/publish-queue','get','200',object({asOf:text,total:integer,topicOrder:array(text),topics:{type:'object',additionalProperties:object({withheld:integer,ready:integer,awaiting_approval:integer,blocked:integer})},rows:array(object({id:text,title:text,topic:text,jurisdiction:text,canada:boolean,url:text,quote:text,summary:text,expiresAt:text,sourceId:nullableText,sourceTier:nullableText,blockers:array(text),pendingCandidates:array(text),state:{enum:['ready','blocked','awaiting_approval']},draft:{type:'object',additionalProperties:true}})),steps:array(text)}));
 for(const methods of Object.values(paths))for(const operation of Object.values(methods))operation.responses.default={description:'JSON API failure. Some failures include additional context.',content:{'application/json':{schema:{...object({error:text,code:text}),additionalProperties:true}}}};
 response('/health','get','200',object({status:{const:'ok'},mode:{const:'research-pilot'}}));
 response('/ready','get','200',object({status:{const:'ready'}}));
 response('/ready','get','503',object({status:{const:'not_ready'},reason:{enum:['draining','storage_unavailable','queue_unavailable','quota_unavailable']}}));
 response('/admin/session','get','200',object({id:nullableText,role:{enum:['reader','editor','reviewer','admin']},mode:{enum:['legacy','individual']}}));
 response('/v1/feedback','post','201',object({saved:{const:true}}));
 response('/admin/jobs','get','200',object({items:array(job),nextCursor:nullableText}));
 response('/admin/job-schedules','get','200',object({items:array(scheduleSchema)}));
 response('/admin/job-schedules','post','200',scheduleSchema);
 response('/admin/job-schedules/{id}/history','get','200',object({items:array(object({sequence:integer,schedule_id:text,actor_id:nullableText,actor_mode:{enum:['individual','legacy','local']},changed_at:integer,before:{anyOf:[scheduleSchema,{type:'null'}]},after:scheduleSchema})),nextCursor:nullableInt}));
 response('/admin/job-health','get','200',object({asOf:text,status:{enum:['ok','attention']},states:object({queued:integer,running:integer,succeeded:integer,failed:integer,blocked:integer}),workers:{anyOf:[workers,{type:'null'}]},readyJobs:integer,oldestReadyAgeMs:nullableInt,expiredLeases:integer,dueSchedules:integer,oldestScheduleLagMs:nullableInt,thresholds:object({queueAgeMs:integer,scheduleLagMs:integer}),alerts:array(object({code:text,count:integer,action:text}))}));
 response('/v1/meta','get','200',object({name:text,version:text,language:{const:'en'},mode:{const:'research-preview'}}));
 response('/v1/geography','get','200',object({version:{const:'geo-1'},places:array(object({id:text,type:{enum:['country','region','city','neighbourhood']},name:text,parent:nullableText,status:{enum:['supported','known_unsupported','outside_canada']},path:array(text)}))}));
 response('/v1/topics','get','200',object({language:{const:'en'},languages:array(text),topics:array(object({id:text,label:text}))}));
 response('/v1/questions/parse','post','200',parsed);
 response('/v1/answers','post','200',answerSchema);
 response('/v1/coverage','get','200',object({coverage:array(cityCoverage)}));
 const detailedTopic=object({...coverageTopic.properties,evidence:array(object({id:text,title:text,url:text,status:text,checkedAt:text,expiresAt:text}))});
 response('/v1/coverage/{city}','get','200',object({...cityCoverage.properties,topics:array(detailedTopic)}));
 const metric=object({category:{enum:['answers','probes','admin','public_api','other']},status:integer,count:integer,meanLatencyMs:number,maxLatencyMs:number,p95UpperBoundMs:{type:['number','null']},p99UpperBoundMs:{type:['number','null']}});
 const persistentMetric=object({...metric.properties,histogram:{type:'array',minItems:14,maxItems:14,items:integer}});
 response('/admin/runtime-metrics','get','200',object({processLocal:{const:true},loggingFailures:integer,loggingPending:integer,loggingDropped:integer,persistenceFailures:integer,persisted:{anyOf:[{type:'null'},object({retentionDays:{const:30},percentileMethod:text,buckets:array(persistentMetric)})]},buckets:array(persistentMetric)}));
 response('/admin/metrics','get','200',object({processLocal:{const:true},note:text,unrecognizedIntent:object({total:integer,days:array(object({day:text,count:integer}))})}));
 const gapItem=object({id:text,scope:text,topic:text,subject:text,reason:text,occurrences:integer,status:{enum:['open','in_progress','resolved','deferred']},priority:{enum:['low','normal','high','urgent']},owner:text,regression_ref:text,revision:integer,first_seen:text,last_seen:text});
 response('/admin/gap-work','get','200',object({items:array(gapItem),nextCursor:nullableText}));
 response('/admin/gap-work/{id}','post','200',gapItem);
 response('/admin/gap-work/{id}/history','get','200',object({events:array(object({id:integer,item_id:text,actor:text,note:text,previous:text,next:text,at:text}))}));
 const registrySource=object({id:text,url:text,owner:text,tier:{enum:['A','B','C','D','unclassified']},language:{const:'en'},policy:{enum:['unreviewed','manual_permitted']},reviewer:text,note:text});
 response('/admin/sources','get','200',object({sources:array(object({...registrySource.properties,suspended:{enum:[0,1]}}))}));
 response('/admin/sources','post','201',registrySource);
 response('/admin/sources/{id}/policy','post','200',registrySource);
 const evidence=structuredClone(paths['/admin/ingestion/run'].post.requestBody.content['application/json'].schema.properties.record);
 evidence.properties.status={enum:['research_seed','pending','approved','rejected']};
 evidence.properties.jurisdiction=text;evidence.properties.topic=text;
 Object.assign(evidence.properties,{sourceId:text,snapshotId:text,reviewedAt:text,reviewMethod:{const:'editorial_review'}});
 // Read responses include historical records, including original seed metadata.
 response('/admin/overview','get','200',object({records:array(evidence),gaps:array(object({topic:nullableText,reason:text,count:integer})),audits:array(object({id:integer,record_id:text,reviewer:text,note:text,at:text}))}));
 response('/admin/reviews/{id}/decision','post','200',evidence);
 const ranked={...evidence,properties:{...evidence.properties,lexicalScore:number,matchedTerms:array(text),available:boolean,reason:text,scopeScore:integer,score:number,retrievalVersion:text},required:[...evidence.required,'lexicalScore','matchedTerms','available','reason','scopeScore','score','retrievalVersion']};
 response('/v1/retrieval/search','post','200',object({results:array(ranked)}));
 const diff={anyOf:[object({available:{const:false},reason:text}),object({available:{const:true},changed:boolean,commonPrefixCharacters:integer,commonSuffixCharacters:integer,before:text,after:text})]};
 const changeReport=object({classification:text,priority:{enum:['high','normal']},fields:array(object({field:text,before:nullableText,after:nullableText})),excerptDiff:diff,flags:array(text),potentiallyAffectedRecordIds:array(text),assessment:text});
 const candidate=object({id:text,record_id:text,snapshot_id:text,body:text,base_hash:nullableText,status:{enum:['pending','approved','rejected']},request_key:text,request_hash:text,created_at:text});
 const imported=object({...candidate.properties,replayed:boolean});
 response('/admin/ingestion/run','post','201',imported);response('/admin/ingestion/run','post','200',imported);
 response('/admin/candidates','get','200',object({candidates:array(object({...candidate.properties,content:text,content_hash:text,source_id:text,change_report:nullableText,record:evidence,changeReport:{anyOf:[changeReport,{type:'null'}]}}))}));
 response('/admin/candidates/{id}/decision','post','200',object({id:text,status:{enum:['approved','rejected']},publicationId:nullableInt}));
 response('/admin/changes','get','200',object({changes:array(object({candidate_id:text,source_id:text,baseline_body:nullableText,baseline_snapshot_id:nullableText,report:changeReport,at:text,record_id:text,status:text,snapshot_id:text,baselineRecord:{anyOf:[evidence,{type:'null'}]}}))}));
 response('/admin/records/{id}/history','get','200',object({versions:array(object({id:integer,record_id:text,candidate_id:text,snapshot_id:text,body:text,at:text,record:evidence})),currentRecord:evidence,currentHash:text,restorations:array(object({id:integer,target_publication_id:integer,reviewer:text,note:text,at:text}))}));
 response('/admin/records/{id}/restore','post','200',object({restorationId:integer,recordId:text,publicationId:integer,replayed:boolean}));
 response('/admin/sources/{id}/suspend','post','200',object({sourceId:text,status:{const:'suspended'},withdrawn:array(text)}));
 response('/admin/publish-queue','get','200',object({asOf:text,total:integer,topicOrder:array(text),topics:{type:'object',additionalProperties:object({withheld:integer,ready:integer,awaiting_approval:integer,blocked:integer})},rows:array(object({id:text,title:text,topic:text,jurisdiction:text,canada:{type:'boolean'},url:text,quote:text,summary:text,expiresAt:text,sourceId:nullableText,sourceTier:nullableText,blockers:array(text),pendingCandidates:array(text),state:text,draft:{type:'object'}})),steps:array(text)}));
 response('/admin/review-queue','get','200',object({asOf:text,counts:{type:'object',required:['total'],additionalProperties:integer},rows:array(object({id:text,title:text,topic:text,jurisdiction:text,risk:text,status:text,expiresAt:text,daysUntilExpiry:integer,sourceId:nullableText,candidateIds:array(text),flags:array(text),priority:integer,reasonCode:text,actions:array(text)})),thresholds:object({expiresSoonDays:integer}),newCandidates:array(object({id:text,recordId:text})),notice:text}));
 response('/v1/stats','get','200',object({asOf:text,cities:integer,topics:integer,records:integer,pendingReview:integer,englishOnly:{const:true},nextExpiry:nullableText,note:text}));
 response('/v1/changes','get','200',object({language:{const:'en'},asOf:text,counts:object({total:integer,expired:integer,expiringSoon:integer,recentlyChecked:integer,pendingReview:integer}),items:array(object({id:text,title:text,topic:text,jurisdiction:text,status:text,checkedAt:text,expiresAt:text})),note:text}));
 response('/v1/gaps','get','200',object({language:{const:'en'},asOf:text,totals:object({open:integer,inProgress:integer,resolved:integer,deferred:integer}),items:array(object({scope:text,topic:text,subject:text,reason:text,occurrences:integer})),note:text}));
 const agencies=Object.fromEntries(['Toronto','Mississauga','Brampton','Vancouver','national'].map(city=>[city,array(object({name:text,url:text,channel:text,note:text}))]));
 response('/v1/agencies','get','200',object({language:{const:'en'},checkedAt:text,...agencies}));
 response('/v1/i18n/languages','get','200',object({languages:array({type:'object',properties:{code:text,name:text,native:text,isDefault:boolean,isOfficial:boolean},required:['code','name','native'],additionalProperties:true})}));
 response('/v1/i18n/{lang}','get','200',object({language:text,labels:{type:'object',additionalProperties:text},supportedLanguages:array({type:'object',properties:{code:text,name:text,native:text},required:['code','name','native'],additionalProperties:true})}));

 const metroBenchmark = object({
  city:text,province:text,provinceCode:text,rent1BedMedian:number,rent2BedMedian:number,
  transitSystem:text,transitMonthlyPass:number,healthcarePlan:text,healthcareWaitPeriod:text,
  salesTax:text,pstRate:number,gstRate:number,winterSeverity:text,primaryJobMarkets:array(text),
  settlementAgencies:array(object({name:text,url:text})),
  projectedMonthlyRent:number,annualRentOutflow:number,annualTransitOutflow:number,estimatedFixedAnnualOutflow:integer
 });
 const cityDifferential = object({cheaperCity:text,annualEstimatedSavings:integer,monthlyRentDifference:integer,salesTaxAdvantage:nullableText});
 const compareCitiesResult = object({asOf:text,comparison:array(metroBenchmark),differential:{anyOf:[cityDifferential,{type:'null'}]},benchmarkNote:text});
 response('/v1/tools/compare-cities','get','200',compareCitiesResult);
 response('/v1/tools/compare-cities','post','200',compareCitiesResult);

 const journeyItem = object({phase:text,title:text,authority:text,category:text,mandatory:boolean,applicableCategories:array(text),action:text,targetDate:text,city:text});
 const journeyPhase = object({id:text,label:text,horizonDays:integer,targetDate:text,itemsCount:integer,items:array(journeyItem)});
 const journeyResult = object({asOf:text,categoryKey:text,categoryLabel:text,city:text,landingDate:text,totalMilestones:integer,phases:array(journeyPhase)});
 response('/v1/tools/settlement-journey','get','200',journeyResult);
 response('/v1/tools/settlement-journey','post','200',journeyResult);

 const upfrontCosts = object({firstMonthRent:number,statutoryRentDeposit:number,temporaryStayFirst10Days:number,winterClothingAndEssentials:number,mobileSimAndHardwareSetup:number,privateBridgeHealthInsurance:number,totalOneTimeUpfront:number});
 const monthlyExpensesSchema = object({rent:number,foodBasketOfficial:number,transit:number,utilitiesAndInternet:number,mobilePlans:number,tenantInsurance:number,totalMonthlyExpenses:number});
 const govtOffsets = object({canadaChildBenefit:integer,gstHstQuarterlyCreditMonthlyEquivalent:number,totalMonthlyGovernmentCredits:integer});
 const budgetResult = object({asOf:text,city:text,province:text,household:text,accommodation:text,savingsCad:number,projectedMonthlyIncomeNet:number,initialUpfrontCosts:upfrontCosts,monthlyRecurringExpenses:monthlyExpensesSchema,monthlyGovernmentOffsets:govtOffsets,netMonthlyBurnRate:integer,remainingSavingsAfterUpfront:integer,runwayMonths:number,runwaySafetyAssessment:text,bridgeHealthNotice:text});
 response('/v1/tools/newcomer-budget','get','200',budgetResult);
 response('/v1/tools/newcomer-budget','post','200',budgetResult);

 const healthEligibilitySchema = object({
  assessmentType:{const:'preliminary_assessment'},sourceCheckedAt:{type:'null'},notice:text,
  asOf:text,province:text,provinceCode:text,planName:text,governingBody:text,statute:text,
  immigrationStatus:text,originCountry:text,isEligible:boolean,ineligibilityReason:nullableText,
  isAccordExempt:boolean,landingDate:text,coverageEffectiveDate:text,waitingPeriodDays:integer,
  bridgeInsuranceRequired:boolean,householdSize:integer,estimatedBridgeCostCad:integer,
  acceptedProofOfResidence:array(text),chcAdvisory:text,statutoryGuidance:text
 });
 response('/v1/tools/healthcare-eligibility','get','200',healthEligibilitySchema);
 response('/v1/tools/healthcare-eligibility','post','200',healthEligibilitySchema);

 const licenceExchangeSchema = object({
  origin:text,destination:text,isReciprocal:boolean,title:text,badgeClass:text,badgeText:text,
  statutoryRule:text,feeEstimate:number,roadTestRequired:boolean,waitPeriodSkipped:boolean
 });
 response('/v1/tools/licence-exchange','get','200',licenceExchangeSchema);
 response('/v1/tools/licence-exchange','post','200',licenceExchangeSchema);

 const tierSchema = object({label:text,cls:text});
 const creditSimulatorSchema = object({
  utilRatio:integer,utilGrade:text,utilClass:text,inquiryPenalty:integer,monthlyPointsDelta:integer,
  m1Score:integer,m3Score:integer,m6Score:integer,m9Score:integer,m1Tier:tierSchema,m9Tier:tierSchema
 });
 response('/v1/tools/credit-simulator','get','200',creditSimulatorSchema);
 response('/v1/tools/credit-simulator','post','200',creditSimulatorSchema);

 const evaluatedDocSchema = object({
  docType:text,docLabel:text,documentId:nullableText,issueDate:nullableText,expiryDate:nullableText,
  status:text,rejectionRisk:text,daysUntilExpiry:nullableInt,statute:text,complianceNote:text,correctiveAction:nullableText
 });
 const checklistItemSchema = object({task:text,mandatory:boolean,reason:text});
 const docValidationResult = object({
  asOf:text,landingDate:text,immigrationStream:text,overallReadiness:text,summaryHeadline:text,
  counts:object({total:integer,valid:integer,criticalRisk:integer,highRisk:integer}),
  documents:array(evaluatedDocSchema),preFlightChecklist:array(checklistItemSchema)
 });
 response('/v1/tools/validate-documents','get','200',docValidationResult);
 response('/v1/tools/validate-documents','post','200',docValidationResult);

 const formSchema = object({formCode:text,formTitle:text,statutoryBasis:text,action:text});
 const craBenefitsSchema = object({
  asOf:text,province:text,landingDate:text,
  familyProfile:object({maritalStatus:text,adjustedFamilyNetIncomeCad:integer,childrenUnder6Count:integer,children6to17Count:integer,totalChildrenCount:integer}),
  annualTotals:object({ccbAnnual:integer,gstHstAnnual:integer,provincialAnnual:integer,totalAnnualGovernmentCredits:integer}),
  cashflowSchedule:object({ccbMonthly:integer,gstHstQuarterly:integer,gstHstMonthlyEquivalent:integer,provincialMonthly:integer,totalMonthlyLiquidityCad:integer}),
  requiredForms:array(formSchema),
  strategicNotes:array(text),
  statutoryAuthority:text
 });
 response('/v1/tools/cra-benefits','get','200',craBenefitsSchema);
 response('/v1/tools/cra-benefits','post','200',craBenefitsSchema);

 const ecaSchema = object({
  code:text,name:text,designatedBy:text,coverage:text,estimatedFeeCad:integer,
  timelineWeeks:text,deliveryMethod:text,validityYears:integer,website:text
 });
 const phaseSchema = object({
  step:integer,title:text,feeEstimateCad:integer,duration:text,statutoryRequirement:text,actions:array(text)
 });
 const credentialPathwaySchema = object({
  asOf:text,profession:text,professionKey:text,targetProvince:text,originCountry:text,currentDegree:text,
  regulatoryBody:text,statute:text,
  canadianExperiencePolicy:object({mandatoryCanadianExperienceRequired:boolean,statutoryProtection:text,legalCitation:text,advisory:text}),
  designatedEca:ecaSchema,
  phases:array(phaseSchema),
  financialAssistance:object({fcrLoansAvailable:boolean,loanAmountRange:text,loanPartners:array(text),taxDeductibility:text}),
  estimatedTotalCostCad:integer,statutoryWarnings:array(text),authority:text
 });
 response('/v1/tools/credential-pathway','get','200',credentialPathwaySchema);
 response('/v1/tools/credential-pathway','post','200',credentialPathwaySchema);

  const standardFormRemedy = object({demandRight:text,rentWithholding:text,permanentRetention:text,leaseTermination:text});
  const leaseGuardSchema = object({
   asOf:text,province:text,overallSafetyRating:text,
   standardFormStatus:object({isMandatory:boolean,isCompliant:boolean,formName:text,statutoryRemedy:{anyOf:[standardFormRemedy,{type:'null'}]}}),
   depositAudit:object({
    monthlyRentCad:integer,
    demanded:object({rentDepositMonths:integer,totalRentDepositCad:integer,damageDepositCad:integer,keyDepositCad:integer,totalDemandedCad:integer}),
    statutoryCaps:object({legalMaxRentDepositCad:integer,legalMaxDamageDepositCad:integer,legalKeyDepositCad:integer}),
    unlawfulCharges:array(object({type:text,description:text,unlawfulAmountCad:integer})),
    totalUnlawfulExcessCad:integer,rebateForm:text
   }),
   clauseAudits:array(object({key:text,name:text,isLegal:boolean,statutoryStatus:text,statute:text,ruling:text,exception:text,action:text})),
   voidClauseCount:integer,officialDisputeNotice:text,statutoryAuthority:text
  });
  response('/v1/tools/lease-guard','get','200',leaseGuardSchema);
  response('/v1/tools/lease-guard','post','200',leaseGuardSchema);

  const childBreakdownSchema = object({
   childIndex:integer,ageGroup:text,marketRateMonthlyCad:integer,
   cwelccCappedMonthlyCad:integer,cwelccDailyFeeCad:number,cwelccMonthlySavingsCad:integer,
   cwelccEligibilityNote:text
  });
  const childcareSupportSchema = object({
   asOf:text,city:text,immigrationStatus:text,familyNetIncomeCad:integer,childrenCount:integer,
   monthlyCostSummary:object({
    unsubsidizedMarketMonthlyTotalCad:integer,cwelccUniversalCapMonthlyTotalCad:integer,
    estimatedParentFeeAfterSubsidyMonthlyCad:integer,totalMonthlySavingsCad:integer
   }),
   subsidyAssessment:object({
    programName:text,status:text,estimatedMonthlySubsidyCad:integer,
    isStatutorilyEligible:boolean,administeredBy:text
   }),
   waitlistPortal:object({name:text,url:text,recommendedAction:text}),
   childrenBreakdown:array(childBreakdownSchema),
   statutoryAdvisories:array(text),authority:text
  });
  response('/v1/tools/childcare-support','get','200',childcareSupportSchema);
  response('/v1/tools/childcare-support','post','200',childcareSupportSchema);

  const manifestItemSchema = object({
   itemNo:integer,category:text,description:text,serialNumber:nullableText,valueCad:integer,ownedMonths:integer
  });
  const customsDeclarationSchema = object({
   asOf:text,settlerStatus:text,
   tariffClassification:object({code:text,title:text,statute:text,memorandum:text,description:text}),
   financialAudit:object({
    totalDeclaredValueCad:integer,accompanyingGoodsValueCad:integer,goodsToFollowValueCad:integer,
    dutyExemptValueCad:integer,taxableExcessValueCad:integer,estimatedDutyAndTaxSavingsCad:integer
   }),
   currencyCompliance:object({
    amountCad:integer,thresholdCad:integer,isDeclarationMandatory:boolean,statute:text,mandatoryForm:text,complianceNote:text
   }),
   jewelryAudit:object({
    itemsDetected:integer,items:array(object({description:text,valueCad:integer,hasAppraisalReceipt:boolean})),
    requiresAppraisalPhoto:boolean,statutoryInstructions:text
   }),
   prohibitedItemsAlert:object({
    flaggedCount:integer,flaggedItems:array(object({description:text,reason:text})),statutoryPenalty:text
   }),
   vehicleAudit:{anyOf:[object({
    makeModel:text,year:integer,valueCad:integer,ageYears:integer,is15YearsOrOlder:boolean,
    rivExemption:text,airConditioningExciseTaxCad:integer,exemptPortionCad:integer,taxableExcessCad:integer,statuteNote:text
   }),{type:'null'}]},
   bsf186Manifest:object({
    accompanyingCount:integer,accompanyingGoods:array(manifestItemSchema),
    goodsToFollowCount:integer,goodsToFollow:array(manifestItemSchema),portOfEntryChecklist:array(text)
   }),
   statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/customs-declaration','get','200',customsDeclarationSchema);
  response('/v1/tools/customs-declaration','post','200',customsDeclarationSchema);

  const criterionCheckSchema = object({
   criterion:text,met:boolean,statute:text,note:text
  });
  const homebuyerEligibilitySchema = object({
   asOf:text,purchasePriceCad:integer,province:text,city:text,immigrationStatus:text,
   federalBanAssessment:object({
    isLegallyPermittedToBuy:boolean,statutoryStatus:text,statute:text,regulation:text,
    criteriaAudit:array(criterionCheckSchema),legalRiskNotice:text
   }),
   provincialTaxAssessment:object({
    taxName:text,statute:text,ratePercent:number,upfrontNonResidentTaxCad:integer,
    isEligibleForStatutoryRebate:boolean,rebateProgram:text,potentialRebateAmountCad:integer,rebateConditions:array(text)
   }),
   closingTaxesAndRebates:object({
    provincialLandTransferTaxCad:integer,torontoMunicipalLandTransferTaxCad:integer,
    firstTimeHomeBuyerRebateCad:integer,netLandTransferTaxCad:integer,
    upfrontNonResidentTaxCad:integer,totalClosingTaxesCad:integer
   }),
   financialClosingSummary:object({
    minimumDownPaymentCad:integer,minimumDownPaymentPercent:number,
    estimatedLegalAndDisbursementsCad:integer,totalUpfrontCashRequiredAtClosingCad:integer,
    futureRecoverableRebatesCad:integer
   }),
   statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/homebuyer-eligibility','get','200',homebuyerEligibilitySchema);
  response('/v1/tools/homebuyer-eligibility','post','200',homebuyerEligibilitySchema);

  const bankPackageSchema = object({
   bankName:text,programName:text,monthlyFeeWaivedMonths:integer,
   savingsValueCad:integer,welcomeBonusCad:integer,totalBenefitValueCad:integer,
   unsecuredCreditLimitCad:integer,creditCardName:text,internationalTransfers:text,specialFeatures:array(text)
  });
  const creditFactorSchema = object({
   factor:text,weightPercent:integer,rule:text
  });
  const roadmapStepSchema = object({
   month:integer,milestone:text,targetScore:integer,phase:text,actions:array(text)
  });
  const bankingComparatorSchema = object({
   asOf:text,selectedBank:text,monthlySpendingCad:integer,targetCreditScore:integer,
   hasPostpaidPhonePlan:boolean,immigrationCategory:text,
   packagesComparison:array(bankPackageSchema),
   bankActStatutoryRights:object({
    statute:text,coreRight:text,mandatoryIdRequirements:array(text),tellerDisputeNotice:text
   }),
   creditBureauFactors:array(creditFactorSchema),
   utilizationOptimization:object({
    monthlySpendCad:integer,recommendedCreditLimitCad:integer,
    optimalReportedStatementBalanceCad:integer,targetUtilizationPercent:integer,goldenRule:text
   }),
   twelveMonthRoadmap:array(roadmapStepSchema),
   statutoryAdvisories:array(text),authority:text
  });
  response('/v1/tools/banking-comparator','get','200',bankingComparatorSchema);
  response('/v1/tools/banking-comparator','post','200',bankingComparatorSchema);

  const citizenshipCalculatorSchema = object({
   asOf:text,applicationDate:text,prLandingDate:text,
   eligibilityWindow:object({startDate:text,endDate:text,windowYears:integer}),
   physicalPresenceAudit:object({
    prePrActualDaysPresent:integer,prePrCreditedDays:integer,prePrStatutoryCapApplied:boolean,
    postPrDaysSinceLanding:integer,postPrDaysAbsent:integer,postPrCreditedDays:integer,
    totalCreditedDays:integer,statutoryRequirementDays:integer,surplusOrShortfallDays:integer,
    hasMetPhysicalPresence:boolean,earliestProjectedEligibleDate:text
   }),
   taxCompliance:object({
    taxYearsFiled:integer,requiredTaxYears:integer,hasMetTaxRequirement:boolean,statute:text
   }),
   languageAudit:object({
    applicantAge:integer,isLanguageRequired:boolean,clbLevelRequired:integer,
    status:text,note:text,statute:text
   }),
   prohibitionsAudit:object({hasCriminalProhibitions:boolean,statute:text}),
   overallReadiness:object({status:text,summaryHeadline:text,isEligibleNow:boolean}),
   governmentFeeSchedule:object({adultFeeCad:integer,minorFeeCad:integer,refundableRightOfCitizenshipFeeCad:integer}),
   statutoryChecklist:array(text),statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/citizenship-calculator','get','200',citizenshipCalculatorSchema);
  response('/v1/tools/citizenship-calculator','post','200',citizenshipCalculatorSchema);

  const evictionDefectSchema = object({
    defect:text,statute:text,legalRemedy:text,dismissMandatory:boolean
  });
  const evictionDefenseSchema = object({
    asOf:text,noticeFormType:text,validityVerdict:text,isNoticeStatutorilyVoid:boolean,monthlyRentCad:integer,
    noticePeriodAudit:object({
      noticeServedDate:text,terminationDate:text,daysNoticeGiven:integer,statutoryDaysRequired:integer,isNoticePeriodCompliant:boolean
    }),
    statutoryDefects:array(evictionDefectSchema),
    compensationAudit:object({
      isMandatory:boolean,amountDueCad:integer,wasPaid:boolean,paidOnTime:boolean,statutoryCitation:text
    }),
    badFaithIndicators:array(text),
    potentialTenantDamages:object({
      statutoryGeneralDamages12MonthsRentCad:integer,movingExpensesEstimateCad:integer,rentDifferential1YearCad:integer,totalClaimableDamagesCad:integer,statutoryAuthority:text
    }),
    officialDisputeNotice:text,statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/eviction-defense','get','200',evictionDefenseSchema);
  response('/v1/tools/eviction-defense','post','200',evictionDefenseSchema);

  const prResidencySchema = object({
    asOf:text,prLandingDate:text,prCardExpiryDate:text,daysSinceLanding:integer,
    isWithinFirstFiveYearsOfPr:boolean,daysUntilExpiry:integer,isCardExpired:boolean,
    complianceStatus:text,summaryHeadline:text,
    residencyDayAudit:object({
      actualDaysInsideCanada:integer,
      overseasExemptedDays:object({
        accompanyingCitizenSpouseDays:integer,canadianBusinessEmploymentDays:integer,
        accompanyingPrEmployedAbroadDays:integer,totalOverseasCreditedDays:integer
      }),
      totalCreditedResidencyDays:integer,statutoryMinimumDaysRequired:integer,
      surplusOrDeficitDays:integer,hasMet730DaysObligation:boolean
    }),
    renewalEligibility:object({
      isEligibleToApplyForRenewal:boolean,recommendedApplicationWindow:text,irccProcessingFeeCad:integer
    }),
    urgentProcessingAssessment:object({
      isEligibleForUrgentProcessing:boolean,qualifyingCriteria:array(text),requiredProof:array(text)
    }),
    prTravelDocumentAssessment:object({
      isNeeded:boolean,eligibleForPrtd:boolean,processingPlatform:text,feeCad:integer,statutoryBasis:text
    }),
    statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/pr-residency','get','200',prResidencySchema);
  response('/v1/tools/pr-residency','post','200',prResidencySchema);

  const publicDangerIssueSchema = object({
    ground:text,description:text
  });
  const medicalAdmissibilitySchema = object({
    asOf:text,immigrationStream:text,conditionName:text,determination:text,summaryHeadline:text,
    isStatutorilyExempt:boolean,statutoryExemptionBasis:text,
    publicDangerAssessment:object({
      hasIssues:boolean,issues:array(publicDangerIssueSchema)
    }),
    statutoryCostAudit:object({
      annualThresholdCad:integer,fiveYearThresholdCad:integer,
      estimatedGrossAnnualCostCad:integer,estimatedGrossFiveYearCostCad:integer,
      exceedsStatutoryThreshold:boolean,costExceededAnnualCad:integer
    }),
    mitigationFeasibility:object({
      canMitigateExcessDemand:boolean,annualPrivateInsuranceOffsetCad:integer,
      netAnnualPublicCostCad:integer,availableLiquidFundsCad:integer,mitigationAuthority:text
    }),
    proceduralFairnessClock:object({
      receivedPfl:boolean,daysRemainingToRespond:integer,statutoryDeadlineDate:nullableText,actionRequired:text
    }),
    individualizedMitigationPlanDraft:text,statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/medical-admissibility','get','200',medicalAdmissibilitySchema);
  response('/v1/tools/medical-admissibility','post','200',medicalAdmissibilitySchema);

  const workerClassificationSchema = object({
    asOf:text,province:text,jobTitle:text,hourlyRateCad:number,classificationVerdict:text,isMisclassifiedEmployee:boolean,
    hoursSummary:object({
      weeklyHoursWorked:number,statutoryOvertimeThreshold:number,overtimeHoursPerWeek:number,totalWeeksWorked:number,totalHoursWorked:number
    }),
    wageTheftAudit:object({
      grossPayActuallyReceivedCad:number,unpaidOvertimeCad:number,unpaidVacationPayCad:number,unpaidHolidayPayCad:number,
      totalDirectWageTheftCad:number,employerCppLiabilityCad:number,employerEiLiabilityCad:number,totalStatutoryEmployerLiabilityCad:number
    }),
    commonLawFactors:object({
      employeeIndicators:array(text),contractorIndicators:array(text),governingPrecedent:text
    }),
    officialDemandLetter:text,statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/worker-classification','get','200',workerClassificationSchema);
  response('/v1/tools/worker-classification','post','200',workerClassificationSchema);

  const vehicleDefectSchema = object({
    defect:text,statute:text,legalRemedy:text
  });
  const vehicleImportationSchema = object({
    asOf:text,countryOfOrigin:text,vehicleModelYear:integer,vehicleAgeYears:integer,
    is15YearsOrOlder:boolean,isStatutorilyAdmissible:boolean,admissibilityVerdict:text,summaryHeadline:text,
    statutoryDefects:array(vehicleDefectSchema),
    costAndTaxAudit:object({
      estimatedVehicleValueCad:integer,customsDutyCad:integer,customsDutyRatePercent:number,
      gstCad:integer,acExciseTaxCad:integer,greenLevyCad:integer,rivFeeCad:integer,
      totalFederalBorderPayableCad:integer,isSettlerTariffExempt:boolean,statutoryExemptionBasis:text
    }),
    usCbpExportRequirements:object({
      isMandatory:boolean,statute:text,noticeWindow:text,mandatoryDocuments:array(text),borderWarning:text
    }),
    requiredModifications:array(text),provincialRegistrationRoadmap:array(text),
    statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/vehicle-import','get','200',vehicleImportationSchema);
  response('/v1/tools/vehicle-import','post','200',vehicleImportationSchema);

  const studentViolationSchema = object({
    rule:text,statute:text,description:text
  });
  const studentComplianceSchema = object({
    asOf:text,enrollmentStatus:text,weeklyHoursWorked:integer,maxPermittedHoursThisWeek:integer,
    isWorkAuthorized:boolean,complianceVerdict:text,summaryHeadline:text,
    statutoryViolations:array(studentViolationSchema),
    pgwpEligibilityRisks:array(text),
    complianceChecklist:object({
      isDesignatedLearningInstitution:boolean,
      hasValidSin:boolean,
      permitHasWorkCondition:boolean,
      isScheduledBreak:boolean,
      isFinalSemesterExemption:boolean
    }),
    statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/student-compliance','get','200',studentComplianceSchema);
  response('/v1/tools/student-compliance','post','200',studentComplianceSchema);

  const vulnerableViolationSchema = object({
    ground:text,statute:text,severity:text,legalFinding:text
  });
  const vwowpRoadmapStepSchema = object({
    step:integer,title:text,action:text
  });
  const vulnerableWorkerSchema = object({
    asOf:text,currentPermitType:text,isVwowpEligible:boolean,eligibilityVerdict:text,
    summaryHeadline:text,identifiedAbuseGroundsCount:integer,
    statutoryViolations:array(vulnerableViolationSchema),
    totalFinancialLossCad:integer,recruitmentFeesPaidCad:integer,unpaidWagesOrKickbacksCad:integer,
    evidenceAudit:object({
      hasEvidenceDocs:boolean,evidenceConfidence:text,evidenceScore:integer,evidenceTypesHeld:array(text)
    }),
    immediateRemedies:array(text),statutoryProtections:array(text),
    vwowpRoadmap:array(vwowpRoadmapStepSchema),
    statutoryAdvisories:array(text),statutoryAuthority:text
  });
  response('/v1/tools/vulnerable-worker','get','200',vulnerableWorkerSchema);
  response('/v1/tools/vulnerable-worker','post','200',vulnerableWorkerSchema);

  const sponsorViolationSchema = object({
    rule:text,statute:text,legalFinding:text
  });
  const incomeYearSchema = object({
    requiredCad:integer,actualIncomeCad:integer,surplusOrDeficitCad:integer,isMet:boolean
  });
  const superVisaSponsorSchema = object({
    asOf:text,pathway:text,sponsorStatus:text,totalFamilyUnitSize:integer,
    isStatutorilyEligible:boolean,eligibilityVerdict:text,summaryHeadline:text,
    incomeAudit:object({
      totalFamilyUnitSize:integer,isPgpStream:boolean,
      year1:incomeYearSchema,
      year2:{anyOf:[incomeYearSchema,{type:'null'}]},
      year3:{anyOf:[incomeYearSchema,{type:'null'}]}
    }),
    insuranceAudit:object({
      isApplicable:boolean,hasMedicalInsuranceQuote:boolean,coverageAmountCad:integer,
      durationDays:integer,isCanadianOrApprovedForeignProvider:boolean,
      hasPreExistingCoverage:boolean,isRefundableIfDenied:boolean,isInsuranceCompliant:boolean
    }),
    statutoryViolations:array(sponsorViolationSchema),
    statutoryAdvisories:array(text),
    statutoryAuthority:text
  });
  response('/v1/tools/super-visa-sponsor','get','200',superVisaSponsorSchema);
  response('/v1/tools/super-visa-sponsor','post','200',superVisaSponsorSchema);

  const petViolationSchema = object({
    rule:text,statute:text,legalFinding:text
  });
  const petImportSchema = object({
    asOf:text,animalType:text,dogBreed:text,countryOfOrigin:text,destinationProvince:text,
    isHighRiskRabiesCountry:boolean,isImportAdmissible:boolean,admissibilityVerdict:text,summaryHeadline:text,
    borderFinancials:object({
      isSettlerTariffExempt:boolean,customsDutyCad:integer,gstCad:integer,cfiaInspectionFeeCad:integer,totalBorderPayableCad:integer
    }),
    complianceChecklist:object({
      hasIsoMicrochip:boolean,isAgeCompliant:boolean,isRabiesCompliant:boolean,isFavnTiterCompliant:boolean,isOntarioBslCompliant:boolean
    }),
    statutoryViolations:array(petViolationSchema),
    statutoryAdvisories:array(text),
    statutoryAuthority:text
  });
  response('/v1/tools/pet-import','get','200',petImportSchema);
  response('/v1/tools/pet-import','post','200',petImportSchema);

  const identityActionSchema = object({
    stepNumber:integer,targetAgency:text,action:text
  });
  const identityCascadeStageSchema = object({
    stage:integer,agency:text,docIssued:text,timeframe:text,notes:text
  });
  const identityViolationSchema = object({
    rule:text,statute:text,legalFinding:text
  });
  const identityHarmonizationSchema = object({
    asOf:text,discrepancyType:text,currentStatusInCanada:text,residenceProvince:text,
    monthsLivedInProvince:integer,isProvincialNameChangeEligible:boolean,resolutionVerdict:text,
    summaryHeadline:text,provincialStatute:text,provincialFeeCad:integer,
    minResidencyMonthsRequired:integer,requiresRcmpFingerprinting:boolean,
    statutoryViolations:array(identityViolationSchema),
    actionChecklist:array(identityActionSchema),
    governmentCascadeRoadmap:array(identityCascadeStageSchema),
    statutoryAdvisories:array(text),
    statutoryAuthority:text
  });
  response('/v1/tools/identity-harmonization','get','200',identityHarmonizationSchema);
  response('/v1/tools/identity-harmonization','post','200',identityHarmonizationSchema);

  const providerComparisonSchema = object({
    providerId:text,providerName:text,effectiveRate:number,estimatedReceivedAmount:number,
    totalFeeDragCad:number,feeDragPercentage:number,
    breakdown:object({spreadCostCad:number,fixedFeesCad:number,intermediaryFeesCad:number}),
    transferTime:text,recommendationRank:integer,pros:array(text),cons:array(text)
  });
  const fintracRequirementSchema = object({
    statute:text,form:text,deadline:text,description:text
  });
  const sourceOfFundsDocSchema = object({
    document:text,purpose:text,mandatory:boolean
  });
  const crossBorderGuideSchema = object({
    title:text,description:text
  });
  const currencyExchangeSchema = object({
    corridor:text,amount:number,benchmarkRate:number,grossBenchmarkReceived:number,
    cadEquivalentTotal:number,bestOption:providerComparisonSchema,savingsVersusBig5Cad:number,
    providerComparisons:array(providerComparisonSchema),
    fintracCompliance:object({
      isReportableFintrac:boolean,cadEquivalentAmount:number,
      reportingRequirements:array(fintracRequirementSchema),
      structuringRisk:object({hasStructuringRisk:boolean,severity:text,warningMessage:nullableText}),
      sourceOfFundsChecklist:array(sourceOfFundsDocSchema)
    }),
    norbertsGambitGuide:{anyOf:[object({
      isApplicable:boolean,tickerPair:text,estimatedSavingsCad:number,settlementCycle:text,
      protocolSteps:array(text),brokerChatTemplate:text
    }),{type:'null'}]},
    crossBorderBankingGuidance:array(crossBorderGuideSchema),
    statutoryAdvisories:array(text)
  });
  response('/v1/tools/currency-exchange','get','200',currencyExchangeSchema);
  response('/v1/tools/currency-exchange','post','200',currencyExchangeSchema);

  const parentalViolationSchema = object({
    rule:text,statute:text,legalFinding:text
  });
  const parentalVulnerabilitySchema = object({
    risk:text,daysToExpiry:integer,actionRequired:text
  });
  const parentalActionSchema = object({
    stepNumber:integer,agency:text,action:text,timing:text
  });
  const parentalOptionComparisonSchema = object({
    option:text,parentalWeeks:integer,totalLeaveDurationWeeks:integer,replacementRatePct:integer,
    weeklyCad:number,totalParentalPayoutCad:number,totalCombinedPayoutCad:number,notes:text
  });
  const parentalLeaveSchema = object({
    province:text,provincialStatute:text,immigrationStatus:text,resolutionVerdict:text,
    isEligibleForCashBenefits:boolean,hoursWorkedPast52Weeks:integer,hoursShortfall:integer,
    isEligibleForProvincialJobProtection:boolean,serviceWeeksWithEmployer:integer,serviceWeeksShortfall:integer,
    selectedOption:text,weeklyBenefitCad:number,maternityWeeks:integer,parentalWeeks:integer,
    totalBenefitDurationWeeks:integer,totalProjectedCashPayoutCad:number,
    comparisonBetweenOptions:object({
      standard:parentalOptionComparisonSchema,
      extended:parentalOptionComparisonSchema
    }),
    statutoryViolations:array(parentalViolationSchema),
    workPermitVulnerabilities:array(parentalVulnerabilitySchema),
    actionChecklist:array(parentalActionSchema),
    statutoryAdvisories:array(text),
    statutoryAuthority:text
  });
  response('/v1/tools/parental-leave','get','200',parentalLeaveSchema);
  response('/v1/tools/parental-leave','post','200',parentalLeaveSchema);

  const categoryDrawStatusSchema = object({
    name:text,isEligible:boolean,benchmarkCutoff:integer,scoreSurplus:integer,likelyInvited:boolean
  });
  const optimizationLeverSchema = object({
    lever:text,potentialPointsGain:integer,projectedNewCrs:integer,feasibility:text,impactSummary:text
  });
  const expressEntryCrsSchema = object({
    totalCrsScore:integer,
    breakdown:object({
      humanCapital:object({agePoints:integer,educationPoints:integer,firstLanguagePoints:integer,secondLanguagePoints:integer,canadianExperiencePoints:integer,subtotal:integer}),
      spouseFactors:object({education:integer,language:integer,canadianExperience:integer,total:integer}),
      skillTransferability:object({educationTransferSubtotal:integer,foreignExperienceTransferSubtotal:integer,tradeCertificate:integer,total:integer}),
      additionalPoints:object({provincialNomination:integer,arrangedEmployment:integer,canadianStudy:integer,frenchBilingualism:integer,siblingInCanada:integer,total:integer})
    }),
    categoryEligibility:object({
      french:categoryDrawStatusSchema,
      stem:categoryDrawStatusSchema,
      healthcare:categoryDrawStatusSchema,
      trades:categoryDrawStatusSchema,
      transport:categoryDrawStatusSchema,
      agriculture:categoryDrawStatusSchema,
      canadianExperienceClass:categoryDrawStatusSchema,
      generalAllProgram:categoryDrawStatusSchema
    }),
    optimizationLevers:array(optimizationLeverSchema),
    statutoryAdvisories:array(text),
    statutoryAuthority:text
  });
  response('/v1/tools/express-entry-crs','get','200',expressEntryCrsSchema);
  response('/v1/tools/express-entry-crs','post','200',expressEntryCrsSchema);
 // SaaS plans and research tools.
 {const loose=properties=>({type:'object',properties,additionalProperties:true});
  const planRow=loose({id:{enum:['free','plus','pro','team']},name:{type:'string'},priceCadMonthly:{type:'number'},tiers:{type:'array',items:{type:'string'}},monthlyChatAnswers:{type:'integer'},monthlyToolRuns:{type:'integer'},apiKeys:{type:'integer'}});
  response('/v1/plans','get','200',loose({version:{const:'plans-1'},currency:{const:'CAD'},period:{type:'string'},notes:{type:'array',items:{type:'string'}},plans:{type:'array',items:planRow},tierExamples:{type:'object'}}));
  const usageRow=loose({used:{type:'integer'},limit:{type:'integer'},remaining:{type:'integer'}});
  response('/v1/account','get','200',loose({account:{type:['object','null']},plan:{enum:['free','plus','pro','team']},usage:loose({period:{type:'string'},resetAt:{type:'string'},features:loose({chat:usageRow,tool:usageRow})})}));
  const clb=loose({test:{type:'string'},accepted:{type:'boolean'},testName:{type:'string'},benchmark:{enum:['CLB','NCLC']},perSkill:{type:'object'},overallLevel:{type:['integer','null']},overallLabel:{type:'string'},milestones:{type:'object'},notes:{type:'array',items:{type:'string'}},message:{type:'string'},source:{type:'object'}});
  const pof=loose({program:{enum:['fsw','fst','cec']},familySize:{type:'integer'},requiredCad:{type:'number'},exempt:{type:'boolean'},meetsRequirement:{type:'boolean'},shortfallCad:{type:'number'},verdict:{type:'string'},rules:{type:'array',items:{type:'string'}},source:{type:'object'}});
  for(const method of ['get','post']){response('/v1/tools/language-score-clb',method,'200',clb);response('/v1/tools/proof-of-funds',method,'200',pof);}
  const customer=loose({id:{type:'string'},name:{type:'string'},plan:{enum:['free','plus','pro','team']},email:{type:['string','null']}});
  response('/v1/auth/signup','post','201',loose({account:customer}));
  delete paths['/v1/auth/signup'].post.responses['200'];
  response('/v1/auth/login','post','200',loose({account:customer}));
  response('/v1/auth/logout','post','200',loose({loggedOut:{const:true}}));
  response('/v1/auth/password','post','200',loose({passwordChanged:{const:true}}));
  response('/v1/auth/verify','post','200',loose({emailVerified:{const:true}}));
  const accepted=loose({status:{enum:['sent','not_sent','already_verified','accepted']},message:{type:'string'}});
  response('/v1/auth/verify/resend','post','200',accepted);response('/v1/auth/verify/resend','post','202',accepted);
  response('/v1/auth/reset/request','post','202',accepted);delete paths['/v1/auth/reset/request'].post.responses['200'];
  response('/v1/auth/reset/confirm','post','200',loose({passwordReset:{const:true}}));
  const keyRow=loose({id:{type:'string'},label:{type:['string','null']},createdAt:{type:'string'},lastUsedAt:{type:['string','null']},revokedAt:{type:['string','null']}});
  response('/v1/account/keys','get','200',loose({keys:{type:'array',items:keyRow},limit:{type:'integer'}}));
  response('/v1/account/keys','post','201',loose({apiKey:{type:'string',pattern:'^nsk_'},keys:{type:'array',items:keyRow},notice:{type:'string'}}));delete paths['/v1/account/keys'].post.responses['200'];
  response('/v1/account/keys/revoke','post','200',loose({revoked:{const:true}}));
  response('/v1/test-mode','get','200',loose({enabled:{const:true},email:{type:'string'},password:{type:'string'},notice:{type:'string'}}));
  const pair=loose({chat:{type:'integer'},tool:{type:'integer'}});
  response('/v1/account/usage','get','200',loose({period:{type:'string'},plan:{enum:['free','plus','pro','team']},resetAt:{type:'string'},daysInMonth:{type:'integer'},elapsedDays:{type:'integer'},limits:pair,totals:pair,projected:pair,daily:{type:'array',items:loose({day:{type:'string'},chat:{type:'integer'},tool:{type:'integer'}})},byKey:{type:'array',items:loose({keyId:{type:'string'},label:{type:['string','null']},revoked:{type:'boolean'},chat:{type:'integer'},tool:{type:'integer'}})},note:{type:'string'}}));
 }

  const businessViolationSchema = object({
    rule:text,statute:text,legalFinding:text
  });
  const businessActionSchema = object({
    stepNumber:integer,agency:text,action:text,timing:text
  });
  const businessStructureSchema = object({
    province:text,corporateStatute:text,immigrationStatus:text,workPermitType:text,recommendedStructure:text,
    immigrationCompliance:object({
      isLegallyAuthorizedToOperate:boolean,severity:text,finding:text,statute:text
    }),
    gstHstAudit:object({
      isRegistrationMandatory:boolean,smallSupplierThresholdCad:integer,projectedRevenueCad:number,
      estimatedGstHstCollectedCad:number,quickMethodEligible:boolean,quickMethodRemittanceCad:number,
      quickMethodTaxProfitCad:number,statutoryWindowDays:integer
    }),
    psbRiskAudit:object({
      psbRiskLevel:text,verdict:text,effectiveCorporateTaxRate:number,
      consequences:array(text),mitigationSteps:array(text)
    }),
    taxComparison:object({
      netBusinessIncomeCad:number,
      soleProprietorship:object({totalTaxAndCppCad:number,afterTaxCashCad:number,effectiveTaxRatePct:number}),
      corporation:object({corporateTaxPaidCad:number,corporateRetainedEarningsCad:number,immediateTaxSavingsOrDeferralCad:number,retainedShelteredInsideCorpCad:number})
    }),
    corporateDirectorResidency:object({requiresCanadianResidentDirector:boolean,statute:text}),
    statutoryViolations:array(businessViolationSchema),
    actionChecklist:array(businessActionSchema),
    statutoryAdvisories:array(text),
    statutoryAuthority:text
  });
  response('/v1/tools/business-structure','get','200',businessStructureSchema);
  response('/v1/tools/business-structure','post','200',businessStructureSchema);

  const pnpLeverSchema = object({
    action: text,
    pointsGain: text,
    impact: text
  });
  const pnpBlockerSchema = object({
    code: text,
    statute: text,
    message: text
  });
  const pnpPathwaySchema = object({
    province: text,
    nocCode: text,
    streamType: text,
    bonusCrsPoints: integer,
    projectedPostNominationCrs: nullableInt,
    bcPnpScore: integer,
    bcScoreBreakdown: object({
      humanCapitalFactors: object({
        total: integer,
        maxPossible: integer,
        directExperiencePoints: integer,
        highestEducationPoints: integer,
        languageProficiencyPoints: integer
      }),
      economicFactors: object({
        total: integer,
        maxPossible: integer,
        hourlyWagePoints: integer,
        areaOfEmploymentPoints: integer
      })
    }),
    bcTechEligibility: object({
      isTargetedTechNoc: boolean,
      qualifiesForBcTech: boolean,
      currentCutoff: integer,
      pointsVsCutoff: integer,
      likelihood: text,
      statutoryAdvisory: text
    }),
    oinpTechEligibility: object({
      isOinpTechNoc: boolean,
      qualifiesForOinpTech: boolean,
      statutoryAdvisory: text
    }),
    aaipTechEligibility: object({
      qualifiesForAaipTech: boolean,
      statutoryAdvisory: text
    }),
    settlementFunds: object({
      isExempt: boolean,
      familySize: integer,
      requiredFundsCad: number,
      providedFundsCad: number,
      meetsRequirement: boolean,
      shortfallCad: number,
      statutoryBasis: text
    }),
    strategicLevers: array(pnpLeverSchema),
    statutoryBlockers: array(pnpBlockerSchema),
    statutoryAdvisories: array(text)
  });
  response('/v1/tools/pnp-pathway', 'get', '200', pnpPathwaySchema);
  response('/v1/tools/pnp-pathway', 'post', '200', pnpPathwaySchema);

  const bowpBlockerSchema = object({
    code: text,
    statute: text,
    message: text
  });
  const bowpAlternativeSchema = object({
    recommendedPermit: text,
    exemptionCode: text,
    statutoryAuthority: text,
    advisory: text
  });
  const bowpDiagnosticSchema = object({
    resolutionVerdict: text,
    isEligibleForBowp: boolean,
    currentPermitType: text,
    daysUntilExpiry: integer,
    isExpired: boolean,
    filingWindowStatus: text,
    exemptionCode: nullableText,
    totalFeeCad: integer,
    feeBreakdown: object({
      WORK_PERMIT_PROCESSING_FEE: integer,
      OPEN_WORK_PERMIT_HOLDER_FEE: integer,
      TOTAL_BOWP_FEE: integer
    }),
    prProgramApplied: text,
    hasOfficialAor: boolean,
    pnpProvince: nullableText,
    pnpNominationHasEmployerRestrictions: boolean,
    alternativePermitRecommendation: { anyOf: [bowpAlternativeSchema, { type: 'null' }] },
    maintainedStatus: object({
      hasMaintainedStatusRight: boolean,
      statutoryAuthority: text,
      conditionsPreserved: text,
      travelAdvisory: text
    }),
    spousalOpenWorkPermit: object({
      isApplicable: boolean,
      eligible: boolean,
      exemptionCode: nullableText,
      meetsHighSkilledCriteria: boolean,
      meetsPayStubsRequirement: boolean,
      meetsDurationRequirement: boolean,
      advisory: text
    }),
    statutoryBlockers: array(bowpBlockerSchema),
    statutoryWarnings: array(text),
    applicationChecklist: array(text),
    statutoryAdvisories: array(text)
  });
  response('/v1/tools/bowp-diagnostic', 'get', '200', bowpDiagnosticSchema);
  response('/v1/tools/bowp-diagnostic', 'post', '200', bowpDiagnosticSchema);

  const leaseViolationSchema = object({
    clause: text,
    statute: text,
    finding: text
  });
  const leaseRemedySchema = object({
    action: text,
    statute: text,
    details: text
  });
  const leaseAssignmentSchema = object({
    province: text,
    leaseType: text,
    requestType: text,
    requestStage: text,
    daysSinceRequest: integer,
    statutoryResponseDeadlineDays: integer,
    isEarlyExitPermittedWithoutPenalty: boolean,
    resolutionVerdict: text,
    recommendedLegalForm: nullableText,
    earliestEffectiveTerminationDate: nullableText,
    demandedPenaltyCad: number,
    isIllegalPenaltyDemanded: boolean,
    demandedAssignmentFeeCad: number,
    isExcessiveAssignmentFee: boolean,
    maxStatutoryOutofPocketFeeCad: number,
    statutoryViolations: array(leaseViolationSchema),
    legalRemedies: array(leaseRemedySchema),
    noticeTemplates: object({
      assignmentRequestLetter: text,
      formN9TerminationNotice: nullableText
    }),
    statutoryAdvisories: array(text)
  });
  response('/v1/tools/lease-assignment', 'get', '200', leaseAssignmentSchema);
  response('/v1/tools/lease-assignment', 'post', '200', leaseAssignmentSchema);

  const debtViolationSchema = object({
    violationCode: text,
    statute: text,
    severity: text,
    finding: text
  });
  const debtProtectionSchema = object({
    shield: text,
    statute: text,
    details: text
  });
  const debtCollectionDefenseSchema = object({
    province: text,
    debtType: text,
    allegedDebtAmountCad: number,
    collectionAgencyName: text,
    yearsSinceDefault: number,
    isStatuteBarred: boolean,
    isCreditBureauPurgeEligible: boolean,
    resolutionVerdict: text,
    hasViolations: boolean,
    violationCount: integer,
    statutoryViolations: array(debtViolationSchema),
    legalProtections: array(debtProtectionSchema),
    ceaseAndDesistNotice: text,
    regulatoryFilingGuide: object({
      agency: text,
      action: text
    }),
    statutoryAdvisories: array(text)
  });
  response('/v1/tools/debt-collection-defense', 'get', '200', debtCollectionDefenseSchema);
  response('/v1/tools/debt-collection-defense', 'post', '200', debtCollectionDefenseSchema);

  const movingAuditWarningSchema = object({
    rule: text,
    severity: text,
    details: text
  });
  const formT1MMappingSchema = object({
    formName: text,
    taxReturnLine: text,
    line1TransportationAndStorageCad: number,
    line2TravelExpensesCad: number,
    line3TemporaryLivingExpensesCad: number,
    line4LeaseCancellationCostCad: number,
    line5IncidentalCostsCad: number,
    line8TotalGrossMovingExpensesCad: number,
    line9EmployerReimbursementCad: number,
    line10NetMovingExpensesCad: number,
    line11NetEligibleIncomeAtNewLocationCad: number,
    line12DeductionClaimedCurrentYearCad: number,
    line13AllowableCarryForwardCad: number
  });
  const movingTaxDeductionSchema = object({
    province: text,
    relocationPurpose: text,
    oldResidence: text,
    newResidenceCity: text,
    distanceKm: number,
    meetsDistanceRule: boolean,
    isEligible: boolean,
    eligibilityVerdict: text,
    grossEligibleExpensesCad: number,
    employerReimbursementCad: number,
    netEligibleExpensesCad: number,
    disallowedTemporaryLivingCad: number,
    canadianIncomeEarnedInYearCad: number,
    deductibleInCurrentTaxYearCad: number,
    carryForwardToFutureYearsCad: number,
    marginalTaxRatePercent: number,
    estimatedTaxRefundYear1Cad: number,
    estimatedFutureTaxRefundCad: number,
    totalTaxBenefitCad: number,
    formT1MMapping: formT1MMappingSchema,
    auditWarnings: array(movingAuditWarningSchema),
    documentationChecklist: array(text),
    statutoryAdvisories: array(text)
  });
  response('/v1/tools/moving-tax-deduction', 'get', '200', movingTaxDeductionSchema);
  response('/v1/tools/moving-tax-deduction', 'post', '200', movingTaxDeductionSchema);

  const licensureMilestoneSchema = object({
    step: integer,
    name: text,
    details: text
  });
  const alternativeCareerSchema = object({
    role: text,
    typicalSalaryCad: number,
    noc: text,
    regulatoryBarrier: text
  });
  const fundingResourceSchema = object({
    program: text,
    coverage: text,
    deliveryPartner: text
  });
  const credentialLicensureSchema = object({
    province: text,
    professionKey: text,
    professionTitle: text,
    isRegulatedProfession: boolean,
    protectedTitle: text,
    regulatoryCollege: text,
    governingStatute: text,
    mandatoryEcaDesignation: text,
    hasValidEca: boolean,
    ecaStatusFinding: text,
    canadianExperienceBanApplies: boolean,
    canadianExperienceProtectionDetails: text,
    titleRestrictionNotice: text,
    estimatedLicensingDurationMonths: integer,
    estimatedTotalCostCad: integer,
    officialLanguageClb: integer,
    isLanguageReady: boolean,
    languageFinding: text,
    licensingMilestones: array(licensureMilestoneSchema),
    alternativeUnlicensedCareers: array(alternativeCareerSchema),
    fundingAndBridgingResources: array(fundingResourceSchema),
    statutoryAdvisories: array(text)
  });
  response('/v1/tools/credential-licensure', 'get', '200', credentialLicensureSchema);
  response('/v1/tools/credential-licensure', 'post', '200', credentialLicensureSchema);

  const telecomViolationSchema = object({
    violationCode: text,
    statute: text,
    severity: text,
    finding: text
  });
  const telecomRemedySchema = object({
    remedy: text,
    authority: text,
    details: text
  });
  const telecomContractDefenseSchema = object({
    providerName: text,
    serviceType: text,
    contractType: text,
    daysSinceContractStart: integer,
    allowedTrialDays: integer,
    isWithinTrialPeriod: boolean,
    trialCancellationStatus: text,
    allowableMaxEcfCad: number,
    hasStatutoryViolations: boolean,
    violationCount: integer,
    statutoryViolations: array(telecomViolationSchema),
    consumerRemedies: array(telecomRemedySchema),
    formalDisputeNotice: text,
    statutoryAdvisories: array(text)
  });
  response('/v1/tools/telecom-contract-defense', 'get', '200', telecomContractDefenseSchema);
  response('/v1/tools/telecom-contract-defense', 'post', '200', telecomContractDefenseSchema);

  const borderBarrierSchema = object({
    rule: text,
    severity: text,
    description: text
  });
  const borderWarningSchema = object({
    statute: text,
    level: text,
    message: text
  });
  const borderPortSchema = object({
    name: text,
    province: text,
    flagpolingDays: array(text),
    flagpolingHours: text,
    dailyQuotaEnforced: boolean,
    estimatedQuota: text
  });
  const borderUsRefusalSchema = object({
    formName: text,
    mandatoryDeclaration: text,
    misrepresentationConsequence: text,
    hasUsVisa: boolean,
    advisory: text
  });
  const borderFlagpolingSchema = object({
    asOf: text,
    determination: text,
    summary: text,
    permitCategory: text,
    countryOfCitizenship: text,
    isTrvExempt: boolean,
    portOfEntry: borderPortSchema,
    dayScheduled: text,
    isOperatingDay: boolean,
    maintainedStatusAtRisk: boolean,
    pgwpBorderBanApplied: boolean,
    usAdministrativeRefusalImpact: borderUsRefusalSchema,
    legalBarriers: array(borderBarrierSchema),
    warnings: array(borderWarningSchema),
    requiredDocuments: array(text),
    borderInterviewPrep: array(text),
    statutoryReferences: array(text)
  });
  response('/v1/tools/border-flagpoling', 'get', '200', borderFlagpolingSchema);
  response('/v1/tools/border-flagpoling', 'post', '200', borderFlagpolingSchema);

  const rentIncreaseDefectSchema = object({
    defectCode: text,
    statute: text,
    severity: text,
    remedy: text
  });
  const rentControlStatusSchema = object({
    isRentControlled: boolean,
    firstOccupiedDate: text,
    finding: text
  });
  const rentCalculationsSchema = object({
    currentMonthlyRentCad: number,
    proposedMonthlyRentCad: number,
    statutoryGuidelinePercent: number,
    proposedIncreasePercent: number,
    allowableGuidelineIncreaseCad: number,
    maxLawfulGuidelineRentCad: number
  });
  const noticeComplianceSchema = object({
    noticeServedDate: text,
    effectiveDate: text,
    daysNoticeGiven: integer,
    statutoryDaysRequired: integer,
    isNoticePeriodCompliant: boolean,
    daysSinceLastIncrease: integer,
    is12MonthRuleCompliant: boolean,
    officialFormUsed: text,
    isFormCompliant: boolean
  });
  const agiAnalysisSchema = {
    type: ['object', 'null'],
    properties: {
      isAgiApplicable: boolean,
      agiReason: text,
      unapprovedPortionCad: number,
      hasLtbOrderBeenIssued: boolean,
      tenantStatutoryRight: text,
      maintenanceDefenseFinding: text
    }
  };
  const overpaymentAnalysisSchema = object({
    monthlyIllegalPortionCad: number,
    annualIllegalPortionCad: number,
    t1StatuteOfLimitationsWarning: text
  });
  const rentIncreaseDefenseSchema = object({
    asOf: text,
    province: text,
    validityVerdict: text,
    summary: text,
    rentControlStatus: rentControlStatusSchema,
    rentCalculations: rentCalculationsSchema,
    noticeCompliance: noticeComplianceSchema,
    statutoryDefects: array(rentIncreaseDefectSchema),
    agiAnalysis: agiAnalysisSchema,
    overpaymentAnalysis: overpaymentAnalysisSchema,
    officialTenantDisputeNotice: text,
    statutoryReferences: array(text)
  });
  response('/v1/tools/rent-increase-defense', 'get', '200', rentIncreaseDefenseSchema);
  response('/v1/tools/rent-increase-defense', 'post', '200', rentIncreaseDefenseSchema);

  const hrViolationSchema = object({
    statute: text,
    ground: text,
    severity: text,
    finding: text
  });
  const hrJurisdictionSchema = object({
    name: text,
    statute: text,
    tribunal: text,
    limitationPeriodDays: integer,
    formName: text,
    canadianExperienceProhibited: boolean
  });
  const hrLimitationsSchema = object({
    isWithin1YearLimitation: boolean,
    daysSinceLastIncident: integer,
    daysRemainingToApply: integer,
    limitationWarning: text
  });
  const hrConstructiveDismissalSchema = object({
    isConstructiveDismissal: boolean,
    reason: text,
    factorsIdentified: array(text),
    potterVNewBrunswickApplied: boolean
  });
  const hrDamagesSchema = object({
    estimatedCommonLawNoticeMonths: integer,
    estimatedCommonLawNoticeValueCad: integer,
    humanRightsDignityDamagesEstimateCad: object({
      minCad: integer,
      maxCad: integer,
      precedentBasis: text
    })
  });
  const hrRetaliationSchema = object({
    isReprisalProtected: boolean,
    statute: text,
    advisory: text
  });
  const humanRightsDefenseSchema = object({
    asOf: text,
    jurisdiction: text,
    jurisdictionDetails: hrJurisdictionSchema,
    humanRightsViolationVerdict: text,
    constructiveDismissalVerdict: text,
    summary: text,
    statuteOfLimitationsStatus: hrLimitationsSchema,
    statutoryViolations: array(hrViolationSchema),
    constructiveDismissalAudit: hrConstructiveDismissalSchema,
    damagesAssessment: hrDamagesSchema,
    retaliationProtection: hrRetaliationSchema,
    officialFormalDemandLetter: text,
    statutoryReferences: array(text)
  });
  response('/v1/tools/human-rights-defense', 'get', '200', humanRightsDefenseSchema);
  response('/v1/tools/human-rights-defense', 'post', '200', humanRightsDefenseSchema);

  const fhsaEvalSchema = object({
    isEligible: boolean,
    applicant1WithdrawalCad: number,
    applicant2WithdrawalCad: number,
    totalFhsaWithdrawalCad: number,
    estimatedDeductionTaxRefundCad: number,
    statute: text
  });
  const hbpEvalSchema = object({
    isEligible: boolean,
    maxPerPersonLimitCad: integer,
    applicant1WithdrawalCad: number,
    applicant2WithdrawalCad: number,
    totalHbpWithdrawalCad: number,
    annualRepaymentRequiredCad: number,
    repaymentGraceYears: integer,
    repaymentStartYear: integer,
    statute: text
  });
  const downPaymentUnlockedSchema = object({
    totalTaxFreeDownPaymentCad: number,
    combinedFhsaAndHbpRatio: number
  });
  const taxCreditsRebatesSchema = object({
    hbtcTaxSavingsCad: integer,
    lttRebateCad: number,
    lttRebateDetails: text,
    totalCombinedTaxAdvantageCad: number
  });
  const homebuyerTaxIncentivesSchema = object({
    asOf: text,
    province: text,
    city: text,
    homePurchasePriceCad: number,
    isFirstTimeHomeBuyer: boolean,
    marginalTaxRatePercent: integer,
    fhsaEvaluation: fhsaEvalSchema,
    hbpEvaluation: hbpEvalSchema,
    downPaymentUnlocked: downPaymentUnlockedSchema,
    taxCreditsAndRebates: taxCreditsRebatesSchema,
    strategicRecommendations: array(text),
    statutoryReferences: array(text)
  });
  response('/v1/tools/homebuyer-tax-incentives', 'get', '200', homebuyerTaxIncentivesSchema);
  response('/v1/tools/homebuyer-tax-incentives', 'post', '200', homebuyerTaxIncentivesSchema);

  const ratingTerritorySchema = object({
    territoryTier: text,
    isHighPremiumZone: boolean,
    estimatedAnnualPremiumWithoutCreditCad: integer,
    estimatedAnnualPremiumWithExperienceCreditCad: integer,
    estimatedAnnualSavingsCad: integer,
    savingsPercent: integer
  });
  const experienceLetterSchema = object({
    isLetterValid: boolean,
    eligibleDrivingYearsRecognized: integer,
    requiredLetterElements: array(text),
    insurersAcceptingForeignLetters: array(text)
  });
  const sabsBenefitsSchema = object({
    eligibleBenefitType: text,
    weeklyIncomeReplacementCad: number,
    grossWeeklyIncomeCad: number,
    statutoryWeeklyCeilingCad: integer,
    annualReplacementCad: number,
    waitingPeriodDays: integer,
    durationWeeks: integer,
    medicalRehabCoverageCad: integer,
    catastrophicCoverageCad: integer,
    optionalCoverageRecommendation: text
  });
  const takeAllComersSchema = object({
    isViolationSuspected: boolean,
    complaintAuthority: text,
    statutoryReference: text,
    stepsToEnforce: array(text)
  });
  const autoInsuranceSchema = object({
    asOf: text,
    province: text,
    postalCode: text,
    forwardSortationArea: text,
    ratingTerritoryAnalysis: ratingTerritorySchema,
    experienceLetterAudit: experienceLetterSchema,
    sabsAccidentBenefits: sabsBenefitsSchema,
    takeAllComersAudit: takeAllComersSchema,
    statutoryCitations: array(text),
    officialGuidance: array(text)
  });
  response('/v1/tools/auto-insurance', 'get', '200', autoInsuranceSchema);
  response('/v1/tools/auto-insurance', 'post', '200', autoInsuranceSchema);

  const probateTaxSchema = object({
    totalCanadianEstateValueCad: number,
    probateSubjectEstateValueCad: number,
    bypassedEstateValueCad: number,
    estimatedProbateTaxCad: number,
    potentialProbateSavingsCad: number,
    primaryAndSecondaryWillOpportunity: boolean
  });
  const foreignAssetsStrategySchema = object({
    hasForeignRisk: boolean,
    foreignCountry: text,
    situsDoctrineSummary: text,
    generalRevocationClauseTrap: text,
    recommendedWillStructure: text,
    crossBorderTaxGuidance: text
  });
  const nonResidentRiskSchema = object({
    isHighRisk: boolean,
    securityBondRequired: boolean,
    craNonResidentTrustTaxRisk: boolean,
    statutoryRemedy: text
  });
  const powerOfAttorneyAuditSchema = object({
    hasContinuingPowerOfAttorneyProperty: boolean,
    hasPowerOfAttorneyPersonalCare: boolean,
    nonResidentExecutorRisk: nonResidentRiskSchema
  });
  const intestacyRiskSchema = object({
    isIntestate: boolean,
    commonLawSpouseDisinheritanceRisk: boolean,
    statutoryDistributionSummary: text,
    minorGuardianshipRisk: text
  });
  const estatePlanningSchema = object({
    asOf: text,
    province: text,
    maritalStatus: text,
    probateTaxAnalysis: probateTaxSchema,
    foreignAssetsStrategy: foreignAssetsStrategySchema,
    powerOfAttorneyAudit: powerOfAttorneyAuditSchema,
    intestacyRiskAudit: intestacyRiskSchema,
    statutoryCitations: array(text),
    actionPlan: array(text)
  });
  response('/v1/tools/estate-planning', 'get', '200', estatePlanningSchema);
  response('/v1/tools/estate-planning', 'post', '200', estatePlanningSchema);

  const smallClaimsJurisdictionSchema = object({
    courtName: text,
    monetaryLimitCad: integer,
    isWithinSmallClaimsLimit: boolean,
    excessAmountCad: integer,
    abandonExcessRecommendation: text,
    exclusiveTribunalConflict: nullableText
  });
  const limitationAuditSchema = object({
    statutoryLimitationYears: integer,
    daysElapsedSinceIncident: integer,
    daysRemainingToSue: integer,
    isStatuteBarred: boolean,
    discoveryRuleAdvisory: text
  });
  const interestCostsSchema = object({
    principalClaimCad: number,
    effectivePrincipalCad: number,
    accruedPrejudgmentInterestCad: number,
    annualInterestRatePercent: number,
    estimatedCourtFilingFeeCad: integer,
    totalClaimableWithInterestCad: number
  });
  const demandLetterSchema = object({
    isRecommended: boolean,
    deadlineDays: integer,
    paymentDeadlineDate: text,
    letterSubject: text,
    letterBodyText: text
  });
  const smallClaimsSchema = object({
    asOf: text,
    province: text,
    jurisdictionAudit: smallClaimsJurisdictionSchema,
    limitationAudit: limitationAuditSchema,
    interestAndCostsCalculation: interestCostsSchema,
    formalDemandLetter: demandLetterSchema,
    statutoryCitations: array(text),
    proceduralSteps: array(text)
  });
  response('/v1/tools/small-claims', 'get', '200', smallClaimsSchema);
  response('/v1/tools/small-claims', 'post', '200', smallClaimsSchema);

  const vdpEligibilitySchema = object({
    isEligible: boolean,
    programTrack: text,
    summary: text
  });

  const vdpT1135AuditSchema = object({
    reportingThresholdCad: integer,
    taxpayerCostAmountCad: integer,
    exceedsThreshold: boolean,
    landingYear: integer,
    yearlyAudit: array(object({
      taxYear: integer,
      isLandingYear: boolean,
      isOverdue: boolean,
      t1135Required: boolean,
      exemptionReason: nullableText,
      potentialPenaltyCad: integer
    })),
    totalT1135PenaltyExposureCad: integer
  });

  const vdpTaxExposureSchema = object({
    totalUnreportedForeignIncomeCad: integer,
    totalUnreportedIncomeCad: integer,
    estimatedTaxOwingCad: integer,
    potentialGrossNegligencePenaltyCad: integer,
    totalPotentialPenaltiesWithoutVdpCad: integer
  });

  const vdpReliefScopeSchema = object({
    programTrack: text,
    penaltyReliefScope: text,
    interestReliefScope: text,
    criminalImmunityGranted: boolean,
    conditions: array(object({
      condition: text,
      met: boolean,
      detail: text
    }))
  });

  const vdpDeemedCostBaseSchema = object({
    statutoryBasis: text,
    rule: text,
    practicalImpact: text
  });

  const vdpActionStepSchema = object({
    step: integer,
    title: text,
    action: text
  });

  const craVdpSchema = object({
    eligibility: vdpEligibilitySchema,
    t1135Audit: vdpT1135AuditSchema,
    taxAndPenaltyExposure: vdpTaxExposureSchema,
    reliefScope: vdpReliefScopeSchema,
    deemedCostBaseRules: vdpDeemedCostBaseSchema,
    actionPlan: array(vdpActionStepSchema),
    warnings: array(text),
    statutoryCitations: array(text)
  });

  response('/v1/tools/cra-voluntary-disclosure', 'get', '200', craVdpSchema);
  response('/v1/tools/cra-voluntary-disclosure', 'post', '200', craVdpSchema);

  const statutoryPaySchema = object({
    province: text,
    hourlyRateCad: number,
    tenureYears: number,
    hoursAudit: object({
      totalHours: number,
      weeklyThreshold: number,
      regularHours: number,
      overtimeHours: number,
      regularWagesCad: number,
      overtimeWagesCad: number,
      grossEarnedWagesCad: number
    }),
    vacationPayAudit: object({
      tenureYears: number,
      isFiveYearTenure: boolean,
      statutoryVacationRatePercent: number,
      statutoryVacationPayAccruedCad: number,
      vacationPayPaidCad: number,
      underpaidVacationPayCad: number
    }),
    publicHolidayAudit: object({
      statutoryHolidaysInPeriod: integer,
      workedOnStatHoliday: boolean,
      hoursWorkedOnStatHoliday: number,
      publicHolidayPayCad: number,
      holidayPremiumPayCad: number,
      totalHolidayEntitlementCad: number,
      calculationBasis: text
    }),
    deductionsAudit: object({
      totalDeductionsCad: number,
      deductionReason: text,
      isDeductionUnlawful: boolean,
      statutoryViolationDetail: nullableText,
      recoverableDeductionCad: number
    }),
    wageClaimSummary: object({
      correctGrossStatutoryPayCad: number,
      totalRecoverableWageClaimCad: number,
      hasViableWageClaim: boolean
    }),
    actionPlan: array(object({
      step: integer,
      title: text,
      action: text
    })),
    warnings: array(text),
    statutoryCitations: array(text)
  });

  response('/v1/tools/statutory-pay', 'get', '200', statutoryPaySchema);
  response('/v1/tools/statutory-pay', 'post', '200', statutoryPaySchema);

  const consumerProtectionSchema = object({
    province: text,
    contractType: text,
    contractValueCad: number,
    timingAudit: object({
      contractDate: text,
      assessmentDate: text,
      daysElapsedSinceContract: integer,
      isWithinStandard10DayCoolingOff: boolean,
      isWithinExtended1YearDisclosurePeriod: boolean,
      isWithinUnfairPractice1YearPeriod: boolean
    }),
    doorToDoorBanAudit: object({
      wasUnsolicitedInHomeVisit: boolean,
      prescribedBannedProduct: boolean,
      isContractVoidAbInitio: boolean,
      violationDetail: nullableText
    }),
    cancellationRights: object({
      canCancelWithoutPenalty: boolean,
      cancellationWindowRemainingDays: integer,
      statutoryBasis: text
    }),
    unfairPracticesAudit: object({
      hasUnfairPractices: boolean,
      unfairPracticeType: text,
      statutoryFinding: nullableText
    }),
    statutoryNoticeLetter: text,
    actionPlan: array(object({
      step: integer,
      title: text,
      action: text
    })),
    warnings: array(text),
    statutoryCitations: array(text)
  });

  response('/v1/tools/consumer-protection', 'get', '200', consumerProtectionSchema);
  response('/v1/tools/consumer-protection', 'post', '200', consumerProtectionSchema);

  const familyLawSchema = object({
    province: text,
    maritalStatus: text,
    relationshipYears: number,
    childSupport: object({
      numberOfChildren: integer,
      parentingArrangement: text,
      monthlyTableAmountCad: integer,
      annualChildSupportCad: integer,
      statutoryBasis: text
    }),
    spousalSupport: object({
      isEligible: boolean,
      statusDetail: text,
      grossIncomeDifferenceAnnualCad: integer,
      monthlySupportRangeCad: object({
        low: integer,
        high: integer
      }),
      durationRangeYears: object({
        low: number,
        high: number,
        isIndefinite: boolean
      }),
      guidelinesFormula: text
    }),
    propertyEqualization: object({
      payerNfpCad: integer,
      recipientNfpCad: integer,
      equalizationPaymentCad: integer,
      payingParty: text,
      statutoryBasis: text
    }),
    newcomerSpecificAudits: object({
      hasForeignWorldwideAssets: boolean,
      foreignAssetRule: text,
      hasActiveSponsorshipUndertaking: boolean,
      sponsorshipLiabilityWarning: text
    }),
    actionPlan: array(object({
      step: integer,
      title: text,
      action: text
    })),
    warnings: array(text),
    statutoryCitations: array(text)
  });

  response('/v1/tools/family-law', 'get', '200', familyLawSchema);
  response('/v1/tools/family-law', 'post', '200', familyLawSchema);

  const sponsorshipDebtRiskSchema = {
    type: ['object', 'null'],
    properties: {
      isDefaultTriggered: boolean,
      undertakingYearsLeft: number,
      legalImpact: text
    },
    required: ['isDefaultTriggered', 'undertakingYearsLeft', 'legalImpact'],
    additionalProperties: false
  };

  const socialAssistanceSchema = object({
    program: text,
    immigrationStatus: text,
    eligibility: object({
      isStatusEligible: boolean,
      statusGuidance: text,
      isWithinAssetLimit: boolean,
      isOverallEligible: boolean
    }),
    assetAudit: object({
      liquidAssetsCad: integer,
      statutoryAssetLimitCad: integer,
      isWithinAssetLimit: boolean,
      excessAssetsCad: integer,
      primaryVehicle: object({
        valueCad: integer,
        isExempt: boolean,
        nonExemptValueCad: integer
      }),
      primaryResidenceExempt: boolean
    }),
    benefitCalculation: object({
      baseMaximumMonthlyBenefitCad: integer,
      grossEmploymentEarningsCad: integer,
      flatEarningsExemptionCad: integer,
      clawbackRatePercent: integer,
      netMonthlyDeductionCad: integer,
      estimatedMonthlyDisbursementCad: integer
    }),
    sponsorshipUndertakingImpact: sponsorshipDebtRiskSchema,
    actionPlan: array(object({
      step: integer,
      title: text,
      action: text
    })),
    warnings: array(text),
    statutoryCitations: array(text)
  });

  response('/v1/tools/social-assistance', 'get', '200', socialAssistanceSchema);
  response('/v1/tools/social-assistance', 'post', '200', socialAssistanceSchema);

  const tenancyRepairsSchema = object({
    province: text,
    governingTribunal: text,
    applicationForm: text,
    filingFeeCad: integer,
    monthlyRentCad: number,
    daysUnresolved: integer,
    outOfPocketExpensesCad: number,
    recognizedIssues: array(object({
      key: text,
      label: text,
      category: text,
      statutoryRef: text,
      severity: text,
      minAbatementPercent: number,
      maxAbatementPercent: number
    })),
    hasVitalServiceBreach: boolean,
    hasCriticalUrgency: boolean,
    hasWithheldRent: boolean,
    rentWithholdingRisk: text,
    abatementEstimate: object({
      minPercentage: number,
      maxPercentage: number,
      estimatedMinAbatementCad: number,
      estimatedMaxAbatementCad: number,
      totalPotentialRemedyMinCad: number,
      totalPotentialRemedyMaxCad: number
    }),
    legalWarnings: array(object({
      code: text,
      severity: text,
      title: text,
      message: text
    })),
    proceduralRemedies: array(object({
      step: integer,
      title: text,
      description: text
    })),
    noticeOfDisrepairDocument: text
  });

  response('/v1/tools/tenancy-repairs', 'get', '200', tenancyRepairsSchema);
  response('/v1/tools/tenancy-repairs', 'post', '200', tenancyRepairsSchema);

  const commercialLeaseSchema = object({
    province: text,
    tenantBusinessName: text,
    landlordName: text,
    premisesAddress: text,
    squareFootage: number,
    grossRentPerSqFtCad: number,
    financialOverview: object({
      baseRentMonthlyCad: number,
      additionalRentMonthlyCad: number,
      grossMonthlyRentCad: number,
      annualGrossRentCad: number,
      totalRemainingLeaseCommitmentCad: number
    }),
    personalGuaranteeLiability: object({
      hasPersonalGuarantee: boolean,
      personalGuaranteeExposureCad: number,
      remainingMonths: integer
    }),
    statutoryRisks: array(object({
      code: text,
      severity: text,
      title: text,
      message: text
    })),
    lockoutRiskLevel: text,
    distraintDoctrine: object({
      isAvailableToLandlord: boolean,
      statutoryBasis: text,
      criticalRule: text,
      tenantGoodsRights: text
    }),
    tmiAuditStrategy: object({
      disputedAmountCad: number,
      recommendedActions: array(text)
    }),
    assignmentRights: object({
      landlordRefused: boolean,
      statutoryGuidance: text,
      courtRemedy: text
    }),
    commercialDemandLetter: text
  });

  response('/v1/tools/commercial-lease', 'get', '200', commercialLeaseSchema);
  response('/v1/tools/commercial-lease', 'post', '200', commercialLeaseSchema);

  const employmentReferenceSchema = object({
    program: text,
    targetNoc: object({
      nocCode: text,
      nocTitle: text
    }),
    applicantName: text,
    employerName: text,
    roleTitle: text,
    hoursPerWeek: number,
    isFullTime: boolean,
    mandatoryElementsAudit: object({
      totalRequired: integer,
      satisfiedCount: integer,
      missingElements: array(text)
    }),
    corroborationAudit: object({
      corroborationTier: text,
      corroborationScore: integer,
      hasPayStubs: boolean,
      hasTaxDocuments: boolean,
      hasBankStatements: boolean,
      paymentMethod: text
    }),
    auditDeficiencies: array(object({
      code: text,
      severity: text,
      title: text,
      message: text
    })),
    complianceVerdict: text,
    overallComplianceScore: integer,
    standardCompliantLetterTemplate: text
  });

  response('/v1/tools/employment-reference', 'get', '200', employmentReferenceSchema);
  response('/v1/tools/employment-reference', 'post', '200', employmentReferenceSchema);

  const highCostCreditSchema = object({
    province: text,
    loanType: text,
    principalBorrowedCad: number,
    termDays: integer,
    feesChargedCad: number,
    statutoryMaxFeesCad: number,
    illegalOverchargeCad: number,
    statedAprPercent: number,
    defenseVerdict: text,
    withinCoolingOffPeriod: boolean,
    coolingOffDaysAllowed: integer,
    statutoryViolations: array(object({
      code: text,
      severity: text,
      title: text,
      message: text
    })),
    demandLetter: text
  });

  response('/v1/tools/high-cost-credit', 'get', '200', highCostCreditSchema);
  response('/v1/tools/high-cost-credit', 'post', '200', highCostCreditSchema);

  const pgwpEligibilitySchema = {
    type: 'object',
    properties: {
      applicantName: text,
      institutionName: text,
      assessmentDate: text,
      eligibleForPgwp: boolean,
      estimatedPgwpDurationMonths: integer,
      fieldOfStudyAudit: { type: 'object', additionalProperties: true },
      languageAudit: { type: 'object', additionalProperties: true },
      studyPermitGrandfathered: boolean,
      distanceLearningCompliant: boolean,
      violations: array(text),
      warnings: array(text),
      recommendations: array(text),
      statutoryReferences: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/pgwp-eligibility', 'get', '200', pgwpEligibilitySchema);
  response('/v1/tools/pgwp-eligibility', 'post', '200', pgwpEligibilitySchema);

  const crossBorderTaxSchema = {
    type: 'object',
    properties: {
      clientName: text,
      taxYear: integer,
      isCanadianTaxResident: boolean,
      assessmentDate: text,
      t1135Audit: { type: 'object', additionalProperties: true },
      usPersonAudit: { type: 'object', additionalProperties: true },
      prohibitedRegisteredAccountsAudit: { type: 'object', additionalProperties: true },
      canadianMutualFundsAudit: { type: 'object', additionalProperties: true },
      penaltiesCad: { type: 'object', additionalProperties: true },
      recommendations: array(text),
      statutoryReferences: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/cross-border-tax', 'get', '200', crossBorderTaxSchema);
  response('/v1/tools/cross-border-tax', 'post', '200', crossBorderTaxSchema);

  const workplaceSafetySchema = {
    type: 'object',
    properties: {
      workerName: text,
      employerName: text,
      province: text,
      assessmentDate: text,
      workRefusalAudit: { type: 'object', additionalProperties: true },
      reprisalAudit: { type: 'object', additionalProperties: true },
      wsibAudit: { type: 'object', additionalProperties: true },
      recommendations: array(text),
      statutoryReferences: array(text),
      formalRefusalNotice: text
    },
    additionalProperties: true
  };
  response('/v1/tools/workplace-safety', 'get', '200', workplaceSafetySchema);
  response('/v1/tools/workplace-safety', 'post', '200', workplaceSafetySchema);

  const tfwComplianceSchema = {
    type: 'object',
    properties: {
      workerName: text,
      employerName: text,
      stream: text,
      assessmentDate: text,
      wageAudit: { type: 'object', additionalProperties: true },
      hoursAudit: { type: 'object', additionalProperties: true },
      deductionsAudit: { type: 'object', additionalProperties: true },
      passportConfiscationAudit: { type: 'object', additionalProperties: true },
      housingAudit: { type: 'object', additionalProperties: true },
      totalIllegalDeductionsCad: number,
      violations: array(text),
      recommendations: array(text),
      statutoryReferences: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/tfw-compliance', 'get', '200', tfwComplianceSchema);
  response('/v1/tools/tfw-compliance', 'post', '200', tfwComplianceSchema);

  const healthcarePortabilitySchema = {
    type: 'object',
    properties: {
      applicantName: text,
      targetProvince: text,
      assessmentDate: text,
      waitingPeriodAudit: { type: 'object', additionalProperties: true },
      interprovincialPortabilityAudit: { type: 'object', additionalProperties: true },
      ifhpAudit: { type: 'object', additionalProperties: true },
      ispaAudit: { type: 'object', additionalProperties: true },
      immediateNextSteps: array(text),
      statutoryReferences: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/healthcare-portability', 'get', '200', healthcarePortabilitySchema);
  response('/v1/tools/healthcare-portability', 'post', '200', healthcarePortabilitySchema);

  const realEstateAssignmentSchema = {
    type: 'object',
    properties: {
      assignorName: text,
      assigneeName: text,
      propertyAddress: text,
      province: text,
      financialSummary: { type: 'object', additionalProperties: true },
      antiFlippingAudit: { type: 'object', additionalProperties: true },
      taxLiabilityEstimate: { type: 'object', additionalProperties: true },
      tarionWarranty: { type: 'object', additionalProperties: true },
      taxNotes: array(text),
      riskWarnings: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/real-estate-assignment', 'get', '200', realEstateAssignmentSchema);
  response('/v1/tools/real-estate-assignment', 'post', '200', realEstateAssignmentSchema);

  const oasGisSchema = {
    type: 'object',
    properties: {
      applicantName: text,
      assessmentDate: text,
      oasEligibility: { type: 'object', additionalProperties: true },
      gisEligibility: { type: 'object', additionalProperties: true },
      totalization: { type: 'object', additionalProperties: true },
      oasClawback: { type: 'object', additionalProperties: true },
      statutoryNotes: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/oas-gis', 'get', '200', oasGisSchema);
  response('/v1/tools/oas-gis', 'post', '200', oasGisSchema);

  const criminalRehabSchema = {
    type: 'object',
    properties: {
      applicantName: text,
      assessmentDate: text,
      offenseAudit: { type: 'object', additionalProperties: true },
      deemedRehabilitation: { type: 'object', additionalProperties: true },
      individualRehabilitation: { type: 'object', additionalProperties: true },
      temporaryResidentPermit: { type: 'object', additionalProperties: true },
      statutoryNotes: array(text),
      riskWarnings: array(text),
      documentChecklist: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/criminal-rehab', 'get', '200', criminalRehabSchema);
  response('/v1/tools/criminal-rehab', 'post', '200', criminalRehabSchema);

  const franchiseDisclosureSchema = {
    type: 'object',
    properties: {
      franchiseeName: text,
      franchisorName: text,
      province: text,
      statuteName: text,
      disclosureAudit: { type: 'object', additionalProperties: true },
      rescissionRemedies: { type: 'object', additionalProperties: true },
      statutoryRestitution: { type: 'object', additionalProperties: true },
      deficienciesIdentified: array(text),
      statutoryProtections: array(text),
      formalRescissionNotice: text
    },
    additionalProperties: true
  };
  response('/v1/tools/franchise-disclosure', 'get', '200', franchiseDisclosureSchema);
  response('/v1/tools/franchise-disclosure', 'post', '200', franchiseDisclosureSchema);

  const sowpEligibilitySchema = {
    type: 'object',
    properties: {
      applicantName: text,
      principalName: text,
      relationshipAudit: { type: 'object', additionalProperties: true },
      streamAudit: { type: 'object', additionalProperties: true },
      overallEligible: boolean,
      summaryStatus: text,
      reasons: array(text),
      statutoryBasis: text,
      documentChecklist: array(text),
      strategicAdvice: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/sowp-eligibility', 'get', '200', sowpEligibilitySchema);
  response('/v1/tools/sowp-eligibility', 'post', '200', sowpEligibilitySchema);

  const eiDisqualificationSchema = {
    type: 'object',
    properties: {
      applicantName: text,
      employerName: text,
      assessmentDate: text,
      regularBenefits: { type: 'object', additionalProperties: true },
      justCauseAudit: { type: 'object', additionalProperties: true },
      misconductAudit: { type: 'object', additionalProperties: true },
      separationMoniesAllocation: { type: 'object', additionalProperties: true },
      specialBenefitsOverride: { type: 'object', additionalProperties: true },
      defenseArguments: array(text),
      statutoryNotes: array(text),
      riskWarnings: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/ei-disqualification', 'get', '200', eiDisqualificationSchema);
  response('/v1/tools/ei-disqualification', 'post', '200', eiDisqualificationSchema);

  const ruralRenewalSchema = {
    type: 'object',
    properties: {
      applicantName: text,
      streamType: text,
      designatedCommunity: { type: 'object', additionalProperties: true },
      assessmentDate: text,
      overallEligible: boolean,
      summaryTitle: text,
      compliancePoints: array(text),
      deficiencies: array(text),
      roadmapSteps: array(text),
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/rural-renewal', 'get', '200', ruralRenewalSchema);
  response('/v1/tools/rural-renewal', 'post', '200', ruralRenewalSchema);

  const speculationTaxSchema = {
    type: 'object',
    properties: {
      ownerName: text,
      propertyAddress: text,
      province: text,
      propertyValuationCad: number,
      isTaxExempt: boolean,
      applicableExemption: nullableText,
      taxRatePercent: number,
      grossTaxPayableCad: number,
      netTaxPayableCad: number,
      ontarioNrstRebate: { type: 'object', additionalProperties: true },
      statutoryNotes: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/speculation-tax-rebate', 'get', '200', speculationTaxSchema);
  response('/v1/tools/speculation-tax-rebate', 'post', '200', speculationTaxSchema);

  const childWelfareSchema = {
    type: 'object',
    properties: {
      youthName: text,
      pathway: text,
      assessmentDate: text,
      summaryTitle: text,
      isVysaEligible: boolean,
      isKinshipPriority: boolean,
      isDirectCitizenshipGrantEligible: boolean,
      compliancePoints: array(text),
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text),
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/child-welfare-guardianship', 'get', '200', childWelfareSchema);
  response('/v1/tools/child-welfare-guardianship', 'post', '200', childWelfareSchema);

  const excessiveDemandSchema = {
    type: 'object',
    properties: {
      applicantName: text,
      diagnosedCondition: text,
      immigrationStream: text,
      assessmentDate: text,
      admissibilityStatus: text,
      summaryTitle: text,
      costAssessment: { type: 'object', additionalProperties: true },
      pflAudit: { type: 'object', additionalProperties: true },
      mitigationViability: { type: 'object', additionalProperties: true },
      statutoryNotes: array(text),
      riskWarnings: array(text),
      requiredDocuments: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/excessive-demand-mitigation', 'get', '200', excessiveDemandSchema);
  response('/v1/tools/excessive-demand-mitigation', 'post', '200', excessiveDemandSchema);

  const francophoneMobilitySchema = {
    type: 'object',
    properties: {
      applicantName: text,
      employerName: text,
      province: text,
      lmiaExemptionCode: text,
      assessmentDate: text,
      overallEligible: boolean,
      summaryTitle: text,
      languageAudit: { type: 'object', additionalProperties: true },
      jobAudit: { type: 'object', additionalProperties: true },
      compliancePoints: array(text),
      deficiencies: array(text),
      riskWarnings: array(text),
      requiredSteps: array(text),
      statutoryNotes: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/francophone-mobility', 'get', '200', francophoneMobilitySchema);
  response('/v1/tools/francophone-mobility', 'post', '200', francophoneMobilitySchema);

  const digitalPlatformWorkerSchema = {
    type: 'object',
    properties: {
      workerName: text,
      platformName: text,
      province: text,
      workerType: text,
      governingLegislation: text,
      assessmentDate: text,
      summaryTitle: text,
      wageAudit: { type: 'object', additionalProperties: true },
      restitutionSummary: { type: 'object', additionalProperties: true },
      deplatformingAudit: { type: 'object', additionalProperties: true },
      foreignArbitrationPrecluded: boolean,
      violations: array(text),
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/digital-platform-worker', 'get', '200', digitalPlatformWorkerSchema);
  response('/v1/tools/digital-platform-worker', 'post', '200', digitalPlatformWorkerSchema);

  const atlanticImmigrationSchema = {
    type: 'object',
    properties: {
      candidateName: text,
      province: text,
      stream: text,
      nocTeer: integer,
      overallEligible: boolean,
      summaryTitle: text,
      jobOfferAudit: { type: 'object', additionalProperties: true },
      languageAudit: { type: 'object', additionalProperties: true },
      settlementFundsAudit: { type: 'object', additionalProperties: true },
      compliancePoints: array(text),
      deficiencies: array(text),
      riskWarnings: array(text),
      requiredSteps: array(text),
      statutoryNotes: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/atlantic-immigration', 'get', '200', atlanticImmigrationSchema);
  response('/v1/tools/atlantic-immigration', 'post', '200', atlanticImmigrationSchema);

  const childcareSubsidySchema = {
    type: 'object',
    properties: {
      applicantName: text,
      province: text,
      municipality: text,
      assessmentDate: text,
      adjustedFamilyNetIncomeCad: number,
      childrenCount: integer,
      summaryTitle: text,
      subsidyCalculation: { type: 'object', additionalProperties: true },
      childAudits: array({ type: 'object', additionalProperties: true }),
      compliancePoints: array(text),
      statutoryNotes: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/childcare-subsidy', 'get', '200', childcareSubsidySchema);
  response('/v1/tools/childcare-subsidy', 'post', '200', childcareSubsidySchema);

  const bcStrataBylawSchema = {
    type: 'object',
    properties: {
      residentName: text,
      strataPlanNumber: text,
      unitNumber: text,
      disputeType: text,
      assessmentDate: text,
      summaryTitle: text,
      isBylawEnforceable: boolean,
      unlawfulFineRefundCad: number,
      violations: array(text),
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text),
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/bc-strata-bylaw', 'get', '200', bcStrataBylawSchema);
  response('/v1/tools/bc-strata-bylaw', 'post', '200', bcStrataBylawSchema);

  const prCardRenewalSchema = {
    type: 'object',
    properties: {
      applicantName: text,
      assessmentDate: text,
      isCurrentlyInsideCanada: boolean,
      residencyAssessment: { type: 'object', additionalProperties: true },
      urgentProcessing: { type: 'object', additionalProperties: true },
      applicationPathway: { type: 'object', additionalProperties: true },
      statutoryProtections: array(text),
      riskWarnings: array(text),
      requiredDocuments: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/pr-card-renewal', 'get', '200', prCardRenewalSchema);
  response('/v1/tools/pr-card-renewal', 'post', '200', prCardRenewalSchema);

  const foreignWorkerTransitionSchema = {
    type: 'object',
    properties: {
      workerName: text,
      assessmentDate: text,
      currentPermitRunway: { type: 'object', additionalProperties: true },
      streamClassification: { type: 'object', additionalProperties: true },
      lmiaAudit: { type: 'object', additionalProperties: true },
      viablePathways: array({ type: 'object', additionalProperties: true }),
      statutoryProtections: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/foreign-worker-transition', 'get', '200', foreignWorkerTransitionSchema);
  response('/v1/tools/foreign-worker-transition', 'post', '200', foreignWorkerTransitionSchema);

  const childDisabilityBenefitSchema = {
    type: 'object',
    properties: {
      beneficiaryName: text,
      parentName: text,
      assessmentDate: text,
      dtcStatus: { type: 'object', additionalProperties: true },
      childDisabilityBenefit: { type: 'object', additionalProperties: true },
      rdspEntitlements: { type: 'object', additionalProperties: true },
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/child-disability-benefit', 'get', '200', childDisabilityBenefitSchema);
  response('/v1/tools/child-disability-benefit', 'post', '200', childDisabilityBenefitSchema);

  const albertaSecurityDepositSchema = {
    type: 'object',
    properties: {
      tenantName: text,
      landlordName: text,
      rentalUnitAddress: text,
      assessmentDate: text,
      depositAudit: { type: 'object', additionalProperties: true },
      inspectionCompliance: { type: 'object', additionalProperties: true },
      refundAssessment: { type: 'object', additionalProperties: true },
      statutoryViolations: array(text),
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/alberta-security-deposit', 'get', '200', albertaSecurityDepositSchema);
  response('/v1/tools/alberta-security-deposit', 'post', '200', albertaSecurityDepositSchema);

  const internationallyTrainedNurseSchema = {
    type: 'object',
    properties: {
      nurseName: text,
      assessmentDate: text,
      targetProvince: text,
      nursingDesignation: text,
      countryOfEducation: text,
      nnasEvaluation: { type: 'object', additionalProperties: true },
      regulatoryRequirements: { type: 'object', additionalProperties: true },
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/internationally-trained-nurse', 'get', '200', internationallyTrainedNurseSchema);
  response('/v1/tools/internationally-trained-nurse', 'post', '200', internationallyTrainedNurseSchema);

  const studyPermitCapPalSchema = {
    type: 'object',
    properties: {
      studyLevel: text,
      province: text,
      isExemptFromCapAndPal: boolean,
      requiresPal: boolean,
      palGuidance: text,
      financialRequirementCad: number,
      liquidFundsAvailableCad: number,
      financialShortfallCad: number,
      isFinanciallySufficient: boolean,
      statutoryLegalBasis: text,
      explanation: text,
      documentationChecklist: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/study-permit-cap-pal', 'get', '200', studyPermitCapPalSchema);
  response('/v1/tools/study-permit-cap-pal', 'post', '200', studyPermitCapPalSchema);

  const visitorVisaTiesSchema = {
    type: 'object',
    properties: {
      score: integer,
      riskLevel: text,
      isStrongApplication: boolean,
      positiveFactors: array(text),
      riskFactors: array(text),
      statutoryLegalBasis: text,
      officerAssessmentSummary: text,
      dualIntentStatus: text,
      mitigationActionPlan: array(text),
      recommendedDocuments: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/visitor-visa-financial-ties', 'get', '200', visitorVisaTiesSchema);
  response('/v1/tools/visitor-visa-financial-ties', 'post', '200', visitorVisaTiesSchema);

  const lmiaReadinessSchema = {
    type: 'object',
    properties: {
      isLmiaExempt: boolean,
      exemptionCodeClaimed: text,
      exemptionAssessment: text,
      streamClassification: text,
      provincialMedianWageCad: number,
      isHighWage: boolean,
      esdcRefusalToProcessHazard: boolean,
      tfwCapCompliant: boolean,
      advertisingRequirement: text,
      statutoryAuthority: text,
      auditVerdict: text,
      documentationChecklist: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/lmia-readiness', 'get', '200', lmiaReadinessSchema);
  response('/v1/tools/lmia-readiness', 'post', '200', lmiaReadinessSchema);

  const sinHealthcareSchema = {
    type: 'object',
    properties: {
      sinEvaluation: { type: 'object', additionalProperties: true },
      provincialHealthcare: { type: 'object', additionalProperties: true },
      statutoryAuthority: text,
      checklist: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/sin-healthcare', 'get', '200', sinHealthcareSchema);
  response('/v1/tools/sin-healthcare', 'post', '200', sinHealthcareSchema);

  const albertaOpportunityStreamSchema = {
    type: 'object',
    properties: {
      candidateName: text,
      assessmentDate: text,
      overallVerdict: text,
      isAosEligible: boolean,
      workPermitAudit: { type: 'object', additionalProperties: true },
      workExperienceAudit: { type: 'object', additionalProperties: true },
      languageAudit: { type: 'object', additionalProperties: true },
      occupationAudit: { type: 'object', additionalProperties: true },
      eligibleStreams: array({ type: 'object', additionalProperties: true }),
      violationsAndBars: array(text),
      statutoryProtections: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/alberta-opportunity-stream', 'get', '200', albertaOpportunityStreamSchema);
  response('/v1/tools/alberta-opportunity-stream', 'post', '200', albertaOpportunityStreamSchema);

  const bcSpeculationTaxDeclarationSchema = {
    type: 'object',
    properties: {
      ownerName: text,
      assessmentDate: text,
      taxYear: text,
      propertyRegion: text,
      isTaxableRegion: boolean,
      assessedPropertyValueCad: number,
      applicableTaxRatePercent: number,
      isSatelliteFamily: boolean,
      propertyUseCategory: text,
      isExemptFromSvt: boolean,
      exemptionReason: text,
      statutoryAuthority: text,
      estimatedTaxLiabilityCad: number,
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/bc-speculation-tax-declaration', 'get', '200', bcSpeculationTaxDeclarationSchema);
  response('/v1/tools/bc-speculation-tax-declaration', 'post', '200', bcSpeculationTaxDeclarationSchema);

  const prtdHumanitarianSchema = {
    type: 'object',
    properties: {
      applicantName: text,
      assessmentDate: text,
      residencyOverview: { type: 'object', additionalProperties: true },
      humanitarianAssessment: { type: 'object', additionalProperties: true },
      appealRights: { type: 'object', additionalProperties: true },
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/prtd-humanitarian', 'get', '200', prtdHumanitarianSchema);
  response('/v1/tools/prtd-humanitarian', 'post', '200', prtdHumanitarianSchema);

  const severanceReasonableNoticeSchema = {
    type: 'object',
    properties: {
      employeeName: text,
      assessmentDate: text,
      province: text,
      serviceYears: number,
      employeeAge: integer,
      annualSalaryCad: number,
      weeklyWageCad: number,
      statutoryEsaAudit: { type: 'object', additionalProperties: true },
      commonLawAssessment: { type: 'object', additionalProperties: true },
      enforceabilityAudit: { type: 'object', additionalProperties: true },
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/severance-reasonable-notice', 'get', '200', severanceReasonableNoticeSchema);
  response('/v1/tools/severance-reasonable-notice', 'post', '200', severanceReasonableNoticeSchema);

  const manitobaPnpSkilledWorkerSchema = {
    type: 'object',
    properties: {
      candidateName: text,
      assessmentDate: text,
      streamVerdict: text,
      isStreamEligible: boolean,
      eoiScoreSummary: { type: 'object', additionalProperties: true },
      employmentAudit: { type: 'object', additionalProperties: true },
      statutoryProtections: array(text),
      riskWarnings: array(text),
      actionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/manitoba-pnp-skilled-worker', 'get', '200', manitobaPnpSkilledWorkerSchema);
  response('/v1/tools/manitoba-pnp-skilled-worker', 'post', '200', manitobaPnpSkilledWorkerSchema);

  response('/v1/metrics', 'get', '200', object({ prometheus: text }));
  response('/v1/realtime/subscriptions', 'get', '200', { type: 'object', properties: { subscriptions: array({ type: 'object', additionalProperties: true }) }, additionalProperties: true });
  response('/v1/realtime/subscriptions', 'post', '200', { type: 'object', properties: { id: text, targetUrl: text, status: text }, additionalProperties: true });
  response('/v1/tools/study-to-pr', 'get', '200', { type: 'object', properties: { pathwaySummary: text, eligiblePrograms: array(text), recommendations: array(text) }, additionalProperties: true });
  response('/v1/tools/study-to-pr', 'post', '200', { type: 'object', properties: { pathwaySummary: text, eligiblePrograms: array(text), recommendations: array(text) }, additionalProperties: true });
  response('/v1/tools/gcms-analyzer', 'get', '200', { type: 'object', properties: { analyzedRefusalCodes: array(text), remedies: array({ type: 'object', additionalProperties: true }) }, additionalProperties: true });
  response('/v1/tools/gcms-analyzer', 'post', '200', { type: 'object', properties: { analyzedRefusalCodes: array(text), remedies: array({ type: 'object', additionalProperties: true }) }, additionalProperties: true });
  response('/v1/tools/sinp-hard-to-fill', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, deficiencies: array(text), compliancePoints: array(text) }, additionalProperties: true });
  response('/v1/tools/sinp-hard-to-fill', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, deficiencies: array(text), compliancePoints: array(text) }, additionalProperties: true });
  response('/v1/tools/esa-reprisal-defense', 'get', '200', { type: 'object', properties: { reprisalRiskScore: integer, isReverseBurdenTriggered: { type: 'boolean' }, isWithinLimitationPeriod: { type: 'boolean' }, findings: array(text) }, additionalProperties: true });
  response('/v1/tools/esa-reprisal-defense', 'post', '200', { type: 'object', properties: { reprisalRiskScore: integer, isReverseBurdenTriggered: { type: 'boolean' }, isWithinLimitationPeriod: { type: 'boolean' }, findings: array(text) }, additionalProperties: true });
  response('/v1/tools/bc-svt-appeal', 'get', '200', { type: 'object', properties: { isWithin90Days: { type: 'boolean' }, daysElapsed: integer, daysRemaining: integer, objectionStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-svt-appeal', 'post', '200', { type: 'object', properties: { isWithin90Days: { type: 'boolean' }, daysElapsed: integer, daysRemaining: integer, objectionStatus: text }, additionalProperties: true });
  response('/v1/tools/express-entry-tie-break', 'get', '200', { type: 'object', properties: { currentScore: integer, simulatedRound: { type: 'object', additionalProperties: true }, categoryAudit: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/express-entry-tie-break', 'post', '200', { type: 'object', properties: { currentScore: integer, simulatedRound: { type: 'object', additionalProperties: true }, categoryAudit: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/calgary-suite-amnesty', 'get', '200', { type: 'object', properties: { isCodeCompliant: { type: 'boolean' }, isRegisteredOnCalgaryRegistry: { type: 'boolean' }, registryReadinessStatus: text }, additionalProperties: true });
  response('/v1/tools/calgary-suite-amnesty', 'post', '200', { type: 'object', properties: { isCodeCompliant: { type: 'boolean' }, isRegisteredOnCalgaryRegistry: { type: 'boolean' }, registryReadinessStatus: text }, additionalProperties: true });
  response('/v1/tools/esa-constructive-layoff', 'get', '200', { type: 'object', properties: { legalVerdict: text, isEsaLayoffPermissible: { type: 'boolean' }, hasExceededEsaThreshold: { type: 'boolean' }, isCommonLawConstructiveDismissal: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/esa-constructive-layoff', 'post', '200', { type: 'object', properties: { legalVerdict: text, isEsaLayoffPermissible: { type: 'boolean' }, hasExceededEsaThreshold: { type: 'boolean' }, isCommonLawConstructiveDismissal: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/nsnp-experience', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, deficiencies: array(text), compliancePoints: array(text) }, additionalProperties: true });
  response('/v1/tools/nsnp-experience', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, deficiencies: array(text), compliancePoints: array(text) }, additionalProperties: true });
  response('/v1/tools/quebec-peq-worker', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, principalFrenchOral: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/quebec-peq-worker', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, principalFrenchOral: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/alberta-commercial-distress', 'get', '200', { type: 'object', properties: { legalVerdict: text, isWithinObjectionWindow: { type: 'boolean' }, civilViolations: array(text) }, additionalProperties: true });
  response('/v1/tools/alberta-commercial-distress', 'post', '200', { type: 'object', properties: { legalVerdict: text, isWithinObjectionWindow: { type: 'boolean' }, civilViolations: array(text) }, additionalProperties: true });
  response('/v1/tools/trp-inadmissibility', 'get', '200', { type: 'object', properties: { isBalanceFavourable: { type: 'boolean' }, recommendationVerdict: text, prPathwayPermitHolderClass: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/trp-inadmissibility', 'post', '200', { type: 'object', properties: { isBalanceFavourable: { type: 'boolean' }, recommendationVerdict: text, prPathwayPermitHolderClass: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/cra-newcomer-wealth', 'get', '200', { type: 'object', properties: { summary: text }, additionalProperties: true });
  response('/v1/tools/cra-newcomer-wealth', 'post', '200', { type: 'object', properties: { summary: text }, additionalProperties: true });
  response('/v1/tools/ontario-bc-tenancy', 'get', '200', { type: 'object', properties: { legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/ontario-bc-tenancy', 'post', '200', { type: 'object', properties: { legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/global-expat', 'get', '200', { type: 'object', properties: { summary: text }, additionalProperties: true });
  response('/v1/tools/global-expat', 'post', '200', { type: 'object', properties: { summary: text }, additionalProperties: true });
  response('/v1/tools/canada-status-admissibility', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/canada-status-admissibility', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/federal-skilled-trades', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, isTradeNoc: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/federal-skilled-trades', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, isTradeNoc: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/bc-strata-ev-charging', 'get', '200', { type: 'object', properties: { legalVerdict: text, isPastThreeMonthDeadline: { type: 'boolean' }, isUnreasonableRefusal: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/bc-strata-ev-charging', 'post', '200', { type: 'object', properties: { legalVerdict: text, isPastThreeMonthDeadline: { type: 'boolean' }, isUnreasonableRefusal: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/on-pay-transparency', 'get', '200', { type: 'object', properties: { legalVerdict: text, statutoryViolations: array(text), canadianExperienceProhibitionCompliant: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/on-pay-transparency', 'post', '200', { type: 'object', properties: { legalVerdict: text, statutoryViolations: array(text), canadianExperienceProhibitionCompliant: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/yukon-critical-impact', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, isCommunityPilotEndorsed: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/yukon-critical-impact', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityStatus: text, isCommunityPilotEndorsed: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/tfw-employer-transition', 'get', '200', { type: 'object', properties: { legalVerdict: text, statusCategory: text, canLegallyWorkForNewEmployer: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/tfw-employer-transition', 'post', '200', { type: 'object', properties: { legalVerdict: text, statusCategory: text, canLegallyWorkForNewEmployer: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/tools/pei-occupations-demand', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/pei-occupations-demand', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/bc-esa-group-termination', 'get', '200', { type: 'object', properties: { isSection64GroupTermination: { type: 'boolean' }, complianceStatus: text, affectedEmployeesCount: integer }, additionalProperties: true });
  response('/v1/tools/bc-esa-group-termination', 'post', '200', { type: 'object', properties: { isSection64GroupTermination: { type: 'boolean' }, complianceStatus: text, affectedEmployeesCount: integer }, additionalProperties: true });
  response('/v1/tools/start-up-visa', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, designatedEntityType: text }, additionalProperties: true });
  response('/v1/tools/start-up-visa', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, designatedEntityType: text }, additionalProperties: true });
  response('/v1/tools/ontario-tenancy-assignment', 'get', '200', { type: 'object', properties: { legalVerdict: text, requestType: text, rightsAssessment: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/ontario-tenancy-assignment', 'post', '200', { type: 'object', properties: { legalVerdict: text, requestType: text, rightsAssessment: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/nbpnp-skilled-worker', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, pointsSummary: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/nbpnp-skilled-worker', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, pointsSummary: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/self-employed-persons', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, program: text }, additionalProperties: true });
  response('/v1/tools/self-employed-persons', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, program: text }, additionalProperties: true });
  response('/v1/tools/alberta-overtime-banking', 'get', '200', { type: 'object', properties: { complianceStatus: text, isExemptFromOvertime: { type: 'boolean' }, hoursAudit: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/alberta-overtime-banking', 'post', '200', { type: 'object', properties: { complianceStatus: text, isExemptFromOvertime: { type: 'boolean' }, hoursAudit: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/ontario-roommate-rights', 'get', '200', { type: 'object', properties: { isRtaCovered: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/ontario-roommate-rights', 'post', '200', { type: 'object', properties: { isRtaCovered: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/sinp-tech-talent', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/sinp-tech-talent', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/caregiver-direct-pr', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/caregiver-direct-pr', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/citizenship-revocation', 'get', '200', { type: 'object', properties: { procedure: text, defensibilityStatus: text, proceduralAudit: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/citizenship-revocation', 'post', '200', { type: 'object', properties: { procedure: text, defensibilityStatus: text, proceduralAudit: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/tools/bc-roommate-rights', 'get', '200', { type: 'object', properties: { isRtaCovered: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/bc-roommate-rights', 'post', '200', { type: 'object', properties: { isRtaCovered: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-rural-entrepreneur', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/alberta-rural-entrepreneur', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/refugee-cessation', 'get', '200', { type: 'object', properties: { isExemptFromIrpaCessation: { type: 'boolean' }, cessationRiskLevel: text }, additionalProperties: true });
  response('/v1/tools/refugee-cessation', 'post', '200', { type: 'object', properties: { isExemptFromIrpaCessation: { type: 'boolean' }, cessationRiskLevel: text }, additionalProperties: true });
  response('/v1/tools/on-remote-work-jurisdiction', 'get', '200', { type: 'object', properties: { hasOntarioEsaJurisdiction: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/on-remote-work-jurisdiction', 'post', '200', { type: 'object', properties: { hasOntarioEsaJurisdiction: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/manitoba-leave', 'get', '200', { type: 'object', properties: { isEligibleForLeave: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/manitoba-leave', 'post', '200', { type: 'object', properties: { isEligibleForLeave: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-tenancy-sublease', 'get', '200', { type: 'object', properties: { transactionType: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-tenancy-sublease', 'post', '200', { type: 'object', properties: { transactionType: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/francophone-community-pilot', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/francophone-community-pilot', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text, stream: text }, additionalProperties: true });
  response('/v1/tools/bc-child-youth-employment', 'get', '200', { type: 'object', properties: { isCompliant: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/bc-child-youth-employment', 'post', '200', { type: 'object', properties: { isCompliant: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/on-creed-accommodation', 'get', '200', { type: 'object', properties: { isHumanRightsBreachDetected: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/on-creed-accommodation', 'post', '200', { type: 'object', properties: { isHumanRightsBreachDetected: { type: 'boolean' }, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/citizenship-residence-audit', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/citizenship-residence-audit', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/quebec-csq-arrima', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, totalScore: integer, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/quebec-csq-arrima', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, totalScore: integer, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-rest-periods', 'get', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-rest-periods', 'post', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/bc-strata-str', 'get', '200', { type: 'object', properties: { areFinesLegallyEnforceable: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-strata-str', 'post', '200', { type: 'object', properties: { areFinesLegallyEnforceable: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/on-tha-licensing', 'get', '200', { type: 'object', properties: { isLicensingLawful: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/on-tha-licensing', 'post', '200', { type: 'object', properties: { isLicensingLawful: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-ict-work-permit', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-ict-work-permit', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/saskatchewan-layoff-notice', 'get', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/saskatchewan-layoff-notice', 'post', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-abandoned-goods', 'get', '200', { type: 'object', properties: { isAbove2000Threshold: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-abandoned-goods', 'post', '200', { type: 'object', properties: { isAbove2000Threshold: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-uniform-deductions', 'get', '200', { type: 'object', properties: { totalUnlawfulDeductionsCad: { type: 'number' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-uniform-deductions', 'post', '200', { type: 'object', properties: { totalUnlawfulDeductionsCad: { type: 'number' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/visitor-extension-restoration', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, statusClassification: text }, additionalProperties: true });
  response('/v1/tools/visitor-extension-restoration', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, statusClassification: text }, additionalProperties: true });
  response('/v1/tools/bc-pnp-tech', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/bc-pnp-tech', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/ontario-temp-layoff', 'get', '200', { type: 'object', properties: { isDeemedTerminatedUnderEsa: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/ontario-temp-layoff', 'post', '200', { type: 'object', properties: { isDeemedTerminatedUnderEsa: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-c10-significant-benefit', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, strengthScoreOutOf100: integer, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-c10-significant-benefit', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, strengthScoreOutOf100: integer, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-just-cause', 'get', '200', { type: 'object', properties: { isJustCauseEstablished: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-just-cause', 'post', '200', { type: 'object', properties: { isJustCauseEstablished: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/manitoba-rent-increase', 'get', '200', { type: 'object', properties: { isExemptFromGuideline: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/manitoba-rent-increase', 'post', '200', { type: 'object', properties: { isExemptFromGuideline: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-c20-reciprocal-work', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-c20-reciprocal-work', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/bc-landlord-use-eviction', 'get', '200', { type: 'object', properties: { isBadFaithPenaltyPayable: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-landlord-use-eviction', 'post', '200', { type: 'object', properties: { isBadFaithPenaltyPayable: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/ontario-severance-payroll', 'get', '200', { type: 'object', properties: { isEligibleForSeverance: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/ontario-severance-payroll', 'post', '200', { type: 'object', properties: { isEligibleForSeverance: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-landlord-entry', 'get', '200', { type: 'object', properties: { isEntryPermitted: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-landlord-entry', 'post', '200', { type: 'object', properties: { isEntryPermitted: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-dual-intent', 'get', '200', { type: 'object', properties: { isDualIntentStatutorilyProtected: { type: 'boolean' }, riskTier: text }, additionalProperties: true });
  response('/v1/tools/federal-dual-intent', 'post', '200', { type: 'object', properties: { isDualIntentStatutorilyProtected: { type: 'boolean' }, riskTier: text }, additionalProperties: true });
  response('/v1/tools/federal-c11-entrepreneur-work-permit', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-c11-entrepreneur-work-permit', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-employment-maternity-parental-leave', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-employment-maternity-parental-leave', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/ontario-residential-tenancy-urgent-repairs-t6', 'get', '200', { type: 'object', properties: { hasBreach: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/ontario-residential-tenancy-urgent-repairs-t6', 'post', '200', { type: 'object', properties: { hasBreach: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/british-columbia-employment-illness-injury-leave', 'get', '200', { type: 'object', properties: { meets90DayThreshold: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/british-columbia-employment-illness-injury-leave', 'post', '200', { type: 'object', properties: { meets90DayThreshold: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-francophone-mobility-c16', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-francophone-mobility-c16', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-bowp-pr-acknowledgement', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-bowp-pr-acknowledgement', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/ontario-rent-deposit-interest', 'get', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/ontario-rent-deposit-interest', 'post', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-general-holiday-pay', 'get', '200', { type: 'object', properties: { isEligibleForHolidayPay: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-general-holiday-pay', 'post', '200', { type: 'object', properties: { isEligibleForHolidayPay: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-strata-depreciation-crf', 'get', '200', { type: 'object', properties: { isMandatoryReportStrata: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-strata-depreciation-crf', 'post', '200', { type: 'object', properties: { isMandatoryReportStrata: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-fta-professional-work-permit', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-fta-professional-work-permit', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/ontario-employment-reprisal', 'get', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/ontario-employment-reprisal', 'post', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/bc-security-deposit-double-penalty', 'get', '200', { type: 'object', properties: { isDoublePenaltyMandatory: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-security-deposit-double-penalty', 'post', '200', { type: 'object', properties: { isDoublePenaltyMandatory: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-constructive-dismissal', 'get', '200', { type: 'object', properties: { isConstructiveDismissal: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-constructive-dismissal', 'post', '200', { type: 'object', properties: { isConstructiveDismissal: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-suv-peer-review', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-suv-peer-review', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/saskatchewan-security-deposit-return', 'get', '200', { type: 'object', properties: { landlordForfeitedRightToClaim: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/saskatchewan-security-deposit-return', 'post', '200', { type: 'object', properties: { landlordForfeitedRightToClaim: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/ontario-illegal-entry-t2', 'get', '200', { type: 'object', properties: { isUnlawfulEntry: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/ontario-illegal-entry-t2', 'post', '200', { type: 'object', properties: { isUnlawfulEntry: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-overtime-banking', 'get', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/bc-overtime-banking', 'post', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/alberta-periodic-tenancy-notice', 'get', '200', { type: 'object', properties: { isValidNotice: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-periodic-tenancy-notice', 'post', '200', { type: 'object', properties: { isValidNotice: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-super-visa-insurance-lico', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-super-visa-insurance-lico', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/manitoba-general-holiday-pay', 'get', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/manitoba-general-holiday-pay', 'post', '200', { type: 'object', properties: { complianceStatus: text, legalVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-caregiver-pr-pathway', 'get', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/federal-caregiver-pr-pathway', 'post', '200', { type: 'object', properties: { isEligible: { type: 'boolean' }, eligibilityVerdict: text }, additionalProperties: true });
  response('/v1/tools/ontario-public-holiday-pay', 'get', '200', { type: 'object', properties: { isQualified: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/ontario-public-holiday-pay', 'post', '200', { type: 'object', properties: { isQualified: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/bc-rtb-dispute-track', 'get', '200', { type: 'object', properties: { qualifiesForExpeditedTrack: { type: 'boolean' }, hearingTrack: text }, additionalProperties: true });
  response('/v1/tools/bc-rtb-dispute-track', 'post', '200', { type: 'object', properties: { qualifiesForExpeditedTrack: { type: 'boolean' }, hearingTrack: text }, additionalProperties: true });
  response('/v1/tools/alberta-youth-employment-rules', 'get', '200', { type: 'object', properties: { isCompliant: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/alberta-youth-employment-rules', 'post', '200', { type: 'object', properties: { isCompliant: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-student-off-campus-work', 'get', '200', { type: 'object', properties: { isCompliant: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/federal-student-off-campus-work', 'post', '200', { type: 'object', properties: { isCompliant: { type: 'boolean' }, complianceStatus: text }, additionalProperties: true });
  response('/v1/tools/city-comparison', 'get', '200', { type: 'object', properties: { comparedCities: array(text) }, additionalProperties: true });
  response('/v1/tools/city-comparison', 'post', '200', { type: 'object', properties: { comparedCities: array(text) }, additionalProperties: true });
  for (const method of ['get', 'post']) response('/v1/tools/form-autopopulate', method, '200', {
    type: 'object', required: ['formType', 'documentStatus', 'submissionReady', 'missingFields', 'populatedFields'],
    properties: {formType: text, documentStatus: {type: 'string', enum: ['draft_worksheet']}, submissionReady: {type: 'boolean', enum: [false]}, missingFields: array(text), populatedFields: array({type: 'object', required: ['id', 'label', 'val'], properties: {id: text, label: text, val: text}}), pdfSupported: {type: 'boolean'}, pdfNotice: {type: ['string', 'null']}, pdfBase64: {type: ['string', 'null']}, printReadyHtml: text}, additionalProperties: true
  });
  response('/v1/realtime/gazettes', 'get', '200', { type: 'object', properties: { gazettes: array({ type: 'object', additionalProperties: true }) }, additionalProperties: true });
  response('/v1/realtime/gazettes', 'post', '200', { type: 'object', properties: { gazettes: array({ type: 'object', additionalProperties: true }) }, additionalProperties: true });
  response('/v1/meta/sri', 'get', '200', { type: 'object', properties: { sri: { type: 'object', additionalProperties: true } }, additionalProperties: true });
  response('/v1/kb/citations', 'get', '200', { type: 'object', properties: { totalCitations: integer, citations: array({ type: 'object', additionalProperties: true }) }, additionalProperties: true });
  response('/v1/kb/expiry-audit', 'get', '200', { type: 'object', properties: { auditedAt: text }, additionalProperties: true });
  response('/v1/kb/provenance-check', 'get', '200', { type: 'object', properties: { isValid: { type: 'boolean' } }, additionalProperties: true });
  response('/v1/kb/classify-policy', 'post', '200', { type: 'object', properties: { evaluatedAt: text }, additionalProperties: true });

  const realtimeUpdatesSchema = {
    type: 'object',
    properties: {
      total: integer,
      updates: array({ type: 'object', additionalProperties: true })
    },
    additionalProperties: true
  };
  response('/v1/realtime/updates', 'get', '200', realtimeUpdatesSchema);

  const realtimeMatrixSchema = {
    type: 'object',
    properties: {
      destinations: array(text),
      totalSources: integer,
      activeAlertsCount: integer,
      sources: array({ type: 'object', additionalProperties: true })
    },
    additionalProperties: true
  };
  response('/v1/realtime/matrix', 'get', '200', realtimeMatrixSchema);

  const realtimeSimulateSchema = {
    type: 'object',
    properties: {
      message: text,
      sourceId: text,
      alertId: text,
      recordId: text,
      risk: text,
      status: text,
      liveAlert: { type: 'object', additionalProperties: true }
    },
    additionalProperties: true
  };
  response('/v1/realtime/simulate', 'post', '200', realtimeSimulateSchema);

  const realtimePollSchema = {
    type: 'object',
    properties: {
      polled: integer,
      changed: integer,
      details: array({ type: 'object', additionalProperties: true })
    },
    additionalProperties: true
  };
  response('/v1/realtime/poll', 'post', '200', realtimePollSchema);

  const cronStatsSchema = {
    type: 'object',
    properties: {
      autonomousCronActive: boolean,
      totalMonitoredSources: integer,
      trackedSnapshots: integer,
      lastRunAt: nullableText,
      recentLogs: array({ type: 'object', additionalProperties: true })
    },
    additionalProperties: true
  };
  response('/v1/realtime/cron-stats', 'get', '200', cronStatsSchema);

  const corridorsSchema = {
    type: 'object',
    properties: {
      corridors: { type: 'object', additionalProperties: true }
    },
    additionalProperties: true
  };
  response('/v1/corridors', 'get', '200', corridorsSchema);

  const prMatrixSchema = {
    type: 'object',
    properties: {
      applicantProfile: { type: 'object', additionalProperties: true },
      topRecommendedCorridor: { type: 'object', additionalProperties: true },
      evaluations: array({ type: 'object', additionalProperties: true }),
      comparativeSummary: text,
      generatedAt: text
    },
    additionalProperties: true
  };
  response('/v1/tools/pr-matrix', 'get', '200', prMatrixSchema);
  response('/v1/tools/pr-matrix', 'post', '200', prMatrixSchema);

  const familyReunificationSchema = {
    type: 'object',
    properties: {
      category: text,
      eligible: boolean,
      verdict: text,
      statutoryLegalBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/family-reunification', 'get', '200', familyReunificationSchema);
  response('/v1/tools/family-reunification', 'post', '200', familyReunificationSchema);

  const taxShieldSchema = {
    type: 'object',
    properties: {
      province: text,
      annualEmploymentIncomeCad: number,
      marginalTaxRatePercent: number,
      fhsaShield: { type: 'object', additionalProperties: true },
      tfsaShield: { type: 'object', additionalProperties: true },
      childAndFamilyBenefits: { type: 'object', additionalProperties: true },
      totalFirstYearFinancialShieldCad: number,
      wealthActionPlan: array(text)
    },
    additionalProperties: true
  };
  response('/v1/tools/tax-shield', 'get', '200', taxShieldSchema);
  response('/v1/tools/tax-shield', 'post', '200', taxShieldSchema);

  const calendarSyncSchema = {
    type: 'object',
    properties: {
      applicantName: text,
      milestoneType: text,
      anchorDate: text,
      totalEventsGenerated: integer,
      events: array({ type: 'object', additionalProperties: true }),
      icsContent: text,
      summary: text
    },
    additionalProperties: true
  };
  response('/v1/tools/calendar-sync', 'get', '200', calendarSyncSchema);
  response('/v1/tools/calendar-sync', 'post', '200', calendarSyncSchema);

  const globalVisaMatrixSchema = {
    type: 'object',
    properties: {
      assessmentDate: text,
      candidateProfile: { type: 'object', additionalProperties: true },
      totalOptionsEvaluated: integer,
      eligiblePathwaysCount: integer,
      eligiblePathways: array({ type: 'object', additionalProperties: true }),
      restrictedPathways: array({ type: 'object', additionalProperties: true }),
      statutorySummary: text
    },
    additionalProperties: true
  };
  response('/v1/tools/global-visa-matrix', 'get', '200', globalVisaMatrixSchema);
  response('/v1/tools/global-visa-matrix', 'post', '200', globalVisaMatrixSchema);

  response('/v1/tools/moving-tax-calc', 'get', '200', movingTaxDeductionSchema);
  response('/v1/tools/moving-tax-calc', 'post', '200', movingTaxDeductionSchema);
  response('/v1/tools/severance-bardal', 'get', '200', severanceReasonableNoticeSchema);
  response('/v1/tools/severance-bardal', 'post', '200', severanceReasonableNoticeSchema);

  const glossarySchema = {
    type: 'object',
    properties: {
      totalTerms: integer,
      terms: array({ type: 'object', additionalProperties: true }),
      categories: array(text)
    },
    additionalProperties: true
  };
  response('/v1/glossary', 'get', '200', glossarySchema);

  const legalNoticesSchema = {
    type: 'object',
    properties: {
      documentType: text,
      title: text,
      governingAct: text,
      statutorySections: array(text),
      date: text,
      formalNoticeText: text,
      printReadyHtml: text
    },
    additionalProperties: true
  };
  response('/v1/tools/legal-notices', 'get', '200', legalNoticesSchema);
  response('/v1/tools/legal-notices', 'post', '200', legalNoticesSchema);

  const poeRightsSchema = {
    type: 'object',
    properties: {
      country: text,
      authority: text,
      governingStatute: text,
      guidanceChecklist: array(text),
      statutoryRights: { type: 'object', additionalProperties: true },
      emergencyAssistance: { type: 'object', additionalProperties: true }
    },
    additionalProperties: true
  };
  response('/v1/tools/poe-rights', 'get', '200', poeRightsSchema);
  response('/v1/tools/poe-rights', 'post', '200', poeRightsSchema);

  const usH1bOptSchema = {
    type: 'object',
    properties: {
      assessmentDate: text,
      applicantName: text,
      visaStatus: text,
      h1bGracePeriodAudit: { type: 'object', additionalProperties: true },
      capGapAudit: { type: 'object', additionalProperties: true },
      section245kAudit: { type: 'object', additionalProperties: true },
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/us-h1b-opt', 'get', '200', usH1bOptSchema);
  response('/v1/tools/us-h1b-opt', 'post', '200', usH1bOptSchema);

  const ukSkilledWorkerSchema = {
    type: 'object',
    properties: {
      annualOfferedSalaryGbp: number,
      socCode: text,
      salaryAssessment: { type: 'object', additionalProperties: true },
      ilrContinuousResidence: { type: 'object', additionalProperties: true },
      housingSection21Defense: { type: 'object', additionalProperties: true },
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/uk-skilled-worker', 'get', '200', ukSkilledWorkerSchema);
  response('/v1/tools/uk-skilled-worker', 'post', '200', ukSkilledWorkerSchema);

  const superVisaLicoSchema = {
    type: 'object',
    properties: {
      assessmentDate: text,
      hostName: text,
      householdAudit: { type: 'object', additionalProperties: true },
      superVisaEvaluation: { type: 'object', additionalProperties: true },
      pgpEvaluation: { type: 'object', additionalProperties: true },
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/super-visa-lico', 'get', '200', superVisaLicoSchema);
  response('/v1/tools/super-visa-lico', 'post', '200', superVisaLicoSchema);

  const australiaReformsSchema = {
    type: 'object',
    properties: {
      visaSubclass: text,
      condition8607Evaluation: { type: 'object', additionalProperties: true },
      medicareLevyExemption: { type: 'object', additionalProperties: true },
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/australia-reforms', 'get', '200', australiaReformsSchema);
  response('/v1/tools/australia-reforms', 'post', '200', australiaReformsSchema);

  const australiaTenancySchema = {
    type: 'object',
    properties: {
      jurisdiction: text,
      state: text,
      tribunal: text,
      financialSummary: { type: 'object', additionalProperties: true },
      statutoryRemedies: { type: 'array', items: text },
      violations: { type: 'array', items: text },
      overallComplianceStatus: text
    },
    additionalProperties: true
  };
  response('/v1/tools/australia-tenancy', 'get', '200', australiaTenancySchema);
  response('/v1/tools/australia-tenancy', 'post', '200', australiaTenancySchema);

  const usStateTenancySchema = {
    type: 'object',
    properties: {
      jurisdiction: text,
      state: text,
      financialOverview: { type: 'object', additionalProperties: true },
      statutoryViolations: { type: 'array', items: text },
      overallStatus: text
    },
    additionalProperties: true
  };
  response('/v1/tools/us-state-tenancy', 'get', '200', usStateTenancySchema);
  response('/v1/tools/us-state-tenancy', 'post', '200', usStateTenancySchema);

  const ukDevolvedTenancySchema = {
    type: 'object',
    properties: {
      jurisdiction: text,
      nation: text,
      evictionAssessment: { type: 'object', additionalProperties: true },
      statutoryViolations: { type: 'array', items: text },
      overallCompliance: text
    },
    additionalProperties: true
  };
  response('/v1/tools/uk-devolved-tenancy', 'get', '200', ukDevolvedTenancySchema);
  response('/v1/tools/uk-devolved-tenancy', 'post', '200', ukDevolvedTenancySchema);

  const uaeTenancyDisputeSchema = {
    type: 'object',
    properties: {
      jurisdiction: text,
      emirate: text,
      portal: text,
      disputeForum: text,
      financialOverview: { type: 'object', additionalProperties: true },
      statutoryViolations: { type: 'array', items: text },
      isCompliant: { type: 'boolean' }
    },
    additionalProperties: true
  };
  response('/v1/tools/uae-tenancy-dispute', 'get', '200', uaeTenancyDisputeSchema);
  response('/v1/tools/uae-tenancy-dispute', 'post', '200', uaeTenancyDisputeSchema);

  const countryCoverageSchema = {
    type: 'object',
    properties: {
      asOf: text,
      big12: { type: 'array', items: { type: 'object', additionalProperties: true } },
      restOfWorld: { type: 'object', additionalProperties: true },
      canada: { type: 'object', additionalProperties: true }
    },
    additionalProperties: true
  };
  response('/v1/coverage/countries', 'get', '200', countryCoverageSchema);

  const germanyChancenkarteSchema = {
    type: 'object',
    properties: {
      chancenkarteAudit: { type: 'object', additionalProperties: true },
      nebenkostenTenancyAudit: { type: 'object', additionalProperties: true },
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/germany-chancenkarte', 'get', '200', germanyChancenkarteSchema);
  response('/v1/tools/germany-chancenkarte', 'post', '200', germanyChancenkarteSchema);
  const esaWageTheftSchema = {
    type: 'object',
    properties: {
      action: text,
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/esa-wage-theft', 'get', '200', esaWageTheftSchema);
  response('/v1/tools/esa-wage-theft', 'post', '200', esaWageTheftSchema);

  const workplaceRightsSchema = {
    type: 'object',
    properties: {
      action: text,
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/workplace-rights', 'get', '200', workplaceRightsSchema);
  response('/v1/tools/workplace-rights', 'post', '200', workplaceRightsSchema);

  const eiBenefitsSchema = {
    type: 'object',
    properties: {
      action: text,
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/ei-benefits', 'get', '200', eiBenefitsSchema);
  response('/v1/tools/ei-benefits', 'post', '200', eiBenefitsSchema);

  const fcrBridgingSchema = {
    type: 'object',
    properties: {
      action: text,
      statutoryBasis: text
    },
    additionalProperties: true
  };
  response('/v1/tools/fcr-bridging', 'get', '200', fcrBridgingSchema);
  response('/v1/tools/fcr-bridging', 'post', '200', fcrBridgingSchema);

  const localesSchema = {
    type: 'object',
    properties: {
      supported: array(text)
    },
    required: ['supported'],
    additionalProperties: true
  };
  response('/v1/locales', 'get', '200', localesSchema);

  const localeDetailSchema = {
    type: 'object',
    properties: {
      locale: text,
      dictionary: {
        type: 'object',
        properties: {
          brand_sub: text
        },
        additionalProperties: true
      },
      supported: array(text)
    },
    required: ['locale', 'dictionary', 'supported'],
    additionalProperties: true
  };
  response('/v1/locales/{lang}', 'get', '200', localeDetailSchema);

  response('/admin/cost-analytics', 'get', '200', object({ totalTokensUsed: integer, totalCostUsd: number, requestsCount: integer }));
  response('/v1/glossary/multilingual/categories', 'get', '200', object({ categories: array(text) }));
  response('/v1/glossary/multilingual', 'get', '200', object({ results: array(object({ term: text, category: text })), total: integer }));
  response('/v1/translations/community/submit', 'post', '201', object({ success: boolean, translation: object({ id: text, status: text }) }));
  response('/v1/translations/community', 'get', '200', object({ items: array(object({ id: text,term_or_record_id:text,target_locale:text,suggested_translation:text,status:{const:'verified'},updated_at:text })), total: integer }));
  response('/admin/translations/endorse', 'post', '200', object({ success: boolean, translation: object({ id: text, status: text }) }));
  response('/admin/translations/verify', 'post', '200', object({ success: boolean, translation: object({ id: text, status: text }) }));
  response('/v1/phrasebook/airport/categories', 'get', '200', object({ categories: array(text) }));
  response('/v1/phrasebook/airport', 'get', '200', object({ phrases: array(object({ id: text, category: text })) }));
  response('/v1/citations/bilingual', 'post', '200', object({ bilingualText: text, targetLang: text }));
  response('/v1/speech/profiles', 'get', '200', object({ profiles: array(object({ id: text, name: text })) }));

  const questionBankItemSchema = object({
    id: integer,
    category: text,
    question: text,
    statutoryRule: text,
    citation: text,
    verdict: text
  });

  response('/v1/question-bank/batch2', 'get', '200', object({
    total: integer,
    offset: integer,
    limit: integer,
    items: array(questionBankItemSchema)
  }));

  response('/v1/question-bank/batch2/stats', 'get', '200', {
    type: 'object',
    properties: {
      totalQuestions: integer,
      range: text,
      categories: {
        type: 'object',
        additionalProperties: { type: 'integer' }
      }
    },
    required: ['totalQuestions', 'range', 'categories'],
    additionalProperties: false
  });

  response('/v1/question-bank/batch2/{id}', 'get', '200', object({
    item: questionBankItemSchema
  }));
}
