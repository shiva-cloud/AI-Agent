// scripts/run-gold-evaluation.js
// Automated Golden Standard Benchmark Evaluation Runner

import { readFileSync } from 'node:fs';
import { evaluateStudyPermitCapAndPal } from '../src/study-permit-cap-pal-navigator.js';
import { evaluateVisitorVisaTies } from '../src/visitor-visa-financial-ties-navigator.js';
import { evaluateLmiaReadiness } from '../src/lmia-readiness-navigator.js';
import { evaluateGovernmentEnrollment } from '../src/sin-healthcare-navigator.js';
import { evaluateStudyToPrPathway } from '../src/study-to-pr-navigator.js';

const goldData = JSON.parse(readFileSync(new URL('../evaluation/statutory-gold-standard.json', import.meta.url), 'utf8'));

console.log(`Running ${goldData.cases.length} Golden Standard Statutory Benchmarks...`);

const toolDispatch = {
  'study-permit-cap-pal': evaluateStudyPermitCapAndPal,
  'visitor-visa-financial-ties': evaluateVisitorVisaTies,
  'lmia-readiness': evaluateLmiaReadiness,
  'sin-healthcare': evaluateGovernmentEnrollment,
  'study-to-pr': evaluateStudyToPrPathway
};

let passed = 0;
let failed = 0;

for (const tc of goldData.cases) {
  const fn = toolDispatch[tc.tool];
  if (!fn) {
    console.error(`[FAIL] ${tc.id}: Unknown tool handler '${tc.tool}'`);
    failed++;
    continue;
  }
  const result = fn(tc.input);

  // Check expected keys
  let casePass = true;
  for (const [k, v] of Object.entries(tc.expected)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      for (const [subK, subV] of Object.entries(v)) {
        if (result[k]?.[subK] !== subV) {
          console.error(`[FAIL] ${tc.id}: Key '${k}.${subK}' expected ${subV}, got ${result[k]?.[subK]}`);
          casePass = false;
        }
      }
    } else {
      if (result[k] !== v) {
        console.error(`[FAIL] ${tc.id}: Key '${k}' expected ${v}, got ${result[k]}`);
        casePass = false;
      }
    }
  }

  if (casePass) {
    console.log(`  ✔ [PASS] ${tc.id}`);
    passed++;
  } else {
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${goldData.cases.length} cases.`);
if (failed > 0) process.exit(1);
