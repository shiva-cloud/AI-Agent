import {ValidationError} from './api-errors.js';

export function supportsWorksheetPdf(values) {
  return values.every(value => /^[\x20-\x7e\r\n\t]*$/.test(String(value)));
}

export function escapePdfText(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// Courier has a fixed 600-unit glyph advance: 82 columns at 10pt fit in 495pt.
function wrap(value) {
  const lines = [];
  for (const paragraph of String(value).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n')) {
    let rest = paragraph;
    while (rest.length > 82) {
      const space = rest.lastIndexOf(' ', 82);
      const end = space > 0 ? space : 82;
      lines.push(rest.slice(0, end));
      rest = rest.slice(end + (space > 0 ? 1 : 0));
    }
    lines.push(rest);
  }
  return lines;
}

export function buildVectorPdf({org = '', num = '', title = '', statute = '', fields = [], date = ''} = {}) {
  const values = [org, num, title, statute, date, ...fields.flatMap(field => [field.label, field.val ?? ''])];
  if (!supportsWorksheetPdf(values)) throw new ValidationError('Direct PDF supports printable ASCII text only; use the Unicode print worksheet instead');
  const lines = [org, `${num}: ${title}`, `Reference: ${statute}`, '', ...fields.flatMap(field => [field.label + ':', String(field.val ?? ''), '']), 'DRAFT ONLY: This worksheet is not an official government form.', 'Review your information and complete the current official form separately.', `Worksheet date: ${date}`].flatMap(wrap);
  const chunks = [];
  for (let i = 0; i < lines.length; i += 47) chunks.push(lines.slice(i, i + 47));
  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  const pageIds = chunks.map((_, index) => 4 + index * 2);
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${chunks.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';
  chunks.forEach((chunk, index) => {
    const id = pageIds[index];
    const text = (value, y) => `BT\n/F1 10 Tf\n50 ${y} Td\n(${escapePdfText(value)}) Tj\nET\n`;
    const stream = text('DRAFT WORKSHEET - NOT AN OFFICIAL FORM', 790) + chunk.map((line, lineIndex) => text(line, 762 - lineIndex * 14)).join('') + text(`Page ${index + 1} of ${chunks.length}`, 40);
    objects[id] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${id + 1} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`;
    objects[id + 1] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  return pdf + `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
}
