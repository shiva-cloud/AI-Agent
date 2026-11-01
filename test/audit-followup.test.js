import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNewcomerBudget as budget } from '../src/newcomer-budget.js';
import { compareCities } from '../src/city-comparison.js';
import { calculateMilestoneDeadlines as deadlines, generateIcsContent as ics } from '../src/settlement-calendar.js';
import { calculateDocumentExpiryRunway as expiry } from '../src/statutory-calculators.js';
import { ValidationError } from '../src/api-errors.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

const milestone = changes => ({ id: 'custom', title: 'Arrival', description: 'Bring documents', category: 'travel', statute: 'Reference', dayOffset: 0, ...changes });
const unfolded = text => text.replace(/\r\n[ \t]/g, '');

test('01 budget supports an omitted options object', () => assert.equal(budget().city, 'Toronto'));
test('02 budget rejects unknown and inherited city names instead of substituting or crashing', () => {
  for (const city of ['Atlantis', 'constructor', '__proto__']) assert.throws(() => budget({ city }), ValidationError);
});
test('03 budget rejects unsupported household shapes', () => {
  for (const household of ['family_9_children', null, {}]) assert.throws(() => budget({ household }), ValidationError);
});
test('04 budget rejects unsupported accommodation instead of pricing a different unit', () => {
  assert.throws(() => budget({ accommodation: 'penthouse' }), ValidationError);
});
test('05 budget rejects negative savings instead of silently replacing them with zero', () => {
  assert.throws(() => budget({ savingsCad: -1 }), ValidationError);
});
test('06 budget rejects non-finite or malformed monetary inputs', () => {
  for (const field of ['savingsCad', 'monthlyIncomeNet']) for (const value of [Infinity, NaN, 'bad', null, true, []]) {
    assert.throws(() => budget({ [field]: value }), ValidationError);
  }
});
test('07 city comparison preserves a zero annual salary', () => {
  const row = compareCities(['Toronto'], { annualSalary: 0 }).comparison[0];
  assert.equal(row.estimatedFixedAnnualOutflow, Math.round(row.annualRentOutflow + row.annualTransitOutflow));
});
test('08 city comparison rejects negative and non-finite salaries', () => {
  for (const annualSalary of [-1, Infinity, 'invalid']) assert.throws(() => compareCities(['Toronto'], { annualSalary }), ValidationError);
});
test('09 city comparison rejects zero, fractional and malformed household counts', () => {
  for (const householdSize of [0, -1, 1.5, Infinity, 'bad']) assert.throws(() => compareCities(['Toronto'], { householdSize }), ValidationError);
});
test('10 repeated cities do not suppress a two-city differential', () => {
  const result = compareCities(['Toronto', 'Toronto', 'Calgary']);
  assert.equal(result.comparison.length, 2);
  assert.equal(result.differential.cheaperCity, 'Calgary');
});
test('11 calendar rejects impossible landing dates instead of rolling into another month', () => {
  for (const fn of [deadlines, ics]) for (const date of ['2026-02-30', 'bad', null]) assert.throws(() => fn(date), ValidationError);
});
test('12 calendar rejects invalid offsets instead of truncating or throwing RangeError', () => {
  for (const fn of [deadlines, ics]) for (const dayOffset of [0.5, Infinity, '2', 1e10]) assert.throws(() => fn('2026-11-01', [milestone({ dayOffset })]), ValidationError);
});
test('13 calendar rejects malformed milestone collections with validation errors', () => {
  for (const fn of [deadlines, ics]) for (const items of [null, {}, [null], [milestone({ title: {} })]]) assert.throws(() => fn('2026-11-01', items), ValidationError);
});
test('14 calendar text cannot inject extra events or properties', () => {
  const text = unfolded(ics('2026-11-01', [milestone({ title: 'Arrival\r\nBEGIN:VEVENT\r\nSUMMARY:Injected', statute: 'rule\rX-ATTACK:yes' })]));
  assert.equal(text.split('\r\n').filter(line => line === 'BEGIN:VEVENT').length, 1);
  assert.ok(!text.includes('\rX-ATTACK'));
  assert.match(text, /Arrival\\nBEGIN:VEVENT\\nSUMMARY:Injected/);
});
test('15 calendar escapes commas semicolons and backslashes in TEXT fields', () => {
  const text = unfolded(ics('2026-11-01', [milestone({ title: 'A,B;C\\D', description: 'A,B;C\\D' })]));
  assert.ok(text.includes('SUMMARY:A\\,B\\;C\\\\D'));
  assert.ok(text.includes('DESCRIPTION:A\\,B\\;C\\\\D'));
});
test('16 calendar folds long UTF-8 lines without damaging Unicode', () => {
  const title = 'Settlement 😀 café '.repeat(20);
  const text = ics('2026-11-01', [milestone({ title })]);
  assert.ok(text.split('\r\n').every(line => Buffer.byteLength(line) <= 75));
  assert.ok(unfolded(text).includes(`SUMMARY:${title}`));
});
test('17 calendar rejects duplicate IDs that would overwrite events on import', () => {
  assert.throws(() => ics('2026-11-01', [milestone({}), milestone({ dayOffset: 3 })]), ValidationError);
});
test('18 expiry calculator rejects invalid dates instead of claiming safe status', () => {
  for (const expiryDateStr of ['bad', '2026-02-30']) assert.throws(() => expiry({ expiryDateStr }), ValidationError);
  for (const referenceDate of ['bad', new Date(NaN), null]) assert.throws(() => expiry({ expiryDateStr: '2027-01-01', referenceDate }), ValidationError);
});

test('HTTP budget and comparison return 400 for invalid inputs and preserve zero salary', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, undefined, {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/v1/tools/newcomer-budget?city=constructor', '/v1/tools/newcomer-budget?savings=-1', '/v1/tools/newcomer-budget?income=Infinity', '/v1/tools/compare-cities?household=1.5', '/v1/tools/compare-cities?salary=NaN']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 400, path);
      assert.equal((await response.json()).code, 'invalid_request');
    }
    for (const [route, body] of [['newcomer-budget', '{"monthlyIncomeNet":1e400}'], ['compare-cities', '{"cities":["Toronto"],"householdSize":0}']]) {
      const response = await fetch(`${base}/v1/tools/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      assert.equal(response.status, 400);
      await response.text();
    }
    const response = await fetch(`${base}/v1/tools/compare-cities?cities=Toronto&salary=0`);
    assert.equal(response.status, 200);
    const row = (await response.json()).comparison[0];
    assert.equal(row.estimatedFixedAnnualOutflow, Math.round(row.annualRentOutflow + row.annualTransitOutflow));
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});
