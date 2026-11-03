import {mkdirSync,writeFileSync} from 'node:fs';
import {autoPopulateForm} from '../src/official-forms.js';
mkdirSync('artifacts/pdf-qa', {recursive: true});
const result = autoPopulateForm({fieldOverrides: {importerName: 'Layout Test', electronics: 'Long inventory description with serial numbers and declared values. '.repeat(28), jewelry: 'X'.repeat(2000), household: 'Final inventory item. '.repeat(80)}});
writeFileSync('artifacts/pdf-qa/long-worksheet.pdf', Buffer.from(result.pdfBase64, 'base64'));
writeFileSync('artifacts/pdf-qa/unicode-worksheet.html', autoPopulateForm({fieldOverrides: {importerName: 'शिव शर्मा', electronics: 'हिंदी जानकारी'}}).printReadyHtml);
