import test from 'node:test';
import { snapshotTest } from './helpers/snapshot-test.js';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { countrySettlementRecords } from '../src/country-settlement.js';
import { restOfWorldRecords } from '../src/rest-of-world-records.js';
import { openStore } from '../src/store.js';
import { assertEnglishRecord } from '../src/language.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = join(root, 'data', 'settlement.sqlite');

test('all 54 countrySettlementRecords point to authentic national immigration authorities (zero IRCC dependency)', () => {
  assert.equal(countrySettlementRecords.length, 54);
  for (const r of countrySettlementRecords) {
    assert.doesNotThrow(() => assertEnglishRecord(r));
    assert.ok(r.url.startsWith('https://'));
    assert.doesNotMatch(r.url, /ircc\.canada\.ca|canada\.ca/, `${r.id} must not point to Canadian IRCC`);
    assert.ok(r.quote.length > 5, `${r.id} has a valid quote`);
    assert.ok(r.summary.length > 100, `${r.id} has a detailed summary`);
    assert.equal(r.status, 'approved');
  }
});

test('all 90 restOfWorldRecords pass English policy and cover tax, tenancy, and health', () => {
  assert.ok(restOfWorldRecords.length >= 90, 'At least 90 Rest-of-World records');
  const topics = new Set(restOfWorldRecords.map(r => r.topic));
  assert.ok(topics.has('money'), 'money topic present');
  assert.ok(topics.has('housing'), 'housing topic present');
  assert.ok(topics.has('health'), 'health topic present');

  const jurisdictions = new Set(restOfWorldRecords.map(r => r.jurisdiction));
  for (const country of ['India', 'Pakistan', 'Philippines', 'Nigeria', 'Brazil', 'Japan', 'Mexico', 'South Korea', 'China', 'Vietnam', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Kenya', 'South Africa', 'Colombia', 'Indonesia', 'Turkey', 'Egypt', 'Poland', 'Ukraine', 'Ghana', 'Hong Kong', 'Taiwan', 'Italy', 'Saudi Arabia', 'Portugal', 'Malaysia', 'Thailand', 'Israel']) {
    assert.ok(jurisdictions.has(country), `Record coverage includes ${country}`);
  }

  for (const r of restOfWorldRecords) {
    assert.doesNotThrow(() => assertEnglishRecord(r));
    assert.ok(r.url.startsWith('https://'));
    assert.doesNotMatch(r.url, /ircc\.canada\.ca|canada\.ca/);
    assert.ok(r.quote.length > 5);
    assert.ok(r.summary.length > 150);
  }
});

snapshotTest('evidence database: zero non-Canada records point to IRCC and all key topics exist', () => {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    const parse = b => JSON.parse(b);
    const rows = db.prepare('SELECT id, body FROM records').all().map(r => ({ id: r.id, ...parse(r.body) }));
    const nonCanada = rows.filter(r => !['CA', 'ON', 'BC', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'].includes(r.jurisdiction));

    const irccNonCanada = nonCanada.filter(r => /^https?:\/\/(www\.)?(canada\.ca|ircc)/.test(r.url || ''));
    assert.equal(irccNonCanada.length, 0, 'Zero non-Canada records point to Canadian IRCC or canada.ca');

    const rest = nonCanada.filter(r => !['Australia', 'United States', 'United Kingdom', 'Germany', 'United Arab Emirates', 'New Zealand', 'France', 'Ireland', 'Netherlands', 'Singapore', 'Spain', 'Sweden'].includes(r.jurisdiction));
    const restTopics = new Set(rest.map(r => r.topic));
    assert.ok(restTopics.has('money'), 'Rest of world contains tax/money records');
    assert.ok(restTopics.has('housing'), 'Rest of world contains housing/tenancy records');
    assert.ok(restTopics.has('health'), 'Rest of world contains healthcare records');
    assert.ok(restTopics.has('community'), 'Rest of world contains community records');
    assert.ok(restTopics.has('driving'), 'Rest of world contains driving records');
    assert.ok(restTopics.size >= 10, 'Rest of world covers at least 10 distinct topics');
  } finally {
    db.close();
  }
});

function checkNationalAuthoritySearch(path) {
  const store = openStore(path);
  try {
    const testCases = [
      { q: 'India PAN tax', expectedId: 'india-income-tax-pan' },
      { q: 'India rental tenancy deposit', expectedId: 'india-model-tenancy-act' },
      { q: 'India healthcare Ayushman', expectedId: 'india-ayushman-bharat-health' },
      { q: 'Pakistan NTN tax', expectedId: 'pakistan-fbr-taxpayer-ntn' },
      { q: 'Pakistan tenancy rent controller', expectedId: 'pakistan-rented-premises-tenancy' },
      { q: 'Philippines TIN BIR', expectedId: 'philippines-bir-tin-registration' },
      { q: 'Philippines Rent Control deposit', expectedId: 'philippines-rent-control-tenancy' },
      { q: 'Philippines PhilHealth universal health', expectedId: 'philippines-philhealth-healthcare' },
      { q: 'Brazil CPF Receita Federal', expectedId: 'brazil-receita-federal-cpf' },
      { q: 'Brazil Lei do Inquilinato rental deposit', expectedId: 'brazil-lei-do-inquilinato-housing' },
      { q: 'Brazil SUS healthcare', expectedId: 'brazil-sus-sistema-unico-saude' },
      { q: 'Japan My Number tax', expectedId: 'japan-nta-my-number-tax' },
      { q: 'Japan tenancy Shakuchi Shakuya', expectedId: 'japan-act-land-building-leases' },
      { q: 'Japan National Health Insurance Kokumin', expectedId: 'japan-mhlw-national-health-insurance' },
      { q: 'Nigeria TIN FIRS', expectedId: 'nigeria-firs-tax-tin' },
      { q: 'Nigeria Lagos tenancy law', expectedId: 'nigeria-lagos-tenancy-law' },
      { q: 'Nigeria NHIA health insurance', expectedId: 'nigeria-nhia-healthcare' }
    ];

    for (const tc of testCases) {
      const hits = store.searchFts(tc.q);
      assert.ok(hits.length > 0, `Query "${tc.q}" returned results`);
      assert.equal(hits[0].id, tc.expectedId, `Query "${tc.q}" top hit must be ${tc.expectedId}`);
    }
  } finally {
    store.db.close();
  }
}

snapshotTest('store searchFts accurately resolves Rest-of-World questions to national authorities', () => {
  checkNationalAuthoritySearch(dbPath);
});

test('searchFts ranks national authorities in a disposable regional fixture', t => {
  const directory = mkdtempSync(join(tmpdir(), 'authority-search-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, 'search.sqlite');
  const db = new DatabaseSync(path);
  try {
    db.exec('CREATE TABLE records(id TEXT PRIMARY KEY, body TEXT NOT NULL)');
    const insert = db.prepare('INSERT INTO records VALUES (?, ?)');
    for (const record of restOfWorldRecords) insert.run(record.id, JSON.stringify(record));
  } finally {
    db.close();
  }
  checkNationalAuthoritySearch(path);
});
