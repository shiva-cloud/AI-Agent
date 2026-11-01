// test/official-forms-builder.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFICIAL_FORM_TEMPLATES,
  escapePdfText,
  buildVectorPdf
} from '../src/official-forms.js';

test('escapePdfText properly escapes backslashes and parentheses', () => {
  assert.equal(escapePdfText('C:\\Path\\To (File)'), 'C:\\\\Path\\\\To \\(File\\)');
  assert.equal(escapePdfText('Normal text 123'), 'Normal text 123');
});

test('OFFICIAL_FORM_TEMPLATES contains all 6 statutory government forms', () => {
  const keys = Object.keys(OFFICIAL_FORM_TEMPLATES);
  assert.ok(keys.includes('ltb_t1'));
  assert.ok(keys.includes('ltb_t2'));
  assert.ok(keys.includes('cbsa_e677'));
  assert.ok(keys.includes('fincen_105'));
  assert.ok(keys.includes('cbsa_bsf186'));
  assert.ok(keys.includes('cra_rc151'));

  for (const k of keys) {
    const tpl = OFFICIAL_FORM_TEMPLATES[k];
    assert.ok(tpl.org.length > 0);
    assert.ok(tpl.num.length > 0);
    assert.ok(tpl.title.length > 0);
    assert.ok(tpl.statute.length > 0);
    assert.ok(Array.isArray(tpl.fields) && tpl.fields.length >= 6);
  }
});

test('buildVectorPdf generates structurally valid PDF-1.4 output for CBSA BSF186', () => {
  const tpl = OFFICIAL_FORM_TEMPLATES.cbsa_bsf186;
  const fields = tpl.fields.map(f => ({ label: f.label, val: f.default }));

  const pdf = buildVectorPdf({
    org: tpl.org,
    num: tpl.num,
    title: tpl.title,
    statute: tpl.statute,
    fields,
    date: '2026-10-30'
  });

  // Structural PDF validation
  assert.ok(pdf.startsWith('%PDF-1.4'), 'Must start with PDF-1.4 header');
  assert.ok(pdf.includes('1 0 obj'), 'Must contain Catalog object');
  assert.ok(pdf.includes('/Type /Pages'), 'Must contain Pages object');
  assert.ok(pdf.includes('/MediaBox [0 0 595 842]'), 'Must declare A4 MediaBox');
  assert.ok(pdf.includes('stream\n'), 'Must contain content stream');
  assert.ok(pdf.includes('endstream'), 'Must close content stream');
  assert.ok(pdf.includes('xref'), 'Must contain cross-reference table');
  assert.ok(pdf.includes('trailer'), 'Must contain trailer');
  assert.ok(pdf.includes('startxref'), 'Must contain startxref pointer');
  assert.ok(pdf.endsWith('%%EOF'), 'Must end with %%EOF marker');

  // Verify statutory content inclusion
  assert.ok(pdf.includes('BSF186'));
  assert.ok(pdf.includes('Customs Tariff Heading 98.05'));
  assert.ok(pdf.includes('STATUTORY DECLARATION'));
});

test('buildVectorPdf generates valid PDF for Ontario LTB T2 with damages details', () => {
  const tpl = OFFICIAL_FORM_TEMPLATES.ltb_t2;
  const fields = [
    { label: 'Tenant Full Legal Name', val: 'Jane Doe' },
    { label: 'Statutory Breach Claimed', val: 'Illegal Lockout RTA s.24' },
    { label: 'Rent Abatement Claimed', val: '$2,400.00' },
    { label: 'Out of Pocket Expenses', val: '$1,200.00' }
  ];

  const pdf = buildVectorPdf({
    org: tpl.org,
    num: tpl.num,
    title: tpl.title,
    statute: tpl.statute,
    fields,
    date: '2026-10-30'
  });

  assert.ok(pdf.startsWith('%PDF-1.4'));
  assert.ok(pdf.includes('Tribunals Ontario'));
  assert.ok(pdf.includes('FORM T2'));
  assert.ok(pdf.includes('Jane Doe'));
  assert.ok(pdf.includes('RTA s.24'));
  assert.ok(pdf.endsWith('%%EOF'));
});
