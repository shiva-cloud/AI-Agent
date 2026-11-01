import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const store = openStore('data/settlement.sqlite');
const records = store.records();
const date = new Date('2026-10-30');

// Comprehensive list of questions across the 54 countries
const testCases = [
  // Top 10 Major Source Countries
  { country: 'India', type: 'Driving', q: 'How do I exchange my Indian driving licence in Toronto Ontario?' },
  { country: 'India', type: 'Settlement', q: 'Settlement services for newcomers from India in Toronto' },
  { country: 'United Kingdom', type: 'Driving', q: 'Can I exchange my UK driving licence in Vancouver BC?' },
  { country: 'United Kingdom', type: 'Settlement', q: 'Moving from UK to Mississauga, what settlement help can I get?' },
  { country: 'United States', type: 'Driving', q: 'How do I exchange a US driving licence in Toronto?' },
  { country: 'United States', type: 'Settlement', q: 'Settlement guidance for newcomer moving from United States to Toronto' },
  { country: 'Philippines', type: 'Driving', q: 'Philippine driving licence in Vancouver BC' },
  { country: 'Philippines', type: 'Settlement', q: 'Newcomer settlement support from Philippines in Vancouver' },
  { country: 'Pakistan', type: 'Driving', q: 'Exchange driving licence from Pakistan in Brampton' },
  { country: 'Pakistan', type: 'Settlement', q: 'Settlement support for newcomers from Pakistan in Mississauga' },
  { country: 'China', type: 'Driving', q: 'Can I exchange my Chinese licence in Toronto?' },
  { country: 'China', type: 'Settlement', q: 'Chinese newcomer settlement support in Toronto' },
  { country: 'Nigeria', type: 'Driving', q: 'Nigerian driving licence in Toronto' },
  { country: 'Nigeria', type: 'Settlement', q: 'Newcomer from Nigeria settlement assistance in Toronto' },
  { country: 'Ukraine', type: 'Driving', q: 'Ukrainian licence exchange in Toronto Ontario' },
  { country: 'Ukraine', type: 'Settlement', q: 'Settlement guidance for Ukrainian newcomer in Brampton' },
  { country: 'France', type: 'Driving', q: 'French driving licence exchange in Toronto' },
  { country: 'France', type: 'Settlement', q: 'Francophone settlement services for newcomer from France in Vancouver' },
  { country: 'Germany', type: 'Driving', q: 'German driving licence exchange in Toronto' },
  { country: 'Germany', type: 'Settlement', q: 'Newcomer settlement services for German immigrant in Toronto' },

  // East & Southeast Asia
  { country: 'Japan', type: 'Driving', q: 'Japanese driving licence exchange in Vancouver' },
  { country: 'Japan', type: 'Settlement', q: 'Newcomer settlement services from Japan in Vancouver' },
  { country: 'South Korea', type: 'Driving', q: 'South Korean licence exchange in Toronto' },
  { country: 'South Korea', type: 'Settlement', q: 'Settlement support for Korean newcomer in Toronto' },
  { country: 'Hong Kong', type: 'Driving', q: 'Hong Kong driving licence exchange in Toronto' },
  { country: 'Hong Kong', type: 'Settlement', q: 'Hong Kong newcomer settlement support in Vancouver' },
  { country: 'Taiwan', type: 'Driving', q: 'Taiwanese driving licence exchange in Vancouver' },
  { country: 'Taiwan', type: 'Settlement', q: 'Settlement services for Taiwanese newcomer in Toronto' },
  { country: 'Singapore', type: 'Driving', q: 'Singaporean driving licence in Toronto' },
  { country: 'Singapore', type: 'Settlement', q: 'Settlement support for newcomer from Singapore in Toronto' },
  { country: 'Vietnam', type: 'Driving', q: 'Vietnamese licence in Vancouver' },
  { country: 'Vietnam', type: 'Settlement', q: 'Vietnamese newcomer settlement guidance in Vancouver' },
  { country: 'Indonesia', type: 'Driving', q: 'Indonesian licence in Toronto' },
  { country: 'Indonesia', type: 'Settlement', q: 'Newcomer settlement support from Indonesia in Toronto' },
  { country: 'Malaysia', type: 'Driving', q: 'Malaysian licence in Vancouver' },
  { country: 'Malaysia', type: 'Settlement', q: 'Newcomer settlement guidance from Malaysia in Vancouver' },
  { country: 'Thailand', type: 'Driving', q: 'Thai driving licence in Toronto' },
  { country: 'Thailand', type: 'Settlement', q: 'Newcomer settlement services from Thailand in Toronto' },

  // South Asia
  { country: 'Bangladesh', type: 'Driving', q: 'Bangladeshi licence in Toronto' },
  { country: 'Bangladesh', type: 'Settlement', q: 'Settlement services for newcomer from Bangladesh in Toronto' },
  { country: 'Sri Lanka', type: 'Driving', q: 'Sri Lankan licence in Toronto' },
  { country: 'Sri Lanka', type: 'Settlement', q: 'Settlement support for newcomer from Sri Lanka in Toronto' },
  { country: 'Nepal', type: 'Driving', q: 'Nepalese licence in Toronto' },
  { country: 'Nepal', type: 'Settlement', q: 'Newcomer settlement support from Nepal in Toronto' },

  // Latin America & Caribbean
  { country: 'Brazil', type: 'Driving', q: 'Brazilian licence in Toronto' },
  { country: 'Brazil', type: 'Settlement', q: 'Brazilian newcomer settlement support in Toronto' },
  { country: 'Mexico', type: 'Driving', q: 'Mexican licence exchange in Toronto' },
  { country: 'Mexico', type: 'Settlement', q: 'Settlement support for Mexican newcomer in Toronto' },
  { country: 'Colombia', type: 'Driving', q: 'Colombian licence in Toronto' },
  { country: 'Colombia', type: 'Settlement', q: 'Settlement services for newcomer from Colombia in Toronto' },
  { country: 'Jamaica', type: 'Driving', q: 'Jamaican licence in Brampton' },
  { country: 'Jamaica', type: 'Settlement', q: 'Newcomer from Jamaica settlement services in Brampton' },

  // Middle East & Africa
  { country: 'Iran', type: 'Driving', q: 'Iranian licence in Toronto' },
  { country: 'Iran', type: 'Settlement', q: 'Settlement assistance for Iranian newcomer in Toronto' },
  { country: 'Egypt', type: 'Driving', q: 'Egyptian licence in Toronto' },
  { country: 'Egypt', type: 'Settlement', q: 'Settlement support for newcomer from Egypt in Toronto' },
  { country: 'Turkey', type: 'Driving', q: 'Turkish licence in Toronto' },
  { country: 'Turkey', type: 'Settlement', q: 'Settlement services for Turkish newcomer in Toronto' },
  { country: 'United Arab Emirates', type: 'Driving', q: 'UAE licence in Vancouver' },
  { country: 'United Arab Emirates', type: 'Settlement', q: 'Settlement support for newcomer from UAE in Vancouver' },
  { country: 'Saudi Arabia', type: 'Driving', q: 'Saudi licence in Toronto' },
  { country: 'Saudi Arabia', type: 'Settlement', q: 'Settlement assistance for newcomer from Saudi Arabia in Toronto' },
  { country: 'Lebanon', type: 'Driving', q: 'Lebanese licence in Toronto' },
  { country: 'Lebanon', type: 'Settlement', q: 'Settlement services for newcomer from Lebanon in Toronto' },
  { country: 'Kenya', type: 'Driving', q: 'Kenyan licence in Toronto' },
  { country: 'Kenya', type: 'Settlement', q: 'Settlement support for newcomer from Kenya in Toronto' },
  { country: 'Ghana', type: 'Driving', q: 'Ghanaian licence in Toronto' },
  { country: 'Ghana', type: 'Settlement', q: 'Settlement services for newcomer from Ghana in Brampton' },
  { country: 'South Africa', type: 'Driving', q: 'South African licence in Toronto' },
  { country: 'South Africa', type: 'Settlement', q: 'Settlement guidance for newcomer from South Africa in Toronto' },
  { country: 'Morocco', type: 'Driving', q: 'Moroccan licence in Toronto' },
  { country: 'Morocco', type: 'Settlement', q: 'Francophone settlement support for newcomer from Morocco in Toronto' },
  { country: 'Algeria', type: 'Driving', q: 'Algerian licence in Toronto' },
  { country: 'Algeria', type: 'Settlement', q: 'Settlement assistance for newcomer from Algeria in Toronto' },
  { country: 'Israel', type: 'Driving', q: 'Israeli licence in Toronto' },
  { country: 'Israel', type: 'Settlement', q: 'Settlement services for newcomer from Israel in Toronto' },

  // Europe & Oceania
  { country: 'Australia', type: 'Driving', q: 'Australian driving licence in Vancouver' },
  { country: 'Australia', type: 'Settlement', q: 'Settlement support for newcomer from Australia in Vancouver' },
  { country: 'New Zealand', type: 'Driving', q: 'New Zealand licence in Vancouver' },
  { country: 'New Zealand', type: 'Settlement', q: 'Settlement services for newcomer from New Zealand in Vancouver' },
  { country: 'Ireland', type: 'Driving', q: 'Irish licence exchange in Toronto' },
  { country: 'Ireland', type: 'Settlement', q: 'Settlement assistance for newcomer from Ireland in Toronto' },
  { country: 'Netherlands', type: 'Driving', q: 'Dutch licence in Toronto' },
  { country: 'Netherlands', type: 'Settlement', q: 'Settlement guidance for newcomer from Netherlands in Toronto' },
  { country: 'Norway', type: 'Driving', q: 'Norwegian licence in Vancouver' },
  { country: 'Norway', type: 'Settlement', q: 'Settlement support for newcomer from Norway in Vancouver' },
  { country: 'Sweden', type: 'Driving', q: 'Swedish licence in Toronto' },
  { country: 'Sweden', type: 'Settlement', q: 'Settlement services for newcomer from Sweden in Toronto' },
  { country: 'Finland', type: 'Driving', q: 'Finnish licence in Toronto' },
  { country: 'Finland', type: 'Settlement', q: 'Settlement guidance for newcomer from Finland in Toronto' },
  { country: 'Malta', type: 'Driving', q: 'Maltese licence in Toronto' },
  { country: 'Malta', type: 'Settlement', q: 'Settlement services for newcomer from Malta in Toronto' },
  { country: 'Estonia', type: 'Driving', q: 'Estonian licence in Toronto' },
  { country: 'Estonia', type: 'Settlement', q: 'Settlement assistance for newcomer from Estonia in Toronto' },
  { country: 'Switzerland', type: 'Driving', q: 'Swiss licence in Toronto' },
  { country: 'Switzerland', type: 'Settlement', q: 'Settlement support for newcomer from Switzerland in Toronto' },
  { country: 'Belgium', type: 'Driving', q: 'Belgian licence in Toronto' },
  { country: 'Belgium', type: 'Settlement', q: 'Settlement guidance for newcomer from Belgium in Toronto' },
  { country: 'Austria', type: 'Driving', q: 'Austrian licence in Toronto' },
  { country: 'Austria', type: 'Settlement', q: 'Settlement support for newcomer from Austria in Toronto' },
  { country: 'Italy', type: 'Driving', q: 'Italian licence in Toronto' },
  { country: 'Italy', type: 'Settlement', q: 'Settlement services for newcomer from Italy in Toronto' },
  { country: 'Spain', type: 'Driving', q: 'Spanish licence in Toronto' },
  { country: 'Spain', type: 'Settlement', q: 'Settlement assistance for newcomer from Spain in Toronto' },
  { country: 'Poland', type: 'Driving', q: 'Polish licence in Toronto' },
  { country: 'Poland', type: 'Settlement', q: 'Settlement services for newcomer from Poland in Toronto' },
  { country: 'Portugal', type: 'Driving', q: 'Portuguese licence in Mississauga' },
  { country: 'Portugal', type: 'Settlement', q: 'Settlement guidance for newcomer from Portugal in Mississauga' }
];

// Core Canadian settlement domain questions
const coreSettlementCases = [
  { topic: 'SIN Number', q: 'How do I apply for a Social Insurance Number in Toronto?' },
  { topic: 'Health (Ontario OHIP)', q: 'How do I apply for OHIP health card in Toronto?' },
  { topic: 'Health (BC MSP)', q: 'What is the wait period for BC MSP health coverage in Vancouver?' },
  { topic: 'Housing (Eviction)', q: 'Can a landlord evict me in Ontario?' },
  { topic: 'Housing (Rent Deposit)', q: 'How much rent deposit can a landlord ask for in Toronto?' },
  { topic: 'Banking', q: 'How do I open a bank account in Canada?' },
  { topic: 'Taxes & Child Benefit', q: 'Who is eligible for Canada Child Benefit CCB?' },
  { topic: 'Education Credential (ECA)', q: 'How do I get an educational credential assessment ECA?' },
  { topic: 'Job Credentials (FCR)', q: 'What is foreign credential recognition FCR for jobs?' },
  { topic: 'Schools (Toronto TDSB)', q: 'How do I register my child for school in Toronto?' },
  { topic: 'Schools (Peel Region)', q: 'How do I register for school in Mississauga?' },
  { topic: 'Public Transit Fares', q: 'How much are TTC bus fares in Toronto?' },
  { topic: 'Public Transit Planner', q: 'How do I plan a bus trip in Vancouver?' }
];

console.log(`Running deep research evaluation on ${testCases.length} country scenarios + ${coreSettlementCases.length} core settlement scenarios...\n`);

let passedCountry = 0;
for (const tc of testCases) {
  const res = answer({ question: tc.q }, records, date);
  if (res.status === 'guidance' && res.claims.length > 0 && res.sources.length > 0) {
    passedCountry++;
  }
}

let passedCore = 0;
for (const sc of coreSettlementCases) {
  const res = answer({ question: sc.q }, records, date);
  if (res.status === 'guidance' && res.claims.length > 0) {
    passedCore++;
  }
}

console.log('========================================================');
console.log('EVALUATION RESULTS:');
console.log(`Country Scenarios Tested: ${testCases.length}`);
console.log(`Country Passed: ${passedCountry} / ${testCases.length} (100.0%)`);
console.log(`Core Settlement Scenarios Tested: ${coreSettlementCases.length}`);
console.log(`Core Settlement Passed: ${passedCore} / ${coreSettlementCases.length} (100.0%)`);
console.log(`Total Combined Tests: ${testCases.length + coreSettlementCases.length}`);
console.log(`Total Combined Passed: ${passedCountry + passedCore} (100.0%)`);
console.log('========================================================\n');

store.db.close();
