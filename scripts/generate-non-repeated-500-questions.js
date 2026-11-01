// scripts/generate-non-repeated-500-questions.js
import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { fresh500SocialSuite } from './fresh-500-social-suite.js';
import { master500EvaluationSuite } from './master-500-question-suite.js';

// 1. Collect all previously used questions into a normalized lowercase set
const existingSet = new Set();
fresh500SocialSuite.forEach(q => existingSet.add(q.question.trim().toLowerCase()));
master500EvaluationSuite.forEach(q => existingSet.add(q.q.trim().toLowerCase()));

console.log(`Loaded ${existingSet.size} existing questions to avoid any repetition.`);

const store = openStore();
const allRecords = store.records();
console.log(`Knowledge Base records available: ${allRecords.length}`);

// 2. Define rich templates and real-world social media question prompts across all countries
// We will generate 500 completely unique, realistic questions
const questions = [];
const seenInThisBatch = new Set();

function addQuestion(item) {
  const norm = item.question.trim().toLowerCase();
  if (existingSet.has(norm)) {
    return false; // Skip if in previous benchmarks
  }
  if (seenInThisBatch.has(norm)) {
    return false; // Skip if duplicate in this batch
  }
  seenInThisBatch.add(norm);
  questions.push({
    id: `NR500_${String(questions.length + 1).padStart(3, '0')}`,
    ...item
  });
  return true;
}

// Country & city distributions:
// Canada: 80
// United States: 60
// United Kingdom: 55
// Australia: 55
// Germany: 50
// United Arab Emirates: 45
// New Zealand: 30
// Ireland: 30
// Singapore: 20
// France: 20
// Netherlands: 20
// Sweden: 15
// Spain: 20
// Driving Exchange & Bilateral Hubs: 20

// We will construct question banks for each jurisdiction.
console.log('Generating non-repeated questions across all countries and platforms...');
