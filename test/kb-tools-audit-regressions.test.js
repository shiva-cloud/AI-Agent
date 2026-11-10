import test from 'node:test';
import assert from 'node:assert/strict';
import { safeIsoDate, todayIso } from '../src/text-input.js';
import { missingFigures, verifyAgainstPage, fetchPageText } from '../src/source-verifier.js';

test('source-fetch diagnostics retain transport codes without exposing exception messages', async () => {
  const result = await fetchPageText('https://example.invalid', {
    fetchImpl: async () => { throw new TypeError('secret proxy password', {cause:{code:'UND_ERR_SOCKET'}}); }
  });
  assert.equal(result.error,'network_error');
  assert.equal(result.detail,'UND_ERR_SOCKET');
  assert.ok(!JSON.stringify(result).includes('secret'));
  const unsafe = await fetchPageText('https://example.invalid', {
    fetchImpl: async () => { throw new TypeError('secret', {cause:{code:'https://user:password@example.invalid'}}); }
  });
  assert.equal(unsafe.detail,undefined);
});
import { evaluateStudyPermitCapAndPal } from '../src/study-permit-cap-pal-navigator.js';
import { ToolInputError } from '../src/api-errors.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('calendar validation rejects rolled dates and impossible date pins', () => {
  for (const date of ['2026-02-30', '2026-02-29', '2026-04-31', '1900-02-29', '2026-13-01']) {
    assert.equal(safeIsoDate(date, 'fallback'), 'fallback');
  }
  assert.equal(safeIsoDate(' 2000-02-29 '), '2000-02-29');
  assert.equal(safeIsoDate('2028-02-29'), '2028-02-29');
  const previous = process.env.NORTHSTAR_TODAY;
  try {
    process.env.NORTHSTAR_TODAY = '2026-02-30';
    assert.equal(todayIso(new Date('2026-03-04T00:00:00Z')), '2026-03-04');
  } finally {
    if (previous === undefined) delete process.env.NORTHSTAR_TODAY;
    else process.env.NORTHSTAR_TODAY = previous;
  }
});

test('figure evidence preserves currency and percent dimensions', () => {
  assert.deepEqual(missingFigures('Fee is $30', 'The waiting period is 30 days.'), ['$30']);
  assert.deepEqual(missingFigures('Rate 30%', '30 applicants'), ['30%']);
  assert.deepEqual(missingFigures('Fee £30', 'Fee €30'), ['£30']);
  assert.deepEqual(missingFigures('Fee $1,000.00 and rate 30%', 'Fee $1000 and rate 30%'), []);
});

test('verification can be replayed from the saved excerpt without distant figures', () => {
  const quote = 'You must submit the application with all supporting documents attached.';
  const record = { quote, summary: 'The application costs $987.' };
  const distant = `${quote} ${'unrelated background '.repeat(300)} The application costs $987.`;
  assert.equal(verifyAgainstPage(record, distant).ok, false);
  const local = verifyAgainstPage(record, `${quote} The application costs $987.`);
  assert.equal(local.ok, true);
  assert.equal(verifyAgainstPage(record, local.excerpt).ok, true);
});

test('source fetching cancels oversized streaming and declared bodies', async () => {
  for (const declared of [false, true]) {
    let cancelled = false;
    const stream = new ReadableStream({
      pull(controller) { controller.enqueue(new Uint8Array(8)); },
      cancel() { cancelled = true; }
    });
    const response = new Response(stream, { headers: { 'content-type': 'text/plain', ...(declared ? { 'content-length': '100' } : {}) } });
    const result = await fetchPageText('https://example.invalid', { fetchImpl: async () => response, maxBytes: 12 });
    assert.equal(result.error, 'response_too_large');
    assert.equal(cancelled, true);
  }
  const normal = await fetchPageText('https://example.invalid', {
    fetchImpl: async () => new Response('<p>Official text</p>', { headers: { 'content-type': 'text/html' } })
  });
  assert.equal(normal.text, 'Official text');
});

test('study finances require actual amounts and reject malformed values', () => {
  for (const input of [{}, { tuitionFeeFirstYearCad: 10000 }, { liquidFundsAvailableCad: 10000 }]) {
    const result = evaluateStudyPermitCapAndPal(input);
    assert.equal(result.financialAudit.status, 'NOT_DETERMINED');
    assert.equal(result.financialAudit.isFinanciallySufficient, null);
    assert.equal(result.financialAudit.financialBufferCad, null);
  }
  for (const value of ['bad', ' ', true, [], {}, -1, Infinity, 100000001]) {
    assert.throws(() => evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06', liquidFundsAvailableCad: value }), ToolInputError);
  }
  for (const input of [{ province: 'INVALID' }, { studyLevel: {} }, { studyLevel: 'unknown' }, { familyMembersAccompanying: 1.5 }]) {
    assert.throws(() => evaluateStudyPermitCapAndPal(input), ToolInputError);
  }
  const zero = evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06', tuitionFeeFirstYearCad: 0, liquidFundsAvailableCad: 0 });
  assert.equal(zero.financialAudit.liquidFundsAvailableCad, 0);
  assert.equal(zero.financialAudit.status, 'DEFICIT_RISK');
});

test('study boolean strings cannot accidentally grant exemptions and invalid categories/dates are rejected', () => {
  assert.equal(evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06', isExtensionOfStudyPermit: 'false' }).isPalRequired, true);
  assert.equal(evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06', isExtensionOfStudyPermit: 'true' }).isPalRequired, false);
  for (const field of ['isExtensionOfStudyPermit', 'isInCanadaApplication', 'isFamilyOfWorkOrStudyHolder']) {
    for (const value of ['yes', '', null, 0, 1, [], {}]) assert.throws(() => evaluateStudyPermitCapAndPal({ applicationDate: '2026-11-06', [field]: value }), ToolInputError);
  }
  for (const input of [{ fieldOfStudyCategory: {} }, { fieldOfStudyCategory: 'unknown' }, { cipCode: 'bad' },
    { cipCode: 11.0701 }, { assessmentDate: '2026-02-30' }, { assessmentDate: '' }]) {
    assert.throws(() => evaluateStudyPermitCapAndPal(input), ToolInputError);
  }
});

test('study GET and POST do not invent finances or silently discard invalid aliases', async () => {
  const store = openStore(':memory:');
  const server = createApp(store);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/v1/tools/study-permit-cap-pal`;
  try {
    for (const method of ['GET', 'POST']) {
      const request = async (input) => {
        input = { applicationDate: '2026-11-06', ...input };
        const response = await fetch(method === 'GET' ? `${base}?${new URLSearchParams(input)}` : base,
          method === 'POST' ? { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) } : {});
        return { status: response.status, body: await response.json() };
      };
      const missing = await request({});
      assert.equal(missing.status, 200);
      assert.equal(missing.body.financialAudit.status, 'NOT_DETERMINED');
      for (const input of [{ tuition: 'bad', funds: '50000' }, { province: 'INVALID' }, { studyLevel: 'unknown' },
        { extension: 'yes' }, { inland: '' }, { familyExempt: '1' }, { field: 'unknown' }, { cip: 'bad' },
        { dependents: ' ' }, { assessmentDate: '2026-02-30' }, { assessmentDate: '' }, { province: '' }]) {
        assert.equal((await request(input)).status, 400);
      }
      assert.equal((await request({ extension: 'false' })).body.isPalRequired, true);
      assert.equal((await request({ extension: 'true' })).body.isPalRequired, false);
      const zero = await request({ tuition: '0', funds: '0' });
      assert.equal(zero.status, 200);
      assert.equal(zero.body.financialAudit.status, 'DEFICIT_RISK');
      if (method === 'POST') {
        for (const funds of [true, [], {}, ' ']) assert.equal((await request({ tuition: 0, funds })).status, 400);
      }
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});
