import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { evaluateDebtCollectionDefense } from '../src/debt-collection-defense.js';
import { assessMovingExpenses } from '../src/moving-tax-navigator.js';
import { evaluateOntarioUrgentRepairsT6 } from '../src/ontario-residential-tenancy-urgent-repairs-t6-navigator.js';
import { evaluateBcSecurityDepositDoublePenalty } from '../src/british-columbia-residential-tenancy-security-deposit-double-penalty-navigator.js';

// Absolute legal or tax promises that cannot be true for every reader. Knowledge-base record
// files are excluded: their wording is editorial evidence work, reviewed separately.
const OVERCLAIMS = /100% (?:legal|tax-free|legally|exempt|ISPA)|fully legal|fully admissible|recover <strong>100%|Fully Admissible:|guarantees your right|guaranteeing an ITA|INVITATION LIKELY/;
const KB_FILES = new Set(['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js', 'country-portals.js']);

test('UI and tool code make no absolute legal or tax promises', () => {
  const files = [
    ...['index.html', 'app.js'].map(name => new URL(`../public/${name}`, import.meta.url)),
    ...readdirSync(new URL('../src/', import.meta.url)).filter(name => name.endsWith('.js') && !KB_FILES.has(name)).map(name => new URL(`../src/${name}`, import.meta.url))
  ];
  const hits = [];
  for (const file of files) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const match = line.match(OVERCLAIMS);
      if (match) hits.push(`${file.pathname.split('/').slice(-2).join('/')}:${i + 1}: ${match[0]}`);
    });
  }
  assert.deepEqual(hits, []);
});

test('debt-collection, moving-tools, and tenancy navigators bound echoed names', () => {
  assert.equal(evaluateDebtCollectionDefense({ collectionAgencyName: 'Z'.repeat(400) }).collectionAgencyName.length, 120);
  assert.equal(evaluateDebtCollectionDefense({ collectionAgencyName: { x: 1 } }).collectionAgencyName, 'Collection Agency');
  assert.equal(assessMovingExpenses({ oldCity: { a: 1 }, oldCountry: 'India\u0000' }).oldResidence, 'Seattle, India');
  assert.equal(evaluateOntarioUrgentRepairsT6({ landlordName: { bad: true }, rentalAddress: 'Toronto\u0000 Apt' }).landlordName, 'Landlord');
  assert.equal(evaluateOntarioUrgentRepairsT6({ rentalAddress: 'A'.repeat(500) }).rentalAddress.length, 120);
  assert.equal(evaluateBcSecurityDepositDoublePenalty({ landlordName: { evil: 1 } }).landlordName, 'Landlord');
  assert.equal(evaluateBcSecurityDepositDoublePenalty({ forwardingAddress: 'Vancouver\u0007 St' }).forwardingAddress, 'Vancouver St');
});
