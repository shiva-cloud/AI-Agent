import test from 'node:test';
import assert from 'node:assert/strict';
import {buildVectorPdf, autoPopulateForm} from '../src/official-forms.js';

test('PDF wraps long unbroken values and paginates within printable bounds', () => {
  const pdf = buildVectorPdf({fields: Array.from({length: 12}, (_, index) => ({label: `Field ${index}`, val: 'W'.repeat(2000)}))});
  assert.ok(Number(pdf.match(/\/Count (\d+)/)[1]) > 1);
  for (const match of pdf.matchAll(/50 (\d+) Td\n\(([^\n]*)\) Tj/g)) {
    assert.ok(Number(match[1]) >= 40 && Number(match[1]) <= 790);
    assert.ok(match[2].length <= 82);
  }
  assert.equal((pdf.match(/W/g) || []).length, 24000 + (pdf.match(/DRAFT WORKSHEET/g) || []).length + 1);
  const start = Number(pdf.match(/startxref\n(\d+)/)[1]);
  assert.equal(pdf.slice(start, start + 4), 'xref');
  const offsets = [...pdf.slice(start).matchAll(/(\d{10}) 00000 n/g)];
  offsets.forEach((match, index) => assert.ok(pdf.slice(Number(match[1])).startsWith(`${index + 1} 0 obj`)));
});

test('Unicode is preserved in HTML and never silently truncated into direct PDF', () => {
  for (const name of ['शिव शर्मा', '李明', 'José', 'مرحبا', 'Test 😀']) {
    const result = autoPopulateForm({fieldOverrides: {importerName: name}});
    assert.equal(result.pdfSupported, false); assert.equal(result.pdfBase64, null);
    assert.equal(result.pdfByteSize, 0); assert.ok(result.printReadyHtml.includes(name));
    assert.match(result.pdfNotice, /Print Worksheet/);
    assert.throws(() => buildVectorPdf({fields: [{label: 'Name', val: name}]}), /Unicode print worksheet/);
  }
});

test('PDF preserves zero and handles line breaks and tabs as layout, not PDF operators', () => {
  const pdf = buildVectorPdf({fields: [{label: 'Zero', val: 0}, {label: 'Lines', val: 'first\nsecond\tthird'}]});
  assert.match(pdf, /\(0\) Tj/); assert.match(pdf, /\(first\) Tj/);
  assert.match(pdf, /\(second    third\) Tj/);
});
