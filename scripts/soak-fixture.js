// Synthetic pending copies exercise scan/ranking cost, not additional fact coverage.
export function makeSoakCopies(records, multiplier) {
  if (!Array.isArray(records) || !Number.isInteger(multiplier) || multiplier < 1 || multiplier > 32 || records.length * multiplier > 10000) throw new Error('Soak fixture must contain at most 10000 records with multiplier 1–32');
  const ids = new Set(records.map(record => record.id)), copies = [];
  for (let batch = 1; batch < multiplier; batch++) for (const [index, record] of records.entries()) {
    const id = `soak-${batch}-${index}`;
    if (ids.has(id)) throw new Error('Reserved soak fixture identity collision');
    copies.push({ ...structuredClone(record), id, title: `Synthetic load fixture: ${record.title}`, status: 'pending' });
  }
  return copies;
}
