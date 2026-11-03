import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { listSupportedCorridorCodes, getCorridor } from '../src/corridors-registry.js';
import { countrySettlementRecords } from '../src/country-settlement.js';
import { countryPortals } from '../src/country-portals.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const BIG_TWELVE = {
  Australia: 40, 'United States': 39, 'United Kingdom': 37, Germany: 33,
  'United Arab Emirates': 26, 'New Zealand': 23, France: 16, Ireland: 15,
  Netherlands: 14, Singapore: 13, Spain: 13, Sweden: 12
};
const CITIES = ['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'];

// Lower bounds only: less is a regression to investigate, more is welcome.
// These freeze the coverage the 3 November 2026 analysis documented so that
// removals below the current build fail loudly instead of silently. The
// per-country and rest-of-world figures were re-frozen after the jurisdiction
// naming normalization moved 5 records out of "rest" into the big-12 country
// counts (scripts/jurisdiction-normalize-2026-11-03.js).

test('every corridor defines a complete country contract', () => {
  const codes = listSupportedCorridorCodes();
  assert.ok(codes.length >= 13, 'thirteen supported corridors');
  for (const code of codes) {
    const corridor = getCorridor(code);
    for (const field of ['code', 'name', 'currency', 'currencySymbol', 'ministry', 'healthService', 'taxId', 'housingLaw']) {
      assert.ok(corridor[field], `${code}.${field} is set`);
    }
    for (const field of ['workPrograms', 'prSchemes', 'studyPrograms', 'officialLanguages', 'tierADomains']) {
      assert.ok(Array.isArray(corridor[field]) && corridor[field].length, `${code}.${field} lists entries`);
    }
  }
});

test('per-country settlement seeds keep their reviewed quality floor', () => {
  assert.ok(countrySettlementRecords.length >= 54, '54 originating-country records');
  assert.equal(new Set(countrySettlementRecords.map(r => r.jurisdiction)).size, countrySettlementRecords.length, 'one record per country');
  for (const r of countrySettlementRecords) {
    assert.equal(r.status, 'approved');
    assert.equal(r.language, 'en');
    assert.ok(r.url.startsWith('https://'));
    assert.ok((r.quote || '').length > 5, `${r.id} carries a quote`);
    assert.ok((r.reviewBasis || '').length > 10, `${r.id} states its review basis`);
    assert.ok(ISO_DATE.test(r.checkedAt || ''), `${r.id} checkedAt is an ISO date`);
    assert.ok(ISO_DATE.test(r.expiresAt || ''), `${r.id} expiresAt is an ISO date`);
  }
});

test('country portal registry keeps its researched entry-point floor', () => {
  assert.ok(countryPortals.length >= 177, '177 researched country portals');
  const ids = countryPortals.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length, 'portal ids unique');
  for (const p of countryPortals) {
    assert.ok(p.url.startsWith('https://'), `${p.id} uses https`);
    assert.ok(Array.isArray(p.aliases) && p.aliases.length, `${p.id} has name aliases`);
  }
});

test('market-gap catalog batches keep their researched question floor (served withheld until reviewed)', () => {
  const batches = ['batch1.json', 'batch2.json', 'batch3.json']
    .map(f => JSON.parse(readFileSync(join(root, 'src', 'market-gap', f), 'utf8')));
  const allIds = new Set();
  for (const rows of batches) {
    assert.ok(rows.length >= 2000, 'at least 2,000 researched rows per batch');
    assert.ok(new Set(rows.map(r => r.country)).size >= 78, 'at least 78 countries per batch');
    for (const row of rows) {
      assert.ok(row.id && row.country && row.topic && row.question && row.scenarioName, 'row carries research fields');
      allIds.add(row.id);
    }
  }
  assert.equal(allIds.size, batches.reduce((a, b) => a + b.length, 0), 'query ids unique across batches');
});

test('evidence database coverage floors hold when the database is present', (t) => {
  const dbPath = join(root, 'data', 'settlement.sqlite');
  if (!existsSync(dbPath)) {
    // The evidence database is a local artifact, not a git file; fresh CI runs
    // seed it separately. Skip rather than fail on machines without it.
    t.skip('evidence database not present on this machine');
    return;
  }
  const db = new DatabaseSync(dbPath, { readOnly: true });
  t.after(() => db.close());
  const parse = (b) => { try { return JSON.parse(b); } catch { return null; } };
  const recs = db.prepare('SELECT id, body FROM records').all().map(r => ({ id: r.id, ...parse(r.body) })).filter(Boolean);
  const auditedIds = new Set(db.prepare('SELECT DISTINCT record_id FROM audits WHERE note IS NOT NULL AND reviewer IS NOT NULL').all().map(r => r.record_id));
  const publishedIds = new Set(db.prepare('SELECT DISTINCT record_id FROM publications').all().map(r => r.record_id));

  const group = (r) => {
    if (r.jurisdiction === 'CA') return 'CA-federal';
    if (r.jurisdiction === 'ON') return 'ON';
    if (r.jurisdiction === 'BC') return 'BC';
    if (CITIES.includes(r.jurisdiction)) return 'cities';
    if (BIG_TWELVE[r.jurisdiction]) return 'BIG-12';
    return 'rest';
  };

  assert.ok(recs.length >= 906, '906 records overall');
  assert.ok(recs.filter(r => group(r) === 'CA-federal').length >= 113, 'Canada federal floor');
  assert.ok(recs.filter(r => group(r) === 'ON').length >= 51, 'Ontario floor');
  assert.ok(recs.filter(r => group(r) === 'BC').length >= 14, 'British Columbia floor');
  assert.ok(recs.filter(r => group(r) === 'cities').length >= 29, 'city layer floor');
  for (const [country, floor] of Object.entries(BIG_TWELVE)) {
    assert.ok(recs.filter(r => r.jurisdiction === country).length >= floor, `${country} floor ${floor}`);
  }
  const rest = recs.filter(r => group(r) === 'rest');
  assert.ok(rest.length >= 418, 'rest-of-world floor');
  assert.ok(new Set(rest.map(r => r.jurisdiction)).size >= 212, 'rest-of-world country floor');

  const avgLen = (list) => list.reduce((a, r) => a + (r.summary || '').length, 0) / Math.max(list.length, 1);
  assert.ok(avgLen(recs.filter(r => group(r) === 'CA-federal')) >= 850, 'Canada federal summary depth');
  assert.ok(avgLen(recs.filter(r => group(r) === 'BIG-12')) >= 830, 'big-12 summary depth');
  assert.ok(avgLen(rest) >= 480, 'rest-of-world summary depth');

  for (const r of recs) {
    assert.equal(r.language, 'en', `${r.id} uses the English-only contract`);
    assert.ok((r.quote || '').length > 5, `${r.id} carries a quote`);
    assert.ok((r.reviewBasis || '').length > 5, `${r.id} states its review basis`);
    assert.ok(['approved', 'rejected', 'research_seed'].includes(r.status), `${r.id} status is a known value`);
    assert.ok(['low', 'high'].includes(r.risk), `${r.id} risk is a known value`);
    assert.ok(ISO_DATE.test(r.checkedAt || ''), `${r.id} checkedAt is an ISO date`);
    assert.ok(ISO_DATE.test(r.expiresAt || ''), `${r.id} expiresAt is an ISO date`);
  }

  assert.ok(auditedIds.size >= 864, 'editorial audit trail floor');
  assert.ok(publishedIds.size >= 56, 'publication-chain floor');
});
