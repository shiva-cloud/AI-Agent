import { parse } from '../src/engine.js';

const testQuestions = [
  "How can I compare two safe options for workplace injury and status in Texas / Dallas, United States",
  "Before I submit anything about regulated profession licence in Bavaria / Munich, Germany",
  "Is permit expiry while appeal pending handled locally or nationally in Tasmania / Hobart, Australia?",
  "Could snowstorm emergency accommodation affect my right to remain or work in England / London, United Kingdom",
  "Could foreign transcript authentication affect my right to remain or work in Wales / Cardiff, United Kingdom",
  "For a remote worker in England / Birmingham, United Kingdom, which evidence would actually matter"
];

for (const q of testQuestions) {
  const p = parse({ question: q });
  console.log(`Q: "${q}"`);
  console.log(`  -> City: ${p.city}, Region: ${p.region}, Country: ${p.country}`);
}

