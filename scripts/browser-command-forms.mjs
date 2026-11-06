import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || import.meta.url);
const { chromium, firefox, webkit, devices } = require('playwright');
const engineName = process.env.TEST_BROWSER || 'chromium';
const engine = { chromium, firefox, webkit }[engineName];
assert.ok(engine, 'Unknown browser engine: ' + engineName);
const source = readFileSync(new URL('../public/tool-modal.js', import.meta.url), 'utf8');
const start = source.indexOf('const TOOL_FORMS = {');
const end = source.indexOf('let modalOverlay', start);
const forms = runInNewContext('(' + source.slice(source.indexOf('{', start), source.lastIndexOf('};', end) + 1) + ')');
const store = openStore(':memory:');
const server = createApp(store, undefined, {});
let browser;
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await engine.launch({ headless: true, executablePath: engineName === 'chromium' ? process.env.CHROME_PATH : undefined });
  const page = await browser.newPage(engineName === 'webkit' ? devices['iPhone 13'] : {});
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:' + server.address().port, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.triggerToolModal === 'function');
  let checked = 0;
  for (const [id, form] of Object.entries(forms).filter(([, value]) => value.method !== 'POST')) {
    await page.evaluate(id => window.triggerToolModal({ id }), id);
    assert.ok(await page.locator('#tool-modal-form').evaluate(form => form.checkValidity()), id + ' defaults must be submittable');
    const endpoint = form.endpoint || '/v1/tools/' + id;
    const pending = page.waitForResponse(response => new URL(response.url()).pathname === endpoint && response.request().method() === 'GET');
    await page.locator('#tool-modal-form button[type=submit]').click();
    const response = await pending;
    assert.equal(response.status(), 200, id + ' ' + (await response.text()).slice(0, 180));
    await page.waitForFunction(() => document.querySelector('#tool-modal-status').textContent === 'Results ready.');
    assert.ok(await page.locator('.tool-modal-result-card > :not(h4)').count(), id + ' needs result content below the heading');
    checked++;
  }
  for (const [id, form] of Object.entries(forms).filter(([, value]) => value.method === 'POST')) {
    for (const flag of ['true', 'false']) {
      await page.evaluate(id => window.triggerToolModal({ id }), id);
      assert.equal(await page.locator('#tool-modal-form').evaluate(form => form.checkValidity()), false, id + ' must require facts');
      for (const field of form.fields) {
        const control = page.locator('#tool-modal-form [name="' + field.id + '"]');
        if (field.type === 'select') {
          await control.selectOption(field.valueType === 'boolean' ? flag : field.options.find(option => option.val !== '').val);
        } else {
          await control.fill(String(field.type === 'number' ? field.min ?? 0 : field.placeholder));
        }
      }
      const pending = page.waitForResponse(response => response.url().endsWith(form.endpoint) && response.request().method() === 'POST');
      await page.locator('#tool-modal-form button[type=submit]').click();
      const response = await pending;
      assert.equal(response.status(), 200, id);
      const body = response.request().postDataJSON();
      for (const field of form.fields) {
        if (field.valueType) assert.equal(typeof body[field.id], field.valueType, id + ' ' + field.id);
        if (field.valueType === 'boolean') assert.equal(body[field.id], flag === 'true');
      }
      await page.waitForFunction(() => document.querySelector('#tool-modal-status').textContent === 'Results ready.');
      assert.ok((await page.locator('#tool-modal-results').innerText()).trim().length > 40, id + ' needs a rendered result');
      checked++;
    }
  }
  assert.deepEqual(errors, []);
  console.log('Passed ' + checked + ' browser form submissions, required fields and typed payload checks.');
} finally {
  await browser?.close();
  if (server.listening) await new Promise(resolve => server.close(resolve));
  store.db.close();
}
