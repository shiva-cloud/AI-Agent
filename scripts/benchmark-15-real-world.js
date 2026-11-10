import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { detectAndTranslateMultilingualQuery } from '../src/multilingual-layer.js';

const realWorldQuestions = [
  { id: 'RW-1', q: 'मैं कल Mississauga पहुंचा हूं, सबसे पहले क्या करूं?', topic: 'Arrival & Settlement Checklist' },
  { id: 'RW-2', q: 'बिना credit score के Brampton में कमरा कैसे मिलेगा?', topic: 'Housing & Scam Prevention' },
  { id: 'RW-3', q: 'मेरे पास work permit है, लेकिन SIN expire हो गया है।', topic: 'Maintained Status & SIN Expiry' },
  { id: 'RW-4', q: 'मेरा employer salary काट रहा है, क्या करूं?', topic: 'Unlawful Wage Deductions' },
  { id: 'RW-5', q: 'मेरे पास health card नहीं है और doctor चाहिए।', topic: 'Interim Healthcare & CHCs' },
  { id: 'RW-6', q: 'मैं student हूं, क्या free settlement services मिलेंगी?', topic: 'Student Settlement Eligibility' },
  { id: 'RW-7', q: 'मेरी PR card expire हो गई, क्या मेरा PR status भी खत्म हुआ?', topic: 'PR Card vs PR Status' },
  { id: 'RW-8', q: 'मेरा landlord बिना notice rent बढ़ा रहा है।', topic: 'Illegal Rent Increase & Form N1' },
  { id: 'RW-9', q: 'मैं India की property rent पर देता हूं। Canada में tax कैसे लगेगा?', topic: 'Foreign Rental Income & T1135' },
  { id: 'RW-10', q: 'मैं Canada से Germany shift होना चाहता हूं।', topic: 'Cross-Border Relocation' },
  { id: 'RW-11', q: 'मेरा visitor status खत्म होने वाला है।', topic: 'Visitor Extension & Restoration' },
  { id: 'RW-12', q: 'मैं newcomer हूं, मेरे बच्चों के लिए school और childcare कैसे मिलेगा?', topic: 'School Enrolment & Childcare' },
  { id: 'RW-13', q: 'मुझे नौकरी मिली है लेकिन employer LMIA के पैसे मांग रहा है।', topic: 'Recruitment Fees & LMIA Fraud' },
  { id: 'RW-14', q: 'मेरी पत्नी के पास open work permit है। क्या वह healthcare ले सकती है?', topic: 'Spouse Healthcare Eligibility' },
  { id: 'RW-15', q: 'मुझे घर से निकाल दिया गया है और रहने की जगह नहीं है।', topic: 'Emergency Housing & Lockout' }
];

const store = openStore();
const records = store.records();
const now = new Date('2026-11-08T12:00:00Z');

console.log('Testing 15 Real-World Scenarios...\n');

for (const item of realWorldQuestions) {
  const trans = detectAndTranslateMultilingualQuery(item.q);
  console.log(`\n========================================`);
  console.log(`[${item.id}] Question: ${item.q}`);
  console.log(`Domain: ${item.topic}`);
  console.log(`Translation Detected: ${trans ? 'YES (' + trans.detectedScript + ')' : 'NO'}`);
  if (trans) {
    console.log(`Canonical English: ${trans.canonicalStatutoryQuery}`);
  }
  
  try {
    const res = answer({ question: item.q }, records, now);
    console.log(`Engine Status: ${res.status}`);
    console.log(`Claims Count: ${res.claims?.length || 0}`);
    console.log(`Top Source: ${res.sources?.[0]?.id || 'NONE'}`);
    console.log(`Sample Claim: ${res.claims?.[0]?.text?.slice(0, 100) || res.message || 'NONE'}`);
  } catch (err) {
    console.log(`Engine Error: ${err.message}`);
  }
}
