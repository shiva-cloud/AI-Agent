import fs from 'node:fs';

const questions = JSON.parse(fs.readFileSync('scripts/batch3-questions.json', 'utf8'));
const engineResults = JSON.parse(fs.readFileSync('scripts/batch3-engine-results.json', 'utf8'));

// Classification categories based on deep immigration statutory analysis
// 1. PROPER: Question has a definitive, settled statutory / convention answer.
// 2. GHUMAYA: Typical AI / LLMs give evasive, circular, non-committal answers ("consult a lawyer", "policies vary").
// 3. HALLUCINATION: High risk of AI inventing false exceptions, non-existent visas, or misapplying international law.
// 4. MILE_HI_NAHI: Engine / Knowledge Base returns unavailable / unrecognized intent / abstention.

console.log(`Analyzing ${questions.length} questions...`);

const categoryStats = {};
questions.forEach(q => {
  if (!categoryStats[q.category]) {
    categoryStats[q.category] = {
      name: q.categoryName,
      total: 0,
      proper: 0,
      ghumaya: 0,
      hallucination: 0,
      mileHiNahi: 0
    };
  }
  categoryStats[q.category].total++;
});

console.log('Categories:', Object.keys(categoryStats));
