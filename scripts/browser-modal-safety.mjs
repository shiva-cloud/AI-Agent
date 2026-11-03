import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';
import {autoPopulateForm, OFFICIAL_FORM_TEMPLATES} from '../src/official-forms.js';
const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || 'C:/Users/shiva/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium} = require('playwright');
const store = openStore(':memory:');
const server = createApp(store, undefined, {});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report = {checks: [], errors: []};
try {
  const page = await browser.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`, {waitUntil: 'networkidle'});
  // Controlled promises deliberately ignore cancellation to exercise the generation guard too.
  await page.evaluate(() => {
    window.__requests = [];
    window.fetch = (url, options) => new Promise((resolve, reject) => window.__requests.push({url, signal: options.signal, resolve, reject}));
  });
  const open = () => page.evaluate(() => window.triggerToolModal({id: 'lmia-readiness'}));
  const submit = () => page.locator('#tool-modal-form button[type=submit]').click();
  const results = page.locator('#tool-modal-results');
  await open(); await submit();
  await page.waitForFunction(() => window.__requests.length === 1);
  await open(); await submit();
  await page.waitForFunction(() => window.__requests.length === 2);
  assert.equal(await page.evaluate(() => window.__requests[0].signal.aborted), true);
  await page.evaluate(() => window.__requests[1].resolve({ok: true, json: async () => ({checklist: ['CURRENT RESULT']})}));
  await page.waitForFunction(() => document.querySelector('#tool-modal-results').textContent.includes('CURRENT RESULT'));
  await page.evaluate(async () => {window.__requests[0].resolve({ok: true, json: async () => ({checklist: ['STALE RESULT']})}); await new Promise(resolve => setTimeout(resolve, 0));});
  assert.match(await results.innerText(), /CURRENT RESULT/);
  assert.doesNotMatch(await results.innerText(), /STALE RESULT/);
  report.checks.push('old success ignored after reopening; request aborted');
  await submit(); await page.keyboard.press('Escape'); await open();
  await page.evaluate(async () => {window.__requests[2].reject(new Error('STALE ERROR')); await new Promise(resolve => setTimeout(resolve, 0));});
  assert.equal(await results.isHidden(), true);
  assert.equal(await page.locator('#tool-modal-form button[type=submit]').isEnabled(), true);
  report.checks.push('old failure ignored after close/reopen');
  const payload = '<img src=x onerror="window.__injected=1"> & "quoted"';
  const form = autoPopulateForm({fieldOverrides: {[OFFICIAL_FORM_TEMPLATES.cbsa_bsf186.fields[0].id]: payload}});
  await submit();
  await page.evaluate(({form, payload}) => window.__requests[3].resolve({ok: true, json: async () => ({...form, formType: payload, checklist: [payload], legalVerdict: payload})}), {form, payload});
  await page.waitForFunction(() => !document.querySelector('#tool-modal-results').hidden);
  assert.ok((await results.innerText()).includes(payload));
  assert.equal(await results.locator('img,script,iframe').count(), 0);
  assert.equal(await page.evaluate(() => window.__injected), undefined);
  const download = results.locator('a[download]');
  assert.ok((await download.getAttribute('href')).startsWith('data:application/pdf;base64,JVBER'));
  assert.equal(await download.getAttribute('download'), `${payload}.pdf`);
  assert.equal(await download.getAttribute('onerror'), null);
  report.checks.push('result fields render as text; PDF download preserved');
  const preview = await browser.newPage();
  await preview.setContent(form.printReadyHtml);
  assert.equal(await preview.locator('img,script').count(), 0);
  assert.ok((await preview.locator('body').innerText()).includes(payload));
  report.checks.push('generated print preview escapes submitted HTML');
  assert.deepEqual(report.errors, []);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = error.stack; process.exitCode = 1;
} finally {
  writeFileSync('artifacts/MODAL_SAFETY_2026-11-03.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  await browser.close(); await new Promise(resolve => server.close(resolve)); store.db.close();
}
