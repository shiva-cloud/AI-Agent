import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('scripts/scratch-user-eval-results.json', 'utf8'));

// Let's audit all 251 guidance items to see which ones are actually good answers vs misroutes.
let legitimateGuidance = 0;
let misroutedOrManipulatedGuidance = 0;
const misroutes = [];
const solidAnswers = [];

for (const r of data.filter(d => d.status === 'guidance')) {
  const q = r.question;
  // Is this an actual immigration/settlement question or forum banter?
  const isClearlyImmigrationOrSettlement = /(?:pr|copr|bowp|super visa|overstay|lawyer|f-1|f-4|citizenship|outland|sponsorship|ita|crs|express entry|work permit|pnp|cec|noc|bank account|trv|sowp|ice|detained|parole in place|sin|ohip|msp|rent|tenant|landlord|evict|ircc|cbsa|asylum|refugee|restoration|visa|ielts|clb|eca|imm\s*5|biometrics|police certificate|pcc|flagpoling|esta)/i.test(q);
  
  // Non-immigration / banter / clickbait titles:
  const isBanterOrSpam = /(?:seed bank|oasis aqualounge|samosa business|distillery ticketing|driftly sleep|bitstarz casino|sodafit|glucolife|first african distance learning|survival book|darjeeling|honeymoon|pizza|leaves at|date ideas|date for canadians|leafs fan|loblaws|couch|prius|chessboxing|fruit tree|cat outside|oil change|phone cases|pokemon|fireworks|podcast|liberty for security|organizer.*single parent)/i.test(q);

  if (isBanterOrSpam) {
    misroutedOrManipulatedGuidance++;
    misroutes.push({ q, sources: r.sources.slice(0, 2), claims: r.claimsCount });
  } else if (isClearlyImmigrationOrSettlement) {
    legitimateGuidance++;
    solidAnswers.push({ q, sources: r.sources.slice(0, 2), claims: r.claimsCount });
  } else {
    // Edge case / general discussion
    misroutes.push({ q, sources: r.sources.slice(0, 2), claims: r.claimsCount, note: 'general/vague' });
    misroutedOrManipulatedGuidance++;
  }
}

console.log('--- GUIDANCE AUDIT ---');
console.log('Legitimate, high-quality settlement/immigration answers:', legitimateGuidance);
console.log('Misrouted / forced / false positive guidance:', misroutedOrManipulatedGuidance);
console.log('Sample misroutes:');
for (const m of misroutes.slice(0, 15)) {
  console.log(`- "${m.q.slice(0, 60)}" -> [${m.claims} claims] ${m.sources.join(' | ')}`);
}

console.log('\nSample legitimate answers:');
for (const s of solidAnswers.slice(0, 15)) {
  console.log(`- "${s.q.slice(0, 60)}" -> [${s.claims} claims] ${s.sources.join(' | ')}`);
}
