// Local lexical baseline. This is not embedding-based or semantic retrieval.
const stopwords=new Set('a an the and or to of in on at for from with is are be can could should would how what where when do does i my me we our you your please after before get about it this that'.split(' '));
const variants={libraries:'library',services:'service',newcomers:'newcomer',applications:'apply',application:'apply',applying:'apply',applied:'apply',coverage:'insurance',healthcare:'health',medical:'health',renting:'rent',rental:'rent',tenants:'tenant',landlords:'landlord',evicted:'eviction',evict:'eviction',evictions:'eviction',children:'child',schools:'school',jobs:'job',groceries:'grocery',licences:'licence',license:'licence',licenses:'licence',documents:'document',requirements:'requirement',waiting:'wait',hikes:'increase',hike:'increase',raises:'increase',doctors:'doctor',clinics:'clinic',fired:'termination',terminated:'termination',cheques:'check',cheque:'check',currencies:'currency',cash:'currency',flat:'apartment',flats:'apartment',letting:'lease',lettings:'lease',solicitor:'lawyer',solicitors:'lawyer',creche:'childcare',creches:'childcare',tube:'transit',tram:'transit',underground:'transit',bills:'utility',utilities:'utility'};

export const STATUTORY_PROPER_TERMS = new Set([
  'sin', 'ohip', 'msp', 'ejari', 'omny', 'anmeldung', 'wws', 'buergeramt', 'bürgeramt',
  'ircc', 'uscis', 'tds', 'cwelcc', 'pgwp', 'sowp', 'chancenkarte', 'fsa', 'hsa',
  'presto', 'medicare', 'cra', 'cbsa', 'copr', 'n12', 'n13', 't2', 'ltb', 'rtb',
  'singpass', 'oyster', 'bvg', 'navigo', 'vevo', 'whv', 'aewv', 'inburgering'
]);

const SETTLEMENT_SYNSETS = [
  [/\b(?:rent hike|raised rent|raise rent|increase rent|rent increase|rent surge)\b/i, ['rent', 'increase', 'guideline', 'percentage', 'lawful']],
  [/\b(?:cash|money in hand|currency|dollars)\b/i, ['currency', 'monetary', 'declare', 'customs', 'ten', 'thousand']],
  [/\b(?:fired|laid off|let go|termination|severance|job loss)\b/i, ['termination', 'severance', 'notice', 'standards', 'pay']],
  [/\b(?:doctor|physician|clinic|gp|hospital|sick)\b/i, ['health', 'insurance', 'coverage', 'physician', 'services']],
  [/\b(?:pgwp|post[- ]grad)\b/i, ['pgwp', 'graduation', 'work', 'permit', 'dli', 'eligibility']],
  [/\b(?:sowp|spousal permit|spouse work)\b/i, ['sowp', 'spousal', 'open', 'work', 'permit']],
  [/\b(?:daycare|childcare|creche|babysit)\b/i, ['childcare', 'daycare', 'subsidy', 'licensed', 'cwelcc']],
  [/\b(?:driver'?s? licen[cs]e|driving test|g2|full g)\b/i, ['licence', 'driving', 'exchange', 'graduated', 'road', 'test']],
  [/\b(?:foreign property|401k|ira|rrsp|tfsa)\b/i, ['foreign', 'property', 'tax', 't1135', 'residency', 'cra']],
  [/\b(?:deposit|damage deposit|key fee)\b/i, ['deposit', 'rent', 'key', 'security', 'last', 'month']],
  [/\b(?:nurs(?:e|es|ing)|ien|nclex|cno)\b/i, ['nursing', 'nurse', 'nnas', 'credential', 'evaluation', 'licensure']],
  [/\b(?:chancenkarte|opportunity card)\b/i, ['chancenkarte', 'opportunity', 'card', 'points', 'vocational', 'aufenthg']],
  [/\b(?:golden visa|uae golden)\b/i, ['golden', 'visa', 'salary', 'estate', 'investor', 'equity', 'icp']],
  [/\b(?:sublet(?:ting)?|assign(?:ment|ing)?|break lease)\b/i, ['sublet', 'assignment', 'lease', 'landlord', 'refusal', 'consent']],
  [/\b(?:no credit(?: history)?|without credit)\b/i, ['credit', 'history', 'discrimination', 'landlord', 'guarantor', 'ohrc']],
  [/\b(?:rhca|reciprocal (?:medicare|health))\b/i, ['medicare', 'reciprocal', 'rhca', 'agreement', 'inpatient', 'pbs']],
  [/\b(?:j[- ]?1 waiver|212\(?e\)?|two[- ]year (?:home )?residence)\b/i, ['waiver', 'foreign', 'residence', 'ina', 'exchange', 'ds3035']],
  [/\b(?:soft landing|pr landing|first landing)\b/i, ['landing', 'copr', 'permanent', 'resident', 'cbsa', 'border']],
  [/\b(?:flagpoling|flagpole|border run)\b/i, ['flagpoling', 'border', 'cbsa', 'port', 'entry', 'permit']],
  [/\b(?:implied status|maintained status|section 186)\b/i, ['maintained', 'status', 'irpr', 'extension', 'work', 'permit']],
  [/\b(?:visitor record|extend stay|status restoration)\b/i, ['visitor', 'record', 'restoration', 'ircc', 'ninety', 'days']],
  [/\b(?:renoviction|n12|n13|landlord own use)\b/i, ['eviction', 'n12', 'n13', 'compensation', 'bad', 'faith', 'ltb']],
  [/\b(?:sick child|sick toddler|urgent care|walk-in|walk[- ]in (?:clinic|cent(?:er|re)|care|doctor|medical)|emergency room|without doctor)\b/i, ['health', 'ohip', 'msp', 'coverage', 'care', 'clinic', 'physician']],
  [/\b(?:locked out|lockout|changed (?:the )?locks?|threw out|illegal eviction|kick(?:ed)? (?:me )?out)\b/i, ['eviction', 'ltb', 'police', 'locks', 'tenant', 'rights', 't2', 'unlawful']],
  [/\b(?:unpaid wage|unpaid overtime|withheld pay|stolen wages|boss won'?t pay)\b/i, ['wage', 'overtime', 'esa', 'employment', 'standards', 'claim', 'pay']],
  [/\b(?:first home|buy home|buying house|fhsa|downpayment)\b/i, ['first', 'home', 'fhsa', 'hbp', 'rrsp', 'tax', 'deduction', 'savings']],
  [/\b(?:criminal record|dui|rehabilitation|past conviction|entry denied)\b/i, ['rehabilitation', 'deemed', 'inadmissibility', 'irpa', 'conviction', 'sentence', 'trp']],
  [/\b(?:stolen sin|lost sin|compromised sin|sin fraud|identity theft)\b/i, ['sin', 'social', 'insurance', 'fraud', 'service', 'canada', 'protection', 'number']],
  [/\b(?:money from parents|overseas gift|wire transfer|foreign remittance|deed of gift)\b/i, ['gift', 'wire', 'transfer', 'fintrac', 'tax', 'free', 'parental', 'bank']],
  [/\b(?:super visa insurance|parents visitor visa|lico income)\b/i, ['super', 'visa', 'insurance', 'lico', 'medical', 'coverage', 'undertaking', 'parents']]
];

export function tokenize(text) {
  return (text.normalize('NFKC').toLowerCase().match(/[a-z0-9]+/g)||[]).filter(t=>!stopwords.has(t)).map(t=>variants[t]||t);
}
export function queryTerms(question) {
  const terms=tokenize(question);
  if(/\bsin\b|social insurance number/i.test(question)) terms.push('social','insurance','sin');
  if(/\bohip\b/i.test(question)) terms.push('ontario','health','insurance');
  if(/\bmsp\b/i.test(question)) terms.push('bc','health','insurance');
  for (const [pattern, synset] of SETTLEMENT_SYNSETS) {
    if (pattern.test(question)) terms.push(...synset);
  }
  // Official maintained-status guidance describes travel as leaving Canada,
  // re-entry and resuming work/study. Scope these synonyms to both concepts;
  // expanding every PGWP or employment-leave question would dilute relevance.
  if (/\b(?:maintained|implied) status\b/i.test(question) &&
      /\b(?:travel|outside|leav(?:e|ing)|re[- ]?entr(?:y|ies)|re[- ]?enter|return)\b/i.test(question)) {
    terms.push('leave','leaves','leaving','re','entry','return','resume');
  }
  return [...new Set(terms)];
}
// Records are immutable snapshot objects (the same references are served until
// the evidence version changes), so tokenizing each one once per object keeps
// the lexical fallback O(corpus) cheap on every request.
const recordTokens=new WeakMap();
const tokensOf=record=>{let words=recordTokens.get(record);if(words===undefined){words=tokenize(`${record.title} ${record.summary} ${record.quote} ${record.topic}`);recordTokens.set(record,words);}return words;};
export function rankLexically(records,terms=[]) {
  return rankTokenized(records.map(record=>({record,words:tokensOf(record)})),terms);
}
export function getTermWeight(term) {
  if (!term || typeof term !== 'string') return 1.0;
  return STATUTORY_PROPER_TERMS.has(term.toLowerCase()) ? 3.0 : 1.0;
}

export function computeDenseSemanticScore(query, documentText) {
  if (!query || !documentText) return 0;
  const qTokens = tokenize(query);
  const dTokens = tokenize(documentText);
  if (qTokens.length === 0 || dTokens.length === 0) return 0;

  const qMap = new Map();
  for (const t of qTokens) qMap.set(t, (qMap.get(t) || 0) + 1);
  const dMap = new Map();
  for (const t of dTokens) dMap.set(t, (dMap.get(t) || 0) + 1);

  let dotProduct = 0;
  let qMagSq = 0;
  let dMagSq = 0;

  for (const [token, qCount] of qMap) {
    qMagSq += qCount * qCount;
    if (dMap.has(token)) {
      dotProduct += qCount * dMap.get(token);
    }
  }
  for (const [, dCount] of dMap) {
    dMagSq += dCount * dCount;
  }

  const magnitude = Math.sqrt(qMagSq) * Math.sqrt(dMagSq);
  if (magnitude === 0) return 0;
  return Number((dotProduct / magnitude).toFixed(4));
}

export function rankHybrid(records, query, terms = []) {
  const lexicalResults = rankLexically(records, terms.length ? terms : queryTerms(query));
  return lexicalResults.map(r => {
    const docText = `${r.title} ${r.summary} ${r.quote || ''} ${r.topic || ''}`;
    const semanticScore = computeDenseSemanticScore(query, docText);
    const hybridScore = Number((0.7 * r.lexicalScore + 0.3 * (semanticScore * 5)).toFixed(6));
    return {
      ...r,
      semanticScore,
      hybridScore
    };
  }).sort((a, b) => b.hybridScore - a.hybridScore);
}

export function rankTokenized(documents,terms=[]) {
  const corpus=documents.map(({record,words})=>{
    const counts=new Map();
    words.forEach(word=>counts.set(word,(counts.get(word)||0)+1));
    return {record,words,counts};
  });
  const avg=corpus.reduce((n,d)=>n+d.words.length,0)/(corpus.length||1),k1=1.2,b=0.75;
  const frequencies=new Map(terms.map(term=>[term,corpus.filter(d=>d.counts.has(term)).length]));
  return corpus.map(d=>{
    const matches=terms.filter(term=>d.counts.has(term));
    const score=matches.reduce((sum,term)=>{
      const df=frequencies.get(term),tf=d.counts.get(term);
      const idf=Math.log(1+(corpus.length-df+0.5)/(df+0.5));
      const weight=getTermWeight(term);
      return sum+(idf*(tf*(k1+1))/(tf+k1*(1-b+b*d.words.length/(avg||1)))) * weight;
    },0);
    return {...d.record,lexicalScore:Number(score.toFixed(6)),matchedTerms:matches};
  });
}
