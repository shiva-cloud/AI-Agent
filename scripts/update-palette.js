import fs from 'node:fs';

const appPath = 'public/app.js';
let appTxt = fs.readFileSync(appPath, 'utf8');

// 1. Update PERSONA_DIRECTORY
const oldPersonaStart = appTxt.indexOf('const PERSONA_DIRECTORY = [');
const oldPersonaEnd = appTxt.indexOf('];\n\nconst COMMAND_CATEGORIES', oldPersonaStart);

const newPersonaText = `const PERSONA_DIRECTORY = [
  { id: 'all_personas', label: 'All Personas', icon: '👥' },
  { id: 'student', label: 'Student (PAL/PGWP)', icon: '🎓', tools: ['cmd-study-permit-cap-pal', 'cmd-study-to-pr', 'student-compliance', 'sin-healthcare', 'childcare', 'driving', 'auto-insurance', 'cra-benefits', 'insider-remote-work', 'cmd-study-permit-off-campus-work', 'cmd-alberta-youth-employment'] },
  { id: 'worker', label: 'Worker / TFW', icon: '💼', tools: ['cmd-lmia-readiness', 'cmd-severance-bardal', 'cmd-legal-notices', 'statutory-pay', 'worker-classification', 'vulnerable-worker', 'human-rights-defense', 'bowp-diagnostic', 'insider-maintained-status', 'insider-on-esa-severance', 'cmd-bc-illness-injury-leave', 'cmd-alberta-maternity-parental', 'cmd-ontario-employment-reprisal', 'cmd-ontario-public-holiday-pay', 'cmd-bc-overtime-banking', 'cmd-alberta-constructive-dismissal', 'cmd-alberta-general-holiday-pay', 'cmd-manitoba-holiday-pay', 'cmd-c12-professional-fta'] },
  { id: 'pr_newcomer', label: 'PR / Newcomer', icon: '🍁', tools: ['cmd-pr-matrix', 'express-entry-crs', 'pnp-pathway', 'cmd-tax-shield', 'cmd-cra-newcomer-wealth', 'cmd-moving-tax-calc', 'cmd-calendar-sync', 'bsf186-engine', 'citizenship', 'pr-residency', 'insider-expired-pr-card', 'cmd-caregiver-pr-experience', 'cmd-c11-entrepreneur', 'cmd-francophone-mobility-c16', 'cmd-bowp-pr-aor', 'cmd-start-up-visa-peer-review'] },
  { id: 'family', label: 'Family & Parents', icon: '👨‍👩‍👧‍👦', tools: ['cmd-family-reunification', 'cmd-super-visa-lico', 'super-visa-sponsor', 'family-law', 'parental-leave', 'schools', 'childcare', 'social-assistance', 'insider-family-bar', 'cmd-super-visa-medical-insurance', 'cmd-alberta-maternity-parental', 'cmd-caregiver-pr-experience', 'cmd-alberta-youth-employment'] },
  { id: 'renter', label: 'Renter / Tenant', icon: '🏠', tools: ['cmd-ontario-bc-tenancy', 'cmd-legal-notices', 'lease-guard', 'eviction-defense', 'rent-increase', 'lease-assignment', 'homebuyer-tax', 'insider-shared-kitchen', 'insider-post-2018-rent', 'insider-n12-timing', 'insider-calgary-suite', 'cmd-ontario-urgent-repairs-t6', 'cmd-ontario-rent-deposit-interest', 'cmd-bc-security-deposit-double', 'cmd-saskatchewan-security-deposit', 'cmd-ontario-illegal-entry-t2', 'cmd-alberta-periodic-tenancy-termination', 'cmd-bc-dispute-resolution-urgency', 'cmd-bc-strata-depreciation-crf'] },
  { id: 'global_expat', label: 'Global Expat', icon: '🌐', tools: ['cmd-global-visa-matrix', 'cmd-us-h1b-opt', 'cmd-uk-skilled-worker', 'cmd-australia-reforms', 'cmd-germany-chancenkarte', 'cmd-global-expat', 'insider-us-h1b-severance', 'insider-de-nebenkosten', 'insider-uae-gratuity-wps'] }
];`;

appTxt = appTxt.slice(0, oldPersonaStart) + newPersonaText + appTxt.slice(oldPersonaEnd + 2);

// 2. Add 25 new tools to COMMAND_DIRECTORY
const newCommands = [
  {
    "id": "cmd-c11-entrepreneur",
    "toolModal": "c11-entrepreneur",
    "category": "immigration",
    "title": "Federal C11 Entrepreneur & Self-Employed Work Permit Navigator",
    "desc": "Evaluate LMIA-exempt work permit eligibility for business owners under IRPR s. 205(a) Exemption Code C11",
    "icon": "💼",
    "keywords": ["c11", "entrepreneur", "self-employed", "work permit", "business owner", "significant benefit", "lmia exempt"]
  },
  {
    "id": "cmd-alberta-maternity-parental",
    "toolModal": "alberta-maternity-parental",
    "category": "labor",
    "title": "Alberta Maternity & Parental Leave Navigator",
    "desc": "Evaluate 90-day qualification, 16 weeks maternity, 62 weeks parental, and job protection under Alberta ESC ss. 45-53.1",
    "icon": "👶",
    "keywords": ["maternity", "parental leave", "alberta", "job protection", "reinstatement", "esc", "employment standards"]
  },
  {
    "id": "cmd-ontario-urgent-repairs-t6",
    "toolModal": "ontario-urgent-repairs-t6",
    "category": "housing",
    "title": "Ontario Urgent Repairs & Vital Services T6 Tenancy Navigator",
    "desc": "Audit heating standards (min 20°C O. Reg. 516/06), vital service shutoffs, and LTB Form T6 rent abatements under RTA ss. 20-31",
    "icon": "🔧",
    "keywords": ["urgent repairs", "heating", "vital services", "t6", "ltb", "maintenance", "ontario", "rent abatement"]
  },
  {
    "id": "cmd-bc-illness-injury-leave",
    "toolModal": "bc-illness-injury-leave",
    "category": "labor",
    "title": "British Columbia Paid Illness & Injury Leave Navigator",
    "desc": "Audit 5 paid plus 3 unpaid statutory sick days, average day's pay formula, and anti-reprisal rights under BC ESA s. 49.1",
    "icon": "🏥",
    "keywords": ["sick leave", "illness", "injury", "paid sick days", "bc esa", "british columbia", "anti-reprisal"]
  },
  {
    "id": "cmd-francophone-mobility-c16",
    "toolModal": "francophone-mobility-c16",
    "category": "immigration",
    "title": "Francophone Mobility Work Permit (C16) Expansion Navigator",
    "desc": "Evaluate LMIA exemption for French-speaking candidates (NCLC 5+ oral) across all TEER 0-5 occupations outside Quebec",
    "icon": "⚜️",
    "keywords": ["francophone mobility", "c16", "french", "lmia exempt", "teer", "nclc 5", "irpr 205"]
  },
  {
    "id": "cmd-bowp-pr-aor",
    "toolModal": "bowp-pr-aor",
    "category": "immigration",
    "title": "Bridging Open Work Permit (BOWP) PR Acknowledgement of Receipt Navigator",
    "desc": "Audit BOWP eligibility, in-Canada status, work permit expiry within 120 days, and IRPR s. 10 completeness AOR under Exemption A75",
    "icon": "📄",
    "keywords": ["bowp", "bridging open work permit", "aor", "acknowledgement of receipt", "express entry", "pr application"]
  },
  {
    "id": "cmd-ontario-rent-deposit-interest",
    "toolModal": "ontario-rent-deposit-interest",
    "category": "housing",
    "title": "Ontario Rent Deposit & Statutory Annual Interest Navigator",
    "desc": "Calculate annual statutory interest on last month rent deposits at guideline rate (2.5%) and offsets under Ontario RTA ss. 105-106",
    "icon": "💰",
    "keywords": ["rent deposit", "deposit interest", "last month rent", "ontario rta", "guideline interest", "top up offset"]
  },
  {
    "id": "cmd-alberta-general-holiday-pay",
    "toolModal": "alberta-general-holiday-pay",
    "category": "labor",
    "title": "Alberta General Holiday Pay Navigator",
    "desc": "Calculate statutory holiday pay, regular vs non-regular workday rules, 30-day thresholds, and 1.5x premium pay under Alberta ESC ss. 25-33",
    "icon": "📅",
    "keywords": ["holiday pay", "statutory holiday", "alberta esc", "average daily wage", "general holiday", "overtime"]
  },
  {
    "id": "cmd-bc-strata-depreciation-crf",
    "toolModal": "bc-strata-depreciation-crf",
    "category": "housing",
    "title": "British Columbia Strata Depreciation Report & CRF Reserve Navigator",
    "desc": "Audit mandatory 5-year depreciation reports (2024 loophole elimination for 5+ lots) and 10% operating budget CRF contributions",
    "icon": "🏢",
    "keywords": ["strata", "depreciation report", "crf", "contingency reserve fund", "bc strata property act", "form b"]
  },
  {
    "id": "cmd-c12-professional-fta",
    "toolModal": "c12-professional-fta",
    "category": "immigration",
    "title": "Federal Free Trade Agreement (CUSMA / CETA / GATS) Professional Navigator",
    "desc": "Audit LMIA-exempt professional work permits under IRPR s. 204(a) for international trade agreements",
    "icon": "🌐",
    "keywords": ["fta", "cusma", "ceta", "gats", "professional", "lmia exempt", "service contract", "t23"]
  },
  {
    "id": "cmd-ontario-employment-reprisal",
    "toolModal": "ontario-employment-reprisal",
    "category": "labor",
    "title": "Ontario Employment Standards Reprisal Complaint Navigator",
    "desc": "Audit unlawful penalties or terminations for asserting ESA rights, enforcing statutory reverse onus under Ontario ESA s. 74",
    "icon": "⚖️",
    "keywords": ["reprisal", "retaliation", "ontario esa", "reverse onus", "fired for asking", "ministry of labour"]
  },
  {
    "id": "cmd-bc-security-deposit-double",
    "toolModal": "bc-security-deposit-double",
    "category": "housing",
    "title": "British Columbia Security Deposit Return & Double Penalty Navigator",
    "desc": "Audit mandatory 15-day return timeline from written forwarding address and automatic 2x doubling penalty under BC RTA s. 38(6)",
    "icon": "💵",
    "keywords": ["security deposit", "double penalty", "bc rta", "15 days", "forwarding address", "rtb"]
  },
  {
    "id": "cmd-alberta-constructive-dismissal",
    "toolModal": "alberta-constructive-dismissal",
    "category": "labor",
    "title": "Alberta Constructive Dismissal Salary Cut Navigator",
    "desc": "Audit unilateral compensation reductions (10%+ cut), constructive dismissal repudiation, and statutory notice pay under Alberta ESC ss. 55-58",
    "icon": "📉",
    "keywords": ["constructive dismissal", "salary cut", "pay cut", "alberta esc", "unilateral reduction", "termination pay"]
  },
  {
    "id": "cmd-start-up-visa-peer-review",
    "toolModal": "start-up-visa-peer-review",
    "category": "immigration",
    "title": "Federal Start-Up Visa (SUV) Peer Review & Due Diligence Navigator",
    "desc": "Audit 10% founder equity, 50% combined voting control, designated entity commitments, and IRPR s. 98.10 Peer Review triggers",
    "icon": "🚀",
    "keywords": ["start-up visa", "suv", "peer review", "angel", "venture capital", "incubator", "irpr 98"]
  },
  {
    "id": "cmd-saskatchewan-security-deposit",
    "toolModal": "saskatchewan-security-deposit",
    "category": "housing",
    "title": "Saskatchewan Security Deposit Return & Forfeiture Navigator",
    "desc": "Audit 1-month deposit cap, mandatory 7-business-day refund/Form 13 deadline, and statutory claim forfeiture under Saskatchewan RTA ss. 13-15",
    "icon": "🌾",
    "keywords": ["saskatchewan", "security deposit", "7 days", "form 13", "forfeiture", "ort", "tenancy"]
  },
  {
    "id": "cmd-ontario-illegal-entry-t2",
    "toolModal": "ontario-illegal-entry-t2",
    "category": "housing",
    "title": "Ontario Residential Tenancy Illegal Landlord Entry T2 Navigator",
    "desc": "Audit 24-hour written notice rules, 8am-8pm permissible entry window, and Form T2 rent abatement remedies under Ontario RTA ss. 25-27",
    "icon": "🚪",
    "keywords": ["illegal entry", "landlord entry", "24 hours notice", "t2", "ltb", "privacy", "quiet enjoyment"]
  },
  {
    "id": "cmd-bc-overtime-banking",
    "toolModal": "bc-overtime-banking",
    "category": "labor",
    "title": "British Columbia Overtime Time Banking Navigator",
    "desc": "Audit overtime banking agreements (written employee request required), 1.5x/2x credit rates, and payout rights under BC ESA ss. 40, 42",
    "icon": "⏳",
    "keywords": ["overtime banking", "time off in lieu", "bc esa", "time bank", "overtime pay", "british columbia"]
  },
  {
    "id": "cmd-alberta-periodic-tenancy-termination",
    "toolModal": "alberta-periodic-tenancy-termination",
    "category": "housing",
    "title": "Alberta Periodic Tenancy Termination Notice Navigator",
    "desc": "Audit notice periods (1 month tenant vs 3 months landlord), prescribed statutory grounds, and purchaser occupancy under Alberta RTA ss. 5-12",
    "icon": "📜",
    "keywords": ["periodic tenancy", "month to month", "notice to vacate", "alberta rta", "landlord occupancy", "rtdrs"]
  },
  {
    "id": "cmd-super-visa-medical-insurance",
    "toolModal": "super-visa-medical-insurance",
    "category": "health",
    "title": "Federal Super Visa $100k Emergency Medical Insurance Navigator",
    "desc": "Audit 5-year stay per entry rules, mandatory $100,000 emergency medical insurance, and sponsor LICO income under IRPA s. 15(1)",
    "icon": "🏥",
    "keywords": ["super visa", "medical insurance", "100k insurance", "lico", "parents", "grandparents", "5 year stay"]
  },
  {
    "id": "cmd-manitoba-holiday-pay",
    "toolModal": "manitoba-holiday-pay",
    "category": "labor",
    "title": "Manitoba General Statutory Holiday Pay Navigator",
    "desc": "Calculate statutory holiday pay (5% of gross wages in 4 weeks prior) and 1.5x holiday pay under Manitoba Employment Standards Code ss. 21-28",
    "icon": "🎉",
    "keywords": ["manitoba", "holiday pay", "statutory holiday", "louis riel day", "general holiday", "overtime"]
  },
  {
    "id": "cmd-caregiver-pr-experience",
    "toolModal": "caregiver-pr-experience",
    "category": "immigration",
    "title": "Federal Caregiver PR Pathway 12-Month Experience Navigator",
    "desc": "Audit qualifying Canadian work experience (12-month revised standard for NOC 44100/44101), private household rules, and CLB 5 benchmarks",
    "icon": "🏡",
    "keywords": ["caregiver", "nanny", "home child care", "home support worker", "noc 44100", "noc 44101", "caregiver pr"]
  },
  {
    "id": "cmd-ontario-public-holiday-pay",
    "toolModal": "ontario-public-holiday-pay",
    "category": "labor",
    "title": "Ontario Public Holiday Pay & Qualifying Shift Navigator",
    "desc": "Calculate public holiday pay ((wages + vacation) / 20), First and Last Qualifying Shift Rule, and 1.5x premium pay under Ontario ESA ss. 24-32",
    "icon": "🍁",
    "keywords": ["public holiday pay", "statutory holiday", "qualifying shift", "ontario esa", "stat holiday", "first and last"]
  },
  {
    "id": "cmd-bc-dispute-resolution-urgency",
    "toolModal": "bc-dispute-resolution-urgency",
    "category": "housing",
    "title": "British Columbia Expedited Tenancy Dispute Resolution Navigator",
    "desc": "Audit qualifying grounds for RTB 12-to-14-day Expedited Hearings (lockouts, emergency repairs, imminent danger) vs standard 4-month queues",
    "icon": "⚡",
    "keywords": ["expedited hearing", "rtb", "emergency dispute", "lockout", "emergency repair", "bc rta", "urgent hearing"]
  },
  {
    "id": "cmd-alberta-youth-employment",
    "toolModal": "alberta-youth-employment",
    "category": "labor",
    "title": "Alberta Youth Employment Standards Navigator",
    "desc": "Audit age restrictions, light work rules for adolescents 13-14 (max 2h school day), adult supervision for 15-17 past 9pm under Alberta ESC ss. 65-67",
    "icon": "🎒",
    "keywords": ["youth employment", "adolescent work", "under 15", "alberta esc", "parental consent", "work permit youth"]
  },
  {
    "id": "cmd-study-permit-off-campus-work",
    "toolModal": "study-permit-off-campus-work",
    "category": "immigration",
    "title": "Federal Study Permit 24h Off-Campus Work Limit Navigator",
    "desc": "Audit Fall 2024 permanent 24-hour weekly off-campus work limit during academic terms, scheduled break exemptions, and PGWP impact under IRPR s. 186(v)",
    "icon": "📚",
    "keywords": ["study permit", "24 hours", "off-campus work", "international student", "pgwp bar", "irpr 186v", "student work hours"]
  }
];

const cmdEndIdx = appTxt.indexOf('];\n\nfunction getRecentToolIds() {');
if (cmdEndIdx === -1) {
  throw new Error('Could not find end of COMMAND_DIRECTORY');
}

const commandsJson = newCommands.map(c => '  ' + JSON.stringify(c, null, 2).replace(/\n/g, '\n  ')).join(',\n');
appTxt = appTxt.slice(0, cmdEndIdx) + ',\n' + commandsJson + '\n' + appTxt.slice(cmdEndIdx);

fs.writeFileSync(appPath, appTxt, 'utf8');
console.log('Successfully updated public/app.js with 25 new command directory items and updated personas.');
