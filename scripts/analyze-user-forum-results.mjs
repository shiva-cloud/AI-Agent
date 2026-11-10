import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('scripts/scratch-user-eval-results.json', 'utf8'));

console.log('Total analyzed:', data.length);

// Category breakdown
const offTopicExamples = [];
const trueGuidance = [];
const falseGuidance = [];
const clarificationBuckets = [];
const unavailableBuckets = [];
const partialBuckets = [];

const offTopicRegex = /(?:pizza|leafs fan|loblaws.*puck|casino|oasis aqualounge|cheese|couch|mechanic.*prius|chessboxing|oil change|fruit trees|cat outside|phone cases|pokemon|fireworks|podcast|liberty for security|organizer.*single parent|samosa business|distillery ticketing|date ideas|scavenger hunt.*ttc|date for canadians)/i;

for (const r of data) {
  const isOffTopic = offTopicRegex.test(r.question);
  if (isOffTopic) {
    offTopicExamples.push({
      q: r.question,
      status: r.status,
      intents: r.parsed?.intents,
      claims: r.claimsCount,
      sources: r.sources
    });
    if (r.status === 'guidance') {
      falseGuidance.push(r);
    }
  } else if (r.status === 'guidance') {
    trueGuidance.push(r);
  }

  if (r.status === 'partial') {
    partialBuckets.push({ q: r.question, gaps: r.gaps, sources: r.sources });
  } else if (r.status === 'clarification') {
    clarificationBuckets.push({ q: r.question, gaps: r.gaps, country: r.parsed?.country });
  } else if (r.status === 'unavailable') {
    unavailableBuckets.push({ q: r.question, gaps: r.gaps, country: r.parsed?.country });
  }
}

console.log('\n--- OFF-TOPIC FORUM BANTER IN INPUT ---');
console.log('Total off-topic banter detected:', offTopicExamples.length);
for (const x of offTopicExamples.slice(0, 15)) {
  console.log(`[${x.status}] "${x.q.slice(0, 60)}" -> intents: ${JSON.stringify(x.intents)} | sources: ${x.sources.slice(0, 1)}`);
}

console.log('\n--- FALSE GUIDANCE (Off-topic that got guidance) ---');
console.log('Count:', falseGuidance.length);
for (const x of falseGuidance) {
  console.log(`"${x.question}" -> claims: ${x.claimsCount}, sources: ${x.sources}`);
}

console.log('\n--- PARTIAL (घमाया गया / अधूरा उत्तर) ---');
console.log('Total partial:', partialBuckets.length);
for (const x of partialBuckets.slice(0, 10)) {
  console.log(`"${x.q.slice(0, 70)}" -> gaps: ${x.gaps.join(', ')} | sources: ${x.sources.slice(0, 1)}`);
}

console.log('\n--- CLARIFICATION (स्पष्टीकरण मांगा गया) ---');
console.log('Total clarification:', clarificationBuckets.length);
for (const x of clarificationBuckets.slice(0, 15)) {
  console.log(`"${x.q.slice(0, 70)}" -> country: ${x.country} | gaps: ${x.gaps.join(', ')}`);
}

console.log('\n--- UNAVAILABLE (इनकार / अनुपलब्ध) ---');
console.log('Total unavailable:', unavailableBuckets.length);
for (const x of unavailableBuckets.slice(0, 15)) {
  console.log(`"${x.q.slice(0, 70)}" -> country: ${x.country} | gaps: ${x.gaps.join(', ')}`);
}

// Check pure chitchat / cries for help
const criesForHelp = data.filter(d => /^(?:help me|help please|post ita help|cec - need help|qs about best options for pr|what should i do now|waste of time or what\?|question|please what do i do|urgent help\.?)$/i.test(d.question.trim()));
console.log('\n--- VAGUE / CRY FOR HELP TITLES ---');
console.log('Count:', criesForHelp.length);
for (const x of criesForHelp) {
  console.log(`[${x.status}] "${x.question}" -> intents: ${JSON.stringify(x.parsed?.intents)} | gaps: ${x.gaps.join(', ')}`);
}
