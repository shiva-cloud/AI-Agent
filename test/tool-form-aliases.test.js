import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../src/store.js';
import { createApp } from '../src/server.js';

// The website forms send friendly field names; the GET endpoints map them to the
// evaluators' canonical parameters. POST must accept the same names and produce
// byte-identical results to the equivalent GET request.
const CASES = [
  ['/v1/tools/study-to-pr', { studyLevel: 'certificate_1yr', province: 'BC', fieldOfStudy: 'trades', clb: '5', teer: '3' }],
  ['/v1/tools/study-to-pr', { degree: 'doctoral', clb: 11, teer: 0, foreignExperience: 'false', foreignYears: '4' }],
  ['/v1/tools/visitor-visa-financial-ties', { days: '21', funds: '12000', income: '2500', tenure: '3.5', leaveLetter: 'true', property: 'true' }],
  ['/v1/tools/visitor-visa-financial-ties', { income: '25000', refusal: 'true', familyTraveling: 'true' }],
  ['/v1/tools/us-h1b-opt', { status: 'h1b', lastWorked: '2026-10-15', i94: '2027-05-01', hasH1bCos: 'true' }],
  ['/v1/tools/uk-skilled-worker', { salary: '35000', soc: '2136', preApril2024: 'false', newEntrant: 'true', absentDays: '85' }],
  ['/v1/tools/workplace-rights', { action: 'wsib_deadline', accidentDate: '2026-06-01' }],
  ['/v1/tools/workplace-rights', { action: 'work_refusal', reported: 'false', disciplined: 'true' }],
  ['/v1/tools/workplace-rights', { action: 'constructive_dismissal', wageCut: '30' }],
  ['/v1/tools/ei-benefits', { action: 'regular', hours: '650', rate: '7.5' }],
  ['/v1/tools/ei-benefits', { action: 'just_cause', reason: 'harassment' }],
  ['/v1/tools/esa-wage-theft', { action: 'vacation', earnings: '60000', years: '5.5' }],
  ['/v1/tools/esa-wage-theft', { action: 'severance', years: '6', weekly: '1200', payroll: '3000000' }],
  ['/v1/tools/fcr-bridging', { action: 'img_pra', province: 'ON' }],
  ['/v1/tools/fcr-bridging', { status: 'open_work_permit', funding: '9000' }],
  ['/v1/tools/poe-rights', { country: 'CA', status: 'study_permit', secondary: 'true', deviceSearch: 'true', refusalRisk: 'true' }],
  ['/v1/tools/gcms-analyzer', { type: 'study_permit', notes: 'Officer notes about funds.', codes: 'A4,A8', days: '10' }],
  ['/v1/tools/global-visa-matrix', { countries: 'CA,US', education: 'bachelors', experience: '3', field: 'stem', jobOffer: 'true' }],
  ['/v1/tools/super-visa-lico', { hostMembers: '3', visitingMembers: '2', income: '82000', insurance: 'true', appType: 'super_visa' }],
  ['/v1/tools/legal-notices', { type: 'ontario_ltb_t2', sender: 'Jane Doe', recipient: 'Property Manager', amount: '75000', issues: 'Unlawful entry; vital services disruption' }]
];

test('POST with website form field names matches the equivalent GET', async () => {
  const store = openStore(':memory:');
  const token = 'alias-test-token-that-is-long-enough';
  const server = createApp(store, token);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [path, body] of CASES) {
      const query = new URLSearchParams(
        Object.entries(body).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])).toString();
      const getRes = await fetch(`${root}${path}?${query}`);
      const postRes = await fetch(`${root}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal(postRes.status, 200, `${path} POST status`);
      assert.equal(getRes.status, 200, `${path} GET status`);
      const getBody = await getRes.json();
      const postBody = await postRes.json();
      // assumedInputs describes the request (field names differ between query and body), not the result.
      const result = ({ assumedInputs, assumptionNotice, ...rest }) => rest;
      assert.deepEqual(result(postBody), result(getBody), `${path} POST result must equal GET result`);
    }
  } finally {
    server.close();
    store.db.close();
  }
});

test('study-to-pr POST reacts to form values instead of returning one answer', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'alias-test-token-that-is-long-enough');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  try {
    const post = body => fetch(`${root}/v1/tools/study-to-pr`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const a = await (await post({ studyLevel: 'certificate_1yr', clb: '5', teer: '3' })).json();
    const b = await (await post({ studyLevel: 'masters', clb: '11', teer: '0' })).json();
    assert.notDeepEqual(a, b, 'different form values must produce different answers');
  } finally {
    server.close();
    store.db.close();
  }
});
