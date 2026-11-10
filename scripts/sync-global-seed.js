// scripts/sync-global-seed.js
import { openStore } from '../src/store.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { globalRecords } from '../src/global-records.js';

const store = openStore();
const dbRecs = new Map(store.records().map(r => [r.id, r]));

let content = readFileSync('src/global-records.js', 'utf8');
let replaced = 0;

for (const r of globalRecords) {
  const dbR = dbRecs.get(r.id);
  if (dbR && dbR.summary && dbR.summary !== r.summary) {
    const escapedDbSummarySingle = dbR.summary.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedDbSummaryDouble = JSON.stringify(dbR.summary);
    
    // Format 1: id: '...' or "id": "..."
    let idIdx = content.indexOf(`id: '${r.id}'`);
    let isJson = false;
    if (idIdx === -1) {
      idIdx = content.indexOf(`"id": "${r.id}"`);
      isJson = true;
    }
    
    if (idIdx !== -1) {
      const summaryNeedle = isJson ? '"summary": ' : 'summary: ';
      const summaryIdx = content.indexOf(summaryNeedle, idIdx);
      if (summaryIdx !== -1 && summaryIdx - idIdx < 1500) {
        const quoteChar = content[summaryIdx + summaryNeedle.length];
        if (quoteChar === "'" || quoteChar === '"') {
          let endIdx = summaryIdx + summaryNeedle.length + 1;
          while (endIdx < content.length) {
            if (content[endIdx] === quoteChar && content[endIdx - 1] !== '\\') {
              break;
            }
            endIdx++;
          }
          if (endIdx < content.length) {
            const oldChunk = content.slice(summaryIdx, endIdx + 1);
            const newChunk = isJson ? `"summary": ${escapedDbSummaryDouble}` : `summary: '${escapedDbSummarySingle}'`;
            content = content.replace(oldChunk, newChunk);
            replaced++;
          }
        }
      }
    }
  }
}

console.log('Replaced in global-records.js:', replaced);
writeFileSync('src/global-records.js', content, 'utf8');
store.db.close();
