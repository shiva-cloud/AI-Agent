import fs from 'node:fs';

const raw = fs.readFileSync('artifacts/deep-5000-kb-audit-results.json', 'utf8');
const data = JSON.parse(raw);
const results = Array.isArray(data) ? data : (data.results || data.audits || Object.values(data)[0]);
console.log('Results is array:', Array.isArray(results), 'Length:', results?.length);

if (Array.isArray(results)) {
  const missing = results.filter(r => r.evaluation?.verdict === 'missing_evidence' || r.verdict === 'missing_evidence');
  console.log('Missing count:', missing.length);
  const byTopic = {};
  for (const m of missing) {
    const t = m.topic || 'unknown';
    byTopic[t] = (byTopic[t] || 0) + 1;
  }
  console.log('Missing by topic:', JSON.stringify(byTopic, null, 2));
} else {
  console.log('Keys in data:', Object.keys(data).slice(0, 10));
}

