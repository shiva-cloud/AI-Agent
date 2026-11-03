import test from 'node:test';
import assert from 'node:assert/strict';
import {autoPopulateForm, OFFICIAL_FORM_TEMPLATES} from '../src/official-forms.js';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';

test('all worksheets start blank and never claim submission readiness', () => {
  for (const formType of Object.keys(OFFICIAL_FORM_TEMPLATES)) {
    const result = autoPopulateForm({formType});
    assert.ok(result.populatedFields.every(field => field.val === ''));
    assert.equal(result.missingFields.length, result.fieldCount);
    assert.equal(result.submissionReady, false);
    assert.equal(result.documentStatus, 'draft_worksheet');
    assert.match(result.printReadyHtml, /DRAFT WORKSHEET - NOT AN OFFICIAL FORM/);
    assert.doesNotMatch(result.printReadyHtml, /Sharma|987-654-321|penalties of perjury|Statutory Parity/);
  }
  const result = autoPopulateForm({formType: 'ltb_t1', fieldOverrides: {rebateClaimed: 0, tenantName: 'Test Person'}});
  assert.equal(result.populatedFields.find(field => field.id === 'rebateClaimed').val, '0');
  assert.ok(!result.missingFields.includes('rebateClaimed'));
});

test('worksheet inputs reject unknown forms, malformed fields and invalid calendar dates', () => {
  for (const input of [null, [], {formType: null}, {formType: ''}, {formType: 'missing'}, {formType: 'constructor'}, {fieldOverrides: null}, {fieldOverrides: []}, {fieldOverrides: {unknown: 'x'}}, {fieldOverrides: {importerName: {}}}, {fieldOverrides: {importerName: false}}, {fieldOverrides: {importerName: 'x'.repeat(2001)}}, {declarantDate: '2026-02-30'}]) {
    assert.throws(() => autoPopulateForm(input));
  }
});

test('worksheet HTTP GET and POST share blank defaults, date and field validation', async () => {
  const store = openStore(':memory:'); const server = createApp(store, undefined, {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/v1/tools/form-autopopulate`;
  const post = input => fetch(base, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(input)});
  try {
    const blank = await post({});
    assert.equal(blank.status, 200);
    assert.ok((await blank.json()).populatedFields.every(field => field.val === ''));
    const get = await fetch(`${base}?formType=ltb_t1&tenantName=Test&declarantDate=2026-11-03`);
    const response = await post({formType: 'ltb_t1', tenantName: 'Test', declarantDate: '2026-11-03'});
    assert.equal(get.status, 200); assert.equal(response.status, 200);
    // assumedInputs describes the request (query and body read different keys), not the worksheet.
    const result = ({ assumedInputs, assumptionNotice, ...rest }) => rest;
    assert.deepEqual(result(await get.json()), result(await response.json()));
    for (const input of [{formType: ''}, {formType: 'bad'}, {declarantDate: '2026-02-30'}, {unknown: 'x'}]) {
      assert.equal((await fetch(`${base}?${new URLSearchParams(input)}`)).status, 400);
      assert.equal((await post(input)).status, 400);
    }
    assert.equal((await post({formType: null})).status, 400);
    assert.equal((await fetch(`${base}?__proto__=unexpected`)).status, 400);
    assert.equal((await post({fields: null})).status, 400);
  } finally { await new Promise(resolve => server.close(resolve)); store.db.close(); }
});
