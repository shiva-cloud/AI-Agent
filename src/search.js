// Local lexical baseline. This is not embedding-based or semantic retrieval.
const stopwords = new Set('a an the and or to of in on at for from with is are be can could should would how what where when do does i my me we our you your please after before get about it this that'.split(' '));
const variants = { libraries: 'library', services: 'service', newcomers: 'newcomer', applications: 'apply', application: 'apply', applying: 'apply', applied: 'apply', coverage: 'insurance', healthcare: 'health', medical: 'health', renting: 'rent', rental: 'rent', tenants: 'tenant', landlords: 'landlord', evicted: 'eviction', evict: 'eviction', evictions: 'eviction', children: 'child', schools: 'school', jobs: 'job', groceries: 'grocery', licences: 'licence', license: 'licence', licenses: 'licence', documents: 'document', requirements: 'requirement', waiting: 'wait', hikes: 'increase', hike: 'increase', raises: 'increase', doctors: 'doctor', clinics: 'clinic', fired: 'termination', terminated: 'termination', cheques: 'check', cheque: 'check', currencies: 'currency', cash: 'currency', flat: 'apartment', flats: 'apartment', letting: 'lease', lettings: 'lease', solicitor: 'lawyer', solicitors: 'lawyer', creche: 'childcare', creches: 'childcare', tube: 'transit', tram: 'transit', underground: 'transit', bills: 'utility', utilities: 'utility', cancellations: 'cancellation', cancelling: 'cancel', misrepresentation: 'misrepresentation', unlocking: 'unlock', disputes: 'dispute', contracts: 'contract', complaints: 'complaint', documentation: 'document', identification: 'identity' };

export const STATUTORY_PROPER_TERMS = new Set([
  'sin', 'ohip', 'msp', 'ejari', 'omny', 'anmeldung', 'wws', 'buergeramt', 'bürgeramt',
  'ircc', 'uscis', 'tds', 'cwelcc', 'pgwp', 'sowp', 'chancenkarte', 'fsa', 'hsa',
  'presto', 'medicare', 'cra', 'cbsa', 'copr', 'n12', 'n13', 't2', 'ltb', 'rtb',
  'singpass', 'oyster', 'bvg', 'navigo', 'vevo', 'whv', 'aewv', 'inburgering'
]);

const SETTLEMENT_SYNSETS = [
  [/\b(?:rent hike|raised rent|raise rent|increase rent|rent increase|rent surge)\b/i, ['rent', 'increase', 'guideline', 'percentage', 'lawful']],
  [/\b(?:carry(?:ing)?\s+cash|declar(?:e|ing|ation)\s+(?:cash|money|currency)|bringing\s+cash|cash\b[^?.!]{0,60}\b(?:border|airport|customs)|(?:border|airport|customs)\b[^?.!]{0,60}\bcash|currency\s+declaration|10,?000\s+(?:cash|dollars))\b/i, ['currency', 'monetary', 'declare', 'customs', 'ten', 'thousand']],
  [/\b(?:fired|laid off|let go|termination|severance|job loss)\b/i, ['termination', 'severance', 'notice', 'standards', 'pay']],
  [/\b(?:doctor|physician|clinic|gp|hospital|sick)\b/i, ['health', 'insurance', 'coverage', 'physician', 'services']],
  [/\b(?:pgwp|post[- ]grad)\b/i, ['pgwp', 'graduation', 'work', 'permit', 'dli', 'eligibility']],
  [/\b(?:sowp|spous(?:e|al).*(?:work permit|sowp)|spousal open work)\b/i, ['sowp', 'spousal', 'open', 'work', 'permit', 'sponsorship']],
  [/\b(?:daycare|childcare|creche|babysit)\b/i, ['childcare', 'daycare', 'subsidy', 'licensed', 'cwelcc']],
  [/\b(?:driver'?s? licen[cs]e|driving test|g2|full g)\b/i, ['licence', 'driving', 'exchange', 'graduated', 'road', 'test']],
  [/\b(?:foreign property|401k|ira)\b/i, ['foreign', 'property', 'tax', 't1135', 'residency', 'cra']],
  [/\b(?:tfsa|tax[- ]free savings account)\b/i, ['tfsa', 'tax', 'free', 'savings', 'account', 'contribution', 'cra']],
  [/\b(?:rrsp|registered retirement savings plan)\b/i, ['rrsp', 'retirement', 'savings', 'plan', 'deduction', 'cra']],
  [/\b(?:deposit|damage deposit|key fee)\b/i, ['deposit', 'rent', 'key', 'security', 'last', 'month']],
  [/\b(?:nurs(?:e|es|ing)|ien|nclex|cno)\b/i, ['nursing', 'nurse', 'nnas', 'credential', 'evaluation', 'licensure']],
  [/\b(?:chancenkarte|opportunity card)\b/i, ['chancenkarte', 'opportunity', 'card', 'points', 'vocational', 'aufenthg']],
  [/\b(?:golden visa|uae golden)\b/i, ['golden', 'visa', 'salary', 'estate', 'investor', 'equity', 'icp']],
  [/\b(?:sublet(?:ting)?|assign(?:ment|ing)?|break lease)\b/i, ['sublet', 'assignment', 'lease', 'landlord', 'refusal', 'consent']],
  [/\b(?:no credit(?: history)?|without credit)\b/i, ['credit', 'history', 'discrimination', 'landlord', 'guarantor', 'ohrc']],
  [/\b(?:rhca|reciprocal (?:medicare|health))\b/i, ['medicare', 'reciprocal', 'rhca', 'agreement', 'inpatient', 'pbs']],
  [/\b(?:j[- ]?1 waiver|212\(?e\)?|two[- ]year (?:home )?residence)\b/i, ['waiver', 'foreign', 'residence', 'ina', 'exchange', 'ds3035']],
  [/\b(?:soft landing|pr landing|first landing|when I land|landing in|documents? (?:to|should I) carry|landing documents?)\b/i, ['landing', 'arriving', 'arrival', 'copr', 'permanent', 'resident', 'settlement', 'first', 'two', 'weeks', 'documents', 'cbsa', 'border', 'entry']],
  [/\b(?:flagpoling|flagpole|border run)\b/i, ['flagpoling', 'border', 'cbsa', 'port', 'entry', 'permit']],
  [/\b(?:implied status|maintained status|section 186|section 3c|3c leave)\b/i, ['maintained', 'status', 'irpr', 'extension', 'work', 'permit', '3c', 'leave']],
  [/\b(?:work\s+permit\b[^?.!]{0,80}\b(?:expir(?:ed|es|ing|y)|renew(?:al|ing|ed)?|extend(?:ing|ed|sion)?|waiting)|(?:renew(?:ing|al)?|extend(?:ing|sion)?)\s+(?:a|my|the)?\s*work\s+permit|(?:applied|applying|submitted)\s+(?:to|for)\s+(?:a\s+)?(?:renew(?:al)?|extend|extension)\b[^?.!]{0,70}\b(?:keep\s+working|continue\s+working|still\s+work|allowed\s+to\s+work|can\s+i\s+work))\b/i, ['maintained', 'implied', 'status', 'irpr', 'r186', 'r183', 'extension', 'conditions', 'decision']],
  [/\b(?:visitor record|extend stay|status restoration)\b/i, ['visitor', 'record', 'restoration', 'ircc', 'ninety', 'days']],
  [/\b(?:renoviction|n12|n13|landlord own use)\b/i, ['eviction', 'n12', 'n13', 'compensation', 'bad', 'faith', 'ltb']],
  [/\b(?:sick child|sick toddler|urgent care|walk-in|walk[- ]in (?:clinic|cent(?:er|re)|care|doctor|medical)|emergency room|without doctor)\b/i, ['health', 'ohip', 'msp', 'coverage', 'care', 'clinic', 'physician']],
  [/\b(?:locked (?:(?:me|us|him|her|them) )?out|lockout|changed (?:the |my |our )?locks?|threw out|illegal eviction|kick(?:ed)? (?:me )?out)\b/i, ['eviction', 'ltb', 'police', 'locks', 'tenant', 'rights', 't2', 'unlawful']],
  [/\b(?:unpaid wage|unpaid overtime|withheld pay|stolen wages|boss won'?t pay)\b/i, ['wage', 'overtime', 'esa', 'employment', 'standards', 'claim', 'pay']],
  [/\b(?:first home|buy home|buying house|fhsa|downpayment)\b/i, ['first', 'home', 'fhsa', 'hbp', 'rrsp', 'tax', 'deduction', 'savings']],
  [/\b(?:criminal record|dui|rehabilitation|past conviction|entry denied)\b/i, ['rehabilitation', 'deemed', 'inadmissibility', 'irpa', 'conviction', 'sentence', 'trp']],
  [/\b(?:stolen sin|lost sin|compromised sin|sin fraud|identity theft)\b/i, ['sin', 'social', 'insurance', 'fraud', 'service', 'canada', 'protection', 'number']],
  [/\b(?:money from parents|overseas gift|wire transfer|foreign remittance|deed of gift|send(?:ing)? money|remittance)\b/i, ['gift', 'wire', 'transfer', 'fintrac', 'tax', 'free', 'parental', 'bank', 'funds']],
  [/\b(?:super visa insurance|parents visitor visa|lico income)\b/i, ['super', 'visa', 'insurance', 'lico', 'medical', 'coverage', 'undertaking', 'parents']],
  [/\b(?:mould|mold|broken|leak|leaking|cockroach(?:es)?|bedbugs?|infest(?:ation|ed)?|pest(?:s)?|repairs?|maintenance|fix(?:ing)?)\b/i, ['repairs', 'maintenance', 'repair']],
  [/\b(?:child benefit|ccb)\b/i, ['ccb', 'child', 'benefit', 'canada', 'cra']],
  [/\b(?:immigration health surcharge|\bihs\b|health surcharge)\b/i, ['ihs', 'immigration', 'health', 'surcharge', 'waiver', 'destitution']],
  [/\b(?:recruiter|recruitment|job agency)\b.*\b(?:charge|fee)\b|\b(?:charge|fee)\b.*\b(?:recruiter|recruitment|job agency)\b/i, ['recruitment', 'recruiting', 'fee', 'fees', 'employer', 'compliance', 'esdc']],
  [/\b(?:rental scam|fake listing|rental fraud|listing scam)\b/i, ['scam', 'fraud', 'rental', 'listing', 'deposit', 'prevention']],
  [/\b(?:medical exam|immigration medical)\b/i, ['medical', 'exam', 'examination', 'physician', 'ifhp', 'coverage']],
  [/\b(?:parents and grandparents|\bpgp\b)\b/i, ['parents', 'grandparents', 'sponsorship', 'pgp', 'family']],
  [/\b(?:car insurance|auto insurance)\b/i, ['auto', 'insurance', 'fsra', 'premium', 'licence', 'driving']],
  [/\b(?:unlock(?:ed|ing)?)\b/i, ['unlock', 'unlocking', 'device', 'wireless', 'code', 'crtc']],
  [/\b(?:cell(?:phone)?|wireless|mobile phone|phone|sim)\b/i, ['mobile', 'phone', 'wireless', 'carrier', 'telecom']],
  [/\b(?:cancellations?|cancelling|cancel|cooling[- ]off)\b/i, ['cancel', 'cancellation', 'contract', 'contracts', 'dispute', 'termination', 'cooling']],
  [/\b(?:billing dispute|dispute bill|billing|overbilling|overcharge)\b/i, ['billing', 'dispute', 'bill', 'complaint', 'charges', 'cancel', 'cancellation', 'contract']],
  [/\b(?:device unlocking|unlocking|unlocked device)\b/i, ['unlock', 'unlocking', 'device', 'wireless', 'phone', 'carrier', 'code', 'crtc']],
  [/\b(?:contract misrepresentation|misrepresentation|deceptive practices?)\b/i, ['contract', 'misrepresentation', 'consumer', 'protection', 'rights', 'deceptive', 'fraud']],
  [/\b(?:name mismatch|name discrepancy|spelling error|typo on)\b/i, ['name', 'amendment', 'correction', 'document', 'identity', 'passport', 'verification', 'documentation']],
  [/\b(?:lost|stolen|missing) (?:identity|id|documents?|card|passport)\b/i, ['lost', 'stolen', 'identity', 'document', 'replacement', 'card', 'report', 'documentation']],
  [/\b(?:provincial photo id|state id|photo id|municipal id|identity cards?)\b/i, ['identity', 'card', 'photo', 'identification', 'document', 'resident', 'ssn', 'tfn', 'nin']],
  [/\b(?:tax identification numbers?|tax identification|tax id|tin|tfn)\b/i, ['tax', 'number', 'identification', 'ssn', 'tfn', 'file', 'revenue', 'steuer', 'ird', 'sin']],
  [/\b(?:misclassif(?:ication|ications|ied|ying|y)?|contractor classification|independent contractor)\b/i, ['misclassification', 'misclassifying', 'independent', 'contractor', 'employee', 'classification']],
  [/\b(?:licen[cs]e expiry|licen[cs]e renewal|renewing (?:a )?licen[cs]e|expired licen[cs]e)\b/i, ['licence', 'expiry', 'renewal', 'expire', 'renew', 'driving']],
  [/\b(?:vehicle import(?:ation)?|importing (?:a )?(?:car|vehicle))\b/i, ['vehicle', 'import', 'importation', 'car', 'standards', 'border']],
  [/\b(?:used vehicle purchase|buying (?:a )?used (?:car|vehicle)|used car purchase)\b/i, ['used', 'vehicle', 'purchase', 'title', 'car', 'transfer']],
  [/\b(?:wrongful dismissal|unlawful termination|unfair dismissal|unjust dismissal)\b/i, ['dismissal', 'wrongful', 'termination', 'unfair', 'notice', 'severance']],
  [/\b(?:workplace injury|workers compensation|occupational accident|job injury)\b/i, ['injury', 'workplace', 'workers', 'compensation', 'accident', 'medical']],
  [/\b(?:employer retaliation|employer reprisal|whistleblower retaliation|workplace retaliation)\b/gi, ['retaliation', 'reprisal', 'whistleblower', 'safety', 'rights', 'osha']],
  [/\b(?:housing subsid(?:y|ies)|rent allowance|housing benefit|universal credit housing)\b/i, ['housing', 'subsidy', 'benefit', 'universal', 'credit', 'rent', 'support']],
  [/\b(?:family doctor|family physician|primary care doctor|registering with a gp)\b/i, ['doctor', 'physician', 'primary', 'care', 'registration', 'clinic', 'health']],
  [/\b(?:emergency treatment without insurance|uninsured emergency|emtala)\b/i, ['emergency', 'treatment', 'hospital', 'emtala', 'screening', 'uninsured']],
  [/\b(?:t1135|foreign property reporting|foreign rental income|offshore asset reporting)\b/i, ['t1135', 'foreign', 'property', 'rental', 'income', 'reporting', 'cra', 'tax']],
  [/\b(?:apprenticeship pathway|red seal|skilled trades apprenticeship)\b/i, ['apprenticeship', 'apprentice', 'red', 'seal', 'trades', 'training', 'standards']],
  [/\b(?:language classes|language training|english tuition|amep|integrationskurs|esol|linc)\b/i, ['language', 'classes', 'english', 'tuition', 'training', 'instruction']],
  [/\b(?:local government offices?|municipal council|b[uü]rgeramt|anmeldung|city hall)\b/i, ['local', 'government', 'council', 'municipal', 'registration', 'office', 'services']],
  [/\b(?:free newcomer services|settlement support|sets program|mbe counselling)\b/i, ['newcomer', 'settlement', 'services', 'support', 'free', 'community']],
  [/\b(?:regional transfers?|multimodal transit|transit transfers?|hopper fare|one fare)\b/i, ['transfer', 'transfers', 'regional', 'transit', 'fare', 'subsidized', 'bus']],
  [/\b(?:driving history recognition|driving experience recognition|driver abstract|driving record)\b/i, ['driving', 'history', 'experience', 'abstract', 'record', 'licence', 'credit']],
  [/\b(?:cross[- ]border transfers?|international wire transfers?|remittances?|wire transfer reporting)\b/i, ['cross', 'border', 'transfer', 'transfers', 'remittance', 'reporting', 'funds', 'wire']],
  [/\b(?:foreign tax credits?|foreign income tax offset|fito|form 1116|double taxation relief)\b/i, ['foreign', 'tax', 'credit', 'credits', 'offset', 'double', 'taxation', 'relief']],
  [/\b(?:job scams?|employment scams?|fake job offers?|recruitment fees?)\b/i, ['scam', 'job', 'recruitment', 'fake', 'fraud', 'fees', 'employment', 'agency']],
  [/\b(?:regulated\s+(?:occupations?|professions?)(?:\s+licenc?e|\s+licensing)?|credential\s+recognition|degree\s+recognition|trade\s+recognition|trades\s+recognition|tra\s+assessment|anerkennung)\b/i, ['qualification', 'qualifications', 'recognition', 'skills', 'assessment', 'trades', 'licensing', 'credential', 'professional', 'anerkennung', 'bqfg', 'fcr']],
  [/\b(?:maternity care|pregnancy care|prenatal care|midwifery|childbirth services)\b/i, ['pregnancy', 'maternity', 'midwife', 'midwifery', 'prenatal', 'care', 'health']],
  [/\b(?:refugee health|ifhp|interim federal health)\b/i, ['refugee', 'health', 'ifhp', 'coverage', 'interim', 'federal', 'medical']],
  [/\b(?:commute planning|commute|transit pass|smartcard|transit system)\b/i, ['transit', 'commute', 'commuter', 'bus', 'train', 'fare', 'transport']],
  [/\b(?:student (?:transit )?fares?|accessible transit|paratransit|concession fares?|fare discounts?|transit discounts?)\b/i, ['transit', 'student', 'fare', 'fares', 'accessible', 'discount', 'discounts', 'concession']],
  [/\b(?:child\s*care subsidy|daycare subsidy|ccfri|accb)\b/i, ['childcare', 'subsidy', 'daycare', 'fee', 'reduction', 'licensed', 'benefit']],
  [/\b(?:school catchment|school zones?|designated school|school registration)\b/i, ['school', 'catchment', 'registration', 'zones', 'district', 'admission']],
  [/\b(?:statute versus policy|statute vs policy|ministerial instructions)\b/i, ['statute', 'policy', 'ministerial', 'instructions', 'irpa', 'guidelines']],
  [/\b(?:subletting|sublet|sublease|assignment of tenancy)\b/i, ['sublet', 'sublease', 'assignment', 'landlord', 'tenant', 'rent']],
  [/\b(?:study\s+permit\s+work|student\s+work\s+authorization|working\s+on\s+study\s+permit|working\s+off\s+campus)\b/i, ['study', 'permit', 'student', 'off', 'campus', 'hours', 'work', '24', 'eligibility']],
  [/\b(?:abuse[- ]related\s+open\s+work\s+permit|vulnerable\s+worker(?:\s+open\s+work\s+permit)?)\b/i, ['vulnerable', 'worker', 'abuse', 'open', 'permit', 'vwowp', 'employer']],
  [/\b(?:emergency\s+(?:interim\s+)?accommodation|snowstorm\s+emergency|emergency\s+shelter)\b/i, ['emergency', 'accommodation', 'shelter', 'interim', 'housing', 'homelessness']],
  [/\b(?:minor|child)\s+travell?ing\s+with\s+(?:one\s+)?parent\b/i, ['minor', 'child', 'parent', 'parental', 'authority', 'custody', 'travel', 'consent', 'separated']],
  [/\b(?:food\s+banks?|emergency\s+food|food\s+relief|food\s+parcels?)\b/i, ['food', 'bank', 'banks', 'relief', 'emergency', 'groceries', 'parcels']],
  [/\b(?:pr\s+card\s+renewal|pr\s+card\s+expiry|renewing\s+pr\s+card)\b/i, ['pr', 'card', 'expiry', 'permanent', 'resident', 'status', 'renewal', 'validity']],
  [/\b(?:residency\s+obligation|continuous\s+residence|physical\s+presence\s+requirements?)\b/i, ['residency', 'residence', 'continuous', 'permanent', 'resident', 'pr', 'physical', 'presence']],
  [/\b(?:resume\s+screening|cv\s+screening|job\s+screening|applicant\s+screening)\b/i, ['resume', 'screening', 'hiring', 'recruitment', 'employment', 'cv']],
  [/\b(?:retroactive\s+(?:rule\s+changes?|policies?)|transitional\s+provisions?|grandfather(?:ing)?)\b/i, ['transitional', 'provisions', 'retroactive', 'rule', 'changes', 'policy', 'recourse']],
  [/\b(?:employer[- ]specific\s+permit|closed\s+work\s+permit|employer[- ]tied\s+visa|employer[- ]sponsored\s+visa)\b/i, ['employer', 'permit', 'work', 'closed', 'specific', 'sponsor', 'compliance']],
  [/\b(?:ministerial\s+discretion|humanitarian\s+and\s+compassionate|h\s*&\s*c)\b/i, ['ministerial', 'discretion', 'humanitarian', 'compassionate', 'irpa', 'hardship']],
  [/\b(?:workplace\s+injur(?:y|ies)|workplace\s+accidents?|workers?\s+compensation|occupational\s+injur(?:y|ies))\b/i, ['injury', 'workplace', 'accident', 'compensation', 'safety', 'claims']],
  [/\b(?:relationship\s+evidence|proof\s+of\s+relationship|genuine\s+relationship)\b/i, ['spousal', 'partner', 'sponsorship', 'common', 'law', 'cohabitation', 'family', 'reunification']],
  [/\b(?:police\s+(?:certificates?|clearances?|checks?)|criminal\s+record\s+checks?|vulnerable\s+sector\s+checks?|pcc)\b/i, ['police', 'certificate', 'clearance', 'pcc', 'criminal', 'record', 'check', 'ircc']],
  [/\b(?:employer\s+threats?|threatens?\s+(?:me|my|workers?|employees?|deportation))\b/i, ['vulnerable', 'worker', 'abuse', 'open', 'work', 'permit', 'irpr', '207', 'reprisal']],
  [/\b(?:online\s+immigration\s+account|government\s+(?:login|portal(?:\s+errors?)?)|lost\s+(?:government\s+)?login|gckey|ircc\s+(?:account|portal|webform)|visa\s+portal(?:\s+errors?)?)\b/i, ['ircc', 'portal', 'webform', 'online', 'application', 'account', 'technical', 'failure']]
];

export function tokenize(text) {
  return (text.normalize('NFKC').toLowerCase().match(/[a-z0-9]+/g) || []).filter(t => !stopwords.has(t)).map(t => variants[t] || t);
}
export function queryTerms(question) {
  const terms = tokenize(question);
  if (/\bsin\b|social insurance number/i.test(question)) terms.push('social', 'insurance', 'sin');
  if (/\bohip\b/i.test(question)) terms.push('ontario', 'health', 'insurance');
  if (/\bmsp\b/i.test(question)) terms.push('bc', 'health', 'insurance');
  for (const [pattern, synset] of SETTLEMENT_SYNSETS) {
    if (pattern.test(question)) terms.push(...synset);
  }
  // Official maintained-status guidance describes travel as leaving Canada,
  // re-entry and resuming work/study. Scope these synonyms to both concepts;
  // expanding every PGWP or employment-leave question would dilute relevance.
  if (/\b(?:maintained|implied) status\b/i.test(question) &&
    /\b(?:travel|outside|leav(?:e|ing)|re[- ]?entr(?:y|ies)|re[- ]?enter|return)\b/i.test(question)) {
    terms.push('leave', 'leaves', 'leaving', 're', 'entry', 'return', 'resume');
  }
  return [...new Set(terms)];
}
// Records are immutable snapshot objects (the same references are served until
// the evidence version changes), so tokenizing each one once per object keeps
// the lexical fallback O(corpus) cheap on every request.
const recordTokens = new WeakMap();
const tokensOf = record => { let words = recordTokens.get(record); if (words === undefined) { words = tokenize(`${record.title} ${record.summary} ${record.quote} ${record.topic}`); recordTokens.set(record, words); } return words; };
export function rankLexically(records, terms = []) {
  return rankTokenized(records.map(record => ({ record, words: tokensOf(record) })), terms);
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

export function rankTokenized(documents, terms = []) {
  const corpus = documents.map(({ record, words }) => {
    const counts = new Map();
    words.forEach(word => counts.set(word, (counts.get(word) || 0) + 1));
    return { record, words, counts };
  });
  const avg = corpus.reduce((n, d) => n + d.words.length, 0) / (corpus.length || 1), k1 = 1.2, b = 0.75;
  const frequencies = new Map(terms.map(term => [term, corpus.filter(d => d.counts.has(term)).length]));
  return corpus.map(d => {
    const matches = terms.filter(term => d.counts.has(term));
    const score = matches.reduce((sum, term) => {
      const df = frequencies.get(term), tf = d.counts.get(term);
      const idf = Math.log(1 + (corpus.length - df + 0.5) / (df + 0.5));
      const weight = getTermWeight(term);
      return sum + (idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * d.words.length / (avg || 1)))) * weight;
    }, 0);
    return { ...d.record, lexicalScore: Number(score.toFixed(6)), matchedTerms: matches };
  });
}
