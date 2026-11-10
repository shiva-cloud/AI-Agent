import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('scripts/missing-analysis.json', 'utf8'));

const countries = ['United Arab Emirates', 'New Zealand', 'Germany', 'United Kingdom', 'Australia', 'United States'];

for (const c of countries) {
  console.log(`\n=================== Country: ${c} ===================`);
  const cItems = data.missingItems.filter(i => i.country === c);
  console.log(`Total missing: ${cItems.length}`);
  const subjs = {};
  for (const item of cItems) {
    subjs[item.subj || 'NO_SUBJ'] = (subjs[item.subj || 'NO_SUBJ'] || 0) + 1;
  }
  const topSubjs = Object.entries(subjs).sort((a, b) => b[1] - a[1]).slice(0, 8);
  for (const [s, count] of topSubjs) {
    console.log(`  [${count}x] "${s}"`);
    const sample = cItems.find(i => (i.subj || 'NO_SUBJ') === s);
    console.log(`      Sample: ${sample.question}`);
  }
}

