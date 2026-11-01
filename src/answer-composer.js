// Deterministic presentation layer for an engine answer.
//
// The engine returns claims as dense, statute-first paragraphs. This module
// reorganises those exact words into something a newcomer can scan: a short
// "in short" summary, headed sections, the legal basis pulled out of the
// opening clause, bullet points, key numbers and practical next steps.
//
// It never writes a new fact. Every string it emits is either a verbatim
// slice of a claim/source title, a fixed label, or a fixed rewording of the
// record's own "This record does not …" limitation line. Claim and source
// IDs travel with every piece so the UI can cite them.
import {topicLabels} from './knowledge.js';
import {tokenize} from './search.js';

export const PRESENTATION_VERSION='presentation-1';

export const TOOL_REGISTRY = [
  {
    id: 'pgwp-eligibility',
    title: 'PGWP Statutory Eligibility Evaluator',
    description: 'Verify post-graduation work permit length, DLI field-of-study requirements, and language benchmarks under latest IRCC rules.',
    endpoint: '/v1/tools/pgwp-eligibility',
    buttonLabel: 'Launch PGWP Evaluator',
    badge: 'IMMIGRATION STATUTORY NAVIGATOR',
    trigger: /\b(?:pgwp|post[- ]grad(?:uation)?(?: work permit)?|dli|field of study|cip code|study permit)\b/i,
    topics: ['employment', 'sin']
  },
  {
    id: 'sowp-eligibility',
    title: 'SOWP Eligibility Evaluator',
    description: 'Check spousal open work permit qualification under strict IRCC TEER tier and master degree enrollment rules.',
    endpoint: '/v1/tools/sowp-eligibility',
    buttonLabel: 'Check SOWP Eligibility',
    badge: 'WORK PERMIT TOOL',
    trigger: /\b(?:sowp|spous(?:e|al) (?:open )?work permit|spouse permit|husband work permit|wife work permit)\b/i,
    topics: ['employment', 'family']
  },
  {
    id: 'lease-guard',
    title: 'Lease Guard & Deposit Compliance Auditor',
    description: 'Audit tenancy agreements for illegal key deposits, unlawful damage holdbacks, and rent increase limits.',
    endpoint: '/v1/tools/lease-guard',
    buttonLabel: 'Audit My Lease',
    badge: 'TENANT RIGHTS TOOL',
    trigger: /\b(?:lease|deposit|rent increase|key deposit|damage deposit|standard lease|eviction|ltb|rtb|rta|tenant|tenancy|landlord)\b/i,
    topics: ['housing']
  },
  {
    id: 'customs-declaration',
    title: 'CBSA Customs & BSF186 Assistant',
    description: 'Calculate duty-free settler effects exemptions, jewellery declarations, and $10k currency reporting rules.',
    endpoint: '/v1/tools/customs-declaration',
    buttonLabel: 'Open Customs Assistant',
    badge: 'BORDER & CUSTOMS TOOL',
    trigger: /\b(?:customs|declare|declaration|bsf186|b4|settler effects|bring cash|currency|duty|tax exemption)\b/i,
    topics: ['arrival', 'money']
  },
  {
    id: 'licence-exchange',
    title: "Driver's Licence Exchange Navigator",
    description: 'Evaluate reciprocal licence transfer eligibility, driving abstract credits, and graduated road test bypasses.',
    endpoint: '/v1/tools/licence-exchange',
    buttonLabel: 'Check Licence Transfer',
    badge: 'TRANSIT & DRIVING TOOL',
    trigger: /\b(?:driver'?s? licen[cs]e|licen[cs]e exchange|drive test|g2|full g|icbc|abstract)\b/i,
    topics: ['driving']
  },
  {
    id: 'compare-cities',
    title: 'City Comparison & Settlement Matrix',
    description: 'Compare median rent, transit fares, healthcare waiting periods, and statutory minimum wages across pilot cities.',
    endpoint: '/v1/tools/compare-cities',
    buttonLabel: 'Compare Pilot Cities',
    badge: 'SETTLEMENT PLANNING',
    trigger: /\b(?:compare|comparison|versus|vs|cost of living|better city|which city)\b/i,
    topics: ['housing', 'transit', 'community']
  },
  {
    id: 'cross-border-tax',
    title: 'Cross-Border Tax & Asset Reporting Navigator',
    description: 'Understand CRA residency, T1135 foreign asset filings, 401(k)/RRSP treaty rules, and departure tax implications.',
    endpoint: '/v1/tools/cross-border-tax',
    buttonLabel: 'Review Cross-Border Rules',
    badge: 'TAX & FINANCE TOOL',
    trigger: /\b(?:cross[- ]border|401k|ira|rrsp|foreign property|t1135|tax treaty|w-8ben|dual status)\b/i,
    topics: ['money']
  },
  {
    id: 'cra-benefits',
    title: 'CRA Canada Child Benefit & Credit Calculator',
    description: 'Estimate monthly Canada Child Benefit (CCB), quarterly GST/HST credit, and provincial carbon rebates.',
    endpoint: '/v1/tools/cra-benefits',
    buttonLabel: 'Calculate Entitlements',
    badge: 'BENEFITS CALCULATOR',
    trigger: /\b(?:cra|child benefit|ccb|gst credit|carbon rebate|climate action|benefit payment)\b/i,
    topics: ['money', 'family', 'childcare']
  },
  {
    id: 'healthcare-portability',
    title: 'Interprovincial Healthcare Portability Checker',
    description: 'Verify coverage continuation under Canada Health Act portability principles when moving between provinces.',
    endpoint: '/v1/tools/healthcare-portability',
    buttonLabel: 'Check Healthcare Portability',
    badge: 'HEALTHCARE TOOL',
    trigger: /\b(?:moving province|interprovincial|health card|ohip|msp|portability|waiting period)\b/i,
    topics: ['health']
  },
  {
    id: 'tfw-compliance',
    title: 'TFW Workplace Rights & LMIA Compliance Auditor',
    description: 'Verify employer compliance with wage commitments, prohibited recruitment deductions, and workplace safety.',
    endpoint: '/v1/tools/tfw-compliance',
    buttonLabel: 'Audit TFW Compliance',
    badge: 'WORKPLACE RIGHTS TOOL',
    trigger: /\b(?:tfw|temporary foreign worker|lmia|recruitment fee|deduction|employer pay)\b/i,
    topics: ['employment']
  },
  {
    id: 'study-permit-cap-pal',
    title: 'Study Permit Cap & PAL Evaluator',
    description: 'Assess Provincial Attestation Letter (PAL) exemptions, cost-of-living proof ($20,635 CAD), and PGWP field alignment.',
    endpoint: '/v1/tools/study-permit-cap-pal',
    buttonLabel: 'Check Study Permit & PAL',
    badge: 'STUDY & CAP NAVIGATOR',
    trigger: /\b(?:study permit|pal|provincial attestation|student visa|study cap|tuition proof|living cost|international student)\b/i,
    topics: ['family', 'sin', 'employment']
  },
  {
    id: 'visitor-visa-financial-ties',
    title: 'Visitor Visa Financial & Domestic Ties Evaluator',
    description: 'Audit ties to home country under IRPA s. 179(b), dual intent under s. 22(2), and refusal risk mitigation.',
    endpoint: '/v1/tools/visitor-visa-financial-ties',
    buttonLabel: 'Evaluate Ties & Visa Risk',
    badge: 'TRV & TIES EVALUATOR',
    trigger: /\b(?:visitor visa|trv|179\(b\)|dual intent|ties to home country|tourist visa|refusal|travel history)\b/i,
    topics: ['arrival', 'family']
  },
  {
    id: 'lmia-readiness',
    title: 'LMIA Exemption & Prevailing Wage Auditor',
    description: 'Check Francophone Mobility (C16) / CUSMA exemptions, high vs low-wage streams, and the ESDC low-wage cap (10%, or 20% in construction and healthcare).',
    endpoint: '/v1/tools/lmia-readiness',
    buttonLabel: 'Audit LMIA & Wage',
    badge: 'LABOUR MARKET AUDITOR',
    trigger: /\b(?:lmia|median wage|high wage stream|low wage stream|c16|francophone mobility|cusma|work permit exemption)\b/i,
    topics: ['employment']
  },
  {
    id: 'sin-healthcare',
    title: 'First 14-Day Government Enrollment Kit',
    description: 'Step-by-step statutory checklist for instant SIN issuance, OHIP/MSP/AHCIP healthcare coverage, and provincial photo ID.',
    endpoint: '/v1/tools/sin-healthcare',
    buttonLabel: 'Open Enrollment Kit',
    badge: 'NEWCOMER ENROLLMENT',
    trigger: /\b(?:get sin|social insurance number|register ohip|apply msp|first days|photo card|service canada)\b/i,
    topics: ['sin', 'health', 'arrival']
  }
];

export function detectSuggestedTools(result, limit = 2) {
  if (!result || !result.parsed) return [];
  const question = result.parsed.rawQuestion || '';
  const queryTerms = (result.parsed.queryTerms || []).join(' ');
  // A tool is suggested only for what the person asked; words inside the cited
  // sources (a SIN page mentioning "study permit") only break ties.
  const asked = `${question} ${queryTerms}`;
  const sourceText = result.claims?.map(c => c.text).join(' ') || '';
  const intents = new Set(result.parsed.intents || []);

  const scored = [];
  for (const tool of TOOL_REGISTRY) {
    let score = 0;
    if (tool.trigger.test(asked)) score += 3;
    else if (tool.trigger.test(sourceText)) score += 1;
    if (tool.topics.some(t => intents.has(t))) score += 1;
    if (score >= 3) {
      scored.push({
        id: tool.id,
        title: tool.title,
        description: tool.description,
        endpoint: tool.endpoint,
        buttonLabel: tool.buttonLabel,
        badge: tool.badge,
        score
      });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(({ id, title, description, endpoint, buttonLabel, badge }) => ({
    id, title, description, endpoint, buttonLabel, badge
  }));
}

// Abbreviations that end in a full stop but never end a sentence here.
// a.m./p.m. are left out on purpose: followed by a capital they end a sentence.
const ABBREVIATION_WORD=/\b(?:s|ss|no|nos|c|st|vs|etc|ltd|inc|dr|mr|ms|sec|art|para|approx|govt|dept|jr|sr|u\.s|e\.g|i\.e|s\.o)\.$/iu;
const INITIAL=/(?:^|[\s.])[A-Z]\.$/u;
const ABBREVIATION={test:text=>ABBREVIATION_WORD.test(text) || INITIAL.test(text)};
const CONNECTIVE=/^(?:However|Additionally|Moreover|Furthermore|In addition|Also|Importantly|Notably|Under (?:these|this|those) [^,]{0,40}),\s+/u;
// Short, plain topic names for headlines; the engine's labels are Canada-first.
const HEADLINE_LABELS={sin:'Identity & tax numbers',health:'Health coverage',housing:'Housing & renting',community:'Community services',arrival:'Your first days',employment:'Work & credentials',money:'Banking & money',family:'Family & school',telecom:'Phone & internet',groceries:'Groceries & food',driving:'Driving',transit:'Getting around',childcare:'Child care'};
const LIMIT=/^This record does not\b/iu;
const SOURCE_PREAMBLE=/^The\s+[^.]{3,80}?\s+(?:page|portal|website|document|guide|explainer)\s+(?:states|reports|explains|notes|confirms|says)\s+(?:that\s+)?/iu;
const ACTION=/\b(?:you (?:can|should|must|may)|should|can (?:file|request|apply|place|open|refuse|ask|report|contact|leave)|must (?:supply|present|register|declare|apply|bring|submit|lodge|obtain)|apply (?:online|for|through|at|via)|register (?:at|with|online)|bring|keep|contact|visit|call|submit|update your|consider)\b/iu;
const IMPERATIVE=/^(?:Use|Apply|Visit|Call|Bring|Keep|Contact|Register|Submit|Open|Update|Consider|Remember|Memorize|Learn|Ask|Check|File|Request|Place|Obtain|Book|Make|Get|Do not|Don’t|Don't)\b/u;

const FACT_PATTERNS=[
  ['amount',/(?:(?:CAD|USD|AUD|NZD|EUR|GBP|AED)\s?)?[$€£]\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:CAD|USD|AUD|NZD))?|\b\d[\d,]*(?:\.\d+)?\s?(?:CAD|USD|AUD|NZD|AED|EUR|GBP|dirhams?)\b/gu],
  ['percent',/\b\d+(?:\.\d+)?\s?%/gu],
  ['time',/\b\d+(?:\.\d+)?(?:\s?(?:to|-|–)\s?\d+)?\s(?:(?:business|working|calendar|consecutive|full)\s)?(?:hours?|days?|weeks?|months?|years?)\b|\b\d+-(?:hour|day|week|month|year)\b/giu],
  ['form',/\b(?:Form|Forms)\s[A-Z]{0,4}[- ]?\d{1,5}[A-Z]?\b|\bIMM\s?\d{4}\b|\b(?:SS-5|I-9|I-94|I-485|E677|MS004|N12|N13|N9|T2)\b/gu]
];

export function splitSentences(text) {
  const rough=String(text||'').replace(/\s+/gu,' ').trim().split(/(?<=[.!?])\s+(?=[“"(A-Z0-9])/u);
  const sentences=[];
  for(const piece of rough) {
    const last=sentences.at(-1);
    if(last && ABBREVIATION.test(last)) sentences[sentences.length-1]=`${last} ${piece}`;
    else sentences.push(piece);
  }
  return sentences.filter(Boolean);
}
// A lead longer than the summary cap used to be dropped, leaving "In short"
// half empty; shorten it at a sentence boundary instead.
function summaryLine(lead,cap=420) {
  if(!lead||lead.length<=cap) return lead;
  let line='';
  for(const sentence of splitSentences(lead)) {
    if(line && `${line} ${sentence}`.length>cap) break;
    line=line?`${line} ${sentence}`:sentence;
  }
  return line||lead.slice(0,cap).trim();
}

const capitalise=text=>text ? text.charAt(0).toUpperCase()+text.slice(1) : text;

// "Under the X Act, 2006 (s. 25), tenants …" → basis + the plain statement.
export function extractBasis(sentence) {
  const opener=sentence.match(/^(?:Under|According to|Pursuant to|As set out in)\s+/u);
  if(!opener || /^Under (?:these|this|those)\b/u.test(sentence)) return {basis:null,statement:sentence};
  // The first comma outside brackets that is not "Act, 2006"-style.
  let depth=0;
  for(let i=opener[0].length;i<Math.min(sentence.length,opener[0].length+200);i++) {
    const ch=sentence[i];
    if(ch==='(') depth++;
    else if(ch===')') depth=Math.max(0,depth-1);
    else if(ch===',' && depth===0 && sentence[i+1]===' ' && !/\d/u.test(sentence[i+2]||'')) {
      const basis=sentence.slice(opener[0].length,i).replace(/^the\s+/iu,'').trim();
      const statement=sentence.slice(i+2).trim();
      return basis.length>=4 && statement.length>=30 ? {basis,statement:capitalise(statement)} : {basis:null,statement:sentence};
    }
  }
  return {basis:null,statement:sentence};
}

// "(1) A: x; (2) B: y" → an intro line plus list items, kept word for word.
function enumerate(sentence) {
  if(!/\(\s*[1-9]\s*\)/u.test(sentence)) return null;
  const parts=sentence.split(/\(\s*[1-9]\s*\)\s*/u);
  const intro=parts.shift().replace(/[:;,\s]+$/u,'').trim();
  const items=parts.map(p=>p.replace(/(?:;\s*(?:and|or)?|,\s*(?:and|or)|\s+and)\s*$/u,'').replace(/[;.]\s*$/u,'').trim()).filter(Boolean);
  return items.length>=2 ? {intro,items} : null;
}

function balance(clause) {
  const opens=(clause.match(/\(/gu)||[]).length, closes=(clause.match(/\)/gu)||[]).length;
  if(opens>closes) return clause.slice(0,clause.lastIndexOf('(')).trim();
  if(closes>opens) return clause.replace(/\)/gu,'').trim();
  return clause;
}

// The clause around a key number, so "24 hours" arrives with its meaning.
function factContext(sentence,value) {
  const clauses=sentence.split(/;\s|:\s|,\s(?=[a-z])|\s[—–]\s/u);
  const clause=clauses.find(c=>c.includes(value)) || sentence;
  const text=balance(clause.replace(/^(?:and|or|but|while|which)\s+/iu,'').replace(/[.;,]\s*$/u,'').trim());
  return text.length>=value.length+8 && text.length<=140 ? capitalise(text) : null;
}

function sourceHeading(source,topic) {
  const title=source?.title || '';
  const colon=title.indexOf(':');
  const authority=colon>0 && colon<70 ? title.slice(0,colon).trim() : null;
  let subject=(colon>0 ? title.slice(colon+1) : title)
    .replace(/\s*\([^)]*\)\s*/gu,' ').replace(/\s*\bKYC\b/gu,'').replace(/\s{2,}/gu,' ').replace(/\s+([,.])/gu,'$1').replace(/[,\s]+$/u,'').trim();
  if(subject.length<6) subject=title || topicLabels[topic] || 'Official guidance';
  return {heading:capitalise(subject),authority};
}

// How well a sentence speaks to the words the reader actually used.
function overlap(sentence,terms) {
  if(!terms.size) return 0;
  const words=new Set(tokenize(sentence));
  let hits=0;
  for(const term of terms) if(words.has(term)) hits++;
  return hits;
}

function composeSection(claim,source,index,terms,relevance) {
  const raw=String(claim.text);
  let cleaned=raw.replace(SOURCE_PREAMBLE,'');
  // Without "The page states that", a reported list ("…, that X, and that Y") reads
  // as a broken sentence; turn its first sentence into plain clauses.
  if(cleaned!==raw) {
    const end=cleaned.search(/\.\s|\.$/u);
    const first=end<0?cleaned:cleaned.slice(0,end), rest=end<0?'':cleaned.slice(end);
    cleaned=first.replace(/,\s+and\s+that\s+/giu,'; and ').replace(/,\s+that\s+/giu,'; ')+rest;
  }
  const sentences=splitSentences(capitalise(cleaned));
  const limits=[], body=[];
  for(const sentence of sentences) (LIMIT.test(sentence)?limits:body).push(sentence);
  let basis=null;
  const points=body.map((sentence,i)=>{
    let text=sentence;
    if(i===0 || !basis) {
      const split=extractBasis(sentence);
      if(split.basis && !basis) {basis=split.basis;text=split.statement;}
    }
    const list=enumerate(text);
    return list ? {text:list.intro || null,items:list.items} : {text,items:[]};
  });
  // The lead is the point that best answers the question. When a list wins,
  // there is no separate lead and the points keep their original order.
  let leadIndex=0, best=-Infinity;
  points.forEach((p,i)=>{
    if(!p.text && !p.items.length) return;
    const score=overlap([p.text,...p.items].join(' '),terms)-i*0.15;
    if(score>best) {best=score;leadIndex=i;}
  });
  const leadText=points[leadIndex]?.items.length ? null : points[leadIndex]?.text || null;
  const lead=leadText ? capitalise(leadText.replace(CONNECTIVE,'')) : null;
  const rest=points.filter((_,i)=>i!==leadIndex || !lead);
  const {heading,authority}=sourceHeading(source,claim.topic);
  return {
    id:`section-${index+1}`,
    claimId:claim.id,
    evidenceId:claim.evidenceId,
    topic:claim.topic || null,
    heading,
    authority,
    basis,
    lead,
    points:rest,
    steps:claim.kind==='checklist' && Array.isArray(claim.steps) ? [...claim.steps] : [],
    limits:limits.map(l=>l.replace(LIMIT,'This guidance does not')),
    status:claim.status,
    reviewMethod:source?.reviewMethod ?? (claim.status==='approved'?'bulk_approval':'none'),
    relevance,
    sourceIndex:null
  };
}

function relevanceOf(claims,result) {
  const scores=new Map((result.retrieval?.candidates||[]).map(c=>[c.id,c.score]));
  const best=new Map();
  for(const c of claims) {
    const topic=c.topic || 'any';
    best.set(topic,Math.max(best.get(topic)??0,scores.get(c.evidenceId)??0));
  }
  const globalBest=Math.max(0,...best.values());
  return claims.map(c=>{
    if(c.kind==='checklist') return 'primary';
    const score=scores.get(c.evidenceId);
    if(score===undefined) return 'primary';
    const topBest=best.get(c.topic || 'any')??0;
    if(score>=topBest) return score>=globalBest*0.35 ? 'primary' : 'related';
    return score>=topBest*0.7 && score>=globalBest*0.45 ? 'primary' : 'related';
  });
}

function keyFacts(sections,limit=6) {
  const facts=[], seen=new Set();
  // Numbers from side reading would distract; use them only if nothing else has any.
  const primary=sections.filter(s=>s.relevance==='primary');
  for(const section of primary.length?primary:sections) {
    const sentences=[section.lead,...section.points.flatMap(p=>[p.text,...p.items])].filter(Boolean);
    for(const sentence of sentences) for(const [kind,pattern] of FACT_PATTERNS) {
      for(const match of sentence.matchAll(pattern)) {
        const value=match[0].trim();
        const key=value.toLowerCase();
        if(seen.has(key)) continue;
        const context=factContext(sentence,value);
        if(!context) continue;
        seen.add(key);
        facts.push({kind,value,context,claimId:section.claimId});
        if(facts.length>=limit) return facts;
      }
    }
  }
  return facts;
}

function nextSteps(sections,limit=5) {
  const steps=[], seen=new Set();
  const push=(text,claimId)=>{
    const key=text.toLowerCase();
    if(seen.has(key) || text.length>260) return;
    seen.add(key);steps.push({text,claimId});
  };
  for(const s of sections.filter(x=>x.relevance==='primary')) {
    for(const step of s.steps) push(step,s.claimId);
    if(s.steps.length) continue;
    for(const p of [{text:s.lead,items:[]},...s.points]) {
      if(p.text && (IMPERATIVE.test(p.text) || ACTION.test(p.text)) && !/\bcannot\b|\bprohibited\b/iu.test(p.text)) push(p.text,s.claimId);
    }
  }
  return steps.slice(0,limit);
}

function placeLabel(parsed) {
  if(!parsed) return null;
  if(parsed.country && parsed.country!=='CA') return parsed.city ? `${parsed.city}, ${parsed.country}` : parsed.country;
  if(parsed.city) return `${parsed.city}, ${parsed.region || 'Canada'}`;
  return parsed.region ? `${parsed.region}, Canada` : 'Canada';
}

export function headlineFor(result) {
  const labels=[...new Set((result.parsed?.intents||[]).map(t=>HEADLINE_LABELS[t]||topicLabels[t]).filter(Boolean))];
  const place=placeLabel(result.parsed);
  if(result.status==='clarification') return 'A quick detail first, so the answer fits your situation';
  const lower=label=>/^[A-Z][a-z]/u.test(label) ? label.charAt(0).toLowerCase()+label.slice(1) : label;
  const join=list=>list.map((l,i)=>i?lower(l):l).join(' and ');
  if(!result.claims?.length) return labels.length ? `${join(labels.slice(0,2))}: not verified yet` : 'We could not match this to a settlement topic yet';
  const subject=labels.length>2 ? `${labels[0]}, ${lower(labels[1])} and more` : join(labels);
  return place ? `${subject} in ${place}` : subject;
}

// Turn an engine/verified answer into the reader-facing structure.
export function composePresentation(result,{aiSummary=null}={}) {
  const claims=Array.isArray(result?.claims)?result.claims:[];
  const terms=new Set(result?.parsed?.queryTerms||[]);
  const relevance=relevanceOf(claims,result);
  const sourcesById=new Map((result?.sources||[]).map(s=>[s.id,s]));
  const sections=claims.map((c,i)=>composeSection(c,sourcesById.get(c.evidenceId),i,terms,relevance[i]));
  // Primary sections first, then the related reading, original order otherwise.
  sections.sort((a,b)=>(a.relevance===b.relevance?0:a.relevance==='primary'?-1:1));
  // Numbered citations follow reading order so [1] is the first thing you read.
  const cited=[];
  for(const s of sections) {
    const source=sourcesById.get(s.evidenceId);
    if(!source) continue;
    let n=cited.findIndex(c=>c.id===source.id);
    if(n===-1) {cited.push({id:source.id,title:source.title,url:source.url,authority:sourceHeading(source).authority,checkedAt:source.checkedAt,status:source.status,reviewMethod:source.reviewMethod ?? (source.status==='approved'?'bulk_approval':'none')});n=cited.length-1;}
    s.sourceIndex=n+1;
  }
  const primary=sections.filter(s=>s.relevance==='primary');
  // "In short": the two leads that speak most directly to the question,
  // shown in reading order. Checklists summarise themselves through steps.
  const summary=aiSummary
    ? [aiSummary]
    : primary.map((s,i)=>({lead:summaryLine(s.lead),i,score:s.lead?overlap(s.lead,terms)-i*0.1:-1}))
      .filter(x=>x.lead).sort((a,b)=>b.score-a.score).slice(0,2).sort((a,b)=>a.i-b.i).map(x=>x.lead);
  return {
    version:PRESENTATION_VERSION,
    headline:headlineFor(result||{}),
    place:placeLabel(result?.parsed),
    topics:[...new Set(primary.map(s=>s.topic).filter(Boolean).concat(result?.parsed?.intents||[]))],
    summary,
    summarySource:aiSummary?'ai_checked':'evidence',
    keyFacts:keyFacts(sections),
    sections,
    breakingAlert:result?.liveAlerts?.length ? result.liveAlerts[0] : (result?.liveAlert ? result.liveAlert : (result?.mythWarning ? { title: result.mythWarning.title, text: result.mythWarning.verdict, severity: result.mythWarning.severity } : null)),
    liveAlerts:Array.isArray(result?.liveAlerts) ? result.liveAlerts : (result?.liveAlert ? [result.liveAlert] : []),
    mythWarning:result?.mythWarning || null,
    suggestedTools:detectSuggestedTools(result),
    nextSteps:nextSteps(sections),
    citations:cited.map((c,i)=>({index:i+1,...c}))
  };
}
