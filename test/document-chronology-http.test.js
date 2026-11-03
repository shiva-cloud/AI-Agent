import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';

test('document HTTP routes reject impossible chronology and accept same-day issue', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, undefined, {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/v1/tools/validate-documents`;
  try {
    const invalidGet = await fetch(`${base}?date=2026-11-01&medicalDate=2026-11-02`);
    assert.equal(invalidGet.status, 400);
    for (const document of [
      {docType: 'passport', issueDate: '2026-10-10', expiryDate: '2026-10-09'},
      {docType: 'medical_exam', issueDate: '2026-11-02'}
    ]) {
      const response = await fetch(base, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({landingDateStr: '2026-11-01', documents: [document]})});
      assert.equal(response.status, 400);
    }
    assert.equal((await fetch(`${base}?date=2026-11-01&medicalDate=2026-11-01`)).status, 200);
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});
