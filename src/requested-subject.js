import { tokenize } from './search.js';

// Extract only explicitly named subjects. Do not infer a subject from an open
// narrative, a catalogue category, or query-expansion terms.
const SUBJECT_PATTERNS = [
  /^what does (.+?) mean(?:\s+in\b|[?;.]|$)/i,
  /^who can use (.+?) services?\s+in\b/i,
  /^is (.+?) handled by\b/i,
  /^where can i find (?:official )?information about (.+?)(?:\s+in\b|[?;.]|$)/i,
  /^which documents are (?:normally )?needed for (.+?)\s+in\b/i,
  /^how do i start the process for (.+?)\s+in\b/i,
  /^what steps, fees, timelines and documents apply to (.+?)\s+in\b/i,
  /^which verified local providers can assist .+? with (.+?)\s+in\b/i,
  /^as .+?, how do i deal with (.+?)\s+in\b/i,
  /^what options exist for (.+?)\s+in\b/i,
  /^which official agency should i contact about (.+?)\s+in\b/i,
  /^what are the common mistakes and scams involving (.+?)\s+in\b/i,
  /^how can i verify the eligibility requirements for (.+?)\s+in\b/i,
  /^how would (.+?) affect my\b/i,
  /^compare the available legal and practical routes for (.+?)\s+in\b/i,
  /^what is the difference between the published policy and binding legislation for (.+?)\s+in\b/i,
  /^if the authority refuses my request involving (.+?)\s+in\b/i,
  /^for (.+?)\s+in\s+.+?, (?:compare|distinguish)\b/i,
  /^two government pages give inconsistent guidance on (.+?)\s+for\b/i,
  /^build a decision tree for .+? facing (.+?)\s+in\b/i,
  /^design an auditable case assessment for (.+?)\s+in\b/i,
  /^what is the safest compliant sequence of actions for (.+?)\s+in\b/i,
  /^how do jurisdictional overlaps and conflicting official guidance change the answer to (.+?)\s+in\b/i,
  /;\s*analyze (.+?) under current rules\b/i,
  /;\s*construct a conditional analysis of (.+?), deadlines\b/i,
  /;\s*analyze how (.+?), immigration consequences\b/i,
  /;\s*which conditions, exceptions and deadlines determine my options for (.+?)(?:[?;.]|$)/i,
  /^how can i compare two safe options for (.+?)\s+in\b/i,
  /^what would you do if you were .+?, facing (.+?),\s+and\b/i,
  /^i moved to .+? as a .+?\. (?:i have .+?\.\s+)?has anyone dealt with (.+?),\s+and what should i do first\b/i,
  /^before i submit anything about (.+?)\s+in\b/i,
  /^what is the difference between what the law says and what agencies usually do about (.+?)\s+(?:in|around)\b/i,
  /^if my first request about (.+?)\s+is rejected\b/i,
  /^which deadlines, appeal rights, or exceptions might apply to (.+?)\s+for\b/i,
  /^i am embarrassed to ask: where can a .+? get free or low-cost help with (.+?)\s+(?:around|in)\b/i,
  /^can somebody explain (.+?)\s+in\s+.+?\s+in plain language\b/i,
  /^people in my community keep giving different answers about (.+?)\s+in\b/i,
  /^what should i document today about (.+?)\s+in\b/i,
  /^my situation is messy: .+?\. for a .+? in .+?, which evidence would actually matter for (.+?)(?:[?;.]|$)/i,
  /^i need a step-by-step plan for (.+?)\s+in\b/i,
  /^how do i avoid scams or unnecessary fees while resolving (.+?)\s+(?:in|around)\b/i,
  /^could (.+?) affect my right to remain or work in\b/i,
  /^is (.+?) handled locally or nationally in\b/i,
  /^i was told two (?:different|contradictory) things about (.+?)\s+(?:in|around)\b/i
];

const QUALIFIERS = new Set(['service', 'services', 'process', 'eligibility', 'requirement', 'requirements', 'application', 'applications', 'apply', 'applying', 'applied', 'calculator', 'lost', 'stolen', 'missing', 'plan', 'plans', 'bill', 'bills', 'billing', 'options', 'consumer', 'consumers', 'official', 'photo', 'provincial', 'state', 'number', 'numbers', 'card', 'cards', 'document', 'documents', 'documentation', 'device', 'devices', 'refuse', 'refuses', 'refusing', 'refusal', 'rejected', 'rejection', 'denied', 'denial', 'small', 'verbal', 'safe', 'intake', 'placement', 'unlawful', 'breach', 'language', 'access', 'crisis', 'landlord', 'landlords', 'tenant', 'tenants', 'agency', 'agencies', 'party', 'parties', 'first', 'today', 'after', 'without', 'leave', 'leaves', 'around', 'status', 'statuses', 'different', 'move', 'moved', 'moving', 'arrival', 'mobile', 'internet', 'broadband', 'phone', 'request', 'charges', 'recovery', 'abroad', 'papers', 'permission', 'and', 'for', 'with', 'across', 'into', 'under', 'over', 'between', 'while', 'about', 'from', 'renovation', 'renovations', 'demolition', 'snowstorm', 'weather', 'discount', 'discounts', 'waiting', 'pending', 'delay', 'delays', 'appointment', 'appointments', 'centre', 'membership', 'memberships', 'travelling', 'traveling', 'travel', 'leaving', 'paying', 'listing', 'listings', 'enrolment', 'enrollment', 'entry', 'support', 'supports', 'school', 'schools', 'clinic', 'clinics', 'hospital', 'hospitals', 'local', 'versus', 'vs', 'reunification', 'guidance', 'classification', 'pathway', 'pathways', 'family', 'care', 'rights', 'right', 'related', 'authority', 'authorities', 'authorization', 'authorizations', 'information', 'policy', 'provisions', 'standards', 'standard', 'procedures', 'procedure', 'matters', 'matter', 'assistance', 'help', 'conditions', 'condition', 'law', 'laws', 'statutory', 'statute', 'statutes', 'renewal', 'renewing', 'renewals', 'renew', 'extending', 'extension', 'extensions', 'extend', 'visa', 'visas', 'licence', 'license', 'licensing', 'regulated', 'transitional', 'changes', 'change']);
const FORMS = { rental: 'rent', rentals: 'rent', lease: 'rent', leases: 'rent', tenancy: 'rent', tenancies: 'rent', renter: 'rent', renters: 'rent', automobile: 'car', automobiles: 'car', auto: 'car', automotive: 'car', vehicle: 'car', vehicles: 'car', increases: 'increase', notices: 'notice', evictions: 'eviction', deposits: 'deposit', repairs: 'repair', protections: 'protection', deductions: 'deduction', penalties: 'penalty', fines: 'fine', appeals: 'appeal', agreements: 'agreement', subsidies: 'subsidy', subsidy: 'subsidy', subsidized: 'subsidy', exemptions: 'exemption', inspections: 'inspection', transfers: 'transfer', prescriptions: 'prescription', prescribed: 'prescription', medicine: 'prescription', medicines: 'prescription', medication: 'prescription', medications: 'prescription', retaliations: 'retaliation', retaliatory: 'retaliation', reprisals: 'retaliation', reprisal: 'retaliation', whistleblower: 'retaliation', whistleblowing: 'retaliation', dismissals: 'dismissal', dismissed: 'dismissal', terminations: 'dismissal', termination: 'dismissal', terminated: 'dismissal', injuries: 'injury', injured: 'injury', accidents: 'injury', accident: 'injury', qualifications: 'qualification', certificates: 'certificate', certifications: 'certification', clearances: 'clearance', assessments: 'assessment', exceptions: 'exception', violations: 'violation', infractions: 'infraction', hearings: 'hearing', tribunals: 'tribunal', remedies: 'remedy', standards: 'standard', entitlements: 'entitlement', benefits: 'benefit', registration: 'register', registered: 'register', registering: 'register', recognition: 'recognize', recognized: 'recognize', recognised: 'recognize', recognise: 'recognize', renewal: 'renew', renewing: 'renew', renewals: 'renew', extending: 'renew', extension: 'renew', extensions: 'renew', expires: 'expire', expired: 'expire', expiry: 'expire', expiration: 'expire', importing: 'import', imported: 'import', imports: 'import', importation: 'import', purchasing: 'buy', purchased: 'buy', purchase: 'buy', purchases: 'buy', buying: 'buy', buyer: 'buy', apprenticeship: 'apprentice', apprenticeships: 'apprentice', apprentice: 'apprentice', pathway: 'pathway', pathways: 'pathway', physician: 'doctor', physicians: 'doctor', gp: 'doctor', gps: 'doctor', uninsured: 'insurance', noninsured: 'insurance', admissions: 'admission', admission: 'admission', fares: 'fare', credits: 'credit', obligations: 'obligation', permits: 'permit', classes: 'class', courses: 'course', documents: 'document', documentation: 'document', bills: 'bill', billing: 'bill', disputes: 'dispute', cancellation: 'dispute', cancellations: 'dispute', cancelling: 'dispute', complaints: 'dispute', complaint: 'dispute', plans: 'plan', contracts: 'contract', fees: 'fee', cards: 'card', numbers: 'number', frauds: 'fraud', scams: 'fraud', identifications: 'identity', identification: 'identity', unlocking: 'unlock', unlocked: 'unlock', refuses: 'refuse', refused: 'refuse', taxation: 'tax', taxes: 'tax', wages: 'pay', wage: 'pay', salary: 'pay', salaries: 'pay', allowances: 'pay', allowance: 'pay', overtime: 'overtime', overtimes: 'overtime', holidays: 'holiday', bond: 'deposit', bonds: 'deposit', kaution: 'deposit', fianza: 'deposit', flatmate: 'roommate', flatmates: 'roommate', housemate: 'roommate', housemates: 'roommate', cotenant: 'roommate', cotenants: 'roommate', subletting: 'sublet', sublet: 'sublet', sublease: 'sublet', subleasing: 'sublet', subleases: 'sublet', transport: 'transit', transportation: 'transit', occupations: 'profession', occupation: 'profession', licensing: 'licence', licensed: 'licence', statutory: 'statute', statutes: 'statute', provisions: 'provision', maternity: 'pregnancy', commuter: 'commute', commuters: 'commute', refugees: 'refugee', seekers: 'seeker', discounts: 'discount', concessions: 'concession', providers: 'provider', costs: 'cost', charges: 'charge', laws: 'law', rules: 'rule', regulations: 'regulation', policies: 'policy', guidelines: 'guideline', authorities: 'authority', parents: 'parent', children: 'child', spouses: 'spouse', partners: 'partner', workers: 'worker', employees: 'employee', students: 'student', newcomers: 'newcomer', sponsorship: 'sponsor', sponsored: 'sponsor', sponsoring: 'sponsor', professional: 'profession', professions: 'profession', screening: 'screening', resumes: 'resume', transitional: 'transitional', obligation: 'residency', continuous: 'residency', accredited: 'sponsor', accreditation: 'sponsor', competence: 'recognize' };
function words(text) {
  const expanded = text
    .replace(/\b(?:job scams?|employment scams?|fake job offers?)\b/gi, 'fraud')
    .replace(/\b(?:pr card (?:renew\w*|replacement|validity|expiry)|renew(?:ing)? (?:a )?pr card)\b/gi, 'pr card')
    .replace(/\b(?:licence expiry|license expiry|expired licence|expired license|licence renewal|license renewal|renewing (?:a )?licence)\b/gi, 'licence expire')
    .replace(/\b(?:rental fraud|rental scam|listing impersonation|fake rental|sublet fraud)\b/gi, 'rent fraud')
    .replace(/\b(?:extending|extension|renewing|renewal|renew)\b/gi, 'renew')
    .replace(/\b(?:scams?|fraud|frauds|fraudsters?|identity theft|imposter(?: scams?)?|impersonat(?:e|ion))\b/gi, 'fraud')
    .replace(/\b(?:cancellations?|cancelling|disputes?|complaints?|terminat(?:e|ion|ing))\b/gi, 'dispute')
    .replace(/\b(?:device\s+)?unlock(?:ed|ing)?\b/gi, 'unlock')
    .replace(/\b(?:cell(?:phone)?|wireless|mobile phone|phone)\b/gi, 'mobile')
    .replace(/\b(?:contract\s+)?misrepresentation\b|\bdeceptive\s+practices?\b/gi, 'fraud')
    .replace(/\b(?:name mismatch|name discrepancy|spelling error|typo on (?:visa|permit|card))\b/gi, 'identity')
    .replace(/\b(?:SIN|national insurance numbers?|national insurance|social insurance numbers?|social insurance|social security numbers?|social security|personnummer|personal identity codes?|ird numbers?)\b/gi, 'identity')
    .replace(/\b(?:tax identification numbers?|tax identification|tax file numbers?)\b/gi, 'identity')
    .replace(/\b(?:provincial photo id|state id|photo id|municipal id|city id|photo identification)\b/gi, 'identity')
    .replace(/\b(?:identifies|identify|identifier|identification|identity)\b/gi, 'identity')
    .replace(/\b(?:two\s+countries\s+claim\s+tax\s+residen(?:ce|cy)|dual\s+tax\s+residen(?:ce|cy)|double\s+tax(?:ation)?(?:\s+(?:agreements?|treat(?:y|ies)|conventions?|relief))?)\b/gi, 'doubletax')
    .replace(/\b(?:vat|sales tax|goods and services tax|gst|hst|corporate tax|business tax|dual tax|tax residency|tax return|taxation)\b/gi, 'tax')
    .replace(/\b(?:overseas|out[- ]of[- ]country)\b/gi, 'foreign')
    .replace(/\b(?:driver licence|driving licence|driver license|driving license|licence exchange|license exchange|licence conversion|license conversion|licence transfer|license transfer)\b/gi, 'licence')
    .replace(/\b(?:driving history(?:\s+recognition)?|driving experience(?:\s+recognition)?|foreign driving experience|driving record|driver abstract|driving extract)\b/gi, 'driving experience')
    .replace(/\b(?:car insurance|auto insurance|motor vehicle insurance|vehicle insurance|mandatory insurance|compulsory insurance)\b/gi, 'car insurance')
    .replace(/\b(?:licence expiry|license expiry|expired licence|expired license|licence renewal|license renewal|renewing (?:a )?licence)\b/gi, 'licence expire')
    .replace(/\b(?:rental fraud|rental scam|listing impersonation|fake rental|sublet fraud)\b/gi, 'rent fraud')
    .replace(/\b(?:housing subsidy|housing subsidies|housing allowance|rent geared to income|rgi|subsidized housing|social housing|caf|apl)\b/gi, 'rent subsidy')
    .replace(/\b(?:foreign rental income|overseas rental property|foreign property declaration|foreign property reporting|T1135 reporting|T1135)\b/gi, 'foreign property')
    .replace(/\b(?:cross[- ]border transfers|international money transfer|wire transfer|remittances?|sending money abroad)\b/gi, 'money transfer')
    .replace(/\b(?:prescription transfer|transferring prescriptions?|prescriptions? from home|foreign prescription|prescribed medicines?)\b/gi, 'prescription')
    .replace(/\b(?:maternity care|pregnancy care|prenatal care|childbirth services)\b/gi, 'pregnancy')
    .replace(/\b(?:wrongful dismissal|unjust dismissal|constructive dismissal|unlawful termination|severance pay|termination notice)\b/gi, 'dismissal')
    .replace(/\b(?:workplace injury|workers compensation|wsib|work accident|occupational accident)\b/gi, 'work injury')
    .replace(/\b(?:unpaid overtime|overtime pay|statutory overtime)\b/gi, 'overtime pay')
    .replace(/\b(?:employer retaliation|employer reprisal|reprisals? by employer|reprisal|whistleblower|whistleblowing)\b/gi, 'retaliation')
    .replace(/\b(?:written lease|tenancy agreement|lease agreement|residential lease)\b/gi, 'rent')
    .replace(/\b(?:security\s+deposits?|rental\s+bonds?|damage\s+deposits?|key\s+deposits?|tenancy\s+deposits?|pet\s+deposits?|bonds?|kaution|fianza)\b/gi, 'deposit')
    .replace(/\b(?:roommates?|flatmates?|housemates?|subtenants?|licensees?|cotenants?|co-tenants?)\b/gi, 'roommate')
    .replace(/\b(?:job\s+search(?:\s+without\s+local\s+experience)?|finding\s+work|looking\s+for\s+work)\b/gi, 'job search')
    .replace(/\b(?:job scams?|employment scams?|fake job offers?)\b/gi, 'fraud')
    .replace(/\b(?:regulated occupation licensing|trade recognition|occupational licensing|trades recognition)\b/gi, 'credential recognition')
    .replace(/\b(?:commute(?:\s+planning)?|trip\s+planning|journey\s+planning|public\s+transit|transit\s+system|public\s+transport(?:ation)?)\b/gi, 'transit')
    .replace(/\b(?:regional transfers?|transit transfers?|multimodal transfers?)\b/gi, 'transit transfer')
    .replace(/\b(?:local government offices?|municipal councils?|b[uü]rgeramt|city hall)\b/gi, 'local government')
    .replace(/\b(?:free newcomer services?|settlement services?|settlement support)\b/gi, 'newcomer settlement')
    .replace(/\b(?:accessible\s+transit|paratransit|wheelchair\s+transit|accessible\s+transport)\b/gi, 'accessible transit')
    .replace(/\b(?:student\s+(?:transit\s+)?fares?|concession\s+fares?|youth\s+fares?|fare\s+discounts?)\b/gi, 'transit fare')
    .replace(/\b(?:refugee\s+health(?:\s+coverage)?|ifhp|interim\s+federal\s+health|asylum\s+seeker\s+health)\b/gi, 'refugee health')
    .replace(/\b(?:used\s+vehicle(?:\s+purchase)?|buying\s+a\s+used\s+car|used\s+car\s+purchase)\b/gi, 'car buy')
    .replace(/\b(?:vehicle\s+import(?:ation)?|importing\s+a\s+vehicle|importing\s+a\s+car|riv)\b/gi, 'car import')
    .replace(/\b(?:child\s*care\s+(?:subsid(?:y|ies)|costs?)|daycare\s+subsid(?:y|ies)|free\s+childcare|tax[- ]free\s+childcare)\b/gi, 'childcare')
    .replace(/\b(?:school\s+catchment|school\s+zones?|designated\s+school|school\s+registration|school\s+admissions?)\b/gi, 'school registration')
    .replace(/\b(?:family\s+reunification|family\s+sponsorship|spousal\s+sponsorship|parents\s+and\s+grandparents|pgp)\b/gi, 'sponsorship')
    .replace(/\b(?:work\s+permit\s+restoration|restoration\s+of\s+status|status\s+restoration)\b/gi, 'status restoration')
    .replace(/\b(?:ministerial\s+discretion|humanitarian\s+and\s+compassionate|h\s*&\s*c)\b/gi, 'humanitarian compassionate')
    .replace(/\b(?:statute\s+(?:versus|vs\.?)\s+policy|ministerial\s+instructions)\b/gi, 'statute')
    .replace(/\b(?:retroactive rule changes?|retroactive policies?|retrospective rule changes?)\b/gi, 'retroactive rules')
    .replace(/\b(?:transitional provisions?|transitional measures?|grandfathering provisions?)\b/gi, 'transitional provisions')
    .replace(/\b(?:open work permits?|owp|unrestricted work permit)\b/gi, 'open work permit')
    .replace(/\b(?:employer[- ]specific (?:work )?permits?|closed work permits?)\b/gi, 'employer specific permit')
    .replace(/\b(?:maintained status|implied status|3c leave|fiktionswirkung)\b/gi, 'maintained status')
    .replace(/\b(?:residency obligations?|pr residency requirement|physical presence requirement|citizenship physical presence)\b/gi, 'residency obligation')
    .replace(/\b(?:resume screening|cv screening|applicant screening)\b/gi, 'resume screening')
    .replace(/\b(?:job search without local experience|canadian experience requirement|local experience barrier)\b/gi, 'job search')
    .replace(/\b(?:employment agenc(?:y|ies) verification|recruitment agenc(?:y|ies) verification|licensing of recruiters)\b/gi, 'employment agency')
    .replace(/\b(?:credit building|building credit|credit score building|establishing credit)\b/gi, 'credit building')
    .replace(/\b(?:child benefits?|family tax benefits?|kindergeld|family allowances?)\b/gi, 'child benefit')
    .replace(/\b(?:special education(?: accommodation)?|inclusive education|individual education plan|iep|send support)\b/gi, 'special education')
    .replace(/\b(?:rental application without credit|renting without credit|no credit rental)\b/gi, 'rent credit')
    .replace(/\b(?:roommate tenancy status|roommate rights|flatmate rights|cotenant status)\b/gi, 'roommate')
    .replace(/\b(?:settlement agenc(?:y|ies) eligibility|settlement service eligibility)\b/gi, 'newcomer settlement')
    .replace(/\b(?:foreign transcript authentication|transcript authentication|degree attestation|diploma authentication)\b/gi, 'recognize')
    .replace(/\b(?:benefit eligibility|government benefits? eligibility)\b/gi, 'benefit eligibility')
    .replace(/\b(?:pr card (?:renew\w*|replacement|validity|expiry)|renew(?:ing)? (?:a )?pr card)\b/gi, 'pr card')
    .replace(/\b(?:community\s+interpretation|language\s+access|translation\s+services?|interpreter)\b/gi, 'language access')
    .replace(/\b(?:mould and unsafe heating|unsafe heating|heating repairs|tenant repairs)\b/gi, 'repairs')
    .replace(/\b(?:bank account|basic payment account|checking account|girokonto|basiskonto)\b/gi, 'bank account')
    .replace(/\b(?:moving with pets|importing pets|travel with pets|bringing a dog|bringing a cat)\b/gi, 'pet')
    .replace(/\b(?:foreign degree recognition|credential recognition|degree recognition|diploma recognition|qualification recognition|educational credential assessment|ECA)\b/gi, 'recognize')
    .replace(/\b(?:employer\s+(?:abuse|threats?)|threatens?\s+(?:deportation|workers?)|vulnerable\s+workers?(?:\s+open\s+work\s+permit)?)\b/gi, 'vulnerable worker abuse')
    .replace(/\b(?:online\s+application\s+portal\s+(?:bugs?|technical\s+failures?)|(?:government|visa|immigration|application)\s+portal\s+(?:errors?|bugs?|outages?|glitches?|failures?))\b/gi, 'portal outage')
    .replace(/\b(?:police\s+(?:certificates?|clearances?|checks?)|criminal\s+record\s+checks?|vulnerable\s+sector\s+checks?|pcc)\b/gi, 'police certificate')
    .replace(/\b(?:utility\s+(?:bills?|costs?|charges?|billing)|water\s+(?:bills?|billing|charges?|connections?))\b/gi, 'utility bill')
    .replace(/\b(?:employer[- ]linked\s+)?work\s+permi(?:t|ssion)s?\b/gi, 'work permit')
    .replace(/\b(?:emergency treatment without insurance|uninsured emergency|emtala|emergency medical treatment)\b/gi, 'emergency health')
    .replace(/\b(?:family doctor(?: registration)?|family physician|registering with a gp|gp registration|find a doctor)\b/gi, 'doctor')
    .replace(/\b(?:regulated\s+occupations?|regulated\s+professions?)\b/gi, 'regulated profession')
    .replace(/\b(?:apprenticeship pathway|red seal|skilled trades apprenticeship)\b/gi, 'apprentice pathway')
    .replace(/\b(?:foreign tax credits?|foreign tax credit relief|double taxation relief|ftcr)\b/gi, 'foreign tax credit')
    .replace(/\b(?:immigration\s+)?medical\s+(?:examination|exam|assessment)s?\b/gi, 'health')
    .replace(/\b(?:overtime and holiday pay|statutory holiday|public holiday)\b/gi, 'overtime holiday')
    .replace(/\bsim cards?\b/gi, 'sim')
    .replace(/\b(?:adult\s+)?language (?:class(?:es)?|courses?|lessons?|training|instruction)(?:\s+eligibility)?\b/gi, 'language instruction')
    .replace(/\banother (?:province,? state or )?country\b/gi, 'foreign')
    .replace(/\bPGWP\b/gi, 'post graduation work permit')
    .replace(/\b(?:snowstorm\s+)?emergency\s+(?:interim\s+)?(?:accommodation|shelter|housing)\b/gi, 'emergency shelter')
    .replace(/\b(?:minor|child)\s+travell?ing\s+with\s+(?:one\s+)?parent\b|\b(?:custody documents from another country|custody documents|cross-border custody)\b/gi, 'custody parent')
    .replace(/\b(?:business\s+)?founder\s+residence\b|\bstartup\s+residence\b/gi, 'entrepreneur visa')
    .replace(/\b(?:bank\s+account\s+)?without\s+address\b/gi, 'bank account')
    .replace(/\bpublic\s+transport\s+discount(?:s)?\b/gi, 'transit')
    .replace(/\b(?:public\s+)?health\s+coverage(?:\s+waiting)?\b/gi, 'health')
    .replace(/\b(?:worker\s+)?misclassif(?:y|ying|ied|ication|ications)?(?:\s+as\s+independent\s+contractor)?\b/gi, 'misclassification')
    .replace(/\b(?:closed work permit job loss|losing job on closed work permit|job loss on work permit)\b/gi, 'work permit')
    .replace(/\b(?:work\s+permits?|work\s+visas?|work\s+authorizations?|employment\s+visas?)\b/gi, 'work permit')
    .replace(/\b(?:residency\s+obligation|continuous\s+residence|physical\s+presence\s+requirements?)\b/gi, 'residency')
    .replace(/\b(?:retroactive\s+(?:rule\s+changes?|policies?)|transitional\s+provisions?)\b/gi, 'transitional')
    .replace(/\b(?:resume\s+screening|cv\s+screening|job\s+screening)\b/gi, 'resume')
    .replace(/\b(?:parental leave and work authorization|parental leave|maternity leave|paternity leave|pregnancy leave|parental benefit)\b/gi, 'parental leave')
    .replace(/\b(?:unpaid overtime(?:\s+with\s+variable\s+shifts)?|overtime with variable shifts)\b/gi, 'unpaid overtime')
    .replace(/\b(?:mental health crisis(?: interpretation)?|mental health support)\b/gi, 'mental health')
    .replace(/\b(?:pregnancy care before coverage starts|prenatal care before coverage starts)\b/gi, 'pregnancy')
    .replace(/\b(?:unpaid trial shift|trial shifts?)\b/gi, 'wage pay')
    .replace(/\b(?:credit history without Canadian loans|credit building without loans)\b/gi, 'credit')
    .replace(/\b(?:government benefits overpayment recovery|benefit overpayment recovery)\b/gi, 'overpayment recovery')
    .replace(/\b(?:food bank eligibility without proof of income|food bank without income)\b/gi, 'food bank')
    .replace(/\b(?:regulated\s+occupations?|regulated\s+professions?)(?:\s+licensing)?\b/gi, 'profession')
    .replace(/\b(?:driving history(?:\s+recognition)?|driving record extract)\b/gi, 'extract')
    .replace(/\b(?:winter driving|winter road safety)\b/gi, 'winter')
    .replace(/\b(?:sponsor licence|sponsor license|sponsorship license)\b/gi, 'sponsor')
    .replace(/\b(?:study\s+permit\s+work\s+rights|student\s+work\s+authorization|working\s+on\s+study\s+permit|working\s+off\s+campus)\b/gi, 'study permit work')
    .replace(/\b(?:abuse[- ]related\s+open\s+work\s+permit|vulnerable\s+worker\s+(?:open\s+)?work\s+permit)\b/gi, 'open work permit abuse')
    .replace(/\b(?:pregnancy\s+care\s+with\s+pending\s+status|prenatal\s+care\s+with\s+pending\s+status)\b/gi, 'pregnancy')
    .replace(/\b(?:food\s+bank\s+access\s+without\s+id|food\s+bank\s+without\s+id)\b/gi, 'food bank')
    .replace(/\b(?:employment\s+legal\s+help|workplace\s+legal\s+help)\b/gi, 'legal aid employment')
    .replace(/\b(?:visitor\s+record\s+extension|visitor\s+extension\s+after\s+expiry)\b/gi, 'visitor record renew')
    .replace(/\b(?:remote\s+work\s+across\s+borders|cross[- ]border\s+remote\s+work)\b/gi, 'remote work')
    .replace(/\b(?:prescription\s+from\s+home\s+country|foreign\s+prescription)\b/gi, 'prescription')
    .replace(/\b(?:long\s+term\s+care\s+eligibility|home\s+care\s+access)\b/gi, 'home care')
    .replace(/\b(?:false\s+job\s+offer\s+for\s+visa|fake\s+job\s+offer\s+visa)\b/gi, 'job fraud')
    .replace(/\b(?:online\s+immigration\s+account(?:\s+lockout)?|digital\s+visa\s+account(?:\s+lockout)?)\b/gi, 'online immigration account')
    .replace(/\b(?:family physician|general practitioner|GP)\b/gi, 'family doctor');
  return new Set(tokenize(expanded).map(word => FORMS[word] || word));
}

export function requestedSubject(question) {
  if (typeof question !== 'string') return null;
  const text = question.trim().replace(/\s+/g, ' ');
  for (const pattern of SUBJECT_PATTERNS) {
    const match = pattern.exec(text);
    if (match) return match[1].trim();
  }
  if (/\bpension\s+portability\b/i.test(text)) return 'pension portability';
  return null;
}

// A necessary lexical check, not proof of factual correctness or completeness.
// A record must cover the named subject itself, not merely a place, the user's
// background, template wording, or synonyms added to the search query.
export function subjectEvidenceMatcher(question) {
  const subject = requestedSubject(question);
  if (!subject) return () => true;
  const required = [...words(subject)].filter(word => !QUALIFIERS.has(word));
  if (!required.length) return () => true;
  const matches = new WeakMap();
  return record => {
    if (matches.has(record)) return matches.get(record);
    // A title supplies context for its individual sentences. Do not combine
    // unrelated summary sentences merely because they contain scattered words.
    const title = record.title || '';
    const titleWords = words(title);
    // A lone generic title word (e.g. "employer") is not subject context.
    const titleMatches = required.filter(word => titleWords.has(word));
    const hasTitleContext = required.length > 2 ? titleMatches.length >= 2 : titleMatches.length >= 1;
    const cleanedSummary = (record.summary || '').replace(/\b(?:U\.S\.|s\.|no\.|e\.g\.|i\.e\.|dr\.)/gi, m => m.replace(/\./g, '§§'));
    const rawSentences = cleanedSummary.split(/[.!?](?:\s+|$)/).map(s => s.replace(/§§/g, '.'));
    const passages = [title, ...rawSentences.map(sentence => hasTitleContext ? `${title} ${sentence}` : sentence)];
    const matched = passages.some(passage => {
      const present = words(passage);
      return required.every(word => present.has(word));
    });
    matches.set(record, matched);
    return matched;
  };
}
