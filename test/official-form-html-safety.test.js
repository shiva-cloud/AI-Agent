import test from 'node:test';
import assert from 'node:assert/strict';
import {autoPopulateForm, OFFICIAL_FORM_TEMPLATES} from '../src/official-forms.js';

test('printable forms encode hostile field values and declaration dates without changing raw fields', () => {
  const payload = '<img src=x onerror="alert(1)"> & \'quoted\'';
  for (const [formType, template] of Object.entries(OFFICIAL_FORM_TEMPLATES)) {
    const result = autoPopulateForm({formType, fieldOverrides: {[template.fields[0].id]: payload}, declarantDate: '2026-11-03'});
    assert.throws(() => autoPopulateForm({formType, declarantDate: payload}));
    assert.equal(result.populatedFields[0].val, payload);
    assert.ok(!result.printReadyHtml.includes('<img'));
    assert.ok(result.printReadyHtml.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;quoted&#39;'));
    assert.ok(Buffer.from(result.pdfBase64, 'base64').toString('latin1').startsWith('%PDF-1.4'));
  }
});
