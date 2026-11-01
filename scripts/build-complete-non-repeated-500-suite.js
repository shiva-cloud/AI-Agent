// scripts/build-complete-non-repeated-500-suite.js
import fs from 'node:fs';
import { fresh500SocialSuite } from './fresh-500-social-suite.js';
import { master500EvaluationSuite } from './master-500-question-suite.js';
import { usQuestions } from './data/non-repeated-us.js';
import { ukQuestions } from './data/non-repeated-uk.js';
import { auQuestions } from './data/non-repeated-au.js';
import { deQuestions } from './data/non-repeated-de.js';
import { aeQuestions } from './data/non-repeated-ae.js';
import { nzIeQuestions } from './data/non-repeated-nz-ie.js';
import { euSgQuestions } from './data/non-repeated-eu-sg.js';

// Build global normalized set of all past questions
const pastQuestions = new Set();
fresh500SocialSuite.forEach(q => pastQuestions.add(q.question.trim().toLowerCase()));
master500EvaluationSuite.forEach(q => pastQuestions.add(q.q.trim().toLowerCase()));

console.log(`Loaded ${pastQuestions.size} historical questions to ensure 100% uniqueness.`);

const newSuite = [];
const seen = new Set();

function addQ({ country, city, topic, category, type, platform, question }) {
  const norm = question.trim().toLowerCase();
  if (pastQuestions.has(norm)) {
    throw new Error(`Collision with historical question: "${question}"`);
  }
  if (seen.has(norm)) {
    throw new Error(`Duplicate within new suite: "${question}"`);
  }
  seen.add(norm);
  newSuite.push({
    id: `NR500_${String(newSuite.length + 1).padStart(3, '0')}`,
    country,
    city: city || null,
    topic,
    category,
    type, // 'technical' | 'non-technical'
    platform, // 'Reddit', 'Quora', 'LinkedIn', 'X'
    question
  });
}

// 1. Canada (80)
const part1 = JSON.parse(fs.readFileSync('scripts/data/non-repeated-part1.json', 'utf8'));
part1.forEach(q => addQ(q));
console.log(`Loaded ${newSuite.length} Canada questions.`);

// 2. US (60)
usQuestions.forEach(q => addQ(q));
console.log(`Total after US: ${newSuite.length}`);

// 3. UK (55)
ukQuestions.forEach(q => addQ(q));
console.log(`Total after UK: ${newSuite.length}`);

// 4. AU (55)
auQuestions.forEach(q => addQ(q));
console.log(`Total after AU: ${newSuite.length}`);

// 5. DE (50)
deQuestions.forEach(q => addQ(q));
console.log(`Total after DE: ${newSuite.length}`);

// 6. AE (45)
aeQuestions.forEach(q => addQ(q));
console.log(`Total after AE: ${newSuite.length}`);

// 7. NZ & IE (60)
nzIeQuestions.forEach(q => addQ(q));
console.log(`Total after NZ & IE: ${newSuite.length}`);

// 8. EU & SG (95)
euSgQuestions.forEach(q => addQ(q));
console.log(`Total after EU & SG: ${newSuite.length}`);

if (newSuite.length !== 500) {
  throw new Error(`Expected exactly 500 questions, got ${newSuite.length}`);
}

// Write to scripts/non-repeated-500-suite.js
const fileContent = `// scripts/non-repeated-500-suite.js
// 100% Non-repeated contemporary benchmark suite of 500 questions across 13 countries
// Generated with 0 collisions against historical suites (1,143 questions)
export const nonRepeated500Suite = ${JSON.stringify(newSuite, null, 2)};
`;

fs.writeFileSync('scripts/non-repeated-500-suite.js', fileContent, 'utf8');
console.log(`Successfully built and saved scripts/non-repeated-500-suite.js with ${newSuite.length} questions!`);
