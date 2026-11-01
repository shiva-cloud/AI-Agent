import fs from 'node:fs';

const questions = JSON.parse(fs.readFileSync('scripts/batch3-questions.json', 'utf8'));

async function run() {
  console.log(`Evaluating ${questions.length} questions...`);
  const results = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    try {
      const res = await fetch('http://localhost:3000/v1/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.question })
      });
      const data = await res.json();
      results.push({
        id: q.id,
        category: q.category,
        categoryName: q.categoryName,
        question: q.question,
        status: data.status,
        intents: data.parsed?.intents || [],
        gaps: data.gaps || [],
        presentation: data.presentation?.headline || null,
        sourcesCount: (data.sources || []).length,
        claimsCount: (data.claims || []).length
      });
    } catch (e) {
      results.push({
        id: q.id,
        category: q.category,
        categoryName: q.categoryName,
        question: q.question,
        status: 'fetch_error',
        error: e.message
      });
    }
    if ((i + 1) % 25 === 0) {
      console.log(`Processed ${i + 1} / ${questions.length}`);
    }
  }

  fs.writeFileSync('scripts/batch3-engine-results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved results to scripts/batch3-engine-results.json');
}

run();
