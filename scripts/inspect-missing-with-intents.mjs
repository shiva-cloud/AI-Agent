// scripts/inspect-missing-with-intents.mjs
import fs from 'node:fs';
import readline from 'node:readline';
import { openStore } from '../src/store.js';
import { answer, parse, retrieve } from '../src/engine.js';
import { requestedSubject } from '../src/requested-subject.js';

async function main() {
  const store = openStore();
  const records = store.records();

  const questionsByTopic = {
    housing: [],
    driving: [],
    transit_community: [],
    money_tax: [],
    family_childcare: [],
    employment: []
  };

  // Read lines from corpus
  const f2 = 'corpus/global_immigration_settlement_20000_questions.md';
  if (fs.existsSync(f2)) {
    const rl2 = readline.createInterface({ input: fs.createReadStream(f2) });
    for await (const line of rl2) {
      const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
      if (!match) continue;
      const topic = match[2].trim();
      const country = match[3].trim();
      const q = match[4].trim();

      if (topic === 'Housing & Tenancy' && questionsByTopic.housing.length < 20) questionsByTopic.housing.push({ q, country });
      else if ((topic === 'Transit' || topic === 'Local Settlement') && questionsByTopic.transit_community.length < 20) questionsByTopic.transit_community.push({ q, country });
      else if (topic === 'Banking & Tax' && questionsByTopic.money_tax.length < 20) questionsByTopic.money_tax.push({ q, country });
      else if (topic === 'Driving & Vehicles' && questionsByTopic.driving.length < 20) questionsByTopic.driving.push({ q, country });
      else if (topic === 'Family & Schools' && questionsByTopic.family_childcare.length < 20) questionsByTopic.family_childcare.push({ q, country });
    }
  }

  for (const [topic, items] of Object.entries(questionsByTopic)) {
    console.log(`\n==============================================`);
    console.log(`TOPIC: ${topic}`);
    console.log(`==============================================`);
    for (const item of items.slice(0, 10)) {
      const res = answer({ question: item.q }, records);
      const parsed = parse({ question: item.q });
      const subj = requestedSubject(item.q);
      const retrieved = retrieve(parsed, records);
      console.log(`Q: "${item.q}"`);
      console.log(`   country: ${item.country} | parsedCountry: ${parsed.country} | region: ${parsed.region} | city: ${parsed.city}`);
      console.log(`   intents: ${parsed.intents} | subj: ${subj ? Array.from(subj) : null}`);
      console.log(`   retrieved count: ${retrieved.length}`);
      if (retrieved.length > 0) {
        console.log(`   retrieved top 2: ${retrieved.slice(0, 2).map(r => r.id + ' (' + r.country + '/' + r.region + ')')}`);
      }
      console.log(`   status: ${res.status} | claims: ${res.claims?.length || 0} | gaps: ${JSON.stringify(res.gaps)}`);
      console.log(`   clarification: ${res.clarification || 'none'}`);
    }
  }
}

main().catch(console.error);

