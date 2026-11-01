// Synthetic Regulatory Data Generator for Load Testing (Rec 99)
// Generates 1,000 synthetic regulatory records across destinations and topics.

import { writeFileSync } from 'node:fs';

export function generateSyntheticRecords(count = 1000) {
  const topics = ['sin', 'health', 'housing', 'employment', 'money', 'driving', 'transit', 'telecom', 'family', 'childcare'];
  const jurisdictions = ['Toronto', 'Vancouver', 'Calgary', 'London', 'Sydney', 'Berlin', 'Dubai', 'Auckland', 'Dublin', 'Paris', 'Amsterdam', 'Madrid', 'Stockholm'];
  const records = [];

  for (let i = 1; i <= count; i++) {
    const topic = topics[i % topics.length];
    const jurisdiction = jurisdictions[i % jurisdictions.length];
    records.push({
      id: `synthetic-${topic}-${jurisdiction.toLowerCase()}-${i}`,
      title: `Synthetic ${topic.toUpperCase()} Guidance for ${jurisdiction} #${i}`,
      jurisdiction,
      topic,
      status: 'approved',
      checkedAt: '2026-01-01',
      expiresAt: '2028-12-31',
      summary: `Synthetic official regulatory rule governing ${topic} in ${jurisdiction} with sample thresholds.`,
      quote: `Pursuant to local statutory section ${100 + (i % 50)}, settlers are granted lawful standing.`,
      url: `https://example.gov/${jurisdiction.toLowerCase()}/${topic}/${i}`,
      reviewMethod: 'bulk_approval'
    });
  }

  return records;
}

if (process.argv[1] && process.argv[1].endsWith('generate-synthetic-data.js')) {
  const count = parseInt(process.argv[2] || '1000', 10);
  const data = generateSyntheticRecords(count);
  const outPath = 'data/synthetic-regulatory-records.json';
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Generated ${data.length} synthetic records in ${outPath}`);
}
