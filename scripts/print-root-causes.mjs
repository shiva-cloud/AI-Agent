import fs from 'node:fs';

const groups = JSON.parse(fs.readFileSync('scripts/scratch-root-causes.json', 'utf8'));

console.log('\n--- 1. Off-topic that got False Guidance (7 items) ---');
for (const x of groups.offTopicGotFalseGuidance) {
  console.log(`* "${x.q}" -> sources: ${x.sources.join(' | ')}`);
}

console.log('\n--- 2. Canadian/Corridor Clarification Confusion (Sample 15 of 54) ---');
for (const x of groups.canadianAcronymOrTermsUnrecognized.concat(groups.corridorCountryGeoConfusion).slice(0, 15)) {
  console.log(`* "${x.q}" -> country: ${x.country} | gaps: ${x.gaps.join(', ')}`);
}

console.log('\n--- 3. Timeline & Processing Time Blocked (4 items) ---');
for (const x of groups.timelineAndProcessingTimeBlocked) {
  console.log(`* "${x.q}" -> gaps: ${x.gaps.join(', ')}`);
}

console.log('\n--- 4. Vague Forum Titles Refused (17 items) ---');
for (const x of groups.vagueForumTitles) {
  console.log(`* "${x.q}" -> gaps: ${x.gaps.join(', ')}`);
}

console.log('\n--- 5. Legitimate Immigration Queries Refused (Sample 20 of 64) ---');
for (const x of groups.legitimateImmigrationUnavailable.slice(0, 20)) {
  console.log(`* "${x.q}" -> country: ${x.country} | intents: ${JSON.stringify(x.intents)} | gaps: ${x.gaps.join(', ')}`);
}

console.log('\n--- 6. Partial answers that could be guidance (18 items) ---');
for (const x of groups.partialCouldBeGuidance) {
  console.log(`* "${x.q}" -> gaps: ${x.gaps.join(', ')} | sources: ${x.sources.slice(0, 1)}`);
}
